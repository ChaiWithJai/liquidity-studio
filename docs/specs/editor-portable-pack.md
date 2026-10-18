# Native editor pack and fresh-install restoration

Issue [57](https://github.com/ChaiWithJai/liquidity-studio/issues/57), schema 1. This implements the supported Studio-owned native editor pathway. It does not complete issue 57 or authorize another cloud stack. The upstream editor source/bundle and model weights are not included; the existing license distribution hold remains.

## Portable content and authority

The JSON archive contains SHA-256-addressed, sized binary entries. No entry has an extraction path. It carries the scoped repository export, exact current and initial DoryDocument v1 scenes, retained native layout snapshots, page durations/positions/text/tokens, private image bytes and their rights declarations, derivative cutout input/output hashes and processor/model lineage (including the original worker actor), and five shipped font variants plus their OFL license bytes. Every native scene passes the existing hosted-document validator, including opaque owned image references. The importer validates image decoding and dimensions before reserving its destination. It requires the exact supported licensed fonts to be installed in the target runtime and compares their bytes; it does not write request-selected font paths.

Live sessions, password material, Google credentials, memberships, helper grants, active jobs, cutout permits, source actor receipt replay and native approval authority do not transfer. Native review records transfer only as historical evidence inside a proposal's portable history. The destination gets no `editor-review` approval record. Original worker actors, original native source bindings and authors remain historical provenance; a separate bounded restoration chain records each importing principal, target scope and pack digest. Re-ejection retains this history without rewriting an old worker action as an action by the importer. Existing generation/artifact evidence remains historical. A new review must precede any verified export or publication.

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

## Version 2 retained evidence and final artifacts

Version 2 retains completed, signed-off native PNG bytes alongside historical human receipts. Ejection resolves each receipt's exact private staging record, checks its signoff, hash, size and page, and fully decodes the PNG. The archive carries the original bytes, not a rerender. Fresh installation stores bounded private chunks and exposes them only through current scoped membership. The restored receipt is historical: no signing key, completion envelope, nonce, replay grant or current approval is installed. Native edits do not rewrite an older final artifact. Version 1 packs remain readable; version 2 adds `preparedHistory` and per-document `finalExports`.

`GET /api/studio/native-editor/documents/:id/portable-exports` lists historical final artifacts. Appending `/:artifactId` returns the exact PNG as base64 plus historical metadata. Both require the existing native host and portable feature flags and current scoped access. These are recovery APIs, not evidence of a completed end-user recovery interface.

Prepared-source archives preserve original extractive candidates, retrieved plain-text evidence and hashes, excerpt offsets, and saved human copy. Execution IDs and live edit/fork/promotion receipts do not transfer. Destination entries carry `restoredHistorical` with original scope/candidate and pack hash. Prepared-copy source fields become unreviewed; a general import acknowledgement cannot approve them. Original human provenance remains historical, including across repeated ejection.

A restored prepared-derived native layout has `origin.requiresSourceReview: true`. It is readable as historical and cannot be saved or approved. The client cannot clear this origin fence through a native save. A deliberate fresh current-generation fork and whole-copy review can establish new source authority. Rebinding a retained human native layout to that new source is a separate explicit operation and remains an acceptance gap; this pack does not silently rebind it.

An unfinished imported preparation with no campaign also remains historical. Continuing it requires the separate bounded historical-candidate fork: explicit retained candidate identity, current story/content/brand revisions, no existing campaign, and exact evidence/working-copy hashes, followed by a fresh whole-copy review. This continuation is not implemented by the archive projection and is tracked under issue #57.

Native saves continue to support their existing font choices. Pack validation rejects a current, initial or historical scene whose primary font is not one of the exact licensed font families carried by the pack. It does not silently substitute a font or promise portability for an uninstalled custom family.

Evidence: 52 focused Node/SQLite and real scoped HTTP tests cover signoff through fresh install, exact PNG retrieval after native editing, missing/corrupt/stage-mismatched artifacts, no restored review/export grants, anonymous/foreign-scope retrieval denial, and original reviewer provenance. An actual Node/SQLite prepared-source integration with a different destination founder also rejects direct historical approval and origin-clearing writes, then requires a fresh current-generation fork and whole-copy review. Two original-only Chromium checks cover historical host isolation/reload/write denial and the existing review panel lost-response/conflict path. The default bundle audit passes with no held native source compiled. Full private EditorApp acceptance for this follow-up remains pending capacity headroom. The existing deployment, capacity, reconnect and issue #57 acceptance limits above remain open.

### Incremental ejection capacity (issue #120)

Ejection rejects a file above four MiB before encoding it. The file collection counts the exact base64/JSON entry size and refuses a new unique file before the encoded file array exceeds 48 MiB or 1024 entries. Identical content is retained once and does not consume a second entry. Final whole-pack validation still applies, including metadata and manifest overhead; these checks do not raise any archive or runtime limit.

The service checks combined retained/live history counts before hydrating that document. Completed PNGs are validated and handed to the file budget individually, so rejection stops before reading a later artifact. Mutable source/native/review/export metadata is fingerprinted sequentially. Immutable inline export payloads are excluded from that metadata pass and read only when their completed receipt is consumed; collection-key fences remain, and exact bytes still must match the stage/receipt hash and full PNG decode. This does not weaken current scoped authorization or restore export completion authority.

Controlled Node/SQLite regressions verify that exhausted file/byte budgets stop later scene hydration, 101 combined history entries stop before any scene read, and an artifact budget failure stops before the next payload. Whole-store snapshots before and after rejected ejection remain equal. A completed PNG is loaded once, rather than three times across capture/read/final capture. These are bounded-behavior checks, not a claimed measured peak-heap or production capacity benchmark.

### HTTP admission and body deadline

The HTTP server admits one portable-pack operation at a time, across export,
install, rollback, and empty-destination creation. Authentication, founder access,
feature flags, the known route/method, and existing-scope membership are checked
before admission and before collecting a body. An occupied slot returns HTTP 429
with `Retry-After: 1`; the caller can retry the same install idempotency key after
the active operation finishes. Rejection does not start JSON collection or an
installation journal. Transport bytes may be discarded without retaining them so
HTTP clients can receive the response while uploading.

The slot remains occupied until both server work has settled and the response
has finished or closed. Disconnecting an export client does not admit another
export while the original work continues. Aborted or failed body collection
releases its slot; portable POST body collection has a 15-second deadline. The
49 MiB install body limit and all archive limits remain unchanged. Ordinary
non-pack routes are not serialized by this guard. The read-only recovery status route is also exempt, after the same founder/feature/scope checks, so an active installation cannot hide its journal.

This is a per-server-instance overlap control, not a hard 512 MiB memory limit or
an aggregate spend guarantee. JSON parsing, validation, archive serialization,
and transport still have memory costs; multi-instance scaling and instance-level
capacity require separate operational limits. Regression tests use tiny held
requests and a held HTTP response, rather than allocating maximum-size packs.
## Founder Operations recovery workflow

The default-off portable capability adds an Operations panel to the ordinary Studio application. A founder can download the active brand's validated JSON pack, select a private pack no larger than 48 MiB, inspect a clearly unvalidated file summary, and create a new empty recovery brand. The panel never offers an existing brand as an installation destination. The current owner deliberately attests to nonclinical source review and maps retained native owners to the current account; this does not restore prepared-copy, artwork, clinical or publication approval.

Destination creation accepts an optional idempotency key. Its actor-scoped ledger retains at most 32 successful exact-payload requests without eviction; replay rechecks current founder membership and preserves any work subsequently added to that destination. Changed payloads conflict. Existing callers without a key retain their previous behavior.

`GET /api/admin/editor-pack/status?organizationId=…&brandId=…` reads only the durable restore journal after current founder/scope authorization. It does not instantiate or seed a repository, and remains available while the destination is reserved. The projection contains status, installation ID, pack hash, creation time and completed result. Only the original actor receives the original request key/replay indicator; another authorized founder receives rollback capability only. Identity hashes, source snapshots, internal storage keys and recovery lease tokens are excluded.

The panel stores only an actor/source-scope-partitioned recovery locator in browser storage: destination identity, pack/file hashes and request key. It stores no pack bytes, source copy, credentials or grants. Closing the page requires reselecting the exact file before replaying installation. A status check never executes an install. An unknown reply retains the same intent/key; known refusal presents the server reason. Interrupted installation is explicitly rolled back to its owned empty destination before retrying. Rollback by installation ID uses the same atomic reservation and ownership checks as the existing key-based operation, without exposing the original actor's key to another founder.

All requests use the existing managed-identity dispatcher. Explicit destination requests retain the originating workspace/session fence before token acquisition and after responses. Leaving that scope unmounts the panel; late replies cannot adopt another brand's state. This panel adds no editor distribution, model, infrastructure or sign-in capability. It does not satisfy the separate current-owner native/source rebind acceptance merely by installing historical evidence.
