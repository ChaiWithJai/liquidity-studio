import { test } from 'node:test';
import assert from 'node:assert/strict';
import { AIGateway } from './gateway.js';
import { generateMultiFormatCampaign, INITIAL_CONTENT_BACKLOG } from './domain.js';
const story = INITIAL_CONTENT_BACKLOG[0];
const run = gateway => generateMultiFormatCampaign({ gateway, story });

test('missing credentials fail closed unless synthetic is explicitly allowed', async () => {
  const old = [process.env.GEMINI_API_KEY, process.env.GOOGLE_API_KEY];
  delete process.env.GEMINI_API_KEY; delete process.env.GOOGLE_API_KEY;
  try {
    await assert.rejects(run(new AIGateway({ allowSynthetic: false })), /credentials are missing/);
    const result = await run(new AIGateway({ allowSynthetic: true }));
    assert.equal(result.trace.status, 'degraded');
    assert.equal(result.output.provenance.mode, 'synthetic');
    assert.deepEqual(result.output.infographic.statRows, story.verifiedFacts);
    assert.equal(result.output.carousel.slides[1].title, 'Reported fact');
    assert.doesNotMatch(JSON.stringify(result.output), /3x multiple|100% equity|Gross Margin/);
  } finally {
    for (const [i, key] of ['GEMINI_API_KEY', 'GOOGLE_API_KEY'].entries()) old[i] === undefined ? delete process.env[key] : process.env[key] = old[i];
  }
});

test('upstream failure fails closed and opt-in fallback stays degraded', async () => {
  const original = globalThis.fetch;
  globalThis.fetch = async () => ({ ok: false, status: 503, text: async () => 'secret upstream diagnostic' });
  try {
    await assert.rejects(run(new AIGateway({ provider: 'openai-gateway', allowSynthetic: false })), /HTTP 503/);
    const result = await run(new AIGateway({ provider: 'openai-gateway', allowSynthetic: true }));
    assert.equal(result.trace.status, 'degraded');
    assert.equal(result.trace.provenance.reason, 'provider-failure');
    assert.doesNotMatch(JSON.stringify(result), /secret upstream/);
  } finally { globalThis.fetch = original; }
});

test('provider attribution does not depend on a Gemini key; invented claims are rejected', async () => {
  const original = globalThis.fetch;
  const synthetic = await run(new AIGateway({ allowSynthetic: true }));
  const output = synthetic.output;
  globalThis.fetch = async () => ({ ok: true, json: async () => ({ choices: [{ message: { content: JSON.stringify(output) } }] }) });
  try {
    const result = await run(new AIGateway({ provider: 'openai-gateway', allowSynthetic: false }));
    assert.equal(result.trace.provider, 'openai-gateway');
    assert.equal(result.output.provenance.mode, 'provider');
    output.infographic.statRows[0] = '$999M valuation';
    await assert.rejects(run(new AIGateway({ provider: 'openai-gateway', allowSynthetic: false })), /unsupported numeric/);
    output.infographic.statRows = story.verifiedFacts;
    output.carousel.slides[1].title = 'The Gross Margin';
    await assert.rejects(run(new AIGateway({ provider: 'openai-gateway', allowSynthetic: false })), /Gross margin label/);
  } finally { globalThis.fetch = original; }
});

 test('malformed provider fields are rejected before campaign persistence', async () => {
  const original = globalThis.fetch;
  const malformed = { infographic: { statRows: [null, null, null] }, carousel: { slides: [{}, {}, {}, {}] }, story: {}, reel: { beats: [{}, {}, {}] } };
  globalThis.fetch = async () => ({ ok: true, json: async () => ({ choices: [{ message: { content: JSON.stringify(malformed) } }] }) });
  try {
    await assert.rejects(run(new AIGateway({ provider: 'openai-gateway', allowSynthetic: false })), /Invalid campaign field types/);
  } finally { globalThis.fetch = original; }
 });

test('failed synthetic generation includes an error trace', async () => {
  const gateway = new AIGateway({ allowSynthetic: true });
  await assert.rejects(generateMultiFormatCampaign({ gateway, story: { id: 'empty', title: 'No facts', verifiedFacts: [] } }), error => {
    assert.equal(error.trace.status, 'error');
    return /supplied fact/.test(error.message);
  });
});
