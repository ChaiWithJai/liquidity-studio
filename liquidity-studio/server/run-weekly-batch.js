import { fileURLToPath } from "node:url";
import path from "node:path";
import { createPlatform } from "./platform.js";
export function weeklyKey(now = new Date()) {
  const day = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/New_York",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
  const date = new Date(`${day}T00:00:00Z`);
  const weekday = date.getUTCDay();
  date.setUTCDate(date.getUTCDate() - ((weekday + 6) % 7));
  return `weekly:${date.toISOString().slice(0, 10)}:America/New_York`;
}
export async function runWeeklyJob({
  platform = createPlatform(),
  organizationId = process.env.STUDIO_JOB_ORGANIZATION_ID,
  brandId = process.env.STUDIO_JOB_BRAND_ID,
  maxStories = Number(process.env.STUDIO_JOB_MAX_STORIES || 10),
  idempotencyKey = process.env.STUDIO_JOB_IDEMPOTENCY_KEY || weeklyKey(),
} = {}) {
  await platform.ready;
  if (
    !organizationId ||
    !brandId ||
    !Number.isInteger(maxStories) ||
    maxStories < 1 ||
    maxStories > 20
  )
    throw new Error("Explicit valid job scope and max stories are required");
  const identity = await platform.store.get("identity");
  const organization = identity.organizations.find(
    (org) => org.id === organizationId,
  );
  const brand = organization?.brands.find((brand) => brand.id === brandId);
  if (!brand) throw new Error("Configured job scope does not exist");
  const app = await platform.forScope({
    organizationId,
    brandId,
    preset: brand.preset,
  });
  const result = await app.services.batchProductionService.runWeeklyBatch({
    maxStories,
    idempotencyKey,
  });
  console.log(
    JSON.stringify({
      event: "weekly_job_completed",
      actor: "cloud-run-job",
      organizationId,
      brandId,
      jobId: result.job.jobId,
      status: result.job.status,
      replayed: !!result.replayed,
    }),
  );
  if (["FAILED", "INTERRUPTED", "RUNNING"].includes(result.job.status))
    throw new Error("Batch did not complete");
  return result;
}
if (
  process.argv[1] &&
  fileURLToPath(import.meta.url) === path.resolve(process.argv[1])
) {
  const platform = createPlatform();
  try {
    await runWeeklyJob({ platform });
  } catch (error) {
    console.error(
      JSON.stringify({
        event: "weekly_job_failed",
        code: error.code || "BATCH_FAILED",
      }),
    );
    process.exitCode = 1;
  } finally {
    await platform.store?.close();
  }
}
