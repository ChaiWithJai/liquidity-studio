import { test, expect } from "@playwright/test";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { randomBytes } from "node:crypto";
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
async function seed(page) {
  const response = await page.request.post(
    base + "/api/studio/backlog" + scope,
    {
      data: {
        title: "Browser source fixture",
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
    .filter({ hasText: "Browser source fixture" })
    .getByRole("button", { name: "Open story" })
    .click();
  await page
    .getByRole("button", { name: "Generate four-format draft" })
    .click();
  await expect(page.getByLabel("Headline", { exact: true })).toBeVisible();
}
test("saved edits, download and all interactive emulator surfaces use scoped real APIs", async ({
  page,
}) => {
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await signIn(page);
  await seed(page);
  await expect(
    page.getByText("Synthetic draft · source review required", { exact: true }),
  ).toBeVisible();
  await expect(page.getByLabel("Assigned day")).toHaveValue("Monday");
  await page
    .getByLabel("Headline", { exact: true })
    .fill("AN EDITED SOURCE NOTE");
  await page
    .getByLabel("Caption", { exact: true })
    .fill("The source describes a signed media agreement. ".repeat(6));
  await page.getByRole("button", { name: "Save changes", exact: true }).click();
  await expect(
    page.getByRole("status").filter({ hasText: "Changes saved." }),
  ).toBeVisible();
  console.log("Saved real API edit");
  await page
    .getByRole("button", { name: "Story backlog", exact: true })
    .click();
  await page
    .locator(".story-row")
    .filter({ hasText: "Browser source fixture" })
    .getByRole("button", { name: "Open draft" })
    .click();
  await expect(page.getByLabel("Headline", { exact: true })).toHaveValue(
    "AN EDITED SOURCE NOTE",
  );
  await page.reload();
  await page
    .locator(".story-row")
    .filter({ hasText: "Browser source fixture" })
    .getByRole("button", { name: "Open draft" })
    .click();
  await expect(page.getByLabel("Headline", { exact: true })).toHaveValue(
    "AN EDITED SOURCE NOTE",
  );
  await page.getByRole("button", { name: "… more", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "less", exact: true }),
  ).toBeVisible();
  await page.getByLabel("Like post", { exact: true }).click();
  await expect(page.getByLabel("Like post", { exact: true })).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  await page.locator(".asset-stage").dblclick();
  await page.getByLabel("Save post locally").click();
  await expect(page.getByLabel("Save post locally")).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  console.log("Navigation reload and feed interactions verified");
  await page.getByRole("button", { name: "Export PNG" }).click();
  await expect(page.locator(".download a")).toBeVisible();
  const file = await page.request.get(
    base + (await page.locator(".download a").getAttribute("href")),
  );
  expect(file.status()).toBe(200);
  expect(file.headers()["content-type"]).toContain("image/png");
  expect((await file.body()).subarray(1, 4).toString()).toBe("PNG");
  await page
    .getByLabel("Headline", { exact: true })
    .fill("AFTER DOWNLOAD SOURCE NOTE");
  await page.getByRole("button", { name: "Save changes", exact: true }).click();
  await expect(
    page.getByRole("status").filter({ hasText: "Changes saved." }),
  ).toBeVisible();
  console.log("PNG download bytes and post-export revision verified");
  await page.getByRole("button", { name: "Carousel 4 slides" }).click();
  await expect(page.locator(".slide-count")).toHaveText("1/4");
  await page.getByLabel("Next slide").click();
  await expect(page.locator(".slide-count")).toHaveText("2/4");
  await page
    .getByRole("heading", { name: "Campaign Studio", exact: true })
    .click();
  await page.keyboard.press("ArrowRight");
  await expect(page.locator(".slide-count")).toHaveText("3/4");
  const bounds = await page.locator(".asset-stage").boundingBox();
  await page.mouse.move(bounds.x + bounds.width * 0.8, bounds.y + 100);
  await page.mouse.down();
  await page.mouse.move(bounds.x + 20, bounds.y + 100);
  await page.mouse.up();
  await expect(page.locator(".slide-count")).toHaveText("4/4");
  await page.locator(".asset-stage").evaluate((stage) => {
    const svg = stage.querySelector("svg");
    const svgBounds = svg.getBoundingClientRect();
    const button = stage.querySelector(".next").getBoundingClientRect();
    const scale = svg.viewBox.baseVal.width / svgBounds.width;
    const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
    text.setAttribute("x", String((button.x - svgBounds.x) * scale));
    text.setAttribute(
      "y",
      String((button.y + button.height * 0.7 - svgBounds.y) * scale),
    );
    text.setAttribute("font-size", "26");
    text.setAttribute("fill", "#ffffff");
    text.textContent = "Navigation occlusion fixture";
    svg.append(text);
  });
  await page
    .getByRole("button", { name: "Measure again", exact: true })
    .click();
  await expect
    .poll(async () => {
      const dump = await (
        await page.request.get(base + "/api/admin/eject" + scope)
      ).json();
      const check = dump.data.preflights.at(-1);
      return (
        check.format === "carousel" &&
        check.metrics.obstructionElementsCount >= 3 &&
        check.metrics.occludedElementsCount > 0
      );
    })
    .toBe(true);
  console.log("Carousel mouse/keyboard/swipe verified");
  await page.getByRole("button", { name: "Story 9:16", exact: true }).click();
  await page.getByRole("button", { name: "Investigate", exact: true }).click();
  await expect(
    page.getByText("Your one local vote · simulated result"),
  ).toBeVisible();
  await page.getByLabel("Play story").click();
  await expect(page.locator(".timer-bars i").first()).not.toHaveAttribute(
    "style",
    "width: 0%;",
  );
  await page.getByLabel("Safe zones", { exact: true }).check();
  await expect(page.getByLabel("Simulated safe-zone overlay")).toBeVisible();
  await page.getByRole("button", { name: "Reel 30s script" }).click();
  await page.getByText("Advanced format JSON", { exact: true }).click();
  const reel = JSON.parse(
    await page.getByLabel("Format content", { exact: true }).inputValue(),
  );
  reel.beats[0].onScreenText = "FIRST BEAT VISUAL";
  reel.beats[1].onScreenText = "SECOND BEAT VISUAL";
  reel.beats[2].onScreenText = "THIRD BEAT VISUAL";
  await page
    .getByLabel("Format content", { exact: true })
    .fill(JSON.stringify(reel));
  await page.getByRole("button", { name: "Save changes", exact: true }).click();
  await expect(page.locator(".artwork svg")).toContainText("FIRST BEAT VISUAL");
  await page.getByRole("button", { name: "Play reel", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Pause reel", exact: true }),
  ).toBeVisible();
  await page.getByLabel("Reel scrubber").fill("21");
  await expect(page.getByTestId("active-beat")).toContainText("BEAT 3");
  await expect(page.locator(".artwork svg")).toContainText("THIRD BEAT VISUAL");
  await expect(page.locator(".artwork svg")).not.toContainText(
    "FIRST BEAT VISUAL",
  );
  await expect(page.locator(".beat-text")).toHaveCount(0);
  await page
    .getByRole("button", { name: "3×3 Profile Grid", exact: true })
    .click();
  await expect(page.locator(".grid-cell")).toHaveCount(9);
  await expect(page.getByText("No saved post").first()).toBeVisible();
  await page
    .getByRole("button", { name: "In-Situ Instagram", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Measure again", exact: true })
    .click();
  await expect(
    page.getByText(
      "Preflight recorded for this brand. Editorial review required.",
    ),
  ).toBeVisible();
  const ejected = await (
    await page.request.get(base + "/api/admin/eject" + scope)
  ).json();
  expect(ejected.data.preflights.length).toBeGreaterThan(0);
  expect(ejected.data.preflights.at(-1).requiresReview).toBe(true);
  expect(
    ejected.data.preflights.at(-1).metrics.textElementsCount,
  ).toBeGreaterThan(0);
  await page
    .locator(".artwork [data-preflight-text]")
    .first()
    .evaluate((node) => {
      node.setAttribute("y", "10");
      node.setAttribute("fill", "#141513");
    });
  await page
    .getByRole("button", { name: "Measure again", exact: true })
    .click();
  await expect
    .poll(async () => {
      const measured = await (
        await page.request.get(base + "/api/admin/eject" + scope)
      ).json();
      return measured.data.preflights.at(-1).metrics.occludedElementsCount;
    })
    .toBeGreaterThan(0);
  const failedContrast = await (
    await page.request.get(base + "/api/admin/eject" + scope)
  ).json();
  expect(
    failedContrast.data.preflights.at(-1).metrics.contrastRatio,
  ).toBeLessThan(4.5);
  await page.getByLabel("Brand", { exact: true }).selectOption("brand_vedic");
  await expect(
    page.locator(".story-row").filter({ hasText: "Browser source fixture" }),
  ).toHaveCount(0);
  expect(errors).toEqual([]);
});
test("source review, failed generation preservation, responsive layout and unauthorized brand access", async ({
  page,
}) => {
  await signIn(page);
  await seed(page);
  const originalHeadline = await page
    .getByLabel("Headline", { exact: true })
    .inputValue();
  await page.route("**/api/studio/generate-campaign?*", (route) =>
    route.abort("failed"),
  );
  await page
    .getByRole("button", { name: "Regenerate draft", exact: true })
    .click();
  await expect(page.getByRole("alert")).toContainText(
    "Your existing draft is preserved",
  );
  await expect(page.getByLabel("Headline", { exact: true })).toHaveValue(
    originalHeadline,
  );
  await expect(
    page.getByRole("button", { name: "Regenerate draft", exact: true }),
  ).toBeEnabled();
  await page.unroute("**/api/studio/generate-campaign?*");
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(
    page.getByRole("button", { name: "In-Situ Instagram", exact: true }),
  ).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
  const unauthorized = await page.request.get(
    base + "/api/studio/bootstrap?organizationId=foreign&brandId=foreign",
  );
  expect(unauthorized.status()).toBe(403);
  await page.screenshot({
    path: "test-results/studio-mobile.png",
    fullPage: true,
  });
});

test("operator adds and reviews sources through the real UI; marketer access is separate", async ({
  page,
  browser,
}) => {
  page.on("pageerror", (error) =>
    console.error("Review UI runtime error:", error.message),
  );
  await signIn(page);
  await page.getByText("Add a story", { exact: true }).click();
  await page
    .getByLabel("Story title", { exact: true })
    .fill("UI review fixture");
  await page
    .getByLabel("Supplied facts, one per line")
    .fill("A sourced editorial statement.");
  await page
    .getByLabel("Source links, one per line")
    .fill("https://example.org/editorial-source");
  await page
    .getByRole("button", { name: "Add to backlog", exact: true })
    .click();
  await page
    .locator(".story-row")
    .filter({ hasText: "UI review fixture" })
    .getByRole("button", { name: "Open story" })
    .click();
  await page
    .getByLabel("Claim classification", { exact: true })
    .selectOption("general");
  await page
    .getByLabel("Review status", { exact: true })
    .selectOption("approved");
  await page
    .getByRole("button", { name: "Save source review", exact: true })
    .click();
  await expect(
    page.getByRole("status").filter({ hasText: "Source review saved" }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Generate four-format draft" })
    .click();
  await expect(page.getByLabel("Headline", { exact: true })).toBeVisible();
  const marketerContext = await browser.newContext();
  const marketer = await marketerContext.newPage();
  await signIn(marketer, "marketer");
  await expect(
    marketer.getByRole("button", { name: "Operations", exact: true }),
  ).toHaveCount(0);
  expect(
    (await marketer.request.get(base + "/api/admin/overview" + scope)).status(),
  ).toBe(403);
  await marketerContext.close();
});

test("CWJ positioning is labeled and an empty research topic can acquire reviewed sources", async ({
  page,
}) => {
  await signIn(page);
  const container = await platform.forScope({
    organizationId: "org_default",
    brandId: "brand_vedic",
    preset: "vedic_dharma",
  });
  await container.ports.repo.addBacklogStory({
    title: "Unreviewed research topic fixture",
    category: "Source research",
    sourceClaims: [],
    scheduledDay: "Monday",
  });
  await page.getByLabel("Brand", { exact: true }).selectOption("brand_vedic");
  await page.getByRole("button", { name: "Brand Kit", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Proposed editorial positioning" }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Research queue · unreviewed" }),
  ).toBeVisible();
  await page
    .locator(".story-row")
    .filter({ hasText: "Unreviewed research topic fixture" })
    .getByRole("button", { name: "Review sources" })
    .click();
  await page
    .getByRole("button", { name: "Add source claim", exact: true })
    .click();
  await page
    .getByLabel("Claim text", { exact: true })
    .fill("A cultural source describes its historical context.");
  await page
    .getByLabel("HTTPS source URL", { exact: true })
    .fill("https://example.org/cultural-primary-source");
  await page
    .getByLabel("Claim classification", { exact: true })
    .selectOption("cultural");
  await page
    .getByLabel("Review status", { exact: true })
    .selectOption("approved");
  await page
    .getByRole("button", { name: "Save source review", exact: true })
    .click();
  await expect(
    page.getByRole("status").filter({ hasText: "Source review saved" }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Generate four-format draft" })
    .click();
  await expect(page.getByLabel("Headline", { exact: true })).toBeVisible();
});
