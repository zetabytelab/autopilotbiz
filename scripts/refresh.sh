#!/bin/bash
# Nightly pulse refresh: fetch fresh signals, rebuild the static site, and
# restart the production server if one is running. Invoked by launchd
# (~/Library/LaunchAgents/biz.autopilot.pulse.plist) or manually.
set -euo pipefail
cd "$(dirname "$0")/.."

# launchd runs with a minimal PATH; prefer the user's Node 22 over the stale
# Node 18 in /usr/local/bin.
export PATH="$HOME/.local/bin:/opt/homebrew/bin:$PATH:/usr/local/bin"
echo "using node $(command -v node) $(node --version)"

echo "[$(date '+%Y-%m-%d %H:%M:%S')] pulse refresh starting"
node scripts/update-pulse.mjs
npm run build

# Restart next start if it's currently serving
if pgrep -f "next start" >/dev/null 2>&1; then
  PORT=$(pgrep -fl "next start" | grep -oE '\-p [0-9]+' | awk '{print $2}' | head -1)
  PORT=${PORT:-3000}
  pkill -f "next start" || true
  sleep 1
  nohup npx next start -p "$PORT" >/tmp/next-start.log 2>&1 &
  echo "restarted next start on port $PORT"
fi
echo "[$(date '+%Y-%m-%d %H:%M:%S')] pulse refresh done"
