import test from 'node:test';
import assert from 'node:assert/strict';
import { catalogForStory } from './source-catalog.js';
import { INITIAL_CONTENT_BACKLOG, BRAND_PRESETS, normalizeLegacyResearch } from './domain.js';
import { extractSourceText, validateSourceUrl } from './source-retrieval.js';
import { buildPreparedCandidate, validatePreparedCandidate } from './prepared-source-candidate.js';
import { createHash } from 'node:crypto';

const finance = { organizationId:'org',brandId:'finance',preset:'liquidity_desk' };
const culture = { organizationId:'org',brandId:'culture',preset:'vedic_dharma' };
const topics = [
 ['story_beyonce_amc', 'Beyoncé’s Direct-to-AMC Concert Film Distribution Play', finance],
 ['story_margot_luckychap', 'Margot Robbie & LuckyChap: Film Production and IP Development', finance],
 ['story_nykaa_ipo', 'Nykaa’s 2022 Plan for a GCC Omnichannel Alliance', finance],
 ['research_1', 'Ramanujan: Trinity’s Record of Mathematical Work', culture],
];

test('new nonclinical selections are exact-story/preset bounded and never approve seed claims',()=>{
 const before=JSON.stringify(INITIAL_CONTENT_BACKLOG);
 for(const [id,title,scope] of topics){
  const entry=catalogForStory({id,title},scope)[0];
  assert.ok(entry);assert.equal(entry.status,'unreviewed');assert.equal(entry.approval,'none');
  assert.equal(validateSourceUrl(entry.sourceUrl).href,entry.sourceUrl);
  assert.deepEqual(catalogForStory({id,title},{...scope,preset:scope.preset==='vedic_dharma'?'liquidity_desk':'vedic_dharma'}),[]);
  assert.deepEqual(catalogForStory({id:'foreign',title},scope),[]);
 }
 assert.equal(JSON.stringify(INITIAL_CONTENT_BACKLOG),before);
 for(const story of INITIAL_CONTENT_BACKLOG){
  const normalized=normalizeLegacyResearch(story);
  assert.ok(normalized.sourceClaims.every(c=>c.status==='unreviewed'));
 }
 for(const i of [0,2,3]){
  const story={...BRAND_PRESETS.vedic_dharma.researchBacklog[i],id:`research_${i}`};
  const clinical=catalogForStory(story,culture);
  assert.equal(clinical.length,1);
  assert.equal(clinical[0].kind,'clinical');
  assert.equal(clinical[0].status,'unreviewed');
  assert.equal(clinical[0].approval,'none');
  assert.deepEqual(catalogForStory(story,finance),[]);
  assert.deepEqual(story.sourceClaims,[]);
 }
});

test('existing passage selector excludes Nykaa totals and Ramanujan inscription rather than ranking them into artwork',()=>{
 // Deliberately adversarial synthetic fixtures: these are not a live retrieval claim.
 for(const [id,title,scope] of topics.filter(([id])=>['story_nykaa_ipo','research_1'].includes(id))){
  const entry=catalogForStory({id,title},scope)[0], {passage}=entry;
  const selected=passage.paragraphPrefixes.map(prefix=>`${prefix} describes this bounded institutional source selection for editorial review.`);
  const html=`<h1>Unrelated site heading</h1><h2>${passage.section}</h2>${selected.map(x=>`<p>${x}</p>`).join('')}<p>Unsupported 276 stores or first Indian FRS assertion must not become evidence.</p><h3>${passage.nextSection}</h3><p>Later-section unrelated biography and commercial claims.</p>`;
  const text=extractSourceText(html,'text/html',title,passage);
  assert.equal(text,selected.join('\n'));assert.doesNotMatch(text,/276|first Indian|Later-section/);
  const evidence=[{id:'evidence',sourceUrl:entry.sourceUrl,text,textSha256:createHash('sha256').update(text).digest('hex'),status:'unreviewed',approval:'none'}];
  const candidate=buildPreparedCandidate({id:'candidate',story:{id:"synthetic-selector",title},scope,brandProfile:{},evidence});
  assert.equal(validatePreparedCandidate(candidate,evidence),true);
  assert.equal(candidate.provenance.humanApproval,'none');assert.equal(candidate.provenance.modelCalls,0);
  assert.ok(candidate.excerpts.every(x=>text.slice(x.startOffset).startsWith(x.text)));
  for(const broken of [...(passage.mode ? [] : [html.replace(`<h3>${passage.nextSection}</h3>`,'<h3>Changed boundary</h3>')]),html+`<h2>${passage.section}</h2>`,html.replace(`<p>${selected[0]}</p>`,'')]){
   assert.throws(()=>extractSourceText(broken,'text/html',title,passage),/missing or ambiguous/);
  }
 }
});

test('explicit after-heading selection keeps literal release paragraphs, Unicode and exact offsets without About/legal tail',()=>{
 const story={id:topics[0][0],title:topics[0][1]},entry=catalogForStory(story,finance)[0],p=entry.passage;
 const selected=p.paragraphPrefixes.map((prefix,i)=>`${prefix} this exact Beyoncé release paragraph ${i} is retained for unreviewed evidence.`);
 const html=`<nav><a>${p.section}</a></nav><p>LOS ANGELES--(BUSINESS WIRE)-- Today, pre-heading material is excluded.</p><h1>${p.section}</h1>${selected.map(x=>`<p>${x}</p>`).join('')}<p>About AMC: unrelated company ranking keywords and legal material.</p><p>Cookie terms and media contact details.</p>`;
 const text=extractSourceText(html,'text/html',story.title,p);
 assert.equal(text,selected.join('\n'));assert.doesNotMatch(text,/About AMC|Cookie|pre-heading/);
 const evidence=[{id:'selected',sourceUrl:entry.sourceUrl,text,textSha256:createHash('sha256').update(text).digest('hex'),status:'unreviewed',approval:'none'}];
 const candidate=buildPreparedCandidate({id:'release',story:{...story,id:"synthetic-selector"},scope:finance,brandProfile:{},evidence});
 assert.equal(validatePreparedCandidate(candidate,evidence),true);
 assert.ok(candidate.excerpts.every(x=>text.slice(x.startOffset).startsWith(x.text)));
 assert.equal(candidate.provenance.humanApproval,'none');
 for(const bad of [
  html.replace(`<h1>${p.section}</h1>`,'<h1>Different heading</h1>'),
  html+`<h2>${p.section}</h2>`,
  html.replace(`<p>${selected[0]}</p>`,''),
  html+`<p>${selected[0]}</p>`,
 ])assert.throws(()=>extractSourceText(bad,'text/html',story.title,p),/missing or ambiguous/);
 assert.throws(()=>extractSourceText(html,'text/html','',{...p,mode:'unknown'}),/Unknown/);
 assert.throws(()=>extractSourceText(html,'text/html','',{...p,mode:undefined}),/missing or ambiguous/);
 assert.throws(()=>extractSourceText(html,'text/plain','',p),/Invalid bounded/);
 assert.throws(()=>extractSourceText(html+'x'.repeat(512*1024),'text/html','',p),/Invalid bounded/);
 assert.throws(()=>extractSourceText(html,'text/html','',{...p,paragraphPrefixes:[p.paragraphPrefixes[0],p.paragraphPrefixes[0]]}),/Invalid bounded/);
});


test('explicit opt-in BR fixture selects named paragraphs and fails closed without changing default HTML behavior',()=>{
 const entry=catalogForStory({id:'story_nykaa_ipo',title:'Nykaa'},finance)[0],p={...entry.passage,lineBreakParagraphs:true,paragraphPrefixes:['Mumbai, October 6, 2022 :','Bringing its proven multi-brand beauty retail expertise','The technology-led company']};
 const selected=p.paragraphPrefixes.map((prefix,i)=>`${prefix} literal primary paragraph ${i} with Unicode GCC café.`);
 const html=`<a>${p.section}</a><h1>${p.section}</h1><p>${selected.join('<br />')}<br>As per a Red Seer report, excluded partner forecast.<br>About Apparel Group: excluded boilerplate.</p>`;
 assert.equal(extractSourceText(html,'text/html','',p),selected.join('\n'));
 for(const bad of [html+`<h2>${p.section}</h2>`,html.replace(selected[1],''),html+`<p>${selected[0]}</p>`])assert.throws(()=>extractSourceText(bad,'text/html','',p),/missing or ambiguous/);
 for(const option of ['true',1,null])assert.throws(()=>extractSourceText(html,'text/html','',{...p,lineBreakParagraphs:option}),/line-break/);
 assert.throws(()=>extractSourceText(html,'text/html','',{...p,mode:undefined}),/line-break/);
 assert.throws(()=>extractSourceText(html,'text/html','',{...p,mode:'other'}),/Unknown/);
 assert.throws(()=>extractSourceText(html,'text/plain','',p),/Invalid bounded/);
 assert.throws(()=>extractSourceText(html+'x'.repeat(512*1024),'text/html','',p),/Invalid bounded/);
 assert.throws(()=>extractSourceText(html,'text/html','',{...p,lineBreakParagraphs:false}),/missing or ambiguous/);
 // Existing HTML behavior does not gain BR separators implicitly.
 assert.equal(extractSourceText('<h1>Old</h1><p>First old paragraph has enough source words.<br>Second old paragraph has enough source words.</p>','text/html'),extractSourceText('<h1>Old</h1><p>First old paragraph has enough source words. Second old paragraph has enough source words.</p>','text/html'));
});
