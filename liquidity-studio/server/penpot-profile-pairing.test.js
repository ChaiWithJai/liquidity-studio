import test from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {DurableStore} from './storage.js';
import {IdentityService} from './auth.js';
import {PenpotProfilePairing} from './penpot-profile-pairing.js';
const nativeInstanceId='11111111-1111-4111-8111-111111111111',nativeProfileId='22222222-2222-4222-8222-222222222222',otherProfile='33333333-3333-4333-8333-333333333333',pairingKey='a'.repeat(43),scope={organizationId:'org_default',brandId:'brand_vedic'},finance={organizationId:'org_default',brandId:'brand_default'};
const digest=value=>createHash('sha256').update(value).digest('hex');
async function setup(t){const store=new DurableStore(':memory:'),identity=new IdentityService(store);t.after(()=>store.close());for(const role of ['founder','marketer'])await identity.provision({username:role,password:`private-test-${role}-password`,role});const founder=await identity.login('founder','private-test-founder-password'),marketer=await identity.login('marketer','private-test-marketer-password');let now=Date.now();const service=new PenpotProfilePairing({store,identity,nativeInstanceId,pairingKey,now:()=>now});return {store,identity,service,founder,marketer,tick:ms=>now+=ms};}
async function issue(f,login=f.founder,selected=scope){const result=await f.service.issue(login.user,selected,digest(login.token));return {...result,token:new URL(result.nativeConnectUrl).searchParams.get('challenge')};}
async function proof(f,request,profile=nativeProfileId){return f.service.receiveProof(pairingKey,{challenge:request.token,nativeInstanceId,nativeProfileId:profile,nativeProfileName:'Native Person'});}
test('native proof remains pending until deliberate same-session Studio completion; secrets are hashed only',async t=>{
 const f=await setup(t),session=digest(f.founder.token);assert.equal((await f.service.status(f.founder.user,scope,session)).state,'not-connected');const request=await issue(f);assert.equal(request.token.length,43);assert.equal((await f.service.status(f.founder.user,scope,session)).state,'pending');
 await assert.rejects(f.service.complete(f.founder.user,scope,session,{challengeId:request.id}),{status:409});assert.deepEqual(await proof(f,request),{recorded:true});assert.deepEqual(await proof(f,request),{recorded:true});const confirmed=await f.service.status(f.founder.user,scope,session);assert.equal(confirmed.state,'native-confirmed');assert.equal(confirmed.connection,null);assert.equal(confirmed.editingEnabled,false);
 const all=JSON.stringify(f.store.keys('penpot-profile-').map(key=>f.store.get(key)));assert.ok(!all.includes(request.token));assert.ok(!all.includes(f.founder.token));assert.ok(!all.includes(pairingKey));
 const connected=await f.service.complete(f.founder.user,scope,session,{challengeId:request.id});assert.equal(connected.state,'connected');assert.equal(connected.connection.nativeProfileId,nativeProfileId);assert.equal(connected.editingEnabled,false);
 await assert.rejects(f.service.issue(f.founder.user,scope,session),{status:409});await assert.rejects(proof(f,request),{status:409});await assert.rejects(f.service.complete(f.founder.user,scope,session,{challengeId:request.id}),{status:409});
});
test('proof cannot change profile, instance or key; completion rejects another actor, session or scope',async t=>{
 const f=await setup(t),request=await issue(f);await assert.rejects(f.service.receiveProof('b'.repeat(43),{challenge:request.token,nativeInstanceId,nativeProfileId}),{status:403});await assert.rejects(f.service.receiveProof(pairingKey,{challenge:request.token,nativeInstanceId:otherProfile,nativeProfileId}),{status:400});await proof(f,request);await assert.rejects(proof(f,request,otherProfile),{status:409});
 const another=await f.identity.login('founder','private-test-founder-password');await assert.rejects(f.service.complete(another.user,scope,digest(another.token),{challengeId:request.id}),{status:409});await assert.rejects(f.service.complete(f.founder.user,finance,digest(f.founder.token),{challengeId:request.id}),{status:409});await assert.rejects(f.service.complete(f.marketer.user,scope,digest(f.marketer.token),{challengeId:request.id}),{status:409});
 assert.equal((await f.service.status(f.founder.user,scope,digest(f.founder.token))).state,'native-confirmed');
});
test('expiry, logout and changed membership deny proof and completion before any activation',async t=>{
 const f=await setup(t),request=await issue(f);f.tick(120000);assert.equal((await f.service.status(f.founder.user,scope,digest(f.founder.token))).state,'expired');await assert.rejects(proof(f,request),{status:410});
 const next=await issue(f);await proof(f,next);await f.identity.logout(f.founder.token);await assert.rejects(f.service.complete(f.founder.user,scope,digest(f.founder.token),{challengeId:next.id}),{status:401});await assert.rejects(proof(f,next),{status:401});
 const m=await issue(f,f.marketer);f.store.update('identity',state=>{state.memberships.find(x=>x.userId===f.marketer.user.id).brandIds=[];return state;});await assert.rejects(proof(f,m),{status:403});
});
test('two pending maximum and explicit disconnect revoke every pending epoch without touching native files',async t=>{
 const f=await setup(t),one=await issue(f),two=await issue(f);await assert.rejects(issue(f),{status:429});await proof(f,one);const state=await f.service.disconnect(f.founder.user,scope,digest(f.founder.token),{});assert.equal(state.state,'not-connected');await assert.rejects(proof(f,one),{status:409});await assert.rejects(proof(f,two),{status:409});assert.ok(f.store.keys('').every(key=>!key.startsWith('penpot-story-designs:')&&!key.startsWith('editor-security:')));assert.ok(await issue(f));
});
test('one native identity cannot connect two Studio people; explicit owner disconnect releases mapping',async t=>{
 const f=await setup(t),a=await issue(f),b=await issue(f,f.marketer);await proof(f,a);await proof(f,b);await f.service.complete(f.founder.user,scope,digest(f.founder.token),{challengeId:a.id});await assert.rejects(f.service.complete(f.marketer.user,scope,digest(f.marketer.token),{challengeId:b.id}),{status:409});await f.service.disconnect(f.founder.user,scope,digest(f.founder.token),{});assert.equal((await f.service.complete(f.marketer.user,scope,digest(f.marketer.token),{challengeId:b.id})).state,'connected');
});
test('current identity and session are checked inside the final transaction, not just preflight authorize',async t=>{
 const f=await setup(t),request=await issue(f);await proof(f,request);const authorize=f.identity.authorize.bind(f.identity);f.identity.authorize=async(...args)=>{const result=await authorize(...args);f.store.update('identity',state=>{state.users.find(x=>x.id===f.founder.user.id).authVersion=1;return state;});return result;};await assert.rejects(f.service.complete(f.founder.user,scope,digest(f.founder.token),{challengeId:request.id}),{status:401});assert.equal(f.store.get(f.service.pairKey(f.founder.user.id)).connection,null);
});
