import test from "node:test";
import assert from "node:assert/strict";
import { sourceReviewSummary } from "../src/lib/source-review.js";
import { getApprovedClaims } from "./source-integrity.js";
const claim = { id: "stable-claim", text: "Reviewed excerpt", sourceUrl: "https://example.org/source", status: "approved", kind: "general" };
test("presentation follows real generation eligibility for empty, rejected, invalid, clinical and mixed claims", () => {
  const cases = [[], [{...claim,status:"unreviewed"}], [{...claim,status:"rejected"}], [claim], [{...claim,sourceUrl:"http://example.org"}], [{...claim,kind:"clinical"}], [{...claim,kind:"clinical",clinicalReview:{reviewerId:"founder",reviewedAt:"2026-10-17T00:00:00Z"}}], [claim,{...claim,id:"excluded",status:"rejected"}], [claim,claim]];
  for (const sourceClaims of cases) {
    let accepted = true;
    try { getApprovedClaims({sourceClaims}); } catch { accepted = false; }
    assert.equal(sourceReviewSummary(sourceClaims).ready, accepted);
  }
  assert.equal(sourceReviewSummary([claim],true).ready,false);
  assert.equal(sourceReviewSummary([{...claim,kind:"clinical"}]).blockers[0].claimId,claim.id);
});
