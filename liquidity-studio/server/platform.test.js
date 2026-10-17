import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { DurableStore } from "./storage.js";
import { createPlatform } from "./platform.js";
import { createHttpServer } from "./index.js";
const password = "test-only-password-482!";
async function fixture(t, filename = ":memory:") {
  const store = new DurableStore(filename);
  const platform = createPlatform({ store, authMode: "password" });
  await platform.identity.provision({
    username: "founder",
    password,
    role: "founder",
  });
  await platform.identity.provision({
    username: "marketer",
    password,
    role: "marketer",
  });
  const server = createHttpServer(null, { platform });
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  t.after(async () => {
    await new Promise((resolve) => server.close(resolve));
    store.close();
  });
  const base = `http://127.0.0.1:${server.address().port}`;
  let cookie = "";
  const api = async (
    route,
    body,
    scope = "organizationId=org_default&brandId=brand_default",
  ) => {
    const response = await fetch(
      base + route + (route.includes("?") ? "&" : "?") + scope,
      {
        method: body === undefined ? "GET" : "POST",
        headers: { "Content-Type": "application/json", Cookie: cookie },
        body: body === undefined ? undefined : JSON.stringify(body),
      },
    );
    return response;
  };
  const login = async (username = "founder") => {
    const response = await api("/api/auth/login", { username, password });
    cookie = response.headers.get("set-cookie").split(";")[0];
    assert.equal(response.status, 200);
    return response.json();
  };
  return { store, platform, server, base, api, login };
}
test("default HTTP is private and checks scope, role, bodies, and origins", async (t) => {
  const f = await fixture(t);
  assert.equal((await f.api("/api/admin/overview")).status, 401);
  await f.login("marketer");
  assert.equal((await f.api("/api/admin/overview")).status, 403);
  assert.equal(
    (
      await f.api(
        "/api/studio/bootstrap",
        undefined,
        "organizationId=other&brandId=brand_default",
      )
    ).status,
    403,
  );
  assert.equal(
    (
      await f.api("/api/studio/schedule", {
        storyId: "missing",
        scheduledDay: "Neverday",
      })
    ).status,
    400,
  );
  const hostile = await fetch(f.base + "/api/auth/login", {
    method: "POST",
    headers: {
      Origin: "https://attacker.example",
      "Content-Type": "application/json",
    },
    body: "{}",
  });
  assert.equal(hostile.status, 403);
  const malformed = await fetch(f.base + "/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: "{",
  });
  assert.equal(malformed.status, 400);
  const huge = await fetch(f.base + "/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: "x".repeat(262145),
  });
  assert.equal(huge.status, 413);
  const traverse = await fetch(f.base + "/%2e%2e%2fpackage.json");
  assert.equal(traverse.status, 400);
});
test("scoped drafts, edits, feedback, calendar and real downloads survive restart and ejection", async (t) => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), "liquidity-api-"));
  t.after(() => fs.rmSync(directory, { recursive: true, force: true }));
  const f = await fixture(t, path.join(directory, "data.sqlite"));
  await f.login();
  const input = {
    title: "Sourced rights deal",
    sourceClaims: [
      {
        id: "claim1",
        text: "A $10 million rights deal was reported.",
        sourceUrl: "https://example.com/report",
        status: "approved",
        kind: "general",
      },
    ],
  };
  const add = await f.api("/api/studio/backlog", input);
  assert.equal(add.status, 201);
  const { story } = await add.json();
  process.env.AI_ALLOW_SYNTHETIC = "true";
  t.after(() => delete process.env.AI_ALLOW_SYNTHETIC);
  const generated = await f.api("/api/studio/generate-campaign", {
    storyId: story.id,
  });
  assert.equal(generated.status, 200);
  const output = await generated.json();
  assert.equal(output.campaign.provenance.mode, "synthetic");
  const saved = await f.api("/api/studio/save-edit", {
    storyId: story.id,
    format: "reel",
    content: { ...output.campaign.reel, closingCta: "Human approved ending" },
  });
  assert.equal(saved.status, 200);
  const exported = await f.api("/api/studio/export-asset", {
    storyId: story.id,
    format: "reel",
  });
  assert.equal(exported.status, 201);
  const artifact = await exported.json();
  const download = await fetch(f.base + artifact.downloadUrl, {
    headers: {
      Cookie: (
        await f.api("/api/auth/login", { username: "founder", password })
      ).headers
        .get("set-cookie")
        .split(";")[0],
    },
  });
  assert.equal(download.status, 200);
  assert.match(await download.text(), /Human approved ending/);
  assert.equal(
    (
      await f.api(
        "/api/studio/bootstrap",
        undefined,
        "organizationId=org_default&brandId=brand_vedic",
      )
    ).status,
    200,
  );
  assert.equal(
    (
      await f.api(
        `/api/studio/assets/${artifact.exportId}`,
        undefined,
        "organizationId=org_default&brandId=brand_vedic",
      )
    ).status,
    404,
  );
  const reopened = new DurableStore(path.join(directory, "data.sqlite"));
  const platform = createPlatform({ store: reopened, authMode: "password" });
  const repo = (
    await platform.forScope({
      organizationId: "org_default",
      brandId: "brand_default",
    })
  ).ports.repo;
  assert.equal(
    (await repo.listBacklog()).find((row) => row.id === story.id).campaignDraft
      .reel.closingCta,
    "Human approved ending",
  );
  reopened.close();
  const bundle = await (await f.api("/api/admin/eject")).json();
  assert.equal(bundle.schemaVersion, 1);
  assert.doesNotMatch(JSON.stringify(bundle), /passwordHash|studio_session/);
});

test("every scoped route rejects a foreign organization before reading objects or mutating", async (t) => {
  const f = await fixture(t);
  await f.login();
  const routes = [
    ["/api/studio/bootstrap"],
    ["/api/studio/brand-profile", { brandName: "Foreign" }],
    ["/api/studio/backlog", { title: "Nope" }],
    ["/api/studio/source-claims", { storyId: "story_angel_city" }],
    [
      "/api/studio/schedule",
      { storyId: "story_angel_city", scheduledDay: "Monday" },
    ],
    ["/api/studio/generate-campaign", { storyId: "story_angel_city" }],
    [
      "/api/studio/save-edit",
      { storyId: "story_angel_city", format: "reel", content: {} },
    ],
    ["/api/studio/preflight", { storyId: "story_angel_city" }],
    [
      "/api/studio/export-asset",
      { storyId: "story_angel_city", format: "reel" },
    ],
    ["/api/studio/assets/known-id"],
    ["/api/studio/ingest", { items: [] }],
    ["/api/admin/overview"],
    ["/api/admin/context-graph"],
    ["/api/admin/gateway-config", {}],
    ["/api/admin/discovery-config", {}],
    ["/api/admin/run-weekly-batch", { idempotencyKey: "same-slot" }],
    ["/api/admin/backprop-jsonl"],
    ["/api/admin/eject"],
    ["/api/admin/import", {}],
  ];
  for (const [route, body] of routes)
    assert.equal(
      (await f.api(route, body, "organizationId=foreign&brandId=brand_default"))
        .status,
      403,
      route,
    );
});
test("complete feedback export exceeds display window, preserves lineage and scope", async (t) => {
  const f = await fixture(t);
  await f.login();
  const {
    ports: { repo, telemetry },
  } = await f.platform.forScope({
    organizationId: "org_default",
    brandId: "brand_default",
  });
  await telemetry.recordGenerationTrace({
    trace: {
      traceId: "generation-lineage",
      provider: "test",
      model: "test",
      status: "degraded",
    },
    storyId: "story",
    storyTitle: "Test",
    campaign: { reel: { closingCta: "before" } },
    story: { sourceClaims: [] },
    evalResult: { score: 0, overallPass: false, formatChecks: [] },
  });
  for (let i = 0; i < 35; i++)
    await telemetry.recordMarketerAction({
      storyId: "story",
      storyTitle: "Test",
      format: "reel",
      action: "edited_inline_by_marketer",
      finalContent: { closingCta: `after${i}` },
    });
  assert.equal((await telemetry.getSnapshot()).backpropDataset.length, 25);
  const lines = (await (await f.api("/api/admin/backprop-jsonl")).text())
    .trim()
    .split("\n")
    .map(JSON.parse);
  assert.equal(lines.length, 36);
  assert.equal(lines[0].generationId, "generation-lineage");
  assert.equal(lines[0].previousContent.closingCta, "after33");
  const other = await (
    await f.api(
      "/api/admin/backprop-jsonl",
      undefined,
      "organizationId=org_default&brandId=brand_vedic",
    )
  ).text();
  assert.equal(other, "");
  const bundle = await repo.exportData();
  assert.equal(bundle.data.telemetry.backpropDataset.length, 36);
});
test("concurrent idempotent jobs and discovery imports remain single execution, unreviewed claims stay quarantined", async (t) => {
  const f = await fixture(t);
  await f.login();
  const {
    ports: { repo },
    services: { batchProductionService: batch },
  } = await f.platform.forScope({
    organizationId: "org_default",
    brandId: "brand_default",
  });
  const item = {
    sourceId: "feed-source-one",
    title: "New report",
    sourceClaims: [
      {
        id: "1",
        text: "Reported text",
        sourceUrl: "https://example.test/report",
        status: "unreviewed",
      },
    ],
  };
  const added = await Promise.all([
    repo.ingestStories([item]),
    repo.ingestStories([item]),
  ]);
  assert.equal(added[0] + added[1], 1);
  const jobs = await Promise.all([
    batch.runWeeklyBatch({ idempotencyKey: "week-one" }),
    batch.runWeeklyBatch({ idempotencyKey: "week-one" }),
  ]);
  assert.equal(jobs.filter((result) => result.replayed).length, 1);
  assert.equal((await repo.read()).jobs.length, 1);
  assert.equal(jobs.find((result) => !result.replayed).job.formatsPrepared, 0);
  assert.equal(jobs.find((result) => !result.replayed).job.evalPassRate, null);
  const story = (await repo.listBacklog()).find(
    (story) => story.sourceId === item.sourceId,
  );
  const generation = await f.api("/api/studio/generate-campaign", {
    storyId: story.id,
  });
  assert.equal(generation.status, 422);
  const snapshot = await (await f.api("/api/admin/overview")).json();
  assert.equal(snapshot.observability.summary.failedGenerations, 1);
});
test("liveness ignores failed startup dependencies; readiness is bounded; HTTPS cookie mode accepts same origin", async (t) => {
  const store = new DurableStore(":memory:");
  const identityPlatform = createPlatform({ store, authMode: "password" });
  await identityPlatform.ready;
  const platform = {
    ...identityPlatform,
    ready: Promise.resolve(),
    store: { get: () => new Promise(() => {}) },
  };
  const server = createHttpServer(null, { platform });
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  t.after(() => new Promise((resolve) => server.close(resolve)));
  t.after(() => store.close());
  const base = `http://127.0.0.1:${server.address().port}`;
  assert.equal((await fetch(base + "/healthz")).status, 200);
  assert.equal((await fetch(base + "/readyz")).status, 503);
  const f = await fixture(t);
  process.env.STUDIO_COOKIE_SECURE = "true";
  t.after(() => delete process.env.STUDIO_COOKIE_SECURE);
  const response = await fetch(f.base + "/api/auth/login", {
    method: "POST",
    headers: {
      Origin: f.base.replace("http:", "https:"),
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ username: "founder", password }),
  });
  assert.equal(response.status, 200);
  assert.match(response.headers.get("set-cookie"), /; Secure/);
});

test("all platform boundaries await genuinely asynchronous transactional storage", async () => {
  const durable = new DurableStore(":memory:");
  const store = Object.fromEntries(
    ["get", "update", "delete", "keys", "backup", "close"].map((method) => [
      method,
      async (...args) => {
        await new Promise((resolve) => setImmediate(resolve));
        return durable[method](...args);
      },
    ]),
  );
  const platform = createPlatform({ store, authMode: "password" });
  await platform.ready;
  await platform.identity.provision({
    username: "async-founder",
    password,
    role: "founder",
  });
  const login = await platform.identity.login("async-founder", password);
  assert.ok(await platform.identity.authenticate(login.token));
  const scope = await platform.identity.authorize(
    login.user,
    "org_default",
    "brand_default",
  );
  const {
    ports: { repo, telemetry },
  } = await platform.forScope(scope);
  await repo.updateBrandProfile({ tagline: "Async persisted" });
  await telemetry.recordMarketerAction({
    storyId: "brand",
    storyTitle: "Profile",
    format: "profile",
    action: "edit",
    finalContent: { tagline: "Async persisted" },
  });
  assert.equal((await repo.getBrandProfile()).tagline, "Async persisted");
  assert.equal(
    (await telemetry.getSnapshot()).summary.backpropRecordsCollected,
    1,
  );
  await store.close();
});
test("stale edit revisions cannot overwrite another editor and portable restore contains assets not identities", async (t) => {
  const f = await fixture(t);
  await f.login();
  const {
    ports: { repo },
  } = await f.platform.forScope({
    organizationId: "org_default",
    brandId: "brand_default",
  });
  const story = await repo.addBacklogStory({
    title: "Concurrency",
    sourceClaims: [],
  });
  const saved = await repo.saveCampaignDraft(story.id, {
    reel: { closingCta: "original" },
  });
  await repo.updateCampaignFormatDraft(
    story.id,
    "reel",
    { closingCta: "first" },
    saved.revision,
  );
  await assert.rejects(
    repo.updateCampaignFormatDraft(
      story.id,
      "reel",
      { closingCta: "stale" },
      saved.revision,
    ),
    (error) => error.status === 409,
  );
  assert.equal(
    (await repo.listBacklog()).find((row) => row.id === story.id).campaignDraft
      .reel.closingCta,
    "first",
  );
  await repo.saveAsset({
    filename: "script.txt",
    contentType: "text/plain",
    base64: Buffer.from("portable").toString("base64"),
    storyId: story.id,
    format: "reel",
  });
  const bundle = await repo.exportData();
  const target = (
    await f.platform.forScope({
      organizationId: "org_default",
      brandId: "brand_vedic",
    })
  ).ports.repo;
  await target.importData(bundle, { remapScope: true });
  assert.equal(
    (await target.getAsset(bundle.data.assets[0].id)).base64,
    bundle.data.assets[0].base64,
  );
  await assert.rejects(
    target.importData({ schemaVersion: 999 }),
    (error) => error.status === 400,
  );
});

test("error persistence failure cannot prevent sanitized JSON or subsequent liveness", async (t) => {
  const container = {
    ports: {
      repo: {
        mutate: async () => {
          throw new Error("secret write failure");
        },
      },
    },
    services: {
      backlogCalendarService: {
        getStudioBootstrap: async () => {
          throw new Error("secret read failure");
        },
      },
    },
  };
  const server = createHttpServer(container, { trustedTestMode: true });
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  t.after(() => new Promise((resolve) => server.close(resolve)));
  const base = `http://127.0.0.1:${server.address().port}`;
  const response = await fetch(base + "/api/studio/bootstrap");
  assert.equal(response.status, 500);
  assert.doesNotMatch(JSON.stringify(await response.json()), /secret/);
  assert.equal((await fetch(base + "/healthz")).status, 200);
});

test("generation limits reserve transactionally across brands and distinguish failed and synthetic usage", async (t) => {
  const previousOrg = process.env.STUDIO_DAILY_GENERATION_LIMIT,
    previousGlobal = process.env.STUDIO_GLOBAL_DAILY_GENERATION_LIMIT;
  process.env.STUDIO_DAILY_GENERATION_LIMIT = "2";
  process.env.STUDIO_GLOBAL_DAILY_GENERATION_LIMIT = "3";
  t.after(() => {
    if (previousOrg === undefined)
      delete process.env.STUDIO_DAILY_GENERATION_LIMIT;
    else process.env.STUDIO_DAILY_GENERATION_LIMIT = previousOrg;
    if (previousGlobal === undefined)
      delete process.env.STUDIO_GLOBAL_DAILY_GENERATION_LIMIT;
    else process.env.STUDIO_GLOBAL_DAILY_GENERATION_LIMIT = previousGlobal;
  });
  const f = await fixture(t);
  const one = (
    await f.platform.forScope({
      organizationId: "org_default",
      brandId: "brand_default",
    })
  ).ports.repo;
  const two = (
    await f.platform.forScope({
      organizationId: "org_default",
      brandId: "brand_vedic",
    })
  ).ports.repo;
  const reservations = await Promise.all([
    one.reserveGeneration(),
    two.reserveGeneration(),
  ]);
  await one.finalizeGeneration(reservations[0], {
    status: "completed",
    mode: "synthetic",
    traceId: "trace",
  });
  await two.finalizeGeneration(reservations[1], {
    status: "failed",
    mode: "failed",
  });
  await assert.rejects(
    one.reserveGeneration(),
    (error) => error.status === 429,
  );
  assert.equal((await one.read()).usage[0].mode, "synthetic");
  assert.equal((await two.read()).usage[0].status, "failed");
});

test("chunked oversized bodies receive JSON 413 without disrupting the next request", async (t) => {
  const f = await fixture(t);
  const http = await import("node:http");
  const result = await new Promise((resolve, reject) => {
    const request = http.request(
      f.base + "/api/auth/login",
      { method: "POST", headers: { "Content-Type": "application/json" } },
      (response) => {
        let body = "";
        response.on("data", (chunk) => (body += chunk));
        response.on("end", () =>
          resolve({ status: response.statusCode, body }),
        );
      },
    );
    request.on("error", reject);
    request.write("x".repeat(200000));
    request.end("x".repeat(100000));
  });
  assert.equal(result.status, 413);
  assert.equal(JSON.parse(result.body).error, "Request body is too large");
  assert.equal((await fetch(f.base + "/healthz")).status, 200);
});

test("actual CWJ profile round trips with structured strategy and quarantined research seeds", async (t) => {
  const f = await fixture(t);
  await f.login();
  const scope = "organizationId=org_default&brandId=brand_vedic";
  const bootstrap = await (
    await f.api("/api/studio/bootstrap", undefined, scope)
  ).json();
  assert.equal(bootstrap.brandProfile.strategy.valueGroups.length, 4);
  assert.equal(bootstrap.brandProfile.strategy.pillars.length, 5);
  assert.equal(bootstrap.backlog.length, 5);
  assert.ok(
    bootstrap.backlog
      .slice(0, 4)
      .every((story) => story.sourceClaims.length === 0),
  );
  const culturalTask = bootstrap.backlog[4];
  assert.match(culturalTask.title, /Yoga Sutras/);
  assert.equal(culturalTask.sourceClaims.length, 1);
  assert.equal(culturalTask.sourceClaims[0].kind, "cultural");
  assert.equal(culturalTask.sourceClaims[0].status, "unreviewed");
  assert.equal(culturalTask.verifiedFacts.length, 0);
  assert.equal(bootstrap.brandProfile.researchBacklog, undefined);
  const response = await f.api(
    "/api/studio/brand-profile",
    { ...bootstrap.brandProfile, tagline: "Edited source-first profile" },
    scope,
  );
  assert.equal(response.status, 200);
  assert.equal(
    (await response.json()).brandProfile.tagline,
    "Edited source-first profile",
  );
});

test("both preset brand profiles round trip their own strategy schemas", async (t) => {
  const f = await fixture(t);
  await f.login();
  for (const brandId of ["brand_default", "brand_vedic"]) {
    const scope = `organizationId=org_default&brandId=${brandId}`;
    const { brandProfile } = await (
      await f.api("/api/studio/bootstrap", undefined, scope)
    ).json();
    const response = await f.api(
      "/api/studio/brand-profile",
      brandProfile,
      scope,
    );
    assert.equal(response.status, 200, brandId);
  }
});

test("real generated assets and feedback eject and import with authorized scope lineage", async (t) => {
  const previous = process.env.AI_ALLOW_SYNTHETIC;
  process.env.AI_ALLOW_SYNTHETIC = "true";
  t.after(() => {
    if (previous === undefined) delete process.env.AI_ALLOW_SYNTHETIC;
    else process.env.AI_ALLOW_SYNTHETIC = previous;
  });
  const f = await fixture(t);
  const scope = {
    organizationId: "org_default",
    brandId: "brand_default",
    preset: "liquidity_desk",
  };
  const app = await f.platform.forScope(scope);
  const story = await app.ports.repo.addBacklogStory({
    title: "Portable generated fixture",
    sourceClaims: [
      {
        id: "source",
        text: "A sourced editorial excerpt.",
        sourceUrl: "https://example.org/portable-fixture",
        kind: "general",
        status: "approved",
      },
    ],
  });
  const generated =
    await app.services.multiFormatFormatterService.generateCampaignForStory(
      story.id,
    );
  await app.services.multiFormatFormatterService.saveInlineEdit({
    storyId: story.id,
    format: "reel",
    expectedRevision: generated.story.revision,
    content: {
      ...generated.campaign.reel,
      closingCta: "Human-reviewed final ending",
    },
  });
  const exported =
    await app.services.multiFormatFormatterService.exportFormattedAsset({
      storyId: story.id,
      format: "reel",
    });
  const bundle = await app.ports.repo.exportData();
  assert.equal(bundle.data.telemetry.traces[0].brandId, "brand_default");
  assert.equal(
    bundle.data.telemetry.traces[0].contentPresetId,
    "liquidity_desk",
  );
  const target = (
    await f.platform.forScope({
      organizationId: "org_default",
      brandId: "brand_vedic",
      preset: "vedic_dharma",
    })
  ).ports.repo;
  await target.importData(bundle, { remapScope: true });
  assert.match(
    Buffer.from(
      (await target.getAsset(exported.exportId)).base64,
      "base64",
    ).toString(),
    /Human-reviewed final ending/,
  );
  const restored = await target.read();
  assert.ok(restored.telemetry.backpropDataset.length >= 3);
  assert.ok(
    restored.telemetry.backpropDataset.every(
      (record) => record.brandId === "brand_vedic",
    ),
  );
  assert.equal(restored.telemetry.traces[0].brandId, "brand_vedic");
  assert.equal(restored.telemetry.traces[0].contentPresetId, "liquidity_desk");
});

test("partial batches retain completed work and explicit retry lineage without duplicating successful generations", async (t) => {
  const { createAppContainer } = await import("./container.js");
  const { DurableTelemetry } = await import("./durable-telemetry.js");
  const { campaignFromApprovedClaims } = await import("./source-integrity.js");
  const f = await fixture(t);
  const repo = (
    await f.platform.forScope({
      organizationId: "org_default",
      brandId: "brand_vedic",
      preset: "vedic_dharma",
    })
  ).ports.repo;
  for (const title of ["Partial second", "Partial first"])
    await repo.addBacklogStory({
      title,
      sourceClaims: [
        {
          id: "fixture",
          text: "An approved fixture excerpt.",
          sourceUrl: "https://example.org/partial-fixture",
          kind: "general",
          status: "approved",
        },
      ],
    });
  const calls = [];
  const gateway = {
    getConfig: () => ({ provider: "fixture" }),
    async generateStructured({ traceMeta }) {
      calls.push(traceMeta.story.id);
      if (calls.length === 2)
        throw Object.assign(new Error("Injected provider failure"), {
          trace: { traceId: "partial-failed", error: "PROVIDER_HTTP_ERROR" },
        });
      return {
        output: campaignFromApprovedClaims(traceMeta.story),
        trace: {
          traceId: `partial-trace-${calls.length}`,
          status: "success",
          provider: "fixture",
          model: "fixture",
        },
      };
    },
  };
  const app = createAppContainer({
    repo,
    aiGateway: gateway,
    telemetry: new DurableTelemetry(repo),
  });
  const batch = app.services.batchProductionService;
  await assert.rejects(
    batch.runWeeklyBatch({
      maxStories: 2,
      idempotencyKey: "partial-attempt-one",
    }),
    /Injected/,
  );
  const failed = (await repo.read()).jobs[0];
  assert.equal(failed.status, "FAILED");
  assert.deepEqual(failed.completedStoryIds, [calls[0]]);
  const replay = await batch.runWeeklyBatch({
    maxStories: 2,
    idempotencyKey: "partial-attempt-one",
  });
  assert.equal(replay.replayed, true);
  assert.equal(calls.length, 2);
  assert.equal(failed.failedStoryId, calls[1]);
  await repo.mutate((state) => {
    state.backlog.find((story) => story.id === calls[0]).campaignDraft = null;
    return state;
  });
  const retried = await batch.runWeeklyBatch({
    maxStories: 2,
    idempotencyKey: "partial-attempt-two",
    retryOfJobId: failed.jobId,
  });
  assert.equal(retried.job.status, "COMPLETED");
  assert.equal(retried.job.retryOfJobId, failed.jobId);
  assert.equal(retried.job.attempt, 2);
  assert.equal(retried.job.formatsPrepared, 4);
  assert.equal(calls.length, 3);
  assert.equal(calls.filter((id) => id === calls[0]).length, 1);
  const history = (await repo.read()).jobs;
  assert.equal(history.length, 2);
  assert.equal(history[0].retryRootJobId, failed.jobId);
  assert.deepEqual(
    history[0].previousCompletedStoryIds,
    failed.completedStoryIds,
  );
  await assert.rejects(
    batch.runWeeklyBatch({
      idempotencyKey: "foreign-retry",
      retryOfJobId: "foreign-job",
    }),
    (error) => error.status === 404,
  );
  await assert.rejects(
    batch.runWeeklyBatch({
      idempotencyKey: "completed-retry",
      retryOfJobId: retried.job.jobId,
    }),
    (error) => error.status === 409,
  );
});

test("preflight persists validated displayed-frame provenance with the measured revision", async (t) => {
  const f = await fixture(t);
  await f.login();
  const { backlog } = await (await f.api("/api/studio/bootstrap")).json();
  const story = backlog[0];
  const viewContext = {
    mode: "instagram",
    frameIndex: 2,
    storyFrame: 1,
    pollVote: "A",
    measuredAt: new Date().toISOString(),
  };
  const body = {
    storyId: story.id,
    expectedRevision: story.revision,
    format: "carousel",
    canvas: { width: 1080, height: 1350 },
    textBoxes: [],
    background: "#ffffff",
    caption: "Fixture",
    captionLimit: 125,
    viewContext,
  };
  const response = await f.api("/api/studio/preflight", body);
  assert.equal(response.status, 200);
  const state = await (
    await f.platform.forScope({
      organizationId: "org_default",
      brandId: "brand_default",
    })
  ).ports.repo.read();
  const record = state.preflights.at(-1);
  assert.deepEqual(record.settings.viewContext, viewContext);
  assert.equal(record.storyRevision, story.revision);
  assert.equal(
    (
      await f.api("/api/studio/preflight", {
        ...body,
        viewContext: { ...viewContext, frameIndex: 99 },
      })
    ).status,
    400,
  );
});

test("only persisted PNG and text artifacts stamp real export chronology; failure leaves timestamps unchanged", async (t) => {
  const previous = process.env.AI_ALLOW_SYNTHETIC;
  process.env.AI_ALLOW_SYNTHETIC = "true";
  t.after(() => {
    if (previous === undefined) delete process.env.AI_ALLOW_SYNTHETIC;
    else process.env.AI_ALLOW_SYNTHETIC = previous;
  });
  const f = await fixture(t);
  const app = await f.platform.forScope({
    organizationId: "org_default",
    brandId: "brand_default",
    preset: "liquidity_desk",
  });
  const repo = app.ports.repo,
    formatter = app.services.multiFormatFormatterService;
  const story = await repo.addBacklogStory({
    title: "Chronology fixture",
    sourceClaims: [
      {
        id: "source",
        text: "A short sourced excerpt.",
        sourceUrl: "https://example.org/export-time",
        kind: "general",
        status: "approved",
      },
    ],
  });
  await formatter.generateCampaignForStory(story.id);
  assert.equal(
    (await repo.listBacklog()).find((item) => item.id === story.id).exportedAt,
    null,
  );
  const originalUpload = repo.store.uploadArtifact;
  repo.store.uploadArtifact = async () => {
    throw new Error("Injected artifact persistence failure");
  };
  await assert.rejects(
    formatter.exportFormattedAsset({ storyId: story.id, format: "reel" }),
    /persistence failure/,
  );
  assert.equal(
    (await repo.listBacklog()).find((item) => item.id === story.id).exportedAt,
    null,
  );
  delete repo.store.uploadArtifact;
  for (const format of ["infographic", "reel"]) {
    const exported = await formatter.exportFormattedAsset({
      storyId: story.id,
      format,
    });
    const asset = await repo.getAsset(exported.exportId);
    const saved = (await repo.listBacklog()).find(
      (item) => item.id === story.id,
    );
    assert.equal(saved.exportedAt, asset.createdAt);
    assert.ok(Number.isFinite(Date.parse(saved.exportedAt)));
  }
  const lastStamp = (await repo.listBacklog()).find(
    (item) => item.id === story.id,
  ).exportedAt;
  repo.store.uploadArtifact = async () => {
    throw new Error("Injected later persistence failure");
  };
  await assert.rejects(
    formatter.exportFormattedAsset({ storyId: story.id, format: "reel" }),
    /persistence failure/,
  );
  assert.equal(
    (await repo.listBacklog()).find((item) => item.id === story.id).exportedAt,
    lastStamp,
  );
  if (originalUpload) repo.store.uploadArtifact = originalUpload;
  else delete repo.store.uploadArtifact;
  await repo.mutate((state) => {
    state.backlog.find((item) => item.id === story.id).exportedAt =
      "not-a-date";
    return state;
  });
  assert.equal(
    (await repo.listBacklog()).find((item) => item.id === story.id).exportedAt,
    null,
  );
});
