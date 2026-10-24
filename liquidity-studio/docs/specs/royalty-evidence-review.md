# Royalty Evidence Review

Owner-approved direction: deliver useful tools with current golden data while #374 records missing inputs expected in 2–3 months. This dependency limits claims, not product delivery.

## Outcome
An ordinary ChatGPT question can obtain one coherent factual review for any available source-local selection, see its declared period/currency/amount, inspect available reconciliation and metadata breakdowns, and follow bounded original-receipt links. June compatibility remains intact.

## Implementation boundary
Add a general royalty-review read resource and MCP operation using the existing authorized snapshot and existing selection/reconciliation/metadata functions. No new arithmetic engine, provider/model call, snapshot mutation or inference. Existing June operation remains backward compatible. Require current revision and explicit discovered selection ID; resolve a unique declared source period by exact source hash/currency. Ambiguous or unavailable period must not be guessed. Reconciliation absence is explicit and does not discard supported facts. Preserve original receipt pagination and resolver availability.

Include known-limit codes and #374 reference alongside facts. Describe settlement maturity as not established. Do not join store coverage to a selection as proof of store activity. Never infer missing observations as zero, title equivalence, causality or campaign readiness. Bound response size and use existing current-authority checks.

## Acceptance and delivery
Authored contract coverage: non-June selection produces coherent packet, original June response retained, ambiguous period rejected, stale revision and wrong organization denied, absent optional reconciliation/metadata qualified, response/receipt bounds retained. Hosted checks only. One independent source review, one canonical pipeline and combined release. One fresh natural ChatGPT review question followed by original receipt; compare returned facts against batch-validated evidence. Do not repeat embeddings/classifier experiments. Update final report with actual acceptance and accepted tradeoff.

## Comparison mode
The same operation accepts exactly one of selectionId or comparisonId; optional storeCoverageId applies only to comparison mode. Compose existing comparison/contribution and supplied all/common-period coverage outputs without calculating a new intersection. Validate selected coverage applicability against declared comparison source/period/currency context; otherwise return separately labeled context or reject mismatched selection. Bound contributions and pagination. Follow existing comparison-example links for original cells. Contract tests cover mutually exclusive selectors and mismatched coverage. This mode makes the operation useful for the Spotify comparison as well as March source review.

## API and observable contract
`GET /api/studio/defiant-evidence/:organizationId/royalty-review` and `defiant_royalty_evidence_review` share the existing authenticated read service. Ordinary object input: current `revision`, exactly one `selectionId` or `comparisonId`, optional `storeCoverageId` only with comparison, and offset/limit. IDs are discovered using existing selection/comparison/coverage tools; titles do not authorize identity joins. No new query, model, embedding, budget, storage or activation operation.

Selection offsets are bounded to 500000; comparison offsets to 10000; limit 1–100 defaults to 25. Response UTF-8 JSON is capped at 262144 bytes; oversize fails without partial success. Invalid input is 400, missing product 404, stale revision/ambiguous source period/inapplicable coverage 409, invalid snapshot or oversized response 503. Existing current authority is checked before and after asynchronous loading.

Selection facts retain distinct selected and entire-source-period amounts. Reconciliation and metadata are unchanged existing views, including their source-defined units and sample links. Optional absent products are explicit. A selection does not inherit store coverage merely because it shares a source. Comparison facts retain whole-dimension summary separately from selectedStore.group; normalized coverage supplies existing allPeriod/mutuallyObserved views without another calculation or intersection. Paged contributions retain existing order and provide bounded original-example follow-ups. Empty examples are unavailable; example cells never imply complete group receipts. New view omits ambiguous legacy settlement boolean and reports `not-established`; old responses remain intact.

Example (invented): selection `song` in February reports USD 3 while its source period reports USD 8. Comparison `annual` reports dimension USD 10→8, while explicitly selected `coverage_one` binds store group USD 12→7. These are different grains, never competing answers to the same total.

## Source map and implementation sequence
1. `server/defiant-royalty-review.js`: finite request validator and pure composition of normalized evidence, existing reconciliation and metadata views.
2. `server/defiant-evidence.js`: resource validation and bounded response under existing current-authority/revision gates. No normalizer or snapshot hash change; June branch unchanged.
3. `server/defiant-evidence-http.js`, `server/defiant-evidence-bridge.js`, `server/defiant-evidence-mcp.js`: one resource/tool via existing paths. Existing 22 tools retained, 23 total.
4. `server/defiant-royalty-review.test.js`: invented signed comparison/selection/proof/metadata fixtures; matching existing outputs, receipt follow-up, invalid scope/selector/stale/ambiguous period, current revocation and actual service response cap; HTTP adapter and actual SDK equality.
5. Existing MCP, bridge and remote test files: exact inventory update, private bridge read and real Google/OAuth SDK grant positive/other-scope/revocation controls. Existing June assertions retained.

## Validation, operations and rollback
Author meaningful contracts now; execute only hosted Verify. Existing workflow commands include `node --test server/*.test.js`, `node --test ../scripts/*.test.mjs`, `npm run test:backwards`, `npm run qa:loop`, production build, Chromium browser suite, Google/Firestore emulator and Docker checks. No dependency or workflow changes. Keep generated bundles from the exact hosted source artifact; final checks must pass before release. Runtime adoption is separately reviewed and uses the existing immutable image/traffic process. Rollback restores prior reviewed image/traffic; no data migration or config change is introduced. No local test/build/model run is part of source preparation.

Actual acceptance: one fresh ordinary business conversation can review an existing March selection and a supplied store comparison, then inspect a returned original receipt. Verify actual values and limitations against pinned retained evidence; do not feed expected numbers, IDs or tool names into the question. #374 remains the accepted missing-input limit, not a reason to withhold supported facts. No classifier rerun or new semantic embedding is required.
