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
test("actual EditorApp edits, saves and reloads both brands across all four native formats", async ({
  page,
}) => {
  test.setTimeout(180000);
  const unexpectedApi = [];
  page.on("request", (request) => {
    const path = new URL(request.url()).pathname;
    if (
      path.startsWith("/api/") &&
      !path.startsWith("/api/studio/native-editor/")
    )
      unexpectedApi.push(path);
  });
  page.on("pageerror", (error) =>
    console.error("Native fixture:", error.message),
  );
  await page.request.post(`${base}/api/auth/login`, {
    data: { username: "native-host-fixture", password },
  });
  await page.goto(`${base}/tests/fixtures/native-editor-host.html`);
  const frame = page.frameLocator('iframe[title="Native Doory design canvas"]');
  for (const [index, fixture] of fixtures.entries()) {
    if (index)
      await page
        .getByRole("combobox", { name: "Native fixture", exact: true })
        .selectOption(fixture.id);
    await expect(
      frame.getByRole("button", { name: "Layers", exact: true }),
    ).toBeVisible({ timeout: 30000 });
    await frame.getByRole("button", { name: "Layers", exact: true }).click();
    await expect(
      frame.getByRole("tree", { name: "Layers of this page" }),
    ).toBeVisible();
    const art = await frame.locator("[data-artboard]").first().boundingBox();
    const height = / (story|reel)$/.test(fixture.label) ? 1920 : 1350;
    await page.mouse.dblclick(
      art.x + art.width * 0.5,
      art.y + (art.height * 365) / height,
    );
    await expect(
      frame.locator('textarea[data-fabric="textarea"]'),
    ).toBeAttached();
    await page.keyboard.press("ControlOrMeta+A");
    const headline = `NATIVE BROWSER PROPOSAL ${index + 1}`;
    await page.keyboard.type(headline);
    await page.keyboard.press("Escape");
    const endpoint = `${base}/api/studio/native-editor/documents/${fixture.id}?organizationId=org_default&brandId=${fixture.brandId}`;
    await expect
      .poll(
        async () =>
          (
            await (await page.request.get(endpoint)).json()
          ).document.pages[0].objects.find(
            (object) => object.id === "headline_layer",
          ).text,
        { timeout: 15000 },
      )
      .toBe(headline);
    await page
      .getByRole("button", { name: "Reload saved native document" })
      .click();
    await expect(
      frame.getByRole("button", { name: "Layers", exact: true }),
    ).toBeVisible();
    const saved = await (await page.request.get(endpoint)).json();
    expect(
      saved.document.pages[0].objects.find(
        (object) => object.id === "headline_layer",
      ).text,
    ).toBe(headline);
    expect(saved.status).toBe("proposal");
  }
  expect(unexpectedApi).toEqual([]);
});

test("actual native image upload remains private across save/reload and native PNG export", async ({
  page,
}, testInfo) => {
  const sharp = (await import("sharp")).default;
  const png = await sharp({
    create: { width: 48, height: 64, channels: 4, background: "#123456" },
  })
    .png()
    .toBuffer();
  await page.request.post(`${base}/api/auth/login`, {
    data: { username: "native-host-fixture", password },
  });
  await page.goto(`${base}/tests/fixtures/native-editor-host.html`);
  const frame = page.frameLocator('iframe[title="Native Doory design canvas"]');
  await expect(
    frame.getByRole("button", { name: "Images", exact: true }),
  ).toBeVisible({ timeout: 30000 });
  await page.getByText("Image rights and consent", { exact: true }).click();
  await page
    .getByRole("textbox", { name: "Rights declaration" })
    .fill("Procedural owned fixture image created for this integration test.");
  await page
    .getByRole("combobox", { name: "Consent", exact: true })
    .selectOption("not_personal_data");
  await frame.getByRole("button", { name: "Images", exact: true }).click();
  const chooser = page.waitForEvent("filechooser");
  await frame.getByTestId("upload-zone").click();
  await (
    await chooser
  ).setFiles({
    name: "owned-procedural.png",
    mimeType: "image/png",
    buffer: png,
  });
  await expect(frame.getByTestId("uploaded-thumb")).toHaveCount(1);
  await frame.getByTestId("uploaded-thumb").click();
  const endpoint = `${base}/api/studio/native-editor/documents/${fixtures[0].id}?organizationId=org_default&brandId=brand_default`;
  await expect
    .poll(
      async () =>
        (
          await (await page.request.get(endpoint)).json()
        ).document.pages[0].objects.filter((object) => object.type === "image")
          .length,
      { timeout: 15000 },
    )
    .toBe(1);
  const native = await (await page.request.get(endpoint)).json();
  const image = native.document.pages[0].objects.find(
    (object) => object.type === "image",
  );
  expect(image.src).toBe(`studio-asset:${image.assetId}`);
  const privateAsset = await page.request.get(
    `${base}/api/studio/native-editor/assets/${image.assetId}?organizationId=org_default&brandId=brand_default`,
  );
  expect(Buffer.from((await privateAsset.json()).base64, "base64")).toEqual(
    png,
  );
  await page
    .getByRole("button", { name: "Reload saved native document" })
    .click();
  await expect(
    frame.getByRole("button", { name: "Download", exact: true }),
  ).toBeVisible();
  await frame.getByRole("button", { name: "Download", exact: true }).click();
  const download = page.waitForEvent("download");
  await frame.getByRole("menuitem", { name: /^PNG/ }).click();
  const file = await download;
  const destination = testInfo.outputPath("actual-native-private-image.png");
  await file.saveAs(destination);
  const metadata = await sharp(destination).metadata();
  expect(metadata.format).toBe("png");
  expect(metadata.width).toBe(1080);
  expect(metadata.height).toBe(1350);
});

test("foreign pasted pattern is blocked before network and rejected by native save", async ({
  page,
  context,
}) => {
  let hits = 0;
  const sentinel = createServer((req, res) => {
    hits++;
    res.statusCode = 404;
    res.end("Forbidden external fixture");
  });
  await new Promise((resolve) => sentinel.listen(0, "127.0.0.1", resolve));
  try {
    await context.grantPermissions(["clipboard-read", "clipboard-write"]);
    const blocked = [];
    page.on("console", (message) => {
      if (
        message.text().includes(`:${sentinel.address().port}/sentinel.png`) &&
        /Content Security Policy|content security policy|violates.*policy/i.test(
          message.text(),
        )
      )
        blocked.push(message.text());
    });
    await page.request.post(`${base}/api/auth/login`, {
      data: { username: "native-host-fixture", password },
    });
    await page.goto(`${base}/tests/fixtures/native-editor-host.html`);
    const frame = page.frameLocator(
      'iframe[title="Native Doory design canvas"]',
    );
    await expect(
      frame.getByRole("button", { name: "Layers", exact: true }),
    ).toBeVisible({ timeout: 30000 });
    const endpoint = `${base}/api/studio/native-editor/documents/${fixtures[0].id}?organizationId=org_default&brandId=brand_default`;
    const before = await (await page.request.get(endpoint)).json();
    const foreign = {
      id: "foreign_pattern",
      type: "rect",
      width: 200,
      height: 200,
      left: 300,
      top: 300,
      fill: {
        type: "pattern",
        source: `http://127.0.0.1:${sentinel.address().port}/sentinel.png`,
        repeat: "repeat",
      },
    };
    const clipboard = JSON.stringify({
      kind: "doory-clipboard/v1",
      objects: [foreign],
      page: { width: 1080, height: 1350 },
    });
    await page.evaluate(
      (value) => navigator.clipboard.writeText(value),
      clipboard,
    );
    await frame.getByRole("button", { name: "Layers", exact: true }).click();
    await frame
      .getByRole("treeitem")
      .filter({ hasText: "headline_layer" })
      .click();
    await page.keyboard.press("ControlOrMeta+V");
    await expect.poll(() => blocked.length).toBeGreaterThan(0);
    expect(hits).toBe(0);
    const document = structuredClone(before.document);
    document.pages[0].objects.push(foreign);
    const refused = await page.request.post(endpoint, {
      data: {
        expectedRevision: before.revision,
        title: before.title,
        document,
        idempotencyKey: "native_foreign_pattern_save",
      },
    });
    expect(refused.status()).toBe(422);
    expect((await (await page.request.get(endpoint)).json()).revision).toBe(
      before.revision,
    );
    expect(hits).toBe(0);
  } finally {
    await new Promise((resolve) => sentinel.close(resolve));
  }
});

test("native concurrent writer yields conflict and explicit reload adopts saved revision", async ({
  page,
}) => {
  await page.request.post(`${base}/api/auth/login`, {
    data: { username: "native-host-fixture", password },
  });
  await page.goto(`${base}/tests/fixtures/native-editor-host.html`);
  const frame = page.frameLocator('iframe[title="Native Doory design canvas"]');
  await expect(
    frame.getByRole("button", { name: "Layers", exact: true }),
  ).toBeVisible({ timeout: 30000 });
  const endpoint = `${base}/api/studio/native-editor/documents/${fixtures[0].id}?organizationId=org_default&brandId=brand_default`;
  const before = await (await page.request.get(endpoint)).json();
  await frame.locator("[data-artboard]").first().scrollIntoViewIfNeeded();
  const art = await frame.locator("[data-artboard]").first().boundingBox();
  await page.mouse.dblclick(
    art.x + art.width * 0.5,
    art.y + (art.height * 365) / 1350,
  );
  await expect(
    frame.locator('textarea[data-fabric="textarea"]'),
  ).toBeAttached();
  await page.keyboard.press("ControlOrMeta+A");
  await page.keyboard.type("LOCAL UNSAVED NATIVE");
  await page.keyboard.press("Escape");
  const external = structuredClone(before.document);
  external.pages[0].objects.find(
    (object) => object.id === "headline_layer",
  ).text = "EXTERNAL NATIVE WRITER";
  const saved = await page.request.post(endpoint, {
    data: {
      expectedRevision: before.revision,
      title: before.title,
      document: external,
      idempotencyKey: "external_native_writer_save",
    },
  });
  expect(saved.status()).toBe(200);
  await expect(
    frame.getByText("This design changed somewhere else", { exact: true }),
  ).toBeVisible({ timeout: 15000 });
  expect(
    (
      await (await page.request.get(endpoint)).json()
    ).document.pages[0].objects.find((object) => object.id === "headline_layer")
      .text,
  ).toBe("EXTERNAL NATIVE WRITER");
  await frame
    .getByRole("button", { name: "Reload latest", exact: true })
    .click();
  await expect(
    frame.getByText("This design changed somewhere else", { exact: true }),
  ).not.toBeVisible();
  await expect(
    frame.getByRole("button", { name: "Layers", exact: true }),
  ).toBeVisible();
  expect(
    (
      await (await page.request.get(endpoint)).json()
    ).document.pages[0].objects.find((object) => object.id === "headline_layer")
      .text,
  ).toBe("EXTERNAL NATIVE WRITER");
});

test("actual Studio mounts and resumes native proposal without mutating original campaign", async ({
  page,
}) => {
  await page.request.post(`${base}/api/auth/login`, {
    data: { username: "native-host-fixture", password },
  });
  await page.goto(`${base}/tests/fixtures/native-studio-host.html`);
  await page.getByRole("button", { name: /Campaign Studio/ }).click();
  await page
    .getByRole("button", { name: "Open native design editor", exact: true })
    .click();
  const frame = page.frameLocator('iframe[title="Native Doory design canvas"]');
  await expect(
    frame.getByRole("button", { name: "Layers", exact: true }),
  ).toBeVisible({ timeout: 30000 });
  let releaseSave;
  const saveGate = new Promise((resolve) => {
    releaseSave = resolve;
  });
  await page.route("**/api/studio/native-editor/documents/*", async (route) => {
    if (route.request().method() === "POST") await saveGate;
    await route.continue();
  });
  await frame.locator("[data-artboard]").first().scrollIntoViewIfNeeded();
  const art = await frame.locator("[data-artboard]").first().boundingBox();
  await page.mouse.dblclick(
    art.x + art.width * 0.5,
    art.y + (art.height * 365) / 1350,
  );
  await expect(
    frame.locator('textarea[data-fabric="textarea"]'),
  ).toBeAttached();
  await page.keyboard.press("ControlOrMeta+A");
  await page.keyboard.type("ACTUAL STUDIO NATIVE PROPOSAL");
  await page.keyboard.press("Escape");
  await expect(
    page.getByRole("region", { name: "Native proposal workspace" }),
  ).toContainText("Unsaved native work");
  await page.getByRole("button", { name: /Story backlog/ }).click();
  await expect(
    page.getByRole("alert").filter({
      hasText:
        "Save native changes or explicitly discard them before leaving the native editor.",
    }),
  ).toBeVisible();
  await expect(
    page.getByRole("region", { name: "Native proposal workspace" }),
  ).toBeVisible();
  releaseSave();
  await expect(
    page.getByRole("region", { name: "Native proposal workspace" }),
  ).toContainText("Native proposal saved", { timeout: 15000 });
  await page
    .getByRole("button", {
      name: "Return to original campaign and exporter",
      exact: true,
    })
    .click();
  await expect(
    page.locator('iframe[title="Native Doory design canvas"]'),
  ).toHaveCount(0);
  await page
    .getByRole("button", { name: "Open native design editor", exact: true })
    .click();
  await expect(
    frame.getByRole("button", { name: "Layers", exact: true }),
  ).toBeVisible();
  const history = await (
    await page.request.get(
      `${base}/api/studio/native-editor/documents?organizationId=org_default&brandId=brand_default&storyId=native-fixture&format=infographic`,
    )
  ).json();
  const native = await (
    await page.request.get(
      `${base}/api/studio/native-editor/documents/${history.documents[0].id}?organizationId=org_default&brandId=brand_default`,
    )
  ).json();
  expect(
    native.document.pages[0].objects.find(
      (object) => object.id === "headline_layer",
    ).text,
  ).toBe("ACTUAL STUDIO NATIVE PROPOSAL");
  const bootstrap = await (
    await page.request.get(
      `${base}/api/studio/bootstrap?organizationId=org_default&brandId=brand_default`,
    )
  ).json();
  expect(bootstrap.backlog[0].campaignDraft.infographic.headline).toBe(
    "SOURCE NOTES",
  );
});

test("iframe reload disposes its previous parent broker before mounting a replacement", async ({
  page,
}) => {
  await page.addInitScript(() => {
    const add = window.addEventListener.bind(window),
      remove = window.removeEventListener.bind(window);
    window.__messageListeners = new Set();
    window.addEventListener = (type, listener, options) => {
      if (type === "message") window.__messageListeners.add(listener);
      return add(type, listener, options);
    };
    window.removeEventListener = (type, listener, options) => {
      if (type === "message") window.__messageListeners.delete(listener);
      return remove(type, listener, options);
    };
  });
  await page.request.post(`${base}/api/auth/login`, {
    data: { username: "native-host-fixture", password },
  });
  await page.goto(`${base}/tests/fixtures/native-editor-host.html`);
  const frame = page.frameLocator('iframe[title="Native Doory design canvas"]');
  await expect(
    frame.getByRole("button", { name: "Layers", exact: true }),
  ).toBeVisible({ timeout: 30000 });
  await frame.locator("[data-artboard]").first().scrollIntoViewIfNeeded();
  const art = await frame.locator("[data-artboard]").first().boundingBox();
  await page.mouse.dblclick(
    art.x + art.width * 0.5,
    art.y + (art.height * 365) / 1350,
  );
  await expect(
    frame.locator('textarea[data-fabric="textarea"]'),
  ).toBeAttached();
  await page.keyboard.press("ControlOrMeta+A");
  await page.keyboard.type("SAVED BEFORE FRAME RELOAD");
  await page.keyboard.press("Escape");
  const fixture = fixtures[0];
  const endpoint = `${base}/api/studio/native-editor/documents/${fixture.id}?organizationId=org_default&brandId=${fixture.brandId}`;
  await expect
    .poll(
      async () =>
        (
          await (await page.request.get(endpoint)).json()
        ).document.pages[0].objects.find(
          (object) => object.id === "headline_layer",
        ).text,
    )
    .toBe("SAVED BEFORE FRAME RELOAD");
  const before = await page.evaluate(() => window.__messageListeners.size);
  await page.evaluate(() => {
    const frame = document.querySelector("iframe");
    window.__nextLoad = new Promise((resolve) =>
      frame.addEventListener("load", resolve, { once: true }),
    );
    frame.contentWindow.location.reload();
  });
  await page.evaluate(() => window.__nextLoad.then(() => null));
  await expect(
    frame.getByRole("button", { name: "Layers", exact: true }),
  ).toBeVisible({ timeout: 30000 });
  const after = await page.evaluate(() => window.__messageListeners.size);
  console.log(JSON.stringify({ before, after }));
  expect(after).toBe(before);
  const restoredArt = await frame
    .locator("[data-artboard]")
    .first()
    .boundingBox();
  await page.mouse.dblclick(
    restoredArt.x + restoredArt.width * 0.5,
    restoredArt.y + (restoredArt.height * 365) / 1350,
  );
  await expect(frame.locator('textarea[data-fabric="textarea"]')).toHaveValue(
    "SAVED BEFORE FRAME RELOAD",
  );
  await page.keyboard.press("Escape");
});

test("saved layout review rejects dirty/stale versions and approves the acknowledged native revision", async ({
  page,
}, testInfo) => {
  await page.request.post(`${base}/api/auth/login`, {
    data: { username: "native-host-fixture", password },
  });
  await page.goto(`${base}/tests/fixtures/native-editor-host.html`);
  const panel = page.getByRole("region", {
    name: "Saved layout review",
    exact: true,
  });
  await panel
    .getByRole("button", { name: "Begin review", exact: true })
    .click();
  await panel
    .getByRole("button", { name: "Start post-production", exact: true })
    .click();
  await panel
    .getByRole("button", { name: "Submit final layout", exact: true })
    .click();
  await expect(
    panel.getByRole("button", { name: "Approve saved layout", exact: true }),
  ).toBeEnabled();
  const frame = page.frameLocator('iframe[title="Native Doory design canvas"]');
  await expect(
    frame.getByRole("button", { name: "Layers", exact: true }),
  ).toBeVisible({ timeout: 30000 });
  const fixture = fixtures[0];
  const endpoint = `${base}/api/studio/native-editor/documents/${fixture.id}?organizationId=org_default&brandId=${fixture.brandId}`;
  const before = await (await page.request.get(endpoint)).json();
  let release;
  const held = new Promise((resolve) => {
    release = resolve;
  });
  await page.route(
    "**/api/studio/native-editor/documents/*?*",
    async (route) => {
      if (route.request().method() === "POST") await held;
      await route.continue();
    },
  );
  const art = await frame.locator("[data-artboard]").first().boundingBox();
  await page.mouse.dblclick(
    art.x + art.width * 0.5,
    art.y + (art.height * 365) / 1350,
  );
  await expect(
    frame.locator('textarea[data-fabric="textarea"]'),
  ).toBeAttached();
  await page.keyboard.press("ControlOrMeta+A");
  await page.keyboard.type("FINAL SAVED REVIEW VERSION");
  await page.keyboard.press("Escape");
  try {
    await expect(
      panel.getByRole("button", { name: "Approve saved layout", exact: true }),
    ).toBeDisabled();
    await expect(
      panel.getByText("Save your native edits before changing review state.", {
        exact: true,
      }),
    ).toBeVisible();
  } finally {
    release();
  }
  await expect
    .poll(
      async () => (await (await page.request.get(endpoint)).json()).revision,
    )
    .toBe(before.revision + 1);
  await expect(panel.getByRole("alert")).toContainText(
    "saved content or source changed",
  );
  await panel
    .getByRole("button", {
      name: "Restart review for saved version",
      exact: true,
    })
    .click();
  await panel
    .getByRole("button", { name: "Start post-production", exact: true })
    .click();
  await panel
    .getByRole("button", { name: "Submit final layout", exact: true })
    .click();
  await panel
    .getByRole("button", { name: "Approve saved layout", exact: true })
    .click();
  await expect(panel.getByRole("status")).toContainText("Approved");
  const review = await (
    await page.request.get(
      `${base}/api/studio/native-editor/documents/${fixture.id}/review?organizationId=org_default&brandId=${fixture.brandId}`,
    )
  ).json();
  expect(review.stale).toBe(false);
  expect(review.approval.nativeRevision).toBe(before.revision + 1);
  expect(review.history.map((value) => value.action)).toEqual([
    "create",
    "start",
    "submit",
    "restart",
    "start",
    "submit",
    "approve",
  ]);
  await page.screenshot({
    path: testInfo.outputPath("saved-layout-approved.png"),
    fullPage: true,
  });
});

test("marketer submits a saved layout and a separate founder session approves it", async ({
  page,
  browser,
}) => {
  const fixture = fixtures[1];
  await page.request.post(`${base}/api/auth/login`, {
    data: { username: "native-marketer-fixture", password },
  });
  await page.goto(`${base}/tests/fixtures/native-editor-host.html`);
  await page
    .getByRole("combobox", { name: "Native fixture", exact: true })
    .selectOption(fixture.id);
  const panel = page.getByRole("region", {
    name: "Saved layout review",
    exact: true,
  });
  await panel
    .getByRole("button", { name: "Begin review", exact: true })
    .click();
  await panel
    .getByRole("button", { name: "Start post-production", exact: true })
    .click();
  await panel
    .getByRole("button", { name: "Submit final layout", exact: true })
    .click();
  await expect(
    panel.getByText(
      "A founder or designated brand approver must approve this saved layout.",
      { exact: true },
    ),
  ).toBeVisible();
  await expect(
    panel.getByRole("button", { name: "Approve saved layout", exact: true }),
  ).toHaveCount(0);
  const endpoint = `${base}/api/studio/native-editor/documents/${fixture.id}/review?organizationId=org_default&brandId=${fixture.brandId}`;
  const review = await (await page.request.get(endpoint)).json();
  const denial = await page.request.post(endpoint, {
    data: {
      action: "approve",
      expectedRevision: review.revision,
      expectedNativeRevision: review.binding.nativeRevision,
      idempotencyKey: "marketer_forged_approve_123",
    },
  });
  expect(denial.status()).toBe(403);
  const context = await browser.newContext();
  try {
    const founderPage = await context.newPage();
    await founderPage.request.post(`${base}/api/auth/login`, {
      data: { username: "native-host-fixture", password },
    });
    await founderPage.goto(`${base}/tests/fixtures/native-editor-host.html`);
    await founderPage
      .getByRole("combobox", { name: "Native fixture", exact: true })
      .selectOption(fixture.id);
    await founderPage
      .getByRole("region", { name: "Saved layout review", exact: true })
      .getByRole("button", { name: "Approve saved layout", exact: true })
      .click();
    await panel
      .getByRole("button", { name: "Reload review", exact: true })
      .click();
    await expect(panel.getByRole("status")).toContainText("Approved");
    const saved = await (await page.request.get(endpoint)).json();
    expect(saved.history.at(-1).actorId).not.toBe(saved.history[0].actorId);
    expect(saved.canApprove).toBe(false);
  } finally {
    await context.close();
  }
});

test("a lost review response retries the same intent without a second transition", async ({
  page,
}) => {
  const fixture = fixtures[2];
  await page.request.post(`${base}/api/auth/login`, {
    data: { username: "native-host-fixture", password },
  });
  await page.goto(`${base}/tests/fixtures/native-editor-host.html`);
  await page
    .getByRole("combobox", { name: "Native fixture", exact: true })
    .selectOption(fixture.id);
  const panel = page.getByRole("region", {
    name: "Saved layout review",
    exact: true,
  });
  const keys = [];
  await page.route(
    "**/api/studio/native-editor/documents/*/review?*",
    async (route) => {
      if (route.request().method() !== "POST") return route.continue();
      keys.push(route.request().postDataJSON().idempotencyKey);
      if (keys.length === 1) {
        await route.fetch();
        return route.fulfill({
          status: 503,
          contentType: "application/json",
          body: JSON.stringify({ error: "Controlled lost response" }),
        });
      }
      return route.continue();
    },
  );
  await panel
    .getByRole("button", { name: "Begin review", exact: true })
    .click();
  await expect(panel.getByRole("alert")).toContainText("Retry the same action");
  await panel
    .getByRole("button", { name: "Begin review", exact: true })
    .click();
  await expect(panel.getByRole("status")).toContainText("Draft ready");
  expect(keys).toHaveLength(2);
  expect(keys[1]).toBe(keys[0]);
  const saved = await (
    await page.request.get(
      `${base}/api/studio/native-editor/documents/${fixture.id}/review?organizationId=org_default&brandId=${fixture.brandId}`,
    )
  ).json();
  expect(saved.revision).toBe(1);
  expect(saved.history).toHaveLength(1);
});

test("reference-correct MODNet replaces a private portrait through native undo/save/reload", async ({
  page,
}, testInfo) => {
  test.skip(
    process.env.STUDIO_NATIVE_CUTOUT_ENABLED !== "true" ||
      !process.env.STUDIO_NATIVE_MODNET_PATH,
    "Requires explicitly configured owned digest-pinned checkpoint; no model download.",
  );
  const sharp = (await import("sharp")).default;
  let modelChunks = 0;
  page.on("response", (response) => {
    if (/\/cutout\/model\/\d+\?/.test(response.url())) modelChunks++;
  });
  const measurements = {};

  const input = await sharp(
    new URL(
      "../../docs/investigations/cutout-portrait/fixtures/synthetic-portrait-input.png",
      import.meta.url,
    ).pathname,
  )
    .resize(384, 384)
    .jpeg({ quality: 90 })
    .toBuffer();
  await page.request.post(`${base}/api/auth/login`, {
    data: { username: "native-host-fixture", password },
  });
  await page.goto(`${base}/tests/fixtures/native-editor-host.html`);
  const frame = page.frameLocator('iframe[title="Native Doory design canvas"]');
  await expect(
    frame.getByRole("button", { name: "Images", exact: true }),
  ).toBeVisible({ timeout: 30000 });
  await page.getByText("Image rights and consent", { exact: true }).click();
  await page
    .getByRole("textbox", { name: "Rights declaration" })
    .fill(
      "Owned generated synthetic portrait with no actual personal identity; cutout fixture.",
    );
  await page
    .getByRole("combobox", { name: "Consent", exact: true })
    .selectOption("not_personal_data");
  await page
    .getByRole("checkbox", { name: /I confirm the selected image/ })
    .check();
  await frame.getByRole("button", { name: "Images", exact: true }).click();
  const chooser = page.waitForEvent("filechooser");
  await frame.getByTestId("upload-zone").click();
  await (
    await chooser
  ).setFiles({
    name: "synthetic-portrait.jpg",
    mimeType: "image/jpeg",
    buffer: input,
  });
  const thumb = frame
    .getByTestId("uploaded-thumb")
    .filter({ hasText: "synthetic-portrait.jpg" });
  await expect(thumb).toBeVisible();
  await thumb.click();
  const endpoint = `${base}/api/studio/native-editor/documents/${fixtures[0].id}?organizationId=org_default&brandId=brand_default`;
  const read = async () => await (await page.request.get(endpoint)).json();
  await expect
    .poll(
      async () =>
        (await read()).document.pages[0].objects.filter(
          (o) => o.type === "image" && o.name === "synthetic-portrait.jpg",
        ).length,
    )
    .toBeGreaterThan(0);
  const original = (await read()).document.pages[0].objects.find(
    (o) => o.type === "image" && o.name === "synthetic-portrait.jpg",
  );
  const coldStarted = Date.now();
  await frame.getByTestId("ed-remove-bg").click();
  await expect(frame.getByTestId("native-cutout-status")).toBeVisible({
    timeout: 10000,
  });
  console.log(
    "CUTOUT_STATUS",
    await frame.getByTestId("native-cutout-status").innerText(),
  );

  await expect
    .poll(
      async () =>
        (await read()).document.pages[0].objects.find(
          (o) => o.id === original.id,
        )?.assetId,
      { timeout: 60000 },
    )
    .not.toBe(original.assetId);
  measurements.coldAppliedMs = Date.now() - coldStarted;
  const cutout = (await read()).document.pages[0].objects.find(
    (o) => o.id === original.id,
  );
  const asset = await (
    await page.request.get(
      `${base}/api/studio/native-editor/assets/${cutout.assetId}?organizationId=org_default&brandId=brand_default`,
    )
  ).json();
  expect(asset.lineage.inputAssetId).toBe(original.assetId);
  expect(asset.width).toBe(384);
  expect(asset.height).toBe(384);
  expect(asset.size).toBeLessThanOrEqual(512 * 1024);
  const output = Buffer.from(asset.base64, "base64");
  writeFileSync(testInfo.outputPath("actual-modnet-native-alpha.png"), output);
  writeFileSync(testInfo.outputPath("actual-modnet-native-input.jpg"), input);

  const { data, info } = await sharp(output)
    .raw()
    .toBuffer({ resolveWithObject: true });
  expect(info.channels).toBe(4);
  expect([...data.filter((_, i) => i % 4 === 3)].some((a) => a < 128)).toBe(
    true,
  );
  await sharp(output)
    .flatten({ background: "#18202b" })
    .jpeg()
    .toFile(testInfo.outputPath("actual-modnet-native-on-dark.jpg"));
  await frame.locator("body").press("ControlOrMeta+z");
  await expect
    .poll(
      async () =>
        (await read()).document.pages[0].objects.find(
          (o) => o.id === original.id,
        )?.assetId,
    )
    .toBe(original.assetId);
  const chunksAfterCold = modelChunks;
  await frame.getByTestId("ed-remove-bg").click();
  await expect(
    frame.getByRole("progressbar", { name: /Remove Background/i }),
  ).toHaveAttribute("aria-valuenow", "30", { timeout: 15000 });
  const canceledStarted = Date.now();
  await frame
    .getByRole("dialog")
    .getByRole("button", { name: "Cancel", exact: true })
    .click();
  await expect(frame.getByRole("dialog")).toHaveCount(0);
  measurements.cancelUiMs = Date.now() - canceledStarted;
  expect(
    (await read()).document.pages[0].objects.find((o) => o.id === original.id)
      .assetId,
  ).toBe(original.assetId);
  const warmStarted = Date.now();
  await frame.getByTestId("ed-remove-bg").click();
  await expect
    .poll(
      async () =>
        (await read()).document.pages[0].objects.find(
          (o) => o.id === original.id,
        )?.assetId,
      { timeout: 15000 },
    )
    .not.toBe(original.assetId);
  measurements.warmAppliedMs = Date.now() - warmStarted;
  const warmImage = (await read()).document.pages[0].objects.find(
    (o) => o.id === original.id,
  );
  const warmAsset = await (
    await page.request.get(
      `${base}/api/studio/native-editor/assets/${warmImage.assetId}?organizationId=org_default&brandId=brand_default`,
    )
  ).json();
  expect(warmAsset.sha256).toBe(asset.sha256);
  expect(modelChunks).toBe(chunksAfterCold);
  expect(chunksAfterCold).toBe(99);
  await frame.locator("body").press("ControlOrMeta+z");
  await expect
    .poll(
      async () =>
        (await read()).document.pages[0].objects.find(
          (o) => o.id === original.id,
        )?.assetId,
    )
    .toBe(original.assetId);
  await frame.locator("body").press("ControlOrMeta+Shift+z");
  await expect
    .poll(
      async () =>
        (await read()).document.pages[0].objects.find(
          (o) => o.id === original.id,
        )?.assetId,
    )
    .toBe(warmImage.assetId);
  await page
    .getByRole("button", { name: "Reload saved native document" })
    .click();
  await expect(
    frame.getByRole("button", { name: "Download", exact: true }),
  ).toBeVisible();
  expect(
    (await read()).document.pages[0].objects.find((o) => o.id === original.id)
      ?.assetId,
  ).toBe(warmImage.assetId);
  const retained = await (
    await page.request.get(
      `${base}/api/studio/native-editor/assets/${original.assetId}?organizationId=org_default&brandId=brand_default`,
    )
  ).json();
  expect(Buffer.from(retained.base64, "base64")).toEqual(input);
  // A new iframe creates a fresh loader/worker: this path must verify and use
  // the persisted origin-local model cache, not the prior loader's memory.
  await page.getByText("Image rights and consent", { exact: true }).click();
  await page
    .getByRole("checkbox", { name: /I confirm the selected image/ })
    .check();
  await frame.getByRole("button", { name: "Layers", exact: true }).click();
  await frame.getByRole("treeitem").filter({ hasText: original.name }).click();
  const cachedStarted = Date.now();
  await frame.getByTestId("ed-remove-bg").click();
  await expect(
    frame.getByRole("progressbar", { name: /Remove Background/i }),
  ).toHaveAttribute("aria-valuenow", "30", { timeout: 15000 });
  await frame
    .getByRole("dialog")
    .getByRole("button", { name: "Cancel", exact: true })
    .click();
  await expect(frame.getByRole("dialog")).toHaveCount(0);
  measurements.crossFrameCachedToProcessingAndCancelMs =
    Date.now() - cachedStarted;
  expect(modelChunks).toBe(chunksAfterCold);
  expect(
    (await read()).document.pages[0].objects.find((o) => o.id === original.id)
      ?.assetId,
  ).toBe(warmImage.assetId);
  measurements.modelChunks = modelChunks;
  measurements.modelBytes = 25888640;
  measurements.outputBytes = asset.size;
  measurements.outputSha256 = asset.sha256;
  measurements.outputDimensions = [asset.width, asset.height];
  measurements.workerCancellation =
    "actual processing-phase cancellation followed by identical-output recovery";
  measurements.mainThreadHeap = await page.evaluate(() =>
    performance.memory
      ? {
          usedJSHeapSize: performance.memory.usedJSHeapSize,
          totalJSHeapSize: performance.memory.totalJSHeapSize,
          scope: "main realm only; excludes dedicated-worker/WASM peak",
        }
      : null,
  );
  writeFileSync(
    testInfo.outputPath("actual-modnet-native-metrics.json"),
    JSON.stringify(measurements, null, 2),
  );
});

test("oversized native cutout is rejected without silently resizing or replacing its source", async ({
  page,
}) => {
  test.skip(
    process.env.STUDIO_NATIVE_CUTOUT_ENABLED !== "true" ||
      !process.env.STUDIO_NATIVE_MODNET_PATH,
    "Requires explicitly configured owned checkpoint.",
  );
  const sharp = (await import("sharp")).default;
  const input = await sharp(
    new URL(
      "../../docs/investigations/cutout-portrait/fixtures/synthetic-portrait-input.png",
      import.meta.url,
    ).pathname,
  )
    .jpeg({ quality: 95 })
    .toBuffer();
  await page.request.post(`${base}/api/auth/login`, {
    data: { username: "native-host-fixture", password },
  });
  await page.goto(`${base}/tests/fixtures/native-editor-host.html`);
  await page
    .getByRole("combobox", { name: "Native fixture" })
    .selectOption(fixtures[4].id);
  const frame = page.frameLocator('iframe[title="Native Doory design canvas"]');
  await expect(
    frame.getByRole("button", { name: "Images", exact: true }),
  ).toBeVisible({ timeout: 30000 });
  await page.getByText("Image rights and consent", { exact: true }).click();
  await page
    .getByRole("textbox", { name: "Rights declaration" })
    .fill(
      "Owned synthetic portrait, no actual personal identity; output-size test.",
    );
  await page
    .getByRole("combobox", { name: "Consent", exact: true })
    .selectOption("not_personal_data");
  await page
    .getByRole("checkbox", { name: /I confirm the selected image/ })
    .check();
  await frame.getByRole("button", { name: "Images", exact: true }).click();
  const chooser = page.waitForEvent("filechooser");
  await frame.getByTestId("upload-zone").click();
  await (
    await chooser
  ).setFiles({
    name: "synthetic-full-resolution.jpg",
    mimeType: "image/jpeg",
    buffer: input,
  });
  await expect(frame.getByTestId("uploaded-thumb")).toHaveCount(1);
  await frame.getByTestId("uploaded-thumb").click();
  const endpoint = `${base}/api/studio/native-editor/documents/${fixtures[4].id}?organizationId=org_default&brandId=${fixtures[4].brandId}`;
  const read = async () => await (await page.request.get(endpoint)).json();
  await expect
    .poll(
      async () =>
        (await read()).document.pages[0].objects.filter(
          (o) => o.type === "image",
        ).length,
    )
    .toBe(1);
  const original = (await read()).document.pages[0].objects.find(
    (o) => o.type === "image",
  );
  await frame.getByTestId("ed-remove-bg").click();
  await expect(frame.getByTestId("native-cutout-status")).toContainText(
    "exceeds 512 KiB",
    { timeout: 30000 },
  );
  const current = (await read()).document.pages[0].objects.find(
    (o) => o.id === original.id,
  );
  expect(current.assetId).toBe(original.assetId);
  const retained = await (
    await page.request.get(
      `${base}/api/studio/native-editor/assets/${original.assetId}?organizationId=org_default&brandId=${fixtures[4].brandId}`,
    )
  ).json();
  expect(retained.width).toBe(768);
  expect(retained.height).toBe(768);
  expect(Buffer.from(retained.base64, "base64")).toEqual(input);
  const assets = await (
    await page.request.get(
      `${base}/api/studio/native-editor/assets?organizationId=org_default&brandId=${fixtures[4].brandId}`,
    )
  ).json();
  expect(assets.count).toBe(1);
});
