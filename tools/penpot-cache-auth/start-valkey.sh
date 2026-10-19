#!/bin/sh
# Root copies private host inputs into private tmpfs; the official entrypoint
# then drops the actual server to its existing valkey account.
set -eu
test "$(id -u)" = 0 || { echo 'Cache startup requires the pinned root entrypoint.' >&2; exit 1; }
test "$#" -gt 0 && test "$1" = valkey-server
actual=$(sha256sum /usr/local/bin/docker-entrypoint.sh | cut -d' ' -f1)
test "$actual" = 2a8a83f3265e56d6282b715b9101efa590e1c9c096283aa08df97087fce8c30a || {
 echo 'Pinned Valkey entrypoint changed; review before startup.' >&2; exit 1;
}
umask 077
for name in users.acl health.password; do
 input="/run/studio-cache-input/$name"
 test -f "$input" && test ! -L "$input" && test "$(stat -c %a "$input")" = 600
 test "$(wc -c < "$input")" -le 4096
done
test -d /run/valkey-private && test ! -L /run/valkey-private
test ! -e /run/valkey-private/users.acl && test ! -e /run/valkey-private/health.password
cp /run/studio-cache-input/users.acl /run/valkey-private/users.acl
cp /run/studio-cache-input/health.password /run/valkey-private/health.password
chmod 700 /run/valkey-private
chmod 600 /run/valkey-private/users.acl /run/valkey-private/health.password
chown valkey:valkey /run/valkey-private /run/valkey-private/users.acl /run/valkey-private/health.password
exec /usr/local/bin/docker-entrypoint.sh "$@"
