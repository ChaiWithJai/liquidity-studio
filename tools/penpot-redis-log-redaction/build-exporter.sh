#!/usr/bin/env bash
# Hosted only: official pinned exporter build, no service or credentials.
set -euo pipefail
if [ "$(stat -c %u /work/.git)" != "$(id -u)" ]; then
  export GIT_CONFIG_COUNT=1 GIT_CONFIG_KEY_0=safe.directory GIT_CONFIG_VALUE_0=/work
fi
test "$(git -C /work rev-parse HEAD)" = ff7a66f51938b2293260ea27a64e2c4e0833b5e3
export PATH=/review-tools/bin:$PATH
test "$(pnpm --version)" = 12.5.1
# build-jar.sh already applied the exact two-file source patch. Check the
# exporter member before executing its unchanged official build script.
python3 - <<'PY'
import hashlib,json,pathlib
m=json.loads(pathlib.Path('/hooks/penpot-redis-log-redaction/source-manifest.json').read_text())
for e in m['files']:
 p=pathlib.Path('/work')/e['path']
 assert hashlib.sha256(p.read_bytes()).hexdigest()==e['afterSha256']
PY
cd /work/exporter
./scripts/build 2.18.3
# Official target has its complete ESM graph and runtime package/lock metadata.
test -s target/app.js
test -s target/package.json
test -s target/pnpm-lock.yaml
tar -C target -czf /output/exporter-bundle.tar.gz .
# Retain the matching source without dependency/build caches or private data.
tar -C /work --exclude=exporter/node_modules --exclude=exporter/target \
  --exclude=exporter/.shadow-cljs --exclude=exporter/.cpcache \
  --exclude=common/node_modules --exclude=common/target --exclude=common/.cpcache \
  -czf /output/exporter-corresponding-source.tar.gz exporter common LICENSE CHANGES.md
python3 /recipe/record-exporter.py /work /output
