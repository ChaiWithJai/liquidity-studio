#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
# Only this project's container is managed; never prune/reset the Docker daemon.
export COMPOSE_PROJECT_NAME="liquidity-smoke-${GITHUB_RUN_ID:-$$}"
export STUDIO_LOCAL_PORT="${STUDIO_LOCAL_PORT:-3001}"
cleanup() {
  docker compose logs --no-color studio || true
  docker compose down --timeout 15
}
trap cleanup EXIT
# No real provider secrets are used for this local demonstration.
AI_ALLOW_SYNTHETIC=true docker compose up --build --detach --wait --wait-timeout 90
node --input-type=module <<'JS'
import assert from 'node:assert/strict';
const base = `http://127.0.0.1:${process.env.STUDIO_LOCAL_PORT}`;
assert.equal((await fetch(base)).status, 200);
assert.equal((await fetch(`${base}/healthz`)).status, 200);
const ready = await fetch(`${base}/readyz`);
assert.equal(ready.status, 200);
assert.equal((await ready.json()).checks.generationProvider, 'not_checked');
const bootstrap = await (await fetch(`${base}/api/studio/bootstrap`)).json();
assert.ok(bootstrap.backlog.length > 0);
const response = await fetch(`${base}/api/studio/generate-campaign`, {
  method: 'POST', headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ storyId: bootstrap.backlog[0].id })
});
assert.equal(response.status, 200);
assert.equal((await response.json()).campaign.provenance.mode, 'synthetic');
console.log('Container HTTP, readiness, bootstrap, and synthetic generation passed.');
JS
container_id=$(docker compose ps --quiet studio)
[ "$(docker inspect --format '{{.Config.User}}' "$container_id")" = node ]
[ "$(docker exec "$container_id" id -u)" != 0 ]
docker compose stop --timeout 15 studio
[ "$(docker inspect --format '{{.State.ExitCode}}' "$container_id")" = 0 ]
