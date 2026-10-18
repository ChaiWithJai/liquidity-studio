# Shared operator work surfaces (#66 and #67)

The implementation uses one organization/brand-scoped entity map for the table, status board, detail panel, existing campaign editor and dated calendar. Row DTOs and full story DTOs retain their actual server revisions. A newer row invalidates an older full body rather than relabeling it current. These are editorial planning surfaces; source review, artwork approval, export and publishing remain distinct operations.

## History and dependency findings

The original canonical [review-1, review-2 and review-3 evidence](../issue-39/2026-10-17/annotations.md) remains unchanged. Its runtime image was not source-labeled, so it cannot establish an introducing commit by itself. The source inspected before this implementation was merged main `abd7ac9`, which included these verified changes:

| Change | System relationship |
| --- | --- |
| [5c61f02](https://github.com/ChaiWithJai/liquidity-studio/commit/5c61f02) and [e2b88e0](https://github.com/ChaiWithJai/liquidity-studio/commit/e2b88e0) | Scoped search/count/recovery and pending-edit navigation from #64. The new table preserves these upstream boundaries. |
| [5bc411d](https://github.com/ChaiWithJai/liquidity-studio/commit/5bc411d) and [8f70ec2](https://github.com/ChaiWithJai/liquidity-studio/commit/8f70ec2) | Actionable source review from #65. Moving a board card never bypasses source prerequisites. |
| [ab636b5](https://github.com/ChaiWithJai/liquidity-studio/commit/ab636b5) | Preview/preflight containment from #68, preserved in the campaign editor. |
| [d7afd58](https://github.com/ChaiWithJai/liquidity-studio/commit/d7afd58) | Request scope/session capture across delayed Google token refresh from #80. Every workspace client request uses this dispatcher. |
| [PR79](https://github.com/ChaiWithJai/liquidity-studio/pull/79) | Scoped queries, view ownership/sharing, stable IDs/revisions, typed mutations, dated assignments and bounded operation receipts. The client consumes this API rather than introducing another write path. |

Upstream: authenticated membership and scoped request dispatch → workspace API/repository → revisioned projections. Downstream: metadata edits reconcile current full stories, table/board rows, calendar assignments and editor snapshots; artwork edits invalidate table projections. A calendar reload force-fetches assigned story details so another operator's edit cannot remain hidden behind locally matching cached revisions.

## Interaction contract

- Saved personal/shared views persist filter, sort, grouping, columns and page size. Their scope is explicit; a shared view grants no membership. The table/board presentation choice and transient selection/focus/scroll are local scoped UI preferences, not shared definitions.
- Bulk metadata changes use one typed change per story, expected revisions and a UUID idempotency key. Applied, conflict and rejected outcomes remain visible per item. Undo is the server's bounded compensating operation and refuses newer conflicting work.
- A lost mutation response retains its original payload/key for an explicit same-request retry. A post-commit refresh failure is reported as recorded-but-not-refreshed, rather than an unknown write.
- Detail editing waits for a fresh server snapshot. Earlier detail requests cannot overwrite a later selected story. Closing the panel or returning from the editor restores its row focus and table position.
- Calendar dates have an explicit IANA time zone. Existing weekday labels remain undated until an operator moves them. Campaign and format units are distinct; a format placement does not claim that artwork exists. Pointer, keyboard and touch controls use the same revisioned commands.

## Verification and limits

The checked-in tests use fresh local SQLite fixtures and random disposable password-mode accounts. They exercise real authenticated HTTP APIs and Chromium. They do not invoke a model, modify the running operator application, or deploy cloud infrastructure. Google auth emulator and Firestore emulator evidence must be reported separately from suites skipped without those emulators.

Versioned after-change frames use new controlled fixtures. They are not pixel comparisons against the historical live dataset. Their manifests record source hashes, compiled bundle hashes, viewport, capture actions and artifact checksums. The original baseline and annotation IDs are retained. These checks establish functional behavior, not human task-time improvement, broad accessibility certification or production multi-user load capacity.

#66/#67 remain open for independent review and immutable runtime acceptance; the broader #39 workflow remains open.

## Recorded checks at source 8133195

- Node 22 backend/client/model suite: 137 passed, one Firestore emulator test skipped because its emulator was not configured.
- Combined Chromium suite: 39 passed, two Google Auth Emulator journeys skipped because that emulator was not configured. This includes seven real-API calendar journeys, six table-specific journeys and three editor concurrency regressions.
- Production Vite build passed. Official Svelte MCP found zero issues in App, Table and Calendar; DOM/query effects are intentional external I/O rather than derived state assignments.
- Independent reviewers reproduced the pre-fix dirty editor, stale filtered count and drawer metadata overwrite failures, then verified their focused probes against the fixes. The final export integration test downloads and checks actual PNG bytes.

The canonical integrated S06/S07 screenshots are included. S22/S23 original evidence remains linked by #67; supplementary C01–C06 and the direct-input regression journeys cover dated stacking, movement and undo. No claim of measured human action savings or a newly captured canonical S22/S23 is made in this slice.

Follow-up: canonical S22/S23 were subsequently captured in [the version 2 calendar evidence](../issue-67/after-v2/README.md), with a separate controlled synthetic fixture and no production source changes.
