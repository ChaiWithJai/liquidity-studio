import { test, expect } from "@playwright/test";
import {
  mkdtempSync,
  rmSync,
  mkdirSync,
  writeFileSync,
  readFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { randomBytes, createHash } from "node:crypto";
import { createHttpServer } from "../server/index.js";
import { createPlatform } from "../server/platform.js";
import { DurableStore } from "../server/storage.js";
let server, platform, directory, base, emptyBrand, otherOrganization;
const captures = [];
async function capture(page, step, action) {
  if (!process.env.ISSUE64_EVIDENCE_DIR) return;
  mkdirSync(process.env.ISSUE64_EVIDENCE_DIR, { recursive: true });
  const bytes = await page.screenshot({
    path: join(process.env.ISSUE64_EVIDENCE_DIR, `${step}.png`),
    fullPage: false,
  });
  captures.push({
    step,
    action,
    recordedAt: new Date().toISOString(),
    viewport: page.viewportSize(),
    screenshot: `${step}.png`,
    sha256: createHash("sha256").update(bytes).digest("hex"),
    sourceAppSha256: createHash("sha256")
      .update(readFileSync(new URL("../src/App.svelte", import.meta.url)))
      .digest("hex"),
    sourceBase: "324f3fc",
    actor: "isolated test founder",
    organization: "org_default",
    brand: await page
      .getByRole("combobox", { name: "Brand", exact: true })
      .inputValue(),
    evidence:
      "Unmodified viewport; fresh SQLite fixture; explicit test-only password mode; no generation or paid calls",
    humanMetrics: null,
  });
  writeFileSync(
    join(process.env.ISSUE64_EVIDENCE_DIR, "manifest.json"),
    JSON.stringify(captures, null, 2),
  );
}

const password = randomBytes(24).toString("base64url");
test.beforeAll(async () => {
  directory = mkdtempSync(join(tmpdir(), "backlog-filters-"));
  platform = createPlatform({
    authMode: "password",
    store: new DurableStore(join(directory, "fixture.sqlite")),
  });
  await platform.ready;
  await platform.identity.provision({
    username: "founder",
    password,
    role: "founder",
  });
  const founder = (await platform.store.get("identity")).users.find(
    (user) => user.username === "founder",
  );
  otherOrganization = await platform.identity.createOrganization(
    founder,
    "Other organization fixture",
  );
  await platform.identity.createBrand(founder, {
    organizationId: otherOrganization.id,
    name: "Other organization brand",
    preset: "liquidity_desk",
  });
  emptyBrand = await platform.identity.createBrand(founder, {
    organizationId: "org_default",
    name: "Empty fixture brand",
    preset: "liquidity_desk",
  });
  const app = await platform.forScope({
    organizationId: "org_default",
    brandId: emptyBrand.id,
    preset: "liquidity_desk",
  });
  await app.ports.repo.mutate((state) => ({ ...state, backlog: [] }));
  server = createHttpServer(null, { platform });
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  base = `http://127.0.0.1:${server.address().port}`;
});
test.afterAll(async () => {
  server.closeAllConnections();
  await new Promise((resolve) => server.close(resolve));
  platform.store.close();
  rmSync(directory, { recursive: true, force: true });
});
async function signIn(page) {
  await page.goto(base);
  await page.getByLabel("Username", { exact: true }).fill("founder");
  await page.getByLabel("Password", { exact: true }).fill(password);
  await page.getByRole("button", { name: "Sign in →" }).click();
  await expect(page.locator(".story-row")).toHaveCount(5);
}
test("S01–S05 and S09–S10 counts, no-match recovery and per-brand return context are truthful", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 720 });
  await signIn(page);
  await capture(page, "S01", "Open scoped backlog");
  const search = page.getByRole("textbox", { name: "Search stories" });
  await search.fill("Huda");
  await expect(page.locator(".story-row")).toHaveCount(1);
  await expect(
    page.getByRole("status").filter({ hasText: "Showing 1 of 5 stories" }),
  ).toBeVisible();
  await expect(page.getByLabel("Active filters")).toContainText("Huda");
  await capture(page, "S02", "Search Huda; one of five visible");
  await page
    .locator(".story-row")
    .getByRole("button", { name: "Open story" })
    .click();
  await page
    .getByRole("button", { name: "Story backlog", exact: true })
    .click();
  await expect(search).toHaveValue("Huda");
  await capture(
    page,
    "S04",
    "Return from selected story; same-brand filter retained",
  );
  await expect(page.locator(".story-row")).toHaveCount(1);
  await search.fill("no-matching-fixture-story");
  await expect(
    page.getByRole("heading", { name: "No stories match these filters." }),
  ).toBeVisible();
  await expect(page.getByText("Add supplied facts below.")).toHaveCount(0);
  await expect(
    page.getByRole("status").filter({ hasText: "Showing 0 of 5 stories" }),
  ).toBeVisible();
  await capture(
    page,
    "S05",
    "Unmatched query shows no-match recovery, not empty brand",
  );
  await page
    .getByRole("combobox", { name: "Brand", exact: true })
    .selectOption("brand_vedic");
  await expect(page.locator(".story-row")).toHaveCount(5);
  await expect(search).toHaveValue("");
  await capture(
    page,
    "S09",
    "Switch to CWJ; prior brand filter does not cross scope",
  );
  await search.fill("research-not-found");
  await page
    .getByRole("combobox", { name: "Brand", exact: true })
    .selectOption("brand_default");
  await expect(search).toHaveValue("no-matching-fixture-story");
  await expect(
    page.getByRole("heading", { name: "No stories match these filters." }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Clear filters", exact: true })
    .focus();
  await page.keyboard.press("Enter");
  await expect(search).toHaveValue("");
  await expect(search).toBeFocused();
  await expect(page.locator(".story-row")).toHaveCount(5);
  await page
    .getByRole("combobox", { name: "Brand", exact: true })
    .selectOption("brand_vedic");
  await expect(search).toHaveValue("research-not-found");
  await page
    .getByRole("button", { name: "Clear filters", exact: true })
    .click();
  await capture(
    page,
    "S10",
    "Clear the deliberately set CWJ filter; five stories visible",
  );
  await page
    .getByRole("combobox", { name: "Brand", exact: true })
    .selectOption(emptyBrand.id);
  await expect(
    page.getByRole("heading", { name: "No stories here yet." }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "No stories match these filters." }),
  ).toHaveCount(0);
});
test("loading and failed scopes never masquerade as empty, and stale scope responses cannot restore old filters", async ({
  page,
}) => {
  await signIn(page);
  await page.getByLabel("Search stories").fill("Huda");
  let failNext = true;
  await page.route("**/api/studio/bootstrap?**brand_vedic**", async (route) => {
    if (failNext) {
      failNext = false;
      await route.fulfill({
        status: 503,
        contentType: "application/json",
        body: JSON.stringify({ error: "Controlled fixture load failure" }),
      });
    } else await route.continue();
  });
  await page
    .getByRole("combobox", { name: "Brand", exact: true })
    .selectOption("brand_vedic");
  await expect(
    page.getByRole("heading", { name: "Workspace could not load." }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "No stories here yet." }),
  ).toHaveCount(0);
  await page
    .getByRole("button", { name: "Retry workspace", exact: true })
    .click();
  await expect(page.locator(".story-row")).toHaveCount(5);
  await expect(page.getByLabel("Search stories")).toHaveValue("");
  await page.unroute("**/api/studio/bootstrap?**brand_vedic**");
  let release;
  const pending = new Promise((resolve) => {
    release = resolve;
  });
  let held = false;
  await page.route(
    "**/api/studio/bootstrap?**brand_default**",
    async (route) => {
      if (!held) {
        held = true;
        await pending;
      }
      await route.continue();
    },
  );
  await page
    .getByRole("combobox", { name: "Brand", exact: true })
    .selectOption("brand_default");
  await expect(
    page.getByRole("status").filter({ hasText: /Loading .*workspace/ }),
  ).toBeVisible();
  await expect(page.locator(".story-row")).toHaveCount(0);
  await page
    .getByRole("combobox", { name: "Brand", exact: true })
    .selectOption("brand_vedic");
  await expect(page.locator(".story-row")).toHaveCount(5);
  release();
  await expect(page.getByLabel("Search stories")).toHaveValue("");
  await expect(
    page.getByRole("combobox", { name: "Brand", exact: true }),
  ).toHaveValue("brand_vedic");
});

test("status, selected story and backlog scroll survive navigation; organization and sign-out boundaries are intentional", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 720 });
  await signIn(page);
  const rows = page.locator(".story-row");
  const selectedTitle = await rows.last().getByRole("heading").innerText();
  await rows.last().scrollIntoViewIfNeeded();
  const scroll = await page.evaluate(() => window.scrollY);
  expect(scroll).toBeGreaterThan(0);
  await rows.last().getByRole("button", { name: "Open story" }).click();
  await page
    .getByRole("button", { name: "Story backlog", exact: true })
    .click();
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(scroll);
  await page
    .getByRole("combobox", { name: "Filter by status", exact: true })
    .selectOption("In Backlog");
  await page
    .getByRole("combobox", { name: "Brand", exact: true })
    .selectOption("brand_vedic");
  await expect(page.getByLabel("Filter by status")).toHaveValue("All");
  await page
    .getByRole("combobox", { name: "Brand", exact: true })
    .selectOption("brand_default");
  await expect(page.getByLabel("Filter by status")).toHaveValue("In Backlog");
  await page
    .getByRole("button", { name: "Campaign Studio", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: selectedTitle, exact: true }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Story backlog", exact: true })
    .click();
  await page.getByLabel("Search stories").fill("Huda");
  await page
    .getByRole("combobox", { name: "Organization", exact: true })
    .selectOption(otherOrganization.id);
  await expect(page.getByLabel("Search stories")).toHaveValue("");
  await expect(page.getByLabel("Filter by status")).toHaveValue("All");
  await page
    .getByRole("combobox", { name: "Organization", exact: true })
    .selectOption("org_default");
  await expect(page.getByLabel("Search stories")).toHaveValue("Huda");
  await expect(page.getByLabel("Filter by status")).toHaveValue("In Backlog");
  await page.getByRole("button", { name: "Sign out", exact: true }).click();
  await signIn(page);
  await expect(page.getByLabel("Search stories")).toHaveValue("");
  await expect(page.getByLabel("Filter by status")).toHaveValue("All");
});

test("pending campaign edits save to the old scope before brand/organization navigation; failed saves restore selectors", async ({
  page,
}) => {
  await signIn(page);
  const scope = "?organizationId=org_default&brandId=brand_default";
  const title = "Pending scope switch fixture";
  const created = await page.request.post(
    base + "/api/studio/backlog" + scope,
    {
      data: {
        title,
        category: "Review",
        scheduledDay: "Monday",
        sourceClaims: [
          {
            id: "pending-scope-claim",
            text: "Explicitly reviewed fixture excerpt.",
            sourceUrl: "https://example.org/source",
            kind: "general",
            status: "approved",
          },
        ],
      },
    },
  );
  expect(created.status()).toBe(201);
  const story = (await created.json()).story;
  const { campaignFromApprovedClaims } = await import(
    "../server/source-integrity.js"
  );
  const app = await platform.forScope({
    organizationId: "org_default",
    brandId: "brand_default",
  });
  // Trusted fixture setup, no provider invocation. Editing/navigation below uses actual UI/API.
  await app.ports.repo.saveCampaignDraft(story.id, {
    ...campaignFromApprovedClaims(story),
    provenance: {
      mode: "synthetic",
      generationId: "scope-switch-fixture-generation",
    },
  });
  await page.reload();
  await page
    .locator(".story-row")
    .filter({ hasText: title })
    .getByRole("button", { name: "Open draft" })
    .click();
  await page
    .getByLabel("Headline", { exact: true })
    .fill("Saved before brand switch");
  await page.getByLabel("Brand", { exact: true }).selectOption("brand_vedic");
  await expect(page.locator(".story-row")).toHaveCount(5);
  await expect(page.getByLabel("Brand", { exact: true })).toHaveValue(
    "brand_vedic",
  );
  await expect(page.getByLabel("Search stories")).toHaveValue("");
  const savedStory = async () =>
    (
      await (
        await page.request.get(base + "/api/studio/bootstrap" + scope)
      ).json()
    ).backlog.find((item) => item.id === story.id);
  expect((await savedStory()).campaignDraft.infographic.headline).toBe(
    "Saved before brand switch",
  );
  await page.getByLabel("Search stories").fill("CWJ scoped query");
  await page.getByLabel("Brand", { exact: true }).selectOption("brand_default");
  await expect(page.getByLabel("Search stories")).toHaveValue("");
  await page.getByLabel("Search stories").fill(title);
  await page
    .locator(".story-row")
    .getByRole("button", { name: "Open draft" })
    .click();
  await page
    .getByLabel("Headline", { exact: true })
    .fill("Saved before organization switch");
  await page
    .getByLabel("Organization", { exact: true })
    .selectOption(otherOrganization.id);
  await expect(page.locator(".story-row")).toHaveCount(5);
  await expect(page.getByLabel("Organization", { exact: true })).toHaveValue(
    otherOrganization.id,
  );
  await expect(page.getByLabel("Search stories")).toHaveValue("");
  expect((await savedStory()).campaignDraft.infographic.headline).toBe(
    "Saved before organization switch",
  );
  await page
    .getByLabel("Organization", { exact: true })
    .selectOption("org_default");
  await expect(page.getByLabel("Search stories")).toHaveValue(title);
  await page
    .locator(".story-row")
    .getByRole("button", { name: "Open draft" })
    .click();
  await page
    .getByLabel("Headline", { exact: true })
    .fill("Still unsaved after controlled failure");
  await page.route("**/api/studio/save-edit?*", (route) =>
    route.fulfill({
      status: 503,
      contentType: "application/json",
      body: JSON.stringify({ error: "Controlled pending-save failure" }),
    }),
  );
  await page.getByLabel("Brand", { exact: true }).selectOption("brand_vedic");
  await expect(page.getByRole("alert")).toContainText(
    "Controlled pending-save failure",
  );
  await expect(page.getByLabel("Brand", { exact: true })).toHaveValue(
    "brand_default",
  );
  await expect(page.getByLabel("Headline", { exact: true })).toHaveValue(
    "Still unsaved after controlled failure",
  );
  await page
    .getByLabel("Organization", { exact: true })
    .selectOption(otherOrganization.id);
  await expect(page.getByLabel("Organization", { exact: true })).toHaveValue(
    "org_default",
  );
  expect((await savedStory()).campaignDraft.infographic.headline).toBe(
    "Saved before organization switch",
  );
});
