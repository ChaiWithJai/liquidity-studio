import { fail } from './auth.js';
import { digest, exact, scanPortable } from './editor-pack.js';
const copy = value => structuredClone(value);
const hash = value => /^[a-f0-9]{64}$/.test(value);
function sourceUrl(value) {
  try { const url = new URL(value); if (url.protocol === 'https:' && !url.username && !url.password && !url.hash) return; } catch {}
  throw fail(422, 'Invalid historical evidence source URL');
}
/** Archive projection only. It never creates a live candidate, review grant or job. */
export function projectPreparedHistory(entries, scope) {
  if (!Array.isArray(entries) || entries.length > 30 || Buffer.byteLength(JSON.stringify(entries)) > 192 * 1024)
    throw fail(413, 'Prepared evidence history limit');
  scanPortable(entries);
  const ids = new Set();
  return entries.map(entry => {
    exact(entry, ['candidate','evidence','revision','workingArtwork','editorialStatus','edits','prePromotionSourceClaims','promotionReceipts','forkRequest','replacement','derivation','restoredHistorical']);
    const candidate = entry.candidate;
    exact(candidate, ['schemaVersion','id','organizationId','brandId','preset','storyId','contentRevision','inputFingerprint','brandRevision','jobId','itemId','attemptId','createdAt','excerpts','sourceSelection','artwork','provenance']);
    if (candidate.schemaVersion !== 1 || !candidate.id || ids.has(candidate.id) || !candidate.storyId ||
      candidate.organizationId !== scope.organizationId || candidate.brandId !== scope.brandId)
      throw fail(422, 'Foreign or duplicate prepared candidate');
    ids.add(candidate.id);
    if (!Number.isInteger(candidate.contentRevision) || candidate.contentRevision < 1 ||
        !hash(candidate.inputFingerprint) || !hash(candidate.brandRevision) || !Number.isFinite(Date.parse(candidate.createdAt)) ||
        !Number.isInteger(entry.revision || 1) || (entry.revision || 1) < 1)
      throw fail(422, 'Invalid historical candidate revision');
    exact(candidate.provenance, ['purpose','mode','humanApproval','requiresReview','provider','modelCalls','evidenceIds']);
    if (candidate.provenance.purpose !== 'source-preparation' || candidate.provenance.mode !== 'extractive-unreviewed' ||
        candidate.provenance.humanApproval !== 'none' || candidate.provenance.requiresReview !== true ||
        candidate.provenance.provider !== 'none' || candidate.provenance.modelCalls !== 0)
      throw fail(422, 'Unsupported prepared candidate provenance');
    let originalScope = scope, originalCandidateId = candidate.id;
    if (entry.restoredHistorical) {
      exact(entry.restoredHistorical, ['packSha256','originalScope','originalCandidateId']);
      exact(entry.restoredHistorical.originalScope, ['organizationId','brandId']);
      if (!hash(entry.restoredHistorical.packSha256) || !entry.restoredHistorical.originalScope.organizationId ||
          !entry.restoredHistorical.originalScope.brandId || !entry.restoredHistorical.originalCandidateId)
        throw fail(422, 'Invalid restored prepared provenance');
      originalScope = entry.restoredHistorical.originalScope;
      originalCandidateId = entry.restoredHistorical.originalCandidateId;
    }
    if (!Array.isArray(entry.evidence) || !entry.evidence.length || entry.evidence.length > 2)
      throw fail(422, 'Historical prepared evidence required');
    const evidenceIds = new Set();
    const evidence = entry.evidence.map(snapshot => {
      exact(snapshot, ['id','schemaVersion','requestedUrl','sourceUrl','retrievedAt','contentType','responseSha256','responseBytes','extractionVersion','selectionMethod','selectionQuerySha256','text','textSha256','status','approval']);
      sourceUrl(snapshot.sourceUrl); sourceUrl(snapshot.requestedUrl);
      if (snapshot.schemaVersion !== 1 || !snapshot.id || evidenceIds.has(snapshot.id) ||
          typeof snapshot.text !== 'string' || snapshot.text.length > 24000 ||
          snapshot.textSha256 !== digest(Buffer.from(snapshot.text)) || !hash(snapshot.responseSha256) ||
          !Number.isSafeInteger(snapshot.responseBytes) || snapshot.responseBytes < 0 || snapshot.responseBytes > 512 * 1024)
        throw fail(422, 'Historical evidence integrity failed');
      evidenceIds.add(snapshot.id);
      return {...copy(snapshot), status:'unreviewed', approval:'none'};
    });
    if (!Array.isArray(candidate.excerpts) || candidate.excerpts.length > 4)
      throw fail(422, 'Invalid historical excerpts');
    const excerpts = candidate.excerpts.map(excerpt => {
      exact(excerpt, ['evidenceId','sourceUrl','text','startOffset','status','clinicalReview']);
      const original = evidence.find(item => item.id === excerpt.evidenceId);
      if (!original || original.sourceUrl !== excerpt.sourceUrl || typeof excerpt.text !== 'string' ||
          !Number.isInteger(excerpt.startOffset) || excerpt.startOffset < 0 ||
          original.text.slice(excerpt.startOffset, excerpt.startOffset + excerpt.text.length) !== excerpt.text)
        throw fail(422, 'Historical excerpt does not match retained evidence');
      return {...copy(excerpt),status:'unreviewed',clinicalReview:null};
    });
    const {jobId,itemId,attemptId,...historicalCandidate} = copy(candidate);
    return {schemaVersion:1,authority:'historical-only',sourceScope:{organizationId:originalScope.organizationId,brandId:originalScope.brandId},originalCandidateId,
      storyId:candidate.storyId,candidate:{...historicalCandidate,excerpts},evidence,
      revision:entry.revision || 1,workingArtwork:copy(entry.workingArtwork || candidate.artwork),editorialStatus:'unreviewed'};
  });
}

/** Retained entries are discoverable only for an explicit new current-generation fork. */
export function restorePreparedHistory(history, {scope,packSha256}) {
  if (!hash(packSha256)) throw fail(422, 'Restored preparation pack hash required');
  return history.map(item => {
    if (item.authority !== 'historical-only' || item.schemaVersion !== 1)
      throw fail(422, 'Prepared history must be non-authoritative');
    return {candidate:{...copy(item.candidate),...copy(scope),storyId:item.storyId,jobId:null,itemId:null,attemptId:null},
      evidence:copy(item.evidence),revision:item.revision,workingArtwork:copy(item.workingArtwork),editorialStatus:'unreviewed',
      restoredHistorical:{packSha256,originalScope:copy(item.sourceScope),originalCandidateId:item.originalCandidateId}};
  });
}
