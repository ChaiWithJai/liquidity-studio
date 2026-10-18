import { test, expect } from "@playwright/test";
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { randomBytes, createHash } from "node:crypto";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import { DurableStore } from "../server/storage.js";
import { createPlatform } from "../server/platform.js";
import { createHttpServer } from "../server/index.js";
let dir, file, store, platform, server, base, password;
test.beforeAll(async () => {
  process.env.NODE_ENV = "test";
  process.env.AI_ALLOW_SYNTHETIC = "true";
  process.env.STUDIO_OPERATOR_JOBS_ENABLED = "true";
  process.env.STUDIO_JOB_DISPATCHER = "local";
  dir = mkdtempSync(join(tmpdir(), "studio-jobs-app-"));
  file = join(dir, "app.sqlite");
  password = randomBytes(24).toString("base64url");
  store = new DurableStore(file);
  platform = createPlatform({ store, authMode: "password" });
  await platform.ready;
  for (const role of ["founder", "marketer"])
    await platform.identity.provision({
      username: `job-app-${role}`,
      password,
      role,
    });
  const container = await platform.forScope({
    organizationId: "org_default",
    brandId: "brand_default",
  });
  await container.ports.repo.addBacklogStory({
    title: "Reviewed walk-away campaign",
    sourceClaims: [
      {
        id: "app-job-source",
        kind: "general",
        status: "approved",
        text: "A disposable source-backed acceptance excerpt.",
        sourceUrl: "https://example.org/app-job-fixture",
      },
    ],
  });
  server = createHttpServer(null, { platform });
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  base = `http://127.0.0.1:${server.address().port}`;
});
test.afterAll(async () => {
  await new Promise((resolve) => server.close(resolve));
  store.close();
  rmSync(dir, { recursive: true, force: true });
});
async function worker() {
  await new Promise((resolve, reject) => {
    const child = spawn(process.execPath, ["server/job-worker.js", "--once"], {
      cwd: fileURLToPath(new URL("..", import.meta.url)),
      env: {
        ...process.env,
        STUDIO_AUTH_MODE: "password",
        STUDIO_DATABASE_PATH: file,
        STUDIO_JOB_RESUME_PENDING: "true",
      },
      stdio: ["ignore", "pipe", "pipe"],
    });
    let message = "";
    child.stderr.on("data", (data) => (message += data));
    child.once("error", reject);
    child.once("exit", (code) =>
      code === 0 ? resolve() : reject(Error(message)),
    );
  });
}
async function login(page, role = "founder") {
  await page.goto(base);
  await page.getByLabel("Username", { exact: true }).fill(`job-app-${role}`);
  await page.getByLabel("Password", { exact: true }).fill(password);
  await page.getByRole("button", { name: "Sign in →", exact: true }).click();
  await page.getByRole("button", { name: "Jobs", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Operator jobs", exact: true }),
  ).toBeVisible();
}
test("mounted App reviews a bounded job then reopens same completed job after browser close and independent worker run", async ({
  page,
  context,
}) => {
  await page.setViewportSize({ width: 1280, height: 720 });
  await login(page);
  await page
    .getByLabel("Plan Reviewed walk-away campaign", { exact: true })
    .check();
  await page.getByLabel(/I reviewed these 1 campaigns/).check();
  const pending = page.waitForResponse(
    (response) =>
      response.request().method() === "POST" &&
      response.url().includes("/api/studio/jobs?"),
  );
  await page
    .getByRole("button", { name: "Queue reviewed plan", exact: true })
    .click();
  const job = (await (await pending).json()).job;
  await expect(
    page.getByRole("heading", { name: `Job ${job.id}`, exact: true }),
  ).toBeVisible();
  await page.close();
  await worker();
  const next = await context.newPage();
  await next.setViewportSize({ width: 1280, height: 720 });
  await next.goto(base);
  await next.getByRole("button", { name: "Jobs", exact: true }).click();
  await next.getByRole("button", { name: new RegExp(job.id) }).click();
  await expect(next.getByRole("region", { name: "Job details" })).toContainText(
    "completed",
  );
  await expect(next.getByRole("region", { name: "Job details" })).toContainText(
    "Committed revision 2",
  );
  if (process.env.STUDIO_CAPTURE_JOBS_APP_DIR) {
    const target = process.env.STUDIO_CAPTURE_JOBS_APP_DIR;
    mkdirSync(target, { recursive: true });
    const records = [];
    for (const id of ["S13", "S14"]) {
      if (id === "S14")
        await next
          .getByRole("button", { name: "Refresh jobs", exact: true })
          .focus();
      const bytes = await next.screenshot({
        path: join(target, `${id}.png`),
        fullPage: true,
      });
      records.push({
        id,
        sha256: createHash("sha256").update(bytes).digest("hex"),
        viewport: { width: 1280, height: 720 },
        fullPage: true,
        state:
          id === "S13"
            ? "Same completed job after independent worker + browser rejoin"
            : "Refresh jobs keyboard focus; provider readiness remains execution-specific",
        actor: "isolated fixture founder",
        organization: "org_default",
        brand: "brand_default",
        provider: "explicit offline-synthetic",
        jobId: job.id,
      });
    }
    writeFileSync(
      join(target, "manifest.json"),
      JSON.stringify(
        {
          schemaVersion: 1,
          source:
            "mounted actual App + real HTTP/SQLite + independent child worker",
          records,
        },
        null,
        2,
      ),
    );
  }
  await next.getByLabel("Brand", { exact: true }).selectOption("brand_vedic");
  await next.getByRole("button", { name: "Jobs", exact: true }).click();
  await expect(next.getByRole("region", { name: "Job history" })).toContainText(
    "No durable jobs",
  );
  await expect(next.getByRole("region", { name: "Job details" })).toHaveCount(
    0,
  );
});
test("marketer sees operator jobs separately from founder organization management", async ({
  page,
}) => {
  await login(page, "marketer");
  await expect(
    page.getByRole("heading", { name: "Operator jobs", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Admin", exact: true }),
  ).toHaveCount(0);
  await expect(page.getByRole("region", { name: "Job history" })).toBeVisible();
});
