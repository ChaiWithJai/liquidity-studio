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
  await panel
    .getByLabel("headline", { exact: true })
    .fill("HUMAN EDITED PREPARED SOURCE DRAFT");
  await panel
    .getByRole("button", { name: "Save preview edits", exact: true })
    .click();
  await expect(
    panel.getByText("Preview edits saved.", { exact: false }),
  ).toBeVisible();
  await page.reload();
  panel = await open(page);
  await expect(panel.getByLabel("headline", { exact: true })).toHaveValue(
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
  await expect(page.getByLabel("Headline", { exact: true })).toHaveValue(
    "HUMAN EDITED PREPARED SOURCE DRAFT",
  );
  await expect(
    page.getByText("Human-reviewed prepared copy · layout approval required", {
      exact: true,
    }),
  ).toBeVisible();
  expect(paid).toEqual([]);
});
test("both brand candidates retain scope and unsaved candidate work blocks navigation until explicit discard", async ({
  page,
}) => {
  await signIn(page);
  let panel = await open(page);
  await panel
    .getByLabel("headline", { exact: true })
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
  await expect(panel.getByLabel("headline", { exact: true })).not.toHaveValue(
    "LOCAL PREVIEW WORK",
  );
  await page
    .getByRole("button", { name: "Story backlog", exact: true })
    .click();
  panel = await open(page, "brand_vedic");
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
    .getByLabel("headline", { exact: true })
    .fill("RETAINED PREVIEW SAVE");
  await panel
    .getByRole("button", { name: "Save preview edits", exact: true })
    .click();
  await expect(
    panel.getByRole("button", { name: "Retry same request", exact: true }),
  ).toBeVisible();
  await expect(panel.getByLabel("headline", { exact: true })).toBeDisabled();
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
  await expect(panel.getByLabel("headline", { exact: true })).toHaveValue(
    "EXTERNAL SAVED CANDIDATE",
  );
});
