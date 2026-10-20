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
test("two authenticated actors review and apply a proposal without focus theft; lost response retries one persisted operation", async ({
  browser,
}) => {
  const ownerContext = await browser.newContext(),
    helperContext = await browser.newContext(),
    owner = await ownerContext.newPage(),
    helper = await helperContext.newPage();
  try {
    await login(owner, "browser-owner");
    await login(helper, "browser-helper");
    await expect(helper.getByLabel('Proposal action', {exact: true})).toHaveCount(0);
    await expect(helper.getByLabel('Proposed category', {exact: true})).toHaveCount(0);
    await expect(helper.getByText('Proposal inputs appear when you receive an active grant for this story.', {exact: true})).toBeVisible();
    await owner
      .getByLabel("Proposal operator", { exact: true })
      .selectOption(helperId);
    await owner
      .getByRole("button", {
        name: "Grant metadata proposals for 10 minutes",
        exact: true,
      })
      .click();
    await expect(owner.getByRole("article")).toHaveCount(1);
    // An outgoing grant authorizes the other actor; it is not an incoming proposal capability.
    await expect(owner.getByLabel('Proposal action', {exact: true})).toHaveCount(0);
    await expect(owner.getByLabel('Proposed category', {exact: true})).toHaveCount(0);
    await expect(owner.getByText('Proposal inputs appear when you receive an active grant for this story.', {exact: true})).toBeVisible();
    await helper
      .getByRole("button", { name: "Refresh shared control", exact: true })
      .click();
    await expect(helper.getByRole("article")).toHaveCount(1);
    await expect(helper.getByLabel('Proposal action', {exact: true})).toBeVisible();
    await helper
      .getByLabel("Proposed category", { exact: true })
      .fill("Shared browser proposal");
    await helper
      .getByRole("button", { name: "Propose category change", exact: true })
      .click();
    await expect(
      helper.getByRole("heading", { name: /Proposal · proposed/ }),
    ).toBeVisible();
    await expect(
      helper.getByRole("button", {
        name: "Apply approved proposal",
        exact: true,
      }),
    ).toHaveCount(0);
    await owner
      .getByRole("button", { name: "Refresh shared control", exact: true })
      .click();
    await owner
      .getByRole("button", { name: "Approve exact proposal", exact: true })
      .click();
    await helper
      .getByRole("button", { name: "Refresh shared control", exact: true })
      .click();
    await expect(
      helper.getByRole("button", {
        name: "Apply approved proposal",
        exact: true,
      }),
    ).toBeVisible();
    await owner
      .getByLabel("Personal notes", { exact: true })
      .fill("Unfinished human work");
    await owner.getByLabel("Personal notes", { exact: true }).focus();
    const keys = [];
    helper.on("request", (request) => {
      if (
        request.method() === "POST" &&
        /\/control\/proposals\/[^/]+\/apply/.test(request.url())
      )
        keys.push(request.postDataJSON().idempotencyKey);
    });
    const pattern = "**/control/proposals/*/apply?*";
    await helper.route(pattern, async (route) => {
      await route.fetch();
      await route.abort("failed");
    });
    await helper
      .getByRole("button", { name: "Apply approved proposal", exact: true })
      .click();
    await expect(
      helper.getByRole("button", {
        name: "Retry same application",
        exact: true,
      }),
    ).toBeVisible();
    await helper.unroute(pattern);
    await expect(
      owner.getByRole("heading", { name: /Proposal · applied/ }),
    ).toBeVisible({ timeout: 10000 });
    await expect(
      owner.getByLabel("Personal notes", { exact: true }),
    ).toHaveValue("Unfinished human work");
    await expect(
      owner.getByLabel("Personal notes", { exact: true }),
    ).toBeFocused();
    await helper
      .getByRole("button", { name: "Retry same application", exact: true })
      .click();
    await expect(
      helper.getByRole("button", {
        name: "Retry same application",
        exact: true,
      }),
    ).toHaveCount(0);
    expect(keys).toHaveLength(2);
    expect(keys[0]).toBe(keys[1]);
    const state = await (
      await platform.forScope({
        organizationId: "org_default",
        brandId: "brand_default",
      })
    ).ports.repo.read();
    const proposal = state.operatorControl.proposals[0],
      story = state.backlog.find(
        (row) => row.id === proposal.changes[0].storyId,
      );
    expect(story.category).toBe("Shared browser proposal");
    expect(story.revision).toBe(proposal.changes[0].expectedRevision + 1);
    expect(
      state.workspace.receipts.filter(
        (receipt) => receipt.actorId === helperId,
      ),
    ).toHaveLength(1);
    await helper.reload();
    await expect(
      helper.getByRole("heading", { name: /Proposal · applied/ }),
    ).toBeVisible();
    await expect(
      owner.getByText(/browser-helper · human · recently connected/).first(),
    ).toBeVisible();
    const undoKeys = [];
    helper.on('request', request => { if (request.method() === 'POST' && /\/workspace\/operations\/[^/]+\/undo/.test(request.url())) undoKeys.push(request.postDataJSON().idempotencyKey); });
    const undoPattern = '**/workspace/operations/*/undo?*';
    await helper.route(undoPattern, async route => { await route.fetch(); await route.abort('failed'); });
    await helper.getByRole('button', { name: 'Undo accepted changes', exact: true }).click();
    await expect(helper.getByRole('button', { name: 'Retry same undo', exact: true })).toBeVisible();
    await helper.unroute(undoPattern);
    await helper.getByRole('button', { name: 'Retry same undo', exact: true }).click();
    await expect(helper.getByRole('button', { name: 'Retry same undo', exact: true })).toHaveCount(0);
    expect(undoKeys).toHaveLength(2); expect(undoKeys[0]).toBe(undoKeys[1]);
    const afterUndo = await (await platform.forScope({ organizationId: 'org_default', brandId: 'brand_default' })).ports.repo.read();
    const restored = afterUndo.backlog.find(row => row.id === story.id);
    expect(restored.category).toBe(proposal.preview[0].before.category);
    expect(restored.revision).toBe(proposal.changes[0].expectedRevision + 2);

    // Only this browser's clock advances: ordinary refresh must stop offering
    // proposal fields when its incoming grant has expired, without hiding history.
    const incoming = afterUndo.operatorControl.grants.find(grant => grant.helperId === helperId);
    await helper.clock.install({time: new Date(Date.parse(incoming.expiresAt) + 1000)});
    await helper.getByRole('button', {name: 'Refresh shared control', exact: true}).click();
    await expect(helper.getByRole('article', {name: `Grant ${incoming.id}`, exact: true})).toContainText('Expired');
    await expect(helper.getByLabel('Proposal action', {exact: true})).toHaveCount(0);
    await expect(helper.getByLabel('Proposed category', {exact: true})).toHaveCount(0);
    await expect(helper.getByRole('button', {name: 'Propose category change', exact: true})).toHaveCount(0);
    await expect(helper.getByRole('heading', {name: /Proposal · applied/})).toBeVisible();
    await expect(helper.getByText('Proposal inputs appear when you receive an active grant for this story.', {exact: true})).toBeVisible();
    const afterExpiryRead = (await (await platform.forScope({organizationId: 'org_default', brandId: 'brand_default'})).ports.repo.read()).operatorControl;
    expect(afterExpiryRead.grants).toEqual(afterUndo.operatorControl.grants);
    expect(afterExpiryRead.proposals).toEqual(afterUndo.operatorControl.proposals);

  } finally {
    await ownerContext.close();
    await helperContext.close();
  }
});
test("scripted screenshot observation cannot authorize a stale proposal after a human edit", async ({
  browser,
}, info) => {
  const ownerContext = await browser.newContext(),
    helperContext = await browser.newContext(),
    owner = await ownerContext.newPage(),
    helper = await helperContext.newPage();
  try {
    await login(owner, "browser-owner");
    await login(helper, "browser-helper");
    const scope = "?organizationId=org_default&brandId=brand_default";
    const row = (
      await (
        await owner.request.post(base + "/api/studio/workspace/query" + scope, {
          data: {},
        })
      ).json()
    ).rows[0];
    const grant = await (
      await owner.request.post(
        base + "/api/studio/workspace/control/grants" + scope,
        {
          data: {
            helperId,
            storyIds: [row.id],
            kinds: ["story.patch"],
            expiresAt: new Date(Date.now() + 600000).toISOString(),
          },
        },
      )
    ).json();
    await helper
      .getByRole("button", { name: "Refresh shared control", exact: true })
      .click();
    await expect(
      helper.getByRole("article", { name: `Grant ${grant.id}`, exact: true }),
    ).toBeVisible();
    await info.attach("scripted-observation-before-human-change", {
      body: await helper.screenshot(),
      contentType: "image/png",
    });
    expect(
      (
        await owner.request.post(
          base + "/api/studio/workspace/mutations" + scope,
          {
            data: {
              idempotencyKey: crypto.randomUUID(),
              changes: [
                {
                  kind: "story.patch",
                  storyId: row.id,
                  expectedRevision: row.revision,
                  patch: { category: "Human changed after screenshot" },
                },
              ],
            },
          },
        )
      ).status(),
    ).toBe(200);
    await helper
      .getByLabel("Proposed category", { exact: true })
      .fill("Stale screenshot suggestion");
    const start = Date.now();
    await helper
      .getByRole("article", { name: `Grant ${grant.id}`, exact: true })
      .getByRole("button", { name: "Propose category change", exact: true })
      .click();
    await expect(helper.getByRole("alert")).toHaveText(
      "Proposal observation is stale",
    );
    const actual = (
      await (
        await owner.request.get(
          base + "/api/studio/workspace/stories/" + row.id + scope,
        )
      ).json()
    ).story;
    expect(actual.category).toBe("Human changed after screenshot");
    expect(actual.revision).toBe(row.revision + 1);
    await info.attach("bounded-protocol-result", {
      body: JSON.stringify({
        kind: "scripted-browser-protocol-check",
        modelSelected: false,
        observationRevision: row.revision,
        currentRevision: actual.revision,
        result: "stale-proposal-rejected",
        observedRoundTripMs: Date.now() - start,
        limits:
          "Screenshot captured as evidence; no model vision inference or quality benchmark.",
      }),
      contentType: "application/json",
    });
  } finally {
    await ownerContext.close();
    await helperContext.close();
  }
});
