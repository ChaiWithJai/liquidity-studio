import test from 'node:test';
import assert from 'node:assert/strict';
import {createDefiantEvidenceService} from './defiant-evidence.js';
import {defiantEvidenceRequest} from './defiant-evidence-http.js';
import {Client,StreamableHTTPClientTransport} from '@modelcontextprotocol/client';
import {createDefiantEvidenceMcpHandler} from './defiant-evidence-mcp.js';
import {createHash} from 'node:crypto';
import {normalizeSelectionMetadataBreakdowns,selectionMetadataBreakdownView} from './defiant-selection-metadata-breakdown.js';
const sha=v=>createHash('sha256').update(JSON.stringify(v)).digest('hex');
function fixture(){
 const records=[2,8,11],sourceHash='a'.repeat(64);
 const selection={id:'fictional',sourceHash,currency:'USD',amount:'1',sourceRecords:records};
 const proof={selectionId:'fictional',sourceHash,currency:'USD',month:'2025-03',predicates:{sourceSongId:'INVENTED',store:'YouTube'},positiveAmount:'3',negativeAmount:'-2',zeroRows:1};
 const bucket={videoIdPresent:false,policyPresent:false,policy:'',salesType:'Streaming',currency:'USD',recordSetSha256:sha(records),rows:3,amount:'1',positiveAmount:'3',negativeAmount:'-2',zeroRows:1,unitsSum:'0',unitsNumericRows:2,unitsMissingRows:1,unitsInvalidRows:0,unitsNegativeRows:1,unitsZeroRows:0,unitsNonintegerRows:0,samples:[{offset:0,record:2},{offset:2,record:11}]};
 const product={schemaVersion:1,method:'youtube-video-policy-presence-v1',selectionId:'fictional',sourceHash,currency:'USD',month:'2025-03',sourceSongId:'INVENTED',store:'YouTube',parentRecordSetSha256:sha(records),parentRecordCount:3,declaredAmount:'1',buckets:[bucket],provenance:{selectedReceiptsSha256:'b'.repeat(64),crossTabSha256:'c'.repeat(64),producerResultSha256:'d'.repeat(64),independentReviewSha256:'e'.repeat(64)}};
 return {selection,proof,product};
}
const normalize=f=>normalizeSelectionMetadataBreakdowns([f.product],[f.selection],[f.proof]);
test('absence omitted; mixed signed units and exact original-offset followups retained',()=>{
 assert.equal(normalizeSelectionMetadataBreakdowns(undefined,[],[]),undefined);
 const f=fixture(),products=normalize(f);const view=selectionMetadataBreakdownView({selectionMetadataBreakdowns:products,revision:'f'.repeat(64)},'fictional');
 assert.equal(view.product.buckets[0].unitsSum,'0');assert.equal(view.buckets,undefined);
 assert.deepEqual(view.product.buckets[0].followUps[1],{resource:'selection-receipts',selectionId:'fictional',revision:'f'.repeat(64),offset:2,limit:1});
 assert.deepEqual(selectionMetadataBreakdownView({},'fictional'),{available:false,reason:'not-prepared'});
});
test('rejects source, month, record-set, arithmetic, classification and sample corruption',()=>{
 const edits=[f=>f.product.sourceHash='f'.repeat(64),f=>f.product.month='2025-04',f=>f.product.parentRecordSetSha256='f'.repeat(64),f=>f.product.buckets[0].amount='2',f=>f.product.buckets[0].policyPresent=true,f=>f.product.buckets[0].samples[0].record=8,f=>f.product.buckets[0].samples.reverse(),f=>f.product.buckets[0].extra=true,f=>f.product.provenance.producerResultSha256+='\n',f=>f.product.buckets[0].unitsMissingRows=2];
 for(const edit of edits){const f=fixture();edit(f);assert.throws(()=>normalize(f),e=>e.status===503);}
});
test('definite unit sign and zero implications fail closed, mixed cancellation remains valid',()=>{
 for(const values of [{unitsSum:'0.5',unitsNonintegerRows:0},{unitsNumericRows:2,unitsNegativeRows:0,unitsZeroRows:2,unitsSum:'1'},{unitsNumericRows:2,unitsNegativeRows:0,unitsZeroRows:0,unitsSum:'-1'},{unitsNumericRows:2,unitsNegativeRows:2,unitsZeroRows:0,unitsSum:'1'},{unitsNumericRows:2,unitsNegativeRows:0,unitsZeroRows:2,unitsNonintegerRows:1,unitsSum:'0'}]){
  const f=fixture();Object.assign(f.product.buckets[0],values);assert.throws(()=>normalize(f),e=>e.status===503);
 }
 assert.equal(normalize(fixture()).length,1);
});
test('bounded components do not truncate or silently drop invalid products',()=>{
 const f=fixture();assert.throws(()=>normalizeSelectionMetadataBreakdowns(Array(101).fill(f.product),[f.selection],[f.proof]),e=>e.status===503);
 f.product.buckets[0].salesType='x'.repeat(501);assert.throws(()=>normalize(f),e=>e.status===503);
 const g=fixture();g.product.buckets=Array(33).fill(g.product.buckets[0]);assert.throws(()=>normalize(g),e=>e.status===503);
 const h=fixture();h.product.buckets[0].rows=1;assert.throws(()=>normalize(h),e=>e.status===503);
});

test('integer single-sign unit sums cannot be smaller than nonzero row count',()=>{
 for(const [negative,sum] of [[0,'1'],[2,'-1']]){const f=fixture();Object.assign(f.product.buckets[0],{unitsNegativeRows:negative,unitsSum:sum});assert.throws(()=>normalize(f),{status:503});}
});
function snapshot(include=true){
 const f=fixture();f.selection.label='Fictional cohort';
 const proof={schemaVersion:1,method:'selected-derived-cells-signed-decimal-v1',...f.proof,metric:'source-total-earned',selectedRecordCount:3,selectionRecordSetSha256:sha(f.selection.sourceRecords),declaredAmount:'1',recomputedAmount:'1',provenance:{crossTabSha256:'b'.repeat(64),selectedReceiptsSha256:'c'.repeat(64),producerReceiptSha256:'d'.repeat(64),independentReviewSha256:'e'.repeat(64)}};
 return {schemaVersion:1,organizationId:'fixture_org',coverage:'Invented only',months:[],receipts:[],selections:[f.selection],selectionReconciliations:[proof],...(include?{selectionMetadataBreakdowns:[f.product]}:{})};
}
test('exact absent legacy revision, present revision drift and malformed503 through service',async()=>{
 const raw=snapshot(false),service=data=>createDefiantEvidenceService({organizationId:'fixture_org',authorize:()=>true,loadSnapshot:async()=>data});
 const old=await service(raw).read('actor');
 const s=raw.selections[0];const expected={selectionReconciliations:raw.selectionReconciliations,schemaVersion:1,organizationId:raw.organizationId,coverage:raw.coverage,months:[],receipts:[],selections:[{id:s.id,label:s.label,sourceHash:s.sourceHash,amount:s.amount,currency:s.currency,sourceRecords:s.sourceRecords}]};
 assert.equal(old.revision,sha(expected));assert.equal((await service({...raw,selectionMetadataBreakdowns:undefined}).read('actor')).revision,old.revision);
 const current=service(snapshot());assert.notEqual((await current.read('actor')).revision,old.revision);
 await assert.rejects(current.read('actor',{resource:'selection-reconciliation',selectionId:'fictional',revision:old.revision}),{status:409});
 const bad=snapshot();bad.selectionMetadataBreakdowns[0].month='2024-01';await assert.rejects(service(bad).read('actor'),{status:503});
});
test('actual SDK reconciliation→HTTP original sample uses current revision and current authority',async t=>{
 let allowed=true,revokeOnLoad=false,loads=0;const raw=snapshot(),service=createDefiantEvidenceService({organizationId:'fixture_org',authorize:()=>allowed,loadSnapshot:async()=>{loads++;if(revokeOnLoad)allowed=false;return raw;},loadSourceRecords:async({sourceHash,sourceRecords})=>sourceRecords.map(record=>({id:'row_'+record,sourceHash,record,member:'invented.csv',cells:{'Video ID':'invented','Units':'1'}}))});
 const handler=createDefiantEvidenceMcpHandler({resolveEvidence:async({organizationId})=>{if(organizationId!=='fixture_org')throw Object.assign(Error('Denied'),{status:403});return {organizationId,actor:'actor',service};}}),client=new Client({name:'breakdown-fixture',version:'1'},{versionNegotiation:{mode:'auto'}});
 t.after(async()=>{await client.close();await handler.close();});await client.connect(new StreamableHTTPClientTransport(new URL('https://fixture.invalid/mcp'),{fetch:(url,init)=>handler.fetch(new Request(url,init))}));
 assert.equal((await client.listTools()).tools.length,23);
 const manifest=await service.read('actor'),args={organizationId:'fixture_org',selectionId:'fictional',revision:manifest.revision};
 const result=await client.callTool({name:'defiant_selection_reconciliation',arguments:args});assert.notEqual(result.isError,true);const breakdown=result.structuredContent.metadataBreakdown;assert.equal(breakdown.available,true);assert.ok(Buffer.byteLength(JSON.stringify(breakdown))<128*1024);
 const detail=await service.read('actor',{resource:'selection',selectionId:'fictional',revision:manifest.revision});assert.equal(detail.metadataBreakdown.followUp.resource,'selection-reconciliation');
 const follow=breakdown.product.buckets[0].followUps[1],url=new URL('https://fixture.invalid/api/studio/defiant-evidence/fixture_org/'+follow.resource);for(const [k,v] of Object.entries(follow))if(k!=='resource')url.searchParams.set(k,String(v));
 const cells=await defiantEvidenceRequest({service,user:'actor',route:url.pathname,method:'GET',url});assert.equal(cells.receipts.length,1);assert.equal(cells.receipts[0].record,11);assert.deepEqual(cells.receipts[0].cells,{'Video ID':'invented','Units':'1'});
 assert.equal((await client.callTool({name:'defiant_selection_reconciliation',arguments:{...args,organizationId:'other'}})).isError,true);
 revokeOnLoad=true;assert.equal((await client.callTool({name:'defiant_selection_reconciliation',arguments:args})).isError,true);const before=loads;await assert.rejects(defiantEvidenceRequest({service,user:'actor',route:url.pathname,method:'GET',url}),{status:403});assert.equal(loads,before);
});
test('encoded size ceilings reject without truncating Unicode source metadata',()=>{
 const f=fixture();f.product.buckets=Array.from({length:32},(_,i)=>({...f.product.buckets[0],policyPresent:true,policy:'漢'.repeat(500),salesType:String(i)+'漢'.repeat(490)}));
 assert.ok(Buffer.byteLength(JSON.stringify(f.product))>65536);assert.throws(()=>normalize(f),{status:503});
 const rows=Array.from({length:100},(_,i)=>({...f.product,selectionId:'s'+i}));assert.ok(Buffer.byteLength(JSON.stringify(rows))>2*1024*1024);assert.throws(()=>normalizeSelectionMetadataBreakdowns(rows,[],[]),{status:503});
});
