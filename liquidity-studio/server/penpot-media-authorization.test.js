import test from "node:test";
import assert from "node:assert/strict";
import {
  createPenpotMediaAuthorizer,
  parsePenpotMediaPath,
  penpotPresentedSession,
} from "./penpot-media-authorization.js";
import { createPenpotPrivateMedia } from "./penpot-private-media.js";

const owner = "11111111-1111-4111-8111-111111111111";
const fileId = "22222222-2222-4222-8222-222222222222";
const projectId = "33333333-3333-4333-8333-333333333333";
const objectId = "44444444-4444-4444-8444-444444444444";
const path = `/assets/by-id/${objectId}`;
const cookie =
  "studio_session=unrelated; auth-token=native-fixture-session; other=not-forwarded";
const record = { ownerPrincipal: owner, fileId, projectId };

// Constructor-only RPC fakes test denial/control flow, not native acceptance.
test("media authorization uses presented native session and current official file ACL, without forwarding Studio cookies", async () => {
  const calls = [];
  let checks = 0;
  const read = createPenpotMediaAuthorizer({
    resolve: async () => record,
    authorize: async () => {
      checks++;
    },
    fetchImpl: async (url, options) => {
      calls.push({ url, options });
      return Response.json(
        url.endsWith("get-profile") ? { id: owner } : { id: fileId, projectId },
      );
    },
  });
  assert.deepEqual(await read({ path, cookie }), { authorized: true });
  assert.equal(checks, 2);
  assert.equal(calls.length, 2);
  assert.ok(
    calls.every(
      (call) =>
        call.options.headers.Cookie === "auth-token=native-fixture-session" &&
        call.options.redirect === "error" &&
        call.options.headers.Accept === "application/json",
    ),
  );
  await assert.rejects(read({ path, cookie: "studio_session=not-native" }), {
    status: 401,
  });
  assert.equal(calls.length, 2);
});

test("foreign native owner, file denial, late registry revocation and unknown query paths fail closed", async () => {
  for (const variant of ["foreign", "file-denied", "late-revoked"]) {
    let checks = 0;
    const read = createPenpotMediaAuthorizer({
      resolve: async () => record,
      authorize: async () => {
        if (++checks === 2 && variant === "late-revoked")
          throw Object.assign(new Error("revoked"), { status: 403 });
      },
      fetchImpl: async (url) =>
        url.endsWith("get-profile")
          ? Response.json({ id: variant === "foreign" ? objectId : owner })
          : variant === "file-denied"
            ? new Response(null, { status: 403 })
            : Response.json({ id: fileId, projectId }),
    });
    await assert.rejects(read({ path, cookie }), { status: 403 });
  }
  for (const invalid of [
    `${path}?share-id=${owner}`,
    `${path}?v=1`,
    "/assets/../internal/assets/a",
    `/assets/by-id/${objectId}/thumbnail`,
  ])
    assert.throws(() => parsePenpotMediaPath(invalid), { status: 404 });
  for (const invalid of [
    "auth-token=",
    "auth-token=a; auth-token=b",
    "auth-token=a\r\nx-header=bad",
    ["auth-token=a"],
  ])
    assert.throws(() => penpotPresentedSession(invalid), { status: 401 });
});

test("upstream public delivery never reaches asset resolution or upload without explicit governed delivery dependency", async () => {
  let calls = 0;
  const upload = createPenpotPrivateMedia({
    sessions: new Map(),
    current: async () => {
      calls++;
    },
    assetFor: async () => {
      calls++;
    },
    fetchImpl: async () => {
      calls++;
    },
  });
  await assert.rejects(upload({}, {}), { status: 422 });
  assert.equal(calls, 0);
});
