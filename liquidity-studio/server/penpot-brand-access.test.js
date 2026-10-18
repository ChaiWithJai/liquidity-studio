import test from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {DurableStore} from './storage.js';
import {IdentityService} from './auth.js';
import {PenpotProfilePairing} from './penpot-profile-pairing.js';
import {PenpotBrandAccess} from './penpot-brand-access.js';
import {createPenpotStoryRpc} from './penpot-story-design.js';
const id=n=>`${n.repeat(8)}-${n.repeat(4)}-4${n.repeat(3)}-8${n.repeat(3)}-${n.repeat(12)}`;
const nativeInstanceId=id('1'),operator=id('2'),teamId=id('3'),projectId=id('4'),human=id('5'),otherTeam=id('6');
const nativeRequest=(profile,operation,team=teamId)=>({nativeProfileId:profile,nativeTeamId:team,operation,nativeSession:{id:id('9'),profileId:profile}});
const scope={organizationId:'org_default',brandId:'brand_vedic'},finance={organizationId:'org_default',brandId:'brand_default'},pairingKey='a'.repeat(43),digest=x=>createHash('sha256').update(x).digest('hex');
async function setup(t){
 const store=new DurableStore(':memory:'),identity=new IdentityService(store);t.after(()=>store.close());for(const role of ['founder','marketer'])await identity.provision({username:role,password:`private-${role}-test-password`,role});const founder=await identity.login('founder','private-founder-test-password'),marketer=await identity.login('marketer','private-marketer-test-password');
 const pairing=new PenpotProfilePairing({store,identity,nativeInstanceId,pairingKey});let team=teamId,members=[{id:operator,isOwner:true,isAdmin:true,canEdit:true,isActive:true},{id:human,isOwner:false,isAdmin:false,canEdit:true,isActive:true}];const calls=[];
 const workspaceFor=async()=>({ownerPrincipal:operator,projectId,teamId:team,fonts:[]});
 const rpc=async(workspace,command,input)=>{calls.push({workspace,command,input});switch(command){case 'get-profile':return {id:operator};case 'get-project':return {id:projectId,teamId:team};case 'get-team':return {id:team};case 'get-team-members':return structuredClone(members);default:throw Error('Unexpected mutation');}};
 const service=new PenpotBrandAccess({store,identity,pairing,scope,workspaceFor,rpc});
 async function connect(login=marketer,profile=human){const session=digest(login.token),request=await pairing.issue(login.user,scope,session);await pairing.receiveProof(pairingKey,{challenge:new URL(request.nativeConnectUrl).searchParams.get('challenge'),nativeInstanceId,nativeProfileId:profile});await pairing.complete(login.user,scope,session,{challengeId:request.id});return session;}
 return {store,identity,pairing,founder,marketer,service,connect,workspaceFor,rpc,calls,setTeam:value=>team=value,setMembers:value=>members=value};
}
test('registration verifies real-shaped native ownership and reserves one immutable team per brand without native mutation',async t=>{
 const f=await setup(t);const sentinel={humanText:'preserved',ownerPrincipal:operator};f.store.update('penpot-story-designs:org_default:brand_vedic',()=>sentinel);
 const result=await f.service.registerWorkspace(f.founder.user,{});assert.equal(result.editingEnabled,false);assert.equal(result.state,'pending');assert.deepEqual(f.calls.map(x=>x.command),['get-profile','get-project','get-team','get-team-members']);assert.equal(f.store.get(f.service.key).operatorProfileId,operator);assert.deepEqual(f.store.get('penpot-story-designs:org_default:brand_vedic'),sentinel);
 const other=new PenpotBrandAccess({store:f.store,identity:f.identity,pairing:f.pairing,scope:finance,workspaceFor:f.workspaceFor,rpc:f.rpc});await assert.rejects(other.registerWorkspace(f.founder.user,{}),{status:409});f.setTeam(otherTeam);await assert.rejects(f.service.registerWorkspace(f.founder.user,{}),{status:409});await assert.rejects(f.service.registerWorkspace(f.marketer.user,{}),{status:403});await assert.rejects(f.service.registerWorkspace(f.founder.user,{teamId}),{status:400});
});
test('paired marketer remains separate from immutable operator; native editor observation never enables C2 editing',async t=>{
 const f=await setup(t),session=await f.connect();await f.service.registerWorkspace(f.founder.user,{});const observed=await f.service.inspect(f.marketer.user,session);assert.equal(observed.actingNativeProfileId,human);assert.equal(observed.grantState,'pending-native-policy');assert.equal(observed.editingEnabled,false);assert.equal(f.store.get(f.service.key).operatorProfileId,operator);
 await assert.rejects(f.service.admission(nativeRequest(human,'read',otherTeam)),{status:403});
 assert.deepEqual(await f.service.admission(nativeRequest(human,'write')),{allowed:false,editingEnabled:false,reason:'live-fence-required',grantEpoch:1,workspaceEpoch:1});await assert.rejects(f.service.admission(nativeRequest(human,'create-share-link')),{status:403});await assert.rejects(f.service.admission(nativeRequest(operator,'read')),{status:403});
 await f.pairing.disconnect(f.marketer.user,scope,session,{});await assert.rejects(f.service.admission(nativeRequest(human,'read')),{status:403});
});
test('missing/editor/admin membership, pairing and current Studio revoke are honored without owner fallback',async t=>{
 const f=await setup(t),session=await f.connect();await f.service.registerWorkspace(f.founder.user,{});const owner={id:operator,isOwner:true,isAdmin:true,isActive:true};f.setMembers([owner]);assert.equal((await f.service.inspect(f.marketer.user,session)).grantState,'pending-native-membership');
 f.setMembers([owner,{id:human,isActive:true,isOwner:false,isAdmin:true,canEdit:true}]);await assert.rejects(f.service.inspect(f.marketer.user,session),{status:403});f.setMembers([owner,{id:human,isActive:true,isOwner:false,isAdmin:false,canEdit:true}]);await f.service.inspect(f.marketer.user,session);f.store.update('identity',state=>{state.memberships.find(x=>x.userId===f.marketer.user.id).brandIds=[];return state;});await assert.rejects(f.service.admission(nativeRequest(human,'read')),{status:403});
});
test('session logout during native readback prevents committing actor admission',async t=>{
 const f=await setup(t),session=await f.connect();await f.service.registerWorkspace(f.founder.user,{});const service=new PenpotBrandAccess({store:f.store,identity:f.identity,pairing:f.pairing,scope,workspaceFor:f.workspaceFor,rpc:async(...args)=>{const result=await f.rpc(...args);if(args[1]==='get-team-members')await f.identity.logout(f.marketer.token);return result;}});await assert.rejects(service.inspect(f.marketer.user,session),{status:401});assert.deepEqual(f.store.get(f.service.key).grants,[]);
});
test('administrative account pairing is not admitted as an ordinary human editor',async t=>{
 const f=await setup(t),session=await f.connect(f.founder,operator);await f.service.registerWorkspace(f.founder.user,{});await assert.rejects(f.service.inspect(f.founder.user,session),{status:403});assert.deepEqual(f.store.get(f.service.key).grants,[]);
});
test('fixed official RPC accepts only the two added read commands, never invitation/member mutation',async()=>{
 const calls=[],rpc=createPenpotStoryRpc({sessions:new Map([[operator,{cookie:'auth-token=private'}]]),fetchImpl:async(url,options)=>{calls.push({url,options});return Response.json({id:teamId});}});await rpc({ownerPrincipal:operator},'get-team',{id:teamId});await rpc({ownerPrincipal:operator},'get-team-members',{'team-id':teamId});assert.ok(calls.every(x=>x.url.startsWith('http://localhost:39008/api/rpc/command/get-team')));await assert.rejects(rpc({ownerPrincipal:operator},'create-team-invitations',{}),{status:400});
});

test('C4 guard composes exactly four extra keys, retains admin identity, and aborts revoked final write',async t=>{
 const f=await setup(t),session=await f.connect();await f.service.registerWorkspace(f.founder.user,{});await f.service.inspect(f.marketer.user,session);await assert.rejects(f.service.require(f.marketer.user,scope,session),{status:503});
 // Explicit trusted hosted fixture state, NOT native policy/runtime evidence.
 f.store.update(f.service.key,record=>{record.state='current';record.sharingPolicy='disabled';record.liveFence='current';record.grants[0].state='current';record.grants[0].reconciliation={state:'acknowledged',present:true,pairingEpoch:record.grants[0].pairingEpoch};return record;});
 const admission=await f.service.require(f.marketer.user,scope,session);assert.equal(admission.workspace.ownerPrincipal,operator);assert.equal(admission.grantSnapshot.nativeProfileId,human);const keys=f.service.guardKeys(admission.grantSnapshot);assert.equal(keys.length,4);assert.equal(keys[3],`session:${session}`);
 f.store.update('sentinel',()=>({humanText:'retained'}));f.store.update('identity',identity=>{identity.memberships.find(x=>x.userId===f.marketer.user.id).brandIds=[];return identity;});
 assert.throws(()=>f.store.transact(['sentinel','repo','identity','security',...keys],values=>{f.service.assertCurrent({identity:values[2],brandAccess:values[4],pair:values[5],profileOwner:values[6],session:values[7]},admission.grantSnapshot);values[0].humanText='overwritten';return values;}),{status:403});assert.equal(f.store.get('sentinel').humanText,'retained');
});
test('native UUID reconciliation persists exact intent before side effect and recovers unknown reply with same epoch/key',async t=>{
 const f=await setup(t),session=await f.connect();await f.service.registerWorkspace(f.founder.user,{});await f.service.inspect(f.marketer.user,session);let calls=[],lose=true;
 const service=new PenpotBrandAccess({store:f.store,identity:f.identity,pairing:f.pairing,scope,workspaceFor:f.workspaceFor,rpc:f.rpc,reconcileMembership:async(workspace,payload)=>{calls.push(structuredClone(payload));assert.equal(workspace.ownerPrincipal,operator);assert.equal(f.store.get(f.service.key).grants[0].reconciliation.state,'pending');assert.deepEqual(await service.authorizeReconciliation({nativeOperatorProfileId:operator,nativeTeamId:teamId,nativeMemberId:human,intentId:payload['intent-id'],expectedEpoch:payload['expected-epoch'],grantEpoch:payload['grant-epoch'],present:payload.present}),{authorized:true});if(lose){lose=false;throw Error('Lost native reply');}return {acknowledged:true,teamId,memberId:human,intentId:payload['intent-id'],grantEpoch:payload['grant-epoch'],present:payload.present};}});
 // No grant can activate native membership before policy and C3 acceptance.
 await assert.rejects(service.reconcile(f.founder.user,{actorId:f.marketer.user.id,idempotencyKey:id('7')}),{status:503});assert.equal(calls.length,0);
 f.store.update('identity',identity=>{identity.memberships.find(x=>x.userId===f.marketer.user.id).brandIds=[];return identity;});
 const input={actorId:f.marketer.user.id,idempotencyKey:id('7')};await assert.rejects(service.reconcile(f.founder.user,input),/Lost native reply/);await assert.rejects(service.reconcile(f.founder.user,{...input,idempotencyKey:id('8')}),{status:409});
 const result=await service.reconcile(f.founder.user,input);assert.equal(result.present,false);assert.equal(result.editingEnabled,false);assert.deepEqual(calls[0],calls[1]);assert.equal(calls[0]['member-id'],human);assert.equal(f.store.get(f.service.key).grants[0].state,'revoked');await service.reconcile(f.founder.user,input);assert.equal(calls.length,2);
});

test('verified membership inspection retains native receipt and current session lease',async t=>{
 const f=await setup(t),session=await f.connect();
 await f.service.registerWorkspace(f.founder.user,{});await f.service.inspect(f.marketer.user,session);
 // Controlled policy/receipt fixture only; not a native activation claim.
 f.store.update(f.service.key,record=>{
  record.state='current';record.sharingPolicy='disabled';record.liveFence='current';
  Object.assign(record.grants[0],{nativeEpoch:7,reconciliation:{id:id('7'),state:'acknowledged',present:true,pairingEpoch:record.grants[0].pairingEpoch}});
  return record;
 });
 assert.equal((await f.service.inspect(f.marketer.user,session)).grantState,'current');
 const grant=f.store.get(f.service.key).grants[0];
 assert.equal(grant.nativeEpoch,7);assert.equal(grant.reconciliation.id,id('7'));assert.equal(grant.sessionDigest,session);
 assert.equal((await f.service.admission(nativeRequest(human,'read'))).allowed,true);
 await f.identity.logout(f.marketer.token);
 await assert.rejects(f.service.admission(nativeRequest(human,'read')),{status:401});
});

test('server-side design RPC carries a separate private acting profile without changing its owner cookie',async()=>{
 const requests=[],grantKey='g'.repeat(43),cookie='auth-token=controlled-operator-cookie';
 const rpc=createPenpotStoryRpc({sessions:new Map([[operator,{cookie}]]),grantKey,
  fetchImpl:async(url,options)=>{requests.push({url,options});return new Response('{}',{status:200});}});
 await rpc({ownerPrincipal:operator,actingNativeProfileId:human},'get-file',{id:id('8')});
 assert.equal(requests[0].options.headers.Cookie,cookie);
 assert.equal(requests[0].options.headers['X-Studio-Acting-Profile'],human);
 assert.equal(requests[0].options.headers['X-Studio-Native-Grant-Key'],grantKey);
 assert.deepEqual(JSON.parse(requests[0].options.body),{id:id('8')});
 await rpc({ownerPrincipal:operator},'get-profile',{});
 assert.equal(requests[1].options.headers['X-Studio-Acting-Profile'],undefined);
 assert.equal(requests[1].options.headers['X-Studio-Native-Grant-Key'],grantKey);
});
