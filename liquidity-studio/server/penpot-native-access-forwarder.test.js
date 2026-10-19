import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {createPenpotNativeAccessForwarder} from './penpot-native-access-forwarder.js';
import {loadNativePairingConfiguration} from '../scripts/local-native-pairing.mjs';
const key='g'.repeat(43),studioOrigin='http://127.0.0.1:39043',admission='/api/native/penpot/access/admission';
async function fixture(t,fetchImpl){
 const handler=createPenpotNativeAccessForwarder({studioOrigin,grantKey:key,fetchImpl});
 const server=http.createServer((req,res)=>{void handler(req,res).then(handled=>{if(!handled){res.writeHead(404);res.end();}});});
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 t.after(async()=>{server.closeAllConnections();await new Promise(resolve=>server.close(resolve));});
 return 'http://127.0.0.1:'+server.address().port;
}
const options=(body='{}',extra={})=>({method:'POST',headers:{'Content-Type':'application/json','X-Studio-Native-Grant-Key':key,...extra},body});
test('only fixed authenticated authority paths forward JSON without native cookies or authorization',async t=>{
 const calls=[];const origin=await fixture(t,async(url,init)=>{calls.push({url,init});return Response.json({allowed:false});});
 assert.equal((await fetch(origin+admission,options('{}',{'X-Studio-Native-Grant-Key':'x'.repeat(43)}))).status,403);
 assert.equal((await fetch(origin+admission+'?other=1',options())).status,404);
 assert.equal((await fetch(origin+'/api/native/penpot/access/other',options())).status,404);
 assert.equal((await fetch(origin+admission,{headers:{'X-Studio-Native-Grant-Key':key}})).status,405);
 assert.equal(calls.length,0);
 for(const route of [admission,'/api/native/penpot/access/reconciliation']){
  const response=await fetch(origin+route,options('{"nativeProfileId":"typed-by-controller"}',{Cookie:'private-native-session',Authorization:'Bearer private-token'}));
  assert.equal(response.status,200);assert.deepEqual(await response.json(),{allowed:false});
  const {url,init}=calls.at(-1);assert.equal(url,studioOrigin+route);assert.equal(init.redirect,'error');
  assert.deepEqual(Object.keys(init.headers).sort(),['Accept','Content-Type','X-Studio-Native-Grant-Key'].sort());
  assert.equal(init.headers['X-Studio-Native-Grant-Key'],key);assert.equal(init.body.toString(),'{"nativeProfileId":"typed-by-controller"}');
 }
});
test('malformed or oversized input rejects before a Studio request',async t=>{
 let calls=0;const origin=await fixture(t,async()=>{calls++;return Response.json({allowed:true});});
 for(const body of ['{','null','[]'])assert.equal((await fetch(origin+admission,options(body))).status,400);
 assert.equal((await fetch(origin+admission,options('x'.repeat(4097)))).status,413);
 assert.equal(calls,0);
});
test('redirect, oversized response and stalled body fail closed with cancellation',async t=>{
 let mode='redirect',cancelled=false;
 const origin=await fixture(t,async()=>mode==='redirect'?new Response('{}',{status:302,headers:{Location:'http://foreign.invalid/'}}):mode==='large'?new Response('x'.repeat(4097)):new Response(new ReadableStream({cancel(){cancelled=true;}})));
 assert.equal((await fetch(origin+admission,options())).status,502);
 mode='large';assert.equal((await fetch(origin+admission,options())).status,502);
 mode='stalled';assert.equal((await fetch(origin+admission,options())).status,504);
 assert.equal(cancelled,true);
});
test('six-field pairing configurations remain valid and an optional distinct grant key is explicit',t=>{
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'native-grant-config-'));t.after(()=>fs.rmSync(dir,{recursive:true,force:true}));
 const filename=path.join(dir,'config.json');
 const config={schemaVersion:1,nativeInstanceId:'11111111-1111-4111-8111-111111111111',nativeOrigin:'http://localhost:39008',studioOrigin,pairingKey:'p'.repeat(43),gatewayKey:'a'.repeat(64)};
 const write=value=>fs.writeFileSync(filename,JSON.stringify(value),{mode:0o600});
 write(config);assert.equal(loadNativePairingConfiguration(filename).grantKey,undefined);
 write({...config,studioOrigin:'http://localhost:39052'});assert.equal(loadNativePairingConfiguration(filename).studioOrigin,'http://localhost:39052');
 write({...config,nativeOrigin:'http://127.0.0.1:39008'});assert.equal(loadNativePairingConfiguration(filename).nativeOrigin,'http://127.0.0.1:39008');
 for(const nativeOrigin of ['http://127.0.0.1:39046','http://127.0.0.2:39008','http://localhost:39008/','http://remote.example:39008']){write({...config,nativeOrigin});assert.throws(()=>loadNativePairingConfiguration(filename),/Exact native pairing/);}
 write({...config,grantKey:key});assert.equal(loadNativePairingConfiguration(filename).grantKey,key);
 for(const grantKey of [config.pairingKey,'short',null]){write({...config,grantKey});assert.throws(()=>loadNativePairingConfiguration(filename),/Exact native pairing/);}
 assert.throws(()=>createPenpotNativeAccessForwarder({studioOrigin:'http://foreign.invalid',grantKey:key}));
});

import {EventEmitter} from 'node:events';
test('managed callback deadline permits a valid 1486ms reply and still cancels beyond2500ms',async t=>{
 t.mock.timers.enable({apis:['setTimeout']});
 async function request(stalled=false){
  const req=new EventEmitter();Object.assign(req,{url:admission,method:'POST',headers:{'content-type':'application/json','x-studio-native-grant-key':key},readableEnded:false,pause(){}});
  let complete,started;const ready=new Promise(r=>started=r);let status,bytes,aborted=false;
  const res={headersSent:false,destroyed:false,writeHead(s){status=s;this.headersSent=true;},end(b){bytes=b;}};
  const handler=createPenpotNativeAccessForwarder({studioOrigin,grantKey:key,authorityTimeoutMs:2500,fetchImpl:async(_url,init)=>{init.signal.addEventListener('abort',()=>{aborted=true;});started();return new Promise(r=>complete=r);}});
  const done=handler(req,res);req.emit('data',Buffer.from('{}'));req.readableEnded=true;req.emit('end');await ready;
  t.mock.timers.tick(1486);await Promise.resolve();assert.equal(status,undefined);
  if(stalled)t.mock.timers.tick(1015);else complete(Response.json({allowed:true}));
  await done;assert.equal(status,stalled?504:200);assert.equal(aborted,true);if(!stalled)assert.deepEqual(JSON.parse(bytes),{allowed:true});
 }
 await request();await request(true);
 for(const authorityTimeoutMs of [0,799,2501,Infinity,'2500'])assert.throws(()=>createPenpotNativeAccessForwarder({studioOrigin,grantKey:key,authorityTimeoutMs}));
});
