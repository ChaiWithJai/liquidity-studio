export const reviewSignature = (claims) => JSON.stringify(claims);

// Mirrors generation prerequisites for presentation only; the server remains authoritative.
export function sourceReviewSummary(claims = [], dirty = false) {
  const blockers = [];
  const approved = claims.filter((claim) => claim.status === "approved");
  if (!approved.length) blockers.push({ message: "Approve at least one sourced claim. Unreviewed and rejected claims are excluded.", claimId: claims[0]?.id });
  const ids = new Set();
  for (const claim of approved) {
    let url;
    try { url = new URL(claim.sourceUrl); } catch { /* report below */ }
    const reasons = [];
    if (!claim.id || ids.has(claim.id)) reasons.push("use a unique claim ID");
    ids.add(claim.id);
    if (!claim.text?.trim() || claim.text.length > 2000) reasons.push("add claim text of at most 2,000 characters");
    if (!url || url.protocol !== "https:" || url.username || url.password) reasons.push("add an HTTPS source URL without credentials");
    if (!["financial", "cultural", "clinical", "general"].includes(claim.kind)) reasons.push("choose a classification");
    if (claim.kind === "clinical" && (!claim.clinicalReview?.reviewerId || !Number.isFinite(Date.parse(claim.clinicalReview?.reviewedAt)))) reasons.push("save an authorized clinical source review");
    if (reasons.length) blockers.push({ claimId: claim.id, message: reasons.join("; ") + "." });
  }
  if (claims.length > 50) blockers.push({ message: "Keep at most 50 source claims." });
  if (dirty) blockers.push({ message: "Save source review changes before generating." });
  return { recordKind: claims.length&&claims.every(claim=>claim.purpose==='prepared-copy-review')?'reviewed-copy':'source-claims', approved: approved.length, total: claims.length, excluded: claims.length - approved.length, blockers, ready: blockers.length === 0 };
}
