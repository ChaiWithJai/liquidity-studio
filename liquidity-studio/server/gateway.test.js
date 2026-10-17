import { test } from 'node:test';
import assert from 'node:assert/strict';
import { AIGateway } from './gateway.js';
import { generateMultiFormatCampaign, BRAND_PRESETS, INITIAL_CONTENT_BACKLOG, evaluateCampaign } from './domain.js';
import { campaignFromApprovedClaims, getApprovedClaims, validateCampaign } from './source-integrity.js';

const story = { id: 'reviewed', title: 'Source notes', sourceClaims: [{ id: 'source-one', text: '$80M reported revenue', sourceUrl: 'https://example.test/report', status: 'approved' }] };
const run = (gateway, input = story, brandProfile) => generateMultiFormatCampaign({ gateway, story: input, brandProfile });
const successfulResponse = campaign => ({ ok: true, text: async () => JSON.stringify({ choices: [{ message: { content: JSON.stringify(campaign) } }] }) });
const gateway = (config = {}) => new AIGateway({ provider: 'openai-gateway', gatewayUrl: 'https://example.test/v1', ...config });

test('legacy seed facts cannot become verified by synthetic generation', async () => {
  await assert.rejects(run(gateway({ allowSynthetic: true }), INITIAL_CONTENT_BACKLOG[0]), /Approve at least one sourced claim/);
  assert.throws(() => getApprovedClaims({ sourceClaims: [{ ...story.sourceClaims[0], status: 'unreviewed' }] }), /Approve at least/);
});

test('missing credentials fail closed; explicit synthetic preserves approved excerpts', async () => {
  const saved = process.env.AI_GATEWAY_KEY;
  delete process.env.AI_GATEWAY_KEY;
  try {
    await assert.rejects(run(gateway({ allowSynthetic: false })), error => error.code === 'PROVIDER_CREDENTIALS_MISSING');
    const result = await run(gateway({ allowSynthetic: true }));
    assert.equal(result.trace.status, 'degraded');
    assert.equal(result.output.provenance.mode, 'synthetic');
    assert.equal(result.output.infographic.statRows[0], story.sourceClaims[0].text);
    assert.deepEqual(result.output.provenance.claimIds, ['source-one']);
    assert.equal(result.output.provenance.factualAccuracy, 'not_assessed');
  } finally { saved === undefined ? delete process.env.AI_GATEWAY_KEY : process.env.AI_GATEWAY_KEY = saved; }
});

test('changed units, source attribution, labels and unsupported qualitative claims are rejected', () => {
  for (const mutate of [
    output => output.infographic.statRows[0] = '80% margin',
    output => output.carousel.slides[0].title = 'Gross margin',
    output => output.infographic.caption = 'This treatment cures anxiety',
    output => output.reel.beats[0].voiceover = '$80M profit'
  ]) {
    const output = campaignFromApprovedClaims(story);
    mutate(output);
    assert.throws(() => validateCampaign(output, story), /approved source excerpts/);
  }
});

test('clinical claims require separately recorded clinical review; malformed sources are blocked', () => {
  const clinical = { sourceClaims: [{ ...story.sourceClaims[0], kind: 'clinical' }] };
  assert.throws(() => getApprovedClaims(clinical), /Clinical claims remain quarantined/);
  clinical.sourceClaims[0].clinicalReview = { reviewerId: 'reviewer', reviewedAt: '2026-10-17T12:00:00Z' };
  assert.equal(getApprovedClaims(clinical).length, 1);
  assert.throws(() => getApprovedClaims({ sourceClaims: [{ ...story.sourceClaims[0], sourceUrl: 'javascript:alert(1)' }] }), /HTTPS source/);
});

test('both presets evaluate source coverage without requiring financial numbers', () => {
  const culture = { ...story, sourceClaims: [{ ...story.sourceClaims[0], text: 'This archive records a cultural practice.' }] };
  const campaign = campaignFromApprovedClaims(culture);
  const result = evaluateCampaign(campaign, culture, BRAND_PRESETS.vedic_dharma);
  assert.equal(result.overallPass, true);
  assert.equal(result.domain, 'culture-wellbeing');
  assert.equal(result.factualAccuracy, 'not_assessed');
  assert.equal(result.editorialReviewRequired, true);
  assert.equal(BRAND_PRESETS.vedic_dharma.logoText, 'CWJ');
  assert.equal(BRAND_PRESETS.vedic_dharma.strategy.clinicalClaimsQuarantined, true);
});

test('provider failure diagnostics, URLs and keys never escape public errors/traces', async () => {
  process.env.AI_GATEWAY_KEY = 'test-only';
  try {
    const failed = gateway({ allowSynthetic: false, fetch: async () => { throw new Error('https://secret.test?key=secret-key'); } });
    await assert.rejects(run(failed), error => {
      assert.doesNotMatch(JSON.stringify({ message: error.message, trace: error.trace }), /secret|https:/);
      return error.trace.status === 'error';
    });
    const fallback = await run(gateway({ allowSynthetic: true, fetch: async () => ({ ok: false, status: 503 }) }));
    assert.equal(fallback.trace.status, 'degraded');
    assert.equal(fallback.output.provenance.reason, 'PROVIDER_HTTP_ERROR');
  } finally { delete process.env.AI_GATEWAY_KEY; }
});

test('provider response and source validation fail closed rather than approving malformed output', async () => {
  process.env.AI_GATEWAY_KEY = 'test-only';
  try {
    await assert.rejects(run(gateway({ allowSynthetic: false, fetch: async () => successfulResponse({ infographic: {} }) })), error => error.code === 'UNSUPPORTED_GENERATED_CLAIM');
    const result = await run(gateway({ allowSynthetic: false, fetch: async () => successfulResponse(campaignFromApprovedClaims(story)) }));
    assert.equal(result.trace.provider, 'openai-gateway');
    assert.equal(result.output.provenance.mode, 'provider');
  } finally { delete process.env.AI_GATEWAY_KEY; }
});

test('deadline covers stalled fetch/response and resets the request', async () => {
  process.env.AI_GATEWAY_KEY = 'test-only';
  try {
    let signal;
    await assert.rejects(run(gateway({ allowSynthetic: false, timeoutMs: 10, fetch: async (_, options) => { signal = options.signal; return { ok: true, text: () => new Promise(() => {}) }; } })), error => error.code === 'PROVIDER_TIMEOUT');
    assert.equal(signal.aborted, true);
  } finally { delete process.env.AI_GATEWAY_KEY; }
});

test('Gemini uses header authentication, one configured model and bounded generation', async () => {
  process.env.GEMINI_API_KEY = 'test-only';
  try {
    const result = await run(new AIGateway({ provider: 'gcp-gemini', model: 'gemini-3.8-flash', allowSynthetic: false, fetch: async (url, options) => {
      assert.equal(url, 'https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent');
      assert.equal(options.headers['x-goog-api-key'], 'test-only');
      assert.equal(JSON.parse(options.body).generationConfig.maxOutputTokens, 4096);
      assert.equal(options.redirect, 'error');
      return { ok: true, text: async () => JSON.stringify({ candidates: [{ content: { parts: [{ text: JSON.stringify(campaignFromApprovedClaims(story)) }] } }] }) };
    } }));
    assert.equal(result.trace.provider, 'gcp-gemini');
  } finally { delete process.env.GEMINI_API_KEY; }
});

test('Vertex uses the documented OpenAI-compatible endpoint and OAuth token resolver', async () => {
  const result = await run(new AIGateway({ provider: 'gcp-vertex', projectId: 'pilot-project', location: 'us-central1', model: 'gemini-2.5-flash', allowSynthetic: false, accessTokenProvider: async () => 'test-oauth', fetch: async (url, options) => {
    assert.equal(url, 'https://us-central1-aiplatform.googleapis.com/v1/projects/pilot-project/locations/us-central1/endpoints/openapi/chat/completions');
    assert.equal(options.headers.Authorization, 'Bearer test-oauth');
    assert.equal(JSON.parse(options.body).model, 'google/gemini-2.5-flash');
    return successfulResponse(campaignFromApprovedClaims(story));
  } }));
  assert.equal(result.trace.provider, 'gcp-vertex');
});

test('configuration rejects invalid providers, credential URLs and unbounded limits', () => {
  assert.throws(() => gateway({ provider: 'not-a-provider' }), /Invalid AI provider/);
  assert.throws(() => gateway({ gatewayUrl: 'https://example.test?key=secret' }), /HTTPS/);
  assert.throws(() => gateway({ timeoutMs: 0 }), /Invalid AI limits/);
  assert.throws(() => new AIGateway({ provider: 'gcp-vertex', projectId: '' }), /explicit project/);
});
