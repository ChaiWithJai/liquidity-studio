import test from 'node:test';
import assert from 'node:assert/strict';
import {captureContentRevisions,applyContentRevisions,storyContentDigest} from './story-content-revision.js';
import {ScopedRepository} from './repository.js';
import {DurableStore} from './storage.js';
const seed=()=>({backlog:[{id:'story',revision:3,title:'Original',generationId:'generation',sourceClaims:[{text:'Actual claim',status:'approved'}],campaignDraft:{headline:'Saved layout'}}]});
test('planning, assignment and preparation progress do not invalidate content; forged counters are ignored',()=>{
 const state=seed(),before=captureContentRevisions(state);Object.assign(state.backlog[0],{revision:4,contentRevision:999,status:'Scheduled',scheduledDay:'Tuesday',assigneeId:'marketer',preparationStatus:'ready',preparedCandidateId:'candidate'});
 applyContentRevisions(state,before);assert.equal(state.backlog[0].contentRevision,1);
});
test('actual content changes advance monotonically, including reverting to an older payload',()=>{
 const state=seed();let before=captureContentRevisions(state);state.backlog[0].title='Changed';applyContentRevisions(state,before);assert.equal(state.backlog[0].contentRevision,2);
 before=captureContentRevisions(state);state.backlog[0].title='Original';applyContentRevisions(state,before);assert.equal(state.backlog[0].contentRevision,3);
 before=captureContentRevisions(state);state.backlog[0].sourceClaims[0].status='excluded';applyContentRevisions(state,before);assert.equal(state.backlog[0].contentRevision,4);
 before=captureContentRevisions(state);state.backlog[0].futureEditorialInput='New field';applyContentRevisions(state,before);assert.equal(state.backlog[0].contentRevision,5);
});
test('object key order does not change content identity and new records start at one',()=>{
 assert.equal(storyContentDigest({id:'a',draft:{a:1,b:2}}),storyContentDigest({draft:{b:2,a:1},id:'a'}));
 const state=seed();applyContentRevisions(state,new Map());assert.equal(state.backlog[0].contentRevision,1);
});
test('actual repository mutation fences the content epoch independently from optimistic story revisions',async()=>{
 const store=new DurableStore(':memory:');const repo=new ScopedRepository(store,{organizationId:'org',brandId:'brand'});
 try{await repo.ready;const story=(await repo.read()).backlog[0];
 const planned=await repo.updateStory(story.id,current=>{current.status='Scheduled';current.scheduledDay='Tuesday';});assert.equal(planned.contentRevision,1);assert.equal(planned.revision,story.revision+1);
 const edited=await repo.updateStory(story.id,current=>{current.title='An edited title';});assert.equal(edited.contentRevision,2);
 const reassigned=await repo.updateStory(story.id,current=>{current.assigneeId='marketer';});assert.equal(reassigned.contentRevision,2);
 }finally{store.close();}
});
