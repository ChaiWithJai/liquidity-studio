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
 const view=await f.service.saveView(f.actor,f.command({view:{name:'Ordered bridges',routeEdgeIds:target.edgeIds}}));assert.deepEqual(view.view.routeEdgeIds,target.edgeIds);assert.deepEqual((await f.service.read(f.actor)).views[0].routeEdgeIds,target.edgeIds);
 const before=f.store.get(f.service.key);await assert.rejects(f.service.saveView(f.actor,f.command({view:{name:'Disconnected route',routeEdgeIds:['edge_lagos_to_london','edge_mumbai_to_toronto']}})),{status:422});assert.deepEqual(f.store.get(f.service.key),before);await assert.rejects(f.service.saveView(f.actor,f.command({view:{name:'Missing route',routeEdgeIds:['missing']}})),{status:409});assert.deepEqual(f.store.get(f.service.key),before);await assert.rejects(f.service.annotate(f.actor,f.command({annotation:{target:{kind:'path',edgeIds:['edge_lagos_to_london','edge_mumbai_to_toronto']},text:'Disconnected',kind:'note'}})),{status:422});assert.deepEqual(f.store.get(f.service.key),before);
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

test('report preserves observation and rights sources plus explicitly selected notes outside its findings',async t=>{
 const f=await fixture(t),evidence=[{id:'owned-observation-source',sourceUrl:'https://example.org/observation',title:'Reported observation'},{id:'owned-rights-source',sourceUrl:'https://example.org/rights',title:'Rights reference'}];
 await f.service.import(f.actor,f.command({kind:'owned',data:{nodes:[{id:'owned-resource',kind:'resource',name:'Owned studio',evidenceIds:[]}],edges:[],evidence,observations:[{id:'owned-observation',nodeId:'owned-resource',evidenceId:evidence[0].id,metric:'capacity',unit:'people',value:4}],resources:[{id:'owned-resource-details',nodeId:'owned-resource',rights:{evidenceIds:[evidence[1].id]}}]}}));
 const annotation=(await f.service.annotate(f.actor,f.command({annotation:{...note('Keep this explicitly selected outside note'),evidenceIds:[evidence[0].id]}}))).annotation;
 const report=(await f.service.saveReport(f.actor,f.command({report:{title:'Owned resource review',thesis:'',planIds:['owned-resource'],annotationIds:[annotation.id]}}))).report;
 assert.deepEqual(report.findings[0].evidence.map(e=>e.id).sort(),evidence.map(e=>e.id).sort());assert.equal(report.findings[0].observations[0].evidenceId,evidence[0].id);assert.equal(report.findings[0].resources[0].rights.evidenceIds[0],evidence[1].id);
 assert.deepEqual(report.annotations,[annotation]);assert.equal(report.annotationEvidence[0].id,evidence[0].id);assert.deepEqual(report.findings[0].notes,[]);
 await f.service.annotate(f.actor,f.command({annotation:{...note('Later outside note'),id:annotation.id}}));
 const edited=(await f.service.saveReport(f.actor,f.command({report:{id:report.id,expectedReportRevision:1,title:'Title edit only',thesis:''}}))).report;
 assert.deepEqual(edited.annotations,[annotation]);assert.deepEqual(edited.annotationEvidence,report.annotationEvidence);assert.deepEqual(edited.history[0].annotations,[annotation]);
 const refreshed=(await f.service.refreshReport(f.actor,report.id,f.command({expectedReportRevision:2,planIds:report.planIds,annotationIds:[annotation.id]}))).report;assert.equal(refreshed.annotations[0].text,'Later outside note');assert.deepEqual(refreshed.history[1].annotations,[annotation]);
});

test('ACK aggregate revision chains across record kinds while record revisions stay nested',async t=>{
 const f=await fixture(t),initial=(await f.service.read(f.actor)).revision;
 const annotation=await f.service.annotate(f.actor,{expectedRevision:initial,idempotencyKey:randomUUID(),annotation:note('Use this acknowledged revision')});
 assert.equal(annotation.revision,initial+1);assert.equal(annotation.annotation.revision,1);
 const view=await f.service.saveView(f.actor,{expectedRevision:annotation.revision,idempotencyKey:randomUUID(),view:{name:'Acknowledged view',planIds:['yt_sig_lagos_01']}});
 assert.equal(view.revision,annotation.revision+1);assert.equal(view.view.revision,1);
 const report=await f.service.saveReport(f.actor,{expectedRevision:view.revision,idempotencyKey:randomUUID(),report:{title:'Chained report',thesis:'',planIds:['yt_sig_lagos_01'],viewId:view.view.id}});
 assert.equal(report.revision,view.revision+1);assert.equal(report.report.revision,1);
 const refreshed=await f.service.refreshReport(f.actor,report.report.id,{expectedRevision:report.revision,idempotencyKey:randomUUID(),expectedReportRevision:report.report.revision,planIds:report.report.planIds});
 assert.equal(refreshed.revision,report.revision+1);assert.equal(refreshed.report.revision,2);assert.equal((await f.service.read(f.actor)).revision,refreshed.revision);
});

test('named working groups preserve domain facts and historical report membership',async t=>{
 const f=await fixture(t),before=f.store.get(f.service.key).graph;
 const command=f.command({cluster:{name:'Potential bridge',nodeIds:['yt_sig_lagos_01','node_london']}}),saved=await f.service.saveCluster(f.actor,command),cluster=saved.cluster;
 assert.equal(cluster.kind,'cluster');assert.equal(cluster.authorId,f.actor.id);assert.equal(cluster.revision,1);assert.deepEqual(await f.service.saveCluster(f.actor,command),saved);
 assert.deepEqual(f.store.get(f.service.key).graph.nodes,before.nodes);assert.deepEqual(f.store.get(f.service.key).graph.edges,before.edges);
 const graph=await f.service.graph(f.actor,{focusId:cluster.id,selectedId:cluster.id});assert.deepEqual(graph.nodes.map(n=>n.id),cluster.nodeIds);assert.equal(graph.selectedItem.id,cluster.id);
 const annotation=(await f.service.annotate(f.actor,f.command({annotation:{target:{kind:'cluster',id:cluster.id},kind:'hypothesis',text:'Compare these references'}}))).annotation;assert.equal(annotation.targetId,cluster.id);
 const report=(await f.service.saveReport(f.actor,f.command({report:{title:'Working group report',thesis:'',planIds:[cluster.id]}}))).report;
 assert.deepEqual(report.findings[0].members.map(n=>n.id),cluster.nodeIds);assert.equal(report.findings[0].notes[0].id,annotation.id);assert.ok(report.findings[0].evidence.length);
 await f.service.saveCluster(f.actor,f.command({cluster:{id:cluster.id,name:'Revised group',nodeIds:['node_london']}}));
 const reopened=(await f.service.read(f.actor)).reports[0];assert.deepEqual(reopened.findings,report.findings);
 const refreshed=(await f.service.refreshReport(f.actor,report.id,f.command({expectedReportRevision:1,planIds:[cluster.id]}))).report;assert.deepEqual(refreshed.findings[0].members.map(n=>n.id),['node_london']);assert.deepEqual(refreshed.history[0].findings,report.findings);
 const stored=f.store.get(f.service.key);await assert.rejects(f.service.saveCluster(f.actor,f.command({cluster:{name:'Foreign',nodeIds:['not-in-this-organization']}})),{status:409});assert.deepEqual(f.store.get(f.service.key),stored);
 await assert.rejects(f.service.graph(f.actor,{focusId:'edge_lagos_to_london'}),{status:422});
});

test('unlocated artist suggestions do not leak into unrelated person or overview focus',async t=>{
 const f=await fixture(t);await f.service.import(f.actor,f.command({kind:'owned',data:{nodes:[{id:'unlocated-artist',kind:'artist',name:'Unlocated artist',relatedResourceIds:['unlocated-resource-details']},{id:'unlocated-person',kind:'person',name:'Independent person'},{id:'unlocated-resource',kind:'resource',name:'Possible studio'}],resources:[{id:'unlocated-resource-details',nodeId:'unlocated-resource'}]}}));
 assert.deepEqual((await f.service.graph(f.actor,{})).relatedResources,[]);assert.deepEqual((await f.service.graph(f.actor,{focusId:'unlocated-person'})).relatedResources,[]);
 assert.equal((await f.service.graph(f.actor,{focusId:'unlocated-artist'})).relatedResources[0].id,'unlocated-resource');
});
