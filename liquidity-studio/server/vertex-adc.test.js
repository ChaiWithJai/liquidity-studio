import test from 'node:test';
import assert from 'node:assert/strict';
import { AIGateway } from './gateway.js';
import { createLocalADCTokenProvider } from './vertex-adc.js';
import { generateMultiFormatCampaign } from './domain.js';
import { campaignFromApprovedClaims } from './source-integrity.js';
const story = {id:'adc-source', sourceClaims:[{id:'one',kind:'general',text:'The source describes an agreement.',sourceUrl:'https://example.test/source',status:'approved'}]};
const success = () => ({ok:true,text:async () => JSON.stringify({choices:[{message:{content:JSON.stringify(campaignFromApprovedClaims(story))}}]})});
function configure(t, patch={}) {
  const keys = ['AI_VERTEX_USE_ADC','AI_VERTEX_USE_METADATA','GOOGLE_OAUTH_ACCESS_TOKEN','GOOGLE_APPLICATION_CREDENTIALS','K_SERVICE'];
  const original = Object.fromEntries(keys.map(key => [key,process.env[key]]));
  for (const key of keys) delete process.env[key];
  Object.assign(process.env,patch);
  t.after(() => {for (const key of keys) original[key] === undefined ? delete process.env[key] : process.env[key] = original[key];});
}
const gateway = (options={}) => new AIGateway({provider:'gcp-vertex',projectId:'pilot-project',location:'us',model:'gemini-2.5-flash',allowSynthetic:false,...options});
const run = client => generateMultiFormatCampaign({gateway:client,story});

test('local ADC is off by default, and missing explicit ADC fails closed without provider fetch', async t => {
  configure(t);
  let calls = 0;
  await assert.rejects(run(gateway({adcTokenProvider:async () => {throw Error('must not be called');},fetch:async () => {calls++;}})), {code:'PROVIDER_CREDENTIALS_MISSING'});
  process.env.AI_VERTEX_USE_ADC = 'true';
  await assert.rejects(run(gateway({fetch:async () => {calls++;}})), {code:'PROVIDER_CREDENTIALS_MISSING'});
  process.env.GOOGLE_APPLICATION_CREDENTIALS = '/nonexistent/liquidity-test-adc.json';
  await assert.rejects(run(gateway({fetch:async () => {calls++;}})), error => {
    assert.equal(error.code,'PROVIDER_CREDENTIALS_MISSING');
    assert.doesNotMatch(JSON.stringify({message:error.message,trace:error.trace}),/nonexistent|refresh_token|access_token/);
    return true;
  });
  assert.equal(calls,0);
});

test('public GoogleAuth API owns repeat token acquisition and refresh; token never enters trace/config', async t => {
  configure(t,{AI_VERTEX_USE_ADC:'true'});
  let acquisitions = 0;
  const provider = createLocalADCTokenProvider({keyFilename:'/test-only/adc.json',GoogleAuthClass:class {
    constructor(options) {assert.equal(options.keyFilename,'/test-only/adc.json');assert.deepEqual(options.scopes,['https://www.googleapis.com/auth/cloud-platform']);}
    async getAccessToken() {return `test-sdk-renewed-${++acquisitions}`;}
  }});
  const client = gateway({adcTokenProvider:provider,fetch:async (url,options) => {
    assert.match(url,/aiplatform.us.rep.googleapis.com/);
    assert.equal(options.headers.Authorization,`Bearer test-sdk-renewed-${acquisitions}`);
    return success();
  }});
  for (let i=0;i<2;i++) {
    const result = await run(client);
    assert.equal(result.trace.status,'success');
    assert.doesNotMatch(JSON.stringify({trace:result.trace,config:client.getConfig()}),/test-sdk-renewed|adc.json/);
  }
  assert.equal(acquisitions,2);
});

test('metadata takes precedence over local ADC, and metadata failures never fall back', async t => {
  configure(t,{AI_VERTEX_USE_ADC:'true',AI_VERTEX_USE_METADATA:'true'});
  let adcCalls=0,providerCalls=0;
  const options = {adcTokenProvider:async () => {adcCalls++;return 'must-not-use';}};
  await run(gateway({...options,fetch:async (url,options) => {
    if (url.startsWith('http://metadata.')) return {ok:true,json:async () => ({access_token:'test-metadata'})};
    providerCalls++;assert.equal(options.headers.Authorization,'Bearer test-metadata');return success();
  }}));
  for (const response of [{ok:false},{ok:true,json:async () => ({})}]) {
    await assert.rejects(run(gateway({...options,fetch:async (url) => {
      if (url.startsWith('http://metadata.')) return response;
      providerCalls++;return success();
    }})));
  }
  assert.equal(adcCalls,0);assert.equal(providerCalls,1);
});

test('Cloud Run rejects local ADC flag even when a trusted constructor token adapter exists', t => {
  configure(t,{AI_VERTEX_USE_ADC:'true',K_SERVICE:'test-cloud-run'});
  assert.throws(() => gateway({adcTokenProvider:async () => 'test-only'}),/forbidden on Cloud Run/);
});

test('late ADC credential completion after deadline cannot start a provider fetch', async t => {
  configure(t,{AI_VERTEX_USE_ADC:'true'});
  let resolveToken,signal,fetches=0;
  const client = gateway({timeoutMs:10,adcTokenProvider:options => {signal=options.signal;return new Promise(resolve => {resolveToken=resolve;});},fetch:async () => {fetches++;return success();}});
  await assert.rejects(run(client),{code:'PROVIDER_TIMEOUT'});
  assert.equal(signal.aborted,true);
  resolveToken('test-late-token');
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(fetches,0);
});
