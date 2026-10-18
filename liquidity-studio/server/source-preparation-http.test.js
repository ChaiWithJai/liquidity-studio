import test from "node:test";
import assert from "node:assert/strict";
import { randomUUID, createHash } from "node:crypto";
import { DurableStore } from "./storage.js";
import { createPlatform } from "./platform.js";
import { createHttpServer } from "./index.js";
test("actual scoped HTTP creates durable preparation and revisioned candidate edits; no anonymous/foreign/revoked access", async (t) => {
  process.env.NODE_ENV = "test";
  process.env.STUDIO_OPERATOR_JOBS_ENABLED = "true";
  process.env.STUDIO_SOURCE_PREPARATION_ENABLED = "true";
  process.env.STUDIO_JOB_DISPATCHER = "local";
  process.env.STUDIO_SOURCE_HOSTS = "source.example";
  const text =
    "Disposable HTTP evidence excerpt retrieved by the injected bounded source port, never human approved.";
  const store = new DurableStore(":memory:"),
    platform = createPlatform({
      store,
      authMode: "password",
      sourceRetriever: async (url) => ({
        sourceUrl: url,
        requestedUrl: url,
        retrievedAt: new Date().toISOString(),
        contentType: "text/plain",
        text,
        textSha256: createHash("sha256").update(text).digest("hex"),
        responseSha256: createHash("sha256").update(text).digest("hex"),
        responseBytes: Buffer.byteLength(text),
        status: "unreviewed",
        approval: "none",
        extractionVersion: "fixture",
      }),
    });
  await platform.ready;
  await platform.identity.provision({
    username: "source-http-founder",
    password: "disposable-source-http-239!",
    role: "founder",
  });
  const server = createHttpServer(null, { platform });
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  t.after(async () => {
    await new Promise((resolve) => server.close(resolve));
    await store.close();
  });
  const base = `http://127.0.0.1:${server.address().port}`,
    suffix = "?organizationId=org_default&brandId=brand_default";
  const login = await fetch(base + "/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: "source-http-founder",
        password: "disposable-source-http-239!",
      }),
    }),
    cookie = login.headers.get("set-cookie").split(";")[0];
  const api = async (path, body, query = suffix) => {
    const res = await fetch(base + path + query, {
      method: body ? "POST" : "GET",
      headers: { Cookie: cookie, "Content-Type": "application/json" },
      body: body ? JSON.stringify(body) : undefined,
    });
    return { status: res.status, data: await res.json() };
  };
  const created = await api("/api/studio/backlog", {
    title: "HTTP source candidate",
    sourceClaims: [
      {
        id: "claim",
        text: "Unverified input is not approved",
        sourceUrl: "https://source.example/a",
        kind: "general",
        status: "unreviewed",
      },
    ],
  });
  assert.equal(created.status, 201);
  assert.equal(created.data.preparation.state, "queued");
  const accepted = await api(
    "/api/studio/jobs/" + created.data.preparation.jobId,
  );
  assert.equal(accepted.status, 200);
  assert.equal(accepted.data.job.purpose, "source-preparation");
  assert.equal(accepted.data.job.authorizationMode, "ingestion-policy");
  const user = (await store.get("identity")).users.find(
      (user) => user.username === "source-http-founder",
    ),
    scope = await platform.identity.authorize(
      user,
      "org_default",
      "brand_default",
    ),
    container = await platform.forScope(scope),
    jobs = platform.operatorJobs(scope, container),
    job = accepted.data.job;
  const done = await jobs.runNext("http-worker", job.id, job.items[0].id, 1),
    path = "/api/studio/preparations/" + done.items[0].receipt.candidateId;
  assert.equal((await fetch(base + path + suffix)).status, 401);
  assert.equal(
    (
      await api(
        path,
        undefined,
        "?organizationId=org_default&brandId=brand_vedic",
      )
    ).status,
    404,
  );
  const original = await api(path);
  assert.equal(original.status, 200);
  assert.equal(original.data.exportable, false);
  assert.equal(original.data.candidate.provenance.humanApproval, "none");
  const artwork = structuredClone(original.data.candidate.artwork);
  artwork.infographic.headline = "Edited unreviewed preview";
  const edit = { idempotencyKey: randomUUID(), expectedRevision: 1, artwork };
  assert.equal((await api(path + "/edit", edit)).status, 200);
  assert.equal((await api(path + "/edit", edit)).data.revision, 2);
  assert.equal(
    (await api(path + "/edit", { ...edit, idempotencyKey: randomUUID() }))
      .status,
    409,
  );
  const reviewPlan = await api(path + "/review-plan");
  assert.equal(reviewPlan.status, 200);
  const reviewed = reviewPlan.data;
  const promotion = {
    idempotencyKey: randomUUID(),
    expectedCandidateRevision: reviewed.candidateRevision,
    expectedContentRevision: reviewed.contentRevision,
    brandRevision: reviewed.brandRevision,
    copySha256: reviewed.copySha256,
    evidenceSha256: reviewed.evidenceSha256,
    reviewed: true,
    kind: "general",
  };
  const promoted = await api(path + "/promote", promotion);
  assert.equal(promoted.status, 200);
  assert.equal(
    promoted.data.story.campaignDraft.infographic.headline,
    "Edited unreviewed preview",
  );
  assert.equal(promoted.data.receipt.modelCalls, 0);
  assert.equal(promoted.data.receipt.publicationApproved, false);
  assert.equal(
    (await api(path + "/promote", promotion)).data.receipt.generationId,
    promoted.data.receipt.generationId,
  );
  await store.update("identity", (state) => {
    state.memberships = state.memberships.filter(
      (member) => member.userId !== user.id,
    );
    return state;
  });
  assert.equal((await api(path)).status, 403);
});
