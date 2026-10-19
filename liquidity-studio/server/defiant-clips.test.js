import test from 'node:test';
import assert from 'node:assert/strict';
import {createHash,randomUUID} from 'node:crypto';
import {DurableStore} from './storage.js';
import {IdentityService} from './auth.js';
import {DefiantStrategyService} from './defiant-strategy.js';
import {DefiantClips,CLIP_LIMITS} from './defiant-clips.js';
import {scopeKey} from './repository.js';
const sha=b=>createHash('sha256').update(b).digest('hex'),sourceId='youtube:hHtx_yhEm84',recordingId='nipsey:recording:US-AMI-18-00105';
async function fixture(t){const store=new DurableStore(':memory:');t.after(()=>store.close());const identity=new IdentityService(store);await identity.provision({username:'clip-founder',password:'private-hosted-clip-password',role:'founder'});const actor=(await identity.login('clip-founder','private-hosted-clip-password')).user,org=await identity.createOrganization(actor,'Supplied clip work'),strategy=new DefiantStrategyService({store,identity,organizationId:org.id});await strategy.enable(actor,{});const preview=await strategy.previewInbox(actor,{kind:'nipsey-example'});await strategy.importInbox(actor,{expectedRevision:1,idempotencyKey:randomUUID(),kind:'nipsey-example',previewDigest:preview.previewDigest});const clips=new DefiantClips(strategy);return {store,identity,actor,org,strategy,clips};}
// Container bytes are deliberately only a storage fixture; this does not claim
// browser decoding/rendering. Actual MP4 acceptance is the ordinary Neo task.
const mp4=()=>{const b=Buffer.alloc(700000,7);b.writeUInt32BE(24,0);b.write('ftyp',4);b.write('isom',8);return b;};
async function upload(f,kind='source',extra={}){const bytes=mp4(),input={idempotencyKey:randomUUID(),kind,name:'Owned supplied source.mp4',contentType:'video/mp4',bytes:bytes.length,sha256:sha(bytes),rightsDeclaration:'Original controlled engineering source; no third-party media claim.',sourceId,...extra},ack=await f.clips.begin(f.actor,input);assert.deepEqual(await f.clips.begin(f.actor,input),ack);for(let i=0;i<ack.chunkCount;i++){const chunk=bytes.subarray(i*ack.chunkBytes,(i+1)*ack.chunkBytes);await f.clips.chunk(f.actor,ack.uploadId,i,chunk);}return {input,bytes,ack,result:await f.clips.complete(f.actor,ack.uploadId)};}
const proposal=(asset,recording)=>({idempotencyKey:randomUUID(),proposal:{sourceId,recordingId:recording,sourceAssetId:asset.id,audioAssetId:null,startSeconds:2,endSeconds:10,cropX:0.5,cropY:0.5,caption:'Manager caption',videoGain:1,audioGain:0.25}});
test('chunked actual bytes, manual selection, immutable render and report handoff retain input lineage',async t=>{
 const f=await fixture(t),source=await upload(f),recording=f.store.get(f.strategy.key).inbox.recordings[0].id,p=await f.clips.propose(f.actor,proposal(source.result.asset,recording));
 const rendered=await upload(f,'render',{proposalId:p.proposal.id,proposalRevision:p.proposal.revision,recordingId:recording,inputHashes:{audio:null,source:source.result.asset.sha256}}),artifact=rendered.result.artifact;
 assert.equal(artifact.assetId,artifact.id);assert.equal(artifact.inputHashes.source,sha(source.bytes));assert.equal(artifact.proposal.startSeconds,2);assert.deepEqual((await f.clips.asset(f.actor,artifact.assetId)).bytes,rendered.bytes);
 assert.deepEqual((await f.clips.read(f.actor,sourceId)).artifacts,[artifact]);assert.deepEqual((await f.clips.complete(f.actor,rendered.ack.uploadId)).artifact,artifact);
 const before=f.store.get(f.strategy.key),report=await f.strategy.saveReport(f.actor,{expectedRevision:before.revision,idempotencyKey:randomUUID(),report:{title:'Supplied source clip',thesis:'Manager draft only',planIds:[],sourceRefs:[sourceId],clipRefs:[{artifactId:artifact.id}]}});
 assert.deepEqual(report.report.clipSnapshots,[artifact]);
 const destination=await f.strategy.createDestination(f.actor,{expectedRevision:report.revision,idempotencyKey:randomUUID(),name:'Controlled clip destination'}),handoff=await f.strategy.handoff(f.actor,report.report.id,{expectedRevision:destination.revision,idempotencyKey:randomUUID(),expectedReportRevision:1,destinationId:destination.destination.id,objective:'Review this actual segment',deliverables:['A proposed vertical short']});
 const draft=f.store.get(scopeKey({organizationId:f.org.id,brandId:destination.destination.id})).backlog.find(s=>s.id===handoff.draft.id);assert.deepEqual(draft.draftBrief.report.clipSnapshots,[artifact]);assert.equal(draft.reviewStatus,'unreviewed');assert.equal(draft.scheduledDay,null);
 const edited=await f.clips.propose(f.actor,{idempotencyKey:randomUUID(),proposal:{...proposal(source.result.asset,recording).proposal,expectedProposalRevision:1,caption:'Later caption',id:p.proposal.id}});
 assert.equal(edited.proposal.revision,2);assert.equal((await f.clips.read(f.actor,sourceId)).artifacts[0].proposal.caption,'Manager caption');
});
test('changed bytes, stale render settings and current membership removal preserve saved assets',async t=>{
 const f=await fixture(t),source=await upload(f),recording=f.store.get(f.strategy.key).inbox.recordings[0].id,p=await f.clips.propose(f.actor,proposal(source.result.asset,recording));
 await assert.rejects(f.clips.begin(f.actor,{...source.input,idempotencyKey:source.input.idempotencyKey,name:'Different bytes intent'}),{status:409});
 await assert.rejects(f.clips.begin(f.actor,{...source.input,idempotencyKey:randomUUID(),kind:'render',recordingId:recording,proposalId:p.proposal.id,proposalRevision:99,inputHashes:{source:source.input.sha256,audio:null}}),{status:409});
 assert.equal(f.store.get(f.clips.key).artifacts.length,0);assert.equal(f.store.get(f.clips.key).assets.length,1);
 f.store.update('identity',s=>{s.memberships=s.memberships.filter(m=>m.organizationId!==f.org.id);return s;});await assert.rejects(f.clips.asset(f.actor,source.result.asset.id),{status:403});
});
test('upload size and chunk bounds fail before durable media allocation',async t=>{
 const f=await fixture(t);await assert.rejects(f.clips.begin(f.actor,{idempotencyKey:randomUUID(),kind:'source',name:'too big',contentType:'video/mp4',bytes:CLIP_LIMITS.videoBytes+1,sha256:'a'.repeat(64),rightsDeclaration:'Controlled fixture',sourceId}),{status:422});assert.equal(f.store.get(f.clips.key),null);
});

test('useful30second PCM audio exceeds generic transaction capacity but persists as bounded chunks',async t=>{
 const f=await fixture(t),bytes=Buffer.alloc(44+48000*4*30);bytes.write('RIFF',0);bytes.writeUInt32LE(bytes.length-8,4);bytes.write('WAVEfmt ',8);bytes.writeUInt32LE(16,16);bytes.writeUInt16LE(1,20);bytes.writeUInt16LE(2,22);bytes.writeUInt32LE(48000,24);bytes.writeUInt32LE(192000,28);bytes.writeUInt16LE(4,32);bytes.writeUInt16LE(16,34);bytes.write('data',36);bytes.writeUInt32LE(bytes.length-44,40);
 const begin=await f.clips.begin(f.actor,{idempotencyKey:randomUUID(),kind:'audio',name:'Owned30second.wav',contentType:'audio/wav',bytes:bytes.length,sha256:sha(bytes),rightsDeclaration:'Original synthetic audio storage fixture',sourceId});
 for(let i=0;i<begin.chunkCount;i++)await f.clips.chunk(f.actor,begin.uploadId,i,bytes.subarray(i*begin.chunkBytes,(i+1)*begin.chunkBytes));
 const complete=await f.clips.complete(f.actor,begin.uploadId);assert.equal(complete.asset.bytes,5760044);assert.deepEqual((await f.clips.asset(f.actor,complete.asset.id)).bytes,bytes);assert.ok(Buffer.byteLength(JSON.stringify(f.store.get(f.clips.key)))<100000);
});
