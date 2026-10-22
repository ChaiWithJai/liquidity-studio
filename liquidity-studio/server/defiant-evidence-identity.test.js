import test from 'node:test';
import assert from 'node:assert/strict';
import {createDefiantEvidenceService} from './defiant-evidence.js';
import {defiantEvidenceRequest} from './defiant-evidence-http.js';
const organizationId = 'invented_org', sourceHash = 'a'.repeat(64);
const selection = (id, amount, currency = 'USD') => ({id, label:'Invented selection', amount, currency, sourceHash, sourceRecords:[Number(id.slice(1))+1]});
const member = (id, selectionId, sourceSystem = 'invented-distributor') => ({id, sourceSystem, accountScope:'invented-account', sourceId:'001', releaseTitle:'Invented release', upc:null, selectionIds:[selectionId]});
const group = (id, members) => ({id, artist:'Invented artist', title:'Shared title', reviewStatus:'needs-review', rankingBasis:'absolute-net-reported-amount-within-currency', provenance:{upstreamSnapshotRevision:'b'.repeat(64), upstreamArtifactHash:'c'.repeat(64), observedPeriod:'2025-01'}, members});
const fixture = () => ({schemaVersion:1, organizationId, coverage:'Invented identity fixture only', months:[], receipts:[], selections:[selection('s1','100000000000000000000.000000000001'),selection('s2','-100000000000000000000')], identityGroups:[group('g1',[member('m1','s1'),member('m2','s2','other-distributor')])]});
const make = (data, options = {}) => createDefiantEvidenceService({organizationId, authorize:actor=>actor==='allowed', loadSnapshot:async()=>data, ...options});

test('exact signed totals preserve source namespaces and identity observations without merging', async()=>{
 const service=make(fixture());const manifest=await service.read('allowed');
 assert.equal(manifest.counts.identityGroups,1);
 const queue=await service.read('allowed',{resource:'catalog-identity-review',revision:manifest.revision});
 assert.equal(queue.items[0].amount,'0.000000000001');assert.equal(queue.items[0].memberCount,2);assert.equal(queue.items[0].members,undefined);
 const detail=await service.read('allowed',{resource:'identity-group',identityGroupId:'g1',revision:manifest.revision,limit:1});
 assert.equal(detail.members[0].sourceId,'001');assert.equal(detail.members[0].amount,'100000000000000000000.000000000001');assert.equal(detail.nextOffset,1);
 const next=await service.read('allowed',{resource:'identity-group',identityGroupId:'g1',revision:manifest.revision,offset:detail.nextOffset,limit:1});
 assert.equal(next.members[0].sourceSystem,'other-distributor');assert.equal(next.nextOffset,null);
 const evidence=await service.read('allowed',{resource:'selection',selectionId:detail.members[0].selectionIds[0],revision:manifest.revision});
 assert.equal(evidence.revision,detail.revision);assert.deepEqual(evidence.sourceRecords,[2]);assert.equal(detail.capabilities.canActivate,false);
});

test('missing source IDs remain visible, and source IDs on different releases remain separate', async()=>{
 const data=fixture();data.identityGroups[0].members[0].sourceId=null;
 const service=make(data);const {revision}=await service.read('allowed');
 const result=await service.read('allowed',{resource:'identity-group',identityGroupId:'g1',revision});
 assert.equal(result.group.missingSourceIds,1);assert.equal(result.members[0].sourceId,null);assert.equal(result.members[0].identityStatus,'missing-source-id');
 const other=fixture();other.identityGroups[0].members[1].sourceSystem='invented-distributor';other.identityGroups[0].members[1].releaseTitle='Other release';
 const otherService=make(other);const manifest=await otherService.read('allowed');
 assert.equal((await otherService.read('allowed',{resource:'identity-group',identityGroupId:'g1',revision:manifest.revision})).members.length,2);
});

test('duplicate selection memberships, missing refs, mixed currencies and invalid groups fail closed', async()=>{
 for(const mutate of [
  x=>{x.identityGroups[0].members[1].selectionIds=['s1'];},
  x=>{x.identityGroups[0].members[0].selectionIds=['s1','s1'];},
  x=>{x.identityGroups.push(group('g2',[member('other','s1')]));},
  x=>{x.identityGroups[0].members[0].selectionIds=['absent'];},
  x=>{x.selections[1].currency='EUR';},
  x=>{x.selections[1].sourceRecords=[2];},
  x=>{x.identityGroups[0].reviewStatus='approved';},
  x=>{x.identityGroups[0].rankingBasis='opportunity-score';},
  x=>{x.identityGroups[0].provenance.upstreamArtifactHash='bad';},
  x=>{x.identityGroups[0].members[0].sourceId=1;},
  x=>{x.identityGroups[0].members[0].selectionIds=[];},
  x=>{x.identityGroups[0].members=Array(2001).fill(x.identityGroups[0].members[0]);},
  x=>{x.identityGroups=Array(2001).fill(x.identityGroups[0]);},
  x=>{x.identityGroups[0].members[1].sourceSystem='invented-distributor';}
 ]) {const data=fixture();mutate(data);await assert.rejects(make(data).read('allowed'),{status:503});}
});

test('ranking is stable within currency, negative amounts retained and client totals ignored',async()=>{
 const data=fixture();data.selections=[selection('s1','-9'),selection('s2','1'),selection('s3','1000','EUR'),selection('s4','9')];
 data.identityGroups=[group('z',[member('m','s1')]),group('a',[member('m','s2')]),group('e',[member('m','s3')]),group('b',[member('m','s4')])];
 data.identityGroups[0].amount='999';
 const service=make(data);const {revision}=await service.read('allowed');
 const first=await service.read('allowed',{resource:'catalog-identity-review',revision,limit:2});
 const last=await service.read('allowed',{resource:'catalog-identity-review',revision,offset:first.nextOffset,limit:2});
 assert.deepEqual([...first.items,...last.items].map(x=>[x.id,x.amount]),[['e','1000'],['b','9'],['z','-9'],['a','1']]);assert.equal(last.nextOffset,null);
 data.identityGroups[0].members[0].releaseTitle='Changed observation';
 await assert.rejects(service.read('allowed',{resource:'identity-group',identityGroupId:'z',revision}),{status:409});
});

test('identity reads preserve access checks and finite request validation',async()=>{
 let loads=0;const data=fixture();const service=make(data,{loadSnapshot:async()=>{loads++;return data;}});
 await assert.rejects(service.read('denied',{resource:'catalog-identity-review'}),{status:403});assert.equal(loads,0);
 for(const request of [{resource:'identity-group',identityGroupId:'g1'},{resource:'catalog-identity-review',identityGroupId:'g1'},{resource:'identity-group',identityGroupId:'g1',revision:'b'.repeat(64),offset:2001}])await assert.rejects(service.read('allowed',request),{status:400});
 assert.equal(loads,0);
 let allowed=true;const revoked=make(data,{authorize:()=>allowed,loadSnapshot:async()=>{allowed=false;return data;}});
 await assert.rejects(revoked.read('allowed',{resource:'catalog-identity-review'}),{status:403});
});

test('HTTP identity resources share finite parsing, revision binding and receipt references',async()=>{
 const service=make(fixture());const {revision}=await service.read('allowed');
 const read=async suffix=>{const url=new URL('https://fixture.invalid/api/studio/defiant-evidence/'+organizationId+'/'+suffix);return defiantEvidenceRequest({service,user:'allowed',method:'GET',route:url.pathname,url});};
 const queue=await read('catalog-identity-review?limit=1');assert.equal(queue.items[0].id,'g1');
 const detail=await read('identity-group?identityGroupId=g1&revision='+revision+'&limit=1');assert.deepEqual(detail.members[0].selectionIds,['s1']);
 await assert.rejects(read('identity-group?identityGroupId=g1'),{status:400});
 await assert.rejects(read('identity-group?identityGroupId=g1&identityGroupId=g2&revision='+revision),{status:400});
});
