import { assertRestoreAvailable } from "./restore-gate.js";
import { randomUUID } from "node:crypto";
import { fail } from "./auth.js";
import { exact, hash } from "./workspace-schema.js";
import { brandRevision } from "./multimodal-contract.js";
import { getApprovedClaims, validateCampaign } from "./source-integrity.js";
import {
  preparationFingerprint,
  validateCandidateLayout,
} from "./prepared-source-candidate.js";
import {
  REVIEWED_CANDIDATE_MODE,
  copyFields,
  copyDigest,
  reconstructReviewedCopy,
} from "./prepared-copy-review.js";
import {
  captureContentRevisions,
  applyContentRevisions,
} from "./story-content-revision.js";
const evidenceDigest = (evidence) =>
  hash(
    evidence.map(({ id, sourceUrl, responseSha256, textSha256 }) => ({
      id,
      sourceUrl,
      responseSha256,
      textSha256,
    })),
  );
const copy = (value) => structuredClone(value);
export class PreparedPromotionService {
  constructor({ repo, identity, scope }) {
    Object.assign(this, { repo, identity, scope });
  }
  async principal(actor) {
    const identity = await this.repo.store.get("identity"),
      current = identity?.users.find((user) => user.id === actor?.id);
    if (!current) throw fail(403, "Current reviewer unavailable");
    await this.identity.authorize(
      current,
      this.scope.organizationId,
      this.scope.brandId,
    );
    return { actor: current, identityHash: hash(identity) };
  }
  entry(state, id) {
    const entry = state.preparedSourceCandidates?.find(
      (entry) => entry.candidate.id === id,
    );
    if (!entry) throw fail(404, "Prepared candidate not found");
    return entry;
  }
  current(state, entry) {
    const story = state.backlog.find(
      (story) => story.id === entry.candidate.storyId,
    );
    if (
      !story ||
      preparationFingerprint(story, this.scope) !==
        entry.candidate.inputFingerprint ||
      brandRevision(state.brandProfile) !== entry.candidate.brandRevision
    )
      throw fail(
        409,
        "Prepared source or brand changed; preserve this draft and prepare again",
      );
    return story;
  }
  async plan(actor, id) {
    const principal = await this.principal(actor),
      state = await this.repo.read(),
      entry = this.entry(state, id),
      story = this.current(state, entry),
      artwork = entry.workingArtwork || entry.candidate.artwork;
    return {
      candidateId: id,
      candidateRevision: entry.revision || 1,
      contentRevision: story.contentRevision || 1,
      brandRevision: entry.candidate.brandRevision,
      copySha256: copyDigest(artwork),
      evidenceSha256: evidenceDigest(entry.evidence),
      copyFieldCount: copyFields(artwork).length,
      sourceUrls: entry.evidence.map((source) => source.sourceUrl),
      requiresClinicalReview:
        (entry.candidate.sourceSelection || []).some(
          (source) => source.kind === "clinical",
        ) ||
        (story.sourceClaims || []).some((claim) => claim.kind === "clinical"),
      canReviewClinical: principal.actor.role === "founder",
      approvalMeaning:
        "Exact saved copy and retrieved evidence reviewed by the current operator; not automated factual or clinical accuracy.",
    };
  }
  async promote(actor, id, input) {
    exact(input, [
      "idempotencyKey",
      "expectedCandidateRevision",
      "expectedContentRevision",
      "brandRevision",
      "copySha256",
      "evidenceSha256",
      "reviewed",
      "kind",
      "clinicalReviewed",
    ]);
    if (
      typeof input.idempotencyKey !== "string" ||
      !/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i.test(
        input.idempotencyKey,
      ) ||
      input.reviewed !== true ||
      !["financial", "cultural", "general", "clinical"].includes(input.kind) ||
      !Number.isInteger(input.expectedCandidateRevision) ||
      !Number.isInteger(input.expectedContentRevision)
    )
      throw fail(
        400,
        "Confirm review of the exact saved draft and choose its classification",
      );
    const principal = await this.principal(actor),
      requestHash = hash(input),
      generationId = randomUUID(),
      reviewedAt = new Date().toISOString();
    let receipt;
    await this.repo.ready;
    await this.repo.store.transact(
      ["identity", this.repo.key],
      ([identity, state]) => {
        assertRestoreAvailable(state);
        if (hash(identity) !== principal.identityHash)
          throw fail(409, "Review authority changed; reload before confirming");
        const entry = this.entry(state, id),
          prior = entry.promotionReceipts?.find(
            (receipt) => receipt.id === input.idempotencyKey,
          );
        if (prior) {
          if (
            prior.requestHash !== requestHash ||
            prior.actorId !== principal.actor.id
          )
            throw fail(409, "Promotion key already used");
          receipt = copy(prior);
          return [identity, state];
        }
        const story = this.current(state, entry),
          artwork = copy(entry.workingArtwork || entry.candidate.artwork);
        if (story.campaignDraft || entry.promotionReceipts?.length)
          throw fail(
            409,
            "An existing campaign must be preserved; this candidate cannot replace it",
          );
        if (
          (entry.revision || 1) !== input.expectedCandidateRevision ||
          (story.contentRevision || 1) !== input.expectedContentRevision ||
          entry.candidate.brandRevision !== input.brandRevision ||
          copyDigest(artwork) !== input.copySha256 ||
          evidenceDigest(entry.evidence) !== input.evidenceSha256
        )
          throw fail(409, "Saved draft or evidence changed after review");
        const clinical =
          (entry.candidate.sourceSelection || []).some(
            (source) => source.kind === "clinical",
          ) ||
          (story.sourceClaims || []).some((claim) => claim.kind === "clinical");
        if (
          (clinical && input.kind !== "clinical") ||
          (input.kind === "clinical" &&
            (principal.actor.role !== "founder" ||
              input.clinicalReviewed !== true))
        )
          throw fail(
            403,
            "Clinical copy requires separate current founder clinical review",
          );
        validateCandidateLayout(artwork, state.brandProfile);
        const before = captureContentRevisions(state),
          evidence = entry.evidence.map(
            ({ id, sourceUrl, responseSha256, textSha256 }) => ({
              id,
              sourceUrl,
              responseSha256,
              textSha256,
            }),
          );
        const claims = copyFields(artwork).map((field) => {
          const source =
            entry.evidence.find((source) => source.text.includes(field.text)) ||
            entry.evidence[0];
          return {
            id: `prepared_${hash({ id, path: field.fieldPath }).slice(0, 32)}`,
            purpose: "prepared-copy-review",
            role: "editorial_copy",
            candidateId: id,
            candidateRevision: entry.revision || 1,
            fieldPath: field.fieldPath,
            text: field.text,
            sourceUrl: source.sourceUrl,
            evidenceResponseSha256: source.responseSha256,
            evidenceTextSha256: source.textSha256,
            kind: input.kind,
            status: "approved",
            reviewedBy: principal.actor.id,
            reviewedAt,
            ...(input.kind === "clinical"
              ? {
                  clinicalReview: {
                    reviewerId: principal.actor.id,
                    reviewedAt,
                  },
                }
              : {}),
          };
        });
        const reviewedCopy = {
          schemaVersion: 1,
          candidateId: id,
          candidateRevision: entry.revision || 1,
          copySha256: input.copySha256,
          evidence,
          fieldMappings: claims.map((claim) => ({
            fieldPath: claim.fieldPath,
            claimId: claim.id,
          })),
        };
        reconstructReviewedCopy(claims, reviewedCopy);
        entry.prePromotionSourceClaims = copy(story.sourceClaims);
        story.sourceClaims = claims;
        getApprovedClaims(story);
        story.campaignDraft = {
          ...artwork,
          provenance: {
            mode: REVIEWED_CANDIDATE_MODE,
            purpose: "candidate-promotion",
            generationId,
            provider: "none",
            modelCalls: 0,
            requiresReview: true,
            reviewedCopy,
          },
        };
        validateCampaign(story.campaignDraft, story);
        story.generationId = generationId;
        story.status = "Draft Ready";
        story.revision++;
        story.verifiedFacts = [];
        applyContentRevisions(state, before);
        receipt = {
          id: input.idempotencyKey,
          requestHash,
          actorId: principal.actor.id,
          reviewedAt,
          candidateId: id,
          candidateRevision: entry.revision || 1,
          storyId: story.id,
          storyRevision: story.revision,
          contentRevision: story.contentRevision,
          generationId,
          copySha256: input.copySha256,
          evidenceSha256: input.evidenceSha256,
          modelCalls: 0,
          editorialCopyReviewed: true,
          publicationApproved: false,
        };
        entry.promotionReceipts = [receipt];
        state.telemetry.traces.unshift({
          traceId: generationId,
          ...this.scope,
          storyId: story.id,
          operation: "reviewed_candidate_promotion",
          provider: "none",
          model: null,
          modelCalls: 0,
          usage: null,
          status: "completed",
          mode: REVIEWED_CANDIDATE_MODE,
          createdAt: reviewedAt,
          campaign: copy(story.campaignDraft),
          sourceClaims: copy(claims),
          contentRevision: story.contentRevision,
        });
        state.usage.push({
          id: input.idempotencyKey,
          type: "candidate_promotion",
          storyId: story.id,
          generationId,
          modelCalls: 0,
          at: reviewedAt,
        });
        if (Buffer.byteLength(JSON.stringify(state)) > 768 * 1024)
          throw fail(
            429,
            "Workspace storage headroom reached; preserve an export before promoting more drafts",
          );
        return [identity, state];
      },
    );
    const { requestHash: _, ...publicReceipt } = receipt;
    const story = (await this.repo.read()).backlog.find(
      (story) => story.id === receipt.storyId,
    );
    let promotionStillCurrent = false;
    try {
      validateCampaign(story.campaignDraft, story);
      const { provenance, ...currentCopy } = story.campaignDraft;
      promotionStillCurrent =
        story.generationId === receipt.generationId &&
        story.contentRevision === receipt.contentRevision &&
        copyDigest(currentCopy) === receipt.copySha256;
    } catch {
      /* A recovered receipt is historical when newer work exists. */
    }
    return { receipt: publicReceipt, story, promotionStillCurrent };
  }
}
