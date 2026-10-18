import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { DurableStore } from "./storage.js";
import { createPlatform } from "./platform.js";
import { createHttpServer } from "./index.js";
async function fixture(t) {
  const store = new DurableStore(":memory:"),
    platform = createPlatform({ store, authMode: "password" });
  await platform.ready;
  await platform.identity.provision({
    username: "workspace-founder",
    password: "test-only-workspace-password-239!",
    role: "founder",
  });
  await platform.identity.provision({
    username: "workspace-marketer",
    password: "test-only-workspace-password-239!",
    role: "marketer",
  });
  const server = createHttpServer(null, { platform });
  await new Promise((r) => server.listen(0, "127.0.0.1", r));
  t.after(async () => {
    await new Promise((r) => server.close(r));
    store.close();
  });
  let cookie = "";
  const api = async (
    path,
    body,
    scope = "organizationId=org_default&brandId=brand_default",
  ) => {
    const res = await fetch(
      `http://127.0.0.1:${server.address().port}${path}${path.includes("?") ? "&" : "?"}${scope}`,
      {
        method: body === undefined ? "GET" : "POST",
        headers: { "Content-Type": "application/json", Cookie: cookie },
        body: body === undefined ? undefined : JSON.stringify(body),
      },
    );
    return { status: res.status, data: await res.json() };
  };
  const login = async (username = "workspace-founder") => {
    const response = await fetch(
      `http://127.0.0.1:${server.address().port}/api/auth/login`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username,
          password: "test-only-workspace-password-239!",
        }),
      },
    );
    cookie = response.headers.get("set-cookie").split(";")[0];
  };
  await login();
  return { store, platform, api, login };
}
const mutate = (f, changes, key = randomUUID()) =>
  f.api("/api/studio/workspace/mutations", { idempotencyKey: key, changes });
const query = (f) => f.api("/api/studio/workspace/query", {});
test("real scoped query, partial metadata mutation, receipts and guarded undo", async (t) => {
  const f = await fixture(t);
  const initial = await query(f);
  assert.equal(initial.status, 200);
  const [one, two] = initial.data.rows;
  const key = randomUUID(),
    change = {
      kind: "story.patch",
      storyId: one.id,
      expectedRevision: one.revision,
      patch: { title: "Revised operator title" },
    };
  const result = await mutate(
    f,
    [
      change,
      {
        kind: "story.patch",
        storyId: two.id,
        expectedRevision: 999,
        patch: { title: "must not overwrite" },
      },
    ],
    key,
  );
  assert.deepEqual(
    result.data.outcomes.map((o) => o.status),
    ["applied", "conflict"],
  );
  assert.deepEqual(
    (
      await mutate(
        f,
        [
          change,
          {
            kind: "story.patch",
            storyId: two.id,
            expectedRevision: 999,
            patch: { title: "must not overwrite" },
          },
        ],
        key,
      )
    ).data,
    result.data,
  );
  assert.equal((await mutate(f, [change], key)).status, 409);
  const undo = await f.api(
    `/api/studio/workspace/operations/${result.data.operationId}/undo`,
    { idempotencyKey: randomUUID() },
  );
  assert.equal(undo.status, 200);
  assert.equal(undo.data.rows[0].title, one.title);
  assert.ok(undo.data.rows[0].revision > one.revision);
  assert.equal(
    (
      await f.api(
        "/api/studio/workspace/query",
        {},
        "organizationId=foreign&brandId=brand_default",
      )
    ).status,
    403,
  );
  const rejected = await mutate(f, [
    {
      ...change,
      expectedRevision: undo.data.rows[0].revision,
      patch: { status: "Published" },
    },
  ]);
  assert.equal(rejected.data.outcomes[0].status, "rejected");
});
test("dated campaign and format slots preserve local DST date, order revisions and legacy distinction", async (t) => {
  const f = await fixture(t),
    initial = (await query(f)).data;
  const [one, two] = initial.rows;
  assert.ok(initial.rows.some((r) => r.legacyWeekday));
  const place = (story, extra = {}) => ({
    kind: "assignment.place",
    storyId: story.id,
    expectedRevision: story.revision,
    unit: "campaign",
    date: "2026-11-01",
    timeZone: "America/New_York",
    targetBucketRevision: 0,
    ...extra,
  });
  const result = await mutate(f, [place(one)]);
  assert.equal(result.data.outcomes[0].status, "applied");
  const row = result.data.outcomes[0].row;
  assert.equal(row.legacyWeekday, null);
  assert.equal(row.assignments[0].date, "2026-11-01");
  const stale = await mutate(f, [place(two)]);
  assert.equal(stale.data.outcomes[0].status, "conflict");
  const format = await mutate(f, [
    place(two, {
      unit: "format",
      format: "reel",
      targetBucketRevision: 1,
      beforeAssignmentId: row.assignments[0].id,
    }),
  ]);
  assert.equal(format.data.outcomes[0].status, "applied");
  const calendar = await f.api(
    "/api/studio/workspace/calendar?startDate=2026-11-01&endDate=2026-11-02&timeZone=America%2FNew_York",
  );
  assert.equal(calendar.status, 200);
  assert.equal(calendar.data.assignments.length, 2);
  assert.equal(
    Object.values(calendar.data.buckets)[0].assignmentIds[0],
    format.data.outcomes[0].row.assignments[0].id,
  );
  assert.equal(
    (
      await f.api(
        `/api/studio/workspace/operations/${result.data.operationId}/undo`,
        { idempotencyKey: randomUUID() },
      )
    ).status,
    409,
  );
  const invalid = await mutate(f, [
    place(two, {
      expectedRevision: format.data.outcomes[0].row.revision,
      date: "2026-02-30",
    }),
  ]);
  assert.equal(invalid.data.outcomes[0].status, "rejected");
});
test("saved views are private by default, shared intentionally, revision guarded and durable", async (t) => {
  const f = await fixture(t);
  const create = await f.api("/api/studio/workspace/views", {
    idempotencyKey: randomUUID(),
    name: "My backlog",
    definition: {
      filters: { search: "liquidity" },
      columns: ["title", "revision"],
    },
  });
  assert.equal(create.status, 201);
  await f.login("workspace-marketer");
  assert.deepEqual((await f.api("/api/studio/workspace/views")).data.views, []);
  assert.equal(
    (
      await f.api(`/api/studio/workspace/views/${create.data.id}`, {
        idempotencyKey: randomUUID(),
        expectedRevision: 1,
        name: "stolen",
        definition: {},
      })
    ).status,
    404,
  );
  await f.login();
  const shared = await f.api(`/api/studio/workspace/views/${create.data.id}`, {
    idempotencyKey: randomUUID(),
    expectedRevision: 1,
    name: "Team backlog",
    sharing: "brand",
    definition: { sort: [{ field: "revision", direction: "desc" }] },
  });
  assert.equal(shared.status, 200);
  await f.login("workspace-marketer");
  assert.equal(
    (await f.api("/api/studio/workspace/views")).data.views[0].name,
    "Team backlog",
  );
  assert.equal(
    (
      await f.api(`/api/studio/workspace/views/${create.data.id}`, {
        idempotencyKey: randomUUID(),
        expectedRevision: 2,
        name: "not owner",
        definition: {},
      })
    ).status,
    403,
  );
});
test("query cursor detects intervening writes and legacy scheduler cannot publish or bypass revision", async (t) => {
  const f = await fixture(t);
  const page = await f.api("/api/studio/workspace/query", { limit: 1 });
  assert.ok(page.data.nextCursor);
  const one = page.data.rows[0];
  assert.equal(
    (
      await f.api("/api/studio/schedule", {
        storyId: one.id,
        status: "Published",
        scheduledDay: "Monday",
        expectedRevision: one.revision,
        idempotencyKey: randomUUID(),
      })
    ).status,
    400,
  );
  assert.equal(
    (
      await f.api("/api/studio/schedule", {
        storyId: one.id,
        status: "Scheduled",
        scheduledDay: "Monday",
        idempotencyKey: randomUUID(),
      })
    ).status,
    400,
  );
  const result = await f.api("/api/studio/schedule", {
    storyId: one.id,
    status: "Scheduled",
    scheduledDay: "Friday",
    expectedRevision: one.revision,
    idempotencyKey: randomUUID(),
  });
  assert.equal(result.status, 200);
  assert.equal(result.data.story.scheduledDay, "Friday");
  assert.equal(
    (
      await f.api("/api/studio/workspace/query", {
        limit: 1,
        cursor: page.data.nextCursor,
      })
    ).status,
    409,
  );
});
test("foreign brand stories, assignees, unsafe fields and revoked memberships fail closed", async (t) => {
  const f = await fixture(t),
    row = (await query(f)).data.rows[0];
  const foreign = await f.api(
    "/api/studio/workspace/mutations",
    {
      idempotencyKey: randomUUID(),
      changes: [
        {
          kind: "story.patch",
          storyId: row.id,
          expectedRevision: row.revision,
          patch: { title: "foreign" },
        },
      ],
    },
    "organizationId=org_default&brandId=brand_vedic",
  );
  assert.equal(foreign.data.outcomes[0].status, "rejected");
  const result = await mutate(f, [
    {
      kind: "story.patch",
      storyId: row.id,
      expectedRevision: row.revision,
      patch: { sourceClaims: [] },
    },
  ]);
  assert.equal(result.data.outcomes[0].status, "rejected");
  const assignee = await mutate(f, [
    {
      kind: "story.patch",
      storyId: row.id,
      expectedRevision: row.revision,
      patch: { assigneeId: "not-a-member" },
    },
  ]);
  assert.equal(assignee.data.outcomes[0].status, "rejected");
  const members = await f.api("/api/studio/workspace/members");
  assert.equal(members.status, 200);
  assert.ok(
    members.data.members.every(
      (m) => Object.keys(m).sort().join(",") === "displayName,id,role",
    ),
  );
  await f.login("workspace-marketer");
  const identity = await f.store.get("identity");
  const user = identity.users.find((u) => u.username === "workspace-marketer");
  await f.store.update("identity", (state) => {
    state.memberships = state.memberships.filter((m) => m.userId !== user.id);
    return state;
  });
  assert.equal((await query(f)).status, 403);
  assert.equal((await f.api("/api/studio/workspace/views")).status, 403);
});
test("calendar remove and undo retain monotonically increasing bucket revisions", async (t) => {
  const f = await fixture(t),
    one = (await query(f)).data.rows[0];
  const placed = await mutate(f, [
    {
      kind: "assignment.place",
      storyId: one.id,
      expectedRevision: one.revision,
      unit: "campaign",
      date: "2026-03-08",
      timeZone: "America/New_York",
      targetBucketRevision: 0,
    },
  ]);
  const row = placed.data.outcomes[0].row,
    a = row.assignments[0];
  const removed = await mutate(f, [
    {
      kind: "assignment.remove",
      storyId: one.id,
      expectedRevision: row.revision,
      assignmentId: a.id,
      expectedAssignmentRevision: a.revision,
      sourceBucketRevision: 1,
    },
  ]);
  assert.equal(removed.data.outcomes[0].row.assignments.length, 0);
  const undo = await f.api(
    `/api/studio/workspace/operations/${removed.data.operationId}/undo`,
    { idempotencyKey: randomUUID() },
  );
  assert.equal(undo.status, 200);
  assert.equal(undo.data.rows[0].assignments[0].id, a.id);
  assert.ok(undo.data.rows[0].assignments[0].revision > a.revision);
  const cal = await f.api(
    "/api/studio/workspace/calendar?startDate=2026-03-08&endDate=2026-03-08&timeZone=America%2FNew_York",
  );
  assert.equal(Object.values(cal.data.buckets)[0].revision, 3);
});
test("portable dated assignments remap explicitly without restoring undo authority", async (t) => {
  const f = await fixture(t),
    one = (await query(f)).data.rows[0];
  const placed = await mutate(f, [
    {
      kind: "assignment.place",
      storyId: one.id,
      expectedRevision: one.revision,
      unit: "format",
      format: "carousel",
      date: "2026-03-08",
      timeZone: "America/New_York",
      targetBucketRevision: 0,
    },
  ]);
  const exported = await f.api("/api/admin/eject");
  assert.equal(exported.status, 200);
  assert.equal(exported.data.data.workspace.receipts, undefined);
  assert.equal(exported.data.data.workspace.assignments.length, 1);
  const imported = await f.api(
    "/api/admin/import",
    { bundle: exported.data, remapScope: true },
    "organizationId=org_default&brandId=brand_vedic",
  );
  assert.equal(imported.status, 200);
  const target = await f.api(
    "/api/studio/workspace/calendar?startDate=2026-03-08&endDate=2026-03-08&timeZone=America%2FNew_York",
    undefined,
    "organizationId=org_default&brandId=brand_vedic",
  );
  assert.equal(target.data.assignments[0].brandId, "brand_vedic");
  assert.equal(
    (
      await f.api(
        `/api/studio/workspace/operations/${placed.data.operationId}/undo`,
        { idempotencyKey: randomUUID() },
        "organizationId=org_default&brandId=brand_vedic",
      )
    ).status,
    404,
  );
});

test("SQLite reopen retains views, assignments and revision receipts", async (t) => {
  const directory = mkdtempSync(join(tmpdir(), "liquidity-workspace-"));
  t.after(() => rmSync(directory, { recursive: true, force: true }));
  const filename = join(directory, "workspace.sqlite"),
    scope = { organizationId: "org_default", brandId: "brand_default" };
  let store = new DurableStore(filename),
    platform = createPlatform({ store, authMode: "password" });
  await platform.ready;
  await platform.identity.provision({
    username: "workspace-reopen",
    password: "isolated-test-password-248!",
    role: "founder",
  });
  let actor = (await store.get("identity")).users.find(
    (user) => user.username === "workspace-reopen",
  );
  let container = await platform.forScope(scope),
    service = platform.workspace(scope, container.ports.repo);
  const row = (await service.query(actor, {})).rows[0],
    key = randomUUID();
  const command = {
    idempotencyKey: key,
    changes: [
      {
        kind: "assignment.place",
        storyId: row.id,
        expectedRevision: row.revision,
        unit: "campaign",
        date: "2026-11-01",
        timeZone: "America/New_York",
        targetBucketRevision: 0,
      },
    ],
  };
  const result = await service.mutate(actor, command);
  const view = await service.views.write(actor, undefined, "create", {
    idempotencyKey: randomUUID(),
    name: "Persisted personal view",
    definition: { columns: ["title", "plannedDate"] },
  });
  store.close();
  store = new DurableStore(filename);
  t.after(() => store.close());
  platform = createPlatform({ store, authMode: "password" });
  await platform.ready;
  container = await platform.forScope(scope);
  service = platform.workspace(scope, container.ports.repo);
  assert.deepEqual(await service.mutate(actor, command), result);
  assert.equal((await service.views.list(actor))[0].id, view.id);
  assert.equal(
    (await service.query(actor, {})).rows.find((r) => r.id === row.id)
      .assignments[0].date,
    "2026-11-01",
  );
});

test("simultaneous placements cannot overwrite a shared date bucket order", async (t) => {
  const f = await fixture(t),
    [one, two] = (await query(f)).data.rows;
  const command = (story) => [
    {
      kind: "assignment.place",
      storyId: story.id,
      expectedRevision: story.revision,
      unit: "campaign",
      date: "2026-11-01",
      timeZone: "America/New_York",
      targetBucketRevision: 0,
    },
  ];
  const responses = await Promise.all([
    mutate(f, command(one)),
    mutate(f, command(two)),
  ]);
  assert.deepEqual(responses.map((r) => r.data.outcomes[0].status).sort(), [
    "applied",
    "conflict",
  ]);
  const cal = await f.api(
    "/api/studio/workspace/calendar?startDate=2026-11-01&endDate=2026-11-01&timeZone=America%2FNew_York",
  );
  assert.equal(cal.data.assignments.length, 1);
  assert.equal(Object.values(cal.data.buckets)[0].revision, 1);
});

test("undo keys cannot be reused for another operation or mutation", async (t) => {
  const f = await fixture(t),
    [one, two] = (await query(f)).data.rows;
  const change = (story) => [
    {
      kind: "story.patch",
      storyId: story.id,
      expectedRevision: story.revision,
      patch: { title: story.title + " edited" },
    },
  ];
  const first = await mutate(f, change(one)),
    second = await mutate(f, change(two)),
    key = randomUUID();
  assert.equal(
    (
      await f.api(
        `/api/studio/workspace/operations/${second.data.operationId}/undo`,
        { idempotencyKey: key },
      )
    ).status,
    200,
  );
  assert.equal(
    (
      await f.api(
        `/api/studio/workspace/operations/${first.data.operationId}/undo`,
        { idempotencyKey: key },
      )
    ).status,
    409,
  );
  assert.equal(
    (
      await mutate(
        f,
        [
          {
            kind: "story.patch",
            storyId: one.id,
            expectedRevision: first.data.outcomes[0].row.revision,
            patch: { title: "must not apply" },
          },
        ],
        key,
      )
    ).status,
    409,
  );
});
