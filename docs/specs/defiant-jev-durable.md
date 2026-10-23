# Durable one-case hosted claim evaluation

Status: source preparation following the reviewed disabled Jev foundation. No provider request, deployment or model-quality result is claimed.

## Purpose and scope

Connect one verified private case to the existing hosted decision adapter, current Studio Google identity and an immutable durable result. A transaction reserves exactly one configured account attempt across concurrent requests and organizations before provider I/O. Replays return the saved attempt; they never create another provider request. This does not create a paid account, grant rights, establish human labels, or complete embedding/evaluation goals.

## Contract

A constructor-owned bounded immutable pack contains schemaVersion 1, organizationId and 1–32 cases. The first finite case type is an earnings claim. Each case binds caseId, origin (authored-development or observed-answer), datasetSha256, evidenceRevision, bounded claim and its SHA256, and an assertion containing month, exact decimal amount, currency, sourceHash and an exact numeric claim span. Only this finite assertion type is supported. The pack is an explicit prepared input; runtime verifies bytes/hash/UTF8/schema and every string digest. It does not certify an external dataset from a declared hash alone. A separate pinned preparation receipt records input artifact/quote validation. Expected labels, reasons and proposed corrections are forbidden pack fields. The preparation process must not place those values inside evidence text. Runtime cannot prove semantic leakage absence by hashing.

The caller supplies only caseId and idempotencyKey. Configured pack hash, evaluator version, deterministic version and account experiment identity are fixed by the server. A required constructor-owned evaluatorConfigSha256 fingerprints the actual model/endpoint/questions/instructions/policy and finite transport limits; it is included in payload identity and persisted attempt, so changed configuration under the same key is409. Runtime composition must derive it from the actual descriptor, never from caller input or a fabricated claim about an arbitrary adapter. Normal Google authentication and maintained UID/application actor membership remain authoritative. MCP read grants cannot execute evaluations.

Use five synchronous transaction keys: identity, organization strategy, account experiment budget, organization index and attempt. Values in aggregate remain within the existing 4 MiB store limit; keys stay within 512 bytes. Index has at most 100 small entries. Attempt metadata is bounded to 64 KiB. Account experiment budget has one total attempt, no resets or automatic refunds. Fixed IDs/timestamps are generated outside retryable callbacks.

Attempt states: reserved, completed, indeterminate. Reservation atomically consumes the single account slot. Provider failures and unavailable results are completed finite outcomes and consume the slot; interrupted/uncertain execution remains reserved or indeterminate and cannot be re-executed. An existing same-key/payload attempt returns before pack/provider work, but only after current authority verification. Same key with different case or configured pack is409. Post-provider authority loss cannot attach a result under a different actor; the consumed reservation survives. No promise of rollback after remote commit or exact-once remote network execution is made. The implementation provides at-most-one application dispatch from a successful reservation under this coordinator.

Runtime reads earnings using the pack revision/month/currency under current authority. Exactly one fact is required; missing or ambiguous facts are unavailable. Exact decimal arithmetic, currency, revision, organization and sourceHash binding are checked mechanically; exact claim span must reproduce the declared amount. These checks do not certify the semantic word cash or reconstruct an aggregate from original cells. Server-rendered evidence includes the exact fact and its metric/period/settlement qualification. Failed/insufficient checks skip Jev. Submitted evidence remains private; persisted results retain hashes, exact configuration identity, typed decisions/usage/cost if observed and qualifications. No private text, credentials or raw errors in logs.

## Implementation

- `liquidity-studio/server/defiant-jev-case-pack.js`: bounded pinned bytes resolver, strict fields and hash checks.
- `liquidity-studio/server/defiant-jev-durable.js`: current-authority reservation/readback and foundation composition; no index/runtime wiring in this backend slice.
- Adjacent `.test.js` files: invented inputs, deterministic deferred provider, actual storage transaction contract through injected memory store.
- Existing `defiant-jev-evaluation.js`, `defiant-strategy.js`, `storage-transaction.js` and normal observation authentication are reused without broadening authority.

## Acceptance

Authored hosted contracts cover pinned hash/UTF8/size/schema and missing cases, forbidden expected-label fields, same-key and cross-organization concurrent account limits, retryable transaction callbacks, lost-response replay, mismatched payload409, UID/member revocation, provider uncertainty consuming reservation, finite output/provenance and zero-I/O absent credentials. No local tests, builds, installs or models. Existing Verify runs `node --test server/*.test.js` in `liquidity-studio`; source review precedes push. No dependency or canonical bundle change is expected until mounted integration.

## Later app acceptance

Add finite normal-Google HTTP commands/readback and a minimal explicit UI after this contract is independently reviewed. Bind the real prepared private case pack, credential and existing account metadata through owner-only configuration; do not export Firebase tokens. Run one bounded remote case and read the same saved record back. The existing key soft budget is not a dollar hard cap. Actual hosted evaluation, account-authority integration, meaningful interpretation and embeddings remain unfinished until observed.

The private first-case choice is a retained authored cash claim with a mechanically checkable earnings amount. Its expected label and reason stay out of the case pack and request. Public tests use invented values. Dataset and original artifact bytes are verified during private pack preparation; runtime binds the pack to the current exact evidence response.

The authored development control is an initial transport/semantic development observation, not an actual ChatGPT failure. The retained observed-report settlement-overclaim case remains a required next evaluation; completing that control does not close that objective. Root verified an existing dedicated Gateway key, account credits and a $1 non-reset soft budget; the key is never read into source or logs. Reuse the existing managed secret bundle with all unrelated fields preserved when runtime integration is separately reviewed. Catalog ZDR=SOME does not prove the chosen provider policy; typesafe-only plus required ZDR must reject rather than fall back if unsupported. No provider request is made by this source slice.
