import {open} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {constants} from 'node:fs';
import {isAbsolute} from 'node:path';
import {createDefiantEvidenceProvider} from './defiant-evidence-provider.js';
const MAX_BYTES=2*1024*1024;
const invalid=()=>new Error('Invalid private evidence runtime configuration');
const plain=v=>v!==null&&typeof v==='object'&&!Array.isArray(v);
const exact=(v,keys)=>plain(v)&&Object.keys(v).sort().join(',')===[...keys].sort().join(',');
const hash=v=>typeof v==='string'&&/^[a-f0-9]{64}$/.test(v);
const projectId='liquidity-studio-pilot-261017';
const bucketName='liquidity-studio-pilot-261017-liquidity-assets';
function pin(value){
 if(!exact(value,['key','generation','bytes','sha256'])||typeof value.key!=='string'||value.key.length>1000||!value.key.startsWith('defiant-private/derived/')||value.key.split('/').some(p=>!p||p==='.'||p==='..')||/[\x00-\x20\x7f\\?#%]/.test(value.key)||typeof value.generation!=='string'||!/^[1-9]\d{0,29}$/.test(value.generation)||!Number.isSafeInteger(value.bytes)||value.bytes<1||value.bytes>8*1024*1024||!hash(value.sha256))throw invalid();
 return Object.freeze({...value});
}
export function validateDefiantEvidenceRuntimeConfiguration(value){
 if(!exact(value,['schemaVersion','organizationId','projectId','bucket','snapshotObject','sourcePartitions','worksheetPartitions',...(Object.hasOwn(value||{},'semanticIndexObject')?['semanticIndexObject']:[])])||value.schemaVersion!==1||typeof value.organizationId!=='string'||!/^[A-Za-z0-9_-]{1,128}$/.test(value.organizationId)||value.organizationId==='defiant_evidence_poc'||value.projectId!==projectId||value.bucket!==bucketName||!Array.isArray(value.sourcePartitions)||value.sourcePartitions.length>2000||!Array.isArray(value.worksheetPartitions)||value.worksheetPartitions.length>200)throw invalid();
 const semanticIndexObject=value.semanticIndexObject===undefined?undefined:pin(value.semanticIndexObject);if(semanticIndexObject&&semanticIndexObject.bytes>4*1024*1024)throw invalid();
 const snapshotObject=pin(value.snapshotObject),objects=new Set([snapshotObject.key]);
 if(semanticIndexObject){if(objects.has(semanticIndexObject.key))throw invalid();objects.add(semanticIndexObject.key);}
 const sourcePartitions=value.sourcePartitions.map(p=>{
  if(!exact(p,['sourceHash','firstRecord','lastRecord','object'])||!hash(p.sourceHash)||!Number.isSafeInteger(p.firstRecord)||p.firstRecord<2||!Number.isSafeInteger(p.lastRecord)||p.lastRecord<p.firstRecord||p.lastRecord-p.firstRecord>=1000)throw invalid();
  const object=pin(p.object);if(objects.has(object.key))throw invalid();objects.add(object.key);
  return Object.freeze({sourceHash:p.sourceHash,firstRecord:p.firstRecord,lastRecord:p.lastRecord,object});
 }).sort((a,b)=>a.sourceHash.localeCompare(b.sourceHash)||a.firstRecord-b.firstRecord);
 for(let i=1;i<sourcePartitions.length;i++){const a=sourcePartitions[i-1],b=sourcePartitions[i];if(a.sourceHash===b.sourceHash&&a.lastRecord>=b.firstRecord)throw invalid();}
 const sheets=new Set();
 const worksheetPartitions=value.worksheetPartitions.map(p=>{
  if(!exact(p,['sourceHash','sheet','object'])||!hash(p.sourceHash)||typeof p.sheet!=='string'||!/^xl\/worksheets\/sheet[1-9]\d{0,5}\.xml$/.test(p.sheet))throw invalid();
  const key=p.sourceHash+':'+p.sheet,object=pin(p.object);if(sheets.has(key)||objects.has(object.key))throw invalid();sheets.add(key);objects.add(object.key);
  return Object.freeze({sourceHash:p.sourceHash,sheet:p.sheet,object});
 });
 return Object.freeze({schemaVersion:1,organizationId:value.organizationId,projectId,bucket:bucketName,snapshotObject,...(semanticIndexObject?{semanticIndexObject}:{}),sourcePartitions:Object.freeze(sourcePartitions),worksheetPartitions:Object.freeze(worksheetPartitions)});
}
/** Open descriptor first: O_NOFOLLOW rejects final symlinks; fstat/read share the same inode. */
export async function loadDefiantEvidenceRuntimeConfiguration(filename){
 if(typeof filename!=='string'||!isAbsolute(filename)||filename.includes('\0'))throw invalid();
 let file;
 try{
  file=await open(filename,constants.O_RDONLY|constants.O_NOFOLLOW|constants.O_NONBLOCK);
  const stat=await file.stat();if(!stat.isFile()||stat.size<1||stat.size>MAX_BYTES)throw invalid();
  const buffer=Buffer.alloc(MAX_BYTES+1);let size=0;
  while(size<buffer.length){const {bytesRead}=await file.read(buffer,size,buffer.length-size,null);if(!bytesRead)break;size+=bytesRead;}
  if(size!==stat.size||size>MAX_BYTES)throw invalid();
  return validateDefiantEvidenceRuntimeConfiguration(JSON.parse(new TextDecoder('utf-8',{fatal:true}).decode(buffer.subarray(0,size))));
 }catch{throw invalid();}finally{await file?.close();}
}
/** Read one immutable config object using the same runtime Storage authority as its evidence. */
async function loadPinnedConfiguration(bucket, object){
 const stream=bucket.file(object.key,{generation:object.generation}).createReadStream({validation:'crc32c',decompress:false});
 const timer=setTimeout(()=>stream.destroy(invalid()),15000);
 try{
  const digest=createHash('sha256'),buffer=Buffer.alloc(object.bytes);let size=0,chunks=0;
  for await(const chunk of stream){if(!(chunk instanceof Uint8Array)||++chunks>65536||chunk.byteLength>object.bytes-size)throw invalid();buffer.set(chunk,size);size+=chunk.byteLength;digest.update(chunk);}
  if(size!==object.bytes||digest.digest('hex')!==object.sha256)throw invalid();
  return validateDefiantEvidenceRuntimeConfiguration(JSON.parse(new TextDecoder('utf-8',{fatal:true}).decode(buffer)));
 }finally{clearTimeout(timer);stream.destroy();}
}
/** No config means no filesystem, SDK import, ADC or bucket access. */
export async function configuredDefiantEvidenceProvider({environment=process.env,loadConfiguration=loadDefiantEvidenceRuntimeConfiguration,createStorage=async options=>{const {Storage}=await import('@google-cloud/storage');return new Storage(options);}}={}){
 const filename=environment.STUDIO_DEFIANT_EVIDENCE_CONFIG,encoded=environment.STUDIO_DEFIANT_EVIDENCE_CONFIG_GCS;
 const fileMode=filename!==undefined&&filename!=='',gcsMode=encoded!==undefined&&encoded!=='';
 if(!fileMode&&!gcsMode)return null;
 try{
  if(fileMode&&gcsMode)throw invalid();
  let config,storage;
  if(gcsMode){
   if(typeof encoded!=='string'||Buffer.byteLength(encoded)>2048)throw invalid();
   const object=pin(JSON.parse(encoded));if(object.bytes>MAX_BYTES)throw invalid();
   storage=await createStorage({projectId});
   config=await loadPinnedConfiguration(storage.bucket(bucketName),object);
  }else config=validateDefiantEvidenceRuntimeConfiguration(await loadConfiguration(filename));
  storage??=await createStorage({projectId});
  return createDefiantEvidenceProvider({organizationId:config.organizationId,bucket:storage.bucket(bucketName),snapshotObject:config.snapshotObject,sourcePartitions:config.sourcePartitions,worksheetPartitions:config.worksheetPartitions,semanticIndexObject:config.semanticIndexObject});
 }catch{throw invalid();}
}
