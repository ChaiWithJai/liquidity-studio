import {createEvidenceClientAuth,EVIDENCE_ORIGIN} from './defiant-evidence-client-auth.js';
import {McpServer} from '@modelcontextprotocol/server';
import {registerDefiantEvidenceTools} from './defiant-evidence-mcp.js';
const origin=EVIDENCE_ORIGIN;
const fail=(status=503)=>Object.assign(new Error('Private evidence unavailable'),{status});
const resources=new Set(['source-evidence','selection-reconciliation','retained-sources','store-coverage','coverage','manifest','earnings','receipt','selections','selection','selection-receipts','catalog-identity-review','identity-group','comparisons','explain-change','audience-readiness','audience-definition','comparison-examples','audience-cells','june-review']);
const fields=new Set(['revision','month','currency','receiptId','selectionId','identityGroupId','comparisonId','audienceId','groupId','referenceIndex','offset','limit','query','fromMonth','toMonth','storeCoverageId','sourceId','format','kind','sourceHash','mode','sessionId','idempotencyKey','periodPresence']);
/** Scoped local grant only: no Firebase bearer or ADC fallback. */
export async function createPrivateEvidenceBridge({configurationPath,fetchImpl=fetch,now=()=>Date.now()}={}){
 const authClient=await createEvidenceClientAuth({configurationPath,fetchImpl,now});
 const {config,current}=authClient,credential=options=>authClient.credential(options),actor=Object.freeze({kind:'http-bridge-interface'});
 const service={read:async(user,input)=>{
  if(user!==actor||!input||!resources.has(input.resource))throw fail(403);
  const url=new URL(`/api/studio/defiant-evidence/${config.organizationId}/${input.resource}`,origin);
  for(const [key,value] of Object.entries(input)){
   if(key==='resource')continue;
   if(!fields.has(key)||typeof value!=='string'&&typeof value!=='number'||String(value).length>(key==='query'?200:128)||(key!=='query'&&!String(value).length))throw fail(400);
   if(['offset','limit','referenceIndex'].includes(key)&&(!Number.isSafeInteger(value)||value<0||value>999999))throw fail(400);
   url.searchParams.set(key,String(value));
  }
  if(input.revision!==undefined&&!/^[a-f0-9]{64}$/.test(input.revision))throw fail(400);
  const semantic=input.resource==='retained-sources'&&input.mode==='semantic';
  if(semantic)url.search='';
  await current();const auth=await credential();
  const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),30000);let reader;
  try{
   const response=await fetchImpl(url,{method:semantic?'POST':'GET',...(semantic?{body:JSON.stringify(Object.fromEntries(Object.entries(input).filter(([key])=>key!=='resource')))}:{}),redirect:'error',credentials:'omit',cache:'no-store',headers:{Accept:'application/json',...(semantic?{'Content-Type':'application/json'}:{}),Authorization:`Bearer ${auth.accessToken}`},signal:controller.signal});
   if(!response.ok)throw fail([400,401,403,404,409,503].includes(response.status)?response.status:503);
   if(!/^application\/json(?:;|$)/i.test(response.headers.get('content-type')||''))throw fail();
   reader=response.body?.getReader();if(!reader)throw fail();
   const buffer=Buffer.alloc(4*1024*1024);let size=0,chunks=0;
   for(;;){const {done,value}=await reader.read();if(done)break;if(!(value instanceof Uint8Array)||++chunks>65536||value.byteLength>buffer.length-size)throw fail();buffer.set(value,size);size+=value.byteLength;}
   const result=JSON.parse(new TextDecoder('utf-8',{fatal:true}).decode(buffer.subarray(0,size)));
   if(result?.scope?.organizationId!==config.organizationId||typeof result.revision!=='string'||!/^[a-f0-9]{64}$/.test(result.revision)||input.revision&&result.revision!==input.revision)throw fail(409);
   await current();await credential({renew:false});return result;
  }catch(error){throw fail([400,401,403,404,409,503].includes(error?.status)?error.status:503);}
  finally{clearTimeout(timer);controller.abort();await reader?.cancel().catch(()=>{});}
 }};
 return {organizationId:config.organizationId,createServer(){const server=new McpServer({name:'defiant-private-evidence',version:'1.0.0'});registerDefiantEvidenceTools(server,{resolveEvidence:async({organizationId})=>{if(organizationId!==config.organizationId)throw fail(403);return {organizationId,actor,service};}});return server;},service,actor};
}
