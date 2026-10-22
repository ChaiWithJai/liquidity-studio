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
