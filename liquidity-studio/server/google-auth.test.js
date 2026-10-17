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
