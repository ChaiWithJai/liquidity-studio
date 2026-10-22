# Spec: Curated change explanations and audience readiness

## Objective and capability map
`explain-change` and `audience-readiness` independently extend the existing private evidence service. Both depend on snapshot validation and current organization authority. Build order: normalizers, scoped service resources, HTTP/MCP adapters, invented contract tests. Existing owner implementation authorization applies; neither capability enables activation.

## Assumptions and interfaces
Comparisons are supplied curated arithmetic products, not causal explanations. Each declares a source system/account, one dimension (sourceSongId/store/country/salesType), currency, equal-length disjoint sorted month lists (1–24 each), and per-month hashes matching existing earnings rows. Period basis is explicitly filename-declared or content-verified. Up to 100 comparisons and 10,000 groups across the snapshot. Each group has an opaque ID, source-local key (nullable for unresolved), label, signed decimal before/after amounts and bounded example logical CSV record references. Group totals must exactly reconcile both sides to the existing monthly amounts. Returned before/after/delta/decrease/increase are derived with scaled BigInt, never floating-point. Ranking is absolute arithmetic contribution, never opportunity value. Examples do not claim full source selection.

Audience products are supplied definitions, not computed customer membership. Up to 200 definitions carry source hash, worksheet/cell locators, rule/scale/offer text and finite required/observed evidence labels; missing labels are derived. Observed labels are producer assertions, not independently verified facts. Population computation, consent verification and activation authorization remain false regardless of input booleans.

Optional fields are omitted from normalized snapshots when absent, preserving old revisions. New products participate in revision hashing when present. All details require revision and server-issued IDs. Missing products return empty lists and unavailable details. No synthetic fallback.

## Structure and style
ES modules in liquidity-studio/server; normalizer helper, existing evidence service, HTTP and MCP adapters. Tests use node:test and invented fixtures, e.g. `assert.equal(result.summary.delta, '-0.01')`. Public docs contain no private amounts, identifiers, paths or records.

## Plan and tasks
- Normalize bounded products and exact reconciliation; reject malformed decimals, periods, duplicate IDs/keys, mismatched hashes/currency and invalid locators.
- Add paged comparison listing/detail and audience listing/detail resources using existing authority/revision lifecycle.
- Register finite HTTP and MCP contracts with no caller paths and no action capabilities.
- Author tests for arithmetic, drilldown, old compatibility, bounds, stale revision, revocation and protocol surface.

## Commands and testing
Hosted only: `cd liquidity-studio && node --test server/defiant-evidence-products.test.js server/defiant-evidence-mcp.test.js server/defiant-evidence-http.test.js` plus repository automatic Verify. No local execution/build/install/model work. Independent source review before push; exact-head CI before merge.

## Boundaries and success
Always preserve organization authorization before and after loading, revision checks, private source ownership and bounded pages. No new dependencies, model calls, deployment, GCS access or runtime binding. Never infer identity equivalence, listener/customer relationships, causal lift, segment membership or rights/consent from descriptions. Success is usable reconciled products with qualified source-reference drilldown and tested denial paths; real artifact publication and host acceptance remain separate required work.
