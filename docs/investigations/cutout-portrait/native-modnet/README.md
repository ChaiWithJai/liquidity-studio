# Actual Studio-hosted MODNet cutout

This is a local, private, production-compiled EditorApp fixture for issue #55. It does not enable the feature in the running Studio, distribute held upstream source, establish portrait ownership automatically, approve source claims, or prove production deployment.

The input is the generated non-personal portrait already recorded in the parent investigation. This test explicitly prepares a 384 × 384 JPEG before upload. That fixture preparation is distinct from the runtime policy: preserve the uploaded dimensions, or reject a PNG exceeding 512 KiB. Runtime resizing is not automatic.

The real editor uploads the private JPEG, saves its native image reference, and invokes the registered original MODNet worker through the upstream public seam. The actual server stores a separate PNG with input/model/processor provenance after an atomic scope, source, native-revision and rights check. The native engine replaces the selected image. Undo restores the original reference; redo, native save and reload retain the derivative. Original JPEG bytes remain unchanged.

The actual processing-phase cancel terminates the worker. Recovery with another worker yields the same PNG hash. A new iframe reaches processing using the verified persistent model cache without additional model chunks; cancellation leaves its saved image unchanged. Cold and warm timings in `metrics.json` include model delivery and native application/save, not just inference. They are one local sample, not a percentile or a 60-second human-operator benchmark. The main-realm heap measurement excludes worker/WASM peak memory.

`alpha.png` is the actual private derivative returned by the server. `on-dark.jpg` explicitly composites it on an opaque dark background to avoid confusing hidden RGB with retained background. Independent decode reports 384 × 384 RGBA, 63,762 fully transparent pixels, 8,811 opaque pixels and 74,883 intermediate-alpha pixels. Curly hair has a soft fringe; there is no ground-truth segmentation mask or claim of perfect hair quality. Comparing its alpha to the pinned official CPU ONNX script on the same JPEG gives maximum difference 1/255 and mean difference 0.0107421875/255, including browser/OpenCV JPEG decoding and WASM/CPU differences.

A separate native CWJ fixture uploads the full 768-pixel JPEG. Its cutout exceeds the policy limit and is rejected with actionable text. The native reference, original 768 × 768 asset and original bytes remain unchanged, with no extra asset stored. The existing six browser journeys also pass, including both brands/four native formats, private image export, foreign-resource rejection, concurrent native conflict, actual Studio mounting and iframe broker cleanup.

Reproduce locally after preparing the pinned source and owning the digest-pinned checkpoint:

```sh
STUDIO_NATIVE_CUTOUT_ENABLED=true \
STUDIO_NATIVE_MODNET_PATH="$OWNED_MODNET_CHECKPOINT" \
node node_modules/@playwright/test/cli.js test tests/native-editor-host.spec.js
```

Run from `liquidity-studio` with Node 22 and local dependencies. No model is downloaded by this command. The supplied checkpoint must have the exact documented hash. The private source/bundle distribution condition remains unresolved.

This extends the existing [static/media evidence](../../doory-static-media/README.md) and [static export matrix](../../53-doory-static-export/README.md); it does not rerun their separate multi-format/video/sound/typography acceptance or turn measured build time into export latency. Total browser peak memory, mobile coverage, operator timing and broader portrait quality remain limitations.
