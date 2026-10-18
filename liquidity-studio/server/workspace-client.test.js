import test from "node:test";
import assert from "node:assert/strict";
import { createWorkspaceClient } from "../src/lib/workspace-client.js";
import { createPlatform } from "./platform.js";
import { createHttpServer } from "./index.js";
import { DurableStore } from "./storage.js";
import { randomBytes } from "node:crypto";
async function fixture(t) {
  const platform = createPlatform({
    authMode: "password",
    store: new DurableStore(":memory:"),
  });
  await platform.ready;
  const password = randomBytes(24).toString("base64url");
  await platform.identity.provision({
    username: "client-test",
    password,
    role: "founder",
  });
  const server = createHttpServer(null, { platform });
  await new Promise((r) => server.listen(0, "127.0.0.1", r));
  t.after(async () => {
    server.closeAllConnections();
    await new Promise((r) => server.close(r));
    await platform.store.close();
  });
  const base = `http://127.0.0.1:${server.address().port}`;
  const login = await fetch(base + "/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username: "client-test", password }),
  });
  const cookie = login.headers
    .getSetCookie()
    .map((value) => value.split(";")[0])
    .join("; ");
  const request = async (path, options = {}) => {
    const response = await fetch(
      base +
        path +
        (path.includes("?") ? "&" : "?") +
        "organizationId=org_default&brandId=brand_default",
      {
        ...options,
        headers: {
          Cookie: cookie,
          "Content-Type": "application/json",
          ...options.headers,
        },
      },
    );
    const data = await response.json();
    if (!response.ok)
      throw Object.assign(new Error(data.error), { status: response.status });
    return data;
  };
  const client = createWorkspaceClient({
    request,
    scopeKey: "org_default:brand_default",
  });
  t.after(() => client.dispose());
  return { client, request };
}
test("real scoped API rows, full details, metadata mutations, receipts and undo use one entity revision", async (t) => {
  const { client } = await fixture(t);
  await client.query();
  const id = client.snapshot.pageIds[0];
  assert.ok(id);
  assert.equal(client.getStory(id), null);
  await client.ensureStories([id]);
  const original = client.getStory(id);
  assert.equal(
    original.revision,
    client.snapshot.entities.get(id).row.revision,
  );
  await client.mutate([
    {
      kind: "story.patch",
      storyId: id,
      expectedRevision: original.revision,
      patch: { category: "Client updated category" },
    },
  ]);
  const changed = client.getStory(id);
  assert.equal(changed.category, "Client updated category");
  assert.ok(changed.revision > original.revision);
  assert.equal(changed.revision, client.snapshot.entities.get(id).row.revision);
  const receipt = client.snapshot.receipt;
  assert.equal(receipt.outcomes[0].status, "applied");
  assert.ok(
    client.snapshot.operations.find(
      (item) => item.operationId === receipt.operationId,
    ).canUndo,
  );
  await client.undo(receipt.operationId);
  const restored = client.getStory(id);
  assert.equal(restored.category, original.category);
  assert.ok(restored.revision > changed.revision);
});
test("calendar projections keep IDs, shared views persist definitions, and partial conflicts preserve current entities", async (t) => {
  const { client } = await fixture(t);
  await client.query();
  const [a, b] = client.snapshot.pageIds;
  await client.ensureStories([a, b]);
  const old = client.getStory(a);
  await client.mutate([
    {
      kind: "story.patch",
      storyId: a,
      expectedRevision: old.revision,
      patch: { category: "First change" },
    },
  ]);
  const result = await client.mutate([
    {
      kind: "story.patch",
      storyId: a,
      expectedRevision: old.revision,
      patch: { category: "Stale change" },
    },
    {
      kind: "story.patch",
      storyId: b,
      expectedRevision: client.getStory(b).revision,
      patch: { category: "Second change" },
    },
  ]);
  assert.equal(result.outcomes[0].status, "conflict");
  assert.equal(result.outcomes[1].status, "applied");
  assert.equal(client.getStory(a).category, "First change");
  await client.loadCalendar({
    startDate: "2026-10-18",
    endDate: "2026-10-25",
    timeZone: "America/New_York",
  });
  assert.ok(client.snapshot.calendar.data.unscheduledIds.length);
  assert.equal("unscheduled" in client.snapshot.calendar.data, false);
  assert.equal("legacyWeekdays" in client.snapshot.calendar.data, false);
  const view = await client.writeView("create", {
    name: "Editorial saved view",
    sharing: "brand",
    definition: {
      filters: { search: "source" },
      columns: ["title", "revision"],
      groupBy: "status",
      sort: [{ field: "revision", direction: "desc" }],
      limit: 25,
    },
  });
  assert.equal(client.snapshot.views[0].id, view.id);
  await client.writeView("delete", {
    id: view.id,
    expectedRevision: view.revision,
  });
  assert.equal(client.snapshot.views.length, 0);
  assert.equal(client.snapshot.deletedView.id, view.id);
  await client.writeView("restore", {
    id: view.id,
    expectedRevision: client.snapshot.deletedView.revision,
  });
  assert.equal(client.snapshot.views.length, 1);
});
test("late scoped results are discarded and newer canonical rows cannot be overwritten by older full snapshots", async () => {
  let release;
  const client = createWorkspaceClient({
    scopeKey: "old",
    request: () => new Promise((r) => (release = r)),
  });
  const pending = client.query();
  client.dispose();
  release({
    rows: [],
    total: 0,
    filteredTotal: 0,
    groups: [],
    definition: {},
    nextCursor: null,
  });
  await pending;
  assert.equal(client.snapshot.query.loaded, false);
  const current = createWorkspaceClient({
    scopeKey: "new",
    request: async () => ({
      schemaVersion: 1,
      rows: [{ id: "s", revision: 4, title: "new" }],
      definition: {},
      total: 1,
      filteredTotal: 1,
      groups: [],
      nextCursor: null,
    }),
  });
  await current.query();
  current.ingestStories([{ id: "s", revision: 2, title: "old" }]);
  assert.equal(current.snapshot.entities.get("s").revision, 4);
  assert.equal(current.getStory("s"), null);
  current.dispose();
});

test("explicit detail refresh reconciles an external revision instead of trusting matching cached snapshots", async (t) => {
  const {client,request}=await fixture(t);
  await client.query();
  const id=client.snapshot.pageIds[0];
  await client.ensureStories([id]);
  const before=client.getStory(id);
  await request('/api/studio/workspace/mutations',{method:'POST',body:JSON.stringify({idempotencyKey:crypto.randomUUID(),changes:[{kind:'story.patch',storyId:id,expectedRevision:before.revision,patch:{category:'External revision'}}]})});
  assert.equal(client.getStory(id).revision,before.revision);
  await client.ensureStories([id],{force:true});
  assert.equal(client.getStory(id).category,'External revision');
  assert.ok(client.getStory(id).revision>before.revision);
  assert.equal(client.snapshot.entities.get(id).row.revision,client.getStory(id).revision);
});
