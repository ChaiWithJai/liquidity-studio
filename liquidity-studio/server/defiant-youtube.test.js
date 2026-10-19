import test from 'node:test';
import assert from 'node:assert/strict';
import {randomUUID} from 'node:crypto';
import {DurableStore} from './storage.js';
import {IdentityService} from './auth.js';
import {DefiantStrategyService} from './defiant-strategy.js';
import {DefiantYouTube,createYouTubeMetadataProvider} from './defiant-youtube.js';
const videoId='abcdefghijk',sourceId='youtube:'+videoId;
async function fixture(t){const store=new DurableStore(':memory:');t.after(()=>store.close());const identity=new IdentityService(store);await identity.provision({username:'discovery-founder',password:'private-discovery-password',role:'founder'});const actor=(await identity.login('discovery-founder','private-discovery-password')).user,org=await identity.createOrganization(actor,'Manual source discovery');let now='2026-10-19T12:00:00.000Z';const strategy=new DefiantStrategyService({store,identity,organizationId:org.id,now:()=>now}),input=x=>({expectedRevision:store.get(strategy.key).revision,idempotencyKey:randomUUID(),...x});await strategy.enable(actor,{});return {store,identity,actor,org,strategy,input,setNow:v=>now=v};}
const result=()=>({items:[{videoId,title:'Current creator source',creator:'Creator',channelId:null,publishedAt:'2026-10-01T12:00:00Z',embeddable:true,madeForKids:false,statistics:{views:42,likes:3}}],nextPageToken:'next-page',quota:{searchCalls:1,videoListCalls:1}});
test('one manual provider run persists query identity and current observations, exact replay makes no second call',async t=>{
 const f=await fixture(t);let calls=0;const service=new DefiantYouTube(f.strategy,{search:async()=>{calls++;return result();}});
 await service.queries(f.actor,f.input({queries:[{id:'nipsey',query:'Nipsey ownership'}]}));const request=f.input({queryId:'nipsey'}),ack=await service.run(f.actor,request);assert.equal(calls,1);assert.deepEqual(await service.run(f.actor,request),ack);assert.equal(calls,1);
 const inbox=await service.project(f.actor,{sourceId});assert.equal(inbox.selected.title,'Current creator source');assert.equal(inbox.selected.observations[0].observedAt,'2026-10-19T12:00:00.000Z');assert.equal(inbox.selected.observations[0].value,42);assert.equal(f.store.get(f.strategy.key).inbox.sources[0].observations.length,0,'Provider values never enter retained imported facts');assert.equal((await service.read(f.actor)).lastRun.nextPageToken,'next-page');
 f.setNow('2026-11-19T12:00:00.000Z');const expired=await service.project(f.actor,{sourceId});assert.equal(expired.selected.title,'YouTube video');assert.deepEqual(expired.selected.observations,[]);assert.equal(f.store.get(`defiant-youtube-observations:${f.org.id}:${request.idempotencyKey}`),null);
});
test('live refresh keeps manager match and original imported source facts',async t=>{
 const f=await fixture(t),preview=await f.strategy.previewInbox(f.actor,{kind:'nipsey-example'});await f.strategy.importInbox(f.actor,f.input({kind:'nipsey-example',previewDigest:preview.previewDigest}));const before=f.store.get(f.strategy.key).inbox,saved=before.sources[0],match=before.matches.find(m=>m.sourceId===saved.id);
 await f.strategy.updateInboxMatch(f.actor,saved.id,f.input({expectedMatchRevision:match.revision,match:{recordingId:match.recordingId,workstreamId:match.workstreamId,stage:'selected',rationale:'Manager decision retained'}}));
 const providerResult=result();providerResult.items[0].videoId=saved.videoId;const service=new DefiantYouTube(f.strategy,{search:async()=>providerResult});await service.queries(f.actor,f.input({queries:[{id:'refresh',query:'Manual search'}]}));await service.run(f.actor,f.input({queryId:'refresh'}));
 const state=f.store.get(f.strategy.key);assert.deepEqual(state.inbox.sources[0],saved);assert.equal(state.inbox.matches.find(m=>m.sourceId===saved.id).rationale,'Manager decision retained');assert.equal((await service.project(f.actor,{sourceId:saved.id})).selected.observations[0].method,'youtube-data-api');
});
test('unconfigured search makes no run; provider quota failure is explicit and durable without source mutation',async t=>{
 const f=await fixture(t);const disabled=new DefiantYouTube(f.strategy);assert.equal((await disabled.read(f.actor)).configured,false);await assert.rejects(disabled.run(f.actor,f.input({queryId:'none'})),{status:503});
 const service=new DefiantYouTube(f.strategy,{search:async()=>{throw Object.assign(Error('quota'),{status:429,providerCode:'quota-exceeded'});}});await service.queries(f.actor,f.input({queries:[{id:'query',query:'Manual query'}]}));const ack=await service.run(f.actor,f.input({queryId:'query'}));assert.equal(ack.run.errorCode,'quota-exceeded');assert.equal(f.store.get(f.strategy.key).inbox.sources.length,0);
});
test('official provider is fixed-origin one search page and one batched videos read, preserving unknown statistics',async()=>{
 const calls=[],provider=createYouTubeMetadataProvider({apiKey:'private-provider-fixture',fetchImpl:async(url,options)=>{calls.push({url:new URL(url),options});return Response.json(calls.length===1?{items:[{id:{videoId}}],nextPageToken:'next'}:{items:[{id:videoId,snippet:{title:'Supplied API title',channelTitle:'Channel',publishedAt:'2026-10-01T00:00:00Z'},statistics:{viewCount:'123'},status:{embeddable:true}}]});}});
 const actual=await provider.search({query:'Nipsey',pageToken:'page'});assert.equal(calls.length,2);assert.equal(calls[0].url.origin,'https://www.googleapis.com');assert.equal(calls[0].url.searchParams.get('maxResults'),'25');assert.equal(calls[0].url.searchParams.get('type'),'video');assert.equal(calls[1].url.searchParams.get('id'),videoId);assert.deepEqual(actual.items[0].statistics,{views:123});assert.equal(actual.nextPageToken,'next');assert.ok(!JSON.stringify(actual).includes('private-provider-fixture'));assert.equal(createYouTubeMetadataProvider({}),null);
});
