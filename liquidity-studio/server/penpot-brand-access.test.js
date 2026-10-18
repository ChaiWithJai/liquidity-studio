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
 assert.deepEqual(await f.service.admission(human,'write'),{allowed:false,editingEnabled:false,reason:'live-fence-required',grantEpoch:1,workspaceEpoch:1});await assert.rejects(f.service.admission(human,'create-share-link'),{status:403});await assert.rejects(f.service.admission(operator,'read'),{status:403});
 await f.pairing.disconnect(f.marketer.user,scope,session,{});await assert.rejects(f.service.admission(human,'read'),{status:403});
});
test('missing/editor/admin membership, pairing and current Studio revoke are honored without owner fallback',async t=>{
 const f=await setup(t),session=await f.connect();await f.service.registerWorkspace(f.founder.user,{});const owner={id:operator,isOwner:true,isAdmin:true,isActive:true};f.setMembers([owner]);assert.equal((await f.service.inspect(f.marketer.user,session)).grantState,'pending-native-membership');
 f.setMembers([owner,{id:human,isActive:true,isOwner:false,isAdmin:true,canEdit:true}]);await assert.rejects(f.service.inspect(f.marketer.user,session),{status:403});f.setMembers([owner,{id:human,isActive:true,isOwner:false,isAdmin:false,canEdit:true}]);await f.service.inspect(f.marketer.user,session);f.store.update('identity',state=>{state.memberships.find(x=>x.userId===f.marketer.user.id).brandIds=[];return state;});await assert.rejects(f.service.admission(human,'read'),{status:403});
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
