# Fixture-only Bonsai evaluation

Run from repository root on supported Apple Silicon, after checking RAM/disk headroom. No application endpoint is configured. This script only writes model outputs; it never applies actions. The model download is about1.21GB, runtime additional. It is not part of normal CI.

```sh
uv venv /tmp/liquidity-bonsai-runtime --python 3.12
uv pip sync --python /tmp/liquidity-bonsai-runtime/bin/python tools/helper-benchmark/requirements.lock.txt
HF_HOME=/tmp/liquidity-bonsai-hf HF_HUB_DISABLE_IMPLICIT_TOKEN=1 hf download prism-ml/Ternary-Bonsai-2-2B-mlx-2bit --revision 1c6cbae21f8c38830ce337972b46fdae7b18eaaa --local-dir /tmp/liquidity-bonsai-model --exclude 'runtime/*' --max-workers 1
HF_HOME=/tmp/liquidity-bonsai-hf HF_HUB_OFFLINE=1 TRANSFORMERS_OFFLINE=1 /tmp/liquidity-bonsai-runtime/bin/python tools/helper-benchmark/bonsai_eval.py --model /tmp/liquidity-bonsai-model --evidence docs/design-review/issue-70/scripted-v1 --output /tmp/bonsai-results.json
```

The optional single correction command uses the exact published experimenter feedback:

```sh
HF_HOME=/tmp/liquidity-bonsai-hf HF_HUB_OFFLINE=1 TRANSFORMERS_OFFLINE=1 /tmp/liquidity-bonsai-runtime/bin/python tools/helper-benchmark/bonsai_eval.py --model /tmp/liquidity-bonsai-model --evidence docs/design-review/issue-70/scripted-v1 --output /tmp/bonsai-correction.json --only stale --feedback 'Use exactly one allowed decision enum (propose, refresh, reject), never review. Read observedTitle from the row beginning Current story, not the explanatory paragraph. Do not change any authority or revision rules.'
```

No model required for strict scorer regression or historical rescoring:

```sh
python3 -m unittest discover -s tools/helper-benchmark -p test_score.py
python3 tools/helper-benchmark/score_results.py --initial docs/design-review/issue-70/bonsai-v1/initial-raw-results.json --correction docs/design-review/issue-70/bonsai-v1/correction-results.json --observations docs/design-review/issue-70/scripted-v1/scripted-helper-evaluation.json
```

The scorer is specific to this fixture's visible title; it is not an authentication, factual-verification or production safety module. All original outputs and first-pass scoring caveats are retained in the report. No weights are redistributed.
