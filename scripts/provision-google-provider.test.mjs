import {test} from 'node:test';
import assert from 'node:assert/strict';
import {validateProviderInput,assertDisabled,provisionGoogleProvider} from './provision-google-provider.mjs';
const env={PILOT_PROJECT:'test-studio-project',PILOT_FIREBASE_APP_ID:'1:12345:web:abc123',PILOT_SUPPORT_EMAIL:'support@example.test',PILOT_AUTH_DOMAIN:'test-studio-project.firebaseapp.com'};
test('plan never invokes process or network; explicit app and target required',async()=>{
 const fail=()=>assert.fail('plan must be offline');
 assert.equal((await provisionGoogleProvider({mode:'plan',env,run:fail,fetchImpl:fail})).tool,'firebase-tools@15.34.0');
 for(const patch of [{PILOT_PROJECT:''},{PILOT_FIREBASE_APP_ID:'fake'},{PILOT_AUTH_DOMAIN:'attacker.test'}]) assert.throws(()=>validateProviderInput({...env,...patch}));
});
test('apply refuses target mismatch before reading tools, credentials or contacting network',async()=>{
 await assert.rejects(provisionGoogleProvider({mode:'apply',env:{...env,PILOT_CONFIRM_PROJECT:'different-project'},run:()=>assert.fail(),fetchImpl:()=>assert.fail()}),/match explicit target/);
});
test('preexisting alternate sign-in methods fail closed rather than trusting false CLI flags',()=>{
 assertDisabled({});assertDisabled({signIn:{anonymous:{enabled:false},email:{enabled:false}}});
 for(const key of ['anonymous','email']) assert.throws(()=>assertDisabled({signIn:{[key]:{enabled:true}}}),/disabled explicitly/);
});

test('auth-only apply binds project, preserves disabled alternatives and never exposes provider secrets',async()=>{
 const fs=await import('node:fs'),os=await import('node:os'),path=await import('node:path');
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'provider-test-'));fs.mkdirSync(path.join(dir,'lib/bin'),{recursive:true});fs.writeFileSync(path.join(dir,'package.json'),JSON.stringify({version:'15.34.0'}));
 try {
  const calls=[];const input={...env,PILOT_CONFIRM_PROJECT:env.PILOT_PROJECT,PILOT_FIREBASE_CLI:path.join(dir,'lib/bin/firebase.js')};
  const run=(exe,args)=>{calls.push(args);return{status:0,stdout:'secret-token'};};
  const fetchImpl=async url=>({ok:true,json:async()=>url.includes('/webApps/')?{appId:env.PILOT_FIREBASE_APP_ID,projectId:env.PILOT_PROJECT}:url.endsWith('/config')?{signIn:{anonymous:{enabled:false},email:{enabled:false}}}:{enabled:true,clientId:'client.apps.googleusercontent.com',clientSecret:'never-expose'}});
  const result=await provisionGoogleProvider({mode:'apply',env:input,run,fetchImpl});assert.equal(result.googleEnabled,true);assert.doesNotMatch(JSON.stringify(result),/never-expose|secret-token/);
  const deployment=calls[1];assert.equal(deployment[deployment.indexOf('--only')+1],'auth');assert.equal(deployment[deployment.indexOf('--project')+1],env.PILOT_PROJECT);assert.ok(!fs.existsSync(deployment[deployment.indexOf('--config')+1]));
 }finally{fs.rmSync(dir,{recursive:true,force:true});}
});
