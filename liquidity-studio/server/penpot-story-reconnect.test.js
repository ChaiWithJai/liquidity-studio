import test from 'node:test';
import assert from 'node:assert/strict';
import {PenpotStoryReconnect,portableCampaignFingerprint} from './penpot-story-reconnect.js';
import {storyContentDigest} from './story-content-revision.js';
import {brandRevision} from './multimodal-contract.js';
const id=n=>`${n.repeat(8)}-${n.repeat(4)}-4${n.repeat(3)}-8${n.repeat(3)}-${n.repeat(12)}`;
const campaign={infographic:{headline:'Retained copy'},carousel:{slides:[{headline:'One'}]},story:{hookBanner:'Saved'},reel:{beats:[{onScreenText:'Retained'}]}};
function fixture(){
 const actor={id:'current-founder'},scope={organizationId:'new-org',brandId:'new-brand'},story={id:'new-record',revision:3,generationId:'new-generation',campaignDraft:campaign},profile={brandName:'Current brand'},fileId=id('1'),pageId=id('2');
 const workspace={ownerPrincipal:id('3'),teamId:id('4'),projectId:id('5'),bindingId:'binding',bindingEpoch:2,fonts:[{fontId:'custom-'+id('6')}]};
 const identity={storyId:story.id,generationId:story.generationId,contentRevision:1,contentSha256:storyContentDigest(story),brandRevision:brandRevision(profile)};
 let saved={designs:[{id:'prior-design',status:'ready',fileId:id('7')}],intents:[]},calls=[];
 const file={id:fileId,projectId:workspace.projectId,revn:9,data:{pages:[pageId],pagesIndex:{[pageId]:{name:'infographic 1',objects:{}}}}};
 const values=()=>[saved,{backlog:[story],brandProfile:profile},{users:[{id:actor.id,role:'founder'}],memberships:[{userId:actor.id,...scope,brandIds:[scope.brandId]}]},{bindings:[{id:'binding',epoch:2,ownerPrincipal:workspace.ownerPrincipal,nativeProjectId:workspace.projectId}]}];
 const d={scope,nativeOrigin:'http://localhost:39008',key:'designs',repo:{key:'workspace'},now:()=>1000,context:async()=>({story,bundle:{sourceCampaign:campaign},workspace,identity,designKey:'current-copy'}),rpc:async(w,name,body)=>{calls.push(name);assert.equal(name,'get-file');assert.equal(body.id,fileId);return structuredClone(file);},store:{transact:async(keys,fn)=>{const result=fn(values());saved=result[0];}},dto:r=>r};
 const manifest={kind:'studio-registered-penpot-recovery',schemaVersion:2,editorVersion:'2.18.3',portableContent:portableCampaignFingerprint(campaign),archiveSha256:'a'.repeat(64),scope:{organizationId:'old-org',brandId:'old-brand'},storyId:'old-record',fileId:id('8')};
 const input={storyId:story.id,format:'infographic',expectedRevision:3,generationId:story.generationId,manifest,nativeUrl:`http://localhost:39008/#/workspace?team-id=${id('9')}&file-id=${fileId}`};
 return {service:new PenpotStoryReconnect(d),actor,input,file,story,calls,saved:()=>saved,pageId};
}
test('portable rendered-copy fingerprint excludes identity/provenance but changes with wording',()=>{
 const original=portableCampaignFingerprint(campaign);assert.deepEqual(portableCampaignFingerprint({...campaign,provenance:{organizationId:'different',generationId:'new',reviewedBy:'new-owner'}}),original);
 assert.notDeepEqual(portableCampaignFingerprint({...campaign,story:{hookBanner:'Changed'}}),original);
});
test('explicit remap preserves prior design and registers actual imported pages with one replay-safe intent and no native writes',async()=>{
 const f=fixture(),p=await f.service.preview(f.actor,f.input,'session');assert.equal(p.destination.projectId,f.file.projectId);assert.equal(p.pages[0].id,f.pageId);
 const input={...f.input,...{expectedNativeRevision:p.nativeRevision,fileSha256:p.fileSha256},pages:['infographic','carousel','story','reel'].map(format=>({format,id:f.pageId})),idempotencyKey:id('a')};
 const saved=await f.service.reconnect(f.actor,input,'session');assert.equal(saved.fileId,f.file.id);assert.equal(saved.recovery.authorityRestored,false);assert.equal(f.saved().designs[0].id,'prior-design');
 assert.equal((await f.service.reconnect(f.actor,input,'session')).id,saved.id);assert.equal(f.saved().designs.length,2);assert.equal(f.saved().intents.length,1);assert.ok(f.calls.every(x=>x==='get-file'));
});
test('legacy/wrong-copy kit, foreign origin/project and changed native revision fail before registration',async()=>{
 for(const mutate of [f=>f.input.manifest.schemaVersion=1,f=>f.input.manifest.portableContent.sha256='b'.repeat(64),f=>f.input.nativeUrl=f.input.nativeUrl.replace('localhost:39008','foreign.example'),f=>f.file.projectId=id('b')]){const f=fixture();mutate(f);await assert.rejects(()=>f.service.preview(f.actor,f.input,'session'));assert.equal(f.saved().intents.length,0);}
 const f=fixture(),p=await f.service.preview(f.actor,f.input,'session');f.file.revn++;
 await assert.rejects(()=>f.service.reconnect(f.actor,{...f.input,expectedNativeRevision:p.nativeRevision,fileSha256:p.fileSha256,pages:['infographic','carousel','story','reel'].map(format=>({format,id:f.pageId})),idempotencyKey:id('a')},'session'),{status:409});assert.equal(f.saved().intents.length,0);
});
