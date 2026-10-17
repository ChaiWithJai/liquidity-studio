import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
const root = path.resolve(import.meta.dirname, '..');
test('local setup creates Google configuration without credentials and preserves existing files',t=>{
 const directory=fs.mkdtempSync(path.join(os.tmpdir(),'studio-google-setup-'));t.after(()=>fs.rmSync(directory,{recursive:true,force:true}));
 const target=path.join(directory,'studio.env');const env={...process.env,STUDIO_ENV_FILE:target,STUDIO_FIREBASE_PROJECT_ID:'demo-local-test'};
 const output=execFileSync(process.execPath,['scripts/setup-local.mjs'],{cwd:root,env,encoding:'utf8'});const content=fs.readFileSync(target,'utf8');assert.match(content,/STUDIO_AUTH_MODE=google/);assert.match(content,/STUDIO_NODE_ENV=production/);assert.match(content,/STUDIO_FIREBASE_PROJECT_ID="demo-local-test"/);assert.doesNotMatch(content,/PASSWORD|SECRET|SESSION|PRIVATE_KEY/);assert.doesNotMatch(output,/demo-local-test/);assert.equal(fs.statSync(target).mode&0o777,0o600);
 fs.writeFileSync(target,'operator-controlled-content\n');execFileSync(process.execPath,['scripts/setup-local.mjs'],{cwd:root,env});assert.equal(fs.readFileSync(target,'utf8'),'operator-controlled-content\n');
});
test('production and Cloud Run explicitly reject the legacy password identity mode',()=>{
 const code=`import assert from 'node:assert/strict';import {createPlatform} from './liquidity-studio/server/platform.js';import {DurableStore} from './liquidity-studio/server/storage.js';const store=new DurableStore(':memory:');const platform=createPlatform({store});await assert.rejects(platform.ready,/Unsupported or unsafe authentication mode/);assert.deepEqual(store.get('identity'),null);store.close();`;
 for(const flags of [{NODE_ENV:'production'},{NODE_ENV:'test',K_SERVICE:'cloud-run-service'}])execFileSync(process.execPath,['--input-type=module','-e',code],{cwd:root,env:{...process.env,STUDIO_AUTH_MODE:'password',...flags}});
});
