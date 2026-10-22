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
 assert.deepEqual(evidenceLocation({evidenceMode:'unknown',evidenceGroupId:'../secret',evidenceRevision:'bad',evidenceOffset:500001}),{mode:'earnings',revision:'',groupId:'',selectionId:'',receiptId:'',comparisonId:'',comparisonGroupId:'',audienceId:'',referenceIndex:null,showAudienceCells:false,offset:0});
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
