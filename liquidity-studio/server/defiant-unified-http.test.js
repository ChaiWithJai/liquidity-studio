import test from 'node:test';
import assert from 'node:assert/strict';
import {defiantUnifiedRequest} from './defiant-unified-http.js';
import {createHttpServer} from './index.js';
import {createPlatform} from './platform.js';
import {DurableStore} from './storage.js';
import {DefiantStrategyService} from './defiant-strategy.js';

test('data transport rejects mutation, unknown and repeated filters before facade execution',async()=>{
 let calls=0;const user={id:'actor'},service={read:async(actor,input)=>{calls++;assert.equal(actor,user);return input;}};
 const request=(path,method='GET')=>defiantUnifiedRequest({service,user,route:new URL(path,'https://example.test').pathname,url:new URL(path,'https://example.test'),method});
 for(const [path,method,status] of [['/api/studio/defiant-data/org/artists','POST',405],['/api/studio/defiant-data/org/raw','GET',404],['/api/studio/defiant-data/org/tracks?query=a&query=b','GET',400],['/api/studio/defiant-data/org/tracks?limit=101','GET',400],['/api/studio/defiant-data/org/tracks?actor=founder','GET',400]])await assert.rejects(request(path,method),{status});
 assert.equal(calls,0);assert.deepEqual(await request('/api/studio/defiant-data/org/tracks?limit=2&query=signal'),{resource:'tracks',limit:2,query:'signal'});
});

test('data HTTP uses authenticated current strategy membership before dataset loading and after revocation',async t=>{
 const store=new DurableStore(':memory:'),platform=createPlatform({store,authMode:'password'});await platform.ready;
 await platform.identity.provision({username:'data-founder',password:'hosted-data-fixture-password',role:'founder'});
 const actor=(await platform.identity.login('data-founder','hosted-data-fixture-password')).user,org=await platform.identity.createOrganization(actor,'Synthetic data fixture');
 await new DefiantStrategyService({store,identity:platform.identity,organizationId:org.id}).enable(actor,{});
 let loads=0;const dataset={dataset:{id:'fictional-fixture',label:'Fictional hosted fixture',provenance:'synthetic',asOf:null},artists:[{id:'artist_one',name:'Fictional Artist'}],tracks:[],sources:[],campaigns:[],opportunities:[]};
 const server=createHttpServer(null,{platform,defiantDatasetProvider:async({organizationId})=>{assert.equal(organizationId,org.id);loads++;return dataset;}});
 await new Promise(r=>server.listen(0,'127.0.0.1',r));t.after(async()=>{await new Promise(r=>server.close(r));store.close();});
 const base=`http://127.0.0.1:${server.address().port}`,path=`/api/studio/defiant-data/${org.id}/manifest`;
 assert.equal((await fetch(base+path)).status,401);assert.equal(loads,0);
 const login=await fetch(base+'/api/auth/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({username:'data-founder',password:'hosted-data-fixture-password'})});const cookie=login.headers.get('set-cookie').split(';')[0],headers={cookie};
 const response=await fetch(base+path,{headers});assert.equal(response.status,200);const result=await response.json();assert.equal(result.dataset.provenance,'synthetic');assert.equal(loads,1);
 const pathways=await fetch(base+path.replace('/manifest','/pathways'),{headers});assert.equal(pathways.status,200);assert.equal((await pathways.json()).pathways.length,3);
 const view=await fetch(base+path.replace('/manifest','/view?pathwayId=talent-to-campaign&artistId=artist_one'),{headers});assert.equal(view.status,200);assert.equal((await view.json()).status,'needs-workspace-context');
 const invalidView=await fetch(base+path.replace('/manifest','/view?pathwayId=eval'),{headers});assert.equal(invalidView.status,400);const authorizedLoads=loads;
 store.update('identity',state=>({...state,memberships:state.memberships.filter(m=>m.organizationId!==org.id)}));
 assert.equal((await fetch(base+path,{headers})).status,403);assert.equal(loads,authorizedLoads);
});
