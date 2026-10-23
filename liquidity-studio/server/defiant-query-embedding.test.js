import test from 'node:test';
import assert from 'node:assert/strict';
import {createQueryEmbedding} from './defiant-query-embedding.js';
function body(overrides={}){return {predictions:[{embeddings:{values:[2,...Array(767).fill(0)],statistics:{token_count:7,truncated:false,...overrides}}}]};}
test('fixed regional query adapter sends one bounded explicit query with existing runtime credential',async()=>{
 let calls=0;const embed=createQueryEmbedding({gateway:{vertexAccessToken:async()=> 'invented-fixture-token'},fetchImpl:async(url,options)=>{calls++;assert.equal(url,'https://us-east4-aiplatform.googleapis.com/v1/projects/liquidity-studio-pilot-261017/locations/us-east4/publishers/google/models/gemini-embedding-001:predict');assert.equal(options.redirect,'error');assert.deepEqual(JSON.parse(options.body),{instances:[{content:'Authored monthly report',task_type:'RETRIEVAL_QUERY'}],parameters:{autoTruncate:false,outputDimensionality:768}});return new Response(JSON.stringify(body()));}});
 const result=await embed('Authored monthly report');assert.equal(calls,1);assert.equal(result.vector[0],1);assert.equal(result.vector.length,768);assert.equal(result.tokenCount,7);assert.equal(result.truncated,false);
});
test('truncation and oversized body fail without retries or provider-error leakage',async()=>{
 for(const response of [()=>new Response(JSON.stringify(body({truncated:true}))),()=>new Response('x'.repeat(65537)),()=>new Response('private upstream text',{status:500})]){
  let calls=0;const embed=createQueryEmbedding({gateway:{vertexAccessToken:async()=> 'fixture'},fetchImpl:async()=>{calls++;return response();}});
  await assert.rejects(embed('Authored query'),error=>error.status===503&&!error.message.includes('private upstream'));assert.equal(calls,1);
 }
});
test('pre-aborted signal and malformed query do not contact hosted endpoint',async()=>{
 let calls=0,tokenCalls=0;const embed=createQueryEmbedding({gateway:{vertexAccessToken:async()=>{tokenCalls++;return 'fixture';}},fetchImpl:async()=>{calls++;return new Response(JSON.stringify(body()));}}),controller=new AbortController();controller.abort();
 await assert.rejects(embed('Authored query',{signal:controller.signal}),{status:503});await assert.rejects(embed(''),{status:400});assert.equal(calls,0);assert.equal(tokenCalls,0);
});
test('an ignored credential AbortSignal cannot keep the adapter pending or invoke endpoint',async()=>{
 let calls=0,entered;const started=new Promise(r=>{entered=r;}),controller=new AbortController();
 const embed=createQueryEmbedding({gateway:{vertexAccessToken:()=>{entered();return new Promise(()=>{});}},fetchImpl:async()=>{calls++;throw Error('must not run');}});
 const pending=embed('Authored query',{signal:controller.signal});await started;controller.abort();await assert.rejects(pending,{status:503});assert.equal(calls,0);
});
test('zero chunks are capped and response reader cleanup is requested',async()=>{
 let reads=0,cancelled=false;const embed=createQueryEmbedding({gateway:{vertexAccessToken:async()=> 'fixture'},fetchImpl:async()=>({ok:true,body:{getReader:()=>({read:async()=>{reads++;return {done:false,value:new Uint8Array()};},cancel:async()=>{cancelled=true;}})}})});
 await assert.rejects(embed('Authored query'),{status:503});assert.equal(reads,65537);assert.equal(cancelled,true);
});
