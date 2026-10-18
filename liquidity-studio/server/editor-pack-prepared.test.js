import { buildPreparedCandidate } from './prepared-source-candidate.js';
import test from 'node:test';
import assert from 'node:assert/strict';
import {projectPreparedHistory,restorePreparedHistory} from './editor-pack-prepared.js';
import {digest} from './editor-pack.js';
const scope={organizationId:'org',brandId:'brand'};
function fixture(){
 const text='A retained original primary-source excerpt with enough context for an editorial review.';
 const evidence={id:'evidence',schemaVersion:1,requestedUrl:'https://example.org/source',sourceUrl:'https://example.org/source',retrievedAt:'2026-10-18T00:00:00Z',contentType:'text/plain',responseSha256:digest(Buffer.from(text)),responseBytes:Buffer.byteLength(text),text,textSha256:digest(Buffer.from(text)),status:'unreviewed',approval:'none'};
 return [{candidate:{schemaVersion:1,id:'candidate',...scope,storyId:'story',contentRevision:1,inputFingerprint:'a'.repeat(64),brandRevision:'b'.repeat(64),createdAt:'2026-10-18T00:00:00Z',provenance:{purpose:'source-preparation',mode:'extractive-unreviewed',humanApproval:'none',requiresReview:true,provider:'none',modelCalls:0,evidenceIds:['evidence']},jobId:'job',itemId:'item',attemptId:'attempt',artwork:{headline:'Human edited copy'},excerpts:[{evidenceId:'evidence',sourceUrl:evidence.sourceUrl,text,startOffset:0,status:'approved',clinicalReview:{reviewerId:'old-reviewer'}}]},evidence:[evidence],revision:3,workingArtwork:{headline:'Saved current copy'},promotionReceipts:[{id:'old-grant'}],edits:[{actorId:'old-reviewer'}],replacement:{generationId:'old-generation'}}];
}
test('prepared portable projection retains exact copy and evidence but no execution or promotion authority',()=>{
 const entries=fixture(),before=structuredClone(entries),result=projectPreparedHistory(entries,scope)[0];
 assert.deepEqual(entries,before);assert.equal(result.authority,'historical-only');assert.equal(result.workingArtwork.headline,'Saved current copy');
 assert.equal(result.evidence[0].text,entries[0].evidence[0].text);assert.equal(result.candidate.excerpts[0].clinicalReview,null);
 for(const key of ['jobId','itemId','attemptId'])assert.equal(Object.hasOwn(result.candidate,key),false);
 for(const key of ['promotionReceipts','forkRequest','replacement','edits','prePromotionSourceClaims'])assert.equal(Object.hasOwn(result,key),false);
});
test('prepared portable projection rejects foreign scope, corrupt evidence, mismatched excerpts and secret extensions',()=>{
 for(const mutate of [e=>e[0].candidate.brandId='foreign',e=>e[0].evidence[0].text+='changed',e=>e[0].candidate.excerpts[0].startOffset=2,e=>e[0].candidate.password='secret']){
  const entries=fixture();mutate(entries);assert.throws(()=>projectPreparedHistory(entries,scope));
 }
});

test('restored prepared entries retain stable candidate associations but require a fresh current-generation fork',()=>{
 const history=projectPreparedHistory(fixture(),scope),target={organizationId:'new-org',brandId:'new-brand'};
 const restored=restorePreparedHistory(history,{scope:target,packSha256:'a'.repeat(64)})[0];
 assert.equal(restored.candidate.id,'candidate');assert.equal(restored.candidate.organizationId,'new-org');
 assert.equal(restored.candidate.jobId,null);assert.equal(restored.editorialStatus,'unreviewed');
 assert.deepEqual(restored.restoredHistorical,{packSha256:'a'.repeat(64),originalScope:scope,originalCandidateId:'candidate'});
 assert.equal(restored.candidate.excerpts[0].status,'unreviewed');assert.equal(restored.candidate.excerpts[0].clinicalReview,null);
 assert.equal(restored.workingArtwork.headline,'Saved current copy');
});

test('re-ejected prepared history retains the original scope rather than attributing it to the importer',()=>{
 const first=projectPreparedHistory(fixture(),scope),target={organizationId:'target',brandId:'destination'};
 const restored=restorePreparedHistory(first,{scope:target,packSha256:'c'.repeat(64)});
 const repeated=projectPreparedHistory(restored,target);
 assert.deepEqual(repeated[0].sourceScope,scope);assert.equal(repeated[0].originalCandidateId,'candidate');
});


test('version2 prefix mappings survive historical portable roundtrip without transferring source authority',()=>{
 const entries=fixture();
 entries[0].candidate=buildPreparedCandidate({id:'new',scope,story:{id:'story',revision:1},brandProfile:{},evidence:entries[0].evidence,createdAt:'2026-10-18T00:00:00Z'});
 entries[0].workingArtwork=structuredClone(entries[0].candidate.artwork);
 const history=projectPreparedHistory(entries,scope),target={organizationId:'new-org',brandId:'new-brand'};
 const restored=restorePreparedHistory(history,{scope:target,packSha256:'c'.repeat(64)});
 assert.equal(restored[0].candidate.artworkProjectionVersion,2);
 assert.deepEqual(restored[0].candidate.sourceFieldMappings,entries[0].candidate.sourceFieldMappings);
 assert.deepEqual(restored[0].workingArtwork,entries[0].workingArtwork);
 assert.equal(restored[0].candidate.excerpts[0].clinicalReview,null);assert.equal(restored[0].editorialStatus,'unreviewed');
 assert.deepEqual(projectPreparedHistory(restored,target)[0].candidate.sourceFieldMappings,entries[0].candidate.sourceFieldMappings);
 const bad=structuredClone(entries);bad[0].candidate.sourceFieldMappings[0].textLength++;
 assert.throws(()=>projectPreparedHistory(bad,scope));
});
