# Issue 39: performed sequence review and affinity clusters

Reviewed the actual local application at http://localhost:3001/ on October 17, 2026 (New York date). This is a desktop expert walkthrough, not a human usability study or proof of cloud collaboration. Captured 23 ordered states in five journeys, saved a DOM snapshot for each state, annotated 17 regions, and inspected focused regions at 150%. Used an isolated copy of Ray of Light's actual tools/design-review at commit 1d384c03cc97c603bd91c5b31ed2ae80988a49b1. Live atlas: http://127.0.0.1:8397/ . Focused views: /closeups.html . No app saves, assignments, generation, exports, batch execution or deployment changes were submitted. Preview rendering itself displays preflight recording; therefore this is not a claim of zero incidental app telemetry writes.

## Provenance and evidence discipline

Runtime container liquidity-local-studio-1, image sha256:ed12ddd1a187419e784bbfe4223c06cac496a2dc539c51088ad2643748021ea1. Image has no revision label. The workspace checkout is 9d8e5f0dca4ac5248de2959e85515390775840d3 and does not match the inspected UI. Do not assign introducing commits from that checkout to these findings. Commit forensics and current candidate verification remain follow-up work. The main thread has another candidate on 39010, which this review did not operate.

S15 is explicitly a transient capture during an asynchronous brand switch. Its stale story list is excluded from product/tenant-isolation conclusions. S16 and S22 show the settled recovery brand and existing acceptance campaign. The recovery brand uses a Liquidity Desk preset; matching preset artwork does not establish a tenant leak. Browser screenshots can capture transient layout, so conclusions use corroborating visible text and repeated settled states. The unused reel-detail crop was not used as evidence; annotated closeups are derived from the saved S05 and S21 full frames.

## Actual sequences, rather than screenshot counts

A, S01–S05: enter backlog → search Huda → open matching story → return via backlog → search unmatched text. Four deliberate UI actions after entry. Search persistence is a positive result at S04; the false empty-state instruction at S05 is the failure. The heading remains five when only one result exists at S02.

B, S06–S08: navigate calendar → open Tuesday story → keyboard-focus below source review. The editor has three unreviewed claims without source URLs and two generation entry points. They were not invoked; this review establishes misleading affordances, not a source-gate bypass.

C, S09–S11: change brand → inherited unmatched query masks its stories → clear query → open first story. This isolates a repeated cause across two scopes: retained global filtering plus misleading empty copy. Clearing the query restores five research stories. Selecting a brand itself is not permission testing.

D, S12–S14: open Brand Kit → Operations → keyboard into readiness details. Read-only positioning and unreviewed research are clearly labeled. Operations separates readiness dimensions and lists scoped attempts; there are no attempts for this inspected brand. Batch execution, cancellation and backend job durability were not tested.

E, S15–S23: select existing recovery brand → wait for actual campaign editor → Carousel + Design Mode → Profile Grid → Story + In-Situ + Safe zones → Reel → focus playback scrubber → calendar → open acceptance card → focus Assigned day action. S15 is a transient excluded above. S16–S23 expose the actual generated content, preview modes, stacked calendar and assignment path. Switching previews is local exploration, not completed export or publication.

## How the clustering was performed

First recorded specific observations tied to transitions and regions. Then compared them across journeys, combined shared causes, and mapped those clusters to the four requested themes. Annotation counts are evidence counts, not user-frequency or severity statistics. Five pivot states carry most of the diagnosis: S05 (false recovery), S09 (same cause after scope change), S18 (artifact identity across modes), S21 (validation and wording burden), S23 (calendar-to-editor scheduling detour). Adjacent steps establish what led there and what recovers it.

### Theme 1: frontend as API — observable state and actionable verification

Cluster: the screen can show a technically valid component without clearly stating the task outcome. Evidence: S02 total versus filtered count; S05 empty-result wording; S03 enabled Generate beside unreviewed inputs; S18 Carousel selected while Profile Grid shows a feed projection; S21 collision count without an obvious route to offending text.

Impact: a human or screenshot-driven agent can infer the wrong next action, verify the wrong format, or repeat work. Accessible names are useful today: search, brand selector, claim fields and preview controls are addressable. Repeated Open story buttons require article/title context, not an unscoped first-button heuristic.

Fix pathway: each action needs actor/scope, entity ID, revision, preconditions, expected visible result and failure recovery. Use 1 of 5, filter chips and Clear filters; show review-required counts linking to claims; label grid as a feed-grid projection; link collision findings to highlighted artwork text. Keep API authorization and source gates independent of visual affordances. Test stale selections, changed revisions and interrupted requests.

Acceptance: replay S01→S05 and recover without creating data; verify the same selected artifact through format/mode changes; jump from a specific preflight failure to the affected text; rejected domain operations remain rejected when called outside the UI. The latter is planned testing, not a result from this walkthrough.

### Theme 2: synchronous human/helper control and durable walk-away work

Cluster: current scope, saved drafts, source state and batch history are foundations, but shared actor/revision/delegation is not visible in inspected surfaces (S13/S14/S16). Empty batch history cannot prove the absence or presence of durable backend jobs.

Thought experiment grounded in these steps: a human edits a Reel while a helper organizes the backlog. The helper proposes a move for story X in brand B at revision R. The human changes the day before acceptance. A stale proposal must show a diff/conflict instead of silently overwriting the human. It must not steal focus or switch the human's active story. Show actor, affected objects, progress, stop/takeover and undo. Keep browser-selection/view state separate from shared content state.

Async extension: human approves a bounded batch, leaves the browser, and later returns to a durable job ID, item-level status, errors, spend/usage and resumable results. Require idempotency and reconciliation after network loss; distinguish cancelled, failed, partial and complete. Test browser close, worker restart, duplicate request and competing edits. Do not claim existing Cloud Run hosting establishes those behaviors.

Bonsai 2B remains a candidate for evaluation, not an assumed vision-capable or deployed solution. Benchmark bounded tasks, malformed actions, stale screenshots, latency, correction rate and intervention needs against human-only and deterministic controls before choosing it.

### Theme 3: manipulable backlog and spatial calendar

Cluster: the operator repeatedly leaves the work surface to change its items (S01/S06/S22/S23). The backlog has search/status controls and tall rows, not a manipulable database. Only three of five rows fit in the initial viewport. The calendar already stacks two Monday cards; do not file existing stacking as missing. Long titles are difficult to scan in narrow columns and Sunday is outside the initial visible width.

Fix pathway: one authorized story model, projected into configurable table/board/calendar views. Add sort/filter/group, column visibility, personal/shared saved views, multi-select/bulk edits and a context-preserving detail panel. Scope views by brand, expose active filters, and keep counts and updates consistent across projections.

Calendar: add dated ranges/timezone, an unscheduled pool, clear format/status, direct drag/drop and within-day ordering, keyboard/touch alternatives, undo and revision-aware persistence. Current Assigned day is weekday-only and below the whole Reel form. A proposed completed scheduling path has at least card-open, day-choice, assignment and return, plus locating the lower controls. This walkthrough inspected that path but deliberately did not submit it. No fabricated measured click saving is claimed.

Acceptance: table and calendar reflect the same story revision; bulk selection remains scoped; a card can be moved and ordered with pointer and keyboard; undo survives the intended persistence model; date/timezone/DST behavior is explicit. Preserve Assignments only / no automatic publishing. Exported is not a publication receipt.

### Theme 4: end-to-end fluidity and click fatigue

Cluster: contextual information and controls separate as work grows (S03/S08/S19/S21/S23). A long source/reel form pushes scheduling down the page; preflight and preview live elsewhere; internal labels require repeated interpretation. Search persistence within the same brand is a positive to retain, while global carryover across brands needs deliberate handling.

Fix pathway: a persistent compact task bar with story, scope, format, unsaved state, review blockers and next action; a detail drawer that preserves the backlog view; readable labels for On-screen text and B-roll direction; direct validation links; deliberate per-brand view restoration. Avoid replacing sound review steps with a single unsafe Generate/Publish shortcut.

Evaluate complete jobs, not screenshots: source review → draft → edit → format preview → calendar assignment → export/handoff → return unfinished. Record completion, actions, backtracks, context switches, waiting and recoveries for human-only, screenshot-agent, live helper and walk-away batch scenarios separately. Current run gives a deterministic expert baseline; it does not establish marketer task time, user fatigue rates or usability-study outcomes.

## Implementation order and dependencies

1. Small corrective work: truthful no-match copy/counts, visible filters, readable Reel labels, feed-grid projection label, actionable preflight region links. These can be independently verified by replaying captured sequences.
2. Shared domain/view foundation: stable IDs, revisions, scoped saved views, consistent mutation results and optimistic-concurrency rules. Table and calendar must share this layer.
3. Operator surfaces: table controls/detail drawer, direct calendar move/reorder with accessible alternatives, visible review/assignment/export distinctions.
4. Durable jobs and shared control: server job records, idempotency, per-item status, conflicts and bounded delegation before synchronous/helper UI is presented as reliable. GCP IAM/tenant authorization remain mandatory upstream constraints.
5. Pilot evaluation with the founder and marketer: replay real tasks, compare measured recovery/context switching, then evaluate a small helper model. No speculative ROI or performance promise.

## Limits and remaining investigation

This completed a desktop visual/sequence clustering pass. It did not complete all of issue 39, Penpot/Doory integration research, a whole-codebase architecture audit, commit attribution, mobile/accessibility certification, real multi-user conflict tests, cloud restart tests, generation/provider validation, export correctness or a human usability study. Those remain explicit acceptance work. Keep issue 39 open. The original deep investigation and requirements remain intact; this report adds actual evidence rather than replacing them.

## Evidence index

Open the Design Review atlas for Screen/Journey/Progress tabs. samples.json contains ordered actions, times and URLs; shots/Sxx.txt contains DOM evidence; shots/Sxx.jpg contains original viewport pixels; annotations.json links normalized rectangles to notes; patterns.json groups themes. closeups.html enlarges saved regions to 150% without retouching. Annotated-search.jpg, annotated-closeups.jpg, clusters.jpg and journey-map.jpg are shareable local review artifacts. They have not been uploaded publicly.

- **S01** A — Find and inspect a story — Backlog entry. Action: Open studio
- **S02** A — Find and inspect a story — Search narrows the backlog. Action: Type Huda in search
- **S03** A — Find and inspect a story — Open filtered story. Action: Open the only matching story
- **S04** A — Find and inspect a story — Return preserves the search. Action: Return via Story backlog
- **S05** A — Find and inspect a story — Search empty state. Action: Replace search with unmatched text
- **S06** B — Schedule and inspect content — Calendar overview. Action: Navigate to calendar
- **S07** B — Schedule and inspect content — Calendar card opens source review. Action: Open Tuesday card
- **S08** B — Schedule and inspect content — Keyboard reaches generation below source review. Action: Focus Save source review then Tab, without saving
- **S09** C — Inspect an existing campaign — Switch to an existing brand. Action: Select Chai With Jai
- **S10** C — Inspect an existing campaign — Clear inherited search in the other brand. Action: Clear search
- **S11** C — Inspect an existing campaign — Existing brand first story. Action: Open first story
- **S12** D — Configuration and operations — Brand configuration. Action: Open Brand Kit
- **S13** D — Configuration and operations — Operations entry. Action: Open Operations
- **S14** D — Configuration and operations — Readiness detail receives keyboard focus. Action: Tab from Refresh focuses Readiness details; batch not invoked
- **S15** E — Recover existing work — Transient brand switch — exclude from data conclusions. Action: Select existing recovery brand CAUTION: Captured before asynchronous brand content settled. Not evidence of a tenant leak.
- **S16** E — Recover existing work — Recovery story editor. Action: Open existing recovery story
- **S17** E — Recover existing work — Carousel design preview. Action: Select Carousel then Design Mode
- **S18** E — Recover existing work — Profile grid comparison. Action: Switch to 3×3 Profile Grid
- **S19** E — Recover existing work — Story safe-zone inspection. Action: Select Story, In-Situ, Safe zones
- **S20** E — Recover existing work — Reel inspection. Action: Select Reel
- **S21** E — Recover existing work — Reel playback controls and preflight. Action: Focus scrubber via keyboard without playback
- **S22** E — Recover existing work — Existing campaign calendar. Action: Return to calendar
- **S23** E — Recover existing work — Scheduling control after opening calendar card. Action: Open existing Monday campaign; keyboard-focus assignment button without submitting