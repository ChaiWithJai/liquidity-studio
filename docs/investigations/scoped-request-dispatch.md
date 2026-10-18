# Preserve request intent across token refresh

The Google request path awaited token refresh before reading the current organization and brand query. Navigation during that wait could send an already prepared write body to the newly selected brand. A response guard cannot undo that dispatch. This is an intent-preservation defect; the server still checks membership for the supplied scope, and this investigation does not demonstrate an authorization bypass or a customer incident.

History: `7dfc1f4` introduced the asynchronous Google token path. The scope-response guard introduced in `dc03b8a` did not guard dispatch, and an old 401 could clear a newer workspace before that guard ran.

The request helper captures scope and a sign-in epoch before authorization. It checks both before dispatch and after reading the response, including before handling 401. Unscoped authentication requests may survive navigation but cannot survive replacement of the sign-in session. Requests already dispatched can still complete on the server; this change does not promise cancellation or rollback of accepted writes.

Validation on this change:

- Five real HTTP tests cover delayed authorization with zero stale dispatches, captured query/body/header delivery, stale versus current 401 handling, replacement sessions, late success, and unscoped navigation.
- Normal browser suite: 20 passed, two Google-emulator-only cases skipped.
- Official Google Auth Emulator browser suite: four passed, including Google popup authentication, server bearer verification, persistence, export, role restrictions, sign-out, and bounded retry.
- Production build passed. Official Svelte MCP reported no component issues.

The isolated test server and demo identity emulator are controlled fixtures. They do not certify a new live deployment or another human's first login.
