#!/usr/bin/env bash
set -euo pipefail
umask 077
cd "$(dirname "$0")/.."
if [ -n "${K_SERVICE:-}" ] || [ "${NODE_ENV:-}" = production ]; then
  echo 'Auth Emulator acceptance is restricted to local/CI test execution.' >&2
  exit 1
fi
export NODE_ENV=test
# A separate dev-tool cache keeps firebase-tools out of the application runtime.
export npm_config_cache="${STUDIO_AUTH_TOOL_CACHE:-${TMPDIR:-/tmp}/liquidity-${UID}-firebase-tools-15.34.0}"
mkdir -p "$npm_config_cache"
export STUDIO_AUTH_EMULATOR_PORT="${STUDIO_AUTH_EMULATOR_PORT:-19098}"
node --input-type=module -e 'const p=Number(process.env.STUDIO_AUTH_EMULATOR_PORT);if(!Number.isInteger(p)||p<1024||p>65535)process.exit(1)'
record_dir=$(mktemp -d)
cleanup() { rm -rf "$record_dir"; }
trap cleanup EXIT
node --input-type=module -e 'import fs from "node:fs";fs.writeFileSync(process.argv[1],JSON.stringify({emulators:{auth:{host:"127.0.0.1",port:Number(process.env.STUDIO_AUTH_EMULATOR_PORT)},ui:{enabled:false},singleProjectMode:true}}))' "$record_dir/firebase.json"
export FIREBASE_AUTH_EMULATOR_HOST="127.0.0.1:$STUDIO_AUTH_EMULATOR_PORT"
# emulators:exec owns startup/readiness and cleanup, and propagates the browser exit code.
# demo-* avoids referencing a billable project; no firebase login or cloud provisioning.
npx --yes firebase-tools@15.34.0 emulators:exec --only auth --project demo-liquidity-auth --config "$record_dir/firebase.json" 'cd liquidity-studio && npm run test:browser -- tests/google-auth.spec.js --project=chromium'
