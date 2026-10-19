# Proposed delivery plan: Nipsey source inbox

**Human approved with the [specification](../../specs/defiant-nipsey-inbox.md) on 2026-10-19; [approval record](https://github.com/ChaiWithJai/liquidity-studio/issues/281#issuecomment-6271474802).** Track tasks in [#281](https://github.com/ChaiWithJai/liquidity-studio/issues/281); do not overwrite the unrelated #56 `tasks/plan.md`. This is the approved first-milestone sequence. Implementation is underway; actual task acceptance is still pending. Runtime slots remain coordinated separately.

## Dependency and delivery order

One source spine: normalized reference input → scoped inbox → saved manager decision → report snapshot → existing draft handoff. Complete these small vertical increments in order; each leaves the existing graph/report workflow usable. Live metadata consumes the same source IDs/observation contract later; actual media clipping consumes the selected source/recording/brief after that. No independent platform or identity work is on this path.

### 1. Preview and explicitly import the reference pack

**Outcome:** a manager can preview and import the Nipsey example pack into the enabled Defiant organization, with a useful first inbox list. Normalize the pinned reference rows into source/catalog/workstream/proposed-match records and retain original references/digests. Document the workbook-column mapping; do not execute the Python reference server or copy media. A source-only JSON fixture avoids a new general spreadsheet parser.

Acceptance:
- [ ] Preview explains new/identical/conflicting rows, historical metrics and unavailable fields; invalid references/capacity fail before a write.
- [ ] Explicit import atomically saves scoped records and one receipt; same request/reimport does not duplicate sources or replace human work, including after a lost reply.
- [ ] Old enabled workspaces read an empty inbox until import; disabled/publishing workspaces remain unchanged.

Likely files: new `server/defiant-inbox-data.js`, fixture JSON, `server/defiant-strategy.js`, `server/defiant-strategy-http.js`, focused service contract test. Medium scope. Verify with hosted normalization/service/HTTP contracts for identity mapping, replay, conflict and capacity, then ordinary Neo preview/import on coordinated runtime. No provider requests.

### 2. Make the creator-video inbox the source-first experience

**Outcome:** a manager finds and opens the lyric-lore example without navigating a graph. Build one focused inbox component connected to the real service; reuse the current workspace and URL helpers. Source link is always present when valid. Optional supported embed is user initiated and has a truthful unavailable state.

Acceptance:
- [ ] Title/creator/track search, workstream/stage/recording filters, result count and source inspector show the imported data/provenance clearly, with unknowns intact.
- [ ] Selected source and filters survive reload and Back/Forward; keyboard/table/list controls and visible focus work at desktop and narrow width.
- [ ] Empty, importing, error and unavailable-playback states retain the task and input; no remote media loads merely on entry.

Likely files: new `src/components/DefiantVideoInbox.svelte`, existing workspace component, `src/lib/defiant-location.js`, location contract test and existing browser journey. Medium scope; depends on 1. Use official Svelte MCP and hosted frontend/contracts; Neo compares the task structure to the pinned Thursday interface. Obtain a canonical artifact only after the source batch is reviewed, not after each small edit.

### 3. Save the proposed match and manager note

**Outcome:** the manager changes the recording/rationale/workstream/stage and writes a shared note with current revision feedback. Retain the original proposal separately. Extend existing annotation targets narrowly; no duplicated notes service.

Acceptance:
- [ ] A valid referenced recording/workstream and revision save durably; imported original remains available and statuses make no clearance/render/spend claim.
- [ ] Concurrent revision or failed save retains dirty text and offers a clear compare/retry path; same-key accepted replay preserves the exact result.
- [ ] Notes retain author/time/source revision, and reload returns the saved selection/decision without overwriting an existing report.

Likely files: focused inbox service helper, strategy command integration, `defiant-strategy-notes.js`, inbox component and focused service test. Medium scope; depends on 1–2. Hosted current-write/replay/conflict contracts, plus Neo edit/save/reload and one preserved conflict. No new account matrix.

### Checkpoint: useful source decision

Review the actual whole inbox screen and selected-source task. Fix at most three material usability defects, without replacing the reference use case with graph/navigation work. Reference inspection and the real task are evidence; supplied video titles/metrics are not verified external facts.

### 4. Carry a source-only report through the existing handoff

**Outcome:** Add to report works without a graph finding, preserving the exact selected source/match/note snapshot into the saved report and existing editor brief. Keep typed references and existing report history semantics. Existing handoff already copies the report, so extend its consumer rather than adding another campaign service.

Acceptance:
- [ ] Source-only and mixed graph/source reports save/reopen; title edits/history retain all source context, later manager changes only enter via explicit refresh.
- [ ] Deliberate current destination/objective/deliverables handoff retains the source/recording/rationale/note in the unreviewed, unscheduled draft; repeated accepted handoff reopens the same draft.
- [ ] Editor brief and return-to-report navigation keep context; original graph-only reports and the two publishing brands remain unchanged.

Likely files: `defiant-strategy-notes.js`, existing planning component, existing draft-brief component, report/handoff contract tests and existing browser journey. Medium scope; depends on 3. Hosted snapshot/history/replay contracts; actual Neo complete milestone task with honest example labels. Required all five exact-head checks and hosted canonical outputs before merging UI source.

## Completion and follow-ons

The first milestone is complete when the spec's inbox→decision→report→brief task works in the actual browser and the same saved work reopens. It does not prove live search, source-file cutting, official audio, paid delivery or real-world factual claims; keep #281 open.

Next source slice: one bounded YouTube metadata run appends compatible observations to the same source IDs, with explicit provider configuration/quota/cost and no overwrite of manager decisions. Then: one accessible supplied source file/audio pair, manually adjusted interval, actual 9:16 render/play/reopen with source and recording lineage. These require concrete small contracts when taken up; they do not justify Databricks, prediction engines, scheduled scouting or ad integrations in the inbox milestone.

No additional dependencies, database migration service or CI framework are proposed. If the actual implementation exposes a material contract change, update the scoped proposal and explain it; ordinary file choices and error handling do not create another approval cycle. Keep working records within the existing state limits and preserve all prior data.
