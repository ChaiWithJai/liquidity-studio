import test from 'node:test';
import assert from 'node:assert/strict';
import { ObservabilityEngine } from './observability.js';
import { checkReadiness } from './operational-health.js';
import { createAppContainer } from './container.js';
import { createHttpServer } from './index.js';

test('empty telemetry cannot impersonate a successful production run', () => {
  const snapshot = new ObservabilityEngine().getSnapshot();
  assert.deepEqual(snapshot.batchJobs, []);
  assert.equal(snapshot.summary.weeklyBatchCount, 0);
  assert.equal(snapshot.summary.totalGenerations, 0);
  assert.equal(snapshot.summary.avgEvalScore, null);
});

test('readiness times out a stalled repository and does not reveal dependency errors', async () => {
  const unavailable = await checkReadiness({ ports: { repo: {
    listBacklog: () => Promise.reject(new Error('secret connection string'))
  } } });
  assert.equal(unavailable.status, 'not_ready');
  assert.equal(unavailable.checks.repository, 'unavailable');
  assert.ok(!JSON.stringify(unavailable).includes('secret'));
  const stalled = await checkReadiness({ ports: { repo: {
    listBacklog: () => new Promise(() => {})
  } } }, { timeoutMs: 5 });
  assert.equal(stalled.checks.repository, 'timeout');
});

test('HTTP health stays live when repository readiness fails', async (t) => {
  const container = createAppContainer({ repo: { listBacklog: async () => { throw new Error('secret'); } } });
  const server = createHttpServer(container);
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  t.after(() => new Promise(resolve => server.close(resolve)));
  const url = `http://127.0.0.1:${server.address().port}`;
  assert.equal((await fetch(`${url}/healthz`)).status, 200);
  const response = await fetch(`${url}/readyz`);
  assert.equal(response.status, 503);
  const payload = await response.json();
  assert.equal(payload.checks.generationProvider, 'not_checked');
  assert.ok(!JSON.stringify(payload).includes('secret'));
});

test('repository access is ready without pretending to verify generation', async () => {
  const result = await checkReadiness(createAppContainer());
  assert.equal(result.status, 'ready');
  assert.equal(result.checks.repository, 'available');
  assert.equal(result.checks.generationProvider, 'not_checked');
});

test('failed batch execution appears in admin telemetry without exposing errors', async () => {
  const container = createAppContainer({ repo: { listBacklog: async () => { throw new Error('secret'); } } });
  await assert.rejects(container.services.batchProductionService.runWeeklyBatch(), /secret/);
  const { batchJobs } = container.ports.telemetry.getSnapshot();
  assert.equal(batchJobs.length, 1);
  assert.equal(batchJobs[0].status, 'FAILED');
  assert.equal(batchJobs[0].formatsPrepared, 0);
  assert.equal(batchJobs[0].evalPassRate, null);
  assert.ok(!JSON.stringify(batchJobs).includes('secret'));
});
