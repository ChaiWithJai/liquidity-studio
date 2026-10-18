import { test, expect } from "@playwright/test";
import { createServer } from "node:http";
import { createServer as createVite } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { randomBytes } from "node:crypto";
import { fileURLToPath } from "node:url";
import { DurableStore } from "../server/storage.js";
import { createPlatform } from "../server/platform.js";
import { createHttpServer } from "../server/index.js";
let directory, store, platform, server, vite, base, password, helperId;
test.beforeAll(async () => {
  directory = mkdtempSync(join(tmpdir(), "helper-ui-"));
  password = randomBytes(24).toString("base64url");
  store = new DurableStore(join(directory, "fixture.sqlite"));
  platform = createPlatform({ store, authMode: "password" });
  await platform.ready;
  for (const [username, role] of [
    ["browser-owner", "founder"],
    ["browser-helper", "marketer"],
  ])
    await platform.identity.provision({ username, role, password });
  helperId = (await store.get("identity")).users.find(
    (user) => user.username === "browser-helper",
  ).id;
  const api = createHttpServer(null, { platform, helperControlEnabled: true });
  vite = await createVite({
    root: fileURLToPath(new URL("..", import.meta.url)),
    configFile: false,
    cacheDir: join(directory, "vite"),
    plugins: [svelte()],
    server: { middlewareMode: true, hmr: false },
    appType: "custom",
    logLevel: "error",
  });
  server = createServer((req, res) => {
    if (req.url.startsWith("/api/")) api.emit("request", req, res);
    else if (req.url === "/tests/fixtures/helper-host.html")
      void vite
        .transformIndexHtml(
          req.url,
          readFileSync(
            new URL("./fixtures/helper-host.html", import.meta.url),
            "utf8",
          ),
        )
        .then((html) => {
          res.setHeader("Content-Type", "text/html");
          res.end(html);
        });
    else
      vite.middlewares(req, res, () => {
        res.statusCode = 404;
        res.end();
      });
  });
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  base = `http://127.0.0.1:${server.address().port}`;
});
test.afterAll(async () => {
  await new Promise((resolve) => server.close(resolve));
  await vite.close();
  store.close();
  rmSync(directory, { recursive: true, force: true });
});
async function login(page, username) {
  expect(
    (
      await page.request.post(base + "/api/auth/login", {
        data: { username, password },
      })
    ).status(),
  ).toBe(200);
  await page.goto(base + "/tests/fixtures/helper-host.html");
  await expect(
    page.getByRole("heading", { name: "Shared control", exact: true }),
  ).toBeVisible();
}

// Deterministic protocol evaluator: screenshot bytes are evidence, not inferred vision.
test("scripted screenshot/observation helper: scoped stale, malformed, pause and unknown-result recovery", async ({
  browser,
}, testInfo) => {
  const { createHash, randomUUID } = await import("node:crypto");
  const { writeFileSync } = await import("node:fs");
  const ownerContext = await browser.newContext(),
    helperContext = await browser.newContext();
  const owner = await ownerContext.newPage(),
    helper = await helperContext.newPage();
  const scope = { organizationId: "org_default", brandId: "brand_default" };
  const samples = [],
    observations = [];
  const evidence = {
    schemaVersion: 1,
    sourceCommit: "ed4cf97",
    actorKind: "scripted-helper",
    model: null,
    scope,
    viewport: { width: 1440, height: 1100 },
    samples,
    observations,
    corrections: 0,
    scriptedOwnerApprovals: 0,
    scriptedOwnerPauseInterventions: 0,
    humanInterventions: null,
  };
  async function call(context, path, data, expected = 200) {
    const started = performance.now();
    const response = await context.request.fetch(
      base + path + "?" + new URLSearchParams(scope),
      {
        method: data === undefined ? "GET" : "POST",
        ...(data === undefined ? {} : { data }),
      },
    );
    const body = await response.json();
    samples.push({
      path,
      elapsedMs: Math.round((performance.now() - started) * 100) / 100,
      status: response.status(),
    });
    expect(response.status()).toBe(expected);
    return body;
  }
  const control = "/api/studio/workspace/control";
  try {
    await login(owner, "browser-owner");
    await login(helper, "browser-helper");
    const row = (await call(ownerContext, "/api/studio/workspace/query", {}))
      .rows[0];
    const read = () =>
      call(helperContext, "/api/studio/workspace/stories/" + row.id);
    const observed = (await read()).story;
    await expect(
      helper.getByText(
        "Current story: " + observed.title + " · revision " + observed.revision,
      ),
    ).toBeVisible();
    const screenshot = await helper.screenshot({
      path: testInfo.outputPath("S16-helper-observation.png"),
    });
    const observation = {
      ...scope,
      storyId: observed.id,
      expectedRevision: observed.revision,
      capturedAt: new Date().toISOString(),
      screenshotSha256: createHash("sha256").update(screenshot).digest("hex"),
      viewport: { width: 1440, height: 1100 },
      source:
        "authenticated structured GET plus browser screenshot; no pixel inference",
    };
    observations.push(observation);
    const grant = await call(
      ownerContext,
      control + "/grants",
      {
        helperId,
        storyIds: [row.id],
        kinds: ["story.patch"],
        expiresAt: new Date(Date.now() + 600000).toISOString(),
      },
      201,
    );
    const propose = (revision, category, extra = {}) =>
      call(
        helperContext,
        control + "/proposals",
        {
          grantId: grant.id,
          epoch: grant.epoch,
          changes: [
            {
              kind: "story.patch",
              storyId: row.id,
              expectedRevision: revision,
              patch: { category },
            },
          ],
          ...extra,
        },
        201,
      );
    const human = await call(ownerContext, "/api/studio/workspace/mutations", {
      idempotencyKey: randomUUID(),
      changes: [
        {
          kind: "story.patch",
          storyId: row.id,
          expectedRevision: observed.revision,
          patch: { category: "Owner changed after screenshot" },
        },
      ],
    });
    expect(human.outcomes[0].status).toBe("applied");
    const stale = await call(
      helperContext,
      control + "/proposals",
      {
        grantId: grant.id,
        epoch: grant.epoch,
        changes: [
          {
            kind: "story.patch",
            storyId: observation.storyId,
            expectedRevision: observation.expectedRevision,
            patch: { category: "Stale screenshot candidate" },
          },
        ],
      },
      409,
    );
    expect(stale.error).toMatch(/stale/i);
    const beforeMalformed = (await read()).story;
    await call(
      helperContext,
      control + "/proposals",
      {
        grantId: grant.id,
        epoch: grant.epoch,
        changes: [
          {
            kind: "source.approve",
            storyId: row.id,
            expectedRevision: beforeMalformed.revision,
            patch: { status: "approved" },
          },
        ],
      },
      400,
    );
    await call(
      helperContext,
      control + "/proposals",
      { grantId: grant.id, epoch: grant.epoch, changes: [null] },
      400,
    );
    expect((await read()).story.revision).toBe(beforeMalformed.revision);
    evidence.corrections++;
    const corrected = (await read()).story;
    const proposal = await propose(
      corrected.revision,
      "Corrected scoped helper category",
    );
    await call(
      ownerContext,
      control + "/proposals/" + proposal.id + "/approve",
      { expectedRevision: proposal.revision },
    );
    evidence.scriptedOwnerApprovals++;
    await owner
      .getByLabel("Personal notes", { exact: true })
      .fill("Personal unfinished evaluation notes");
    await owner.getByLabel("Personal notes", { exact: true }).focus();
    const intent = {
      grantId: grant.id,
      epoch: grant.epoch,
      idempotencyKey: randomUUID(),
    };
    // A browser network abort after the server committed simulates a lost response.
    const applyPath = control + "/proposals/" + proposal.id + "/apply";
    await helper.route("**/control/proposals/*/apply?*", async (route) => {
      await route.fetch();
      await route.abort("failed");
    });
    const transport = await helper.evaluate(
      async ({ path, intent, scope }) => {
        try {
          await fetch(path + "?" + new URLSearchParams(scope), {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(intent),
          });
          return "unexpected-response";
        } catch {
          return "unknown";
        }
      },
      { path: applyPath, intent, scope },
    );
    expect(transport).toBe("unknown");
    await helper.unroute("**/control/proposals/*/apply?*");
    const receipt = await call(helperContext, applyPath, intent);
    expect(receipt.outcomes[0].status).toBe("applied");
    expect(await call(helperContext, applyPath, intent)).toEqual(receipt);
    const after = (await read()).story;
    expect(after.category).toBe("Corrected scoped helper category");
    expect(after.revision).toBe(corrected.revision + 1);
    await expect(
      owner.getByLabel("Personal notes", { exact: true }),
    ).toBeFocused();
    await expect(
      owner.getByLabel("Personal notes", { exact: true }),
    ).toHaveValue("Personal unfinished evaluation notes");
    const pauseProposal = await propose(
      after.revision,
      "Must never apply after pause",
    );
    await call(
      ownerContext,
      control + "/proposals/" + pauseProposal.id + "/approve",
      { expectedRevision: pauseProposal.revision },
    );
    evidence.scriptedOwnerApprovals++;
    await call(ownerContext, control + "/grants/" + grant.id + "/pause", {
      expectedEpoch: grant.epoch,
    });
    evidence.scriptedOwnerPauseInterventions++;
    await call(
      helperContext,
      control + "/proposals/" + pauseProposal.id + "/apply",
      { grantId: grant.id, epoch: grant.epoch, idempotencyKey: randomUUID() },
      409,
    );
    expect((await read()).story.category).toBe(after.category);
    await helper.reload();
    await expect(
      helper.getByRole("heading", { name: /Proposal · applied/ }),
    ).toBeVisible();
    await helper.screenshot({
      path: testInfo.outputPath("S16-helper-result.png"),
    });
    const state = await (await platform.forScope(scope)).ports.repo.read();
    expect(
      state.workspace.receipts.filter((r) => r.actorId === helperId),
    ).toHaveLength(1);
    const sorted = samples.map((s) => s.elapsedMs).sort((a, b) => a - b),
      q = (p) => sorted[Math.ceil(p * sorted.length) - 1];
    Object.assign(evidence, {
      requestCount: samples.length,
      latencyMs: {
        p50: q(0.5),
        p95: q(0.95),
        definition:
          "nearest-rank isolated loopback HTTP requests, not model or human latency",
      },
      results: {
        staleScreenshotRejected: true,
        malformedActionRejected: true,
        pausedEpochRejected: true,
        lostResponseRecoveredSameKey: true,
        helperReceipts: 1,
        humanFocusPreserved: true,
        rejoinPersisted: true,
      },
      limitations: [
        "single fixture run",
        "scripted owner approvals, not observed human interventions",
        "pixels not interpreted",
        "no model loaded, no memory/inference measurement",
        "no cloud or Google-session acceptance",
      ],
    });
    writeFileSync(
      testInfo.outputPath("scripted-helper-evaluation.json"),
      JSON.stringify(evidence, null, 2),
    );
    await testInfo.attach("bounded-scripted-evaluation", {
      body: JSON.stringify(evidence, null, 2),
      contentType: "application/json",
    });
  } finally {
    await ownerContext.close();
    await helperContext.close();
  }
});
