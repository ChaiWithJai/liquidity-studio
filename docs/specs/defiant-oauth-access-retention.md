# OAuth access retention during legitimate refresh

Status: root-reviewed scope; implementation and independent source review pending. Parent contract: defiant-chatgpt-evidence-oauth.md. This is one bounded authentication correction, not a new transport or identity system.

## Objective and evidence

Actual ChatGPT made repeated successful token exchanges interleaved with MCP401/200, then reported expired access. Root revoked that grant and restored canonical routing. Source confirms that a legitimate refresh currently clears/replaces the only access hash, invalidating other requests before their original access expiry. Why ChatGPT proactively refreshes remains unproven. This correction must not claim that host behavior is resolved before actual acceptance.

## Reviewed contract

- Retain each legitimately issued access-token hash with its original expiry. Access lifetime stays five minutes, bounded by the unchanged eight-hour family deadline. No expiry extension and no refresh-token replay grace.
- Accept legacy version1 families containing only accessHash/accessExpiresAt. New optional retained-access records are validated strictly; malformed arrays, hashes, duplicate entries or expiry beyond the current legitimately issued access expiry/family deadline fail closed. Current expiry must be a safe integer no later than now+FIVE and the family deadline; retention copies original stored expiry without recomputation. This does not claim detection of arbitrary trusted-store tampering. Prune only expired access entries.
- Maximum64 live access tokens per family accommodates the existing10 refreshes/minute and five-minute lifetime. Existing64-family and4096-tombstone caps remain. No new global admission system is introduced. Do not evict live tokens or tombstones to admit another request.
- Check the64-token family capacity atomically before refresh consumption. The existing refresh claim reserves the free slot and serializes issuance within that family; capacity failure leaves the refresh credential unconsumed. Initial code exchange starts an empty family under the unchanged family cap.
- Failure cleanup can close only this request's still-owned refresh claim. Failure after consumption attempts to revoke that family and never restores the consumed refresh token. If durable cleanup also fails or the process crashes, previously issued access can remain valid only until its original five-minute expiry; the refresh token remains consumed and no new token is issued. Do not claim immediate family revocation when persistence is uncertain.
- Current managed UID/membership checks occur before issuance/read and after asynchronous authorization. Family revocation, public token-possession revocation, owner revocation and refresh replay invalidate every current or retained access token.
- Preserve exact client, issuer, audience, scope, PKCE, cookie, locale and rate controls. No new dependency, public route, OAuth client, account, runtime configuration, provider call or infrastructure.

## Implementation plan and files

The existing server/defiant-evidence-oauth.js owns validation, retained hashes, atomic reservations and verification. Engine and real SDK contracts remain in server/defiant-evidence-oauth.test.js and server/defiant-evidence-remote.test.js. Existing version1 persistence remains compatible. No store/table/migration is introduced.

## Hosted verification

Normal Verify only: NODE_ENV=production npm run build; node --test server/*.test.js; node --test ../scripts/*.test.mjs; npm run test:browser -- --project=chromium. No local application execution, install, build, suite or model call is authorized.

Required regression contracts: actual engine rotation keeps old/new access until each original expiry; a verification paused in current-authority lookup survives another legitimate refresh and rechecks retained membership; revocation/replay rejects every token; capacity rejects before consume and can retry the same refresh after expiry frees a slot; malformed/legacy states; failed persistence after consumption stays fail-closed; actual SDK old/new clients and revoked access. Final exact-head CI and independent source/canonical review precede root-owned candidate delivery and plain ChatGPT acceptance.

## Serialized bound

The existing cloud store permits4MiB chunked values. A conservative UTF-8 budget is128 transactions×16KiB (five maximum bounded inspection subjects plus terminal subject/client/state),64 families×10KiB (current plus63 retained hashes and bounded identity/client metadata),4096 tombstones×192bytes, plus32KiB structural/rate overhead:3,571,712bytes, below4,194,304bytes. No raw tokens or expanded evidence records are stored. Existing per-field and record-count limits are unchanged. The access record itself is only a64-hex hash and original numeric expiry; this adds at most63 records/family.
