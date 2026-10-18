import test from "node:test";
import assert from "node:assert/strict";
import { DurableStore } from "./storage.js";
import { createPlatform } from "./platform.js";
import {
  bootstrapExistingPreparation,
  existingPreparationPlan,
} from "./run-source-preparation-bootstrap.js";
process.env.NODE_ENV = "test";
test("existing 10-story plan selects seven nonclinical pointers, reports three clinical research topics and performs no writes/dispatch", async (t) => {
  const store = new DurableStore(":memory:"),
    platform = createPlatform({ store, authMode: "password" });
  await platform.ready;
  t.after(() => store.close());
  await platform.identity.provision({
    username: "bootstrap-founder",
    password: "disposable-bootstrap-239!",
    role: "founder",
  });
  const actor = (await store.get("identity")).users.find(
    (user) => user.username === "bootstrap-founder",
  );
  const results = [];
  for (const brandId of ["brand_default", "brand_vedic"]) {
    const scope = await platform.identity.authorize(
        actor,
        "org_default",
        brandId,
      ),
      container = await platform.forScope(scope),
      state = await container.ports.repo.read();
    results.push(existingPreparationPlan(state, scope));
  }
  assert.equal(
    results.reduce((sum, plan) => sum + plan.eligible.length, 0),
    7,
  );
  assert.equal(
    results.reduce((sum, plan) => sum + plan.attention.length, 0),
    3,
  );
  assert.ok(
    results[0].eligible.some((story) => story.storyId === "story_huda_buyback"),
  );
  const before = JSON.stringify(
    await store.get("scope:org_default:brand_default"),
  );
  await bootstrapExistingPreparation({
    store,
    scope: { organizationId: "org_default", brandId: "brand_default" },
    actorId: actor.id,
    platformFactory: () => {
      throw Error("Plan must not construct auth or execute jobs");
    },
    dispatch: () => {
      throw Error("Plan must not dispatch");
    },
  });
  assert.equal(
    JSON.stringify(await store.get("scope:org_default:brand_default")),
    before,
  );
});
test("explicit existing-state apply queues once through durable outbox; repeat never re-prepares or alters claims", async (t) => {
  process.env.STUDIO_SOURCE_PREPARATION_ENABLED = "true";
  process.env.STUDIO_OPERATOR_JOBS_ENABLED = "true";
  process.env.STUDIO_JOB_DISPATCHER = "local";
  const store = new DurableStore(":memory:"),
    platform = createPlatform({ store, authMode: "password" });
  await platform.ready;
  t.after(() => store.close());
  await platform.identity.provision({
    username: "bootstrap-founder",
    password: "disposable-bootstrap-239!",
    role: "founder",
  });
  const actor = (await store.get("identity")).users.find(
      (user) => user.username === "bootstrap-founder",
    ),
    scope = await platform.identity.authorize(
      actor,
      "org_default",
      "brand_default",
    ),
    container = await platform.forScope(scope),
    repo = container.ports.repo;
  const before = (await repo.read()).backlog.find(
    (story) => story.id === "story_huda_buyback",
  );
  let dispatches = 0;
  const config = {
    store,
    scope,
    actorId: actor.id,
    apply: true,
    platformFactory: () => platform,
    dispatch: async () => dispatches++,
  };
  const result = await bootstrapExistingPreparation(config);
  assert.ok(result.jobId);
  assert.equal(dispatches, 1);
  const repeated = await bootstrapExistingPreparation(config);
  assert.equal(repeated.jobId, null);
  assert.equal(dispatches, 1);
  const state = await repo.read(),
    huda = state.backlog.find((story) => story.id === before.id);
  assert.deepEqual(huda.sourceClaims, before.sourceClaims);
  assert.equal(huda.campaignDraft, null);
  assert.equal(huda.preparationStatus, "queued");
  assert.equal(state.operatorJobs.length, 1);
  assert.equal(state.operatorJobs[0].items.length, 5);
  delete process.env.STUDIO_SOURCE_PREPARATION_ENABLED;
  await assert.rejects(bootstrapExistingPreparation(config), { status: 409 });
  process.env.STUDIO_SOURCE_PREPARATION_ENABLED = "true";
  await assert.rejects(
    bootstrapExistingPreparation({ ...config, actorId: "forged-owner" }),
    { status: 403 },
  );
});
