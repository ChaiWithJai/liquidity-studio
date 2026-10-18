## Goal

Own Liquidity Studio as an operable service. Keep this issue open as the queue entry point while new issues arrive. Baseline imported at 9d8e5f0; no earlier application history exists.

## Current implementation and verification

Main implements canonical Svelte/Vite UI, Google-managed identity with server-owned authorization, SQLite persistence, the async Firestore/GCS adapter, source-controlled generation, real artifacts, feedback lineage, discovery/job contracts and recovery tooling. The dated status below separates local/CI evidence from live cloud acceptance.

### Operational snapshot: 2026-10-18 00:11 UTC

Operator-reported evidence, corresponding to 2026-10-17 in America/New_York:

| Surface | Recorded result | Remaining acceptance |
| --- | --- | --- |
| Source and CI | Main source [`6937c53`](https://github.com/ChaiWithJai/liquidity-studio/commit/6937c5338887d65d017d8c93dac2a9f2f79906c4); its [hosted verification run](https://github.com/ChaiWithJai/liquidity-studio/actions/runs/39080934440) passed. | A passing CI run does not establish live-user or cloud-revision acceptance. |
| Final local image | `sha256:1940959dac8ce3859a62d9af4e1069b154b745c33af44bbb7ddbc7e0558b604a` passed real Google sign-in, provider generation, export and restore in Docker. | Retain exact-image evidence when changing source or runtime configuration. |
| Cloud routing | Revision `00003-mos` is staged with the final image on its tagged URL; canonical traffic remains 100% on `00001-wud`. | Promotion has not occurred. Tagged access is reachable and billable even without canonical traffic. |
| Managed Google sign-in | Provider enabled; founder confirmed real Google sign-in on the final tagged revision. | Invited marketer's actual account and outsider acceptance checks remain pending/in progress. |
| Cloud data and generation | A previous cloud image passed actual Vertex generation, GCS-backed export and restore. | Final-image cloud provider and recovery checks are still in progress; prior-image results are not substituted. |
| Spend controls | USD100 all-service project alert budget, USD20 Cloud Run cap and USD70 Vertex cap configured. | Cap enforcement is delayed; this is not a guaranteed hard USD100 aggregate ceiling, and other services still incur charges. |

The pilot and queue tracker remain open while these acceptance checks continue. Public documentation excludes personal addresses, billing identifiers, credentials and private evidence artifacts. See [GCP operational prerequisites](gcp-prerequisites.md) for infrastructure/history and [deployment gates](deployment-evidence-contract.md) for the unchanged evidence contract.

Historical checkpoint (earlier 2026-10-17): the integrated delivery branch had local browser/container and Firestore emulator evidence while final remote CI and independent review were still release gates. Subsequent merged changes and the current CI result supersede that checkpoint's pending status; the original implementation sequence below remains historical context.

The dependency ordering below records the delivery sequence. It is not a list of unimplemented modules or a renewed approval gate. The founder authorized execution of the epic; broader commercial and licensing choices remain explicitly undecided.

## Execution order and dependencies

- First wave, parallel: #1 draft navigation, #3 generation integrity, #6 truthful health and telemetry. These are narrow changes that can be independently verified.
- #4 API protection precedes public application hosting and authenticated batch scheduling (#9).
- #2 durable repository and telemetry precedes restart-safe operation, durable feedback export (#10), and reliable multi-instance batch work (#9).
- #7 authoritative build and reproducible CI supports browser regressions (#8) and all subsequent UI work.
- #5 actual asset exports depends on preserved drafts (#1), trustworthy content (#3), and persistent export metadata (#2). Asset rendering can be designed independently.
- #10 full feedback export requires stable generation IDs (#3) and durable telemetry (#2); never treat source-code QA scores as factual verification.
- #11 startup/shutdown and container contract must be complete before deployment; coordinate with health (#6) and storage flush (#2).

## System flow

Browser → canonical Svelte/Vite dist UI → Node HTTP controllers → use-case services → repository / AI gateway / telemetry → previews, calendar, exports, admin and feedback datasets.

The RFC originally named Cloud Run, Firestore, GCS, Scheduler and BigQuery as intended dependencies. Firestore/GCS have adapter, emulator and recorded live-cloud evidence at the revision scope described above; worker/scheduler authentication and configuration contracts exist. Cloud Run deployment is recorded above, while actual scheduled-job activation is not established by these records. BigQuery is not an implemented integration.

## Loop contract

Read open issues and their latest comments before assigning work. Keep one issue branch/worktree per implementation. Record upstream/downstream impact, tests and rollback in each PR. Independently review changes, address review threads, and require green checks before merge. Re-read the queue after each wave. Do not restart or deploy the existing port-3000 application as part of unreviewed implementation. Keep larger issues open when a PR implements only one layer.

## Queue changes

Add new issues freely. Priority and dependency changes should be recorded here or on the affected issue; do not silently expand an in-flight PR.
