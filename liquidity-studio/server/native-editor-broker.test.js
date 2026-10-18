import test from "node:test";
import assert from "node:assert/strict";
import { createNativeEditorBroker } from "../src/lib/native-editor-broker.js";
import { createNativeEditorAdapter } from "../src/lib/native-editor-adapter.js";
const tick = () => new Promise((resolve) => setImmediate(resolve));
function fixture(request = async () => ({ id: "a".repeat(36), revision: 2 })) {
  let handler,
    scope = "brandA";
  const sent = [],
    calls = [],
    saved = [];
  const hostWindow = {
    addEventListener: (_, callback) => {
      handler = callback;
    },
    removeEventListener: () => {
      handler = null;
    },
  };
  const frameWindow = {
    postMessage: (data, origin) => sent.push({ data, origin }),
  };
  const record = { id: "a".repeat(36), revision: 1 };
  const broker = createNativeEditorBroker({
    hostWindow,
    frameWindow,
    origin: "http://127.0.0.1:4000",
    request: async (...args) => {
      calls.push(args);
      return request(...args);
    },
    scopeKey: scope,
    getScopeKey: () => scope,
    record,
    onSaved: (value) => saved.push(value),
  });
  broker.initialize();
  const nonce = sent[0].data.nonce;
  const message = (data, overrides = {}) =>
    handler?.({
      source: frameWindow,
      origin: "http://127.0.0.1:4000",
      data: {
        nonce,
        type: "studio-native-request",
        requestId: crypto.randomUUID(),
        operation: "fonts",
        payload: null,
        ...data,
      },
      ...overrides,
    });
  return {
    broker,
    calls,
    sent,
    saved,
    nonce,
    message,
    changeScope: () => {
      scope = "brandB";
    },
  };
}
test("broker rejects foreign windows/origins/nonces and untyped paths before dispatch", async () => {
  const f = fixture();
  await f.message({}, { origin: "https://foreign.example" });
  await f.message({}, { source: {} });
  await f.message({ nonce: crypto.randomUUID() });
  await f.message({
    operation: "fetch",
    payload: { path: "/api/admin/import" },
  });
  assert.equal(f.calls.length, 0);
  assert.equal(f.sent.at(-1).data.error.status, 400);
  f.broker.dispose();
});
test("broker binds save to opening native ID/revision and safely replays lost frame responses", async () => {
  const f = fixture();
  const payload = {
    expectedRevision: 1,
    idempotencyKey: "same_native_save_key",
    title: "Proposal",
    document: {},
  };
  await f.message({ operation: "document.save", payload });
  await f.message({ operation: "document.save", payload });
  assert.equal(f.calls.length, 1);
  assert.match(
    f.calls[0][0],
    /documents\/aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa$/,
  );
  assert.equal(f.sent.at(-1).data.data.revision, 2);
  await f.message({
    operation: "document.save",
    payload: { ...payload, idempotencyKey: "different_native_save_key" },
  });
  assert.equal(f.calls.length, 1);
  assert.equal(f.sent.at(-1).data.error.status, 409);
  f.broker.dispose();
});
test("late scope response cannot notify a replacement editor or leak its data", async () => {
  let resolve;
  const f = fixture(
    () =>
      new Promise((done) => {
        resolve = done;
      }),
  );
  const request = f.message({
    operation: "document.save",
    payload: { expectedRevision: 1, idempotencyKey: "native_pending_save_key" },
  });
  await tick();
  f.changeScope();
  resolve({ id: "a".repeat(36), revision: 2 });
  await request;
  assert.equal(f.saved.length, 0);
  assert.equal(f.sent.length, 1);
  f.broker.dispose();
});
test("adapter preserves uncertain save intent and maps real409 to upstream conflict semantics", async () => {
  let scope = "A";
  let lost = true;
  const bodies = [];
  const adapter = createNativeEditorAdapter({
    request: async (_, options) => {
      bodies.push(JSON.parse(options.body));
      if (lost) throw new Error("Disconnected");
      return { revision: 2, updatedAt: new Date().toISOString() };
    },
    scopeKey: "A",
    getScopeKey: () => scope,
    record: { id: crypto.randomUUID(), revision: 1 },
  });
  const value = { document: { pages: [] }, title: "Opening proposal" };
  await assert.rejects(adapter.save(value));
  await assert.rejects(
    adapter.save({ ...value, title: "Different edit" }),
    /uncertain result/,
  );
  assert.equal(bodies.length, 1);
  lost = false;
  await adapter.save(value);
  assert.deepEqual(bodies[0], bodies[1]);
  scope = "B";
  await assert.rejects(adapter.save(value), {
    code: "REQUEST_CONTEXT_CHANGED",
  });
  assert.equal(bodies.length, 2);
  adapter.dispose();
  const conflict = createNativeEditorAdapter({
    request: async () => {
      throw Object.assign(new Error("Changed"), { status: 409 });
    },
    scopeKey: "A",
    getScopeKey: () => "A",
    record: { id: crypto.randomUUID(), revision: 1 },
  });
  await assert.rejects(conflict.save(value), { name: "RevisionConflictError" });
  conflict.dispose();
});
test("adapter retains identical save key after ambiguous HTTP5xx and rejects a different intent", async () => {
  const bodies = [];
  const adapter = createNativeEditorAdapter({
    request: async (_, options) => {
      bodies.push(JSON.parse(options.body));
      if (bodies.length === 1)
        throw Object.assign(new Error("Post-commit response unavailable"), {
          status: 503,
        });
      return { revision: 2, updatedAt: new Date().toISOString() };
    },
    scopeKey: "A",
    getScopeKey: () => "A",
    record: { id: crypto.randomUUID(), revision: 1 },
  });
  const value = { document: { pages: [] }, title: "Same reviewed save" };
  await assert.rejects(adapter.save(value), { status: 503 });
  await assert.rejects(
    adapter.save({ ...value, title: "Another save" }),
    /uncertain result/,
  );
  await adapter.save(value);
  assert.deepEqual(bodies[0], bodies[1]);
  adapter.dispose();
});
