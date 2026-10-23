import test from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {normalizeSelectionReconciliations,selectionReconciliationView} from './defiant-selection-reconciliation.js';
import {createDefiantEvidenceService} from './defiant-evidence.js';
import {defiantEvidenceRequest} from './defiant-evidence-http.js';
import {Client,StreamableHTTPClientTransport} from '@modelcontextprotocol/client';
import {createDefiantEvidenceMcpHandler} from './defiant-evidence-mcp.js';
const sourceHash='a'.repeat(64),digest=v=>createHash('sha256').update(JSON.stringify(v)).digest('hex');
const selection=()=>({id:'sample',label:'Invented selection',sourceHash,currency:'USD',amount:'2.50',sourceRecords:[2,5]});
const proof=()=>({schemaVersion:1,method:'selected-derived-cells-signed-decimal-v1',selectionId:'sample',sourceHash,currency:'USD',metric:'source-total-earned',month:'2025-01',selectedRecordCount:2,selectionRecordSetSha256:digest([2,5]),declaredAmount:'2.500',recomputedAmount:'2.5',positiveAmount:'3.00',negativeAmount:'-0.5',zeroRows:0,predicates:{sourceSongId:'invented_001',store:'Invented store'},provenance:{crossTabSha256:'b'.repeat(64),selectedReceiptsSha256:'c'.repeat(64),producerReceiptSha256:'d'.repeat(64),independentReviewSha256:'e'.repeat(64)}});
const fixture=()=>({schemaVersion:1,organizationId:'sample_org',coverage:'Invented fixture only',months:[],receipts:[],selections:[selection()],selectionReconciliations:[proof()]});
test('selected reconciliation validates exact signed metadata but qualifies retained review',()=>{
 const raw=proof(),normalized=normalizeSelectionReconciliations([raw],[selection()]);raw.predicates.store='changed';
 const view=selectionReconciliationView({selections:[selection()],selectionReconciliations:normalized,revision:'f'.repeat(64)},'sample');
 assert.equal(view.proof.predicates.store,'Invented store');assert.equal(view.runtimeBinding.scope,'selection-metadata-and-arithmetic');assert.equal(view.retainedDerivedReview.status,'reported-pass');assert.match(view.limitation,/not source cells/);assert.equal(view.proof.positiveRows,undefined);assert.equal(view.proof.sourceGeneration,undefined);
 assert.equal(selectionReconciliationView({selections:[selection()]},'sample').reason,'not-prepared');
 assert.throws(()=>selectionReconciliationView({selections:[]},'sample'),{status:404});
});
test('wrong facts, locators, signs, unknowns and scalar boundaries fail closed',()=>{
 for(const mutate of [p=>p.sourceHash='b'.repeat(64),p=>p.currency='EUR',p=>p.selectionId='missing',p=>p.selectedRecordCount=3,p=>p.selectionRecordSetSha256=digest([5,2]),p=>p.recomputedAmount='2.500000000001',p=>p.positiveAmount='-3',p=>p.negativeAmount='0.5',p=>p.zeroRows=3,p=>p.zeroRows=2,p=>p.zeroRows=1,p=>p.declaredAmount='2.50\n',p=>p.declaredAmount='1'.repeat(27),p=>p.declaredAmount='0.'+'1'.repeat(13),p=>p.sourceHash+='\u2028',p=>p.predicates.expression='eval',p=>p.provenance.path='/private',p=>p.sourceGeneration='1',p=>p.predicates.store='é'.repeat(251)]){
  const p=proof();mutate(p);assert.throws(()=>normalizeSelectionReconciliations([p],[selection()]),{status:503});
 }
 assert.throws(()=>normalizeSelectionReconciliations([proof(),proof()],[selection()]),{status:503});
 assert.throws(()=>normalizeSelectionReconciliations(Array(2001).fill(proof()),[selection()]),{status:503});
});
test('absence preserves legacy revision and adding proof changes revision',async()=>{
 const raw=fixture();delete raw.selectionReconciliations;
 const manifest=async data=>createDefiantEvidenceService({organizationId:'sample_org',authorize:()=>true,loadSnapshot:async()=>data}).read('actor');
 const legacy=await manifest(raw);assert.equal(legacy.counts.selectionReconciliations,undefined);
 assert.equal(legacy.revision,digest({schemaVersion:1,organizationId:raw.organizationId,coverage:raw.coverage,months:[],receipts:[],selections:raw.selections.map(s=>({id:s.id,label:s.label,sourceHash:s.sourceHash,amount:s.amount,currency:s.currency,sourceRecords:s.sourceRecords}))}));
 const withProof=await manifest(fixture());assert.notEqual(withProof.revision,legacy.revision);
 assert.equal((await manifest({...raw,selectionReconciliations:undefined})).revision,legacy.revision);
});
test('same-revision HTTP read requires current authority and finite filters',async()=>{
 let allowed=true,loads=0,revoke=false;const service=createDefiantEvidenceService({organizationId:'sample_org',authorize:()=>allowed,loadSnapshot:async()=>{loads++;if(revoke)allowed=false;return fixture();}});
 const manifest=await service.read('actor');assert.equal(manifest.counts.selectionReconciliations,1);
 const invoke=query=>{const url=new URL('https://fixture.invalid/api/studio/defiant-evidence/sample_org/selection-reconciliation?'+query);return defiantEvidenceRequest({service,user:'actor',route:url.pathname,method:'GET',url});};
 const result=await invoke('selectionId=sample&revision='+manifest.revision);assert.equal(result.available,true);assert.equal(result.revision,manifest.revision);
 await assert.rejects(invoke('selectionId=sample'),{status:400});await assert.rejects(invoke('selectionId=sample&revision='+'b'.repeat(64)),{status:409});await assert.rejects(invoke('selectionId=sample&revision='+manifest.revision+'&offset=0'),{status:400});
 revoke=true;await assert.rejects(invoke('selectionId=sample&revision='+manifest.revision),{status:403});const count=loads;await assert.rejects(invoke('selectionId=sample&revision='+manifest.revision),{status:403});assert.equal(loads,count);
});
test('real SDK exposes qualified reconciliation and no data on scope or revision mismatch',async t=>{
 const service=createDefiantEvidenceService({organizationId:'sample_org',authorize:()=>true,loadSnapshot:async()=>fixture()});
 const handler=createDefiantEvidenceMcpHandler({resolveEvidence:async({organizationId})=>{if(organizationId!=='sample_org')throw Object.assign(new Error('private'),{status:403});return {actor:'actor',organizationId,service};}});
 const client=new Client({name:'invented-reconciliation',version:'1'},{versionNegotiation:{mode:'auto'}});t.after(async()=>{await client.close();await handler.close();});
 await client.connect(new StreamableHTTPClientTransport(new URL('https://fixture.invalid/mcp'),{fetch:(url,init)=>handler.fetch(new Request(url,init))}));
 const call=args=>client.callTool({name:'defiant_selection_reconciliation',arguments:{organizationId:'sample_org',selectionId:'sample',...args}});
 const manifest=(await client.callTool({name:'defiant_evidence_manifest',arguments:{organizationId:'sample_org'}})).structuredContent;
 const result=await call({revision:manifest.revision});assert.equal(result.structuredContent.proof.negativeAmount,'-0.5');assert.equal(result.structuredContent.retainedDerivedReview.status,'reported-pass');
 for(const args of [{revision:'b'.repeat(64)},{revision:manifest.revision,organizationId:'other'}]){const denied=await call(args);assert.equal(denied.isError,true);assert.equal(denied.structuredContent,undefined);}
});
test('zero and sign-bucket feasibility does not invent unrecorded sign counts',()=>{
 const p=proof(),s=selection();p.declaredAmount=p.recomputedAmount=p.positiveAmount=p.negativeAmount='0';s.amount='0';p.zeroRows=2;
 assert.equal(normalizeSelectionReconciliations([p],[s])[0].zeroRows,2);
 p.zeroRows=1;assert.throws(()=>normalizeSelectionReconciliations([p],[s]),{status:503});
 const one=proof(),single={...selection(),sourceRecords:[2]};one.selectedRecordCount=1;one.selectionRecordSetSha256=digest([2]);
 assert.throws(()=>normalizeSelectionReconciliations([one],[single]),{status:503});
 one.positiveAmount='2.50';one.negativeAmount='0';assert.equal(normalizeSelectionReconciliations([one],[single])[0].selectedRecordCount,1);
});
