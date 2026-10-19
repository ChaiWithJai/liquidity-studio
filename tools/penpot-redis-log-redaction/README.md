# Redis connection log redaction

Pinned Penpot source: `ff7a66f51938b2293260ea27a64e2c4e0833b5e3`. The patch removes credential-bearing URI fields from the backend initialization and exporter connection events. It also replaces only the backend malformed-URI parser exception with a fixed message/data and no original cause, and removes the raw cause field from the exporter Redis error event. Event hints, close/reconnect messages and valid URI/auth behavior remain unchanged. No cache credentials or ACL are activated here.

`apply.py` checks both original file hashes and the patch hash before application, then verifies both resulting hashes. `source-manifest.json` records the exact source basis. Hosted native-hook verification includes focused malformed-input privacy and valid credential/target preservation cases; production JAR construction applies the same source patch. Nothing was compiled or tested locally.

## Hosted delivery

Use `.github/workflows/penpot-redis-runtime-artifact.yml` only after independent review and successful exact-input native-hook verification. Dispatch the reviewed branch at `source_sha`; recipe and source checkouts must both equal that full SHA. The legacy backend artifact entry now fails closed and points here; its remotely disabled workflow must not be re-enabled.

The one job reuses the existing official pinned toolchain, native verification admission, production JAR build and Java26 namespace smoke. It runs the unchanged official **exporter-only** build with the existing registry-verified frozen pnpm wrapper. Source/package/lock files must remain unchanged. No full frontend build is needed.

The exporter target contains its complete compiled graph and metadata. Before use, its package and lock bytes must equal the exact existing ARM64 exporter base. The mount manifest lists only architecture-neutral compiled files/maps; keep base ARM `node_modules`, Node, Chromium and system libraries. Never install or mount the AMD64 build dependencies into the ARM runtime, and do not execute the official target setup script included only as build provenance. This is not a new image or runtime acceptance.

JAR, exporter graph, corresponding native source, file inventories, recipe/source identities and build receipts stay in the disposable runner until encrypted. The only artifact upload is the existing recipient-bound chunked encrypted delivery (maximum 3 GiB, 256 MiB chunks). There is no plaintext intermediate artifact or cross-job handoff, no image push and no runtime/configuration activation. Private recipient keys stay local. Decrypt/verify only the ordered delivery index before inspecting the outputs.

Root must separately review output hashes and perform bounded actual native acceptance before adding authenticated cache configuration. This patch is not Redis ACL or least-privilege acceptance by itself. The existing dedicated deployment boundary remains separate from per-brand native authorization.
