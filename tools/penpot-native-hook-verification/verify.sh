#!/usr/bin/env bash
# Hosted-only recipe; no runtime image, native DB, listener or frontend artifact.
set -euo pipefail
# The bind is owned by the hosted checkout UID; the official container may run
# as a different UID. Trust only this disposable mount, only on observed drift.
source_uid=$(stat -c %u /work/.git)
process_uid=$(id -u)
process_gid=$(id -g)
printf '{"checkoutUid":%s,"processUid":%s,"processGid":%s,"groups":"%s"}\n' "$source_uid" "$process_uid" "$process_gid" "$(id -G)" > /evidence/source-ownership.json
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
test -f /hooks/penpot-native-access-bootstrap/configuration.clj
test -f /hooks/penpot-native-access-bootstrap/configuration_test.clj
test -f /hooks/penpot-native-access-bootstrap/main.patch
test -f /hooks/penpot-private-asset-access/apply.py
test -f /hooks/penpot-private-asset-access/assets.clj
test -f /hooks/penpot-private-asset-access/assets_test.clj
test -f /hooks/penpot-private-asset-access/assets.patch
test -f /hooks/penpot-private-asset-access/upstream-source.json
test -z "${STUDIO_NATIVE_ACCESS_CONFIG:-}"

# C2's reviewed apply script is exact-source guarded and registers only its
# explicit RPC namespace. C3 touches the separate HTTP/util WebSocket files.
python3 /hooks/penpot-brand-access/apply.py /work | tee /evidence/c2-application.json
git -C /work apply --check /hooks/penpot-live-fence/websocket.patch
git -C /work apply /hooks/penpot-live-fence/websocket.patch
mkdir -p /work/backend/src/app/studio /work/backend/test/app/studio
cp /hooks/penpot-live-fence/live.clj /work/backend/src/app/studio/live.clj
cp /hooks/penpot-live-fence/live_test.clj /work/backend/test/app/studio/live_test.clj
echo '7ed4c93d478c8c393bc12ab630a563f8d928d1e58d320c644dbc5d414bca5387  /work/backend/src/app/main.clj' | sha256sum -c -
git -C /work apply --check /hooks/penpot-native-access-bootstrap/main.patch
git -C /work apply /hooks/penpot-native-access-bootstrap/main.patch
test ! -e /work/backend/src/app/studio/configuration.clj
test ! -e /work/backend/test/app/studio/configuration_test.clj
cp /hooks/penpot-native-access-bootstrap/configuration.clj /work/backend/src/app/studio/configuration.clj
cp /hooks/penpot-native-access-bootstrap/configuration_test.clj /work/backend/test/app/studio/configuration_test.clj
# The byte-delivery seam has its own exact upstream/source guards. Apply after
# bootstrap configuration; it changes assets.clj, not the main/WS/RPC patches.
python3 /hooks/penpot-private-asset-access/apply.py /work | tee /evidence/assets-application.json
cp /recipe/kaocha.edn /work/backend/studio-hook-tests.edn
mkdir -p /tmp/penpot
cd /work/backend

# Actual namespace loading compiles the command and both patched upstream
# modules; helper-only tests cannot silently skip their integration syntax.
# The pinned backend :dev alias has :extra-paths ["test" "dev"], so -M:dev
# includes these test namespaces without activating Kaocha's :test main opts.
clojure -M:dev -e "(require 'app.studio.access 'app.studio.http-authority 'app.rpc.commands.studio-access 'app.studio.live 'app.http.websocket 'app.util.websocket 'app.studio.configuration 'app.main 'app.studio.assets 'app.http.assets) (doseq [n '[app.studio.access-test app.studio.http-authority-test app.studio.reconciliation-test app.studio.live-test app.studio.configuration-test app.studio.assets-test]] (require n) (let [tests (count (filter (comp :test meta) (vals (ns-interns n))))] (assert (pos? tests) (str n \" contains no tests\")) (println n :test-vars tests))) (println :native-hook-namespaces-loaded)" \
  2>&1 | tee /evidence/namespace-compilation.log
clojure -M:dev:test --config-file studio-hook-tests.edn \
  2>&1 | tee /evidence/focused-clojure-tests.log
printf 'namespace-load-and-focused-tests-complete\n' > /evidence/verification-complete.txt
