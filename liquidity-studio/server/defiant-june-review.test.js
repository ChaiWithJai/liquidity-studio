import test from 'node:test';
import assert from 'node:assert/strict';
import {createDefiantEvidenceService} from './defiant-evidence.js';
import {defiantEvidenceRequest} from './defiant-evidence-http.js';
const sourceHash='a'.repeat(64);
const fixture=()=>({schemaVersion:1,organizationId:'sample_org',coverage:'Invented June fixture',months:[{month:'2025-06',currency:'USD',amount:'-2.000001',metric:'source-total-earned',sourceHash,receiptIds:[]}],receipts:[],selections:[{id:'s1',label:'Invented selection',sourceHash,currency:'USD',amount:'-0.000001',sourceRecords:[2,5,8]}]});
const make=(extra={})=>createDefiantEvidenceService({organizationId:'sample_org',authorize:a=>a==='owner',loadSnapshot:async()=>fixture(),...extra});
test('June packet binds exact source period and preserves signed precision and paged lineage',async()=>{
 const service=make();const {revision}=await service.read('owner');
 const packet=await service.read('owner',{resource:'june-review',selectionId:'s1',revision,offset:1,limit:1});
 assert.equal(packet.readiness,'qualified');assert.equal(packet.facts.selection.amount,'-0.000001');assert.equal(packet.facts.period.amount,'-2.000001');
 assert.deepEqual(packet.lineage.sourceRecords,[5]);assert.equal(packet.lineage.total,3);assert.equal(packet.lineage.nextOffset,2);
 assert.deepEqual(packet.followUp,{resource:'selection-receipts',selectionId:'s1',revision,offset:1,limit:1,available:false});
 assert.equal(packet.commercialReadiness.readiness,'not-ready');assert.equal(packet.capabilities.canActivate,false);
 assert.match(packet.limitation,/not model inference/);
 const tail=await service.read('owner',{resource:'june-review',selectionId:'s1',revision,offset:2,limit:1});assert.deepEqual(tail.lineage.sourceRecords,[8]);assert.equal(tail.lineage.nextOffset,null);
});
test('June rejects absent, ambiguous, non-June or currency-mismatched period regardless of label',async()=>{
 for(const change of [d=>d.months=[],d=>d.months[0].month='2025-05',d=>d.months[0].currency='EUR',d=>d.months.push({...d.months[0],month:'2025-05'})]){
  const service=make({loadSnapshot:async()=>{const d=fixture();d.selections[0].label='June 2025';change(d);return d;}});const {revision}=await service.read('owner');
  await assert.rejects(service.read('owner',{resource:'june-review',selectionId:'s1',revision}),{status:409});
 }
});
test('June request denies missing revision, conflicting filters, stale snapshot and revoked authority',async()=>{
 const service=make();const {revision}=await service.read('owner');
 for(const [request,status] of [[{selectionId:'s1'},400],[{selectionId:'missing',revision},404],[{selectionId:'s1',revision:'b'.repeat(64)},409],[{selectionId:'s1',revision,month:'2025-06'},400],[{selectionId:'s1',revision,audienceId:'a'},400]])await assert.rejects(service.read('owner',{resource:'june-review',...request}),{status});
 let loads=0;await assert.rejects(make({loadSnapshot:async()=>{loads++;return fixture();}}).read('other',{resource:'june-review',selectionId:'s1',revision}),{status:403});assert.equal(loads,0);
 let current=true;const revoked=make({authorize:()=>current,loadSnapshot:async()=>{current=false;return fixture();}});await assert.rejects(revoked.read('owner',{resource:'june-review',selectionId:'s1',revision}),{status:403});
});
test('finite HTTP June route returns same packet and pins follow-up revision',async()=>{
 const service=make();const {revision}=await service.read('owner');
 const url=new URL(`https://fixture.invalid/api/studio/defiant-evidence/sample_org/june-review?selectionId=s1&revision=${revision}&limit=1`);
 const result=await defiantEvidenceRequest({service,user:'owner',route:url.pathname,method:'GET',url});assert.equal(result.followUp.revision,revision);assert.deepEqual(result.lineage.sourceRecords,[2]);
 url.searchParams.set('path','private');await assert.rejects(defiantEvidenceRequest({service,user:'owner',route:url.pathname,method:'GET',url}),{status:400});
});
