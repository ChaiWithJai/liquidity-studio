import test from 'node:test';
import assert from 'node:assert/strict';
import {normalizeStorePeriodCoverage} from './defiant-store-period-coverage.js';
import {createDefiantEvidenceService} from './defiant-evidence.js';
import {defiantEvidenceRequest} from './defiant-evidence-http.js';
import {createDefiantEvidenceMcpHandler} from './defiant-evidence-mcp.js';
import {Client,StreamableHTTPClientTransport} from '@modelcontextprotocol/client';
const periods=['2024-01','2024-06','2025-01','2025-06'];
const hashes=periods.map((_,i)=>String(i+1).repeat(64));
function snapshot(){return {schemaVersion:1,organizationId:'org',coverage:'Invented store coverage fixture',receipts:[],selections:[{id:'june',label:'Invented June',sourceHash:hashes[3],amount:'0',currency:'USD',sourceRecords:[2]}],months:periods.map((month,i)=>({month,currency:'USD',amount:['10','0','5','0'][i],sourceHash:hashes[i],metric:'source-total-earned',receiptIds:[]})),comparisons:[{id:'stores',dimension:'store',sourceSystem:'invented',accountScope:'invented-account',currency:'USD',periodBasis:'filename-declared',beforeMonths:periods.slice(0,2),afterMonths:periods.slice(2),sourceReferences:periods.map((month,i)=>({month,sourceHash:hashes[i]})),groups:[{id:'store_one',key:'Example',label:'Example',beforeAmount:'10',afterAmount:'5',sourceReferences:[]}]}],storePeriodCoverage:[{schemaVersion:1,id:'coverage_one',comparisonId:'stores',storeKey:'Example',observations:periods.map((month,i)=>({month,sourceHash:hashes[i],rowCount:i===3?0:1,amount:['10','0','5',null][i],postingWindow:{first:'2025-07-01',last:'2025-07-31'}}))}]};}
const make=(change=()=>{},extra={})=>createDefiantEvidenceService({organizationId:'org',authorize:a=>a==='owner',loadSnapshot:()=>{const d=snapshot();change(d);return d;},...extra});
test('observed zero is retained; absent observation is null; matched pairs exclude absence',async()=>{
 const service=make(),{revision}=await service.read('owner');const result=await service.read('owner',{resource:'store-coverage',revision,storeCoverageId:'coverage_one'}),p=result.product;
 assert.equal(p.observations[1].amount,'0');assert.equal(p.observations[1].observation,'observed');assert.equal(p.observations[3].amount,null);assert.equal(p.observations[3].observation,'absent-in-supplied-grouping');
 assert.equal(p.observations[0].postingWindow.scope,'source-file');assert.equal(p.observations[3].postingWindow.scope,'source-file');assert.equal(p.observations[3].observation,'absent-in-supplied-grouping');assert.match(p.limitation,/whole source file, not this store/);
 assert.equal(p.allPeriod.delta,'-5');assert.deepEqual(p.mutuallyObserved.pairs,[{beforeMonth:'2024-01',afterMonth:'2025-01'}]);assert.equal(p.mutuallyObserved.delta,'-5');assert.equal(p.expectedDelivery,'unknown');assert.equal(p.settlementMaturityComparable,false);
 const june=await service.read('owner',{resource:'june-review',revision,selectionId:'june'});assert.equal(june.storeCoverage[0].observation.amount,null);assert.equal(june.storeCoverage[0].followUp.revision,revision);assert.equal(june.commercialReadiness.readiness,'not-ready');
});
test('invalid coverage does not promote mismatched sources or malformed observation semantics',async()=>{
 for(const mutate of [p=>p.observations.pop(),p=>p.observations[1].month=p.observations[0].month,p=>p.observations[0].sourceHash='f'.repeat(64),p=>p.observations[3].amount='0',p=>p.observations[0].amount=null,p=>p.observations[0].amount='11',p=>p.observations[0].postingWindow.first='2025-02-30',p=>p.storeKey='unknown'])await assert.rejects(make(d=>mutate(d.storePeriodCoverage[0])).read('owner'),{status:503});
});
test('optional absence preserves prior revision; page/detail reject stale, foreign and missing input',async()=>{
 const service=make(),{revision}=await service.read('owner');const without=make(d=>delete d.storePeriodCoverage),undefinedField=make(d=>d.storePeriodCoverage=undefined);
 assert.equal((await without.read('owner')).revision,(await undefinedField.read('owner')).revision);assert.notEqual((await without.read('owner')).revision,revision);
 assert.equal((await service.read('owner',{resource:'store-coverage',revision,limit:1})).items.length,1);
 await assert.rejects(service.read('owner',{resource:'store-coverage'}),{status:400});await assert.rejects(service.read('other',{resource:'store-coverage',revision}),{status:403});await assert.rejects(service.read('owner',{resource:'store-coverage',revision:'f'.repeat(64)}),{status:409});await assert.rejects(service.read('owner',{resource:'store-coverage',revision,storeCoverageId:'missing'}),{status:404});
 let allowed=true;await assert.rejects(make(()=>{allowed=false;},{authorize:()=>allowed}).read('owner',{resource:'store-coverage',revision}),{status:403});
});
test('HTTP and actual SDK return the same pinned product and deny alternate scope',async t=>{
 const service=make(),{revision}=await service.read('owner');const url=new URL(`https://fixture.invalid/api/studio/defiant-evidence/org/store-coverage?revision=${revision}&storeCoverageId=coverage_one`);
 const http=await defiantEvidenceRequest({service,user:'owner',route:url.pathname,method:'GET',url});assert.equal(http.product.id,'coverage_one');
 const handler=createDefiantEvidenceMcpHandler({resolveEvidence:async({organizationId})=>{if(organizationId!=='org')throw Object.assign(Error('denied'),{status:403});return {organizationId,actor:'owner',service};}});
 const client=new Client({name:'store-coverage-contract',version:'1.0.0'},{versionNegotiation:{mode:'auto'}});t.after(async()=>{await client.close();await handler.close();});await client.connect(new StreamableHTTPClientTransport(new URL('https://fixture.invalid/mcp'),{fetch:(url,init)=>handler.fetch(new Request(url,init))}));
 const result=await client.callTool({name:'defiant_store_period_coverage',arguments:{organizationId:'org',revision,storeCoverageId:'coverage_one'}});assert.deepEqual(result.structuredContent.product,http.product);
 assert.equal((await client.callTool({name:'defiant_store_period_coverage',arguments:{organizationId:'other',revision}})).isError,true);
});

test('maximum bounded store coverage list serializes below the bridge four MiB ceiling',()=>{
 const before=Array.from({length:24},(_,i)=>`${2020+Math.floor(i/12)}-${String(i%12+1).padStart(2,'0')}`),after=Array.from({length:24},(_,i)=>`${2022+Math.floor(i/12)}-${String(i%12+1).padStart(2,'0')}`);
 const months=[...before,...after],sourceHash='a'.repeat(64),storeKey='界'.repeat(500);
 const comparisons=Array.from({length:100},(_,i)=>({id:'comparison_'+i,dimension:'store',sourceSystem:'界'.repeat(128),accountScope:'界'.repeat(128),currency:'USD',periodBasis:'filename-declared',beforeMonths:before,afterMonths:after,sourceReferences:months.map(month=>({month,sourceHash})),groups:[{id:'group_'+i,key:storeKey,beforeAmount:'24',afterAmount:'24'}]}));
 const input=comparisons.map(c=>({schemaVersion:1,id:'coverage_'+c.id,comparisonId:c.id,storeKey,observations:months.map(month=>({month,sourceHash,rowCount:1,amount:'1',postingWindow:{first:'2025-07-01',last:'2025-07-31'}}))}));
 const products=normalizeStorePeriodCoverage(input,comparisons);assert.equal(products.length,100);assert.equal(products[0].observations.length,48);assert.equal(products[0].mutuallyObserved.pairingBasis,'positional-in-declared-comparison-lists');
 const response={schemaVersion:1,scope:{organizationId:'o'.repeat(128)},revision:'b'.repeat(64),coverage:'界'.repeat(2000),items:products,total:100,nextOffset:null};
 assert.ok(Buffer.byteLength(JSON.stringify(response),'utf8')<=4*1024*1024);
});


test('June decision card binds evidence and explicit unknowns without enabling commercial action',async()=>{
 const service=make(),{revision}=await service.read('owner');
 const result=await service.read('owner',{resource:'june-review',revision,selectionId:'june'}),card=result.decisionCard;
 assert.equal(card.purpose,'reporting-coverage-review');assert.equal(card.datasetRevision,revision);assert.equal(card.context.selectedSourceHash,hashes[3]);
 assert.deepEqual(card.cost,{status:'unknown',kind:'analyst-effort',amount:null,currency:null});assert.deepEqual(card.reviewDate,{status:'unset',value:null});
 assert.equal(card.hypothesis.status,'untested');assert.equal(card.action.execution,'not-executed');assert.equal(card.successMeasure.status,'not-assessed');assert.equal(result.commercialReadiness.readiness,'not-ready');
 assert.equal(card.context.absentObservations[0].amount,null);assert.equal(card.evidence[2].available,false);
 for(const ref of card.evidence.filter(x=>x.available!==false)){const resolved=await service.read('owner',ref.followUp);assert.equal(resolved.revision,revision);}
 await assert.rejects(service.read('owner',{resource:'june-review',revision:'f'.repeat(64),selectionId:'june'}),{status:409});
 await assert.rejects(service.read('other',{resource:'june-review',revision,selectionId:'june'}),{status:403});
 let allowed=true;await assert.rejects(make(()=>{allowed=false;},{authorize:()=>allowed}).read('owner',{resource:'june-review',revision,selectionId:'june'}),{status:403});
});
test('observed zero and unavailable coverage preserve factual review without manufacturing an action',async()=>{
 for(const [change,reason] of [[d=>{d.storePeriodCoverage[0].observations[3].rowCount=1;d.storePeriodCoverage[0].observations[3].amount='0';},'no-absent-observation-in-selected-period'],[d=>delete d.storePeriodCoverage,'matching-store-coverage-unavailable']]){
  const service=make(change),{revision}=await service.read('owner');const result=await service.read('owner',{resource:'june-review',revision,selectionId:'june'});
  assert.equal(result.decisionCard,null);assert.equal(result.decisionCardUnavailableReason,reason);assert.equal(result.purpose,'factual-period-brief');assert.equal(result.facts.period.month,'2025-06');
 }
});
test('actual MCP SDK and HTTP expose equal June decision cards and finite evidence',async t=>{
 const service=make(),{revision}=await service.read('owner');const url=new URL(`https://fixture.invalid/api/studio/defiant-evidence/org/june-review?revision=${revision}&selectionId=june`);
 const http=await defiantEvidenceRequest({service,user:'owner',route:url.pathname,method:'GET',url});
 const handler=createDefiantEvidenceMcpHandler({resolveEvidence:async({organizationId})=>{if(organizationId!=='org')throw Object.assign(Error('denied'),{status:403});return {organizationId,actor:'owner',service};}});
 const client=new Client({name:'decision-card-contract',version:'1.0.0'},{versionNegotiation:{mode:'auto'}});t.after(async()=>{await client.close();await handler.close();});await client.connect(new StreamableHTTPClientTransport(new URL('https://fixture.invalid/mcp'),{fetch:(url,init)=>handler.fetch(new Request(url,init))}));
 const result=await client.callTool({name:'defiant_june_factual_review',arguments:{organizationId:'org',revision,selectionId:'june'}});assert.deepEqual(result.structuredContent.decisionCard,http.decisionCard);
 assert.equal((await client.callTool({name:'defiant_june_factual_review',arguments:{organizationId:'other',revision,selectionId:'june'}})).isError,true);
});

test('decision receipt follow-up separates availability from callable request with a real loader',async()=>{
 const calls=[];const service=make(()=>{},{loadSourceRecords:request=>{calls.push(request);return request.sourceRecords.map(record=>({id:'row_'+record,sourceHash:request.sourceHash,member:'invented.csv',record,cells:{Amount:'0',Currency:'USD'}}));}});
 const {revision}=await service.read('owner');const packet=await service.read('owner',{resource:'june-review',revision,selectionId:'june'});
 const evidence=packet.decisionCard.evidence.find(e=>e.followUp.resource==='selection-receipts');assert.equal(evidence.available,true);assert.equal('available' in evidence.followUp,false);
 const receipts=await service.read('owner',evidence.followUp);assert.equal(receipts.receipts[0].record,2);assert.equal(receipts.receipts[0].sourceHash,hashes[3]);assert.deepEqual(calls[0].sourceRecords,[2]);assert.equal(calls[0].revision,revision);
 const without=make(),withoutRevision=(await without.read('owner')).revision;const unavailable=(await without.read('owner',{resource:'june-review',revision:withoutRevision,selectionId:'june'})).decisionCard.evidence.find(e=>e.followUp.resource==='selection-receipts');assert.equal(unavailable.available,false);await assert.rejects(without.read('owner',unavailable.followUp),{status:503});
});
