import {open,lstat,rename,unlink,link} from 'node:fs/promises';
import {constants} from 'node:fs';
import {dirname,isAbsolute,join} from 'node:path';
import {createHash,randomBytes} from 'node:crypto';
export const EVIDENCE_ORIGIN='https://studio.chaiwithjai.com';
const fail=(status=503)=>Object.assign(new Error('Private evidence authorization unavailable'),{status});
const exact=(v,keys)=>v&&typeof v==='object'&&!Array.isArray(v)&&Object.keys(v).sort().join(',')===[...keys].sort().join(',');
const pause=ms=>new Promise(resolve=>setTimeout(resolve,ms));
async function parent(path){
 if(typeof process.getuid!=='function'||typeof path!=='string'||!isAbsolute(path)||path.includes('\0'))throw fail();
 const p=await lstat(dirname(path));if(!p.isDirectory()||p.isSymbolicLink()||p.uid!==process.getuid()||(p.mode&0o777)!==0o700)throw fail();return `${p.dev}:${p.ino}`;
}
async function privateFile(path,max){
 let fd;
 try{
  const directory=await parent(path);fd=await open(path,constants.O_RDONLY|constants.O_NOFOLLOW|constants.O_NONBLOCK);const stat=await fd.stat();
  if(!stat.isFile()||stat.uid!==process.getuid()||(stat.mode&0o777)!==0o600||stat.size<1||stat.size>max)throw fail();
  const data=Buffer.alloc(max+1);let n=0;while(n<data.length){const {bytesRead}=await fd.read(data,n,data.length-n,null);if(!bytesRead)break;n+=bytesRead;}
  if(n!==stat.size||n>max||await parent(path)!==directory)throw fail();const bytes=data.subarray(0,n);
  return {value:JSON.parse(new TextDecoder('utf-8',{fatal:true}).decode(bytes)),stamp:`${directory}:${stat.dev}:${stat.ino}:${createHash('sha256').update(bytes).digest('hex')}`};
 }catch{throw fail();}finally{await fd?.close();}
}
function validate(v,org,now,response=false){
 const keys=['organizationId','accessToken','renewalToken','accessExpiresAt','expiresAt'];if(!response)keys.push('version');
 if(!exact(v,keys)||!response&&v.version!==2||v.organizationId!==org||!Number.isSafeInteger(v.expiresAt)||v.expiresAt<=now||v.expiresAt>now+28860000||!Number.isSafeInteger(v.accessExpiresAt)||v.accessExpiresAt>v.expiresAt||v.accessExpiresAt>now+360000||v.accessExpiresAt<=0)throw fail(401);
 const access=/^ea\.([a-f0-9]{32})\.([A-Za-z0-9_-]{43})$/.exec(v.accessToken),renewal=/^er\.([a-f0-9]{32})\.([A-Za-z0-9_-]{43})$/.exec(v.renewalToken);
 if(!access||!renewal||access[1]!==renewal[1]||response&&v.accessExpiresAt<=now)throw fail(401);
 return {version:2,organizationId:v.organizationId,accessToken:v.accessToken,renewalToken:v.renewalToken,accessExpiresAt:v.accessExpiresAt,expiresAt:v.expiresAt};
}
/** Only finite setup/renew endpoints; no general auth, model, GCS or arbitrary URL. */
async function post(operation,body,fetchImpl,timeout=30000){
 if(!['begin','exchange','renew'].includes(operation))throw fail();const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),Math.max(1,Math.min(timeout,30000)));let reader;
 try{
  const response=await fetchImpl(`${EVIDENCE_ORIGIN}/api/studio/local-evidence/${operation}`,{method:'POST',redirect:'error',cache:'no-store',credentials:'omit',headers:{'Content-Type':'application/json',Accept:'application/json'},body:JSON.stringify(body),signal:controller.signal});
  if(!response.ok)throw fail(response.status===403?403:503);
  if(!/^application\/json(?:;|$)/i.test(response.headers.get('content-type')||''))throw fail();reader=response.body?.getReader();if(!reader)throw fail();
  const bytes=Buffer.alloc(65536);let size=0,chunks=0;for(;;){const {done,value}=await reader.read();if(done)break;if(!(value instanceof Uint8Array)||++chunks>65536||value.byteLength>bytes.length-size)throw fail();bytes.set(value,size);size+=value.byteLength;}
  return JSON.parse(new TextDecoder('utf-8',{fatal:true}).decode(bytes.subarray(0,size)));
 }catch(error){throw fail(error?.status===403?403:503);}finally{clearTimeout(timer);controller.abort();await reader?.cancel().catch(()=>{});}
}
export async function createEvidenceClientAuth({configurationPath,fetchImpl=fetch,now=()=>Date.now(),sleep=pause}={}){
 const initial=await privateFile(configurationPath,16384),c=initial.value;
 if(!exact(c,['version','organizationId','origin','credentialFile'])||c.version!==1||c.origin!==EVIDENCE_ORIGIN||typeof c.organizationId!=='string'||!/^[A-Za-z0-9_-]{1,128}$/.test(c.organizationId)||c.organizationId==='defiant_evidence_poc'||typeof c.credentialFile!=='string'||!isAbsolute(c.credentialFile)||c.credentialFile===configurationPath)throw fail();
 const config=Object.freeze({...c});const directory=await parent(config.credentialFile);let pending;
 const current=async()=>{if((await privateFile(configurationPath,16384)).stamp!==initial.stamp||await parent(config.credentialFile)!==directory)throw fail();};
 const read=async()=>{await current();const file=await privateFile(config.credentialFile,20480);return {...file,value:validate(file.value,config.organizationId,now())};};
 async function write(value,previous){
  await current();const temp=join(dirname(config.credentialFile),`.evidence-${randomBytes(16).toString('hex')}.tmp`);let fd;
  try{
   fd=await open(temp,constants.O_WRONLY|constants.O_CREAT|constants.O_EXCL|constants.O_NOFOLLOW,0o600);await fd.writeFile(JSON.stringify(value)+'\n');await fd.sync();await fd.close();fd=null;
   await current();if(previous){if((await read()).stamp!==previous)throw fail();await rename(temp,config.credentialFile);}else{await link(temp,config.credentialFile);await unlink(temp);}
  }finally{await fd?.close();await unlink(temp).catch(()=>{});}
 }
 async function rotate(){
  let before=await read();if(before.value.accessExpiresAt>now()+30000)return before.value;
  if(before.value.expiresAt<=now()+30000)throw fail(401);
  const lockPath=config.credentialFile+'.lock';let lock;
  try{lock=await open(lockPath,constants.O_WRONLY|constants.O_CREAT|constants.O_EXCL|constants.O_NOFOLLOW,0o600);}catch(error){
   if(error.code!=='EEXIST')throw fail();const existing=await lstat(lockPath);if(!existing.isFile()||existing.isSymbolicLink()||existing.uid!==process.getuid()||(existing.mode&0o777)!==0o600)throw fail();
   for(let n=0;n<20;n++){await sleep(100);const latest=await read();if(latest.stamp!==before.stamp&&latest.value.accessExpiresAt>now()+30000)return latest.value;}throw fail();
  }
  let attempted=false,committed=false;
  try{
   await current();before=await read();if(before.value.accessExpiresAt>now()+30000)return before.value;
   attempted=true;const next=validate(await post('renew',{organizationId:config.organizationId,renewalToken:before.value.renewalToken},fetchImpl),config.organizationId,now(),true);
   if(next.expiresAt!==before.value.expiresAt||next.accessToken.split('.')[1]!==before.value.accessToken.split('.')[1]||next.accessToken===before.value.accessToken||next.renewalToken===before.value.renewalToken)throw fail();
   await write(next,before.stamp);committed=true;return next;
  }finally{await lock.close();if(!attempted||committed)await unlink(lockPath);}
 }
 return {config,current,async credential({renew=true}={}){
  const entry=await read();if(entry.value.accessExpiresAt>now()+30000||!renew){if(entry.value.accessExpiresAt<=now())throw fail(401);return entry.value;}
  if(!pending)pending=rotate().finally(()=>{pending=undefined;});return pending;
 },async pair({report=()=>{}}={}){
  await current();try{await lstat(config.credentialFile);throw fail();}catch(error){if(error.code!=='ENOENT')throw fail();}
  const lockPath=config.credentialFile+'.lock';let lock;try{lock=await open(lockPath,constants.O_WRONLY|constants.O_CREAT|constants.O_EXCL|constants.O_NOFOLLOW,0o600);}catch{throw fail();}
  let uncertain=false,committed=false;
  try{
  const verifier=randomBytes(32).toString('base64url'),deadline=now()+300000,clientName='Studio local evidence client';
  const begun=await post('begin',{organizationId:config.organizationId,verifierHash:createHash('sha256').update(verifier).digest('hex'),clientName},fetchImpl);
  if(!exact(begun,['pairingId','expiresAt','organizationId','clientName'])||begun.organizationId!==config.organizationId||begun.clientName!==clientName||typeof begun.pairingId!=='string'||!/^[a-f0-9]{32}$/.test(begun.pairingId)||!Number.isSafeInteger(begun.expiresAt)||begun.expiresAt<=now()||begun.expiresAt>deadline+60000)throw fail();
  report({pairingId:begun.pairingId,url:`${EVIDENCE_ORIGIN}/?org=${encodeURIComponent(config.organizationId)}&tab=strategy`,expiresAt:begun.expiresAt});
  for(let n=0;n<60&&now()<Math.min(deadline,begun.expiresAt);n++){
   await current();let value;
   try{uncertain=true;value=await post('exchange',{pairingId:begun.pairingId,verifier},fetchImpl,Math.min(deadline,begun.expiresAt)-now());}catch(error){if(error.status!==403)throw error;uncertain=false;await sleep(Math.min(5000,Math.max(0,Math.min(deadline,begun.expiresAt)-now())));continue;}
   const credentials=validate(value,config.organizationId,now(),true);await write(credentials);committed=true;return {organizationId:config.organizationId,expiresAt:credentials.expiresAt};
  }throw fail(401);
  }finally{await lock.close();if(!uncertain||committed)await unlink(lockPath);}
 }};
}
