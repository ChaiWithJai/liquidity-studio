const fail=(status,message)=>Object.assign(new Error(message),{status});
const hash=v=>typeof v==='string'&&/^[a-f0-9]{64}(?![\s\S])/.test(v);
const cmp=(a,b)=>a<b?-1:a>b?1:0;
const kinds=['selection','receipt-example','earnings-period','audience-definition','comparison-example'];
export function validateSourceEvidenceRequest(request){
 if(!request||typeof request!=='object'||Array.isArray(request)||Object.keys(request).some(k=>!['sourceHash','revision','offset','limit'].includes(k)))throw fail(400,'Invalid source evidence request');
 const {sourceHash,revision,offset=0,limit=25}=request;
 if(!hash(sourceHash)||!hash(revision)||!Number.isSafeInteger(offset)||offset<0||offset>24400||!Number.isSafeInteger(limit)||limit<1||limit>100)throw fail(400,'Invalid source evidence request');
 return {sourceHash,revision,offset,limit};
}
// Input is the existing normalized, authority-checked snapshot. Never load source cells here.
export function sourceEvidenceView(snapshot,request){
 const q=validateSourceEvidenceRequest(request);if(snapshot.revision!==q.revision)throw fail(409,'Evidence revision changed');
 const base={schemaVersion:1,sourceHash:q.sourceHash,revision:q.revision,offset:q.offset,limit:q.limit};
 const register=snapshot.retainedSourceRegister;
 if(!register)return {...base,availability:false,reason:'register-unavailable',items:[],total:null,nextOffset:null};
 const occurrences=[...register.roots,...register.members].filter(r=>r.sha256===q.sourceHash);if(!occurrences.length)throw fail(404,'Registered source unavailable');
 const rows=[],follow=(resource,fields={})=>({resource,...fields,revision:q.revision});
 // Explicit API cap, also equal to current normalized totals:1200+1000+2000+200+20000.
 const add=(kind,parts,fields)=>{if(rows.length>=24400)throw fail(503,'Source references exceed bounds');rows.push({key:JSON.stringify([kind,...parts]),kind,sourceHash:q.sourceHash,...fields});};
 for(const s of snapshot.selections)if(s.sourceHash===q.sourceHash)add('selection',[s.id],{id:s.id,label:s.label,currency:s.currency,amount:s.amount,rowCount:s.sourceRecords.length,qualification:'Declared selection amount; not recomputed by this lookup.',followUp:follow('selection',{selectionId:s.id}),cells:follow('selection-receipts',{selectionId:s.id,offset:0,limit:25})});
 for(const r of snapshot.receipts)if(r.sourceHash===q.sourceHash)add('receipt-example',[r.id],{id:r.id,label:r.member,record:r.record,qualification:'One retained source record, not an aggregate.',followUp:follow('receipt',{receiptId:r.id})});
 for(const m of snapshot.months)if(m.sourceHash===q.sourceHash)add('earnings-period',[m.month,m.currency,q.sourceHash],{month:m.month,currency:m.currency,amount:m.amount,metric:m.metric,receiptIds:[...m.receiptIds],qualification:'Supplied earnings total; referenced receipt examples do not establish full reconciliation.',followUp:follow('earnings',{month:m.month,currency:m.currency,offset:0,limit:25})});
 for(const a of snapshot.audienceDefinitions||[])if(a.sourceHash===q.sourceHash)add('audience-definition',[a.id],{id:a.id,label:a.name,sheet:a.sheet,cellRefs:[...a.cellRefs],qualification:'Source workbook definition; no verified population, consent or activation.',followUp:follow('audience-definition',{audienceId:a.id}),cells:follow('audience-cells',{audienceId:a.id})});
 for(const c of snapshot.comparisons||[])for(const g of c.groups)g.sourceReferences.forEach((r,referenceIndex)=>{if(r.sourceHash===q.sourceHash)add('comparison-example',[c.id,g.id,referenceIndex],{comparisonId:c.id,groupId:g.id,referenceIndex,label:g.label,month:r.month,currency:c.currency,exampleCount:r.exampleRecords.length,qualification:'Producer-selected examples only; not complete group receipts.',followUp:follow('comparison-examples',{comparisonId:c.id,groupId:g.id,referenceIndex})});});
 if(rows.length>24400||new Set(rows.map(r=>r.key)).size!==rows.length)throw fail(503,'Source references exceed bounds');
 rows.sort((a,b)=>cmp(a.kind,b.kind)||cmp(a.key,b.key));
 const result={...base,availability:true,reason:rows.length?null:'no-supported-evidence-reference',occurrenceCount:occurrences.length,occurrences:follow('retained-sources',{sourceHash:q.sourceHash,offset:0,limit:25}),counts:Object.fromEntries(kinds.map(k=>[k,rows.filter(r=>r.kind===k).length])),items:rows.slice(q.offset,q.offset+q.limit),total:rows.length,nextOffset:q.offset+q.limit<rows.length?q.offset+q.limit:null,limitation:'Exact content-hash references in served products. References can overlap and are not financial row counts or complete source coverage. Original cell availability is established only by the follow-up read.'};
 if(Buffer.byteLength(JSON.stringify(result),'utf8')>262144)throw fail(503,'Source reference response exceeds bounds');
 return result;
}
