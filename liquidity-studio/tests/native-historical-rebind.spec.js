import { test, expect } from "@playwright/test";
import { createHttpServer } from "../server/index.js";
import { historicalRebindFixture } from "./fixtures/native-historical-rebind.mjs";
let f, server, base;
const previous = process.env.STUDIO_SOURCE_PREPARATION_ENABLED;
const previousJobs = process.env.STUDIO_OPERATOR_JOBS_ENABLED;
test.beforeAll(() => {
  process.env.STUDIO_SOURCE_PREPARATION_ENABLED = "true";
  process.env.STUDIO_OPERATOR_JOBS_ENABLED = "true";
});
test.afterAll(() => {
  if (previous === undefined)
    delete process.env.STUDIO_SOURCE_PREPARATION_ENABLED;
  else process.env.STUDIO_SOURCE_PREPARATION_ENABLED = previous;
  if (previousJobs === undefined)
    delete process.env.STUDIO_OPERATOR_JOBS_ENABLED;
  else process.env.STUDIO_OPERATOR_JOBS_ENABLED = previousJobs;
});
test.afterEach(async () => {
  server?.closeAllConnections();
  if (server) await new Promise((resolve) => server.close(resolve));
  f?.close();
  server = null;
  f = null;
});
async function enter(page, preset) {
  f = await historicalRebindFixture(preset);
  server = createHttpServer(null, {
    platform: f.platform,
    nativeEditorEnabled: true,
  });
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  base = `http://127.0.0.1:${server.address().port}`;
  await page.goto(base);
  await page.getByLabel("Username", { exact: true }).fill("fresh-layout-owner");
  await page
    .getByLabel("Password", { exact: true })
    .fill("disposable-native-rebind-password");
  await page.getByRole("button", { name: "Sign in →" }).click();
  await page.getByLabel("Brand", { exact: true }).selectOption(f.scope.brandId);
  await page.locator(`[data-open-story="${f.storyId}"]`).click();
  await openHistory(page, f.ids[0]);
}
async function openHistory(page, id) {
  const details = page.locator("details.native-history");
  if ((await details.getAttribute("open")) === null)
    await details.locator("summary").click();
  await details
    .getByRole("button", { name: "Load saved layouts", exact: true })
    .click();
  await details.getByLabel("Saved layout", { exact: true }).selectOption(id);
  await details
    .getByRole("button", { name: "Open selected layout", exact: true })
    .click();
}
async function reviewSource(page) {
  await page
    .getByRole("button", { name: "Review current campaign copy", exact: true })
    .click();
  const panel = page.getByRole("region", {
    name: "Prepared source draft",
    exact: true,
  });
  await expect(panel.getByLabel("Headline", { exact: true })).toBeEnabled();
  await panel
    .getByRole("button", {
      name: "Review saved draft and evidence",
      exact: true,
    })
    .click();
  await panel
    .getByRole("combobox", { name: "Content classification", exact: true })
    .selectOption("general");
  await panel
    .getByLabel(
      "I reviewed this saved draft and its evidence across all formats.",
      { exact: true },
    )
    .check();
  const saved = page.waitForResponse(
    (response) =>
      response.url().includes("/promote") &&
      response.request().method() === "POST",
  );
  await panel
    .getByRole("button", {
      name: "Confirm reviewed copy and continue to handoff",
      exact: true,
    })
    .click();
  expect((await saved).status()).toBe(200);
  await openHistory(page, f.ids[0]);
}
for (const preset of ["liquidity_desk", "vedic_dharma"])
  test(`${preset} Studio historical selection requires fresh owner review then creates a new proposal without changing history`, async ({
    page,
  }) => {
    await enter(page, preset);
    const old = await f.native.read(f.actor, f.ids[0]);
    await expect(
      page
        .getByRole("status")
        .filter({ hasText: "This restored layout is historical evidence" }),
    ).toBeVisible();
    await expect(page.getByTitle("Native Doory design canvas")).toHaveCount(0);
    await page
      .getByRole("button", { name: "Check reviewed source", exact: true })
      .click();
    await expect(
      page
        .getByRole("alert")
        .filter({ hasText: "Review and adopt the current saved copy" }),
    ).toBeVisible();
    await reviewSource(page);
    await page
      .getByRole("button", { name: "Check reviewed source", exact: true })
      .click();
    const created = page.waitForResponse(
      (response) =>
        response.url().includes("/rebind?") &&
        response.request().method() === "POST",
    );
    await page
      .getByRole("button", { name: "Create editable copy", exact: true })
      .click();
    const response = await created;
    expect(response.status()).toBe(201);
    const copy = await response.json();
    expect(copy.id).not.toBe(old.id);
    expect(copy.document).toEqual(old.document);
    expect(copy.status).toBe("proposal");
    await expect(page.getByTitle("Native Doory design canvas")).toHaveCount(1);
    expect(await f.native.read(f.actor, old.id)).toEqual(old);
    expect(
      await f.platform.editorApproval(f.scope, f.repo).read(f.actor, copy.id),
    ).toBeNull();
    await page.reload();
    await page
      .getByLabel("Brand", { exact: true })
      .selectOption(f.scope.brandId);
    await page.locator(`[data-open-story="${f.storyId}"]`).click();
    await openHistory(page, copy.id);
    await expect(page.getByTitle("Native Doory design canvas")).toHaveCount(1);
    await page.screenshot({
      path: test.info().outputPath(`${preset}-rebound-proposal.png`),
      fullPage: true,
    });
  });
test("lost creation reply retries the same committed new-copy intent", async ({
  page,
}) => {
  await enter(page, "liquidity_desk");
  await f.reviewCurrent();
  await page
    .getByRole("button", { name: "Check reviewed source", exact: true })
    .click();
  const bodies = [];
  let lost = true;
  await page.route(
    "**/api/studio/native-editor/documents/*/rebind?**",
    async (route) => {
      bodies.push(route.request().postDataJSON());
      const response = await route.fetch();
      if (lost) {
        lost = false;
        await route.abort("failed");
      } else await route.fulfill({ response });
    },
  );
  await page
    .getByRole("button", { name: "Create editable copy", exact: true })
    .click();
  await expect(
    page
      .getByRole("alert")
      .filter({ hasText: "Creating the copy was not confirmed" }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Retry creating editable copy", exact: true })
    .click();
  await expect(page.getByTitle("Native Doory design canvas")).toHaveCount(1);
  expect(bodies).toHaveLength(2);
  expect(bodies[1]).toEqual(bodies[0]);
  expect(await f.store.keys(`${f.native.prefix}document:`)).toHaveLength(2);
});
test("a committed reply held across a brand switch never opens its old-brand layout in the new workspace", async ({
  page,
}) => {
  await enter(page, "liquidity_desk");
  await f.reviewCurrent();
  await page
    .getByRole("button", { name: "Check reviewed source", exact: true })
    .click();
  let release, committed;
  const reached = new Promise((resolve) => (committed = resolve)),
    hold = new Promise((resolve) => (release = resolve));
  await page.route(
    "**/api/studio/native-editor/documents/*/rebind?**",
    async (route) => {
      const response = await route.fetch();
      expect(response.status()).toBe(201);
      committed();
      await hold;
      await route.fulfill({ response });
    },
  );
  try {
    await page
      .getByRole("button", { name: "Create editable copy", exact: true })
      .click();
    await reached;
    await page
      .getByLabel("Brand", { exact: true })
      .selectOption("brand_default");
    await expect(
      page.getByRole("heading", { name: "Story backlog", exact: true }),
    ).toBeVisible();
    release();
    await expect(page.getByTitle("Native Doory design canvas")).toHaveCount(0);
    await expect(
      page.getByRole("region", {
        name: "Native proposal workspace",
        exact: true,
      }),
    ).toHaveCount(0);
    await expect(page.locator(`[data-open-story="${f.storyId}"]`)).toHaveCount(
      0,
    );
    expect(await f.store.keys(`${f.native.prefix}document:`)).toHaveLength(2);
  } finally {
    release();
  }
});
test("known brand/font rejection clears confirmation without offering an uncertain retry", async ({
  page,
}) => {
  await enter(page, "liquidity_desk");
  await f.reviewCurrent();
  await page
    .getByRole("button", { name: "Check reviewed source", exact: true })
    .click();
  await f.repo.mutate((state) => {
    state.brandProfile.fonts.heading = "Uninstalled Custom Font";
    return state;
  });
  await page
    .getByRole("button", { name: "Create editable copy", exact: true })
    .click();
  await expect(
    page.getByRole("alert").filter({ hasText: /Missing verified font/ }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", {
      name: "Retry creating editable copy",
      exact: true,
    }),
  ).toHaveCount(0);
  await expect(page.getByTitle("Native Doory design canvas")).toHaveCount(0);
  expect(await f.store.keys(`${f.native.prefix}document:`)).toHaveLength(1);
});
