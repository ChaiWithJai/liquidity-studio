# Native cutout processing

Status: implementation in progress for issue #55. The native host and cutout remain disabled by default. This document does not authorize distribution of the held Doory source or bundles.

Studio registers an original background-remover implementation through the pinned upstream engine's public registration seam. The upstream editor continues to own image selection, replacement history, undo, and native save. The implementation does not replace the actual EditorApp with another canvas.

## Processing and output

The selected checkpoint is Xenova/modnet at `fa2fa546052fba4c08921230a26cc69a333fca12`, SHA-256 `07c308cf0fc7e6e8b2065a12ed7fc07e1de8febb7dc7839d7b7f15dd66584df9`. No model bytes are checked into this repository. The [pinned MODNet README](https://github.com/ZHKKKe/MODNet/blob/28165a451e4610c9d77cfdf925a94610bb2810fb/README.md#license) expressly covers code, models and demos under Apache 2.0, with its stated GIF exception. The [conversion publisher's card](https://huggingface.co/Xenova/modnet/blob/fa2fa546052fba4c08921230a26cc69a333fca12/README.md) declares Apache 2.0. This does not establish rights to training images or an operator's uploaded portrait. A distribution must retain the applicable Apache text and attribution; the independent Doory license condition remains unresolved.

The original processor follows the pinned [official ONNX reference](https://github.com/ZHKKKe/MODNet/blob/28165a451e4610c9d77cfdf925a94610bb2810fb/onnx/inference_onnx.py): RGB normalization to -1 through 1, shorter-side reference sizing and 32-pixel stride, area resampling, planar float32 input, output-alpha truncation before resizing, and no contrast stretching. Existing alpha can only decrease. The processor preserves input RGB values and pixel dimensions. Browser PNG encoding may clear hidden RGB under fully transparent pixels; the original private asset remains byte-for-byte unchanged. Input is bounded to four megapixels, at least 32 pixels per dimension, and at most a 2:1 aspect ratio to bound model memory.

The default output policy is **preserve resolution or reject**. PNG output exceeding 512 KiB is rejected before asset upload or native replacement. There is no automatic resize, JPEG conversion, or original overwrite. A future explicit resizing choice must disclose its new dimensions and maintain a separate derivative; it is not implemented by silently changing this contract.

A dedicated worker uses the pinned ONNX Runtime Web WASM implementation, with a single thread. Cancel terminates the owned worker, including its running kernel, and fences late messages from a replacement worker. This is stronger than merely rejecting the UI promise. The default application bundle must exclude the worker/runtime/model assets, just as it excludes held editor code.

## Private asset and revision boundary

The integration uses only the captured scoped dispatcher and bounded typed broker operations. No bearer token, arbitrary URL, model filesystem path, or external resource origin is supplied to the iframe. Operator configuration selects a digest-verified local checkpoint; model chunks pass through authenticated operations and are independently verified before inference. Browser cache entries require full digest verification before reuse.

Before inference and before storing its derivative, the server validates current organization/brand membership, source approval and generation revisions, native revision, the selected private input asset's document membership, and rights/consent. Output records label execution as browser-reported, not server-attested inference. Server validation covers scope, source/native revisions, input hash, rights, dimensions and output hash. Records retain input hash, model hash, processor version, preserved-resolution policy, and producing principal. These are provenance, not clinical/source approval. Native replacement changes a proposal only; it never changes the immutable generation, automatically approves, marks Exported, or publishes.

Uncertain writes retain their exact idempotency key. Source/native conflicts leave the original and local draft intact. Native engine undo must restore the original private reference. Revocation, scope switch, iframe reload and unmount must stop in-flight work and suppress late results. The original exporter remains available.

## Current evidence

`modnet-reference/reference-report.json` records an actual CPU checkpoint comparison for five aspect/edge variants of the synthetic portrait. The original JS preprocessing differs from OpenCV by at most 1.2e-7; final alpha differs by at most one level out of 255. Original RGB is unchanged. Run `scripts/investigations/modnet-reference-check.py` with explicitly supplied local checkpoint and image paths to reproduce it. This proves numerical agreement within the stated tolerance, not segmentation accuracy, browser latency, or completed native replacement. Actual private EditorApp replacement, cancellation, undo/redo and reload have passed in the local fixture; final frozen-head regression and independent review remain pending.


## Operator configuration and remaining limits

`STUDIO_NATIVE_CUTOUT_ENABLED=true` and an explicit `STUDIO_NATIVE_MODNET_PATH` select the already-owned checkpoint for a local native-enabled build. The default provider does not read any filesystem path. A missing, altered or wrong-sized checkpoint fails closed without exposing the private path. These are operator settings, not request fields. This does not enable public distribution of the held editor.

The broker binds preparation to its current document and acknowledged native revision, and accepts completion only for an intent issued to that frame. A scoped atomic transaction validates identity membership, canonical source state, native snapshot, input asset and retained intent before committing derivative metadata. Source or rights drift does not leave an uploaded derivative. Private immutable blob cleanup follows the existing asset storage boundary. The original engine then replaces the selected image and owns the native history; storing a derivative alone does not change the document.

Cancel terminates the owned worker. Warm recovery creates another worker using verified model bytes and must produce the same output for the same input. An ambiguous derivative upload retains its exact output and key for retry, without another inference. Different-image retry is blocked until that uncertain upload is resolved.

The frame adds only `blob:` to its existing same-origin connection policy for private image reads and `wasm-unsafe-eval` for the WASM runtime. Foreign origins remain disallowed. The frame remains trusted same-origin code, not an authentication sandbox. The main Google sign-in policy is unchanged.

The fixture explicitly prepares a 384-pixel source JPEG before upload; that test preparation is not an automatic runtime resize. Reported main-realm JavaScript heap excludes the dedicated-worker and WASM peak. Total browser peak memory, phone/GPU coverage, and segmentation quality against a ground-truth portrait mask are not established by these tests. The image rights declaration is an operator assertion, not a machine verification of ownership.
