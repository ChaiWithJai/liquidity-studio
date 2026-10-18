import { test, expect } from "@playwright/test";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { randomBytes, randomUUID } from "node:crypto";
import { createHttpServer } from "../server/index.js";
import { createPlatform } from "../server/platform.js";
import { DurableStore } from "../server/storage.js";
let server, platform, directory, base;
const password = randomBytes(20).toString("base64url");
const scope = "?organizationId=org_default&brandId=brand_default";
test.beforeAll(async () => {
  directory = mkdtempSync(join(tmpdir(), "studio-browser-"));
  process.env.STUDIO_FOUNDER_PASSWORD = password;
  process.env.STUDIO_MARKETER_PASSWORD = password;
  process.env.AI_ALLOW_SYNTHETIC = "true";
  platform = createPlatform({authMode: "password",
    store: new DurableStore(join(directory, "studio.sqlite")),
  });
  await platform.ready;
  server = createHttpServer(null, { platform });
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  base = `http://127.0.0.1:${server.address().port}`;
});
test.afterAll(async () => {
  server?.closeAllConnections();
  await new Promise((resolve) => server?.close(resolve));
  platform?.store.close();
  if (directory) rmSync(directory, { recursive: true, force: true });
});
async function signIn(page, name = "founder") {
  await page.goto(base);
  await page.getByLabel("Username", { exact: true }).fill(name);
  await page.getByLabel("Password", { exact: true }).fill(password);
  await page.getByRole("button", { name: "Sign in →" }).click();
  await expect(
    page.getByRole("heading", { name: "Good stories, next up." }),
  ).toBeVisible();
}
for(const role of ['founder','marketer']) test(`${role} source, edit, preview, handoff and unfinished return`,async({page},info)=>{
 await page.setViewportSize({width:1280,height:720});await signIn(page,role);
 const title=`Workflow69 ${role}`;
 const added=await page.request.post(base+'/api/studio/backlog'+scope,{data:{title,category:'Workflow test',scheduledDay:'Monday',sourceClaims:[{id:'workflow-source',text:'The source describes a signed media agreement.',sourceUrl:'https://example.org/source',status:'unreviewed',kind:'general'}]}});expect(added.status()).toBe(201);await page.reload();
 await page.getByLabel('Search stories',{exact:true}).fill(title);await expect(page.locator('.story-row')).toHaveCount(1);await page.getByRole('button',{name:'Open story ↗',exact:true}).click();
 const task=page.getByRole('region',{name:'Current editorial task'});
 await expect(task).toContainText('No draft yet');await expect(page.getByRole('button',{name:'Generate draft',exact:true})).toBeDisabled();
 await task.getByRole('button',{name:'Review sources',exact:true}).click();await expect(page.locator('#workflow-sources')).toBeFocused();await page.getByLabel('Review status',{exact:true}).selectOption('approved');await expect(task).toContainText('Unsaved source review');
 await page.getByRole('button',{name:'Save source review',exact:true}).click();await expect(task).toContainText('Source prerequisites saved');await page.getByRole('button',{name:'Generate four-format draft',exact:true}).click();await expect(page.getByLabel('Headline',{exact:true})).toBeVisible();
 await page.getByRole('button',{name:'Reel 30s script'}).click();for(const label of ['Time range','Voiceover','On-screen text','B-roll direction'])await expect(page.getByLabel(`Beat 1 ${label}`,{exact:true})).toBeVisible();await expect(page.locator('.field-editor')).not.toContainText('onScreenText');await expect(page.locator('.field-editor')).not.toContainText('bRollDirection');
 const field=page.getByLabel('Beat 1 On-screen text',{exact:true});await field.fill('Unfinished operator wording');await task.getByRole('button',{name:'Preview & validation',exact:true}).click();await expect(page.locator('#workflow-preview')).toBeFocused();await expect(task).toContainText('Unsaved artwork changes');await expect(page.getByRole('button',{name:'Measure again',exact:true})).toBeDisabled();await task.getByRole('button',{name:'Validation results',exact:true}).click();await expect(page.getByRole('region',{name:'Measured validation results'})).toBeFocused();
 await task.getByRole('button',{name:'Edit wording',exact:true}).click();await expect(page.locator('#workflow-editor')).toBeFocused();await expect(field).toHaveValue('Unfinished operator wording');await task.getByRole('button',{name:'Save artwork changes',exact:true}).click();await expect(task).toContainText('Artwork saved');
 await task.getByRole('button',{name:'Export handoff',exact:true}).click();await expect(page.locator('#workflow-handoff')).toBeFocused();await page.getByRole('button',{name:'Export script ↗',exact:true}).click();const link=page.locator('a[download]');await expect(link).toBeVisible();const download=page.waitForEvent('download');await link.click();expect((await download).suggestedFilename()).toMatch(/\.txt$/);
 await task.getByRole('button',{name:'Plan in calendar',exact:true}).click();
 await page.getByRole('button',{name:`Move ${title}, Whole campaign`,exact:true}).click();await page.getByLabel('Destination date',{exact:true}).fill('2026-10-17');await page.getByRole('button',{name:'Save dated placement',exact:true}).click();await expect(page.getByRole('region',{name:'Plans for 2026-10-17'})).toContainText(title);
 await page.getByRole('button',{name:'Campaign Studio',exact:true}).click();
 await field.fill('Return unfinished wording');await task.getByRole('button',{name:'Plan in calendar',exact:true}).click();await expect(page.getByRole('region',{name:'Dated content calendar'})).toBeVisible();await page.getByRole('button',{name:'Campaign Studio',exact:true}).click();await expect(field).toHaveValue('Return unfinished wording');await expect(task).toContainText('Unsaved artwork changes');
 await task.getByRole('button',{name:'Return to backlog',exact:true}).click();await expect(page.getByLabel('Search stories',{exact:true})).toHaveValue(title);await page.getByRole('button',{name:'Campaign Studio',exact:true}).click();await expect(field).toHaveValue('Return unfinished wording');
 await page.setViewportSize({width:390,height:844});await expect(task).toBeVisible();expect(await task.evaluate(e=>getComputedStyle(e).position)).toBe('static');expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 await info.attach('workflow-limits',{body:JSON.stringify({role,limits:'Controlled synthetic source-review and real HTTP edit/export/return journey; no human fatigue, live provider, external editor, helper or unattended certification.'}),contentType:'application/json'});
});
