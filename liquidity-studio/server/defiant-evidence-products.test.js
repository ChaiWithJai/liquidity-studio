import test from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {createDefiantEvidenceService} from './defiant-evidence.js';
import {defiantEvidenceRequest} from './defiant-evidence-http.js';
import {registerDefiantEvidenceTools} from './defiant-evidence-mcp.js';
const hash='a'.repeat(64),other='b'.repeat(64);
const cell=(cellRef,value)=>({cellRef,type:'s',rawValue:value,value,formula:null,formulaExecuted:false});
const fixture=()=>({schemaVersion:1,organizationId:'org',coverage:'Invented contracts',receipts:[],months:[{month:'2024-01',amount:'10',currency:'USD',metric:'source-total-earned',sourceHash:hash,receiptIds:[]},{month:'2025-01',amount:'8.000000000001',currency:'USD',metric:'source-total-earned',sourceHash:other,receiptIds:[]}],comparisons:[{id:'annual',dimension:'store',sourceSystem:'invented',accountScope:'account',currency:'USD',periodBasis:'filename-declared',beforeMonths:['2024-01'],afterMonths:['2025-01'],sourceReferences:[{month:'2024-01',sourceHash:hash},{month:'2025-01',sourceHash:other}],groups:[{id:'down',key:'one',label:'Store one',beforeAmount:'12',afterAmount:'7',sourceReferences:[{side:'before',month:'2024-01',sourceHash:hash,exampleRecords:[2,4]}]},{id:'up',key:null,label:'Unresolved',beforeAmount:'-2',afterAmount:'1.000000000001',sourceReferences:[]}]}],audienceDefinitions:[{id:'returning',name:'Returning buyers',criteria:'Supplied repeat purchase rule',scaleText:'Not recomputed',proposedOffer:'Proposed catalog bundle',sourceHash:hash,sheet:'Rules',cellRefs:['A2','B2'],requiredEvidence:['orders','channel-consent'],observedEvidence:['orders'],activationAuthorized:true,populationComputed:true,consentVerified:true}]});
const service=(data,options={})=>createDefiantEvidenceService({organizationId:'org',authorize:()=>true,loadSnapshot:async()=>data,...options});
test('exact signed change reconciles and paged references are honestly examples',async()=>{
 const svc=service(fixture());const m=await svc.read('actor');
 const list=await svc.read('actor',{resource:'comparisons'});assert.equal(list.items[0].groups,undefined);assert.deepEqual(list.items[0].arithmeticReconciliation,{status:'checked',basis:'curated-group-sums-equal-supplied-period-totals',exclusions:['complete-source-cell-recomputation','usage-rate-adjustment-explanation','provider-completeness','settlement-maturity-comparability','causal-attribution']});
 const page=await svc.read('actor',{resource:'explain-change',comparisonId:'annual',revision:m.revision,limit:1});
 assert.deepEqual(page.comparison.arithmeticReconciliation,list.items[0].arithmeticReconciliation);assert.equal(page.revision,m.revision);
 assert.deepEqual(page.comparison.summary,{beforeAmount:'10',afterAmount:'8.000000000001',delta:'-1.999999999999',grossDecrease:'5',offsetIncrease:'3.000000000001'});
 assert.equal(page.groups[0].id,'down');assert.equal(page.nextOffset,1);assert.equal(page.groups[0].fullSelectionAvailable,false);assert.deepEqual(page.groups[0].sourceReferences[0].exampleRecords,[2,4]);
 const last=await svc.read('actor',{resource:'explain-change',comparisonId:'annual',revision:m.revision,offset:1});assert.equal(last.groups[0].key,null);assert.equal(last.nextOffset,null);assert.match(last.limitation,/not causal/);
});
test('audience supplied availability never grants approval or population claims',async()=>{
 const svc=service(fixture());const m=await svc.read('actor');const result=await svc.read('actor',{resource:'audience-definition',audienceId:'returning',revision:m.revision});
 assert.deepEqual(result.definition.missingEvidence,['channel-consent']);for(const key of ['activationAuthorized','populationComputed','consentVerified'])assert.equal(result.definition[key],false);
 assert.deepEqual(result.definition.cellRefs,['A2','B2']);assert.match(result.definition.evidenceStatus,/not-independent/);
});
test('invalid comparison periods, sums, hashes, keys and source locators are refused',async()=>{
 const mutations=[d=>d.comparisons[0].beforeMonths.push('2024-01'),d=>d.comparisons[0].afterMonths=['2024-01'],d=>d.comparisons[0].beforeMonths=['2023-01','2024-01'],d=>d.comparisons[0].currency='EUR',d=>d.comparisons[0].groups[0].beforeAmount='11',d=>d.comparisons[0].groups[1].afterAmount='1.000000000002',d=>d.comparisons[0].groups[0].beforeAmount='1e1',d=>d.comparisons[0].sourceReferences[0].sourceHash=other,d=>d.comparisons[0].groups[1].key='one',d=>d.comparisons[0].groups[0].sourceReferences[0].side='after',d=>d.comparisons[0].groups[0].sourceReferences[0].exampleRecords=[2,2],d=>d.comparisons[0].groups[0].sourceReferences[0].exampleRecords=[1],d=>d.comparisons[0].dimension='listener',d=>d.comparisons[0].periodBasis='verified',d=>d.audienceDefinitions[0].observedEvidence=['invented'],d=>d.audienceDefinitions[0].cellRefs=['arbitrary/path']];
 for(const mutate of mutations){const d=fixture();mutate(d);await assert.rejects(service(d).read('actor'),{status:503});}
});
test('old absent products preserve exact normalized revision',async()=>{
 const d=fixture();delete d.comparisons;delete d.audienceDefinitions;
 // Normalize preserves the historical property order, independent of input insertion order.
 const historical={schemaVersion:1,organizationId:d.organizationId,coverage:d.coverage,months:d.months.map(m=>({receiptIds:[],month:m.month,currency:m.currency,amount:m.amount,metric:m.metric,sourceHash:m.sourceHash})),receipts:[],selections:[]};
 const svc=service(d),m=await svc.read('actor');assert.equal(m.revision,createHash('sha256').update(JSON.stringify(historical)).digest('hex'));assert.equal(m.counts.comparisons,undefined);
 assert.equal((await svc.read('actor',{resource:'comparisons'})).total,0);
 await assert.rejects(svc.read('actor',{resource:'audience-definition',audienceId:'absent',revision:m.revision}),{status:404});
});
test('current authority, required revision and finite filters cover new products',async()=>{
 let allowed=true,loads=0;const d=fixture();const svc=service(d,{authorize:()=>allowed,loadSnapshot:async()=>{loads++;return d;}});const m=await svc.read('actor');
 for(const resource of ['explain-change','audience-definition'])await assert.rejects(svc.read('actor',{resource}),{status:400});
 await assert.rejects(svc.read('actor',{resource:'explain-change',comparisonId:'annual',revision:other}),{status:409});
 await assert.rejects(svc.read('actor',{resource:'comparisons',audienceId:'returning'}),{status:400});
 allowed=false;const before=loads;await assert.rejects(svc.read('actor',{resource:'audience-readiness'}),{status:403});assert.equal(loads,before);
 allowed=true;const revoked=service(d,{authorize:()=>allowed,loadSnapshot:async()=>{allowed=false;return d;}});await assert.rejects(revoked.read('actor',{resource:'comparisons'}),{status:403});
 assert.equal(m.scope.organizationId,'org');
});
test('HTTP and registered MCP dispatch expose the same pinned product, no caller paths',async()=>{
 const svc=service(fixture());const m=await svc.read('actor');
 const http=await defiantEvidenceRequest({service:svc,user:'actor',route:'/api/studio/defiant-evidence/org/explain-change',method:'GET',url:new URL(`https://fixture.invalid/?comparisonId=annual&revision=${m.revision}&limit=1`)});assert.equal(http.groups[0].id,'down');
 const callbacks=new Map();registerDefiantEvidenceTools({registerTool:(name,_config,cb)=>callbacks.set(name,cb)},{resolveEvidence:async()=>({organizationId:'org',actor:'actor',service:svc})});
 const result=await callbacks.get('defiant_explain_change')({organizationId:'org',comparisonId:'annual',revision:m.revision,limit:1},{});assert.deepEqual(result.structuredContent,http);
 const audience=await callbacks.get('defiant_audience_readiness')({organizationId:'org'},{});assert.equal(audience.structuredContent.items[0].activationAuthorized,false);
 await assert.rejects(defiantEvidenceRequest({service:svc,user:'actor',route:'/api/studio/defiant-evidence/org/comparisons',method:'GET',url:new URL('https://fixture.invalid/?path=private')}),{status:400});
});
test('aggregate magnitude retains precision beyond Number and collection bounds reject excess',async()=>{
 const d=fixture();d.months[0].amount='99999999999999999999999999';d.months[1].amount='99999999999999999999999998.999999999999';d.comparisons[0].groups=[{id:'large',key:'large',label:'Invented large decimal',beforeAmount:d.months[0].amount,afterAmount:d.months[1].amount,sourceReferences:[]}];
 const svc=service(d),m=await svc.read('actor');assert.equal((await svc.read('actor',{resource:'explain-change',comparisonId:'annual',revision:m.revision})).comparison.summary.delta,'-0.000000000001');
 for(const mutate of [d=>d.comparisons=Array.from({length:101},(_,i)=>({...d.comparisons[0],id:`c_${i}`})),d=>d.audienceDefinitions=Array.from({length:201},(_,i)=>({...d.audienceDefinitions[0],id:`a_${i}`})),d=>d.comparisons[0].groups[0].sourceReferences[0].exampleRecords=Array.from({length:11},(_,i)=>i+2)]){const data=fixture();mutate(data);await assert.rejects(service(data).read('actor'),{status:503});}
});
test('derived deltas may exceed input decimal magnitude without overflow',async()=>{
 const d=fixture();d.months[0].amount='-99999999999999999999999999';d.months[1].amount='99999999999999999999999999';d.comparisons[0].groups=[{id:'swing',key:'swing',label:'Invented signed swing',beforeAmount:d.months[0].amount,afterAmount:d.months[1].amount,sourceReferences:[]}];
 const svc=service(d),m=await svc.read('actor');const result=await svc.read('actor',{resource:'explain-change',comparisonId:'annual',revision:m.revision});assert.equal(result.groups[0].delta,'199999999999999999999999998');
});
test('before periods must precede after periods, not merely be disjoint',async()=>{
 const reversed=fixture();reversed.comparisons[0].beforeMonths=['2025-01'];reversed.comparisons[0].afterMonths=['2024-01'];await assert.rejects(service(reversed).read('actor'),{status:503});
 const interleaved=fixture();interleaved.comparisons[0].beforeMonths=['2024-01','2025-01'];interleaved.comparisons[0].afterMonths=['2024-02','2025-02'];await assert.rejects(service(interleaved).read('actor'),{status:503});
});
test('actual SDK discovers and consumes comparison and audience detail with revision and scope denials',async t=>{
 const {Client,StreamableHTTPClientTransport}=await import('@modelcontextprotocol/client');
 const {createDefiantEvidenceMcpHandler}=await import('./defiant-evidence-mcp.js');
 let allowed=true;let loads=0;
 const svc=service(fixture(),{authorize:actor=>allowed&&actor==='verified-actor',loadSnapshot:async()=>{loads++;return fixture();},loadSourceRecords:async request=>request.sourceRecords.map(record=>({id:`r_${record}`,sourceHash:request.sourceHash,member:'invented.csv',record,cells:{Amount:'0.01'}})),loadWorksheetCells:async request=>({sourceHash:request.sourceHash,sheet:request.sheet,cells:request.cellRefs.map(cellRef=>cell(cellRef,'Supplied text'))})});
 const handler=createDefiantEvidenceMcpHandler({resolveEvidence:async({organizationId,requestContext})=>{
  if(organizationId!=='org'||requestContext.authInfo?.clientId!=='fixture-client')throw Object.assign(new Error('Denied'),{status:403});
  return {organizationId,actor:'verified-actor',service:svc};
 }});
 const client=new Client({name:'evidence-products-contract',version:'1.0.0'},{versionNegotiation:{mode:'auto'}});
 const transport=new StreamableHTTPClientTransport(new URL('https://fixture.invalid/mcp'),{fetch:(url,init)=>handler.fetch(new Request(url,init),{authInfo:{token:'invented-only',clientId:'fixture-client',scopes:['evidence:read']}})});
 t.after(async()=>{await client.close();await handler.close();});
 await client.connect(transport);
 const tools=(await client.listTools()).tools;
 for(const name of ['defiant_explain_change','defiant_inspect_audience_definition']){
  const tool=tools.find(row=>row.name===name);assert.ok(tool);assert.equal(tool.annotations.readOnlyHint,true);
 }
 const call=(name,args={})=>client.callTool({name,arguments:{organizationId:'org',...args}});
 const manifest=(await call('defiant_evidence_manifest')).structuredContent;
 const comparisons=(await call('defiant_list_change_comparisons',{revision:manifest.revision})).structuredContent;
 const first=(await call('defiant_explain_change',{comparisonId:comparisons.items[0].id,revision:manifest.revision,limit:1})).structuredContent;
 assert.equal(first.comparison.summary.delta,'-1.999999999999');assert.equal(first.groups[0].id,'down');assert.equal(first.nextOffset,1);
 assert.deepEqual(first.groups[0].sourceReferences[0],{side:'before',month:'2024-01',sourceHash:hash,exampleRecords:[2,4]});
 const last=(await call('defiant_explain_change',{comparisonId:comparisons.items[0].id,revision:manifest.revision,offset:first.nextOffset,limit:1})).structuredContent;
 assert.equal(last.groups[0].id,'up');assert.equal(last.nextOffset,null);assert.equal(last.revision,first.revision);
 const examples=(await call('defiant_read_comparison_examples',{comparisonId:'annual',groupId:first.groups[0].id,referenceIndex:0,revision:manifest.revision})).structuredContent;
 assert.deepEqual(examples.receipts.map(row=>row.record),[2,4]);assert.equal(examples.fullSelectionAvailable,false);
 const worksheet=(await call('defiant_read_audience_cells',{audienceId:'returning',revision:manifest.revision})).structuredContent;
 assert.deepEqual(worksheet.worksheet.cells,[cell('A2','Supplied text'),cell('B2','Supplied text')]);
 const audiences=(await call('defiant_audience_readiness',{revision:manifest.revision})).structuredContent;
 const audience=(await call('defiant_inspect_audience_definition',{audienceId:audiences.items[0].id,revision:manifest.revision})).structuredContent;
 assert.deepEqual(audience.definition.missingEvidence,['channel-consent']);assert.deepEqual(audience.definition.cellRefs,['A2','B2']);assert.equal(audience.definition.activationAuthorized,false);assert.equal(audience.revision,first.revision);
 for(const args of [{comparisonId:'annual',revision:other},{comparisonId:'annual',revision:manifest.revision,organizationId:'different'}]){
  const denied=await call('defiant_explain_change',args);assert.equal(denied.isError,true);assert.equal(denied.structuredContent,undefined);
 }
 const before=loads;allowed=false;
 const revoked=await call('defiant_inspect_audience_definition',{audienceId:'returning',revision:manifest.revision});assert.equal(revoked.isError,true);assert.equal(revoked.structuredContent,undefined);assert.equal(loads,before);
});
test('comparison and worksheet source examples resolve only normalized server references',async()=>{
 const calls=[];const svc=service(fixture(),{loadSourceRecords:async request=>{calls.push(request);return request.sourceRecords.map(record=>({id:`r_${record}`,sourceHash:request.sourceHash,member:'invented.csv',record,cells:{Amount:'0.01'}}));},loadWorksheetCells:async request=>{calls.push(request);return {...request,cells:request.cellRefs.map(cellRef=>({...cell(cellRef,'3'),formula:'SUM(A1:A2)'}))};}});
 const {revision}=await svc.read('actor');
 const result=await svc.read('actor',{resource:'comparison-examples',comparisonId:'annual',groupId:'down',referenceIndex:0,revision});
 assert.deepEqual(calls[0],{organizationId:'org',sourceHash:hash,sourceRecords:[2,4],revision});assert.equal(result.receipts.length,2);assert.equal(result.fullSelectionAvailable,false);
 const cells=await svc.read('actor',{resource:'audience-cells',audienceId:'returning',revision});assert.deepEqual(calls[1],{organizationId:'org',sourceHash:hash,sheet:'Rules',cellRefs:['A2','B2'],revision});assert.equal(cells.worksheet.cells[0].formula,'SUM(A1:A2)');assert.equal(cells.worksheet.cells[0].formulaExecuted,false);assert.equal(cells.worksheet.organizationId,undefined);
 const definition=await svc.read('actor',{resource:'audience-definition',audienceId:'returning',revision});assert.equal(definition.definition.evidenceAssessmentOrigin,'analyst-assessment');
});
test('source examples reject mismatches, unavailable readers and revocation during each read',async()=>{
 for(const change of [rows=>rows.reverse(),rows=>{rows[0].sourceHash=other;return rows;},rows=>rows.slice(1)]){
  const svc=service(fixture(),{loadSourceRecords:async()=>change([2,4].map(record=>({id:`r_${record}`,sourceHash:hash,member:'invented.csv',record,cells:{Amount:'0.01'}})))});const {revision}=await svc.read('actor');await assert.rejects(svc.read('actor',{resource:'comparison-examples',comparisonId:'annual',groupId:'down',referenceIndex:0,revision}),{status:503});
 }
 for(const change of [x=>({...x,sourceHash:other}),x=>({...x,sheet:'Other'}),x=>({...x,cells:[...x.cells].reverse()}),x=>({...x,cells:[{cellRef:'A2',value:'x'.repeat(4001)},x.cells[1]]})]){
  const svc=service(fixture(),{loadWorksheetCells:async()=>change({sourceHash:hash,sheet:'Rules',cells:[cell('A2','rule'),cell('B2','offer')]})});const {revision}=await svc.read('actor');await assert.rejects(svc.read('actor',{resource:'audience-cells',audienceId:'returning',revision}),{status:503});
 }
 for(const [resource,extra,reader] of [['comparison-examples',{comparisonId:'annual',groupId:'down',referenceIndex:0},'loadSourceRecords'],['audience-cells',{audienceId:'returning'},'loadWorksheetCells']]){
  const unavailable=service(fixture());const {revision}=await unavailable.read('actor');await assert.rejects(unavailable.read('actor',{resource,...extra,revision}),{status:503});
  let allowed=true;const svc=service(fixture(),{authorize:()=>allowed,[reader]:async request=>{allowed=false;return reader==='loadSourceRecords'?request.sourceRecords.map(record=>({id:`r_${record}`,sourceHash:hash,member:'invented.csv',record,cells:{Amount:'0.01'}})):{sourceHash:hash,sheet:'Rules',cells:request.cellRefs.map(cellRef=>cell(cellRef,'rule'))};}});
  await assert.rejects(svc.read('actor',{resource,...extra,revision}),{status:403});
  await assert.rejects(unavailable.read('actor',{resource,...extra,revision:other}),{status:409});
 }
});
test('HTTP example routes parse only bounded server identifiers and protect scope',async()=>{
 const svc=service(fixture(),{loadSourceRecords:async request=>request.sourceRecords.map(record=>({id:`r_${record}`,sourceHash:request.sourceHash,member:'invented.csv',record,cells:{Amount:'0.01'}})),loadWorksheetCells:async request=>({sourceHash:request.sourceHash,sheet:request.sheet,cells:request.cellRefs.map(ref=>cell(ref,'Supplied rule'))})});
 const {revision}=await svc.read('actor');
 const read=(resource,query,scope='org')=>defiantEvidenceRequest({service:svc,user:'actor',route:`/api/studio/defiant-evidence/${scope}/${resource}`,method:'GET',url:new URL(`https://fixture.invalid/?revision=${revision}&${query}`)});
 assert.equal((await read('comparison-examples','comparisonId=annual&groupId=down&referenceIndex=0')).receipts.length,2);
 assert.equal((await read('audience-cells','audienceId=returning')).worksheet.cells.length,2);
 for(const query of ['comparisonId=annual&groupId=down&referenceIndex=-1','comparisonId=annual&groupId=down&referenceIndex=48','comparisonId=annual&groupId=down&referenceIndex=0&sourceHash=untrusted','comparisonId=annual&groupId=down&referenceIndex=0&offset=1'])await assert.rejects(read('comparison-examples',query),{status:400});
 await assert.rejects(read('audience-cells','audienceId=returning','other'),{status:403});
});
