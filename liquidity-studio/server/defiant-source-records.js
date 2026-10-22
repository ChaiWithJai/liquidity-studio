import {createDefiantEvidenceLoader} from './defiant-evidence-loader.js';
const unavailable = () => Object.assign(new Error('Source records unavailable'), {status:503});
const hash = value => typeof value === 'string' && /^[a-f0-9]{64}$/.test(value);
/** Server-owned source ranges and object pins only; no caller object paths. */
export function createDefiantSourceRecordResolver({organizationId, partitions, openObject, timeoutMs = 30000} = {}) {
 if (typeof organizationId !== 'string' || !/^[A-Za-z0-9_-]{1,128}$/.test(organizationId) || typeof openObject !== 'function') throw new TypeError('Source scope and opener required');
 if (!Number.isSafeInteger(timeoutMs) || timeoutMs < 1 || timeoutMs > 30000) throw new TypeError('Bounded source deadline required');
 if (!Array.isArray(partitions) || partitions.length > 2000) throw new TypeError('Bounded source partitions required');
 const ranges = partitions.map(part => {
  if (!part || !hash(part.sourceHash) || !Number.isSafeInteger(part.firstRecord) || part.firstRecord < 2 || !Number.isSafeInteger(part.lastRecord) || part.lastRecord < part.firstRecord || part.lastRecord - part.firstRecord >= 1000) throw new TypeError('Invalid source range');
  const load = createDefiantEvidenceLoader({organizationId, object:part.object, openObject});
  return Object.freeze({sourceHash:part.sourceHash,firstRecord:part.firstRecord,lastRecord:part.lastRecord,bytes:part.object.bytes,load});
 }).sort((a,b)=>a.sourceHash.localeCompare(b.sourceHash)||a.firstRecord-b.firstRecord);
 for(let i=1;i<ranges.length;i++) if(ranges[i].sourceHash===ranges[i-1].sourceHash && ranges[i].firstRecord<=ranges[i-1].lastRecord) throw new TypeError('Overlapping source ranges');
 return async request => {
  if(request?.organizationId!==organizationId || !hash(request.sourceHash) || !hash(request.revision) || !Array.isArray(request.sourceRecords) || request.sourceRecords.length>100) throw unavailable();
  const records=[...request.sourceRecords];let previous=1;
  for(const record of records){if(!Number.isSafeInteger(record)||record<=previous)throw unavailable();previous=record;}
  const selected=new Map();
  for(const record of records){
   const part=ranges.find(p=>p.sourceHash===request.sourceHash&&record>=p.firstRecord&&record<=p.lastRecord);
   if(!part)throw unavailable();
   if(!selected.has(part))selected.set(part,[]);selected.get(part).push(record);
  }
  // Bound cumulative work even for sparse selections across many partitions.
  if([...selected.keys()].reduce((sum,p)=>sum+p.bytes,0)>32*1024*1024)throw unavailable();
  const found=new Map();const controller=new AbortController();
  const timer=setTimeout(()=>controller.abort(),timeoutMs);
  try {
   for(const [part,wanted] of selected){
    if(controller.signal.aborted)throw unavailable();
    const data=await part.load({organizationId},{signal:controller.signal});
    if(data.sourceHash!==part.sourceHash || !Array.isArray(data.receipts) || data.receipts.length!==part.lastRecord-part.firstRecord+1)throw unavailable();
    for(let i=0;i<data.receipts.length;i++){
     const row=data.receipts[i];if(row?.record!==part.firstRecord+i||row.sourceHash!==part.sourceHash)throw unavailable();
    }
    for(const record of wanted)found.set(record,data.receipts[record-part.firstRecord]);
   }
   return records.map(record=>structuredClone(found.get(record)));
  }catch{throw unavailable();}finally{clearTimeout(timer);}
 };
}
