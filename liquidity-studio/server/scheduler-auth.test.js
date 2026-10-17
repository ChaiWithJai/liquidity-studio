import test from "node:test";
import assert from "node:assert/strict";
import { generateKeyPairSync, sign } from "node:crypto";
import { verifySchedulerIdentity, schedulerScope } from "./scheduler-auth.js";
test("scheduler validates signature, audience, service identity, expiry and explicit scope", async () => {
  const { privateKey, publicKey } = generateKeyPairSync("rsa", {
    modulusLength: 2048,
  });
  const key = { ...publicKey.export({ format: "jwk" }), kid: "fixture" };
  const options = {
    audience: "https://studio.example/api/internal/scheduled-batch",
    email: "scheduler@example.iam.gserviceaccount.com",
    keys: [key],
  };
  const token = (patch) => {
    const parts = [
      { alg: "RS256", kid: "fixture" },
      {
        iss: "https://accounts.google.com",
        aud: options.audience,
        email: options.email,
        email_verified: true,
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 300,
        ...patch,
      },
    ].map((value) => Buffer.from(JSON.stringify(value)).toString("base64url"));
    return (
      parts.join(".") +
      "." +
      sign("RSA-SHA256", Buffer.from(parts.join(".")), privateKey).toString(
        "base64url",
      )
    );
  };
  assert.equal(
    (await verifySchedulerIdentity(token({}), options)).email,
    options.email,
  );
  for (const invalid of [
    { aud: "other" },
    { email: "other@example.com" },
    { exp: 1 },
    { email_verified: false },
  ])
    await assert.rejects(
      verifySchedulerIdentity(token(invalid), options),
      (error) => error.status === 401,
    );
  const valid = token({});
  await assert.rejects(
    verifySchedulerIdentity(valid.slice(0, -10) + "bad", options),
    (error) => error.status === 401,
  );
  const previous = process.env.STUDIO_SCHEDULER_SCOPES;
  process.env.STUDIO_SCHEDULER_SCOPES = JSON.stringify([
    { organizationId: "one", brandId: "two" },
  ]);
  try {
    assert.equal(schedulerScope("one", "two").brandId, "two");
    assert.throws(
      () => schedulerScope("foreign", "two"),
      (error) => error.status === 403,
    );
  } finally {
    if (previous === undefined) delete process.env.STUDIO_SCHEDULER_SCOPES;
    else process.env.STUDIO_SCHEDULER_SCOPES = previous;
  }
});
