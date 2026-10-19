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
  const record = { id: "a".repeat(36), revision: 1, origin: { generationId: "captured-generation" }, document: { pages: [] } };
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

test("ambiguous cutout upload retains the exact output and key without another inference", async () => {
  const bodies = [];
  const adapter = createNativeEditorAdapter({
    scopeKey: "A",
    getScopeKey: () => "A",
    record: { id: crypto.randomUUID(), revision: 1 },
    request: async (path, options) => {
      bodies.push(JSON.parse(options.body));
      if (bodies.length === 1)
        throw Object.assign(Error("Unavailable"), { status: 503 });
      return { id: "f".repeat(32), width: 32, height: 32, name: "Cutout" };
    },
  });
  const output = new Blob(["fixture"], { type: "image/png" }),
    intent = { id: "e".repeat(32), inputAssetId: "a".repeat(32) };
  adapter.retainCutoutOutput(output, intent);
  await assert.rejects(adapter.uploadAsset(output), { status: 503 });
  assert.equal(adapter.getCutoutRetry(intent.inputAssetId), output);
  assert.throws(
    () => adapter.getCutoutRetry("b".repeat(32)),
    /uncertain result/,
  );
  await adapter.uploadAsset(output);
  assert.deepEqual(bodies[0], bodies[1]);
  assert.equal(adapter.getCutoutRetry(intent.inputAssetId), null);
  adapter.dispose();
});

test("broker supplies captured library context and rejects a mismatched asset response", async () => {
  const f = fixture(async () => ({ manifest: { schemaVersion: 1, usage: { documentId: "foreign", nativeRevision: 1, generationId: "captured-generation" } } }));
  await f.message({ operation: "asset.read", payload: { id: "b".repeat(32) } });
  assert.equal(f.calls[0][0], `/api/studio/native-editor/assets/${"b".repeat(32)}/resolve`);
  assert.deepEqual(JSON.parse(f.calls[0][1].body), { intent: "library-preview", documentId: "a".repeat(36), expectedNativeRevision: 1, generationId: "captured-generation" });
  assert.equal(f.sent.at(-1).data.error.code, "REQUEST_CONTEXT_CHANGED");
  f.broker.dispose();
});

test('existing broker carries typed audio library requests without mixing image assets',async()=>{
 const f=fixture(async()=>({count:0,results:[]}));await f.message({operation:'asset.list',payload:{kind:'audio'}});assert.equal(f.calls[0][0],'/api/studio/native-editor/assets?kind=audio');await f.message({operation:'asset.list',payload:{kind:'audio',path:'/arbitrary'}});assert.equal(f.calls.length,1);f.broker.dispose();
});
test('audio adapter uploads exact PCM, returns a native-playable scoped path and resolves verified bytes',async()=>{
 const {pcmWav}=await import('../tests/fixtures/native-audio.js'),{createHash}=await import('node:crypto'),bytes=pcmWav(),asset={id:'c'.repeat(32),kind:'audio',contentType:'audio/wav',name:'Original tone',width:0,height:0,durationMs:30000,sha256:createHash('sha256').update(bytes).digest('hex'),base64:bytes.toString('base64')},calls=[];
 const adapter=createNativeEditorAdapter({scopeKey:'A',getScopeKey:()=> 'A',record:{id:crypto.randomUUID(),revision:1},getAssetPolicy:()=>({rightsDeclaration:'Original generated signal',consent:'not_personal_data'}),request:async(path,options)=>{calls.push({path,body:options?.body?JSON.parse(options.body):null});return asset;}});
 const ref=await adapter.uploadAsset(new File([bytes],'original.wav',{type:'audio/wav'}));assert.equal(ref.kind,'audio');assert.equal(ref.url,'/__studio_native_audio/'+asset.id);assert.equal(calls[0].body.base64,bytes.toString('base64'));assert.equal(calls[0].body.contentType,'audio/wav');assert.equal(calls[0].path,'/api/studio/native-editor/assets?kind=audio');assert.match(await adapter.resolveSrc(ref.url),/^blob:/);
 await adapter.services.assets.list({kind:'audio'});assert.equal(calls.at(-1).path,'/api/studio/native-editor/assets?kind=audio');await assert.rejects(adapter.uploadAsset(new File([bytes],'unsupported.mp3',{type:'audio/mpeg'})),/PCM WAV/);adapter.dispose();
});

test('broker admits professional PCM upload envelope while image messages retain the original cap',async()=>{
 const f=fixture(async()=>({id:'a'.repeat(32),kind:'audio'})),payload={contentType:'audio/wav',base64:'A'.repeat(8*1024*1024)};
 await f.message({operation:'asset.upload',payload});assert.equal(f.calls.length,1);assert.equal(f.calls[0][0],'/api/studio/native-editor/assets?kind=audio');
 await f.message({operation:'asset.upload',payload:{...payload,contentType:'image/png'}});assert.equal(f.calls.length,1);assert.equal(f.sent.at(-1).data.error.status,400);f.broker.dispose();
});
test("broker routes the actual hundredth model chunk and rejects index 100", async () => {
  const f=fixture(async path=>({index:99,path}));
  try {
    await f.message({operation:'cutout.chunk',payload:{index:99}});
    await tick();
    assert.equal(f.calls.length,1);
    assert.equal(f.calls[0][0],'/api/studio/native-editor/cutout/model/99');
    await f.message({operation:'cutout.chunk',payload:{index:100}});
    await tick();
    assert.equal(f.calls.length,1);
    assert.equal(f.sent.at(-1).data.error.status,400);
  } finally { f.broker.dispose(); }
});
