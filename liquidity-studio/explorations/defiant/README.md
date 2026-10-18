# Defiant design treatment

An isolated, working Svelte exploration for #214 / #209. Start with a region, reveal an artist and possible collaborators, annotate findings, assemble a planning report, then hand its brief into a sample campaign draft. No API calls, application account mutations or production routing changes.

## Run

From `liquidity-studio`, with the application's dependencies installed:

```sh
node --max-old-space-size=256 node_modules/vite/bin/vite.js --config explorations/defiant/vite.config.mjs
```

Open http://127.0.0.1:39170/. Browser drafts use `defiant-design-study:v1` in this origin's localStorage. This is a single-browser study, not multiplayer implementation. Dev server binds loopback only. The local dependency symlink is not part of the branch.

## What changed in the model, and why

`seed.reference.json` preserves the supplied seven-collection fixture. `model.js` projects it into nodes and routes; it does not import tenants. Defiant gets two explicitly sample campaign targets, separate from the two existing product brands. A business connection is not tenant membership or proof of ownership. Catalog and media entries are references, with no assumed rights. Invented metrics and transfer probabilities are omitted from the decision surface because they have no measured basis.

Positions, annotations, saved perspectives and selected findings live outside the entity fixture. Reports copy selected findings and notes at creation rather than silently tracking later annotations. Rebuilding a plan refreshes that snapshot while retaining its title and thesis. A campaign draft copies the report brief; repeated creation for the same report and account returns the existing draft. New report revisions and multi-report history remain production work.

## Component and action boundaries discovered

| Surface | Current contract | Production direction |
| --- | --- | --- |
| GraphCanvas | `nodes, edges, selectedId, planIds, onselect(id), onmove(id, position)` | Keep domain IDs stable and layout separate; route kind and direction must survive projection. |
| Fixture adapter | `makeGraph(focusId, positions), item(id), relatedResources(id)` | Bounded neighborhood read model with evidence links and explicit suggestion status. No graph-database dependency implied. |
| Inspector | Selected entity + related resources + target notes | Extract selection/notes component when integrating; source metadata must be accessible without losing the map. |
| Workbench | URL `view, focus, select, target`; browser history | Extend existing application location contract with organization scope and stable saved-view/report IDs. |
| Annotation | `targetId, text, author context, createdAt` | Add actual user identity, revision and shared persistence; local optimistic feedback then reconciliation. |
| Planning report | Selection snapshot, notes, title, thesis | Durable immutable finding snapshot + editable brief revision; preserve earlier reports. |
| Campaign handoff | Report ID + explicit sample target + copied brief | Idempotent scoped command returning an addressable real campaign/story ID, with no automatic publishing. |

These are semantic actions suitable for human controls and agent tools. The prototype's stable `data-node-id` attributes and labelled buttons demonstrate selection without screenshot coordinates. Agent mutations still need the same save/revision feedback as human actions; production tool transport is intentionally undecided.

## Findings about the current product

At base `52b610b`, `src/App.svelte` already tracks organization/brand/story/format and workflow location. Reuse that work; do not introduce another competing application router. The current campaign flow expects a saved story and uses `/api/studio/generate-campaign`, source review and format-specific content. A research report is not that story or an approved source review. The handoff needs an explicit mapping step and should land in the existing editable preview/Penpot flow.

The exploratory shell deliberately minimizes chrome and reveals detail after selection. Its style is not yet the shared product design system. Integrate region selection, inspector, shortlist and report surfaces with existing navigation/tokens rather than installing a second permanent shell. At 768px, details stack below the map instead of compressing the canvas into illegibility; a production compact inspector/drawer should be evaluated with managers.

## Evidence and limits

BrowserOS walkthrough: selected Lagos → Teniola Vibe → Kofi; saved an artist note and view; shortlisted artist and producer; edited report title/thesis; created sample campaign; reloaded and confirmed note, view, report and copied campaign brief survived. Selected the Lagos → London edge without leaving the artist neighborhood. At 768×900, measured document scroll width equalled viewport width and visually checked the stacked inspector. Svelte MCP found no component issues after keyed iteration fixes; suggestions about the persistence effect and element binding were reviewed (they persist/measure state, not derive it).

This is exploratory, not a production acceptance claim. Pan/zoom/drag controls exist; exhaustive pointer-device testing, collaborative conflicts, unknown/deleted IDs, quota/storage failures, source freshness, cross-device persistence and real publication are not proven. Google Fonts use a network stylesheet with system fallbacks. The full original seed includes unsupported ownership and tenant claims and must not be operationally imported.

Method: [Understanding Legacy Code: exploratory refactoring](https://understandlegacycode.com/blog/demine-codebase-with-exploratory-refactoring/), learning by changing an isolated version and retaining concrete findings before production implementation. This branch is a design study, not a replacement application.

## Follow-up delivery

- #218: progressive graph UI and evidence read model.
- #219: shared context, annotations and semantic actions.
- #220: report snapshots, campaign handoff and shared-shell reconciliation.
