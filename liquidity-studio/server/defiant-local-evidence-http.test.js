import test from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {DurableStore} from './storage.js';
import {createPlatform} from './platform.js';
import {createHttpServer} from './index.js';
import {googleAuthConfiguration} from './google-auth.js';
import {DefiantStrategyService} from './defiant-strategy.js';
const configuration=googleAuthConfiguration({STUDIO_FIREBASE_PROJECT_ID:'test-studio-project',STUDIO_FIREBASE_API_KEY:'public-key',STUDIO_FIREBASE_AUTH_DOMAIN:'test-studio-project.firebaseapp.com',STUDIO_FIREBASE_APP_ID:'public-app',STUDIO_GOOGLE_FOUNDER_EMAIL:'founder@example.com',STUDIO_GOOGLE_MARKETER_EMAIL:'marketer@example.com'});
test('real HTTP pairing keeps Firebase inside approval and restricts renewable credentials to current scoped evidence',async t=>{
 const store=new DurableStore(':memory:');let managedUid='google-user',disabled=false,loads=0,revokeDuringLoad=false;
 const platform=createPlatform({store,authMode:'google',googleAuth:{configuration,
  verifyIdToken:async(token,revoked)=>{assert.equal(revoked,true);if(token!=='fixture-google-token')throw Error('private credential detail');return {aud:'test-studio-project',iss:'https://securetoken.google.com/test-studio-project',sub:'google-user',iat:Math.floor(Date.now()/1000)-5,exp:Math.floor(Date.now()/1000)+3600,email:'founder@example.com',email_verified:true,firebase:{sign_in_provider:'google.com'}};},
  lookupJobUser:async()=>({uid:managedUid,email:'founder@example.com',emailVerified:true,disabled,providerData:[{providerId:'google.com'}],tokensValidAfterTime:'1970-01-01T00:00:00Z'})}});await platform.ready;
 const owner=await platform.identity.authenticate('fixture-google-token');const org=await platform.identity.createOrganization(owner,'Invented evidence');await new DefiantStrategyService({store,identity:platform.identity,organizationId:org.id}).enable(owner,{});
 const provider=async({organizationId})=>({loadSnapshot:async()=>{loads++;if(revokeDuringLoad)await store.update('identity',s=>({...s,memberships:s.memberships.filter(m=>m.organizationId!==org.id)}));return {schemaVersion:1,organizationId,coverage:'Invented private HTTP fixture',months:[],receipts:[]};}});
 const server=createHttpServer(null,{platform,defiantEvidenceProvider:provider,enableLocalEvidenceGrants:true});await new Promise(r=>server.listen(0,'127.0.0.1',r));t.after(async()=>{await new Promise(r=>server.close(r));store.close();});const base=`http://127.0.0.1:${server.address().port}`;
 const post=(operation,body,bearer)=>fetch(base+'/api/studio/local-evidence/'+operation,{method:'POST',headers:{'content-type':'application/json',...(bearer?{Authorization:'Bearer '+bearer}:{})},body:JSON.stringify(body)});
 const read=(path,bearer)=>fetch(base+path,{headers:{Authorization:'Bearer '+bearer}});
 const verifier='x'.repeat(43),verifierHash=createHash('sha256').update(verifier).digest('hex');
 const pair=await (await post('begin',{organizationId:org.id,verifierHash,clientName:'Invented client'})).json();
 assert.equal((await post('inspect',{organizationId:org.id,pairingId:pair.pairingId})).status,403);
 const inspection=await (await post('inspect',{organizationId:org.id,pairingId:pair.pairingId},'fixture-google-token')).json();assert.equal(inspection.scope,'evidence:read');assert.equal(inspection.clientName,'Invented client');assert.equal(inspection.verifierHash,undefined);
 assert.equal((await post('approve',{organizationId:org.id,pairingId:pair.pairingId},'fixture-google-token')).status,200);
 const credentials=await (await post('exchange',{pairingId:pair.pairingId,verifier})).json();assert.ok(credentials.accessToken.startsWith('ea.'));
 const path='/api/studio/defiant-evidence/'+org.id+'/manifest';assert.equal((await read(path,credentials.accessToken)).status,200);assert.equal(loads,1);
 assert.equal((await read('/api/auth/session',credentials.accessToken)).status,401);
 assert.equal((await read('/api/studio/defiant-evidence/other/manifest',credentials.accessToken)).status,403);assert.equal(loads,1);
 assert.equal((await post('approve',{organizationId:org.id,pairingId:pair.pairingId},credentials.accessToken)).status,403);
 const listed=await (await post('list',{organizationId:org.id},'fixture-google-token')).json();assert.equal(listed.grants.length,1);assert.equal(listed.grants[0].clientName,'Invented client');assert.equal(listed.grants[0].readOnly,true);assert.equal(listed.grants[0].renewalHash,undefined);assert.equal((await post('list',{organizationId:org.id},credentials.accessToken)).status,403);
 const rotated=await (await post('renew',{organizationId:org.id,renewalToken:credentials.renewalToken})).json();assert.equal(rotated.expiresAt,credentials.expiresAt);assert.equal((await read(path,credentials.accessToken)).status,403);
 managedUid='replacement-account';assert.equal((await read(path,rotated.accessToken)).status,403);managedUid='google-user';disabled=true;assert.equal((await read(path,rotated.accessToken)).status,403);disabled=false;
 revokeDuringLoad=true;const revoked=await read(path,rotated.accessToken);assert.equal(revoked.status,403);assert.equal((await revoked.text()).includes('Invented private HTTP fixture'),false);
 assert.equal((await post('begin',{organizationId:org.id,verifierHash,clientName:'Client',extra:'private'})).status,400);
 assert.equal((await fetch(base+'/api/studio/local-evidence/begin')).status,405);
});
