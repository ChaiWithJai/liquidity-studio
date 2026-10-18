# Issue 39: repository evidence ledger

Audit target: [main6937c53](https://github.com/ChaiWithJai/liquidity-studio/tree/6937c5338887d65d017d8c93dac2a9f2f79906c4), inspected2026-10-17/18 UTC. Source requirements are the complete470-line [issue39](https://github.com/ChaiWithJai/liquidity-studio/issues/39), including both instructional blueprints. The private JSON snapshot preserves its body and zero comments; this document paraphrases requirements instead of republishing the attachment. No repository `AGENTS.md` was found in the audited checkout. This investigation changes documentation only.

Statuses: **verified** means the named evidence supports only the stated scope; **contradicted** means the supplied assertion conflicts with this snapshot; **missing** means no corresponding repository implementation was found; **proposed** means requested future behavior; **unresolved** requires upstream or execution evidence. Absence in this snapshot is not proof that no unpublished branch ever existed.

## Current execution and dependencies

```text
Google ID token → index.js bearer authentication → IdentityService.authorize(org,brand)
 → platform.forScope → ScopedRepository → createAppContainer
 → batchProductionService / multiFormatFormatterService / backlogCalendarService
 → source-integrity approved excerpts → AIGateway → provider JSON → exact validation
 → persisted campaign + generation trace → human edit → artwork SVG → Sharp PNG/ZIP or reel TXT
 → scoped asset + download_created event → authenticated download / portable export
```

The proposed multimodal port and upstream editors are not in this chain. Tenant presets select content/branding; organization+brand membership controls access. A new external editor would have to preserve those authorization boundaries, not substitute a preset string for a tenant identity.

| ID | Supplied repository/capability assertion | Disposition and exact evidence |
|---|---|---|
| R01 | `ports.js` already declares `MultimodalCanvasPort` and three compile/token methods | **Contradicted**: [ports.js](../../liquidity-studio/server/ports.js):9,31,55,83 declares AI, repository, telemetry and durable-store ports only. |
| R02 | `multimodal-canvas.js` / `PenpotDooryMultimodalAdapter` exists | **Missing**: file inventory and symbol search across server, client, scripts and Compose contain neither. No implementation introduction commit can be assigned. |
| R03 | Container injects `canvasEngine`; formatter exposes `compileMultimodalBundle()` | **Missing**: [container.js](../../liquidity-studio/server/container.js):134,197,495 injects repo/gateway/telemetry and exposes existing services; no canvas engine or compiler. |
| R04 | `GET /api/studio/multimodal-spec` emits live bundles | **Contradicted**: [index.js](../../liquidity-studio/server/index.js) has no route. Isolated HTTP request with explicit trusted fixture access returned404, so absence was checked beyond anonymous401. |
| R05 | `docker-compose.gcp-selfhost.yml` already hosts Studio, Doory and Penpot | **Missing**: only current single-Studio Compose and explicit Google ADC/password-test overlays exist. No shared Postgres/Redis/editor services were found. |
| R06 | Three JTBDs already execute end to end | **Verified, bounded**: container services cover batch draft generation, four copy formats, backlog/calendar and operational feedback. Source-approved excerpts, not research-generated verified facts. Current batch can partially fail/retry; explicit scheduler configuration does not prove a live installed schedule. |
| R07 | W3C tokens automatically propagate into external editors | **Missing** externally. [domain.js](../../liquidity-studio/server/domain.js):216 contains CWJ Mona Sans/Inter and four specified hex colors; current artwork uses its own shared renderer. No W3C exporter, live editor subscription or native Penpot token binding. |
| R08 | Penpot SVG annotations create editable components/grid | **Unresolved upstream**, **missing adapter**: existing artwork SVG is rasterized by Sharp; it is not demonstrated as a native governed Penpot document. `data-penpot-*` is not a compatibility proof. |
| R09 | Fabric v6 scenes, DRF payloads, layer IDs and keyframes are generated | **Missing**: no Fabric dependency or scene compiler. `subject_cutout_layer`, `brand_pill_badge`, `headline_layer`, `metric_card_1..3`, `staggerReveal` and `browser-onnx-rmbg` remain required contract names, not existing output. |
| R10 | Current exports include SVG/PNG/JPG/PDF/MP4/WebM/GIF | **Contradicted** as an artifact claim: [export-assets.js](../../liquidity-studio/server/export-assets.js):36 exports infographic/story PNG, four-slide PNG ZIP and reel TXT. SVG is an internal rendering intermediate, not a native editor handoff/download. JPG/PDF/video/GIF have no current renderer. |
| R11 | Four formats and exact sizes | **Verified for current static renderer**, not upstream editors: infographic/carousel1080×1350, story1080×1920; four carousel slides; reel has three timecoded textual beats. No rendered reel duration/page synchronization. See `server/artwork.js` and export tests. |
| R12 | One-click portrait cutout, saffron glow, curved text, multiplayer/comments/version history | **Missing in Studio**. Athlete/founder/teacher/deity/manuscript images need rights/consent and assets before execution. Library/weight licenses and real upstream support are separate unresolved research. |
| R13 | Calendar supports Doory post-production and Penpot final layout states | **Missing**: index schedule allowlist currently contains In Backlog, Ready for Campaign, Draft Ready, Scheduled, Exported. No In Post-Prod/Final Layout transitions or sign-off authority. Exported means artifact persisted, not social publication. |
| R14 | Penpot export/Ready to Post webhook calls Studio export | **Missing** receiver contract, external event proof and authentication/idempotency semantics. Current POST export is a user-authorized artifact creation route, not a verified external callback. No public unauthenticated webhook should be inferred. |
| R15 | Raw/final visual changes are valid DPO pairs | **Contradicted**: [observability.js](../../liquidity-studio/server/observability.js):4,7,25 explicitly classifies edits/downloads as unlabeled events; preferenceLabel null. Pristine generation IDs/text edits exist; no visual scene baseline or preference-training pipeline exists. |
| R16 | Silent Eval100 validates clinical facts/numbers/sutras | **Contradicted**: [source-integrity.js](../../liquidity-studio/server/source-integrity.js):7,19,41,50 requires approved HTTPS claims, explicit clinical review and exact excerpts; score measures excerpt coverage, factualAccuracy `not_assessed`. |
| R17 | Current storage already provides shared S3/editor infrastructure | **Contradicted**: SQLite local and Firestore/GCS official SDK cloud are implemented. [cloud-store.js](../../liquidity-studio/server/cloud-store.js):87,110 verifies org/brand prefix, generation, checksum and metadata. No S3/HMAC client, editor CORS/shared credentials, Postgres or Redis integration. |
| R18 | Complete portable editor scene/motion/token backup | **Missing** those types. Existing [repository.js](../../liquidity-studio/server/repository.js):437,491 exports/imports current drafts/assets/telemetry, verifies checksum and scope/remap, excludes identity credentials. Existing recovery does not prove future editor-native backup. |
| R19 | <15ms bundle /60-second polish /80% completion /<1.5s export /zero license cost imply delivery | **Proposed targets**, not measured guarantees. There is no bundle to benchmark; current PNG measurements do not benchmark editor import, human completion or motion export. Resource/seat-license savings do not establish total cost. |
| R20 | Fonts/colors, two domains, finance and culture source examples | **Verified configuration**, **unresolved end-to-end external fidelity**. Finance seed includes unreviewed primary club source; Yoga SutrasII.29 cultural source is unreviewed. Other research tasks and all unsupported clinical claims remain unreviewed. Titles are not promoted into factual generation. |

## History with actual introduction/change anchors

History was obtained through GitHub path-specific commit inventory because the separate fast local Git store is shallow. These are repository changes, not upstream tool executions:

| Change | Commit | Implication |
|---|---|---|
| Imported prototype, ports and original backwards/QA scripts | [9d8e5f0](https://github.com/ChaiWithJai/liquidity-studio/commit/9d8e5f0dca4ac5248de2959e85515390775840d3) | Historical architecture text is not proof of durable/cloud integration. |
| Real canonical artwork/export artifacts | [08b9b2f](https://github.com/ChaiWithJai/liquidity-studio/commit/08b9b2fbc32f8a70db096d73085f8e04505baf9a) | PNG/ZIP/TXT renderer exists; no Penpot/Doory adapter follows from it. |
| Scoped persistence, authorization and recovery | [ba1ef0f](https://github.com/ChaiWithJai/liquidity-studio/commit/ba1ef0fd63b24fda7e6c510c54c25bd6df039701) | External editor operations must join this scope model. |
| Reviewed source excerpt generation and domain brands | [f500237](https://github.com/ChaiWithJai/liquidity-studio/commit/f500237d4213f6a0ce17668992c47acc3b4f315a), [1979525](https://github.com/ChaiWithJai/liquidity-studio/commit/1979525f2ca8fca58da57b273a7b18dad6fbc53f) | Retires invented facts/implicit classification as acceptance evidence. |
| Unlabeled events and partial batch retries | [d8c34a3](https://github.com/ChaiWithJai/liquidity-studio/commit/d8c34a3ecccc4c17c4e73271c8ff1abb16f7df8e) | Edit/export records are not automatic chosen/rejected labels. |
| Canonical QA without fabricated usability scores | [9c8c89f](https://github.com/ChaiWithJai/liquidity-studio/commit/9c8c89fe61e9d7eaf5b7dbe834af60184d68c01d) | QA is structural; do not resurrect historical100/100 UX claims. |
| Synthetic contract isolation | [96d1ce2](https://github.com/ChaiWithJai/liquidity-studio/commit/96d1ce2abd98a8791be18b3be3b8fb70d628392b) | Backwards run uses deliberate approved fixture claims; not a live provider fact-check. |

GitHub path-specific commit queries for `liquidity-studio/server/multimodal-canvas.js` and `liquidity-studio/docker-compose.gcp-selfhost.yml` each returned zero commits. No claimed multimodal port/file/route/Compose introduction was found in the audited main. Do not fabricate an introducing commit for absent code.

## Reproduced observations

On the isolated6937 checkout with existing locked dependencies and Node22: `AI_PROVIDER=gcp-gemini AI_ALLOW_SYNTHETIC=true node liquidity-studio/server/backwards-test.js` passed **7/7**. It boots real loopback HTTP with `trustedTestMode:true`, in-memory repository and explicitly approved fixtures, exercises brand/backlog/batch/calendar/edit/export/feedback and mock-gateway substitution. It does not authenticate two tenants, open a browser, call editors, render video, train preferences or validate clinical facts. A comment saying “real Gemini” and broad100% wording in this file are stale; behavior and injected fixtures define evidence.

`node liquidity-studio/server/qa-loop.js` passed:34 graph nodes, referenced source files, two committed compiled assets, lockfile consistency and browser-suite existence. The supplied8/8 and5/5 counts do not describe the present scripts. Neither command references a multimodal adapter.

Read-only runtime snapshot:3000 returned404 for `/api/live`, `/api/ready`, `/api/auth/config`;3001 returned200 for those routes. Port3000 must not be assumed equivalent to current main. Docker3001 was independently verified earlier at final image1940959… and returned anonymous data401. The isolated missing-route404 above avoids confusing authorization denial with adapter presence. No running original/server/container was changed.

## Reflection, risks and next evidence

Two occurrences share the same footgun: supplied “adapter wired/route live” claims conflict with R01–R05; supplied “8/8+5/5=editor success” claims conflict with actual script behavior. Code-smell: unsupported capability assertion and test-oracle overreach. Code Complete challenge classes: managing complexity and validating assumptions. RIOA: reason from actual call chains; interpret scripts by assertions rather than labels; observe artifacts/native imports; act only after versioned contracts and independent execution evidence exist. Principle: declaration, renderer output, native editable document and published media are distinct evidence levels.

Inventory: ports/container/index/platform/repository/source-integrity/observability/server artwork/export renderer, package+lock, Compose, ADC/provider environment and tenant-scoped asset delivery. New dependencies would add editor licenses, scene/schema versions, callback secrets, browser model weights, database migrations and recovery obligations; none is installed by this investigation.

Dependency order for future experiments: pinned upstream source/license resolution → versioned common contract and authoritative workflow choice → isolated import/edit/export roundtrip → tenant/token/asset isolation and callback replay tests → full portable recovery → measured CPU/memory/latency/cost → learner assessment. Keep the current Node/SQLite or Firestore/GCS pilot intact; no shared database/Redis provisioning is justified by this ledger. See the complete [instructional disposition](39-instructional-disposition.md) for every supplied blueprint element and explicit gaps.


## Bounded follow-up experiments, not implementation claims

| Proposed work item | Dependency / input | Reproducible acceptance | Downstream impact / rollback |
|---|---|---|---|
| E1 resolve exact tool/license/API contract | [Pinned upstream source ledger](../PENPOT-DOORY-UPSTREAM.md); choose editor versions and document schema | Reconcile Fabric7/Doory schema1, token format, each library/weight license, native API auth and actual supported event names | Blocks adapter design; no pilot runtime change to roll back. |
| E2 compare adapter-only and ordered workflow | Product owner chooses authority for token editing, finishing, final sign-off | Versioned tiny fixture defines all six layer IDs, four color labels, fonts, asset reference and three timecoded reel pages; document unsupported properties | Produces inspectable proposal; no claim native editable compatibility yet. |
| E3 native roundtrip and artifact matrix | E1/E2; disposable authorized local editors, licensed image/font | Import/edit/export each format, decode actual output, compare dimensions/pages/duration/fonts/hash; measure bundle vs render vs human latency separately | Rejected conversion must leave original Studio draft unchanged; dispose only experiment state. |
| E4 scope and callback safety | Working native conversion and documented event | Two brands/two actors; foreign token/room/asset denied; duplicate/out-of-order/replay callbacks do not export twice; approval/export/publication distinct | External adapter cannot bypass existing Studio source/tenant policies; disable integration identity and return to current exporter. |
| E5 full recovery and economics | Actual native scenes/assets/motion/version history | Eject/import into clean installation without credentials, prove native editability and scope; measure resources, font/model download and current full monthly price | No shared DB consolidation or paid infrastructure before an accepted cost/backup/rollback design within pilot envelope. |
| E6 learner validation | Successful E3–E5; reviewed nonclinical examples first | Marketer completes guided/independent workflow; founder diagnoses failure and restores; assess A/B capstones and record actual time/errors/retakes | Trainer revises unmet prerequisites; no fabricated pass score or promise of60-second completion. |

These are proposed issue slices for the parent investigation to reconcile with the upstream/cost workstream before filing implementation commitments. This ledger completes repository/instructional accounting only; issue39 remains open for external execution, licensing, cost and actual learner outcomes.
