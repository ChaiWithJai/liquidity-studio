import { pathToFileURL } from "node:url";
import { existsSync } from "node:fs";
import { isAbsolute } from "node:path";
import { fail } from "./auth.js";
import {
  preparationUrls,
  preparationFingerprint,
} from "./prepared-source-candidate.js";
import { validateSourceUrl } from "./source-retrieval.js";
import { jobDispatcherConfiguration, dispatchJobs } from "./job-dispatcher.js";

export function existingPreparationPlan(state, scope) {
  const plan = {
    eligible: [],
    attention: [],
    alreadyPrepared: [],
    existingCampaigns: [],
  };
  for (const story of state.backlog) {
    if (story.campaignDraft) {
      plan.existingCampaigns.push(story.id);
      continue;
    }
    let sourceUrls;
    try {
      sourceUrls = preparationUrls(story, scope);
      sourceUrls.forEach((url) => validateSourceUrl(url));
    } catch {
      plan.attention.push({
        storyId: story.id,
        code: "SOURCE_RESEARCH_REQUIRED",
      });
      continue;
    }
    const inputFingerprint = preparationFingerprint(story, scope);
    if (
      state.operatorJobs?.some(
        (job) =>
          job.purpose === "source-preparation" &&
          job.items.some(
            (item) =>
              item.storyId === story.id &&
              item.inputFingerprint === inputFingerprint,
          ),
      )
    ) {
      plan.alreadyPrepared.push(story.id);
      continue;
    }
    plan.eligible.push({
      storyId: story.id,
      inputFingerprint,
      sourceHosts: sourceUrls.map((url) => new URL(url).hostname),
    });
  }
  return plan;
}
export async function bootstrapExistingPreparation({
  store,
  scope,
  actorId,
  apply = false,
  platformFactory,
  dispatch = dispatchJobs,
}) {
  const identity = await store.get("identity"),
    actor = identity?.users.find((user) => user.id === actorId);
  const org = identity?.organizations.find(
      (org) => org.id === scope.organizationId,
    ),
    brand = org?.brands.find((brand) => brand.id === scope.brandId);
  if (
    !actor ||
    actor.role !== "founder" ||
    !brand ||
    !identity.memberships.some(
      (member) =>
        member.userId === actor.id &&
        member.organizationId === org.id &&
        member.brandIds.includes(brand.id),
    )
  )
    throw fail(403, "Current founder and owned existing scope are required");
  scope = { organizationId: org.id, brandId: brand.id, preset: brand.preset };
  const state = await store.get(`scope:${org.id}:${brand.id}`);
  if (!state)
    throw fail(
      404,
      "Existing workspace required; this operation does not seed a new workspace",
    );
  const plan = existingPreparationPlan(state, scope);
  if (!apply) return { apply: false, scope, plan };
  if (
    process.env.STUDIO_SOURCE_PREPARATION_ENABLED !== "true" ||
    process.env.STUDIO_OPERATOR_JOBS_ENABLED !== "true"
  )
    throw fail(
      409,
      "Enable preparation and durable jobs before applying this migration",
    );
  const config = jobDispatcherConfiguration();
  if (
    config.mode === "cloud-tasks" &&
    !config.scopes.some(
      (allowed) =>
        allowed.organizationId === org.id && allowed.brandId === brand.id,
    )
  )
    throw fail(403, "Existing worker scope is not configured");
  const platform = await platformFactory(store);
  await platform.ready;
  const current = platform.identity.authorizeJobActor
    ? await platform.identity.authorizeJobActor(
        actorId,
        new Date().toISOString(),
      )
    : (await store.get("identity")).users.find((user) => user.id === actorId);
  if (current?.role !== "founder")
    throw fail(403, "Current founder authority required");
  await platform.identity.authorize(current, org.id, brand.id);
  const container = await platform.forScope(scope),
    jobs = platform.operatorJobs(scope, container),
    job = await jobs.createForIngestion(
      current,
      plan.eligible.slice(0, 10).map((entry) => entry.storyId),
    );
  if (job) await dispatch(container.ports.repo, job.id);
  return {
    apply: true,
    scope,
    jobId: job?.id || null,
    plan,
    meaning:
      "Existing durable source-preparation queue only; no approval, model request, or editor navigation.",
  };
}
async function main() {
  const args = process.argv.slice(2),
    apply = args.includes("--apply");
  if (
    ["--apply", "--organization", "--brand"].some(
      (flag) => args.filter((arg) => arg === flag).length > 1,
    ) ||
    args.some(
      (arg, index) =>
        !["--apply", "--organization", "--brand"].includes(arg) &&
        !["--organization", "--brand"].includes(args[index - 1]),
    )
  )
    throw fail(400, "Use --organization ID --brand ID [--apply]");
  const value = (flag) => args[args.indexOf(flag) + 1],
    organizationId = value("--organization"),
    brandId = value("--brand"),
    actorId = process.env.STUDIO_PREPARATION_BOOTSTRAP_ACTOR_ID;
  if (
    !args.includes("--organization") ||
    !args.includes("--brand") ||
    ![organizationId, brandId, actorId].every(
      (value) =>
        typeof value === "string" && /^[A-Za-z0-9_-]{1,128}$/.test(value),
    )
  )
    throw fail(
      400,
      "Explicit organization, brand and current founder actor ID required",
    );
  let store;
  if (process.env.STUDIO_STORAGE_MODE === "firestore") {
    const { createCloudStore } = await import("./cloud-store.js");
    store = await createCloudStore();
  } else {
    const file = process.env.STUDIO_DATABASE_PATH;
    if (!file || !isAbsolute(file) || !existsSync(file))
      throw fail(400, "Explicit existing absolute SQLite path required");
    const { DurableStore } = await import("./storage.js");
    store = new DurableStore(file);
  }
  try {
    const result = await bootstrapExistingPreparation({
      store,
      scope: { organizationId, brandId },
      actorId,
      apply,
      platformFactory: async (store) => {
        const { createPlatform } = await import("./platform.js");
        return createPlatform({ store });
      },
    });
    console.log(JSON.stringify(result));
  } finally {
    await store.close();
  }
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href)
  main().catch((error) => {
    console.error(
      JSON.stringify({
        status: error.status || 500,
        error:
          "Source preparation migration did not complete; inspect current configuration and retained job state.",
      }),
    );
    process.exitCode = 1;
  });
