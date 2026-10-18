# Issue 68: preview identity and actionable preflight, evidence v2

This is a new controlled fixture, captured on October 18, 2026 from an isolated production Svelte source build and ephemeral authenticated API/SQLite test server. It is not the original recovery story, localhost:3001, a deployed image, or an Instagram validation. Original annotations [review-11 and review-13](https://github.com/ChaiWithJai/liquidity-studio/blob/273cdde3fba60e1c6c46de84721b07db88b3241f/docs/design-review/issue-39/2026-10-17/annotations.md) remain unchanged. These captures retain S17–S21 as workflow anchors with a new evidence version; they are not pixel-equivalent baseline frames.

This round preserves v1 unchanged and supersedes its default UUID-heavy presentation after review. It is rebuilt on main `b6fd417`, preserving the merged source-review helpers and backlog view restoration. The baseline source remains `50b3935`; source/build hashes for this separate after-v2 capture are recorded in its manifest.

## Current reproduction and history

A separate clean archive of main `50b3935` was built and exercised with the same controlled source fixture. A real browser reproduced Carousel selected while the grid rendered the infographic's `SOURCE NOTES`, no preview-artifact identity region, and Reel preflight counters without any Locate control. The isolated baseline test passed those observations. No running application, personal Google session, cloud service, or current container was changed.

| Commit | Relevant behavior and dependency |
| --- | --- |
| [754f042](https://github.com/ChaiWithJai/liquidity-studio/commit/754f042906d2bd79e028aa6b6805d72cfc84afca) | Introduced canonical Svelte simulator and feed-specific grid; selected format and grid projection lacked an explicit relationship. |
| [32a702d](https://github.com/ChaiWithJai/liquidity-studio/commit/32a702d) and [dc03b8a](https://github.com/ChaiWithJai/liquidity-studio/commit/dc03b8a) | Shared geometry computation and authenticated browser/API measurement pipeline. Rectangles produced aggregate counts without stable artwork targets. |
| [4a51a3f](https://github.com/ChaiWithJai/liquidity-studio/commit/4a51a3f) and [f69527b](https://github.com/ChaiWithJai/liquidity-studio/commit/f69527b7688f1798cf07a4440f3d39350c2fe4c9) | Waited for loaded fonts, followed actual reel boards, and measured native overlay rectangles; an earlier pending async measurement could still outlive its view. |
| [bc338a1](https://github.com/ChaiWithJai/liquidity-studio/commit/bc338a1b8b2918084688808639998eb8acf424bb) | Grid source became active campaign plus actual scheduled/exported history. Feed projection remained intentional, not proof of the selected Carousel/Story/Reel. |
| [a491d64](https://github.com/ChaiWithJai/liquidity-studio/commit/a491d64) | Included every artwork label in preflight, including provenance. Locating such a label still required manual searching. |

This is a focused path history, not an attribution of blame or a claim that an unknown deployed image maps to these commits.

## Result and sequence

| Step | Actual candidate observation | Canonical annotation |
| --- | --- | --- |
| [S17](S17.png) | Carousel design surface identifies the human format/page, brand and saved revision. Technical story/generation/measurement IDs remain in collapsed, accessible Artifact details. | Sequence context |
| [S18](S18.png) | Carousel stays selected; the identity panel explicitly says the grid shows a 4:5 feed infographic projection and does not verify Carousel/Story/Reel. Grid cells show saved revision; their story/generation identities remain in Artifact details and machine-readable attributes. No grid measurement is presented as current. | review-11 |
| [S19](S19.png) | Story simulated surface and safe-zone overlay; measurement is tied to `story-page-1`. | Sequence context |
| [S20](S20.png) | Reel board 1 is identified; current preflight lists the affected text and measurement revision. | Sequence context |
| [S21](S21.png) | Keyboard-focusable Locate control focuses and outlines the actual provenance text in the SVG. The entry explains the simulated obstruction. Fixed renderer labels are explicitly distinguished from copy editable in this form; their layout requires review before export. | review-13 |

PNG captures show the complete preview component, so their dimensions differ from the original 1280×720 viewport. Adjacent JSON files retain the actual identity, preflight text, capture time and annotation IDs; the manifest records dimensions and SHA256. Fixture UUIDs identify disposable test artifacts, not production stories.

## Contract and recovery

The canonical SVG renderer now assigns stable format/page/element IDs. Geometry results retain these IDs, short text excerpts, measured rectangles and individual obstruction/overflow/contrast reasons. The API validates frame/artifact consistency and element ownership within that artwork, records the source story revision/generation, and returns that identity. Format-specific frame bounds reject non-existent infographic/Story pages and a fourth Reel board before persistence. These are client-submitted measurements recomputed by the shared geometry function, not trusted proof of rendering, factual accuracy or platform safety.

Measurement captures the exact render/view key before waiting for DOM/font readiness. A newer view, content/brand revision, edit state or unmount invalidates the result. The application independently checks scope, story, saved revision, selected format and measurement sequence before showing a delayed success or error. Grid mode, unsaved editor changes, zero dimensions and missing SVG text have explicit non-current states. Unsaved editor text is not silently represented as the saved artwork; save is required before measuring it.

Upstream dependencies are the saved campaign/revision, scoped brand profile, canonical SVG and loaded fonts. Downstream consumers are preview issue navigation, preflight history and portable evidence. Existing PNG export still uses the same renderer; this change does not add export certification or modify source approvals, scheduling, native editor adapters or generation. Rollback can remove the optional identity/violation presentation and extra response metadata; existing aggregate metrics remain compatible and saved evidence is additive.

## Verification and limits

The final integrated local run passed 22 normal browser journeys, with the two separate Auth Emulator cases skipped. Node22 backend tests passed 113 with one separate Firestore emulator skip. Earlier v1 commands apply to that original source capture; the current capture test writes only after-v2.

S21 retains the actual full-width sticky generation-review summary inherited from #65, which overlays a strip during the scrolled component capture. It was not hidden for this evidence; broader sticky containment/layout is a separate fluidity review.

- Real browser/API journeys replay S17–S21, focus/highlight the actual text, inspect persisted scoped measurement identity, reject stale draft/artifact requests, hide measurements during unsaved edits, and reject delayed font/API work after switching views.
- Empty artwork and missing dimensions stay unmeasured. Unit regressions cover individual reasons, stable IDs, duplicate/invalid IDs and existing geometry/contrast behavior.
- Existing authenticated Studio tests continue to exercise actual source edits, brand isolation, grid history and PNG bytes; they do not certify target-app rendering.
- Official Svelte MCP documentation/checker was used. App has no reported issues. Emulator retains the existing two `{@html}` warnings: only the canonical fixed SVG renderer, with XML-escaped text and fixed internal IDs, reaches those boundaries. DOM-measurement effects and the element reference were reviewed as intentional lifecycle operations.

Contrast uses the supplied base background and text fill. Approximate chrome geometry does not cover image content, every glyph, every app version, accessibility certification or actual Instagram publication. Native Penpot/Doory editable assets, external font packaging, cutout/media and final platform validation remain separate acceptance work in #39/#54/#55. No paid provider, container rollout or cloud mutation was used.

Reproduce on Node22 after a production build:

```sh
cd liquidity-studio
NODE_ENV=production npm run build
node --test server/*.test.js
CAPTURE_ISSUE68=true NODE_ENV=test npx playwright test --project=chromium
```

Capture mode overwrites only this version's controlled aftershots. Increment the evidence version for a changed fixture or new review round rather than replacing the original issue-39 baseline.
