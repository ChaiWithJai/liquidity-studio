# Spec: June catalog evidence and the next useful decision

## Objective

An authorized operator asks: “What happened in June 2025, what can we substantiate, and which catalog item should we investigate next?” Defiant returns one coherent review packet, lets the operator inspect the original contributing data, and identifies the specific evidence needed to progress toward an audience or commercial action. Success is a useful, auditable next decision with explicit uncertainty. It does not require fabricated buyer data, opportunity scores or a model-generated narrative.

The original five report questions have not been recovered/confirmed in this scope. Preserve them as outstanding requirements; this bounded review question is an implementation slice, not a replacement for those five.

## Bronze: coverage before interpretation

Add a constructor-owned, immutable, organization-scoped inventory projection. Entries carry opaque source ID, source system, media/file format, content hash, declared versus validated period, metric and units, record/sheet/member coverage, extraction status, supported products and missing-field labels. Distinguish intake completeness, parsing completeness and analytical coverage. A date in a filename or a filesystem modification time alone does not prove business period or complete intake.

Expose a finite coverage/search resource: allowlisted period, source-system, format and bounded text query over approved metadata; bounded pagination with revision. Embedding-assisted retrieval is part of the intended bronze search capability. Introduce it as a versioned index over approved source metadata or explicitly permitted document chunks, retaining source/member/cell provenance, chunk version and embedding model/version. Keep a deterministic metadata/filter path usable when the embedding index is absent. Similarity ranks retrieval candidates, not truth, completeness or business opportunity. Model execution and any embedding publication require the permitted hosted route and reviewed resource limits; this specification does not run or provision them. Search identifies sources and available products, not arbitrary filesystem/GCS paths. Do not expose credentials, local paths, raw customer rows or unredacted financial documents in public docs or search snippets. Preserve original source facts separately from derived summaries.

For June 2025, show the inventory-backed sources, supported amount/identity analyses, unsupported fields and missing joins. Explicitly distinguish sales period, posting date and export/as-of date. The newly supplied discussion includes Spotify reporting-coverage and interpretation claims. Treat them as supplied-unverified assertions with source attribution, rather than importing the pasted narrative as validated analytical output. Validate absence of source rows separately from expected-delivery incompleteness: an empty store/period observation alone does not establish a missing provider delivery or zero underlying activity. They must not alter totals, chronology, identity joins or rankings until original source, metric definition, period, scope and identifiers are validated. Artist-level listeners, track streams, distributor reported amounts and CRM labels are different grains; no silent conversion or cross-provider join.

## Silver: validated reusable evidence

Reuse the fourteen current evidence capabilities and the same organization/revision lifecycle. Earnings and selections provide signed reported amounts and original cells; identity review preserves separate source-local IDs/releases; comparisons provide exact arithmetic contributions; audience definitions distinguish workbook text from analyst evidence gaps. Full supplied selection lineage and bounded comparison examples must remain visibly different.

Validation promotes only the fields actually established. Source references and deterministic transformations retain immutable version/hash lineage. Period-profile evidence can upgrade the period qualification only through a deliberately reviewed new snapshot; posting-window differences remain. Identity equivalence requires evidence, not matching title alone. Missing buyer identifiers, transactions, consent or rights do not prevent factual analysis, but constrain the actions supported by that analysis.

Scenarios are conditional arithmetic with declared inputs, formula/version, currency, time horizon and exclusions. Reuse domain interfaces where their contracts fit actual data; do not reuse synthetic demand, conversion, royalty-rate or rights assumptions as measured inputs. An absent validated scenario input yields a missing-input response, or an explicitly user-supplied hypothetical assumption. It never silently becomes zero, an estimated customer population or a trained forecast.

## Gold target and first implementation slice

The target gold product is a decision an operator can execute and measure: which recording and market should receive a small promotion, supported by action, evidence, expected outcome or testable hypothesis, cost/exposure, success measure, and review date. Historical statement diagnostics alone do not complete that target. Current demand, validated identity and campaign economics remain required before a commercial recommendation can be published.

The first implementation slice is **June catalog review**, a source-backed factual foundation for that decision product. Its acceptance does not close the full gold target. Given a server-issued source selection or identity-review group and the snapshot revision, compose:

1. The review question, source scope, currency/period and coverage qualification.
2. Exact reported amount and its source-selection lineage; separate IDs/releases if an identity group was selected.
3. Available reconciled comparison context, explicitly distinguishing a multi-month comparison from a June-only comparison. Do not manufacture a June trend from a broader window.
4. A next-work recommendation supported by the actual evidence: inspect a material contribution, reconcile a source identity, or request a specified missing field/source. Rank review candidates by an explicit factual measure, such as absolute reported amount within currency, not unsupported commercial upside.
5. An audience-readiness section only when a supplied definition is deliberately selected. Display the definition, proposed offer and missing linkage evidence. Its association with a catalog item is a review hypothesis, not a buyer relationship.
6. Available next steps and their evidence gates. Inspection and data-quality work are enabled now; purchasing, messaging, licensing and activation remain separate actions requiring their actual inputs and authority.

The packet includes structured facts, calculations, supplied claims, hypotheses, missing evidence and allowed read-only follow-up links as separate fields. Every factual assertion references existing source/selection/cell identifiers. Deterministic arithmetic is not labelled model inference. A later optional model summary must preserve those distinctions and citations, and cannot create authorization or complete absent joins.

## Readiness is specific to the intended use

Each gold packet declares `purpose`, `readiness` (`ready`, `qualified`, or `not-ready`), evidence requirements, observed support, missing inputs and permitted read-only next steps. Derive readiness from validated product facts and current authority; never accept a caller-supplied ready/approved flag. Readiness is not a single global score.

| Purpose | Can be ready with | Must remain qualified or unavailable when |
| --- | --- | --- |
| Factual June period brief | Validated supplied-period amounts, source scope, lineage and explicit coverage | Completeness remains unknown: brief may report supplied statements but cannot claim complete underlying performance |
| Reporting exception review | Validated coverage observations and a documented expected-delivery contract | Missing rows alone cannot prove a provider failed to deliver |
| Catalog identity investigation | Source-local IDs, amounts and original records | Recording equivalence is unreviewed; keep identities separate |
| Conditional scenario | Validated observed inputs plus explicit hypothetical assumptions/formula | Needed parameters are absent or synthetic defaults would be substituted |
| Current promotion or audience activation recommendation | Current comparable demand or transactions, verified relevant joins, economics and required authority | Historical statements, supplied segment labels or proposed offers alone cannot support the action |

A factual period brief may therefore be ready while a promotion recommendation is not. The single gold experience presents the ready result first and names the exact evidence needed for any unavailable next purpose; commercial uncertainty must not disable factual insight or source inspection.

## Interfaces and architecture

Extend `liquidity-studio/server/defiant-evidence.js` and its finite HTTP/MCP adapters; reuse pinned GCS provider and source/worksheet readers. Add a compact curated inventory only after producer-side validation. Keep raw bronze archives out of the application image. Current membership is checked before and after asynchronous reads, with immutable revision and parent-ID echoes throughout UI navigation. No caller-supplied buckets, hashes, paths, SQL or arbitrary code.

Gold requests use finite server-issued IDs and revision; any scenario assumptions use a separately bounded typed contract. All packet components must come from one revision or fail as stale; no mixed-snapshot packet. Authenticated MCP serves the same service, not a second store or browser-token extraction. Lack of private host authorization is an explicit unavailable state, never a reason to expose real data on the synthetic endpoint.

Source locations: `server/defiant-evidence*.js`, `src/components/defiant/DefiantEvidenceExplorer.svelte`, existing evidence controller and URL state. Tests belong alongside server modules and `tests/defiant-evidence-explorer.spec.js`. All public fixtures are invented; actual source values, object pins and operational receipts remain private.

## Archive behavior and abandoned approaches

- Preserve synthetic assets and acceptance receipts in a recoverable historical state; remove active discovery/navigation and prevent automatic fallback. Do not delete real data or broaden access.
- Drop synthetic portfolio recommendations as the active product; they established interface mechanics, not real catalog intelligence.
- Drop a universal title/album join: retain source-local identifiers and explicitly reviewed relationship candidates.
- Drop “more retrieval equals better inference” as a success claim. Measure supported answers and traceable decisions separately from future model evaluations.
- Drop a broad lakehouse/platform rebuild, new paid architecture, and Databricks-service dependency for this proof of concept.
- Drop inferred audience populations, consent, demand-to-revenue conversion and rights approvals from labels or incomplete metrics.

## Implementation tasks and acceptance

- [ ] Archive: inventory active synthetic entry points/configuration; preserve rollback pins; disable active offering through reviewed changes; verify real evidence cannot fall back to synthetic data.
- [ ] Bronze producer: create private coverage projection from retained manifests, qualify business periods and incompleteness; record source hashes and transformation version.
- [ ] Bronze service/UI: bounded coverage/search with a versioned embedding-index interface and deterministic metadata fallback, visible missing fields and source grain; reject unsupported filters, cross-scope reads and stale revisions.
- [ ] Silver qualification: deliberately version reviewed period metadata; preserve financial reconciliation, posting maturity, identity ambiguity and exact source-cell links.
- [ ] Gold service: compose one June review packet using current products, same revision, finite IDs, explicit ranking and per-purpose readiness/missing-evidence gates.
- [ ] Gold UI: one review journey with source drilldown and return state; show facts versus hypotheses and distinguish complete lineage from examples.
- [ ] MCP/auth: current authorized user authority, finite coverage/review tools, actual client consumption of the real packet and denied-scope verification; no public private-data transport.
- [ ] Hosted contracts: response bounds, missing metrics, mismatched grain/period, unverified Spotify claim exclusion, same-revision composition, revocation, source provenance, archival fallback denial and useful missing-input scenarios.
- [ ] Actual acceptance: BrowserOS Neo June question → review packet → original cells → retained back/reload; compact/keyboard usability; actual authorized MCP read of the same revision. Record what was observed separately from CI.
- [ ] Question/evaluation follow-up: recover the original five questions; preserve each question verbatim and map its supported facts/missing evidence. A future approved model comparison needs actual same-configuration executions and citation assessment, not retrospective claims.

Hosted verification commands (never run locally under current constraints): `cd liquidity-studio && node --test server/defiant-evidence*.test.js`; `cd liquidity-studio && npx playwright test tests/defiant-evidence-explorer.spec.js`; repository automatic Verify supplies build/canonical checks. Independent source review precedes push; exact-head green CI and zero unresolved threads precede merge. Actual publication, archive state, authentication and host behavior require their own observed receipts. No acceptance boxes are checked by this specification.
