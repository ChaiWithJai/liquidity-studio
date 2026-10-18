# Editor approval and artifact receipt workflow

Status: semantics and implementation sequence approved by the operator. Module: operator-workflow in the approved managed-product capability order. Issue: #56. Depends on editor identity #52 and native adapters #53/#54. Runtime delivery requires the acceptance evidence below.

## Objective and assumptions

A founder or marketer can review the exact native result, approve it, schedule it, and export verified private bytes without confusing those actions with Instagram publication. Current Google identity, organization/brand authorization, SQLite/Firestore repository ports, and registered editor targets remain authoritative. No new service, public share, external webhook provider, or paid infrastructure is assumed. Upstream Penpot ReadyToPost/ExportFinalPack events are unproven; the first supported trigger is an explicit Studio adapter-owned export action.

## Contract and state

The artifact review record captures organization/brand, story ID and expected story revision, immutable generation ID, native proposal/document ID and expected native revision, brand revision, actor, timestamps, and a review version. Stages are DraftReady → InPostProd → FinalLayout → Approved. An authenticated actor with current edit permission can submit final layout. Only a current founder or a marketer explicitly permitted to approve that brand can approve/reject. Approval is tied to content digests and revisions, never a reusable Boolean. Any changed generation, native content, brand styling, or source revision invalidates approval before subsequent schedule/export; old approvals remain historical audit entries.

Scheduled and Exported are explicit facts attached to an approved review version, rather than a destructive linear stage: an approved artifact can be exported before scheduling, or scheduled before export. Calendar remains the date/position authority. Neither fact means social publication. UI shows both facts and the current approval state.

Transitions carry an idempotency key, expected review revision and the observed source/native revisions. Replaying identical committed input returns the stored receipt; different input under the same key conflicts. Current membership and action permissions are checked before accepting new work. A replay may reveal a receipt only to a currently authorized actor. Revoked membership cannot acquire new capability. No instantaneous atomic revocation across external writes and identity storage is claimed.

Adapter completion uses a fixed-version envelope: event ID, binding/epoch, scoped artifact/story/generation IDs, expected review/native revisions, content SHA-256 and byte size, MIME, issued time, expiry, nonce and request digest. A server-held rotating key authenticates the envelope; no signing secret or arbitrary remote URL enters the browser. Use constant-time MAC verification, a bounded clock window and a persisted nonce/event journal. Duplicate identical completion returns the original receipt. Changed duplicate, stale generation/revision, wrong scope, expired signature, incomplete asset, hash mismatch and out-of-order completion must fail without recording Exported. The operator can disable completion while retaining the journal.

Before completion, the trusted adapter retrieves only registered private assets, verifies their full bytes and digest, rechecks current approval and scope, and commits the receipt atomically with the review journal. Upload/remote-render failure preserves original data and a retryable failure record. An uncertain external response requires reconciliation using the same idempotency key; it must not silently create a second export. Native text/visual changes retain raw generation lineage and human-final provenance. Preference labels stay unset until an explicit chosen/rejected judgment; no automatic training label is inferred from a diff.

## Structure and code style

Existing Node 22 ESM and Svelte 5. New server/editor-approval.js owns transition validation and bounded journal operations through existing repository ports; server/editor-approval.test.js proves state and replay behavior. A narrow authenticated server/index.js route delegates to it. A dedicated Svelte review panel and src/lib API methods use the same semantic boundary; App only mounts it with captured scoped client and existing dirty-navigation guards. Adapter completion stays separate from native transport implementation. Documentation lives here; real browser evidence belongs under docs/design-review/issue-56 with source/image manifests.

Follow existing fail(status, message), exact-field validation, async ports, and explicit identity/scope injection. Example: `await review.approve(actor, { reviewId, expectedRevision, idempotencyKey })`. Do not accept caller-supplied actor roles or native target URLs. Bound all arrays, text, bytes, retained receipts, and timestamps; retain unresolved export entries until reconciled rather than evicting their replay protection.

## Commands and verification

From liquidity-studio with Node 22: `npm ci --engine-strict`; `node --test server/editor-approval.test.js`; `node --test server/*.test.js`; `npm run build`; `npx playwright test tests/editor-approval.spec.js`; `npm run qa:loop`. Run official Svelte MCP checks after component changes. Preserve all five existing hosted CI gates.

Meaningful domain/HTTP tests cover both actors, forged/foreign/expired envelopes, revoked binding/member, stale source/native/brand revisions, same-key replay and mismatch, concurrent approve/edit, duplicate/out-of-order/retry/uncertain completion, byte/hash failure, approval invalidation and journal recovery after process restart. Actual built-App browser journeys cover founder and marketer roles, visible pending/approved/stale states, denial/error recovery, scheduling separately from export, and reopening saved work. Actual private artifact retrieval must match the committed SHA and MIME; schema tests alone cannot close #56. Existing Google pilot and complete native export/ejection checks remain required downstream acceptance.

## Boundaries and rollback

Always preserve immutable generation/original assets, reauthorize current scope, enforce revision comparisons and bounded transactions, and expose actionable conflicts without silent overwrite. Reuse current dependencies/storage. Ask before a new external event provider, additional paid infrastructure, or widening approval roles. Never expose callback signing keys, enable public asset URLs, infer publication or model-training consent, skip failing gates, or copy uncleared native source into the public build.

Rollback disables new review completion/transition endpoints while retaining reviews, signed-event journal, approved artifacts and calendar data. Re-enable only after reconciling uncertain completions; no destructive data reset.

## Success criteria

Issue #56 closes only after the complete authenticated UI→review→adapter→private bytes→receipt path passes on the exact combined build, with actual current permissions, negative/collision/recovery evidence and retained provenance. This spec is not implementation evidence. Related #52–#58 tickets keep their independent acceptance requirements.
