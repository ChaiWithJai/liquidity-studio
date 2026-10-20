import { test, expect } from "@playwright/test";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { randomBytes } from "node:crypto";
import { createHttpServer } from "../server/index.js";
import { createPlatform } from "../server/platform.js";
import { DurableStore } from "../server/storage.js";
let server, platform, directory, base, emptyBrand, otherOrganization;
const password = randomBytes(24).toString("base64url");
test.beforeAll(async () => {
  directory = mkdtempSync(join(tmpdir(), "workspace-table-"));
  platform = createPlatform({
    authMode: "password",
    store: new DurableStore(join(directory, "fixture.sqlite")),
  });
  await platform.ready;
  await platform.identity.provision({
    username: "table-founder",
    password,
    role: "founder",
  });
  const founder = (await platform.store.get("identity")).users.find(
    (user) => user.username === "table-founder",
  );
  otherOrganization = await platform.identity.createOrganization(
    founder,
    "Other organization fixture",
  );
  await platform.identity.createBrand(founder, {
    organizationId: otherOrganization.id,
    name: "Other organization brand",
    preset: "liquidity_desk",
  });
  emptyBrand = await platform.identity.createBrand(founder, {
    organizationId: "org_default",
    name: "Empty fixture brand",
    preset: "liquidity_desk",
  });
  const app = await platform.forScope({
    organizationId: "org_default",
    brandId: emptyBrand.id,
    preset: "liquidity_desk",
  });
  await app.ports.repo.mutate((state) => ({ ...state, backlog: [] }));
  server = createHttpServer(null, { platform });
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  base = `http://127.0.0.1:${server.address().port}`;
});
test.afterAll(async () => {
  server.closeAllConnections();
  await new Promise((resolve) => server.close(resolve));
  platform.store.close();
  rmSync(directory, { recursive: true, force: true });
});
async function showTools(page) { const tools = page.locator(".table-tools"); if (await tools.getAttribute("open") === null) await tools.locator(":scope > summary").click(); }
async function showDisplay(page) { await showTools(page); if (!(await page.getByLabel("Sort stories",{exact:true}).isVisible())) await page.getByText("Display options",{exact:true}).click(); }
async function signIn(page) {
  await page.goto(base);
  await page.getByLabel("Username", { exact: true }).fill("table-founder");
  await page.getByLabel("Password", { exact: true }).fill(password);
  await page.getByRole("button", { name: "Sign in →" }).click();
  await expect(page.locator(".story-row")).toHaveCount(5);
  await showDisplay(page);
}
test("table view, detail edit, shared receipt and undo preserve canonical story identity", async ({
  page,
}) => {
  await signIn(page);
  await page
    .getByLabel("Sort stories", { exact: true })
    .selectOption("category");
  await page
    .getByLabel("Group stories", { exact: true })
    .selectOption("status");
  await expect(page.locator(".group-row")).toHaveCount(1);
  await page.getByText("Columns", { exact: true }).click();
  await page.locator(".column-options").getByLabel("Source review", { exact: true }).uncheck();
  await expect(page.getByRole("columnheader", { name: "Source review", exact: true })).toHaveCount(0);
  await page.getByText("Saved views", { exact: true }).click();
  await page.getByLabel("Workspace view name").fill("Shared review queue");
  await page.getByLabel("Workspace view sharing").selectOption("brand");
  await page
    .getByRole("button", { name: "Create saved view", exact: true })
    .click();
  await expect(
    page.getByRole("status").filter({ hasText: "View saved" }),
  ).toBeVisible();
  const view = await page.getByLabel("Saved workspace view").inputValue();
  expect(view).toBeTruthy();
  await page.getByRole("button", { name: "Delete selected view" }).click();
  await expect(
    page.getByRole("button", { name: "Restore deleted view" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Restore deleted view" }).click();
  await expect(page.getByLabel("Saved workspace view")).toHaveValue(view);
  await page.getByLabel("Workspace view name").fill("Shared review queue updated");
  await page.getByRole("button",{name:"Update selected view"}).click();
  await expect(page.getByLabel("Saved workspace view").locator("option:checked")).toContainText("updated");
  await page.getByLabel("Sort stories",{exact:true}).selectOption("title");
  await page.getByLabel("Saved workspace view").selectOption("");
  await page.getByLabel("Saved workspace view").selectOption(view);
  await expect(page.getByLabel("Sort stories",{exact:true})).toHaveValue("category");
  await expect(page.getByRole("columnheader",{name:"Source review",exact:true})).toHaveCount(0);

  const titleButton = page.locator("[data-detail-story]").first();
  const storyId = await titleButton.getAttribute("data-detail-story");
  await titleButton.click();
  await expect(
    page.getByRole("dialog", { name: "Story details" }),
  ).toBeVisible();
  await page.getByLabel("Detail queue title").fill("Canonical workspace title");
  await page.getByLabel("Detail category").fill("Table detail revision");
  await page.getByRole("button", { name: "Save detail metadata" }).click();
  await expect(
    page.getByRole("dialog").getByText(/current saved revision/),
  ).toContainText("current saved revision");
  await expect(page.locator(`[data-story-id="${storyId}"]`)).toContainText(
    "Table detail revision",
  );
  await page.keyboard.press("Escape");
  await expect(page.locator(`[data-detail-story="${storyId}"]`)).toBeFocused();
  const revision=await page.locator(`[data-story-id="${storyId}"]`).getAttribute("data-story-revision");
  await page.getByRole("button",{name:"Content calendar",exact:true}).click();
  await page.getByRole("button",{name:/^Move Canonical workspace title,/}).click();
  await expect(page.getByRole("dialog",{name:"Move planning unit"})).toContainText(`expected story revision ${revision}`);
  await page.getByRole("button",{name:"Cancel move",exact:true}).click();
  await page.getByRole("button",{name:/^Open Canonical workspace title,/}).click();
  await expect(page.getByRole("heading",{name:"Canonical workspace title",exact:true})).toBeVisible();
  await page.getByRole("button",{name:"Story backlog",exact:true}).click();
  await expect(page.locator(`[data-story-id="${storyId}"]`)).toHaveAttribute("data-story-revision",revision);

  await page
    .getByRole("button", { name: "Undo operation", exact: true })
    .click();
  await expect(page.locator(`[data-story-id="${storyId}"]`)).not.toContainText(
    "Table detail revision",
  );
  await page
    .locator(`[data-story-id="${storyId}"] input[type=checkbox]`)
    .check();
  await page.getByLabel("Bulk metadata value").fill("Bulk category");
  await page
    .getByRole("button", { name: "Apply to selected", exact: true })
    .click();
  await expect(
    page.getByRole("status", { name: "Operation results" }),
  ).toContainText("1 updated");
  await expect(page.locator(`[data-story-id="${storyId}"]`)).toContainText(
    "Bulk category",
  );
  await page.getByRole("button", { name: "Board view", exact: true }).click();
  const card = page.locator(`[data-story-id="${storyId}"]`);
  await expect(card).toContainText("Bulk category");
  await card.getByRole("combobox").selectOption("Ready for Campaign");
  await expect(
    page.getByRole("status", { name: "Operation results" }),
  ).toContainText("rejected");
  await expect(card.getByRole("combobox")).toHaveValue("In Backlog");
  await page.getByRole("button", { name: "Table view", exact: true }).click();
  await expect(page.locator(`[data-story-id="${storyId}"]`)).toContainText(
    "Bulk category",
  );
  await page.getByLabel("Brand", { exact: true }).selectOption("brand_vedic");
  await expect(page.locator(".selection-toolbar")).toHaveCount(0);
  await expect(page.locator(".story-row input:checked")).toHaveCount(0);
  await expect(
    page.getByLabel("Saved workspace view").locator("option"),
  ).not.toContainText(["Shared review queue"]);
});

test("large table pagination, recoverable load failure and partial bulk conflict retain per-item outcomes", async ({
  page,
}) => {
  const app = await platform.forScope({
    organizationId: "org_default",
    brandId: "brand_default",
  });
  await app.ports.repo.mutate((state) => ({
    ...state,
    backlog: [
      ...state.backlog,
      ...Array.from({ length: 30 }, (_, i) => ({
        ...state.backlog[0],
        id: crypto.randomUUID(),
        title: `Large queue ${String(i).padStart(2, "0")}`,
        revision: 1,
        campaignDraft: null,
        status: "In Backlog",
      })),
    ],
  }));
  await page.goto(base);
  await page.getByLabel("Username", { exact: true }).fill("table-founder");
  await page.getByLabel("Password", { exact: true }).fill(password);
  await page.getByRole("button", { name: "Sign in →" }).click();
  await expect(page.locator(".story-row")).toHaveCount(25);
  await page.getByRole("button", { name: "Load more rows" }).click();
  await expect(page.locator(".story-row")).toHaveCount(35);
  await page.getByRole("button", { name: "Select loaded rows" }).click();
  await expect(page.getByRole("alert")).toContainText("more than 25");
  await page.getByLabel("Rows per page").selectOption("10");
  await expect(page.locator(".story-row")).toHaveCount(10);
  const first = page.locator(".story-row").first(),
    second = page.locator(".story-row").nth(1);
  const id = await first.getAttribute("data-story-id");
  await first.locator("input[type=checkbox]").check();
  await second.locator("input[type=checkbox]").check();
  const current = await page.request.get(
    `${base}/api/studio/workspace/stories/${id}?organizationId=org_default&brandId=brand_default`,
  );
  const snapshot = await current.json();
  const external = await page.request.post(
    `${base}/api/studio/workspace/mutations?organizationId=org_default&brandId=brand_default`,
    {
      data: {
        idempotencyKey: crypto.randomUUID(),
        changes: [
          {
            kind: "story.patch",
            storyId: id,
            expectedRevision: snapshot.row.revision,
            patch: { category: "Concurrent operator edit" },
          },
        ],
      },
    },
  );
  expect(external.ok()).toBeTruthy();
  await page.getByLabel("Bulk metadata value").fill("Partial bulk update");
  await page
    .getByRole("button", { name: "Apply to selected", exact: true })
    .click();
  await expect(
    page.getByRole("status", { name: "Operation results" }),
  ).toContainText("1 updated · 1 not updated");
  await expect(page.locator(`[data-story-id="${id}"]`)).toContainText(
    "Concurrent operator edit",
  );
  let fail = true;
  await page.route("**/workspace/query?**", async (route) => {
    if (fail) {
      fail = false;
      await route.fulfill({
        status: 503,
        contentType: "application/json",
        body: JSON.stringify({ error: "Controlled query failure" }),
      });
    } else await route.continue();
  });
  await showDisplay(page); await page.getByLabel("Sort direction").selectOption("desc");
  await expect(page.getByRole("button", { name: "Retry table" })).toBeVisible();
  await page.getByRole("button", { name: "Retry table" }).click();
  await expect(page.locator(".story-row")).toHaveCount(10);
  await expect(page.getByRole("button", { name: "Retry table" })).toHaveCount(
    0,
  );
  await page.getByLabel("Rows per page").selectOption("50");
  await expect(page.locator(".story-row")).toHaveCount(35);
  const last=page.locator(".story-row").last();const focusId=await last.getAttribute("data-story-id");
  await last.scrollIntoViewIfNeeded();const position=await page.locator(".table-scroll").evaluate(node=>node.scrollTop);expect(position).toBeGreaterThan(0);
  await last.getByRole("button",{name:/Open (story|draft)/}).click();await page.getByRole("button",{name:"Story backlog",exact:true}).click();
  await expect(page.locator(`[data-detail-story="${focusId}"]`)).toBeFocused();
  await expect.poll(()=>page.locator(".table-scroll").evaluate(node=>node.scrollTop)).toBe(position);

});

test("detail metadata waits for current server revision and late earlier-row responses cannot overwrite another drawer",async({page})=>{
 await page.goto(base);await page.getByLabel('Username',{exact:true}).fill('table-founder');await page.getByLabel('Password',{exact:true}).fill(password);await page.getByRole('button',{name:'Sign in →'}).click();
 await expect(page.locator('.story-row').first()).toBeVisible();
 const buttons=page.locator('[data-detail-story]');const first=await buttons.first().getAttribute('data-detail-story');const secondTitle=await buttons.nth(1).innerText();
 let release;const held=new Promise(resolve=>release=resolve);await page.route(`**/workspace/stories/${first}?**`,async route=>{await held;await route.continue();});
 await buttons.first().click();await expect(page.getByText('Loading current story details…',{exact:true})).toBeVisible();await expect(page.getByLabel('Detail queue title')).toHaveCount(0);
 await page.getByRole('button',{name:'Close story details'}).click();await buttons.nth(1).click();await expect(page.getByLabel('Detail queue title')).toHaveValue(secondTitle);
 release();await expect(page.getByLabel('Detail queue title')).toHaveValue(secondTitle);await page.keyboard.press('Escape');await expect(buttons.nth(1)).toBeFocused();
});

test("uncertain browser write exposes same-request retry and commits once",async({page})=>{
 await page.goto(base);await page.getByLabel('Username',{exact:true}).fill('table-founder');await page.getByLabel('Password',{exact:true}).fill(password);await page.getByRole('button',{name:'Sign in →'}).click();
 const row=page.locator('.story-row').first();await expect(row).toBeVisible();const id=await row.getAttribute('data-story-id');const before=Number(await row.getAttribute('data-story-revision'));let lose=true;const keys=[];
 await page.route('**/workspace/mutations?**',async route=>{keys.push(route.request().postDataJSON().idempotencyKey);if(lose){lose=false;await route.fetch();await route.abort('failed');}else await route.continue();});
 await row.locator('input[type=checkbox]').check();await page.getByLabel('Bulk metadata value').fill('Uncertain request committed once');await page.getByRole('button',{name:'Apply to selected',exact:true}).click();
 await expect(page.getByRole('button',{name:'Retry same request',exact:true})).toBeVisible();await page.getByRole('button',{name:'Retry same request',exact:true}).click();await expect(page.getByRole('button',{name:'Retry same request',exact:true})).toHaveCount(0);
 await expect(page.locator(`[data-story-id="${id}"]`)).toHaveAttribute('data-story-revision',String(before+1));expect(keys).toHaveLength(2);expect(keys[0]).toBe(keys[1]);
});

test("external rename reconciles filtered rows after a forced detail refresh",async({page})=>{
 await page.goto(base);await page.getByLabel('Username',{exact:true}).fill('table-founder');await page.getByLabel('Password',{exact:true}).fill(password);await page.getByRole('button',{name:'Sign in →'}).click();await page.getByLabel('Search stories').fill('Huda');await expect(page.locator('.story-row')).toHaveCount(1);
 const row=page.locator('.story-row'),id=await row.getAttribute('data-story-id'),revision=Number(await row.getAttribute('data-story-revision'));
 const response=await page.request.post(`${base}/api/studio/workspace/mutations?organizationId=org_default&brandId=brand_default`,{data:{idempotencyKey:crypto.randomUUID(),changes:[{kind:'story.patch',storyId:id,expectedRevision:revision,patch:{title:'Externally renamed queue item'}}]}});expect(response.ok()).toBeTruthy();
 await row.locator('[data-detail-story]').click();await expect(page.getByLabel('Detail queue title')).toHaveValue('Externally renamed queue item');await page.getByRole('button',{name:'Close story details'}).click();
 await expect(page.getByLabel('Search stories')).toBeFocused();await expect(page.locator('.story-row')).toHaveCount(0);await expect(page.locator('#backlog-results')).toContainText(/Showing 0 of [1-9]\d* stories/);
});

test("dirty detail and inline metadata retain their opening revisions after another writer changes the story",async({page})=>{
 await page.goto(base);await page.getByLabel('Username',{exact:true}).fill('table-founder');await page.getByLabel('Password',{exact:true}).fill(password);await page.getByRole('button',{name:'Sign in →'}).click();
 await page.getByLabel('Rows per page').selectOption('50');await showDisplay(page);
 const row=page.locator('.story-row').first();await expect(row).toBeVisible();const id=await row.getAttribute('data-story-id'),revision=Number(await row.getAttribute('data-story-revision'));
 await row.locator('[data-detail-story]').click();await page.getByLabel('Detail category').fill('Unsaved local detail');
 const response=await page.request.post(`${base}/api/studio/workspace/mutations?organizationId=org_default&brandId=brand_default`,{data:{idempotencyKey:crypto.randomUUID(),changes:[{kind:'story.patch',storyId:id,expectedRevision:revision,patch:{title:'Externally saved detail title',category:'Newer external category'}}]}});expect(response.ok()).toBeTruthy();
 await showDisplay(page); await page.getByLabel('Sort direction').selectOption('desc');await expect(page.getByRole('dialog').getByRole('alert')).toContainText('original revision');await expect(page.getByLabel('Detail category')).toHaveValue('Unsaved local detail');
 await page.getByRole('button',{name:'Save detail metadata'}).click();await expect(page.getByRole('status',{name:'Operation results'})).toContainText('conflict');
 const current=await (await page.request.get(`${base}/api/studio/workspace/stories/${id}?organizationId=org_default&brandId=brand_default`)).json();expect(current.story.category).toBe('Newer external category');expect(current.story.title).toBe('Externally saved detail title');await expect(page.getByLabel('Detail category')).toHaveValue('Unsaved local detail');
 await page.getByRole('button',{name:'Discard detail edits and reload'}).click();await expect(page.getByLabel('Detail category')).toHaveValue('Newer external category');await page.keyboard.press('Escape');
 const target=page.locator(`[data-story-id="${id}"]`);await target.getByRole('button',{name:/Edit Category/}).click();await target.getByRole('textbox').fill('Unsaved inline category');
 const latest=Number(await target.getAttribute('data-story-revision'));await page.request.post(`${base}/api/studio/workspace/mutations?organizationId=org_default&brandId=brand_default`,{data:{idempotencyKey:crypto.randomUUID(),changes:[{kind:'story.patch',storyId:id,expectedRevision:latest,patch:{category:'Newest inline conflict category'}}]}});
 await showDisplay(page); await page.getByLabel('Sort direction').selectOption('asc');await target.getByRole('button',{name:'Save cell',exact:true}).click();await expect(page.getByRole('status',{name:'Operation results'})).toContainText('conflict');await expect(target).toContainText('Newest inline conflict category');
});

test("immediate view create and update save visible search/status before debounce dispatch",async({page})=>{
 await page.goto(base);await page.getByLabel('Username',{exact:true}).fill('table-founder');await page.getByLabel('Password',{exact:true}).fill(password);await page.getByRole('button',{name:'Sign in →'}).click();await expect(page.locator('.story-row').first()).toBeVisible();
 await showTools(page);await page.getByText('Saved views',{exact:true}).click();await page.getByLabel('Workspace view name').fill('Immediate control intent');
 async function changeAndSave(search,status,action){
  const pending=page.waitForResponse(response=>response.url().includes('/workspace/views')&&response.request().method()==='POST');
  // One event turn flushes bound UI values but cannot run the query timeout.
  // Only DOM controls are operated; the authenticated HTTP view request remains real.
  await page.evaluate(async({search,status,action})=>{const input=document.querySelector('[aria-label="Search stories"]');input.value=search;input.dispatchEvent(new Event('input',{bubbles:true}));const select=document.querySelector('[aria-label="Filter by status"]');select.value=status;select.dispatchEvent(new Event('change',{bubbles:true}));await Promise.resolve();const button=[...document.querySelectorAll('button')].find(node=>node.textContent.trim()===action);button.click();},{search,status,action});
  const response=await pending;expect(response.ok()).toBeTruthy();const payload=response.request().postDataJSON();expect(payload.definition.filters.search).toBe(search);expect(payload.definition.filters.statuses).toEqual(status==='All'?[]:[status]);return response.json();
 }
 const view=await changeAndSave('Large queue','In Backlog','Create saved view');expect(view.definition.filters.search).toBe('Large queue');await expect(page.getByLabel('Saved workspace view')).toHaveValue(view.id);
 const updated=await changeAndSave('External','All','Update selected view');expect(updated.id).toBe(view.id);expect(updated.revision).toBeGreaterThan(view.revision);expect(updated.definition.filters.search).toBe('External');
});


for (const movedFocus of [false, true]) test(`delayed canonical sort ${movedFocus ? "preserves a new user focus target" : "retains the returned row focus"}`, async ({ page }) => {
  const founder = (await platform.store.get("identity")).users.find(user => user.username === "table-founder");
  const brand = await platform.identity.createBrand(founder, { organizationId: "org_default", name: `Focus recovery ${movedFocus}`, preset: "liquidity_desk" });
  await page.goto(base);
  await page.getByLabel("Username", { exact: true }).fill("table-founder");
  await page.getByLabel("Password", { exact: true }).fill(password);
  await page.getByRole("button", { name: "Sign in →" }).click();
  await page.getByRole("combobox", { name: "Brand", exact: true }).selectOption(brand.id);
  await expect(page.locator(".story-row")).toHaveCount(5);
  const sortedResponse = page.waitForResponse(response => {
    if (!response.url().includes("/api/studio/workspace/query?")) return false;
    const url = new URL(response.url());
    return url.searchParams.get("brandId") === brand.id && response.request().method() === "POST" && response.request().postDataJSON()?.sort?.[0]?.field === "category";
  });
  await showDisplay(page); await page.getByLabel("Sort stories", { exact: true }).selectOption("category");
  const sortedRows = (await (await sortedResponse).json()).rows;
  await expect(page.locator("[data-detail-story]").first()).toHaveAttribute("data-detail-story", sortedRows[0].id);
  await expect(page.locator(".table-scroll")).toHaveAttribute("aria-busy", "false");
  const opener = page.locator("[data-detail-story]").first();
  const id = await opener.getAttribute("data-detail-story");
  await opener.click();
  await expect(page.getByLabel("Detail category")).toBeVisible();
  let releaseQuery, queryStarted;
  const held = new Promise(resolve => releaseQuery = resolve);
  const started = new Promise(resolve => queryStarted = resolve);
  await page.route("**/api/studio/workspace/query?**", async route => {
    const response = await route.fetch();
    queryStarted();
    await held;
    await route.fulfill({ response });
  });
  await page.getByLabel("Detail category").fill(movedFocus ? "ZZZZZZ later canonical sort" : "ZZZ delayed canonical sort");
  await page.getByRole("button", { name: "Save detail metadata", exact: true }).click();
  await started;
  await page.keyboard.press("Escape");
  const rowButton = page.locator(`[data-detail-story="${id}"]`);
  await expect(rowButton).toBeFocused();
  const search = page.getByRole("textbox", { name: "Search stories", exact: true });
  if (movedFocus) await search.focus();
  releaseQuery();
  await expect(page.locator("[data-detail-story]").last()).toHaveAttribute("data-detail-story", id);
  await expect(movedFocus ? search : rowButton).toBeFocused();
});

for (const viewport of [{width:883,height:695},{width:1051,height:868},{width:1280,height:720}]) test(`task hierarchy and progressive table controls remain usable at ${viewport.width}×${viewport.height}`,async({page},info)=>{
 await page.setViewportSize(viewport);await page.goto(base);await page.getByLabel("Username",{exact:true}).fill("table-founder");await page.getByLabel("Password",{exact:true}).fill(password);await page.getByRole("button",{name:"Sign in →"}).click();await expect(page.locator(".story-row").first()).toBeVisible();await showDisplay(page);
 const display=page.getByText('Display options',{exact:true});await display.click();await page.locator('.table-tools > summary').click();
 const capture=async name=>{if(process.env.STUDIO_CAPTURE_TASK_HIERARCHY){const {mkdirSync}=await import('node:fs');mkdirSync(process.env.STUDIO_CAPTURE_TASK_HIERARCHY,{recursive:true});await page.screenshot({path:`${process.env.STUDIO_CAPTURE_TASK_HIERARCHY}/${viewport.width}-${name}.png`});}};
 const noOverflow=async()=>expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBeTruthy();
 await expect(page.getByRole('heading',{level:1,name:'Story backlog',exact:true})).toBeVisible();
 await expect(page.getByText('Private workspace',{exact:false})).toHaveCount(0);await expect(page.locator('.selection-toolbar')).toHaveCount(0);
 await expect(page.getByLabel('Sort stories')).not.toBeVisible();await expect(page.getByLabel('Saved workspace view')).toBeVisible();
 await expect(page.getByRole('columnheader',{name:'Assignee',exact:true})).toHaveCount(0);await expect(page.getByRole('columnheader',{name:'Revision',exact:true})).toHaveCount(0);
 const tableBounds=await page.locator('.table-scroll').boundingBox(),openBounds=await page.locator('.story-row [data-open-story]').first().boundingBox(),titleBounds=await page.locator('.story-row [data-detail-story]').first().boundingBox();expect(openBounds.x+openBounds.width).toBeLessThanOrEqual(tableBounds.x+tableBounds.width+1);expect(titleBounds.width).toBeGreaterThanOrEqual(180);
 await noOverflow();await capture('backlog');
 const header=await page.locator('.workspace-header').boundingBox();expect(tableBounds.y-header.y-header.height).toBeLessThan(viewport.width>=1051?130:180);
 await showTools(page);
 for(const label of ['Display options','More filters','Saved views']){await page.getByText(label,{exact:true}).click();await noOverflow();await capture(label.toLowerCase().replaceAll(' ','-'));}
 await page.getByText('Columns',{exact:true}).click();await page.locator('.column-options').getByLabel('Assignee',{exact:true}).check();await page.locator('.column-options').getByLabel('Revision',{exact:true}).check();
 await expect(page.getByRole('columnheader',{name:'Assignee',exact:true})).toBeVisible();await expect(page.getByRole('columnheader',{name:'Revision',exact:true})).toBeVisible();await noOverflow();await capture('optional-columns');
 const tools=page.locator('.table-tools');for(const box of await tools.locator('input:not([type=checkbox]),select').evaluateAll(nodes=>nodes.map(n=>{const r=n.getBoundingClientRect();return {left:r.left,right:r.right,visible:r.width>0};}))){if(box.visible){expect(box.left).toBeGreaterThanOrEqual(0);expect(box.right).toBeLessThanOrEqual(viewport.width);}}
 await page.getByRole('button',{name:'Board view',exact:true}).click();await expect(page.locator('.status-board')).toBeVisible();await noOverflow();await capture('board');
 await page.getByRole('button',{name:'Select loaded rows',exact:true}).click();await expect(page.locator('.board-card input:checked')).toHaveCount(Math.min(25,await page.locator('.board-card').count()));await expect(page.locator('.selection-toolbar')).toBeVisible();await capture('board-selected');
 await page.getByLabel('Brand',{exact:true}).selectOption('brand_vedic');await expect(page.locator('.story-row')).toHaveCount(5);await page.getByRole('button',{name:'Board view',exact:true}).click();await expect(page.locator('.board-card input:checked')).toHaveCount(0);await page.getByRole('button',{name:'Select loaded rows',exact:true}).click();await expect(page.locator('.board-card input:checked')).toHaveCount(5);
 for(const [tab,title] of [['Campaign Studio','Campaign Studio'],['Brand Kit','Brand Kit'],['Jobs','Jobs'],['Operations','Operations']]){await page.getByRole('button',{name:tab,exact:true}).click();await expect(page.getByRole('heading',{level:1,name:title,exact:true})).toBeVisible();await noOverflow();await capture(tab.toLowerCase().replaceAll(' ','-'));}
 await info.attach('viewport',{body:JSON.stringify({...viewport,deviceScaleFactor:1}),contentType:'application/json'});
});

for(const viewport of[{width:883,height:695},{width:1280,height:720}])test(`task status copy stays actionable for pending empty and failed rows at ${viewport.width}×${viewport.height}`,async({page})=>{
 await page.setViewportSize(viewport);await page.request.post(base+'/api/auth/login',{data:{username:'table-founder',password}});
 const capture=async name=>{if(process.env.STUDIO_CAPTURE_TASK_HIERARCHY)await page.screenshot({path:`${process.env.STUDIO_CAPTURE_TASK_HIERARCHY}/${viewport.width}-${name}.png`});};
 let enter,release;const seen=new Promise(r=>enter=r),held=new Promise(r=>release=r);let first=true;
 const pattern='**/api/studio/workspace/query?*';await page.route(pattern,async route=>{if(!first)return route.continue();first=false;const response=await route.fetch();enter();await held;await route.fulfill({response});});
 try{await page.goto(base);await seen;await expect(page.getByText('Loading current story rows…',{exact:true})).toBeVisible();await capture('rows-pending');release();await expect(page.locator('.story-row').first()).toBeVisible();}finally{release?.();await page.unroute(pattern);}
 await page.getByLabel('Search stories',{exact:true}).fill('No match for this controlled fixture');await expect(page.getByRole('heading',{name:'No stories match these filters.',exact:true})).toBeVisible();await capture('no-match');await page.getByRole('button',{name:'Clear filters',exact:true}).click();await expect(page.locator('.story-row').first()).toBeVisible();
 await page.getByLabel('Brand',{exact:true}).selectOption(emptyBrand.id);await expect(page.getByRole('heading',{name:'No stories here yet.',exact:true})).toBeVisible();await capture('empty-brand');
 await page.getByLabel('Brand',{exact:true}).selectOption('brand_default');await expect(page.locator('.story-row').first()).toBeVisible();
 await page.route(pattern,route=>route.fulfill({status:503,contentType:'application/json',body:JSON.stringify({error:'Controlled query outage'})}));await page.getByLabel('Search stories',{exact:true}).fill('Trigger controlled outage');await expect(page.getByRole('button',{name:'Retry table',exact:true})).toBeVisible();await capture('rows-failed');await page.unroute(pattern);await page.getByRole('button',{name:'Retry table',exact:true}).click();await expect(page.getByRole('heading',{name:'No stories match these filters.',exact:true})).toBeVisible();
 await page.getByRole('button',{name:'Clear filters',exact:true}).click();await expect(page.locator('.story-row').first()).toBeVisible();await expect(page.getByRole('button',{name:'Retry table',exact:true})).toHaveCount(0);
});
