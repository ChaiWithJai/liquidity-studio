# Full-stack delivery and completion audit

The founder authorized execution of the full epic, including #24, on 2026-10-17. Earlier proposed-spec gates do not stop existing issue delivery. GitHub #12 is the task ledger; this document records integration order, not a replacement scope.

## Milestones

1. Authorized persistent workflow: founder/marketer sign in, select an organization and permitted brand, create a source-backed story, generate, edit and reload. Backend storage/session/scope and canonical Svelte UI ship together. Demonstrate denied foreign IDs and revocation, plus restart/restore. Covers #2/#3/#4/#7/#18.
2. Real operator outcomes: PNG/ZIP/script artifacts use the same canonical SVG as preview; exports are downloadable and scoped. Calendar scheduling stays separate from export/publication. Complete versioned feedback/export, idempotent jobs and honest admin traces with failure recovery. Covers #5/#6/#9/#10.
3. Visual confidence: four Instagram simulations, live interactions and actual measured layout/contrast/caption evidence; profile grid includes real scheduled/exported brand content. Persist preflight evidence with campaign/version/scope. Covers #24 and #8.
4. Operable delivery: reproducible Node22 container with persistent volume, startup/shutdown contract, real browser regressions and backup/import/ejection rehearsal; private GCP pilot verified against the selected project/region/identity and budget. Covers #11/#19 and remaining #8.

Each milestone integrates backend and frontend against one explicit API contract. Short-lived codex/ worktrees isolate independent files. Rebase onto trunk before integrating, run the relevant tests, obtain independent review, merge green changes, then move to the next slice. A feature is not accepted merely because another layer is mocked.

## Evidence required before closing issues

For every original issue and #18/#19/#24, compare all acceptance criteria with merged source, executable tests, runtime/browser behavior and operational evidence. If a criterion remains unverified, leave the issue open and continue. Static graph/keyword scores do not prove usability, truth, security, isolation or cloud readiness.

Local and hosted image architecture checks are separate. Local synthetic mode is explicit; an external provider must be independently verified before claiming real-provider readiness. Clinical content is unreviewed until sourced and approved. Emulator geometry is a configured simulation: captions and native app chrome can vary. Never hard-code a confidence pass badge.

An external credential or resource decision blocks only the dependent cloud slice. Continue all independent engineering work. Document exact required inputs and preserve the full objective while waiting.
