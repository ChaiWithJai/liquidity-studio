import { fail } from "./auth.js";
export function jobDispatcherConfiguration(env = process.env) {
  const mode = env.STUDIO_JOB_DISPATCHER;
  if (mode === "local" && !env.K_SERVICE) return { mode };
  if (mode !== "cloud-tasks")
    throw fail(
      503,
      "Configure a durable local worker or Cloud Tasks dispatcher",
    );
  const queue = env.STUDIO_JOB_QUEUE,
    endpoint = env.STUDIO_JOB_WORKER_URL,
    email = env.STUDIO_JOB_WORKER_EMAIL;
  if (
    !/^projects\/[a-z][a-z0-9-]+\/locations\/[a-z0-9-]+\/queues\/[a-zA-Z0-9_-]+$/.test(
      queue || "",
    )
  )
    throw fail(503, "Cloud Tasks queue configuration required");
  let url;
  try {
    url = new URL(endpoint);
  } catch {
    throw fail(503, "Worker URL configuration required");
  }
  if (
    url.protocol !== "https:" ||
    !url.hostname.endsWith(".run.app") ||
    url.username ||
    url.password ||
    url.search ||
    url.hash ||
    url.pathname !== "/api/internal/operator-job" ||
    !/@[a-z0-9-]+\.iam\.gserviceaccount\.com$/.test(email || "")
  )
    throw fail(503, "Invalid fixed Cloud Tasks worker configuration");
  let scopes;
  try {
    scopes = JSON.parse(env.STUDIO_JOB_SCOPES || "[]");
  } catch {
    throw fail(503, "Worker scope configuration required");
  }
  if (
    !Array.isArray(scopes) ||
    !scopes.length ||
    scopes.some(
      (scope) =>
        !scope ||
        typeof scope.organizationId !== "string" ||
        typeof scope.brandId !== "string" ||
        Object.keys(scope).some(
          (key) => !["organizationId", "brandId"].includes(key),
        ),
    )
  )
    throw fail(503, "Worker scope configuration required");
  return { mode, queue, endpoint: url.href, email, scopes };
}
export class CloudTasksJobDispatcher {
  constructor({
    configuration = jobDispatcherConfiguration(),
    auth,
    request = fetch,
  } = {}) {
    if (configuration.mode !== "cloud-tasks")
      throw fail(503, "Cloud Tasks is disabled");
    Object.assign(this, { configuration, auth, request });
  }
  async token() {
    if (this.auth) return this.auth();
    const { GoogleAuth } = await import("google-auth-library");
    return new GoogleAuth({
      scopes: ["https://www.googleapis.com/auth/cloud-platform"],
    }).getAccessToken();
  }
  async dispatch(repo, { jobId } = {}) {
    const state = await repo.read(),
      scope = repo.scope;
    for (const job of state.operatorJobs || []) {
      if (jobId && job.id !== jobId) continue;
      if (
        !this.configuration.scopes.some(
          (allowed) =>
            allowed.organizationId === scope.organizationId &&
            allowed.brandId === scope.brandId,
        )
      )
        throw fail(403, "Job scope is not configured for delivery");
      if (job.cancelled) continue;
      for (const item of job.items.filter((item) => item.state === "queued")) {
        const nextAttempt = item.attempt + 1,
          name = `${this.configuration.queue}/tasks/studio-${job.id}-${item.id}-${job.deliveryEpoch}-${nextAttempt}`;
        const payload = {
          organizationId: scope.organizationId,
          brandId: scope.brandId,
          jobId: job.id,
          itemId: item.id,
          nextAttempt,
          deliveryEpoch: job.deliveryEpoch,
        };
        const response = await this.request(
          `https://cloudtasks.googleapis.com/v2/${this.configuration.queue}/tasks`,
          {
            method: "POST",
            redirect: "error",
            signal: AbortSignal.timeout(10000),
            headers: {
              Authorization: `Bearer ${await this.token()}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              task: {
                name,
                dispatchDeadline: "120s",
                httpRequest: {
                  httpMethod: "POST",
                  url: this.configuration.endpoint,
                  headers: { "Content-Type": "application/json" },
                  oidcToken: {
                    serviceAccountEmail: this.configuration.email,
                    audience: this.configuration.endpoint,
                  },
                  body: Buffer.from(JSON.stringify(payload)).toString("base64"),
                },
              },
            }),
          },
        );
        if (!response.ok && response.status !== 409)
          throw fail(
            503,
            "Cloud Tasks enqueue failed; persisted plan remains recoverable",
          );
      }
      await repo.mutate((state) => {
        const live = state.operatorJobs.find((row) => row.id === job.id);
        if (
          live.deliveryEpoch !== job.deliveryEpoch ||
          live.outbox.state === "worker_received"
        )
          return state;
        live.outbox = {
          state: "delivered",
          attempts: live.outbox.attempts + 1,
          at: new Date().toISOString(),
        };
        return state;
      });
    }
  }
}
export async function dispatchJobs(repo, jobId) {
  const configuration = jobDispatcherConfiguration();
  if (configuration.mode === "cloud-tasks")
    await new CloudTasksJobDispatcher({ configuration }).dispatch(repo, {
      jobId,
    });
}
