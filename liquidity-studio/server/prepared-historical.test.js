import {candidateArtwork} from './prepared-source-candidate.js';
import test from "node:test";
import assert from "node:assert/strict";
import { randomUUID, createHash } from "node:crypto";
import { DurableStore } from "./storage.js";
import { createPlatform } from "./platform.js";
import { brandRevision } from "./multimodal-contract.js";
import { getApprovedClaims, validateCampaign } from "./source-integrity.js";
process.env.NODE_ENV = "test";
process.env.STUDIO_OPERATOR_JOBS_ENABLED = "true";
process.env.STUDIO_SOURCE_PREPARATION_ENABLED = "true";
process.env.STUDIO_SOURCE_HOSTS = "source.example";
async function fixture(t, brandId = "brand_default") {
  const text =
      "A retained source sentence for an unfinished editorial draft.\nA second source sentence remains unreviewed after import.\nA third source sentence provides no clinical or factual approval.",
    digest = createHash("sha256").update(text).digest("hex"),
    store = new DurableStore(":memory:"),
    platform = createPlatform({
      store,
      authMode: "password",
      sourceRetriever: async (url) => ({
        schemaVersion: 1,
        sourceUrl: url,
        requestedUrl: url,
        retrievedAt: new Date().toISOString(),
        contentType: "text/plain",
        responseSha256: digest,
        textSha256: digest,
        responseBytes: Buffer.byteLength(text),
        extractionVersion: "controlled-test-fixture",
        text,
        status: "unreviewed",
        approval: "none",
      }),
    });
  await platform.ready;
  t.after(() => store.close());
  await platform.identity.provision({
    username: "former-owner",
    password: "disposable-former-owner-239!",
    role: "founder",
  });
  const user = (await store.get("identity")).users.find(
      (user) => user.username === "former-owner",
    ),
    scope = await platform.identity.authorize(user, "org_default", brandId),
    container = await platform.forScope(scope),
    repo = container.ports.repo,
    story = await repo.addBacklogStory({
      title: "Unfinished retained draft",
      category: "Test",
      sourceClaims: [
        {
          id: "retained-source",
          text: "An unreviewed input claim.",
          sourceUrl: "https://source.example/article",
          kind: brandId === "brand_default" ? "financial" : "cultural",
          status: "unreviewed",
        },
      ],
    }),
    jobs = platform.operatorJobs(scope, container),
    job = await jobs.create(user, {
      purpose: "source-preparation",
      idempotencyKey: randomUUID(),
      reviewed: true,
      brandRevision: brandRevision(await repo.getBrandProfile()),
      items: [{ storyId: story.id, storyRevision: story.revision }],
    });
  await jobs.runNext("historical-fixture-worker", job.id, job.items[0].id, 1);
  let entry = (await repo.read()).preparedSourceCandidates[0];
  const artwork = structuredClone(entry.candidate.artwork);
  artwork.infographic.headline = "RETAINED UNFINISHED EDITORIAL COPY";
  await jobs.editCandidate(user, entry.candidate.id, {
    idempotencyKey: randomUUID(),
    expectedRevision: 1,
    artwork,
  });
  await repo.mutate((state) => {
    const entry = state.preparedSourceCandidates[0];
    entry.restoredHistorical = {
      packSha256: "a".repeat(64),
      originalScope: {
        organizationId: "original-org",
        brandId: "original-brand",
      },
      originalCandidateId: entry.candidate.id,
    };
    entry.candidate.jobId = null;
    entry.candidate.itemId = null;
    entry.candidate.attemptId = null;
    delete entry.edits;
    return state;
  });
  await platform.identity.provision({
    username: "current-owner",
    password: "disposable-current-owner-239!",
    role: "founder",
  });
  const actor = (await store.get("identity")).users.find(
    (user) => user.username === "current-owner",
  );
  return {
    platform,
    store,
    repo,
    jobs,
    scope,
    actor,
    story,
    id: entry.candidate.id,
    service: platform.preparedPromotion(scope, repo),
  };
}
const body = (plan) =>
  Object.fromEntries(
    [
      "expectedRevision",
      "expectedContentRevision",
      "expectedBrandRevision",
      "expectedHistoricalRevision",
      "sourceCopySha256",
      "evidenceSha256",
      "packSha256",
      "inputFingerprint",
    ]
      .map((key) => [key, plan[key]])
      .concat([["idempotencyKey", randomUUID()]]),
  );
for (const brand of ["brand_default", "brand_vedic"])
  test(`${brand}: retained unfinished copy forks without approval and requires explicit current-owner review`, async (t) => {
    const f = await fixture(t, brand),
      before = structuredClone(
        (await f.repo.read()).preparedSourceCandidates[0],
      );
    await assert.rejects(f.service.plan(f.actor, f.id), { status: 409 });
    const plan = await f.service.historicalForkPlan(f.actor, f.id),
      input = body(plan),
      fork = await f.service.forkHistorical(f.actor, f.id, input);
    assert.equal(fork.forkStillCurrent, true);
    assert.equal(fork.story.campaignDraft, null);
    assert.throws(() => getApprovedClaims(fork.story));
    let state = await f.repo.read(),
      entry = state.preparedSourceCandidates.find(
        (entry) => entry.candidate.id === fork.candidateId,
      );
    assert.deepEqual(state.preparedSourceCandidates[0], before);
    assert.deepEqual(entry.workingArtwork, before.workingArtwork);
    assert.deepEqual(entry.evidence, before.evidence);
    assert.equal(entry.candidate.jobId, null);
    assert.equal(entry.candidate.itemId, null);
    assert.equal(entry.candidate.attemptId, null);
    assert.equal(entry.editorialStatus, "unreviewed");
    assert.equal(entry.candidate.provenance.modelCalls, 0);
    assert.equal(
      (await f.service.forkHistorical(f.actor, f.id, input)).candidateId,
      fork.candidateId,
    );
    const nextPlan = await f.service.historicalForkPlan(f.actor, f.id);
    assert.equal(
      (await f.service.forkHistorical(f.actor, f.id, body(nextPlan)))
        .candidateId,
      fork.candidateId,
    );
    const review = await f.service.plan(f.actor, fork.candidateId),
      promoted = await f.service.promote(f.actor, fork.candidateId, {
        idempotencyKey: randomUUID(),
        expectedCandidateRevision: review.candidateRevision,
        expectedContentRevision: review.contentRevision,
        brandRevision: review.brandRevision,
        copySha256: review.copySha256,
        evidenceSha256: review.evidenceSha256,
        reviewed: true,
        kind: brand === "brand_default" ? "financial" : "cultural",
      });
    assert.equal(
      promoted.story.campaignDraft.infographic.headline,
      "RETAINED UNFINISHED EDITORIAL COPY",
    );
    assert.equal(
      validateCampaign(promoted.story.campaignDraft, promoted.story),
      true,
    );
    assert.ok(
      promoted.story.sourceClaims.every(
        (claim) => claim.reviewedBy === f.actor.id,
      ),
    );
    assert.equal(
      (await f.service.forkHistorical(f.actor, f.id, input)).forkStillCurrent,
      false,
    );
    assert.equal((await f.repo.read()).preparedSourceCandidates.length, 2);
  });
test("historical continuation cannot replace a campaign, bypass restore lock or use a stale saved-copy fence", async (t) => {
  const f = await fixture(t),
    plan = await f.service.historicalForkPlan(f.actor, f.id),
    input = body(plan);
  await assert.rejects(
    f.service.forkHistorical(f.actor, f.id, {
      ...input,
      sourceCopySha256: "b".repeat(64),
    }),
    { status: 409 },
  );
  await f.store.update(f.repo.key, (state) => ({
    ...state,
    editorRestore: { status: "installing" },
  }));
  await assert.rejects(f.service.forkHistorical(f.actor, f.id, input), {
    status: 423,
  });
  await f.store.update(f.repo.key, (state) => {
    delete state.editorRestore;
    state.backlog.find((story) => story.id === f.story.id).campaignDraft = {
      provenance: { generationId: randomUUID() },
    };
    return state;
  });
  await assert.rejects(f.service.forkHistorical(f.actor, f.id, input), {
    status: 409,
  });
  assert.equal((await f.repo.read()).preparedSourceCandidates.length, 1);
});
test("current membership and original clinical policy remain mandatory", async (t) => {
  const f = await fixture(t);
  await f.repo.mutate((state) => {
    state.preparedSourceCandidates[0].candidate.sourceSelection = [
      { kind: "clinical" },
    ];
    return state;
  });
  const plan = await f.service.historicalForkPlan(f.actor, f.id),
    input = body(plan);
  const fork = await f.service.forkHistorical(f.actor, f.id, input),
    review = await f.service.plan(f.actor, fork.candidateId);
  assert.equal(review.requiresClinicalReview, true);
  await assert.rejects(
    f.service.promote(f.actor, fork.candidateId, {
      idempotencyKey: randomUUID(),
      expectedCandidateRevision: review.candidateRevision,
      expectedContentRevision: review.contentRevision,
      brandRevision: review.brandRevision,
      copySha256: review.copySha256,
      evidenceSha256: review.evidenceSha256,
      reviewed: true,
      kind: "general",
    }),
    { status: 403 },
  );
  await f.store.update("identity", (identity) => {
    identity.memberships = identity.memberships.filter(
      (member) => member.userId !== f.actor.id,
    );
    return identity;
  });
  await assert.rejects(f.service.forkHistorical(f.actor, f.id, input), {
    status: 403,
  });
});

test("independent review: deduplicated successful continuation preserves its own replay receipt after story change", async (t) => {
  const f = await fixture(t);
  const firstInput = body(await f.service.historicalForkPlan(f.actor, f.id));
  const first = await f.service.forkHistorical(f.actor, f.id, firstInput);
  const secondInput = body(await f.service.historicalForkPlan(f.actor, f.id));
  const second = await f.service.forkHistorical(f.actor, f.id, secondInput);
  assert.equal(second.candidateId, first.candidateId);
  await f.repo.mutate((state) => ({
    ...state,
    backlog: state.backlog.map((story) =>
      story.id === f.story.id
        ? {
            ...story,
            title: "Later real story edit",
            revision: story.revision + 1,
            contentRevision: (story.contentRevision || 1) + 1,
          }
        : story,
    ),
  }));
  assert.equal(
    (await f.service.forkHistorical(f.actor, f.id, firstInput))
      .forkStillCurrent,
    false,
  );
  const replay = await f.service.forkHistorical(f.actor, f.id, secondInput);
  assert.equal(replay.candidateId, second.candidateId);
  assert.equal(replay.forkStillCurrent, false);
});

test("dedup receipt rejects changed payload and bounds aliases without discarding prior receipts", async (t) => {
  const f = await fixture(t),
    first = body(await f.service.historicalForkPlan(f.actor, f.id));
  await f.service.forkHistorical(f.actor, f.id, first);
  const aliases = [];
  for (let i = 0; i < 31; i++) {
    const input = body(await f.service.historicalForkPlan(f.actor, f.id));
    aliases.push(input);
    await f.service.forkHistorical(f.actor, f.id, input);
  }
  await assert.rejects(
    f.service.forkHistorical(f.actor, f.id, {
      ...aliases[0],
      sourceCopySha256: "f".repeat(64),
    }),
    { status: 409 },
  );
  await assert.rejects(
    f.service.forkHistorical(
      f.actor,
      f.id,
      body(await f.service.historicalForkPlan(f.actor, f.id)),
    ),
    { status: 429 },
  );
  assert.equal(
    (await f.service.forkHistorical(f.actor, f.id, aliases[0]))
      .forkStillCurrent,
    true,
  );
  assert.equal(
    (await f.repo.read()).preparedSourceCandidates[1].forkAliases.length,
    31,
  );
});


test('unfinished historical version1 continuation retains its old projection and human working copy',async t=>{
 const f=await fixture(t);
 await f.repo.mutate(state=>{const candidate=state.preparedSourceCandidates[0].candidate;candidate.artwork=candidateArtwork(candidate.excerpts);delete candidate.artworkProjectionVersion;delete candidate.sourceFieldMappings;return state;});
 const before=structuredClone((await f.repo.read()).preparedSourceCandidates[0]);
 const plan=await f.service.historicalForkPlan(f.actor,f.id),result=await f.service.forkHistorical(f.actor,f.id,body(plan));
 const state=await f.repo.read(),entry=state.preparedSourceCandidates.find(x=>x.candidate.id===result.candidateId);
 assert.equal(entry.candidate.artworkProjectionVersion,undefined);assert.equal(entry.candidate.sourceFieldMappings,undefined);
 assert.deepEqual(entry.candidate.artwork,before.candidate.artwork);assert.deepEqual(entry.workingArtwork,before.workingArtwork);
 assert.deepEqual(state.preparedSourceCandidates[0],before);assert.equal(entry.editorialStatus,'unreviewed');
});
