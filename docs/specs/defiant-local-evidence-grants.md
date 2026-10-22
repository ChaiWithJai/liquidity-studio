# Scoped local evidence authorization

Approved follow-up to private MCP delivery. This backend-only slice supplies explicit pairing, owner approval, verifier possession, short-lived access credentials and rotating renewal credentials. No HTTP route, UI, Firebase credential export, account lookup implementation, MCP registration or runtime activation is included.

A constructor-owned authority verifies approval actors and returns maintained userId plus verified Firebase UID. A separate constructor-owned delegated-authority callback must verify exact UID, current managed account/principal, provider revocation since approval, and current organization membership on every exchange/renewal/read. Existing job authentication is unchanged. No fallback authority exists.

All state occupies one bounded transactional store key: at most128 pending pairs and64 live grants. Pairing expires in5minutes, has at most5 verifier attempts, and a global30 starts/minute ceiling. A server-generated random pairing ID is also the approval code; the local client holds a32-byte verifier, only its SHA256 goes to begin. Authenticated approval binds exact organization, user and UID. Exchange consumes the approved pair once. Grants last at most8hours from approval, access tokens5minutes, renewal rotates both credentials without extending absolute expiry. Only hashes persist. Replay fails; explicit owner revocation disables both credentials. All errors are finite/generic.

Caller-supplied organization never overrides the approved scope. Returned credentials belong only to this service and must never be accepted by general Studio authentication. Request handlers must reauthorize after asynchronous evidence loading. The authorization callback is injected and must be wired to maintained identity and exact UID checks before activation. Tests use invented subjects and a transactional in-memory fixture; they do not establish live Firebase behavior.

Hosted contracts cover possession, scope, one-time exchange, concurrent renewal/replay, expiry, UID/authority revocation, explicit revocation, bounded state and credential hashing. No local tests/builds/install/model work.
