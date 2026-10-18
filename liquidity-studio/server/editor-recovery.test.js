import test from "node:test";
import http from 'node:http';
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { DurableStore } from "./storage.js";
import { createPlatform } from "./platform.js";
import { createHttpServer } from "./index.js";
import { editorRestoreStatus } from "./editor-recovery.js";
import { createEditorRestoreDestination } from "./editor-pack-service.js";
async function fixture(t) {
  const store = new DurableStore(":memory:");
  t.after(() => store.close());
  const platform = createPlatform({ store, authMode: "password" });
  await platform.ready;
  for (const [username, role] of [
    ["recovery-founder", "founder"],
    ["other-founder", "founder"],
    ["recovery-marketer", "marketer"],
  ])
    await platform.identity.provision({
      username,
      role,
      password: "disposable-recovery-password-390!",
    });
  const users = (await store.get("identity")).users,
    actor = users.find((user) => user.username === "recovery-founder");
  const scope = await platform.identity.authorize(
    actor,
    "org_default",
    "brand_default",
  );
  return { store, platform, actor, scope, users };
}
test("read-only status works under restore lock and exposes replay key only to original current founder", async (t) => {
  const f = await fixture(t),
    key = "scope:org_default:brand_default";
  await f.store.update(key, () => ({
    editorRestore: { id: "fixture-install", status: "installing" },
  }));
  const journal = {
    id: "fixture-install",
    status: "installing",
    actorId: f.actor.id,
    key: "private-request-key",
    packSha256: "a".repeat(64),
    identityHash: "PRIVATE",
    before: { secret: "PRIVATE" },
    plannedKeys: ["PRIVATE"],
    createdAt: new Date().toISOString(),
  };
  await f.store.update(
    "editor-restore:org_default:brand_default",
    () => journal,
  );
  const before = await f.store.get(key),
    owned = await editorRestoreStatus({ ...f, identity: f.platform.identity });
  assert.equal(owned.canRollback, true);
  assert.equal(owned.idempotencyKey, journal.key);
  assert.equal(owned.originalActor, true);
  assert.equal(JSON.stringify(owned).includes("PRIVATE"), false);
  assert.deepEqual(await f.store.get(key), before);
  const other = await editorRestoreStatus({
    ...f,
    identity: f.platform.identity,
    actor: f.users.find((user) => user.username === "other-founder"),
  });
  assert.equal(other.originalActor, false);
  assert.equal(other.idempotencyKey, undefined);
  assert.equal(other.canReplay, false);
  assert.equal(other.canRollback, true);
  await assert.rejects(
    editorRestoreStatus({
      ...f,
      identity: f.platform.identity,
      actor: f.users.find((user) => user.role === "marketer"),
    }),
    { status: 403 },
  );
  await f.store.update("identity", (state) => {
    state.memberships = state.memberships.filter(
      (row) => row.userId !== f.actor.id,
    );
    return state;
  });
  await assert.rejects(
    editorRestoreStatus({ ...f, identity: f.platform.identity }),
    { status: 403 },
  );
});
test("destination creation replays exact actor request, rejects drift and never clears a working brand", async (t) => {
  const f = await fixture(t),
    input = {
      store: f.store,
      identity: f.platform.identity,
      actor: f.actor,
      organizationId: "org_default",
      name: "Recovered private brand",
      preset: "liquidity_desk",
      idempotencyKey: randomUUID(),
    };
  const [first, concurrent] = await Promise.all([
    createEditorRestoreDestination(input),
    createEditorRestoreDestination(input),
  ]);
  assert.deepEqual(concurrent, first);
  await f.store.update(`scope:org_default:${first.brand.id}`, (state) => ({
    ...state,
    backlog: [{ id: "preserved-work" }],
  }));
  assert.deepEqual(await createEditorRestoreDestination(input), first);
  assert.equal(
    (await f.store.get(`scope:org_default:${first.brand.id}`)).backlog[0].id,
    "preserved-work",
  );
  await assert.rejects(
    createEditorRestoreDestination({ ...input, name: "Changed payload" }),
    { status: 409 },
  );
  await f.store.update(`editor-destinations:${f.actor.id}`, (state) => ({
    receipts: [
      ...state.receipts,
      ...Array.from({ length: 31 }, (_, i) => ({
        key: `bounded-${i}`,
        fingerprint: "x",
        result: first,
      })),
    ],
  }));
  await assert.rejects(
    createEditorRestoreDestination({ ...input, idempotencyKey: randomUUID() }),
    { status: 429 },
  );
  assert.deepEqual(await createEditorRestoreDestination(input), first);
});
test("HTTP status is founder scoped, feature gated and never initializes a missing repository", async (t) => {
  const f = await fixture(t),
    old = process.env.STUDIO_NATIVE_PORTABLE_ENABLED;
  process.env.STUDIO_NATIVE_PORTABLE_ENABLED = "true";
  t.after(() => {
    if (old === undefined) delete process.env.STUDIO_NATIVE_PORTABLE_ENABLED;
    else process.env.STUDIO_NATIVE_PORTABLE_ENABLED = old;
  });
  const server = createHttpServer(null, {
    platform: f.platform,
    nativeEditorEnabled: true,
  });
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  t.after(() => new Promise((resolve) => server.close(resolve)));
  const base = `http://127.0.0.1:${server.address().port}`,
    path =
      "/api/admin/editor-pack/status?organizationId=org_default&brandId=brand_default";
  assert.equal((await fetch(base + path)).status, 401);
  const login = async (username) =>
    (
      await fetch(base + "/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username,
          password: "disposable-recovery-password-390!",
        }),
      })
    ).headers
      .get("set-cookie")
      .split(";")[0];
  const founder = await login("recovery-founder"),
    marketer = await login("recovery-marketer");
  await f.store.delete("scope:org_default:brand_default");
  assert.equal(
    (await fetch(base + path, { headers: { Cookie: founder } })).status,
    200,
  );
  assert.equal(await f.store.get("scope:org_default:brand_default"), null);
  assert.equal(
    (await fetch(base + path, { headers: { Cookie: marketer } })).status,
    403,
  );
  assert.equal(
    (
      await fetch(base + path.replace("brand_default", "foreign-brand"), {
        headers: { Cookie: founder },
      })
    ).status,
    403,
  );
  process.env.STUDIO_NATIVE_PORTABLE_ENABLED = "false";
  assert.equal(
    (await fetch(base + path, { headers: { Cookie: founder } })).status,
    404,
  );
});


test('status remains available while another portable request occupies admission',async t=>{
 const f=await fixture(t),old=process.env.STUDIO_NATIVE_PORTABLE_ENABLED;process.env.STUDIO_NATIVE_PORTABLE_ENABLED='true';t.after(()=>{if(old===undefined)delete process.env.STUDIO_NATIVE_PORTABLE_ENABLED;else process.env.STUDIO_NATIVE_PORTABLE_ENABLED=old;});
 const server=createHttpServer(null,{platform:f.platform,nativeEditorEnabled:true});await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));t.after(()=>{server.closeAllConnections();return new Promise(resolve=>server.close(resolve));});
 const base=`http://127.0.0.1:${server.address().port}`,login=await fetch(base+'/api/auth/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({username:'recovery-founder',password:'disposable-recovery-password-390!'})}),cookie=login.headers.get('set-cookie').split(';')[0];
 let inbound;server.on('request',req=>{if(req.method==='POST'&&req.url.includes('/editor-pack/install'))inbound=req;});
 const held=http.request(base+'/api/admin/editor-pack/install?organizationId=org_default&brandId=brand_default',{method:'POST',headers:{Cookie:cookie,'Content-Type':'application/json','Content-Length':'100'}});held.on('error',()=>{});held.write('{');t.after(()=>held.destroy());
 for(let i=0;i<100&&!(inbound?.listenerCount('data')>0);i++)await new Promise(resolve=>setTimeout(resolve,5));assert.ok(inbound?.listenerCount('data')>0);
 const response=await fetch(base+'/api/admin/editor-pack/status?organizationId=org_default&brandId=brand_default',{headers:{Cookie:cookie}});assert.equal(response.status,200);assert.equal((await response.json()).status,'empty');
 held.destroy();
});
