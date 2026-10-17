import test from "node:test";
import assert from "node:assert/strict";
import { DurableStore } from "./storage.js";
import { ScopedRepository } from "./repository.js";

test("installation daily attempt budget aggregates organizations and brands including failed or synthetic work", async (t) => {
  const oldOrg = process.env.STUDIO_DAILY_GENERATION_LIMIT,
    oldGlobal = process.env.STUDIO_GLOBAL_DAILY_GENERATION_LIMIT;
  process.env.STUDIO_DAILY_GENERATION_LIMIT = "2";
  process.env.STUDIO_GLOBAL_DAILY_GENERATION_LIMIT = "3";
  const store = new DurableStore(":memory:"),
    separateInstallation = new DurableStore(":memory:");
  t.after(() => {
    store.close();
    separateInstallation.close();
    for (const [key, value] of [
      ["STUDIO_DAILY_GENERATION_LIMIT", oldOrg],
      ["STUDIO_GLOBAL_DAILY_GENERATION_LIMIT", oldGlobal],
    ])
      value === undefined
        ? delete process.env[key]
        : (process.env[key] = value);
  });
  const repo = (storage, organizationId, brandId) =>
    new ScopedRepository(storage, {
      organizationId,
      brandId,
      preset: "liquidity_desk",
    });
  const first = repo(store, "org_one", "brand_one"),
    second = repo(store, "org_one", "brand_two"),
    third = repo(store, "org_two", "brand_three");
  const a = await first.reserveGeneration(),
    b = await second.reserveGeneration();
  await first.finalizeGeneration(a, {
    status: "completed",
    mode: "synthetic",
    traceId: "synthetic-fixture",
  });
  await second.finalizeGeneration(b, { status: "failed", mode: "failed" });
  await third.reserveGeneration();
  await assert.rejects(
    repo(store, "org_three", "brand_four").reserveGeneration(),
    (error) =>
      error.status === 429 &&
      error.message === "Daily installation generation limit reached",
  );
  // Separate data installations do not constitute a shared project/dollar cap.
  assert.ok(
    (
      await repo(
        separateInstallation,
        "org_three",
        "brand_four",
      ).reserveGeneration()
    ).id,
  );
});
