import {createHash} from 'node:crypto';
const fail=(status,message)=>Object.assign(new Error(message),{status});
const invalid=()=>fail(503,'Retained source register unavailable');
const plain=v=>v!==null&&typeof v==='object'&&!Array.isArray(v);
const exact=(v,keys)=>plain(v)&&Object.keys(v).length===keys.length&&keys.every(k=>Object.hasOwn(v,k));
const text=(v,max)=>typeof v==='string'&&v.length>0&&v.length<=max&&!/[\u0000-\u001f\u007f]/.test(v);
const id=v=>text(v,128)&&/^[A-Za-z0-9_-]+$(?![\s\S])/.test(v);
const hash=v=>typeof v==='string'&&v.length===64&&/^[a-f0-9]{64}$/.test(v);
const month=v=>typeof v==='string'&&v.length===7&&/^\d{4}-(0[1-9]|1[0-2])$/.test(v);
const bytes=v=>Number.isSafeInteger(v)&&v>=0;
const formats=new Set(['csv','xlsx','xls','pdf','png','jpg','zip','tar.gz','json','other']);
const compare=(a,b)=>a<b?-1:a>b?1:0;
const relative=v=>text(v,500)&&!v.startsWith('/')&&!v.includes('\\')&&!/^[A-Za-z]:/.test(v)&&v.split('/').every(p=>p&&p!=='.'&&p!=='..');
const utcTimestamp=v=>{
 if(!text(v,32)||/[\u2028\u2029]/.test(v))return false;
 const m=/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})(?:\.\d{1,6})?Z$/.exec(v);if(!m)return false;
 const d=new Date(v);return Number.isFinite(d.getTime())&&[d.getUTCFullYear(),d.getUTCMonth()+1,d.getUTCDate(),d.getUTCHours(),d.getUTCMinutes(),d.getUTCSeconds()].every((n,i)=>n===Number(m[i+1]));
};
const digest=v=>createHash('sha256').update(JSON.stringify(v)).digest('hex');
// Explicit source-period markers only. Report/backup dates and directory ranges are not periods.
export function declaredFilenamePeriod(value){
 if(typeof value!=='string')return null;
 const filename=value.split('/').at(-1),match=/(?:^|[-_ ])(sales_period|sales-period|reporting_period)-(0[1-9]|1[0-2])-(\d{4})\.csv$(?![\s\S])/i.exec(filename);
 return match?{month:`${match[3]}-${match[2]}`,periodKind:match[1].toLowerCase().startsWith('sales')?'sales':'reporting'}:null;
}
function periods(values,texts){
 if(!Array.isArray(values)||values.length>24)throw invalid();
 const seen=new Set();return values.map(p=>{
  if(!exact(p,['month','periodKind','basis','sourceText'])||!month(p.month)||p.basis!=='filename-declared'||!texts.includes(p.sourceText)||declaredFilenamePeriod(p.sourceText)?.month!==p.month||declaredFilenamePeriod(p.sourceText)?.periodKind!==p.periodKind)throw invalid();
  const key=JSON.stringify([p.month,p.periodKind,p.basis,p.sourceText]);if(seen.has(key))throw invalid();seen.add(key);
  return {month:p.month,periodKind:p.periodKind,basis:p.basis,sourceText:p.sourceText};
 }).sort((a,b)=>compare(a.month,b.month)||compare(a.sourceText,b.sourceText));
}
export function normalizeRetainedSourceRegister(input){
 if(input===undefined)return undefined;
 if(!exact(input,['schemaVersion','scopeDescription','capturedAt','provenance','roots','members'])||input.schemaVersion!==1||!text(input.scopeDescription,2000)||!utcTimestamp(input.capturedAt)||!exact(input.provenance,['manifestSha256','memberInventorySha256'])||!hash(input.provenance.manifestSha256)||!hash(input.provenance.memberInventorySha256)||!Array.isArray(input.roots)||input.roots.length<1||input.roots.length>64||!Array.isArray(input.members)||input.members.length>4096||Buffer.byteLength(JSON.stringify(input),'utf8')>2*1024*1024)throw invalid();
 const ids=new Set(),sizes=new Map(),rootMap=new Map(),occurrences=new Set();
 const common=r=>{if(!id(r.id)||ids.has(r.id)||!hash(r.sha256)||!bytes(r.bytes)||!formats.has(r.format))throw invalid();ids.add(r.id);if(sizes.has(r.sha256)&&sizes.get(r.sha256)!==r.bytes)throw invalid();sizes.set(r.sha256,r.bytes);};
 const roots=input.roots.map(r=>{
  if(!exact(r,['id','sourceId','filename','format','bytes','sha256','generation','retentionVerification','memberInventory','periods'])||!id(r.sourceId)||!relative(r.filename)||r.filename.includes('/')||!text(r.generation,30)||!/^[1-9]\d{0,29}$(?![\s\S])/.test(r.generation)||!exact(r.retentionVerification,['size','crc32c','md5'])||Object.values(r.retentionVerification).some(v=>v!==null&&typeof v!=='boolean')||!exact(r.memberInventory,['status','scope'])||!['enumerated','not-enumerated'].includes(r.memberInventory.status)||!text(r.memberInventory.scope,2000))throw invalid();common(r);
  const row={id:r.id,sourceId:r.sourceId,filename:r.filename,format:r.format,bytes:r.bytes,sha256:r.sha256,generation:r.generation,retentionVerification:{...r.retentionVerification},memberInventory:{...r.memberInventory},periods:periods(r.periods,[r.filename])};rootMap.set(r.id,row);return row;
 }).sort((a,b)=>compare(a.id,b.id));
 const members=input.members.map(r=>{
  if(!exact(r,['id','rootId','chain','sha256','bytes','format','container','periods'])||!id(r.rootId)||!rootMap.has(r.rootId)||!Array.isArray(r.chain)||r.chain.length<1||r.chain.length>8||r.chain.some(v=>!relative(v))||typeof r.container!=='boolean')throw invalid();common(r);
  const root=rootMap.get(r.rootId),key=JSON.stringify([r.rootId,r.chain]);if(root.memberInventory.status!=='enumerated'||occurrences.has(key)||r.id!==digest([root.sha256,r.chain,r.sha256]))throw invalid();occurrences.add(key);
  return {id:r.id,rootId:r.rootId,chain:[...r.chain],sha256:r.sha256,bytes:r.bytes,format:r.format,container:r.container,periods:periods(r.periods,[r.chain.at(-1)])};
 }).sort((a,b)=>compare(a.rootId,b.rootId)||compare(a.id,b.id));
 return {schemaVersion:1,scopeDescription:input.scopeDescription,capturedAt:input.capturedAt,provenance:{...input.provenance},roots,members};
}
export function validateRetainedSourceRequest(request={}){
 if(!plain(request)||Object.keys(request).some(k=>!['query','sourceId','format','kind','sourceHash','fromMonth','toMonth','offset','limit'].includes(k)))throw fail(400,'Invalid retained source request');
 const {query='',sourceId,format,kind,sourceHash,fromMonth,toMonth,offset=0,limit=25}=request;
 if(typeof query!=='string'||query.length>200||/[\u0000-\u001f\u007f]/.test(query)||(sourceId!==undefined&&!id(sourceId))||(format!==undefined&&!formats.has(format))||(kind!==undefined&&!['root','member'].includes(kind))||(sourceHash!==undefined&&!hash(sourceHash))||(fromMonth!==undefined&&!month(fromMonth))||(toMonth!==undefined&&!month(toMonth))||(fromMonth&&toMonth&&fromMonth>toMonth)||!Number.isInteger(offset)||offset<0||offset>5000||!Number.isInteger(limit)||limit<1||limit>100)throw fail(400,'Invalid retained source request');
 return {query,sourceId,format,kind,sourceHash,fromMonth,toMonth,offset,limit};
}
function count(rows){
 const roots=rows.filter(r=>r.kind==='root'),members=rows.filter(r=>r.kind==='member'),leaves=members.filter(r=>!r.container),hashes=new Map();for(const r of leaves)hashes.set(r.sha256,(hashes.get(r.sha256)||0)+1);
 return {rootObjects:roots.length,memberOccurrences:members.length,leafOccurrences:leaves.length,uniqueLeafHashes:hashes.size,duplicateLeafHashGroups:[...hashes.values()].filter(n=>n>1).length,undatedRecords:rows.filter(r=>!r.periods.length).length};
}
export function searchRetainedSources(snapshot,request={}){
 const q=validateRetainedSourceRequest(request),register=snapshot.retainedSourceRegister;
 const base={schemaVersion:1,scope:{organizationId:snapshot.organizationId},revision:snapshot.revision,inventoryKind:'retained-intake-metadata',capabilities:{readOnly:true,canFetchArbitrarySource:false,canInfer:false,canActivate:false,canApproveRights:false,canPublish:false},providerComplete:false,downloadsComplete:false,financialRowsDeduplicated:false,completenessQualification:'No provider or Downloads completeness claim; these flags do not establish missing delivery.',filters:Object.fromEntries(Object.entries(q).filter(([k,v])=>!['offset','limit'].includes(k)&&v!==undefined)),offset:q.offset,limit:q.limit};
 if(register===undefined)return {...base,availability:false,scopeDescription:null,globalCounts:null,matchingCounts:null,items:[],nextOffset:null,limitation:'Retained intake register unavailable; no zero-count inventory or source absence conclusion.'};
 const served=new Set();for(const field of ['months','receipts','selections','audienceDefinitions'])for(const row of snapshot[field]||[])served.add(row.sourceHash);for(const row of snapshot.comparisons||[])for(const ref of row.sourceReferences)served.add(ref.sourceHash);
 const rootMap=new Map(register.roots.map(r=>[r.id,r])),rows=[...register.roots.map(r=>({...r,kind:'root',rootId:r.id})),...register.members.map(r=>({...r,kind:'member',sourceId:rootMap.get(r.rootId).sourceId}))].sort((a,b)=>compare(a.rootId,b.rootId)||compare(a.kind,b.kind)||compare(a.id,b.id));
 const term=q.query.trim().normalize('NFC').toLowerCase(),dated=q.fromMonth!==undefined||q.toMonth!==undefined;
 const matches=rows.filter(r=>(q.sourceId===undefined||r.sourceId===q.sourceId)&&(q.format===undefined||r.format===q.format)&&(q.kind===undefined||r.kind===q.kind)&&(q.sourceHash===undefined||r.sha256===q.sourceHash)&&(!term||[r.filename||'',...(r.chain||[]),r.sourceId,r.sha256].some(v=>v.normalize('NFC').toLowerCase().includes(term)))&&(!dated||r.periods.some(p=>(!q.fromMonth||p.month>=q.fromMonth)&&(!q.toMonth||p.month<=q.toMonth))));
 const result={...base,availability:true,scopeDescription:register.scopeDescription,capturedAt:register.capturedAt,provenance:register.provenance,globalCounts:count(rows),matchingCounts:count(matches),items:matches.slice(q.offset,q.offset+q.limit).map(r=>({...r,servedAssociation:served.has(r.sha256)?'referenced-by-served-evidence':'not-referenced-by-served-evidence'})),nextOffset:q.offset+q.limit<matches.length?q.offset+q.limit:null,limitations:['Retained intake scope only; recursive member enumeration applies only to explicitly enumerated roots.','Member occurrences and duplicate content hashes are not deduplicated financial records.','Periods are filename declarations, not parsed-row period verification or current business activity.','Generation and transfer-verification observations apply to original root objects only; the service does not download or rehash them.','Served association is an exact hash reference in existing products, not complete parsing or whole-source service coverage; containers and descendants differ.','Names and scope descriptions are untrusted source metadata, not instructions or privacy/licensing certification.']};
 if(Buffer.byteLength(JSON.stringify(result),'utf8')>3*1024*1024)throw invalid();return structuredClone(result);
}
