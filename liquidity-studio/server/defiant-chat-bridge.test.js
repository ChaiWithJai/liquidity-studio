import test from 'node:test';
import assert from 'node:assert/strict';
import {createDefiantChatBridge} from '../src/lib/defiant-chat-bridge.js';
import {buildDefiantDemoView} from './defiant-demo-view.js';
const fixture=()=>({schemaVersion:1,dataset:{id:'fictional',label:'Fictional bridge contract',provenance:'synthetic',asOf:null,revision:'a'.repeat(64),counts:{artists:1,tracks:1,sources:1,campaigns:0,opportunities:0}},artists:[{id:'artist-a',name:'Fictional Artist'}],tracks:[{id:'track-a',title:'Fictional Recording',artistId:'artist-a'}],sources:[{id:'source-a',title:'Fictional Source',trackIds:['track-a']}],campaigns:[],opportunities:[],capabilities:{readOnly:true,canApproveRights:false,canPublish:false}});
const binding=(organizationId='org_a',selection={})=>({organizationId,pathwayId:'catalog-to-campaign',selection});
const viewResult=(data,b)=>({structuredContent:{...buildDefiantDemoView({data,pathwayId:b.pathwayId,selection:b.selection}),scope:{organizationId:b.organizationId}}});
function harness(){
 let data=fixture(),initialized=false,latest;const calls=[],waiters=[];
 const app={async connect(){assert.equal(typeof this.ontoolinput,'function');assert.equal(typeof this.ontoolresult,'function');this.ontoolinput({arguments:binding()});this.ontoolresult(viewResult(data,binding()));assert.equal(calls.length,0);initialized=true;},async callServerTool(request){assert.equal(initialized,true);calls.push(structuredClone(request));return this.reply(request);},async reply(request){const args=request.arguments;return request.name==='defiant_open_guided_view'?viewResult(data,args):{structuredContent:{schemaVersion:1,scope:{organizationId:args.organizationId},dataset:data.dataset,capabilities:data.capabilities,resource:args.resource,available:true,items:data[args.resource].slice(0,25)}};},async close(){this.closed=true;}};
 const controller=createDefiantChatBridge({app,onState:state=>{latest=state;for(const waiter of [...waiters])if(waiter.predicate(state)){waiters.splice(waiters.indexOf(waiter),1);waiter.resolve(state);}}});
 return {app,controller,calls,get state(){return latest;},get data(){return data;},set data(value){data=value;},until(predicate){if(predicate(latest))return Promise.resolve(latest);return new Promise(resolve=>waiters.push({predicate,resolve}));}};
}
test('handlers precede connect; early initial result waits for SDK readiness before four bounded choice reads',async()=>{
 const h=harness();await h.controller.start();await h.until(s=>!s.loading);
 assert.equal(h.state.view.scope.organizationId,'org_a');
 assert.deepEqual(h.calls.map(c=>c.arguments.resource),['artists','tracks','sources','opportunities']);
 for(const call of h.calls){assert.equal(call.name,'defiant_read_data');assert.deepEqual(Object.keys(call.arguments).sort(),['limit','organizationId','resource']);assert.equal(call.arguments.limit,25);}
 assert.equal(h.state.error,'');await h.controller.dispose();assert.equal(h.app.closed,true);
});
test('new host scope drops prior content and ignores a delayed result from the old organization',async()=>{
 const h=harness();await h.controller.start();await h.until(s=>!s.loading);
 h.app.ontoolinput({arguments:binding('org_b')});assert.equal(h.state.view,null);
 h.app.ontoolresult(viewResult(h.data,binding('org_a')));assert.equal(h.state.view,null);
 h.app.ontoolresult(viewResult(h.data,binding('org_b')));await h.until(s=>!s.loading);
 assert.equal(h.state.view.scope.organizationId,'org_b');
 assert.equal(h.calls.at(-1).arguments.organizationId,'org_b');await h.controller.dispose();
});
test('later selection wins over delayed replies, errors and their finally paths',async()=>{
 const h=harness();await h.controller.start();await h.until(s=>!s.loading);
 const pending=[];const ordinary=h.app.reply.bind(h.app);h.app.reply=request=>request.name==='defiant_open_guided_view'?new Promise((resolve,reject)=>pending.push({request,resolve,reject})):ordinary(request);
 const first=h.controller.select({artistId:'artist-a'}),second=h.controller.select({trackId:'track-a'});
 pending[1].resolve(viewResult(h.data,pending[1].request.arguments));await second;await h.until(s=>!s.loading);
 pending[0].reject(new Error('private rejected request'));await first;
 assert.deepEqual(h.state.view.selection,{trackId:'track-a'});assert.equal(h.state.error,'');await h.controller.dispose();
});
test('mismatched choice revision retains the open card and retry refreshes the guided snapshot without writes',async()=>{
 const h=harness();await h.controller.start();await h.until(s=>!s.loading);
 h.data.dataset.revision='b'.repeat(64);h.app.ontoolinput({arguments:binding()});
 const stale=fixture();h.app.ontoolresult(viewResult(stale,binding()));await h.until(s=>Boolean(s.error));
 assert.equal(h.state.view.dataset.revision,'a'.repeat(64));assert.match(h.state.error,/choices could not refresh/);
 await h.controller.retry();await h.until(s=>!s.loading&&!s.error);
 assert.equal(h.state.view.dataset.revision,'b'.repeat(64));
 assert.ok(h.calls.every(call=>['defiant_read_data','defiant_open_guided_view'].includes(call.name)));await h.controller.dispose();
});
test('invalid inputs, cancellation and teardown cannot activate arbitrary tools or apply late results',async()=>{
 const h=harness();await h.controller.start();await h.until(s=>!s.loading);const before=h.calls.length;
 h.app.ontoolinput({arguments:{...binding(),url:'https://private.invalid'}});assert.equal(h.state.view,null);assert.match(h.state.error,/valid Defiant/);assert.equal(h.calls.length,before);
 h.app.ontoolinput({arguments:binding()});h.app.ontoolcancelled();h.app.ontoolresult(viewResult(h.data,binding()));assert.equal(h.state.view,null);assert.match(h.state.error,/cancelled/);
 assert.deepEqual(h.app.onteardown(),{});await h.controller.select({trackId:'track-a'});assert.equal(h.calls.length,before);await h.controller.dispose();
});

test('a tool error received during SDK connect remains visible and retry performs only the bound read',async()=>{
 const h=harness();h.app.connect=async()=>{h.app.ontoolinput({arguments:binding()});h.app.ontoolresult({isError:true,content:[{type:'text',text:'Do not expose resolver details'}]});};
 // This overridden fixture handshake still marks its call path initialized through a separate bounded reply seam.
 h.app.callServerTool=async request=>{h.calls.push(structuredClone(request));return h.app.reply(request);};
 await h.controller.start();assert.match(h.state.error,/could not refresh/);assert.equal(h.state.view,null);
 await h.controller.retry();await h.until(s=>!s.loading&&!s.error);assert.equal(h.state.view.scope.organizationId,'org_a');
 assert.equal(h.calls[0].name,'defiant_open_guided_view');await h.controller.dispose();
});
