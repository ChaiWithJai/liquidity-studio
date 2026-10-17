#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
umask 077
export COMPOSE_PROJECT_NAME="liquidity-smoke-${GITHUB_RUN_ID:-$$}"
export STUDIO_LOCAL_PORT="${STUDIO_LOCAL_PORT:-3002}"
export STUDIO_FOUNDER_PASSWORD="$(node -e "process.stdout.write(require('node:crypto').randomBytes(24).toString('base64url'))")"
export STUDIO_MARKETER_PASSWORD="$(node -e "process.stdout.write(require('node:crypto').randomBytes(24).toString('base64url'))")"
record_dir=$(mktemp -d)
cleanup() {
  docker compose logs --no-color studio || true
  docker compose down --volumes --timeout 15
  rm -rf "$record_dir"
}
trap cleanup EXIT
AI_ALLOW_SYNTHETIC=true docker compose up --build --detach --wait --wait-timeout 120
node scripts/container-acceptance.mjs prepare "$record_dir/record.json"
container_id=$(docker compose ps --quiet studio)
[ "$(docker inspect --format '{{.Config.User}}' "$container_id")" = node ]
[ "$(docker exec "$container_id" id -u)" != 0 ]
docker compose stop --timeout 15 studio
[ "$(docker inspect --format '{{.State.ExitCode}}' "$container_id")" = 0 ]
docker compose up --detach --force-recreate --wait --wait-timeout 90
node scripts/container-acceptance.mjs after-restart "$record_dir/record.json"
