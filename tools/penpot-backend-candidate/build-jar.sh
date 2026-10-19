#!/usr/bin/env bash
# Hosted artifact construction only; verified tests are consumed, not rerun.
set -euo pipefail
if [ "$(stat -c %u /work/.git)" != "$(id -u)" ]; then
  export GIT_CONFIG_COUNT=1 GIT_CONFIG_KEY_0=safe.directory GIT_CONFIG_VALUE_0=/work
fi
test "$(git -C /work rev-parse HEAD)" = ff7a66f51938b2293260ea27a64e2c4e0833b5e3
test -z "$(git -C /work status --porcelain)"
test -z "${STUDIO_NATIVE_ACCESS_CONFIG:-}"
python3 /hooks/penpot-redis-log-redaction/apply.py /work > /output/redis-log-application.json
python3 /hooks/penpot-brand-access/apply.py /work > /output/c2-application.json
git -C /work apply --check /hooks/penpot-live-fence/websocket.patch
git -C /work apply /hooks/penpot-live-fence/websocket.patch
cp /hooks/penpot-live-fence/live.clj /work/backend/src/app/studio/live.clj
echo '7ed4c93d478c8c393bc12ab630a563f8d928d1e58d320c644dbc5d414bca5387  /work/backend/src/app/main.clj' | sha256sum -c -
git -C /work apply --check /hooks/penpot-native-access-bootstrap/main.patch
git -C /work apply /hooks/penpot-native-access-bootstrap/main.patch
cp /hooks/penpot-native-access-bootstrap/configuration.clj /work/backend/src/app/studio/configuration.clj
python3 /hooks/penpot-private-asset-access/apply.py /work > /output/assets-application.json
cd /work/backend
mkdir -p target/classes
printf '2.18.3\n' > target/classes/version.txt
cp ../CHANGES.md target/classes/changelog.md
clojure -T:build jar
cp target/penpot.jar /output/penpot.jar
cp /work/LICENSE /output/UPSTREAM-LICENSE
cp /work/CHANGES.md /output/UPSTREAM-CHANGES.md
cp deps.edn /output/backend-deps.edn
cp /work/common/deps.edn /output/common-deps.edn
# Full patched source (including new original modules) is necessary for MPL
# correspondence. Never include .git, build caches, private config or test data.
tar -C /work -czf /output/corresponding-source.tar.gz backend/src backend/resources backend/build.clj backend/deps.edn common/src common/target/classes common/deps.edn common/build.clj LICENSE CHANGES.md
python3 /recipe/check-jar.py /work /output
# tools.build merges this one standard resource. Inspect actual EDN maps,
# without evaluating reader symbols, and preserve all original mappings.
clojure -M /recipe/check-readers.clj /work/backend/src/data_readers.clj /output/penpot.jar /output/data-readers-merge.json
