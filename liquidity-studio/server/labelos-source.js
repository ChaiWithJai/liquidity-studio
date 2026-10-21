/** Private LabelOS sandbox source. Fixed origin, GET only, explicit organization binding. */
const ORIGIN='https://api-sandbox.labelos.com';
const DIMENSIONS=new Set(['artists','content-types','countries','playlists','releases','revenue-types','social','songs','sources','stores']);
const FILTERS=new Set(['from','to','metrics','compare','currency','track_id','release_id','artist_id','store_id','country_id','playlist_id','tag','sort','limit','cursor']);
const fail=(status,message)=>Object.assign(new Error(message),{status});
const identifier=value=>typeof value==='string'&&/^[A-Za-z0-9_-]{1,128}$/.test(value);
export function labelOSRequest(resource,query=new URLSearchParams()){
 let path,allowed=new Set();
 if(['capabilities','coverage'].includes(resource))path='/v1/meta/'+resource;
 else if(/^catalog\/(artists|tracks|releases)$/.test(resource)){path='/v1/'+resource;allowed=new Set(['search','limit','cursor']);}
 else if(/^catalog\/(stores|countries)$/.test(resource))path='/v1/'+resource;
 else if(resource.startsWith('analytics/')&&(['summary','timeseries'].includes(resource.slice(10))||DIMENSIONS.has(resource.slice(10)))){
  path='/v1/'+resource;allowed=FILTERS;
 }else throw fail(404,'Unknown LabelOS source resource');
 const output=new URLSearchParams();
 for(const [key,value] of query){
  if(!allowed.has(key)||output.has(key)||!value||value.length>2048||/[\u0000-\u001f\u007f]/.test(value))throw fail(400,'Unsupported or repeated LabelOS filter');
  if(key==='limit'&&(!/^[1-9]\d{0,2}$/.test(value)||Number(value)>(resource.startsWith('catalog/')?200:500)))throw fail(400,'LabelOS page limit exceeded');
  if(['from','to'].includes(key)&&(!/^\d{4}-\d{2}-\d{2}$/.test(value)||!Number.isFinite(Date.parse(value))||new Date(value).toISOString().slice(0,10)!==value))throw fail(400,'Invalid LabelOS date');
  output.set(key,value);
 }
 if(resource==='analytics/timeseries'&&['limit','cursor','sort'].some(key=>output.has(key)))throw fail(400,'LabelOS daily time series does not support pagination or sorting');
 const from=output.get('from'),to=output.get('to');
 if(from&&to){if(from>to)throw fail(400,'LabelOS date range is reversed');const start=new Date(from),end=new Date(to),limit=new Date(start);limit.setUTCMonth(limit.getUTCMonth()+24);if(end>=limit)throw fail(400,'LabelOS date range must be shorter than 24 months');}
 return {path,query:output};
}
export function createLabelOSSource({organizationId,apiKey,fetchImpl=fetch,now=()=>new Date().toISOString()}={}){
 if(!identifier(organizationId)||organizationId==='defiant_synthetic_demo'||typeof apiKey!=='string'||!/^lok_[A-Za-z0-9_]{8,240}$/.test(apiKey)||typeof fetchImpl!=='function')throw Error('Explicit private LabelOS organization and credential required');
 const source=Object.freeze({id:'labelos',environment:'sandbox',provenance:'provider-reported',verification:'sandbox-unverified',readOnly:true});let pending=false,lastRequest=0;
 async function get(resource,query){
  const request=labelOSRequest(resource,query);
  // No queued polling or automatic retry: a caller can retry after the local/provider limit.
  if(pending||Date.now()-lastRequest<1100)throw fail(429,'LabelOS request pacing limit; retry later');
  pending=true;lastRequest=Date.now();
  try{
   const url=new URL(request.path,ORIGIN);url.search=request.query.toString();
   let response;try{response=await fetchImpl(url,{method:'GET',redirect:'error',headers:{Authorization:'Bearer '+apiKey,Accept:'application/json'},signal:AbortSignal.timeout(30000)});}catch{throw fail(502,'LabelOS source did not complete');}
   let size=0;const chunks=[];for await(const chunk of response.body??[]){size+=chunk.length;if(size>8*1024*1024)throw fail(502,'LabelOS response exceeds limit');chunks.push(chunk);}
   let payload;try{payload=JSON.parse(Buffer.concat(chunks).toString('utf8'));}catch{throw fail(502,'Invalid LabelOS response');}
   if(!response.ok){const status=response.status===422?422:response.status===429?429:502;throw fail(status,status===422?'Metric, filter or breakdown combination is unsupported by LabelOS':status===429?'LabelOS quota reached':'LabelOS source is unavailable');}
   if(!payload||!Object.hasOwn(payload,'data'))throw fail(502,'LabelOS response is missing data');
   return {schemaVersion:1,source,scope:{organizationId},resource,retrievedAt:now(),data:payload.data,...(payload.page?{page:payload.page}:{}),...(payload.meta?{meta:payload.meta}:{}),capabilities:{readOnly:true,canApproveRights:false,canExecuteCampaign:false}};
  }finally{pending=false;}
 }
 return Object.freeze({organizationId,read:get});
}
export function configuredLabelOSProvider(env=process.env){
 const org=env.STUDIO_LABELOS_ORGANIZATION_ID,key=env.STUDIO_LABELOS_API_KEY;
 if(!org&&!key)return null;
 const source=createLabelOSSource({organizationId:org,apiKey:key});
 return async({organizationId})=>organizationId===org?source:null;
}
export async function labelOSSourceRequest({source,organizationId,method,url}){
 if(method!=='GET')throw fail(405,'LabelOS source is read-only');
 if(source?.organizationId!==organizationId)throw fail(403,'LabelOS source scope denied');
 const prefix=`/api/studio/defiant-data/${organizationId}/labelos/`;
 if(!url.pathname.startsWith(prefix))throw fail(404,'Unknown LabelOS route');
 return source.read(url.pathname.slice(prefix.length),url.searchParams);
}
