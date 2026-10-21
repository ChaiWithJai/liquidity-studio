const fail = (message, status = 400) => Object.assign(new Error(message), {status});
const object = x => x && typeof x === 'object' && !Array.isArray(x);
const text = (x, max = 500) => {if(typeof x !== 'string' || !x.trim() || x.length > max || /[\u0000-\u001f\u007f]/.test(x))throw fail('Invalid domain text');return x.trim();};
const id = x => {const s=text(x,160);if(!/^[A-Za-z0-9][A-Za-z0-9:_ .-]*$/.test(s))throw fail('Invalid domain identifier');return s;};
const num = (x, max = 1e12, integer = false) => {if(!Number.isFinite(x)||x<0||x>max||(integer&&!Number.isSafeInteger(x)))throw fail('Invalid domain quantity');return x;};
const month = x => {if(typeof x!=='string'||!/^\d{4}-(0[1-9]|1[0-2])-01$/.test(x))throw fail('Monthly observation required');return x;};
const refs = x => {if(!Array.isArray(x)||x.length>100)throw fail('Invalid domain references');return [...new Set(x.map(id))];};
export const DOMAIN_RESOURCES = ['regions','collaborators','demand','royalties','rights','forecasts'];
/** Explicit allowlist: no raw owner payload reaches domain responses. */
export function normalizeDefiantDomain(input, base) {
 const out={};const has=(kind,key)=>base[kind]?.some(x=>x.id===key)||out[kind]?.some(x=>x.id===key);
 const linked=(kind,key)=>{const value=id(key);if(!has(kind,value))throw fail('Unknown domain reference');return value;};
 for(const kind of DOMAIN_RESOURCES){
  if(input[kind]===undefined)continue;
  if(!Array.isArray(input[kind])||input[kind].length>20000)throw fail('Domain resource exceeds limit');
  const seen=new Set(),natural=new Set();
  out[kind]=input[kind].map(row=>{
   if(!object(row))throw fail('Invalid domain record');const key=id(row.id);if(seen.has(key))throw fail('Duplicate domain identifier');seen.add(key);
   const r={id:key,provenance:base.dataset.provenance};
   if(kind==='regions')return {...r,name:text(row.name,160),country:text(row.country,3)};
   if(kind==='collaborators')return {...r,name:text(row.name,160),role:text(row.role,160),artistIds:refs(row.artistIds).map(x=>linked('artists',x)),trackIds:refs(row.trackIds??[]).map(x=>linked('tracks',x))};
   r.trackId=linked('tracks',row.trackId);
   if(kind==='rights'){
    if(!['simulated-clear','simulated-review','simulated-restricted'].includes(row.status)||row.method!=='simulation'||row.actualApproval!==false||base.dataset.provenance!=='synthetic')throw fail('Rights simulation must remain explicit');
    return {...r,territory:text(row.territory,12),status:row.status,method:'simulation',actualApproval:false};
   }
   if(kind==='forecasts'){
    if(row.trained!==false||row.method!=='trailing-3-month-baseline')throw fail('Unsupported forecast method');
    if(!row.horizonMonths)throw fail('Positive forecast horizon required');
    return {...r,regionId:linked('regions',row.regionId),asOf:month(row.asOf),horizonMonths:num(row.horizonMonths,12,true),baselineMonthlyStreams:num(row.baselineMonthlyStreams),projectedStreams:num(row.projectedStreams,1e12,true),method:row.method,explanation:text(row.explanation),trained:false};
   }
   r.date=month(row.date);r.period='month';if(row.period!=='month')throw fail('Monthly observation required');
   if(base.dataset.asOf&&r.date>=`${base.dataset.asOf.slice(0,7)}-01`)throw fail('Monthly observation overlaps dataset date');
   r.artistId=linked('artists',row.artistId);if(base.tracks.find(x=>x.id===r.trackId).artistId!==r.artistId)throw fail('Artist and recording disagree');
   r.streams=num(row.streams,1e9,true);
   if(kind==='demand'){
    if(row.method!=='synthetic-observation'||base.dataset.provenance!=='synthetic')throw fail('Demand history must identify its origin');
    r.regionId=linked('regions',row.regionId);r.method=row.method;
   }else{
    if(row.method!=='synthetic-ledger'||base.dataset.provenance!=='synthetic'||row.currency!=='USD')throw fail('Unsupported royalty ledger');
    r.rate=num(row.rate,1);r.rateMicros=num(row.rateMicros,1e6,true);r.amountMicros=num(row.amountMicros,1e15,true);r.royaltyCents=num(row.royaltyCents,1e12,true);r.amount=num(row.amount,1e10);r.currency='USD';r.method=row.method;
    if(Math.abs(r.rate-r.rateMicros/1e6)>1e-12||r.amountMicros!==r.streams*r.rateMicros||r.royaltyCents!==Math.round(r.amountMicros/10000)||Math.abs(r.amount-r.royaltyCents/100)>1e-8)throw fail('Royalty units do not reconcile');
    if(!Array.isArray(row.splits)||!row.splits.length||row.splits.length>8)throw fail('Royalty splits required');
    r.splits=row.splits.map(x=>{const partyId=id(x.partyId);if(!has('artists',partyId)&&!has('collaborators',partyId))throw fail('Unknown royalty party');return {partyId,shareBps:num(x.shareBps,10000,true),amountCents:num(x.amountCents,1e12,true)};});
    if(new Set(r.splits.map(x=>x.partyId)).size!==r.splits.length||r.splits.reduce((s,x)=>s+x.shareBps,0)!==10000||r.splits.reduce((s,x)=>s+x.amountCents,0)!==r.royaltyCents)throw fail('Royalty splits do not conserve amounts');
    if(r.splits.some(x=>Math.abs(x.amountCents-r.royaltyCents*x.shareBps/10000)>1))throw fail('Royalty split disagrees with declared share');
   }
   const nk=[r.trackId,r.date,r.regionId??''].join('|');if(natural.has(nk))throw fail('Duplicate monthly observation');natural.add(nk);return r;
  });
 }
 if(out.demand&&out.royalties)for(const row of out.royalties){const total=out.demand.filter(x=>x.trackId===row.trackId&&x.date===row.date).reduce((s,x)=>s+x.streams,0);if(total!==row.streams)throw fail('Demand and royalty streams do not reconcile');}
 for(const row of out.forecasts??[]){
  if(!base.dataset.asOf||row.asOf!==base.dataset.asOf.slice(0,10))throw fail('Forecast and dataset dates disagree');
  const observations=(out.demand??[]).filter(x=>x.trackId===row.trackId&&x.regionId===row.regionId).sort((a,b)=>a.date.localeCompare(b.date)).slice(-3);
  const asOfMonth=Number(row.asOf.slice(0,4))*12+Number(row.asOf.slice(5,7));
  if(observations.length!==3||observations.some((x,i)=>Number(x.date.slice(0,4))*12+Number(x.date.slice(5,7))!==asOfMonth-3+i))throw fail('Forecast requires three complete preceding months');
  const baseline=observations.reduce((s,x)=>s+x.streams,0)/3;
  if(Math.abs(row.baselineMonthlyStreams-baseline)>1e-6||row.projectedStreams!==Math.round(baseline*row.horizonMonths))throw fail('Forecast does not match declared baseline method');
 }
 // Artist profiles are bounded metadata, not inferred from creator names.
 for(const artist of base.artists){const raw=input.artists.find(x=>x.id===artist.id);if(raw.profile!==undefined){if(!object(raw.profile))throw fail('Invalid artist profile');artist.profile={summary:text(raw.profile.summary),genres:refs(raw.profile.genres),homeRegionId:linked('regions',raw.profile.homeRegionId)};}if(raw.homeRegionId!==undefined)artist.homeRegionId=linked('regions',raw.homeRegionId);}
 for(const row of [...base.campaigns,...base.opportunities])if(row.regionId)linked('regions',row.regionId);
 return out;
}

const total = (rows,key) => rows.reduce((s,x)=>s+x[key],0);
const round = n => Math.round(n*1e6)/1e6;
const requireRow=(rows,key)=>{const row=rows?.find(x=>x.id===id(key));if(!row)throw fail('Domain record not found',404);return row;};
function windows(data){const dates=[...new Set((data.demand??[]).map(x=>x.date))].sort();return {baseline:dates.slice(-6,-3),recent:dates.slice(-3)};}
function opportunity(data,trackId,regionId){
 const recording=requireRow(data.tracks,trackId),region=requireRow(data.regions,regionId),periods=windows(data);
 const rows=(data.demand??[]).filter(x=>x.trackId===trackId&&x.regionId===regionId),base=rows.filter(x=>periods.baseline.includes(x.date)),recent=rows.filter(x=>periods.recent.includes(x.date));
 const six=[...periods.baseline,...periods.recent],indices=six.map(x=>Number(x.slice(0,4))*12+Number(x.slice(5,7)));
 if(periods.baseline.length!==3||periods.recent.length!==3||base.length!==3||recent.length!==3||indices.some((x,i)=>i&&x!==indices[i-1]+1))return null;
 const baselineStreams=total(base,'streams'),recentStreams=total(recent,'streams'),growthRate=baselineStreams?round((recentStreams-baselineStreams)/baselineStreams):null;
 const score=round(Math.min(100,Math.max(0,(growthRate??0)*50)+Math.min(50,recentStreams/10000)));
 return {id:`regional:${trackId}:${regionId}`,trackId,regionId,artistId:recording.artistId,baselineStreams,recentStreams,growthRate,absoluteGrowth:recentStreams-baselineStreams,score,method:'trailing-3-month-vs-prior-3-month',periods,evidenceIds:rows.filter(x=>[...periods.baseline,...periods.recent].includes(x.date)).map(x=>x.id),assumptions:['Score = min(100, max(0, growthRate × 50) + min(50, recentStreams / 10000)); an explicit review heuristic, not a learned prediction.','Zero baseline has unknown growth rate; no percentage is invented.']};
}
export function queryDefiantDomain(data, request) {
 if(!object(request))throw fail('Domain request required');
 const fields={ 'artist-overview':['artistId'], 'regional-opportunities':['artistId','regionId','limit'], 'explain-opportunity':['trackId','regionId'], 'rights-and-royalties':['trackId','territory'], 'compare-scenarios':['trackId','regionId','budgets','horizonMonths'] };
 const keys=fields[request.operation];if(!keys||Object.keys(request).some(x=>x!=='operation'&&!keys.includes(x)))throw fail('Unsupported domain operation');
 const envelope={schemaVersion:1,dataset:data.dataset,operation:request.operation,provenance:data.dataset.provenance,asOf:data.dataset.asOf,evidenceIds:[],assumptions:['Synthetic observations and financial amounts are demonstration data, not observed performance or rights clearance.'],capabilities:data.capabilities};
 let result;
 if(request.operation==='artist-overview'){
  const artist=requireRow(data.artists,request.artistId),recordings=data.tracks.filter(x=>x.artistId===artist.id),trackIds=new Set(recordings.map(x=>x.id)),demand=(data.demand??[]).filter(x=>trackIds.has(x.trackId)),royalties=(data.royalties??[]).filter(x=>trackIds.has(x.trackId));
  result={artist,recordings,collaborators:(data.collaborators??[]).filter(x=>x.artistIds.includes(artist.id)),regions:(data.regions??[]).filter(x=>demand.some(y=>y.regionId===x.id)),demandSummary:{available:demand.length>0,streams:total(demand,'streams'),period:'month',observationCount:demand.length},royaltySummary:{available:royalties.length>0,amountCents:total(royalties,'royaltyCents'),currency:'USD',observationCount:royalties.length},evidenceIds:[...recordings,...demand,...royalties].map(x=>x.id)};
 }else if(request.operation==='regional-opportunities'){
  if(request.artistId)requireRow(data.artists,request.artistId);if(request.regionId)requireRow(data.regions,request.regionId);
  const limit=request.limit??10;num(limit,25,true);if(!limit)throw fail('Positive domain limit required');
  const items=[];for(const track of data.tracks.filter(x=>!request.artistId||x.artistId===request.artistId))for(const region of (data.regions??[]).filter(x=>!request.regionId||x.id===request.regionId)){const item=opportunity(data,track.id,region.id);if(item)items.push(item);}
  items.sort((a,b)=>b.score-a.score||a.id.localeCompare(b.id));result={available:items.length>0,items:items.slice(0,limit),total:items.length,periods:windows(data),evidenceIds:items.slice(0,limit).flatMap(x=>x.evidenceIds)};
 }else if(request.operation==='rights-and-royalties'){
  const recording=requireRow(data.tracks,request.trackId),territory=request.territory===undefined?null:text(request.territory,12),rights=(data.rights??[]).filter(x=>x.trackId===recording.id&&(!territory||x.territory===territory)),rows=(data.royalties??[]).filter(x=>x.trackId===recording.id),splits=new Map();
  for(const row of rows)for(const split of row.splits)splits.set(split.partyId,(splits.get(split.partyId)??0)+split.amountCents);
  result={recording,rights,rightsStatus:rights.length?'simulation-only':'unknown',royalties:{available:rows.length>0,streams:total(rows,'streams'),amountCents:total(rows,'royaltyCents'),currency:'USD',rows,splits:[...splits].map(([partyId,amountCents])=>({partyId,amountCents}))},canApproveRights:false,reviewRequired:true,evidenceIds:[...rights,...rows].map(x=>x.id)};
 }else if(request.operation==='explain-opportunity'){
  const item=opportunity(data,request.trackId,request.regionId);
  const observations=(data.demand??[]).filter(x=>x.trackId===request.trackId&&x.regionId===request.regionId).sort((a,b)=>a.date.localeCompare(b.date)).slice(-24).map(({id,date,streams,period,provenance})=>({id,date,streams,period,provenance}));
  result={available:Boolean(item),item,observations,recording:requireRow(data.tracks,request.trackId),artist:requireRow(data.artists,requireRow(data.tracks,request.trackId).artistId),region:requireRow(data.regions,request.regionId),rightsSummary:(data.rights??[]).filter(x=>x.trackId===request.trackId).map(x=>({id:x.id,status:x.status,territory:x.territory,actualApproval:false})),reviewRequired:true,evidenceIds:[...new Set([...(item?.evidenceIds??[]),...observations.map(x=>x.id)])]};
 }else{
  const recording=requireRow(data.tracks,request.trackId),region=requireRow(data.regions,request.regionId),item=opportunity(data,recording.id,region.id),horizonMonths=request.horizonMonths??3;
  num(horizonMonths,12,true);if(!horizonMonths||!Array.isArray(request.budgets)||!request.budgets.length||request.budgets.length>3)throw fail('One to three explicit scenario budgets required');
  if(new Set(request.budgets).size!==request.budgets.length)throw fail('Distinct scenario budgets required');
  const rows=(data.royalties??[]).filter(x=>x.trackId===recording.id),streams=total(rows,'streams'),rate=streams?total(rows,'royaltyCents')/100/streams:null,baselineMonthlyStreams=item?item.recentStreams/3:null;
  const assumptions=['Incremental streams = budget / assumed $0.05 acquisition cost per stream; this is a fixed explicit planning assumption, not measured campaign lift.','Baseline uses the last three complete monthly observations; scenario output is not an ML forecast or a budget recommendation.'];
  result={available:baselineMonthlyStreams!==null,recording,region,baselineMonthlyStreams,scenarios:request.budgets.map(budget=>{num(budget,100000);const baselineStreams=baselineMonthlyStreams===null?null:Math.round(baselineMonthlyStreams*horizonMonths),assumedIncrementalStreams=Math.round(budget/0.05),projectedStreams=baselineStreams===null?null:baselineStreams+assumedIncrementalStreams,projectedRoyaltyCents=projectedStreams===null||rate===null?null:Math.round(projectedStreams*rate*100);return {budget,currency:'USD',horizonMonths,baselineStreams,assumedIncrementalStreams,projectedStreams,assumedRatePerStream:rate,projectedRoyaltyCents,netAfterBudget:projectedRoyaltyCents===null?null:round(projectedRoyaltyCents/100-budget),assumptions};}),trained:false,reviewRequired:true,evidenceIds:[...(item?.evidenceIds??[]),...rows.map(x=>x.id)],assumptions};
 }
 return structuredClone({...envelope,...result});
}
