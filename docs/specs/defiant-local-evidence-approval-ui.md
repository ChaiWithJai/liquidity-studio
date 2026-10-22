# Local evidence client approval UI

Owner-authorized UI for the finite scoped local-client backend. In the current Studio organization, explicitly inspect a pasted pairing code; display server-returned client name, exact organization ID, read-only scope, pairing expiry and maximum grant lifetime before enabling an explicit Approve click. Never approve through URL/state loading. List only server-returned current owner's active grants and explicitly revoke selected grant IDs. Backend remains authoritative for user/UID/membership and expiry.

Use the existing normal signed-in request channel and scope/session cancellation fences. UI never receives, displays, persists or exports Firebase/access/renewal tokens or verifier hashes. Key the component by current session+actor+organization; clear async results after teardown and abort pending requests. Editing a pairing code clears inspection; stale or mismatched responses fail closed. Feature-disabled404 is a quiet unavailable state with no auth/config workaround. No deployment/activation here.

Authored hosted journey covers inspect-before-approve, exact escaped client/scope, expiry, wrong-scope response, list/revoke, edited code, teardown with in-flight request and compact layout. Official Svelte MCP source review required. No local execution.
