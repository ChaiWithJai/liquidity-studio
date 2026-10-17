import { isDeepStrictEqual } from 'node:util';

export class ContentIntegrityError extends Error {
  constructor(code, message) { super(message); this.code = code; }
}

export function getApprovedClaims(story) {
  const sourceClaims = story?.sourceClaims;
  if (!Array.isArray(sourceClaims) || sourceClaims.length > 50) throw new ContentIntegrityError('SOURCE_REVIEW_REQUIRED', 'Approve at least one sourced claim before generation');
  const claims = sourceClaims.filter(claim => claim?.status === 'approved');
  if (!claims.length) throw new ContentIntegrityError('SOURCE_REVIEW_REQUIRED', 'Approve at least one sourced claim before generation');
  for (const claim of claims) {
    let url;
    try { url = new URL(claim.sourceUrl); } catch { /* rejected below */ }
    if (!claim.id || typeof claim.text !== 'string' || !claim.text.trim() || claim.text.length > 2000 || !url || url.protocol !== 'https:' || url.username || url.password) {
      throw new ContentIntegrityError('INVALID_SOURCE_CLAIM', 'Approved claims require an ID, text and HTTPS source URL');
    }
    if (claim.kind === 'clinical' && (!claim.clinicalReview?.reviewerId || !Number.isFinite(Date.parse(claim.clinicalReview?.reviewedAt)))) {
      throw new ContentIntegrityError('CLINICAL_REVIEW_REQUIRED', 'Clinical claims remain quarantined until clinical source review is recorded');
    }
  }
  if (new Set(claims.map(claim => claim.id)).size !== claims.length) throw new ContentIntegrityError('INVALID_SOURCE_CLAIM', 'Source claim IDs must be unique');
  return claims;
}

// Controlled excerpt mode: no model-written financial/clinical assertions or labels.
// Editorial approval records source review; it is not an automated truth guarantee.
export function campaignFromApprovedClaims(story) {
  const claims = getApprovedClaims(story);
  const [f1, f2 = f1, f3 = f1] = claims.map(claim => claim.text);
  const headline = 'SOURCE NOTES';
  return {
    infographic: { headline, statRows: [f1, f2, f3], bottomTakeaway: 'Review the sources before publishing.', caption: 'Source-backed notes for editorial review.' },
    carousel: { coverHook: headline, slides: [f1, f2, f3, 'Review the original sources before publishing.'].map((fact, i) => ({ slideNumber: i + 1, title: i === 3 ? 'Source review' : 'Reported fact', bodyMetric: fact, visualNote: 'Source excerpt text card' })) },
    story: { hookBanner: headline, keyStatHighlight: f1, interactiveStickerPrompt: 'Which detail would you investigate next?' },
    reel: { spokenHook0to3s: 'A closer look at the sources.', beats: [f1, f2, f3].map((fact, i) => ({ timecode: ['0:00-0:05', '0:05-0:15', '0:15-0:30'][i], voiceover: fact, onScreenText: fact, bRollDirection: 'Source excerpt text card' })), closingCta: 'Read the original sources before sharing.' }
  };
}

export function validateCampaign(output, story) {
  const expected = campaignFromApprovedClaims(story);
  const { provenance, ...copy } = output || {};
  if (!isDeepStrictEqual(copy, expected)) {
    throw new ContentIntegrityError('UNSUPPORTED_GENERATED_CLAIM', 'Generated content must preserve the approved source excerpts and neutral labels exactly');
  }
  return true;
}

export function evaluateCampaign(campaign, story, brandProfile = {}) {
  let integrity = false;
  let errorCode = null;
  try { validateCampaign(campaign, story); integrity = true; } catch (error) { errorCode = error.code || 'SOURCE_REVIEW_REQUIRED'; }
  const formatChecks = ['infographic', 'carousel', 'story', 'reel'].map(format => ({ format, passed: integrity, sourceExcerptsPreserved: integrity }));
  return {
    overallPass: integrity,
    score: integrity ? 100 : 0,
    scoreMeaning: 'source-excerpt contract coverage; not factual or clinical accuracy',
    factualAccuracy: 'not_assessed',
    editorialReviewRequired: true,
    domain: brandProfile.contentDomain || 'general',
    sourceReviewStatus: integrity ? 'approved_excerpts' : 'review_required',
    errorCode,
    formatChecks
  };
}
