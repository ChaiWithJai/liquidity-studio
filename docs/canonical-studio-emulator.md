# Canonical Svelte studio and measured preview

`src/App.svelte` is the single production UI. `npm run build` invokes Vite through the small compatibility entry `scripts/build-dist.js`; `dist/assets` contains the compiled output. The old independent hand-written dist application is removed. Source/compiled assets must be committed together. No external font request is required.

The current local and cloud runtime uses Google-only sign-in through Firebase Authentication. Protected requests carry a verified Google-provider Firebase ID token in the Authorization Bearer header, with explicit organization/brand scope. The app stores authorization memberships, not application password hashes or application session tokens in Google mode. Password/session-cookie mode is restricted to explicit development/test fixtures and is rejected on Cloud Run. Source review records precede generation; opening a draft never regenerates it. Structured field editors save complete formats and send the expected story revision. Switching a story, format or brand saves pending edits first; failures preserve editor text. Stale asynchronous responses cannot replace another brand's workspace.

The preview uses `server/artwork.js`, the same XML-escaped renderer used by image exports. Generated SVG is the only permitted markup at the component's `@html` boundary. Rendering/layout errors are visible rather than silently shrinking copy. Export downloads use scoped artifact URLs; PNG is real raster output for feed/story, carousel is a ZIP of four PNGs, and Reel export is a text storyboard script, not rendered video. A calendar assignment does not publish content.

The emulator provides feed, carousel, story and reel chrome; local like/save/comment/share previews; double-tap; pointer swipe/keyboard pagination; configurable caption fold; simulated current local poll vote; timer bars; a reel storyboard player/scrubber; a scrolling audio label with pause and reduced-motion support; and a 3×3 feed-infographic projection of the active post alongside actual scheduled/exported records plus explicit empty cells. Ordinary unscheduled drafts are excluded. It has no Instagram connection and does not generate real social engagement or audio/video playback. iPhone 16 Pro width is labeled 402 CSS pixels; other sizes are generic layout probes. It is an approximation rather than pixel-certified Instagram behavior.

The Reel's kinetic text and explicitly simulated waveform share the 30-second playhead. Scrubbing pauses the preview, and a new saved revision resets it. Reduced-motion preferences keep the text and bars static. These preview effects do not add sound or change exported artwork.

Preflight reads marked critical SVG text rectangles from the rendered browser, measures actual sticker/chrome obstruction rectangles, extracts text fills and the base background, and sends raw measurements to `/api/studio/preflight`. Shared `computePreflight` computes overlap, artwork overflow, aspect ratio, minimum contrast and caption fold; the server recomputes/persists results for the authorized brand. Moving Reel frames invalidate prior measurements; pause to measure a frame with its validated, persisted 0–30 second playhead. One frame cannot establish clearance for the full motion. Missing color/geometry evidence is unmeasured. The measurements are client assertions, not tamper-proof server screenshot analysis or evidence of factual accuracy. No confidence percentage or WCAG certification is inferred. The 125-character default fold is configurable; actual app truncation varies.

Run from `liquidity-studio/`:

```sh
npm ci --engine-strict
npx playwright install chromium
npm run build
node --test server/preflight.test.js server/export-assets.test.js
npm run test:browser
python3 server/krug-world-eval.py
git diff --exit-code -- dist
```

The browser suite starts a real authenticated HTTP server on an ephemeral loopback port with a temporary SQLite database and random test credentials. It exercises real save/reload/download, source review, founder/marketer permissions and foreign-scope denials. Emulator interactions and negative DOM-measurement fixtures run in Chromium; failed-generation injection is explicitly browser network interception. These tests do not establish paid-provider connectivity, Cloud Run readiness or native Instagram pixel parity.

The historical `server/navigation-test.js` entry now runs the browser suite instead of evaluating generated JavaScript in a VM. The Python source evaluator reports structural checks only and does not manufacture a usability score. CI needs dependency installation and Chromium before these entries run.

Rollback requires reverting to the matching previous compiled UI/source and verifying the backend contract. No database migration is introduced by the frontend. Do not restore the legacy unauthenticated browser flow against a public endpoint. Port 3000 was not restarted or modified during development.
