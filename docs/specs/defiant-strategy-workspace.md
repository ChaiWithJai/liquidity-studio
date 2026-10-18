# Spec: Defiant strategy workspace

**Status:** Human approved on 2026-10-18. The direct response “Approve spec” approved this specification and the requested planning and implementation without further planning approvals; [approval record](https://github.com/ChaiWithJai/liquidity-studio/pull/222#issuecomment-6253074556). Record the scoped plan and issue-backed tasks before feature code. Runtime operations remain separately coordinated. Existing module: **operator-workflow**. Trackers: [#211](https://github.com/ChaiWithJai/liquidity-studio/issues/211), [#214](https://github.com/ChaiWithJai/liquidity-studio/issues/214); parent [#209](https://github.com/ChaiWithJai/liquidity-studio/issues/209). This feature has its own approval, separate from native access #190.

## Objective

Give a Defiant manager a legible node-based workspace for turning a talent signal, regional route and available people/resources into a saved planning report and an explicitly chosen campaign draft. The complete task is **explore → inspect evidence → follow/compare routes → annotate → save/reopen report → optionally create destination draft**. A useful graph and report must work when every growth metric is unknown. A dashboard of seed scores is not the product.

The [reconciled brief](../plans/defiant/README.md), [model changes](../plans/defiant/model.md) and [illustrative records](../plans/defiant/records.json) supply the scope; they are not implemented services, factual endorsements or permissions. This spec does not repeat their inventory.

### Assumptions and recommended defaults for approval

- Enable this capability explicitly for a separate Defiant organization. Use existing founder/marketer roles and current organization membership: founder enables it; members may research/edit strategy. Brand-restricted material and destination creation still require that brand's current permission. No new executive role or identity service.
- Start with explicit manual evidence links/excerpts and a previewed CSV/JSON owned-data import. Record these as user-reported/imported, not server-retrieved or API-measured. No provider connector, paid model or background scouting is required for the first usable journey.
- Begin with a saved, editable in-app report. No report export format, booking, outreach, scheduling or social publishing is included. A destination is an authorized application brand; any Instagram account label remains unverified metadata until a real connector exists.
- Keep the six regions and supplied relationships available as a clearly labeled demo layer. Demo artists, metrics, catalog access and benchmark statuses never become observed facts or cleared resources. An empty real workspace remains usable.

## Experience and saved behavior

### Explore and understand

The node map is the primary working area. Start with a small region overview and progressively expand a relevant neighborhood. Distinguish region, talent/signal, person/resource and directed relationship types using readable labels, shapes/icons and a small legend. Search, filter, zoom/pan, fit selection, expand/collapse and a focus trail/Back must make a route easy to follow. Avoid overlapping labels and unexplained decorative edges.

Select a node, edge, cluster or path to open one contextual inspector. Show relationship meaning, original evidence, method/time, uncertainty and useful actions there. Provide a keyboard-operable structured list alongside the graph, visible focus and semantic select/inspect/follow-route/annotate/group/add-to-report actions with stable IDs. Humans and agents must not depend solely on canvas coordinates.

Compare routes as ordered, continuous edges with bridge requirements, reasons and missing capabilities. Separate observations from hypotheses/scenarios; show absent metrics as unknown. Do not compute listener totals, success probabilities, replay or chemistry from invented formulas. Resource choices show eligible / needs information / unavailable with current availability, role/location and rights for the intended use. No composite score is required. An unready plan can be saved with its unresolved reasons; unverified resources cannot be presented as cleared usable media.

### Annotate, report and resume

Notes, evidence links, labels, questions, hypotheses and decisions can target a node, edge, named working cluster or selected path. Preserve author, timestamps and source/target revisions. Interpretations never overwrite source observations. Save named views/selections and layout separately from business relationships.

A stable URL restores useful graph focus, view/filter context and report selection across reload and Back/Forward. Unsaved notes/report edits have ordinary dirty-state protection. Saves show immediate pending/saved/error feedback; failures retain editable work. Concurrent revisions produce a useful conflict rather than silently replacing another person's interpretation.

Assemble chosen findings into an editable report: thesis/talent, focused saved graph view, selected routes/alternatives/evidence, partners/resources and reasons, proposed objective/deliverables/owners, rights/availability, open questions and decisions. Retain a snapshot plus references to selected graph/annotation revisions. Later graph changes mark newer information and offer deliberate comparison/update; they do not rewrite an already saved report.

### Explicit draft handoff

From a saved report revision, choose an authorized destination brand in the same enabled organization, objective and deliverables. Show a short confirmation of the selected findings and destination, then create a draft brief using existing campaign workflow foundations. Do not preselect either publishing pilot brand. A separate deliberate handoff can target another authorized brand.

Persist an actor-bound idempotency key and exact payload/source-revision receipt in the same commit as the destination draft. Repeating an accepted request after a lost reply opens the same draft; a changed payload under that key conflicts. Recheck current source capability/membership, destination brand permission, revisions and restore locks before mutation. The result links to the existing addressable story/editor with retained report/evidence provenance. It does not invent `verifiedFacts`, prepared-copy approval, native approval or campaign generation. Ordinary source/copy review remains required before downstream approved previews/design actions.

## Data and integration contract

Reuse the existing authenticated Node application and durable store, not a new graph database or service. Strategy records are organization-scoped; graph entities are never application tenants or access grants. A strategy request needs explicit organization capability/membership before the existing brand-required publishing route boundary. Existing brand authorization must remain unchanged.

Use bounded typed records/read views with stable IDs/revisions and original seed references where reused. Keep layout, evidence, observations, scenarios, annotations, resources, reports and handoff receipts distinct. Proposed initial bounds from the brief are 256 nodes, 512 edges and 64 selected annotations per report, within the existing four-MiB aggregate and 1–8 transaction-key limits. Reject invalid references/oversized intake before mutation and explain the problem; no raw media, credentials or complete scraped pages belong in graph records. Repeat demo intake must not overwrite human work. Document any material seed adaptation briefly in the existing model gap map.

Defiant navigation/state/intake/jobs remain absent from disabled organizations and the two existing publishing accounts. A drawn external relationship to XXL, a catalog or an artist grants no access. The Liquidity Desk and Chai With Jai retain their organization/brand IDs, memberships, drafts, jobs, calendars, native links and behavior. No global seed, reparenting, automatic destination, or all-tenant scouting.

## Commands and project structure

The current implementation uses JavaScript ESM, Svelte 5 and Node 22. Source belongs in `liquidity-studio/src/` (workspace/components/semantic navigation) and `liquidity-studio/server/` (organization authorization, bounded domain service and destination handoff). Server contracts live beside services; existing browser contracts live in `liquidity-studio/tests/`. Specs stay in `docs/specs/`; the current brief remains in `docs/plans/defiant/`. File-level implementation choices belong to the later plan, not a new module hierarchy.

Reviewed executable commands, not run for this spec:

```sh
# Local development, only when the owned runtime slot is available:
cd liquidity-studio
npm run dev:studio -- --profile development
# Existing hosted CI commands, NOT local execution under current constraints:
npm ci --engine-strict --no-fund
NODE_ENV=production npm run build
node --test server/*.test.js
npm run test:browser -- --project=chromium
```

Local acceptance uses BrowserOS neo only; no local automated test runner, dependency install or build is authorized by this spec. Use the existing [hosted canonical artifact path](../development/hosted-frontend-artifact.md), then all required checks on the final merge head. No new CI platform or verification matrix is needed. Use official Svelte MCP documentation/autofixer for Svelte development.

## Code style

Follow existing ESM services, explicit captured scope and revisions, exact input validation, pure synchronous transaction callbacks and Svelte callback props. IDs and authority come from current server state, not imported graph labels. Example contract style (illustrative, not a new implemented API):

```js
const handoff = {
  reportId, reportRevision, destinationBrandId,
  objective, deliverables, idempotencyKey,
};
// The service resolves current source/destination authority before committing.
```

Use task labels such as “Add to report”, “Save report” and “Create campaign draft”. Keep source/uncertainty details in the inspector, not a wall of platform terminology. Optimize the complete screen and nested components for an obvious primary action and a central readable graph.

## Testing strategy and success criteria

Hosted service tests cover organization isolation, malformed/oversized intake with no partial mutation, revision conflicts, current destination revocation, restore locks and same-key lost-reply handoff. Existing SQLite/Firestore contracts remain the storage basis; do not claim managed runtime proof from doubles. Browser contracts cover semantic selection, saved context and dirty preservation. Actual Neo evidence must demonstrate the integrated behavior, not reproduce fixture scores.

Acceptance requires all of the following:

1. In an enabled isolated workspace, expand a cluster, inspect a real user-supplied signal/evidence, follow and compare a continuous route, import an owned resource with visible rights/availability, annotate the selection and assemble a useful report. Clearly identify the provenance of supplied data; a demo walkthrough alone is insufficient.
2. Save, reload and reopen the same view/report via URL, Back/Forward and keyboard/structured navigation. Retain annotations, authored interpretation, source revisions and dirty text through relevant failure/conflict paths. A graph change leaves the saved report snapshot intact until an explicit update.
3. Complete explicit handoff to an authorized destination and reopen the same draft after a lost reply. A second deliberate plan may choose another authorized brand; revoked/foreign destinations cannot receive work. No review, schedule, outreach, booking or publication is invented.
4. Disabled/foreign organization access is refused and both existing publishing brands remain unchanged. Imported external entities and demo relationships confer no membership or asset rights.
5. Review actual whole-screen and nested map/inspector/report renders with sparse and busy representative data. Improve at most three concrete usability issues per loop until the route is readable and the next action obvious; polish is part of delivery, not a separate approval ceremony.
6. Record delivered scope and remaining connectors/forecasting/publishing honestly, with relevant hosted checks and actual Neo evidence. Do not report real manager/learner acceptance unless that person actually completed it.

## Boundaries and review decision

- **Always:** preserve current authority and publishing work; retain provenance/uncertainty; use existing durable transactions and explicit revision/idempotency contracts; evaluate the actual end-to-end screen/task.
- **Ask before expanding:** paid/provider automation, new dependencies/storage services, cross-organization sharing, social-account publishing, forecast models or transferring restricted media. Normal implementation choices within an approved spec belong to its plan.
- **Never:** treat demo metrics/rights as facts, fabricate success or human approval, bypass source/tenant checks, rewrite existing pilot data, expose private relationships/credentials, or start implementation before this feature spec is approved.

**Approved scope:** this single integrated capability and the recommended defaults above. No additional product question blocks the spec: actual Defiant organization, people, evidence and destinations are provisioned explicitly during authorized implementation/acceptance, never inferred from the seed. This document records Specify and its approval; the scoped plan and issue-backed tasks follow separately. Approval does not claim implementation or acceptance is complete.
