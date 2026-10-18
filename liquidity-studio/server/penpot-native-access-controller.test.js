// Hosted controller contracts, not native admission or live-fence acceptance.
import test from 'node:test';
import assert from 'node:assert/strict';
import {randomUUID} from 'node:crypto';
import {createNativeAccessController} from './penpot-native-access-controller.js';

function fixture() {
  const nativeInstanceId=randomUUID(), nativeTeamId=randomUUID(), grantKey='G'.repeat(43);
  const scope={organizationId:'owned-org',brandId:'owned-brand'}, calls=[];
  const service={scope,pairing:{nativeInstanceId},
    admission:async input=>{calls.push(['admission',input]);return {allowed:false};},
    authorizeReconciliation:async input=>{calls.push(['reconciliation',input]);return {authorized:true};}};
  const controller=createNativeAccessController({nativeInstanceId,grantKey,
    store:{get:async key=>{assert.equal(key,`penpot-brand-teams:${nativeInstanceId}`);return {teams:[{teamId:nativeTeamId,scope}]};}},
    accessFor:async resolved=>{assert.deepEqual(resolved,scope);return service;}});
  const nativeProfileId=randomUUID();
  const admission={nativeTeamId,nativeProfileId,operation:'read',nativeSession:{id:randomUUID(),profileId:nativeProfileId}};
  return {controller,service,grantKey,calls,admission};
}

test('private callback resolves team scope and forwards exact authenticated native context',async()=>{
  const f=fixture();
  assert.deepEqual(await f.controller.admission(f.grantKey,f.admission),{allowed:false});
  assert.deepEqual(f.calls,[['admission',f.admission]]);
  const reconciliation={nativeTeamId:f.admission.nativeTeamId,nativeOperatorProfileId:randomUUID(),
    nativeMemberId:f.admission.nativeProfileId,intentId:randomUUID(),expectedEpoch:2,grantEpoch:3,present:true};
  assert.deepEqual(await f.controller.reconciliation(f.grantKey,reconciliation),{authorized:true});
  assert.deepEqual(f.calls[1],['reconciliation',reconciliation]);
});

test('scope claims, unknown teams, wrong instances and legacy cookie session IDs never reach admission',async()=>{
  const f=fixture();
  for(const key of ['wrong','é'.repeat(43),'X'.repeat(43)])
    await assert.rejects(f.controller.admission(key,f.admission),error=>error.status===403);
  for(const input of [{...f.admission,organizationId:'foreign'},
    {...f.admission,nativeTeamId:randomUUID()},
    {...f.admission,nativeSession:{...f.admission.nativeSession,id:'legacy-cookie-token'}},
    {...f.admission,nativeSession:{...f.admission.nativeSession,profileId:randomUUID()}}])
    await assert.rejects(f.controller.admission(f.grantKey,input),error=>[400,403].includes(error.status));
  f.service.pairing.nativeInstanceId=randomUUID();
  await assert.rejects(f.controller.admission(f.grantKey,f.admission),error=>error.status===503);
  assert.equal(f.calls.length,0);
});
