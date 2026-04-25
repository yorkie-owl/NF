#!/usr/bin/env bash
# Run on the VPS (Ubuntu/Debian-style with apt) as root.
# Clones/updates https://github.com/yorkie-owl/NF.git, brings up Postgres, builds, PM2.
set -euxo pipefail

if ! command -v apt-get >/dev/null; then
  echo "This script needs apt (Debian/Ubuntu). Install Node 22, Docker, pnpm, pm2 by hand, then set up env and pm2 as in this file."
  exit 1
fi

export DEBIAN_FRONTEND=noninteractive
REPO_DIR="${REPO_DIR:-/var/www/NF}"
REPO_URL="${REPO_URL:-https://github.com/yorkie-owl/NF.git}"
REPO_REF="${REPO_REF:-develop}"
# Set PUBLIC_HOST when running (e.g. PUBLIC_HOST=你的公网IP bash vps_bootstrap.sh)
: "${PUBLIC_HOST:=$(curl -fsSL --connect-timeout 3 https://ifconfig.me 2>/dev/null || true)}"
: "${PUBLIC_HOST:=$(hostname -I 2>/dev/null | awk '{print $1}')}"
: "${PUBLIC_HOST:=127.0.0.1}"

# Base packages + Docker (avoid get.docker.com; often blocked in CN)
apt-get update -y
apt-get install -y git curl ca-certificates openssl
if ! command -v docker >/dev/null; then
  apt-get install -y docker.io
fi
if ! command -v docker-compose >/dev/null; then
  apt-get install -y docker-compose
fi
systemctl enable --now docker 2>/dev/null || true

# Docker Hub 在国内常超时；配置镜像 + 可回退的 compose 覆盖
mkdir -p /etc/docker
if [ ! -f /etc/docker/daemon.json ] || ! grep -q registry-mirrors /etc/docker/daemon.json 2>/dev/null; then
  cat > /etc/docker/daemon.json <<'DOCKERCFG'
{
  "registry-mirrors": [
    "https://docker.1ms.run",
    "https://docker.1panel.live"
  ]
}
DOCKERCFG
  systemctl restart docker
  sleep 2
fi

# docker-compose (v1) is `docker-compose`; v2 is `docker compose` — use whichever exists
dcompose() {
  if command -v docker-compose >/dev/null; then
    docker-compose "$@"
  else
    docker compose "$@"
  fi
}

# nvm + Node 22: faster Node downloads; optional mirror for nvm.sh if GitHub is slow
export NVM_DIR="/root/.nvm"
export NVM_NODEJS_ORG_MIRROR="${NVM_NODEJS_ORG_MIRROR:-https://npmmirror.com/mirrors/node}"
if [ ! -s "$NVM_DIR/nvm.sh" ]; then
  if ! curl -fsSL -m 40 https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh -o /tmp/nvm_install.sh; then
    echo "Falling back to nvm Gitee mirror for install.sh"
    curl -fsSL -m 60 "https://gitee.com/mirrors/nvm/raw/master/install.sh" -o /tmp/nvm_install.sh
  fi
  bash /tmp/nvm_install.sh
fi
# shellcheck source=/dev/null
. "$NVM_DIR/nvm.sh"
nvm install 22
nvm use 22
nvm alias default 22
export PATH
hash -r
corepack enable
corepack prepare pnpm@9.15.0 --activate
npm install -g pm2

mkdir -p "$(dirname "$REPO_DIR")"
if [ -d "$REPO_DIR/.git" ]; then
  git -C "$REPO_DIR" fetch origin
  git -C "$REPO_DIR" checkout "$REPO_REF"
  git -C "$REPO_DIR" pull --ff-only origin "$REPO_REF"
else
  git clone -b "$REPO_REF" "$REPO_URL" "$REPO_DIR"
fi
cd "$REPO_DIR"

# Env files (idempotent: only create if missing)
if [ ! -f apps/api/.env ]; then
  J1=$(openssl rand -base64 40 | tr -d '\n')
  J2=$(openssl rand -base64 40 | tr -d '\n')
  API_PORT=3000
  WEB_PORT=3001
  cat > apps/api/.env <<EOF
NODE_ENV=production
PORT=${API_PORT}

DB_HOST=127.0.0.1
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=lin_shi

JWT_ACCESS_SECRET=${J1}
JWT_ACCESS_TTL=15m
JWT_REFRESH_SECRET=${J2}
JWT_REFRESH_TTL=7d

UPLOADS_DIR=./uploads
UPLOADS_PUBLIC_URL=http://${PUBLIC_HOST}:${API_PORT}/uploads

CORS_ORIGIN=http://${PUBLIC_HOST}:${WEB_PORT}

RECIPE_API_KEY=
MATCH_LLM_API_KEY=
SOCKET_CORS_ORIGIN=
EXTERNAL_USE_MOCK=true
INGREDIENTS_DEV_BYPASS_AUTH=true
EOF
fi

if [ ! -f apps/web/.env.local ]; then
  API_PORT=3000
  WEB_PORT=3001
  cat > apps/web/.env.local <<EOF
NEXT_PUBLIC_API_URL=http://${PUBLIC_HOST}:${API_PORT}
NEXT_PUBLIC_UPLOADS_URL=http://${PUBLIC_HOST}:${API_PORT}/uploads
RECOGNIZE_API_KEY=
EOF
fi

# Postgres：国内拉 Docker Hub 常超时，用 DaoCloud 官方镜像代理（仅服务器本机 override，不提交到 git）
cd "$REPO_DIR"
cat > docker-compose.override.yml <<'EOF'
services:
  postgres:
    image: docker.m.daocloud.io/library/postgres:17-alpine
EOF
dcompose -f docker-compose.yml -f docker-compose.override.yml up -d postgres
# Wait for health
for i in $(seq 1 30); do
  docker exec lin-shi-postgres pg_isready -U postgres -d lin_shi && break
  sleep 2
done

pnpm install
# production install skips devDependencies — build needs tsc, eslint, etc.
export NODE_ENV=production
pnpm build:contracts
pnpm build:culina-agent
pnpm --filter @lin-shi/api build
pnpm --filter @lin-shi/web build
pnpm db:migrate

API_PORT=3000
WEB_PORT=3001

# PM2: delete old if any, start fresh
pm2 delete api-lin 2>/dev/null || true
pm2 delete web-lin 2>/dev/null || true

# cwd required so Nest/Next see local .env and dist/
pm2 start pnpm --name api-lin --cwd "$REPO_DIR/apps/api" -- start:prod
PORT=$WEB_PORT pm2 start pnpm --name web-lin --cwd "$REPO_DIR/apps/web" -- start

cd "$REPO_DIR"
pm2 save
pm2 startup systemd -u root --hp /root 2>/dev/null || true

# Firewall (if ufw present)
if command -v ufw >/dev/null; then
  ufw allow OpenSSH 2>/dev/null || ufw allow 22/tcp
  ufw allow ${API_PORT}/tcp
  ufw allow ${WEB_PORT}/tcp
  ufw --force enable || true
fi

echo "==== Deployed ===="
echo "Web:  http://${PUBLIC_HOST}:${WEB_PORT}"
echo "API:  http://${PUBLIC_HOST}:${API_PORT}  (e.g. /api or swagger if enabled)"
pm2 list
