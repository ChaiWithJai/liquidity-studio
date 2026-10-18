import test from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { DurableStore } from "./storage.js";
import { createPlatform } from "./platform.js";
import { createHttpServer } from "./index.js";
test("scoped jobs HTTP uses existing session, plan revisions, durable202, current memberships and no arbitrary worker authority", async (t) => {
  process.env.NODE_ENV = "test";
  process.env.STUDIO_OPERATOR_JOBS_ENABLED = "true";
  process.env.STUDIO_JOB_DISPATCHER = "local";
  const store = new DurableStore(":memory:"),
    platform = createPlatform({ store, authMode: "password" });
  await platform.ready;
  await platform.identity.provision({
    username: "http-job-founder",
    password: "isolated-http-job-239!",
    role: "founder",
  });
  const server = createHttpServer(null, { platform });
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  t.after(async () => {
    await new Promise((resolve) => server.close(resolve));
    store.close();
  });
  const base = `http://127.0.0.1:${server.address().port}`,
    scope = "?organizationId=org_default&brandId=brand_default";
  const login = await fetch(base + "/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: "http-job-founder",
        password: "isolated-http-job-239!",
      }),
    }),
    cookie = login.headers.get("set-cookie").split(";")[0];
  const api = async (path, body, suffix = scope) => {
    const res = await fetch(base + path + suffix, {
      method: body ? "POST" : "GET",
      headers: { Cookie: cookie, "Content-Type": "application/json" },
      body: body ? JSON.stringify(body) : undefined,
    });
    return { status: res.status, data: await res.json() };
  };
  assert.equal((await fetch(base + "/api/studio/jobs" + scope)).status, 401);
  const created = await api("/api/studio/backlog", {
    title: "HTTP reviewed job",
    sourceClaims: [
      {
        id: "http-source",
        text: "An approved controlled test claim.",
        sourceUrl: "https://example.org/http-job",
        kind: "general",
        status: "approved",
      },
    ],
  });
  assert.equal(created.status, 201);
  const plan = await api("/api/studio/jobs/plan"),
    input = {
      idempotencyKey: randomUUID(),
      reviewed: true,
      brandRevision: plan.data.brandRevision,
      items: [
        {
          storyId: created.data.story.id,
          storyRevision: created.data.story.revision,
        },
      ],
    };
  const accepted = await api("/api/studio/jobs", input);
  assert.equal(accepted.status, 202);
  assert.equal(
    (await api("/api/studio/jobs", input)).data.job.id,
    accepted.data.job.id,
  );
  assert.equal(
    (
      await api(
        "/api/studio/jobs/" + accepted.data.job.id,
        undefined,
        "?organizationId=org_default&brandId=brand_vedic",
      )
    ).status,
    404,
  );
  assert.equal(
    (await api("/api/studio/jobs", { ...input, actorId: "attacker" })).status,
    400,
  );
  assert.equal(
    (await api("/api/internal/operator-job", { ...input })).status,
    404,
  );
  const user = (await store.get("identity")).users.find(
    (user) => user.username === "http-job-founder",
  );
  await store.update("identity", (state) => {
    state.memberships = state.memberships.filter(
      (member) => member.userId !== user.id,
    );
    return state;
  });
  assert.equal(
    (await api("/api/studio/jobs/" + accepted.data.job.id)).status,
    403,
  );
});
