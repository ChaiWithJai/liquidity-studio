import test from "node:test";
import assert from "node:assert/strict";
import { weeklyKey, runWeeklyJob } from "./run-weekly-batch.js";
import { createPlatform } from "./platform.js";
import { DurableStore } from "./storage.js";
test("weekly worker uses New York week, validates scope and replays durable job key", async () => {
  assert.equal(
    weeklyKey(new Date("2026-10-19T03:00:00Z")),
    "weekly:2026-10-12:America/New_York",
  );
  assert.equal(
    weeklyKey(new Date("2026-10-19T05:00:00Z")),
    "weekly:2026-10-19:America/New_York",
  );
  const store = new DurableStore(":memory:");
  const platform = createPlatform({ store });
  const input = {
    platform,
    organizationId: "org_default",
    brandId: "brand_vedic",
    maxStories: 1,
    idempotencyKey: "worker-same-week",
  };
  const first = await runWeeklyJob(input),
    second = await runWeeklyJob(input);
  assert.equal(first.job.jobId, second.job.jobId);
  assert.equal(second.replayed, true);
  await assert.rejects(
    runWeeklyJob({ ...input, organizationId: "foreign" }),
    /scope/,
  );
  store.close();
});
