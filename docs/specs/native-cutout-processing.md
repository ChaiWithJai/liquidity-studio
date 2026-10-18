# Native cutout processing

Status: implementation in progress for issue #55. The native host and cutout remain disabled by default. This document does not authorize distribution of the held Doory source or bundles.

Studio registers an original background-remover implementation through the pinned upstream engine's public registration seam. The upstream editor continues to own image selection, replacement history, undo, and native save. The implementation does not replace the actual EditorApp with another canvas.

## Processing and output

The selected checkpoint is Xenova/modnet at `fa2fa546052fba4c08921230a26cc69a333fca12`, SHA-256 `07c308cf0fc7e6e8b2065a12ed7fc07e1de8febb7dc7839d7b7f15dd66584df9`. No model bytes are checked into this repository. The [pinned MODNet README](https://github.com/ZHKKKe/MODNet/blob/28165a451e4610c9d77cfdf925a94610bb2810fb/README.md#license) expressly covers code, models and demos under Apache 2.0, with its stated GIF exception. The [conversion publisher's card](https://huggingface.co/Xenova/modnet/blob/fa2fa546052fba4c08921230a26cc69a333fca12/README.md) declares Apache 2.0. This does not establish rights to training images or an operator's uploaded portrait. A distribution must retain the applicable Apache text and attribution; the independent Doory license condition remains unresolved.

The original processor follows the pinned [official ONNX reference](https://github.com/ZHKKKe/MODNet/blob/28165a451e4610c9d77cfdf925a94610bb2810fb/onnx/inference_onnx.py): RGB normalization to -1 through 1, shorter-side reference sizing and 32-pixel stride, area resampling, planar float32 input, output-alpha truncation before resizing, and no contrast stretching. Existing alpha can only decrease. The original RGB and pixel dimensions are preserved. Input is bounded to four megapixels, at least 32 pixels per dimension, and at most a 2:1 aspect ratio to bound model memory.

The default output policy is **preserve resolution or reject**. PNG output exceeding 512 KiB is rejected before asset upload or native replacement. There is no automatic resize, JPEG conversion, or original overwrite. A future explicit resizing choice must disclose its new dimensions and maintain a separate derivative; it is not implemented by silently changing this contract.

A dedicated worker uses the pinned ONNX Runtime Web WASM implementation, with a single thread. Cancel terminates the owned worker, including its running kernel, and fences late messages from a replacement worker. This is stronger than merely rejecting the UI promise. The default application bundle must exclude the worker/runtime/model assets, just as it excludes held editor code.

## Private asset and revision boundary

Planned integration uses only the captured scoped dispatcher and bounded typed broker operations. No bearer token, arbitrary URL, model filesystem path, or external resource origin is supplied to the iframe. Operator configuration selects a digest-verified local checkpoint; model chunks pass through authenticated operations and are independently verified before inference. Browser cache entries require full digest verification before reuse.

Before inference and before storing its derivative, the server must validate current organization/brand membership, source approval and generation revisions, native revision, the selected private input asset's document membership, and rights/consent. Output records retain input hash, model hash, processor version, preserved-resolution policy, and producing principal. These are provenance, not clinical/source approval. Native replacement changes a proposal only; it never changes the immutable generation, automatically approves, marks Exported, or publishes.

Uncertain writes retain their exact idempotency key. Source/native conflicts leave the original and local draft intact. Native engine undo must restore the original private reference. Revocation, scope switch, iframe reload and unmount must stop in-flight work and suppress late results. The original exporter remains available.

## Current evidence

`modnet-reference/reference-report.json` records an actual CPU checkpoint comparison for five aspect/edge variants of the synthetic portrait. The original JS preprocessing differs from OpenCV by at most 1.2e-7; final alpha differs by at most one level out of 255. Original RGB is unchanged. Run `scripts/investigations/modnet-reference-check.py` with explicitly supplied local checkpoint and image paths to reproduce it. This proves numerical agreement within the stated tolerance, not segmentation accuracy, browser latency, or completed native replacement. Browser/native integration acceptance remains pending.
