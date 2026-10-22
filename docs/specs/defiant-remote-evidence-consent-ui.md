# Explicit remote evidence consent UI

Authorized OAuth serving increment; source-only until backend/combined review and hosted acceptance. This UI does not implement the authorization server or claim ChatGPT connectivity.

The normal managed-Google Studio account inspects a remoteEvidenceTransaction from a bounded query parameter. That value selects a pending request, never grants authority. Duplicate query values are invalid. Ordinary workflow navigation preserves this separate query key through sign-in and organization choice. No client, organization or callback is inferred from the URL. Inspection and approval are never automatic.

App mounts the panel under current Google authentication and organization context, keyed by request-session epoch, user ID, organization ID and transaction. Every request uses the existing scopedRequest current-context fence and normal Google bearer; switching account/org destroys the panel and aborts/discards old requests. The backend additionally requires its HttpOnly transaction cookie; UI never reads it. GET /api/auth/config supplies remoteEvidenceEnabled from actual server feature/wiring. Missing/false hides the panel; a valid pending transaction instead shows an explicit unavailable notice with no controls. Feature-disabled endpoints fail unavailable.

Finite backend agreement with the platform owner:
- inspect {organizationId,transactionId} returns transactionId,organizationId,inspectionToken(43base64url),clientId,clientName,resource,scope:evidence:read,maxLifetimeMs:28800000,expiresAt,status:pending,owner{userId,email}.
- approve/deny {organizationId,transactionId,inspectionToken} return completed:true and fixed same-origin completionUrl.
- list {organizationId} returns at most64 owned/current grants with32hex grantId,clientId,clientName,organizationId,approvedAt,expiresAt,scope:evidence:read,readOnly:true.
- revoke {organizationId,grantId} returns revoked:true.

Before enabling Approve or Deny, validate exact transaction/org/current user ID, fixed resource https://studio.chaiwithjai.com/mcp/defiant-evidence, read scope, eight-hour maximum, pending status and unexpired request. Display server account email+ID, exact client ID/name, organization, resource, scope, maximum lifetime and expiry. Inspection proof stays in component memory, is not rendered or put in URL/storage/logs, and goes only to the explicit terminal POST. Server is responsible for immutable single-winner atomic consent and inspection-token validation.

Completion navigation occurs only after successful explicit Approve or Deny. Reject external origin, credentials, fragment, different path, extra/duplicate query keys or a mismatched transaction. Navigate only to /oauth/defiant-evidence/complete?transaction=<exact inspected ID>. No arbitrary redirect from backend text is followed. List/revoke use explicit controls; no credential strings are accepted or shown.

Authored hosted UI fixtures cover initial zero calls, explicit inspection then keyboard approval, denial, own grant revocation, escaped hostile client label, compact width, wrong user/org/resource, expiry, rejected external completion and stale inspection and successful approval replies after account/org switch. These fixtures validate UI behavior, not real OAuth engine or ChatGPT host acceptance. Backend hosted contracts and actual Neo managed-Google→ChatGPT connection remain separate required acceptance. No local build/test/install/model or runtime action performed.
