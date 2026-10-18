import { test, expect } from "@playwright/test";
import { unzipSync } from "fflate";
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
test("actual Brand Kit refresh preserves edited native copy across both brands and four formats with rendered pixel changes", async ({
  page,
}, testInfo) => {
  test.setTimeout(180000);
  const sharp = (await import("sharp")).default;
  await page.request.post(`${base}/api/auth/login`, {
    data: { username: "native-host-fixture", password },
  });
  await page.goto(`${base}/tests/fixtures/native-studio-host.html`);
  const frame = page.frameLocator('iframe[title="Native Doory design canvas"]');
  const labels = {
    infographic: "Feed post",
    carousel: "Carousel",
    story: "Story",
    reel: "Reel",
  };
  const captures = new Map();
  async function studio(format) {
    await page.getByRole("button", { name: /Campaign Studio/ }).click();
    await page
      .locator(".format-tabs")
      .getByRole("button", { name: new RegExp("^" + labels[format]) })
      .click();
    await page
      .getByRole("button", { name: "Open native design editor", exact: true })
      .click();
    await expect(
      frame.getByRole("button", { name: "Layers", exact: true }),
    ).toBeVisible({ timeout: 30000 });
  }
  async function png() {
    await frame.getByRole("button", { name: "Download", exact: true }).click();
    const event = page.waitForEvent("download");
    await frame.getByRole("menuitem", { name: /^PNG/ }).click();
    const bytes = readFileSync(await (await event).path());
    if (bytes[0] === 80 && bytes[1] === 75) {
      const archive = unzipSync(bytes),
        entry = Object.keys(archive)
          .filter((name) => name.endsWith(".png"))
          .sort()[0];
      expect(entry).toBeTruthy();
      return Buffer.from(archive[entry]);
    }
    return bytes;
  }
  async function leave() {
    await page
      .getByRole("button", {
        name: "Return to original campaign and exporter",
        exact: true,
      })
      .click();
  }
  for (const [brandId, preset] of [
    ["brand_default", "liquidity_desk"],
    ["brand_vedic", "vedic_dharma"],
  ]) {
    await page.getByLabel("Brand", { exact: true }).selectOption(brandId);
    for (const format of Object.keys(labels)) {
      await studio(format);
      await frame.locator("[data-artboard]").first().scrollIntoViewIfNeeded();
      const art = await frame.locator("[data-artboard]").first().boundingBox(),
        height = ["story", "reel"].includes(format) ? 1920 : 1350;
      await page.mouse.dblclick(
        art.x + art.width * 0.5,
        art.y + (art.height * 365) / height,
      );
      await expect(
        frame.locator('textarea[data-fabric="textarea"]'),
      ).toBeAttached();
      await page.keyboard.press("ControlOrMeta+A");
      await page.keyboard.type(`PRESERVED ${preset} ${format}`);
      await page.keyboard.press("Escape");
      await expect(
        page.getByRole("region", { name: "Native proposal workspace" }),
      ).toContainText("Native proposal saved", { timeout: 15000 });
      const list = await (
        await page.request.get(
          `${base}/api/studio/native-editor/documents?organizationId=org_default&brandId=${brandId}&storyId=native-fixture&format=${format}`,
        )
      ).json();
      const id = list.documents[0].id;
      const record = await (
        await page.request.get(
          `${base}/api/studio/native-editor/documents/${id}?organizationId=org_default&brandId=${brandId}`,
        )
      ).json();
      captures.set(`${brandId}:${format}`, { record, png: await png() });
      await leave();
    }
    await page.getByRole("button", { name: /Brand Kit/ }).click();
    const colorName = BRAND_PRESETS[preset].colors[0].name;
    await page.getByLabel(`${colorName} hex`, { exact: true }).fill("#123456");
    await page
      .getByLabel(`${BRAND_PRESETS[preset].colors[1].name} hex`, {
        exact: true,
      })
      .fill("#345678");
    await page
      .getByRole("button", { name: "Save Brand Kit", exact: true })
      .click();
    await expect(
      page
        .getByRole("status")
        .filter({ hasText: "Brand profile saved for this brand." }),
    ).toBeVisible();
    for (const format of Object.keys(labels)) {
      await studio(format);
      const styles = page.getByRole("region", {
        name: "Native brand styles",
        exact: true,
      });
      await styles
        .getByRole("button", { name: "Check saved Brand Kit", exact: true })
        .click();
      await styles
        .getByRole("button", {
          name: "Refresh saved brand styles",
          exact: true,
        })
        .click();
      await expect(
        styles.getByRole("button", {
          name: "Refresh saved brand styles",
          exact: true,
        }),
      ).toHaveCount(0);
      await expect(
        styles.getByRole("button", {
          name: "Check saved Brand Kit",
          exact: true,
        }),
      ).toBeEnabled({ timeout: 30000 });
      await expect(
        frame.getByRole("button", { name: "Layers", exact: true }),
      ).toBeVisible({ timeout: 30000 });
      const prior = captures.get(`${brandId}:${format}`),
        current = await (
          await page.request.get(
            `${base}/api/studio/native-editor/documents/${prior.record.id}?organizationId=org_default&brandId=${brandId}`,
          )
        ).json();
      expect(current.revision).toBe(prior.record.revision + 1);
      expect(current.sourceState).toBe("current");
      const projection = (d) =>
        d.pages.map((p) => ({
          id: p.id,
          objects: p.objects.map((o) => ({
            id: o.id,
            text: o.text,
            left: o.left,
            top: o.top,
            width: o.width,
            height: o.height,
          })),
        }));
      expect(projection(current.document)).toEqual(
        projection(prior.record.document),
      );
      const after = await png(),
        beforeRaw = await sharp(prior.png)
          .ensureAlpha()
          .raw()
          .toBuffer({ resolveWithObject: true }),
        afterRaw = await sharp(after)
          .ensureAlpha()
          .raw()
          .toBuffer({ resolveWithObject: true });
      expect(afterRaw.info).toEqual(beforeRaw.info);
      expect(current.document.pages[0].background.color).toBe("#123456");
      expect(
        afterRaw.data.equals(beforeRaw.data),
        `${preset}:${format} changed rendered accent`,
      ).toBe(false);
      let accentPixels = 0;
      for (let offset = 0; offset < afterRaw.data.length; offset += 4)
        if (
          afterRaw.data[offset] === 52 &&
          afterRaw.data[offset + 1] === 86 &&
          afterRaw.data[offset + 2] === 120 &&
          afterRaw.data[offset + 3] === 255
        )
          accentPixels++;
      expect(accentPixels).toBeGreaterThan(0);
      await testInfo.attach(`${preset}-${format}-refreshed.png`, {
        body: after,
        contentType: "image/png",
      });
      await leave();
    }
  }
});

test("a lost refresh response retries the same intent and adopts only its saved version", async ({
  page,
}) => {
  await page.request.post(`${base}/api/auth/login`, {
    data: { username: "native-host-fixture", password },
  });
  const scope = {
    organizationId: "org_default",
    brandId: "brand_default",
    preset: "liquidity_desk",
  };
  const repo = (await platform.forScope(scope)).ports.repo;
  const profile = await repo.getBrandProfile();
  await repo.updateBrandProfile({
    colors: profile.colors.map((color, index) =>
      index === 1 ? { ...color, hex: "#456789" } : color,
    ),
  });
  await page.goto(`${base}/tests/fixtures/native-studio-host.html`);
  await page.getByRole("button", {name: /Campaign Studio/}).click();
  await page.locator(".format-tabs").getByRole("button", {name: /^Feed post/}).click();
  await page
    .getByRole("button", { name: "Open native design editor", exact: true })
    .click();
  const styles = page.getByRole("region", {
    name: "Native brand styles",
    exact: true,
  });
  await expect(
    styles.getByRole("button", { name: "Check saved Brand Kit" }),
  ).toBeEnabled();
  await styles.getByRole("button", { name: "Check saved Brand Kit" }).click();
  const envelopes = [];
  await page.route(
    "**/native-editor/documents/*/brand-tokens?**",
    async (route) => {
      envelopes.push(route.request().postDataJSON());
      if (envelopes.length === 1) {
        await route.fetch();
        await route.abort("failed");
      } else await route.continue();
    },
  );
  await styles
    .getByRole("button", { name: "Refresh saved brand styles", exact: true })
    .click();
  await expect(
    styles.getByRole("button", {
      name: "Retry saved brand refresh",
      exact: true,
    }),
  ).toBeVisible();
  await styles
    .getByRole("button", { name: "Retry saved brand refresh", exact: true })
    .click();
  await expect(
    styles.getByRole("button", {
      name: "Retry saved brand refresh",
      exact: true,
    }),
  ).toHaveCount(0);
  await expect(
    styles.getByRole("button", { name: "Check saved Brand Kit" }),
  ).toBeEnabled();
  expect(envelopes).toHaveLength(2);
  expect(envelopes[1]).toEqual(envelopes[0]);
  const list = await (
    await page.request.get(
      `${base}/api/studio/native-editor/documents?organizationId=org_default&brandId=brand_default&storyId=native-fixture&format=infographic`,
    )
  ).json();
  expect(list.documents[0].revision).toBe(envelopes[0].expectedRevision + 1);
});

test("an edit begun during refresh keeps the live native buffer instead of adopting the response", async ({
  page,
}) => {
  await page.request.post(`${base}/api/auth/login`, {
    data: { username: "native-host-fixture", password },
  });
  const scope = {
    organizationId: "org_default",
    brandId: "brand_default",
    preset: "liquidity_desk",
  };
  const repo = (await platform.forScope(scope)).ports.repo;
  const profile = await repo.getBrandProfile();
  await repo.updateBrandProfile({
    colors: profile.colors.map((color, index) =>
      index === 1 ? { ...color, hex: "#56789A" } : color,
    ),
  });
  await page.goto(`${base}/tests/fixtures/native-studio-host.html`);
  await page.getByRole("button", {name: /Campaign Studio/}).click();
  await page.locator(".format-tabs").getByRole("button", {name: /^Feed post/}).click();
  await page
    .getByRole("button", { name: "Open native design editor", exact: true })
    .click();
  const frame = page.frameLocator('iframe[title="Native Doory design canvas"]');
  const styles = page.getByRole("region", {
    name: "Native brand styles",
    exact: true,
  });
  await expect(
    styles.getByRole("button", { name: "Check saved Brand Kit" }),
  ).toBeEnabled();
  await styles.getByRole("button", { name: "Check saved Brand Kit" }).click();
  let release;
  const hold = new Promise((resolve) => (release = resolve));
  let committed;
  const committedSignal = new Promise((resolve) => (committed = resolve));
  await page.route(
    "**/native-editor/documents/*/brand-tokens?**",
    async (route) => {
      const response = await route.fetch();
      committed();
      await hold;
      await route.fulfill({ response });
    },
  );
  await styles
    .getByRole("button", { name: "Refresh saved brand styles", exact: true })
    .click();
  await committedSignal;
  await frame.locator("[data-artboard]").first().scrollIntoViewIfNeeded();
  const art = await frame.locator("[data-artboard]").first().boundingBox();
  await page.mouse.dblclick(
    art.x + art.width * 0.5,
    art.y + (art.height * 365) / 1350,
  );
  const textarea = frame.locator('textarea[data-fabric="textarea"]');
  await expect(textarea).toBeAttached();
  await page.keyboard.press("ControlOrMeta+A");
  await page.keyboard.type("LATE HUMAN BUFFER MUST SURVIVE");
  release();
  await expect(
    page
      .getByRole("alert")
      .filter({ hasText: "Your local canvas is preserved" }),
  ).toBeVisible();
  await expect(textarea).toHaveValue("LATE HUMAN BUFFER MUST SURVIVE");
});
