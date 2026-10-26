import test from "node:test";
import assert from "node:assert/strict";
import { DurableStore } from "./storage.js";
import { IdentityService } from "./auth.js";
import {
  GoogleIdentityService,
  googleAuthConfiguration,
} from "./google-auth.js";
import { createPlatform } from "./platform.js";
import { createHttpServer } from "./index.js";
const env = {
  STUDIO_FIREBASE_PROJECT_ID: "test-studio-project",
  STUDIO_FIREBASE_API_KEY: "public-key",
  STUDIO_FIREBASE_AUTH_DOMAIN: "test-studio-project.firebaseapp.com",
  STUDIO_FIREBASE_APP_ID: "public-app",
  STUDIO_GOOGLE_FOUNDER_EMAIL: "founder@example.com",
  STUDIO_GOOGLE_MARKETER_EMAIL: "marketer@example.com",
};
const configuration = googleAuthConfiguration(env);
function valid(email = "founder@example.com") {
  return {
    aud: env.STUDIO_FIREBASE_PROJECT_ID,
    iss: `https://securetoken.google.com/${env.STUDIO_FIREBASE_PROJECT_ID}`,
    sub: "google-user",
    iat: Math.floor(Date.now() / 1000) - 5,
    exp: Math.floor(Date.now() / 1000) + 3600,
    email,
    email_verified: true,
    firebase: { sign_in_provider: "google.com" },
  };
}
test("Google migration preserves authorization IDs but destroys application credentials", async (t) => {
  const store = new DurableStore(":memory:");
  t.after(() => store.close());
  const legacy = new IdentityService(store);
  await legacy.provision({
    username: "founder",
    password: "test-password-long",
    role: "founder",
  });
  await legacy.provision({
    username: "marketer",
    password: "test-password-long",
    role: "marketer",
  });
  const login = await legacy.login("founder", "test-password-long");
  await store.update("login:founder", () => ({ count: 1 }));
  const before = await store.get("identity");
  const identity = new GoogleIdentityService(store, {
    configuration,
    verifyIdToken: async (token, revoked) => {
      assert.equal(revoked, true);
      return valid();
    },
  });
  await identity.ready;
  const after = await store.get("identity");
  assert.deepEqual(after.memberships, before.memberships);
  assert.deepEqual(after.organizations, before.organizations);
  assert.deepEqual(
    after.users.map((u) => u.id),
    before.users.map((u) => u.id),
  );
  assert.deepEqual(await store.keys("session:"), []);
  assert.deepEqual(await store.keys("login:"), []);
  assert.ok(
    !JSON.stringify(after).match(/passwordHash|salt|authVersion|sessionToken/),
  );
  const user = await identity.authenticate("verified-test-adapter");
  assert.equal(user.id, login.user.id);
  assert.equal((await identity.organizations(user))[0].brands.length, 2);
  await assert.rejects(identity.login(), { status: 405 });
  await assert.rejects(identity.rotatePassword(), { status: 405 });
  await assert.rejects(identity.provision(), { status: 405 });
  assert.equal(await legacy.authenticate(login.token), null);
  assert.equal(await legacy.login("founder", "test-password-long"), null);
});
test("Google policy rejects invalid identities and always checks revoked or disabled accounts", async (t) => {
  const store = new DurableStore(":memory:");
  t.after(() => store.close());
  let claims = valid();
  let revokedArg;
  const identity = new GoogleIdentityService(store, {
    configuration,
    verifyIdToken: async (token, revoked) => {
      revokedArg = revoked;
      if (["revoked", "disabled", "bad-signature"].includes(token))
        throw Error("SDK rejection");
      return claims;
    },
  });
  await identity.ready;
  assert.equal((await identity.authenticate("accepted")).role, "founder");
  assert.equal(revokedArg, true);
  for (const patch of [
    { aud: "another-project" },
    { iss: "https://attacker.test" },
    { exp: 0 },
    { exp: NaN },
    { iat: Date.now() / 1000 + 3600 },
    { sub: "" },
    { email_verified: false },
    { email: "attacker@example.com" },
    { firebase: { sign_in_provider: "password" } },
    { firebase: { sign_in_provider: "custom" } },
  ]) {
    claims = { ...valid(), ...patch };
    assert.equal(
      await identity.authenticate("rejected"),
      null,
      JSON.stringify(patch),
    );
  }
  claims = valid("marketer@example.com");
  assert.equal((await identity.authenticate("marketer")).role, "marketer");
  for (const token of [
    "revoked",
    "disabled",
    "bad-signature",
    null,
    "x".repeat(16385),
  ])
    assert.equal(await identity.authenticate(token), null);
  assert.deepEqual(await store.keys("session:"), []);
});
test("Google HTTP is bearer only, config is public, password login disabled and scope authorized", async (t) => {
  const store = new DurableStore(":memory:");
  let calls = 0;
  const platform = createPlatform({
    store,
    authMode: "google",
    googleAuth: {
      configuration,
      verifyIdToken: async (token) => {
        calls++;
        if (token !== "test-accepted-token") throw Error("invalid");
        return valid();
      },
    },
  });
  await platform.ready;
  const server = createHttpServer(null, { platform });
  await new Promise((r) => server.listen(0, "127.0.0.1", r));
  t.after(async () => {
    await new Promise((r) => server.close(r));
    store.close();
  });
  const base = `http://127.0.0.1:${server.address().port}`;
  const headers = { Authorization: "Bearer test-accepted-token" };
  assert.deepEqual(await (await fetch(base + "/api/auth/config")).json(), {
    mode: "google",
    remoteEvidenceEnabled: false,
    firebase: configuration.firebase,
  });
  assert.equal(calls, 0);
  assert.equal(
    (
      await fetch(base + "/api/auth/session", {
        headers: { Cookie: "studio_session=test-accepted-token" },
      })
    ).status,
    401,
  );
  const session = await fetch(base + "/api/auth/session", { headers });
  assert.equal(session.status, 200);
  assert.equal(session.headers.get("set-cookie"), null);
  assert.equal((await session.json()).user.role, "founder");
  assert.equal(
    (
      await fetch(
        base +
          "/api/studio/bootstrap?organizationId=foreign&brandId=brand_default",
        { headers },
      )
    ).status,
    403,
  );
  assert.equal(
    (
      await fetch(base + "/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: "{}",
      })
    ).status,
    405,
  );
  const logout = await fetch(base + "/api/auth/logout", {
    method: "POST",
    headers,
  });
  assert.equal(logout.status, 200);
  assert.equal(logout.headers.get("set-cookie"), null);
  assert.deepEqual(await store.keys("session:"), []);
});
test("Auth emulator is restricted to explicit loopback development", () => {
  for (const patch of [
    { FIREBASE_AUTH_EMULATOR_HOST: "127.0.0.1:9099" },
    {
      STUDIO_AUTH_EMULATOR_ENABLED: "true",
      FIREBASE_AUTH_EMULATOR_HOST: "public.test:9099",
    },
    {
      STUDIO_AUTH_EMULATOR_ENABLED: "true",
      FIREBASE_AUTH_EMULATOR_HOST: "127.0.0.1:9099",
      K_SERVICE: "studio",
    },
    {
      STUDIO_AUTH_EMULATOR_ENABLED: "true",
      FIREBASE_AUTH_EMULATOR_HOST: "127.0.0.1:9099",
      NODE_ENV: "production",
    },
    { STUDIO_GOOGLE_MARKETER_EMAIL: env.STUDIO_GOOGLE_FOUNDER_EMAIL },
  ])
    assert.throws(() => googleAuthConfiguration({ ...env, ...patch }));
  assert.deepEqual(
    googleAuthConfiguration({
      ...env,
      STUDIO_AUTH_EMULATOR_ENABLED: "true",
      FIREBASE_AUTH_EMULATOR_HOST: "127.0.0.1:9099",
    }).emulator,
    { url: "http://127.0.0.1:9099" },
  );
});

test("real Firebase Admin SDK rejects unsigned or malformed production tokens without a test verifier", async (t) => {
  const store = new DurableStore(":memory:");
  t.after(() => store.close());
  const identity = new GoogleIdentityService(store, { configuration });
  await identity.ready;
  assert.equal(await identity.authenticate("not.a.jwt"), null);
  const encode = (value) =>
    Buffer.from(JSON.stringify(value)).toString("base64url");
  const unsigned = `${encode({ alg: "none", typ: "JWT" })}.${encode(valid())}.`;
  assert.equal(await identity.authenticate(unsigned), null);
  assert.deepEqual(await store.keys("session:"), []);
});

test("unconfigured default Google mode fails readiness and API safely while liveness stays independent", async (t) => {
  const store = new DurableStore(":memory:");
  const platform = createPlatform({
    store,
    googleAuth: { configuration: null },
  });
  await assert.rejects(platform.ready);
  const server = createHttpServer(null, { platform });
  await new Promise((r) => server.listen(0, "127.0.0.1", r));
  t.after(async () => {
    await new Promise((r) => server.close(r));
    store.close();
  });
  const base = `http://127.0.0.1:${server.address().port}`;
  assert.equal((await fetch(base + "/healthz")).status, 200);
  assert.equal((await fetch(base + "/readyz")).status, 503);
  assert.ok((await fetch(base + "/api/auth/config")).status >= 500);
});
test("walk-away jobs revalidate the current managed Google principal without persisting bearer credentials", async (t) => {
  const store = new DurableStore(":memory:");
  t.after(() => store.close());
  let managed = {
    email: "founder@example.com",
    emailVerified: true,
    disabled: false,
    providerData: [{ providerId: "google.com" }],
    tokensValidAfterTime: "1970-01-01T00:00:00Z",
  };
  const identity = new GoogleIdentityService(store, {
    configuration,
    lookupJobUser: async () => managed,
  });
  await identity.ready;
  const user = (await store.get("identity")).users.find(
    (user) => user.email === "founder@example.com",
  );
  const approvedAt = "2026-10-17T00:00:00Z";
  assert.equal(
    (await identity.authorizeJobActor(user.id, approvedAt)).id,
    user.id,
  );
  managed = { ...managed, disabled: true };
  await assert.rejects(identity.authorizeJobActor(user.id, approvedAt), {
    status: 403,
  });
  managed = {
    ...managed,
    disabled: false,
    tokensValidAfterTime: "2026-10-18T00:00:00Z",
  };
  await assert.rejects(identity.authorizeJobActor(user.id, approvedAt), {
    status: 403,
  });
  assert.equal((await store.keys("session:")).length, 0);
  assert.equal(
    (await store.get("identity")).users.some((user) => user.passwordHash),
    false,
  );
});

test('embedding origins come only from the managed constructor provider, not request origin',async t=>{
 const store=new DurableStore(':memory:');
 const platform=createPlatform({store,authMode:'google',googleAuth:{configuration,verifyIdToken:async()=>valid()}});await platform.ready;
 const provider=async()=>null;
 provider.penpotEmbedding=Object.freeze({studioOrigin:'https://studio.example.com',nativeOrigin:'https://design.example.com'});
 const server=createHttpServer(null,{platform,managedPenpotStoryDesigns:provider});
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 t.after(async()=>{await new Promise(resolve=>server.close(resolve));store.close();});
 const response=await fetch(`http://127.0.0.1:${server.address().port}/api/auth/config`);
 assert.deepEqual((await response.json()).penpotEmbedding,provider.penpotEmbedding);
});

test("additional Google collaborators require explicit scoped membership and retain revocation across restarts", async (t) => {
  const store = new DurableStore(":memory:");
  t.after(() => store.close());
  const address = "collaborator@example.com";
  const expanded = googleAuthConfiguration({
    ...env,
    STUDIO_GOOGLE_ADDITIONAL_EMAILS: JSON.stringify([address]),
  });
  const open = (config) => new GoogleIdentityService(store, {
    configuration: config,
    verifyIdToken: async (token) => valid(token),
    lookupJobUser: async (email) => ({ uid: "managed-collaborator", email, emailVerified: true, disabled: false, providerData: [{ providerId: "google.com" }] }),
  });
  const original = open(configuration);
  await original.ready;
  const founder = await original.authenticate(env.STUDIO_GOOGLE_FOUNDER_EMAIL);
  const before = await store.get("identity");
  const organization = await original.createOrganization(founder, "Music catalog");
  const brand = await original.createBrand(founder, { organizationId: organization.id, name: "Catalog" });
  const otherBrand = await original.createBrand(founder, { organizationId: organization.id, name: "Other catalog" });
  const identity = open(expanded);
  await identity.ready;
  const member = await identity.authenticate(address);
  assert.equal(member.role, "marketer");
  assert.deepEqual(await identity.organizations(member), []);
  await assert.rejects(identity.authorize(member, "org_default", "brand_default"), { status: 403 });
  await assert.rejects(identity.createOrganization(member, "Not allowed"), { status: 403 });
  const after = await store.get("identity");
  assert.deepEqual(after.users.filter((user) => user.id !== member.id), before.users);
  assert.deepEqual(identity.publicConfiguration(), original.publicConfiguration());
  assert.ok(!JSON.stringify(identity.publicConfiguration()).includes(address));
  await identity.setMembership(founder, { userId: member.id, organizationId: organization.id, brandIds: [brand.id] });
  assert.equal((await identity.authorize(member, organization.id, brand.id)).brandId, brand.id);
  await assert.rejects(identity.authorize(member, organization.id, otherBrand.id), { status: 403 });
  const restarted = open(expanded);
  await restarted.ready;
  assert.equal((await restarted.authenticate(address)).id, member.id);
  assert.equal((await restarted.organizations(member))[0].brands.length, 1);
  // An older tagged revision can start against the shared database while this
  // expanded-config service remains alive. Its migration clears extra metadata.
  const older = open(configuration);
  await older.ready;
  const stripped = (await store.get("identity")).users.find((user) => user.id === member.id);
  assert.equal(stripped.email, undefined);
  assert.equal(stripped.authProvider, undefined);
  assert.equal((await restarted.authenticate(address)).id, member.id);
  assert.equal((await restarted.authorizeJobActor(member.id)).email, address);
  assert.equal(await older.authenticate(address), null);
  await restarted.authorize(member, organization.id, brand.id);
  await assert.rejects(restarted.authorize(member, organization.id, otherBrand.id), { status: 403 });
  for (const patch of [{ role: "founder" }, { username: "another@example.com" }]) {
    await store.update("identity", (state) => {
      Object.assign(state.users.find((user) => user.id === member.id), patch);
      return state;
    });
    assert.equal(await restarted.authenticate(address), null);
    await assert.rejects(restarted.authorizeJobActor(member.id), { status: 403 });
    await store.update("identity", (state) => {
      Object.assign(state.users.find((user) => user.id === member.id), { username: address, role: "marketer" });
      return state;
    });
  }
  await restarted.setMembership(founder, { userId: member.id, organizationId: organization.id, brandIds: [] });
  const olderAfterRevocation = open(configuration);
  await olderAfterRevocation.ready;
  await assert.rejects(restarted.authorize(member, organization.id, brand.id), { status: 403 });
  const revoked = open(expanded);
  await revoked.ready;
  await assert.rejects(revoked.authorize(member, organization.id, brand.id), { status: 403 });
  const removed = open(configuration);
  await removed.ready;
  assert.equal(await removed.authenticate(address), null);
  const restored = open(expanded);
  await restored.ready;
  assert.equal((await restored.authenticate(address)).id, member.id);
  await assert.rejects(restored.authorize(member, organization.id, brand.id), { status: 403 });
  assert.equal((await restored.authenticate(env.STUDIO_GOOGLE_FOUNDER_EMAIL)).id, founder.id);
  assert.ok(await restored.authenticate(env.STUDIO_GOOGLE_MARKETER_EMAIL));
});

test("additional Google configuration rejects duplicates, invalid lists, and legacy identity collisions", async (t) => {
  for (const value of ["", "not json", "null", "{}", "[null]", '["not-an-email"]',
    JSON.stringify(Array(101).fill("x@example.com")),
    JSON.stringify([env.STUDIO_GOOGLE_FOUNDER_EMAIL]),
    '["COLLABORATOR@example.com","collaborator@example.com"]',
  ]) assert.throws(() => googleAuthConfiguration({ ...env, STUDIO_GOOGLE_ADDITIONAL_EMAILS: value }));
  const store = new DurableStore(":memory:");
  t.after(() => store.close());
  const legacy = new IdentityService(store);
  await legacy.provision({ username: "collaborator@example.com", role: "marketer", password: "test-password-long" });
  const before = await store.get("identity");
  const identity = new GoogleIdentityService(store, {
    configuration: googleAuthConfiguration({ ...env, STUDIO_GOOGLE_ADDITIONAL_EMAILS: '["collaborator@example.com"]' }),
  });
  await assert.rejects(identity.ready, { status: 503 });
  assert.deepEqual(await store.get("identity"), before);
});
