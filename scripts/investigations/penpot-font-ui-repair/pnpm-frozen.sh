#!/usr/bin/env bash
# Original-owned hosted-only wrapper. Actual pnpm remains the official version manager's binary.
set -euo pipefail
real=/review-tools/home/bin/pnpm
[[ "$($real --version)" == 12.5.1 ]] || { echo 'Pinned pnpm version mismatch' >&2; exit 1; }
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
