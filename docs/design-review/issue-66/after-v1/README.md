# Integrated workspace evidence, version 1

Captured October 18, 2026 UTC from source `8133195` and its production Vite bundle, using a fresh authenticated local HTTP/SQLite fixture. All nine PNGs are unmodified 1280×720 viewport captures. Source/bundle fingerprints, actions, timestamps and PNG checksums are in [manifest.json](manifest.json). Original #39 evidence and annotations remain unchanged.

| Canonical steps / annotations | Observed after-change result |
| --- | --- |
| S01 / review-1 | All five source rows fit in this entry viewport. Table/board controls, configurable columns and saved views are visible. The scoped selection toolbar expands only when something is selected. This is a functional result, not a human time-to-task measurement. |
| S02 / review-2 | Huda search shows 1 of 5 with the active filter. This preserves the earlier #64 count correction through the new server query path. |
| S03 → S04 / review-3 | Opening the filtered story in the existing campaign editor and returning retains Huda. Separate browser tests verify the new detail panel, its keyboard focus return and large-list scroll restoration. |
| S05 | A failed search shows no-match recovery rather than claiming the brand is empty. |
| S06 / #67 review-8 | The real App-mounted calendar displays all seven dated columns, including Sunday, and an explicit time zone. Existing weekday plans remain separately undated; no assignment was fabricated for the screenshot. Those planning pools continue below the viewport. |
| S07 | The operator opens the existing undated Huda story directly from the calendar. Its source review remains unapproved; no dated assignment or artwork was created to open it. |
| S09 → S10 | CWJ keeps its own filter context, and clearing its deliberately set filter reveals five research tasks. These are unreviewed editorial inputs, not validation of their titles' factual claims. |

The sequence also exercises the actual API, not a static screen reconstruction. Functional tests additionally cover saved view create/update/delete/restore, sharing labels, configurable columns, grouping, inline metadata edits, board source-prerequisite rejection, 35-row pagination, partial conflicts, receipts/undo, unknown-response same-key retries, delayed scope/detail responses and optimistic editor bases. Supplementary calendar input/restore evidence is in [the #67 evidence set](../../issue-67/2026-10-18/README.md).

No live application or cloud resources changed during this capture. The two Google Auth Emulator tests and Firestore emulator test require their separate configured runs; an unconfigured skip is not a pass. Immutable deployment and actual Google-session acceptance are separate release gates owned by the operator.
