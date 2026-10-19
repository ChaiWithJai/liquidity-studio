# Studio-owned Doory EditorApp host

Status: implementation specification, not deployed. Issues [52](https://github.com/ChaiWithJai/liquidity-studio/issues/52), [53](https://github.com/ChaiWithJai/liquidity-studio/issues/53), and [55](https://github.com/ChaiWithJai/liquidity-studio/issues/55). Module: `operator-workflow`. Base: `e16c006`.

## Objective and source boundary

Mount the actual Doory React `EditorApp` and its engine in a Svelte lifecycle wrapper. This is not a replacement Fabric editor and does not embed the Django application. Pin upstream [27b6f68221fdbf1ef1bedc182e303210ca9e39f5](https://github.com/shaongitbd/doory/tree/27b6f68221fdbf1ef1bedc182e303210ca9e39f5). Preserve its native `DoryDocument` schema version 1, tools, pages and timeline. Keep Studio's Google identity, brand membership, canonical story revisions, source approvals and existing exporter authoritative.

The host adapter envelope has its own version 1. A document schema version is not an archive or adapter version. The existing external-editor registry and investigation-only Django cookie transport remain disabled and are not reused to impersonate upstream users. This host is a Studio-owned aggregate, not proof of external SSO, native multiplayer, Penpot interoperability or full portable ejection.

## License and dependency inventory

Copy upstream `LICENSE` byte for byte alongside vendored editor source. Include the full license in distributed notices and expose it from the editor. Every editor launch prominently displays “Siam — Creator and maintainer of Doory” and the upstream repository URL. Do not imply endorsement or relicense upstream files under Studio's license.

The pinned Attribution Assurance License requires source redistributions to display its GPG-signed text in verifiable form; binary distributions must accompany that text and show the attribution on each launch. The actual pinned file contains plain text without a GPG signature. Preserve that exact text, record this unresolved discrepancy, and do not fabricate a signature or claim commercial clearance. Launch attribution satisfies only the display requirement, not a finding that every license condition is resolved. Public source and rollout review must retain this qualification.

Upstream runtime imports include React/React DOM, Fabric, Zustand, Lucide React, fflate, jsPDF, gifenc, QRCode, MP4/WebM muxers, Yjs/lib0/y-protocols, bundled font packages and optional ONNX Runtime. Inventory exact resolved lock versions and licenses before vendoring/building. Vendor only the reachable editor/types/style source, with an explicit manifest of copied files and source hashes. Preserve notices. Exclude upstream tests, development hooks, app routing/auth, remote catalogs, model weights and Django. Do not register background removal or fetch model/WASM binaries in this slice. Collaboration is unavailable (`realtime: null`). Keep optional dependencies out of the bundle when their capability is disabled and verify the actual build rather than assuming tree shaking.

## Network and asset boundary

`EditorAdapter` routes save, upload, catalogs and source resolution through captured Studio `request()` and scope. No upstream account/guest adapter or IndexedDB fallback. No arbitrary URL, remote stock, share link, model catalog or native WebSocket. Unsupported services are explicitly unavailable, not successful empty writes. Read-only empty catalogs may return truthful empty pages.

Upstream also fetches directly in engine asset loading, image insertion/style and export font/image embedding. Therefore adapter substitution alone is not a sandbox. Persisted image references must be Studio-owned opaque asset references, resolved to authenticated same-origin bytes and ephemeral object URLs. Revoke URLs on unmount/scope change. Never persist bearer tokens, signed/public bucket URLs, data URLs or object URLs. Reject external/protocol-relative references and unrecognized object resource fields before save and before rendering. Restrict insert-by-URL paths rather than letting unsupported URLs reach fetch. Audit generated bundles and browser requests for foreign origins.

Uploads use bounded JSON/base64 only within an explicit server limit for the initial slice, decoded byte/MIME/dimension checks, raster decoding and scope-owned repository storage. They cannot silently inherit the generic 256 KiB JSON limit and promise larger files. Store SHA-256, size, media type, dimensions, uploader and declared rights/consent. Original uploads remain immutable; derivatives point to their input. Do not accept SVG scripts, arbitrary HTML, audio or remote asset imports in this initial asset endpoint. Existing image provenance is not medical/source approval.

## Aggregate and API contract

New `native-editor.js` owns aggregate validation and persistence. New private routes under `/api/studio/native-editor` require the existing authenticated brand scope on every request, including reads and assets. The aggregate contains opaque ID, organization/brand/story IDs, source story revision, generation ID, source/approval and brand revision snapshots, native document, native revision, creator/updater and timestamps. It stores no external credentials or authorization grants. Original generated campaign and source approvals are never edited by native saves.

Create accepts story ID, format, expected story revision, generation ID, expected brand revision and idempotency key. The server reads authoritative story/profile, compiles the existing canonical multimodal spec and Doory document, and records that immutable origin. It does not trust a client-supplied spec or native initial document. Read returns the aggregate only in its current authenticated scope. Save accepts expected native revision, title, document and idempotency key. Validate source identity, page IDs, supported resources, size and document structure; preserve editable native geometry/text while rejecting foreign assets and executable data. Use atomic scoped-store updates and return 409 on stale revision. Do not automatically rebase a dirty native buffer. Retry an uncertain write using the identical key and payload; a different payload with the same key is rejected.

Separate native edits are proposals. Saving, previewing or downloading never changes source approval, campaign generation, story status, final signoff, `Exported`, scheduling or publication. Existing exporter remains available as rollback. Source/brand drift is displayed and blocks a silent replacement/recompile; rebuilding from updated source is a separate explicit action, not autosave.

Asset upload/read remains scope-bound. Read bytes via the authenticated Studio dispatcher, not a token-bearing URL used by an unmodified image element. Server-side lookup verifies ownership, never accepts a caller-selected storage object path. Native aggregate records must be included in credentialless ejection only when a versioned mapping is implemented and tested; until then surface the portability limitation and do not claim complete archives.

## Frontend integration

New `NativeEditorHost.svelte` owns the React root lifecycle and lazy imports the vendored EditorApp. A new host adapter implements the actual upstream TypeScript interface. React root unmount disposes engine work and object URLs. Opening captures scope and native revision; changing story/brand cannot deliver late saves into a new selection. Use existing dirty-navigation protection. Attribution stays visible in the editor shell. Expose original/exporter return and explicit conflict reload without discarding unsaved work automatically.

Coordinate the eventual App mount with issue 69's App owner. No simultaneous App edits. Add a feature flag default off until the independent acceptance gate. Do not borrow the external native-owner registry as internal authorization.

## Verification and commands

Run Node 22 `node --test server/native-editor.test.js` for real HTTP/scoped-store create/read/save, idempotency, stale save, source drift, cross-brand/third-user denial, malformed documents and foreign assets. Run existing adapter/source-integrity tests too. Build with `NODE_ENV=production node node_modules/vite/bin/vite.js build`; use official Svelte MCP on the new wrapper and any later App integration.

Use isolated real HTTP/SQLite browser fixtures, never ports 3000/3001 or current operator databases. Both brands × infographic/carousel/story/reel produce eight native documents and eighteen pages. Exercise actual EditorApp native text edit/save/reload in each document, selected page identity, fonts including CWJ Om, upload/private image reload, source immutability, 409 preserving local work, late scope rejection and absent model/foreign network requests. Decode actual native preview exports and record dimensions/hashes; static reel boards are not video export evidence. Preserve original screenshots and label fixture content synthetic/unapproved. Independent source and browser review is required before rollout; root owns image/deployment.

## Implementation sequence and rollback

1. Freeze this network/license/dependency inventory and copied-source manifest.
2. Implement and test the scoped aggregate and private asset seam without App edits.
3. Vendor actual upstream EditorApp, implement Studio adapter and isolated wrapper; verify dependency/build behavior.
4. Run the eight-document browser matrix, fix source/resource boundary gaps, then coordinate App mount.
5. Publish PR and independent review. Keep feature off and current exporter operational until immutable-image acceptance. Rollback disables native entry; it preserves native aggregate and original source records.

Cutout, native multiplayer, stock catalogs, public sharing, full font/asset archive ejection, rich approval callbacks and actual reel encoding remain separate acceptance work. This slice must not close those requirements by attribution or annotations alone.

### Distribution checkpoint

The original host/adapter/spec may be reviewed publicly. Vendored upstream source and bundled derivatives stay local pending artifact-specific notice reconciliation. Upstream has supplied [verified signed license text](../investigations/doory-signed-license/README.md); that resolves the formerly missing upstream text, not the retained artifact’s accompanying notice qualification. Local builds obtain the exact pinned source through an explicit preparation step; this does not establish permission to redistribute the resulting binary. Do not add that local source or built editor bundle to a public PR until the distribution condition has a documented disposition. Existing production bundle must not be regenerated with this local editor included by default.

The reproducible static import inventory is `doory-host-source-inventory.json`, produced by `python3 scripts/investigations/doory-host-inventory.py /path/to/pinned/doory`. It records literal imports and worker URL references reachable from actual `src/editor/EditorApp.tsx`, source hashes and package names. It is not a complete runtime-network or licensing audit: generated URLs, `new URL` worker references, CSS assets and optional capabilities require separate review. The graph contains 454 files and approximately 2.2 MB of source before packages. It includes collaboration modules despite disabled realtime; do not equate feature configuration with absence of code in the bundle.

### Storage implementation checkpoint

Native aggregate metadata uses dedicated `native-editor:<organization>:<brand>:document:<id>` keys rather than expanding the existing brand document. The current Firestore adapter already chunks records into 128,000-byte pieces and limits a logical record to 4 MiB; the separate keys avoid consuming that shared brand capacity and rewriting unrelated campaign state. Each revision stores an immutable document payload: GCS scoped JSON artifact on cloud storage, or its own checksummed local-store record. Receipt snapshots retain payload references rather than duplicating complete canvases. Document payload is bounded to 512 KiB; metadata receipts are bounded to 100. Historical payload reclamation and credentialless native ejection remain explicit follow-up work; do not delete payloads still referenced by a retained receipt. Source/brand authorization is rechecked immediately before metadata update, but the current store interface cannot atomically compare the separate brand and native documents. Native saves remain proposals tied to their immutable source snapshot and do not claim a distributed transaction across those keys.

The first actual local EditorApp build passed with 2,729 transformed modules; the main editor chunk was approximately 1.10 MB (347 KB gzip) and the separate GIF worker 10.4 KB. This is build evidence only, not native save/render/export acceptance or permission to distribute the binary. `STUDIO_NATIVE_EDITOR_LOCAL_BUILD=true` enables the locally prepared source; the default virtual module reports unavailable. No model/ONNX capability is registered.

### Editor frame boundary

The actual React EditorApp runs inside a dedicated same-origin frame. Its own CSP restricts script, connection, image, font, media and worker sources; the main Google sign-in document policy is unchanged. A typed parent broker admits only native font/library reads, scoped asset reads/uploads and saving the captured native document ID/revision. Messages require the exact window source, exact origin, session nonce and request UUID. The frame receives no Google bearer, external native session, storage credentials or token-bearing URL. Scope changes, unmount and late replies invalidate the broker; frame teardown revokes image object URLs. A same-origin frame containing trusted upstream code is not an authentication sandbox against malicious same-origin JavaScript. CSP and resource validation address accidental or document-triggered external resource loads; Studio server authorization remains mandatory.

The size-preset provider is explicitly overridden with the pinned built-in catalog so resizing UI does not silently call a Django `/api/v1/size-presets/` endpoint. Upstream source files remain unchanged; this original host provider is part of the reviewed integration. Unsupported native services report unavailable; catalog absence is not an authentication success.

### Implemented local acceptance boundary

The original Studio host now includes the default-off App entry, resume of the latest matching generation/format proposal, an explicit return to the original exporter, and a dirty-native navigation guard. A save acknowledgment updates metadata without remounting the editor; an explicit conflict reload remounts using the saved native revision. Original helper and jobs mounts are retained. Saving a separate conflict copy is explicitly unavailable and keeps local work open; it is not reported as successful.

Raster uploads are capped at 512 KiB and four megapixels, with at most two concurrent decode validations. Validation decodes a tiny sample rather than allocating a full raw raster buffer; stored original bytes remain immutable. Reads recheck membership after payload retrieval. The native image library is scoped to its own immutable asset records; deletion is unavailable. Native document validation preserves the source page IDs/order and currently excludes audio, external hyperlinks/resources and unsupported serialized kinds. This is a bounded host slice, not acceptance of every upstream toolbar feature.

The public default build includes only original Studio host code. Its Rollup audit rejects copied Doory modules, React/Fabric runtime, the editor frame and copied upstream license assets. Source-containing local builds verify all 454 imported source/worker hashes plus token CSS and the exact license bytes before bundling. Their binary output remains private. Native browser acceptance uses production-compiled temporary fixture bundles, not Vite HMR instrumentation, and deliberately skips when that local pinned prerequisite is absent. Green default CI cannot clear the upstream distribution condition or authorize enabling this feature in production.
