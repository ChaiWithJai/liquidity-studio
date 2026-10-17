import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, writeFileSync, readFileSync, rmSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const script = new URL('./gcp-pilot.mjs', import.meta.url).pathname;
const image = `us-east4-docker.pkg.dev/test-studio-project/studio/app@sha256:${'a'.repeat(64)}`;
const projectNumber = '12345';
const billingAccount = '000000-111111-222222';
const budget = { name: `billingAccounts/${billingAccount}/budgets/pilot-budget`, amount: { specifiedAmount: { currencyCode: 'USD', units: '100' } }, budgetFilter: { projects: [`projects/${projectNumber}`], calendarPeriod: 'MONTH' }, thresholdRules: [{ thresholdPercent: 0.8 }] };

function fixture({ reportPatch = {}, budgetPatch, env = {}, mode = 'deploy' } = {}) {
  const directory = mkdtempSync(path.join(os.tmpdir(), 'pilot-deploy-'));
  const log = path.join(directory, 'commands.jsonl');
  const preload = path.join(directory, 'fetch.cjs');
  writeFileSync(preload, `global.fetch = async () => ({ok:true,json:async()=>({name:'projects/test-studio-project/defaultSupportedIdpConfigs/google.com',enabled:!process.env.TEST_PROVIDER_DISABLED,clientId:'test.apps.googleusercontent.com'})});`);
  const reportPath = path.join(directory, 'report.json');
  const report = { project: 'test-studio-project', region: 'us-east4', image, commit: 'a'.repeat(40), generatedAt: new Date().toISOString(), authMode: 'google', checks: { anonymousApi:'passed', googleAuth:'passed', docker: 'passed', browser: 'passed', isolation: 'passed', restore: 'passed' }, ...reportPatch };
  writeFileSync(reportPath, JSON.stringify(report));
  writeFileSync(path.join(directory, 'gcloud'), `#!${process.execPath}\n` + `
const fs = require('node:fs');
const args = process.argv.slice(2);
fs.appendFileSync(process.env.TEST_GCLOUD_LOG, JSON.stringify(args)+'\\n');
if (process.env.TEST_AUTH_FAILURE) { console.error('Reauthentication required'); process.exit(1); }
if (args[0] === 'projects') console.log(JSON.stringify({projectId:'test-studio-project',projectNumber:'12345',lifecycleState:process.env.TEST_PROJECT_STATE||'ACTIVE'}));
else if (args[0]==='billing' && args[1]==='projects') console.log(JSON.stringify({billingEnabled:true,billingAccountName:'billingAccounts/${billingAccount}'}));
else if (args[0]==='billing' && args[1]==='budgets') console.log(process.env.TEST_BUDGET);
else if (args[0]==='firestore') console.log(JSON.stringify({locationId:'us-east4',type:'FIRESTORE_NATIVE'}));
else if (args[0]==='storage') console.log(JSON.stringify({name:'test-studio-project-liquidity-assets',projectNumber:process.env.TEST_BUCKET_PROJECT||'12345',location:'US-EAST4',iamConfiguration:{publicAccessPrevention:'enforced',uniformBucketLevelAccess:{enabled:!process.env.TEST_BUCKET_PUBLIC}}}));
else if (args[0]==='run' && args[1]==='revisions') console.log(JSON.stringify({spec:{containers:[{image:process.env.TEST_PREVIOUS_IMAGE}]}}));
else console.log('{}');
`, { mode: 0o755 });
  const result = spawnSync(process.execPath, [script, mode, '--apply'], { encoding: 'utf8', env: { ...process.env, NODE_OPTIONS: '--require=' + preload, STUDIO_FIREBASE_PROJECT_ID:'test-studio-project',STUDIO_FIREBASE_API_KEY:'public-api-key',STUDIO_FIREBASE_AUTH_DOMAIN:'test-studio-project.firebaseapp.com',STUDIO_FIREBASE_APP_ID:'1:12345:web:abc123',STUDIO_GOOGLE_FOUNDER_EMAIL:'founder@example.test',STUDIO_GOOGLE_MARKETER_EMAIL:'marketer@example.test', PATH: `${directory}${path.delimiter}${process.env.PATH}`, PILOT_PROJECT: 'test-studio-project', PILOT_REGION: 'us-east4', PILOT_MONTHLY_BUDGET: '100', PILOT_IMAGE: image, PILOT_ACCEPTANCE_REPORT: reportPath, PILOT_BUDGET_ID: 'pilot-budget', PILOT_BILLING_ACCOUNT: billingAccount, PILOT_FOUNDER_PASSWORD_SECRET: 'founder-pass:1', PILOT_MARKETER_PASSWORD_SECRET: 'marketer-pass:1', PILOT_PREVIOUS_REVISION: 'liquidity-studio-previous', TEST_GCLOUD_LOG: log, TEST_BUDGET: JSON.stringify(budgetPatch || budget), TEST_PREVIOUS_IMAGE: image, ...env } });
  let commands = [];
  try { commands = readFileSync(log, 'utf8').trim().split('\n').filter(Boolean).map(JSON.parse); } catch {}
  rmSync(directory, { recursive: true, force: true });
  return { ...result, commands };
}
const mutations = result => result.commands.filter(args => (args[0] === 'run' && args[1] === 'deploy') || args.includes('update-traffic'));

test('only a passing bound report and verified private dependencies reach the fake deployment boundary', () => {
  const result = fixture();
  assert.equal(result.status, 0, result.stderr);
  const [deploy] = mutations(result);
  assert.ok(deploy.includes('--max=1'));
  assert.ok(deploy.includes('--allow-unauthenticated'));
  assert.ok(deploy.includes('--clear-secrets'));
  assert.ok(!deploy.some(arg => /PASSWORD|--set-secrets/.test(arg)));
  assert.ok(deploy.includes('--no-iap'));
  assert.ok(deploy.some(arg => arg.startsWith('--env-vars-file=')));
});

test('missing, stale, failed or mismatched evidence never invokes gcloud', () => {
  for (const input of [{ env: { PILOT_ACCEPTANCE_REPORT: '/missing/pilot-report.json' } }, { reportPatch: { authMode: 'google', checks: { anonymousApi:'passed', googleAuth:'passed', docker: 'passed' } } }, { reportPatch: { generatedAt: '2020-01-01T00:00:00Z' } }, { reportPatch: { image: image.replace('a'.repeat(64), 'b'.repeat(64)) } }, { env: { PILOT_REGION: 'us-central1' } }, { env: { PILOT_ASSET_BUCKET: 'bad,STUDIO_STORAGE_MODE=sqlite' } }]) {
    const result = fixture(input);
    assert.equal(result.status, 1);
    assert.deepEqual(result.commands, []);
  }
});

test('failed auth, wrong project budget and foreign/public bucket cannot mutate resources', () => {
  const wrongProjectBudget = structuredClone(budget); wrongProjectBudget.budgetFilter.projects = ['projects/99999'];
  for (const input of [{ env: { TEST_AUTH_FAILURE: '1' } }, { env: { TEST_PROJECT_STATE: 'DELETE_REQUESTED' } }, { budgetPatch: wrongProjectBudget }, { env: { TEST_BUCKET_PROJECT: '99999' } }, { env: { TEST_BUCKET_PUBLIC: '1' } }]) {
    const result = fixture(input);
    assert.equal(result.status, 1);
    assert.deepEqual(mutations(result), []);
  }
});

test('rollback verifies the previous revision image rather than trusting its name', () => {
  assert.equal(fixture({ mode: 'rollback' }).status, 0);
  const wrongImage = fixture({ mode: 'rollback', env: { TEST_PREVIOUS_IMAGE: 'wrong-image:latest' } });
  assert.equal(wrongImage.status, 1);
  assert.deepEqual(mutations(wrongImage), []);
});

test('Google provider and explicit managed configuration must pass before candidate creation', () => {
  for (const env of [{TEST_PROVIDER_DISABLED:'1'}, {STUDIO_GOOGLE_MARKETER_EMAIL:''}, {STUDIO_FIREBASE_PROJECT_ID:'wrong-project'}]) assert.equal(mutations(fixture({env})).length,0);
});

test('password-era acceptance cannot authorize Google deployment', () => {
 const result=fixture({reportPatch:{authMode:'password'}});
 assert.equal(result.status,1);assert.equal(mutations(result).length,0);
});
