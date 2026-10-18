import test from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawn } from "node:child_process";
import { DurableStore } from "./storage.js";
import { createPlatform } from "./platform.js";
import { brandRevision } from "./multimodal-contract.js";
import { DurableJobService } from "./operator-jobs.js";
import {
  jobDispatcherConfiguration,
  CloudTasksJobDispatcher,
} from "./job-dispatcher.js";
process.env.NODE_ENV = "test";
process.env.AI_ALLOW_SYNTHETIC = "true";
async function fixture(t, { file = ":memory:" } = {}) {
  const store = new DurableStore(file),
    platform = createPlatform({ store, authMode: "password" });
  await platform.ready;
  await platform.identity.provision({
    username: "job-founder",
    password: "isolated-job-test-239!",
    role: "founder",
  });
  const user = (await store.get("identity")).users.find(
      (user) => user.username === "job-founder",
    ),
    scope = await platform.identity.authorize(
      user,
      "org_default",
      "brand_default",
    ),
    container = await platform.forScope(scope),
    repo = container.ports.repo,
    jobs = platform.operatorJobs(scope, container);
  t.after(() => store.close());
  const add = async (title = "Job source") =>
    repo.addBacklogStory({
      title,
      category: "Test",
      sourceClaims: [
        {
          id: randomUUID(),
          text: "An approved disposable source excerpt.",
          sourceUrl: "https://example.org/job-source",
          kind: "general",
          status: "approved",
        },
      ],
    });
  const plan = async (stories) => ({
    idempotencyKey: randomUUID(),
    reviewed: true,
    brandRevision: brandRevision(await repo.getBrandProfile()),
    items: stories.map((story) => ({
      storyId: story.id,
      storyRevision: story.revision,
    })),
  });
  return { store, platform, user, scope, repo, jobs, add, plan };
}
test("reviewed plan/idempotency, item receipt and draft commit together; duplicate delivery never regenerates", async (t) => {
  const f = await fixture(t),
    story = await f.add(),
    input = await f.plan([story]),
    job = await f.jobs.create(f.user, input);
  assert.equal((await f.jobs.create(f.user, input)).id, job.id);
  await assert.rejects(f.jobs.create(f.user, { ...input, reviewed: false }), {
    status: 400,
  });
  const done = await f.jobs.runNext("worker", job.id, job.items[0].id, 1);
  assert.equal(done.state, "completed");
  assert.equal(done.outbox.state, "worker_received");
  await assert.rejects(
    f.jobs.control(f.user, job.id, "cancel", { idempotencyKey: randomUUID() }),
    { status: 409 },
  );
  assert.equal(done.items[0].receipt.storyRevision, 2);
  const saved = (await f.repo.read()).backlog.find(
    (row) => row.id === story.id,
  );
  assert.equal(saved.generationId, done.items[0].receipt.generationId);
  assert.ok(saved.campaignDraft.infographic);
  assert.equal(
    await f.jobs.runNext("duplicate", job.id, job.items[0].id, 1),
    null,
  );
  assert.equal(
    (await f.repo.read()).backlog.find((row) => row.id === story.id).revision,
    2,
  );
  const portable = await f.repo.exportData();
  assert.equal(portable.data.operatorJobs, undefined);
});
test("expired worker lease becomes unknown; explicit item retry has lineage and fences late commit", async (t) => {
  const f = await fixture(t),
    story = await f.add(),
    job = await f.jobs.create(f.user, await f.plan([story]));
  let now = Date.now();
  const jobs = new DurableJobService({
    ...f,
    identity: f.platform.identity,
    formatter: {
      prepareCampaignForStory: () => {
        throw Error("must not call");
      },
    },
    now: () => now,
  });
  const claim = await jobs.claim("dead-worker", job.id);
  assert.equal(claim.item.state, "running");
  now += 120001;
  assert.equal(await jobs.runNext("restarted-worker", job.id), null);
  let current = await jobs.detail(f.user, job.id);
  assert.equal(current.items[0].state, "unknown");
  current = await jobs.control(f.user, job.id, "retry", {
    idempotencyKey: randomUUID(),
    itemIds: [job.items[0].id],
  });
  assert.equal(current.items[0].retryOf, current.items[0].attempts[0].id);
  const done = await f.jobs.runNext("new-worker", job.id);
  assert.equal(done.state, "completed");
  assert.equal(done.items[0].attempt, 2);
});
test("partial conflicts, cancel/resume, execution source/brand checks and revoked membership", async (t) => {
  const f = await fixture(t),
    a = await f.add("A"),
    b = await f.add("B"),
    job = await f.jobs.create(f.user, await f.plan([a, b]));
  await f.repo.updateStory(b.id, (story) => {
    story.title = "Human changed B";
  });
  await f.jobs.runNext("worker", job.id);
  let result = await f.jobs.runNext("worker", job.id);
  assert.equal(result.state, "partial");
  assert.deepEqual(
    result.items.map((item) => item.state),
    ["completed", "conflict"],
  );
  result = await f.jobs.control(f.user, job.id, "retry", {
    idempotencyKey: randomUUID(),
    itemIds: [job.items[1].id],
  });
  await f.jobs.runNext("worker", job.id);
  assert.equal((await f.jobs.detail(f.user, job.id)).items[0].attempt, 1);
  const c = await f.add("C"),
    cancelled = await f.jobs.create(f.user, await f.plan([c]));
  await f.jobs.control(f.user, cancelled.id, "cancel", {
    idempotencyKey: randomUUID(),
  });
  assert.equal(await f.jobs.runNext("worker", cancelled.id), null);
  await f.jobs.control(f.user, cancelled.id, "resume", {
    idempotencyKey: randomUUID(),
  });
  await f.store.update("identity", (state) => {
    state.memberships = state.memberships.filter(
      (member) => member.userId !== f.user.id,
    );
    return state;
  });
  result = await f.jobs.runNext("worker", cancelled.id);
  assert.equal(result.items[0].error.code, "ACCESS_REVOKED");
  assert.equal(
    (await f.repo.read()).backlog.find((row) => row.id === c.id).campaignDraft,
    null,
  );
});
test("authorization and revision are checked after provider wait; cancellation prevents late draft commit", async (t) => {
  const f = await fixture(t),
    story = await f.add(),
    job = await f.jobs.create(f.user, await f.plan([story]));
  let release, started;
  const waiting = new Promise((r) => (release = r)),
    start = new Promise((r) => (started = r));
  const formatter = {
    prepareCampaignForStory: async (...args) => {
      const result = await f.jobs.formatter.prepareCampaignForStory(...args);
      started();
      await waiting;
      return result;
    },
  };
  const jobs = new DurableJobService({
    repo: f.repo,
    identity: f.platform.identity,
    scope: f.scope,
    formatter,
  });
  const run = jobs.runNext("slow", job.id);
  await start;
  await jobs.control(f.user, job.id, "cancel", {
    idempotencyKey: randomUUID(),
  });
  release();
  await run;
  assert.equal(
    (await f.repo.read()).backlog.find((row) => row.id === story.id)
      .campaignDraft,
    null,
  );
  assert.equal((await jobs.detail(f.user, job.id)).state, "cancelled");
});
test("local independent worker process survives browser exit and reopened SQLite retains same IDs/receipts", async (t) => {
  const dir = mkdtempSync(join(tmpdir(), "studio-job-worker-")),
    file = join(dir, "worker.sqlite");
  t.after(() => rmSync(dir, { recursive: true, force: true }));
  const f = await fixture(t, { file }),
    story = await f.add(),
    job = await f.jobs.create(f.user, await f.plan([story]));
  const run = () =>
    new Promise((resolve, reject) => {
      const child = spawn(
        process.execPath,
        ["server/job-worker.js", "--once"],
        {
          cwd: new URL("..", import.meta.url),
          env: {
            ...process.env,
            STUDIO_DATABASE_PATH: file,
            STUDIO_JOB_RESUME_PENDING: "true",
            STUDIO_AUTH_MODE: "password",
            STUDIO_JOB_DISPATCHER: "local",
            STUDIO_OPERATOR_JOBS_ENABLED: "true",
          },
          stdio: ["ignore", "pipe", "pipe"],
        },
      );
      let stderr = "";
      child.stderr.on("data", (data) => (stderr += data));
      child.once("error", reject);
      child.once("exit", (code) =>
        code === 0 ? resolve() : reject(Error(stderr)),
      );
    });
  await run();
  await run();
  const reopened = new DurableStore(file);
  try {
    const saved = reopened.get(f.repo.key);
    assert.equal(saved.operatorJobs[0].id, job.id);
    assert.equal(saved.operatorJobs[0].items[0].state, "completed");
    assert.equal(saved.backlog.find((row) => row.id === story.id).revision, 2);
  } finally {
    reopened.close();
  }
});
test("Cloud Tasks fixed OIDC configuration, deterministic delivery and Cloud Run refuses local worker mode", async () => {
  assert.throws(
    () =>
      jobDispatcherConfiguration({
        STUDIO_JOB_DISPATCHER: "local",
        K_SERVICE: "service",
      }),
    { status: 503 },
  );
  assert.throws(
    () =>
      jobDispatcherConfiguration({
        STUDIO_JOB_DISPATCHER: "cloud-tasks",
        STUDIO_JOB_QUEUE:
          "projects/test-project/locations/us-east4/queues/jobs",
        STUDIO_JOB_WORKER_URL: "http://attacker.test/api/internal/operator-job",
      }),
    { status: 503 },
  );
  const configuration = jobDispatcherConfiguration({
      STUDIO_JOB_DISPATCHER: "cloud-tasks",
      STUDIO_JOB_QUEUE: "projects/test-project/locations/us-east4/queues/jobs",
      STUDIO_JOB_WORKER_URL:
        "https://worker-example.run.app/api/internal/operator-job",
      STUDIO_JOB_WORKER_EMAIL: "worker@test-project.iam.gserviceaccount.com",
      STUDIO_JOB_SCOPES: JSON.stringify([
        { organizationId: "org", brandId: "brand" },
      ]),
    }),
    requests = [];
  const repo = {
    scope: { organizationId: "org", brandId: "brand" },
    read: async () => ({
      operatorJobs: [
        {
          id: "job",
          outbox: { attempts: 0 },
          items: [{ id: "item", state: "queued", attempt: 0 }],
        },
      ],
    }),
    mutate: async (callback) => callback(await repo.read()),
  };
  const dispatcher = new CloudTasksJobDispatcher({
    configuration,
    auth: async () => "private-test-token",
    request: async (url, options) => {
      requests.push(JSON.parse(options.body));
      return { ok: true };
    },
  });
  await dispatcher.dispatch(repo);
  await dispatcher.dispatch(repo);
  assert.equal(requests[0].task.name, requests[1].task.name);
  assert.equal(
    requests[0].task.httpRequest.oidcToken.audience,
    configuration.endpoint,
  );
});
test("brand/source mutation and daily quota fail at execution; no draft or item receipt is committed", async (t) => {
  const f = await fixture(t),
    story = await f.add(),
    job = await f.jobs.create(f.user, await f.plan([story]));
  await f.repo.updateBrandProfile({ name: "Changed after plan" });
  let result = await f.jobs.runNext("worker", job.id);
  assert.equal(result.items[0].state, "conflict");
  const fresh = await f.add(),
    quotaJob = await f.jobs.create(f.user, await f.plan([fresh]));
  const old = process.env.STUDIO_DAILY_GENERATION_LIMIT;
  process.env.STUDIO_DAILY_GENERATION_LIMIT = "0";
  try {
    result = await f.jobs.runNext("worker", quotaJob.id);
    assert.equal(result.items[0].error.code, "QUOTA_EXCEEDED");
  } finally {
    if (old === undefined) delete process.env.STUDIO_DAILY_GENERATION_LIMIT;
    else process.env.STUDIO_DAILY_GENERATION_LIMIT = old;
  }
  const source = await f.add(),
    sourceJob = await f.jobs.create(f.user, await f.plan([source]));
  await f.repo.updateSourceClaims(source.id, [], source.revision);
  result = await f.jobs.runNext("worker", sourceJob.id);
  assert.equal(result.items[0].state, "conflict");
  assert.equal(result.items[0].receipt, undefined);
});
test("membership revoked while provider is running prevents commit, and a stale delivery epoch cannot resume cancelled work", async (t) => {
  const f = await fixture(t),
    story = await f.add(),
    job = await f.jobs.create(f.user, await f.plan([story]));
  let release, started;
  const barrier = new Promise((r) => (release = r)),
    start = new Promise((r) => (started = r));
  const jobs = new DurableJobService({
    repo: f.repo,
    identity: f.platform.identity,
    scope: f.scope,
    formatter: {
      prepareCampaignForStory: async (...args) => {
        const result = await f.jobs.formatter.prepareCampaignForStory(...args);
        started();
        await barrier;
        return result;
      },
    },
  });
  const running = jobs.runNext("worker", job.id);
  await start;
  await f.store.update("identity", (state) => {
    state.memberships = state.memberships.filter(
      (row) => row.userId !== f.user.id,
    );
    return state;
  });
  release();
  const result = await running;
  assert.equal(result.items[0].error.code, "ACCESS_REVOKED");
  assert.equal(
    (await f.repo.read()).backlog.find((row) => row.id === story.id)
      .campaignDraft,
    null,
  );
});
test("cancel/resume changes delivery epoch; late delivery cannot claim new work", async (t) => {
  const f = await fixture(t),
    story = await f.add(),
    job = await f.jobs.create(f.user, await f.plan([story]));
  await f.jobs.control(f.user, job.id, "cancel", {
    idempotencyKey: randomUUID(),
  });
  const resumed = await f.jobs.control(f.user, job.id, "resume", {
    idempotencyKey: randomUUID(),
  });
  assert.equal(resumed.deliveryEpoch, 2);
  assert.equal(
    await f.jobs.runNext("late", job.id, job.items[0].id, 1, 1),
    null,
  );
  assert.equal(
    (await f.jobs.runNext("current", job.id, job.items[0].id, 1, 2)).state,
    "completed",
  );
});
test("actual worker process killed after durable claim leaves unknown attempt, then explicit retry rejoins once", async (t) => {
  const dir = mkdtempSync(join(tmpdir(), "studio-job-kill-")),
    file = join(dir, "kill.sqlite");
  t.after(() => rmSync(dir, { recursive: true, force: true }));
  const f = await fixture(t, { file }),
    story = await f.add(),
    job = await f.jobs.create(f.user, await f.plan([story]));
  const script = `import {DurableStore} from './server/storage.js';import {createPlatform} from './server/platform.js';const p=createPlatform({store:new DurableStore(process.env.STUDIO_DATABASE_PATH),authMode:'password'});await p.ready;const c=await p.forScope(${JSON.stringify(f.scope)});await p.operatorJobs(${JSON.stringify(f.scope)},c).claim('kill-fixture',${JSON.stringify(job.id)});console.log('CLAIM_PERSISTED');setInterval(()=>{},1000);`;
  const child = spawn(process.execPath, ["--input-type=module", "-e", script], {
    cwd: new URL("..", import.meta.url),
    env: { ...process.env, STUDIO_DATABASE_PATH: file },
    stdio: ["ignore", "pipe", "pipe"],
  });
  await new Promise((resolve, reject) => {
    child.stdout.once("data", resolve);
    child.once("error", reject);
    child.once("exit", (code) =>
      reject(Error(`worker exited before claim: ${code}`)),
    );
  });
  child.kill("SIGKILL");
  await new Promise((resolve) => child.once("exit", resolve));
  // Advance only this fixture lease clock rather than waiting two real minutes.
  const jobs = new DurableJobService({
    repo: f.repo,
    identity: f.platform.identity,
    scope: f.scope,
    formatter: f.jobs.formatter,
    now: () => Date.now() + 120001,
  });
  assert.equal(await jobs.runNext("restarted", job.id), null);
  assert.equal((await f.jobs.detail(f.user, job.id)).items[0].state, "unknown");
  await f.jobs.control(f.user, job.id, "retry", {
    idempotencyKey: randomUUID(),
    itemIds: [job.items[0].id],
  });
  assert.equal((await f.jobs.runNext("rejoined", job.id)).items[0].attempt, 2);
  assert.equal(
    (await f.repo.read()).backlog.find((row) => row.id === story.id).revision,
    2,
  );
});
test("worker restart quarantines a restored queued job by default until explicit owner resume", async (t) => {
  const dir = mkdtempSync(join(tmpdir(), "studio-job-quarantine-")),
    file = join(dir, "backup.sqlite");
  t.after(() => rmSync(dir, { recursive: true, force: true }));
  const f = await fixture(t, { file }),
    story = await f.add(),
    job = await f.jobs.create(f.user, await f.plan([story]));
  await new Promise((resolve, reject) => {
    const child = spawn(process.execPath, ["server/job-worker.js", "--once"], {
      cwd: new URL("..", import.meta.url),
      env: {
        ...process.env,
        STUDIO_DATABASE_PATH: file,
        STUDIO_AUTH_MODE: "password",
        STUDIO_JOB_DISPATCHER: "local",
        STUDIO_OPERATOR_JOBS_ENABLED: "true",
        STUDIO_JOB_RESUME_PENDING: "false",
      },
      stdio: "ignore",
    });
    child.once("error", reject);
    child.once("exit", (code) =>
      code === 0 ? resolve() : reject(Error(`worker exit${code}`)),
    );
  });
  assert.equal((await f.jobs.detail(f.user, job.id)).items[0].state, "paused");
  assert.equal(
    (await f.repo.read()).backlog.find((row) => row.id === story.id)
      .campaignDraft,
    null,
  );
  await f.jobs.control(f.user, job.id, "resume", {
    idempotencyKey: randomUUID(),
  });
  assert.equal((await f.jobs.runNext("resumed", job.id)).state, "completed");
});
test("a lease expiring during generation is unknown rather than a false content-revision conflict", async (t) => {
  const f = await fixture(t),
    story = await f.add(),
    job = await f.jobs.create(f.user, await f.plan([story]));
  let now = Date.now();
  const jobs = new DurableJobService({
    repo: f.repo,
    identity: f.platform.identity,
    scope: f.scope,
    now: () => now,
    formatter: {
      prepareCampaignForStory: async (...args) => {
        const prepared = await f.jobs.formatter.prepareCampaignForStory(
          ...args,
        );
        now += 120001;
        return prepared;
      },
    },
  });
  const result = await jobs.runNext("expired", job.id);
  assert.equal(result.items[0].state, "unknown");
  assert.equal(result.items[0].error.code, "WORKER_LEASE_LOST");
  assert.equal(
    (await f.repo.read()).backlog.find((row) => row.id === story.id)
      .campaignDraft,
    null,
  );
});
test("failed item retains sanitized actual reported provider attempt usage without a draft receipt", async (t) => {
  const f = await fixture(t),
    story = await f.add(),
    job = await f.jobs.create(f.user, await f.plan([story]));
  const usage = { inputTokens: 11, outputTokens: 5, totalTokens: 16 };
  const jobs = new DurableJobService({
    repo: f.repo,
    identity: f.platform.identity,
    scope: f.scope,
    formatter: {
      prepareCampaignForStory: async () => {
        throw Object.assign(Error("discarded output"), {
          code: "PROVIDER_RESPONSE_INVALID",
          trace: {
            traceId: "test-failed-usage",
            usage,
            usageProvider: "openai-gateway",
          },
        });
      },
    },
  });
  const result = await jobs.runNext("usage-fixture", job.id);
  assert.equal(result.items[0].state, "failed");
  assert.deepEqual(result.items[0].attempts[0].providerOutcome.usage, usage);
  assert.equal(result.items[0].receipt, undefined);
  assert.equal(
    (await f.repo.read()).backlog.find((row) => row.id === story.id)
      .campaignDraft,
    null,
  );
});
