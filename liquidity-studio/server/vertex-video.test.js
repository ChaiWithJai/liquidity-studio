import test from 'node:test';
import assert from 'node:assert/strict';
import {AIGateway} from './gateway.js';
const input={sourceUrl:'https://www.youtube.com/watch?v=abcdefghijk',window:{startSeconds:120,endSeconds:180},recordings:[{id:'recording-1',title:'Proposed catalog recording'}]};
const payload={moments:[{startSeconds:125,endSeconds:145,context:'Approximate proposed context',recordingId:'recording-1',recordingFit:'Possible thematic relationship'}]};
function gateway(fetch){return new AIGateway({provider:'gcp-vertex',projectId:'fixture-project',location:'global',model:'gemini-fixture',allowSynthetic:true,accessTokenProvider:async()=> 'fixture-access-token',fetch});}
test('real Vertex video part carries canonical URL and actual absolute clipping offsets; no text URL masquerade',async()=>{
 let captured;const g=gateway(async(url,options)=>{captured={url,options,body:JSON.parse(options.body)};return Response.json({candidates:[{finishReason:'STOP',content:{parts:[{text:JSON.stringify(payload)}]}}],usageMetadata:{promptTokenCount:123,totalTokenCount:150}});});
 const result=await g.analyzeYouTubeVideo(input),part=captured.body.contents[0].parts[0];assert.equal(captured.url,'https://aiplatform.googleapis.com/v1/projects/fixture-project/locations/global/publishers/google/models/gemini-fixture:generateContent');assert.deepEqual(part,{fileData:{fileUri:input.sourceUrl,mimeType:'video/mp4'},videoMetadata:{startOffset:'120s',endOffset:'180s'}});assert.match(captured.body.contents[0].parts[1].text,/absolute seconds/);assert.equal(result.trace.inputMode,'youtube-video');assert.equal(result.trace.usage.promptTokenCount,123);assert.equal(result.moments[0].startSeconds,125);assert.ok(!JSON.stringify(result).includes('fixture-access-token'));
});
test('out-of-window timestamps and failed video provider never become synthetic proposals',async()=>{
 const invalid=gateway(async()=>Response.json({candidates:[{finishReason:'STOP',content:{parts:[{text:JSON.stringify({moments:[{...payload.moments[0],startSeconds:5,endSeconds:25}]})}]}}]}));await assert.rejects(invalid.analyzeYouTubeVideo(input),{status:502});
 const failed=gateway(async()=>new Response('unavailable',{status:503}));await assert.rejects(failed.analyzeYouTubeVideo(input),{status:502,providerOutcome:'failed'});
 const rejected=gateway(async()=>new Response('quota',{status:429}));await assert.rejects(rejected.analyzeYouTubeVideo(input),{status:429,providerOutcome:'failed'});
 const interrupted=gateway(async()=>{throw Error('transport interrupted');});await assert.rejects(interrupted.analyzeYouTubeVideo(input),{status:502,providerOutcome:'unknown'});
 let calls=0;const configured=new AIGateway({provider:'gcp-gemini',allowSynthetic:true,fetch:async()=>{calls++;}});await assert.rejects(configured.analyzeYouTubeVideo(input),{status:503});assert.equal(calls,0);
});

test('rejected Google response retains finite public diagnostics and bounded redacted private detail',async()=>{
 const bearer='private-fixture-bearer-value',key='AIza'+ 'x'.repeat(35),jwt='abcdefghijk.abcdefghijkl.abcdefghijk';
 const g=gateway(async()=>Response.json({error:{code:400,status:'INVALID_ARGUMENT',message:'YouTube input is not supported in this location. Authorization: Bearer '+bearer+' api_key='+key+' token='+jwt+' '+ 'z'.repeat(800),details:[{'@type':'type.googleapis.com/google.rpc.ErrorInfo',reason:'SENSITIVE_UNLISTED_REASON',metadata:{credential:bearer}}]}},{status:400}));
 await assert.rejects(g.analyzeYouTubeVideo(input),error=>{
  assert.equal(error.providerOutcome,'failed');assert.equal(error.trace.errorCode,'provider-rejected');assert.equal(error.trace.providerHttpStatus,400);assert.equal(error.trace.googleErrorCode,400);assert.equal(error.trace.googleErrorStatus,'INVALID_ARGUMENT');assert.equal(error.trace.googleErrorReason,'OTHER');assert.equal(error.trace.providerFailureCategory,'youtube-region-unsupported');
  assert.ok(!JSON.stringify(error.trace).includes('YouTube input is not supported'));const message=error.privateDiagnostics.googleErrorMessage;assert.match(message,/YouTube input is not supported in this location/);assert.ok(message.length<=500);for(const secret of [bearer,key,jwt,'SENSITIVE_UNLISTED_REASON'])assert.ok(!JSON.stringify(error).includes(secret));return true;
 });
 const oversized=gateway(async()=>new Response('x'.repeat(17000),{status:400}));await assert.rejects(oversized.analyzeYouTubeVideo(input),error=>{assert.equal(error.trace.providerHttpStatus,400);assert.deepEqual(error.privateDiagnostics,{});assert.equal(error.providerOutcome,'failed');return true;});
});
