import test from 'node:test';
import assert from 'node:assert/strict';
import {Client,StreamableHTTPClientTransport} from '@modelcontextprotocol/client';
import {createDefiantEvidenceMcpHandler} from './defiant-evidence-mcp.js';
import {createDefiantEvidenceService} from './defiant-evidence.js';
const organizationId='sample_org',sentinel='private_sentinel_never_log';
const snapshot=()=>({schemaVersion:1,organizationId,coverage:sentinel,months:[{month:'2025-06',currency:'USD',amount:'0',metric:'source-total-earned',sourceHash:'a'.repeat(64),receiptIds:['row_2']}],receipts:[{id:'row_2',sourceHash:'a'.repeat(64),member:'sample.csv',record:2,cells:{Amount:sentinel}}],selections:[{id:'group_a',label:sentinel,sourceHash:'a'.repeat(64),amount:'0',currency:'USD',sourceRecords:[2]}]});
async function connect(t,resolveEvidence,onOutcome){
 const handler=createDefiantEvidenceMcpHandler({resolveEvidence,onOutcome});
 const client=new Client({name:'diagnostic-contract',version:'1'},{versionNegotiation:{mode:'auto'}});
 t.after(async()=>{await client.close();await handler.close();});
 await client.connect(new StreamableHTTPClientTransport(new URL('https://fixture.invalid/mcp'),{fetch:(url,init)=>handler.fetch(new Request(url,init))}));
 return (name,args={})=>client.callTool({name,arguments:{organizationId,...args}});
}
function check(events){for(const event of events){assert.deepEqual(Object.keys(event).sort(),['event','outcome','stage','status','tool']);assert.equal(Object.isFrozen(event),true);assert.equal(event.event,'defiant_evidence_tool_outcome');}assert.equal(JSON.stringify(events).includes(sentinel),false);}
test('actual SDK distinguishes receipt, snapshot, resolver, revision and authority failures without private values',async t=>{
 let mode='normal';const events=[];
 const service=createDefiantEvidenceService({organizationId,authorize:()=>mode!=='denied',loadSnapshot:async()=>{if(mode==='load')throw Error(sentinel);return mode==='normalize'?{}:snapshot();},loadSourceRecords:async()=>{throw Error(sentinel);}});
 const call=await connect(t,async()=>({organizationId,actor:'actor',service}),event=>events.push(event));
 const manifest=(await call('defiant_evidence_manifest')).structuredContent;events.length=0;
 const cases=[['normal','defiant_show_receipt',{receiptId:'row_2'},200,'response_serialize'],['normal','defiant_show_receipt',{receiptId:sentinel},404,'receipt_lookup'],['normal','defiant_show_receipt',{receiptId:'row_2',revision:'b'.repeat(64)},409,'revision_check'],['load','defiant_evidence_manifest',{},503,'snapshot_load'],['normalize','defiant_evidence_manifest',{},503,'snapshot_normalize'],['normal','defiant_read_selection_receipts',{selectionId:'group_a'},503,'source_records_load'],['denied','defiant_evidence_manifest',{},403,'authority_before_snapshot']];
 for(const [next,name,args,status,stage] of cases){mode=next;const before=events.length;const result=await call(name,{...(name==='defiant_evidence_manifest'?{}:{revision:manifest.revision}),...args});assert.equal(events.length,before+1);assert.deepEqual(events.at(-1),{event:'defiant_evidence_tool_outcome',tool:name,outcome:status===200?'success':'error',status,stage});assert.equal(Boolean(result.isError),status!==200);}
 const before=events.length;await call('defiant_show_receipt',{revision:'invalid',receiptId:'row_2'}).catch(()=>{});assert.equal(events.length,before,'SDK schema rejection is outside callback telemetry');check(events);
});
test('actual SDK sink failures preserve responses and serialization has a distinct safe stage',async t=>{
 for(const sink of [()=>{throw Error(sentinel);},()=>Promise.reject(Error(sentinel))]){
  const service=createDefiantEvidenceService({organizationId,authorize:()=>true,loadSnapshot:snapshot});
  const call=await connect(t,async()=>({organizationId,actor:'actor',service}),sink);
  const manifest=(await call('defiant_evidence_manifest')).structuredContent;assert.equal(manifest.scope.organizationId,organizationId);
  assert.equal((await call('defiant_show_receipt',{revision:manifest.revision,receiptId:'missing'})).isError,true);
 }
 let failAfterStage=false;const events=[];const call=await connect(t,async()=>({organizationId,actor:'actor',service:{read:async(actor,request,{onStage})=>{onStage(sentinel);if(failAfterStage)throw Object.assign(Error(sentinel),{status:503});const data={scope:{organizationId}};data.cycle=data;return data;}}}),event=>events.push(event));
 assert.equal((await call('defiant_evidence_manifest')).isError,true);assert.equal(events.length,1);assert.equal(events[0].stage,'response_serialize');assert.equal(events[0].status,503);failAfterStage=true;assert.equal((await call('defiant_evidence_manifest')).isError,true);assert.equal(events.length,2);assert.equal(events[1].stage,'service_read');assert.equal(events[1].status,503);check(events);
});
test('actual SDK concurrent callbacks isolate stages and terminal events',async t=>{
 let release,started;const gate=new Promise(r=>release=r),entered=new Promise(r=>started=r);const events=[];
 const service=createDefiantEvidenceService({organizationId,authorize:()=>true,loadSnapshot:async()=>{started();await gate;return snapshot();}});
 const call=await connect(t,async({organizationId:scope})=>{if(scope==='other')throw Object.assign(Error(sentinel),{status:403});return {organizationId,actor:'actor',service};},event=>events.push(event));
 const pending=call('defiant_evidence_manifest');
 try{await entered;assert.equal((await call('defiant_evidence_manifest',{organizationId:'other'})).isError,true);assert.equal(events.length,1);assert.equal(events[0].stage,'resolve_binding');}finally{release();}
 assert.equal((await pending).isError,undefined);assert.equal(events.length,2);assert.equal(events[1].stage,'response_serialize');check(events);
});
