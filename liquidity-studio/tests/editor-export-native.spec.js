import {setNativeTool, closeNativeTools} from './native-host-tools.js';
import { test, expect } from "@playwright/test";
import { createServer } from "node:http";
import { build } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import {
  readFileSync,
  writeFileSync,
  existsSync,
  mkdtempSync,
  rmSync,
} from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { randomBytes } from "node:crypto";
import { fileURLToPath } from "node:url";
import { createPlatform } from "../server/platform.js";
import { createHttpServer } from "../server/index.js";
import { DurableStore } from "../server/storage.js";
import { BRAND_PRESETS } from "../server/domain.js";
import { campaignFromApprovedClaims } from "../server/source-integrity.js";
import { brandRevision } from "../server/multimodal-contract.js";
import { nativeEditorPlugin } from "../scripts/native-editor-vite.js";
test.skip(
  !existsSync(new URL("../.native-editor-source/PIN.json", import.meta.url)),
  "Requires locally prepared pinned upstream source; redistribution condition unresolved.",
);
let server, store, base, platform, buildDirectory;
const password = randomBytes(24).toString("base64url");
const fixtures = [];
const previousLocalBuildFlag = process.env.STUDIO_NATIVE_EDITOR_LOCAL_BUILD;
test.beforeAll(async () => {
  process.env.STUDIO_NATIVE_EDITOR_LOCAL_BUILD = "true";
  store = new DurableStore(":memory:");
  platform = createPlatform({ store, authMode: "password" });
  await platform.ready;
  await platform.identity.provision({
    username: "native-host-fixture",
    password,
    role: "founder",
  });
  await platform.identity.provision({
    username: "native-marketer-fixture",
    password,
    role: "marketer",
  });
  const api = createHttpServer(null, { platform, nativeEditorEnabled: true });
  const root = fileURLToPath(new URL("..", import.meta.url));
  buildDirectory = mkdtempSync(
    path.join(tmpdir(), "liquidity-native-host-browser-"),
  );
  const priorEnvironment = process.env.NODE_ENV;
  process.env.NODE_ENV = "production";
  try {
    await build({
      root,
      configFile: false,
      plugins: [svelte(), nativeEditorPlugin()],
      esbuild: { jsx: "automatic" },
      logLevel: "error",
      build: {
        outDir: buildDirectory,
        emptyOutDir: true,
        rollupOptions: {
          input: {
            host: path.join(root, "tests/fixtures/native-editor-host.html"),
            studio: path.join(root, "tests/fixtures/native-studio-host.html"),
            frame: path.join(root, "native-editor-frame.html"),
          },
        },
      },
    });
  } finally {
    if (priorEnvironment === undefined) delete process.env.NODE_ENV;
    else process.env.NODE_ENV = priorEnvironment;
  }
  server = createServer((req, res) => {
    const route = req.url.split("?")[0];
    if (route.startsWith("/api/")) api.emit("request", req, res);
    else if (route === "/fixture-config") {
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify(fixtures));
    } else {
      const file = path.resolve(buildDirectory, "." + route);
      if (!file.startsWith(buildDirectory + path.sep)) {
        res.statusCode = 404;
        res.end("Not found");
        return;
      }
      try {
        res.setHeader(
          "Content-Type",
          {
            ".html": "text/html",
            ".js": "application/javascript",
            ".mjs": "application/javascript",
            ".wasm": "application/wasm",
            ".css": "text/css",
            ".ttf": "font/ttf",
            ".otf": "font/otf",
            ".txt": "text/plain",
          }[path.extname(file)] || "application/octet-stream",
        );
        res.end(readFileSync(file));
      } catch {
        res.statusCode = 404;
        res.end("Fixture not found");
      }
    }
  });
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  base = `http://127.0.0.1:${server.address().port}`;
  for (const [brandId, preset] of [
    ["brand_default", "liquidity_desk"],
    ["brand_vedic", "vedic_dharma"],
  ]) {
    const container = await platform.forScope({
      organizationId: "org_default",
      brandId,
      preset,
    });
    const story = {
      id: "native-fixture",
      title: "Native controlled integration fixture",
      revision: 1,
      generationId: "fixture-gen",
      sourceClaims: [
        {
          id: "fixture-claim",
          text: "An approved source excerpt for a controlled integration fixture.",
          sourceUrl: "https://example.org/controlled-fixture",
          status: "approved",
          kind: "general",
        },
      ],
    };
    story.campaignDraft = {
      ...campaignFromApprovedClaims(story),
      provenance: { generationId: story.generationId, mode: "synthetic" },
    };
    const brandProfile = structuredClone(BRAND_PRESETS[preset]);
    await container.ports.repo.mutate((state) => ({
      ...state,
      backlog: [story],
      brandProfile,
    }));
    const user = (await platform.identity.store.get("identity")).users.find(
      (user) => user.username === "native-host-fixture",
    );
    for (const format of ["infographic", "carousel", "story", "reel"]) {
      const record = await platform
        .nativeEditor(
          { organizationId: "org_default", brandId, preset },
          container.ports.repo,
        )
        .create(user, {
          storyId: story.id,
          format,
          expectedRevision: 1,
          generationId: story.generationId,
          expectedBrandRevision: brandRevision(brandProfile),
          idempotencyKey: `native_fixture_${preset}_${format}`,
        });
      fixtures.push({ id: record.id, brandId, label: `${preset} ${format}` });
    }
  }
});
test.afterAll(async () => {
  if (previousLocalBuildFlag === undefined)
    delete process.env.STUDIO_NATIVE_EDITOR_LOCAL_BUILD;
  else process.env.STUDIO_NATIVE_EDITOR_LOCAL_BUILD = previousLocalBuildFlag;
  if (server) await new Promise((resolve) => server.close(resolve));
  if (buildDirectory) rmSync(buildDirectory, { recursive: true, force: true });
  store?.close();
});
test("actual Studio native review renders and signs the exact PNG, survives lost completion reply and records export separately", async ({
  page,
}, testInfo) => {
  test.setTimeout(120000);
  await page.request.post(`${base}/api/auth/login`, {
    data: { username: "native-host-fixture", password },
  });
  await page.goto(`${base}/tests/fixtures/native-studio-host.html`);
  await page.getByRole("button", { name: /Campaign Studio/ }).click();
  await page
    .getByRole("button", { name: "Edit layout in Studio", exact: true })
    .click();
  const frame = page.frameLocator('iframe[title="Native Doory design canvas"]');
  await expect(
    frame.getByRole("button", { name: "Layers", exact: true }),
  ).toBeVisible({ timeout: 30000 });
  await setNativeTool(page, 'review');
  const review = page.getByRole("region", {
    name: "Saved layout review",
    exact: true,
  });
  for (const name of [
    "Begin review",
    "Start post-production",
    "Submit final layout",
    "Approve saved layout",
  ])
    await review.getByRole("button", { name, exact: true }).click();
  await expect(
    review.getByRole("status").filter({ hasText: "Approved" }),
  ).toBeVisible();
  const stageResponse = page.waitForResponse(
    (response) =>
      response.request().method() === "POST" &&
      /\/documents\/[^/]+\/exports\?/.test(response.url()),
  );
  await closeNativeTools(page);
  await frame
    .getByRole("button", { name: "Prepare approved PNGs", exact: true })
    .click();
  const staged = await (await stageResponse).json();
  expect(staged.sha256).toMatch(/^[a-f0-9]{64}$/);
  const exports = page.getByRole("region", {
    name: "Verified PNG export",
    exact: true,
  });
  await setNativeTool(page, 'export');
  await exports
    .getByRole("button", { name: "Review page 1", exact: true })
    .click();
  await page.reload();
  await page.getByRole("button", { name: /Campaign Studio/ }).click();
  await page
    .getByRole("button", { name: "Edit layout in Studio", exact: true })
    .click();
  await expect(
    frame.getByRole("button", { name: "Layers", exact: true }),
  ).toBeVisible({ timeout: 30000 });
  const recoveredResponse = page.waitForResponse(
    (response) =>
      response.request().method() === "GET" &&
      response.url().includes(`/exports/${staged.artifactId}?`),
  );
  await setNativeTool(page, 'export');
  await exports
    .getByRole("button", { name: "Review page 1", exact: true })
    .click();
  expect((await (await recoveredResponse).json()).artifactId).toBe(
    staged.artifactId,
  );
  const image = exports.getByRole("img", {
    name: "Prepared PNG for page 1",
    exact: true,
  });
  await expect(image).toBeVisible();
  const imageBytes = Buffer.from(
    (await image.getAttribute("src")).split(",")[1],
    "base64",
  );
  const { createHash } = await import("node:crypto");
  expect(createHash("sha256").update(imageBytes).digest("hex")).toBe(
    staged.sha256,
  );
  let attempts = 0;
  const envelopes = [];
  await page.route(
    "**/api/studio/native-editor/documents/*/exports/*/complete?*",
    async (route) => {
      envelopes.push(route.request().postDataJSON());
      if (++attempts === 1) {
        await route.fetch();
        return route.fulfill({
          status: 503,
          contentType: "application/json",
          body: JSON.stringify({ error: "Controlled reply lost after commit" }),
        });
      }
      return route.continue();
    },
  );
  await exports
    .getByRole("button", { name: "Approve this PNG and download", exact: true })
    .click();
  await expect.poll(() => attempts).toBe(1);
  await expect(exports.getByRole("alert")).toContainText("Retry this same PNG");
  const downloadEvent = page.waitForEvent("download");
  await exports
    .getByRole("button", { name: "Approve this PNG and download", exact: true })
    .click();
  const download = await downloadEvent;
  const downloaded = readFileSync(await download.path());
  expect(downloaded.equals(imageBytes)).toBe(true);
  expect(envelopes).toHaveLength(2);
  expect(envelopes[1]).toEqual(envelopes[0]);
  await expect(exports.getByRole("status")).toContainText("PNG verified");
  await setNativeTool(page, 'review');
  await review
    .getByRole("button", { name: "Reload review", exact: true })
    .click();
  await expect(review).toContainText("Exported");
  const result = await (
    await page.request.get(
      `${base}/api/studio/native-editor/documents/${staged.nativeId}/review?organizationId=org_default&brandId=brand_default`,
    )
  ).json();
  expect(result.stage).toBe("Approved");
  expect(result.exports).toHaveLength(1);
  expect(result.exports[0].sha256).toBe(staged.sha256);
  await testInfo.attach("actual-native-export.png", {
    body: downloaded,
    contentType: "image/png",
  });
});
