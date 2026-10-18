# Original emulator plan fidelity audit

Compared the owner's `instagram_emulator_feature_plan.md` with main8417d5f and its actual Svelte, artwork, preflight and browser tests. This audit preserves the requested behavior while separating proposed confidence language from measured evidence. The owner source remains in its original private location; it is not copied into the public repository.

| Requested surface | Current implementation and limit |
| --- | --- |
| Design/In-Situ toggle and phone sizing/zoom | `Emulator.svelte` modes, responsive width selector and zoom. An approximate layout probe, not pixel-certified Instagram or hardware emulation. |
| Feed header, engagement, double-tap, caption expansion | Implemented local interactions; configurable125-character fold. No real counters, share or Instagram connection. |
| Four-page carousel badge/dots/swipe/arrows | Implemented with pointer and keyboard navigation; renderer uses approved generated copy rather than hardcoded financial examples. |
| Story timer/header/poll/reply | Four simulated5-second timer segments and local poll selection. Current vote can be changed locally; percentages represent that single current vote, not audience statistics. No sent message. |
| Reel rail/gradient/follow/vinyl/scrubber | Three timed storyboard beats with clock-driven kinetic SVG text, pause-on-scrub and explicitly simulated pacing bars. Reduced motion keeps text and bars static. These are preview effects, not generated audio or rendered video. |
| Scrolling audio label | Previously static since754f042. This change adds visual scrolling, a pause/resume control and a static reduced-motion fallback. It neither adds audio nor changes exported content. |
| Safe zones, caption ruler, contrast/aspect evidence | Browser SVG/overlay rectangles and color evidence feed shared server-recomputed preflight with revision/generation/view identity. Missing evidence is unmeasured; client measurements are not trusted screenshot analysis. |
| Profile3×3 alongside history | Active infographic projection plus actual Scheduled/Exported history and empty cells. Ordinary unscheduled drafts excluded. Legacy scheduled weekdays are explicitly weekday data, not invented dates. This grid is not carousel/Story/Reel verification or Instagram publishing. |
| QA gate | Real Chromium workflows and structural Python checks exist. Neither is a human usability score, native Instagram certification or factual verification. |

The plan's synthetic98.5confidence,100%clearance target and “100%Trunk Test” wording are not acceptance evidence. Actual occlusion/contrast/fold results can fail; they require review. Hardcoded clinical/financial examples do not become approved claims merely because the plan contains them. Source review and domain generation gates remain authoritative.

## Commit and dependency trace

754f042 introduced the canonical Svelte emulator, including the static Reel audio label and the original broad chrome surfaces. dc03b8a added authenticated browser/preflight verification and the canonical documentation whose cookie-session statement later became stale under Google-only runtime. Later4a51a3f/f69527b bound actual font/timing/native-overlay measurements; bc338a1 restricted the grid to real scheduled/exported history; a5cfec3/e72479c made artifact identity and revision-bound issue location explicit. The current change repairs the remaining bounded marquee presentation omission and current documentation, without reopening source approval, authentication or export architecture.

Upstream: persisted approved campaign, brand renderer and scoped current identity. Downstream: local visual chrome and preflight obstruction measurement; Reel downloads remain text storyboard scripts. The label is still within `.reel-meta`, so the existing overlay measurement covers its actual containing geometry. Rollback: revert matching source/generatedassets; no data migration or credential change.

## Verification and outstanding limits

Focused actual Chromium regression uses an ephemeral authenticated SQLite/test fixture, generates controlled synthetic source-backed content, opens the canonical Reel view, observes actual changing CSS transform, pauses/resumes it, switches reduced-motion preference, confirms animation stops and duplicate/control visuals hide, and checks no audio/video media element exists. Production build succeeds. Official Svelte MCP reports no issues for the new component; the host retains its previously reviewed `@html` SVG boundary warnings (XML-escaped `server/artwork.js` output only), with no new markup injection.

The original kinetic-text and simulated waveform omission is addressed in the new source; its hosted and ordinary Neo acceptance must be recorded before closing #24. Exact native-app fidelity, generated sound and rendered video remain separate, unproved requirements. Real customer account acceptance, Nicole's Google sign-in, model visual reasoning and human usability are not established by this local fixture or by the original plan. No live runtime/cloud/port3000/3001 change is included.

The playhead drives the SVG text transforms and pacing bars together. Scrubbing pauses; changing the saved revision or format resets playback. Moving frames invalidate prior preflight and cannot be measured. Paused measurements include a bounded 0–30 second `playheadSeconds` in their server-validated, persisted view context. This is a single measured frame, never whole-motion clearance. Existing saved preflight contexts without a playhead remain supported. The canonical exported SVG and source copy are unchanged by these preview-only transforms.

Actual Node22 Chromium results: `tests/emulator-marquee.spec.js`1/1PASS (2.0s); existing `tests/studio.spec.js --grep 'saved edits, download and all interactive'`1/1PASS (3.7s), covering saved/reloaded edits, PNG bytes and all interactive surfaces. These are isolated test-auth fixtures, not current live Google acceptance.
