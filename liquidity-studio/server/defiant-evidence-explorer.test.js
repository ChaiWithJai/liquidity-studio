import test from 'node:test';
import assert from 'node:assert/strict';
import {createEvidenceExplorer,evidenceLocation} from '../src/lib/defiant-evidence-explorer.js';
const rev='a'.repeat(64), scope={organizationId:'org'};
const manifest={revision:rev,scope,coverage:'Supplied records',counts:{months:1,selections:1}};
const list={revision:rev,scope,items:[],total:0,nextOffset:null};
function harness(request){const states=[];return {states,controller:createEvidenceExplorer({request,onState:s=>states.push(s)})};}
test('pins all-selection pagination to manifest and preserves complete selection resource',async()=>{
 const calls=[];const h=harness(async path=>{calls.push(path);return path.startsWith('/manifest')?manifest:list;});
 await h.controller.load({evidenceMode:'selections',evidenceOffset:25});
 assert.equal(calls[1],`/selections?revision=${rev}&offset=25&limit=25`);assert.equal(h.states.at(-1).list,list);
});
test('detail without revision and contradictory parent context perform no I/O',async()=>{
 let calls=0;const h=harness(async()=>{calls++;});
 await h.controller.load({evidenceSelectionId:'sel'});assert.equal(h.states.at(-1).status,409);
 await h.controller.load({evidenceRevision:rev,evidenceGroupId:'group',evidenceSelectionId:'sel'});assert.equal(h.states.at(-1).status,400);assert.equal(calls,0);
});
test('unexpected manifest revision clears evidence before any dependent request',async()=>{
 let calls=0;const h=harness(async()=>{calls++;return {...manifest,revision:'b'.repeat(64)};});
 await h.controller.load({evidenceRevision:rev});assert.equal(calls,1);assert.equal(h.states.at(-1).status,409);assert.equal(h.states.at(-1).manifest,null);
});
test('revoked access during source loading clears the entire atomic view',async()=>{
 const h=harness(async path=>{if(path.startsWith('/manifest'))return manifest;if(path.startsWith('/selection?'))return {...list,selection:{id:'sel'}};throw Object.assign(new Error('private source object'),{status:403});});
 await h.controller.load({evidenceRevision:rev,evidenceSelectionId:'sel'});
 assert.equal(h.states.at(-1).status,403);assert.equal(h.states.at(-1).selection,null);assert.deepEqual(h.states.at(-1).receipts,[]);assert.ok(!h.states.at(-1).error.includes('private'));
});
test('older pending navigation cannot overwrite a newer completed view',async()=>{
 let release,calls=0,firstSignal;const pending=new Promise(resolve=>release=resolve);
 const h=harness(async(path,{signal})=>{calls++;if(calls===1){firstSignal=signal;return pending;}return path.startsWith('/manifest')?manifest:list;});
 const old=h.controller.load();await h.controller.load({evidenceMode:'selections'});const count=h.states.length;
 release(manifest);await old;assert.equal(firstSignal.aborted,true);assert.equal(h.states.length,count);assert.equal(h.states.at(-1).list,list);
});
test('repeated root load retries and unexpected errors are redacted',async()=>{
 let calls=0;const h=harness(async()=>{calls++;throw new Error('secret internal path');});
 await h.controller.load();await h.controller.load();assert.equal(calls,2);assert.ok(!h.states.at(-1).error.includes('secret'));
});
test('location rejects arbitrary identifiers and unbounded offsets',()=>{
 assert.deepEqual(evidenceLocation({evidenceMode:'unknown',evidenceGroupId:'../secret',evidenceRevision:'bad',evidenceOffset:500001}),{sourceHash:'',sourceTrail:null,month:'',currency:'',showJuneReview:false,mode:'earnings',revision:'',groupId:'',selectionId:'',receiptId:'',comparisonId:'',comparisonGroupId:'',audienceId:'',referenceIndex:null,showAudienceCells:false,offset:0});
});
import {readStrategyLocation,writeStrategyLocation} from '../src/lib/defiant-location.js';
test('evidence URL round trips identifiers and revision without retaining source cells',()=>{
 const params=new URLSearchParams('org=org&tab=strategy');
 writeStrategyLocation(params,{view:'evidence',evidenceMode:'selections',evidenceRevision:rev,evidenceSelectionId:'sel',evidenceOffset:25,cells:{private:'not-a-route'}});
 const restored=readStrategyLocation(params);assert.equal(restored.evidenceSelectionId,'sel');assert.equal(restored.evidenceOffset,25);assert.equal(restored.evidenceRevision,rev);assert.equal(params.has('cells'),false);
 writeStrategyLocation(params,{view:'inbox'});assert.equal(params.has('evidenceRevision'),false);assert.equal(params.has('evidenceSelection'),false);
});

test('product trails round trip without paths and reject conflicting or orphan parent state before reads',async()=>{
 const params=new URLSearchParams();writeStrategyLocation(params,{view:'evidence',evidenceMode:'changes',evidenceRevision:rev,evidenceComparisonId:'comparison',evidenceComparisonGroupId:'group',evidenceReferenceIndex:0});const restored=readStrategyLocation(params);assert.equal(restored.evidenceComparisonId,'comparison');assert.equal(restored.evidenceReferenceIndex,0);
 let calls=0;const h=harness(async()=>{calls++;return manifest;});
 for(const input of [{evidenceMode:'audience',evidenceComparisonId:'comparison'},{evidenceMode:'changes',evidenceComparisonGroupId:'group',evidenceReferenceIndex:0},{evidenceMode:'changes',evidenceComparisonId:'comparison',evidenceSelectionId:'selection'},{evidenceMode:'audience',evidenceAudienceCells:true}]){await h.controller.load({evidenceRevision:rev,...input});assert.equal(h.states.at(-1).status,400);}assert.equal(calls,0);
});
test('comparison examples and audience cells remain pinned and revocation clears both',async()=>{
 const calls=[];let denied=false;const h=harness(async path=>{calls.push(path);if(path.startsWith('/manifest'))return manifest;if(denied)throw Object.assign(new Error('private'),{status:403});if(path.startsWith('/comparison-examples'))return {...list,comparisonId:'comparison',groupId:'group',referenceIndex:0,receipts:[],limitation:'Examples only'};return {...list,audienceId:'audience',definition:{id:'audience'},worksheet:{cells:[]}};});
 await h.controller.load({evidenceMode:'changes',evidenceRevision:rev,evidenceComparisonId:'comparison',evidenceComparisonGroupId:'group',evidenceReferenceIndex:0});assert.equal(calls[1],`/comparison-examples?revision=${rev}&comparisonId=comparison&groupId=group&referenceIndex=0`);assert.equal(h.states.at(-1).cellLimitation,'Examples only');
 await h.controller.load({evidenceMode:'audience',evidenceRevision:rev,evidenceAudienceId:'audience',evidenceAudienceCells:true});assert.ok(h.states.at(-1).worksheet);denied=true;await h.controller.load({evidenceMode:'audience',evidenceRevision:rev,evidenceAudienceId:'audience',evidenceAudienceCells:true});assert.equal(h.states.at(-1).audience,null);assert.equal(h.states.at(-1).worksheet,null);
});

test('wrong comparison parent echo clears source cells instead of attaching unrelated evidence',async()=>{
 const h=harness(async path=>path.startsWith('/manifest')?manifest:{...list,comparisonId:'other',groupId:'group',referenceIndex:0,receipts:[{id:'unrelated'}]});await h.controller.load({evidenceMode:'changes',evidenceRevision:rev,evidenceComparisonId:'comparison',evidenceComparisonGroupId:'group',evidenceReferenceIndex:0});assert.equal(h.states.at(-1).status,409);assert.deepEqual(h.states.at(-1).receipts,[]);
});

test('completed evidence views retain their resource mode while navigation clears the prior view',async()=>{
 let release,block=false;const pending=new Promise(resolve=>release=resolve);
 const h=harness(async path=>{if(block&&path.startsWith('/manifest'))return pending;return path.startsWith('/manifest')?manifest:list;});
 await h.controller.load({evidenceMode:'earnings'});const previous=h.states.at(-1);assert.equal(previous.mode,'earnings');assert.equal(previous.list,list);
 block=true;const next=h.controller.load({evidenceMode:'selections'});assert.equal(previous.mode,'earnings');assert.equal(h.states.at(-1).list,null);assert.equal(h.states.at(-1).mode,null);
 release(manifest);await next;assert.equal(h.states.at(-1).mode,'selections');assert.equal(h.states.at(-1).list,list);
});

test('retained source filters and pagination pin to manifest; unavailable remains distinct from zero matches',async()=>{
 const calls=[];const unavailable={revision:rev,scope,availability:false,globalCounts:null,matchingCounts:null,items:[],nextOffset:null};
 const h=harness(async path=>{calls.push(path);return path.startsWith('/manifest')?manifest:unavailable;});
 await h.controller.load({evidenceMode:'retained',retainedFilters:{query:'sales period',sourceId:'source_one',format:'csv',kind:'member',sourceHash:'b'.repeat(64),fromMonth:'2025-01',toMonth:'2025-06'},evidenceOffset:25});
 const query=new URL('https://fixture'+calls[1]);assert.equal(query.pathname,'/retained-sources');assert.equal(query.searchParams.get('revision'),rev);assert.equal(query.searchParams.get('query'),'sales period');assert.equal(query.searchParams.get('offset'),'25');assert.equal(query.searchParams.get('sourceHash'),'b'.repeat(64));assert.equal(h.states.at(-1).list.availability,false);assert.equal(h.states.at(-1).list.total,null);
});
test('retained source trail rejects detail collisions and clears revoked or changed responses',async()=>{
 let calls=0;const h=harness(async path=>{calls++;return path.startsWith('/manifest')?manifest:{...list,scope:{organizationId:'other'},availability:true};});
 await h.controller.load({evidenceMode:'retained',evidenceSelectionId:'selection',evidenceRevision:rev});assert.equal(calls,0);assert.equal(h.states.at(-1).status,400);
 await h.controller.load({evidenceMode:'retained',evidenceOffset:5001});assert.equal(calls,0);
 await h.controller.load({evidenceMode:'retained'});assert.equal(h.states.at(-1).status,409);assert.equal(h.states.at(-1).list,null);
 const denied=harness(async path=>{if(path.startsWith('/manifest'))return manifest;throw Object.assign(Error('private object'),{status:403});});await denied.controller.load({evidenceMode:'retained'});assert.equal(denied.states.at(-1).status,403);assert.equal(denied.states.at(-1).manifest,null);
});

const reconciliationPacket=()=>({schemaVersion:1,revision:rev,scope,selectionId:'selection',available:true,rowConvention:'1-based-logical-csv-record-including-header',runtimeBinding:{status:'checked',scope:'selection-metadata-and-arithmetic'},retainedDerivedReview:{status:'reported-pass',scope:'selected-derived-records',basis:'supplied-retained-review'},periodQualification:'producer-declared-group-month; not independently established by this read',predicateColumns:{sourceSongId:'TC Song ID',store:'Store Name'},followUp:{resource:'selection-receipts',selectionId:'selection',revision:rev},limitation:'Metadata binding, not source cells or predicate truth.',proof:{schemaVersion:1,method:'selected-derived-cells-signed-decimal-v1',metric:'source-total-earned',selectionId:'selection',sourceHash:'b'.repeat(64),currency:'USD',selectedRecordCount:26,zeroRows:0,month:'2025-01',declaredAmount:'2.50',recomputedAmount:'2.5',positiveAmount:'3',negativeAmount:'-0.5',selectionRecordSetSha256:'c'.repeat(64),predicates:{sourceSongId:'Example',store:'Example'},provenance:{crossTabSha256:'d'.repeat(64),selectedReceiptsSha256:'e'.repeat(64),producerReceiptSha256:'f'.repeat(64),independentReviewSha256:'1'.repeat(64)}}});
const selectedPage={revision:rev,scope,selection:{id:'selection',sourceHash:'b'.repeat(64),currency:'USD',amount:'2.50'},total:26,nextOffset:null};
test('reconciliation subview pins selection context and returns to the exact original receipt offset',async()=>{
 const calls=[];const h=harness(async path=>{calls.push(path);const kind=new URL('https://fixture'+path).pathname;return kind==='/manifest'?manifest:kind==='/selection'?selectedPage:kind==='/selection-reconciliation'?reconciliationPacket():{revision:rev,scope,receipts:[],limitation:'Original cells'};});
 await h.controller.load({evidenceMode:'selections',evidenceSelectionId:'selection',evidenceRevision:rev,evidenceOffset:25,evidenceReconciliation:true});assert.equal(h.states.at(-1).reconciliation.selectionId,'selection');assert.equal(h.states.at(-1).receipts.length,0);assert.equal(calls[1],`/selection?revision=${rev}&selectionId=selection&offset=25&limit=25`);assert.equal(calls[2],`/selection-reconciliation?revision=${rev}&selectionId=selection`);
 await h.controller.load({evidenceMode:'selections',evidenceSelectionId:'selection',evidenceRevision:rev,evidenceOffset:25,evidenceReconciliation:false});assert.equal(h.states.at(-1).reconciliation,null);assert.equal(calls.at(-1),`/selection-receipts?revision=${rev}&selectionId=selection&offset=25&limit=25`);
});
test('unprepared reconciliation is distinct; malformed, foreign, stale and revoked packets clear the whole view',async()=>{
 for(const mutate of [p=>p.selectionId='other',p=>p.scope={organizationId:'other'},p=>p.revision='b'.repeat(64),p=>p.proof.sourceHash='c'.repeat(64),p=>p.proof.currency='EUR',p=>p.proof.selectedRecordCount=25,p=>p.followUp.revision='b'.repeat(64),p=>delete p.proof.provenance,p=>p.proof.month=['2025-01'],p=>p.proof.predicates.store='bad\nmetadata',p=>p.proof.selectionRecordSetSha256+='\n',p=>p.available='true']){
  const packet=reconciliationPacket();mutate(packet);const h=harness(async path=>path.startsWith('/manifest')?manifest:path.startsWith('/selection?')?selectedPage:packet);await h.controller.load({evidenceMode:'selections',evidenceSelectionId:'selection',evidenceRevision:rev,evidenceReconciliation:true});assert.equal(h.states.at(-1).reconciliation,null);assert.equal(h.states.at(-1).selection,null);assert.ok([409,0].includes(h.states.at(-1).status));
 }
 const packet={schemaVersion:1,revision:rev,scope,selectionId:'selection',available:false,reason:'not-prepared',limitation:'Not prepared; does not establish incorrect arithmetic.'};const h=harness(async path=>path.startsWith('/manifest')?manifest:path.startsWith('/selection?')?selectedPage:packet);await h.controller.load({evidenceSelectionId:'selection',evidenceRevision:rev,evidenceReconciliation:true});assert.equal(h.states.at(-1).reconciliation.available,false);
 const denied=harness(async path=>{if(path.startsWith('/manifest'))return manifest;if(path.startsWith('/selection?'))return selectedPage;throw Object.assign(Error('private'),{status:403});});await denied.controller.load({evidenceSelectionId:'selection',evidenceRevision:rev,evidenceReconciliation:true});assert.equal(denied.states.at(-1).status,403);assert.equal(denied.states.at(-1).manifest,null);
});
test('reconciliation late response cannot restore an abandoned selection and contradictory subviews fail before reads',async()=>{
 let release,entered;const gate=new Promise(resolve=>release=resolve),start=new Promise(resolve=>entered=resolve);const h=harness(async path=>{if(path.startsWith('/manifest'))return manifest;if(path.startsWith('/selection?'))return selectedPage;if(path.startsWith('/selection-reconciliation')){entered();await gate;return reconciliationPacket();}return list;});
 const old=h.controller.load({evidenceSelectionId:'selection',evidenceRevision:rev,evidenceReconciliation:true});try{await start;await h.controller.load({evidenceMode:'earnings'});release();await old;assert.equal(h.states.at(-1).mode,'earnings');assert.equal(h.states.at(-1).reconciliation,null);}finally{release();await old;}
 let calls=0;const invalid=harness(async()=>{calls++;return manifest;});for(const location of [{evidenceReconciliation:true},{evidenceSelectionId:'selection',evidenceRevision:rev,evidenceReconciliation:true,evidenceJuneReview:true}])await invalid.controller.load(location);assert.equal(calls,0);
});
