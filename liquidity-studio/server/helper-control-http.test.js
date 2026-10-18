import test from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { DurableStore } from "./storage.js";
import { createPlatform } from "./platform.js";
import { createHttpServer } from "./index.js";
test("real authenticated control HTTP binds owner approval and helper application to scope/revision/epoch", async (t) => {
  const store = new DurableStore(":memory:"),
    platform = createPlatform({ store, authMode: "password" });
  await platform.ready;
  for (const [username, role] of [
    ["http-owner", "founder"],
    ["http-helper", "marketer"],
  ])
    await platform.identity.provision({
      username,
      role,
      password: "helper-http-fixture-345!",
    });
  const server = createHttpServer(null, {
    platform,
    helperControlEnabled: true,
  });
  await new Promise((r) => server.listen(0, "127.0.0.1", r));
  t.after(async () => {
    await new Promise((r) => server.close(r));
    store.close();
  });
  const base = `http://127.0.0.1:${server.address().port}`,
    scope = "?organizationId=org_default&brandId=brand_default";
  async function login(username) {
    const r = await fetch(base + "/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password: "helper-http-fixture-345!" }),
    });
    assert.equal(r.status, 200);
    return r.headers.get("set-cookie").split(";")[0];
  }
  const owner = await login("http-owner"),
    helper = await login("http-helper");
  async function api(cookie, path, body) {
    const r = await fetch(base + "/api/studio/workspace" + path + scope, {
      method: body === undefined ? "GET" : "POST",
      headers: { "Content-Type": "application/json", Cookie: cookie },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    return { status: r.status, data: await r.json() };
  }
  const users = (await store.get("identity")).users,
    helperId = users.find((x) => x.username === "http-helper").id;
  const story = (await api(owner, "/query", {})).data.rows[0];
  assert.equal((await api("", "/control")).status, 401);
  const grant = await api(owner, "/control/grants", {
    helperId,
    storyIds: [story.id],
    kinds: ["story.patch"],
    expiresAt: new Date(Date.now() + 600000).toISOString(),
  });
  assert.equal(grant.status, 201);
  const proposed = await api(helper, "/control/proposals", {
    grantId: grant.data.id,
    epoch: 1,
    changes: [
      {
        kind: "story.patch",
        storyId: story.id,
        expectedRevision: story.revision,
        patch: { category: "HTTP helper result" },
      },
    ],
  });
  assert.equal(proposed.status, 201);
  const id = proposed.data.id,
    input = { grantId: grant.data.id, epoch: 1, idempotencyKey: randomUUID() };
  assert.equal(
    (await api(helper, `/control/proposals/${id}/apply`, input)).status,
    409,
  );
  assert.equal(
    (
      await api(helper, `/control/proposals/${id}/approve`, {
        expectedRevision: 1,
      })
    ).status,
    403,
  );
  assert.equal(
    (
      await api(owner, `/control/proposals/${id}/approve`, {
        expectedRevision: 1,
      })
    ).status,
    200,
  );
  const applied = await api(helper, `/control/proposals/${id}/apply`, input);
  assert.equal(applied.status, 200);
  assert.equal(applied.data.outcomes[0].status, "applied");
  assert.equal(
    (
      await api(owner, `/control/grants/${grant.data.id}/pause`, {
        expectedEpoch: 1,
      })
    ).status,
    200,
  );
  assert.deepEqual(
    (await api(helper, `/control/proposals/${id}/apply`, input)).data,
    applied.data,
  );
  assert.equal(
    (
      await api(helper, `/control/proposals/${id}/apply`, {
        ...input,
        idempotencyKey: randomUUID(),
      })
    ).status,
    409,
  );
  const detail = await api(owner, `/stories/${story.id}`);
  assert.equal(detail.data.story.category, "HTTP helper result");
  assert.equal(detail.data.story.revision, story.revision + 1);
});
