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
