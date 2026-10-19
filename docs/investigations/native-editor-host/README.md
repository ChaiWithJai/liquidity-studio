# Studio-owned native host: local evidence

This slice adds an opt-in original Studio host around the actual pinned Doory `EditorApp` and engine. It does not integrate Django sessions or claim external SSO. See the [network, storage and license specification](../../specs/studio-native-editor-host.md), [source inventory](../../specs/doory-host-source-inventory.json) and [direct dependency inventory](../../specs/doory-host-dependency-inventory.json).

The originally inspected [pinned license](https://github.com/shaongitbd/doory/blob/27b6f68221fdbf1ef1bedc182e303210ca9e39f5/LICENSE) was unsigned. Upstream subsequently supplied a [cryptographically verified signed license](../doory-signed-license/README.md); the missing upstream signed-text evidence is resolved. Reconciling that notice basis with the retained private source/artifacts and their accompanying notices remains separate. Copied upstream source, its local frame bundle and license file are not included in this public change. Source preparation preserves the exact bytes locally, and launch attribution remains visible. No distribution or commercial clearance is inferred from that preservation.

## What was exercised

Author-run local Chromium used production-compiled temporary bundles, a real ephemeral Node HTTP server and SQLite, and a disposable password-mode QA identity. Fixture data is an explicitly approved synthetic test excerpt, not clinical or factual evidence. No Google account, paid model, model weights, cloud mutation or protected running port was used.

- Both brands and four formats produced eight native documents with eighteen initial pages. Actual canvas interaction changed an existing headline in every document, then Studio saved and reloaded it.
- The actual native image chooser uploaded an owned procedural raster after a rights/consent declaration. Its private authenticated bytes matched the input. The image remained an opaque scoped reference through native save/reload. Actual upstream quick-PNG download decoded as 1080 × 1350. That quick action exports transparency, and the deliberately centered procedural image obscures copy; this is operational proof, not final layout approval.
- A pasted Fabric pattern referenced another loopback origin. Its own URL appeared in a CSP violation report, the sentinel server received zero requests, explicit native save returned 422, and the saved revision stayed unchanged.
- A second HTTP writer advanced the native revision while the canvas had local edits. Native save returned 409 and preserved the other writer. The actual upstream “Reload latest” action reopened saved state.
- The actual Studio App opened/resumed the proposal, blocked navigation while a save response was delayed, returned to its original exporter after saving, and reopened the same native work. The original generated headline remained unchanged. This regression also catches acknowledgment-driven canvas remounts.

An additional real iframe-reload regression checks that the parent message listener count remains one and that text saved before reload returns in the actual editable canvas. Replacement disposes the old broker/watchdog and initializes from the latest acknowledged native snapshot.

The exact run metadata is recorded in `local-evidence.json`. Evidence is author-run and awaits independent review. No claim of live Google/native acceptance or deployed native availability follows from these fixtures.

## Reproduce locally

Use Node 22 and a local checkout of Doory at `27b6f68221fdbf1ef1bedc182e303210ca9e39f5`. Do not distribute that prepared source or resulting bundle while the condition above is unresolved.

```sh
cd liquidity-studio
npm ci --ignore-scripts
node scripts/prepare-native-editor.mjs /path/to/pinned/doory
NODE_ENV=test node --test server/native-editor*.test.js
NODE_ENV=test node node_modules/@playwright/test/cli.js test tests/native-editor-host.spec.js --project=chromium --output=/tmp/native-host-proof
```

The test builds its own private production bundle and closes/removes only its owned fixture server, SQLite state and temporary build directory. PNG output remains in the chosen Playwright output directory. Missing local source produces an explicit skip rather than a simulated editor. `STUDIO_NATIVE_EDITOR_ENABLED` defaults off. `STUDIO_NATIVE_EDITOR_LOCAL_BUILD=true` is a local preparation/build switch, not a license clearance switch.

## Requirements still open

Issues [52](https://github.com/ChaiWithJai/liquidity-studio/issues/52), [55](https://github.com/ChaiWithJai/liquidity-studio/issues/55), [56](https://github.com/ChaiWithJai/liquidity-studio/issues/56), [57](https://github.com/ChaiWithJai/liquidity-studio/issues/57) and [39](https://github.com/ChaiWithJai/liquidity-studio/issues/39) remain open for their remaining acceptance. This slice does not prove external identity/room transport, native multiplayer, complete native asset/font archive ejection, replay-safe final approvals, live Google native usage, or every upstream media/shape/control path. Native documents and asset records are separate scoped keys; existing credentialless ejection does not yet include them. Historical payload reclamation is also pending. Source/brand and native keys are not one distributed transaction.

Cutout remains unregistered. No portrait or redistribution-rights proof is added here. Static timecoded reel boards are not an executed reel, and this host slice does not repeat or supersede the separate upstream media evidence. Native save/download never changes source approval, campaign generation, `Exported`, scheduling or publication state. The original exporter remains the rollback path; no native production rollout is authorized by these local results.

Independent review follow-up: ambiguous HTTP 5xx responses now retain the identical save intent/key and block a different write until recovery. Six focused adapter/broker/build tests passed. The original-only audit is now enforced by the default Vite plugin's `generateBundle` hook, with negative regressions for upstream modules and emitted frame/license assets; the earlier 152-module run above was a manual audit. A normal production build reran the enforced guard after this change.

Hosted build diagnosis: Ubuntu and macOS initially differed only in placement of a duplicated Google Apache legal comment; their executable code was identical. Vite now asks esbuild to collect legal comments at the end of the bundle, then an original post-render hook sorts that footer before Rollup computes its content hash. All unique pre-change legal notices were checked as retained. The generated-asset equality gate remains enabled, and a failure-only public bundle artifact makes future mismatches inspectable.
