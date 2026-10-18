import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { DurableStore } from "./storage.js";
import { PenpotActionLedger } from "./penpot-action-ledger.js";

test("SQLite native action intent survives reopen without capabilities, deduplicates concurrency and keeps verified history", async (t) => {
  const dir = await mkdtemp(join(tmpdir(), "penpot-action-ledger-"));
  t.after(() => rm(dir, { recursive: true, force: true }));
  let store = new DurableStore(join(dir, "actions.sqlite"));
  let allowed = true;
  const actor = { id: "founder" },
    scope = { organizationId: "org", brandId: "brand" };
  const authorize = async () => {
    if (!allowed) throw new Error("Current managed actor revoked");
  };
  let ledger = new PenpotActionLedger({ store, scope, authorize });
  const input = {
    bindingId: "binding",
    resourceId: "tokens",
    idempotencyKey: "request-1",
    command: {
      operation: "refresh-brand-tokens",
      storyId: "story",
      expectedRevision: 2,
      generationId: "generation",
      expectedBrandRevision: "a".repeat(64),
      expectedNativeRevision: 3,
    },
  };
  const rows = await Promise.all(
    Array.from({ length: 5 }, () => ledger.create(actor, input)),
  );
  assert.equal(rows.filter((row) => row.created).length, 1);
  const id = rows[0].action.id;
  await ledger.transition(actor, id, "pending-native-action");
  await store.close();
  store = new DurableStore(join(dir, "actions.sqlite"));
  t.after(() => store.close());
  ledger = new PenpotActionLedger({ store, scope, authorize });
  assert.equal((await ledger.get(actor, id)).status, "pending-native-action");
  const verified = await ledger.transition(actor, id, "native-state-verified", {
    nativeRevision: 4,
    bindingEpoch: 1,
    method: "read-only-reconciliation",
    cookie: "never-copy",
    nativeActionCapability: "never-copy",
  });
  assert.equal(verified.verification.method, "read-only-reconciliation");
  assert.equal(JSON.stringify(verified).includes("never-copy"), false);
  assert.equal(
    (await ledger.transition(actor, id, "reconciliation-required")).status,
    "native-state-verified",
  );
  await assert.rejects(
    () =>
      ledger.create(actor, {
        ...input,
        command: { ...input.command, expectedRevision: 3 },
      }),
    (error) => error.status === 409,
  );
  await assert.rejects(
    () => ledger.get({ id: "marketer" }, id),
    (error) => error.status === 404,
  );
  const foreign = new PenpotActionLedger({
    store,
    scope: { ...scope, brandId: "other" },
    authorize,
  });
  await assert.rejects(
    () => foreign.get(actor, id),
    (error) => error.status === 404,
  );
  allowed = false;
  await assert.rejects(() => ledger.get(actor, id), /revoked/);
});
