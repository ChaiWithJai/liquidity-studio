# Doory video result Effect cleanup investigation

This is a minimal upstream patch and a reproducible regression for issue #55. It does not change Studio's runtime or establish successful video encoding, playback, or download.

## Source and attribution

Doory is copyright © 2026 Siam, creator and maintainer. Upstream: [shaongitbd/doory](https://github.com/shaongitbd/doory). The affected [VideoResult.tsx at pinned commit 27b6f68221fdbf1ef1bedc182e303210ca9e39f5](https://github.com/shaongitbd/doory/blob/27b6f68221fdbf1ef1bedc182e303210ca9e39f5/frontend/src/editor/dialogs/video/VideoResult.tsx#L21) is subject to upstream's Attribution Assurance License. The exact upstream LICENSE and NOTICE are retained here as `LICENSE.upstream` and `NOTICE.upstream`. Existing upstream UI attribution remains required and unchanged. This investigation is not a commercial licensing determination.

Our patch changes only the Effect's expression body to a block body, so its setup returns `undefined` regardless of the scroll API's return value. The regression and runner are original investigation code.

## Observation and cause

During a local browser export of the controlled CWJ reel fixture, rendering reached the result dialog and React reported an invalid Effect return followed by `TypeError: destroy is not a function`. The Effect implicitly returned the value of `scrollIntoView`. In the observed browser that value was Promise-like. [React's Effect contract](https://react.dev/reference/react/useEffect#parameters) permits an optional cleanup function; a scroll result is not cleanup. Strict Mode's extra setup/cleanup cycle exposes this immediately.

The regression uses the real pinned component, React StrictMode, and the upstream test environment. It changes only the scroll API return value between `undefined` and a resolved Promise. Both mount/unmount without console errors after the patch. The Blob fixture is explicitly lifecycle-only and contains no encoded video.

## Reproduce without changing a running preview

Use Node 22 and an existing pinned Doory checkout with its frontend dependencies already installed:

```sh
DOORY_SOURCE_DIR=/path/to/existing/doory \
  bash scripts/investigations/doory-video-effect/check-effect.sh
```

Prerequisites: Git, ripgrep, tar, Node, and the pinned frontend's Vitest dependencies. The runner archives the pinned frontend into a temporary directory, links the retained dependencies, requires the pristine component to fail with the exact `destroy is not a function` error, applies the patch only in that temporary archive, and requires both tests to pass. It removes its temporary archive afterward. It starts no server and changes no running source or Docker resources.

Verified on Node 22.23.1 with upstream Vitest 5.0.4: pristine failure reproduced; patched **2/2 tests passed**. The same two-line body change was then applied only to the owned local investigation preview for a separate browser retry. The original pinned checkout was preserved.

## Acceptance still separate

Actual MP4/WebM/GIF download, decoding, duration, dimensions, beat timing, frame fidelity, and any audio rights must be verified on real exported artifacts. This patch and test do not establish those results, animation quality, subject cutouts, native portability, or managed commercial readiness. Issue #55 remains open pending its media acceptance evidence.
