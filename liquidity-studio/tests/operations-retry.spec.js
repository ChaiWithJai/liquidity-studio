import { test, expect } from "@playwright/test";
import { randomBytes } from "node:crypto";
import { DurableStore } from "../server/storage.js";
import { createPlatform } from "../server/platform.js";
import { createHttpServer } from "../server/index.js";
let platform, server, base, failedJob;
const password = randomBytes(20).toString("base64url");
test.beforeAll(async () => {
  platform = createPlatform({ store: new DurableStore(":memory:") });
  await platform.ready;
  await platform.identity.provision({
    username: "retry-founder",
    password,
    role: "founder",
  });
  const repo = (
    await platform.forScope({
      organizationId: "org_default",
      brandId: "brand_default",
      preset: "liquidity_desk",
    })
  ).ports.repo;
  const claim = await repo.claimJob("browser-failed-fixture");
  failedJob = await repo.updateJob(claim.job.jobId, {
    status: "FAILED",
    errorCode: "BROWSER_FIXTURE_FAILURE",
  });
  server = createHttpServer(null, { platform });
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  base = `http://127.0.0.1:${server.address().port}`;
});
test.afterAll(async () => {
  server?.closeAllConnections();
  await new Promise((resolve) => server.close(resolve));
  platform.store.close();
});
test("founder retries a failed scoped batch using a fresh key and explicit parent", async ({
  page,
}) => {
  await page.goto(base);
  await page.getByLabel("Username", { exact: true }).fill("retry-founder");
  await page.getByLabel("Password", { exact: true }).fill(password);
  await page.getByRole("button", { name: "Sign in →" }).click();
  await page.getByRole("button", { name: "Operations", exact: true }).click();
  const request = page.waitForRequest(
    (request) =>
      request.url().includes("/api/admin/run-weekly-batch") &&
      request.method() === "POST",
  );
  await page.getByRole("button", { name: /Retry failed batch/ }).click();
  const payload = (await request).postDataJSON();
  expect(payload.retryOfJobId).toBe(failedJob.jobId);
  expect(payload.idempotencyKey).not.toBe("browser-failed-fixture");
  await expect(
    page.getByRole("status").filter({ hasText: "Retry completed." }),
  ).toBeVisible();
  const repo = (
    await platform.forScope({
      organizationId: "org_default",
      brandId: "brand_default",
      preset: "liquidity_desk",
    })
  ).ports.repo;
  const history = (await repo.read()).jobs;
  expect(history[0].retryOfJobId).toBe(failedJob.jobId);
  expect(history[0].attempt).toBe(2);
  expect(history[0].status).toBe("COMPLETED");
});
