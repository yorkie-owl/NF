"""
Upload and run a deploy script on the target VPS via paramiko.

Full bootstrap (from apt/docker):
  $env:VPS_SSH_PASSWORD = '...'
  $env:PUBLIC_HOST = '139.224.248.44'
  py -3 scripts/deploy_vps_remote.py

Resume (repo + docker + nvm 已有，从 pnpm install 继续):
  $env:VPS_SSH_PASSWORD = '...'
  $env:VPS_DEPLOY_MODE = 'resume'
  py -3 scripts/deploy_vps_remote.py

仅查看远端 PM2/构建/端口 (不上传脚本):
  $env:VPS_SSH_PASSWORD = '...'
  $env:VPS_DEPLOY_MODE = 'status'
  py -3 scripts/deploy_vps_remote.py
"""
from __future__ import annotations

import os
import shlex
import sys
from pathlib import Path

import paramiko

HOST = "139.224.248.44"
USER = "root"
ROOT = Path(__file__).resolve().parent
BOOT = ROOT / "vps_bootstrap.sh"
RESUME = ROOT / "vps_resume.sh"
REMOTE_TIMEOUT = 7200  # 秒；构建可能较慢


def main() -> int:
    if hasattr(sys.stdout, "reconfigure"):
        try:
            sys.stdout.reconfigure(encoding="utf-8", errors="replace")
        except Exception:
            pass
    if hasattr(sys.stderr, "reconfigure"):
        try:
            sys.stderr.reconfigure(encoding="utf-8", errors="replace")
        except Exception:
            pass
    pw = os.environ.get("VPS_SSH_PASSWORD", "").strip()
    if not pw:
        print("Set VPS_SSH_PASSWORD in the environment.", file=sys.stderr)
        return 1
    mode = os.environ.get("VPS_DEPLOY_MODE", "bootstrap").strip().lower()
    if mode not in ("bootstrap", "resume", "status"):
        print("VPS_DEPLOY_MODE must be bootstrap, resume, or status", file=sys.stderr)
        return 1
    if mode in ("bootstrap", "resume"):
        if mode == "resume":
            script = RESUME
            remote = "/root/vps_resume.sh"
        else:
            script = BOOT
            remote = "/root/vps_bootstrap.sh"
        if not script.is_file():
            print(f"Missing {script}", file=sys.stderr)
            return 1
    public_host = os.environ.get("PUBLIC_HOST", "139.224.248.44").strip()

    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    try:
        client.connect(
            HOST,
            username=USER,
            password=pw,
            timeout=60,
            allow_agent=False,
            look_for_keys=False,
        )
    except Exception as e:
        print(f"SSH connect failed: {e}", file=sys.stderr)
        return 2

    if mode == "status":
        st = (
            "export NVM_DIR=/root/.nvm; "
            "[ -f \"$NVM_DIR/nvm.sh\" ] && . \"$NVM_DIR/nvm.sh\" && nvm use default 2>/dev/null || true; "
            "cd /var/www/NF 2>/dev/null || { echo 'Missing /var/www/NF'; exit 0; }; "
            "echo '=== build artifacts ==='; ls -la apps/api/dist/main.js 2>&1 || true; ls -ld apps/web/.next 2>&1 || true; "
            "echo '=== node_modules? ==='; [ -d node_modules ] && echo yes || echo no; "
            "echo '=== pm2 ==='; command -v pm2 >/dev/null && pm2 list 2>&1 || echo 'no pm2'; "
            "echo '=== listen 3000/3001 ==='; ss -lntp 2>/dev/null | grep -E '3000|3001' || true"
        )
        cmd = f"bash -c {shlex.quote(st)}"
    else:
        sftp = client.open_sftp()
        sftp.put(str(script), remote)
        sftp.chmod(remote, 0o755)
        sftp.close()

        if mode == "resume":
            inner = f"exec bash {shlex.quote(remote)}"
        else:
            env_export = f"export PUBLIC_HOST={shlex.quote(public_host)}"
            inner = f"{env_export}; exec bash -x {shlex.quote(remote)}"
        cmd = f"bash -o pipefail -c {shlex.quote(inner)}"
    req_timeout = 120 if mode == "status" else REMOTE_TIMEOUT
    stdin, stdout, stderr = client.exec_command(cmd, get_pty=True, timeout=req_timeout)
    for line in iter(stdout.readline, ""):
        if not line:
            break
        sys.stdout.write(line)
        sys.stdout.flush()
    err = stderr.read().decode("utf-8", errors="replace")
    if err:
        sys.stderr.write(err)
    ch = stdout.channel
    code = ch.recv_exit_status()
    client.close()
    return int(code) if code is not None else 1


if __name__ == "__main__":
    raise SystemExit(main())
