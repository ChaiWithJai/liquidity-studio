import test from 'node:test';
import assert from 'node:assert/strict';
import {discoverServedEvidenceCoverage} from './defiant-evidence-discovery.js';
const a='a'.repeat(64),b='b'.repeat(64),c='c'.repeat(64),revision='d'.repeat(64);
const fixture=()=>({schemaVersion:1,organizationId:'example_org',revision,coverage:'Invented served subset; no full source intake claim',months:[{month:'2025-01',currency:'USD',sourceHash:a},{month:'2025-02',currency:'USD',sourceHash:a}],receipts:[{id:'receipt_a',sourceHash:a,member:'invented-statement.csv',record:2,cells:{privateNarrative:'not a discovery index'}}],selections:[{id:'selection_a',sourceHash:a,label:'Track alpha',sourceRecords:[2,3]},{id:'selection_b',sourceHash:a,label:'Track beta',sourceRecords:[3,4]}],comparisons:[{sourceSystem:'Example statements',accountScope:'Example account',sourceReferences:[{month:'2025-01',sourceHash:a}]}],audienceDefinitions:[{id:'audience_b',sourceHash:b,name:'Audience worksheet'}],unservedArchiveInventory:[{sourceHash:c,name:'Not served'}]});
test('served coverage deduplicates references without claiming full inventory or unique file record counts',()=>{
 const data=fixture(),before=JSON.stringify(data),result=discoverServedEvidenceCoverage(data);
 assert.equal(result.totalReferencedSources,2);assert.equal(result.inventoryComplete,false);assert.equal(result.coverageKind,'served-evidence-coverage');assert.equal(result.revision,revision);assert.deepEqual(result.scope,{organizationId:'example_org'});assert.equal(JSON.stringify(result).includes(c),false);
 const row=result.items[0];assert.equal(row.sourceHash,a);assert.equal(row.counts.selectionRecordReferences,4);assert.equal(row.counts.aggregateSelections,2);assert.equal(row.counts.receiptExamples,1);assert.deepEqual(row.periods.map(({month,currencies})=>({month,currencies})),[{month:'2025-01',currencies:['USD']},{month:'2025-02',currencies:['USD']}]);assert.ok(row.missingFields.includes('originalFileRecordCount'));assert.equal(row.missingFields.includes('sourceSystem'),false);assert.equal(result.capabilities.canInfer,false);assert.equal(JSON.stringify(data),before);
});
test('deterministic text/period filters and bounded pages preserve undated limitations',()=>{
 const data=fixture();assert.equal(discoverServedEvidenceCoverage(data,{query:'  STATEMENT  '}).matchingSources,1);assert.equal(discoverServedEvidenceCoverage(data,{query:'not a discovery index'}).matchingSources,0);
 const page=discoverServedEvidenceCoverage(data,{limit:1});assert.equal(page.nextOffset,1);assert.equal(discoverServedEvidenceCoverage(data,{offset:1,limit:1}).items[0].sourceHash,b);
 const dated=discoverServedEvidenceCoverage(data,{fromMonth:'2025-02',toMonth:'2025-02'});assert.equal(dated.matchingSources,1);assert.equal(dated.undatedReferencedSources,1);assert.equal(discoverServedEvidenceCoverage(data,{fromMonth:'2026-01'}).matchingSources,0);
 const unknown=discoverServedEvidenceCoverage(data,{query:'Audience'}).items[0];assert.equal(unknown.periodBasis,'not-retained');assert.ok(unknown.missingFields.includes('earningsPeriod'));assert.ok(unknown.missingFields.includes('originalMemberName'));
});
test('request bounds and unknown fields fail before discovery; malformed normalized inputs fail closed',()=>{
 for(const request of [{query:'x'.repeat(201)},{query:'a\n'},{fromMonth:'2025-13'},{fromMonth:'2025-03',toMonth:'2025-01'},{limit:101},{offset:-1},{path:'/private'},{query:42}])assert.throws(()=>discoverServedEvidenceCoverage(fixture(),request),{status:400});
 for(const change of [x=>x.revision='latest',x=>x.receipts[0].sourceHash='bad',x=>x.months[0].month='2025-99',x=>x.selections[0].sourceRecords=Array(500001).fill(2)]){const data=fixture();change(data);assert.throws(()=>discoverServedEvidenceCoverage(data),{status:503});}
 const empty=discoverServedEvidenceCoverage({...fixture(),months:[],receipts:[],selections:[],comparisons:[],audienceDefinitions:[]});assert.equal(empty.totalReferencedSources,0);assert.equal(empty.inventoryComplete,false);
});

test('Unicode metadata is bounded at limit100 and omitted metadata still participates in discovery',()=>{
 const data={...fixture(),months:[],receipts:[],selections:[],comparisons:[],audienceDefinitions:[]};
 for(let source=1;source<=100;source++)for(let n=0;n<10;n++){
  const sourceHash=source.toString(16).padStart(64,'0'),label='漢'.repeat(480)+String(n).padStart(2,'0')+(n===9?'LAST_MATCH':'');
  data.selections.push({sourceHash,label,sourceRecords:[2]});data.receipts.push({sourceHash,member:label});
 }
 const result=discoverServedEvidenceCoverage(data,{query:'LAST_MATCH',limit:100});assert.equal(result.items.length,100);assert.ok(Buffer.byteLength(JSON.stringify(result),'utf8')<3*1024*1024);
 for(const row of result.items){assert.equal(row.labels.length,5);assert.equal(row.memberNames.length,5);assert.deepEqual(row.metadataCounts.labels,{total:10,returned:5,omitted:5});assert.equal(row.labels.some(v=>v.includes('LAST_MATCH')),false);}
 const dated={...fixture(),months:Array.from({length:1200},(_,i)=>({month:`${1900+Math.floor(i/12)}-${String(i%12+1).padStart(2,'0')}`,currency:'USD',sourceHash:a}))};const row=discoverServedEvidenceCoverage(dated).items[0];assert.equal(row.periods.length,24);assert.equal(row.metadataCounts.periods.omitted,1176);assert.equal(discoverServedEvidenceCoverage(dated,{fromMonth:'1999-12'}).matchingSources,1);
});

import {createDefiantEvidenceService} from './defiant-evidence.js';
import {defiantEvidenceRequest} from './defiant-evidence-http.js';
import {createDefiantEvidenceMcpHandler} from './defiant-evidence-mcp.js';
import {Client,StreamableHTTPClientTransport} from '@modelcontextprotocol/client';
test('coverage uses real normalization/current authority and identical revision-bound HTTP/SDK DTOs',async t=>{
 let allowed=true,loads=0,revoke=false;const raw={schemaVersion:1,organizationId:'example_org',coverage:'Invented served subset',months:[{month:'2025-01',currency:'USD',amount:'1.00',metric:'source-total-earned',sourceHash:a,receiptIds:['row_a']}],receipts:[{id:'row_a',sourceHash:a,member:'example.csv',record:2,cells:{Amount:'1.00'}}]};
 const service=createDefiantEvidenceService({organizationId:'example_org',authorize:actor=>allowed&&actor==='owner',loadSnapshot:async()=>{loads++;if(revoke)allowed=false;return raw;}});
 const result=await service.read('owner',{resource:'coverage',query:'EXAMPLE',fromMonth:'2025-01'});assert.equal(result.items.length,1);assert.equal(result.inventoryComplete,false);
 const url=new URL('https://fixture.invalid/api/studio/defiant-evidence/example_org/coverage?query=EXAMPLE&fromMonth=2025-01&revision='+result.revision);const http=await defiantEvidenceRequest({service,user:'owner',route:url.pathname,method:'GET',url});assert.deepEqual(http,result);
 const before=loads;for(const suffix of ['?query=x&query=y','?query='+('x'.repeat(201))]){const u=new URL('https://fixture.invalid/api/studio/defiant-evidence/example_org/coverage'+suffix);await assert.rejects(defiantEvidenceRequest({service,user:'owner',route:u.pathname,method:'GET',url:u}),{status:400});}await assert.rejects(service.read('owner',{resource:'manifest',query:'x'}),{status:400});assert.equal(loads,before);
 const handler=createDefiantEvidenceMcpHandler({resolveEvidence:async({organizationId})=>{if(organizationId!=='example_org')throw Object.assign(Error('Denied'),{status:403});return {organizationId,actor:'owner',service};}}),client=new Client({name:'coverage-contract',version:'1.0.0'},{versionNegotiation:{mode:'auto'}});t.after(async()=>{await client.close();await handler.close();});await client.connect(new StreamableHTTPClientTransport(new URL('https://fixture.invalid/mcp'),{fetch:(url,init)=>handler.fetch(new Request(url,init))}));
 const tool=(await client.listTools()).tools.find(t=>t.name==='defiant_discover_served_evidence');assert.equal(tool.annotations.readOnlyHint,true);const call=args=>client.callTool({name:tool.name,arguments:{organizationId:'example_org',...args}});assert.deepEqual((await call({query:'EXAMPLE',fromMonth:'2025-01',revision:result.revision})).structuredContent,result);assert.equal((await call({query:'x'.repeat(201)})).isError,true);assert.equal((await call({organizationId:'other'})).isError,true);
 await assert.rejects(service.read('owner',{resource:'coverage',revision:'0'.repeat(64)}),{status:409});revoke=true;await assert.rejects(service.read('owner',{resource:'coverage'}),{status:403});const count=loads;await assert.rejects(service.read('owner',{resource:'coverage'}),{status:403});assert.equal(loads,count);
});
