# Shared evidence-review decision card — next implementation delta

Status: authorized next slice under the existing medallion decision spec and owner gold requirements. Planning only; no source change, new PR, CI, publication or adoption. Keep PR349 and its combined release frozen. Parallel source preparation in a separate worktree is authorized. No push, CI or new release until that release is accepted; no additional planning approval is required.

## Problem and outcome

The June factual packet supplies facts, lineage, coverage qualifications and missing evidence, but its generic nextWork does not yet present one inspectable decision. Add one shared card answering: “What evidence review should we do next, why, and what would resolve it?” It prepares a data-review action; it does not recommend or execute promotion, contact, licensing or spending.

Reuse the existing June review resource/tool and current store-coverage product. Do not introduce another datastore, agent executor, forecast, opportunity score or parallel arithmetic. Studio and MCP receive the same service-produced card. A factual brief remains available when this particular review action lacks supporting coverage.

## Minimal typed response delta

Add an optional `decisionCard` to the existing June packet, with a versioned schema:

- `schemaVersion: 1`; `purpose: 'reporting-coverage-review'`; `readiness: 'qualified'` only when a matching coverage product provides an absent observation in the requested June source context.
- `datasetRevision`: exact packet revision; `selectionId`: existing finite selection; `storeCoverageId`: existing finite matching product. Source hash/currency/month must match the selected period. Store-period evidence is explicitly not selected-recording/store activity.
- `action`: finite kind `prepare-evidence-review`, plus service-authored text: prepare a request for comparable refreshed exports and delivery/as-of clarification for the observed absent store-period entries. `execution: 'not-executed'`. This is request preparation, never an assertion of provider failure or missing expected delivery.
- `evidence`: finite typed references to the existing store-coverage product, comparison and permitted original receipt follow-ups, each carrying the exact revision and server-resolved IDs. Include source hashes/periods already returned by those products. Never accept arbitrary URLs, object keys, paths or client-invented evidence IDs.
- `hypothesis`: `status: 'untested'`, `origin: 'service-authored-investigation-hypothesis'`; text states coverage or posting-maturity differences may explain part of the supplied reported-amount difference. It does not assert causation, equal maturity or current listening decline.
- `cost`: `{status:'unknown', kind:'analyst-effort', amount:null, currency:null}`. No fabricated dollar/time estimate, zero-cost claim or authorized spend.
- `successMeasure`: `{kind:'evidence-reconciliation', status:'not-assessed', criteria:[...]}`. Criteria: obtain source-backed clarification of delivery/as-of and account scope; establish whether new periods are comparable; reconcile revised source amounts and retain provenance; distinguish absent observation from a confirmed observed zero. A clarification may resolve the investigation even without new rows; it does not automatically enable commercial action.
- `reviewDate`: `{status:'unset', value:null}`. No inferred deadline or commitment.
- `limitations`: supplied-source coverage only; expected delivery unknown; posting windows are whole-source-file profiles, not store-specific; positional pairing is not calendar/maturity equivalence; no provider diagnosis or ROI claim.

Do not add client inputs for readiness/approval, amount/date defaults, or free-form assumptions in this slice. Do not add a mutation API to save a brief. Cost/date remain explicit unknowns. A later bounded operator-authored brief can be a separate increment if persistence is needed.

If matching store coverage is absent, or contains no absent observation for the selected June context, return `decisionCard:null` with a finite `decisionCardUnavailableReason`, while preserving the existing factual brief and receipt navigation. Do not manufacture a generic investigation for every selection. For a matching product, the card may reference its other absent periods as contextual observations, clearly separated from the selected June period.

Keep `commercialReadiness` separate and not-ready until current comparable demand or dated buyer transactions, validated relevant identities, offer economics and action authority exist. Data-review readiness does not satisfy those gates. No synthetic fallback.

## UI delta

Add a “June evidence review” entry from an eligible June selection in the existing evidence explorer. Render one card with Action, Evidence, Hypothesis, Cost, Success measure and Review date; show Unknown/Unset plainly. Keep factual amount, metric/currency/period and source provenance visible alongside the card.

Use existing scoped request, abort/epoch, revision and URL-selection fences. Preserve the parent selection/page through evidence follow-up and Back/reload. Navigate to the existing original-record receipt views. For store coverage, show the same qualified all-period and mutually observed arithmetic already supplied by the service; do not recompute in the browser. Provide contextual receipt links only where records exist: an absent observation has no fictional original row to open. Display the pinned source/product provenance instead.

MCP returns the same typed decision card and follow-up references in the existing June tool response, with text fallback. No new tool solely for presentation and no embedded-app acceptance claim without an actual host run.

## Implementation tasks (source preparation may run in parallel; publishing after PR349 acceptance)

1. Extend the approved June decision spec with the finite optional card and explicit null/unavailable cases. Reuse existing product semantics and limits.
2. Add a pure service composition helper bound to the already normalized current revision. Preserve authorization checks before and after reads and all finite request guards. Do not change snapshot content or require another data upload for this derived card.
3. Add Studio selection entry/card and reuse receipt navigation, revision fences and compact layout. Run official Svelte source checks; no local build/test execution.
4. Author meaningful service/HTTP/actual SDK contracts and one hosted browser journey. Use invented fixtures only; no private source hashes, amounts or CRM values in Git.
5. Independent review, exact-head hosted CI, then a separately coordinated release. Do not trigger a second release or canonical cycle for frozen349.

## Acceptance

- Same revision and finite selection yield semantically equal service, HTTP and actual SDK/MCP card fields; presentation does not change amounts, evidence, readiness or unknowns.
- Matching absent June observation yields the qualified data-review card; present observed-zero, no matching coverage, wrong source/currency and non-June selection never masquerade as that absence case.
- Stale revision, revoked authority after read, wrong organization and arbitrary identifiers fail with no private payload. Card references resolve within the same authorized revision.
- Every evidence link resolves to an existing product/receipt or explicitly reports unavailable. No row citation is fabricated for absence. Multiple contextual absent periods retain their own hashes and scope.
- Hypothesis remains untested; cost remains unknown; date remains unset; success remains not assessed; commercial readiness remains separate. No unsupported ROI, current demand, provider failure, rights or activation claim.
- Actual hosted browser journey opens eligible selection → card → original receipt → back/reload, preserving scope/revision/selection/page; compact layout and escaped text remain usable.
- Actual authorized production acceptance after release observes the card and its receipts, plus one native MCP read of the same packet. Source/CI success alone is not runtime acceptance. No external model call is required.

## Basis

- Existing approved `docs/specs/defiant-medallion-decision.md`: one purpose-specific decision, immutable evidence, independent commercial gates.
- Private RFC002 lines108–114: evidence-linked review and next action; rights uncertainty does not erase factual observations.
- Private `Commercial-Gold-Input-Matrix.private.md` lines39–50: review action, hypothesis, unknown cost/date and observable reconciliation success.
- Current implementation: `server/defiant-evidence.js` June packet; `server/defiant-store-period-coverage.js`; existing evidence explorer and receipt navigation.
