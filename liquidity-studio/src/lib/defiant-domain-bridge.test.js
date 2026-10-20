import test from 'node:test';
import assert from 'node:assert/strict';
import {createDefiantDomainBridge} from './defiant-domain-bridge.js';
import {generateDefiantSyntheticDataset} from '../../server/defiant-synthetic-dataset.js';
import {createDefiantUnifiedData} from '../../server/defiant-unified-data.js';
import {runDefiantDomainPathway} from '../../server/defiant-domain-pathways.js';
const organizationId='fictional_domain_test';
const input={organizationId,pathwayId:'catalog-to-campaign',artistId:'artist:fictional-1',trackId:'track:fictional-1-1',regionId:'region:nj',budgets:[0,500,1000],horizonMonths:3};
const actor={id:'fictional-reviewer'};
const service=createDefiantUnifiedData({dataset:generateDefiantSyntheticDataset(),organizationId,authorize:async current=>current===actor});
const reply=async args=>({content:[],structuredContent:{...await runDefiantDomainPathway(service,actor,Object.fromEntries(Object.entries(args).filter(([key])=>key!=='organizationId'))),view:'domain-review',scope:{organizationId}}});
const tick=()=>new Promise(resolve=>setImmediate(resolve));
function fixture(){
 const calls=[],states=[];
 const app={connect:async()=>{},close:async()=>{},callServerTool:async request=>{calls.push(structuredClone(request));if(request.name==='defiant_open_domain_review')return reply(request.arguments);if(request.name==='defiant_read_data')return {structuredContent:{...await service.read(actor,{resource:request.arguments.resource,limit:25}),scope:{organizationId}},content:[]};throw Error('Unexpected tool');}};
 const bridge=createDefiantDomainBridge({app,onState:state=>states.push(state)});
 return {app,bridge,calls,states,get state(){return states.at(-1);}};
}
test('actual joined dataset reaches the domain UI only after scope binding; choices wait for SDK connect',async()=>{
 const f=fixture();f.app.ontoolinput({arguments:input});f.app.ontoolresult(await reply(input));
 assert.equal(f.calls.length,0);assert.equal(f.state.view.status,'human-review-required');
 await f.bridge.start();await tick();
 assert.deepEqual(f.calls.map(row=>row.arguments.resource),['artists','tracks','regions']);assert.ok(f.calls.every(row=>row.arguments.limit===25));
 assert.equal(f.state.view.selection.trackId,input.trackId);assert.equal(f.state.view.review.status,'pending');assert.equal(f.state.loading,false);
 assert.equal(f.state.choices.tracks.length,6);assert.ok(f.state.choices.tracks.every(row=>row.artistId===input.artistId));
 await f.bridge.select({...input,budgets:[0,1000]});await tick();
 assert.equal(f.calls[3].name,'defiant_open_domain_review');assert.deepEqual(f.calls[3].arguments.budgets,[0,1000]);assert.equal(f.state.view.scenarioComparison.scenarios[0].assumedIncrementalStreams,0);
 await f.bridge.dispose();
});
test('stale requests and mismatched dataset choices cannot replace the current joined review',async()=>{
 const f=fixture();await f.bridge.start();f.app.ontoolinput({arguments:input});f.app.ontoolresult(await reply(input));await tick();
 const previous=f.state.view;
 let release;
 const actual=f.app.callServerTool;f.app.callServerTool=request=>request.name==='defiant_open_domain_review'?new Promise(resolve=>{release=resolve;}):actual(request);
 const pending=f.bridge.select({...input,budgets:[1000]});f.app.ontoolcancelled();release(await reply({...input,budgets:[1000]}));await pending;
 assert.deepEqual(f.state.view,previous);assert.match(f.state.error,/cancelled/);
 f.app.callServerTool=async request=>{const response=await actual(request);if(request.name==='defiant_read_data')response.structuredContent.dataset.revision='0'.repeat(64);return response;};
 await f.bridge.retry();await tick();assert.match(f.state.error,/choices could not refresh/);assert.deepEqual(f.state.view.scenarioComparison.scenarios.map(row=>row.budget),[1000]);
 await f.bridge.dispose();
});
test('result guards reject another scope, changed budgets or joined recording without approving or writing',async()=>{
 const f=fixture();await f.bridge.start();f.app.ontoolinput({arguments:input});
 const wrongScope=await reply(input);wrongScope.structuredContent.scope.organizationId='another_org';f.app.ontoolresult(wrongScope);assert.equal(f.state.view,null);
 const wrongBudget=await reply(input);wrongBudget.structuredContent.scenarioComparison.scenarios[0].budget=99;f.app.ontoolresult(wrongBudget);assert.equal(f.state.view,null);assert.match(f.state.error,/could not refresh/);
 f.app.ontoolinput({arguments:input});const wrongRecording=await reply(input);wrongRecording.structuredContent.rightsAndRoyalties.recording.id='track:fictional-2-1';f.app.ontoolresult(wrongRecording);assert.equal(f.state.view,null);
 assert.equal(f.calls.length,0);await f.bridge.dispose();
});
test('a static missing-input outcome can populate bounded choices without inventing budgets or a ready review',async()=>{
 const f=fixture(),missing={organizationId,pathwayId:'talent-to-campaign'};
 f.app.ontoolinput({arguments:missing});f.app.ontoolresult(await reply(missing));await f.bridge.start();await tick();
 assert.equal(f.state.view.status,'needs-input');assert.equal(f.state.view.dataset,undefined);assert.equal(f.state.input.budgets,undefined);assert.equal(f.state.choices.artists.length,6);
 await f.bridge.select({artistId:'artist:fictional-1'});assert.match(f.state.error,/supply one to three/);assert.equal(f.calls.length,3);
 await f.bridge.dispose();
});
