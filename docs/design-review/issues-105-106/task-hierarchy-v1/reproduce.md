# Reproduce

Use the repository's supported Node 22 runtime. From `liquidity-studio`, run:

```sh
npm ci --engine-strict
npm run build
NODE_ENV=test STUDIO_CAPTURE_TASK_HIERARCHY=/tmp/studio-task-hierarchy node node_modules/@playwright/test/cli.js test tests/workspace-table.spec.js --grep 'task hierarchy|task status' --output=/tmp/studio-task-hierarchy-results
NODE_ENV=test node node_modules/@playwright/test/cli.js test --output=/tmp/studio-task-hierarchy-all
node --test server/workspace-client.test.js server/workspace.test.js
```

The capture cases create their own authenticated HTTP/SQLite fixture. They never need a maintained server port or account credentials. The Google Auth Emulator and opt-in native-source suites retain their separate documented setup and explicit skips when unavailable.

For the historical comparison, create a detached checkout of `add4b3f`; its committed `dist` is the unchanged baseline. The baseline capture used a separately provisioned disposable founder, identical default seed stories, 883×695 and 1280×720 contexts, and the collapsed backlog and expanded Saved views surfaces. It did not alter the maintained release.

The committed `capture-baseline.mjs` accepts an explicit disposable checkout and output directory. With that checkout's dependencies installed, run it under `NODE_ENV=test`; it binds an ephemeral loopback port, provisions a random temporary credential, captures the two viewports, and closes its owned server/browser. It never connects to an existing product port.
