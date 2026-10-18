import {setNativeTool, closeNativeTools} from './native-host-tools.js';
import sharp from "sharp";
import { createHash } from "node:crypto";
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
let server, store, base, platform, buildDirectory, sourcePrincipalId;
const password = randomBytes(24).toString("base64url");
const fixtures = [];
const previousLocalBuildFlag = process.env.STUDIO_NATIVE_EDITOR_LOCAL_BUILD;
test.beforeAll(async ({ browser }) => {
  test.setTimeout(150000);
  process.env.STUDIO_NATIVE_EDITOR_LOCAL_BUILD = "true";
  process.env.STUDIO_NATIVE_PORTABLE_ENABLED = "true";
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
  let api = createHttpServer(null, { platform, nativeEditorEnabled: true });
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
  // Owned procedural nonpersonal image exercises real decoded binary portability.
  for (const brandId of ["brand_default", "brand_vedic"]) {
    const scope = {
      organizationId: "org_default",
      brandId,
      preset: brandId === "brand_default" ? "liquidity_desk" : "vedic_dharma",
    };
    const container = await platform.forScope(scope),
      native = platform.nativeEditor(scope, container.ports.repo);
    const actor = (await store.get("identity")).users.find(
      (user) => user.username === "native-host-fixture",
    );
    const png = await sharp({
      create: { width: 80, height: 60, channels: 4, background: "#f2a93b" },
    })
      .png()
      .toBuffer();
    const asset = await native.uploadAsset(actor, {
      name: "Owned procedural portable rectangle",
      contentType: "image/png",
      base64: png.toString("base64"),
      rightsDeclaration:
        "Original procedural nonpersonal rectangle created by this acceptance test.",
      consent: "not_personal_data",
      idempotencyKey: `portable_image_${brandId}`,
    });
    const fixture = fixtures.find(
      (item) => item.brandId === brandId && item.label.endsWith(" infographic"),
    );
    const record = await native.read(actor, fixture.id),
      document = structuredClone(record.document);
    document.pages[0].objects.push({
      type: "image",
      id: "portable_owned_image",
      assetId: asset.id,
      src: `studio-asset:${asset.id}`,
      left: 200,
      top: 1000,
      width: 80,
      height: 60,
      scaleX: 1,
      scaleY: 1,
    });
    await native.save(actor, record.id, {
      expectedRevision: record.revision,
      title: record.title,
      document,
      idempotencyKey: `portable_image_save_${brandId}`,
    });
  }
  if (
    process.env.STUDIO_NATIVE_CUTOUT_ENABLED === "true" &&
    process.env.STUDIO_NATIVE_MODNET_PATH
  ) {
    const sourcePage = await browser.newPage();
    await sourcePage.request.post(`${base}/api/auth/login`, {
      data: { username: "native-host-fixture", password },
    });
    const fixture = fixtures[0],
      scope = {
        organizationId: "org_default",
        brandId: "brand_default",
        preset: "liquidity_desk",
      },
      container = await platform.forScope(scope),
      native = platform.nativeEditor(scope, container.ports.repo);
    const actor = (await store.get("identity")).users.find(
      (user) => user.username === "native-host-fixture",
    );
    const record = await native.read(actor, fixture.id),
      document = structuredClone(record.document),
      original = document.pages[0].objects.find(
        (object) => object.id === "portable_owned_image",
      );
    document.pages[0].objects.push({
      ...original,
      id: "portable_cutout_target",
      left: 500,
    });
    await native.save(actor, record.id, {
      expectedRevision: record.revision,
      title: record.title,
      document,
      idempotencyKey: "portable_real_cutout_selection",
    });
    await sourcePage.goto(`${base}/tests/fixtures/native-editor-host.html`);
    const frame = sourcePage.frameLocator(
      'iframe[title="Native Doory design canvas"]',
    );
    await expect(
      frame.getByRole("button", { name: "Images", exact: true }),
    ).toBeVisible({ timeout: 30000 });
    await setNativeTool(sourcePage, 'images');
    await sourcePage
      .getByRole("textbox", { name: "Rights declaration" })
      .fill(
        "Original procedural nonpersonal image, authored by this portability acceptance test.",
      );
    await sourcePage
      .getByRole("combobox", { name: "Consent", exact: true })
      .selectOption("not_personal_data");
    await sourcePage
      .getByRole("checkbox", { name: /I confirm the selected image/ })
      .check();
    await closeNativeTools(sourcePage);
    await frame.getByRole("button", { name: "Layers", exact: true }).click();
    await frame.locator("[data-artboard]").first().scrollIntoViewIfNeeded();
    const art = await frame.locator("[data-artboard]").first().boundingBox();
    await sourcePage.mouse.click(
      art.x + (art.width * 540) / 1080,
      art.y + (art.height * 1030) / 1350,
    );
    await expect(frame.getByTestId("ed-remove-bg")).toBeVisible();
    await frame.getByTestId("ed-remove-bg").click();
    await expect
      .poll(
        async () => {
          const current = await native.read(actor, fixture.id);
          return current.document.pages[0].objects.find(
            (object) => object.id === "portable_cutout_target",
          ).assetId;
        },
        { timeout: 60000 },
      )
      .not.toBe(original.assetId);
    await sourcePage.close();
  }
  // Eject through authenticated HTTP, then destroy the original database independently.
  const sourceOwner = (await store.get("identity")).users.find(
    (user) => user.username === "native-host-fixture",
  );
  sourcePrincipalId = sourceOwner.id;
  const sourceLogin = await fetch(`${base}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username: "native-host-fixture", password }),
  });
  const sourceCookie = sourceLogin.headers.get("set-cookie").split(";")[0],
    packs = [];
  for (const brandId of ["brand_default", "brand_vedic"]) {
    const response = await fetch(
      `${base}/api/admin/editor-pack/export?organizationId=org_default&brandId=${brandId}`,
      { headers: { Cookie: sourceCookie } },
    );
    if (!response.ok)
      throw new Error(
        `Source ejection failed ${response.status}: ${await response.text()}`,
      );
    packs.push({ brandId, pack: await response.json() });
  }
  const sourceStore = store;
  store = new DurableStore(":memory:");
  platform = createPlatform({ store, authMode: "password" });
  await platform.ready;
  await platform.identity.provision({
    username: "native-host-fixture",
    password,
    role: "founder",
  });
  const targetOwner = (await store.get("identity")).users.find(
    (user) => user.username === "native-host-fixture",
  );
  if (targetOwner.id === sourceOwner.id)
    throw new Error("Fresh identity was not remapped");
  api = createHttpServer(null, { platform, nativeEditorEnabled: true });
  sourceStore.close();
  const targetLogin = await fetch(`${base}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username: "native-host-fixture", password }),
  });
  const cookie = targetLogin.headers.get("set-cookie").split(";")[0];
  for (const entry of packs) {
    const destination = await fetch(
      `${base}/api/admin/editor-pack/destinations`,
      {
        method: "POST",
        headers: { Cookie: cookie, "Content-Type": "application/json" },
        body: JSON.stringify({
          organizationId: "org_default",
          name: `Fresh ${entry.brandId}`,
          preset:
            entry.brandId === "brand_default"
              ? "liquidity_desk"
              : "vedic_dharma",
        }),
      },
    );
    if (!destination.ok)
      throw new Error(
        `Destination failed ${destination.status}: ${await destination.text()}`,
      );
    const { scope } = await destination.json();
    const response = await fetch(
      `${base}/api/admin/editor-pack/install?organizationId=org_default&brandId=${scope.brandId}`,
      {
        method: "POST",
        headers: { Cookie: cookie, "Content-Type": "application/json" },
        body: JSON.stringify({
          pack: entry.pack,
          options: {
            target: { organizationId: "org_default", brandId: scope.brandId },
            principalRemap: { [sourceOwner.id]: targetOwner.id },
            sourceReviewAcknowledged: true,
            idempotencyKey: `restore_fresh_browser_${entry.brandId}`,
          },
        }),
      },
    );
    if (!response.ok)
      throw new Error(
        `Restore failed ${response.status}: ${await response.text()}`,
      );
    for (const fixture of fixtures)
      if (fixture.brandId === entry.brandId) fixture.brandId = scope.brandId;
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
test("fresh-database restored actual EditorApp edits, saves and reloads both brands across all four native formats", async ({
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

test("restored owned image renders in a downloaded native PNG from the fresh installation", async ({
  page,
}, testInfo) => {
  await page.request.post(`${base}/api/auth/login`, {
    data: { username: "native-host-fixture", password },
  });
  await page.goto(`${base}/tests/fixtures/native-editor-host.html`);
  const frame = page.frameLocator('iframe[title="Native Doory design canvas"]');
  await expect(
    frame.getByRole("button", { name: "Download", exact: true }),
  ).toBeVisible({ timeout: 30000 });
  const record = await (
    await page.request.get(
      `${base}/api/studio/native-editor/documents/${fixtures[0].id}?organizationId=org_default&brandId=${fixtures[0].brandId}`,
    )
  ).json();
  const image = record.document.pages[0].objects.find(
    (object) => object.id === "portable_owned_image",
  );
  expect(image).toBeTruthy();
  const response = await page.request.get(
    `${base}/api/studio/native-editor/assets/${image.assetId}?organizationId=org_default&brandId=${fixtures[0].brandId}`,
  );
  expect(response.status()).toBe(200);
  const asset = await response.json();
  expect(
    createHash("sha256")
      .update(Buffer.from(asset.base64, "base64"))
      .digest("hex"),
  ).toBe(asset.sha256);
  await frame.getByRole("button", { name: "Download", exact: true }).click();
  const pending = page.waitForEvent("download");
  await frame.getByRole("menuitem", { name: /^PNG/ }).click();
  const download = await pending,
    destination = testInfo.outputPath("restored-owned-image-native.png");
  await download.saveAs(destination);
  const metadata = await sharp(destination).metadata();
  expect([metadata.width, metadata.height, metadata.format]).toEqual([
    1080,
    1350,
    "png",
  ]);
  const pixel = await sharp(destination)
    .extract({ left: 220, top: 1020, width: 1, height: 1 })
    .removeAlpha()
    .raw()
    .toBuffer();
  expect([...pixel]).toEqual([242, 169, 59]);
});

test("actual worker-produced cutout bytes and lineage survive ejection into the new identity", async ({
  page,
}) => {
  test.skip(
    process.env.STUDIO_NATIVE_CUTOUT_ENABLED !== "true" ||
      !process.env.STUDIO_NATIVE_MODNET_PATH,
    "Requires the operator-owned verified model; no model redistributed.",
  );
  await page.request.post(`${base}/api/auth/login`, {
    data: { username: "native-host-fixture", password },
  });
  const query = `organizationId=org_default&brandId=${fixtures[0].brandId}`;
  const record = await (
    await page.request.get(
      `${base}/api/studio/native-editor/documents/${fixtures[0].id}?${query}`,
    )
  ).json();
  const image = record.document.pages[0].objects.find(
    (object) => object.id === "portable_cutout_target",
  );
  expect(image).toBeTruthy();
  const asset = await (
    await page.request.get(
      `${base}/api/studio/native-editor/assets/${image.assetId}?${query}`,
    )
  ).json();
  expect(asset.lineage.kind).toBe("background-removal");
  expect(asset.lineage.actorId).toBe(sourcePrincipalId);
  expect(asset.portableHistory.sourceCreatedBy).toBe(sourcePrincipalId);
  expect(asset.portableHistory.restorations[0].restoredBy).not.toBe(
    sourcePrincipalId,
  );
  expect(asset.lineage.execution).toBe("browser_reported");
  const input = await (
    await page.request.get(
      `${base}/api/studio/native-editor/assets/${asset.lineage.inputAssetId}?${query}`,
    )
  ).json();
  expect(asset.lineage.inputSha256).toBe(input.sha256);
  expect(asset.lineage.documentId).toBe(record.id);
  expect(
    createHash("sha256")
      .update(Buffer.from(asset.base64, "base64"))
      .digest("hex"),
  ).toBe(asset.sha256);
  const metadata = await sharp(Buffer.from(asset.base64, "base64")).metadata();
  expect([metadata.width, metadata.height, metadata.hasAlpha]).toEqual([
    input.width,
    input.height,
    true,
  ]);
});
