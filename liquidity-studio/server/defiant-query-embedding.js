import {SEMANTIC_MODEL,sha256} from './defiant-semantic-index.js';
const fail=()=>Object.assign(new Error('Query embedding unavailable; this reserved attempt will not retry'),{status:503});
const ENDPOINT='https://us-east4-aiplatform.googleapis.com/v1/projects/liquidity-studio-pilot-261017/locations/us-east4/publishers/google/models/gemini-embedding-001:predict';
/** Reuses the host's existing gateway.vertexAccessToken. Never accepts caller endpoints/credentials. */
export function createQueryEmbedding({gateway,fetchImpl=globalThis.fetch,now=()=>Date.now()}={}){
 if(typeof gateway?.vertexAccessToken!=='function'||typeof fetchImpl!=='function')throw TypeError('Runtime Vertex credential provider required');
 return async(query,{signal}={})=>{
  if(typeof query!=='string'||!query.trim()||Buffer.byteLength(query)>1536||/[\u0000-\u001f\u007f]/.test(query))throw Object.assign(new Error('Invalid metadata query'),{status:400});
  const controller=new AbortController(),abort=()=>controller.abort(),timer=setTimeout(abort,15000);signal?.addEventListener('abort',abort,{once:true});if(signal?.aborted)abort();
  let reader,rejectAbort;const interrupted=new Promise((_,reject)=>{rejectAbort=()=>reject(fail());});controller.signal.addEventListener('abort',rejectAbort,{once:true});
  const bounded=operation=>{if(controller.signal.aborted)throw fail();return Promise.race([operation(),interrupted]);};
  const started=now();
  try{
   const token=await bounded(()=>gateway.vertexAccessToken(controller.signal));if(controller.signal.aborted||typeof token!=='string'||!token||/[\r\n]/.test(token))throw fail();
   const response=await bounded(()=>fetchImpl(ENDPOINT,{method:'POST',redirect:'error',signal:controller.signal,headers:{Authorization:`Bearer ${token}`,'Content-Type':'application/json','X-Goog-User-Project':'liquidity-studio-pilot-261017'},body:JSON.stringify({instances:[{content:query,task_type:'RETRIEVAL_QUERY'}],parameters:{autoTruncate:false,outputDimensionality:768}})}));
   if(!response.ok||!response.body?.getReader)throw fail();reader=response.body.getReader();let size=0,chunks=0;const buffer=new Uint8Array(65536);
   for(;;){const part=await bounded(()=>reader.read());if(controller.signal.aborted||now()-started>15000)throw fail();if(part.done)break;if(++chunks>65536||!(part.value instanceof Uint8Array)||part.value.length>buffer.length-size)throw fail();buffer.set(part.value,size);size+=part.value.length;}
   const parsed=JSON.parse(new TextDecoder('utf-8',{fatal:true}).decode(buffer.subarray(0,size))),prediction=parsed?.predictions;
   if(!Array.isArray(prediction)||prediction.length!==1)throw fail();const e=prediction[0]?.embeddings,s=e?.statistics,v=e?.values;
   if(s?.truncated!==false||!Number.isInteger(s.token_count)||s.token_count<1||s.token_count>2048||!Array.isArray(v)||v.length!==768||v.some(n=>typeof n!=='number'||!Number.isFinite(n)))throw fail();
   const norm=Math.sqrt(v.reduce((sum,n)=>sum+n*n,0));if(!Number.isFinite(norm)||norm<=0)throw fail();
   return {...SEMANTIC_MODEL,task:'RETRIEVAL_QUERY',inputSha256:sha256(query),vector:v.map(n=>n/norm),tokenCount:s.token_count,truncated:false,receivedAt:new Date(now()).toISOString()};
  }catch{throw fail();}finally{clearTimeout(timer);signal?.removeEventListener('abort',abort);controller.signal.removeEventListener('abort',rejectAbort);try{void reader?.cancel().catch(()=>{});}catch{}}
 };
}
