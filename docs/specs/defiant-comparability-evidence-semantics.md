# Spec: explicit settlement-comparability evidence semantics

## Objective and assumptions
A retained evaluation classified a negative comparability claim as supported while its evidence contained an ambiguous legacy Boolean. Prevent new dispatches from treating that Boolean as a complete semantic contract. Preserve prior observations as recorded; do not convert them into correctness labels. This is one input-contract guard, not a new classifier or a model-quality claim.

Assumptions: current main is d139a15de1c13f3074b2810d404430cd35e730c7 (merged371), verified through GitHub blob identities in base-review.json. Current configured historical pack remains v1 and consumed. No configuration, private object, account experiment or existing record changes are part of this source slice. Legacy detail/list/replay remain usable. Owner authorization covers source work; root and independent review precede publication.

## Contract
Keep historical projection v1 readable and byte-compatible. Add a separately named historical-store-period-comparability-v2 projection contract. A v2 neutral state replaces settlementMaturityComparable with a finite settlementComparability envelope containing status, basis, normalizerGitBlob and interpretationVersion. The current historical adapter may produce ONLY status `not-established`, basis `source-file-posting-windows-without-store-settlement-verification`, the existing pinned historical normalizer, and fixed interpretationVersion `settlement-comparability-status-v1`. The provider-visible domain definition states that not-established is neither established-comparable nor established-incomparable; source-file posting ranges cannot alone determine store settlement maturity. This is evidence semantics, not the expected label for the quoted claim.

Define all three statuses in the domain vocabulary, but do not enable this historical resolver to manufacture either established status. An invented paired contract can demonstrate the distinction between an explicitly evidenced established-incomparable fixture and an absence-of-proof fixture; the production historical adapter must reject a pack asserting the former against the current source recipe. No generic proof ingestion or new authority for client-supplied status.

The independently configured binding pins the v2 projection version and newly pinned neutral-state bytes. Resolve recomputes the finite neutral projection from already pinned historical snapshot/normalizer interpretation, then requires exact canonical equality with the pinned state. Version, state hash and interpretation enter provenance and evaluator fingerprint. No post-hash silent state enrichment. Original claim/span/dataset/snapshot binding remains unchanged by this code; any future private pack preparation is a separate reviewed operation.

## Legacy fail-closed behavior and replay
Expose a finite `ambiguous-evidence-semantics` execution-unavailability reason for a configured legacy historical projection; do not fail startup or prevent discovery/list/detail. Credential availability alone must not make that pack executable. Server evaluation enforces the same guard, not just UI disablement.

In the durable reservation transaction, first return a matching existing record under the existing payload/config/actor checks. Only a genuinely new reservation invokes the constructor-owned pack execution guard. A legacy pack therefore cannot reserve a new attempt, append an index entry, or dispatch a provider request, while an existing consumed request still replays the exact saved record. Existing null materialization of missing transactional slots is not a promise of physical read-only storage. No migration/rewrite/reset, and no changes to legacy evaluator fingerprint or parser output.

For v2 only, a current-authority existing-record transaction precedes object reads. If no matching record exists, resolve pinned evidence and validate the exact shared serialized provider envelope before attempting the atomic reservation. Recheck authority before/after resolution and at reservation. Concurrent requests may duplicate bounded metadata preflight reads but only the atomic winner dispatches. A consumed v2 experiment with a new key may still read pinned objects before capacity rejection; no claim of zero I/O. Malformed v2 evidence or oversized envelope initializes no budget/record. Null-slot materialization remains possible.

## Honest display
Keep saved support probabilities, outcome, timestamps and provenance verbatim. For a displayed v1 historical record, add presentation-only text: “This observation used legacy comparability semantics. A false comparable flag did not distinguish unestablished comparability from established non-comparability. The recorded model result is unchanged.” Do not label it incorrect or replace supported. New v2 records show their explicit evidence status and interpretation version separately from model support. Configured legacy execution shows the finite unavailable reason rather than “already consumed” unless capacity actually is consumed. Same-key recovery remains available for existing requests.

## Structure and implementation proposal
- server/defiant-jev-historical-case-pack.js: finite version/status recipe, legacy metadata execution guard, v2 recomputation, finite versioned provenance.
- server/defiant-jev-historical-runtime.js: propagate actual pack execution availability and correct version into adapter/coordinator.
- server/defiant-jev-durable.js: preserve replay-before-new-reservation guard ordering and finite version/provenance support.
- server/defiant-jev-evaluation.js: keep v1 fingerprint and parser unchanged; v2 includes explicit semantics instruction/version only when configured as v2.
- server/defiant-jev-runtime.js and server/index.js: existing discovery envelope carries finite unavailable reason without changing Google authority.
- src/components/defiant/ClaimEvaluations.svelte: unavailable reason and presentation-only historical caveat.
- corresponding server unit/HTTP contracts and existing ClaimEvaluation browser fixture/spec: invented examples only.
- docs/specs/defiant-comparability-evidence-semantics.md: this public spec; no private identifiers/claim text.

## Commands (hosted verification only)
From liquidity-studio: `node --test server/*.test.js`, `node --test ../scripts/*.test.mjs`, `npm run test:backwards`, `npm run qa:loop`, `NODE_ENV=production npm run build`, `npm run test:browser -- --project=chromium`. Existing Verify workflow owns installs/builds/execution. None run locally for this task. Official Svelte MCP review is required for component changes.

## Code style
Follow finite exact-key validation, constructor-owned configuration and bounded plain objects. Example: `if (version === LEGACY_VERSION) return {available:false,reason:'ambiguous-evidence-semantics'};`. Never infer a semantic status from Boolean negation or a probability threshold. Retain 12KiB state, 4096B finite provenance/config and existing read/deadline/auth budgets; update representative max-size contract if needed.

## Testing strategy and success criteria
1. Existing legacy saved record/detail/same-key replay deep-equal; zero provider calls and no added attempt. Different/new key against legacy pack rejects before initialized budget/index/record changes, with real transactional callback retry coverage.
2. Discovery reports execution unavailable for legacy even with valid key; current UID/org and membership fences remain. v2 availability requires its complete reviewed binding; malformed/unknown version/status fail closed.
3. Invented paired evidence: not-established with source-file windows stays not-established; explicit established-incomparable is a distinct semantic meaning and is rejected by this source recipe. No test asserts that Jev must produce a particular probability or silently treats agent-authored expectations as human labels.
4. v2 exact state/provenance binding and fingerprint changes when semantics change; all legacy fingerprints remain exact. Mismatched state/hash/version fails with zero provider dispatch.
5. Browser saved legacy supported result stays visible and unchanged, caveat is separate; unavailable new Run disabled; existing recovery/readback works. Account switching excludes stale responses. No automatic dispatch on open/reload.

## Boundaries
Always preserve existing authority, reservation/idempotency, pins, parser strictness and saved results. Seek root/peer review before publication and any future private pack adoption. Never run models, reset experiments, alter current runtime config, add dependencies, rewrite historical outputs, infer established-incomparable from false, or claim improved accuracy. Source-only implementation is not actual model acceptance.

## Plan and tasks
1. Freeze finite v1/v2 semantics and replay ordering with root/peer review.
2. Implement resolver/runtime/coordinator guard and authored contracts; independently review before UI integration.
3. Add finite discovery/display changes and authored HTTP/browser contracts, official Svelte review.
4. Freeze exact main-relative diff and hashes for root/peer; only then authorized hosted verification. No push in this preparation turn.
