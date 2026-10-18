import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import { scopedRequest } from '../src/lib/scoped-request.js';
const gate = () => { let release; const promise = new Promise(resolve => { release=resolve; }); return {promise,release}; };
async function fixture(t) {
  const calls=[];let respond;
  const server=http.createServer(async(req,res)=>{let body='';for await(const chunk of req)body+=chunk;calls.push({url:req.url,body,authorization:req.headers.authorization});if(respond)await respond(req,res);else{res.writeHead(200,{'Content-Type':'application/json'});res.end(JSON.stringify({saved:true}));}});
  await new Promise(r=>server.listen(0,'127.0.0.1',r));
  t.after(async()=>{server.closeAllConnections();await new Promise(r=>server.close(r));});
  let state={sessionEpoch:1,scopeToken:1,query:'organizationId=org_a&brandId=brand_a'},cleared=0;
  const dispatch=(options={})=>scopedRequest({path:`http://127.0.0.1:${server.address().port}/write?intent=edit`,options:{method:'POST',body:JSON.stringify({storyId:'same-id',title:'Original brand intent'})},context:{...state},getContext:()=>state,authorize:async()=>({Authorization:'Bearer controlled-test-token'}),onUnauthorized:()=>{cleared++;},...options});
  return {calls,dispatch,setState:next=>{state={...state,...next}},setRespond:fn=>{respond=fn},get cleared(){return cleared}};
}
test('a scope switch during token refresh cancels before any HTTP mutation is dispatched',async t=>{
 const f=await fixture(t),token=gate(),started=gate();const pending=f.dispatch({authorize:async()=>{started.release();await token.promise;return {Authorization:'Bearer controlled-test-token'}}});
 await started.promise;f.setState({scopeToken:2,query:'organizationId=org_a&brandId=brand_b'});token.release();await assert.rejects(pending,{code:'REQUEST_CONTEXT_CHANGED'});assert.equal(f.calls.length,0);assert.equal(f.cleared,0);
});
test('same-context requests use captured scope, body and bearer header with existing query parameters',async t=>{
 const f=await fixture(t);assert.deepEqual(await f.dispatch(),{saved:true});assert.equal(f.calls.length,1);assert.equal(f.calls[0].url,'/write?intent=edit&organizationId=org_a&brandId=brand_a');assert.equal(JSON.parse(f.calls[0].body).title,'Original brand intent');assert.equal(f.calls[0].authorization,'Bearer controlled-test-token');
});
test('a late old-scope 401 cannot clear a new workspace; a current 401 clears once',async t=>{
 const f=await fixture(t),received=gate(),hold=gate();f.setRespond(async(req,res)=>{received.release();await hold.promise;res.writeHead(401,{'Content-Type':'application/json'});res.end(JSON.stringify({error:'Expired session'}));});
 const pending=f.dispatch();await received.promise;f.setState({scopeToken:2,query:'organizationId=org_a&brandId=brand_b'});hold.release();await assert.rejects(pending,{code:'REQUEST_CONTEXT_CHANGED'});assert.equal(f.cleared,0);assert.ok(f.calls[0].url.endsWith('brandId=brand_a'));
 await assert.rejects(f.dispatch(),{message:'Expired session',status:401});assert.equal(f.cleared,1);
});
test('a fresh same-person sign-in invalidates pending authorization even on unscoped requests',async t=>{
 const f=await fixture(t),hold=gate(),started=gate();const pending=f.dispatch({scoped:false,authorize:async()=>{started.release();await hold.promise;return {}}});await started.promise;f.setState({sessionEpoch:2});hold.release();await assert.rejects(pending,{code:'REQUEST_CONTEXT_CHANGED'});assert.equal(f.calls.length,0);
});
test('late success is discarded; unscoped responses tolerate navigation but not session replacement',async t=>{
 const f=await fixture(t),received=gate(),hold=gate();f.setRespond(async(req,res)=>{received.release();await hold.promise;res.writeHead(200,{'Content-Type':'application/json'});res.end(JSON.stringify({saved:true}));});const pending=f.dispatch();await received.promise;f.setState({scopeToken:3});hold.release();await assert.rejects(pending,{code:'REQUEST_CONTEXT_CHANGED'});
 assert.deepEqual(await f.dispatch({scoped:false}),{saved:true});
});
