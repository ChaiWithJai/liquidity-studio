import test from "node:test";
import assert from "node:assert/strict";
import { currentPenpotBinding } from "./penpot-studio-runtime.js";
const target = {
  id: "native",
  organizationId: "org",
  brandId: "brand",
  ownerPrincipal: "owner",
  nativeProjectId: "project",
};
const row = (id) => ({ ...target, targetId: target.id, id, revokedAt: null });
const failure = (status) =>
  Object.assign(new Error("Controlled boundary rejection"), { status });
test("current binding selection skips stale/revoked/actor-denied registrations in the same exact target", async () => {
  const rows = [
    { ...row("foreign"), brandId: "other" },
    { ...row("revoked"), revokedAt: "now" },
    row("stale"),
    row("denied"),
    row("current"),
  ];
  const observed = [];
  const boundary = {
    read: async () => ({ bindings: rows }),
    binding: (_state, id) => {
      observed.push(id);
      if (id === "stale") throw failure(409);
      return rows.find((row) => row.id === id);
    },
  };
  const result = await currentPenpotBinding(
    boundary,
    target,
    async (binding) => {
      if (binding.id === "denied") throw failure(403);
      return { id: "current-actor" };
    },
  );
  assert.equal(result.binding.id, "current");
  assert.deepEqual(observed, ["stale", "denied", "current"]);
});
test("current binding selection does not swallow storage, upstream or unexpected authorization failures", async () => {
  for (const status of [500, 503, 404])
    await assert.rejects(
      currentPenpotBinding(
        {
          read: async () => ({ bindings: [row("first"), row("second")] }),
          binding: () => {
            throw failure(status);
          },
        },
        target,
        async () => ({ id: "actor" }),
      ),
      { status },
    );
  await assert.rejects(
    currentPenpotBinding(
      {
        read: async () => {
          throw failure(503);
        },
      },
      target,
      async () => ({ id: "actor" }),
    ),
    { status: 503 },
  );
  await assert.rejects(
    currentPenpotBinding(
      {
        read: async () => ({ bindings: [row("first"), row("second")] }),
        binding: (_state, id) => row(id),
      },
      target,
      async () => {
        throw failure(409);
      },
    ),
    { status: 409 },
  );
});
