import test from 'node:test';
import assert from 'node:assert/strict';
import { createJevDecisionAdapter, createClaimEvaluation } from './defiant-jev-evaluation.js';
const hash = 'a'.repeat(64);
const fixture = () => ({ model: 'typesafe-ai/jev', answers: { support: { type: 'choice', choice: 'supported', probabilities: { supported: 0.7, contradicted: 0.1, unsupported: 0.1, 'insufficient-context': 0.1 } }, causalOverreach: { type: 'boolean', probability: 0.1 }, temporalComparability: { type: 'boolean', probability: 0.5 }, identityOverreach: { type: 'boolean', probability: 0.2 }, citationSufficiency: { type: 'boolean', probability: 0.9 } }, usage: { inputTokens: 100, outputTokens: 20 }, providerMetadata: { gateway: { routing: { originalModelId: 'typesafe-ai/jev', canonicalSlug: 'typesafe-ai/jev', finalProvider: 'typesafe-ai', resolvedProvider: 'typesafe-ai' }, cost: '0.00001', generationId: 'NEVER_RECORD_PROVIDER_ID' } } });
const input = { claim: 'Invented amount matches.', evidence: 'Invented source says amount 2 USD.' };
const jsonResponse = value => new Response(JSON.stringify(value), { headers: { 'content-type': 'application/json' } });
const options = extra => ({ enabled: true, getCredential: () => 'sentinel-key', fetch: async () => jsonResponse(fixture()), ...extra });

test('fixed decision HTTP contract and sanitized typed observation; no chat completions or fallback', async () => {
  let calls = 0;
  const adapter = createJevDecisionAdapter(options({ fetch: async (url, init) => {
    calls++; assert.equal(url, 'https://ai-gateway.vercel.sh/v1/evaluate'); assert.equal(init.redirect, 'error'); assert.equal(init.method, 'POST');
    assert.equal(init.headers.Authorization, 'Bearer sentinel-key'); const body = JSON.parse(init.body);
    assert.equal(body.model, 'typesafe-ai/jev'); assert.deepEqual(body.state, input); assert.deepEqual(body.providerOptions, { gateway: { only: ['typesafe-ai'], zeroDataRetention: true } });
    assert.deepEqual(Object.keys(body.questions), ['support', 'causalOverreach', 'temporalComparability', 'identityOverreach', 'citationSufficiency']);
    return jsonResponse(fixture());
  } }));
  const result = await adapter.decide(input); assert.equal(calls, 1); assert.equal(result.status, 'observed'); assert.equal(result.answers.support.choice, 'supported'); assert.equal(result.modelVersion, null); assert.equal(result.reportedCostUsd, '0.00001'); assert.ok(Object.isFrozen(result.answers.support)); assert.ok(!JSON.stringify(result).includes('NEVER_RECORD')); assert.ok(!JSON.stringify(result).includes('sentinel-key'));
});

test('disabled and unavailable credential paths have zero provider I/O', async () => {
  let calls = 0; let secrets = 0; const fetch = async () => { calls++; throw Error('should not run'); };
  assert.equal((await createJevDecisionAdapter({ fetch, getCredential: () => { secrets++; return 'key'; } }).decide(input)).reason, 'disabled');
  assert.equal(secrets, 0);
  for (const getCredential of [() => null, () => 'bad\nkey', () => Promise.resolve('key'), () => { throw Error('PRIVATE'); }]) assert.equal((await createJevDecisionAdapter({ enabled: true, fetch, getCredential }).decide(input)).reason, 'credential-unavailable');
  assert.equal(calls, 0);
});

test('finite reservations survive concurrent request and failure with no retries', async () => {
  let release; let calls = 0; const pending = new Promise(resolve => { release = resolve; });
  const adapter = createJevDecisionAdapter(options({ fetch: async () => { calls++; await pending; throw Error('PRIVATE TRANSPORT'); } }));
  const first = adapter.decide(input); const second = await adapter.decide(input); assert.equal(second.reason, 'request-cap'); release(); const failed = await first;
  assert.equal(failed.reason, 'transport'); assert.equal(calls, 1); assert.ok(!JSON.stringify(failed).includes('PRIVATE')); assert.equal((await adapter.decide(input)).reason, 'request-cap');
});

test('malformed probabilities, unknown answer/model/routing and usage reject rather than becoming support', async () => {
  const changes = [d => { d.model = 'other'; }, d => { d.answers.extra = {}; }, d => { d.answers.support.probabilities.supported = 2; }, d => { d.answers.support.probabilities.supported = 0.6; }, d => { d.answers.support.choice = 'invented'; }, d => { d.answers.identityOverreach.probability = null; }, d => { d.usage.inputTokens = -1; }, d => { d.providerMetadata.gateway.routing.finalProvider = 'another'; }, d => { d.providerMetadata.gateway.cost = '1e3'; }];
  for (const mutate of changes) { const data = fixture(); mutate(data); const result = await createJevDecisionAdapter(options({ fetch: async () => jsonResponse(data) })).decide(input); assert.equal(result.reason, 'provider-response'); assert.equal(result.answers, undefined); }
});

test('HTTP denial, redirect, malformed UTF8/JSON, oversized/chunk body and stalled transport remain bounded', async () => {
  const responses = [new Response('PRIVATE', { status: 403 }), new Response('PRIVATE', { status: 302 }), new Response('PRIVATE', { headers: { 'content-type': 'text/plain' } }), new Response('{', { headers: { 'content-type': 'application/json' } }), new Response(new Uint8Array([255]), { headers: { 'content-type': 'application/json' } }), new Response('x', { headers: { 'content-type': 'application/json', 'content-length': '65537' } }), new Response(new Uint8Array(65537), { headers: { 'content-type': 'application/json' } })];
  for (const response of responses) { const result = await createJevDecisionAdapter(options({ fetch: async () => response })).decide(input); assert.equal(result.status, 'failed'); assert.ok(!JSON.stringify(result).includes('PRIVATE')); }
  let signal;
  const stalled = await createJevDecisionAdapter(options({ timeoutMs: 10, fetch: async (_url, init) => { signal = init.signal; return new Promise(() => {}); } })).decide(input);
  assert.equal(stalled.reason, 'deadline'); assert.equal(signal.aborted, true);
  let cancelled = false;
  const body = new ReadableStream({ pull() { return new Promise(() => {}); }, cancel() { cancelled = true; } });
  const stalledBody = await createJevDecisionAdapter(options({ timeoutMs: 10, fetch: async () => new Response(body, { headers: { 'content-type': 'application/json' } }) })).decide(input);
  assert.equal(stalledBody.reason, 'deadline'); assert.equal(cancelled, true);
});

const manifest = [{ caseId: 'authored_1', datasetSha256: hash, origin: 'authored-development', evidenceRevision: hash }];
function evaluation(overrides = {}) {
  const records = []; let providerCalls = 0; let credentialCalls = 0;
  const adapter = createJevDecisionAdapter(options({ getCredential: () => { credentialCalls++; return 'secret'; }, fetch: async () => { providerCalls++; return jsonResponse(fixture()); } }));
  const service = createClaimEvaluation({ manifest, deterministicVersion: 'invented-deterministic-v1', authorize: async () => {}, resolveCase: async () => ({ organizationId: 'org', evidenceRevision: hash, ...input }), deterministicCheck: async () => ({ status: 'pass', reasons: [] }), persistRecord: async record => { records.push(record); }, adapter, now: () => '2026-10-23T12:00:00.000Z', createId: () => 'evaluation_1', ...overrides });
  return { service, records, calls: () => ({ providerCalls, credentialCalls }) };
}
test('deterministic failure/insufficient context records are metadata-only and skip credentials/provider', async () => {
  for (const status of ['fail', 'insufficient-context']) {
    const e = evaluation({ deterministicCheck: async () => ({ status, reasons: ['citation-missing'] }) });
    const record = await e.service.evaluate({ organizationId: 'org', actorId: 'operator' }, { caseId: 'authored_1' });
    assert.equal(record.outcome.status, 'skipped'); assert.deepEqual(e.calls(), { providerCalls: 0, credentialCalls: 0 }); assert.equal(e.records.length, 1); assert.equal(record.humanLabel, null); assert.equal(record.case.origin, 'authored-development'); assert.ok(!JSON.stringify(record).includes(input.claim)); assert.ok(!JSON.stringify(record).includes(input.evidence));
  }
});

test('observed record retains pinned case/evidence hashes and typed model output, never human accuracy', async () => {
  const refs = manifest.map(row => ({ ...row, origin: 'observed-answer' })); const e = evaluation({ manifest: refs }); refs[0].datasetSha256 = 'b'.repeat(64);
  const record = await e.service.evaluate({ organizationId: 'org', actorId: 'operator' }, { caseId: 'authored_1' });
  assert.equal(record.case.datasetSha256, hash); assert.equal(record.case.origin, 'observed-answer'); assert.equal(record.outcome.status, 'observed'); assert.equal(record.humanLabel, null); assert.equal(record.accuracy, undefined); assert.equal(record.claimSha256.length, 64); assert.ok(Object.isFrozen(record)); assert.deepEqual(e.calls(), { providerCalls: 1, credentialCalls: 1 });
});

test('wrong resolved scope/revision and unknown case fail before provider; revocation blocks persistence', async () => {
  for (const changed of [{ organizationId: 'other' }, { evidenceRevision: 'b'.repeat(64) }]) { const e = evaluation({ resolveCase: async () => ({ organizationId: 'org', evidenceRevision: hash, ...input, ...changed }) }); await assert.rejects(e.service.evaluate({ organizationId: 'org', actorId: 'operator' }, { caseId: 'authored_1' })); assert.deepEqual(e.calls(), { providerCalls: 0, credentialCalls: 0 }); assert.equal(e.records.length, 0); }
  const e = evaluation(); await assert.rejects(e.service.evaluate({ organizationId: 'org', actorId: 'operator' }, { caseId: 'missing' })); assert.equal(e.records.length, 0);
  let checks = 0; const revoked = evaluation({ authorize: async () => { if (++checks === 4) throw Object.assign(Error('Denied'), { status: 403 }); } });
  await assert.rejects(revoked.service.evaluate({ organizationId: 'org', actorId: 'operator' }, { caseId: 'authored_1' }), { status: 403 }); assert.equal(revoked.records.length, 0); assert.equal(revoked.calls().providerCalls, 1);
});

test('input caps and injected outcome cannot bypass metadata-only record boundary', async () => {
  let calls = 0; const adapter = createJevDecisionAdapter(options({ fetch: async () => { calls++; return jsonResponse(fixture()); } }));
  await assert.rejects(adapter.decide({ claim: 'x'.repeat(4097), evidence: 'x' })); assert.equal(calls, 0);
  const e = evaluation({ adapter: { decide: async () => ({ status: 'unavailable', reason: 'disabled', raw: 'PRIVATE' }) } });
  await assert.rejects(e.service.evaluate({ organizationId: 'org', actorId: 'operator' }, { caseId: 'authored_1' })); assert.equal(e.records.length, 0);
  const context = { organizationId: 'org', actorId: 'operator' }; const moved = evaluation({ deterministicCheck: async () => { context.organizationId = 'other'; return { status: 'pass', reasons: [] }; } });
  await assert.rejects(moved.service.evaluate(context, { caseId: 'authored_1' })); assert.equal(moved.calls().providerCalls, 0); assert.equal(moved.records.length, 0);
});


test('deferred provider context/actor switch cannot persist old evidence into new authority', async () => {
  for (const field of ['organizationId', 'actorId']) {
    let enter; let finish; const entered = new Promise(resolve => { enter = resolve; }); const pending = new Promise(resolve => { finish = resolve; });
    const context = { organizationId: 'org', actorId: 'operator' };
    const e = evaluation({ adapter: { decide: async () => { enter(); await pending; return { status: 'unavailable', reason: 'disabled' }; } } });
    const result = e.service.evaluate(context, { caseId: 'authored_1' }); await entered; context[field] = 'other'; finish();
    await assert.rejects(result); assert.equal(e.records.length, 0);
  }
});

test('record pins rubric and deterministic implementation identity', async () => {
  const e = evaluation(); const record = await e.service.evaluate({ organizationId: 'org', actorId: 'operator' }, { caseId: 'authored_1' });
  assert.equal(record.evaluatorVersion, 'defiant-claim-decisions-v1'); assert.match(record.questionsSha256, /^[a-f0-9]{64}$/); assert.equal(record.deterministicVersion, 'invented-deterministic-v1'); assert.equal(record.actorId, 'operator');
});
