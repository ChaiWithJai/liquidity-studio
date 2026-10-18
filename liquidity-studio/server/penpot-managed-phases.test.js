import test from "node:test";
import assert from "node:assert/strict";
import { DurableStore } from "./storage.js";
import { GoogleIdentityService } from "./google-auth.js";
import { createPenpotMediaAuthorizer } from "./penpot-media-authorization.js";

// Constructor-only provider/native fakes exercise request isolation and real
// local authorization checks. They are not managed Google/native runtime proof.
async function fixture(t) {
  const store = new DurableStore(":memory:");
  t.after(() => store.close());
  let managed = {
    email: "founder@example.com",
    emailVerified: true,
    disabled: false,
    providerData: [{ providerId: "google.com" }],
    tokensValidAfterTime: "1970-01-01",
  };
  let calls = 0,
    fail = false;
  const identity = new GoogleIdentityService(store, {
    configuration: {
      firebase: { projectId: "fixture-project" },
      principals: [
        { role: "founder", email: "founder@example.com", username: "founder" },
        {
          role: "marketer",
          email: "marketer@example.com",
          username: "marketer",
        },
      ],
    },
    lookupJobUser: async () => {
      calls++;
      await Promise.resolve();
      if (fail) throw Error("fixture unavailable");
      return managed;
    },
  });
  await identity.ready;
  const actor = store
    .get("identity")
    .users.find((user) => user.email === managed.email);
  return {
    store,
    identity,
    actor,
    get calls() {
      return calls;
    },
    set managed(value) {
      managed = value;
    },
    get managed() {
      return managed;
    },
    set fail(value) {
      fail = value;
    },
  };
}
const owner = "11111111-1111-4111-8111-111111111111";
const fileId = "22222222-2222-4222-8222-222222222222";
const projectId = "33333333-3333-4333-8333-333333333333";
const path = "/assets/by-id/44444444-4444-4444-8444-444444444444";
const approvedAt = "2026-10-17T00:00:00Z";
function reader(f, onFile = () => {}) {
  let localChecks = 0;
  const checks = async () => {
    for (let i = 0; i < 7; i++) {
      localChecks++;
      await f.identity.authorizeJobActor(f.actor.id, approvedAt);
      await f.identity.authorize(f.actor, "org_default", "brand_default");
    }
  };
  const read = createPenpotMediaAuthorizer({
    runAuthorityPhase: (work) => f.identity.runManagedJobLookupPhase(work),
    resolve: async () => {
      await checks();
      return { ownerPrincipal: owner, fileId, projectId };
    },
    authorize: checks,
    fetchImpl: async (url) => {
      if (url.endsWith("get-profile")) return Response.json({ id: owner });
      onFile();
      return Response.json({ id: fileId, projectId });
    },
  });
  return {
    read: () => read({ path, cookie: "auth-token=fixture-native" }),
    get localChecks() {
      return localChecks;
    },
  };
}
test("native reads retain28 local checks but use two fresh provider phases; concurrent requests never share", async (t) => {
  const f = await fixture(t),
    r = reader(f);
  assert.deepEqual(await r.read(), { authorized: true });
  assert.equal(r.localChecks, 28);
  assert.equal(f.calls, 2);
  await Promise.all([r.read(), r.read()]);
  assert.equal(r.localChecks, 84);
  assert.equal(f.calls, 6);
  await f.identity.authorizeJobActor(f.actor.id, approvedAt);
  await f.identity.authorizeJobActor(f.actor.id, approvedAt);
  assert.equal(f.calls, 8); // Jobs outside these explicit phases remain fresh.
});
test("provider disable or revocation between native ACL phases denies delivery", async (t) => {
  for (const change of [
    { disabled: true },
    { tokensValidAfterTime: "2026-10-18T00:00:00Z" },
  ]) {
    const f = await fixture(t),
      r = reader(f, () => {
        f.managed = { ...f.managed, ...change };
      });
    await assert.rejects(r.read(), { status: 403 });
    assert.equal(f.calls, 2);
  }
});
test("a reused raw provider record cannot bypass current local identity or approval-time policy", async (t) => {
  const f = await fixture(t);
  await f.identity.runManagedJobLookupPhase(async () => {
    await f.identity.authorizeJobActor(f.actor.id, approvedAt);
    f.store.update("identity", (state) => {
      state.users.find((user) => user.id === f.actor.id).role = "marketer";
      return state;
    });
    await assert.rejects(f.identity.authorizeJobActor(f.actor.id, approvedAt), {
      status: 403,
    });
  });
  assert.equal(f.calls, 1);
  f.store.update("identity", (state) => {
    state.users.find((user) => user.id === f.actor.id).role = "founder";
    return state;
  });
  f.managed = { ...f.managed, tokensValidAfterTime: "2026-10-17T12:00:00Z" };
  await f.identity.runManagedJobLookupPhase(async () => {
    await f.identity.authorizeJobActor(f.actor.id, "2026-10-18T00:00:00Z");
    await assert.rejects(f.identity.authorizeJobActor(f.actor.id, approvedAt), {
      status: 403,
    });
  });
  assert.equal(f.calls, 2);
});
test("failed phases fail closed and are discarded before a later request", async (t) => {
  const f = await fixture(t),
    r = reader(f);
  f.fail = true;
  await assert.rejects(r.read(), { status: 403 });
  assert.equal(f.calls, 1);
  f.fail = false;
  assert.deepEqual(await r.read(), { authorized: true });
  assert.equal(f.calls, 3);
});
