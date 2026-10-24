# Remote semantic identity binding correction

Exact369 hosted bundle returns managed user without UID from OAuth resolver. Actual Google authorizeLocalEvidenceActor validates grant UID but returns id/username/role/email only. Semantic start requires actor UID and rejects403 before reservation or embedding. OAuth evidence:read is already required uniformly; capacity exhaustion returns409. Actual host logs show resource_read403, consistent with this defect but do not expose the exact internal predicate or request arguments.

After verified grant and maintained managed-account/membership authorization, attach grant.uid to the server-owned actor. Recheck exact current grant UID alongside actor ID and organization during service authorization. Never accept caller UID or broaden OAuth scope. No change to capacity, reservation, model request or idempotency behavior.

Authored contract uses real Google identity implementation and actual OAuth consent/exchange plus SDK tools; manifest then explicit semantic start succeeds, replay/page use one embedding, wrong organization and caller UID fail before embedding, membership revoked during embedding returns no result. No local tests/model/runtime execution. Hosted verification and actual acceptance remain pending.
