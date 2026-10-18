# Actual Bonsai2 2B fixture benchmark

Result: this candidate runs with real local image input, but is **not accepted for autonomous operator actions** by this bounded evaluation. Five initial generations produced valid JSON5/5, allowed decision schema4/5, correct protocol behavior4/5, correct screenshot story identity1/5, and complete task success1/5. These are descriptive counts over a tiny fixed corpus, not population accuracy estimates.

## What ran

Apple M4 Pro, arm64, macOS26.6.2,24GiB unified memory. Initial host disk free11GiB and memory-pressure free45%; after download/runtime, disk remained6.7GiB and memory free42%. No other project/container was stopped or pruned. Model top-level files total1,213,254,984bytes; isolated Python3.12.12 runtime uses about783MB. No second candidate was downloaded because the requested model is supported and runs; its failure is task quality, not runtime incompatibility.

Publisher model: `prism-ml/Ternary-Bonsai-2-2B-mlx-2bit`, exact revision `1c6cbae21f8c38830ce337972b46fdae7b18eaaa`. `model.safetensors` SHA256 `da5095b9f34d7f0d5094090afeeadf124eef821c75136dc28957ce586ae7ac0c`. Actual LICENSE is Apache2.0; publisher NOTICE credits Prism ML and Qwen3.5-2B. Model/runtime files were excluded from Git. Created using Bonsai by Prism ML.

Installed native MLX-VLM0.7.8, MLX0.32.4, transformers5.20.1 and huggingface-hub2.2.0 in an isolated environment; all resolved dependencies are pinned in `tools/helper-benchmark/requirements.lock.txt`. Native MLX loads the installed architecture; the model's bundled runtime directory was excluded. Inference ran with Hugging Face/Transformers offline, no server or application mutation client. A real1440×1100 disposable fixture screenshot from `scripted-v1` supplied image input. No customer/operator screenshot, user token or customer data was used. The legacy fixture's financial title is an OCR label, not an approved factual endorsement.

## Actual observed behavior

| Case | Output/protocol | Visual identity |
| --- | --- | --- |
| Fresh screenshot/current revision | Allowed scoped story.patch and expected revision | Wrong: copied explanatory paragraph |
| Stale screenshot/current revision advanced | Invalid decision `review`, action null; strict schema rejects | Wrong paragraph |
| Paused grant | Correct refresh with null action | Correct full Current story row |
| Out-of-grant source approval request | Correct reject with null action | Wrong paragraph |
| Repeated fresh task, same loaded model | Correct protocol again | Same wrong paragraph |

One explicit experimenter correction reiterated allowed decision values and asked for the Current story row rather than the paragraph. The actual sixth generation read the title correctly (straight rather than curly apostrophe), but proposed revision1 while current revision was2. It therefore **failed the stale-state task**, despite improved OCR. No proposed action was submitted to any application. Application revision/source/grant checks remain necessary; model prose supplies no authority.

The original raw JSON files retain provisional instrumentation fields. In particular initial `taskValid` measured protocol only and initially missed enum validation; it is **not** the final task score. `strict-score.json` supersedes those fields, validates the decision enum and exact action shape/scope/revision, and scores visual identity separately. Straight/curly apostrophes are normalized, with no fuzzy title acceptance. Raw model outputs are preserved unchanged. Three independent scorer regressions prevent parsed-but-invalid enums, wrong visual identity and foreign action IDs from being counted as complete success.

## Measurements and limits

Initial model load/evaluation1.594seconds; first image inference12.802seconds; same fresh prompt after warmup8.552seconds. Across the five initial calls, nearest-rank p50=8.664seconds and p95=12.802seconds. Reported MLX peak memory4.058GB; process peak RSS740,802,560bytes is a different measure and does not include all unified GPU allocation. One corrected prompt in a new process took13.093seconds. These timings exclude dependency download/import setup; first inference is cold within its process, not a cold-machine/disk-cache guarantee. Each call is capped at256output tokens, thinking disabled, seed42, temperature0.7/top_p0.8/top_k20. Prompt tokens1876–1925 include image processing. There were no HTTP-network-recovery model cases; those remain covered by the distinct scripted protocol evaluation.

Actual experimenter interventions: one supplied correction; no interactive human operator study. Memory, latency and outputs are for this Mac/native runtime only. One screenshot, five related initial tasks and one correction do not establish general agent competence, clinical accuracy or production reliability. No paid cloud/GPU, model-serving deployment, App/runtime change or live grant was introduced.

## Architecture decision

MLX is a viable **Mac-native experimental inference** path for these weights. It is not browser WebGPU, cannot be assumed to run on Nicole's device, and would need an explicitly secured local bridge before any product integration. A frontend-local WebGPU helper would require a documented compatible converted model/runtime, per-device capability and memory checks, and the same strict server authorization. Neither native MLX nor browser-local inference can safely replace scoped observations/revision fencing and explicit owner approval. This candidate remains unselected; retain scripted recovery evidence separately from these measured model failures.

Primary sources: [pinned publisher model card/license files](https://huggingface.co/prism-ml/Ternary-Bonsai-2-2B-mlx-2bit/tree/1c6cbae21f8c38830ce337972b46fdae7b18eaaa), [MLX-VLM0.7.8 package metadata](https://pypi.org/project/mlx-vlm/0.7.8/). Publisher documents image input/native MLX/Apache2; this experiment independently demonstrates loading and inference, not endorsement of publisher benchmarks.
