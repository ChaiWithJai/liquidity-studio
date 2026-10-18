import { test, expect } from "@playwright/test";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { randomBytes, randomUUID } from "node:crypto";
import { createHttpServer } from "../server/index.js";
import { createPlatform } from "../server/platform.js";
import { DurableStore } from "../server/storage.js";
let server, platform, directory, base;
const password = randomBytes(20).toString("base64url");
const scope = "?organizationId=org_default&brandId=brand_default";
test.beforeAll(async () => {
  directory = mkdtempSync(join(tmpdir(), "studio-browser-"));
  process.env.STUDIO_FOUNDER_PASSWORD = password;
  process.env.STUDIO_MARKETER_PASSWORD = password;
  process.env.AI_ALLOW_SYNTHETIC = "true";
  platform = createPlatform({
    authMode: "password",
    store: new DurableStore(join(directory, "studio.sqlite")),
  });
  await platform.ready;
  server = createHttpServer(null, { platform });
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  base = `http://127.0.0.1:${server.address().port}`;
});
test.afterAll(async () => {
  server?.closeAllConnections();
  await new Promise((resolve) => server?.close(resolve));
  platform?.store.close();
  if (directory) rmSync(directory, { recursive: true, force: true });
});
async function signIn(page, name = "founder") {
  await page.goto(base);
  await page.getByLabel("Username", { exact: true }).fill(name);
  await page.getByLabel("Password", { exact: true }).fill(password);
  await page.getByRole("button", { name: "Sign in →" }).click();
  await expect(
    page.getByRole("heading", { name: "Good stories, next up." }),
  ).toBeVisible();
}
async function seed(page, title = "Browser source fixture") {
  const response = await page.request.post(
    base + "/api/studio/backlog" + scope,
    {
      data: {
        title,
        category: "Source notes",
        scheduledDay: "Monday",
        sourceClaims: [
          {
            id: "fixture-source",
            text: "The source describes a signed media agreement.",
            sourceUrl: "https://example.org/source",
            status: "approved",
            kind: "general",
          },
        ],
      },
    },
  );
  expect(response.status()).toBe(201);
  await page.reload();
  await page
    .locator(".story-row")
    .filter({ hasText: title })
    .getByRole("button", { name: "Open story" })
    .click();
  await page
    .getByRole("button", { name: "Generate four-format draft" })
    .click();
  await expect(page.getByLabel("Headline", { exact: true })).toBeVisible();
}
test("Reel audio label scrolls, can be paused, and remains static with reduced motion", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await signIn(page);
  await seed(page, "Audio label controlled fixture");
  await page
    .getByRole("button", { name: "Reel 30s script", exact: true })
    .click();
  const track = page.locator(".audio-track");
  await expect(track).toBeVisible();
  const before = await track.evaluate((el) => getComputedStyle(el).transform);
  await expect
    .poll(() => track.evaluate((el) => getComputedStyle(el).transform))
    .not.toBe(before);
  await page
    .getByRole("button", { name: "Pause audio label scrolling", exact: true })
    .click();
  expect(
    await track.evaluate((el) => getComputedStyle(el).animationPlayState),
  ).toBe("paused");
  await page
    .getByRole("button", { name: "Resume audio label scrolling", exact: true })
    .click();
  expect(
    await track.evaluate((el) => getComputedStyle(el).animationPlayState),
  ).toBe("running");
  await page.emulateMedia({ reducedMotion: "reduce" });
  expect(await track.evaluate((el) => getComputedStyle(el).animationName)).toBe(
    "none",
  );
  await expect(page.locator(".audio-repeat")).toBeHidden();
  await expect(page.locator(".audio-motion-toggle")).toBeHidden();
  await expect(page.locator(".audio-window")).toContainText(
    "storyboard, no audio playback",
  );
  expect(await page.locator("audio,video").count()).toBe(0);
});
