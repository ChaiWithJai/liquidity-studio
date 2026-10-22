# Observed answer evidence checks

Status: source-only first vertical slice. No model execution, private external transmission, local build/test, or measured inference improvement. PR351 remains separate. Existing owner evaluation goal authorizes implementation.

## Purpose and prior art within this product

Retained Progressive-Evidence-Readout.md distinguishes deterministic evidence change from measured model improvement. evaluation/Model-and-Evaluation-Decisions.md requires arithmetic/citation gates before optional semantic assessment;18 authored development examples are not observed failures or human ground truth. Preserve those boundaries.

Existing DurableTelemetry persists campaign generation/marketer actions and backpropDataset; ObservabilityEngine.classifyFeedback keeps preferenceLabel:null. Their campaign evaluator and humanFinalVersion do not validate financial evidence. Reuse DurableStore and current Studio organization/strategy authority, but use a dedicated versioned observation collection so private answers do not silently enter campaign feedback exports. Reuse createDefiantEvidenceService.read; no direct GCS/archive paths, SQL, new telemetry infrastructure or model dependency. Existing17 MCP tools and read-only grant scope remain unchanged.

## First vertical slice

Explicit Studio Google capture, list, detail and one separately attributed correction. Capture1–5 exact decimal assertions against selection.amount or a unique earnings items[] pair selected by month+currency. Optional curated receipt.cells existence check. No whole-answer correctness score, causal inference, model judge or implicit human label.

Request exact fields: idempotencyKey, question, answer, revision, assertions, observedAt, hostLabel, modelId. Nullable metadata is explicitly user-attributed and unverified. recorded creation time/actor/UID/org are server-owned. Input<=64KiB, question<=2KiBUTF8, answer<=16KiBUTF8, host/model<=200bytes, timestamp canonical ISO UTC when supplied. Header/body parsing has64KiB/5s guard; operation deadline30s; abort is checked before and inside the transaction callback. A timeout can race an already in-flight remote commit, so the save outcome may be uncertain. Retry unchanged with the same idempotency key to read back the immutable result; do not promise rollback. No client origin:boolean or app-generated claim accepted.

Assertions contain kind selection|earnings, exact signed decimal string, currency, exact Unicode-codepoint answer span, finite reference, optional receipt. Span must match original answer substring; that does not certify prose semantics or its equivalence to the separately supplied value. Decimal bounds26integer/12fraction, BigInt fixedscale equality, no rounding or float conversion. Currency comparison separate. Missing unique earnings item is unknown, not zero. Invalid request/stale revision/transient read failures reject capture; they are not observations of business contradiction.

Selection reference: selectionId only. Actual source summary id/label/sourceHash/amount/currency/rowCount; period stays unknown in this slice. A later derivation may use only a unique sourceHash+currency earnings join, not filename or invented sourceSystem/account. Earnings reference: month, currency filter, unique items[]; preserve source-total-earned metric and its supplied statement qualification. Numeric equality does not establish final royalties/profit/listening change.

Optional receipt: receiptId+cell name resolves existing curated snapshot receipt. Store sourceHash/member/logicalrecord/cell existence and sourceMatchesFact; qualify as curated example, not newly loaded source-shard integrity and not proof of an aggregate. CSV cells are strings. No arbitrary caller source hash/path/URL. Loader-backed selection/comparison receipts are separate future checks; existing503 conflates unavailable capability and transient error, so do not infer an unknown capability without explicit constructor-owned metadata.

All source reads require same exact evidence revision and organization; current service authority checks remain. Results immutable: original question/answer+SHA, attributed metadata, actor/UID/time, revision, validatorVersion, per-assertion match|mismatch|unknown with typed fact/metric/source qualification and curated locator. Semantic support always unknown, modelExecutionVerifiedfalse. No aggregate 'verified answer' label.

## Persistence and concurrency

Index<=100lightweightentries/org; separately stored record<=256KiB including bounded correction. Reject capacity, never evict. Keys scoped byorg; observationID hash(org,actorID,UID,idempotencyKey). Exact payload hash equality required on replay; conflict409. After maintained current authority, existing record is reread transactionally and returned without requiring currently available evidence. Concurrent initial capture rechecks in final transaction.

DurableStore.transact supports1–8keys/synchronousretryable/4MiBtotal. Final capture uses identity+strategy+index+record. Compute timestamps, IDs and hashes before callback; callback only maintained identity/strategy.assertCurrent and immutable state transition, no awaits or external side effects. ManagedGoogle UID/current token authority checked immediately before commit. External Firebase revocation cannot be atomic with local persistence; state precisely that limitation. Async evidence reads happen before transaction; abort/deadline rechecked in callback. Existing-record replay/list/detail/correction also current-authority guarded. Old results do not reinterpret new snapshots.

One explicit correction comment<=2KiB perobservation, separately attributed actorUID/time. Does not overwrite original answer or checks. 'Submitted reviewer comment' is not independent ground truth or training label. Current scoped access required; no automatic corrections from export, approval, scheduling or reading.

## UI and HTTP

Finite existing evidence namespace /api/studio/defiant-evidence/:org/observations with GET list/POSTcapture; /:observationId GETdetail; /:observationId/correction POSTcomment. Require managedGoogle Studio credential; scoped local/remote MCP access cannot write or read these new observation records. No MCP inventory change.

Evidence explorer explicit expandable panel: observed question/answer and attributed metadata;1–5forms, add/remove, reference/value/currency/unique quote/optional curatedcell. UI does not calculate source arithmetic. Save returns immutable detail; refresh/readback and one correction. Scoped App strategyHost key already includes session/account/org; parent remount plus child revision key aborts/discards stale responses. Outputs escaped, long text wraps, no auto capture. Metadata shown as attributed, not verified execution.

## Authored verification and actual acceptance

Hosted-only meaningful contracts: actual scoped service with DurableStore and strategy; negative12decimal equality/mismatch; currency/periodmissing; stale revision; malformed provenance/spans; actualGoogleHTTP capture/list/detail/correction; ea/er rejection;64KiBbody; provider-unavailable replay; currentmembership revocation; atomic idempotency and immutability. Browser fixture checks explicit capture, add/remove, escaped answer, list/readback/correction,390px geometry/contextremount. Fixture observations are invented and not real model acceptance.

Actual acceptance later uses an explicitly supplied observed answer and exact question/revision, readback and attributed correction. No fabricated earlier baseline. Existing source/API acceptance does not prove actual human feedback or model quality. Owner-selected plainChatGPT/Neo acceptance belongs to separate OAuth delivery; nativeCodex is not a requested gate.

## Preserved subsequent scope

- Additional finite selectors: comparison.summary and group beforeAmount/afterAmount/delta; explain-change comparisonId+offset/limit with local group selection within returned page, no hidden fullscan. storeCoverageId product.allPeriod singular and nullable mutuallyObserved with same amount fields. Posting-window scope remains source-file; absence notzero, expecteddelivery/maturity unknown.
- Loader-backed receipt checks and audience worksheet.sourceHash/cellrefs with example/page/complete distinctions. No formula execution or examples-as-aggregate proof.
- Explicit rounded amounts with declared scale/policy, annotations/uncheckedtext coverage, observation pair comparison samequestionhash, changed model/config treated confounded, historical revalidation availability.
- Hosted model route/privatehandling/execution limits before semantic classifier or inference experiment. Retain actual inputs/outputs/model/config/usage and independentlabels; no falseaccuracy, heldout claim, RLHF or causal guarantee.

First slice is progress toward these requirements, not full evaluation completion.
