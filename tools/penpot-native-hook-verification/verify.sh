#!/usr/bin/env bash
# Hosted-only recipe; no runtime image, native DB, listener or frontend artifact.
set -euo pipefail
# The bind is owned by the hosted checkout UID; the official container may run
# as a different UID. Trust only this disposable mount, only on observed drift.
source_uid=$(stat -c %u /work/.git)
process_uid=$(id -u)
printf '{"checkoutUid":%s,"processUid":%s}\n' "$source_uid" "$process_uid" > /evidence/source-ownership.json
if [ "$source_uid" != "$process_uid" ]; then
  test -z "${GIT_CONFIG_COUNT:-}"
  export GIT_CONFIG_COUNT=1 GIT_CONFIG_KEY_0=safe.directory GIT_CONFIG_VALUE_0=/work
fi
test "$(git -C /work rev-parse HEAD)" = ff7a66f51938b2293260ea27a64e2c4e0833b5e3
test -z "$(git -C /work status --porcelain)"
test -f /hooks/penpot-brand-access/access.clj
test -f /hooks/penpot-brand-access/studio_access.clj
test -f /hooks/penpot-brand-access/access_test.clj
test -f /hooks/penpot-brand-access/http_authority_test.clj
test -f /hooks/penpot-brand-access/reconciliation_test.clj
test -f /hooks/penpot-live-fence/live.clj
test -f /hooks/penpot-live-fence/live_test.clj
test -f /hooks/penpot-live-fence/websocket.patch

# C2's reviewed apply script is exact-source guarded and registers only its
# explicit RPC namespace. C3 touches the separate HTTP/util WebSocket files.
python3 /hooks/penpot-brand-access/apply.py /work | tee /evidence/c2-application.json
git -C /work apply --check /hooks/penpot-live-fence/websocket.patch
git -C /work apply /hooks/penpot-live-fence/websocket.patch
mkdir -p /work/backend/src/app/studio /work/backend/test/app/studio
cp /hooks/penpot-live-fence/live.clj /work/backend/src/app/studio/live.clj
cp /hooks/penpot-live-fence/live_test.clj /work/backend/test/app/studio/live_test.clj
cp /recipe/kaocha.edn /work/backend/studio-hook-tests.edn
mkdir -p /tmp/penpot
cd /work/backend

# Actual namespace loading compiles the command and both patched upstream
# modules; helper-only tests cannot silently skip their integration syntax.
# The pinned backend :dev alias has :extra-paths ["test" "dev"], so -M:dev
# includes these test namespaces without activating Kaocha's :test main opts.
clojure -M:dev -e "(require 'app.studio.access 'app.studio.http-authority 'app.rpc.commands.studio-access 'app.studio.live 'app.http.websocket 'app.util.websocket) (doseq [n '[app.studio.access-test app.studio.http-authority-test app.studio.reconciliation-test app.studio.live-test]] (require n) (let [tests (count (filter (comp :test meta) (vals (ns-interns n))))] (assert (pos? tests) (str n \" contains no tests\")) (println n :test-vars tests))) (println :native-hook-namespaces-loaded)" \
  2>&1 | tee /evidence/namespace-compilation.log
clojure -M:dev:test --config-file studio-hook-tests.edn \
  2>&1 | tee /evidence/focused-clojure-tests.log
printf 'namespace-load-and-focused-tests-complete\n' > /evidence/verification-complete.txt
