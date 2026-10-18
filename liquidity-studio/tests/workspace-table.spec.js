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
async function signIn(page) {
  await page.goto(base);
  await page.getByLabel("Username", { exact: true }).fill("table-founder");
  await page.getByLabel("Password", { exact: true }).fill(password);
  await page.getByRole("button", { name: "Sign in →" }).click();
  await expect(page.locator(".story-row")).toHaveCount(5);
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
  await expect(page.getByText("0 selected · active brand only")).toBeVisible();
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
  await page.getByLabel("Sort direction").selectOption("desc");
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
 await page.getByLabel('Rows per page').selectOption('50');
 const row=page.locator('.story-row').first();await expect(row).toBeVisible();const id=await row.getAttribute('data-story-id'),revision=Number(await row.getAttribute('data-story-revision'));
 await row.locator('[data-detail-story]').click();await page.getByLabel('Detail category').fill('Unsaved local detail');
 const response=await page.request.post(`${base}/api/studio/workspace/mutations?organizationId=org_default&brandId=brand_default`,{data:{idempotencyKey:crypto.randomUUID(),changes:[{kind:'story.patch',storyId:id,expectedRevision:revision,patch:{title:'Externally saved detail title',category:'Newer external category'}}]}});expect(response.ok()).toBeTruthy();
 await page.getByLabel('Sort direction').selectOption('desc');await expect(page.getByRole('dialog').getByRole('alert')).toContainText('original revision');await expect(page.getByLabel('Detail category')).toHaveValue('Unsaved local detail');
 await page.getByRole('button',{name:'Save detail metadata'}).click();await expect(page.getByRole('status',{name:'Operation results'})).toContainText('conflict');
 const current=await (await page.request.get(`${base}/api/studio/workspace/stories/${id}?organizationId=org_default&brandId=brand_default`)).json();expect(current.story.category).toBe('Newer external category');expect(current.story.title).toBe('Externally saved detail title');await expect(page.getByLabel('Detail category')).toHaveValue('Unsaved local detail');
 await page.getByRole('button',{name:'Discard detail edits and reload'}).click();await expect(page.getByLabel('Detail category')).toHaveValue('Newer external category');await page.keyboard.press('Escape');
 const target=page.locator(`[data-story-id="${id}"]`);await target.getByRole('button',{name:/Edit Category/}).click();await target.getByRole('textbox').fill('Unsaved inline category');
 const latest=Number(await target.getAttribute('data-story-revision'));await page.request.post(`${base}/api/studio/workspace/mutations?organizationId=org_default&brandId=brand_default`,{data:{idempotencyKey:crypto.randomUUID(),changes:[{kind:'story.patch',storyId:id,expectedRevision:latest,patch:{category:'Newest inline conflict category'}}]}});
 await page.getByLabel('Sort direction').selectOption('asc');await target.getByRole('button',{name:'Save cell',exact:true}).click();await expect(page.getByRole('status',{name:'Operation results'})).toContainText('conflict');await expect(target).toContainText('Newest inline conflict category');
});
