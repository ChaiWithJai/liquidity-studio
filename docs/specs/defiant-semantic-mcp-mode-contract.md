# Explicit semantic start and page MCP tools

Supersedes the unshipped root-union proposal. Official OpenAI Structured Outputs documentation rejects root anyOf, so SDK acceptance alone is insufficient host portability evidence. This does not establish the cause of the observed resource_read400.

Preserve the existing defiant_search_retained_sources object schema and all successful/failed legacy service behavior. Its description recommends keyword default and directs semantic callers to two new tools. No mode union, no removal or renaming of existing tools.

Add defiant_start_semantic_source_search: ordinary strict object, required revision/query/idempotencyKey, existing optional flat exact filters, no mode/sessionId/offset/limit. Description states no nested filters, omit filter fields for no restrictions, first page0/25, stable key and identical-argument recovery. Constructor-owned fixed mode semantic maps to the unchanged retained-sources service.

Add defiant_page_semantic_source_search: ordinary strict object, required revision/sessionId/offset/limit (bounded0..256 and1..100), no mode/query/key/filter fields. Constructor-owned fixed mode semantic-page invokes unchanged service and cannot dispatch an embedding.

Both retain existing bound/unbound organization semantics, current authorization, revision/index binding, durable reservation, same-key replay, no automatic retry, and finite diagnostics. Inventory becomes22; existing20 unchanged. New start keeps existing optional filters rather than coercing null or manufacturing values. This is MCP ordinary-object compatibility, not a claim of complete OpenAI strict-mode schema compliance or actual ChatGPT acceptance.

Authored actual SDK contracts inspect listTools top-level object/properties/no anyOf and required fields; reject omitted start fields and forbidden pagination before resolver;26 inventedroots empty-filter start first25→page25→same-key replay with one embed; same-session and scoped boundaries; retain legacy mode successful start/page compatibility. All exact inventory assertions updated deliberately. No provider/model/runtime request or budget reset. Hosted Verify only, no local application execution.

Public source scope: server/defiant-evidence-mcp.js, relevant existing MCP/remote/semantic inventory and integration tests, public docs/specs/defiant-semantic-mcp-mode-contract.md. No service/HTTP/UI/dependency/data change. Fresh generated bundles only after hosted verification. Root+peer source review before publication; actual host tool refresh remains later explicit acceptance.
