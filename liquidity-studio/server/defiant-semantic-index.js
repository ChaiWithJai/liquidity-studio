import {createHash} from 'node:crypto';
import {normalizeRetainedSourceRegister} from './defiant-retained-sources.js';
const invalid=()=>Object.assign(new Error('Semantic metadata index unavailable'),{status:503});
export const SEMANTIC_MODEL=Object.freeze({model:'gemini-embedding-001',location:'us-east4',dimensions:768,rendererVersion:'retained-filename-metadata-v1'});
export const sha256=value=>createHash('sha256').update(value).digest('hex');
export function canonicalMetadata(value){
 if(value===null||['string','boolean'].includes(typeof value))return JSON.stringify(value);
 if(typeof value==='number'&&Number.isFinite(value))return JSON.stringify(value);
 if(Array.isArray(value))return `[${value.map(canonicalMetadata).join(',')}]`;
 if(value&&typeof value==='object'&&Object.getPrototypeOf(value)===Object.prototype)return `{${Object.keys(value).sort().map(k=>`${JSON.stringify(k)}:${canonicalMetadata(value[k])}`).join(',')}}`;
 throw invalid();
}
export function retainedSemanticDocuments(input){
 const register=normalizeRetainedSourceRegister(input);if(!register)throw invalid();
 const roots=new Map(register.roots.map(r=>[r.id,r]));
 const documents=[...register.roots.map(r=>({...r,kind:'root',rootId:r.id})),...register.members.map(r=>({...r,kind:'member'}))].map(r=>{
  const text=JSON.stringify({kind:r.kind,labels:r.kind==='root'?[r.filename]:r.chain,format:r.format,filenamePeriods:r.periods.map(p=>({month:p.month,kind:p.periodKind,basis:p.basis}))});
  if(Buffer.byteLength(text)>1536)throw invalid();
  return {id:r.id,rootId:r.rootId,kind:r.kind,inputSha256:sha256(text),text,sourceId:roots.get(r.rootId).sourceId};
 }).sort((a,b)=>a.rootId<b.rootId?-1:a.rootId>b.rootId?1:a.kind<b.kind?-1:a.kind>b.kind?1:a.id<b.id?-1:a.id>b.id?1:0);
 return {registerSha256:sha256(canonicalMetadata(register)),documents};
}
const exact=(v,keys)=>v&&Object.getPrototypeOf(v)===Object.prototype&&Object.keys(v).sort().join(',')===[...keys].sort().join(',');
const hash=v=>typeof v==='string'&&v.length===64&&/^[a-f0-9]+$/.test(v);
export function normalizeSemanticIndex(input,{organizationId,register}={}){
 if(!exact(input,['schemaVersion','organizationId','registerSha256','rendererVersion','model','location','dimensions','task','corpusPackSha256','entries'])||input.schemaVersion!==1||input.organizationId!==organizationId||input.task!=='RETRIEVAL_DOCUMENT'||!hash(input.corpusPackSha256)||Object.entries(SEMANTIC_MODEL).some(([k,v])=>input[k]!==v)||Buffer.byteLength(JSON.stringify(input))>4*1024*1024)throw invalid();
 const projection=retainedSemanticDocuments(register);
 if(input.registerSha256!==projection.registerSha256||!Array.isArray(input.entries)||input.entries.length!==projection.documents.length||input.entries.length>256)throw invalid();
 const expected=new Map(projection.documents.map(r=>[r.id,r])),seen=new Set();
 const entries=input.entries.map(entry=>{
  if(!exact(entry,['id','inputSha256','resultSha256','vector'])||seen.has(entry.id)||entry.inputSha256!==expected.get(entry.id)?.inputSha256||!hash(entry.resultSha256)||!Array.isArray(entry.vector)||entry.vector.length!==768||entry.vector.some(n=>typeof n!=='number'||!Number.isFinite(n)))throw invalid();
  const norm=entry.vector.reduce((sum,n)=>sum+n*n,0);if(Math.abs(norm-1)>1e-9)throw invalid();seen.add(entry.id);
  return {id:entry.id,inputSha256:entry.inputSha256,resultSha256:entry.resultSha256,vector:[...entry.vector]};
 });
 return {...SEMANTIC_MODEL,organizationId,registerSha256:projection.registerSha256,indexSha256:sha256(canonicalMetadata(input)),corpusPackSha256:input.corpusPackSha256,entries};
}
