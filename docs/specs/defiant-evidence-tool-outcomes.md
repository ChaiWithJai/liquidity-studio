# Private evidence tool outcome diagnostics

Status: owner-authorized diagnostic slice; independent source and hosted verification pending. Parent: defiant-chatgpt-evidence-oauth.md. Actual ChatGPT returned a June answer but reported an unusable detailed receipt response; the responsible tool and failure stage are unknown.

## Objective and assumptions

Record one terminal outcome for each executed registered evidence-tool callback. The event identifies only a static tool name, static stage, finite semantic status and success/error. It diagnoses execution, not transport delivery, answer correctness, aggregate reconciliation or the cause of the observed receipt failure. Pre-callback SDK/schema/auth rejection and transport timeout outside the callback remain explicitly unobserved. Absence of an event never means success. Initial authorization remains before request validation. No request parsing or new telemetry store is introduced.

## Contract and implementation

- The MCP registration owns the fixed tool name and per-invocation stage/status. An optional constructor-owned sink receives a newly constructed frozen object with exactly event, tool, outcome, status and stage. No arguments, organization/record IDs, revisions, URLs, headers, tokens, source values, raw exceptions or stack traces are included.
- Stages are an explicit allowlist: scope_check, resolve_binding, service_read, authority_before_snapshot, request_validation, snapshot_load, snapshot_normalize, authority_after_snapshot, revision_check, resource_read, receipt_lookup, source_records_load, source_records_normalize, authority_after_records, worksheet_load, worksheet_normalize, authority_after_worksheet, response_scope, response_serialize. Arbitrary internal stage strings are ignored.
- Service read accepts an optional internal third-argument hook, never a request field. It marks static boundaries without altering validation, authorization, loaders, revisions or returned values. Each callback owns its own observer; no shared mutable stage.
- The MCP callback emits exactly once in finally after its output or error is constructed. Success is set only after JSON serialization succeeds. Existing finite error responses and authentication challenges remain unchanged.
- Hooks are synchronous, never awaited, and isolate thrown or rejected sink failures. Remote construction defaults to the existing Node JSON console convention; HTTP/local service callers remain silent unless explicitly wired. No new dependency, route, environment switch or persistence schema.

## Files, plan and tasks

1. Extend server/defiant-evidence-mcp.js registration/handler options, static stages and terminal emission.
2. Mark service boundaries in server/defiant-evidence.js and wire the remote constructor sink in server/defiant-evidence-remote.js.
3. Author actual SDK service and remote integration contracts. Preserve current auth behavior and all existing tool schemas.

## Hosted commands and verification

Only hosted Verify: `NODE_ENV=production npm run build`; `node --test server/*.test.js`; `node --test ../scripts/*.test.mjs`; `npm run test:browser -- --project=chromium`. No local test/build/install/model execution.

Contracts cover actual SDK receipt success, missing receipt404, stale revision409, failed snapshot503, failed source resolver503, revoked authority, schema rejection without event, throwing/rejecting sink isolation, serialization failure, concurrent stage isolation, exactly one event per executed callback, static event keys and private sentinel exclusion. Remote contract verifies the injected sink receives the same safe event through real OAuth+SDK plumbing.

## Boundaries and acceptance

Always retain current membership/revision checks, error redaction and finite tool inventory. Never include source data or identifiers in telemetry, create fallback access, swallow application errors, modify354, or claim actual receipt recovery. Independent review precedes push. Fresh hosted canonical artifacts and exact-head green CI precede any root-owned deployment; actual host diagnosis remains separate.
