import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, writeFileSync, readFileSync, rmSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
const script = new URL('./gcp-provision.mjs', import.meta.url).pathname;
const project = 'pilot-project';
const account = '000000-111111-222222';
const budget = { name: `billingAccounts/${account}/budgets/pilot-budget`, amount: { specifiedAmount: { currencyCode: 'USD', units: '100' } }, budgetFilter: { projects: ['projects/12345'] }, thresholdRules: [{ thresholdPercent: 0.8 }] };
const secret = 'test-only-long-password';
function run(mode, env = {}, budgetValue = budget) {
  const directory = mkdtempSync(path.join(os.tmpdir(), 'pilot-provision-'));
  const log = path.join(directory, 'commands');
  writeFileSync(path.join(directory, 'gcloud'), `#!${process.execPath}\n` + `
const fs=require('node:fs');const args=process.argv.slice(2);
const record={args, secretEnvLeaked:!!process.env.PILOT_FOUNDER_PASSWORD||!!process.env.PILOT_MARKETER_PASSWORD};
if(args[0]==='secrets'&&args[1]==='versions'&&args[2]==='add')record.stdinLength=fs.readFileSync(0,'utf8').length;
fs.appendFileSync(process.env.TEST_LOG,JSON.stringify(record)+'\\n');
if(process.env.TEST_AUTH_FAILURE){console.error('Authentication failed');process.exit(1);}
const existing=!!process.env.TEST_EXISTING;
if(args[0]==='projects'&&args[1]==='describe')console.log(JSON.stringify({projectId:'pilot-project',projectNumber:'12345',lifecycleState:'ACTIVE',parent:{type:'organization',id:'313384662705'}}));
else if(args[0]==='billing'&&args[1]==='projects')console.log(JSON.stringify({billingEnabled:!process.env.TEST_NO_BILLING,billingAccountName:'billingAccounts/${account}'}));
else if(args[0]==='billing'&&args[1]==='budgets')console.log(process.env.TEST_BUDGET);
else if(args[0]==='firestore'&&args[2]==='list')console.log(JSON.stringify(existing?[{name:'projects/pilot-project/databases/liquidity-studio-pilot',locationId:'us-east4',type:'FIRESTORE_NATIVE'}]:[]));
else if(args[0]==='storage'&&args[2]==='list')console.log(JSON.stringify(existing?[{name:'pilot-project-liquidity-assets'}]:[]));
else if(args[0]==='storage'&&args[2]==='describe')console.log(JSON.stringify({name:'pilot-project-liquidity-assets',projectNumber:'12345',location:'US-EAST4',iamConfiguration:{publicAccessPrevention:'enforced',uniformBucketLevelAccess:{enabled:true}}}));
else if(args[0]==='iam'&&args[1]==='service-accounts'&&args[2]==='list')console.log(JSON.stringify(existing?[{email:'liquidity-runtime@pilot-project.iam.gserviceaccount.com'}]:[]));
else if(args[0]==='artifacts'&&args[2]==='list')console.log(JSON.stringify(existing?[{name:'projects/pilot-project/locations/us-east4/repositories/liquidity-studio'}]:[]));
else if(args[0]==='iam'&&args[1]==='roles'&&args[2]==='list')console.log(JSON.stringify(existing?[{name:'projects/pilot-project/roles/liquidityAuthReader'}, {name:'projects/pilot-project/roles/liquidityVertexPredictor',includedPermissions:['aiplatform.endpoints.predict','serviceusage.services.use']},{name:'projects/pilot-project/roles/liquidityArtifactAccess',includedPermissions:['storage.buckets.get','storage.objects.create','storage.objects.delete','storage.objects.get']}]:[]));
else if(args[0]==='iam'&&args[1]==='roles'&&args[2]==='describe')console.log(JSON.stringify({includedPermissions:args[3]==='liquidityAuthReader'?['firebaseauth.users.get']:args[3]==='liquidityVertexPredictor'?['aiplatform.endpoints.predict','serviceusage.services.use']:['storage.buckets.get','storage.objects.create','storage.objects.delete','storage.objects.get']}));
else if(args[0]==='secrets'&&args[1]==='list')console.log(JSON.stringify(existing?[{name:'projects/pilot-project/secrets/liquidity-founder-password'},{name:'projects/pilot-project/secrets/liquidity-marketer-password'}]:[]));
else if(args[0]==='secrets'&&args[1]==='versions'&&args[2]==='list')console.log(JSON.stringify(existing?[{name:'projects/pilot-project/secrets/'+args[3]+'/versions/1',state:'ENABLED'}]:[]));
else if(args[0]==='secrets'&&args[1]==='versions'&&args[2]==='add')console.log(JSON.stringify({name:'projects/pilot-project/secrets/'+args[3]+'/versions/1'}));
else if(args[0]==='run'&&args[2]==='describe')console.log(JSON.stringify({metadata:{annotations:{'run.googleapis.com/iap-enabled':process.env.TEST_IAP_DISABLED?'false':'true'}}}));
else if(args[0]==='iap'&&args[1]==='settings'&&args[2]==='get')console.log(JSON.stringify(process.env.TEST_CUSTOM_OAUTH?{accessSettings:{oauthSettings:{clientId:'test.apps.googleusercontent.com'}}}:{}));
else if(args.includes('get-iam-policy'))console.log(JSON.stringify({bindings:process.env.TEST_BROAD_IAP?[{role:'roles/iap.httpsResourceAccessor',members:['allAuthenticatedUsers']}]:[]}));
else console.log('{}');
`, { mode: 0o755 });
  const result = spawnSync(process.execPath, [script, mode, ...(mode === 'plan' ? [] : ['--apply'])], { encoding: 'utf8', env: { ...process.env, PILOT_AUTH_MODE:'legacy-password-iap', PATH: `${directory}${path.delimiter}${process.env.PATH}`, PILOT_PROJECT: project, PILOT_REGION: 'us-east4', PILOT_MONTHLY_BUDGET: '100', PILOT_FOUNDER_EMAIL: 'founder@chaiwithjai.com', PILOT_MARKETER_EMAIL: 'marketer@chaiwithjai.com', PILOT_FOUNDER_PASSWORD: secret, PILOT_MARKETER_PASSWORD: secret, PILOT_BILLING_ACCOUNT: account, PILOT_BUDGET_ID: 'pilot-budget', TEST_LOG: log, TEST_BUDGET: JSON.stringify(budgetValue), ...env } });
  let records = [];
  try { records = readFileSync(log, 'utf8').trim().split('\n').filter(Boolean).map(JSON.parse); } catch {}
  rmSync(directory, { recursive: true, force: true });
  return { ...result, records };
}
const changes = result => result.records.filter(record => record.args.some(arg => ['enable', 'create', 'add', 'add-iam-policy-binding'].includes(arg)));

test('plan prints reviewable resources without CLI invocation or exposing secret values', () => {
  const result = run('plan');
  assert.equal(result.status, 0, result.stderr);
  assert.deepEqual(result.records, []);
  assert.doesNotMatch(result.stdout + result.stderr, new RegExp(secret));
  assert.match(result.stdout, /redacted secret input/);
});

test('billing/auth/budget failure and missing identities or credentials prevent all resource changes', () => {
  const wrongBudget = structuredClone(budget); wrongBudget.budgetFilter.projects = ['projects/99999'];
  for (const input of [{ env: { TEST_NO_BILLING: '1' } }, { env: { TEST_AUTH_FAILURE: '1' } }, { budget: wrongBudget }, { env: { PILOT_MARKETER_EMAIL: '' } }, { env: { PILOT_FOUNDER_PASSWORD: '' } }, { env: { PILOT_REGION: 'us-central1' } }]) {
    const result = run('apply', input.env, input.budget);
    assert.equal(result.status, 1);
    assert.deepEqual(changes(result), []);
  }
});

test('new prerequisite resources use scoped roles and secret stdin without values in logs or child environment', () => {
  const result = run('apply');
  assert.equal(result.status, 0, result.stderr);
  const uploads = result.records.filter(record => record.args.slice(0, 3).join(' ') === 'secrets versions add');
  assert.equal(uploads.length, 2);
  assert.ok(uploads.every(record => record.args.includes('--data-file=-') && record.stdinLength === secret.length));
  assert.ok(result.records.every(record => !record.secretEnvLeaked));
  assert.doesNotMatch(result.stdout + result.stderr + JSON.stringify(result.records), new RegExp(secret));
  assert.ok(changes(result).some(record => record.args.includes('--public-access-prevention')));
  assert.ok(changes(result).some(record => record.args.includes('--role=roles/datastore.user')));
  assert.ok(!changes(result).some(record => record.args.includes('--role=roles/owner') || record.args.includes('--role=roles/editor')));
  assert.ok(!changes(result).some(record => record.args[0] === 'iap'));
});

test('rerunning prerequisites preserves existing resources and enabled secret versions', () => {
  const result = run('apply', { TEST_EXISTING: '1' });
  assert.equal(result.status, 0, result.stderr);
  assert.ok(!changes(result).some(record => record.args.includes('create')));
  assert.ok(!changes(result).some(record => record.args.slice(0, 3).join(' ') === 'secrets versions add'));
});

test('access is separate, requires IAP already enabled and denies unexpected inherited principals', () => {
  const accepted = run('access');
  assert.equal(accepted.status, 0, accepted.stderr);
  assert.equal(changes(accepted).filter(record => record.args[0] === 'iap').length, 2);
  for (const env of [{ TEST_IAP_DISABLED: '1' }, { TEST_BROAD_IAP: '1' }]) {
    const result = run('access', env);
    assert.equal(result.status, 1);
    assert.deepEqual(changes(result), []);
  }
});

test('external identity does not block prerequisites; access requires observed custom OAuth rather than a readiness flag', () => {
  const external = { PILOT_MARKETER_EMAIL: 'nicole.mercede@gmail.com' };
  assert.equal(run('apply', external).status, 0);
  const denied = run('access', { ...external, PILOT_EXTERNAL_IAP_OAUTH_READY: 'true' });
  assert.equal(denied.status, 1);
  assert.deepEqual(changes(denied), []);
  assert.equal(run('access', { ...external, TEST_CUSTOM_OAUTH: '1' }).status, 0);
});

test('managed Google prerequisites create minimal auth reader without passwords or IAP grants', () => {
  const result = run('apply', {PILOT_AUTH_MODE:'google',PILOT_FOUNDER_PASSWORD:'',PILOT_MARKETER_PASSWORD:''});
  assert.equal(result.status,0,result.stderr);
  assert.ok(!result.records.some(record=>['secrets','iap'].includes(record.args[0])));
  assert.ok(result.records.some(record=>record.args.includes('--permissions=firebaseauth.users.get')));
  assert.ok(result.records.some(record=>record.args.includes('--role=projects/pilot-project/roles/liquidityAuthReader')));
});


test('plan explicitly exposes billing API bootstrap and required API inventory without invoking gcloud', () => {
  const result=run('plan');assert.equal(result.status,0,result.stderr);assert.deepEqual(result.records,[]);
  const lines=result.stdout.trim().split('\n').map(JSON.parse);
  assert.match(lines[0].billingApiBootstrap,/Explicitly enable/);
  const enables=lines.filter(line=>line.args?.slice(0,2).join(' ')==='services enable');
  assert.equal(enables.length,2);
  for(const api of ['cloudbilling.googleapis.com','billingbudgets.googleapis.com'])assert.ok(enables.every(line=>line.args.includes(api)));
  assert.ok(enables[0].args.includes('--project=pilot-project'));assert.ok(enables[0].args.includes('--billing-project=pilot-project'));
});

test('provisioning billing read gates select the explicit quota project before service enable', () => {
 const result=run('apply',{PILOT_AUTH_MODE:'google',PILOT_FOUNDER_PASSWORD:'',PILOT_MARKETER_PASSWORD:''});assert.equal(result.status,0,result.stderr);
 const reads=result.records.filter(record=>record.args[0]==='projects'||record.args[0]==='billing');
 assert.ok(reads.every(record=>record.args.includes('--project=pilot-project')&&record.args.includes('--billing-project=pilot-project')));
 const firstEnable=result.records.findIndex(record=>record.args[0]==='services'&&record.args[1]==='enable');
 const budgetRead=result.records.findIndex(record=>record.args[0]==='billing'&&record.args[1]==='budgets');assert.ok(firstEnable>budgetRead);
});
