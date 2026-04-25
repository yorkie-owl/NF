#!/usr/bin/env bash
# 从「项目已存在、Docker 与 nvm 已就绪」处继续：依赖安装 → 构建 → 数据库迁移 → PM2
set -euo pipefail

export NVM_DIR="/root/.nvm"
# shellcheck source=/dev/null
. "$NVM_DIR/nvm.sh"
nvm use default
hash -r

REPO_DIR="${REPO_DIR:-/var/www/NF}"
cd "$REPO_DIR"

# 安装时不要用 production，否则缺 devDependencies（tsc 等）
unset NODE_ENV
export CI=true
export NPM_CONFIG_PROGRESS=false
pnpm install

export NODE_ENV=production
# 与根目录 build 一致；必须让 @lin-shi/culina-agent 先于 api 编译
pnpm build:contracts
pnpm build:culina-agent
pnpm --filter @lin-shi/api build
pnpm --filter @lin-shi/web build
pnpm db:migrate

API_PORT=3000
WEB_PORT=3001
command -v pm2 >/dev/null || npm i -g pm2

pm2 delete api-lin 2>/dev/null || true
pm2 delete web-lin 2>/dev/null || true
pm2 start pnpm --name api-lin --cwd "$REPO_DIR/apps/api" -- start:prod
PORT=$WEB_PORT pm2 start pnpm --name web-lin --cwd "$REPO_DIR/apps/web" -- start

cd "$REPO_DIR"
pm2 save
pm2 startup systemd -u root --hp /root 2>/dev/null || true

if command -v ufw >/dev/null; then
  ufw allow 22/tcp 2>/dev/null || true
  ufw allow ${API_PORT}/tcp 2>/dev/null || true
  ufw allow ${WEB_PORT}/tcp 2>/dev/null || true
  ufw --force enable 2>/dev/null || true
fi

echo "==== 续跑完成 ===="
echo "Web 约: http://<公网IP>:${WEB_PORT}  (与 apps/web/.env.local 中 NEXT_PUBLIC_* 一致)"
echo "API 约: http://<公网IP>:${API_PORT}  — 云安全组需放行 TCP ${API_PORT}、${WEB_PORT}"
pm2 list
