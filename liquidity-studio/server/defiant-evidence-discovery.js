const failure=(status,message)=>Object.assign(new Error(message),{status});
const hash=v=>typeof v==='string'&&/^[a-f0-9]{64}$/.test(v);
const month=v=>typeof v==='string'&&/^\d{4}-(0[1-9]|1[0-2])$/.test(v);
const text=(v,max)=>typeof v==='string'&&v.length>0&&v.length<=max&&!/[\u0000-\u001f\u007f]/.test(v);
const compare=(a,b)=>a<b?-1:a>b?1:0;
const missing=['originalFileBytes','originalFileGeneration','originalFileRecordCount','ingestionTimestamp','completeSourceInventoryProof'];
export function validateServedEvidenceDiscoveryRequest(request={}){
 if(!request||typeof request!=='object'||Array.isArray(request)||Object.keys(request).some(k=>!['query','fromMonth','toMonth','offset','limit'].includes(k)))throw failure(400,'Invalid coverage discovery request');
 const {query='',fromMonth,toMonth,offset=0,limit=25}=request;
 if(typeof query!=='string'||query.length>200||/[\u0000-\u001f\u007f]/.test(query)||(fromMonth!==undefined&&!month(fromMonth))||(toMonth!==undefined&&!month(toMonth))||(fromMonth&&toMonth&&fromMonth>toMonth)||!Number.isSafeInteger(offset)||offset<0||offset>5000||!Number.isSafeInteger(limit)||limit<1||limit>100)throw failure(400,'Invalid coverage discovery request');
 return {query,fromMonth,toMonth,offset,limit};
}
/** Internal projection ONLY: caller must supply the existing authorized, normalized snapshot. */
export function discoverServedEvidenceCoverage(snapshot,request={}){
 const {query,fromMonth,toMonth,offset,limit}=validateServedEvidenceDiscoveryRequest(request);
 const unavailable=()=>failure(503,'Normalized served evidence unavailable');
 if(!snapshot||snapshot.schemaVersion!==1||!hash(snapshot.revision)||!text(snapshot.organizationId,128)||!text(snapshot.coverage,2000))throw unavailable();
 for(const [field,max] of [['months',1200],['receipts',1000],['selections',2000],['comparisons',100],['audienceDefinitions',200]])if(!Array.isArray(snapshot[field]??[])||(snapshot[field]??[]).length>max)throw unavailable();
 const sources=new Map();
 const source=sourceHash=>{if(!hash(sourceHash))throw unavailable();if(!sources.has(sourceHash))sources.set(sourceHash,{sourceHash,kinds:new Set(),members:new Set(),periods:new Map(),systems:new Set(),accounts:new Set(),labels:new Set(),counts:{earningsPeriods:0,receiptExamples:0,aggregateSelections:0,selectionRecordReferences:0,audienceDefinitions:0}});return sources.get(sourceHash);};
 for(const row of snapshot.months??[]){if(!month(row.month)||!text(row.currency,3))throw unavailable();const s=source(row.sourceHash);s.kinds.add('served-earnings');s.counts.earningsPeriods++;if(!s.periods.has(row.month))s.periods.set(row.month,new Set());s.periods.get(row.month).add(row.currency);}
 for(const row of snapshot.receipts??[]){if(!text(row.member,500))throw unavailable();const s=source(row.sourceHash);s.kinds.add('receipt-examples');s.members.add(row.member);s.counts.receiptExamples++;}
 let recordReferences=0;
 for(const row of snapshot.selections??[]){if(!text(row.label,500)||!Array.isArray(row.sourceRecords)||(recordReferences+=row.sourceRecords.length)>500000)throw unavailable();const s=source(row.sourceHash);s.kinds.add('aggregate-selections');s.labels.add(row.label);s.counts.aggregateSelections++;s.counts.selectionRecordReferences+=row.sourceRecords.length;}
 for(const row of snapshot.comparisons??[]){if(!text(row.sourceSystem,128)||!text(row.accountScope,128)||!Array.isArray(row.sourceReferences)||row.sourceReferences.length>48)throw unavailable();for(const ref of row.sourceReferences){const s=source(ref.sourceHash);s.kinds.add('comparison-references');s.systems.add(row.sourceSystem);s.accounts.add(row.accountScope);}}
 for(const row of snapshot.audienceDefinitions??[]){if(!text(row.name,500))throw unavailable();const s=source(row.sourceHash);s.kinds.add('audience-worksheet-references');s.labels.add(row.name);s.counts.audienceDefinitions++;}
 const rows=[...sources.values()].sort((a,b)=>compare(a.sourceHash,b.sourceHash));
 const term=query.trim().normalize('NFC').toLowerCase();const hasPeriod=fromMonth!==undefined||toMonth!==undefined;
 const matches=rows.filter(s=>(!term||[s.sourceHash,...s.members,...s.systems,...s.accounts,...s.labels].some(v=>v.normalize('NFC').toLowerCase().includes(term)))&&(!hasPeriod||[...s.periods.keys()].some(p=>(!fromMonth||p>=fromMonth)&&(!toMonth||p<=toMonth))));
 const project=s=>{
  const counts={},bounded=(name,values,max=5)=>{const all=[...values].sort(compare),items=all.slice(0,max);counts[name]={total:all.length,returned:items.length,omitted:all.length-items.length};return items;};
  const memberNames=bounded('memberNames',s.members),sourceSystems=bounded('sourceSystems',s.systems),accountScopes=bounded('accountScopes',s.accounts),labels=bounded('labels',s.labels),periodKeys=bounded('periods',s.periods.keys(),24);
  const periods=periodKeys.map(month=>{const all=[...s.periods.get(month)].sort(compare),currencies=all.slice(0,5);return {month,currencies,currencyCounts:{total:all.length,returned:currencies.length,omitted:all.length-currencies.length}};});
  return {sourceHash:s.sourceHash,referenceKinds:[...s.kinds].sort(compare),memberNames,sourceSystems,accountScopes,labels,periods,metadataCounts:counts,periodBasis:s.periods.size?'served-earnings-months':'not-retained',counts:s.counts,missingFields:[...missing,...(!s.members.size?['originalMemberName']:[]),...(!s.systems.size?['sourceSystem']:[]),...(!s.accounts.size?['accountScope']:[]),...(!s.periods.size?['earningsPeriod']:[])],inventoryStatus:'referenced-by-served-snapshot-only'};
 };
 const result={schemaVersion:1,scope:{organizationId:snapshot.organizationId},revision:snapshot.revision,coverageKind:'served-evidence-coverage',coverage:snapshot.coverage,inventoryComplete:false,discoveryMethod:'deterministic-retained-metadata-substring',filters:{query:query.trim(),...(fromMonth?{fromMonth}:{}),...(toMonth?{toMonth}:{})},totalReferencedSources:rows.length,matchingSources:matches.length,undatedReferencedSources:rows.filter(r=>!r.periods.size).length,offset,limit,items:matches.slice(offset,offset+limit).map(project),nextOffset:offset+limit<matches.length?offset+limit:null,limitations:['Only source hashes referenced by the served normalized snapshot are discoverable; this is not a bronze bucket/archive inventory.','Period filters match retained earnings months only; undated references are excluded when a period filter is present.','Selection record-reference counts may overlap and are not original file row counts.','Metadata arrays are bounded with total/returned/omitted counts; matching searches all retained metadata before projection.','Missing metadata is not proof that a source or field does not exist.'],capabilities:{readOnly:true,canFetchArbitrarySource:false,canInfer:false,canActivate:false,canApproveRights:false,canPublish:false}};
 if(Buffer.byteLength(JSON.stringify(result),'utf8')>3*1024*1024)throw unavailable();
 return result;
}
