import test from 'node:test';
import assert from 'node:assert/strict';
import {randomUUID} from 'node:crypto';
import {mkdtempSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {DurableStore} from './storage.js';
import {IdentityService} from './auth.js';
import {DefiantStrategyService,strategyOrganizations} from './defiant-strategy.js';
import {createPlatform} from './platform.js';
import {createHttpServer} from './index.js';
async function setup(t){
 const dir=mkdtempSync(join(tmpdir(),'defiant-')),path=join(dir,'state.sqlite'),store=new DurableStore(path),identity=new IdentityService(store);
 t.after(()=>{store.close();rmSync(dir,{recursive:true,force:true});});
 for(const role of ['founder','marketer'])await identity.provision({username:role,password:'defiant-hosted-only-password',role});
 const founder=(await identity.login('founder','defiant-hosted-only-password')).user,marketer=(await identity.login('marketer','defiant-hosted-only-password')).user;
 const org=await identity.createOrganization(founder,'Isolated label');
 const service=new DefiantStrategyService({store,identity,organizationId:org.id});
 const command=(kind='demo',data)=>({expectedRevision:2,idempotencyKey:randomUUID(),kind,...(data?{data}:{})});
 return {dir,path,store,identity,founder,marketer,org,service,command};
}
test('explicit empty organization enables without a brand; pilot and foreign scopes remain untouched',async t=>{
 const f=await setup(t),before=f.store.get('identity');await assert.rejects(f.service.read(f.founder),{status:404});
 const capabilities=await strategyOrganizations({store:f.store,identity:f.identity,actor:f.founder,organizations:await f.identity.organizations(f.founder)});
 assert.equal(capabilities.find(x=>x.id===f.org.id).strategy.canEnable,true);assert.equal(capabilities.find(x=>x.id==='org_default').strategy.canEnable,false);
 assert.equal((await f.service.enable(f.founder,{})).revision,1);const state=await f.service.read(f.founder);assert.deepEqual(state.graph.nodes,[]);assert.deepEqual(state.destinations,[]);assert.deepEqual(f.store.get('identity'),before);
 await assert.rejects(f.service.read(f.marketer),{status:403});await assert.rejects(new DefiantStrategyService({store:f.store,identity:f.identity,organizationId:'org_default'}).enable(f.founder,{}),{status:403});
 assert.deepEqual(f.store.keys('scope:'),[]);
});
test('labeled demo is deliberate and durable; projection retains regional truth and suggestions',async t=>{
 const f=await setup(t);await f.service.enable(f.founder,{});const preview=await f.service.preview(f.founder,{kind:'demo'});assert.equal(preview.counts.nodes,21);assert.equal((await f.service.read(f.founder)).revision,1);
 const input={expectedRevision:1,idempotencyKey:randomUUID(),kind:'demo'};await f.service.import(f.founder,input);const state=await f.service.read(f.founder);assert.equal(state.graph.nodes.length,21);assert.ok(state.graph.nodes.every(n=>n.verification==='example'));assert.ok(state.resources.every(r=>r.rights.status==='unknown'));assert.ok(state.graph.nodes.every(n=>n.x===undefined));
 const graph=await f.service.graph(f.founder,{focusId:'yt_sig_lagos_01',selectedId:'edge_lagos_to_london'}),edge=graph.edges.find(e=>e.id==='edge_lagos_to_london');assert.equal(edge.from,'yt_sig_lagos_01');assert.equal(edge.sourceRegion,'node_lagos');assert.equal(graph.selectedItem.from,'node_lagos');assert.ok(graph.relatedResources.every(n=>n.suggestion===true&&n.rights.status==='unknown'));
 const second=new DurableStore(f.path);try{const reopened=new DefiantStrategyService({store:second,identity:f.identity,organizationId:f.org.id});assert.deepEqual((await reopened.read(f.founder)).graph,state.graph);}finally{second.close();}
});
test('lost reply replay uses same receipt and repeated demo preserves human interpretation',async t=>{
 const f=await setup(t);await f.service.enable(f.founder,{});const input={expectedRevision:1,idempotencyKey:randomUUID(),kind:'demo'},result=await f.service.import(f.founder,input);
 f.store.update(f.service.key,s=>{s.annotations.push({id:'human-note',text:'Keep my reasoning'});return s;});
 assert.deepEqual(await f.service.import(f.founder,input),result);await assert.rejects(f.service.import(f.founder,{...input,expectedRevision:2}),{status:409});
 await f.service.import(f.founder,{...input,expectedRevision:2,idempotencyKey:randomUUID()});assert.equal((await f.service.read(f.founder)).annotations[0].text,'Keep my reasoning');
});
test('real owned intake is previewed as user-reported, invalid input has no partial writes',async t=>{
 const f=await setup(t);await f.service.enable(f.founder,{});
 const data={nodes:[{id:'owned-producer',kind:'person',name:'Our imported producer'}],edges:[],evidence:[{id:'owned-evidence',sourceUrl:'https://example.com/owned-reference',title:'Manager supplied reference'}],observations:[],resources:[{id:'owned-resource',nodeId:'owned-producer',capabilities:['production'],rights:{notes:'Permission not confirmed'},availability:{timeZone:'Europe/London'}}]};
 const p=await f.service.preview(f.founder,{kind:'owned',data});assert.equal(p.data.evidence[0].method,'manual-import');const input={expectedRevision:1,idempotencyKey:randomUUID(),kind:'owned',data};await f.service.import(f.founder,input);assert.equal((await f.service.read(f.founder)).resources[0].rights.status,'unverified');
 const initialGraph=await f.service.graph(f.founder);assert.equal(initialGraph.nodes[0].id,'owned-producer');assert.deepEqual(initialGraph.edges,[]);
 const focused=await f.service.graph(f.founder,{focusId:'owned-producer',selectedId:'owned-producer'});assert.equal(focused.nodes[0].id,'owned-producer');assert.equal(focused.selectedItem.resource.rights.status,'unverified');assert.equal(focused.nodes[0].regionId,undefined);
 const before=f.store.get(f.service.key);await assert.rejects(f.service.import(f.founder,{...input,expectedRevision:2,idempotencyKey:randomUUID(),data:{...data,edges:[{id:'broken',kind:'route',name:'Missing',from:'owned-producer',to:'absent'}]}}),{status:422});assert.deepEqual(f.store.get(f.service.key),before);
 await assert.rejects(f.service.preview(f.founder,{kind:'owned',data:{...data,nodes:[{...data.nodes[0],organizationId:'foreign'}]}}),{status:422});
 await assert.rejects(f.service.preview(f.founder,{kind:'owned',data:{...data,nodes:Array.from({length:257},(_,i)=>({...data.nodes[0],id:'n'+i}))}}),{status:422});
});
test('transaction rereads actual membership after advisory authorization',async t=>{
 const f=await setup(t);await f.service.enable(f.founder,{});const original=f.store.transact.bind(f.store);f.store.transact=(keys,callback)=>{f.store.update('identity',state=>{state.memberships=state.memberships.filter(m=>m.organizationId!==f.org.id);return state;});return original(keys,callback);};
 await assert.rejects(f.service.import(f.founder,{expectedRevision:1,idempotencyKey:randomUUID(),kind:'demo'}),{status:403});assert.equal(f.store.get(f.service.key).revision,1);
});
test('HTTP strategy discovery works before brand bootstrap with actual existing opaque sessions',async t=>{
 const store=new DurableStore(':memory:'),platform=createPlatform({store,authMode:'password'});await platform.ready;await platform.identity.provision({username:'label-founder',password:'hosted-label-password',role:'founder'});
 const server=createHttpServer(null,{platform});await new Promise(r=>server.listen(0,'127.0.0.1',r));t.after(async()=>{await new Promise(r=>server.close(r));store.close();});const base=`http://127.0.0.1:${server.address().port}`;
 const login=await fetch(base+'/api/auth/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({username:'label-founder',password:'hosted-label-password'})}),cookie=login.headers.get('set-cookie').split(';')[0];
 const api=async(path,body)=>{const r=await fetch(base+path,{method:body===undefined?'GET':'POST',headers:{Cookie:cookie,'Content-Type':'application/json'},body:body===undefined?undefined:JSON.stringify(body)});return {status:r.status,data:await r.json()};};
 const org=(await api('/api/admin/organizations',{name:'Separate label'})).data.organization;const path='/api/studio/strategy/'+org.id;assert.equal((await api(path)).status,404);assert.equal((await api(path+'/enable',{})).status,200);assert.equal((await api(path)).status,200);assert.equal((await api('/api/auth/session')).data.organizations.find(o=>o.id===org.id).strategy.enabled,true);assert.equal((await fetch(base+path)).status,401);
 assert.equal((await api('/api/studio/strategy/org_default/enable',{})).status,403);assert.equal((await api(path+'/import',{expectedRevision:1,idempotencyKey:randomUUID(),kind:'demo'})).status,200);assert.equal((await api(path+'/graph?focusId=node_lagos')).data.nodes[0].id,'node_lagos');
});

test('unlocated focused signal shows only real incident edges and bounded neighbors',async t=>{
 const f=await setup(t);await f.service.enable(f.founder,{});
 const data={nodes:[{id:'s',kind:'signal',name:'Imported session'},{id:'p',kind:'person',name:'Owned collaborator'},{id:'other',kind:'person',name:'Unrelated'}],edges:[{id:'link',kind:'relationship',name:'Manager reported collaboration',from:'s',to:'p'}]};
 await f.service.import(f.founder,{expectedRevision:1,idempotencyKey:randomUUID(),kind:'owned',data});
 const graph=await f.service.graph(f.founder,{focusId:'s',selectedId:'p'});assert.deepEqual(graph.nodes.map(n=>n.id),['s','p']);assert.deepEqual(graph.edges.map(e=>e.id),['link']);assert.equal(graph.edges[0].from,'s');assert.equal(graph.nodes.some(n=>n.kind==='region'),false);assert.equal(graph.selectedItem.name,'Owned collaborator');
});
