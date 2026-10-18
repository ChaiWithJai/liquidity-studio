import { test, expect } from "@playwright/test";
import { mkdtempSync, rmSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { randomBytes } from "node:crypto";
import { createPlatform } from "../server/platform.js";
import { DurableStore } from "../server/storage.js";
import { createHttpServer } from "../server/index.js";
import { campaignFromApprovedClaims } from "../server/source-integrity.js";
import { brandRevision } from "../server/multimodal-contract.js";
const keys = [
    "NODE_ENV",
    "STUDIO_FOUNDER_PASSWORD",
    "STUDIO_MARKETER_PASSWORD",
    "STUDIO_NATIVE_EDITOR_ENABLED",
    "STUDIO_NATIVE_PORTABLE_ENABLED",
  ],
  previous = Object.fromEntries(keys.map((key) => [key, process.env[key]]));
let directory, platform, server, base, password;
test.beforeEach(async () => {
  server = null;
  directory = mkdtempSync(join(tmpdir(), "recovery-app-"));
  password = randomBytes(24).toString("base64url");
  Object.assign(process.env, {
    NODE_ENV: "test",
    STUDIO_FOUNDER_PASSWORD: password,
    STUDIO_MARKETER_PASSWORD: password,
    STUDIO_NATIVE_EDITOR_ENABLED: "true",
    STUDIO_NATIVE_PORTABLE_ENABLED: "true",
  });
  platform = createPlatform({
    store: new DurableStore(join(directory, "fixture.sqlite")),
    authMode: "password",
  });
  await platform.ready;
  const actor = (await platform.store.get("identity")).users.find(
    (user) => user.username === "founder",
  );
  for (const brandId of ["brand_default", "brand_vedic"]) {
    const scope = await platform.identity.authorize(
        actor,
        "org_default",
        brandId,
      ),
      repo = (await platform.forScope(scope)).ports.repo,
      story = {
        id: `owned-${brandId}`,
        title: "Disposable owned source for recovery",
        revision: 1,
        generationId: `fixture-${brandId}`,
        sourceClaims: [
          {
            id: "source",
            text: "An explicitly reviewed controlled source sentence for portable recovery.",
            sourceUrl: "https://example.org/owned-source",
            kind: brandId === "brand_vedic" ? "cultural" : "financial",
            status: "approved",
            reviewedBy: actor.id,
            reviewedAt: new Date().toISOString(),
          },
        ],
      };
    story.campaignDraft = campaignFromApprovedClaims(story);
    story.campaignDraft.provenance = {
      generationId: story.generationId,
      mode: "synthetic",
    };
    await repo.mutate((state) => ({ ...state, backlog: [story] }));
    await platform
      .nativeEditor(scope, repo)
      .create(actor, {
        storyId: story.id,
        format: "infographic",
        expectedRevision: 1,
        generationId: story.generationId,
        expectedBrandRevision: brandRevision(await repo.getBrandProfile()),
        idempotencyKey: `native-create-${brandId}`,
      });
  }
  server = createHttpServer(null, { platform, nativeEditorEnabled: true });
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  base = `http://127.0.0.1:${server.address().port}`;
});
test.afterEach(async () => {
  server?.closeAllConnections();
  if (server) await new Promise((resolve) => server.close(resolve));
  await platform?.store.close();
  rmSync(directory, { recursive: true, force: true });
});
test.afterAll(() => {
  for (const key of keys)
    if (previous[key] === undefined) delete process.env[key];
    else process.env[key] = previous[key];
});
async function enter(page, brand = "brand_default") {
  await page.goto(base);
  await page.getByLabel("Username", { exact: true }).fill("founder");
  await page.getByLabel("Password", { exact: true }).fill(password);
  await page.getByRole("button", { name: "Sign in →" }).click();
  if (brand !== "brand_default")
    await page.getByLabel("Brand", { exact: true }).selectOption(brand);
  await page.getByRole("button", { name: "Operations", exact: true }).click();
  return page.getByRole("region", {
    name: "Portable brand recovery",
    exact: true,
  });
}
async function downloadPack(page, panel, testInfo) {
  const pending = page.waitForEvent("download");
  await panel
    .getByRole("button", { name: "Download current brand pack" })
    .click();
  const download = await pending,
    path = testInfo.outputPath("private-pack.json");
  await download.saveAs(path);
  return path;
}
for (const brand of ["brand_default", "brand_vedic"])
  test(`${brand} built App export restores only into a new empty brand and rejoins its receipt`, async ({
    page,
  }, testInfo) => {
    const panel = await enter(page, brand),
      path = await downloadPack(page, panel, testInfo);
    expect(JSON.parse(readFileSync(path, "utf8")).scope.brandId).toBe(brand);
    await panel
      .getByLabel("Choose private editor pack (up to 48 MiB)")
      .setInputFiles(path);
    await expect(panel.getByLabel("Unvalidated pack preview")).toBeVisible();
    await panel
      .getByLabel("New recovery brand name")
      .fill(`Recovered ${brand}`);
    await panel
      .getByLabel("Recovery brand preset")
      .selectOption(
        brand === "brand_vedic" ? "vedic_dharma" : "liquidity_desk",
      );
    await panel
      .getByRole("button", { name: "Create new empty recovery brand" })
      .click();
    await expect(
      panel.getByRole("button", { name: "Restore into this new brand" }),
    ).toBeDisabled();
    await panel.getByRole("checkbox").check();
    await panel
      .getByRole("button", { name: "Restore into this new brand" })
      .click();
    await expect(panel.getByLabel("Recovery status")).toHaveText(
      "Recovery status: completed",
    );
    const locator = await page.evaluate(() =>
      JSON.parse(
        Object.values(localStorage).find(
          (value) =>
            value.includes("sourceBrandId") && value.includes("packSha256"),
        ),
      ),
    );
    expect(locator.destination.scope.brandId).not.toBe(brand);
    expect(JSON.stringify(locator)).not.toContain("repository");
    expect(
      (
        await platform.store.get(
          `scope:org_default:${locator.destination.scope.brandId}`,
        )
      ).backlog,
    ).toHaveLength(1);
    expect(
      (await platform.store.get(`scope:org_default:${brand}`)).backlog,
    ).toHaveLength(1);
    await page.reload();
    if (brand !== "brand_default")
      await page.getByLabel("Brand", { exact: true }).selectOption(brand);
    await page.getByRole("button", { name: "Operations", exact: true }).click();
    await panel
      .getByRole("button", { name: "Check retained recovery status" })
      .click();
    await expect(panel.getByLabel("Recovery status")).toHaveText(
      "Recovery status: completed",
    );
    await page.screenshot({
      path: testInfo.outputPath(`recovery-${brand}.png`),
      fullPage: false,
    });
  });
test("lost destination and install replies retain exact intents across reload without duplicate brands", async ({
  page,
}, testInfo) => {
  const panel = await enter(page),
    path = await downloadPack(page, panel, testInfo);
  await panel
    .getByLabel("Choose private editor pack (up to 48 MiB)")
    .setInputFiles(path);
  const creates = [],
    installs = [];
  await page.route(
    "**/api/admin/editor-pack/destinations?**",
    async (route) => {
      creates.push(route.request().postDataJSON());
      const response = await route.fetch();
      if (creates.length === 1) await route.abort("failed");
      else await route.fulfill({ response });
    },
  );
  await panel
    .getByLabel("New recovery brand name")
    .fill("Exact retained recovery");
  await panel
    .getByRole("button", { name: "Create new empty recovery brand" })
    .click();
  await expect(
    panel.getByRole("button", { name: "Retry same recovery request" }),
  ).toBeVisible();
  await panel
    .getByRole("button", { name: "Retry same recovery request" })
    .click();
  await expect(
    panel.getByRole("button", { name: "Restore into this new brand" }),
  ).toBeVisible();
  expect(creates).toHaveLength(2);
  expect(creates[1]).toEqual(creates[0]);
  await page.route("**/api/admin/editor-pack/install?**", async (route) => {
    installs.push(route.request().postDataJSON());
    const response = await route.fetch();
    if (installs.length === 1) await route.abort("failed");
    else await route.fulfill({ response });
  });
  await panel.getByRole("checkbox").check();
  await panel
    .getByRole("button", { name: "Restore into this new brand" })
    .click();
  await expect(
    panel.getByRole("button", { name: "Retry same recovery request" }),
  ).toBeVisible();
  await page.reload();
  await page.getByRole("button", { name: "Operations", exact: true }).click();
  await panel
    .getByRole("button", { name: "Check retained recovery status" })
    .click();
  await expect(panel.getByLabel("Recovery status")).toHaveText(
    "Recovery status: completed",
  );
  await panel
    .getByLabel("Choose private editor pack (up to 48 MiB)")
    .setInputFiles(path);
  await panel
    .getByRole("button", { name: "Retry retained recovery request" })
    .click();
  await expect.poll(() => installs.length).toBe(2);
  expect(installs[1]).toEqual(installs[0]);
  expect(
    (await platform.store.get("identity")).organizations[0].brands,
  ).toHaveLength(3);
});
test("marketer cannot see Operations or call pack export/status", async ({
  page,
}) => {
  await page.goto(base);
  await page.getByLabel("Username", { exact: true }).fill("marketer");
  await page.getByLabel("Password", { exact: true }).fill(password);
  await page.getByRole("button", { name: "Sign in →" }).click();
  await expect(
    page.getByRole("button", { name: "Operations", exact: true }),
  ).toHaveCount(0);
  for (const action of ["status", "export"])
    expect(
      (
        await page.request.get(
          `${base}/api/admin/editor-pack/${action}?organizationId=org_default&brandId=brand_default`,
        )
      ).status(),
    ).toBe(403);
});
test("a controlled interrupted installation can be inspected while locked and rolled back by installation identity", async ({
  page,
}, testInfo) => {
  const panel = await enter(page),
    path = await downloadPack(page, panel, testInfo);
  await panel
    .getByLabel("Choose private editor pack (up to 48 MiB)")
    .setInputFiles(path);
  await panel
    .getByLabel("New recovery brand name")
    .fill("Interrupted empty destination");
  await panel
    .getByRole("button", { name: "Create new empty recovery brand" })
    .click();
  await expect(
    panel.getByRole("button", { name: "Restore into this new brand" }),
  ).toBeVisible();
  await panel.getByRole("checkbox").check();
  const locator = await page.evaluate(() =>
      JSON.parse(
        Object.values(localStorage).find(
          (value) =>
            value.includes("sourceBrandId") && value.includes("packSha256"),
        ),
      ),
    ),
    target = locator.destination.scope,
    scopeKey = `scope:${target.organizationId}:${target.brandId}`,
    before = await platform.store.get(scopeKey),
    actor = (await platform.store.get("identity")).users.find(
      (user) => user.username === "founder",
    );
  const id = "controlled-interrupted-fixture",
    requestKey = "controlled-recovery-install-key";
  await platform.store.update(scopeKey, (state) => ({
    ...state,
    editorRestore: { id, status: "installing" },
  }));
  await platform.store.update(
    `editor-restore:${target.organizationId}:${target.brandId}`,
    () => ({
      schemaVersion: 1,
      id,
      status: "installing",
      key: requestKey,
      actorId: actor.id,
      packSha256: locator.packSha256,
      before,
      plannedKeys: [],
      createdAt: new Date().toISOString(),
    }),
  );
  await page.evaluate(
    ({ locator, requestKey }) => {
      const key = Object.keys(localStorage).find((key) =>
        key.startsWith("studio-recovery:"),
      );
      localStorage.setItem(
        key,
        JSON.stringify({
          ...locator,
          operation: "install",
          idempotencyKey: requestKey,
        }),
      );
    },
    { locator, requestKey },
  );
  await page.reload();
  await page.getByRole("button", { name: "Operations", exact: true }).click();
  await panel
    .getByRole("button", { name: "Check retained recovery status" })
    .click();
  await expect(panel.getByLabel("Recovery status")).toHaveText(
    "Recovery status: installing",
  );
  await panel
    .getByRole("button", { name: "Recover interrupted empty destination" })
    .click();
  await expect(panel.getByLabel("Recovery status")).toHaveText(
    "Recovery status: empty",
  );
  expect(await platform.store.get(scopeKey)).toEqual(before);
  await panel
    .getByLabel("Choose private editor pack (up to 48 MiB)")
    .setInputFiles(path);
  await panel
    .getByRole("button", { name: "Retry retained recovery request" })
    .click();
  await expect(panel.getByLabel("Recovery status")).toHaveText(
    "Recovery status: completed",
  );
});
