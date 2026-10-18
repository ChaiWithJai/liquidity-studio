# Native editor pack and fresh-install restoration

Issue [57](https://github.com/ChaiWithJai/liquidity-studio/issues/57), schema 1. This implements the supported Studio-owned native editor pathway. It does not complete issue 57 or authorize another cloud stack. The upstream editor source/bundle and model weights are not included; the existing license distribution hold remains.

## Portable content and authority

The JSON archive contains SHA-256-addressed, sized binary entries. No entry has an extraction path. It carries the scoped repository export, exact current and initial DoryDocument v1 scenes, retained native layout snapshots, page durations/positions/text/tokens, private image bytes and their rights declarations, derivative cutout input/output hashes and processor/model lineage, and five shipped font variants plus their OFL license bytes. Every native scene passes the existing hosted-document validator, including opaque owned image references. The importer validates image decoding and dimensions before reserving its destination. It requires the exact supported licensed fonts to be installed in the target runtime and compares their bytes; it does not write request-selected font paths.

Live sessions, password material, Google credentials, memberships, helper grants, active jobs, cutout permits, source actor receipt replay and native approval authority do not transfer. Native review records transfer only as historical evidence inside a proposal's portable history. The destination gets no `editor-review` approval record. Existing generation/artifact evidence remains historical. A new review must precede any verified export or publication.

Current founder access and destination membership are checked server-side. The request must name the current destination and explicitly map every retained native owner to the current principal. `sourceReviewAcknowledged: true` records that current owner's review of the exact pack; approved nonclinical source excerpts are re-stamped for that owner. Clinical packs refuse installation until their clinical source-review pathway is re-established. This acknowledgement is not clinical review or a factual-accuracy score. Unknown repository extensions reject instead of silently dropping data; prepared-source candidate migration must follow its final reviewed contract.

Limits: 48 MiB serialized pack, 1,024 distinct files, 4 MiB per file, 100 native documents, 100 image assets, 100 retained snapshots per document, and existing 512 KiB native image/scene limits. Duplicate/missing/unreferenced files, incorrect hashes, foreign document/image/cutout references, unsupported versions, unsupported fields, serialized credential fields and external native paint sources reject. Limits are explicit refusal boundaries, not an unlimited customer archive claim.

## Scoped HTTP contract

Both `STUDIO_NATIVE_EDITOR_ENABLED=true` and `STUDIO_NATIVE_PORTABLE_ENABLED=true` are required. The feature is off by default. These routes use the ordinary managed Google identity in production; no second credential database or browser-to-editor bearer bridge is introduced.

| Method/path | Request/result |
| --- | --- |
| `GET /api/admin/editor-pack/export?organizationId=…&brandId=…` | Current founder receives the validated pack. Concurrent source/native/asset/review changes reject; retry ejection after edits settle. |
| `POST /api/admin/editor-pack/destinations` | `{organizationId,name,preset}` creates a new, explicitly empty brand for the current founder. Supported presets: `liquidity_desk`, `vedic_dharma`. It never clears research seeds or user work in another brand. |
| `POST /api/admin/editor-pack/install?organizationId=…&brandId=…` | `{pack,options:{target:{organizationId,brandId},principalRemap:{oldOwnerId:currentOwnerId},sourceReviewAcknowledged:true,idempotencyKey}}`. Explicit mapping is required even when IDs happen to match. |
| `POST /api/admin/editor-pack/rollback?organizationId=…&brandId=…` | `{idempotencyKey}` rolls back an interrupted installation, using current founder authority. It cannot erase an activated destination. |

A populated destination rejects. Source and destination identities are independently provisioned. Replaying the same completed request returns its receipt after current authorization, without overwriting subsequent edits. Changed content/owner mapping under the same key rejects.

## Reservation, interruption and recovery

All content, rights, bytes, format, capacity and predictable record/transaction size checks run before reservation. Local capacity requires estimated staging headroom plus 64 MiB available on the database filesystem; this is not a remote Firestore quota guarantee. The installer atomically reserves the empty source record with a durable journal and checks an unchanged identity snapshot. Normal scoped reads/mutations and native operations return 423 while installation is in progress. Native create/save/image commits also check that gate inside their scoped transaction, preventing an already-open request from landing inside the reservation.

Records are written only at server-selected destination keys and tagged with the installation ID. Activation atomically replaces the reserved source record and completed receipt after another identity/reservation check. Native history remains editable proposal content; source content revision checks remain enforced. The process never overwrites a populated native namespace.

A failed write attempts rollback. Revoked owners cannot continue or recover; the destination stays locked for a currently authorized founder. Recovery claims a 60-second lease with a unique token. A new founder recovery can take over after a crashed lease expires; a still-running older recovery cannot delete after that takeover. Each physical conditional deletion checks the current identity, scope reservation, journal token and record tag atomically in SQLite or Firestore. Recovery deletes only keys whose installation tag matches the durable journal. A collision or changed ownership stops cleanup and retains the lock for inspection. The final release atomically restores the empty source and sets the one scoped journal record to null; it never follows that release with an unconditional delete that could erase a newer installer. Source and a separately verified pre-install database backup remain the rollback source. No arbitrary prefix sweep or remote bucket deletion occurs.

The implementation currently stores imported payloads and native image bytes through the existing durable record port, so SQLite and Firestore retain their own configured engine. It does not replace Firestore, create SQL/Redis services, or treat Redis database indexes as authorization. A subsequent native save uses the existing configured immutable payload mechanism. The four-MiB transaction ceiling remains in force; over-capacity restoration refuses before activation.

## Reproducible evidence

Run from `liquidity-studio` with Node 22:

```sh
NODE_ENV=test node --test server/editor-pack.test.js server/editor-pack-http.test.js
```

These tests cover both presets/all four formats, exact scene/history retention, deletion of original storage, explicit brand/owner remapping, native edit/save/read, anonymous and marketer denial, default-off routes, corrupt hashes/versions/foreign references, no remap, populated destinations, injected disk failure, owner revocation, competing installers, two-process rollback/new-install interleavings, owned-only rollback and a real child-process exit during staging followed by fresh-process recovery. Concurrent collection/review changes reject ejection.

The actual EditorApp fixture requires the existing privately prepared upstream source under its distribution hold. It is intentionally skipped when that source is absent; this is not simulated by the public original-only frame:

```sh
node scripts/prepare-native-editor.mjs /operator-owned/pinned-doory-source
NODE_ENV=test STUDIO_NATIVE_CUTOUT_ENABLED=true \
  STUDIO_NATIVE_MODNET_PATH=/operator-owned/verified-modnet.onnx \
  node node_modules/@playwright/test/cli.js test tests/editor-pack-native.spec.js \
  --output=/operator-owned/unique-acceptance-output
```

Actual local result: three browser journeys passed. A founder ejected eight documents and owned procedural image bytes through authenticated HTTP; the original database was closed. A completely new database and independently provisioned principal restored the packs through the HTTP destination/install routes. Actual EditorApp then edited/saved/reloaded all eight documents. A downloaded native PNG decoded as 1080×1350 and retained an exact procedural orange pixel. The real MODNet worker also produced a cutout before ejection; its output bytes, alpha dimensions, original input bytes and browser-reported lineage survived into the new scope. The procedural image is nonpersonal, not portrait-quality acceptance or server-attested inference. No paid model generation, existing deployment, cloud resource or maintained container changed.

## Remaining issue-57 acceptance

This checkpoint is not a complete managed-editor release. A real remote Firestore/GCS portability replay, full maximum-size/memory benchmark, prepared-source migration and final verified-export review integration remain separate checks. Native frame reconnect/revocation tests do not prove Django/Redis WebSocket collaboration; this supported host declares realtime unavailable. Deploying an external collaboration stack still requires actual database-specific role/connection/backup/restore and Redis ACL tests, recovery between instances, measured resources and a separately accepted budget. Native MP4/WebM motion/media restoration beyond retained timed scenes also requires actual decoded exports. The existing full static/media investigation evidence is not relabeled as a fresh-pack media test.

For current architecture and prices, preserve [the existing Virginia SKU evidence](../investigations/39-virginia-price-evidence.json) and [cost comparison](../investigations/39-penpot-contracts-and-operations.md#current-virginia-cost-model). That dedicated SQL+Redis example is already $147.74/month before app compute, inference, backups or egress. The Studio-owned host adds neither SQL nor Redis. Its eventual managed rollout still needs a complete priced workload and approval under the existing budget; the $20 Run/$70 Vertex controls and $100 aggregate alerts are delayed controls, not a hard all-service guarantee.

Implementation references: [Node 22 SHA-256](https://nodejs.org/docs/latest-v22.x/api/crypto.html#cryptocreatehashalgorithm-options), [filesystem capacity](https://nodejs.org/docs/latest-v22.x/api/fs.html#fsstatfssyncpath-options), and the existing scoped storage/native contracts. No archive contents are executed or extracted to caller-selected paths.
