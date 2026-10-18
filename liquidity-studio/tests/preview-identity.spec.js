import { test, expect } from "@playwright/test";
import { randomBytes } from "node:crypto";
import { mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { createPlatform } from "../server/platform.js";
import { createHttpServer } from "../server/index.js";
import { DurableStore } from "../server/storage.js";
let platform, server, base;
const password = randomBytes(24).toString("base64url");
const scope = "?organizationId=org_default&brandId=brand_default";
const evidence = resolve("../docs/design-review/issue-68/after-v1");
test.beforeAll(async () => {
  process.env.AI_ALLOW_SYNTHETIC = "true";
  platform = createPlatform({
    authMode: "password",
    store: new DurableStore(":memory:"),
  });
  await platform.ready;
  await platform.identity.provision({
    username: "preview-reviewer",
    password,
    role: "founder",
  });
  server = createHttpServer(null, { platform });
  await new Promise((r) => server.listen(0, "127.0.0.1", r));
  base = `http://127.0.0.1:${server.address().port}`;
});
test.afterAll(async () => {
  server.closeAllConnections();
  await new Promise((r) => server.close(r));
  await platform.store.close();
});
async function setup(page) {
  await page.goto(base);
  await page.getByLabel("Username", { exact: true }).fill("preview-reviewer");
  await page.getByLabel("Password", { exact: true }).fill(password);
  await page.getByRole("button", { name: "Sign in →" }).click();
  await expect(
    page.getByRole("heading", { name: "Good stories, next up." }),
  ).toBeVisible();
  const response = await page.request.post(
    base + "/api/studio/backlog" + scope,
    {
      data: {
        title: "Preview identity controlled fixture",
        category: "Source notes",
        sourceClaims: [
          {
            id: "s",
            text: "The source describes a signed media agreement.",
            sourceUrl: "https://example.org/fixture",
            kind: "general",
            status: "approved",
          },
        ],
      },
    },
  );
  expect(response.status()).toBe(201);
  await page.reload();
  await page
    .locator(".story-row")
    .filter({ hasText: "Preview identity controlled fixture" })
    .getByRole("button", { name: "Open story" })
    .click();
  await page
    .getByRole("button", { name: "Generate four-format draft" })
    .click();
  await expect(page.getByLabel("Headline", { exact: true })).toBeVisible();
}
async function shot(page, id) {
  if (process.env.CAPTURE_ISSUE68 === "true") {
    mkdirSync(evidence, { recursive: true });
    await page.locator(".emulator").scrollIntoViewIfNeeded();
    await page
      .locator(".emulator")
      .screenshot({ path: resolve(evidence, id + ".png") });
    writeFileSync(
      resolve(evidence, id + ".json"),
      JSON.stringify(
        {
          stepId: id,
          canonicalAnnotationIds:
            id === "S18" ? ["review-11"] : id === "S21" ? ["review-13"] : [],
          fixture:
            "new controlled source-backed synthetic campaign, not the baseline recovery story",
          capturedAt: new Date().toISOString(),
          identity: await page.locator(".artifact-identity").innerText(),
          preflight: await page.locator(".evidence").innerText(),
        },
        null,
        2,
      ) + "\n",
    );
  }
}
test("S17–S21 identifies projection and locates measured text with current persisted identity", async ({
  page,
}) => {
  await setup(page);
  await page.getByRole("button", { name: "Carousel 4 slides" }).click();
  await page.getByRole("button", { name: "Design Mode", exact: true }).click();
  await expect(page.getByLabel("Preview artifact identity")).toContainText(
    "Selected: carousel",
  );
  await expect(page.locator(".evidence")).toContainText(
    "Measured carousel-page-1",
  );
  await shot(page, "S17");
  await page.getByRole("button", { name: "3×3 Profile Grid" }).click();
  await expect(page.getByLabel("Preview artifact identity")).toContainText(
    "Showing: feed infographic projection",
  );
  await expect(page.getByLabel("Preview artifact identity")).toContainText(
    "Selected: carousel",
  );
  await expect(page.locator(".evidence")).toContainText(
    "Grid projection is not measured",
  );
  await expect(page.locator(".measurements")).toHaveCount(0);
  await shot(page, "S18");
  await page.getByRole("button", { name: "Story 9:16", exact: true }).click();
  await page
    .getByRole("button", { name: "In-Situ Instagram", exact: true })
    .click();
  await page.getByLabel("Safe zones", { exact: true }).check();
  await expect(page.locator(".evidence")).toContainText(
    "Measured story-page-1",
  );
  await shot(page, "S19");
  await page.getByRole("button", { name: "Reel 30s script" }).click();
  await expect(page.locator(".evidence")).toContainText("Measured reel-page-1");
  await shot(page, "S20");
  await page.getByLabel("Reel scrubber").focus();
  const locate = page
    .getByRole("button", { name: /Locate reel-page-1-/ })
    .first();
  await expect(locate).toBeVisible();
  const id = (await locate.getAttribute("aria-label")).replace("Locate ", "");
  await locate.click();
  await expect(
    page.locator(".artwork [data-preflight-highlight]"),
  ).toHaveAttribute("data-artwork-id", id);
  await expect(
    page.locator(".artwork [data-preflight-highlight]"),
  ).toBeFocused();
  await shot(page, "S21");
  const records = await (
    await page.request.get(base + "/api/admin/eject" + scope)
  ).json();
  const record = records.data.preflights.findLast((r) => r.format === "reel");
  expect(record.settings.viewContext.measurementRevision).toBeTruthy();
  expect(record.violations.some((v) => v.artworkElementId === id)).toBe(true);
  const api = await page.request.post(base + "/api/studio/preflight" + scope, {
    data: {
      storyId: record.storyId,
      expectedRevision: record.storyRevision,
      format: "reel",
      canvas: { width: 1080, height: 1920 },
      textBoxes: [
        {
          artworkElementId: "reel-page-1-heading",
          text: "API fixture",
          x: 1000,
          y: 10,
          width: 100,
          height: 40,
        },
      ],
      foreground: "#ffffff",
      background: "#000000",
      viewContext: {
        mode: "design",
        frameIndex: 0,
        storyFrame: 0,
        pollVote: null,
        measuredAt: new Date().toISOString(),
        measurementRevision: "api-regression",
        artworkId: "reel-page-1",
      },
    },
  });
  expect(api.status()).toBe(200);
  const result = await api.json();
  expect(result.artifact.storyRevision).toBe(record.storyRevision);
  expect(result.artifact.viewContext.artworkId).toBe("reel-page-1");
  expect(result.violations[0].artworkElementId).toBe("reel-page-1-heading");
  const request = {
    storyId: record.storyId,
    expectedRevision: record.storyRevision,
    format: "reel",
    canvas: { width: 1080, height: 1920 },
    textBoxes: [],
    viewContext: {
      mode: "design",
      frameIndex: 0,
      storyFrame: 0,
      pollVote: null,
      measuredAt: new Date().toISOString(),
      artworkId: "story-page-1",
    },
  };
  expect(
    (
      await page.request.post(base + "/api/studio/preflight" + scope, {
        data: request,
      })
    ).status(),
  ).toBe(400);
  request.viewContext.artworkId = "reel-page-1";
  request.expectedRevision = -1;
  expect(
    (
      await page.request.post(base + "/api/studio/preflight" + scope, {
        data: request,
      })
    ).status(),
  ).toBe(409);
  await page.getByLabel("Spoken hook", { exact: true }).fill("Unsaved hook");
  await expect(page.locator(".artifact-identity")).toContainText(
    "unsaved changes",
  );
  await expect(page.locator(".measurements")).toHaveCount(0);
  await expect(
    page.getByRole("button", { name: "Measure again" }),
  ).toBeDisabled();
});
test("late font and API work cannot restore preflight after view invalidation", async ({
  page,
}) => {
  await setup(page);
  await page.evaluate(() => {
    window.releaseFonts = null;
    Object.defineProperty(document.fonts, "ready", {
      configurable: true,
      value: new Promise((r) => (window.releaseFonts = r)),
    });
  });
  await page.getByRole("button", { name: "Measure again" }).click();
  await page.getByRole("button", { name: "Carousel 4 slides" }).click();
  await page.getByRole("button", { name: "3×3 Profile Grid" }).click();
  await page.evaluate(() => window.releaseFonts());
  await expect(page.locator(".measurements")).toHaveCount(0);
  await expect(page.locator(".evidence")).toContainText(
    "Grid projection is not measured",
  );
  let release,
    done,
    held = false;
  const gate = new Promise((r) => (release = r)),
    finished = new Promise((r) => (done = r));
  await page.route("**/api/studio/preflight?*", async (route) => {
    const body = route.request().postDataJSON();
    if (body.format === "carousel" && !held) {
      held = true;
      const response = await route.fetch();
      await gate;
      await route.fulfill({ response });
      done();
    } else await route.continue();
  });
  await page.getByRole("button", { name: "Design Mode", exact: true }).click();
  await expect.poll(() => held).toBe(true);
  await page.getByRole("button", { name: "Story 9:16", exact: true }).click();
  await expect(page.locator(".evidence")).toContainText(
    "Measured story-page-1",
  );
  release();
  await finished;
  await page.unroute("**/api/studio/preflight?*");
  await expect(page.locator(".evidence")).not.toContainText(
    "Measured carousel-page",
  );
  await expect(page.locator(".evidence")).toContainText(
    "Measured story-page-1",
  );
  await expect(page.getByTestId("recorded-preflight")).toContainText(
    "Recorded story",
  );
  await page.locator(".artwork svg").evaluate((node) => node.remove());
  await page.getByRole("button", { name: "Measure again" }).click();
  await expect(page.locator(".measurements")).toHaveCount(0);
  await expect(page.locator(".evidence")).toContainText(
    /No rendered SVG text|no measurable dimensions/,
  );
  await expect(page.getByTestId("recorded-preflight")).toHaveCount(0);
});
