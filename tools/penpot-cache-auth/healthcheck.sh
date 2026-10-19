#!/bin/sh
set -eu
test -f /run/valkey-private/health.password
VALKEYCLI_AUTH=$(cat /run/valkey-private/health.password)
export VALKEYCLI_AUTH
reply=$(valkey-cli --user studio_health ping 2>/dev/null) || exit 1
test "$reply" = PONG
