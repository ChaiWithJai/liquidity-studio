import test from 'node:test';
import assert from 'node:assert/strict';
import {randomUUID} from 'node:crypto';
import {DurableStore} from './storage.js';
import {createPlatform} from './platform.js';
import {pristineSeedPlan,assertPristineSeedPlanRow,plannedSeedQueueIds,seedPlanHash} from './seed-followthrough-plan.js';
process.env.NODE_ENV='test';
async function fixture(t){
 const store=new DurableStore(':memory:');t.after(()=>store.close());const platform=createPlatform({store,authMode:'password'});await platform.ready;
 await platform.identity.provision({username:'seed-auditor',password:'controlled-readonly-audit-239!',role:'founder'});
 const identity=await store.get('identity'),actor=identity.users.find(user=>user.username==='seed-auditor'),scope=await platform.identity.authorize(actor,'org_default','brand_default'),container=await platform.forScope(scope),repo=container.ports.repo;await repo.ready;
 // Controlled legacy factory fixture, not a maintained migration or erased human work.
 await store.update(repo.key,state=>{for(const story of state.backlog){if(story.id==='story_nykaa_ipo')story.title='Falguni Nayar’s $13B Omnichannel Beauty IPO in India';if(story.id==='story_margot_luckychap')story.title='Margot Robbie & LuckyChap’s $50M Producer Backend Check';story.contentRevision=1;}return state;});
 return {store,platform,identity,actor,scope,repo,workspace:platform.workspace(scope,repo)};
}
const planOf=f=>f.repo.read().then(state=>pristineSeedPlan({identity:f.identity,actorId:f.actor.id,scope:f.scope,state,externalKeys:[],sourceCommit:'a'.repeat(40)}));
test('read-only full-factory manifest selects only reviewed four target IDs and never queues or rewrites',async t=>{
 const f=await fixture(t),before=JSON.stringify(await f.store.get(f.repo.key)),plan=await planOf(f);
 assert.deepEqual(plan.rows.map(row=>row.disposition),['pristine-no-title-change','pristine-rename-eligible','pristine-rename-eligible']);
 assert.deepEqual(plannedSeedQueueIds(plan,await f.repo.read(),f.scope),['story_beyonce_amc','story_margot_luckychap']); // Old Nykaa title lacks catalog topic; requires explicit guarded rename first.
 assert.equal(JSON.stringify(await f.store.get(f.repo.key)),before);
 assert.match(plan.catalogModuleSha256,/^[a-f0-9]{64}$/);assert.match(plan.copyRegistrySourceSha256,/^[a-f0-9]{64}$/);
});
test('delayed semantic title operation rejects a concurrent human edit inside the existing control.guard',async t=>{
 const f=await fixture(t),plan=await planOf(f),row=plan.rows.find(row=>row.storyId==='story_nykaa_ipo');
 let release,entered;const held=new Promise(resolve=>release=resolve),ready=new Promise(resolve=>entered=resolve),original=f.repo.mutate.bind(f.repo);let hold=true;
 f.repo.mutate=async callback=>{if(hold){hold=false;entered();await held;}return original(callback);};
 const pending=f.workspace.mutate(f.actor,{idempotencyKey:randomUUID(),changes:[{kind:'story.patch',storyId:row.storyId,expectedRevision:row.revision,patch:{title:row.desiredTitle}}]},{binding:{planSha256:plan.planSha256},guard:state=>assertPristineSeedPlanRow({identity:f.identity,actorId:f.actor.id,scope:f.scope,state,externalKeys:[],row})});
 await ready;
 await f.workspace.mutate(f.actor,{idempotencyKey:randomUUID(),changes:[{kind:'story.patch',storyId:row.storyId,expectedRevision:row.revision,patch:{title:'Human-edited title must remain'}}]});
 release();await assert.rejects(pending,error=>error.status===409);
 const story=(await f.repo.read()).backlog.find(story=>story.id===row.storyId);assert.equal(story.title,'Human-edited title must remain');assert.equal(story.revision,row.revision+1);
});
test('unknown work, related history, assets, external records and current authority changes fail closed',async t=>{
 const f=await fixture(t),state=await f.repo.read(),plan=await planOf(f),row=plan.rows[0];
 for(const change of [s=>s.backlog.find(x=>x.id===row.storyId).humanNote='Unknown retained work',s=>s.preparedSourceCandidates=[{candidate:{storyId:row.storyId}}],s=>s.operatorJobs=[{items:[{storyId:row.storyId,status:'failed'}]}],s=>s.assets=[{id:'owned-unlinked-image'}],s=>s.workspace={receipts:[{outcomes:[{storyId:row.storyId}]}]}]){
  const changed=structuredClone(state);change(changed);assert.throws(()=>assertPristineSeedPlanRow({identity:f.identity,actorId:f.actor.id,scope:f.scope,state:changed,externalKeys:[],row}),error=>error.status===409);
 }
 assert.throws(()=>assertPristineSeedPlanRow({identity:f.identity,actorId:f.actor.id,scope:f.scope,state,externalKeys:['native-editor:owned:document:new'],row}),error=>error.status===409);
 const revoked=structuredClone(f.identity);revoked.memberships=[];assert.throws(()=>pristineSeedPlan({identity:revoked,actorId:f.actor.id,scope:f.scope,state,externalKeys:[],sourceCommit:'a'.repeat(40)}),error=>error.status===403);
 const changed=structuredClone(f.identity);changed.users[0].role='marketer';assert.throws(()=>assertPristineSeedPlanRow({identity:changed,actorId:f.actor.id,scope:f.scope,state,externalKeys:[],row}),error=>error.status===403);
 assert.equal(seedPlanHash(state),seedPlanHash(await f.repo.read()));
});
