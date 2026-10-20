import { test, expect } from "@playwright/test";
import { createServer as nodeServer } from "node:http";
import { createServer as viteServer } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import { randomBytes, randomUUID } from "node:crypto";
import { mkdtempSync, rmSync, readFileSync, mkdirSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { createPlatform } from "../server/platform.js";
import { createHttpServer } from "../server/index.js";
import { DurableStore } from "../server/storage.js";
let server, vite, store, base, directory;
const password = randomBytes(24).toString("base64url"),
  scope = "?organizationId=org_default&brandId=brand_default";
test.beforeEach(async () => {
  directory = mkdtempSync(join(tmpdir(), "liquidity-calendar-ui-"));
  store = new DurableStore(join(directory, "fixture.sqlite"));
  const platform = createPlatform({ store, authMode: "password" });
  await platform.ready;
  await platform.identity.provision({
    username: "calendar-fixture-founder",
    password,
    role: "founder",
  });
  const api = createHttpServer(null, { platform });
  vite = await viteServer({
    root: fileURLToPath(new URL("..", import.meta.url)),
    configFile: false,
    cacheDir: join(directory, "vite-cache"),
    plugins: [svelte()],
    optimizeDeps: { entries: ["tests/fixtures/calendar-host.html"] },
    server: { middlewareMode: true, hmr: false },
    appType: "custom",
    logLevel: "error",
  });
  server = nodeServer((req, res) => {
    if (req.url.startsWith("/api/")) api.emit("request", req, res);
    else if (req.url.split("?")[0] === "/tests/fixtures/calendar-host.html") {
      void vite
        .transformIndexHtml(
          req.url,
          readFileSync(
            new URL("./fixtures/calendar-host.html", import.meta.url),
            "utf8",
          ),
        )
        .then((html) => {
          res.setHeader("Content-Type", "text/html");
          res.end(html);
        })
        .catch((error) => {
          res.statusCode = 500;
          res.end(error.message);
        });
    } else
      vite.middlewares(req, res, () => {
        res.statusCode = 404;
        res.end("Fixture not found");
      });
  });
  await new Promise((r) => server.listen(0, "127.0.0.1", r));
  base = `http://127.0.0.1:${server.address().port}`;
});
test.afterEach(async () => {
  if (server) await new Promise((r) => server.close(r));
  await vite?.close();
  store?.close();
  if (directory) rmSync(directory, { recursive: true, force: true });
});
async function openCalendarSettings(page) {
  const settings=page.locator('.calendar-settings');
  if(!(await settings.evaluate(element=>element.open)))await settings.locator('summary').click();
}
async function setup(page) {
  page.on("pageerror", (error) =>
    console.error("Calendar fixture runtime:", error.message),
  );
  expect(
    (
      await page.request.post(base + "/api/auth/login", {
        data: { username: "calendar-fixture-founder", password },
      })
    ).status(),
  ).toBe(200);
  const ids = [];
  for (const title of ["Calendar alpha", "Calendar beta", "Calendar gamma"]) {
    const response = await page.request.post(
      base + "/api/studio/backlog" + scope,
      {
        data: {
          title,
          category: "Disposable calendar fixture",
          scheduledDay: "Monday",
          sourceClaims: [
            {
              id: randomUUID(),
              text: "An unreviewed planning fixture.",
              sourceUrl: "https://example.org/calendar-fixture",
              status: "unreviewed",
              kind: "general",
            },
          ],
        },
      },
    );
    expect(response.status()).toBe(201);
    ids.push((await response.json()).story.id);
  }
  await page.goto(base + "/tests/fixtures/calendar-host.html");
  await expect(
    page
      .getByRole("region", { name: "Legacy undated weekday plans" })
      .getByRole("button", { name: /Move Calendar alpha/ }),
  ).toBeVisible();
  await openCalendarSettings(page);
  await page.getByLabel("Calendar timezone").fill("America/New_York");
  await page.getByLabel("Calendar timezone").press("Tab");
  await page.getByLabel("Calendar start date").fill("2026-03-02");
  await page.getByLabel("Calendar end date").fill("2026-03-08");
  await page
    .getByRole("button", { name: "Reload calendar", exact: true })
    .click();
  await expect(
    page.getByRole("region", { name: "Plans for 2026-03-08" }),
  ).toBeVisible();
  await expect(
    page.getByText("Loading the current brand's calendar…"),
  ).toBeHidden();
  await page.locator(".calendar-settings > summary").click();
  return ids;
}
async function capture(page, name) {
  const dir = process.env.STUDIO_CALENDAR_EVIDENCE_DIR;
  if (!dir) return;
  mkdirSync(dir, { recursive: true });
  await page.screenshot({ path: join(dir, name + ".png"), fullPage: true });
}
const day = (page, date = "2026-03-08") =>
  page.getByRole("region", { name: "Plans for " + date });
async function moveLegacy(page, title, { touch = false } = {}) {
  const moveButton = page
    .getByRole("region", { name: "Legacy undated weekday plans" })
    .getByRole("button", { name: new RegExp("Move " + title) });
  if (touch) await moveButton.tap();
  else await moveButton.click();
  await page.getByLabel("Destination date").fill("2026-03-08");
  await page.getByLabel("Destination date").press("Tab");
  const saveButton = page.getByRole("button", {
    name: "Save dated placement",
    exact: true,
  });
  if (touch) await saveButton.tap();
  else await saveButton.click();
  await expect(
    day(page).getByRole("button", { name: title, exact: true }),
  ).toBeVisible();
}
test("legacy Monday becomes a dated campaign; reload, format separation and undo use real APIs", async ({
  page,
}) => {
  await setup(page);
  await capture(page, "S01-desktop-legacy");
  await expect(
    page.getByRole("region", { name: "Legacy undated weekday plans" }),
  ).toContainText("Monday · undated whole campaign");
  await moveLegacy(page, "Calendar alpha");
  await page.reload();
  await expect(
    day(page).getByRole("button", { name: "Calendar alpha", exact: true }),
  ).toBeVisible();
  await capture(page, "S02-desktop-dated-campaign");
  await openCalendarSettings(page);
  await page.getByLabel("Calendar planning unit").selectOption("format");
  await expect(
    day(page).getByRole("button", { name: "Calendar alpha", exact: true }),
  ).toHaveCount(0);
  await page
    .getByRole("region", { name: "Unscheduled planning units" })
    .getByRole("button", {
      name: "Move Calendar alpha, Reel plan",
      exact: true,
    })
    .click();
  await page.getByLabel("Destination date").fill("2026-03-08");
  await page.getByLabel("Destination date").press("Tab");
  await page
    .getByRole("button", { name: "Save dated placement", exact: true })
    .click();
  await expect(day(page)).toContainText("Reel plan");
  await capture(page, "S03-format-plan");
  await page
    .getByRole("button", { name: "Undo calendar action", exact: true })
    .click();
  await expect(
    day(page).getByRole("button", { name: "Calendar alpha", exact: true }),
  ).toHaveCount(0);
  await openCalendarSettings(page);
  await page.getByLabel("Calendar planning unit").selectOption("campaign");
  await expect(
    day(page).getByRole("button", { name: "Calendar alpha", exact: true }),
  ).toBeVisible();
});
test("keyboard/pointer reorder persists; stale move conflicts; unassign is compensatable", async ({
  page,
}) => {
  const ids = await setup(page);
  await moveLegacy(page, "Calendar beta");
  await moveLegacy(page, "Calendar gamma");
  await day(page)
    .getByRole("button", { name: "Move Calendar gamma earlier", exact: true })
    .click();
  await expect(day(page).locator(".workspace-story-button").first()).toHaveText(
    "Calendar gamma",
  );
  // Optimistic order is visible before reconciliation; keyboard input starts
  // when the canonical-revision handle becomes available again.
  await expect(day(page).getByRole("button", {
    name: "Move Calendar gamma, Whole campaign", exact: true,
  })).toBeEnabled();
  await day(page)
    .getByRole("button", {
      name: "Move Calendar gamma, Whole campaign",
      exact: true,
    })
    .focus();
  await page.keyboard.press("Space");
  await page.keyboard.press("ArrowLeft");
  await page.keyboard.press("Enter");
  await expect(
    day(page, "2026-03-07").getByRole("button", {
      name: "Calendar gamma",
      exact: true,
    }),
  ).toBeVisible();
  await expect(
    day(page, "2026-03-07").getByRole("button", {
      name: "Move Calendar gamma, Whole campaign",
      exact: true,
    }),
  ).toBeFocused();
  const source = await day(page, "2026-03-07")
      .getByRole("button", {
        name: "Move Calendar gamma, Whole campaign",
        exact: true,
      })
      .boundingBox(),
    target = await day(page).boundingBox();
  await page.mouse.move(
    source.x + source.width / 2,
    source.y + source.height / 2,
  );
  await page.mouse.down();
  await page.mouse.move(
    target.x + target.width / 2,
    target.y + target.height - 20,
    { steps: 12 },
  );
  await page.mouse.up();
  await expect(
    day(page).getByRole("button", { name: "Calendar gamma", exact: true }),
  ).toBeVisible();
  await day(page)
    .getByRole("button", {
      name: "Move Calendar gamma, Whole campaign",
      exact: true,
    })
    .click();
  const bootstrap = await (
      await page.request.get(base + "/api/studio/bootstrap" + scope)
    ).json(),
    story = bootstrap.backlog.find((s) => s.id === ids[2]);
  expect(
    (
      await page.request.post(
        base + "/api/studio/workspace/mutations" + scope,
        {
          data: {
            idempotencyKey: randomUUID(),
            changes: [
              {
                kind: "story.patch",
                storyId: story.id,
                expectedRevision: story.revision,
                patch: { category: "Concurrent metadata" },
              },
            ],
          },
        },
      )
    ).status(),
  ).toBe(200);
  await page
    .getByRole("button", { name: "Save dated placement", exact: true })
    .click();
  await expect(page.getByRole("alert")).toContainText("Story revision changed");
  await capture(page, "S04-conflict");
  await page.getByRole("button", { name: "Cancel move", exact: true }).click();
  await page
    .getByRole("button", { name: "Reload authoritative calendar", exact: true })
    .click();
  await day(page)
    .locator(".calendar-plan")
    .filter({
      has: page.getByRole("button", { name: "Calendar gamma", exact: true }),
    })
    .getByRole("button", { name: "Unassign", exact: true })
    .click();
  await expect(
    day(page).getByRole("button", { name: "Calendar gamma", exact: true }),
  ).toHaveCount(0);
  await page
    .getByRole("button", { name: "Undo calendar action", exact: true })
    .click();
  await expect(
    day(page).getByRole("button", { name: "Calendar gamma", exact: true }),
  ).toBeVisible();
});
test.describe("touch input", () => {
  test.use({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
  });
  test("mobile agenda keeps dated intent and brand-scoped view preferences", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await setup(page);
    await moveLegacy(page, "Calendar beta", { touch: true });
    await moveLegacy(page, "Calendar gamma", { touch: true });
    await day(page)
      .getByRole("button", { name: "Move Calendar gamma earlier", exact: true })
      .tap();
    await expect(
      day(page).locator(".workspace-story-button").first(),
    ).toHaveText("Calendar gamma");
    const handle = day(page).getByRole("button", {
      name: "Move Calendar beta, Whole campaign",
      exact: true,
    });
    await day(page, "2026-03-07").scrollIntoViewIfNeeded();
    const source = await handle.boundingBox(),
      target = await day(page, "2026-03-07").boundingBox();
    const session = await page.context().newCDPSession(page);
    const start = {
        x: source.x + source.width / 2,
        y: source.y + source.height / 2,
      },
      end = { x: target.x + target.width / 2, y: target.y + 30 };
    expect(start.y).toBeLessThan(844);
    expect(end.y).toBeGreaterThanOrEqual(0);
    await session.send("Input.dispatchTouchEvent", {
      type: "touchStart",
      touchPoints: [{ ...start, id: 1 }],
    });
    for (let step = 1; step <= 12; step++)
      await session.send("Input.dispatchTouchEvent", {
        type: "touchMove",
        touchPoints: [
          {
            x: start.x + ((end.x - start.x) * step) / 12,
            y: start.y + ((end.y - start.y) * step) / 12,
            id: 1,
          },
        ],
      });
    await session.send("Input.dispatchTouchEvent", {
      type: "touchEnd",
      touchPoints: [],
    });
    await session.detach();
    await expect(
      day(page, "2026-03-07").getByRole("button", {
        name: "Calendar beta",
        exact: true,
      }),
    ).toBeVisible();
    await capture(page, "S05-mobile-touch-dated");
    await page.getByLabel("Fixture brand").selectOption("brand_vedic");
    await expect(
      page.getByRole("button", { name: "Calendar beta", exact: true }),
    ).toHaveCount(0);
    await page.getByLabel("Fixture brand").selectOption("brand_default");
    await expect(page.getByLabel("Calendar start date")).toHaveValue(
      "2026-03-02",
    );
    await expect(
      day(page, "2026-03-07").getByRole("button", {
        name: "Calendar beta",
        exact: true,
      }),
    ).toBeVisible();
  });
});

test("lost response retries the same recorded calendar intent without duplicate placement", async ({
  page,
}) => {
  const ids = await setup(page);
  let first = true;
  await page.route("**/api/studio/workspace/mutations?*", async (route) => {
    if (first) {
      first = false;
      await route.fetch();
      await route.abort("failed");
    } else await route.continue();
  });
  await page
    .getByRole("region", { name: "Legacy undated weekday plans" })
    .getByRole("button", { name: /Move Calendar alpha/ })
    .click();
  await page.getByLabel("Destination date").fill("2026-03-08");
  await page.getByLabel("Destination date").press("Tab");
  await page
    .getByRole("button", { name: "Save dated placement", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "Retry calendar request", exact: true }),
  ).toBeVisible();
  await capture(page, "S06-uncertain-request");
  const before = await (
    await page.request.get(
      base + "/api/studio/workspace/stories/" + ids[0] + scope,
    )
  ).json();
  await page
    .getByRole("button", { name: "Retry calendar request", exact: true })
    .click();
  await expect(
    day(page).getByRole("button", { name: "Calendar alpha", exact: true }),
  ).toBeVisible();
  const after = await (
    await page.request.get(
      base + "/api/studio/workspace/stories/" + ids[0] + scope,
    )
  ).json();
  expect(after.story.revision).toBe(before.story.revision);
  expect(after.row.assignments).toHaveLength(1);
});

test("a delayed old-brand placement cannot restore its receipt or story into the new brand", async ({
  page,
}) => {
  const ids = await setup(page);
  let release, started;
  const hold = new Promise((resolve) => (release = resolve)),
    pendingRequest = new Promise((resolve) => (started = resolve));
  await page.route("**/api/studio/workspace/mutations?*", async (route) => {
    const response = await route.fetch();
    started();
    await hold;
    await route.fulfill({ response });
  });
  await page
    .getByRole("region", { name: "Legacy undated weekday plans" })
    .getByRole("button", { name: /Move Calendar alpha/ })
    .click();
  await page.getByLabel("Destination date").fill("2026-03-08");
  await page.getByLabel("Destination date").press("Tab");
  await page
    .getByRole("button", { name: "Save dated placement", exact: true })
    .click();
  await pendingRequest;
  await page.getByLabel("Fixture brand").selectOption("brand_vedic");
  release();
  await expect(
    page.getByRole("button", { name: "Calendar alpha", exact: true }),
  ).toHaveCount(0);
  await expect(
    page.getByRole("button", { name: "Undo calendar action", exact: true }),
  ).toHaveCount(0);
  await expect(
    page.getByText(
      "Plan assigned to 2026-03-08 in America/New_York. This does not export or publish.",
      { exact: true },
    ),
  ).toHaveCount(0);
  const original = await (
    await page.request.get(
      base + "/api/studio/workspace/stories/" + ids[0] + scope,
    )
  ).json();
  expect(original.row.assignments).toHaveLength(1);
  const foreign = await page.request.get(
    base +
      "/api/studio/workspace/stories/" +
      ids[0] +
      "?organizationId=org_default&brandId=brand_vedic",
  );
  expect(foreign.status()).toBe(404);
});

test("wide dated week and compact agenda keep undated work available", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1024, height: 768 });
  await setup(page);
  const grid = page.getByLabel("Dated plans", { exact: true });
  expect(
    await grid.evaluate(
      (element) => element.scrollWidth <= element.clientWidth + 1,
    ),
  ).toBe(true);
  await page.evaluate(()=>window.scrollTo(0,0));
  const pool=page.getByRole('region',{name:'Legacy undated weekday plans'});
  await expect(pool.getByRole('button',{name:'Move Calendar alpha, Whole campaign',exact:true})).toBeInViewport();
  const dates=await grid.boundingBox(),poolBounds=await pool.boundingBox();
  expect(poolBounds.x).toBeGreaterThanOrEqual(dates.x+dates.width-1);
  expect(await page.locator('.calendar-feedback').evaluate(element=>getComputedStyle(element).minHeight)).toBe('0px');
  const last = await day(page).boundingBox();
  expect(last.x + last.width).toBeLessThanOrEqual(1024);
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.evaluate(()=>window.scrollTo(0,0));
  const wideFirst=await day(page,'2026-03-02').boundingBox(),wideSecond=await day(page,'2026-03-03').boundingBox();
  expect(wideSecond.x).toBeGreaterThanOrEqual(wideFirst.x+wideFirst.width-1);
  expect(Math.abs(wideSecond.y-wideFirst.y)).toBeLessThan(1);
  await expect(pool.getByRole('button',{name:'Move Calendar alpha, Whole campaign',exact:true})).toBeInViewport();
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  await page.setViewportSize({ width: 700, height: 768 });
  const first = await day(page, "2026-03-02").boundingBox(),
    second = await day(page, "2026-03-03").boundingBox();
  expect(second.y).toBeGreaterThan(first.y + first.height - 1);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});

test("legacy and unscheduled units open their real story without manufacturing a dated assignment", async ({
  page,
}) => {
  const ids = await setup(page);
  await page
    .getByRole("region", { name: "Legacy undated weekday plans" })
    .getByRole("button", {
      name: "Open Calendar alpha, Whole campaign",
      exact: true,
    })
    .click();
  await expect(
    page.getByText("Selected story: Calendar alpha", { exact: true }),
  ).toBeVisible();
  await openCalendarSettings(page);
  await page.getByLabel("Calendar planning unit").selectOption("format");
  await page
    .getByRole("region", { name: "Unscheduled planning units" })
    .getByRole("button", {
      name: "Open Calendar alpha, Reel plan",
      exact: true,
    })
    .click();
  const detail = await (
    await page.request.get(
      base + "/api/studio/workspace/stories/" + ids[0] + scope,
    )
  ).json();
  expect(detail.row.assignments).toHaveLength(0);
  expect(detail.story.revision).toBe(1);
  expect(detail.story.sourceClaims[0].status).toBe("unreviewed");
});

test('calendar placement appears before a held save response and reconciles without disappearing', async ({ page }) => {
  await setup(page);
  await page.getByRole('region', { name: 'Legacy undated weekday plans' }).getByRole('button', { name: 'Move Calendar alpha, Whole campaign', exact: true }).click();
  await page.getByLabel('Destination date').fill('2026-03-08');
  await page.getByLabel('Destination date').press('Tab');
  let release, received;
  const held = new Promise(resolve => { release = resolve; });
  const requestReceived = new Promise(resolve => { received = resolve; });
  await page.route('**/api/studio/workspace/mutations?*', async route => {
    received(); await held; await route.continue();
  });
  const response = page.waitForResponse(result => result.url().includes('/workspace/mutations') && result.request().method() === 'POST');
  await page.getByRole('button', { name: 'Save dated placement', exact: true }).click();
  await requestReceived;
  try {
    await expect(day(page).getByRole('button', { name: 'Calendar alpha', exact: true })).toBeVisible({ timeout: 500 });
    await expect(day(page).getByText('Saving…', { exact: true })).toBeVisible();
  } finally { release(); await response; }
  await expect(day(page).getByRole('button', { name: 'Calendar alpha', exact: true })).toBeVisible();
  await expect(day(page).getByText('Saving…', { exact: true })).toHaveCount(0);
});

test('denied optimistic placement rolls back and keeps the story available', async ({page}) => {
  await setup(page);
  await page.getByRole('region', {name:'Legacy undated weekday plans'}).getByRole('button',{name:'Move Calendar alpha, Whole campaign',exact:true}).click();
  await page.getByLabel('Destination date').fill('2026-03-08');
  await page.getByLabel('Destination date').press('Tab');
  let release,received;
  const held=new Promise(resolve=>{release=resolve;});
  const requested=new Promise(resolve=>{received=resolve;});
  await page.route('**/api/studio/workspace/mutations?*',async route=>{
    received();await held;await route.fulfill({status:403,contentType:'application/json',body:JSON.stringify({error:'Calendar access was removed.'})});
  });
  await page.getByRole('button',{name:'Save dated placement',exact:true}).click();await requested;
  try { await expect(day(page).getByText('Saving…',{exact:true})).toBeVisible(); }
  finally { release(); }
  await expect(page.getByRole('alert')).toContainText('Calendar access was removed.');
  await expect(day(page).getByRole('button',{name:'Calendar alpha',exact:true})).toHaveCount(0);
  await expect(page.getByRole('region',{name:'Legacy undated weekday plans'}).getByRole('button',{name:'Open Calendar alpha, Whole campaign',exact:true})).toBeVisible();
});

test('lost save response retains an unconfirmed placement and retries the exact request once', async ({page}) => {
  await setup(page);
  await page.getByRole('region',{name:'Legacy undated weekday plans'}).getByRole('button',{name:'Move Calendar alpha, Whole campaign',exact:true}).click();
  await page.getByLabel('Destination date').fill('2026-03-08');await page.getByLabel('Destination date').press('Tab');
  const requests=[];
  await page.route('**/api/studio/workspace/mutations?*',async route=>{
    requests.push(route.request().postDataJSON());
    if(requests.length===1){await route.fetch();await route.fulfill({status:503,contentType:'application/json',body:JSON.stringify({error:'Response lost after save.'})});}
    else await route.continue();
  });
  await page.getByRole('button',{name:'Save dated placement',exact:true}).click();
  await expect(day(page).getByText('Save unconfirmed',{exact:true})).toBeVisible();
  await page.getByRole('button',{name:'Retry calendar request',exact:true}).click();
  await expect(day(page).getByText('Save unconfirmed',{exact:true})).toHaveCount(0);
  await expect(day(page).getByRole('button',{name:'Calendar alpha',exact:true})).toHaveCount(1);
  expect(requests).toHaveLength(2);expect(requests[1]).toEqual(requests[0]);
});
