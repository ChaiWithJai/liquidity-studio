import { test, expect } from "@playwright/test";
import { createServer } from "node:http";
import { createServer as createVite } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import { nativeEditorPlugin } from "../scripts/native-editor-vite.js";
import { readFile, mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
let server, vite, base, dir, registered, actions, requests, loseReply, held;
const command = {
  operation: "refresh-brand-tokens",
  storyId: "original-story",
  expectedRevision: 1,
  generationId: "original-generation",
  expectedBrandRevision: "a".repeat(64),
  expectedNativeRevision: 1,
};
const binding = {
  id: "original-binding",
  targetId: "original-target",
  resourceId: "tokens",
  nativeUrl:
    "http://localhost:39008/#/workspace?team-id=original&file-id=original",
  command,
  available: true,
};
test.beforeAll(async () => {
  dir = await mkdtemp(join(tmpdir(), "penpot-panel-browser-"));
  vite = await createVite({
    root: fileURLToPath(new URL("..", import.meta.url)),
    configFile: false,
    cacheDir: join(dir, "vite"),
    plugins: [svelte(), nativeEditorPlugin()],
    server: { middlewareMode: true, hmr: false },
    appType: "custom",
    logLevel: "error",
  });
  server = createServer(async (req, res) => {
    const url = new URL(req.url, "http://localhost");
    const json = (value) => {
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify(value));
    };
    if (req.url === "/tests/fixtures/penpot-panel-host.html") {
      res.setHeader("Content-Type", "text/html");
      res.end(
        await vite.transformIndexHtml(
          req.url,
          await readFile(
            new URL("./fixtures/penpot-panel-host.html", import.meta.url),
            "utf8",
          ),
        ),
      );
      return;
    }
    if (url.pathname.startsWith("/api/studio/penpot/")) {
      if (url.searchParams.get("brand") === "two")
        return json({ bindings: [], targets: [], actions: [] });
      if (req.method === "GET" && url.pathname.endsWith("/bindings")) {
        const send = () =>
          json({
            bindings: registered ? [binding] : [],
            targets: [{ id: "original-target", registered }],
            actions,
          });
        if (held) {
          held.release = send;
          held.entered();
          return;
        }
        return send();
      }
      let bytes = "";
      for await (const chunk of req) bytes += chunk;
      const body = bytes ? JSON.parse(bytes) : {};
      if (url.pathname.endsWith("/bindings")) {
        registered = true;
        return json({ id: binding.id });
      }
      if (url.pathname.endsWith("/actions")) {
        requests.push(body);
        let action = actions.find(
          (item) => item.idempotencyKey === body.idempotencyKey,
        );
        const existing = !!action;
        if (!action) {
          action = {
            id: "original-action-" + actions.length,
            idempotencyKey: body.idempotencyKey,
            command,
            status: "pending-native-action",
          };
          actions.push(action);
        }
        if (loseReply) {
          loseReply = false;
          req.socket.destroy();
          return;
        }
        return json({
          action,
          capabilityAvailable: !existing,
          ...(!existing
            ? { nativeActionCapability: "original-component-fixture-code" }
            : {}),
        });
      }
      if (url.pathname.endsWith("/reconcile")) {
        const id = url.pathname.split("/").at(-2);
        const action = actions.find((item) => item.id === id);
        action.status = "native-state-verified";
        action.verification = {
          nativeRevision: 2,
          observedAt: "2026-10-18T04:00:00.000Z",
          method: "read-only-reconciliation",
        };
        return json(action);
      }
    }
    vite.middlewares(req, res, () => {
      res.statusCode = 404;
      res.end();
    });
  });
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  base = "http://127.0.0.1:" + server.address().port;
});
test.afterAll(async () => {
  await new Promise((resolve) => server.close(resolve));
  await vite.close();
  await rm(dir, { recursive: true, force: true });
});
test.beforeEach(() => {
  registered = false;
  actions = [];
  requests = [];
  loseReply = false;
  held = null;
});
test("component HTTP fixture registers target, prepares code and distinguishes observed native state from approval", async ({
  page,
}) => {
  await page.goto(base + "/tests/fixtures/penpot-panel-host.html");
  await page
    .getByRole("button", { name: "Register configured target original-target" })
    .click();
  await page
    .getByRole("button", { name: "Prepare color refresh", exact: true })
    .click();
  await expect(page.getByLabel("One-use native action code")).toHaveValue(
    "original-component-fixture-code",
  );
  await page.getByRole("button", { name: "Check saved native state" }).click();
  await expect(
    page.getByText("native-state-verified", { exact: true }),
  ).toBeVisible();
  await expect(page.getByLabel("One-use native action code")).toHaveCount(0);
  await expect(
    page.getByText(
      "Recovered by read-only comparison; action attribution is not inferred.",
      { exact: false },
    ),
  ).toBeVisible();
  expect(requests).toHaveLength(1);
  expect(actions).toHaveLength(1);
  expect(requests[0].command).toEqual(command);
});
test("lost preparation response retries identical key, rejoins history and fences delayed old-scope view", async ({
  page,
}) => {
  registered = true;
  let replyLost = false;
  await page.route(
    /\/api\/studio\/penpot\/actions\?brand=one$/,
    async (route) => {
      if (replyLost) return route.continue();
      replyLost = true;
      await route.fetch(); // The server committed; the browser never receives its reply.
      await route.abort("failed");
    },
  );
  await page.goto(base + "/tests/fixtures/penpot-panel-host.html");
  await page
    .getByRole("button", { name: "Prepare color refresh", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Recover exact preparation attempt" })
    .click();
  await expect(
    page.getByText("pending-native-action", { exact: true }),
  ).toBeVisible();
  expect(requests).toHaveLength(2);
  expect(requests[0].idempotencyKey).toBe(requests[1].idempotencyKey);
  expect(actions).toHaveLength(1);
  await expect(page.getByLabel("One-use native action code")).toHaveCount(0);
  await page.reload();
  await expect(
    page.getByText("pending-native-action", { exact: true }),
  ).toBeVisible();
  let entered;
  const waiting = new Promise((resolve) => (entered = resolve));
  held = { entered };
  await page.getByRole("button", { name: "Refresh native context" }).click();
  await waiting;
  await page.locator("#switch-scope").click();
  await expect(
    page.getByText("No action history for this story."),
  ).toBeVisible();
  held.release();
  held = null;
  await expect(
    page.getByText("pending-native-action", { exact: true }),
  ).toHaveCount(0);
  await expect(
    page.getByRole("link", { name: "Open registered native document" }),
  ).toHaveCount(0);
});
