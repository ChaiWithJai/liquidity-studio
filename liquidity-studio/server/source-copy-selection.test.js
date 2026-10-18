// Controlled text fixtures exercise exact source-copy contracts, not live retrieval.
import test from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {catalogForStory,sourceCopySelection} from './source-catalog.js';
import {buildPreparedCandidate,validatePreparedCandidate,validateCandidateLayout} from './prepared-source-candidate.js';
import {projectPreparedHistory,restorePreparedHistory} from './editor-pack-prepared.js';
import {extractSourceText} from './source-retrieval.js';
import {BRAND_PRESETS} from './domain.js';
const topics=[['story_beyonce_amc','Beyoncé AMC','liquidity_desk'],['story_margot_luckychap','LuckyChap','liquidity_desk'],['story_nykaa_ipo','Nykaa','liquidity_desk'],['research_1','Ramanujan','vedic_dharma']];
const hash=text=>createHash('sha256').update(text).digest('hex');
function fixture([id,title,preset]){
 const story={id,title,revision:1},scope={organizationId:'org',brandId:preset,preset};
 const pointer=catalogForStory(story,scope)[0],selection=sourceCopySelection(pointer.artworkSelectionId);
 let text=selection.captionPrefix+' Controlled fixture context for editorial review.\n';
 for(const literal of [selection.headline,...selection.facts.map(x=>x.text),...selection.overlays])if(!text.includes(literal))text+=literal+'\n';
 text=text.trim();
 const evidence=[{schemaVersion:1,id:'evidence',sourceUrl:selection.sourceUrl,requestedUrl:selection.sourceUrl,retrievedAt:'2026-10-18T00:00:00Z',contentType:'text/html',responseSha256:hash(text),textSha256:hash(text),responseBytes:Buffer.byteLength(text),text,status:'unreviewed',approval:'none'}];
 const candidate=buildPreparedCandidate({id:'candidate',story,scope,brandProfile:{},evidence,createdAt:'2026-10-18T00:00:00Z'});
 return {story,scope,pointer,selection,evidence,candidate};
}
test('pinned exact source-copy selections give useful distinct complete clauses/sentences and every format fits both brand profiles',()=>{
 for(const topic of topics){
  const {selection,evidence,candidate}=fixture(topic);
  assert.equal(candidate.artworkProjectionVersion,3);assert.equal(validatePreparedCandidate(candidate,evidence),true);
  assert.deepEqual(candidate.artwork.infographic.statRows,selection.facts.map(x=>x.text));
  assert.equal(new Set(candidate.artwork.infographic.statRows).size,3);
  assert.equal(candidate.artwork.infographic.headline,selection.headline);
  assert.equal(candidate.artwork.infographic.bottomTakeaway,selection.contextText);
  assert.equal(candidate.artwork.story.interactiveStickerPrompt,selection.contextText);
  assert.equal(candidate.artwork.reel.closingCta,selection.contextText);
  assert.ok(candidate.artwork.carousel.slides.every(x=>x.visualNote===selection.contextText));
  assert.doesNotMatch(candidate.artwork.infographic.statRows.join('\n'),/announce that$|with RENAISSANCE set to$|who, with almost$/m);
  for(const fact of selection.facts)if(fact.form==='sentence')assert.match(fact.text,/[.!?]$/);
  for(const map of candidate.sourceFieldMappings){
   const value=map.fieldPath.split('.').reduce((value,key)=>value[key],candidate.artwork);
   assert.equal(value,evidence[0].text.slice(map.startOffset,map.startOffset+map.textLength));
   assert.ok(['label','clause','sentence','context'].includes(map.copyForm));
  }
  for(const brandProfile of Object.values(BRAND_PRESETS))assert.doesNotThrow(()=>validateCandidateLayout(candidate.artwork,brandProfile));
  assert.equal(candidate.provenance.humanApproval,'none');assert.equal(candidate.provenance.modelCalls,0);
  assert.ok(candidate.excerpts.every(x=>x.clinicalReview===null&&x.status==='unreviewed'));
 }
 const amc=fixture(topics[0]).candidate;
 assert.match(amc.artwork.infographic.statRows.join(' '),/premieres December 1.*AMC Theatres Distribution.*December 1, 2023/);
 const nykaa=fixture(topics[2]).candidate;
 assert.match(nykaa.artwork.infographic.statRows[0],/board approval to sign an agreement/);
 assert.doesNotMatch(nykaa.artwork.infographic.statRows.join(' '),/IPO|valuation|112|4500|Red Seer|completed/);
});
test('missing, duplicate, forged and unknown exact-copy selections fail422 without a truncated fallback',()=>{
 const f=fixture(topics[0]);
 for(const change of [
  e=>e[0].text=e[0].text.replace(f.selection.facts[0].text,'Changed publisher wording.'),
  e=>e[0].text+='\n'+f.selection.facts[0].text,
 ]){
  const evidence=structuredClone(f.evidence);change(evidence);evidence[0].textSha256=hash(evidence[0].text);
  assert.throws(()=>buildPreparedCandidate({id:'bad',story:f.story,scope:f.scope,brandProfile:{},evidence}),error=>error.status===422);
 }
 for(const change of [c=>c.sourceSelection[0].artworkSelectionId='unknown',c=>c.sourceSelection[0].id='foreign',c=>c.sourceFieldMappings[0].startOffset++,c=>c.sourceFieldMappings[0].copyForm='sentence',c=>c.artwork.infographic.statRows[0]='Invented outcome',c=>c.artworkProjectionVersion=99]){
  const candidate=structuredClone(f.candidate);change(candidate);assert.throws(()=>validatePreparedCandidate(candidate,f.evidence),error=>error.status===422);
 }
 const clone=sourceCopySelection(f.selection.id);clone.facts[0].text='External mutation';assert.equal(sourceCopySelection(f.selection.id).facts[0].text,f.selection.facts[0].text);
});
test('version3 exact spans and human working copy survive portable history without restoring approval',()=>{
 const f=fixture(topics[3]);
 const workingArtwork=structuredClone(f.candidate.artwork);workingArtwork.infographic.headline='Engineer QA saved heading';
 const history=projectPreparedHistory([{candidate:f.candidate,evidence:f.evidence,revision:2,workingArtwork}],f.scope);
 const target={organizationId:'new-owner-org',brandId:'new-brand',preset:'vedic_dharma'};
 const restored=restorePreparedHistory(history,{scope:target,packSha256:'a'.repeat(64)});
 assert.equal(restored[0].candidate.artworkProjectionVersion,3);assert.deepEqual(restored[0].candidate.sourceFieldMappings,f.candidate.sourceFieldMappings);
 assert.equal(restored[0].workingArtwork.infographic.headline,workingArtwork.infographic.headline);
 assert.equal(restored[0].editorialStatus,'unreviewed');assert.ok(restored[0].restoredHistorical);
 assert.deepEqual(projectPreparedHistory(restored,target)[0].candidate.artwork,f.candidate.artwork);
});
test('Nykaa actual two-paragraph markup has internal sentences, not independent BR paragraphs',()=>{
 const scope={preset:'liquidity_desk'},pointer=catalogForStory({id:'story_nykaa_ipo',title:'Nykaa'},scope)[0],p=pointer.passage;
 const first='Mumbai, October 6, 2022 : Controlled planned-alliance fixture. Bringing its proven multi-brand beauty retail expertise remains within the same paragraph.';
 const second='Founded by Falguni Nayar in 2012, controlled fixture context. The technology-led company remains within this second paragraph.';
 const html=`<a>${p.section}</a><h1>${p.section}</h1><p><strong>Mumbai, October 6, 2022</strong>: Controlled planned-alliance fixture. Bringing its proven multi-brand beauty retail expertise remains within the same paragraph.</p><p>${second}</p><p>As per a Red Seer report, excluded forecasts do not enter evidence.</p>`;
 assert.equal(extractSourceText(html,'text/html','',p),first+'\n'+second);assert.equal(p.lineBreakParagraphs,undefined);
 for(const bad of [html.replace('Founded by Falguni Nayar in 2012,','Changed source prefix,'),html+`<h2>${p.section}</h2>`,html+`<p>${second}</p>`])assert.throws(()=>extractSourceText(bad,'text/html','',p),error=>error.status===422);
});


test('trusted server forks retain version1/2 source projections rather than adopting the new catalog copy version',()=>{
 const f=fixture(topics[0]),{artworkSelectionId,...oldPointer}=f.pointer;
 for(const version of [1,2]){
  const template={sourceSelection:[oldPointer],...(version===2?{artworkProjectionVersion:2}:{})};
  const old=buildPreparedCandidate({id:'old',scope:f.scope,story:f.story,brandProfile:{},evidence:f.evidence,projectionFrom:template});
  const before=structuredClone(old);
  const fork=buildPreparedCandidate({id:'new-fork',scope:f.scope,story:{...f.story,revision:2},brandProfile:{},evidence:f.evidence,projectionFrom:old});
  assert.equal(fork.artworkProjectionVersion,version===1?undefined:2);
  assert.deepEqual(fork.artwork,old.artwork);assert.deepEqual(fork.excerpts,old.excerpts);
  assert.deepEqual(fork.sourceSelection,old.sourceSelection);assert.deepEqual(old,before);
  assert.equal(validatePreparedCandidate(fork,f.evidence),true);
 }
});

test('small actual retained primary passages are literal source text, not enough evidence to auto-fill unseen copy',async()=>{
 const {readFile}=await import('node:fs/promises');
 const passages=JSON.parse(await readFile(new URL('./fixtures/source-copy-primary-passages.json',import.meta.url),'utf8'));
 for(const passage of passages){
  const topic=topics.find(x=>x[0]===passage.storyId),f=fixture(topic);
  assert.equal(f.selection.sourceUrl,passage.sourceUrl);
  assert.ok([f.selection.headline,f.selection.contextText,...f.selection.facts.map(x=>x.text)].includes(passage.text));
  if(passage.form==='sentence')assert.match(passage.text,/[.!?]$/);
  const evidence=[{...f.evidence[0],text:passage.text,textSha256:hash(passage.text)}];
  // No unseen publisher sentence may be supplied from the curated registry alone.
  assert.throws(()=>buildPreparedCandidate({id:'partial',scope:f.scope,story:f.story,brandProfile:{},evidence}),error=>error.status===422);
 }
});
