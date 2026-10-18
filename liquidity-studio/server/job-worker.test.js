import test from "node:test";
import assert from "node:assert/strict";
import { getEventListeners } from "node:events";
import { setTimeout as delay } from "node:timers/promises";
import { runWorker } from "./job-worker.js";
test("idle local worker bounds abort listeners and releases them on timer completion and stop", async () => {
  const old = {
    mode: process.env.STUDIO_JOB_DISPATCHER,
    enabled: process.env.STUDIO_OPERATOR_JOBS_ENABLED,
  };
  process.env.STUDIO_JOB_DISPATCHER = "local";
  process.env.STUDIO_OPERATOR_JOBS_ENABLED = "true";
  const stop = new AbortController();
  let ticks = 0;
  const platform = {
    ready: Promise.resolve(),
    store: {
      keys: async () => {
        ticks++;
        return [];
      },
    },
  };
  let running;
  try {
    running = runWorker({ platform, signal: stop.signal, idleMs: 5 });
    while (ticks < 8) {
      await delay(2);
      assert.ok(getEventListeners(stop.signal, "abort").length <= 1);
    }
    stop.abort();
    await running;
    assert.equal(getEventListeners(stop.signal, "abort").length, 0);
    const before = ticks;
    await runWorker({ platform, signal: stop.signal, idleMs: 5 });
    assert.equal(
      ticks,
      before,
      "already stopped worker must not scan or claim",
    );
  } finally {
    stop.abort();
    await running;
    if (old.mode === undefined) delete process.env.STUDIO_JOB_DISPATCHER;
    else process.env.STUDIO_JOB_DISPATCHER = old.mode;
    if (old.enabled === undefined)
      delete process.env.STUDIO_OPERATOR_JOBS_ENABLED;
    else process.env.STUDIO_OPERATOR_JOBS_ENABLED = old.enabled;
  }
});
