import test from 'node:test';
import assert from 'node:assert/strict';
import {clipInterval,coverCrop,recordingMime} from '../src/lib/manual-clip-render.js';
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
