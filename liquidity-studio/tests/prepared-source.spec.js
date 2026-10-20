import { test, expect } from "@playwright/test";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { randomBytes, randomUUID, createHash } from "node:crypto";
import { createHttpServer } from "../server/index.js";
import { createPlatform } from "../server/platform.js";
import { DurableStore } from "../server/storage.js";
import { brandRevision } from "../server/multimodal-contract.js";
import { retrieveSource } from "../server/source-retrieval.js";
const ownedEnv = [
  "NODE_ENV",
  "STUDIO_FOUNDER_PASSWORD",
  "STUDIO_MARKETER_PASSWORD",
  "STUDIO_OPERATOR_JOBS_ENABLED",
  "STUDIO_SOURCE_PREPARATION_ENABLED",
  "STUDIO_JOB_DISPATCHER",
  "STUDIO_SOURCE_HOSTS",
  "AI_ALLOW_SYNTHETIC",
];
const originalEnv = Object.fromEntries(
  ownedEnv.map((key) => [key, process.env[key]]),
);
test.afterAll(() => {
  for (const key of ownedEnv) {
    if (originalEnv[key] === undefined) delete process.env[key];
    else process.env[key] = originalEnv[key];
  }
});
let server, platform, directory, base, password;
const sources = new Map();
let calls = 0;
const live = process.env.STUDIO_PREPARATION_LIVE_SOURCES === "true";
const urls = { brand_default: "story_huda_buyback", brand_vedic: "research_4" };
async function sourcePort(url, options) {
  if (sources.has(url)) return structuredClone(sources.get(url));
  calls++;
  const text =
    "A controlled disposable source excerpt for browser workflow verification. It remains unreviewed until a deliberate operator confirmation.\nA second controlled paragraph records no medical outcome or financial statistic.\nA third controlled paragraph is source material for an editable visual draft.";
  const result = live
    ? await retrieveSource(url, options)
    : {
        sourceUrl: url,
        requestedUrl: url,
        retrievedAt: new Date().toISOString(),
        contentType: "text/plain",
        responseBytes: Buffer.byteLength(text),
        responseSha256: createHash("sha256").update(text).digest("hex"),
        textSha256: createHash("sha256").update(text).digest("hex"),
        text,
        status: "unreviewed",
        approval: "none",
        extractionVersion: "controlled-browser-fixture",
      };
  sources.set(url, result);
  return structuredClone(result);
}
test.beforeEach(async () => {
  server = null;
  directory = mkdtempSync(join(tmpdir(), "prepared-source-browser-"));
  password = randomBytes(24).toString("base64url");
  process.env.NODE_ENV = "test";
  process.env.STUDIO_FOUNDER_PASSWORD = password;
  process.env.STUDIO_MARKETER_PASSWORD = password;
  process.env.STUDIO_OPERATOR_JOBS_ENABLED = "true";
  process.env.STUDIO_SOURCE_PREPARATION_ENABLED = "true";
  process.env.STUDIO_JOB_DISPATCHER = "local";
  delete process.env.STUDIO_SOURCE_HOSTS;
  process.env.AI_ALLOW_SYNTHETIC = "false";
  platform = createPlatform({
    store: new DurableStore(join(directory, "studio.sqlite")),
    authMode: "password",
    sourceRetriever: sourcePort,
  });
  await platform.ready;
  const founder = (await platform.store.get("identity")).users.find(
    (user) => user.username === "founder",
  );
  for (const brandId of Object.keys(urls)) {
    const scope = await platform.identity.authorize(
        founder,
        "org_default",
        brandId,
      ),
      container = await platform.forScope(scope),
      repo = container.ports.repo,
      story = (await repo.read()).backlog.find(
        (story) => story.id === urls[brandId],
      ),
      jobs = platform.operatorJobs(scope, container);
    const job = await jobs.create(founder, {
      purpose: "source-preparation",
      idempotencyKey: randomUUID(),
      reviewed: true,
      brandRevision: brandRevision(await repo.getBrandProfile()),
      items: [{ storyId: story.id, storyRevision: story.revision }],
    });
    const done = await jobs.runNext(
      "browser-fixture-worker",
      job.id,
      job.items[0].id,
      1,
    );
    expect(done.items[0].state, JSON.stringify(done.items[0].error)).toBe(
      "completed",
    );
  }
  server = createHttpServer(null, { platform });
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  base = `http://127.0.0.1:${server.address().port}`;
});
test.afterEach(async () => {
  server?.closeAllConnections();
  if (server) await new Promise((resolve) => server.close(resolve));
  await platform?.store.close();
  rmSync(directory, { recursive: true, force: true });
});
async function signIn(page) {
  await page.goto(base);
  await page.getByLabel("Username", { exact: true }).fill("founder");
  await page.getByLabel("Password", { exact: true }).fill(password);
  await page.getByRole("button", { name: "Sign in →" }).click();
  await expect(
    page.getByRole("heading", { name: "Story backlog", exact: true }),
  ).toBeVisible();
}
async function open(page, brandId = "brand_default") {
  if (brandId !== "brand_default")
    await page.getByLabel("Brand", { exact: true }).selectOption(brandId);
  await page.locator(`[data-open-story="${urls[brandId]}"]`).click();
  const panel = page.getByRole("region", {
    name: "Prepared source draft",
    exact: true,
  });
  await expect(
    panel.getByAltText("Unreviewed source candidate artwork"),
  ).toBeVisible();
  return panel;
}
test("prepared Huda artwork opens first, saves edits, rejoins and explicitly promotes the reviewed copy without paid generation", async ({
  page,
}, testInfo) => {
  await page.setViewportSize({ width: 883, height: 695 });
  const paid = [];
  page.on("request", (request) => {
    if (request.url().includes("/generate-campaign")) paid.push(request.url());
  });
  await signIn(page);
  let panel = await open(page);
  const initialCalls = calls;
  // Inspect the existing saved candidate without saving, preparing or approving it.
  for (const width of [1280, 1051, 768]) {
    await page.setViewportSize({ width, height: 868 });
    const layout = panel.locator('.prepared-layout');
    const reading = panel.locator('.prepared-reading');
    const working = panel.locator('.prepared-working');
    const review = panel.getByRole('button', {name: 'Review saved draft and evidence', exact: true});
    await expect(review).toBeEnabled();
    const context = panel.locator('.prepared-source-context');
    await expect(context).toHaveText('Preview copy uses shortened source excerpts, not complete quotations or conclusions. Open Evidence and unresolved questions for the full retrieved text, and review the copy before using it.');
    const [layoutBox, readingBox, workingBox, artworkBox, contextBox, reviewBox] = await Promise.all(
      [layout, reading, working, panel.getByAltText('Unreviewed source candidate artwork'), context, review].map(locator => locator.boundingBox()),
    );
    expect(readingBox.width).toBeGreaterThan(260);
    expect(workingBox.width).toBeGreaterThan(260);
    if (layoutBox.width <= 650) {
      expect(workingBox.y).toBeGreaterThanOrEqual(readingBox.y + readingBox.height - 1);
      expect(Math.abs(workingBox.x - readingBox.x)).toBeLessThan(2);
    } else {
      expect(workingBox.x).toBeGreaterThanOrEqual(readingBox.x + readingBox.width - 1);
      expect(Math.abs(workingBox.y - readingBox.y)).toBeLessThan(2);
    }
    expect(contextBox.y).toBeGreaterThanOrEqual(artworkBox.y + artworkBox.height - 1);
    expect(reviewBox.y).toBeGreaterThanOrEqual(contextBox.y + contextBox.height - 1);
    expect(reviewBox.y - contextBox.y - contextBox.height).toBeLessThan(40);
    expect(reviewBox.x).toBeGreaterThanOrEqual(readingBox.x - 1);
    expect(reviewBox.x + reviewBox.width).toBeLessThanOrEqual(readingBox.x + readingBox.width + 1);
    expect(await panel.locator('.prepared-copy').evaluate(element => ['auto', 'scroll'].includes(getComputedStyle(element).overflowY) && element.scrollHeight > element.clientHeight + 1)).toBe(false);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
  }
  await page.setViewportSize({ width: 883, height: 695 });
  const image = panel.getByAltText("Unreviewed source candidate artwork");
  await expect(image).toHaveJSProperty("naturalWidth", 1080);
  const box = await image.boundingBox();
  expect(box.y).toBeLessThan(515);
  expect(
    Math.min(695, box.y + box.height) - Math.max(0, box.y),
  ).toBeGreaterThan(180);
  const screenshotPath = testInfo.outputPath(
    live
      ? "annotation1-live-primary-prepared.png"
      : "annotation1-controlled-fixture-prepared.png",
  );
  await page.screenshot({ path: screenshotPath });
  await testInfo.attach("prepared-source-first-viewport", {
    path: screenshotPath,
    contentType: "image/png",
  });
  await page.setViewportSize({ width: 1280, height: 720 });
  await page.screenshot({
    path: testInfo.outputPath("annotation1-desktop-after-v3.png"),
  });
  await page.setViewportSize({ width: 883, height: 695 });
  await panel
    .getByLabel("Headline", { exact: true })
    .fill("HUMAN EDITED PREPARED SOURCE DRAFT");
  await panel
    .getByRole("button", { name: "Save preview edits", exact: true })
    .click();
  await expect(
    panel.getByText("Preview edits saved.", { exact: false }),
  ).toBeVisible();
  await page.reload();
  await expect(page).toHaveURL(new RegExp(`story=${urls.brand_default}`));
  panel = page.getByRole("region", { name: "Prepared source draft", exact: true });
  await expect(panel.getByLabel("Headline", { exact: true })).toHaveValue(
    "HUMAN EDITED PREPARED SOURCE DRAFT",
  );
  expect(calls).toBe(initialCalls);
  await panel
    .getByText("Evidence and unresolved questions", { exact: true })
    .click();
  await expect(
    panel.getByText("The issuer release is dated June 3, 2025.", {
      exact: false,
    }),
  ).toBeVisible();
  const reviewAction = panel.getByRole('button', {name: 'Review saved draft and evidence', exact: true});
  await panel.getByRole('group', {name: 'Source preview format', exact: true}).getByRole('combobox').focus();
  await page.keyboard.press('Tab');
  await expect(reviewAction).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(panel.getByRole('region', {name: 'Review prepared draft', exact: true})).toBeVisible();
  await panel
    .getByRole("combobox", { name: "Content classification", exact: true })
    .selectOption("financial");
  await panel
    .getByLabel(
      "I reviewed this saved draft and its evidence across all formats.",
      { exact: true },
    )
    .check();
  const promoted = page.waitForResponse(
    (response) =>
      response.url().includes("/promote") &&
      response.request().method() === "POST",
  );
  await panel
    .getByRole("button", {
      name: "Confirm reviewed copy and continue to handoff",
    })
    .click();
  const response = await promoted;
  expect(response.status()).toBe(200);
  const data = await response.json();
  expect(data.receipt.modelCalls).toBe(0);
  expect(data.receipt.publicationApproved).toBe(false);
  await expect(page.locator('#workflow-preview svg[role="img"]')).toContainText(
    /HUMAN.*EDITED/s,
  );
  await expect(
    page.getByRole("button", { name: "Edit reviewed copy", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByText("Human-reviewed prepared copy · layout approval required", {
      exact: true,
    }),
  ).toBeVisible();
  await page.locator('#workflow-sources > summary').click();
  await expect(page.locator('#workflow-sources').getByRole('button', {name:'Save source review', exact:true})).toHaveCount(0);
  await page.locator('#workflow-sources').getByRole('button', {name:'Review this saved copy', exact:true}).click();
  panel = page.getByRole("region", {
    name: "Prepared source draft",
    exact: true,
  });
  await expect(panel.getByLabel("Headline", { exact: true })).toHaveValue(
    "HUMAN EDITED PREPARED SOURCE DRAFT",
  );
  await panel
    .getByLabel("Headline", { exact: true })
    .fill("REVIEWED COPY UPDATED AGAIN");
  await panel
    .getByRole("button", { name: "Save preview edits", exact: true })
    .click();
  await expect(
    panel.getByText("Preview edits saved.", { exact: false }),
  ).toBeVisible();
  await page.reload();
  await expect(page).toHaveURL(/story=story_huda_buyback.*editor=prepared/);
  panel = page.getByRole("region", {
    name: "Prepared source draft",
    exact: true,
  });
  await expect(panel.getByLabel("Headline", { exact: true })).toHaveValue(
    "REVIEWED COPY UPDATED AGAIN",
  );
  await panel
    .getByRole("button", {
      name: "Review saved draft and evidence",
      exact: true,
    })
    .click();
  await panel
    .getByRole("combobox", { name: "Content classification", exact: true })
    .selectOption("financial");
  await panel
    .getByLabel(
      "I reviewed this saved draft and its evidence across all formats.",
      { exact: true },
    )
    .check();
  const replacement = page.waitForResponse(
    (response) =>
      response.url().includes("/promote") &&
      response.request().method() === "POST",
  );
  await panel
    .getByRole("button", {
      name: "Confirm reviewed copy and continue to handoff",
    })
    .click();
  const replaced = await replacement;
  expect(replaced.status()).toBe(200);
  const updated = await replaced.json();
  expect(updated.receipt.generationId).not.toBe(data.receipt.generationId);
  await expect(page.locator('#workflow-preview svg[role="img"]')).toContainText(
    /UPDATED.*AGAIN/s,
  );
  expect(paid).toEqual([]);
});
test("both brand candidates retain scope and unsaved candidate work blocks navigation until explicit discard", async ({
  page,
}, testInfo) => {
  await signIn(page);
  let panel = await open(page);
  await panel
    .getByLabel("Headline", { exact: true })
    .fill("LOCAL PREVIEW WORK");
  await page
    .getByRole("button", { name: "Content calendar", exact: true })
    .click();
  await expect(panel).toBeVisible();
  await expect(
    page.getByRole("alert").filter({ hasText: "Save prepared preview edits" }),
  ).toBeVisible();
  await panel
    .getByRole("button", {
      name: "Reload saved preview / discard edits",
      exact: true,
    })
    .click();
  await expect(panel.getByLabel("Headline", { exact: true })).not.toHaveValue(
    "LOCAL PREVIEW WORK",
  );
  await page
    .getByRole("button", { name: "Story backlog", exact: true })
    .click();
  panel = await open(page, "brand_vedic");
  await page.setViewportSize({ width: 883, height: 695 });
  await page.screenshot({
    path: testInfo.outputPath("cwj-primary-preview-after-v3.png"),
  });
  await panel
    .getByText("Evidence and unresolved questions", { exact: true })
    .click();
  await expect(
    panel.getByText("Historical text translation for cultural review.", {
      exact: false,
    }),
  ).toBeVisible();
  await panel
    .getByRole("button", {
      name: "Review saved draft and evidence",
      exact: true,
    })
    .click();
  await panel
    .getByRole("combobox", { name: "Content classification", exact: true })
    .selectOption("cultural");
  await panel
    .getByLabel(
      "I reviewed this saved draft and its evidence across all formats.",
      { exact: true },
    )
    .check();
  await panel
    .getByRole("button", {
      name: "Confirm reviewed copy and continue to handoff",
    })
    .click();
  await expect(
    page.getByText("Human-reviewed prepared copy · layout approval required", {
      exact: true,
    }),
  ).toBeVisible();
});
test("lost post-commit preview save retains the exact request until its receipt is recovered", async ({
  page,
}) => {
  await signIn(page);
  const panel = await open(page);
  const keys = [];
  let lost = true;
  await page.route(
    /\/api\/studio\/preparations\/[^/]+\/edit(?:\?|$)/,
    async (route) => {
      keys.push(route.request().postDataJSON().idempotencyKey);
      const response = await route.fetch();
      if (lost) {
        lost = false;
        await route.abort("failed");
      } else await route.fulfill({ response });
    },
  );
  await panel
    .getByLabel("Headline", { exact: true })
    .fill("RETAINED PREVIEW SAVE");
  await panel
    .getByRole("button", { name: "Save preview edits", exact: true })
    .click();
  await expect(
    panel.getByRole("button", { name: "Retry same request", exact: true }),
  ).toBeVisible();
  await expect(panel.getByLabel("Headline", { exact: true })).toBeDisabled();
  await panel
    .getByRole("button", { name: "Retry same request", exact: true })
    .click();
  await expect(
    panel.getByText("Preview edits saved.", { exact: false }),
  ).toBeVisible();
  expect(keys).toHaveLength(2);
  expect(keys[1]).toBe(keys[0]);
  const founder = (await platform.store.get("identity")).users.find(
      (user) => user.username === "founder",
    ),
    scope = await platform.identity.authorize(
      founder,
      "org_default",
      "brand_default",
    ),
    container = await platform.forScope(scope),
    entry = (await container.ports.repo.read()).preparedSourceCandidates[0];
  expect(entry.revision).toBe(2);
  expect(entry.workingArtwork.infographic.headline).toBe(
    "RETAINED PREVIEW SAVE",
  );
});
test("an external candidate edit invalidates an already-open review without overwriting saved copy", async ({
  page,
}) => {
  await signIn(page);
  const panel = await open(page);
  await panel
    .getByRole("button", {
      name: "Review saved draft and evidence",
      exact: true,
    })
    .click();
  const founder = (await platform.store.get("identity")).users.find(
      (user) => user.username === "founder",
    ),
    scope = await platform.identity.authorize(
      founder,
      "org_default",
      "brand_default",
    ),
    container = await platform.forScope(scope),
    jobs = platform.operatorJobs(scope, container),
    entry = (await container.ports.repo.read()).preparedSourceCandidates[0],
    artwork = structuredClone(entry.candidate.artwork);
  artwork.infographic.headline = "EXTERNAL SAVED CANDIDATE";
  await jobs.editCandidate(founder, entry.candidate.id, {
    idempotencyKey: randomUUID(),
    expectedRevision: 1,
    artwork,
  });
  await panel
    .getByRole("combobox", { name: "Content classification", exact: true })
    .selectOption("financial");
  await panel
    .getByLabel(
      "I reviewed this saved draft and its evidence across all formats.",
      { exact: true },
    )
    .check();
  const response = page.waitForResponse((response) =>
    response.url().includes("/promote"),
  );
  await panel
    .getByRole("button", {
      name: "Confirm reviewed copy and continue to handoff",
    })
    .click();
  expect((await response).status()).toBe(409);
  await expect(panel.getByRole("alert")).toBeVisible();
  expect(
    (await container.ports.repo.read()).backlog.find(
      (story) => story.id === "story_huda_buyback",
    ).campaignDraft,
  ).toBeNull();
  await panel
    .getByRole("button", { name: "Reload saved preview / discard edits" })
    .click();
  await expect(panel.getByLabel("Headline", { exact: true })).toHaveValue(
    "EXTERNAL SAVED CANDIDATE",
  );
});
test("an ordinary pending save is pending, not an uncertain outcome", async ({
  page,
}) => {
  await signIn(page);
  const panel = await open(page);
  let release, started;
  const held = new Promise((resolve) => (started = resolve)),
    resume = new Promise((resolve) => (release = resolve));
  await page.route(
    /\/api\/studio\/preparations\/[^/]+\/edit(?:\?|$)/,
    async (route) => {
      started();
      await resume;
      await route.fulfill({ response: await route.fetch() });
    },
  );
  await panel
    .getByLabel("Headline", { exact: true })
    .fill("NORMAL PENDING SAVE");
  await panel
    .getByRole("button", { name: "Save preview edits", exact: true })
    .click();
  await held;
  await expect(
    panel.getByRole("button", { name: "Save preview edits", exact: true }),
  ).toBeDisabled();
  await expect(
    panel.getByText("The request outcome is uncertain.", { exact: false }),
  ).toHaveCount(0);
  await expect(
    panel.getByRole("button", { name: "Retry same request", exact: true }),
  ).toHaveCount(0);
  release();
  await expect(
    panel.getByText("Preview edits saved.", { exact: false }),
  ).toBeVisible();
});
test("held valid status refresh with new candidate ID at revision one preserves local edits and original base", async ({
  page,
}) => {
  await signIn(page);
  const panel = await open(page);
  let release, started;
  const held = new Promise((resolve) => (started = resolve)),
    resume = new Promise((resolve) => (release = resolve));
  await page.route(
    /\/api\/studio\/preparations\/stories\/story_huda_buyback(?:\?|$)/,
    async (route) => {
      started();
      await resume;
      await route.fulfill({ response: await route.fetch() });
    },
  );
  await panel
    .getByRole("button", { name: "Refresh preparation status", exact: true })
    .click();
  await held;
  await panel
    .getByLabel("Headline", { exact: true })
    .fill("LOCAL COPY MUST SURVIVE NEW CANDIDATE");
  const founder = (await platform.store.get("identity")).users.find(
      (user) => user.username === "founder",
    ),
    scope = await platform.identity.authorize(
      founder,
      "org_default",
      "brand_default",
    ),
    container = await platform.forScope(scope),
    repo = container.ports.repo,
    state = await repo.read(),
    story = state.backlog.find((story) => story.id === "story_huda_buyback"),
    oldId = story.preparedCandidateId,
    jobs = platform.operatorJobs(scope, container),
    job = await jobs.create(founder, {
      purpose: "source-preparation",
      idempotencyKey: randomUUID(),
      reviewed: true,
      brandRevision: brandRevision(state.brandProfile),
      items: [{ storyId: story.id, storyRevision: story.revision }],
    });
  await jobs.runNext("held-refresh-worker", job.id, job.items[0].id, 1);
  const nextState = await repo.read(),
    newId = nextState.backlog.find(
      (row) => row.id === story.id,
    ).preparedCandidateId;
  expect(newId).not.toBe(oldId);
  expect((await jobs.candidate(founder, newId)).revision).toBe(1);
  release();
  await expect(
    panel.getByText("A newer candidate is saved.", { exact: false }),
  ).toBeVisible();
  await expect(panel.getByLabel("Headline", { exact: true })).toHaveValue(
    "LOCAL COPY MUST SURVIVE NEW CANDIDATE",
  );
  await panel.getByText("Candidate details", { exact: true }).click();
  await expect(
    panel.getByText(`Candidate ${oldId}`, { exact: false }),
  ).toBeVisible();
  const failedSave = page.waitForResponse(
    (response) =>
      response.url().includes("/edit") &&
      response.request().method() === "POST",
  );
  await panel
    .getByRole("button", { name: "Save preview edits", exact: true })
    .click();
  expect((await failedSave).status()).toBe(409);
  await expect(panel.getByLabel("Headline", { exact: true })).toHaveValue(
    "LOCAL COPY MUST SURVIVE NEW CANDIDATE",
  );
});

// Controlled status projections isolate notice lifecycle; authentication and the
// preparation POST still use the real HTTP/SQLite service. They confer no approval.
for (const terminalStatus of ['failed', 'cancelled']) {
  test(`queued notice clears when preparation becomes ${terminalStatus}`, async ({page}) => {
    await signIn(page);
    const panel = await open(page);
    let projectedStatus = 'queued';
    await page.route(url => url.pathname === `/api/studio/preparations/stories/${urls.brand_default}`, async route => {
      const response = await route.fetch();
      const body = await response.json();
      await route.fulfill({response, json: {...body, status: projectedStatus}});
    });
    const accepted = page.waitForResponse(response =>
      new URL(response.url()).pathname === '/api/studio/jobs' && response.request().method() === 'POST');
    await panel.getByRole('button', {name: 'Prepare a new source candidate', exact: true}).click();
    expect((await accepted).ok()).toBeTruthy();
    const queued = panel.getByText('Source preparation queued. You can leave and rejoin this durable job.', {exact: true});
    await expect(queued).toBeVisible();
    // Pending status must retain the notice; only the later terminal projection clears it.
    await panel.getByRole('button', {name: 'Refresh preparation status', exact: true}).click();
    await expect(queued).toBeVisible();
    projectedStatus = terminalStatus;
    await panel.getByRole('button', {name: 'Refresh preparation status', exact: true}).click();
    await expect(panel.getByRole('status').filter({hasText: new RegExp(`^${terminalStatus}$`)})).toBeVisible();
    await expect(queued).toHaveCount(0);
    await expect(panel.getByRole('button', {name: 'Review saved draft and evidence', exact: true})).toBeVisible();
  });
}
