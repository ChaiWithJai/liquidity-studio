const invalid=()=>Object.assign(new Error('Invalid store coverage product'),{status:503});
const id=v=>typeof v==='string'&&/^[A-Za-z0-9_-]{1,128}$/.test(v);
const decimal=v=>typeof v==='string'&&/^-?(0|[1-9]\d{0,25})(\.\d{1,12})?$/.test(v);
const scale=1000000000000n;
const units=v=>{if(!decimal(v))throw invalid();const negative=v.startsWith('-'),[a,b='']=(negative?v.slice(1):v).split('.');const n=BigInt(a)*scale+BigInt(b.padEnd(12,'0'));return negative?-n:n;};
const amount=n=>{const x=n<0n?-n:n,f=String(x%scale).padStart(12,'0').replace(/0+$/,'');return `${n<0n?'-':''}${x/scale}${f?'.'+f:''}`;};
const date=v=>typeof v==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(v)&&Number.isFinite(Date.parse(v))&&new Date(v).toISOString().slice(0,10)===v;
export function normalizeStorePeriodCoverage(input,comparisons=[]){
 if(input===undefined)return undefined;
 if(!Array.isArray(input)||input.length>100)throw invalid();const ids=new Set(),bindings=new Set();
 return input.map(row=>{
  if(!row||row.schemaVersion!==1||!id(row.id)||ids.has(row.id)||!id(row.comparisonId)||typeof row.storeKey!=='string')throw invalid();ids.add(row.id);
  const comparison=comparisons.find(c=>c.id===row.comparisonId&&c.dimension==='store');
  const group=comparison?.groups.find(g=>g.key===row.storeKey);if(!group)throw invalid();
  const binding=JSON.stringify([comparison.id,group.id]);if(bindings.has(binding))throw invalid();bindings.add(binding);
  const all=[...comparison.beforeMonths,...comparison.afterMonths];
  if(!Array.isArray(row.observations)||row.observations.length!==all.length)throw invalid();
  const seen=new Set();const observations=row.observations.map(o=>{
   if(!o||seen.has(o.month)||!all.includes(o.month)||comparison.sourceReferences.find(r=>r.month===o.month)?.sourceHash!==o.sourceHash||!Number.isSafeInteger(o.rowCount)||o.rowCount<0||(o.rowCount===0?o.amount!==null:!decimal(o.amount)))throw invalid();seen.add(o.month);
   let postingWindow=null;if(o.postingWindow!==null){const p=o.postingWindow;if(!p||!date(p.first)||!date(p.last)||p.first>p.last)throw invalid();postingWindow={first:p.first,last:p.last,scope:'source-file',verification:'producer-supplied-profile'};}
   return {month:o.month,sourceHash:o.sourceHash,rowCount:o.rowCount,amount:o.amount,observation:o.rowCount===0?'absent-in-supplied-grouping':'observed',postingWindow,expectedDelivery:'unknown'};
  }).sort((a,b)=>a.month<b.month?-1:1);
  const lookup=m=>observations.find(o=>o.month===m),sum=months=>months.reduce((n,m)=>n+(lookup(m).amount===null?0n:units(lookup(m).amount)),0n);
  const before=sum(comparison.beforeMonths),after=sum(comparison.afterMonths);
  if(before!==units(group.beforeAmount)||after!==units(group.afterAmount))throw invalid();
  const pairs=comparison.beforeMonths.map((m,i)=>({beforeMonth:m,afterMonth:comparison.afterMonths[i]})).filter(p=>lookup(p.beforeMonth).rowCount>0&&lookup(p.afterMonth).rowCount>0);
  const matchedBefore=sum(pairs.map(p=>p.beforeMonth)),matchedAfter=sum(pairs.map(p=>p.afterMonth));
  return {schemaVersion:1,id:row.id,comparisonId:comparison.id,groupId:group.id,storeKey:row.storeKey,sourceSystem:comparison.sourceSystem,accountScope:comparison.accountScope,currency:comparison.currency,periodBasis:comparison.periodBasis,observations,
   allPeriod:{beforeMonths:comparison.beforeMonths,afterMonths:comparison.afterMonths,beforeAmount:amount(before),afterAmount:amount(after),delta:amount(after-before),basis:'sum-of-observed-supplied-amounts-not-zero-activity-imputation'},
   mutuallyObserved:{pairingBasis:'positional-in-declared-comparison-lists',pairs,beforeAmount:pairs.length?amount(matchedBefore):null,afterAmount:pairs.length?amount(matchedAfter):null,delta:pairs.length?amount(matchedAfter-matchedBefore):null},
   citation:{comparisonId:comparison.id,groupId:group.id},expectedDelivery:'unknown',settlementMaturityComparable:false,
   limitation:'Absence means no observation in the supplied grouping, not zero listening or missing provider delivery. Posting windows describe the whole source file, not this store, including when the store observation is absent. Mutually observed periods can still differ in posting and settlement maturity. Exact supplied-amount arithmetic, not causal demand analysis.',
   missingCommercialInputs:['Current comparable demand or buyer transactions','Verified relevant identities','Offer economics','Current action authority']};
 });
}
