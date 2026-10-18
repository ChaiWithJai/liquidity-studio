import test from "node:test";
import assert from "node:assert/strict";
import http from "node:http";
import { createPlatform } from "./platform.js";
import { DurableStore } from "./storage.js";
import { createHttpServer } from "./index.js";
import { EditorPackService } from "./editor-pack-service.js";
const query = "organizationId=org_default&brandId=brand_default";
const deferred = () => {
  let resolve;
  const promise = new Promise((r) => (resolve = r));
  return { promise, resolve };
};
async function until(predicate) {
  const end = Date.now() + 3000;
  while (!predicate()) {
    assert(Date.now() < end, "condition did not settle");
    await new Promise((r) => setTimeout(r, 5));
  }
}
async function fixture(t, options = {}) {
  const previous = process.env.STUDIO_NATIVE_PORTABLE_ENABLED;
  process.env.STUDIO_NATIVE_PORTABLE_ENABLED = "true";
  const store = new DurableStore(":memory:");
  const platform = createPlatform({ store, authMode: "password" });
  await platform.ready;
  const password = "test-only-pack-admission-password";
  await platform.identity.provision({
    username: "admission-founder",
    password,
    role: "founder",
  });
  await platform.identity.provision({
    username: "admission-marketer",
    password,
    role: "marketer",
  });
  const server = createHttpServer(null, {
    platform,
    nativeEditorEnabled: true,
    ...options,
  });
  const inbound = [];
  const responses = [];
  server.on("request", (req, res) => {
    if (req.url.startsWith("/api/admin/editor-pack/")) {
      inbound.push(req);
      responses.push(res);
      res.on("newListener", (event, listener) => {
        if (event === "close" && listener.name === "responseFinished")
          res.testPortableClose = listener;
      });
    }
  });
  await new Promise((r) => server.listen(0, "127.0.0.1", r));
  const base = `http://127.0.0.1:${server.address().port}`;
  t.after(async () => {
    server.closeAllConnections();
    await new Promise((r) => server.close(r));
    store.close();
    if (previous === undefined)
      delete process.env.STUDIO_NATIVE_PORTABLE_ENABLED;
    else process.env.STUDIO_NATIVE_PORTABLE_ENABLED = previous;
  });
  const login = async (username) => {
    const response = await fetch(`${base}/api/auth/login`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    assert.equal(response.status, 200);
    return response.headers.get("set-cookie").split(";")[0];
  };
  const cookie = await login("admission-founder");
  const request = (path, { body, cookie: actorCookie = cookie } = {}) =>
    fetch(`${base}${path}`, {
      method: body ? "POST" : "GET",
      headers: { cookie: actorCookie, "content-type": "application/json" },
      body: body ? JSON.stringify(body) : undefined,
    });
  const held = (path, c = cookie) => {
    const response = deferred();
    const req = http.request(
      `${base}${path}`,
      {
        method: "POST",
        headers: { cookie: c, "content-type": "application/json" },
      },
      (res) => {
        res.resume();
        res.on("end", () =>
          response.resolve({ status: res.statusCode, headers: res.headers }),
        );
      },
    );
    req.on("error", () => {});
    req.write("{");
    return { req, response: response.promise };
  };
  return {
    server,
    platform,
    store,
    inbound,
    responses,
    request,
    held,
    login,
    base,
  };
}
test("one pack body reader; overlap429 precedes buffering; abort releases and same install key succeeds", async (t) => {
  const f = await fixture(t);
  const exported = await f.request(`/api/admin/editor-pack/export?${query}`);
  assert.equal(exported.status, 200);
  const pack = await exported.json();
  const destination = await f.request("/api/admin/editor-pack/destinations", {
    body: {
      organizationId: "org_default",
      name: "Admission destination",
      preset: "liquidity_desk",
    },
  });
  assert.equal(destination.status, 201);
  const { scope } = await destination.json();
  const owner = (await f.store.get("identity")).users.find(
    (x) => x.username === "admission-founder",
  );
  const endpoint = `/api/admin/editor-pack/install?organizationId=org_default&brandId=${scope.brandId}`;
  const body = {
    pack,
    options: {
      target: { organizationId: scope.organizationId, brandId: scope.brandId },
      principalRemap: { [owner.id]: owner.id },
      sourceReviewAcknowledged: true,
      idempotencyKey: "admission_same_intent_after_capacity",
    },
  };
  const before = f.inbound.length;
  const held = f.held(endpoint);
  await until(
    () =>
      f.inbound.length === before + 1 &&
      f.inbound.at(-1)?.listenerCount("data") > 0,
  );
  const first = f.inbound.at(-1);
  const rejected = await f.request(endpoint, { body });
  assert.equal(rejected.status, 429);
  assert.equal(rejected.headers.get("retry-after"), "1");
  assert.equal(
    f.inbound.at(-1).listenerCount("data"),
    0,
    "rejected upload must never enter JSON buffering",
  );
  assert.equal(
    (await f.request("/api/auth/session")).status,
    200,
    "ordinary authenticated routes remain available",
  );
  held.req.destroy();
  await until(() => first.aborted);
  // An ordinary completed response after abort proves the finally-released slot is available.
  await until(() => first.listenerCount("aborted") > 0);
  const result = await f.request(endpoint, { body });
  assert.equal(result.status, 200, await result.clone().text());
  const installed = await result.json();
  assert.equal(installed.restored, true);
  const replay = await f.request(endpoint, { body });
  assert.equal(replay.status, 200);
  assert.deepEqual(await replay.json(), installed);
});
test("export shares admission; disconnect does not release while server work is active; failures release", async (t) => {
  const f = await fixture(t);
  const original = EditorPackService.prototype.export;
  const entered = deferred(),
    release = deferred();
  let exportCalls = 0;
  EditorPackService.prototype.export = async function (actor) {
    if (++exportCalls > 1) return original.call(this, actor);
    entered.resolve();
    await release.promise;
    throw Object.assign(new Error("Controlled export failure"), {
      status: 422,
    });
  };
  t.after(() => {
    EditorPackService.prototype.export = original;
    release.resolve();
  });
  const request = http.get(
    `${f.base}/api/admin/editor-pack/export?${query}`,
    { headers: { cookie: await f.login("admission-founder") } },
    (res) => res.resume(),
  );
  request.on("error", () => {});
  await entered.promise;
  const denied = await f.request(`/api/admin/editor-pack/export?${query}`);
  assert.equal(denied.status, 429);
  request.destroy();
  const stillDenied = await f.request(`/api/admin/editor-pack/export?${query}`);
  assert.equal(
    stillDenied.status,
    429,
    "client disconnect must not admit another operation before work settles",
  );
  release.resolve();
  await new Promise((r) => setImmediate(r));
  EditorPackService.prototype.export = original;
  const next = await f.request(`/api/admin/editor-pack/export?${query}`);
  assert.equal(next.status, 200, await next.clone().text());
  const malformed = await f.request(`/api/admin/editor-pack/install?${query}`, {
    body: { unexpected: true },
  });
  assert.equal(malformed.status, 400);
  assert.equal(
    (await f.request(`/api/admin/editor-pack/export?${query}`)).status,
    200,
  );
  const marketer = await f.login("admission-marketer");
  const unauthorized = f.held(
    `/api/admin/editor-pack/install?${query}`,
    marketer,
  );
  assert.equal((await unauthorized.response).status, 403);
  assert.equal(f.inbound.at(-1).listenerCount("data"), 0);
  unauthorized.req.destroy();
});

test("pack slot remains held until the HTTP response finishes, after service work returns", async (t) => {
  const f = await fixture(t);
  const endReached = deferred(),
    release = deferred();
  let held = false;
  f.server.prependListener("request", (req, res) => {
    if (!held && req.url === `/api/admin/editor-pack/export?${query}`) {
      held = true;
      const end = res.end.bind(res);
      res.end = (...args) => {
        endReached.resolve();
        release.promise.then(() => end(...args));
        return res;
      };
    }
  });
  t.after(() => release.resolve());
  const first = f.request(`/api/admin/editor-pack/export?${query}`);
  await endReached.promise;
  assert.equal(
    (await f.request(`/api/admin/editor-pack/export?${query}`)).status,
    429,
  );
  release.resolve();
  const completed = await first;
  assert.equal(completed.status, 200);
  await completed.arrayBuffer();
  assert.equal(
    (await f.request(`/api/admin/editor-pack/export?${query}`)).status,
    200,
  );
});

test("body deadline releases admission; authorization and route checks precede collection", async (t) => {
  const f = await fixture(t, { portableBodyTimeoutMs: 80 });
  const held = f.held(`/api/admin/editor-pack/install?${query}`);
  const timeout = await held.response;
  assert.equal(timeout.status, 408);
  held.req.destroy();
  assert.equal(
    (await f.request(`/api/admin/editor-pack/export?${query}`)).status,
    200,
  );
  for (const [path, status] of [
    [
      "/api/admin/editor-pack/install?organizationId=foreign&brandId=foreign",
      403,
    ],
    [`/api/admin/editor-pack/unknown?${query}`, 404],
    [`/api/admin/editor-pack/export?${query}`, 404],
  ]) {
    const rejected = f.held(path);
    assert.equal((await rejected.response).status, status);
    assert.equal(f.inbound.at(-1).listenerCount("data"), 0);
    rejected.req.destroy();
  }
  const old = process.env.STUDIO_NATIVE_PORTABLE_ENABLED;
  process.env.STUDIO_NATIVE_PORTABLE_ENABLED = "false";
  try {
    const disabled = f.held(`/api/admin/editor-pack/install?${query}`);
    assert.equal((await disabled.response).status, 404);
    assert.equal(f.inbound.at(-1).listenerCount("data"), 0);
    disabled.req.destroy();
  } finally {
    process.env.STUDIO_NATIVE_PORTABLE_ENABLED = old;
  }
  assert.throws(
    () =>
      createHttpServer(null, {
        platform: f.platform,
        portableBodyTimeoutMs: 15001,
      }),
    /deadline/,
  );
});

test("duplicate completion/close cannot release a later request admission", async (t) => {
  const f = await fixture(t);
  const old = await f.request(`/api/admin/editor-pack/export?${query}`);
  assert.equal(old.status, 200);
  await old.arrayBuffer();
  const priorResponse = f.responses.at(-1);
  const count = f.inbound.length;
  const held = f.held(`/api/admin/editor-pack/install?${query}`);
  await until(
    () =>
      f.inbound.length === count + 1 &&
      f.inbound.at(-1).listenerCount("data") > 0,
  );
  // Exercise our late close callback only, without replaying Node's socket teardown.
  const lateClose = priorResponse.testPortableClose;
  assert.equal(typeof lateClose, "function");
  lateClose();
  lateClose();
  assert.equal(
    (await f.request(`/api/admin/editor-pack/export?${query}`)).status,
    429,
  );
  held.req.destroy();
});
