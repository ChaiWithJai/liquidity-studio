#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/../liquidity-studio"
export FIRESTORE_EMULATOR_HOST="127.0.0.1:${STUDIO_TEST_FIRESTORE_PORT:-8682}"
# Refuse occupied ports; never adopt or stop another process's emulator.
node --input-type=module <<'JS'
import net from 'node:net';
const server = net.createServer();
server.on('error', () => { console.error('Firestore test port is occupied'); process.exit(1); });
server.listen(Number(process.env.FIRESTORE_EMULATOR_HOST.split(':')[1]), '127.0.0.1', () => server.close());
JS
emulator_log=$(mktemp)
emulator_pid=''
cleanup() {
  if [[ -n "$emulator_pid" ]]; then
    kill "$emulator_pid" 2>/dev/null || true
    wait "$emulator_pid" 2>/dev/null || true
  fi
  rm -f "$emulator_log"
}
trap cleanup EXIT
# Prerequisites: Java 21 and the gcloud cloud-firestore-emulator component.
sdk_root=$(gcloud info --format='value(installation.sdk_root)')
emulator_jar="$sdk_root/platform/cloud-firestore-emulator/cloud-firestore-emulator.jar"
[[ -f "$emulator_jar" ]] || { echo 'Install the gcloud cloud-firestore-emulator component first' >&2; exit 1; }
# Launch the packaged JVM directly so the trapped PID owns the actual listener.
java -Duser.language=en -cp "$emulator_jar" com.google.cloud.datastore.emulator.firestore.CloudFirestore start --host=127.0.0.1 --port="${FIRESTORE_EMULATOR_HOST##*:}" --database-mode=firestore-native >"$emulator_log" 2>&1 &
emulator_pid=$!
node --input-type=module <<'JS'
import net from 'node:net';
const port = Number(process.env.FIRESTORE_EMULATOR_HOST.split(':')[1]);
const start = Date.now();
while (true) {
  const ready = await new Promise(resolve => { const socket = net.connect(port, '127.0.0.1'); socket.once('connect', () => { socket.destroy(); resolve(true); }); socket.once('error', () => resolve(false)); });
  if (ready) break;
  if (Date.now() - start > 30000) throw new Error('Firestore emulator did not become ready within 30 seconds');
  await new Promise(resolve => setTimeout(resolve, 200));
}
JS
node --test server/cloud-store.emulator.test.js server/seed-followthrough-firestore.emulator.test.js
