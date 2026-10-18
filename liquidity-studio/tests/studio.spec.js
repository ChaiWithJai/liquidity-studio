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
  platform = createPlatform({authMode: "password",
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
  await expect(page.getByText("No scheduled or exported post").first()).toBeVisible();
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


test("profile grid uses real scheduled/exported records and excludes ordinary drafts", async ({ page }) => {
  await signIn(page);
  const make = async (title, day, status) => {
    const created = await page.request.post(base + "/api/studio/backlog" + scope, {data:{
      title, scheduledDay:day, sourceClaims:[{id:"grid-source",text:"The source describes a signed media agreement.",sourceUrl:"https://example.org/source",status:"approved",kind:"general"}]
    }});
    expect(created.status()).toBe(201);
    const {story} = await created.json();
    const generated = await page.request.post(base + "/api/studio/generate-campaign" + scope, {data:{storyId:story.id}});
    expect(generated.status()).toBe(200);
    if (status === "Scheduled") {
      const scheduled = await page.request.post(base + "/api/studio/schedule" + scope, {data:{storyId:story.id,status,scheduledDay:day}});
      expect(scheduled.status()).toBe(200);
    }
    if (status === "Exported") {
      const exported = await page.request.post(base + "/api/studio/export-asset" + scope, {data:{storyId:story.id,format:"infographic"}});
      expect(exported.status()).toBe(201);
    }
    return story;
  };
  await make("Grid Thursday scheduled", "Thursday", "Scheduled");
  await make("Grid Tuesday scheduled", "Tuesday", "Scheduled");
  await make("Grid actual export", "Monday", "Exported");
  await make("Grid ordinary draft excluded", "Monday", "Draft Ready");
  await make("Grid active draft", "Monday", "Draft Ready");
  await page.reload();
  await page.locator(".story-row").filter({hasText:"Grid active draft"}).getByRole("button",{name:"Open draft"}).click();
  await page.getByRole("button",{name:"3×3 Profile Grid",exact:true}).click();
  const cells = page.locator(".grid-cell");
  await expect(cells).toHaveCount(9);
  await expect(cells.nth(0)).toContainText("Active");
  await expect(cells.nth(1)).toContainText("Scheduled · Tuesday");
  await expect(cells.nth(2)).toContainText("Scheduled · Thursday");
  await expect(cells.nth(3)).toContainText("Exported");
  await expect(cells.nth(1)).toHaveAttribute("title", /^Grid Tuesday scheduled · feed infographic/);
  await expect(cells.nth(3)).toHaveAttribute("title", /^Grid actual export · feed infographic/);
  await expect(page.locator('.grid-cell[title^="Grid ordinary draft excluded"]')).toHaveCount(0);
  await expect(page.locator(".profile-grid")).not.toContainText("ordinary draft excluded");
  await expect(cells.nth(4)).toContainText("No scheduled or exported post");
});


test("seeded finance claims can be reduced to one supported reviewed source", async ({ page }) => {
  await signIn(page);
  await page.locator(".story-row").filter({hasText:"Angel City FC"}).getByRole("button",{name:"Open story"}).click();
  await expect(page.getByLabel("Claim text",{exact:true})).toHaveCount(3);
  await page.getByRole("button",{name:"Remove claim 3",exact:true}).click();
  await page.getByRole("button",{name:"Remove claim 2",exact:true}).click();
  await expect(page.getByLabel("Claim text",{exact:true})).toHaveCount(1);
  await page.getByLabel("Claim text",{exact:true}).fill("The source describes a signed media agreement.");
  await page.getByLabel("HTTPS source URL",{exact:true}).fill("https://example.org/source-reviewed-for-test");
  await page.getByLabel("Claim classification",{exact:true}).selectOption("financial");
  await page.getByLabel("Review status",{exact:true}).selectOption("approved");
  await page.getByRole("button",{name:"Save source review",exact:true}).click();
  await expect(page.getByRole("status").filter({hasText:"Source review saved"})).toBeVisible();
  await page.getByRole("button",{name:"Generate four-format draft",exact:true}).click();
  await expect(page.getByLabel("Headline",{exact:true})).toBeVisible();
  await page.getByText("Review source claims",{exact:true}).click();
  await expect(page.getByRole("button",{name:"Remove claim 1",exact:true})).toBeVisible();
  await page.getByRole("button",{name:"Remove claim 1",exact:true}).click();
  await page.getByRole("button",{name:"Save source review",exact:true}).click();
  await expect(page.getByRole("alert")).toContainText("Add at least one sourced claim before saving the review.");
  const bootstrap = await (await page.request.get(base + "/api/studio/bootstrap" + scope)).json();
  const saved = bootstrap.backlog.find(story => story.id === "story_angel_city");
  expect(saved.sourceClaims).toHaveLength(1);
  expect(saved.sourceClaims[0].status).toBe("approved");
});

test("scope loading hides previous brand data and actions until real bootstrap completes", async ({ page }) => {
  await signIn(page);
  await expect(page.locator(".story-row").first()).toBeVisible();
  const oldTitle = await page.locator(".story-row h3").first().textContent();
  const targetResponse = await page.request.get(base + "/api/studio/bootstrap?organizationId=org_default&brandId=brand_vedic");
  expect(targetResponse.status()).toBe(200);
  const target = await targetResponse.json();
  let release;
  const held = new Promise(resolve => { release = resolve; });
  await page.route("**/api/studio/bootstrap?*", async route => {
    const response = await route.fetch();
    await held;
    await route.fulfill({ response });
  });
  await page.getByLabel("Brand", { exact: true }).selectOption("brand_vedic");
  await expect(page.getByRole("status")).toContainText("Loading Chai With Jai workspace");
  await expect(page.locator(".story-row")).toHaveCount(0);
  await expect(page.getByRole("button", { name: /Open (story|draft)/ })).toHaveCount(0);
  await page.getByRole("button", { name: "Brand Kit", exact: false }).click();
  await expect(page.getByLabel("Brand name", { exact: true })).toHaveCount(0);
  release();
  await expect(page.getByRole("status").filter({ hasText: "Loading" })).toHaveCount(0);
  await page.getByRole("button", { name: "Story backlog", exact: false }).click();
  await expect(page.locator(".story-row")).toHaveCount(target.backlog.length);
  await expect(page.locator(".story-row").filter({ hasText: target.backlog[0].title })).toBeVisible();
  await expect(page.locator(".story-row").filter({ hasText: oldTitle })).toHaveCount(0);
});

test("failed scope bootstrap leaves an error without previous brand data", async ({ page }) => {
  await signIn(page);
  await expect(page.locator(".story-row").first()).toBeVisible();
  await page.route("**/api/studio/bootstrap?*", route => route.fulfill({status:503,contentType:"application/json",body:JSON.stringify({error:"Scope bootstrap unavailable"})}));
  await page.getByLabel("Brand", { exact: true }).selectOption("brand_vedic");
  await expect(page.getByRole("alert")).toContainText("Scope bootstrap unavailable");
  await expect(page.locator(".story-row")).toHaveCount(0);
  await expect(page.getByRole("status").filter({ hasText: "Loading" })).toHaveCount(0);
});

test("reversed scope responses cannot replace the latest brand or clear its loading state", async ({ page }) => {
  await signIn(page);
  await expect(page.locator(".story-row").first()).toBeVisible();
  const oldTitle = await page.locator(".story-row h3").first().textContent();
  const pending = [];
  await page.route("**/api/studio/bootstrap?*", async route => {
    const response = await route.fetch();
    await new Promise(resolve => pending.push(async () => { await route.fulfill({response}); resolve(); }));
  });
  await page.getByLabel("Brand", { exact: true }).selectOption("brand_vedic");
  await expect.poll(() => pending.length).toBe(1);
  await page.getByLabel("Brand", { exact: true }).selectOption("brand_default");
  await expect.poll(() => pending.length).toBe(2);
  await pending[1]();
  await expect(page.locator(".story-row").filter({ hasText: oldTitle })).toBeVisible();
  await pending[0]();
  await expect(page.getByLabel("Brand", { exact: true })).toHaveValue("brand_default");
  await expect(page.locator(".story-row").filter({ hasText: oldTitle })).toBeVisible();
  await expect(page.getByRole("alert")).toHaveCount(0);
  // An older response settling first must not dismiss the latest pending view either.
  await page.getByLabel("Brand", { exact: true }).selectOption("brand_vedic");
  await expect.poll(() => pending.length).toBe(3);
  await page.getByLabel("Brand", { exact: true }).selectOption("brand_default");
  await expect.poll(() => pending.length).toBe(4);
  await pending[2]();
  await expect(page.getByRole("status")).toContainText("Loading");
  await expect(page.locator(".story-row")).toHaveCount(0);
  await pending[3]();
  await expect(page.locator(".story-row").filter({ hasText: oldTitle })).toBeVisible();
  await expect(page.getByRole("status").filter({ hasText: "Loading" })).toHaveCount(0);
});

test("source review prerequisites block UI and API, focus stable claims and recover saved review", async ({ page }) => {
  await page.setViewportSize({width:1280,height:720});
  await signIn(page);
  const source = { id: "stable-review-claim", text: "A reviewed excerpt for prerequisite testing.", sourceUrl: "https://example.org/review", kind: "general", status: "unreviewed" };
  const response = await page.request.post(base + "/api/studio/backlog" + scope, {data:{title:"Prerequisite fixture",category:"Review",scheduledDay:"Monday",sourceClaims:[source]}});
  expect(response.status()).toBe(201);
  const story = (await response.json()).story;
  await page.reload();
  await page.locator(".story-row").filter({hasText:"Prerequisite fixture"}).getByRole("button",{name:"Open story"}).click();
  await expect(page.getByRole("button",{name:"Generate draft",exact:true})).toBeDisabled();
  await expect(page.getByRole("button",{name:"Generate four-format draft",exact:true})).toBeDisabled();
  await page.screenshot({path:"test-results/source-review-S03-after.png"});
  const bypass = await page.request.post(base + "/api/studio/generate-campaign" + scope,{data:{storyId:story.id}});
  expect(bypass.ok()).toBe(false);
  await page.getByRole("button",{name:/Approve at least one sourced claim/}).first().click();
  await expect(page.locator("#source-claim-stable-review-claim textarea")).toBeFocused();
  await page.getByLabel("Review status",{exact:true}).selectOption("approved");
  await expect(page.getByText("Save source review changes before generating.",{exact:true}).first()).toBeVisible();
  await page.getByRole("button",{name:"Save source review",exact:true}).focus();
  await page.screenshot({path:"test-results/source-review-S08-after.png"});
  await page.getByRole("button",{name:"Save source review",exact:true}).click();
  await expect(page.getByRole("button",{name:"Generate draft",exact:true})).toBeEnabled();
  await page.getByLabel("Claim text",{exact:true}).fill("Unsaved review changes");
  await expect(page.getByRole("button",{name:"Generate draft",exact:true})).toBeDisabled();
  await page.getByRole("button",{name:"Reload saved review (discard review edits)",exact:true}).click();
  await expect(page.getByLabel("Claim text",{exact:true})).toHaveValue(source.text);
  await expect(page.getByRole("button",{name:"Generate draft",exact:true})).toBeEnabled();
  const saved = (await (await page.request.get(base+"/api/studio/bootstrap"+scope)).json()).backlog.find(item=>item.id===story.id);
  const clinical = await page.request.post(base+"/api/studio/source-claims"+scope,{data:{storyId:story.id,expectedRevision:saved.revision,sourceClaims:[{...source,status:"approved",kind:"clinical"}]}});
  expect(clinical.ok()).toBe(true);
  const denied = await page.request.post(base+"/api/studio/generate-campaign"+scope,{data:{storyId:story.id}});
  expect(denied.ok()).toBe(false);
  // Existing local revision is now stale: save fails instead of replacing the clinical review.
  await page.getByLabel("Claim text",{exact:true}).fill("A competing edit");
  await page.getByRole("button",{name:"Save source review",exact:true}).click();
  await expect(page.getByText(/Story changed; reload before reviewing/)).toBeVisible();
  await page.getByRole("button",{name:"Reload saved review (discard review edits)",exact:true}).click();
  await expect(page.getByRole("button",{name:"Generate draft",exact:true})).toBeDisabled();
  await expect(page.getByRole("button",{name:/save an authorized clinical source review/}).first()).toBeVisible();
});

test("late source review save cannot restore a story from the previous brand", async ({page}) => {
  await signIn(page);
  const created = await page.request.post(base+"/api/studio/backlog"+scope,{data:{title:"Delayed review fixture",category:"Review",scheduledDay:"Monday",sourceClaims:[{id:"late-review",text:"A source excerpt.",sourceUrl:"https://example.org/review",kind:"general",status:"unreviewed"}]}});
  expect(created.status()).toBe(201);
  await page.reload();
  await page.locator(".story-row").filter({hasText:"Delayed review fixture"}).getByRole("button",{name:"Open story"}).click();
  await page.getByLabel("Review status",{exact:true}).selectOption("approved");
  let release, captured;
  const held = new Promise(resolve=>{release=resolve});
  const seen = new Promise(resolve=>{captured=resolve});
  await page.route("**/api/studio/source-claims?*",async route=>{const response=await route.fetch();captured();await held;await route.fulfill({response});});
  await page.getByRole("button",{name:"Save source review",exact:true}).click();
  await seen;
  await page.getByLabel("Brand",{exact:true}).selectOption("brand_vedic");
  await expect(page.locator(".story-row").first()).toBeVisible();
  release();
  await page.unrouteAll({behavior:"wait"});
  await page.locator(".story-row").first().getByRole("button",{name:/Open (story|draft)/}).click();
  await expect(page.getByRole("heading",{name:"Delayed review fixture",exact:true})).toHaveCount(0);
  await expect(page.locator("#source-claim-late-review")).toHaveCount(0);
});

test("late review response preserves newer same-story typing", async ({page}) => {
  await signIn(page);
  const response=await page.request.post(base+"/api/studio/backlog"+scope,{data:{title:"Typing during review save",category:"Review",scheduledDay:"Monday",sourceClaims:[{id:"typing-claim",text:"Original review text.",sourceUrl:"https://example.org/review",kind:"general",status:"unreviewed"}]}});
  expect(response.status()).toBe(201);
  await page.reload();
  await page.locator(".story-row").filter({hasText:"Typing during review save"}).getByRole("button",{name:"Open story"}).click();
  await page.getByLabel("Review status",{exact:true}).selectOption("approved");
  let release, captured;
  const held=new Promise(resolve=>{release=resolve});const seen=new Promise(resolve=>{captured=resolve});
  await page.route("**/api/studio/source-claims?*",async route=>{const response=await route.fetch();captured();await held;await route.fulfill({response});});
  await page.getByRole("button",{name:"Save source review",exact:true}).click();await seen;
  await page.getByLabel("Claim text",{exact:true}).fill("Newer unsaved typing must survive.");
  release();await page.unrouteAll({behavior:"wait"});
  await expect(page.getByRole("status").filter({hasText:"Source review saved. Only approved sourced claims can enter generation."})).toBeVisible();
  await expect(page.getByLabel("Claim text",{exact:true})).toHaveValue("Newer unsaved typing must survive.");
  await expect(page.getByRole("button",{name:"Generate draft",exact:true})).toBeDisabled();
  await expect(page.getByText("Save source review changes before generating.",{exact:true}).first()).toBeVisible();
});

test("draft blocker link opens collapsed review and focuses the stable claim", async ({page}) => {
  await signIn(page);
  const source={id:"collapsed-claim",text:"Approved excerpt for disclosure test.",sourceUrl:"https://example.org/review",kind:"general",status:"approved"};
  const response=await page.request.post(base+"/api/studio/backlog"+scope,{data:{title:"Collapsed review fixture",category:"Review",scheduledDay:"Monday",sourceClaims:[source]}});
  const story=(await response.json()).story;
  const generated=await page.request.post(base+"/api/studio/generate-campaign"+scope,{data:{storyId:story.id}});expect(generated.ok()).toBe(true);
  const saved=(await (await page.request.get(base+"/api/studio/bootstrap"+scope)).json()).backlog.find(item=>item.id===story.id);
  const changed=await page.request.post(base+"/api/studio/source-claims"+scope,{data:{storyId:story.id,expectedRevision:saved.revision,sourceClaims:[{...source,status:"unreviewed"}]}});expect(changed.ok()).toBe(true);
  await page.reload();await page.locator(".story-row").filter({hasText:"Collapsed review fixture"}).getByRole("button",{name:"Open draft"}).click();
  await expect(page.locator("details.sources")).not.toHaveAttribute("open","");
  await page.getByRole("button",{name:/Approve at least one sourced claim/}).click();
  await expect(page.locator("details.sources")).toHaveAttribute("open","");
  await expect(page.locator("#source-claim-collapsed-claim textarea")).toBeFocused();
  await expect(page.locator("#source-claim-collapsed-claim textarea")).toBeVisible();
});
