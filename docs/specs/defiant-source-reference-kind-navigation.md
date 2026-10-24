# Source-reference kind navigation

## Objective and contract
Actual host exploration found original receipts counted but hidden behind hundreds of lexically earlier comparison references. Add `kindNavigation` to available source-evidence responses: one entry for each of the five existing kinds, with `{kind,count,followUp}`. For present kinds, followUp is `{resource:'source-evidence',sourceHash,revision,offset,limit}` locating the first contiguous sorted block; limit is `min(25,count)`. Absent kinds have count0 and followUp:null. Register-unavailable responses use kindNavigation:null, preserving unknown versus empty. Links navigate existing reference rows; receipt-example rows retain their receipt followUp, selections and audience definitions retain their original-cell links. No new references or cells are synthesized.

Keep existing rows, lexical order, counts, offsets, total, revision, scope and old fields byte/value-equivalent. Navigation is derived from actual sorted rows, not kind enum order, dates, identifiers or private data. Link limit never crosses a kind boundary on its first page. Existing source-evidence nextOffset remains generic full-reference pagination. Response262144B/reference24400 caps still apply to complete output. Same authorization/revision validation applies when a link is followed. No new schema version or tool inventory.

## Commands and structure
Source: liquidity-studio/server/defiant-source-evidence.js; existing source service/HTTP tests in defiant-source-evidence.test.js and defiant-source-evidence-http.test.js; actual remote SDK contract in defiant-evidence-remote.test.js. Public spec: docs/specs/defiant-source-reference-kind-navigation.md.
Hosted Verify only: `cd liquidity-studio && node --test server/*.test.js`; `cd liquidity-studio && npm run build`; `cd liquidity-studio && npm run test:browser -- --project=chromium`. No local suite/build/install/model execution. No dependencies or CI changes.

## Style
Use existing finite arrays, object literals and pure helper style: `follow('source-evidence',{sourceHash:q.sourceHash,offset,limit:Math.min(25,count)})`. Returned links are data, never authority. All examples/fixtures invented.

## Tests and success criteria
- Many comparison rows preceding receipts: navigation opens the exact receipt block and its real receipt followUp without scanning comparisons; row ordering/pagination unchanged.
- All five kinds, absent kind and unavailable register remain distinct; bounds survive added metadata.
- HTTP service follows link with same scope/revision; no source-record or worksheet loader runs for navigation.
- Actual authenticated OAuth SDK obtains navigation, follows source-evidence page, then actual receipt tool; one existing served receipt matches. No provider embedding/search needed.
- No caller-selectable authority or arbitrary URL; unknown fields/stale revision continue rejection.

## Plan and tasks
1. Add finite navigation after existing sort, before bounded serialization.
2. Author helper/service/HTTP and actual SDK regression contracts, retaining existing assertions.
3. Review exact base-relative diff independently; commit/push/hosted verification only after root authorization.

## Boundaries
Always preserve current order, source hash, revision/auth fences and output caps; retain honest counts versus original-cell availability. Ask root before broadening source scope or deployment, already-authorized narrow implementation needs no new user permission. Never hardcode operational offsets/IDs, fetch cells in navigation, run local suites/models, or alter runtime/CI before review. Actual host receipt acceptance remains a later requirement.

No open design questions.
