import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { DurableStore } from "./storage.js";
import { createPlatform } from "./platform.js";
import { createHttpServer } from "./index.js";
import { validateEditorTargets } from "./editor-boundary.js";
const kinds = [
  "document",
  "tokens",
  "comment",
  "room",
  "cache",
  "artifact",
  "recovery",
];
function target(brandId) {
  return {
    id: `target_${brandId}`,
    organizationId: "org_default",
    brandId,
    adapter: "penpot",
    ownerPrincipal: `native_owner_${brandId}`,
    nativeProjectId: `project_${brandId}`,
    nativeRoomId: `room_${brandId}`,
    nativeDocumentVersion: "1",
    nativeVersionKind: "archive",
    editorVersion: "2.18.3",
    resources: kinds.map((kind) => ({
      id: kind,
      kind,
      nativeId:
        kind === "room" ? `room_${brandId}` : `native_${brandId}_${kind}`,
      nativeParentId: `project_${brandId}`,
    })),
  };
}
async function fixture(t) {
  const store = new DurableStore(":memory:");
  const calls = [];
  let now = 100000;
  const transport = {
    validateCommand({ command }) {
      if (command !== undefined)
        throw new Error("This test adapter accepts no commands");
    },
    async execute(input) {
      calls.push(input);
      return { boundaryTestOnly: true, resourceId: input.resource.id };
    },
  };
  const platform = createPlatform({
    store,
    authMode: "password",
    editorTargets: [target("brand_default"), target("brand_vedic")],
    editorTransport: transport,
    editorNow: () => now,
  });
  await platform.identity.provision({
    username: "founder",
    password: "editor-boundary-test-password",
    role: "founder",
  });
  await platform.identity.provision({
    username: "marketer",
    password: "editor-boundary-test-password",
    role: "marketer",
  });
  await platform.ready;
  const users = (await store.get("identity")).users;
  const founder = users.find((user) => user.username === "founder");
  const marketer = users.find((user) => user.username === "marketer");
  const server = createHttpServer(null, {
    platform,
    editorBoundaryEnabled: true,
  });
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  t.after(async () => {
    await new Promise((resolve) => server.close(resolve));
    store.close();
  });
  const base = `http://127.0.0.1:${server.address().port}`;
  const cookies = {};
  async function api(
    actor,
    path = "",
    body,
    brand = "brand_default",
    extraHeaders = {},
    org = "org_default",
  ) {
    const response = await fetch(
      `${base}/api/studio/editor-bindings${path}?organizationId=${org}&brandId=${brand}`,
      {
        method: body === undefined ? "GET" : "POST",
        headers: {
          "Content-Type": "application/json",
          ...(cookies[actor] ? { Cookie: cookies[actor] } : {}),
          ...extraHeaders,
        },
        body: body === undefined ? undefined : JSON.stringify(body),
      },
    );
    return response;
  }
  for (const actor of ["founder", "marketer"]) {
    const response = await fetch(base + "/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: actor,
        password: "editor-boundary-test-password",
      }),
    });
    assert.equal(response.status, 200);
    cookies[actor] = response.headers.get("set-cookie").split(";")[0];
  }
  const register = async (brand = "brand_default") => {
    const r = await api("founder", "", { targetId: `target_${brand}` }, brand);
    assert.equal(r.status, 201);
    return r.json();
  };
  return {
    store,
    platform,
    founder,
    marketer,
    calls,
    transport,
    api,
    register,
    tick: (milliseconds) => (now += milliseconds),
    base,
    cookies,
  };
}
test("real authenticated HTTP binds operator-owned resources and denies forged owner/project/scope across two brands", async (t) => {
  const f = await fixture(t);
  assert.equal((await f.api("nobody")).status, 401);
  assert.equal(
    (await f.api("marketer", "", { targetId: "target_brand_default" })).status,
    403,
  );
  assert.equal(
    (
      await f.api("founder", "", {
        targetId: "target_brand_default",
        ownerPrincipal: "forged",
      })
    ).status,
    400,
  );
  assert.equal(
    (await f.api("founder", "", { targetId: "target_brand_vedic" })).status,
    403,
  );
  const a = await f.register(),
    b = await f.register("brand_vedic");
  for (const kind of kinds.filter((k) => k !== "room")) {
    const r = await f.api("marketer", `/${a.id}/operations`, {
      resourceId: kind,
      kind,
      action:
        kind === "recovery"
          ? "recover"
          : kind === "artifact"
            ? "export"
            : "read",
    });
    assert.equal(r.status, 200);
  }
  assert.equal(f.calls.length, 6);
  assert.ok(
    f.calls.every(
      (call) =>
        call.binding.ownerPrincipal === "native_owner_brand_default" &&
        call.binding.nativeProjectId === "project_brand_default",
    ),
  );
  assert.equal(
    (
      await f.api("marketer", `/${a.id}/operations`, {
        resourceId: "document",
        kind: "document",
        action: "write",
        nativeId: "forged",
      })
    ).status,
    400,
  );
  assert.equal(
    (
      await f.api("marketer", `/${a.id}/operations`, {
        resourceId: "native_brand_vedic_document",
        kind: "document",
        action: "read",
      })
    ).status,
    404,
  );
  assert.equal(
    (
      await f.api(
        "marketer",
        `/${a.id}/operations`,
        { resourceId: "document", kind: "document", action: "read" },
        "brand_vedic",
      )
    ).status,
    404,
  );
  await f.api(
    "marketer",
    `/${b.id}/operations`,
    { resourceId: "cache", kind: "cache", action: "read" },
    "brand_vedic",
  );
  assert.notEqual(f.calls[0].cacheKey, f.calls.at(-1).cacheKey);
  const org = await f.platform.identity.createOrganization(
    f.founder,
    "Third tenant",
  );
  const brand = await f.platform.identity.createBrand(f.founder, {
    organizationId: org.id,
    name: "Third same preset",
    preset: "liquidity_desk",
  });
  assert.equal(
    (
      await f.api(
        "founder",
        `/${a.id}/operations`,
        { resourceId: "document", kind: "document", action: "read" },
        brand.id,
        {},
        org.id,
      )
    ).status,
    404,
  );
  await f.platform.identity.setMembership(f.founder, {
    userId: f.marketer.id,
    organizationId: "org_default",
    brandIds: ["brand_vedic"],
  });
  assert.equal(
    (
      await f.api("marketer", `/${a.id}/operations`, {
        resourceId: "document",
        kind: "document",
        action: "read",
      })
    ).status,
    403,
  );
  assert.equal((await f.api("founder", `/${a.id}/callbacks`, {})).status, 403);
  assert.equal(
    (await f.api("founder", `/${a.id}/public-share`, {})).status,
    403,
  );
});
test("actor-bound collaboration grants expire, reject replay/foreign actor and observe revocation", async (t) => {
  const f = await fixture(t);
  const binding = await f.register();
  assert.equal(
    (
      await f.api("marketer", `/${binding.id}/operations`, {
        resourceId: "room",
        kind: "room",
        action: "join",
      })
    ).status,
    403,
  );
  const grant = async (actor = "marketer", ttlSeconds = 60) => {
    const r = await f.api(actor, `/${binding.id}/room-grants`, {
      resourceId: "room",
      ttlSeconds,
    });
    assert.equal(r.status, 201);
    return r.json();
  };
  let g = await grant();
  assert.equal(
    (await f.api("founder", `/${binding.id}/room-join`, { token: g.token }))
      .status,
    403,
  );
  assert.equal(
    (await f.api("marketer", `/${binding.id}/room-join`, { token: g.token }))
      .status,
    200,
  );
  assert.equal(
    (await f.api("marketer", `/${binding.id}/room-join`, { token: g.token }))
      .status,
    403,
  );
  g = await grant("marketer", 1);
  f.tick(1001);
  assert.equal(
    (await f.api("marketer", `/${binding.id}/room-join`, { token: g.token }))
      .status,
    403,
  );
  g = await grant();
  await f.api("founder", `/${binding.id}/revoke`, {});
  assert.equal(
    (await f.api("marketer", `/${binding.id}/room-join`, { token: g.token }))
      .status,
    404,
  );
});
test("actual private bytes have immutable scope/hash/generation, one-use expiring delivery and no portable authorization", async (t) => {
  const f = await fixture(t);
  const binding = await f.register();
  const app = await f.platform.forScope({
    organizationId: "org_default",
    brandId: "brand_default",
  });
  const storyId = (await app.ports.repo.listBacklog())[0].id;
  await app.ports.repo.mutate((state) => {
    state.telemetry.traces.push({ traceId: "generation_1", storyId });
    return state;
  });
  const bytes = Buffer.from("Private generated fixture");
  const asset = await app.ports.repo.saveAsset({
    base64: bytes.toString("base64"),
    filename: "private.txt",
    contentType: "text/plain; charset=utf-8",
    generationId: "generation_1",
    storyId,
  });
  const input = {
    assetId: asset.id,
    expectedGenerationId: asset.generationId,
    expectedSha256: asset.sha256,
    ttlSeconds: 60,
  };
  const grant = async (patch = {}) =>
    f.api("marketer", `/${binding.id}/asset-grants`, { ...input, ...patch });
  assert.equal((await grant({ expectedGenerationId: "foreign" })).status, 409);
  assert.equal((await grant({ expectedSha256: "0".repeat(64) })).status, 409);
  const other = await f.platform.forScope({
    organizationId: "org_default",
    brandId: "brand_vedic",
  });
  const foreign = await other.ports.repo.saveAsset({
    base64: bytes.toString("base64"),
    filename: "foreign.txt",
    contentType: "text/plain; charset=utf-8",
    generationId: "generation_1",
  });
  assert.equal((await grant({ assetId: foreign.id })).status, 404);
  let response = await grant();
  assert.equal(response.status, 201);
  let g = await response.json();
  assert.equal(
    g.manifest.sha256,
    createHash("sha256").update(bytes).digest("hex"),
  );
  assert.equal(g.publicShare, false);
  const deliver = (actor) =>
    f.api(actor, `/${binding.id}/asset-delivery`, undefined, "brand_default", {
      "X-Editor-Asset-Grant": g.token,
    });
  assert.equal((await deliver("founder")).status, 403);
  response = await deliver("marketer");
  assert.equal(response.status, 200);
  assert.deepEqual(Buffer.from(await response.arrayBuffer()), bytes);
  assert.equal((await deliver("marketer")).status, 403);
  g = await (await grant({ ttlSeconds: 1 })).json();
  f.tick(1001);
  assert.equal((await deliver("marketer")).status, 403);
  g = await (await grant()).json();
  await f.platform.identity.setMembership(f.founder, {
    userId: f.marketer.id,
    organizationId: "org_default",
    brandIds: [],
  });
  assert.equal((await deliver("marketer")).status, 403);
  const bundle = await app.ports.repo.exportData();
  const portable = JSON.stringify(bundle);
  assert.equal(portable.includes(g.token), false);
  assert.equal(portable.includes("tokenHash"), false);
  assert.equal(portable.includes(binding.id), false);
  assert.equal(portable.includes(binding.ownerPrincipal), false);
  await other.ports.repo.importData(bundle, { remapScope: true });
  assert.equal(
    (
      await f.api(
        "founder",
        `/${binding.id}/operations`,
        { resourceId: "document", kind: "document", action: "read" },
        "brand_vedic",
      )
    ).status,
    404,
  );
  await f.platform.identity.setMembership(f.founder, {
    userId: f.marketer.id,
    organizationId: "org_default",
    brandIds: ["brand_default"],
  });
  await f.api("founder", `/${binding.id}/revoke`, {});
  assert.equal((await deliver("marketer")).status, 404);
});
test("operator registry refuses endpoints/credentials, malformed parents and duplicates; default transport fails closed", async (t) => {
  for (const patch of [
    { endpoint: "http://169.254.169.254" },
    { credentials: "secret" },
    { ownerPrincipal: "https://example.com" },
  ])
    assert.throws(() =>
      validateEditorTargets([{ ...target("brand_default"), ...patch }]),
    );
  const broken = target("brand_default");
  broken.resources[0].nativeParentId = "foreign_project";
  assert.throws(() => validateEditorTargets([broken]));
  assert.throws(() =>
    validateEditorTargets([target("brand_default"), target("brand_default")]),
  );
  const f = await fixture(t);
  const binding = await f.register();
  const app = await f.platform.forScope({
    organizationId: "org_default",
    brandId: "brand_default",
  });
  const { EditorBoundary } = await import("./editor-boundary.js");
  const boundary = new EditorBoundary({
    store: f.store,
    scope: { organizationId: "org_default", brandId: "brand_default" },
    identity: f.platform.identity,
    repo: app.ports.repo,
    targets: [target("brand_default")],
  });
  await assert.rejects(
    () =>
      boundary.execute(f.marketer, binding.id, {
        resourceId: "document",
        kind: "document",
        action: "read",
      }),
    /not configured/,
  );
  const changed = target("brand_default");
  changed.ownerPrincipal = "changed_owner";
  const newBoundary = new EditorBoundary({
    store: f.store,
    scope: { organizationId: "org_default", brandId: "brand_default" },
    identity: f.platform.identity,
    repo: app.ports.repo,
    targets: [changed],
  });
  await assert.rejects(
    () =>
      newBoundary.execute(f.marketer, binding.id, {
        resourceId: "document",
        kind: "document",
        action: "read",
      }),
    /target changed/,
  );
});

test("membership or binding revocation during asynchronous validation prevents dispatch", async (t) => {
  for (const revokeMembership of [true, false]) {
    const f = await fixture(t);
    const binding = await f.register();
    f.transport.validateCommand = async () => {
      if (revokeMembership) {
        await f.platform.identity.setMembership(f.founder, {
          userId: f.marketer.id,
          organizationId: "org_default",
          brandIds: [],
        });
      } else {
        const app = await f.platform.forScope({
          organizationId: "org_default",
          brandId: "brand_default",
        });
        await f.platform
          .editorBoundary(
            { organizationId: "org_default", brandId: "brand_default" },
            app.ports.repo,
          )
          .revoke(f.founder, binding.id);
      }
    };
    const response = await f.api("marketer", `/${binding.id}/operations`, {
      resourceId: "document",
      kind: "document",
      action: "write",
    });
    assert.equal(response.status, revokeMembership ? 403 : 404);
    assert.equal(f.calls.length, 0);
  }
});
