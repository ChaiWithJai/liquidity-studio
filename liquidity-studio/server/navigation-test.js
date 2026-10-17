// Historical entry point now executes the real compiled Svelte in a browser.
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
const cwd = fileURLToPath(new URL('../', import.meta.url));
execFileSync(process.execPath, ['node_modules/@playwright/test/cli.js', 'test', '--project=chromium'], { cwd, stdio: 'inherit' });
