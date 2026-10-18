# Scripted shared-control evaluation, v1

This original bounded protocol evaluation ran against source `ed4cf97`, the mounted PR89 candidate, on isolated ephemeral localhost HTTP and SQLite fixtures. It uses two authenticated test-only password sessions, owner and helper, without live users, cloud resources, paid providers or model inference. The test captures real Chromium pixels at1440×1100 alongside authenticated structured observations containing organization, brand, stable story ID, revision, timestamp and screenshot SHA256. The script chooses the action from structured data; it does not interpret pixels. This is not a visual-reasoning benchmark.

Reproduce from `liquidity-studio` with Node22 and existing dependencies:

```sh
NODE_ENV=test node node_modules/@playwright/test/cli.js test tests/helper-scripted-evaluation.spec.js --output=/tmp/liquidity-scripted-helper-evaluation
```

One final run passed in2.5seconds overall, with the test body taking1.1seconds. The20 explicitly instrumented HTTP exchanges had nearest-rank p50=2.67ms and p95=4.42ms. Login, browser rendering, screenshots and the deliberately dropped response are outside that request-latency distribution. These single-run loopback measurements are neither model latency, human task time nor production service-level objectives.

The action/result sequence is executable in the test:

1. Capture `S16-helper-observation.png` and structured current story revision.
2. Owner changes metadata through the real workspace mutation route. A helper proposal using the captured revision fails409; no overwrite occurs.
3. An out-of-grant source action and malformed null change each fail400. The story revision remains unchanged.
4. Refresh the scoped observation once, submit corrected metadata, and have the scripted owner approve the exact proposal.
5. Commit through the helper HTTP apply route but abort delivery of its response in the browser. Treat the outcome as unknown. Retry with the identical UUID key twice; recover the same receipt and exactly one helper commit.
6. Preserve the owner’s focused unfinished notes while helper work completes. No Open story lookup or navigation is used for mutation authority.
7. Approve a second proposal, pause the grant, and reject its old epoch with409. The accepted category remains unchanged.
8. Reload the helper browser and recover persisted proposal state; capture `S16-helper-result.png`.

Observed scripted correction count:1 (fresh observation after stale rejection). Scripted owner approvals:2; scripted pause interventions:1. Actual human intervention count and human usability are unmeasured, not zero. Model malformed-action rate, inference latency, model memory and autonomous task success are unmeasured. The malformed and stale inputs are deliberately injected test cases, not naturally sampled model output. A retained receipt proves one content commit within this run, not global exactly-once billing/execution. `scripted-helper-evaluation.json` contains the request/status/timing evidence; `checksums.json` binds the published artifacts. The PNGs are versioned S16-derived component fixtures, not replacements for canonical full-App S16 evidence.

# Bonsai candidate assessment

Primary sources checked October18,2026, without downloading weights or installing model runtimes:

- [Publisher model card pinned at1c6cbae](https://huggingface.co/prism-ml/Ternary-Bonsai-2-2B-mlx-2bit/blob/1c6cbae21f8c38830ce337972b46fdae7b18eaaa/README.md) identifies this specific Bonsai2 2B release as image-text-to-text, Apache2.0, with an FP16 vision tower and approximately1.20GB packaged weights. It documents MLX/Metal with mlx-vlm0.7.8+; disk size does not establish peak memory. Thus “Bonsai2B has no documented vision” would be inaccurate for this release. This does not establish screenshot accuracy, browser WebGPU support or compatibility with our action schema.
- [Publisher demo vision guide pinned atdb871ea](https://github.com/PrismML-Eng/Bonsai-demo/blob/db871ea96bffff5ce5609873c412b75d7cd5ba3c/VISION.md) describes27B image handling and warns about fine-detail loss under image-token caps. Its27B measurements must not be attributed to2B.

Candidate status: documented vision-capable native-runtime candidate, unselected and unexecuted here. A future comparison must pin weights/runtime/license, use the same stale/malformed/pause/unknown-result corpus, validate structured actions server-side, and measure screenshot interpretation separately from protocol recovery. No model may supply identity, approval or authority. Browser-local multiplayer/WebGPU feasibility remains a separate implementation question; this experiment neither adds a model endpoint nor certifies it.
