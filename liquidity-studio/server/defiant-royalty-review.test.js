import test from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {createDefiantEvidenceService} from './defiant-evidence.js';
import {defiantEvidenceRequest} from './defiant-evidence-http.js';
import {Client,StreamableHTTPClientTransport} from '@modelcontextprotocol/client';
import {createDefiantEvidenceMcpHandler} from './defiant-evidence-mcp.js';
const a='a'.repeat(64),b='b'.repeat(64);
const fixture=()=>({schemaVersion:1,organizationId:'org',coverage:'Invented royalty review contract',receipts:[],
 months:[{month:'2024-02',currency:'USD',amount:'10',metric:'source-total-earned',sourceHash:a,receiptIds:[]},{month:'2025-02',currency:'USD',amount:'8',metric:'source-total-earned',sourceHash:b,receiptIds:[]}],
 selections:[{id:'song',label:'Invented source-local song',currency:'USD',amount:'3',sourceHash:b,sourceRecords:[2,4,8]}],
 comparisons:[{id:'annual',dimension:'store',sourceSystem:'invented',accountScope:'account',currency:'USD',periodBasis:'filename-declared',beforeMonths:['2024-02'],afterMonths:['2025-02'],sourceReferences:[{month:'2024-02',sourceHash:a},{month:'2025-02',sourceHash:b}],groups:[
  {id:'down',key:'store-one',label:'Invented store',beforeAmount:'12',afterAmount:'7',sourceReferences:[{side:'before',month:'2024-02',sourceHash:a,exampleRecords:[2,4]}]},
  {id:'up',key:null,label:'Unresolved',beforeAmount:'-2',afterAmount:'1',sourceReferences:[]}]}],
 storePeriodCoverage:[{schemaVersion:1,id:'coverage_one',comparisonId:'annual',storeKey:'store-one',observations:[{month:'2024-02',sourceHash:a,rowCount:2,amount:'12',postingWindow:null},{month:'2025-02',sourceHash:b,rowCount:1,amount:'7',postingWindow:null}]}]
});
const service=(data=fixture(),overrides={})=>createDefiantEvidenceService({organizationId:'org',authorize:actor=>actor==='allowed',loadSnapshot:async()=>data,...overrides});
const request=(revision,fields={})=>({resource:'royalty-review',selectionId:'song',revision,...fields});
test('non-June review preserves source-local facts, optional absence, exact pagination and original cells without eager loading',async()=>{
 let cells=0;const svc=service(fixture(),{loadSourceRecords:async({sourceHash,sourceRecords})=>{cells++;return sourceRecords.map(record=>({id:'r_'+record,sourceHash,member:'invented.csv',record,cells:{Amount:'1'}}));}});
 const {revision}=await svc.read('allowed');const packet=await svc.read('allowed',request(revision,{limit:2}));
 assert.equal(packet.facts.selection.amount,'3');assert.equal(packet.facts.period.amount,'8');assert.equal(packet.facts.period.month,'2025-02');assert.equal(packet.facts.period.metric,'source-total-earned');assert.equal(packet.facts.period.sourceHash,b);
 assert.equal(packet.reconciliation.available,false);assert.equal(packet.metadataBreakdown.available,false);assert.equal(packet.settlementMaturityComparability,'not-established');assert.match(packet.knownLimits.issue,/374$/);assert.deepEqual(packet.lineage.sourceRecords,[2,4]);assert.equal(packet.lineage.nextOffset,2);assert.equal(cells,0);
 const {available,...followUp}=packet.followUp;assert.equal(available,true);const read=await svc.read('allowed',followUp);assert.deepEqual(read.receipts.map(r=>r.record),[2,4]);assert.equal(read.receipts[0].sourceHash,b);assert.equal(cells,1);
 const last=await svc.read('allowed',request(revision,{offset:2,limit:2}));assert.deepEqual(last.lineage.sourceRecords,[8]);assert.equal(last.lineage.nextOffset,null);assert.equal(cells,1);
});
test('available reconciliation reuses the exact checked proof view; malformed producer provenance is rejected',async()=>{
 const data=fixture();data.selectionReconciliations=[{schemaVersion:1,selectionId:'song',sourceHash:b,selectionRecordSetSha256:createHash('sha256').update(JSON.stringify([2,4,8])).digest('hex'),selectedRecordCount:3,currency:'USD',month:'2025-02',method:'selected-derived-cells-signed-decimal-v1',metric:'source-total-earned',predicates:{sourceSongId:'invented-001',store:'Invented store'},declaredAmount:'3',recomputedAmount:'3',positiveAmount:'3',negativeAmount:'0',zeroRows:0,provenance:{crossTabSha256:a,selectedReceiptsSha256:a,producerReceiptSha256:a,independentReviewSha256:a}}];
 data.selectionReconciliations[0].predicates.store='YouTube';
 data.selectionMetadataBreakdowns=[{schemaVersion:1,method:'youtube-video-policy-presence-v1',selectionId:'song',sourceHash:b,currency:'USD',month:'2025-02',sourceSongId:'invented-001',store:'YouTube',parentRecordSetSha256:data.selectionReconciliations[0].selectionRecordSetSha256,parentRecordCount:3,declaredAmount:'3',provenance:{selectedReceiptsSha256:a,crossTabSha256:a,producerResultSha256:a,independentReviewSha256:a},buckets:[{videoIdPresent:false,policyPresent:false,policy:'',salesType:'Streaming',currency:'USD',recordSetSha256:a,rows:3,amount:'3',positiveAmount:'3',negativeAmount:'0',zeroRows:0,unitsSum:'6',unitsNumericRows:3,unitsMissingRows:0,unitsInvalidRows:0,unitsNegativeRows:0,unitsZeroRows:0,unitsNonintegerRows:0,samples:[{offset:1,record:4}]}]}];
 const svc=service(data),{revision}=await svc.read('allowed');const packet=await svc.read('allowed',request(revision));const original=await svc.read('allowed',{resource:'selection-reconciliation',selectionId:'song',revision});
 assert.equal(packet.reconciliation.available,true);assert.deepEqual(packet.reconciliation.proof,original.proof);assert.equal(packet.metadataBreakdown.available,true);assert.deepEqual(packet.metadataBreakdown,original.metadataBreakdown);assert.equal(packet.metadataBreakdown.product.buckets[0].unitsSum,'6');assert.deepEqual(packet.metadataBreakdown.product.buckets[0].followUps,[{resource:'selection-receipts',selectionId:'song',revision,offset:1,limit:1}]);assert.deepEqual(packet.reconciliation.runtimeBinding,original.runtimeBinding);assert.match(packet.reconciliation.limitation,/not source cells/);
 data.selectionReconciliations[0].provenance.independentReviewSha256='invalid';await assert.rejects(service(data).read('allowed'),{status:503});
});
test('comparison review separates whole dimension, selected group and existing all/common amounts, and preserves example scope',async()=>{
 let cells=0;const svc=service(fixture(),{loadSourceRecords:async({sourceHash,sourceRecords})=>{cells++;return sourceRecords.map(record=>({id:'r_'+record,sourceHash,member:'invented.csv',record,cells:{Amount:'6'}}));}});const {revision}=await svc.read('allowed');
 const req={resource:'royalty-review',comparisonId:'annual',storeCoverageId:'coverage_one',revision,limit:1};
 const packet=await svc.read('allowed',req);const existing=await svc.read('allowed',{resource:'explain-change',comparisonId:'annual',revision,limit:1});const coverage=await svc.read('allowed',{resource:'store-coverage',storeCoverageId:'coverage_one',revision});
 assert.deepEqual(packet.comparison.summary,existing.comparison.summary);assert.equal(packet.comparison.summary.beforeAmount,'10');assert.equal(packet.selectedStore.group.beforeAmount,'12');assert.equal(packet.selectedStore.group.id,'down');assert.deepEqual(packet.selectedStore.coverage.allPeriod,coverage.product.allPeriod);assert.deepEqual(packet.selectedStore.coverage.mutuallyObserved,coverage.product.mutuallyObserved);assert.equal(packet.selectedStore.coverage.settlementMaturityComparability,'not-established');assert.equal(packet.selectedStore.coverage.settlementMaturityComparable,undefined);assert.equal(packet.contributions.nextOffset,1);assert.equal(cells,0);
 const link=packet.selectedStore.group.originalReceiptFollowUps[0];const read=await svc.read('allowed',{resource:link.resource,comparisonId:link.comparisonId,groupId:link.groupId,referenceIndex:link.referenceIndex,revision:link.revision});assert.deepEqual(read.receipts.map(r=>r.record),[2,4]);assert.equal(read.fullSelectionAvailable,false);assert.equal(cells,1);
 const last=await svc.read('allowed',{...req,offset:1});assert.equal(last.contributions.items[0].id,'up');assert.deepEqual(last.contributions.items[0].originalReceiptFollowUps,[]);assert.equal(last.selectedStore.group.id,'down');
 const unselected=await svc.read('allowed',{resource:'royalty-review',comparisonId:'annual',revision});assert.equal(unselected.selectedStore,null);assert.equal(unselected.availableStoreCoverage[0].followUp.storeCoverageId,'coverage_one');
 await assert.rejects(svc.read('allowed',{...req,storeCoverageId:'wrong'}),{status:409});
});
test('strict selectors and paging reject before load, current authority after load, stale and ambiguous periods fail closed',async()=>{
 let loads=0;const data=fixture();const svc=service(data,{loadSnapshot:async()=>{loads++;return data;}});const {revision}=await svc.read('allowed');const before=loads;
 for(const fields of [{selectionId:undefined},{comparisonId:'annual'},{storeCoverageId:'coverage_one'},{month:'2025-02'},{offset:500001},{limit:101},{revision:undefined},{selectionId:'song\n'}])await assert.rejects(svc.read('allowed',request(revision,fields)),{status:400});
 await assert.rejects(svc.read('allowed',{resource:'royalty-review',comparisonId:'annual',revision,offset:10001}),{status:400});assert.equal(loads,before);
 await assert.rejects(svc.read('other',request(revision)),{status:403});assert.equal(loads,before);await assert.rejects(svc.read('allowed',request(a)),{status:409});
 let allowed=true;const revoked=service(data,{authorize:()=>allowed,loadSnapshot:async()=>{allowed=false;return data;}});await assert.rejects(revoked.read('allowed',request(revision)),{status:403});
 data.months.push({...data.months[1],month:'2025-03'});const ambiguous=service(data),m=await ambiguous.read('allowed');await assert.rejects(ambiguous.read('allowed',request(m.revision)),{status:409});
 const wrong=fixture();wrong.organizationId='other';await assert.rejects(service(wrong).read('allowed'),{status:503});
});
test('HTTP adapter and actual SDK expose identical bounded review and deny incompatible requests',async t=>{
 let cells=0;const svc=service(fixture(),{loadSourceRecords:async()=>{cells++;throw Error('not eagerly read');}});const {revision}=await svc.read('allowed');
 const route='/api/studio/defiant-evidence/org/royalty-review';const url=new URL('https://fixture.invalid'+route+'?comparisonId=annual&storeCoverageId=coverage_one&limit=1&revision='+revision);
 const http=await defiantEvidenceRequest({service:svc,user:'allowed',route,method:'GET',url});
 const handler=createDefiantEvidenceMcpHandler({resolveEvidence:async({organizationId,requestContext})=>{if(organizationId!=='org'||requestContext.authInfo?.clientId!=='fixture-client')throw Object.assign(Error('Denied'),{status:403});return {organizationId,actor:'allowed',service:svc};}});
 const client=new Client({name:'royalty-contract',version:'1.0.0'},{versionNegotiation:{mode:'auto'}});t.after(async()=>{await client.close();await handler.close();});
 await client.connect(new StreamableHTTPClientTransport(new URL('https://fixture.invalid/mcp'),{fetch:(url,init)=>handler.fetch(new Request(url,init),{authInfo:{token:'invented',clientId:'fixture-client',scopes:['evidence:read']}})}));
 const tool=(await client.listTools()).tools.find(t=>t.name==='defiant_royalty_evidence_review');assert.equal(tool.inputSchema.type,'object');assert.equal(tool.annotations.readOnlyHint,true);
 const call=args=>client.callTool({name:tool.name,arguments:{organizationId:'org',...args}});
 const result=await call({comparisonId:'annual',storeCoverageId:'coverage_one',limit:1,revision});assert.deepEqual(result.structuredContent,http);assert.equal(cells,0);
 for(const args of [{selectionId:'song',comparisonId:'annual',revision},{selectionId:'song',revision:a},{selectionId:'song',revision,organizationId:'other'}])assert.equal((await call(args)).isError,true);
 await assert.rejects(defiantEvidenceRequest({service:svc,user:'allowed',route,method:'POST',url}),{status:405});
});

test('empty example links are unavailable and full response cap rejects a valid oversized composition without reading cells',async()=>{
 const empty=fixture();empty.comparisons[0].groups[0].sourceReferences[0].exampleRecords=[];const svc=service(empty,{loadSourceRecords:async()=>{throw Error('no cells');}}),m=await svc.read('allowed');const review=await svc.read('allowed',{resource:'royalty-review',comparisonId:'annual',revision:m.revision});assert.equal(review.contributions.items[0].originalReceiptFollowUps[0].available,false);
 const data=fixture();delete data.storePeriodCoverage;data.selections=[];
 const before=Array.from({length:24},(_,i)=>`${2021+Math.floor(i/12)}-${String(i%12+1).padStart(2,'0')}`),after=Array.from({length:24},(_,i)=>`${2023+Math.floor(i/12)}-${String(i%12+1).padStart(2,'0')}`);
 data.months=[...before,...after].map(month=>({month,currency:'USD',amount:'0',metric:'source-total-earned',sourceHash:a,receiptIds:[]}));
 data.comparisons[0].beforeMonths=before;data.comparisons[0].afterMonths=after;data.comparisons[0].sourceReferences=data.months.map(({month,sourceHash})=>({month,sourceHash}));
 data.comparisons[0].groups=Array.from({length:100},(_,i)=>({id:'group_'+i,key:'key_'+i,label:'Invented bounded group',beforeAmount:'0',afterAmount:'0',sourceReferences:[...before.map(month=>({side:'before',month,sourceHash:a,exampleRecords:[2]})),...after.map(month=>({side:'after',month,sourceHash:a,exampleRecords:[2]}))]}));
 let reads=0;const bounded=service(data,{loadSourceRecords:async()=>{reads++;throw Error('not called');}}),manifest=await bounded.read('allowed');
 // Normalization is valid; a small page works, but a full 100-group composition exceeds 256 KiB.
 assert.equal((await bounded.read('allowed',{resource:'royalty-review',comparisonId:'annual',revision:manifest.revision,limit:1})).contributions.total,100);
 await assert.rejects(bounded.read('allowed',{resource:'royalty-review',comparisonId:'annual',revision:manifest.revision,limit:100}),{status:503,message:'Royalty review response exceeds bounds'});assert.equal(reads,0);
});
