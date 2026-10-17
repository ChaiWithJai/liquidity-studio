import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
const script = new URL('./gcp-pilot.mjs', import.meta.url);
const run = (args, env = {}) => spawnSync(process.execPath, [script.pathname, ...args], { encoding: 'utf8', env: { ...process.env, PILOT_PROJECT: 'test-studio-project', ...env } });
test('plan is non-mutating and records NYC region and budget envelope', () => {
  const result = run(['plan']); assert.equal(result.status, 0);
  const first = JSON.parse(result.stdout.split('\n')[0]); assert.equal(first.region, 'us-east4'); assert.equal(first.monthlyBudgetUSD, 100);
  assert.doesNotMatch(result.stdout, /"args":\["run","deploy"/);
});
test('unknown project and over-budget plans cannot silently use CLI defaults', () => {
  assert.equal(run(['plan'], { PILOT_PROJECT: '' }).status, 1);
  assert.equal(run(['plan'], { PILOT_MONTHLY_BUDGET: '101' }).status, 1);
});
test('deploy cannot execute without explicit apply and resource evidence', () => {
  const result = run(['deploy']); assert.equal(result.status, 1); assert.match(result.stderr, /--apply/);
});
