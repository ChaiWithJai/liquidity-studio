#!/usr/bin/env bash
set -euo pipefail
# Deliberately use a unique project; never operate on another project's resources.
root_dir="$(cd "$(dirname "$0")/../.." && pwd)"
action="${1:-}"
case "$action" in
  pull|up)
    : "${PENPOT_DOCKER_DATA_PATH:?Set the existing absolute host path of the Docker Desktop virtual disk or its containing directory}"
    [[ "$PENPOT_DOCKER_DATA_PATH" = /* ]] || { echo 'Docker backing-disk host path must be absolute.' >&2; exit 1; }
    node "$root_dir/scripts/investigations/check-local-capacity.mjs" "$root_dir" "${PENPOT_REQUIRED_FREE_GIB:-12}"
    node "$root_dir/scripts/investigations/check-local-capacity.mjs" "$PENPOT_DOCKER_DATA_PATH" "${PENPOT_REQUIRED_FREE_GIB:-12}"
    ;;
  down) ;;
  *) echo 'Use pull, up, or down; this wrapper controls only penpot-native39.' >&2; exit 1 ;;
esac
: "${PENPOT_QA_ENV_FILE:?Set the absolute private ephemeral environment-file path}"
[[ "$PENPOT_QA_ENV_FILE" = /* ]] || { echo 'Private environment-file path must be absolute.' >&2; exit 1; }
compose_args=(--parallel 1 --env-file "$PENPOT_QA_ENV_FILE" -p penpot-native39 -f "$root_dir/scripts/investigations/penpot-local.compose.yaml")
case "$action" in
  pull) docker compose "${compose_args[@]}" pull ;;
  up) docker compose "${compose_args[@]}" up -d ;;
  down) docker compose "${compose_args[@]}" down ;;
esac
