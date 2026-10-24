// Authored UI fixture only; backend actual HTTP and SDK contracts are separate.
import {test,expect} from '@playwright/test';
import {createServer} from 'node:http';
import {createServer as createVite} from 'vite';
import {svelte} from '@sveltejs/vite-plugin-svelte';
import {readFile,mkdtemp,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {fileURLToPath} from 'node:url';
let vite,server,base,dir;
test.beforeAll(async()=>{
 dir=await mkdtemp(join(tmpdir(),'source-handoff-contract-'));
 vite=await createVite({root:fileURLToPath(new URL('..',import.meta.url)),configFile:false,cacheDir:join(dir,'vite'),plugins:[svelte()],server:{middlewareMode:true,hmr:false},appType:'custom',logLevel:'error'});
 server=createServer(async(req,res)=>{
  if(new URL(req.url,'http://fixture.invalid').pathname==='/tests/fixtures/source-handoff-host.html'){res.setHeader('Content-Type','text/html');res.end(await vite.transformIndexHtml(req.url,await readFile(new URL('./fixtures/source-handoff-host.html',import.meta.url),'utf8')));return;}
  vite.middlewares(req,res,()=>{res.statusCode=404;res.end();});
 });
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));base=`http://127.0.0.1:${server.address().port}`;
});
test.afterAll(async()=>{server?.closeAllConnections();await new Promise(resolve=>server.close(resolve));await vite?.close();await rm(dir,{recursive:true,force:true});});

const fixture='/tests/fixtures/source-handoff-host.html';
test('semantic source opens original financial and worksheet cells and returns to the same saved page without a provider POST',async({page})=>{
 await page.setViewportSize({width:390,height:844});await page.goto(base+fixture);
 const financial=page.getByRole('listitem').filter({has:page.getByRole('heading',{name:'Financial source',exact:true})});await financial.getByRole('button',{name:'Inspect exact source hash'}).click();
 await expect(page.getByRole('heading',{name:'Evidence for this exact source'})).toBeVisible();await page.getByRole('button',{name:'Open original cells',exact:true}).click();
 await expect(page.getByRole('heading',{name:'Original source cells',exact:true})).toBeVisible();await expect(page.locator('mark').filter({hasText:'2.00'}).first()).toBeVisible();await page.getByRole('button',{name:'Next page',exact:true}).click();await expect(page.getByRole('navigation',{name:'Evidence pages'})).toContainText('26–26 of 26');await page.reload();await expect(page.getByRole('heading',{name:'Original source cells',exact:true})).toBeVisible();expect(new URL(page.url()).searchParams.get('evidenceOffset')).toBe('25');
 await page.getByRole('button',{name:'Back to source references',exact:true}).click();await expect(page.getByRole('heading',{name:'Evidence for this exact source'})).toBeVisible();await page.getByRole('button',{name:'Back to retained search',exact:true}).click();
 await expect(page.getByRole('navigation',{name:'Semantic result pages'})).toContainText('26–27 of 27');expect(new URL(page.url()).searchParams.get('retainedSessionOffset')).toBe('25');expect(new URL(page.url()).searchParams.get('evidenceOffset')).toBe('50');
 const sheet=page.getByRole('listitem').filter({has:page.getByRole('heading',{name:'Worksheet source',exact:true})});await sheet.getByRole('button',{name:'Inspect exact source hash'}).click();await page.getByRole('button',{name:'Open original cells',exact:true}).click();await expect(page.getByRole('heading',{name:'Original worksheet cells',exact:true})).toBeVisible();await expect(page.locator('mark').filter({hasText:'Invented original worksheet cell'})).toBeVisible();
 await page.reload();await expect(page.getByRole('heading',{name:'Original worksheet cells',exact:true})).toBeVisible();await page.getByRole('button',{name:'Back to retained search',exact:true}).click();await expect(page.getByRole('navigation',{name:'Semantic result pages'})).toContainText('26–27 of 27');await expect(page.getByLabel('Provider posts')).toHaveText('0');
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);await page.keyboard.press('Tab');await expect(page.locator(':focus')).toBeVisible();
 await page.getByRole('button',{name:'Switch organization',exact:true}).click();await expect(page.getByRole('heading',{name:'Original worksheet cells',exact:true})).toHaveCount(0);await expect(page.getByRole('navigation',{name:'Source return trail'})).toHaveCount(0);
});
