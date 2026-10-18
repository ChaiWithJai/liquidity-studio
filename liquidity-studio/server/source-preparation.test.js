import test from "node:test";
import assert from "node:assert/strict";
import { randomUUID, createHash } from "node:crypto";
import { DurableStore } from "./storage.js";
import { createPlatform } from "./platform.js";
import { DurableJobService } from "./operator-jobs.js";
import { SourcePreparationService } from "./source-preparation.js";
import { brandRevision } from "./multimodal-contract.js";
import { getApprovedClaims } from "./source-integrity.js";
process.env.NODE_ENV = "test";
process.env.STUDIO_SOURCE_PREPARATION_ENABLED = "true";
process.env.STUDIO_SOURCE_HOSTS = "source.example";
const text =
  "A primary source paragraph retrieved for human inspection, without any claim of approval.";
function snapshot(url) {
  return {
    sourceUrl: url,
    requestedUrl: url,
    retrievedAt: new Date().toISOString(),
    contentType: "text/plain",
    responseSha256: createHash("sha256").update(text).digest("hex"),
    textSha256: createHash("sha256").update(text).digest("hex"),
    responseBytes: Buffer.byteLength(text),
    extractionVersion: "plain-excerpts-v1",
    text,
    status: "unreviewed",
    approval: "none",
  };
}
async function fixture(t, retrieve = async (url) => snapshot(url)) {
  const store = new DurableStore(":memory:"),
    platform = createPlatform({ store, authMode: "password" });
  await platform.ready;
  t.after(() => store.close());
  await platform.identity.provision({
    username: "prepare-founder",
    password: "disposable-preparation-239!",
    role: "founder",
  });
  const user = (await store.get("identity")).users.find(
      (user) => user.username === "prepare-founder",
    ),
    scope = await platform.identity.authorize(
      user,
      "org_default",
      "brand_default",
    ),
    container = await platform.forScope(scope),
    repo = container.ports.repo;
  const story = await repo.addBacklogStory({
    title: "Unreviewed source topic",
    category: "Test",
    sourceClaims: [
      {
        id: "claim",
        text: "Unverified input is not copied.",
        sourceUrl: "https://source.example/a",
        kind: "clinical",
        status: "unreviewed",
      },
    ],
  });
  let modelCalls = 0;
  const jobs = new DurableJobService({
    repo,
    identity: platform.identity,
    scope,
    formatter: {
      prepareCampaignForStory: () => {
        modelCalls++;
        throw Error("No model calls permitted");
      },
    },
    preparation: new SourcePreparationService({ repo, scope, retrieve }),
  });
  const input = {
    purpose: "source-preparation",
    idempotencyKey: randomUUID(),
    reviewed: true,
    brandRevision: brandRevision(await repo.getBrandProfile()),
    items: [{ storyId: story.id, storyRevision: story.revision }],
  };
  return {
    store,
    platform,
    user,
    scope,
    repo,
    story,
    jobs,
    input,
    modelCalls: () => modelCalls,
  };
}
test("same job/reservation persists separate candidate once, without campaign or human approval", async (t) => {
  const f = await fixture(t),
    job = await f.jobs.create(f.user, f.input);
  assert.equal((await f.jobs.create(f.user, f.input)).id, job.id);
  const result = await f.jobs.runNext("worker", job.id, job.items[0].id, 1);
  assert.equal(result.state, "completed");
  assert.equal(result.items[0].receipt.modelCalls, 0);
  assert.equal(f.modelCalls(), 0);
  const state = await f.repo.read(),
    story = state.backlog.find((row) => row.id === f.story.id),
    prepared = state.preparedSourceCandidates[0];
  assert.equal(story.campaignDraft, null);
  assert.equal(story.preparationStatus, "ready");
  assert.equal(prepared.candidate.id, story.preparedCandidateId);
  assert.equal(prepared.candidate.artwork.story.keyStatHighlight, text);
  assert.equal(story.sourceClaims[0].status, "unreviewed");
  assert.throws(() => getApprovedClaims(story));
  assert.equal(
    await f.jobs.runNext("duplicate", job.id, job.items[0].id, 1),
    null,
  );
  assert.equal((await f.repo.read()).preparedSourceCandidates.length, 1);
  const budget = await f.store.get(
    `generation-budget:global:${new Date().toISOString().slice(0, 10)}`,
  );
  assert.equal(budget.reservations.length, 1);
  assert.equal(budget.reservations[0].status, "completed");
});
test("planning metadata drift is allowed but source edits fence held retrieval completion", async (t) => {
  for (const contentChange of [false, true]) {
    let release, started;
    const ready = new Promise((resolve) => (started = resolve));
    const f = await fixture(
        t,
        (url) =>
          new Promise((resolve) => {
            release = () => resolve(snapshot(url));
            started();
          }),
      ),
      job = await f.jobs.create(f.user, f.input),
      running = f.jobs.runNext("worker", job.id, job.items[0].id, 1);
    await ready;
    await f.repo.mutate((state) => {
      const row = state.backlog.find((row) => row.id === f.story.id);
      row.revision++;
      row.status = "Scheduled";
      if (contentChange) row.sourceClaims[0].text = "External source edit";
      return state;
    });
    release();
    const result = await running;
    assert.equal(
      result.items[0].state,
      contentChange ? "conflict" : "completed",
    );
    if (contentChange)
      assert.equal((await f.repo.read()).preparedSourceCandidates, undefined);
  }
});
test("cancel during retrieval prevents late candidate; default-off rejects preparation plans", async (t) => {
  let release, started;
  const ready = new Promise((resolve) => (started = resolve));
  const f = await fixture(
      t,
      (url) =>
        new Promise((resolve) => {
          release = () => resolve(snapshot(url));
          started();
        }),
    ),
    job = await f.jobs.create(f.user, f.input),
    running = f.jobs.runNext("worker", job.id, job.items[0].id, 1);
  await ready;
  await f.jobs.control(f.user, job.id, "cancel", {
    idempotencyKey: randomUUID(),
  });
  release();
  assert.equal((await running).state, "cancelled");
  assert.equal((await f.repo.read()).preparedSourceCandidates, undefined);
  delete process.env.STUDIO_SOURCE_PREPARATION_ENABLED;
  await assert.rejects(
    f.jobs.create(f.user, { ...f.input, idempotencyKey: randomUUID() }),
    { status: 404 },
  );
  process.env.STUDIO_SOURCE_PREPARATION_ENABLED = "true";
});
test("candidate edits retain immutable source provenance and optimistic base without approval or campaign mutation", async (t) => {
  const f = await fixture(t),
    job = await f.jobs.create(f.user, f.input);
  await f.jobs.runNext("worker", job.id, job.items[0].id, 1);
  const state = await f.repo.read(),
    id = state.preparedSourceCandidates[0].candidate.id,
    original = await f.jobs.candidate(f.user, id),
    artwork = structuredClone(original.candidate.artwork);
  artwork.infographic.headline = "An operator edited this unreviewed candidate";
  const input = { idempotencyKey: randomUUID(), expectedRevision: 1, artwork },
    saved = await f.jobs.editCandidate(f.user, id, input);
  assert.equal(saved.revision, 2);
  assert.equal(
    saved.workingArtwork.infographic.headline,
    artwork.infographic.headline,
  );
  assert.equal(
    saved.candidate.artwork.infographic.headline,
    original.candidate.artwork.infographic.headline,
  );
  assert.equal(saved.exportable, false);
  assert.equal(saved.approval, "none");
  assert.equal((await f.jobs.editCandidate(f.user, id, input)).revision, 2);
  await assert.rejects(
    f.jobs.editCandidate(f.user, id, {
      ...input,
      idempotencyKey: randomUUID(),
    }),
    { status: 409 },
  );
  await f.repo.mutate((state) => {
    state.backlog.find((row) => row.id === f.story.id).sourceClaims[0].text =
      "New external content";
    return state;
  });
  assert.equal((await f.jobs.candidate(f.user, id)).stale, true);
  await assert.rejects(
    f.jobs.editCandidate(f.user, id, {
      ...input,
      idempotencyKey: randomUUID(),
      expectedRevision: 2,
    }),
    { status: 409 },
  );
  assert.equal(
    (await f.repo.read()).backlog.find((row) => row.id === f.story.id)
      .campaignDraft,
    null,
  );
});
test("whole saved draft promotion preserves edited copy, requires separate clinical signoff and has no model call", async (t) => {
  const { PreparedPromotionService } = await import("./prepared-promotion.js");
  const { validateCampaign } = await import("./source-integrity.js");
  const f = await fixture(t),
    job = await f.jobs.create(f.user, f.input);
  await f.jobs.runNext("worker", job.id, job.items[0].id, 1);
  const id = (await f.repo.read()).preparedSourceCandidates[0].candidate.id,
    entry = await f.jobs.candidate(f.user, id),
    artwork = structuredClone(entry.candidate.artwork);
  artwork.infographic.headline = "Human edited source review draft";
  await f.jobs.editCandidate(f.user, id, {
    idempotencyKey: randomUUID(),
    expectedRevision: 1,
    artwork,
  });
  const service = new PreparedPromotionService({
      repo: f.repo,
      identity: f.platform.identity,
      scope: f.scope,
    }),
    plan = await service.plan(f.user, id),
    input = {
      idempotencyKey: randomUUID(),
      expectedCandidateRevision: plan.candidateRevision,
      expectedContentRevision: plan.contentRevision,
      brandRevision: plan.brandRevision,
      copySha256: plan.copySha256,
      evidenceSha256: plan.evidenceSha256,
      reviewed: true,
      kind: "general",
    };
  await assert.rejects(service.promote(f.user, id, input), { status: 403 });
  const clinical = { ...input, kind: "clinical", clinicalReviewed: true },
    promoted = await service.promote(f.user, id, clinical);
  assert.equal(
    promoted.story.campaignDraft.infographic.headline,
    artwork.infographic.headline,
  );
  assert.equal(promoted.receipt.modelCalls, 0);
  assert.equal(promoted.receipt.publicationApproved, false);
  assert.equal(promoted.story.contentRevision, 2);
  assert.equal(
    validateCampaign(promoted.story.campaignDraft, promoted.story),
    true,
  );
  assert.equal(f.modelCalls(), 0);
  assert.equal(
    (await service.promote(f.user, id, clinical)).receipt.generationId,
    promoted.receipt.generationId,
  );
  const changed = structuredClone(promoted.story.campaignDraft);
  changed.infographic.headline = "Unreviewed replacement";
  assert.throws(() => validateCampaign(changed, promoted.story));
  const missing = structuredClone(promoted.story);
  missing.sourceClaims.pop();
  assert.throws(() => validateCampaign(missing.campaignDraft, missing));
  assert.equal(
    (await f.repo.read()).preparedSourceCandidates[0]
      .prePromotionSourceClaims[0].status,
    "unreviewed",
  );
});
test("promotion serializes competing confirmations and blocks a reserved restore destination", async (t) => {
  const { PreparedPromotionService } = await import("./prepared-promotion.js");
  const f = await fixture(t),
    job = await f.jobs.create(f.user, f.input);
  await f.jobs.runNext("worker", job.id, job.items[0].id, 1);
  const id = (await f.repo.read()).preparedSourceCandidates[0].candidate.id,
    service = new PreparedPromotionService({
      repo: f.repo,
      identity: f.platform.identity,
      scope: f.scope,
    }),
    plan = await service.plan(f.user, id),
    input = {
      idempotencyKey: randomUUID(),
      expectedCandidateRevision: plan.candidateRevision,
      expectedContentRevision: plan.contentRevision,
      brandRevision: plan.brandRevision,
      copySha256: plan.copySha256,
      evidenceSha256: plan.evidenceSha256,
      reviewed: true,
      kind: "clinical",
      clinicalReviewed: true,
    };
  await f.repo.store.update(f.repo.key, (state) => ({
    ...state,
    editorRestore: { status: "installing" },
  }));
  await assert.rejects(service.promote(f.user, id, input), { status: 423 });
  await f.repo.store.update(f.repo.key, (state) => {
    delete state.editorRestore;
    return state;
  });
  const outcomes = await Promise.allSettled([
    service.promote(f.user, id, input),
    service.promote(f.user, id, { ...input, idempotencyKey: randomUUID() }),
  ]);
  assert.equal(outcomes.filter((row) => row.status === "fulfilled").length, 1);
  assert.equal(
    outcomes.find((row) => row.status === "rejected").reason.status,
    409,
  );
  const state = await f.repo.read();
  assert.equal(state.preparedSourceCandidates[0].promotionReceipts.length, 1);
  assert.equal(
    state.backlog.find((row) => row.id === f.story.id).contentRevision,
    2,
  );
});
test("reviewed copy digests ignore object key order but reject malformed or unreviewed field authority", async (t) => {
  const { copyDigest, validateReviewedPreparedCopy } = await import(
    "./prepared-copy-review.js"
  );
  const { PreparedPromotionService } = await import("./prepared-promotion.js");
  const f = await fixture(t),
    job = await f.jobs.create(f.user, f.input);
  await f.jobs.runNext("worker", job.id, job.items[0].id, 1);
  const id = (await f.repo.read()).preparedSourceCandidates[0].candidate.id,
    service = new PreparedPromotionService({
      repo: f.repo,
      identity: f.platform.identity,
      scope: f.scope,
    }),
    plan = await service.plan(f.user, id),
    promoted = await service.promote(f.user, id, {
      idempotencyKey: randomUUID(),
      expectedCandidateRevision: plan.candidateRevision,
      expectedContentRevision: plan.contentRevision,
      brandRevision: plan.brandRevision,
      copySha256: plan.copySha256,
      evidenceSha256: plan.evidenceSha256,
      reviewed: true,
      kind: "clinical",
      clinicalReviewed: true,
    }),
    campaign = promoted.story.campaignDraft,
    manifest = campaign.provenance.reviewedCopy;
  assert.equal(
    validateReviewedPreparedCopy(
      Object.fromEntries(
        Object.entries(campaign).filter(([key]) => key !== "provenance"),
      ),
      promoted.story.sourceClaims,
      manifest,
    ),
    true,
  );
  assert.equal(
    copyDigest({ a: 1, b: { x: 2, y: 3 } }),
    copyDigest({ b: { y: 3, x: 2 }, a: 1 }),
  );
  for (const alter of [
    (claims) => (claims[0].status = "unreviewed"),
    (claims) => (claims[0].role = "fact"),
    (claims) => (claims[0].reviewedBy = true),
  ]) {
    const claims = structuredClone(promoted.story.sourceClaims);
    alter(claims);
    assert.throws(() =>
      validateReviewedPreparedCopy(
        Object.fromEntries(
          Object.entries(campaign).filter(([key]) => key !== "provenance"),
        ),
        claims,
        manifest,
      ),
    );
  }
});
