# Issue 64 after-change verification, evidence version 1

Recorded 2026-10-18 UTC against source base `324f3fc` plus this PR's changes. The manifest records the exact App.svelte SHA256, screenshot checksums, capture times, viewport, fixture actor and organization/brand IDs. The canonical production build serves index-twNbdSij.js and index-BZxo4KJZ.css. This is an isolated Node 22 server with fresh SQLite and explicit test-only password authentication, not the live Google pilot or a container image/deployment acceptance. No generation, assignment, export or paid request occurs in this focused flow. Human usability and effort metrics remain unknown.

## Source history and system impact

`754f042906d2bd79e028aa6b6805d72cfc84afca` introduced the canonical Svelte frontend with component-global search/status state, a total-only backlog heading and one empty message for both an empty brand and filtered-out results. The search fields outlived brand switches, so a valid scoped repository response could be visually hidden by the previous brand's query. These are view-state/recovery defects, not evidence that backend tenant authorization was bypassed.

`44479d8c1b989cb65cda3127ca5b944ac0deb1b0` later added scope-loading state and stale-response guards (PR #50). Those guards remain: previous workspace data is cleared/hidden while loading, and an older response cannot replace the current brand. This PR adds a separate failed-load panel with Retry workspace instead of labeling failed requests empty.

The earlier #64 screenshot baseline inspected image `ed12ddd1a187419e784bbfe4223c06cac496a2dc539c51088ad2643748021ea1` without a source-revision label. Its source introduction cannot be attributed from those pixels or the unrelated `9d8e5f0` checkout. The source-history claims above concern the actual current repository. Both new browser assertions failed against the authoritative pre-change build before implementation, corroborating the count and failure/empty distinctions on that build.

Upstream: authenticated session user ID, organization/brand IDs and scoped bootstrap records. Derived filteredStories drives both the displayed list and its count; a polite atomic status region names counts/current filters. Active chips and Clear filters expose recovery without creating data. Search/status/selected-story ID/scroll are held in session-only view state keyed by user+organization+brand; story objects and permissions are never cached there. A first visit to a brand starts unfiltered, revisits restore that brand's view, and sign-out clears the cache. Same-brand editor/backlog navigation retains selection and scroll. Stale cached selections are resolved only within the newly authorized backlog.

Downstream: #66 can replace this session view cache with explicitly scoped saved-view persistence; this PR does not implement named/shared views or a new database. Calendar, campaign editing and source-review authority stay on the existing scoped APIs. Rollback reverts source and generated dist; there is no server/database migration or live runtime change.

## Canonical step comparisons

Original annotation IDs review-2/review-3/review-4/review-5 remain canonical in [issue #64](https://github.com/ChaiWithJai/liquidity-studio/issues/64). These new captures retain the step identifiers with new evidence/provenance; they do not overwrite the original atlas or imply identical actors/data/runtime.

| Step | After-change observation |
| --- | --- |
| [S01](S01.png) | Fresh scoped backlog, five of five stories. |
| [S02](S02.png) | Huda search, one of five, active search chip. |
| [S04](S04.png) | Editor → backlog preserves Huda filter. |
| [S05](S05.png) | Zero of five, explicit no-match explanation and Clear filters. |
| [S09](S09.png) | First CWJ visit starts unfiltered; previous brand query does not cross scope. |
| [S10](S10.png) | Clearing a deliberately set CWJ query recovers all five stories. |

## Verification and limits

Three focused actual Chromium tests cover this sequence; a genuinely empty fixture brand; keyboard Clear filters and focus recovery; search/status restoration across brands and organizations; selection/scroll continuity; sign-out reset; controlled HTTP failure and retry; and delayed/reversed scope responses. The failure/delay cases are explicitly test interception, not claims of an observed production outage. Existing browser regressions separately retain source, export and scope safety coverage. Official Svelte MCP reviewed state/derived/binding/lifecycle usage and reported no issues after corrections; the optional bind:this suggestion was retained for direct search focus recovery.

These desktop 1280×720 screenshots have unmodified viewport pixels and no sticky CSS/time/profile mutation. They establish the tested recovery behavior, not screen-reader certification, multi-user collaboration, mobile usability, human effort reductions or completion of #39/#66.

Exact final source verification: all15 available Chromium tests passed; two real Auth Emulator cases were intentionally skipped because no emulator was configured. The three issue64 tests passed independently. The production build completed without compiler warnings. All six screenshot checksums and the App.svelte source fingerprint were rechecked before commit.
