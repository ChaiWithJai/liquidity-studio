import test from 'node:test';
import assert from 'node:assert/strict';
import {randomUUID} from 'node:crypto';
import {DurableStore} from './storage.js';
import {IdentityService} from './auth.js';
import {DefiantStrategyService} from './defiant-strategy.js';
import {createPlatform} from './platform.js';
import {createHttpServer} from './index.js';
async function fixture(t){
 const store=new DurableStore(':memory:'),identity=new IdentityService(store);t.after(()=>store.close());await identity.provision({username:'strategist',password:'hosted-planning-password',role:'founder'});const actor=(await identity.login('strategist','hosted-planning-password')).user,org=await identity.createOrganization(actor,'Planning label'),service=new DefiantStrategyService({store,identity,organizationId:org.id,now:()=>new Date().toISOString()});await service.enable(actor,{});await service.import(actor,{expectedRevision:1,idempotencyKey:randomUUID(),kind:'demo'});
 const command=body=>({expectedRevision:store.get(service.key).revision,idempotencyKey:randomUUID(),...body});return {store,identity,actor,org,service,command};
}
const note=text=>({targetId:'yt_sig_lagos_01',kind:'question',text});
test('notes retain actual actor and source revision; lost reply cannot erase a later edit',async t=>{
 const f=await fixture(t),before=f.store.get(f.service.key).graph,input=f.command({annotation:note('Who can verify this bridge?')}),first=await f.service.annotate(f.actor,input);
 assert.equal(first.annotation.authorId,f.actor.id);assert.equal(first.annotation.revision,1);assert.ok(Number.isFinite(Date.parse(first.annotation.createdAt)));assert.equal(first.annotation.sourceRevision,2);assert.deepEqual(await f.service.annotate(f.actor,input),first);
 const second=await f.service.annotate(f.actor,f.command({annotation:{...note('Keep my revised reasoning'),id:first.annotation.id}}));assert.equal(second.annotation.revision,2);await f.service.annotate(f.actor,input);assert.equal(f.store.get(f.service.key).annotations[0].text,'Keep my revised reasoning');assert.deepEqual(f.store.get(f.service.key).graph,before);
 await assert.rejects(f.service.annotate(f.actor,{...input,annotation:note('Changed under same key')}),{status:409});
 await assert.rejects(f.service.annotate(f.actor,f.command({annotation:{...note('Forged author'),authorId:'someone-else'}})),{status:400});
});
test('saved views capture shortlist and layout without moving domain nodes',async t=>{
 const f=await fixture(t),before=f.store.get(f.service.key).graph,result=await f.service.saveView(f.actor,f.command({view:{name:'London route',focus:'yt_sig_lagos_01',selected:'edge_lagos_to_london',planIds:['yt_sig_lagos_01','edge_lagos_to_london'],positions:{node_lagos:{x:12,y:35}},filters:{showExamples:true,kinds:['artist','route']}}}));
 assert.equal(result.view.positions.node_lagos.x,12);assert.equal(result.view.authorId,f.actor.id);assert.deepEqual(f.store.get(f.service.key).graph,before);assert.equal((await f.service.read(f.actor)).views[0].id,result.view.id);
 const stored=f.store.get(f.service.key);await assert.rejects(f.service.saveView(f.actor,f.command({view:{name:'Bad view',positions:{missing:{x:1,y:1}}}})),{status:400});assert.deepEqual(f.store.get(f.service.key),stored);
});
test('reports snapshot findings/evidence/notes; text edits retain snapshot and explicit refresh retains history',async t=>{
 const f=await fixture(t),annotation=(await f.service.annotate(f.actor,f.command({annotation:note('Original interpretation')}))).annotation;
 const report=(await f.service.saveReport(f.actor,f.command({report:{title:'Investigate Lagos–London',thesis:'',planIds:['yt_sig_lagos_01','edge_lagos_to_london']}}))).report;
 assert.equal(report.findings[0].notes[0].text,'Original interpretation');assert.equal(report.findings[0].evidence[0].verification,'unverified-example');assert.equal(report.findings[0].record.verification,'example');assert.equal(report.verifiedFacts,undefined);
 await f.service.annotate(f.actor,f.command({annotation:{...note('New interpretation'),id:annotation.id}}));
 assert.equal((await f.service.read(f.actor)).reports[0].findings[0].notes[0].text,'Original interpretation');
 const edited=(await f.service.saveReport(f.actor,f.command({report:{id:report.id,expectedReportRevision:1,title:'Updated title',thesis:'Working hypothesis'}}))).report;
 assert.deepEqual(edited.findings,report.findings);assert.equal(edited.history[0].title,report.title);assert.equal(edited.history[0].revision,1);
 const refresh=f.command({expectedReportRevision:2,planIds:report.planIds}),fresh=(await f.service.refreshReport(f.actor,report.id,refresh)).report;
 assert.equal(fresh.findings[0].notes[0].text,'New interpretation');assert.equal(fresh.title,'Updated title');assert.equal(fresh.history.length,2);assert.equal(fresh.history[1].findings[0].notes[0].text,'Original interpretation');assert.deepEqual((await f.service.refreshReport(f.actor,report.id,refresh)).report,fresh);
 await assert.rejects(f.service.saveReport(f.actor,f.command({report:{id:report.id,expectedReportRevision:2,title:'Stale',thesis:'Keep local text'}})),{status:409});
});
test('continuous path notes validate real ordered edges; foreign references fail without partial saves',async t=>{
 const f=await fixture(t),target={kind:'path',edgeIds:['edge_lagos_to_london','edge_london_to_toronto']},result=await f.service.annotate(f.actor,f.command({annotation:{target,text:'Check both bridges',kind:'hypothesis'}}));assert.deepEqual(result.annotation.target,target);
 const before=f.store.get(f.service.key);await assert.rejects(f.service.annotate(f.actor,f.command({annotation:{target:{kind:'path',edgeIds:['edge_lagos_to_london','edge_mumbai_to_toronto']},text:'Disconnected',kind:'note'}})),{status:422});assert.deepEqual(f.store.get(f.service.key),before);
 await assert.rejects(f.service.saveReport(f.actor,f.command({report:{title:'Foreign',thesis:'',planIds:['foreign-finding']}})),{status:409});assert.deepEqual(f.store.get(f.service.key),before);
});
test('final transaction membership and CAS reject while preserving existing planning records',async t=>{
 const f=await fixture(t),input=f.command({annotation:note('Retain local unsaved thought')});await f.service.saveView(f.actor,f.command({view:{name:'First view'}}));await assert.rejects(f.service.annotate(f.actor,input),{status:409});
 const before=f.store.get(f.service.key),transact=f.store.transact.bind(f.store);f.store.transact=(keys,callback)=>{f.store.update('identity',i=>{i.memberships=i.memberships.filter(m=>m.organizationId!==f.org.id);return i;});return transact(keys,callback);};await assert.rejects(f.service.annotate(f.actor,f.command({annotation:note('No authority')})),{status:403});assert.deepEqual(f.store.get(f.service.key),before);
});
test('real HTTP writes acknowledge records and reopen the same saved report with no browser-local mock',async t=>{
 const store=new DurableStore(':memory:'),platform=createPlatform({store,authMode:'password'});await platform.ready;await platform.identity.provision({username:'planning-founder',password:'planning-http-password',role:'founder'});const server=createHttpServer(null,{platform});await new Promise(r=>server.listen(0,'127.0.0.1',r));t.after(async()=>{await new Promise(r=>server.close(r));store.close();});const base=`http://127.0.0.1:${server.address().port}`;
 const login=await fetch(base+'/api/auth/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({username:'planning-founder',password:'planning-http-password'})}),cookie=login.headers.get('set-cookie').split(';')[0];const api=async(path,body)=>{const r=await fetch(base+path,{method:body===undefined?'GET':'POST',headers:{Cookie:cookie,'Content-Type':'application/json'},body:body===undefined?undefined:JSON.stringify(body)});return {status:r.status,data:await r.json()};};const org=(await api('/api/admin/organizations',{name:'HTTP planning'})).data.organization,path='/api/studio/strategy/'+org.id;await api(path+'/enable',{});await api(path+'/import',{expectedRevision:1,idempotencyKey:randomUUID(),kind:'demo'});
 const saved=await api(path+'/annotations',{expectedRevision:2,idempotencyKey:randomUUID(),annotation:note('HTTP saved evidence note')});assert.equal(saved.status,200);
 const report=await api(path+'/reports',{expectedRevision:saved.data.revision,idempotencyKey:randomUUID(),report:{title:'Real saved report',thesis:'',planIds:['yt_sig_lagos_01']}});assert.equal(report.status,200);const reopened=(await api(path)).data.reports[0];assert.equal(reopened.id,report.data.report.id);assert.equal(reopened.findings[0].notes[0].text,'HTTP saved evidence note');
 const refreshed=await api(path+'/reports/'+reopened.id+'/refresh',{expectedRevision:report.data.revision,idempotencyKey:randomUUID(),expectedReportRevision:1,planIds:reopened.planIds});assert.equal(refreshed.status,200);assert.equal(refreshed.data.report.revision,2);
});
