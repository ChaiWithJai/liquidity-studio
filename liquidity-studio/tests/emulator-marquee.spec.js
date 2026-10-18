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
    page.getByRole("heading", { name: "Story backlog", exact: true }),
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

test("saved Reel motion and simulated waveform share a pausable scrubber; only paused frames are measured", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await signIn(page);
  await seed(page, "Saved Reel pacing fixture");
  await page.getByRole("button", { name: "Reel 30s script", exact: true }).click();
  // Save the original feature plan's 0–3 / 3–15 / 15–30 timing through the UI.
  // The generic synthetic fixture defaults to a five-second first beat.
  for (const [index, timecode] of ['0:00-0:03', '0:03-0:15', '0:15-0:30'].entries())
    await page.getByLabel(`Beat ${index + 1} Time range`, { exact: true }).fill(timecode);
  await page.getByRole('button', { name: 'Save changes', exact: true }).click();
  const title = page.locator('.kinetic-reel text[data-artwork-id$="-heading"]');
  const bars = page.locator('.pacing-bars');
  await expect(title).toBeVisible();
  await expect(page.getByLabel("Simulated waveform, no audio playback")).toBeVisible();
  const initial = await title.evaluate(el => getComputedStyle(el).transform);
  await page.getByRole("button", { name: "Play reel", exact: true }).click();
  await expect.poll(() => title.evaluate(el => getComputedStyle(el).transform)).not.toBe(initial);
  await expect(page.getByRole("button", { name: "Measure again", exact: true })).toBeDisabled();
  await expect(page.getByText("Pause the Reel to measure its current frame.", { exact: false })).toBeVisible();
  const measured = page.waitForResponse(response => response.url().includes('/api/studio/preflight') && response.request().postDataJSON()?.format === 'reel' && response.request().postDataJSON()?.viewContext?.playheadSeconds > 0);
  await page.getByRole("button", { name: "Pause reel", exact: true }).click();
  const paused = await page.getByTestId('active-beat').getAttribute('data-playhead');
  const wave = await bars.evaluate(el => el.innerHTML);
  await page.waitForTimeout(120);
  expect(await page.getByTestId('active-beat').getAttribute('data-playhead')).toBe(paused);
  expect(await bars.evaluate(el => el.innerHTML)).toBe(wave);
  const response = await measured;
  expect(response.status()).toBe(200);
  expect((await response.json()).artifact.viewContext.playheadSeconds).toBe(Number(paused));
  const body = response.request().postDataJSON();
  for (const playheadSeconds of [-1, 31, '3', null]) {
    const rejected = await page.request.post(response.url(), { data: { ...body, viewContext: { ...body.viewContext, playheadSeconds } } });
    expect(rejected.status()).toBe(400);
  }
  const scrub = async value => page.getByLabel('Reel scrubber').evaluate((el, value) => { el.value = value; el.dispatchEvent(new Event('input', { bubbles: true })); }, String(value));
  await page.getByRole('button', { name: 'Play reel', exact: true }).click();
  await scrub(3.25);
  await expect(page.getByRole('button', { name: 'Play reel', exact: true })).toBeVisible();
  await expect(page.getByTestId('active-beat')).toContainText('BEAT 2');
  expect(await title.evaluate(el => getComputedStyle(el).transform)).not.toBe('none');
  await scrub(15.25);
  await expect(page.getByTestId('active-beat')).toContainText('BEAT 3');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  expect(await title.evaluate(el => getComputedStyle(el).transform)).toBe('none');
  expect(await bars.locator('i').first().evaluate(el => getComputedStyle(el).height)).toBe('8px');
  expect(await page.locator('audio,video').count()).toBe(0);
  await page.getByText('Advanced format JSON', { exact: true }).click();
  const reel = JSON.parse(await page.getByLabel('Format content', { exact: true }).inputValue());
  reel.beats[0].onScreenText = 'Saved motion revision';
  await page.getByLabel('Format content', { exact: true }).fill(JSON.stringify(reel));
  await page.getByRole('button', { name: 'Save changes', exact: true }).click();
  await expect(title).toContainText('Saved motion revision');
  await expect(page.getByTestId('active-beat')).toHaveAttribute('data-playhead', '0');
});
