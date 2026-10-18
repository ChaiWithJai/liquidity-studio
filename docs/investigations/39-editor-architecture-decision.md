# Editor architecture decision and investigation disposition

Recorded 2026-10-18 against Studio main `b6b9e0c` (merged native Doory evidence). This is a reviewable architecture recommendation and delivery queue, not an implemented adapter or a provisioning decision. Issue [39](https://github.com/ChaiWithJai/liquidity-studio/issues/39) remains open. The supplied brief and all [70 instructional requirements](39-instructional-disposition.md) remain authoritative requirements; dated earlier ledgers are not silently rewritten as present-day execution claims.

## Decision

Keep the current Node/Svelte service as the content/source-review, identity, calendar and provenance authority. Add an optional versioned editor boundary only after native/security contracts pass. Prefer an incremental local Doory native integration as the next bounded experiment. Keep Penpot final-layout integration disabled until restored text rendering passes and token activation/binding is implemented and validated. Neither JSON scene output nor annotated SVG establishes editor compatibility. Do not migrate existing Firestore/GCS or provision SQL/Redis/editor services to make the original diagram appear implemented.

Resolve the two proposed orderings explicitly: Studio owns approved copy and brand revisions; an optional Doory stage proposes native visual edits; an optional Penpot stage may provide final governed layout only when lossless native mapping is proven. External edits return versioned proposals, not implicit authority to alter approved facts or tokens. A parallel brand-library editor can be supported as a separate adapter capability; it must not silently invert the ordered sign-off workflow. A human can export from the current renderer while integrations remain disabled.

| Path | What exists / proposed change | Operational and license consequence | Decision |
|---|---|---|---|
| A current Node/Svelte | Actual scoped copy/backlog/calendar, canonical artwork, PNG/ZIP and reel storyboard text. A future inspectable editor spec/compiler is absent. | Smallest current deployment; preserves existing auth/storage/source gates. SVG internals do not become native editable external documents by naming a port. | Retain as operational baseline and rollback; implement contract behind a feature flag first. |
| B embedded Fabric/cutout | Fabric alone could host editable objects; no embedded Studio canvas/cutout adapter exists. Actual Doory lock resolves Fabric 7.4.0. | Browser CPU/memory, model/WASM download, CSP/privacy/fonts/accessibility and maintenance shift into Studio. Fabric license is not a license for copied Doory code; IMG.LY wrapper 1.7 is AGPL, model/runtime licenses separate. | Possible later alternative; no assumption of MIT-only parity or waived attribution. Require exact dependency/binary provenance and runtime proof. |
| C full local/VM Compose | Pinned Doory local API/browser roundtrip succeeded. Isolated Penpot runs, with native/text fidelity failure described below. No unified Studio/editor production Compose exists. | Python/Django, JVM/Clojure, exporter/browser, Postgres and Redis/Valkey add versions, disk/memory, credentials, migrations/backups and failure domains. A shared DB instance needs separate users/databases; Redis indexes are not isolation. A VM remains one failure domain. | Use disposable capped local experiments. Price a measured VM only after compatibility/recovery acceptance; no implied authorization for a VM. |
| D managed GCP | Existing Studio pilot uses Firestore/GCS/Cloud Run; external managed editor deployment absent. | SQL/Redis fixed floors, exporter compute, private media, egress, backups and model costs are additional. WebSocket timeout/affinity does not guarantee reconnect, shared room state or revocation. | Defer editor provisioning: illustrated SQL 2vCPU/8GiB + 1GiB Redis + 20GiB SQL storage is 147.74 USD/month before Studio/editor compute. 100 USD pilot alerts are not a hard spending cap. |

Source/license details and primary links: [upstream ledger](../PENPOT-DOORY-UPSTREAM.md), [contracts and dated Catalog cost arithmetic](39-penpot-contracts-and-operations.md), [code/model/attribution scopes](39-licenses-models-and-references.md). No new price quote or unexecuted cloud fit is asserted here.

## Actual boundaries and failures

The [repository/history ledger](39-repository-evidence.md) found no claimed multimodal port/adapter/route/production Compose introduction. The actual call chain remains authenticated Studio request → org/brand-scoped repository → approved source generation → canonical artwork/export and calendar/telemetry. Existing presets are configuration; account tenant is organization, with explicitly authorized brands. Issue 49 separately tracks brand-switch stale display and is not duplicated by this editor queue.

[Doory guest evidence](39-doory-guest-build.md) proves original editable two-page text survives local reload and actual SVG/PNG downloads. Its MP4 is H.264, 1080×1350, 30fps, 300 frames, 10 seconds, two static text pages, no audio. [Native Doory evidence](39-doory-native-api.md) further proves schema-v1 API create/read/edit/revision 409, owner/outsider checks, public/password shares, room denial/revocation, actual browser native edit/save/reload and decoded two-page SVG/PNG. The stable textbox ID survived. Existing-volume PostgreSQL WAL recovery preserved the fixture after a real disk/control-plane interruption. These are original QA-owner fixtures, not Studio-managed brand identities, complete native archives or a measured multi-replica production service.

The root operator's official Penpot 2.18.3 experiment, documented in [PR60](https://github.com/ChaiWithJai/liquidity-studio/pull/60), establishes this bounded result: actual Studio SVG saved as 16 `svg-raw` shapes and 0 native text; DTCG 3 colors/1 dimension imported but inactive/unbound. Native archive export/import completed, but restored canvas and 1080×1350 PNG lost all six expected text lines while fresh reload of the original retained them. Do not describe archive creation as successful fidelity or claim imported SVG is editable governed typography. Independent read-only RPC comparison subsequently found raw SVG text content and shape/token data preserved, so this is a rendered-text fidelity failure, not demonstrated deletion of text bytes. The exact cause is unresolved; ticket 54 requires reproducer and fresh-import proof before integration. A separate native `type:text` control did survive archive/import; independent before/after PNGs were byte-identical (2,400 bytes, 280×75, SHA256 `1e2bdcdc288ef001081dcf8f2bae9392a5485a6ab6f0f0b5ef2c7c14c5120191`). That passing control makes explicit native-text construction a feasible next experiment, without proving complete fonts/components or explaining the raw-SVG rendering bug. Imported token sets were unbound and inactive; no attempted binding failure is claimed. Detailed platform evidence in PR60 supplies the precise scope.

## Artifact evidence matrix

| Artifact | Actual execution evidence | Remaining acceptance |
|---|---|---|
| SVG | Doory guest/native two-page exports retain text runs; Studio internal SVG imported into Penpot as raw shapes. | Governed native editable Penpot conversion, font-byte fidelity and two-brand/four-format mapping. |
| PNG | Studio current renderer and Doory two-page 1080×1350 downloads verified; restored Penpot 1080×1350 PNG is a documented text-loss failure. | All formats/brands and lossless Penpot fresh-restore output. |
| JPG | Upstream format implementation inspected. | No independent JPG download/decode acceptance in this investigation. |
| PDF | Upstream format/server exporter source inspected. | No actual PDF page/font/geometry/download proof here; server Chromium path adds resource requirements. |
| MP4 | Doory guest 10-second H.264 two-static-page fixture decoded. | Requested 30-second 1080×1920 three-beat animation, transitions/audio rights and native lineage. |
| WebM / GIF | Upstream encoders/source exist. | No independent runtime encoding/decode acceptance here. |
| Native JSON / archive | Doory API exact JSON copy and browser native edit proven; Penpot archive imports but loses text. | Complete credentialless fresh-install native scene/assets/fonts/versions/approvals/feedback restore, not just a JSON file or completed import dialog. |

## Contract and dependency gaps

| Boundary | Required authority and validation | Failure policy |
|---|---|---|
| Studio → native editor | Versioned contract binds org/brand/story/generation/source approvals/brand revision/native schema. Stable layer/page IDs and explicit unsupported fields. | Reject stale/foreign/unsupported input without changing the Studio original. |
| Token/layout edits | Studio-approved revision, exact four named CWJ colors and Mona Sans/Inter configuration; external changes are explicit proposals. | Conflict/review required; no silent token overwrite or substitute-font success. |
| Native assets / handoff | Scoped immutable bytes, generation/hash/MIME, rights/license and original/cutout lineage; actual client-specific private delivery or S3/HMAC/CORS proof. | Reject foreign references and incomplete assets. Common bucket URL is not access authority. |
| Workflow / callback | Role-bound state transitions and signed/authenticated event envelope with tenant/artifact/revision/event ID/time/nonce; verify supported event and complete asset. | Idempotent replay/duplicate/out-of-order handling; do not mark Exported on a UI label or incomplete upload. Scheduling/approval/export/publication remain distinct. |
| Feedback | Raw generation, human-final document/artifact versions and source approvals; consent/retention and explicit preference judgments. | Preserve unlabeled edits; no automatic DPO chosen/rejected pair from arbitrary diffs. |
| Ejection / restore | Versioned manifest plus every scene/token/font/image/cutout/motion/layout revision/approval/feedback byte, hashes/notices and explicit target identity remap. | Credentialless fresh-install restore must preserve editability and scope; JSON copying and text-losing archives do not pass. |

All clinical, financial and historical claims retain existing source review. The 15× humming finding, 3,900 theorem framing, 40Hz/Ramanujan neuroscience and sutra interpretation cannot become verified facts through token/number matching. The [source ledger](39-licenses-models-and-references.md) scopes these research leads; clinician/source review requirements are not replaced by an editor score.

## Delivery queue and rollout

| Sequence / ticket | Depends on | Reviewable result |
|---|---|---|
| [51: Define versioned editor contract and authoritative token/workflow ownership](https://github.com/ChaiWithJai/liquidity-studio/issues/51) | #39 evidence | Concrete acceptance, downstream effect, cost and rollback are in the linked ticket. |
| [52: Enforce editor org-brand identity and private asset boundaries](https://github.com/ChaiWithJai/liquidity-studio/issues/52) | #51 | Concrete acceptance, downstream effect, cost and rollback are in the linked ticket. |
| [53: Build bounded source-faithful Doory native adapter and brand token propagation](https://github.com/ChaiWithJai/liquidity-studio/issues/53) | #51, #52 | Concrete acceptance, downstream effect, cost and rollback are in the linked ticket. |
| [54: Resolve Penpot SVG text loss and token binding before final-layout integration](https://github.com/ChaiWithJai/liquidity-studio/issues/54) | #51, #52 | Concrete acceptance, downstream effect, cost and rollback are in the linked ticket. |
| [55: Execute licensed browser cutout and full media artifact acceptance](https://github.com/ChaiWithJai/liquidity-studio/issues/55) | #51, #53 | Concrete acceptance, downstream effect, cost and rollback are in the linked ticket. |
| [56: Implement approval states and authenticated replay-safe artifact callbacks](https://github.com/ChaiWithJai/liquidity-studio/issues/56) | #51, #52, #53, #54 | Concrete acceptance, downstream effect, cost and rollback are in the linked ticket. |
| [57: Prove complete editor ejection restore and budgeted deployment readiness](https://github.com/ChaiWithJai/liquidity-studio/issues/57) | #52, #53, #54, #55, #56 | Concrete acceptance, downstream effect, cost and rollback are in the linked ticket. |
| [58: Validate complete marketer and founder instructional blueprints against real editor workflow](https://github.com/ChaiWithJai/liquidity-studio/issues/58) | #51, #52, #53, #54, #55, #56, #57 | Concrete acceptance, downstream effect, cost and rollback are in the linked ticket. |

Contract and source/license work comes first; identity/assets precede credential-bearing adapters. Doory and Penpot native work can proceed independently once the shared contract is accepted, with Penpot disabled on fidelity failure. Media and events depend on actual native artifacts. Full recovery/cost readiness precedes deployment; guided operator/architect assessments come last. Work in isolated branches, independently review exact heads, retain actual fixtures/hashes and negative tests. No schema-only or static-script pass may promote a native integration.

Enable integrations by explicit capability/brand allowlist, preserve raw/native revisions and current exporter, and monitor failures/conflicts/replay/asset completion without credential logging. Roll back by disabling the adapter/event identity, retaining event journals and original Studio drafts; restore verified backups for a migration rollback. Never delete or rewrite the current production data to accommodate a converter. Existing #19/#30 cloud/auth acceptance and #49 UI defect remain their own queues.

## Investigation completion audit

Repository/history, primary upstream sources, license distinctions, dated cost arithmetic and the complete 70-item structural disposition have concrete documents. Local experiments now establish bounded Doory native editing/export and owner/share/room safety, plus an observed Penpot compatibility failure and an operational disk/recovery incident. They do not establish a full Studio→Doory→Penpot implementation.

Still unexecuted or unaccepted: functioning licensed cutout/model inference; requested three-beat 30-second 9:16 reel/animation/audio; actual JPG/PDF/WebM/GIF acceptance; all-four-format/two-brand native conversion; four exact color/font live-token pixel propagation; Penpot editable text/component bindings and lossless archive; shared GCS/S3 multi-client private assets; Studio org-brand editor identities; full callback replay/state integration; complete credentialless asset/font/native archive restore; managed deployment sizing/cost fit; and real learner 60-second/capstone/retake outcomes. No claim of <15ms compile or <1.5-second export follows from the build or existing downloads.

Issue 39 must remain open until its required deliverables are reviewed and these remaining runtime requirements are either evidenced or explicitly dispositioned by the product owner with the linked implementation backlog retained. Filing the backlog completes planning, not those implementations.
