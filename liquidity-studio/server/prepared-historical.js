import { randomUUID } from "node:crypto";
import { fail } from "./auth.js";
import { exact, hash } from "./workspace-schema.js";
import { assertRestoreAvailable } from "./restore-gate.js";
import { brandRevision } from "./multimodal-contract.js";
import { copyDigest, reviewedCopyTemplate } from "./prepared-copy-review.js";
import {
  buildPreparedCandidate,
  preparationFingerprint,
  validatePreparedCandidate,
} from "./prepared-source-candidate.js";
const clone = (value) => structuredClone(value);
const sha = (value) =>
  typeof value === "string" && /^[a-f0-9]{64}$/.test(value);
const evidenceDigest = (evidence) =>
  hash(
    evidence.map(({ id, sourceUrl, responseSha256, textSha256 }) => ({
      id,
      sourceUrl,
      responseSha256,
      textSha256,
    })),
  );
function validateCopy(value, template = reviewedCopyTemplate(), key = "") {
  if (typeof template === "string") {
    if (
      typeof value !== "string" ||
      value.length > 2000 ||
      (key === "timecode" && value !== template)
    )
      throw fail(422, "Historical copy text or timing is unsupported");
    return;
  }
  if (typeof template === "number") {
    if (value !== template)
      throw fail(422, "Historical copy structure changed");
    return;
  }
  if (Array.isArray(template)) {
    if (!Array.isArray(value) || value.length !== template.length)
      throw fail(422, "Historical copy page count changed");
    value.forEach((child, i) => validateCopy(child, template[i]));
    return;
  }
  if (
    !value ||
    typeof value !== "object" ||
    Object.keys(value).sort().join("|") !==
      Object.keys(template).sort().join("|")
  )
    throw fail(422, "Historical copy fields are unsupported");
  for (const child of Object.keys(template))
    validateCopy(value[child], template[child], child);
}
function snapshot(service, state, id) {
  const historical = service.entry(state, id),
    marker = historical.restoredHistorical;
  if (!marker || !sha(marker.packSha256) || marker.originalCandidateId !== id)
    throw fail(409, "An explicit restored historical candidate is required");
  if (
    historical.candidate.organizationId !== service.scope.organizationId ||
    historical.candidate.brandId !== service.scope.brandId
  )
    throw fail(404, "Historical candidate not found");
  const story = state.backlog.find(
    (story) => story.id === historical.candidate.storyId,
  );
  if (!story) throw fail(404, "Historical candidate story not found");
  if (story.campaignDraft)
    throw fail(
      409,
      "Use the current-generation reviewed-copy action for an existing campaign",
    );
  if (
    !Array.isArray(historical.evidence) ||
    !historical.evidence.length ||
    historical.evidence.length > 2 ||
    !Number.isInteger(historical.revision || 1) ||
    (historical.revision || 1) < 1
  )
    throw fail(422, "Historical evidence or revision is unsupported");
  for (const source of historical.evidence) {
    let url;
    try {
      url = new URL(source.sourceUrl);
    } catch {
      throw fail(422, "Historical source URL is invalid");
    }
    if (
      url.protocol !== "https:" ||
      url.username ||
      url.password ||
      url.hash ||
      (url.port && url.port !== "443") ||
      typeof source.text !== "string" ||
      !Number.isInteger(source.responseBytes) ||
      source.responseBytes < 1 ||
      source.responseBytes > 512 * 1024 ||
      !Number.isFinite(Date.parse(source.retrievedAt))
    )
      throw fail(422, "Historical source snapshot is invalid");
  }
  validatePreparedCandidate(historical.candidate, historical.evidence);
  if (
    historical.evidence.length > 2 ||
    historical.evidence.some(
      (source) =>
        !sha(source.responseSha256) ||
        !sha(source.textSha256) ||
        source.text.length > 24000,
    )
  )
    throw fail(422, "Historical evidence is unsupported");
  const artwork = historical.workingArtwork || historical.candidate.artwork;
  validateCopy(artwork);
  if (Buffer.byteLength(JSON.stringify(artwork)) > 32768)
    throw fail(413, "Historical copy is too large");
  return {
    historical,
    story,
    artwork,
    plan: {
      historicalCandidateId: id,
      storyId: story.id,
      expectedRevision: story.revision,
      expectedContentRevision: story.contentRevision || 1,
      expectedBrandRevision: brandRevision(state.brandProfile),
      expectedHistoricalRevision: historical.revision || 1,
      sourceCopySha256: copyDigest(artwork),
      evidenceSha256: evidenceDigest(historical.evidence),
      packSha256: marker.packSha256,
      inputFingerprint: preparationFingerprint(story, service.scope),
    },
  };
}
export async function historicalForkPlan(service, actor, id) {
  await service.principal(actor);
  const state = await service.repo.read(),
    { plan, historical } = snapshot(service, state, id);
  return {
    ...plan,
    sourceUrls: historical.evidence.map((source) => source.sourceUrl),
    approval: "none",
    meaning:
      "Continue the retained saved copy as a fresh unreviewed draft. No source, clinical, layout or publication approval is restored.",
  };
}
export async function forkHistoricalCandidate(service, actor, id, input) {
  const fields = [
    "idempotencyKey",
    "expectedRevision",
    "expectedContentRevision",
    "expectedBrandRevision",
    "expectedHistoricalRevision",
    "sourceCopySha256",
    "evidenceSha256",
    "packSha256",
    "inputFingerprint",
  ];
  exact(input, fields);
  if (
    typeof input.idempotencyKey !== "string" ||
    !/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i.test(
      input.idempotencyKey,
    ) ||
    ![
      "expectedRevision",
      "expectedContentRevision",
      "expectedHistoricalRevision",
    ].every((key) => Number.isInteger(input[key]) && input[key] > 0) ||
    ![
      "expectedBrandRevision",
      "sourceCopySha256",
      "evidenceSha256",
      "packSha256",
      "inputFingerprint",
    ].every((key) => sha(input[key]))
  )
    throw fail(
      400,
      "Exact current story and historical evidence fences are required",
    );
  const principal = await service.principal(actor),
    requestHash = hash(input),
    candidateId = randomUUID(),
    createdAt = new Date().toISOString();
  let resultId, storyId;
  await service.repo.ready;
  await service.repo.store.transact(
    ["identity", service.repo.key],
    ([identity, state]) => {
      assertRestoreAvailable(state);
      if (hash(identity) !== principal.identityHash)
        throw fail(409, "Current review authority changed");
      const prior = state.preparedSourceCandidates?.find((entry) =>
        [entry.forkRequest, ...(entry.forkAliases || [])].some(
          (receipt) => receipt?.id === input.idempotencyKey,
        ),
      );
      if (prior) {
        const receipt = [prior.forkRequest, ...(prior.forkAliases || [])].find(
          (receipt) => receipt?.id === input.idempotencyKey,
        );
        if (
          receipt.actorId !== principal.actor.id ||
          receipt.requestHash !== requestHash ||
          prior.derivation?.historicalCandidateId !== id
        )
          throw fail(409, "Historical fork key already used");
        resultId = prior.candidate.id;
        storyId = prior.candidate.storyId;
        return [identity, state];
      }
      const { historical, story, artwork, plan } = snapshot(service, state, id);
      if (
        fields
          .filter((key) => key !== "idempotencyKey")
          .some((key) => input[key] !== plan[key])
      )
        throw fail(
          409,
          "Story, brand or historical saved copy changed; inspect a fresh continuation plan",
        );
      const active = state.preparedSourceCandidates?.find(
        (entry) =>
          !entry.restoredHistorical &&
          entry.derivation?.historicalCandidateId === id &&
          entry.derivation.sourceCopySha256 === plan.sourceCopySha256 &&
          entry.derivation.evidenceSha256 === plan.evidenceSha256 &&
          !entry.promotionReceipts?.length &&
          entry.candidate.inputFingerprint === plan.inputFingerprint &&
          entry.candidate.brandRevision === plan.expectedBrandRevision,
      );
      if (active) {
        if ((active.forkAliases?.length || 0) >= 31)
          throw fail(
            429,
            "Continuation receipt capacity reached; retry an existing request",
          );
        active.forkAliases = [
          ...(active.forkAliases || []),
          {
            id: input.idempotencyKey,
            requestHash,
            actorId: principal.actor.id,
          },
        ];
        if (
          Buffer.byteLength(JSON.stringify(state.preparedSourceCandidates)) >
          192 * 1024
        )
          throw fail(413, "Prepared evidence history is full");
        resultId = active.candidate.id;
        storyId = story.id;
        return [identity, state];
      }
      const candidate = buildPreparedCandidate({
        id: candidateId,
        scope: service.scope,
        story,
        brandProfile: state.brandProfile,
        evidence: clone(historical.evidence),
        jobId: null,
        itemId: null,
        attemptId: null,
        createdAt,
      });
      candidate.sourceSelection = clone(
        historical.candidate.sourceSelection || [],
      ).map((source) => ({
        ...source,
        status: "unreviewed",
        approval: "none",
      }));
      const entry = {
        candidate,
        evidence: clone(historical.evidence),
        revision: 1,
        workingArtwork: clone(artwork),
        editorialStatus: "unreviewed",
        forkRequest: {
          id: input.idempotencyKey,
          requestHash,
          actorId: principal.actor.id,
        },
        derivation: {
          kind: "restored-unfinished-copy-fork",
          historicalCandidateId: id,
          historicalRevision: plan.expectedHistoricalRevision,
          sourceCopySha256: plan.sourceCopySha256,
          evidenceSha256: plan.evidenceSha256,
          packSha256: plan.packSha256,
          requiresClinicalReview: (
            historical.candidate.sourceSelection || []
          ).some((source) => source.kind === "clinical"),
          actorId: principal.actor.id,
          createdAt,
        },
      };
      if ((state.preparedSourceCandidates?.length || 0) >= 30)
        throw fail(
          429,
          "Prepared history is full; preserve existing drafts before adding another",
        );
      state.preparedSourceCandidates = [
        ...(state.preparedSourceCandidates || []),
        entry,
      ];
      if (
        Buffer.byteLength(JSON.stringify(state.preparedSourceCandidates)) >
        192 * 1024
      )
        throw fail(413, "Prepared evidence history is full");
      story.preparedCandidateId = candidateId;
      story.preparationStatus = "ready";
      story.preparationUpdatedAt = createdAt;
      story.revision++;
      resultId = candidateId;
      storyId = story.id;
      return [identity, state];
    },
  );
  const state = await service.repo.read(),
    entry = service.entry(state, resultId),
    story = state.backlog.find((story) => story.id === storyId);
  return {
    candidateId: resultId,
    story: clone(story),
    forkStillCurrent:
      !story.campaignDraft &&
      !entry.promotionReceipts?.length &&
      story.preparedCandidateId === resultId &&
      entry.candidate.inputFingerprint ===
        preparationFingerprint(story, service.scope) &&
      entry.candidate.brandRevision === brandRevision(state.brandProfile),
  };
}
