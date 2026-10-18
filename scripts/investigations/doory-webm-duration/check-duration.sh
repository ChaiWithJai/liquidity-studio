#!/usr/bin/env bash
set -euo pipefail
: "${DOORY_SOURCE_DIR:?Supply pinned Doory checkout with retained frontend dependencies}"
patch_root="$(cd "$(dirname "$0")" && pwd)"
pin=27b6f68221fdbf1ef1bedc182e303210ca9e39f5
git -C "$DOORY_SOURCE_DIR" cat-file -e "$pin^{commit}"
deps="$(cd "$DOORY_SOURCE_DIR/frontend/node_modules" && pwd -P)"
check_root="$(mktemp -d "${TMPDIR:-/tmp}/doory-webm-duration.XXXXXX")"
trap 'rm -rf "$check_root"' EXIT
git -C "$DOORY_SOURCE_DIR" archive "$pin" frontend | tar -x -C "$check_root"
ln -s "$deps" "$check_root/frontend/node_modules"
cp "$patch_root/container-duration.regression.test.ts" "$check_root/frontend/src/editor/engine/export/video/"
cd "$check_root/frontend"
set +e
node "$deps/vitest/vitest.mjs" run src/editor/engine/export/video/container-duration.regression.test.ts > "$check_root/baseline.log" 2>&1
baseline=$?
set -e
if [ "$baseline" -eq 0 ] || ! rg -q '29966.*30000|30000.*29966' "$check_root/baseline.log"; then
 cat "$check_root/baseline.log"
 echo 'Expected pinned container to report29966 instead of30000ms' >&2
 exit 1
fi
printf '%s\n' 'PASS: pristine container reproduces29966ms for900frames at30fps'
cd "$check_root"
git apply --check "$patch_root/webm-duration.patch"
git apply "$patch_root/webm-duration.patch"
cd frontend
node "$deps/vitest/vitest.mjs" run src/editor/engine/export/video/container-duration.regression.test.ts src/editor/engine/export/video/muxedWebmDuration.test.ts src/editor/engine/export/video/container.test.ts
node "$deps/typescript/bin/tsc" -b --noEmit
