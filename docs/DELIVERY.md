## Goal

Own Liquidity Studio as an operable service. Keep this issue open as the queue entry point while new issues arrive. Baseline imported at 9d8e5f0; no earlier application history exists.

## Current implementation and verification

The integrated delivery branch implements canonical Svelte/Vite UI, scoped local identity, SQLite persistence, the async Firestore/GCS adapter, source-controlled generation, real artifacts, feedback lineage, discovery/job contracts and recovery tooling. Local browser/container and real Firestore emulator checks have run. Final remote CI and independent review remain release gates; these statements are not issue-closure or deployed-cloud claims.

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

The RFC originally named Cloud Run, Firestore, GCS, Scheduler and BigQuery as intended dependencies. Firestore/GCS now have adapter and emulator/boundary evidence; worker/scheduler authentication and configuration contracts exist. Actual cloud deployment and scheduling status require recorded evidence. BigQuery is not an implemented integration.

## Loop contract

Read open issues and their latest comments before assigning work. Keep one issue branch/worktree per implementation. Record upstream/downstream impact, tests and rollback in each PR. Independently review changes, address review threads, and require green checks before merge. Re-read the queue after each wave. Do not restart or deploy the existing port-3000 application as part of unreviewed implementation. Keep larger issues open when a PR implements only one layer.

## Queue changes

Add new issues freely. Priority and dependency changes should be recorded here or on the affected issue; do not silently expand an in-flight PR.
