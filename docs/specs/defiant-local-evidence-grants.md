# Scoped local evidence authorization

Approved follow-up to private MCP delivery. This backend-only slice supplies explicit pairing, owner approval, verifier possession, short-lived access credentials and rotating renewal credentials. No HTTP route, UI, Firebase credential export, account lookup implementation, MCP registration or runtime activation is included.

A constructor-owned authority verifies approval actors and returns maintained userId plus verified Firebase UID. A separate constructor-owned delegated-authority callback must verify exact UID, current managed account/principal, provider revocation since approval, and current organization membership on every exchange/renewal/read. Existing job authentication is unchanged. No fallback authority exists.

All state occupies one bounded transactional store key: at most128 pending pairs and64 live grants. Pairing expires in5minutes, has at most5 verifier attempts, and a global30 starts/minute ceiling. A server-generated random pairing ID is also the approval code; the local client holds a32-byte verifier, only its SHA256 goes to begin. Authenticated approval binds exact organization, user and UID. Exchange consumes the approved pair once. Grants last at most8hours from approval, access tokens5minutes, renewal rotates both credentials without extending absolute expiry. Only hashes persist. Replay fails; explicit owner revocation disables both credentials. All errors are finite/generic.

Caller-supplied organization never overrides the approved scope. Returned credentials belong only to this service and must never be accepted by general Studio authentication. Request handlers must reauthorize after asynchronous evidence loading. The authorization callback is injected and must be wired to maintained identity and exact UID checks before activation. Tests use invented subjects and a transactional in-memory fixture; they do not establish live Firebase behavior.

Hosted contracts cover possession, scope, one-time exchange, concurrent renewal/replay, expiry, UID/authority revocation, explicit revocation, bounded state and credential hashing. No local tests/builds/install/model work.

## Runtime and UI contract

Explicit feature switch `STUDIO_LOCAL_EVIDENCE_GRANTS_ENABLED=true` requires configured private evidence and managed Google identity; otherwise routes404. No default activation. POST-only finite `/api/studio/local-evidence/{begin,inspect,approve,exchange,renew,revoke}`, no query parameters, strict exact JSON keys,4KiB body and5s read deadline. Errors never echo bodies or credentials. Begin/exchange/renew use verifier/renewal possession, with no Firebase export. Inspect/approve/revoke require the ordinary signed-in Firebase Bearer and maintained membership. The approval page must display exact clientName, organizationId, scope and expiry from inspect and require an explicit click; no automatic approval on link load.

Requests/responses:
- begin `{organizationId,verifierHash,clientName}` → `{pairingId,expiresAt,organizationId,clientName}`.
- inspect `{organizationId,pairingId}` → `{pairingId,organizationId,clientName,expiresAt,approved,scope:"evidence:read",maximumGrantLifetimeMs}`.
- approve `{organizationId,pairingId}` → `{approved:true,organizationId}`.
- exchange `{pairingId,verifier}` → `{organizationId,accessToken,renewalToken,accessExpiresAt,expiresAt}`.
- renew `{organizationId,renewalToken}` → rotated same credential shape.
- revoke `{organizationId,grantId}` → `{revoked:true}`.

Only exact evidence GET routes recognize `Bearer ea.…`; general Studio authentication is unchanged and these credentials cannot authorize pairing approval or general routes. Existing service pre/post-load authorization repeats local-grant and maintained-principal/membership validation. Google job authorization factors its existing behavior into a shared helper without changing return/denial semantics; local delegation additionally pins the exact Firebase UID. UI and local-client renewal implementation remain future integration work.
