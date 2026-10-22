import {open,lstat} from 'node:fs/promises';
import {constants} from 'node:fs';
import {dirname,isAbsolute} from 'node:path';
import {createHash} from 'node:crypto';
import {McpServer} from '@modelcontextprotocol/server';
import {registerDefiantEvidenceTools} from './defiant-evidence-mcp.js';
const origin='https://studio.chaiwithjai.com';
const fail=(status=503)=>Object.assign(new Error('Private evidence unavailable'),{status});
const exact=(v,keys)=>v&&typeof v==='object'&&!Array.isArray(v)&&Object.keys(v).sort().join(',')===[...keys].sort().join(',');
const resources=new Set(['store-coverage','coverage','manifest','earnings','receipt','selections','selection','selection-receipts','catalog-identity-review','identity-group','comparisons','explain-change','audience-readiness','audience-definition','comparison-examples','audience-cells','june-review']);
const fields=new Set(['revision','month','currency','receiptId','selectionId','identityGroupId','comparisonId','audienceId','groupId','referenceIndex','offset','limit','query','fromMonth','toMonth','storeCoverageId']);
async function privateFile(path,max){
 let fd;
 try{
  if(typeof process.getuid!=='function'||typeof path!=='string'||!isAbsolute(path)||path.includes('\0'))throw fail();
  const parent=await lstat(dirname(path));if(!parent.isDirectory()||parent.isSymbolicLink()||parent.uid!==process.getuid()||(parent.mode&0o777)!==0o700)throw fail();
  fd=await open(path,constants.O_RDONLY|constants.O_NOFOLLOW|constants.O_NONBLOCK);
  const stat=await fd.stat();if(!stat.isFile()||stat.uid!==process.getuid()||(stat.mode&0o777)!==0o600||stat.size<1||stat.size>max)throw fail();
  const data=Buffer.alloc(max+1);let n=0;
  while(n<data.length){const {bytesRead}=await fd.read(data,n,data.length-n,null);if(!bytesRead)break;n+=bytesRead;}
  if(n!==stat.size||n>max)throw fail();
  const bytes=data.subarray(0,n);return {value:JSON.parse(new TextDecoder('utf-8',{fatal:true}).decode(bytes)),stamp:`${parent.dev}:${parent.ino}:${stat.dev}:${stat.ino}:${createHash('sha256').update(bytes).digest('hex')}`};
 }catch{throw fail();}finally{await fd?.close();}
}
/** Only an explicitly supplied short-lived credential file; no login, refresh token or ADC. */
export async function createPrivateEvidenceBridge({configurationPath,fetchImpl=fetch,now=()=>Date.now()}={}){
 const initial=await privateFile(configurationPath,16384),c=initial.value;
 if(!exact(c,['version','organizationId','origin','credentialFile'])||c.version!==1||c.origin!==origin||typeof c.organizationId!=='string'||!/^[A-Za-z0-9_-]{1,128}$/.test(c.organizationId)||c.organizationId==='defiant_evidence_poc'||typeof c.credentialFile!=='string'||!isAbsolute(c.credentialFile)||c.credentialFile===configurationPath)throw fail();
 const config=Object.freeze({...c}),actor=Object.freeze({kind:'http-bridge-interface'});
 const current=async()=>{if((await privateFile(configurationPath,16384)).stamp!==initial.stamp)throw fail();};
 const credential=async()=>{
  const {value:v}=await privateFile(config.credentialFile,20480);
  if(!exact(v,['version','token','expiresAt'])||v.version!==1||typeof v.token!=='string'||v.token.length>16384||!/^[-A-Za-z0-9_]+\.[-A-Za-z0-9_]+\.[-A-Za-z0-9_]+$/.test(v.token)||!Number.isSafeInteger(v.expiresAt)||v.expiresAt<=now()||v.expiresAt>now()+3660000)throw fail(401);
  return v;
 };
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
  await current();const auth=await credential();
  const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),30000);let reader;
  try{
   const response=await fetchImpl(url,{method:'GET',redirect:'error',credentials:'omit',cache:'no-store',headers:{Accept:'application/json',Authorization:`Bearer ${auth.token}`},signal:controller.signal});
   if(!response.ok)throw fail([400,401,403,404,409,503].includes(response.status)?response.status:503);
   if(!/^application\/json(?:;|$)/i.test(response.headers.get('content-type')||''))throw fail();
   reader=response.body?.getReader();if(!reader)throw fail();
   const buffer=Buffer.alloc(4*1024*1024);let size=0,chunks=0;
   for(;;){const {done,value}=await reader.read();if(done)break;if(!(value instanceof Uint8Array)||++chunks>65536||value.byteLength>buffer.length-size)throw fail();buffer.set(value,size);size+=value.byteLength;}
   const result=JSON.parse(new TextDecoder('utf-8',{fatal:true}).decode(buffer.subarray(0,size)));
   if(result?.scope?.organizationId!==config.organizationId||typeof result.revision!=='string'||!/^[a-f0-9]{64}$/.test(result.revision)||input.revision&&result.revision!==input.revision)throw fail(409);
   await current();await credential();return result;
  }catch(error){throw fail([400,401,403,404,409,503].includes(error?.status)?error.status:503);}
  finally{clearTimeout(timer);controller.abort();await reader?.cancel().catch(()=>{});}
 }};
 return {organizationId:config.organizationId,createServer(){const server=new McpServer({name:'defiant-private-evidence',version:'1.0.0'});registerDefiantEvidenceTools(server,{resolveEvidence:async({organizationId})=>{if(organizationId!==config.organizationId)throw fail(403);return {organizationId,actor,service};}});return server;},service,actor};
}
