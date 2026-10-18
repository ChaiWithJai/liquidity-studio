# Doory guest build experiment

Evidence recorded 2026-10-18 UTC for issue 39. This is an actual dependency/build and loopback HTTP experiment, not a native editor roundtrip, account integration or Penpot compatibility result.

| Boundary | Observed evidence |
|---|---|
| Source | [Doory 27b6f68221fdbf1ef1bedc182e303210ca9e39f5](https://github.com/shaongitbd/doory/tree/27b6f68221fdbf1ef1bedc182e303210ca9e39f5), disposable detached worktree; original inspected clone unchanged. |
| Toolchain | Existing Node 22.23.1. No new global tools. Manifest declares no root Node engine; locked Vite 8.3.4 requires 20.19+ or 22.12+, locked Vitest 5.0.4 requires 22.12+/24/26. |
| Dependency truth | Package-lock v3 pins **Fabric 7.4.0**, distinct from manifest range `^7.2.0` and contrary to the supplied Fabric 6 assumption. Use the lock version when designing a future scene converter. |
| Install | `npm ci --ignore-scripts --engine-strict --no-fund` exited 0, 422 packages, npm audit 0 at this snapshot. Dependency lifecycle scripts did not run. This does not establish license clearance or general security. |
| Native build | Unmodified `npm run build` ran `tsc -b && vite build` successfully. Vite's bundling phase reported 1.45 seconds; TypeScript and installation are additional. This timing is not an editor export latency, a <15ms scene bundle target or a human 60-second completion result. |
| Guest support | [README](https://github.com/shaongitbd/doory/blob/27b6f68221fdbf1ef1bedc182e303210ca9e39f5/README.md) describes account-free designs/images saved in the browser. Source routes include `/create` and `/local/:localId`; account designs, sharing and brand kits have separate backend/auth boundaries. |
| Preview | Production Vite preview bound only 127.0.0.1:39006 with strict port selection. Root and `/create` returned 200. Root operator owns the browser walkthrough; no Playwright/UI automation was used for this build experiment. |
| Network isolation | `VITE_API_PROXY=http://127.0.0.1:1` overrides the upstream default localhost:8000 for API/media/admin/static/WebSocket routes. `/api/auth/me/` returned 502 against this intentionally unavailable target. No Doory backend was launched and no unrelated local service was used. |
| Runtime scripts and native modules | Ignoring install scripts may leave native development/test modules such as canvas unavailable; only the actual production build and HTTP boundaries above were exercised. No claim that the complete upstream test suite passed. |
| Licensing and assets | Existing upstream LICENSE/NOTICE and attribution remain intact. No copyrighted athlete/teacher photographs, proprietary brand fonts or model weights were added. Future visual fixture should use operator-authored text, rectangles and a rights-cleared image. |

Reproduction in a disposable checkout: use the pinned source and an existing compatible Node 22 binary; install with lifecycle scripts disabled; run the unmodified build; then `VITE_API_PROXY=http://127.0.0.1:1 npm run preview -- --host 127.0.0.1 --port 39006 --strictPort`. Do not run the README's system package/daemon setup for this guest experiment. Stop only the owned preview process when the browser investigation is complete; do not touch the Studio 3001 volume or application.

Remaining acceptance: create an original two-page fixture in the real guest UI, edit visible text, close/reopen from browser storage, export a real PNG and native document if supported, inspect dimensions/page order/fonts/hash, and retain required attribution. A working guest document does not prove signed-in Django ownership, multi-user collaboration, server backup, Studio token mapping, GCS interoperability, source-reviewed content or Penpot import. Background-removal model execution and actual MP4/WebM/GIF encoding remain separate authorized experiments with their own asset/license/network evidence. Issue39 stays open.
