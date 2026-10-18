# Synthetic portrait cutout checkpoint

This is a local engine investigation for [55](https://github.com/ChaiWithJai/liquidity-studio/issues/55). It does not enable background removal in Studio or authorize distribution of the Doory EditorApp. The actual pinned engine remains subject to the separate Attribution Assurance License distribution hold described in the native host specification.

## Exact weights and rights evidence

The existing U2NetP asset is 4,574,861 bytes, SHA-256 `309c8469258dda742793dce0ebea8e6dd393174f89934733ecc8b14c76f4ddd8`. Its [pinned model publisher card](https://huggingface.co/BritishWerewolf/U-2-Netp/blob/7112208dbac3a3642496c8d54e2f0f9bb3dc1dc8/README.md) explicitly applies Apache-2.0 to the model and credits rembg for the ONNX conversion. This is model-specific evidence, rather than an inference from rembg's MIT code license. The [original U2Net repository license](https://github.com/xuebinqin/U-2-Net/blob/ac7e1c817ecab7c7dff5ce6b1abba61cd213ff29/LICENSE) is Apache-2.0, and its [README](https://github.com/xuebinqin/U-2-Net/blob/ac7e1c817ecab7c7dff5ce6b1abba61cd213ff29/README.md) links the small pretrained checkpoint. That original README does not separately state a checkpoint-specific license; the mirror publisher's declaration and the original repository license are distinct evidence.

MODNet is the portrait-specific comparison candidate. Its [original authors explicitly license code, models and demos under Apache-2.0](https://github.com/ZHKKKe/MODNet/blob/28165a451e4610c9d77cfdf925a94610bb2810fb/README.md#license), excluding their GIF examples. The [pinned ONNX publisher card](https://huggingface.co/Xenova/modnet/blob/fa2fa546052fba4c08921230a26cc69a333fca12/README.md) also declares Apache-2.0 and links the original project. Tested fp32 ONNX: 25,888,640 bytes, SHA-256 `07c308cf0fc7e6e8b2065a12ed7fc07e1de8febb7dc7839d7b7f15dd66584df9`. The publisher also offers a 6,632,188-byte quantized variant; it was not downloaded or tested, and its quality is unknown.

Apache-2.0 permits distribution subject to its conditions. A distributable model package must include the license, retained author/copyright and attribution notices, conversion/change notices and any upstream NOTICE that applies. No model weights are committed in this slice. Repository/model cards are declarations by their publishers, not a guarantee about all underlying image rights. The [DUTS publisher](https://saliencydetection.net/duts/) identifies ImageNet/SUN image origins and reserves annotation copyright; this work neither redistributes training images nor asserts that a model license grants those image rights. MODNet's original authors' explicit model grant is stronger than a code-only assumption. Exact source hashes and URLs are recorded in `model-rights-evidence.json`.

## Fixture and measured behavior

The portrait was generated with the built-in image tool as a fictional adult with curly hair, separated fingers, a teal shirt and an opaque indoor background. It depicts no identified person. The original image is preserved privately; the engine receives a 768 × 768 browser-canvas resize. Its bytes and digest are recorded with the actual output. No personal portrait, external photo or procedural shape stands in for this quality check.

Both runs use Doory `27b6f68221fdbf1ef1bedc182e303210ca9e39f5`, the actual dedicated worker and ONNX WASM runtime, served only by an owned ephemeral loopback fixture. Every non-fixture origin is blocked. Four completed cold/warm/new-worker-cache/recovery passes per model produced identical output bytes within each model. Cancellation at the processing-10 checkpoint returns an AbortError; recovery succeeds. Each sequence fetched the model once. Input bytes remain unchanged. These cancellation timings measure that early checkpoint, not interruption of an already running ONNX kernel.

The U2NetP run took 2.407 seconds cold, 1.442 seconds warm and 1.479 seconds after cancellation; its cancellation acknowledgment was 0.5 ms. The MODNet comparison took 1.756 seconds cold, 1.236 seconds warm and 1.360 seconds after cancellation; acknowledgment was 0.2 ms. These are one laptop/browser fixture observations, not general latency or memory guarantees. Page heap estimates exclude worker/WASM/native allocations.

Visual inspection of both **host-pipeline** outputs retains the face, hand and shirt but finds residual edge contamination and green background fragments around curly hair when alpha-composited onto a dark background. That is not fine-hair quality acceptance. This result cannot yet be attributed solely to either checkpoint: the generic host pipeline applies min/max normalization, a guided filter and shaped alpha, whereas MODNet's official reference directly maps predicted alpha. Reference preprocessing/output comparison is recorded separately below before any model selection.

## Remaining acceptance

Cutout remains disabled. Required next evidence includes an explicit model-specific processor decision, a representative portrait/edge benchmark rather than one fixture, and production host permission/asset replacement/undo tests. The investigation has not established a transparent-background quality score without ground truth, universal hair accuracy, mobile/WebGPU performance, peak process memory, or complete source/binary distribution clearance.


## Official MODNet reference comparison

The unchanged [official ONNX reference](https://github.com/ZHKKKe/MODNet/blob/28165a451e4610c9d77cfdf925a94610bb2810fb/onnx/inference_onnx.py) was downloaded and executed locally against the **same** 768 × 768 input digest `b614ff30258ad627172f0c4c23df65718c808cec1a6917b49471c86d6a95d6da`. Script digest: `86051781d6a956b85451aa98f999688121f6d426063c9d6cfd73ca7426c73593`. The isolated Python environment used ONNX Runtime 1.23.2, OpenCV 4.12.0, NumPy 2.2.6 and Pillow 11.3.0. No PyTorch or new model conversion was required.

This reference maps RGB to `(value − 127.5) / 127.5`, preserves aspect ratio around a 512-pixel reference dimension, floors dimensions to multiples of 32, uses OpenCV area resizing and directly maps predicted alpha to uint8. The tested square input becomes 512 × 512 in both paths, so aspect distortion is not tested here. The host comparison descriptor correctly uses RGB mean/std 0.5/0.5 and 512 pixels, but Doory's generic pipeline still applies U2Net-style min/max normalization, guided refinement and shaped alpha. That is a distinct processor contract, not an equivalent MODNet implementation.

The reference and host alpha planes differ at 330,229 of 589,824 pixels, with mean absolute difference 2.677 on a 0–255 scale. This measures **agreement between implementations**, not accuracy against ground truth. Both retain the central person. The direct reference keeps softer hair transitions; neither single view establishes perfect hair separation. Edge contamination remains visible against the dark test background. Before selecting MODNet, the browser worker must implement its explicit direct-alpha processor and compare representative aspect ratios and edge fixtures to this reference.

An initial raw transparent-PNG view exposed hidden RGB and exaggerated the apparent opaque background halo. The images below are explicitly alpha-composited onto RGB(32,32,32), so their visible background is unambiguous. Hidden RGB is not foreground coverage.

| Input / actual processor | Review image |
| --- | --- |
| Synthetic input, exact model-input PNG | [Input](fixtures/synthetic-portrait-input.png) |
| U2NetP through actual host worker | [Dark composite](fixtures/u2netp-host-on-dark.jpg) |
| MODNet through actual host worker | [Dark composite](fixtures/modnet-host-on-dark.jpg) |
| MODNet official Python ONNX reference | [Dark composite](fixtures/modnet-reference-on-dark.jpg) |

## Reproduce the bounded worker sequence

Use Node 22, the Studio's locked dependencies, and the pinned Doory frontend's already installed dependencies. Source and resulting frame/worker bundles remain local under the separate distribution hold. This runner makes no downloads; provide the exact model asset whose digest is listed above. It starts and closes only its own ephemeral loopback server and Chromium instance, rejects a different source commit or altered engine source, blocks foreign browser origins, verifies model bytes before use, and saves artifacts into the supplied owned output directory.

```sh
node scripts/investigations/cutout-portrait/run.mjs \
  --source=/path/to/pinned/doory \
  --model=/path/to/u2netp.onnx \
  --portrait=docs/investigations/cutout-portrait/fixtures/synthetic-portrait-input.png \
  --output=/tmp/cutout-proof --kind=u2netp
```

Use `--kind=modnet` with the exact fp32 asset for the comparison. The harness exercises the **existing generic host processor**, not the reference-correct MODNet processor. Native EditorApp upload/replace/undo/canvas save integration remains separate acceptance; the cutout hook remains disabled.
