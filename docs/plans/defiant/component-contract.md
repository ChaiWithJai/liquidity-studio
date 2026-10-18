# Defiant component and service contract

Coordination baseline: isolated design treatment `65b62de`, especially `liquidity-studio/explorations/defiant/{Treatment.svelte,GraphCanvas.svelte,model.js}`. This records the actual study and the durable integration changes needed by #218–#220; it does not claim that browser-local mocks are shared persistence. The [approved spec](../../specs/defiant-strategy-workspace.md) remains authoritative.

## Ownership

The frontend treatment owner owns scene composition, interaction language, viewport/pan/zoom, positions and accessible controls. `GraphCanvas` stays independent of tenant storage. PLATFORM owns organization authorization, canonical domain records, evidence/uncertainty, read queries/serialization, revisions, durable receipts and destination handoff. Layout is saved preference/view data, never a business relationship. A service response does not dictate pixel positions; a canvas movement does not rewrite a regional corridor.

DRAFT coordinates this contract and integration subtasks, not another frontend shell. No graph database, provider or new identity service is introduced.

## Actual surface and real read model

The study exposes `GraphCanvas({nodes,edges,selectedId,planIds,onselect,onmove})`:

- Node surface: `{id,kind,name,subtitle,regionId?,tags?,x?,y?}`. Existing kinds include region, artist, person, format and catalog. Preserve source IDs/references and carry verification/provenance separately; imported resource types can extend a bounded known set.
- Edge surface: `{id,kind,from,to,name?,label?,sourceRegion?}`. `from/to` are visible endpoints. When the adapter visually attaches a geographic corridor to an artist, retain its actual geographic origin in `sourceRegion`; mark suggested/discovery/match edges as derived suggestions, not observed relationships.
- Inspector surface: selected item plus related resources, evidence and uncertainty. Fields such as profile/description/sourceTitle/sourceId are display content, not authority. Never convert exampleMetrics/exampleTurnaround into measured values.

Agreed first backend slice, under `/api/studio/strategy/:organizationId` before the publishing brand-required route:

| Read | Response |
|---|---|
| GET organization strategy | `{organizationId,enabled,revision,graph:{nodes,edges,clusters},items,regions,artists,resources,corridors,evidence,observations,annotations,views,reports,destinations}` |
| GET `/graph?focusId=&selectedId=&query=` | `{revision,nodes,edges,selectedItem,matches,relatedResources}` using the study field names |
| Existing GET `/api/auth/session` | Current authorized organizations include minimized `strategy:{enabled,canEnable}` discovery, including no-brand organizations |

`destinations` contains currently authorized application brands, never sample or verified-connected Instagram accounts. Responses remain bounded by the approved state limits; no arbitrary query language. Missing/deleted selections return an understandable unavailable selection and a way back to the graph, not a fabricated record. Full domain state and derived neighborhood remain distinct so editing a view cannot corrupt provenance.

## Semantic human and agent actions

The study's actual functions are select, navigate, togglePlan, addNote, saveView, report and createCampaign. Their integrated meaning is shared by visible controls and agent actions; agents do not receive a privileged data-write bypass.

| Action | Immediate frontend behavior | Durable/service meaning |
|---|---|---|
| `select(id)` / `explore(id)` | Select/inspect and, for region or artist, focus its neighborhood; clear search only | GET graph/inspector with stable IDs; no domain mutation |
| `followRoute(edgeId)` / compare | Select the actual directed route/path, preserve previous focus and geographic origin | Read current edges/evidence and bridge requirements; no forecast invented |
| `moveNode(id,position)` / pan/zoom/fit | Update visible layout immediately | Local view state until deliberate view save; no domain edge edit |
| `togglePlan(id)` | Add/remove shortlist chip immediately | Persist plan IDs with the saved working view/report selection; no resource reservation or clearance |
| `annotate(target,text,kind)` | Show local note/pending state, retain editable text | Exact POST `/annotations` with `{expectedRevision,idempotencyKey,annotation}`; server authors/time/revision. Node/edge `targetId` resolves against current records. Cluster/path targets retain typed stable references rather than an invented pixel coordinate |
| `saveView(name)` | Capture current focus/selection/shortlist/filter/layout | Exact POST `/views` with `{expectedRevision,idempotencyKey,view}`; view includes study-compatible `focus`, `selected`, `planIds` and validated positions/filter preferences. Saved layout does not alter shared facts |
| `buildReport` / `saveReport` | Open editable plan, show selected findings, explicit saving | Exact POST `/reports` with `{expectedRevision,idempotencyKey,report}`; title/thesis/findings use study vocabulary. Server snapshots actual selected findings/evidence/notes and source revisions; client cannot forge their approval |
| `refreshReportFromSelection` | Compare old report and current selected findings before replacing | Explicit new report revision; earlier snapshot remains retained, no auto-refresh |
| `createCampaignDraft` | Choose destination deliberately, show what carries over and pending result | Exact idempotent report-revision/destination handoff; returns existing addressable draft, not study's concept card. No scheduling, approval, provider call or publication |

First intake contract: POST `/enable` has an exact empty body and explicit founder intent. POST `/import-preview` accepts `{kind:'demo'}` or `{kind:'owned',data:{nodes,edges,evidence,observations,resources}}` without mutation. POST `/import` adds `{expectedRevision,idempotencyKey}`. Demo import is deliberate, never startup seeding. Real intake retains user-reported/import method and unknown rights. Notes/views/reports/handoff payload validators are owned by PLATFORM and finalized with the frontend owner as their slices begin; no generic mutation endpoint.

## Save feedback and recovery

Study notices such as “Note saved” and “Saved in this browser” must not survive unchanged as claims of server persistence. Integrated controls use compact **Saving… / Saved / Could not save · Retry / Changed elsewhere · Review changes** states next to the affected work.

- Apply selected/shortlist/layout changes immediately. Keep the last acknowledged server revision separately from local edits. Do not advance it optimistically.
- Each save intent retains its actor/scope, exact payload, expected revision and idempotency key until resolved. Network/unknown response retries reuse that exact intent; never silently create a second note/report/draft.
- Acknowledgement replaces local pending identity with server identity/revision without clearing newer text typed while the request was pending. Pending controls prevent duplicate submissions, not further local thinking/editing.
- Conflict preserves local text/selection, loads the new server revision for explicit comparison and requires a deliberate re-save. Do not auto-merge interpretations or relabel stale content Saved. A known validation refusal explains the field; retry after correction is a new explicit intent.
- Scope/session loss clears stale visible authority and stops old responses from updating another workspace. Preserve recoverable local text as appropriate without presenting it as saved or continuing background writes.

## Addressable state

The study uses `view=map|report|campaign`, `focus`, `select`, and `target`. Integration extends the existing `workflow-location` foundation with `tab=strategy`, organization, saved-view identity and **report identity**, retaining these user meanings. `target` is an explicitly selected authorized brand ID; unlike the study, it must not default to the first sample account.

A copied/reloaded link resolves current authorized IDs and restores coherent graph/report context. Back/Forward restores selection without silently clearing dirty notes. A missing/deleted/foreign ID shows an unavailable state with Return to map. Changing back to publishing retains its own story/format/editor location and excludes stale strategy-only query context. Successful handoff retains a return-to-report link; no second router or duplicated application shell.

## Delivery relationship

#225 implements the backend/first integrated state feeding #218. #226 implements the graph and URL interaction aspects of #218/#219 using the existing frontend treatment. #227 implements shared annotations/views/report aspects of #219/#220. #228 implements #220's real destination handoff. #211 remains the complete vertical journey and #214 remains the graph/report acceptance parent. These are complementary issue relationships, not competing replacement scopes.
