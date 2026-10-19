import test from 'node:test';
import assert from 'node:assert/strict';
import {boundPenpotFrameUrl,embeddingAvailable,readPenpotSaveState,penpotMayHaveUnsavedChanges} from '../src/lib/penpot-workspace.js';
import {readWorkflowLocation,workflowHref} from '../src/lib/workflow-location.js';
const embedding={studioOrigin:'https://studio.example.com',nativeOrigin:'https://design.example.com'};
const id='11111111-1111-4111-8111-111111111111';
const design={id:'saved_design',storyId:'research_4',generationId:'generation_1',status:'ready',fileId:id,nativeUrl:`${embedding.nativeOrigin}/#/workspace?team-id=${id}&file-id=${id}&page-id=${id}`};
const context={designId:design.id,storyId:design.storyId,generationId:design.generationId,embedding,studioOrigin:embedding.studioOrigin};
test('saved Penpot location reloads with story/brand/format and stays distinct from Doory',()=>{
 const href=workflowHref(embedding.studioOrigin+'/?unrelated=kept',{organizationId:'org_default',brandId:'brand_vedic',tab:'studio',storyId:'research_4',format:'carousel',penpotDesignId:design.id,page:2});
 const restored=readWorkflowLocation(href);assert.equal(restored.penpotDesignId,design.id);assert.equal(restored.nativeId,'');assert.equal(restored.storyId,'research_4');assert.equal(restored.format,'carousel');assert.equal(restored.brandId,'brand_vedic');
 assert.equal(new URL(workflowHref(href,{...restored,penpotDesignId:''})).searchParams.has('design'),false);
 assert.equal(new URL(workflowHref(href,{...restored,tab:'strategy',strategy:{view:'map'}})).searchParams.has('design'),false);
 assert.equal(readWorkflowLocation(href+'&native=other_layout').nativeId,'');
});
test('frame binds the newly authorized saved record and exact constructor origins',()=>{
 assert.equal(boundPenpotFrameUrl(design,context),design.nativeUrl);
 assert.equal(embeddingAvailable(embedding,'https://candidate.run.app'),false);
 for(const changed of [{...design,id:'another'},{...design,storyId:'another'},{...design,generationId:'old'},{...design,status:'pending'},{...design,fileId:'different'},{...design,nativeUrl:design.nativeUrl.replace('design.example.com','attacker.example.com')},{...design,nativeUrl:design.nativeUrl+'&file-id='+id},{...design,nativeUrl:design.nativeUrl.replace('/#/','/other#/')}])assert.throws(()=>boundPenpotFrameUrl(changed,context));
 assert.throws(()=>boundPenpotFrameUrl(design,{...context,studioOrigin:'https://candidate.run.app'}));
});

test('save messages cannot come from another frame, document, origin or saved file',()=>{
 const source={},context={source,origin:embedding.nativeOrigin,nonce:'a'.repeat(43),fileId:id};
 const event={source,origin:embedding.nativeOrigin,data:{type:'studio-penpot-state',version:1,nonce:context.nonce,fileId:id,status:'saved',revision:8}};
 assert.deepEqual(readPenpotSaveState(event,context),{status:'saved',revision:8});
 for(const changed of [{...event,source:{}},{...event,origin:embedding.studioOrigin},{...event,data:{...event.data,nonce:'b'.repeat(43)}},{...event,data:{...event.data,fileId:'another'}},{...event,data:{...event.data,revision:-1}},{...event,data:{...event.data,revision:null}},{...event,data:{...event.data,status:'loaded'}}])assert.equal(readPenpotSaveState(changed,context),null);
 assert.equal(readPenpotSaveState(event,{...context,nonce:''}),null);
});

test('pristine clean state requires a valid revision and permits return without inventing a save acknowledgement',()=>{
 const source={},context={source,origin:embedding.nativeOrigin,nonce:'a'.repeat(43),fileId:id};
 const event={source,origin:embedding.nativeOrigin,data:{type:'studio-penpot-state',version:1,nonce:context.nonce,fileId:id,status:'clean',revision:9}};
 assert.deepEqual(readPenpotSaveState(event,context),{status:'clean',revision:9});
 assert.equal(readPenpotSaveState({...event,data:{...event.data,revision:null}},context),null);
 assert.equal(penpotMayHaveUnsavedChanges('clean'),false);assert.equal(penpotMayHaveUnsavedChanges('saved'),false);
 for(const status of ['unknown','editing','pending','saving','error'])assert.equal(penpotMayHaveUnsavedChanges(status),true);
});

test('explicit loopback development origins retain exact frame and caller-origin binding',()=>{
 for(const host of ['localhost','127.0.0.1','[::1]']){
  const local={studioOrigin:`http://${host}:3002`,nativeOrigin:`http://${host}:39008`};
  assert.equal(embeddingAvailable(local,local.studioOrigin),true);
  assert.equal(embeddingAvailable(local,'http://localhost:3003'),false);
  const saved={...design,nativeUrl:design.nativeUrl.replace(embedding.nativeOrigin,local.nativeOrigin)};
  assert.equal(boundPenpotFrameUrl(saved,{...context,embedding:local,studioOrigin:local.studioOrigin}),saved.nativeUrl);
  assert.throws(()=>boundPenpotFrameUrl({...saved,nativeUrl:saved.nativeUrl.replace(':39008',':39009')},{...context,embedding:local,studioOrigin:local.studioOrigin}));
 }
 for(const origin of ['http://remote.example:3002','http://app.localhost:3002','http://127.0.0.2:3002','http://localhost','http://localhost:80','http://localhost:0','http://localhost:65536','http://localhost:03002','http://localhost:3002/','http://user@localhost:3002','http://localhost:3002?next=anything']){
  assert.equal(embeddingAvailable({...embedding,studioOrigin:origin},origin),false,origin);
  assert.equal(embeddingAvailable({...embedding,nativeOrigin:origin},embedding.studioOrigin),false,origin);
 }
});
