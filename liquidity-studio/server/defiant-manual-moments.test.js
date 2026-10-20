import test from 'node:test';
import assert from 'node:assert/strict';
import {randomUUID} from 'node:crypto';
import {DurableStore} from './storage.js';
import {IdentityService} from './auth.js';
import {DefiantStrategyService} from './defiant-strategy.js';
import {strategyRequest} from './defiant-strategy-http.js';
import {scopeKey} from './repository.js';
async function fixture(t){
 const store=new DurableStore(':memory:');t.after(()=>store.close());const identity=new IdentityService(store);await identity.provision({username:'human-moment-founder',password:'hosted-human-moment-password',role:'founder'});const actor=(await identity.login('human-moment-founder','hosted-human-moment-password')).user,org=await identity.createOrganization(actor,'Human source selections'),service=new DefiantStrategyService({store,identity,organizationId:org.id});await service.enable(actor,{});
 const input=body=>({expectedRevision:store.get(service.key).revision,idempotencyKey:randomUUID(),...body}),preview=await service.previewInbox(actor,{kind:'nipsey-example'});await service.importInbox(actor,input({kind:preview.kind,previewDigest:preview.previewDigest}));const source=store.get(service.key).inbox.sources[0],recording=store.get(service.key).inbox.recordings[0];
 const moment={title:'Manager selected interview interval',startSeconds:120,endSeconds:145,context:'A user-selected context requiring editorial verification.',recordingId:recording.id,recordingFit:'Possible thematic fit, not permission.'},save=body=>input({sourceId:source.id,expectedSourceRevision:source.revision,moment,...body});return {store,identity,actor,org,service,input,source,recording,moment,save};
}
test('explicit human selection saves once without analysis/budget and retains frozen report/history/brief lineage',async t=>{
 const f=await fixture(t),request=f.save({}),first=await f.service.saveManualMoment(f.actor,request),saved=first.moment;
 assert.equal(saved.method,'human-selected');assert.equal(saved.verification,'user-reported');assert.equal(saved.savedBy,f.actor.id);assert.equal(saved.sourceUrl,f.source.sourceUrl);assert.equal(saved.revision,1);assert.ok(saved.savedAt);assert.equal(saved.trace,undefined);assert.equal(f.store.get(f.service.key).inbox.analyses,undefined);assert.deepEqual(f.store.keys('generation-budget:'),[]);
 const ref={kind:'human-selected',momentId:saved.id,revision:1},report=(await f.service.saveReport(f.actor,f.input({report:{title:'Human selected source brief',thesis:'Working proposal',planIds:[],sourceRefs:[f.source.id],momentRefs:[ref]}}))).report;
 assert.deepEqual(report.momentRefs,[ref]);assert.equal(report.momentSnapshots[0].timestamps,'user-selected-unverified');assert.equal(report.momentSnapshots[0].analysisId,undefined);assert.equal(report.momentSnapshots[0].trace,undefined);assert.deepEqual(report.momentSnapshots[0].recording,f.recording);
 const later=(await f.service.saveManualMoment(f.actor,f.save({expectedMomentRevision:1,moment:{...f.moment,id:saved.id,context:'Later manager wording'}}))).moment;assert.equal(later.revision,2);assert.equal(later.createdAt,saved.createdAt);assert.equal(later.createdBy,f.actor.id);
 assert.deepEqual(await f.service.saveManualMoment(f.actor,request),first);assert.equal((await f.service.manualMoments(f.actor,f.source.id)).moments[0].context,'Later manager wording');
 const wording=(await f.service.saveReport(f.actor,f.input({report:{id:report.id,expectedReportRevision:1,title:'Edited report words',thesis:'Still the original saved selection'}}))).report;assert.deepEqual(wording.momentSnapshots,report.momentSnapshots);assert.deepEqual(wording.history[0].momentSnapshots,report.momentSnapshots);
 const destination=(await f.service.createDestination(f.actor,f.input({name:'Manual source proposals'}))).destination,handoff=await f.service.handoff(f.actor,report.id,f.input({expectedReportRevision:2,destinationId:destination.id,objective:'Review the selected source interval',deliverables:['Unreviewed source brief']}));
 const brief=f.store.get(scopeKey({organizationId:f.org.id,brandId:destination.id})).backlog.find(row=>row.id===handoff.draft.id).draftBrief;assert.deepEqual(brief.report.momentSnapshots,report.momentSnapshots);assert.equal(brief.reviewRequired,true);
 const refreshed=(await f.service.refreshReport(f.actor,report.id,f.input({expectedReportRevision:2,planIds:[],sourceRefs:[f.source.id],momentRefs:[{...ref,revision:2}]}))).report;assert.equal(refreshed.momentSnapshots[0].moment.context,'Later manager wording');assert.deepEqual(brief.report.momentSnapshots,report.momentSnapshots);assert.deepEqual(f.store.keys('generation-budget:'),[]);
});
test('human selection API rejects stale sources/edits, wrong recording, changed replay and unsupported fields without mutation',async t=>{
 const f=await fixture(t),request=f.save({}),first=await f.service.saveManualMoment(f.actor,request),before=f.store.get(f.service.key);
 for(const body of [f.save({expectedSourceRevision:99}),f.save({moment:{...f.moment,recordingId:'foreign'}}),f.save({moment:{...f.moment,endSeconds:151}}),f.save({moment:{...f.moment,method:'ai-generated'}}),f.save({expectedMomentRevision:99,moment:{...f.moment,id:first.moment.id}}),{...request,moment:{...f.moment,title:'Changed under same key'}}])await assert.rejects(f.service.saveManualMoment(f.actor,body),error=>[400,409,422].includes(error.status));
 assert.deepEqual(f.store.get(f.service.key),before);
 await assert.rejects(f.service.saveReport(f.actor,f.input({report:{title:'Missing selected source',thesis:'',planIds:[],sourceRefs:[],momentRefs:[{kind:'human-selected',momentId:first.moment.id,revision:1}]}})),{status:422});
 const platform={store:f.store,identity:f.identity},route=`/api/studio/strategy/${f.org.id}/inbox/moments`,read=await strategyRequest({platform,user:f.actor,route,method:'GET',url:new URL('http://host'+route+'?sourceId='+encodeURIComponent(f.source.id))});assert.equal(read.moments[0].id,first.moment.id);assert.equal(read.sourceId,f.source.id);
 await assert.rejects(strategyRequest({platform,user:f.actor,route,method:'GET',url:new URL('http://host'+route+'?sourceId='+encodeURIComponent(f.source.id)+'&other=1')}),{status:400});
 f.store.update('identity',identity=>{identity.memberships=identity.memberships.filter(m=>m.organizationId!==f.org.id);return identity;});await assert.rejects(f.service.manualMoments(f.actor,f.source.id),{status:403});await assert.rejects(f.service.saveManualMoment(f.actor,f.save({})),{status:403});
});
test('old analysis references coexist unchanged with explicit human references and source revision fencing',async t=>{
 const f=await fixture(t),manual=(await f.service.saveManualMoment(f.actor,f.save({}))).moment,analysisId=randomUUID(),momentId=randomUUID(),at=new Date().toISOString();
 f.store.update(f.service.key,state=>{state.inbox.analyses=[{id:analysisId,sourceId:f.source.id,sourceUrl:f.source.sourceUrl,status:'ready',window:{startSeconds:0,endSeconds:60},trace:{provider:'fixture'},moments:[{id:momentId,revision:2,startSeconds:4,endSeconds:12,context:'Hosted analysis fixture',recordingId:null,recordingFit:'',savedAt:at,savedBy:f.actor.id}]}];return state;});
 const oldRef={analysisId,momentId,revision:2},humanRef={kind:'human-selected',momentId:manual.id,revision:1},report=(await f.service.saveReport(f.actor,f.input({report:{title:'Two distinct origins',thesis:'',planIds:[],sourceRefs:[f.source.id],momentRefs:[oldRef,humanRef]}}))).report;
 assert.deepEqual(report.momentRefs,[oldRef,humanRef]);assert.equal(report.momentSnapshots[0].timestamps,'approximate-proposal');assert.equal(report.momentSnapshots[1].timestamps,'user-selected-unverified');
 f.store.update(f.service.key,state=>{state.inbox.sources.find(source=>source.id===f.source.id).revision++;return state;});const before=f.store.get(f.service.key);
 await assert.rejects(f.service.saveReport(f.actor,f.input({report:{title:'Stale manual source',thesis:'',planIds:[],sourceRefs:[f.source.id],momentRefs:[humanRef]}})),{status:409});assert.deepEqual(f.store.get(f.service.key),before);
});
