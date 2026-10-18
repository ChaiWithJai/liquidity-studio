# Local-first and desktop direction for the two-person pilot

Date: 2026-10-17. Investigation #107; parent #39. Recommendation for the present pilot, with an experiment required before implementing offline synchronization.

## Decision

Keep the web application and existing Docker distribution. Fix the response path in #104 and the prepared-story path in #103 first. Next, evaluate a bounded IndexedDB draft cache and operation outbox behind a default-off capability. Consider a Tauri shell only if that experiment demonstrates a concrete need for native files, large model management or controlled device integration that the web cannot meet. A shell is not a remedy for server-dependent rendering.

This investigation does not implement offline synchronization, change database authority, install a desktop runtime, or provision new infrastructure. The experiment below is proposed work, not completed performance evidence.

## Observed system and evidence

The current Svelte workspace uses a scoped HTTP client, server authorization and revisioned storage. Local Docker uses SQLite; the managed service uses its existing GCP adapter. Google authenticates the user. Jobs and generation have server quotas, durable state and independent worker delivery. Browser-local state currently preserves some view preferences and transient editing state, not a durable synchronized operation log.

In #104 the pre-change real browser test held the placement HTTP response: the destination card was absent after 500 ms. With the separate pending projection, the same test sees the destination before releasing that response. Frozen commit `4548cd12574414f780d355a43311ffd850970f1b` passes all 10 calendar browser cases and 13 related Node cases, including lost committed response/exact-request retry, denial rollback and cross-brand delayed results. This proves the response dependency and a bounded correction. It does not measure general user-perceived latency, offline reload, or desktop performance. #103 has not yet demonstrated prepared source-linked artwork from both brands.

IndexedDB already supports asynchronous structured records, blobs and transactions in web pages and workers; a desktop wrapper is not required for that capability. [MDN IndexedDB](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API)

Browser-managed storage has quota and eviction behavior. An application must handle failed writes and recovery; local cache must not be treated as the only backup. [MDN storage limits](https://developer.mozilla.org/en-US/docs/Web/API/Storage_API/Storage_quotas_and_eviction_criteria)

Tauri separates web UI from a core/native process and communicates across that boundary. That offers an integration point for native resources, but does not specify this application's synchronization or authority policy. [Tauri architecture](https://v2.tauri.app/concept/architecture/)

Firestore's offline facility is a client SDK feature. It is not an automatic option on this application's HTTP API/server storage adapter. Adopting direct browser database access would require a separate authorization and data-model decision. [Firestore offline data](https://firebase.google.com/docs/firestore/manage-data/enable-offline)

## Options applied to this workload

| Concern | Current Docker + GCP web | Web with IndexedDB cache/outbox | Tauri plus the same sync protocol |
| --- | --- | --- | --- |
| Startup and offline use | Browser starts from running local/server deployment; offline cloud work is limited | Cached app/records could support draft editing; requires app-shell caching and explicit freshness | Installed shell can start locally; cloud identity/generation still need connection |
| Assets and small models | Existing scoped assets and worker processing | Cache verified blobs by digest with explicit quota/error policy | Native files/model packs may be easier to manage; requires a narrow file capability and update policy |
| Multiplayer and agents | Server revisions/idempotency remain authority | Same API plus replay/conflict handling; never blindly last-write-wins | Same protocol still necessary; local database alone does not synchronize two users |
| Tenant isolation | Current server scope and memberships | Cache namespace includes principal/org/brand; purge or lock on logout/scope loss | Same rules, with native files and IPC additionally scoped |
| Recovery and ejection | Existing server backups, restore and export paths | Export pending work before cache reset; restored queue must preserve original keys | Same portable export plus local database recovery/versioning |
| Installation and upkeep | Nicole opens a URL; founder runs Docker | No new installation, but schema migrations and storage diagnostics added | Installer, OS signing/update/recovery and platform QA become maintained product surfaces |
| Pilot spending | Existing $100/month guidance and current limits | No new cloud service proposed; replay can increase API load and must be bounded | No cloud saving demonstrated; packaging/support work increases maintenance |

WebGPU availability and speed must be measured on each actual supported device/browser; neither IndexedDB nor a desktop shell guarantees a compatible accelerator. Model bytes must retain provenance, license and digest checks. The existing model benchmarks do not justify delegating authority or asserting desktop acceleration. Store large weights separately from the small operation queue so eviction and migrations do not multiply model copies.

## Proposed data and authority boundary

Cache only current-user scoped story summaries, source-linked candidate drafts, permitted asset copies and view preferences. Every record carries schema version, principal/org/brand, canonical revision, fetch time and payload digest where applicable. An expired cache remains labeled offline/stale; it cannot imply current membership or approval. Devices retaining authorized cached data cannot guarantee immediate offline revocation: disclose that limitation, restrict sensitive/offline scopes and require fresh authority when reconnecting.

The first queue supports only metadata/calendar intents already covered by revision checks. Store the original command, expected revisions, request key, timestamps and explicit pending/uncertain/conflict state in one transaction before showing durable-queue success. Serialize replay per scope; retry the identical key after a lost response. A conflict becomes a human resolution step and never silently rebases an approval or overwrites Nicole's work. Fence scope switches, logout, stale sessions, duplicate tabs and agents. A local agent uses the same scoped command API and permissions, not raw database credentials.

Do not queue membership changes, approval, artifact sign-off, billing or paid generation for automatic offline execution. These require current server authorization and current revision/budget checks. No service account, application-default credential, database credential or signing secret belongs in renderer storage. Google session handling remains the existing identity boundary. A future native keychain integration would need its own reviewed credential lifecycle; it is not an excuse to copy GCP credentials onto the client.

## Bounded experiment and measurable exit criteria

Use isolated synthetic two-brand fixtures and two browser contexts. Add no production capability until results are recorded. Compare current web, web cache/outbox, and only then a minimal shell if the web result identifies a native requirement.

1. Record 30 calendar interactions under immediate responses and a controlled 750 ms delayed response. Target local visual feedback below 100 ms at the 95th percentile while showing pending state; record receipt latency separately. Repeat prepared-story opening after #103 provides a real saved candidate: warm cache should display meaningful preview below 500 ms without fabricating evidence.
2. Queue 20 permitted edits offline, restart the browser and reconnect. All 20 must resolve exactly once as applied or explicit conflict, with zero silently lost edits. Repeat with response loss after commit and two tabs; compare canonical operation keys and revisions.
3. Have both contexts edit the same story and move the same assignment. Require zero silent overwrite. Revoke membership before replay and require zero accepted unauthorized commands. Switch principal/brand while a response is delayed and require zero cross-scope UI/cache disclosure.
4. Test quota failure, cleared/evicted cache and schema upgrade interruption. Preserve an exportable pending-work report or clearly report loss of unavailable cache; authoritative saved data must recover from the server. Verify local blob/model cache limits without claiming a browser-specific guaranteed quota.
5. Record cold/warm startup, model load/processing, peak memory including workers where measurable, disk usage and recovery effort on the founder's and marketer's supported devices. Do not infer device measurements from a desktop machine's benchmark.

Stop the experiment if scope isolation, request replay or recovery fails. Fix protocol correctness before widening supported operations. Evaluate a shell only if an unmet, measured native-file/model or integration requirement remains, with installer/updater/signing and support costs included in its decision. Keep desktop work off the current web delivery critical path.

## Migration and rollback

Introduce a versioned cache/outbox behind an explicit feature flag. Start with read-only caching, then a small intent allowlist. Keep HTTP DTOs and existing server checks unchanged. Use additive migrations, a single replay owner per scope, and export/quarantine for incompatible or rejected pending intents. Never silently delete an uncertain operation during upgrade.

Rollback disables new queueing and automatic replay, preserves/export pending records, and falls back to server-loaded web operation. Cache deletion follows an explicit empty-or-exported queue decision. The Docker SQLite distribution remains an independent supported path; adopting a cache must not make cloud users manage Docker or require a desktop install. Link any implemented experiment back to #104/#103 and record its actual build, device and results before claiming offline readiness.
