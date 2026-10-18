import test from "node:test";
import assert from "node:assert/strict";
import { randomUUID, createHash } from "node:crypto";
import { DurableStore } from "./storage.js";
import { createPlatform } from "./platform.js";
import { PreparedPromotionService } from "./prepared-promotion.js";
import { buildPreparedCandidate } from "./prepared-source-candidate.js";
import {
  EditorPackService,
  createEditorRestoreDestination,
} from "./editor-pack-service.js";
import { brandRevision } from "./multimodal-contract.js";
import { getApprovedClaims } from "./source-integrity.js";
const sha = (value) => createHash("sha256").update(value).digest("hex");
process.env.NODE_ENV = "test";
async function operator(t, name) {
  const store = new DurableStore(":memory:");
  t.after(() => store.close());
  const platform = createPlatform({ store, authMode: "password" });
  await platform.ready;
  await platform.identity.provision({
    username: name,
    password: "disposable-portable-review-password",
    role: "founder",
  });
  const actor = (await store.get("identity")).users.find(
    (user) => user.username === name,
  );
  return { store, platform, actor };
}
async function confirm(service, actor, id) {
  const plan = await service.plan(actor, id);
  return service.promote(actor, id, {
    idempotencyKey: randomUUID(),
    expectedCandidateRevision: plan.candidateRevision,
    expectedContentRevision: plan.contentRevision,
    brandRevision: plan.brandRevision,
    copySha256: plan.copySha256,
    evidenceSha256: plan.evidenceSha256,
    reviewed: true,
    kind: "general",
  });
}
test("actual portable unfinished copy requires fresh current-owner fork before review", async (t) => {
  const source = await operator(t, "source-owner"),
    scope = await source.platform.identity.authorize(
      source.actor,
      "org_default",
      "brand_default",
    ),
    container = await source.platform.forScope(scope),
    repo = container.ports.repo;
  const text =
    "A retained primary-source paragraph explains the original context for deliberate whole-copy human review.";
  const story = {
    id: "prepared-portable-story",
    title: "Disposable controlled primary source",
    revision: 1,
    sourceClaims: [
      {
        id: "input",
        text: "Unreviewed input",
        sourceUrl: "https://example.org/source",
        kind: "general",
        status: "unreviewed",
      },
    ],
    campaignDraft: null,
    generationId: null,
  };
  await repo.mutate((state) => ({ ...state, backlog: [story] }));
  const state = await repo.read(),
    evidence = [
      {
        schemaVersion: 1,
        id: randomUUID(),
        requestedUrl: "https://example.org/source",
        sourceUrl: "https://example.org/source",
        retrievedAt: new Date().toISOString(),
        contentType: "text/plain",
        responseSha256: sha(text),
        responseBytes: Buffer.byteLength(text),
        text,
        textSha256: sha(text),
        status: "unreviewed",
        approval: "none",
      },
    ];
  const candidate = buildPreparedCandidate({
    id: randomUUID(),
    scope,
    story: state.backlog[0],
    brandProfile: state.brandProfile,
    evidence,
    jobId: randomUUID(),
    itemId: randomUUID(),
    attemptId: randomUUID(),
    createdAt: new Date().toISOString(),
  });
  await repo.mutate((state) => {
    state.preparedSourceCandidates = [
      { candidate, evidence, revision: 1, editorialStatus: "unreviewed" },
    ];
    state.backlog[0].preparedCandidateId = candidate.id;
    return state;
  });

  const saved = structuredClone(candidate.artwork);
  saved.infographic.headline = "RETAINED UNFINISHED COPY";
  await repo.mutate((state) => {
    state.preparedSourceCandidates[0].workingArtwork = saved;
    return state;
  });
  const pack = await new EditorPackService({
    native: source.platform.nativeEditor(scope, repo),
  }).export(source.actor);
  const destination = await operator(t, "fresh-unfinished-owner"),
    { scope: targetScope } = await createEditorRestoreDestination({
      store: destination.store,
      identity: destination.platform.identity,
      actor: destination.actor,
      organizationId: "org_default",
      name: "Restored unfinished copy",
      preset: "liquidity_desk",
    }),
    targetContainer = await destination.platform.forScope(targetScope),
    targetRepo = targetContainer.ports.repo,
    targetNative = destination.platform.nativeEditor(targetScope, targetRepo);
  await new EditorPackService({ native: targetNative }).install(
    destination.actor,
    pack,
    {
      target: {
        organizationId: targetScope.organizationId,
        brandId: targetScope.brandId,
      },
      principalRemap: { [source.actor.id]: destination.actor.id },
      sourceReviewAcknowledged: true,
      idempotencyKey: randomUUID(),
    },
  );
  const before = await targetRepo.read(),
    historical = structuredClone(before.preparedSourceCandidates[0]);
  assert.ok(historical.restoredHistorical);
  assert.equal(before.backlog[0].campaignDraft, null);
  assert.deepEqual(historical.workingArtwork, saved);
  const service = new PreparedPromotionService({
    repo: targetRepo,
    scope: targetScope,
    identity: destination.platform.identity,
  });
  await assert.rejects(service.plan(destination.actor, candidate.id), {
    status: 409,
  });
  const plan = await service.historicalForkPlan(
      destination.actor,
      candidate.id,
    ),
    input = { idempotencyKey: randomUUID() };
  for (const key of [
    "expectedRevision",
    "expectedContentRevision",
    "expectedBrandRevision",
    "expectedHistoricalRevision",
    "sourceCopySha256",
    "evidenceSha256",
    "packSha256",
    "inputFingerprint",
  ])
    input[key] = plan[key];
  const fork = await service.forkHistorical(
    destination.actor,
    candidate.id,
    input,
  );
  assert.notEqual(fork.candidateId, candidate.id);
  assert.deepEqual(
    (await targetRepo.read()).preparedSourceCandidates[0],
    historical,
  );
  const fresh = (await targetRepo.read()).preparedSourceCandidates.find(
    (entry) => entry.candidate.id === fork.candidateId,
  );
  assert.deepEqual(fresh.workingArtwork, saved);
  assert.equal(fresh.candidate.jobId, null);
  assert.equal(fresh.editorialStatus, "unreviewed");
  const aliasPlan = await service.historicalForkPlan(
      destination.actor,
      candidate.id,
    ),
    alias = { idempotencyKey: randomUUID() };
  for (const key of [
    "expectedRevision",
    "expectedContentRevision",
    "expectedBrandRevision",
    "expectedHistoricalRevision",
    "sourceCopySha256",
    "evidenceSha256",
    "packSha256",
    "inputFingerprint",
  ])
    alias[key] = aliasPlan[key];
  await service.forkHistorical(destination.actor, candidate.id, alias);
  const aliasPack = await new EditorPackService({
    native: targetNative,
  }).export(destination.actor);
  assert.equal(JSON.stringify(aliasPack).includes("forkAliases"), false);
  assert.equal(JSON.stringify(aliasPack).includes(alias.idempotencyKey), false);
  const promoted = await confirm(service, destination.actor, fork.candidateId);
  assert.equal(
    promoted.story.campaignDraft.infographic.headline,
    saved.infographic.headline,
  );
  assert.ok(
    getApprovedClaims(promoted.story).every(
      (claim) => claim.reviewedBy === destination.actor.id,
    ),
  );
  const forkBody = (story) => ({
    idempotencyKey: randomUUID(),
    expectedRevision: story.revision,
    expectedContentRevision: story.contentRevision || 1,
    generationId: story.generationId,
    brandRevision: brandRevision(before.brandProfile),
  });
  const firstInput = forkBody(promoted.story),
    first = await service.fork(destination.actor, story.id, firstInput);
  const secondInput = forkBody((await targetRepo.read()).backlog[0]),
    second = await service.fork(destination.actor, story.id, secondInput);
  assert.equal(first.candidateId, second.candidateId);
  await targetRepo.mutate((state) => {
    state.backlog[0].title = "Later source change";
    return state;
  });
  assert.equal(
    (await service.fork(destination.actor, story.id, secondInput))
      .forkStillCurrent,
    false,
  );
  await assert.rejects(
    service.fork(destination.actor, story.id, {
      ...secondInput,
      generationId: "different",
    }),
    { status: 409 },
  );
  await assert.rejects(
    service.fork(destination.actor, "other-story", secondInput),
    { status: 409 },
  );
});
