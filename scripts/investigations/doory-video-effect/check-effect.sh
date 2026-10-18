#!/usr/bin/env bash
set -euo pipefail
# No app server, Docker operation, model call or current source mutation.
: "${DOORY_SOURCE_DIR:?Supply the existing pinned Doory checkout with frontend dependencies}"
patch_root="$(cd "$(dirname "$0")" && pwd)"
pin=27b6f68221fdbf1ef1bedc182e303210ca9e39f5
git -C "$DOORY_SOURCE_DIR" cat-file -e "$pin^{commit}"
deps="$(cd "$DOORY_SOURCE_DIR/frontend/node_modules" && pwd -P)"
test -f "$deps/vitest/vitest.mjs"
check_root="$(mktemp -d "${TMPDIR:-/tmp}/doory-video-effect.XXXXXX")"
trap 'rm -rf "$check_root"' EXIT
git -C "$DOORY_SOURCE_DIR" archive "$pin" frontend | tar -x -C "$check_root"
ln -s "$deps" "$check_root/frontend/node_modules"
cp "$patch_root/VideoResult.promise-scroll.test.tsx" "$check_root/frontend/src/editor/dialogs/video/VideoResult.promise-scroll.test.tsx"
cd "$check_root/frontend"
set +e
node "$deps/vitest/vitest.mjs" run src/editor/dialogs/video/VideoResult.promise-scroll.test.tsx > "$check_root/baseline.log" 2>&1
baseline=$?
set -e
if [ "$baseline" -eq 0 ] || ! rg -q 'destroy is not a function' "$check_root/baseline.log"; then
  cat "$check_root/baseline.log"
  echo 'Expected pristine source to reproduce invalid Effect cleanup failure' >&2
  exit 1
fi
printf '%s\n' 'PASS: pristine pinned source reproduces invalid Effect cleanup with Promise-returning scroll API'
cd "$check_root"
git apply --check "$patch_root/video-result-effect.patch"
git apply "$patch_root/video-result-effect.patch"
cd frontend
node "$deps/vitest/vitest.mjs" run src/editor/dialogs/video/VideoResult.promise-scroll.test.tsx
