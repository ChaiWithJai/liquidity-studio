const invalid = () => Object.assign(new Error('Invalid curated evidence product'), {status:503});
const object = v => v && typeof v === 'object' && !Array.isArray(v);
const text = (v, max=200) => typeof v === 'string' && v.length > 0 && v.length <= max && !/[\u0000-\u001f\u007f]/.test(v);
const id = v => text(v,128) && /^[A-Za-z0-9_-]+$/.test(v);
const hash = v => typeof v === 'string' && /^[a-f0-9]{64}$/.test(v);
const decimal = v => typeof v === 'string' && /^-?(0|[1-9]\d{0,25})(\.\d{1,12})?$/.test(v);
const scale=1000000000000n;
const units=v=>{if(!decimal(v))throw invalid();const neg=v.startsWith('-');const [w,f='']=(neg?v.slice(1):v).split('.');const n=BigInt(w)*scale+BigInt(f.padEnd(12,'0'));return neg?-n:n;};
const amount=n=>{const a=n<0n?-n:n;const f=String(a%scale).padStart(12,'0').replace(/0+$/,'');return `${n<0n?'-':''}${a/scale}${f?'.'+f:''}`;};
const cmp=(a,b)=>a<b?-1:a>b?1:0;
const abs=n=>n<0n?-n:n;
function list(value,max,validate){if(!Array.isArray(value)||value.length>max||value.some(v=>!validate(v)))throw invalid();return [...value];}
function unique(values){if(new Set(values).size!==values.length)throw invalid();return values;}
function periods(value){const rows=unique(list(value,24,v=>typeof v==='string'&&/^\d{4}-(0[1-9]|1[0-2])$/.test(v)));if(!rows.length||rows.some((v,i)=>i&&v<=rows[i-1]))throw invalid();return rows;}
export function normalizeComparisons(input,months){
 if(input===undefined)return undefined;
 const rows=list(input,100,object), ids=new Set();let groupCount=0,referenceCount=0;
 const monthMap=new Map(months.map(m=>[`${m.month}:${m.currency}`,m]));
 return rows.map(row=>{
  if(!id(row.id)||ids.has(row.id)||!['sourceSongId','store','country','salesType'].includes(row.dimension)||!text(row.sourceSystem,128)||!text(row.accountScope,128)||!['filename-declared','content-verified'].includes(row.periodBasis)||typeof row.currency!=='string'||!/^[A-Z]{3}$/.test(row.currency))throw invalid();ids.add(row.id);
  const beforeMonths=periods(row.beforeMonths),afterMonths=periods(row.afterMonths);
  if(beforeMonths.length!==afterMonths.length||beforeMonths.some(m=>afterMonths.includes(m)))throw invalid();
  const allMonths=[...beforeMonths,...afterMonths];
  const sourceReferences=list(row.sourceReferences,48,v=>object(v)&&allMonths.includes(v.month)&&hash(v.sourceHash));
  unique(sourceReferences.map(v=>v.month));
  if(sourceReferences.length!==allMonths.length)throw invalid();
  const refs=sourceReferences.map(ref=>{const m=monthMap.get(`${ref.month}:${row.currency}`);if(!m||m.sourceHash!==ref.sourceHash)throw invalid();return {month:ref.month,sourceHash:ref.sourceHash};}).sort((a,b)=>cmp(a.month,b.month));
  const expected=period=>period.reduce((n,m)=>n+units(monthMap.get(`${m}:${row.currency}`).amount),0n);
  const groupIds=new Set(),keys=new Set();let before=0n,after=0n,decrease=0n,increase=0n;
  const groups=list(row.groups,10000,object).map(group=>{
   groupCount++;if(groupCount>10000||!id(group.id)||groupIds.has(group.id)||!(group.key===null||text(group.key,500))||keys.has(group.key)||!text(group.label,500))throw invalid();groupIds.add(group.id);keys.add(group.key);
   const b=units(group.beforeAmount),a=units(group.afterAmount),d=a-b;before+=b;after+=a;if(d<0n)decrease-=d;else increase+=d;
   const examples=list(group.sourceReferences,48,v=>object(v)&&['before','after'].includes(v.side)&&hash(v.sourceHash));
   const refKeys=new Set();
   const normalized=examples.map(ref=>{
    referenceCount++;if(referenceCount>20000)throw invalid();
    const allowed=ref.side==='before'?beforeMonths:afterMonths;
    const key=`${ref.side}:${ref.month}`;
    if(!allowed.includes(ref.month)||refKeys.has(key)||!refs.some(v=>v.month===ref.month&&v.sourceHash===ref.sourceHash))throw invalid();refKeys.add(key);
    const exampleRecords=unique(list(ref.exampleRecords,10,v=>Number.isSafeInteger(v)&&v>=2)).sort((a,b)=>a-b);
    return {side:ref.side,month:ref.month,sourceHash:ref.sourceHash,exampleRecords};
   });
   return {rankMagnitude:abs(d),id:group.id,key:group.key,label:group.label,beforeAmount:amount(b),afterAmount:amount(a),delta:amount(d),sourceReferences:normalized,fullSelectionAvailable:false};
  }).sort((a,b)=>{const x=a.rankMagnitude,y=b.rankMagnitude;return x>y?-1:x<y?1:cmp(a.id,b.id);}).map(({rankMagnitude,...group})=>group);
  if(!groups.length||before!==expected(beforeMonths)||after!==expected(afterMonths))throw invalid();
  return {id:row.id,dimension:row.dimension,currency:row.currency,sourceSystem:row.sourceSystem,accountScope:row.accountScope,periodBasis:row.periodBasis,periodVerification:'producer-assertion-not-service-verification',beforeMonths,afterMonths,sourceReferences:refs,summary:{beforeAmount:amount(before),afterAmount:amount(after),delta:amount(after-before),grossDecrease:amount(decrease),offsetIncrease:amount(increase)},groups,rankingBasis:'absolute-arithmetic-contribution',fullSelectionAvailable:false};
 }).sort((a,b)=>cmp(a.id,b.id));
}
export function normalizeAudienceDefinitions(input){
 if(input===undefined)return undefined;
 const ids=new Set();
 return list(input,200,object).map(row=>{
  if(!id(row.id)||ids.has(row.id)||!text(row.name,500)||!text(row.criteria,4000)||!text(row.scaleText,1000)||!text(row.proposedOffer,2000)||!hash(row.sourceHash)||!text(row.sheet,128))throw invalid();ids.add(row.id);
  const cellRefs=unique(list(row.cellRefs,40,v=>typeof v==='string'&&/^[A-Z]{1,3}[1-9]\d{0,6}$/.test(v)));
  if(!cellRefs.length)throw invalid();
  const requiredEvidence=unique(list(row.requiredEvidence,30,v=>text(v,200)));
  const observedEvidence=unique(list(row.observedEvidence,30,v=>text(v,200)));
  if(observedEvidence.some(v=>!requiredEvidence.includes(v)))throw invalid();
  return {id:row.id,name:row.name,criteria:row.criteria,scaleText:row.scaleText,proposedOffer:row.proposedOffer,sourceHash:row.sourceHash,sheet:row.sheet,cellRefs,requiredEvidence,observedEvidence,missingEvidence:requiredEvidence.filter(v=>!observedEvidence.includes(v)),evidenceStatus:'producer-supplied-availability-not-independent-verification',populationComputed:false,consentVerified:false,activationAuthorized:false};
 }).sort((a,b)=>cmp(a.id,b.id));
}
