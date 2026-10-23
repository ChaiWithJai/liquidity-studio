import {configuredHistoricalJevProvider} from './defiant-jev-historical-runtime.js';
import {constants} from 'node:fs';
import {open} from 'node:fs/promises';
import {isAbsolute} from 'node:path';
import {createHash} from 'node:crypto';
import {createPinnedEarningsCasePack} from './defiant-jev-case-pack.js';
import {createDurableClaimEvaluations} from './defiant-jev-durable.js';
import {createJevDecisionAdapter,jevEvaluationConfigurationSha256} from './defiant-jev-evaluation.js';
const PROJECT='liquidity-studio-pilot-261017',BUCKET='liquidity-studio-pilot-261017-liquidity-assets';
const invalid=()=>new Error('Invalid private evaluation configuration');
const exact=(v,keys)=>v&&typeof v==='object'&&!Array.isArray(v)&&Object.keys(v).length===keys.length&&keys.every(k=>Object.hasOwn(v,k));
const id=v=>typeof v==='string'&&/^[A-Za-z0-9_-]{1,128}(?![\s\S])/.test(v);
const hash=v=>typeof v==='string'&&/^[a-f0-9]{64}(?![\s\S])/.test(v);
const LIMITS=Object.freeze({timeoutMs:15000,maxRequests:1,maxInputBytes:16384,maxResponseBytes:65536});
export function validateJevRuntimeConfiguration(value){
 if(!exact(value,['schemaVersion','organizationId','projectId','bucket','accountExperimentId','casePack'])||value.schemaVersion!==1||!id(value.organizationId)||value.organizationId==='defiant_evidence_poc'||value.projectId!==PROJECT||value.bucket!==BUCKET||!id(value.accountExperimentId))throw invalid();
 const p=value.casePack;
 if(!exact(p,['key','generation','bytes','sha256'])||typeof p.key!=='string'||p.key.length>1000||!p.key.startsWith('defiant-private/derived/')||p.key.split('/').some(x=>!x||x==='.'||x==='..')||/[\x00-\x20\x7f\\?#%]/.test(p.key)||typeof p.generation!=='string'||!/^[1-9]\d{0,29}(?![\s\S])/.test(p.generation)||!Number.isInteger(p.bytes)||p.bytes<1||p.bytes>262144||!hash(p.sha256))throw invalid();
 return Object.freeze({...value,casePack:Object.freeze({...p})});
}
/** Existing mounted Secret Manager file may be a symlink. Read the opened regular inode with a strict bound. */
export async function loadJevManagedCredential(path){
 if(typeof path!=='string'||!isAbsolute(path)||path.includes('\0'))throw invalid();let file;
 try{file=await open(path,constants.O_RDONLY|constants.O_NONBLOCK);const st=await file.stat();if(!st.isFile()||st.size<1||st.size>65536)throw invalid();const bytes=Buffer.alloc(65537);let used=0;
  while(used<bytes.length){const r=await file.read(bytes,used,bytes.length-used,null);if(!r.bytesRead)break;used+=r.bytesRead;}
  if(used!==st.size||used>65536)throw invalid();const value=JSON.parse(new TextDecoder('utf-8',{fatal:true}).decode(bytes.subarray(0,used)));
  if(!value||typeof value!=='object'||Array.isArray(value))throw invalid();const key=value.jevGatewayApiKey;
  if(key===undefined)return null;if(typeof key!=='string'||!key||key.length>8192||/[\s\x00-\x1f\x7f]/.test(key))throw invalid();return key;
 }catch{throw invalid();}finally{await file?.close();}
}
async function readCasePack(bucket,pin){
 const stream=bucket.file(pin.key,{generation:pin.generation}).createReadStream({validation:'crc32c',decompress:false});const timer=setTimeout(()=>stream.destroy(invalid()),15000);
 try{const bytes=Buffer.alloc(pin.bytes),digest=createHash('sha256');let used=0,chunks=0;
  for await(const chunk of stream){if(!(chunk instanceof Uint8Array)||++chunks>65536||chunk.length>65536||chunk.length>pin.bytes-used)throw invalid();bytes.set(chunk,used);used+=chunk.length;digest.update(chunk);}
  if(used!==pin.bytes||digest.digest('hex')!==pin.sha256)throw invalid();return bytes;
 }finally{clearTimeout(timer);stream.destroy();}
}
/** Disabled means no filesystem, SDK, ADC, bucket or provider I/O. */
export async function configuredJevEvaluationProvider({environment=process.env,loadCredential=loadJevManagedCredential,createStorage=async options=>{const {Storage}=await import('@google-cloud/storage');return new Storage(options);},fetch:fetchImpl=globalThis.fetch}={}){
 const raw=environment.STUDIO_DEFIANT_JEV_CONFIGURATION;if(raw===undefined||raw==='')return null;
 try{
  if(typeof raw!=='string'||Buffer.byteLength(raw)>4096)throw invalid();const parsed=JSON.parse(raw);
  if(parsed?.schemaVersion===2)return await configuredHistoricalJevProvider({configuration:parsed,environment,loadCredential,createStorage,fetch:fetchImpl,readPinnedObject:readCasePack});
  const config=validateJevRuntimeConfiguration(parsed);
  const key=await loadCredential(environment.STUDIO_PENPOT_MANAGED_CONFIG);
  const storage=await createStorage({projectId:PROJECT}),bytes=await readCasePack(storage.bucket(BUCKET),config.casePack);
  const metadata=createPinnedEarningsCasePack({bytes,sha256:config.casePack.sha256,evidence:{read:async()=>{throw invalid();}},authorize:async()=>{}});
  if(metadata.organizationId!==config.organizationId)throw invalid();
  const evaluatorConfigSha256=jevEvaluationConfigurationSha256(LIMITS);
  return Object.freeze(({organizationId,store,strategy,evidence,authorizeCurrent})=>{
   if(organizationId!==config.organizationId)throw Object.assign(new Error('Evaluation unavailable for this organization'),{status:404});
   const authorize=async actor=>{const next=await authorizeCurrent(actor);if(!next||next.id!==actor.id||next.uid!==actor.uid)throw Object.assign(new Error('Evaluation authority changed'),{status:403});await strategy.raw(next);};
   const pack=createPinnedEarningsCasePack({bytes,sha256:config.casePack.sha256,evidence,authorize});
   const adapter=createJevDecisionAdapter({enabled:true,getCredential:()=>key,fetch:fetchImpl,...LIMITS});
   return {cases:pack.list(),executionAvailable:!!key,service:createDurableClaimEvaluations({store,strategy,authorizeCurrent,pack,adapter,accountExperimentId:config.accountExperimentId,evaluatorConfigSha256})};
  });
 }catch{throw invalid();}
}
