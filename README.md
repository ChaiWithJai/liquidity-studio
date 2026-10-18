# Liquidity Studio

Content campaign workspace for The Liquidity Desk and Chai With Jai.

## Local development without SSO

Use Node.js 22+ and the project's installed dependencies. Start the API and live Svelte UI together:

```sh
cd liquidity-studio
npm run dev:studio -- --profile development
```

Open the loopback URL printed by the launcher and choose Founder or Marketer. No Google sign-in or password entry is needed. `--profile staging` and `--profile production` select separate **local emulations**, with separate persistent SQLite data. They never select the deployed cloud environment. See [local development](docs/local-development.md) for boundaries, profile switching and recovery.

The deployed application continues to use managed Google identity. Its configured SQLite or Firestore/GCS repository persists work; the development launcher does not read or replace that data. Cloud operation is documented in [the deployment guide](docs/gcp-first-deployment.md).

## Verification

Use BrowserOS neo for local acceptance under the current memory constraint. Automated checks run in hosted CI. Svelte source is canonical: the developer launcher serves it through Vite, while `npm run build` creates the deployable UI. Synthetic generation and engineering checks do not establish factual accuracy, clinical review or real-user usability.

## History

The source was imported on 2026-10-17 from an untracked local prototype. The pre-existing initial Git commit contained no application files. Introduction dates before this import are unknown. Raw conversation files, duplicate archives, credentials, and local state are excluded.

## Delivery

GitHub Issues is the work queue. Changes use one issue branch/worktree and a pull request, with dependency analysis, acceptance criteria, regression evidence, and independent review before merge. Re-read issue comments before implementation because requirements may change.
