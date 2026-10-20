import test from 'node:test';
import assert from 'node:assert/strict';
import {randomUUID} from 'node:crypto';
import {DurableStore} from './storage.js';
import {IdentityService} from './auth.js';
import {DefiantStrategyService} from './defiant-strategy.js';
import {ScopedRepository,scopeKey} from './repository.js';
import {createPlatform} from './platform.js';
import {createHttpServer} from './index.js';
import {WorkspaceService} from './workspace.js';
import {storyRow} from './workspace-query.js';
const handoffChoice={objective:'Prepare a collaboration brief for review',deliverables:['Infographic','Partner shortlist']};
async function fixture(t){
 const store=new DurableStore(':memory:'),identity=new IdentityService(store);t.after(()=>store.close());await identity.provision({username:'handoff-founder',password:'hosted-handoff-password',role:'founder'});const actor=(await identity.login('handoff-founder','hosted-handoff-password')).user,org=await identity.createOrganization(actor,'Separate strategy organization'),service=new DefiantStrategyService({store,identity,organizationId:org.id});await service.enable(actor,{});await service.import(actor,{expectedRevision:1,idempotencyKey:randomUUID(),kind:'demo'});const command=body=>({expectedRevision:store.get(service.key).revision,idempotencyKey:randomUUID(),...body});return {store,identity,actor,org,service,command};
}
test('draft destination atomically creates a neutral empty scope and never seeds publishing examples',async t=>{
 const f=await fixture(t),pilot=new ScopedRepository(f.store,{organizationId:'org_default',brandId:'brand_default',preset:'liquidity_desk'});await pilot.ready;const before=f.store.get(pilot.key),input=f.command({name:'New release research'}),saved=await f.service.createDestination(f.actor,input),key=scopeKey({organizationId:f.org.id,brandId:saved.destination.id});
 assert.equal(saved.revision,3);assert.equal(saved.destination.socialConnectionVerified,false);assert.deepEqual(await f.service.createDestination(f.actor,input),saved);const brand=f.store.get('identity').organizations.find(o=>o.id===f.org.id).brands[0];assert.equal(brand.preset,undefined);
 const repository=new ScopedRepository(f.store,{organizationId:f.org.id,brandId:brand.id,preset:brand.preset});await repository.ready;const scope=await repository.read();assert.deepEqual(scope.backlog,[]);assert.deepEqual(scope.jobs,[]);assert.deepEqual(scope.assets,[]);assert.deepEqual(scope.brandProfile.colors.map(c=>c.name),['Background','Accent','Secondary','Text']);assert.equal(scope.brandProfile.colors.length,4);assert.deepEqual(scope.brandProfile.fonts,{heading:'Mona Sans',body:'Inter'});assert.equal(scope.brandProfile.brandName,'New release research');assert.equal(scope.brandProfile.contentDomain,'general');assert.deepEqual(f.store.get(pilot.key),before);
 await assert.rejects(f.service.createDestination(f.actor,{...input,name:'Changed under same key'}),{status:409});assert.equal(f.store.get(key).backlog.length,0);assert.equal(f.store.get('identity').organizations.find(o=>o.id===f.org.id).brands.length,1);
});
test('explicit report handoff creates one unreviewed brief and same-key replay preserves later human edits',async t=>{
 const f=await fixture(t),destination=(await f.service.createDestination(f.actor,f.command({name:'Draft destination'}))).destination,report=(await f.service.saveReport(f.actor,f.command({report:{title:'Investigate a bridge',thesis:'A working hypothesis',planIds:['yt_sig_lagos_01']}}))).report,input=f.command({...handoffChoice,expectedReportRevision:report.revision,destinationId:destination.id}),saved=await f.service.handoff(f.actor,report.id,input),repository=new ScopedRepository(f.store,{organizationId:f.org.id,brandId:destination.id});await repository.ready;
 const story=(await repository.listBacklog())[0];assert.equal(story.id,saved.draft.id);assert.equal(story.reviewStatus,'unreviewed');assert.deepEqual(story.verifiedFacts,[]);assert.deepEqual(story.sourceClaims,[]);assert.equal(story.campaignDraft,null);assert.equal(story.draftBrief.report.title,report.title);assert.deepEqual(story.draftBrief.report.findings,report.findings);assert.equal(story.draftBrief.createdBy,f.actor.id);assert.equal(story.draftBrief.reviewRequired,true);assert.equal(story.draftBrief.objective,handoffChoice.objective);assert.deepEqual(story.draftBrief.deliverables,handoffChoice.deliverables);const row=storyRow(story,await repository.read());assert.equal(row.plannedDate,null);assert.equal(row.legacyWeekday,null);const workspace=new WorkspaceService({store:f.store,identity:f.identity,repo:repository,scope:repository.scope}),calendar=await workspace.calendar(f.actor,{startDate:'2026-10-18',endDate:'2026-10-25',timeZone:'UTC'});assert.deepEqual(calendar.assignments,[]);assert.deepEqual(calendar.legacyWeekdays,[]);assert.equal(calendar.unscheduled[0].id,story.id);
 await repository.updateStory(story.id,s=>{s.title='Human-retained draft title';});await f.service.saveReport(f.actor,f.command({report:{id:report.id,expectedReportRevision:report.revision,title:'Later report title',thesis:''}}));assert.deepEqual(await f.service.handoff(f.actor,report.id,input),saved);assert.equal((await repository.listBacklog()).length,1);assert.equal((await repository.listBacklog())[0].title,'Human-retained draft title');
 await assert.rejects(f.service.handoff(f.actor,report.id,{...input,objective:'A different objective'}),{status:409});const before=f.store.get(repository.key);await assert.rejects(f.service.handoff(f.actor,report.id,f.command({...handoffChoice,expectedReportRevision:1,destinationId:destination.id})),{status:409});assert.deepEqual(f.store.get(repository.key),before);await assert.rejects(f.service.handoff(f.actor,report.id,f.command({...handoffChoice,objective:'',expectedReportRevision:2,destinationId:destination.id})),{status:422});assert.deepEqual(f.store.get(repository.key),before);
});
test('destination membership and restore admission are rechecked in the handoff transaction',async t=>{
 const f=await fixture(t),destination=(await f.service.createDestination(f.actor,f.command({name:'Restricted destination'}))).destination,report=(await f.service.saveReport(f.actor,f.command({report:{title:'Source report',thesis:'',planIds:['yt_sig_lagos_01']}}))).report,key=scopeKey({organizationId:f.org.id,brandId:destination.id}),before=f.store.get(key);
 f.store.update(key,s=>({...s,editorRestore:{status:'installing'}}));await assert.rejects(f.service.handoff(f.actor,report.id,f.command({...handoffChoice,expectedReportRevision:1,destinationId:destination.id})),{status:423});f.store.update(key,()=>before);
 const transact=f.store.transact.bind(f.store);f.store.transact=(keys,callback)=>{f.store.update('identity',identity=>{identity.memberships.find(m=>m.userId===f.actor.id&&m.organizationId===f.org.id).brandIds=[];return identity;});return transact(keys,callback);};await assert.rejects(f.service.handoff(f.actor,report.id,f.command({...handoffChoice,expectedReportRevision:1,destinationId:destination.id})),{status:403});assert.deepEqual(f.store.get(key),before);
});

test('authenticated HTTP creates an empty destination then hands off the exact saved report',async t=>{
 const f=await fixture(t),platform=createPlatform({store:f.store,authMode:'password'});await platform.ready;const server=createHttpServer(null,{platform});await new Promise(r=>server.listen(0,'127.0.0.1',r));t.after(()=>new Promise(r=>server.close(r)));const base=`http://127.0.0.1:${server.address().port}`,login=await fetch(base+'/api/auth/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({username:'handoff-founder',password:'hosted-handoff-password'})}),cookie=login.headers.get('set-cookie').split(';')[0],path='/api/studio/strategy/'+f.org.id;
 const post=async(route,body)=>{const response=await fetch(base+path+route,{method:'POST',headers:{Cookie:cookie,'Content-Type':'application/json'},body:JSON.stringify(body)});assert.equal(response.status,200);return response.json();};
 const destination=await post('/destinations',f.command({name:'HTTP empty destination'})),report=await post('/reports',{expectedRevision:destination.revision,idempotencyKey:randomUUID(),report:{title:'HTTP report brief',thesis:'Needs editorial review',planIds:['yt_sig_lagos_01']}}),handed=await post('/reports/'+report.report.id+'/handoff',{expectedRevision:report.revision,idempotencyKey:randomUUID(),...handoffChoice,expectedReportRevision:report.report.revision,destinationId:destination.destination.id});
 assert.equal(handed.draft.reportRevision,report.report.revision);const stored=f.store.get(scopeKey({organizationId:f.org.id,brandId:destination.destination.id}));assert.equal(stored.backlog.length,1);assert.equal(stored.backlog[0].draftBrief.report.id,report.report.id);assert.equal(stored.backlog[0].id,handed.draft.id);
});

test('read resumes all retained report handoffs after reload without changing snapshots or creating drafts',async t=>{
 const f=await fixture(t),destination=(await f.service.createDestination(f.actor,f.command({name:'Retained destination'}))).destination,report=(await f.service.saveReport(f.actor,f.command({report:{title:'Original report',thesis:'Working context',planIds:['yt_sig_lagos_01']}}))).report;
 const first=await f.service.handoff(f.actor,report.id,f.command({...handoffChoice,expectedReportRevision:1,destinationId:destination.id}));
 await f.service.saveReport(f.actor,f.command({report:{id:report.id,expectedReportRevision:1,title:'Revised report',thesis:'New wording'}}));
 const second=await f.service.handoff(f.actor,report.id,f.command({...handoffChoice,expectedReportRevision:2,destinationId:destination.id})),key=scopeKey({organizationId:f.org.id,brandId:destination.id});
 f.store.update(key,s=>{s.backlog.find(story=>story.id===first.draft.id).title='Human edited campaign';return s;});
 f.store.update(f.service.key,s=>{s.receipts.push(structuredClone(s.receipts.find(r=>r.result.draft?.id===first.draft.id)));return s;});
 const before=f.store.get(f.service.key),scopeBefore=f.store.get(key),fresh=new DefiantStrategyService({store:f.store,identity:f.identity,organizationId:f.org.id}),read=await fresh.read(f.actor);
 assert.deepEqual(read.handoffs.map(d=>[d.id,d.reportId,d.reportRevision,d.title]),[[first.draft.id,report.id,1,'Human edited campaign'],[second.draft.id,report.id,2,'Revised report']]);
 assert.equal(read.handoffs[0].destinationName,'Retained destination');assert.equal(read.handoffs[0].organizationId,f.org.id);assert.equal(read.handoffs[0].brandId,destination.id);assert.equal(read.handoffs[0].createdAt,scopeBefore.backlog.find(s=>s.id===first.draft.id).draftBrief.createdAt);
 assert.equal(read.receipts,undefined);assert.deepEqual(read.reports,before.reports);assert.deepEqual(f.store.get(f.service.key),before);assert.deepEqual(f.store.get(key),scopeBefore);assert.equal(scopeBefore.backlog.length,2);
});

test('resume links require current destination access and a real matching draft brief before exposure',async t=>{
 const f=await fixture(t),destination=(await f.service.createDestination(f.actor,f.command({name:'Scoped destination'}))).destination,report=(await f.service.saveReport(f.actor,f.command({report:{title:'Scoped report',thesis:'',planIds:['yt_sig_lagos_01']}}))).report;
 await f.service.handoff(f.actor,report.id,f.command({...handoffChoice,expectedReportRevision:1,destinationId:destination.id}));
 const key=scopeKey({organizationId:f.org.id,brandId:destination.id}),original=f.store.get(key),identityBefore=f.store.get('identity'),get=f.store.get.bind(f.store);let scopedReads=0;
 f.store.get=k=>{if(k===key)scopedReads++;return get(k);};
 f.store.update('identity',s=>{s.memberships.find(m=>m.userId===f.actor.id&&m.organizationId===f.org.id).brandIds=[];return s;});assert.deepEqual((await f.service.read(f.actor)).handoffs,[]);assert.equal(scopedReads,0);
 f.store.update('identity',()=>structuredClone(identityBefore));f.store.update('identity',s=>{s.organizations.find(o=>o.id===f.org.id).brands=[];return s;});assert.deepEqual((await f.service.read(f.actor)).handoffs,[]);assert.equal(scopedReads,0);
 f.store.update('identity',()=>structuredClone(identityBefore));
 for(const change of [s=>{s.backlog=[];},s=>{s.backlog[0].draftBrief.reportRevision=99;},s=>{s.backlog[0].draftBrief.reportId='different-report';},s=>{s.backlog[0].draftBrief.organizationId='different-org';},s=>{s.editorRestore={status:'installing'};}]){
  f.store.update(key,()=>{const s=structuredClone(original);change(s);return s;});assert.deepEqual((await f.service.read(f.actor)).handoffs,[]);
 }
 f.store.update(key,()=>structuredClone(original));let revoke=true;f.store.get=k=>{const value=get(k);if(k===key&&revoke){revoke=false;f.store.update('identity',s=>{s.memberships.find(m=>m.userId===f.actor.id&&m.organizationId===f.org.id).brandIds=[];return s;});}return value;};
 assert.deepEqual((await f.service.read(f.actor)).handoffs,[]);
});
