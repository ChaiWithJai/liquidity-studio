# Defiant real-data evidence provider

Status: implementation draft under the owner's real-data medallion/MCP goal. No runtime mounting or private-data publication. Related: #328; private RFC 002.

## Objective and boundary

Provide exact, inspectable curated earnings and source receipts through a read-only service. Keep the synthetic domain normalizer unchanged. The host owns authenticated identity, organization binding and a bounded integrity-checked loader. This module never accepts caller paths, fetches URLs, invokes models or approves activation/rights.

The service constructor owns organizationId, authorize(actor, scope) and loadSnapshot(scope). A read checks authority before and after asynchronous loading, normalizes a detached allowlist, and derives a content revision. Manifest exposes counts/coverage; earnings is paginated; receipts require the revision and an opaque ID returned with earnings. Receipt examples are explicitly not a complete aggregate proof.

## Product schema

schemaVersion 1, organizationId, coverage, months[], receipts[]. Each month has month YYYY-MM, currency, decimal-string amount, metric source-total-earned, sourceHash and up to twenty receiptIds. Each receipt has an ID, sourceHash, source member label, logical CSV record number and bounded string cells. References must resolve within the same source hash. Unique month/currency rows; signed amounts retained with up to twelve decimal places. No rounding or inferred currency.

## Implementation and validation

Source: liquidity-studio/server/defiant-evidence.js. Contract fixtures: adjacent defiant-evidence.test.js, invented data only. Follow the existing ESM/factory style, with status-bearing errors and structured cloned responses.

Hosted verification command: `cd liquidity-studio && node --test server/defiant-evidence.test.js`. Execute through hosted CI only; no local build/install/test suite. Independent review and applicable exact-head green checks are required before merge.

Acceptance: exact signed decimal preservation, manifest minimization, receipt linkage, current-authority denial/revocation, revision conflict, wrong-scope snapshot rejection, malformed values/duplicate periods rejection, bounded requests and no caller-controlled file access.

## Remaining full-goal work

This is a service slice, not the completed data product. Integrate the private loader with configured artifact pins, protocol registration and authenticated mounting, complete aggregate lineage, change explanations, audience readiness, actual private readback and UI receipts. Continue broader silver transformation and identity reconciliation, the five-question report, retrieval/model evaluation and human feedback. No full-goal acceptance follows from these contract tests alone.

The accompanying `defiant-evidence-loader.js` pins a server-owned object key, generation, byte size and SHA-256. It consumes an asynchronous byte stream up to an eight-MiB product ceiling, checks generation/length/digest before UTF-8 decoding and JSON parsing, and rejects cross-scope products. The accompanying `defiant-evidence-gcs.js` accepts an existing server-owned bucket and opens a generation-qualified CRC32C-validated stream without automatic decompression, with a bounded read deadline. Its returned generation echoes the request pin; it is not independent remote metadata evidence. Actual readback must verify the pinned bytes and hash. Neither module is mounted, a new storage credential, or a public endpoint.

SDK reference: https://googleapis.dev/nodejs/storage/latest/File.html. Contracts cover option forwarding and stalled-stream destruction with invented streams; they do not prove live GCS access.

## Private MCP protocol

`defiant-evidence-mcp.js` registers `defiant_evidence_manifest`, `defiant_catalog_earnings`, and `defiant_show_receipt` on an MCP server. Its standalone protocol factory uses the existing SDK and response mode; it does not create a socket or mount onto the anonymous synthetic endpoint. The host supplies a verified resolver, organization binding and actor on each call. Response scope must match the requested organization, and the evidence service rechecks current authority around loading. Exact receipt IDs require the matching content revision. Both structured and text clients receive the authorized product; failures expose only a generic status.

The SDK client contract uses an invented dataset and explicit fixture identity. Actual credential verification, configured GCS pins, private host mounting and live readback remain integration work, not claims established by this fixture. The three tools are the first serving layer; change contribution, full selection receipts, identity joins and audience readiness remain required by the full goal.

## Complete selection locators

Optional `selections` contain source-local ID/label/hash, declared decimal amount/currency and strictly increasing logical CSV record numbers. At most 2,000 selections and 500,000 total locators are accepted. `defiant_list_evidence_selections` returns bounded summaries; `defiant_inspect_evidence_selection` requires the current revision and returns at most 100 locators per page. These endpoints neither fetch arbitrary source paths nor claim to recompute totals. Full cells remain a separate pinned-partition integration.

Revision migration: normalizing absent selections to an empty array changes the content revision of older products. Clients must refresh the manifest; previously issued revisions correctly conflict rather than silently binding to a changed product. SDK contracts exercise discovery, summary minimization, locator pagination and stale revision rejection with invented fixtures.

## Source-cell page boundary

`defiant_read_selection_receipts` reads a bounded page from a revision-pinned selection through an optional server-owned `loadSourceRecords` resolver. That resolver receives only the constructor scope, selected source hash, known record numbers and revision. The service requires the returned receipts to match the exact source hash, order and count, validates bounded cells, and rechecks authority after the asynchronous read. Missing resolver or mismatched evidence returns unavailable.

This interface does not establish live source integrity by itself. The host must resolve each hash to a configured immutable partition, validate its bytes, and preserve original cells. Source-partition packaging/mounting and actual readback remain outstanding. Hosted fixtures exercise the protocol and rejection paths; they are not private-data runtime acceptance.

`defiant-source-records.js` supplies the source resolver from a server-owned registry of nonoverlapping source-hash/record ranges and immutable object pins. Each shard contains at most 1,000 contiguous records; selected artifacts total at most 32 MiB per request. The existing pinned loader verifies bytes before parsing. The resolver validates the whole shard's record numbering and source association; the service validates selected cells and current access. Source-to-derived cell equivalence requires producer reconciliation, separately from artifact hash verification. The resolver enforces an overall deadline of at most 30 seconds across sparse multi-shard reads, aborting the active stream and preventing subsequent shard opens. This assumes the configured GCS opener returns a stream immediately; it cannot cancel an arbitrary unresolved custom opener promise or preempt synchronous parsing. This implementation is not yet mounted.
