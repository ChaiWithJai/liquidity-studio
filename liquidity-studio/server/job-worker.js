import { setTimeout as delay } from "node:timers/promises";
import { pathToFileURL } from "node:url";
import { randomUUID } from "node:crypto";
import { createPlatform } from "./platform.js";
import { hasClaimWork } from "./operator-jobs.js";
import { assertRestoreAvailable } from "./restore-gate.js";
import {
  CloudTasksJobDispatcher,
  jobDispatcherConfiguration,
} from "./job-dispatcher.js";

export async function workerTick(platform, workerId = randomUUID()) {
  await platform.ready;
  let handled = 0;
  for (const key of await platform.store.keys("scope:")) {
    const state = await platform.store.get(key),
      scope = state?.operatorJobScope;
    if (!scope || !state.operatorJobs?.length) continue;
    assertRestoreAvailable(state);
    // forScope initializes its repository. Do not construct it for idle history.
    if (!hasClaimWork(state)) continue;
    const container = await platform.forScope(scope);
    if (await platform.operatorJobs(scope, container).runNext(workerId))
      handled++;
  }
  return handled;
}
export async function dispatchOutbox(platform = createPlatform()) {
  await platform.ready;
  const dispatcher = new CloudTasksJobDispatcher();
  for (const key of await platform.store.keys("scope:")) {
    const state = await platform.store.get(key);
    if (!state.operatorJobScope) continue;
    const container = await platform.forScope(state.operatorJobScope);
    await dispatcher.dispatch(container.ports.repo);
  }
}
export async function runWorker({
  platform = createPlatform(),
  once = false,
  signal,
  idleMs = 1000,
} = {}) {
  const configuration = jobDispatcherConfiguration();
  if (
    configuration.mode !== "local" ||
    process.env.STUDIO_OPERATOR_JOBS_ENABLED !== "true"
  )
    throw new Error(
      "Explicit local durable worker mode required; Cloud Run uses Cloud Tasks",
    );
  if (signal?.aborted) return;
  // A restored SQLite file cannot distinguish pending work from an old installation.
  // Pause preexisting queued work on each process start unless an operator opts in.
  if (process.env.STUDIO_JOB_RESUME_PENDING !== "true") {
    await platform.ready;
    for (const key of await platform.store.keys("scope:"))
      await platform.store.update(key, (state) => {
        for (const job of state.operatorJobs || []) {
          for (const item of job.items)
            if (item.state === "queued") {
              item.state = "paused";
              item.error = {
                code: "WORKER_RESTART_REVIEW",
                message:
                  "Worker restarted. Explicitly resume this reviewed plan; changed inputs still conflict.",
              };
            }
          if (job.items.some((item) => item.state === "paused"))
            job.state = "paused";
        }
        return state;
      });
  }
  if (signal?.aborted) return;
  const workerId = randomUUID();
  do {
    await workerTick(platform, workerId);
    if (!once && !signal?.aborted) {
      try {
        await delay(idleMs, undefined, { signal });
      } catch (error) {
        if (error.name !== "AbortError") throw error;
      }
    }
  } while (!once && !signal?.aborted);
}
if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  const stop = new AbortController();
  process.once("SIGINT", () => stop.abort());
  process.once("SIGTERM", () => stop.abort());
  const platform = createPlatform();
  (process.argv.includes("--dispatch")
    ? dispatchOutbox(platform)
    : runWorker({
        platform,
        once: process.argv.includes("--once"),
        signal: stop.signal,
      })
  )
    .catch(() => {
      console.error("Durable job worker stopped with an error");
      process.exitCode = 1;
    })
    .finally(async () => {
      await platform.store?.close();
    });
}
