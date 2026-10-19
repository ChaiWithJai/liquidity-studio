import test from 'node:test';
import assert from 'node:assert/strict';
import {clipInterval,coverCrop,recordingMime,renderManualClip,keepClipValues} from '../src/lib/manual-clip-render.js';
import {uploadClipMedia,mediaHash} from '../src/lib/clip-media-client.js';
import {readStrategyLocation,writeStrategyLocation} from '../src/lib/defiant-location.js';
import {scopedRequest} from '../src/lib/scoped-request.js';

test('manual source interval and portrait crop preserve the selected real source bounds',()=>{
 assert.deepEqual(clipInterval(7,22,90),{start:7,end:22,duration:15});
 for(const args of [[-1,2,90],[5,5,90],[0,31,90],[20,25,22]])assert.throws(()=>clipInterval(...args));
 const crop=coverCrop(1920,1080,.5,.5);assert.equal(crop.width,607.5);assert.equal(crop.height,1080);assert.equal(crop.x,656.25);
 assert.equal(coverCrop(1920,1080,0,.5).x,0);assert.equal(coverCrop(1920,1080,1,.5).x,1312.5);
 assert.deepEqual(coverCrop(1080,1920),{x:0,y:0,width:1080,height:1920});assert.throws(()=>coverCrop(0,1080));
 assert.equal(recordingMime(),null);
});
test('chunked supplied-media upload reconstructs exact bytes and retains source/recording intent',async()=>{
 const blob=new Blob([new Uint8Array(600000).map((_,i)=>i%251)]),chunks=[];let begin;
 const result=await uploadClipMedia(async(path,options)=>{
  if(path==='/inbox/clips/uploads'){begin=JSON.parse(options.body);return {uploadId:'owned-upload',chunkBytes:262144,chunkCount:3};}
  if(options.method==='PUT'){assert.equal(options.headers['Content-Type'],'application/octet-stream');chunks.push(options.body);return {received:true};}
  assert.equal(path,'/inbox/clips/uploads/owned-upload/complete');if(chunks.length<3)throw Object.assign(Error('Incomplete'),{status:409});return {asset:{id:'saved-source'}};
 },blob,{kind:'source',sourceId:'yt:owned-source',recordingId:'owned-recording',name:'owned.mp4',contentType:'video/mp4',rightsDeclaration:'Owned engineering fixture'},'fixed-intent');
 assert.deepEqual(result,{asset:{id:'saved-source'}});assert.equal(begin.sha256,await mediaHash(blob));assert.equal(begin.idempotencyKey,'fixed-intent');assert.equal(begin.sourceId,'yt:owned-source');assert.equal(begin.recordingId,'owned-recording');assert.equal(await mediaHash(new Blob(chunks)),begin.sha256);
});
test('saved clip selection survives a copied source inbox URL without adding authority',()=>{
 const params=new URLSearchParams();writeStrategyLocation(params,{view:'inbox',sourceId:'yt:source',clipId:'clip:actual-output'});
 assert.equal(readStrategyLocation(params).clipId,'clip:actual-output');assert.equal(readStrategyLocation(params).sourceId,'yt:source');
 params.set('clip','https://other.example/media');assert.equal(readStrategyLocation(params).clipId,undefined);
});
test('authenticated binary playback uses current scoped request and never bypasses a changed session',async()=>{
 let epoch=1;const args={path:'/private-media',options:{responseType:'blob'},scoped:false,context:{sessionEpoch:1},getContext:()=>({sessionEpoch:epoch}),authorize:async()=>({Authorization:'Bearer fixture'}),onUnauthorized:()=>{throw Error('unexpected');}};
 const blob=await scopedRequest({...args,fetchImpl:async(path,options)=>{assert.equal(options.responseType,undefined);assert.equal(options.headers.Authorization,'Bearer fixture');return new Response(new Uint8Array([1,2,3]),{headers:{'Content-Type':'video/mp4'}});}});assert.deepEqual([...new Uint8Array(await blob.arrayBuffer())],[1,2,3]);
 await assert.rejects(scopedRequest({...args,fetchImpl:async()=>{epoch=2;return new Response('private bytes');}}),{code:'REQUEST_CONTEXT_CHANGED'});
});

test('lost upload completion reopens accepted bytes without resending completed chunks',async()=>{
 let chunks=0;const accepted={asset:{id:'already-saved'}},blob=new Blob(['owned bytes']);
 const result=await uploadClipMedia(async(path,options)=>{if(path==='/inbox/clips/uploads')return {uploadId:'same-request',chunkBytes:262144,chunkCount:1};if(options.method==='PUT'){chunks++;throw Error('Completed chunks must not be resent');}return accepted;},blob,{kind:'source'},'same-key');
 assert.deepEqual(result,accepted);assert.equal(chunks,0);
});

test('keeping working values on a newer segment revision requires a fresh save, even when old values were clean',()=>{
 const working={sourceId:'source',recordingId:'recording',sourceAssetId:'video',startSeconds:0,endSeconds:5,cropX:.5,cropY:.5,caption:'Original caption',videoGain:1,audioGain:.7};
 const newer={...working,id:'proposal',revision:2,caption:'Another manager caption',updatedAt:'2026-10-19'};
 const rebase=keepClipValues(working,newer);
 assert.equal(rebase.revision,2);assert.equal(rebase.requiresSave,true);assert.deepEqual(rebase.working,working);
 assert.notEqual(rebase.base,JSON.stringify(working));assert.equal(JSON.parse(rebase.base).caption,'Another manager caption');
 assert.equal(keepClipValues(working,{...working,revision:3}).requiresSave,true,'Explicit keep still requires acknowledgement when values happen to match');
});

test('cancel during fonts or audio-context startup never begins recording or playback',async()=>{
 const deferred=()=>{let resolve;const promise=new Promise(r=>resolve=r);return {promise,resolve};};
 const descriptors=new Map(['document','MediaRecorder','AudioContext','cancelAnimationFrame'].map(key=>[key,Object.getOwnPropertyDescriptor(globalThis,key)]));
 try{
  globalThis.cancelAnimationFrame=()=>{};
  for(const stage of ['fonts','context']){
   const gate=deferred(),entered=deferred(),controller=new AbortController(),calls={start:0,play:0,closed:0,stopped:0};
   class Media extends EventTarget{duration=2;videoWidth=1920;videoHeight=1080;currentTime=0;load(){queueMicrotask(()=>this.dispatchEvent(new Event('loadeddata')));}pause(){}removeAttribute(){}play(){calls.play++;return Promise.resolve();}}
   const graphics={fillRect(){},drawImage(){},measureText(){return {width:0};},fillText(){}};
   globalThis.document={createElement:kind=>kind==='canvas'?{getContext:()=>graphics,captureStream:()=>({addTrack(){},getTracks:()=>[{stop(){calls.stopped++;}}]})}:new Media(),fonts:{get ready(){if(stage==='fonts'){entered.resolve();return gate.promise;}return Promise.resolve();}}};
   globalThis.MediaRecorder=class{static isTypeSupported(){return true;}start(){calls.start++;}};
   globalThis.AudioContext=class{createMediaStreamDestination(){return {stream:{getAudioTracks:()=>[]}};}createMediaElementSource(){return {connect(){}};}createGain(){return {gain:{value:0},connect(){}};}resume(){entered.resolve();return gate.promise;}close(){calls.closed++;return Promise.resolve();}};
   const rendering=renderManualClip({videoBlob:new Blob(['owned fixture']),proposal:{startSeconds:0,endSeconds:1,cropX:.5,cropY:.5,caption:'',videoGain:1,audioGain:0},signal:controller.signal});
   await entered.promise;controller.abort();gate.resolve();await assert.rejects(rendering,/Rendering cancelled/);
   assert.equal(calls.start,0,stage);assert.equal(calls.play,0,stage);assert.equal(calls.closed,stage==='context'?1:0,stage);
  }
 }finally{for(const [key,descriptor]of descriptors){if(descriptor)Object.defineProperty(globalThis,key,descriptor);else delete globalThis[key];}}
});
