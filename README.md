# Liquidity Studio

A brand-scoped content workspace for The Liquidity Desk and Chai With Jai. Start with a story, prepare a sourced preview, edit saved copy, plan it on the calendar, and create or reopen its linked design. Source review, native layout approval and publication are separate actions.

## Use Defiant OS MCP from your agent

Connect your coding agent to retained royalty evidence with the shipped stdio bridge and your own scoped read-only grant. You do not need to run the application or copy the private dataset. Start with [MCP setup and usage](docs/mcp/README.md). Repository agents should also read [AGENTS.md](AGENTS.md).

Royalty Evidence Review returns supported comparisons with coverage and original receipt references. Missing analytical inputs remain tracked in [#374](https://github.com/ChaiWithJai/liquidity-studio/issues/374); they do not prevent factual reviews with current golden data.

## Start locally without SSO

With Node.js 22+ and the project's installed dependencies:

```sh
cd liquidity-studio
npm run dev:studio -- --profile development
```

Open the printed loopback URL and choose Founder or Marketer. `staging` and `production` are separate **local SQLite emulations**, not deployed services. [Local development](docs/local-development.md) explains profiles, permissions, jobs and optional Penpot configuration. Native editors and paid providers are not implicitly started.

## Understand and change the system

- [Documentation index](docs/README.md): operator instructions, architecture, specs and runbooks.
- [System and change-impact map](docs/architecture/system-map.md): follow a request/job and find affected code.
- [Capability map](docs/architecture/capability-map.md): module boundaries and current delivery trackers.
- [Architecture decisions](docs/decisions/README.md): a few implementation choices and their trade-offs.

The canonical UI is Svelte in `liquidity-studio/src/`; Node API/services and workers are in `liquidity-studio/server/`. `scripts/` and `.github/workflows/` contain operator and delivery tooling; `tools/` contains reviewed native integration source. [Hosted frontend artifacts](docs/development/hosted-frontend-artifact.md) describe canonical distribution assembly.

## Current boundaries

The deployed pilot uses managed Google identity and configured durable storage; local profiles use existing password sessions and their own SQLite data. Preparation produces unreviewed evidence/copy, not factual or clinical approval. Native Penpot pairing, shared-team enforcement and licensed embedded editor features have separate configuration and acceptance boundaries. A local founder demo or successful native compilation does not establish marketer access, publication readiness or measured revocation. See [#52](https://github.com/ChaiWithJai/liquidity-studio/issues/52), [#57](https://github.com/ChaiWithJai/liquidity-studio/issues/57), [#58](https://github.com/ChaiWithJai/liquidity-studio/issues/58) and [#162](https://github.com/ChaiWithJai/liquidity-studio/issues/162) for remaining work.

Use BrowserOS neo for local acceptance under the current memory constraint; automated checks run in hosted CI. Commands in this README were reviewed against source, not rerun for this documentation change. Follow the [product delivery loop](docs/product-engineering-workflow.md) and [engineering workflow](docs/ENGINEERING-WORKFLOW.md).

The application source was imported on 2026-10-17 from an untracked local prototype. Earlier introduction dates are unknown. Historical proposals and dated acceptance evidence are retained under `docs/`; credentials, local state and raw private conversations are excluded.
