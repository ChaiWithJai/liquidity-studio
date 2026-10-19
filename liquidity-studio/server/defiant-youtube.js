// Manual public metadata only. No media download, OAuth, scheduler or derived scores.
import {createHash} from 'node:crypto';
import {fail} from './auth.js';
import {emptyInbox,readInbox} from './defiant-inbox.js';
const clone=x=>structuredClone(x),hash=x=>createHash('sha256').update(JSON.stringify(x)).digest('hex');
const UUID=/^[a-f0-9]{8}-(?:[a-f0-9]{4}-){3}[a-f0-9]{12}$/;
const queryId=/^[A-Za-z0-9_-]{1,80}$/;
const cachePrefix=org=>`defiant-youtube-observations:${org}:`;
const exact=(v,keys)=>{if(!v||typeof v!=='object'||Array.isArray(v)||Object.keys(v).some(k=>!keys.includes(k)))throw fail(400,'Unsupported discovery fields');};
export function createYouTubeMetadataProvider({apiKey,fetchImpl=fetch}={}){
 if(!apiKey)return null;if(typeof apiKey!=='string'||apiKey.length<10||apiKey.length>256)throw Error('Private YouTube API key required');
 async function get(endpoint,params){
  const url=new URL('https://www.googleapis.com/youtube/v3/'+endpoint);for(const [k,v] of Object.entries({...params,key:apiKey}))url.searchParams.set(k,String(v));
  let response;try{response=await fetchImpl(url,{redirect:'error',signal:AbortSignal.timeout(15000),headers:{Accept:'application/json'}});}catch{throw fail(502,'YouTube metadata request did not complete');}let size=0;const parts=[];
  for await(const chunk of response.body||[]){size+=chunk.length;if(size>512*1024)throw fail(502,'YouTube metadata exceeds the response limit');parts.push(chunk);}
  let data;try{data=JSON.parse(Buffer.concat(parts).toString('utf8'));}catch{throw fail(502,'YouTube metadata response is invalid');}
  if(!response.ok){const quota=['quotaExceeded','dailyLimitExceeded'].includes(data.error?.errors?.[0]?.reason);throw Object.assign(fail(quota?429:response.status===403?503:502,quota?'YouTube daily quota reached':'YouTube metadata is unavailable'),{providerCode:quota?'quota-exceeded':'provider-unavailable'});}
  return data;
 }
 return {async search({query,pageToken}){
  const search=await get('search',{part:'snippet',type:'video',q:query,maxResults:25,order:'relevance',...(pageToken?{pageToken}:{})});
  if(!Array.isArray(search.items)||search.items.length>25)throw fail(502,'YouTube search response is invalid');
  const ids=[...new Set(search.items.map(i=>i.id?.videoId).filter(id=>/^[A-Za-z0-9_-]{11}$/.test(id||'')))];
  const details=ids.length?await get('videos',{part:'snippet,statistics,status',id:ids.join(',')}):{items:[]};
  if(!Array.isArray(details.items)||details.items.length>25)throw fail(502,'YouTube video response is invalid');
  return {items:details.items.filter(i=>ids.includes(i.id)).map(i=>({videoId:i.id,title:String(i.snippet?.title||'YouTube video').slice(0,500),creator:String(i.snippet?.channelTitle||'').slice(0,200),channelId:/^UC[A-Za-z0-9_-]{22}$/.test(i.snippet?.channelId||'')?i.snippet.channelId:null,publishedAt:Number.isFinite(Date.parse(i.snippet?.publishedAt))?new Date(i.snippet.publishedAt).toISOString():null,embeddable:i.status?.embeddable===true,madeForKids:i.status?.madeForKids===true,statistics:Object.fromEntries([['views','viewCount'],['likes','likeCount'],['comments','commentCount']].flatMap(([metric,k])=>{const v=Number(i.statistics?.[k]);return i.statistics?.[k]!==undefined&&Number.isSafeInteger(v)&&v>=0?[[metric,v]]:[];}))})),nextPageToken:typeof search.nextPageToken==='string'&&search.nextPageToken.length<=512?search.nextPageToken:null,quota:{searchCalls:1,videoListCalls:ids.length?1:0}};
 }};
}
export class DefiantYouTube {
 constructor(strategy,provider=null){this.strategy=strategy;this.provider=provider;this.store=strategy.store;}
 async read(actor){const {state}=await this.strategy.raw(actor);const discovery=state.inbox?.discovery||{queries:[],runs:[]},last=discovery.runs.at(-1)||null;let cache=last?await this.store.get(cachePrefix(this.strategy.organizationId)+last.id):null;
  if(cache&&Date.parse(cache.expiresAt)<=Date.parse(this.strategy.now())){await this.store.delete(cachePrefix(this.strategy.organizationId)+last.id);cache=null;}
  await this.strategy.authority(actor);return {configured:Boolean(this.provider),revision:state.revision,queries:clone(discovery.queries),lastRun:last?{...clone(last),nextPageToken:cache?.nextPageToken||null,expiresAt:cache?.expiresAt||null}:null};
 }
 async queries(actor,input){exact(input,['expectedRevision','idempotencyKey','queries']);if(!Array.isArray(input.queries)||!input.queries.length||input.queries.length>8||new Set(input.queries.map(q=>q.id)).size!==input.queries.length||input.queries.some(q=>{exact(q,['id','query']);return !queryId.test(q.id||'')||typeof q.query!=='string'||!q.query.trim()||q.query.length>300;}))throw fail(422,'Save one to eight named search queries');
  return this.strategy.inboxWrite(actor,input,'youtube-queries',state=>{state.inbox=state.inbox||emptyInbox();state.inbox.discovery=state.inbox.discovery||{queries:[],runs:[]};state.inbox.discovery.queries=input.queries.map(q=>({id:q.id,query:q.query.trim()}));return {queries:clone(state.inbox.discovery.queries)};});
 }
 async run(actor,input){
  exact(input,['expectedRevision','idempotencyKey','queryId','pageToken']);if(!UUID.test(input.idempotencyKey||'')||!queryId.test(input.queryId||'')||input.pageToken!==undefined&&(typeof input.pageToken!=='string'||input.pageToken.length>512))throw fail(400,'Retain the search request and saved query');
  if(!this.provider)throw fail(503,'YouTube search is not configured; saved sources are unchanged');
  const {state}=await this.strategy.raw(actor),requestHash=hash({operation:'youtube-run',input}),prior=state.receipts.find(r=>r.id===input.idempotencyKey);
  if(prior){if(prior.actorId!==actor.id||prior.requestHash!==requestHash)throw fail(409,'Search request belongs to different content');return clone(prior.result);}
  const query=state.inbox?.discovery?.queries.find(q=>q.id===input.queryId);if(!query)throw fail(409,'Save this search query first');if(state.revision!==input.expectedRevision)throw fail(409,'Workspace changed; retain the search request');
  const cacheKey=cachePrefix(this.strategy.organizationId)+input.idempotencyKey;
  // An immutable short-lived observation cache retains one actual provider result
  // across an unknown final save. TTL applies to this cache, never manager facts.
  let cached=await this.store.get(cacheKey);
  if(cached&&(cached.actorId!==actor.id||cached.requestHash!==requestHash))throw fail(409,'Search result belongs to different content');
  if(!cached){let result;try{result=await this.provider.search({query:query.query,pageToken:input.pageToken});}catch(error){
    if(![429,502,503].includes(error.status))throw error;
    return this.strategy.inboxWrite(actor,input,'youtube-run',s=>{s.inbox.discovery.runs=[...s.inbox.discovery.runs.slice(-31),{id:input.idempotencyKey,queryId:query.id,status:'error',errorCode:error.providerCode||'provider-unavailable',checkedAt:this.strategy.now(),createdBy:actor.id}];return {run:clone(s.inbox.discovery.runs.at(-1))};});
   }
   const observedAt=this.strategy.now();cached={kind:'youtube-observation-cache',actorId:actor.id,requestHash,observedAt,expiresAt:new Date(Date.parse(observedAt)+30*86400000).toISOString(),...result};
   await this.strategy.authority(actor);cached=await this.store.update(cacheKey,existing=>{if(existing&&existing.requestHash!==requestHash)throw fail(409,'Search result changed');return existing||cached;});
  }
  return this.strategy.inboxWrite(actor,input,'youtube-run',s=>{
   const current=s.inbox?.discovery?.queries.find(q=>q.id===query.id);if(current?.query!==query.query)throw fail(409,'Saved query changed; retain its result');const box=s.inbox;
   const newItems=cached.items.filter(i=>!box.sources.some(s=>s.id==='youtube:'+i.videoId));if(box.sources.length+newItems.length>128)throw fail(413,'Source inbox capacity reached; existing decisions are retained');
   for(const i of newItems)box.sources.push({id:'youtube:'+i.videoId,provider:'youtube',videoId:i.videoId,sourceUrl:'https://www.youtube.com/watch?v='+i.videoId,title:'YouTube video',creator:'',creatorHandle:null,channelId:null,publishedAt:null,observations:[],revision:1,provenance:{kind:'manual-youtube-discovery',queryId:query.id,runId:input.idempotencyKey},createdBy:actor.id,createdAt:cached.observedAt});
   const run={id:input.idempotencyKey,queryId:query.id,status:'complete',checkedAt:cached.observedAt,newSources:newItems.length,resultCount:cached.items.length,quota:cached.quota,createdBy:actor.id};box.discovery.runs=[...box.discovery.runs.slice(-31),run];return {run:clone(run)};
  });
 }
 async project(actor,input={}){
  const {state}=await this.strategy.raw(actor),inbox=await this.strategy.inbox(actor,{}),runs=state.inbox?.discovery?.runs||[];const now=Date.parse(this.strategy.now()),latest=new Map();
  for(const run of runs.slice(-32)){const cache=await this.store.get(cachePrefix(this.strategy.organizationId)+run.id);if(!cache)continue;if(Date.parse(cache.expiresAt)<=now){await this.store.delete(cachePrefix(this.strategy.organizationId)+run.id);continue;}for(const item of cache.items)latest.set('youtube:'+item.videoId,{...item,observedAt:cache.observedAt,expiresAt:cache.expiresAt});}
  const merge=s=>{if(!s)return s;const i=latest.get(s.id);if(!i)return s;const {statistics,videoId,observedAt,expiresAt,...metadata}=i;return {...s,...metadata,liveMetadata:{...metadata,observedAt,expiresAt},observations:[...Object.entries(statistics).map(([metric,value])=>({metric,value,unit:'count',observedAt,expiresAt,method:'youtube-data-api',provenance:{provider:'youtube',videoId}})),...s.observations]};};
  await this.strategy.authority(actor);return readInbox({...state,inbox:{...state.inbox,sources:inbox.sources.map(merge)}},input);
 }
}
