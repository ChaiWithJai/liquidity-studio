import { test, expect } from "@playwright/test";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { randomUUID, randomBytes, createHash } from "node:crypto";
import { createPlatform } from "../server/platform.js";
import { DurableStore } from "../server/storage.js";
import { createHttpServer } from "../server/index.js";
import { brandRevision } from "../server/multimodal-contract.js";
const keys = [
  "NODE_ENV",
  "STUDIO_FOUNDER_PASSWORD",
  "STUDIO_MARKETER_PASSWORD",
  "STUDIO_OPERATOR_JOBS_ENABLED",
  "STUDIO_SOURCE_PREPARATION_ENABLED",
  "STUDIO_JOB_DISPATCHER",
  "STUDIO_SOURCE_HOSTS",
];
const previous = Object.fromEntries(keys.map((key) => [key, process.env[key]]));
test.afterAll(() => {
  for (const key of keys) {
    if (previous[key] === undefined) delete process.env[key];
    else process.env[key] = previous[key];
  }
});
let platform, server, directory, base, password, sourceCalls;
const ids = { brand_default: "story_huda_buyback", brand_vedic: "research_4" };
test.beforeEach(async () => {
  server = null;
  directory = mkdtempSync(join(tmpdir(), "prepared-historical-browser-"));
  password = randomBytes(24).toString("base64url");
  process.env.NODE_ENV = "test";
  process.env.STUDIO_FOUNDER_PASSWORD = password;
  process.env.STUDIO_MARKETER_PASSWORD = randomBytes(24).toString("base64url");
  process.env.STUDIO_OPERATOR_JOBS_ENABLED = "true";
  process.env.STUDIO_SOURCE_PREPARATION_ENABLED = "true";
  process.env.STUDIO_JOB_DISPATCHER = "local";
  delete process.env.STUDIO_SOURCE_HOSTS;
  sourceCalls = 0;
  const text =
      "Controlled retained source material for a portable unfinished draft.\nThis second controlled sentence does not record an approval.\nThis third controlled sentence is an editable test excerpt.",
    digest = createHash("sha256").update(text).digest("hex");
  platform = createPlatform({
    store: new DurableStore(join(directory, "studio.sqlite")),
    authMode: "password",
    sourceRetriever: async (url) => {
      sourceCalls++;
      return {
        schemaVersion: 1,
        sourceUrl: url,
        requestedUrl: url,
        retrievedAt: new Date().toISOString(),
        contentType: "text/plain",
        responseSha256: digest,
        textSha256: digest,
        responseBytes: Buffer.byteLength(text),
        extractionVersion: "controlled-browser-fixture",
        text,
        status: "unreviewed",
        approval: "none",
      };
    },
  });
  await platform.ready;
  await platform.identity.provision({
    username: "previous-owner",
    password: randomBytes(24).toString("base64url"),
    role: "founder",
  });
  const prior = (await platform.store.get("identity")).users.find(
    (user) => user.username === "previous-owner",
  );
  for (const brand of Object.keys(ids)) {
    const scope = await platform.identity.authorize(
        prior,
        "org_default",
        brand,
      ),
      container = await platform.forScope(scope),
      repo = container.ports.repo,
      story = (await repo.read()).backlog.find(
        (story) => story.id === ids[brand],
      ),
      jobs = platform.operatorJobs(scope, container),
      job = await jobs.create(prior, {
        purpose: "source-preparation",
        idempotencyKey: randomUUID(),
        reviewed: true,
        brandRevision: brandRevision(await repo.getBrandProfile()),
        items: [{ storyId: story.id, storyRevision: story.revision }],
      });
    await jobs.runNext(
      "historical-browser-fixture",
      job.id,
      job.items[0].id,
      1,
    );
    const entry = (await repo.read()).preparedSourceCandidates[0],
      artwork = structuredClone(entry.candidate.artwork);
    artwork.infographic.headline = "RETAINED UNFINISHED OWNER COPY";
    await jobs.editCandidate(prior, entry.candidate.id, {
      idempotencyKey: randomUUID(),
      expectedRevision: 1,
      artwork,
    });
    await repo.mutate((state) => {
      const entry = state.preparedSourceCandidates[0];
      entry.restoredHistorical = {
        packSha256: "a".repeat(64),
        originalScope: {
          organizationId: "former-org",
          brandId: "former-brand",
        },
        originalCandidateId: entry.candidate.id,
      };
      entry.candidate.jobId = null;
      entry.candidate.itemId = null;
      entry.candidate.attemptId = null;
      delete entry.edits;
      return state;
    });
  }
  server = createHttpServer(null, { platform });
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  base = "http://127.0.0.1:" + server.address().port;
});
test.afterEach(async () => {
  server?.closeAllConnections();
  if (server) await new Promise((resolve) => server.close(resolve));
  await platform?.store.close();
  rmSync(directory, { recursive: true, force: true });
});
async function enter(page, brand = "brand_default") {
  await page.goto(base);
  await page.getByLabel("Username", { exact: true }).fill("founder");
  await page.getByLabel("Password", { exact: true }).fill(password);
  await page.getByRole("button", { name: "Sign in →" }).click();
  if (brand !== "brand_default")
    await page.getByLabel("Brand", { exact: true }).selectOption(brand);
  await page.locator(`[data-open-story="${ids[brand]}"]`).click();
  const panel = page.getByRole("region", {
    name: "Prepared source draft",
    exact: true,
  });
  await expect(
    panel.getByRole("button", {
      name: "Continue editing restored draft",
      exact: true,
    }),
  ).toBeVisible();
  return panel;
}
async function stateFor(brand) {
  const user = (await platform.store.get("identity")).users.find(
      (user) => user.username === "founder",
    ),
    scope = await platform.identity.authorize(user, "org_default", brand),
    container = await platform.forScope(scope);
  return { user, scope, repo: container.ports.repo };
}
for (const brand of ["brand_default", "brand_vedic"])
  test(`${brand} unfinished imported copy resumes editing and requires fresh current-owner confirmation`, async ({
    page,
  }) => {
    let panel = await enter(page, brand);
    await expect(panel.getByLabel("Headline", { exact: true })).toBeDisabled();
    const { repo, user } = await stateFor(brand),
      old = (await repo.read()).preparedSourceCandidates[0],
      calls = sourceCalls;
    await panel
      .getByRole("button", {
        name: "Continue editing restored draft",
        exact: true,
      })
      .click();
    await expect(panel.getByLabel("Headline", { exact: true })).toBeEnabled();
    await expect(panel.getByLabel("Headline", { exact: true })).toHaveValue(
      "RETAINED UNFINISHED OWNER COPY",
    );
    expect(sourceCalls).toBe(calls);
    expect(
      (await repo.read()).backlog.find((story) => story.id === ids[brand])
        .campaignDraft,
    ).toBeNull();
    await panel
      .getByLabel("Headline", { exact: true })
      .fill("CURRENT OWNER REVIEWED CONTENT");
    await panel
      .getByRole("button", { name: "Save preview edits", exact: true })
      .click();
    await expect(
      panel.getByText("Preview edits saved.", { exact: false }),
    ).toBeVisible();
    await page.reload();
    if (brand !== "brand_default")
      await page.getByLabel("Brand", { exact: true }).selectOption(brand);
    await page.locator(`[data-open-story="${ids[brand]}"]`).click();
    panel = page.getByRole("region", {
      name: "Prepared source draft",
      exact: true,
    });
    await expect(panel.getByLabel("Headline", { exact: true })).toHaveValue(
      "CURRENT OWNER REVIEWED CONTENT",
    );
    await panel
      .getByRole("button", {
        name: "Review saved draft and evidence",
        exact: true,
      })
      .click();
    await panel
      .getByRole("combobox", { name: "Content classification", exact: true })
      .selectOption(brand === "brand_default" ? "financial" : "cultural");
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
      page.getByRole("button", { name: "Edit reviewed copy", exact: true }),
    ).toBeVisible();
    const state = await repo.read(),
      story = state.backlog.find((story) => story.id === ids[brand]);
    expect(story.campaignDraft.infographic.headline).toBe(
      "CURRENT OWNER REVIEWED CONTENT",
    );
    expect(
      story.sourceClaims.every((claim) => claim.reviewedBy === user.id),
    ).toBe(true);
    expect(state.preparedSourceCandidates[0]).toEqual(old);
    expect(state.preparedSourceCandidates).toHaveLength(2);
  });
test("lost historical-fork reply retries the same request without importing approval or duplicating drafts", async ({
  page,
}) => {
  const panel = await enter(page),
    keys = [];
  let lost = true;
  await page.route(
    /\/api\/studio\/preparations\/[^/]+\/fork(?:\?|$)/,
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
    .getByRole("button", {
      name: "Continue editing restored draft",
      exact: true,
    })
    .click();
  await expect(
    panel.getByRole("button", { name: "Retry same request", exact: true }),
  ).toBeVisible();
  await panel
    .getByRole("button", { name: "Retry same request", exact: true })
    .click();
  await expect(panel.getByLabel("Headline", { exact: true })).toBeEnabled();
  expect(keys).toHaveLength(2);
  expect(keys[0]).toBe(keys[1]);
  const { repo } = await stateFor("brand_default"),
    state = await repo.read();
  expect(state.preparedSourceCandidates).toHaveLength(2);
  expect(
    state.backlog.find((story) => story.id === ids.brand_default).campaignDraft,
  ).toBeNull();
  expect(
    state.preparedSourceCandidates[1].candidate.provenance.humanApproval,
  ).toBe("none");
});
