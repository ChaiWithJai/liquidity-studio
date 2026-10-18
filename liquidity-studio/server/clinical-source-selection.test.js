// Actual short primary passages, plus controlled adversarial wrappers. No live HTTP/model calls.
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createHash,randomUUID} from 'node:crypto';
import {catalogForStory,sourceCopySelection} from './source-catalog.js';
import {buildPreparedCandidate,validatePreparedCandidate,validateCandidateLayout} from './prepared-source-candidate.js';
import {projectPreparedHistory} from './editor-pack-prepared.js';
import {extractSourceText} from './source-retrieval.js';
import {BRAND_PRESETS} from './domain.js';
import {DurableStore} from './storage.js';
import {createPlatform} from './platform.js';
process.env.NODE_ENV='test';
const passages=JSON.parse(await readFile(new URL('./fixtures/clinical-primary-passages.json',import.meta.url),'utf8'));
const topics=[['research_0','Ashwagandha','23439798'],['research_2','Bhramari','21446363'],['research_3','Dinacharya and circadian research','25535358']];
const hash=text=>createHash('sha256').update(text).digest('hex');
function fixture(topic){
 const [id,title,pmid]=topic,source=passages.find(x=>x.pmid===pmid),scope={organizationId:'org',brandId:'brand',preset:'vedic_dharma'},story={id,title,revision:1};
 const text=source.paragraphs.join('\n'),evidence=[{schemaVersion:1,id:'evidence',sourceUrl:source.url,requestedUrl:source.url,retrievedAt:'2026-10-18T00:00:00Z',contentType:'text/html',responseSha256:hash(text),textSha256:hash(text),responseBytes:Buffer.byteLength(text),text,status:'unreviewed',approval:'none'}];
 const candidate=buildPreparedCandidate({id:'candidate',scope,story,evidence,brandProfile:BRAND_PRESETS.vedic_dharma,createdAt:'2026-10-18T00:00:00Z'});
 return {scope,story,evidence,candidate,pointer:catalogForStory(story,scope)[0]};
}
test('actual primary passages produce bounded clinical research copy, exact maps and nonprocedural captions',()=>{
 for(const topic of topics){
  const f=fixture(topic),selection=sourceCopySelection(f.pointer.artworkSelectionId);
  assert.equal(f.pointer.kind,'clinical');assert.equal(selection.requiredKind,'clinical');
  assert.equal(validatePreparedCandidate(f.candidate,f.evidence),true);
  assert.equal(f.candidate.artwork.infographic.caption,selection.captionText);
  assert.ok(f.candidate.excerpts.every(x=>x.clinicalReview===null&&x.status==='unreviewed'));
  for(const map of f.candidate.sourceFieldMappings){const value=map.fieldPath.split('.').reduce((v,k)=>v[k],f.candidate.artwork);assert.equal(value,f.evidence[0].text.slice(map.startOffset,map.startOffset+map.textLength));}
  for(const profile of Object.values(BRAND_PRESETS))assert.doesNotThrow(()=>validateCandidateLayout(f.candidate.artwork,profile));
  assert.doesNotMatch(f.candidate.artwork.infographic.caption,/thumbs|inhale|exhale|must chant/);
 }
});
test('clinical IDs and retained source URLs cannot be downgraded, omitted or converted to legacy projections',()=>{
 for(const topic of topics){const f=fixture(topic);
  for(const change of [c=>delete c.sourceSelection[0].kind,c=>c.sourceSelection[0].kind='general',c=>c.sourceSelection[0].kind='cultural',c=>c.sourceSelection[0].publisher='2026 proven cure',c=>c.sourceSelection=[],c=>delete c.sourceSelection,c=>c.sourceSelection[0].artworkSelectionId='amc-release-copy-v1',c=>c.artworkProjectionVersion=2,c=>delete c.artworkProjectionVersion]){
   const candidate=structuredClone(f.candidate);change(candidate);
   assert.throws(()=>validatePreparedCandidate(candidate,f.evidence),e=>e.status===422);
   assert.throws(()=>projectPreparedHistory([{candidate,evidence:f.evidence,revision:1}],f.scope),e=>e.status===422);
   assert.throws(()=>buildPreparedCandidate({id:'fork',scope:f.scope,story:f.story,evidence:f.evidence,brandProfile:{},projectionFrom:candidate}),e=>e.status===422);
  }
 }
});
test('strict clinical passage selection rejects missing and duplicated real boundaries',()=>{
 for(const topic of topics){const f=fixture(topic),p=f.pointer.passage;
  // Controlled HTML layout uses actual retained paragraphs; Ashwagandha results/conclusion
  // are deliberately synthetic here because this short fixture is not its full abstract.
  const paragraphs=p.paragraphPrefixes.map(prefix=>f.evidence[0].text.split('\n').find(x=>x.startsWith(prefix))||prefix+' Controlled boundary fixture only.');
  const html=`<h2>${p.section}</h2>${paragraphs.map(x=>`<p>${x}</p>`).join('')}<h2>${p.nextSection||'References'}</h2><p>Unselected cited paper.</p>`;
  const text=extractSourceText(html,'text/html','',p);assert.doesNotMatch(text,/Unselected cited/);
  for(const bad of [html.replace(paragraphs[0],'Changed boundary'),html+`<h2>${p.section}</h2>`,html.replace(`<h2>${p.nextSection||'References'}</h2>`,`<p>${paragraphs[0]}</p><h2>${p.nextSection||'References'}</h2>`)])assert.throws(()=>extractSourceText(bad,'text/html','',p),e=>e.status===422);
 }
});
test('promotion and reviewed-copy fork preserve mandatory separate clinical confirmation',async t=>{
 const store=new DurableStore(':memory:');t.after(()=>store.close());
 const platform=createPlatform({store,authMode:'password'});await platform.ready;
 await platform.identity.provision({username:'clinical-founder',password:'controlled-clinical-founder-239!',role:'founder'});
 const actor=(await store.get('identity')).users.find(x=>x.username==='clinical-founder');
 const scope=await platform.identity.authorize(actor,'org_default','brand_vedic'),container=await platform.forScope(scope),repo=container.ports.repo;
 const story=(await repo.read()).backlog.find(x=>x.id==='research_0'),f=fixture(topics[0]);
 const candidate=buildPreparedCandidate({id:randomUUID(),scope,story,evidence:f.evidence,brandProfile:(await repo.read()).brandProfile,createdAt:new Date().toISOString()});
 await repo.mutate(state=>{state.preparedSourceCandidates=[{candidate,evidence:f.evidence,revision:1,editorialStatus:'unreviewed'}];state.backlog.find(x=>x.id===story.id).preparedCandidateId=candidate.id;return state;});
 const service=platform.preparedPromotion(scope,repo),plan=await service.plan(actor,candidate.id);
 assert.equal(plan.requiresClinicalReview,true);
 const input={idempotencyKey:randomUUID(),expectedCandidateRevision:plan.candidateRevision,expectedContentRevision:plan.contentRevision,brandRevision:plan.brandRevision,copySha256:plan.copySha256,evidenceSha256:plan.evidenceSha256,reviewed:true,kind:'general'};
 await assert.rejects(service.promote(actor,candidate.id,input),e=>e.status===403);
 await assert.rejects(service.promote(actor,candidate.id,{...input,kind:'clinical'}),e=>e.status===403);
 for(const kind of [undefined,'general']){
  await repo.mutate(state=>{const p=state.preparedSourceCandidates[0].candidate.sourceSelection[0];if(kind===undefined)delete p.kind;else p.kind=kind;return state;});
  await assert.rejects(service.plan(actor,candidate.id),e=>e.status===422);
  await assert.rejects(service.promote(actor,candidate.id,{...input,kind:'general'}),e=>e.status===422);
 }
 await repo.mutate(state=>{state.preparedSourceCandidates[0].candidate.sourceSelection[0].kind='clinical';return state;});
 await service.promote(actor,candidate.id,{...input,kind:'clinical',clinicalReviewed:true});
 const current=(await repo.read()).backlog.find(x=>x.id===story.id);
 await repo.mutate(state=>{delete state.preparedSourceCandidates[0].candidate.sourceSelection[0].kind;return state;});
 await assert.rejects(service.fork(actor,story.id,{idempotencyKey:randomUUID(),expectedRevision:current.revision,expectedContentRevision:current.contentRevision,generationId:current.generationId,brandRevision:plan.brandRevision}),e=>e.status===422);
});
