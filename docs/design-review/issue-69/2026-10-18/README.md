# Editorial task context: versioned issue 69 checkpoint

This is a controlled operator walkthrough and browser regression checkpoint, not a human fatigue study. Source `bc9b6b1d0d7f60593323ea647e2d25dff7dee951`, based on merged PR84/main `c5844c1`. The served final build was `index-C2cHj710.js` with `index-DriuQr_f.css`. Actual BrowserOS viewport: **1280×720, DPR1**. This is an isolated Node/SQLite development-password QA instance with explicitly allowed synthetic generation, not an immutable production image or a managed Google sign-in acceptance run.

## Problem, history and dependencies

The readable-field problem entered the canonical Svelte source in `913dfb0`: the Reel loop rendered raw `onScreenText` and `bRollDirection`. The original baseline remains [issue39 annotations](../../issue-39/2026-10-17/annotations.md), including review-3/7/12/14/17. That baseline is preserved rather than relabeled as current behavior.

Changes since the baseline already fixed important adjacent work: PR74 introduced source-prerequisite presentation; PR77 (`ab636b5`) contained review summaries and linked measured feedback to actual SVG elements; PR84 (`9ff4546`, `8133195`, `32eec46`) added canonical workspace projections, dirty editor revision protection, reliable artifact links and immediate saved-filter intent. This change preserves those handlers and the server's independent source and revision checks.

Upstream inputs are the authenticated scope, selected canonical story revision, transient artwork/review buffers and source prerequisite summary. Downstream actions are the existing revision-aware save/export APIs, dated calendar workspace and measured preview. Task links focus existing regions rather than copying story state, approving sources, saving implicitly or publishing anything.

## What changed

A compact task area keeps story, organization/brand, format, revision, artwork/review saved state, source prerequisites and a next action visible. Its save button uses the existing `saveEdit` handler. Source, wording, preview, validation and export links focus outlined targets. The same tab retains unfinished buffers when visiting the calendar or filtered backlog; reloading still discards unsaved buffers, as the interface states.

The task area is sticky on a wide, sufficiently tall viewport and becomes normal document flow on narrow/short screens. Document scroll padding keeps focused targets below it. Source summaries inside the long editor no longer create a competing sticky panel. Reel fields have explicit beat-specific accessible labels, including **Time range**, **Voiceover**, **On-screen text**, and **B-roll direction**, with guidance explaining that shot direction does not create footage.

Export remains an explicit file handoff. Calendar placement plans work. Neither operation publishes or opens an external editor. Preview measurements remain advisory and disabled for unsaved artwork.

## Versioned frames and transition context

The stable step IDs reference the original annotations; these are new original screenshots, not replacements for historical images.

| Step | Current performed transition and frame | Result |
|---|---|---|
| S03 | [Reopen the filtered controlled draft](S03.png) | Scope/story/revision and saved-state context are visible. The final-build screenshot reopens an already generated draft; the source-to-draft transition is covered separately below. |
| S08 | [Keyboard task action → source region](S08.png) | Expanded saved source review is focused below the task area. This supersedes the baseline navigation detour, without claiming source approval is factual verification. |
| S19 | [Story → preview task action](S19.png) | Story simulator identity is reachable from the editor. This frame does not certify Instagram behavior or that safe-zone overlays were enabled. |
| S21 | [Reel → wording task action](S21.png), [focus B-roll guidance](S21-labels.png) | Readable labels and a keyboard-visible focus target; the latter capture also retains unfinished text. |
| S23 | [Calendar task action → explicit dated placement](S23.png) | October17 assignment persisted at revision6. Status remains Exported because a script artifact was explicitly created earlier; assigning did not perform another export or publish. |
| S04 | [Return from unfinished Reel to filtered backlog](S04.png) | Search remains `Workflow69 final`. Returning through Campaign Studio preserved `Return unfinished final wording`, revision6 and the unsaved indicator. |

The actual browser run created an unreviewed, general editorial fixture, explicitly approved its HTTPS source, saved review, generated a clearly synthetic draft, edited Reel wording, visited preview and validation without saving, saved through the task action, explicitly created a script artifact, placed the campaign on a dated calendar, and returned with a later unfinished edit intact. Source approval and generation happened before the final CSS-only scroll-offset commit; final screenshots and return/assignment checks used the final build above. BrowserOS's download helper timed out waiting for the script download; this is not represented as a successful BrowserOS file download. The actual authenticated script-download flow passed in both separate Chromium role regressions.

## Actions, recovery and limits

Counts use **semantic operator actions**, not mouse movements, raw keyboard presses, elapsed time, or a speed comparison. One button activation counts once whether performed by pointer or focus+Enter. No fatigue or efficiency percentage is inferred.

The scripted role journey contains 21 explicit semantic actions: search; open; review-anchor; approve-status; save-review; generate; select-Reel; edit text; preview-anchor; validation-anchor; wording-anchor; save-artwork; calendar-anchor; open-move; choose-date; save-placement; return-to-Studio; export-anchor; create-export; download-file; edit unfinished text. Its subsequent return test adds four: calendar-anchor, Studio-return, backlog-return, Studio-return. Thus **25 actions per controlled role journey**, with per-character keystrokes and viewport setup excluded. The final handheld BrowserOS walkthrough also included diagnostic screenshots, snapshot reads and focus inspections, and does not have a comparable total action count. An earlier pointer activation did not change the intended view; explicit keyboard activation established the observed transition. No failures are hidden inside a claimed improved click count.

Recovery checks retain typed buffers across source/preview anchors and calendar/backlog visits. Existing conflict tests continue to reject overwriting newer saved revisions. The new link does not discard a conflict or bypass source prerequisites. Reload recovery is limited to saved state; unsaved edits are not durable drafts.

| Scenario | Evidence / capability boundary |
|---|---|
| Human founder or marketer | Both roles passed controlled authenticated HTTP/Chromium journeys, including deliberate source approval, saved edit, actual script download, dated placement, and unfinished return. This is not independent human usability research or actual marketer Google onboarding. |
| Screenshot agent | Can inspect the visible scope, revision, warnings and labels. Screenshots do not authorize source approval, prove provider truth or establish hidden persistence. |
| Live helper | No helper orchestration is delivered by this change. Issue71 owns the separately reviewed durable jobs surface and its failure/recovery controls. |
| Walk-away | No unattended editorial approval or publishing is delivered. Issue70's operating contract and issue71's durable execution remain separate dependencies. |
| External native editor | Doory/Penpot remain separately scoped investigations/adapters. This taskbar does not silently transfer assets, identity or credentials to them. |

Issue69 remains open for the combined release/whole-sequence acceptance and any explicitly unmet scenario requirements. This PR does not close sibling issues or claim the whole issue39 pipeline is complete.

## Verification

- Actual Node22 production build succeeds.
- Two new Chromium founder/marketer journeys pass, using real source/save/export/placement HTTP APIs and controlled synthetic drafts.
- Thirty-five existing browser regressions pass, including source-review recovery, dirty artwork conflict, external filtered rename, uncertain operations, dated calendar, and immediate saved-view create/update.
- Official Svelte MCP: App has no reported issues; Emulator has the same two existing canonical-SVG `@html` warnings as baseline. The single Emulator change adds a focusable validation region; SVG trust boundaries are unchanged.
- At 390×844 the new task area is static and document width stays within the viewport. Desktop keyboard source/preview/edit targets remain below the sticky task area. Full mobile product certification is not claimed.

Svelte patterns were checked against official [markup/events](https://svelte.dev/docs/svelte/basic-markup), [derived state](https://svelte.dev/docs/svelte/$derived), [bindings](https://svelte.dev/docs/svelte/bind), and [compiler/accessibility warnings](https://svelte.dev/docs/svelte/compiler-warnings). Licensed static artwork and source fixture rights are unchanged.
