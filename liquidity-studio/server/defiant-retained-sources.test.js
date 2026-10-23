import test from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {normalizeRetainedSourceRegister,searchRetainedSources,declaredFilenamePeriod} from './defiant-retained-sources.js';
import {createDefiantEvidenceService} from './defiant-evidence.js';
import {defiantEvidenceRequest} from './defiant-evidence-http.js';
import {createDefiantEvidenceMcpHandler} from './defiant-evidence-mcp.js';
import {Client,StreamableHTTPClientTransport} from '@modelcontextprotocol/client';
const h=n=>n.repeat(64),digest=v=>createHash('sha256').update(JSON.stringify(v)).digest('hex');
function fixture(){
 const root={id:'root_one',sourceId:'statements',filename:'Example.zip',format:'zip',bytes:1000,sha256:h('a'),generation:'123',retentionVerification:{size:true,crc32c:true,md5:null},memberInventory:{status:'enumerated',scope:'Only this invented archive'},periods:[]};
 const chain=['nested.zip','folder/example-sales_period-06-2025.csv'];
 const member={id:digest([root.sha256,chain,h('b')]),rootId:root.id,chain,sha256:h('b'),bytes:100,format:'csv',container:false,periods:[{month:'2025-06',periodKind:'sales',basis:'filename-declared',sourceText:chain.at(-1)}]};
 const second={...member,chain:['copy/example-sales_period-06-2025.csv']};second.id=digest([root.sha256,second.chain,second.sha256]);second.periods=[{...member.periods[0],sourceText:second.chain[0]}];
 const nested={id:digest([root.sha256,['nested.zip'],h('c')]),rootId:root.id,chain:['nested.zip'],sha256:h('c'),bytes:200,format:'zip',container:true,periods:[]};
 return {schemaVersion:1,scopeDescription:'Invented retained subset, not provider completeness',capturedAt:'2026-01-02T03:04:05.123456Z',provenance:{manifestSha256:h('d'),memberInventorySha256:h('e')},roots:[root],members:[member,second,nested]};
}
const snapshot=register=>({organizationId:'example_org',revision:h('f'),retainedSourceRegister:register,months:[{sourceHash:h('b')}],receipts:[],selections:[],comparisons:[],audienceDefinitions:[]});
test('retained register preserves occurrences, nested containers, explicit period kinds and root-only transfer observations',()=>{
 const raw=fixture(),before=JSON.stringify(raw),reg=normalizeRetainedSourceRegister(raw),result=searchRetainedSources(snapshot(reg));
 assert.equal(JSON.stringify(raw),before);assert.deepEqual(result.globalCounts,{rootObjects:1,memberOccurrences:3,leafOccurrences:2,uniqueLeafHashes:1,duplicateLeafHashGroups:1,undatedRecords:2});
 assert.equal(result.items.find(r=>r.kind==='root').retentionVerification.md5,null);assert.ok(result.items.filter(r=>r.kind==='member').every(r=>!Object.hasOwn(r,'generation')&&r.sourceId==='statements'));
 assert.equal(result.items.find(r=>r.sha256===h('b')).servedAssociation,'referenced-by-served-evidence');assert.equal(result.items.find(r=>r.kind==='root').servedAssociation,'not-referenced-by-served-evidence');
 const dated=searchRetainedSources(snapshot(reg),{kind:'member',format:'csv',fromMonth:'2025-06',toMonth:'2025-06',limit:1});assert.equal(dated.matchingCounts.memberOccurrences,2);assert.equal(dated.matchingCounts.undatedRecords,0);assert.equal(dated.nextOffset,1);assert.notEqual(searchRetainedSources(snapshot(reg),{kind:'member',format:'csv',fromMonth:'2025-06',limit:1,offset:1}).items[0].id,dated.items[0].id);
 assert.equal(searchRetainedSources(snapshot(reg),{sourceHash:h('b')}).items.length,2);assert.equal(searchRetainedSources(snapshot(reg),{query:' FOLDER/EXAMPLE '}).items.length,1);assert.equal(result.providerComplete,false);
});
test('only explicit terminal CSV period markers are parsed; date-report, backup dates, folder ranges and ancestor periods do not become child periods',()=>{
 assert.deepEqual(declaredFilenamePeriod('folder/example-reporting_period-06-2025.csv'),{month:'2025-06',periodKind:'reporting'});assert.deepEqual(declaredFilenamePeriod('example-sales-period-01-2024.csv'),{month:'2024-01',periodKind:'sales'});
 for(const s of ['Backup-2026-10-21.tar.gz','example-date_report-2024-08-27.csv','summary-2025-06.csv','202501-202506/file.csv','m2025_06.pdf','bad-sales_period-13-2025.csv','x-sales_period-06-2025.csv\n','x-sales_period-06-2025.csv\u2028'])assert.equal(declaredFilenamePeriod(s),null);
 for(const mutate of [r=>r.members[0].periods[0].periodKind='reporting',r=>r.members[0].periods[0].sourceText='other-sales_period-06-2025.csv',r=>r.members[0].periods[0].month='2025-07',r=>{r.members[0].chain=['archive-sales_period-06-2025.csv','child.csv'];r.members[0].id=digest([r.roots[0].sha256,r.members[0].chain,r.members[0].sha256]);r.members[0].periods[0].sourceText=r.members[0].chain[0];},r=>r.members[0].periods.push({...r.members[0].periods[0]})]){const r=fixture();mutate(r);assert.throws(()=>normalizeRetainedSourceRegister(r),{status:503});}
});
test('malformed hashes, dates, generations, occurrences, paths and unknown metadata reject before disclosure',()=>{
 const changes=[r=>r.capturedAt='2025-02-30T00:00:00Z',r=>r.roots[0].generation='0',r=>r.members[0].chain=['../secret'],r=>r.members[0].generation='123',r=>r.roots[0].uri='gs://private',r=>r.members.push({...r.members[0]}),r=>r.members[0].rootId='missing',r=>r.members[0].bytes=101,r=>r.roots[0].memberInventory.status='not-enumerated'];
 for(const suffix of ['\n','\r','\u2028'])for(const edit of [r=>r.provenance.manifestSha256+=suffix,r=>r.roots[0].sha256+=suffix,r=>r.roots[0].generation+=suffix,r=>r.roots[0].id+=suffix])changes.push(edit);
 for(const edit of changes){const r=fixture();edit(r);assert.throws(()=>normalizeRetainedSourceRegister(r),{status:503});}
 for(const q of [{path:'/private'},{offset:5001},{limit:101},{sourceHash:h('a')+'\n'},{sourceHash:h('a')+'\u2028'},{fromMonth:'2025-06\n'},{fromMonth:'2025-06\r'},{fromMonth:'2025-06\u2028'},{sourceId:'source\u2028'},{fromMonth:'2025-07',toMonth:'2025-06'}])assert.throws(()=>searchRetainedSources(snapshot(normalizeRetainedSourceRegister(fixture())),q),{status:400});
});
test('unavailable register is not a fabricated empty inventory and self references cannot claim served association',()=>{
 const absent=searchRetainedSources(snapshot(undefined));assert.equal(absent.availability,false);assert.equal(absent.globalCounts,null);assert.equal(absent.matchingCounts,null);assert.deepEqual(absent.items,[]);
 const result=searchRetainedSources({...snapshot(normalizeRetainedSourceRegister(fixture())),months:[]});assert.ok(result.items.every(r=>r.servedAssociation==='not-referenced-by-served-evidence'));
});
test('maximum bounded metadata response remains below transport cap',()=>{
 const r=fixture();r.members=[];for(let n=0;n<4096;n++){const chain=[`${'漢'.repeat(450)}-${n}.csv`],sha256=n.toString(16).padStart(64,'0');r.members.push({id:digest([r.roots[0].sha256,chain,sha256]),rootId:'root_one',chain,sha256,bytes:n,format:'csv',container:false,periods:[]});}
 // The 2MiB input cap rejects oversized Unicode inventories rather than returning an oversized page.
 assert.throws(()=>normalizeRetainedSourceRegister(r),{status:503});
 r.members=r.members.slice(0,300);const out=searchRetainedSources(snapshot(normalizeRetainedSourceRegister(r)),{limit:100});assert.equal(out.items.length,100);assert.ok(Buffer.byteLength(JSON.stringify(out))<3*1024*1024);
});
test('actual normalized HTTP and SDK reads agree; optional absence preserves legacy revision and authority/revision gates',async t=>{
 let allowed=true,revoke=false,loads=0;const raw={schemaVersion:1,organizationId:'example_org',coverage:'Invented evidence',months:[],receipts:[]};
 const service=createDefiantEvidenceService({organizationId:'example_org',authorize:a=>allowed&&a==='owner',loadSnapshot:async()=>{loads++;if(revoke)allowed=false;return raw;}});
 const legacy=await service.read('owner');const expected=digest({schemaVersion:1,organizationId:'example_org',coverage:raw.coverage,months:[],receipts:[],selections:[]});assert.equal(legacy.revision,expected);assert.equal((await service.read('owner',{resource:'retained-sources'})).availability,false);
 raw.retainedSourceRegister=fixture();const data=await service.read('owner',{resource:'retained-sources',sourceId:'statements',kind:'member',format:'csv',fromMonth:'2025-06',limit:1});assert.notEqual(data.revision,legacy.revision);
 const url=new URL('https://fixture.invalid/api/studio/defiant-evidence/example_org/retained-sources?sourceId=statements&kind=member&format=csv&fromMonth=2025-06&limit=1&revision='+data.revision);assert.deepEqual(await defiantEvidenceRequest({service,user:'owner',route:url.pathname,method:'GET',url}),data);
 const emptyQuery=new URL('https://fixture.invalid/api/studio/defiant-evidence/example_org/retained-sources?query=');assert.equal((await defiantEvidenceRequest({service,user:'owner',route:emptyQuery.pathname,method:'GET',url:emptyQuery})).availability,true);
 const duplicateQuery=new URL(emptyQuery);duplicateQuery.searchParams.append('query','again');await assert.rejects(defiantEvidenceRequest({service,user:'owner',route:duplicateQuery.pathname,method:'GET',url:duplicateQuery}),{status:400});
 const handler=createDefiantEvidenceMcpHandler({resolveEvidence:async({organizationId})=>{if(organizationId!=='example_org')throw Object.assign(Error('Denied'),{status:403});return {organizationId,actor:'owner',service};}}),client=new Client({name:'retained-source-contract',version:'1.0.0'},{versionNegotiation:{mode:'auto'}});t.after(async()=>{await client.close();await handler.close();});await client.connect(new StreamableHTTPClientTransport(new URL('https://fixture.invalid/mcp'),{fetch:(url,init)=>handler.fetch(new Request(url,init))}));
 const tool=(await client.listTools()).tools.find(x=>x.name==='defiant_search_retained_sources');assert.equal(tool.annotations.readOnlyHint,true);const args={organizationId:'example_org',revision:data.revision,sourceId:'statements',kind:'member',format:'csv',fromMonth:'2025-06',limit:1};assert.deepEqual((await client.callTool({name:tool.name,arguments:args})).structuredContent,data);
 const before=loads;assert.equal((await client.callTool({name:tool.name,arguments:{...args,organizationId:'other'}})).isError,true);await assert.rejects(service.read('owner',{resource:'manifest',sourceId:'statements'}),{status:400});assert.equal(loads,before);await assert.rejects(service.read('owner',{resource:'retained-sources',revision:legacy.revision}),{status:409});revoke=true;await assert.rejects(service.read('owner',{resource:'retained-sources'}),{status:403});const at=loads;await assert.rejects(service.read('owner',{resource:'retained-sources'}),{status:403});assert.equal(loads,at);
});
