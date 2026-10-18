#!/usr/bin/env bash
# Original-owned hosted-only wrapper. Actual pnpm remains the official version manager's binary.
set -euo pipefail
# These receipts are emitted only after registry SRI and native-byte verification.
real="$(cat /review-tools/verified-pnpm.path)"
expected="$(cat /review-tools/verified-pnpm.sha256)"
[[ "$real" == /review-tools/home/* && "$real" != *$'\n'* && ${#real} -le 1024 ]] || exit 1
[[ "$expected" =~ ^[a-f0-9]{64}$ && -f "$real" && -x "$real" ]] || exit 1
[[ "$(readlink -f -- "$real")" == "$real" ]] || exit 1
actual="$(sha256sum -- "$real")"
[[ "${actual%% *}" == "$expected" ]] || { echo 'Verified pnpm bytes changed' >&2; exit 1; }
[[ "$("$real" --version)" == 12.5.1 ]] || { echo 'Pinned pnpm version mismatch' >&2; exit 1; }
install=false
for arg in "$@"; do
  case "$arg" in
    --no-frozen-lockfile|--frozen-lockfile=false|--fix-lockfile) echo 'Mutable lock option forbidden' >&2; exit 1 ;;
    install|i) install=true ;;
    add|update|up|remove|rm|self-update) echo 'Dependency mutation forbidden during official build' >&2; exit 1 ;;
  esac
done
if $install; then
  exec "$real" "$@" --frozen-lockfile
fi
exec "$real" "$@"
