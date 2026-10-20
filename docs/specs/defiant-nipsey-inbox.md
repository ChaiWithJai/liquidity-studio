# Spec: Defiant Nipsey source inbox

**Status: human approved on 2026-10-19.** The owner approved the specification and implementation sequence: [approval record](https://github.com/ChaiWithJai/liquidity-studio/issues/281#issuecomment-6271474802). Track [#281](https://github.com/ChaiWithJai/liquidity-studio/issues/281). This is an extension of the approved [Defiant strategy workspace](defiant-strategy-workspace.md), within the existing `operator-workflow` module. It does not change that approved specification. The approved [delivery plan](../plans/defiant/nipsey-inbox-plan.md) is being implemented in bounded increments. Runtime acceptance remains separate.

## Objective and scope

A Defiant manager can open a Nipsey creator-video inbox, find a useful supplied source, understand its proposed recording match, save their own decision and carry the context into the existing report and campaign draft. This restores the source-first Thursday experience without requiring a graph detour. Steve/Carlos are the intended task audience, not claimed research participants.

The full #281 outcome remains **source discovery → inspect → catalog match → select a moment → actual short → campaign**. This specification defines its first useful milestone, **reference-pack import → source inbox → manager decision → report → existing editor brief**. Delivering this milestone alone does not close #281. Live metadata observations, URL-based video preprocessing and actual supplied-media clipping follow as described below. The owner clarified on October 19 that 45 supplied sources are sufficient and preprocessing must proceed without waiting for local media or expansion to 100 sources; see [the clarification](https://github.com/ChaiWithJai/liquidity-studio/issues/281#issuecomment-6280558476).

Assumptions proposed for approval: use the separate enabled Defiant organization and existing membership/roles; choose the Nipsey example pack explicitly; label historical supplied values without repeated warning banners; begin with source links and optional user-initiated playback; preserve an empty real workspace; use the existing report/destination flow. No publishing brand is selected or seeded automatically.

## Experience

### Import once, inspect immediately

Within Defiant, offer **Creator videos**, **Explore**, and **Reports** as views of the same workspace. Creator videos opens a familiar searchable table/list with a source inspector. The example pack is an explicit import choice, not a global seed. Preview shows 45 source rows, 12 recordings, four workstreams, proposed matches, invalid/duplicate rows and what will remain unchanged. Counts are checked against the pinned fixture during implementation, not treated as observed real-world totals.

Import confirmation saves atomically and opens the inbox. Reimporting the same pack opens its saved records; it never replaces manager wording, notes, decisions or existing reports. A changed pack is previewed as new/conflicting content, not silently applied over human work. A failed save retains the preview and exact request for retry.

### Familiar source-first working view

Show title/creator, proposed track, workstream, stage and supplied views; expose date, likes/comments and provenance in the inspector. Search title, creator and recording; filter workstream, stage and recording, with clear result count and reset. Unknown dates/counts remain unknown. Sort known view counts as supplied historical values, with unknowns last; do not rank by invented velocity or a chemistry score. No paid/royalty performance dashboard is required.

Selecting a row opens its inspector with canonical source link, supplied narrative hook, recording proposal/rationale and manager notes. **Open source** always works as an external HTTPS link when valid. **Play source** may show a user-initiated supported YouTube embed; unavailable/private/deleted/blocked playback retains the link and useful message. Playback makes no source-download or rights claim. No remote thumbnails or embeds load merely because the inbox opened.

The first example task filters the Behind the Bars / lyric lore workstream, then inspects the Shady Blue / Blue Laces 2 supplied example. The title and hook remain attributed source text, not an endorsed historical claim. Show `Example research pack · supplied metrics · observation time unknown` once in context, with details available.

A manager can change the proposed recording, rationale and workstream/stage, and save a note. Stages are **New**, **Considering**, **Selected**, **Parked**; these describe planning, not clearance, render or publication. Keep the original imported match and stage strings as provenance; the reference's whitelisted/boosted strings never become actual rights or ad-delivery state. A recording's printed ISRC is supplied/unverified metadata; selection does not link official Shorts audio or establish permission.

### Resume and prepare a campaign

A URL such as `?org=<org>&tab=strategy&view=inbox&source=<stable-id>&workstream=<id>&stage=considering&find=<query>` restores the selected source and filters across reload and Back/Forward. Selecting a source does not discard dirty rationale/note text; use the existing dirty-state behavior. Semantic table/list controls, named inputs, headings and visible focus support keyboard, human and agent interaction.

**Add to report** opens the existing report composer directly with the source, selected proposed match and manager note. A source-only report is valid; the user need not create a fake graph node or select a region. Optional **Explore context** can show related graph records. Save/reopen the report, then deliberately choose a destination, objective and deliverables with the existing handoff. The existing editor displays the retained source/recording/rationale/note in the draft brief with a return-to-report link. A saved brief does not imply a clip has been rendered or source copy approved.

## Full-stack data and API contract

Use the existing organization strategy key, durable transaction primitive and `DefiantStrategyService`/HTTP boundary. Add a bounded optional `inbox` value; an old workspace reads it as empty without rewriting the store. Do not add another database, Python application, identity system or media service in this milestone.

| Record | Essential fields and meaning |
| --- | --- |
| Source | Stable ID, provider/video ID, canonical HTTPS URL, title, creator label, optional real channel ID, published date or null, provenance/import reference, historical observations, revision. Rank is only a legacy reference. |
| Recording | Stable pack-scoped ID, title/artist/album, supplied ISRC with verification state, original reference. No audio bytes or permission inferred. |
| Match | Source and recording IDs, proposed rationale, manager stage/workstream, revision/author/time; original imported proposal retained separately from manager edits. |
| Workstream | Stable ID, name, proposed creative objective/budget and recording references; no actual spend. |
| Annotation | Existing shared note/question/hypothesis/decision with an explicit source or match target, current source revision and evidence links. |

Canonical YouTube video IDs deduplicate source records within the organization. A source ID derives from provider+video ID, not row rank/title; imported recording IDs are namespaced to the pack rather than merged with existing connectors by name or ISRC alone. If a row lacks a valid provider ID/URL, preview it as a row-level error and do not fabricate one. Preserve original creator strings when no canonical channel ID exists. Identical repeated source rows combine references without duplicating the source; incompatible metadata/matches require explicit resolution, never last-row-wins.

Keep observations as `{metric,value,unit,observedAt,method,provenance}`; historical fixture counters use `observedAt:null` unless the original establishes it. Do not set the import date as measurement time. A single count yields no velocity. A future live adapter appends timestamped observations without overwriting these or manager decisions.

Proposed limits: 128 sources, 32 recordings, 16 workstreams and 256 matches within the existing two-MiB strategy-state and four-MiB store limits. Metadata-only import at most 512 KiB; no raw media, full scraped pages, credentials or spreadsheet binary in strategy state. The first fixture is a deterministic normalized JSON mapping of the pinned source/workbook columns; generic XLSX upload/parser is not required. Retain reference commit, original row reference, input digest and mapping version. Reject capacity/reference errors before any mutation.

Reuse the `/api/studio/strategy/:organizationId` route family:

| Method/path suffix | Request/result |
| --- | --- |
| `GET /inbox` | Explicit filters/search/source selection; returns strategy revision, bounded rows/counts, recordings/workstreams and selected detail. No provider fetch. |
| `POST /inbox/import/preview` | `{kind:'nipsey-example'}` or bounded normalized metadata; returns validated diff/counts/warnings/input digest and current revision. Does not write. |
| `POST /inbox/import` | `{expectedRevision,idempotencyKey,previewDigest,...exact preview input}`; atomic merge/receipt, returns same records on exact replay. Server recomputes normalization/digest. |
| `POST /inbox/sources/:sourceId/match` | `{expectedRevision,idempotencyKey,expectedMatchRevision,match:{recordingId,rationale,workstreamId,stage}}`; saves manager proposal, preserves imported original. |
| Existing annotations/reports/handoff | Extend exact validators for typed source/match references; retain existing command/revision/receipt conventions. No new competing report or campaign API. |

Every write resolves current enabled organization membership and revisions within the existing transaction; actor IDs, source provenance and timestamps come from the server. Exact same actor/key/payload replay returns the accepted receipt before stale-revision rejection; a changed payload under that key conflicts. No database migration job is needed: initialize the optional inbox only in an explicit successful import. A changed workspace or concurrent manager edit returns a useful 409 and preserves working text. Imports never enable Defiant or cross organization/destination boundaries.

Report snapshots add typed `sourceRefs`/`matchRefs` and copied source, recording, observation, workstream and annotation records alongside existing graph findings. At least one graph finding **or** source is required. Later source/match edits mark newer information; only explicit report refresh replaces its snapshot. Preserve these fields in report history and title-only saves. Existing handoff already clones the report snapshot into `draftBrief.report`; update its brief presentation to expose the new context, with no new destination defaults or copied approvals. Existing graph-only reports and drafts remain readable.

## Source basis and current gaps

Read-only reference pin: [`ChaiWithJai/defiant-os@5e6b5c3`](https://github.com/ChaiWithJai/defiant-os/tree/5e6b5c3542e9b2bd3d74080fda649abc650b80ec). [`database.py`](https://github.com/ChaiWithJai/defiant-os/blob/5e6b5c3542e9b2bd3d74080fda649abc650b80ec/database.py) defines the rows/catalog/workstreams; [`public/index.html`](https://github.com/ChaiWithJai/defiant-os/blob/5e6b5c3542e9b2bd3d74080fda649abc650b80ec/public/index.html) supplies the familiar task layout; [`server.py`](https://github.com/ChaiWithJai/defiant-os/blob/5e6b5c3542e9b2bd3d74080fda649abc650b80ec/server.py) joins videos to tracks and updates local stages. Its renderer uses generated backgrounds/tones rather than selected YouTube bytes; it does not establish the later clip capability. Source inspection does not reproduce the owner's earlier successful session. Keep attribution and the [issue inventory](https://github.com/ChaiWithJai/liquidity-studio/issues/281); this proposal copies no reference media or third-party factual endorsement.

Current `defiant-strategy-data.js` intake only accepts graph/evidence/observation/resource arrays; `defiant-strategy-notes.js` requires graph-backed findings and note targets. `defiant-location.js` recognizes only map/report views. These are concrete seams to extend, not already delivered inbox functionality. `defiant-draft-handoff.js` already snapshots the saved report into an unreviewed, unscheduled draft. Preserve that working downstream flow.

## Sequenced follow-ons for the full #281 outcome

1. **Live metadata:** use this source/observation contract for one bounded YouTube Data API run with editable queries, provider IDs, paging/quota/errors, last-checked time and append-only compatible observations. Establish actual credentials/quota/cost before enabling scheduled calls. It does not download videos, infer rights, erase reviews or manufacture momentum from one measurement.
2. **URL-based preprocessing:** analyse one selected canonical public YouTube URL through Gemini video understanding, then show proposed segment timestamps, a short description of the observable moment and why it may fit the selected recording. Let the manager inspect the source, edit and save the proposal, reload it and retain it in the report/brief. No local MP4/WAV is required for this step. Timestamps are approximate model proposals until inspected; empty/unavailable analysis must remain an honest outcome. Reuse existing scoped storage, provider identity, manual actions and budget controls. Do not batch all 45 sources automatically or replace manager wording. This owner-directed sequence supersedes the earlier manual-render-first prerequisite.
3. **Actual source-to-short:** one explicitly supplied accessible source file and permitted audio file → use or adjust the saved proposed interval → inspect captions/crop/mix → real 9:16 rendered artifact → play/reopen → retain inputs/revision and report/brief link. Resolve the source interval/deliverable length with the task rather than copying conflicting 8/30/90-second demo defaults. Video understanding provides analysis, not downloadable media bytes. No invented source cut or official-audio linkage.
3. **Complete journey:** manager finds source, explains match, selects moment, previews actual short and creates campaign brief without rebuilding context. Paid delivery, payout/attribution and Databricks remain separate; graph/partner context remains optional. Follow-on specifications can reuse the same spine without making all of them prerequisites for the first inbox.

## Commands, structure and style

Existing stack: JavaScript ESM, Node 22, Svelte 5 and the current durable store. Likely server sources: `server/defiant-strategy.js`, new focused inbox normalization/service helper, `defiant-strategy-http.js`, `defiant-strategy-notes.js`; frontend: new `DefiantVideoInbox.svelte`, current workspace/planning/brief components and `src/lib/defiant-location.js`. Contracts stay in `server/*.test.js`; ordinary browser journey in the existing `tests/` suite; fixture and mapping receipts under `docs/plans/defiant/` or an original source-controlled fixture directory. No new package/dependency is assumed.

Follow explicit ESM commands, synchronous transaction callbacks, exact inputs and Svelte callback props. Example command shape:

```js
const input = { expectedRevision, idempotencyKey, expectedMatchRevision,
  match: { recordingId, rationale, workstreamId, stage: 'considering' } };
// Current service resolves source/recording IDs and author in its transaction.
```

Reviewed commands for **hosted CI only**, not run for this proposal:

```sh
cd liquidity-studio
npm ci --engine-strict --no-fund
node --test server/defiant-*.test.js
NODE_ENV=production npm run build
npm run test:browser -- --project=chromium
```

Later local acceptance uses the coordinated existing developer launcher and BrowserOS neo; no local install/build/test runner. Svelte development requires the official Svelte MCP. Generated frontend files come from the existing hosted canonical-artifact path, followed by all required exact-head checks. Do not introduce a new test platform.

## Acceptance and boundaries

Accept the first milestone only after an ordinary Neo journey: explicit example preview/import → filter lyric-lore sources → inspect supplied Shady Blue source/provenance → edit/save proposed match and note → reload/Back with state retained → save/reopen source-only report → explicit existing destination handoff → existing editor shows the same brief and report-return link. Reimport preserves that human decision and the same sources; repeated accepted handoff opens the same draft. Check an empty workspace, invalid row/conflict retaining input, unavailable playback and one real save conflict. Existing graph report/handoff behavior remains intact.

Always preserve imported originals, current manager edits, unknown observations, report snapshots and visible save/retry states. Never infer rights, factual endorsement, measured delivery or approval from a source link, track choice, stage or render. No automatic seed into publishing brands, live calls, source media download, paid model, ad spend, outreach or publishing in this milestone. A later change to these boundaries needs an explicit scoped product decision, not a generic platform exercise.

The approved scope covers this first milestone. Source implementation and hosted verification do not establish actual browser acceptance. Broader #281 delivery remains open.
