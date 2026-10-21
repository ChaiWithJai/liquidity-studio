import test from 'node:test';
import assert from 'node:assert/strict';
import {createLabelOSSource,configuredLabelOSProvider,labelOSRequest,labelOSSourceRequest} from './labelos-source.js';
const key='lok_test_contract_only';
test('LabelOS request boundary preserves supported filters and rejects URL injection, repeated values and unsupported daily paging',()=>{
 assert.equal(labelOSRequest('catalog/tracks',new URLSearchParams('search=record&limit=200')).path,'/v1/catalog/tracks');
 for(const [resource,q] of [['https://bad.invalid',''],['catalog/tracks','limit=201'],['catalog/tracks','cursor=a&cursor=b'],['catalog/tracks','Authorization=secret'],['analytics/timeseries','limit=500'],['analytics/songs','from=2026-02-30'],['analytics/songs','from=2026-10-01&to=2025-01-01'],['analytics/songs','from=2024-01-01&to=2026-01-01']])assert.throws(()=>labelOSRequest(resource,new URLSearchParams(q)),{status:resource.startsWith('https:')?404:400});
});
test('LabelOS private provider is explicit, fixed-host, scoped and never included in response metadata',async()=>{
 let calls=0;
 const source=createLabelOSSource({organizationId:'org_private',apiKey:key,fetchImpl:async(url,options)=>{
  calls++;assert.equal(url.origin,'https://api-sandbox.labelos.com');assert.equal(options.method,'GET');assert.equal(options.redirect,'error');assert.equal(options.headers.Authorization,'Bearer '+key);
  return new Response(JSON.stringify({data:[{id:'provider-track',title:'Source track'}],page:{has_more:false}}),{status:200});
 }});
 const result=await labelOSSourceRequest({source,organizationId:'org_private',method:'GET',url:new URL('https://studio.test/api/studio/defiant-data/org_private/labelos/catalog/tracks?limit=200')});
 assert.equal(result.source.environment,'sandbox');assert.equal(result.source.provenance,'provider-reported');assert.equal(result.data[0].id,'provider-track');assert.equal(JSON.stringify(result).includes(key),false);
 await assert.rejects(labelOSSourceRequest({source,organizationId:'org_other',method:'GET',url:new URL('https://studio.test/api/studio/defiant-data/org_other/labelos/catalog/tracks')}),{status:403});
 await assert.rejects(labelOSSourceRequest({source,organizationId:'org_private',method:'POST',url:new URL('https://studio.test/api/studio/defiant-data/org_private/labelos/catalog/tracks')}),{status:405});
 assert.equal(calls,1);assert.equal(configuredLabelOSProvider({}),null);
 assert.throws(()=>configuredLabelOSProvider({STUDIO_LABELOS_API_KEY:key}));
 assert.throws(()=>createLabelOSSource({organizationId:'defiant_synthetic_demo',apiKey:key}));
});
test('LabelOS provider 422 and quota errors remain distinct, without raw provider messages or credentials',async()=>{
 for(const status of [422,429,401]){
  const source=createLabelOSSource({organizationId:'org_private',apiKey:key,fetchImpl:async()=>new Response(JSON.stringify({error:{message:key}}),{status})});
  await assert.rejects(source.read('analytics/songs',new URLSearchParams('metrics=streams')),e=>e.status===(status===401?502:status)&&!e.message.includes(key));
 }
});

test('private LabelOS HTTP checks current membership before loading source and after an in-flight provider read',async t=>{
 const [{createHttpServer},{createPlatform},{DurableStore},{DefiantStrategyService}]=await Promise.all([import('./index.js'),import('./platform.js'),import('./storage.js'),import('./defiant-strategy.js')]);
 const store=new DurableStore(':memory:'),platform=createPlatform({store,authMode:'password'});await platform.ready;
 await platform.identity.provision({username:'labelos-owner',password:'hosted-labelos-contract-password',role:'founder'});
 const actor=(await platform.identity.login('labelos-owner','hosted-labelos-contract-password')).user;
 const org=await platform.identity.createOrganization(actor,'Private source contract');await new DefiantStrategyService({store,identity:platform.identity,organizationId:org.id}).enable(actor,{});
 let loads=0,revoke=false;
 const source={organizationId:org.id,read:async()=>{if(revoke)await store.update('identity',state=>({...state,memberships:state.memberships.filter(m=>m.organizationId!==org.id)}));return {data:[],source:{environment:'sandbox'}};}};
 const server=createHttpServer(null,{platform,defiantSourceProvider:async({organizationId})=>{loads++;return organizationId===org.id?source:null;}});
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));t.after(async()=>{await new Promise(resolve=>server.close(resolve));store.close();});
 const base=`http://127.0.0.1:${server.address().port}`,route=`/api/studio/defiant-data/${org.id}/labelos/catalog/tracks`;
 assert.equal((await fetch(base+route)).status,401);assert.equal(loads,0);
 const login=await fetch(base+'/api/auth/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({username:'labelos-owner',password:'hosted-labelos-contract-password'})});
 const headers={cookie:login.headers.get('set-cookie').split(';')[0]};
 assert.equal((await fetch(base+route,{headers})).status,200);assert.equal(loads,1);
 revoke=true;assert.equal((await fetch(base+route,{headers})).status,403);assert.equal(loads,2);
 assert.equal((await fetch(base+route,{headers})).status,403);assert.equal(loads,2);
});
