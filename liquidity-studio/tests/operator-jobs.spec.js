import { test, expect } from "@playwright/test";
import { createServer } from "node:http";
import { createServer as createVite } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import { mkdtempSync, readFileSync, rmSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { randomBytes } from "node:crypto";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import { createPlatform } from "../server/platform.js";
import { DurableStore } from "../server/storage.js";
import { createHttpServer } from "../server/index.js";
let dir, store, platform, repo, server, vite, base, password, file;
const scope = "?organizationId=org_default&brandId=brand_default";
test.beforeAll(async () => {
  process.env.NODE_ENV = "test";
  process.env.AI_ALLOW_SYNTHETIC = "true";
  process.env.STUDIO_OPERATOR_JOBS_ENABLED = "true";
  process.env.STUDIO_JOB_DISPATCHER = "local";
  dir = mkdtempSync(join(tmpdir(), "studio-jobs-browser-"));
  file = join(dir, "jobs.sqlite");
  password = randomBytes(24).toString("base64url");
  store = new DurableStore(file);
  platform = createPlatform({ store, authMode: "password" });
  await platform.ready;
  await platform.identity.provision({
    username: "jobs-browser",
    password,
    role: "founder",
  });
  repo = (
    await platform.forScope({
      organizationId: "org_default",
      brandId: "brand_default",
    })
  ).ports.repo;
  const api = createHttpServer(null, { platform });
  vite = await createVite({
    root: fileURLToPath(new URL("..", import.meta.url)),
    configFile: false,
    cacheDir: join(dir, "vite"),
    plugins: [svelte()],
    server: { middlewareMode: true, hmr: false },
    appType: "custom",
    logLevel: "error",
  });
  server = createServer((req, res) => {
    if (req.url.startsWith("/api/")) api.emit("request", req, res);
    else if (req.url === "/tests/fixtures/jobs-host.html")
      void vite
        .transformIndexHtml(
          req.url,
          readFileSync(
            new URL("./fixtures/jobs-host.html", import.meta.url),
            "utf8",
          ),
        )
        .then((html) => {
          res.setHeader("Content-Type", "text/html");
          res.end(html);
        });
    else
      vite.middlewares(req, res, () => {
        res.statusCode = 404;
        res.end();
      });
  });
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  base = `http://127.0.0.1:${server.address().port}`;
});
test.afterAll(async () => {
  await new Promise((resolve) => server.close(resolve));
  await vite.close();
  store.close();
  rmSync(dir, { recursive: true, force: true });
});
async function openNewPlan(page) {
  const plan=page.locator('.new-plan');
  await expect(plan).toBeVisible();
  if(!(await plan.evaluate(element=>element.open)))await plan.locator(':scope > summary').click();
}
async function login(page) {
  expect(
    (
      await page.request.post(base + "/api/auth/login", {
        data: { username: "jobs-browser", password },
      })
    ).status(),
  ).toBe(200);
  await page.goto(base + "/tests/fixtures/jobs-host.html");
  await expect(
    page.getByRole("heading", { name: "Campaign generation", exact: true }),
  ).toBeVisible();
}
async function source(title) {
  return repo.addBacklogStory({
    title,
    sourceClaims: [
      {
        id: crypto.randomUUID(),
        text: "A synthetic approved acceptance excerpt.",
        sourceUrl: "https://example.org/jobs-acceptance",
        kind: "general",
        status: "approved",
      },
    ],
  });
}
async function worker() {
  await new Promise((resolve, reject) => {
    const child = spawn(process.execPath, ["server/job-worker.js", "--once"], {
      cwd: fileURLToPath(new URL("..", import.meta.url)),
      env: {
        ...process.env,
        STUDIO_DATABASE_PATH: file,
        STUDIO_JOB_RESUME_PENDING: "true",
        STUDIO_AUTH_MODE: "password",
      },
      stdio: ["ignore", "pipe", "pipe"],
    });
    let output = "";
    child.stderr.on("data", (data) => (output += data));
    child.once("error", reject);
    child.once("exit", (code) =>
      code === 0 ? resolve() : reject(Error(output)),
    );
  });
}
test("reviewed job survives closed browser; independent workers commit one item and preserve conflicting human edit", async ({
  page,
  context,
}) => {
  const a = await source("Walk-away A"),
    b = await source("Walk-away B");
  await login(page);
  await openNewPlan(page);
  await page.getByLabel("Plan Walk-away A", { exact: true }).check();
  await openNewPlan(page);
  await page.getByLabel("Plan Walk-away B", { exact: true }).check();
  await page.getByLabel(/I reviewed these 2 campaigns/).check();
  const queued = page.waitForResponse(
    (response) =>
      response.url().includes("/api/studio/jobs?") &&
      response.request().method() === "POST",
  );
  await page
    .getByRole("button", { name: "Queue reviewed plan", exact: true })
    .click();
  const job = (await (await queued).json()).job;
  await expect(
    page.getByRole("heading", { name: "Job details", exact: true }),
  ).toBeVisible();
  await page.close();
  await repo.updateStory(b.id, (story) => {
    story.title = "Human title after queue";
  });
  await worker();
  await worker();
  const rejoined = await context.newPage();
  await rejoined.goto(base + "/tests/fixtures/jobs-host.html");
  await rejoined.locator(`[data-job-id="${job.id}"]`).click();
  await expect(
    rejoined.getByRole("region", { name: "Job details" }),
  ).toContainText("partial");
  await expect(
    rejoined.getByRole("region", { name: "Job details" }),
  ).toContainText("REVISION_CONFLICT");
  expect(
    (await repo.read()).backlog.find((story) => story.id === a.id).revision,
  ).toBe(2);
  expect(
    (await repo.read()).backlog.find((story) => story.id === b.id).title,
  ).toBe("Human title after queue");
  if (process.env.STUDIO_CAPTURE_JOBS_DIR) {
    mkdirSync(process.env.STUDIO_CAPTURE_JOBS_DIR, { recursive: true });
    await rejoined.screenshot({
      path: join(process.env.STUDIO_CAPTURE_JOBS_DIR, "S13.png"),
      fullPage: true,
    });
    await rejoined
      .getByRole("button", { name: "Refresh jobs", exact: true })
      .focus();
    await rejoined.screenshot({
      path: join(process.env.STUDIO_CAPTURE_JOBS_DIR, "S14.png"),
      fullPage: true,
    });
  }
  await rejoined.getByRole("button", { name: "Switch fixture brand" }).click();
  await expect(
    rejoined.getByRole("region", { name: "Job history" }),
  ).toContainText("No jobs yet");
  await expect(
    rejoined.getByRole("region", { name: "Job details" }),
  ).toHaveCount(0);
});
test("lost queue response retries identical plan key and browser reload resolves one durable job", async ({
  page,
}) => {
  await source("Lost response campaign");
  await login(page);
  const before = (
    await (await page.request.get(base + "/api/studio/jobs" + scope)).json()
  ).jobs.length;
  await openNewPlan(page);
  await page.getByLabel("Plan Lost response campaign", { exact: true }).check();
  await page.getByLabel(/I reviewed these 1 campaigns/).check();
  let lose = true;
  const keys = [];
  await page.route("**/api/studio/jobs?**", async (route) => {
    if (route.request().method() !== "POST") return route.continue();
    keys.push(route.request().postDataJSON().idempotencyKey);
    if (lose) {
      lose = false;
      await route.fetch();
      await route.abort("failed");
    } else await route.continue();
  });
  await page
    .getByRole("button", { name: "Queue reviewed plan", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "Retry same job request" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Retry same job request" }).click();
  await expect(
    page.getByRole("button", { name: "Retry same job request" }),
  ).toHaveCount(0);
  expect(keys).toHaveLength(2);
  expect(keys[0]).toBe(keys[1]);
  const jobs = (
    await (await page.request.get(base + "/api/studio/jobs" + scope)).json()
  ).jobs;
  expect(jobs).toHaveLength(before + 1);
  await page.reload();
  await expect(page.getByRole("region", { name: "Job history" }).locator(`[data-job-id="${jobs.at(-1).id}"]`)).toBeVisible();
});

test('pending queue and same-key retry show progress; only a lost response offers recovery', async ({ page }) => {
  await source('Pending progress campaign');
  await login(page);
  const before = (await (await page.request.get(base + '/api/studio/jobs' + scope)).json()).jobs.length;
  await openNewPlan(page);
  await page.getByLabel('Plan Pending progress campaign', { exact: true }).check();
  await expect(page.getByLabel(/I reviewed these 1 campaigns/)).toBeVisible();
  expect(await page.locator('.new-plan').evaluate(element=>element.open)).toBe(true);
  await page.getByLabel(/I reviewed these 1 campaigns/).check();
  let release, entered;
  const seen = new Promise(resolve => { entered = resolve; });
  const held = new Promise(resolve => { release = resolve; });
  let mode = 'pending', calls = 0;
  const keys = [];
  await page.route('**/api/studio/jobs?**', async route => {
    if (route.request().method() !== 'POST') return route.continue();
    calls++; keys.push(route.request().postDataJSON().idempotencyKey);
    const response = await route.fetch();
    if (mode === 'pending') { entered(); await held; await route.fulfill({ response }); }
    else if (mode === 'lost') await route.abort('failed');
    else { entered(); await held; await route.fulfill({ response }); }
  });
  try {
    await page.getByRole('button', { name: 'Queue reviewed plan', exact: true }).click();
    await seen;
    await expect(page.getByRole('status').filter({ hasText: 'Saving job request…' })).toBeVisible();
    await expect(page.getByText('The response may have been lost.', { exact: false })).toHaveCount(0);
    await expect(page.getByRole('button', { name: 'Retry same job request', exact: true })).toHaveCount(0);
    await expect(page.getByRole('button', { name: 'Queue reviewed plan', exact: true })).toBeDisabled();
    release();
    await expect(page.getByRole('region', { name: 'Job details' })).toBeVisible();
    await expect(page.getByRole('status').filter({ hasText: 'Saving job request…' })).toHaveCount(0);
    await expect(page.getByText('The response may have been lost.', { exact: false })).toHaveCount(0);
    expect(calls).toBe(1);
    // A second real durable write loses its response; only then is its retained key uncertain.
    await page.reload();
    await openNewPlan(page);
    await page.getByLabel('Plan Pending progress campaign', { exact: true }).check();
    await page.getByLabel(/I reviewed these 1 campaigns/).check();
    mode = 'lost';
    await page.getByRole('button', { name: 'Queue reviewed plan', exact: true }).click();
    await expect(page.getByText('The response may have been lost.', { exact: false })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Retry same job request', exact: true })).toBeVisible();
    await page.unroute('**/api/studio/jobs?**');
    let resume, captured;
    const retrySeen = new Promise(resolve => { captured = resolve; });
    const retryHeld = new Promise(resolve => { resume = resolve; });
    release = resume;
    await page.route('**/api/studio/jobs?**', async route => {
      if (route.request().method() !== 'POST') return route.continue();
      calls++; keys.push(route.request().postDataJSON().idempotencyKey);
      const response = await route.fetch(); captured(); await retryHeld; await route.fulfill({ response });
    });
    await page.getByRole('button', { name: 'Retry same job request', exact: true }).click();
    await retrySeen;
    await expect(page.getByRole('status').filter({ hasText: 'Saving job request…' })).toBeVisible();
    await expect(page.getByText('The response may have been lost.', { exact: false })).toHaveCount(0);
    resume();
    await expect(page.getByRole('region', { name: 'Job details' })).toBeVisible();
    await expect(page.getByRole('status').filter({ hasText: 'Saving job request…' })).toHaveCount(0);
    expect(keys).toHaveLength(3); expect(keys[1]).toBe(keys[2]); expect(keys[0]).not.toBe(keys[1]);
    expect((await (await page.request.get(base + '/api/studio/jobs' + scope)).json()).jobs).toHaveLength(before + 2);
  } finally { release?.(); }
});
