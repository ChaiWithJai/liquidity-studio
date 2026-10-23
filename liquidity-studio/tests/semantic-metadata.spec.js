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
 dir=await mkdtemp(join(tmpdir(),'semantic-metadata-contract-'));
 vite=await createVite({root:fileURLToPath(new URL('..',import.meta.url)),configFile:false,cacheDir:join(dir,'vite'),plugins:[svelte()],server:{middlewareMode:true,hmr:false},appType:'custom',logLevel:'error'});
 server=createServer(async(req,res)=>{
  if(new URL(req.url,'http://fixture.invalid').pathname==='/tests/fixtures/semantic-metadata-host.html'){res.setHeader('Content-Type','text/html');res.end(await vite.transformIndexHtml(req.url,await readFile(new URL('./fixtures/semantic-metadata-host.html',import.meta.url),'utf8')));return;}
  vite.middlewares(req,res,()=>{res.statusCode=404;res.end();});
 });
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));base=`http://127.0.0.1:${server.address().port}`;
});
test.afterAll(async()=>{server?.closeAllConnections();await new Promise(resolve=>server.close(resolve));await vite?.close();await rm(dir,{recursive:true,force:true});});

test('semantic submit is explicit, paging/reload reuse session, exact filters and safe source navigation',async({page})=>{
 await page.goto(base+'/tests/fixtures/semantic-metadata-host.html');const panel=page.getByRole('region',{name:'Semantic metadata suggestions'});await expect(page.getByLabel('Post count')).toHaveText('0');await panel.getByLabel('Metadata question').fill('Authored natural query');await expect(page.getByLabel('Post count')).toHaveText('0');await panel.getByRole('button',{name:'Run one semantic search'}).click();await expect(panel).toContainText('1–25 of 26');await expect(panel).toContainText('periodPresence: undated');await expect(panel.locator('img')).toHaveCount(0);expect(page.url()).not.toContain('Authored');await panel.getByRole('button',{name:'Next suggestions'}).click();await expect(panel).toContainText('26–26 of 26');await page.reload();await expect(panel).toContainText('26–26 of 26');await expect(page.getByLabel('Post count')).toHaveText('1');await panel.getByRole('button',{name:'Inspect exact source hash'}).click();await expect(page.getByLabel('Selected source')).toHaveText('c'.repeat(64));await page.setViewportSize({width:390,height:844});expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);await panel.getByLabel('Metadata question').focus();await page.keyboard.press('Tab');await expect(panel.getByRole('button',{name:'Inspect exact source hash'})).toBeFocused();
});
test('uncertain unchanged retry keeps key; switched scope drops a late response; absent config cannot submit',async({page})=>{
 await page.goto(base+'/tests/fixtures/semantic-metadata-host.html');const panel=page.getByRole('region',{name:'Semantic metadata suggestions'});await panel.getByLabel('Metadata question').fill('Authored query');await page.getByRole('button',{name:'One uncertain response'}).click();await panel.getByRole('button',{name:'Run one semantic search'}).click();await expect(panel.getByRole('alert')).toContainText('uncertain');const first=await page.getByLabel('Request keys').textContent();await panel.getByRole('button',{name:'Run one semantic search'}).click();await expect(page.getByLabel('Request keys')).toHaveText(first+','+first);await panel.getByRole('button',{name:'Close suggestions'}).click();await panel.getByLabel('Metadata question').fill('Another query');await page.getByRole('button',{name:'Hold response'}).click();await panel.getByRole('button',{name:'Run one semantic search'}).click();await expect(page.getByLabel('Waiting')).toHaveText('true');await page.getByRole('button',{name:'Switch account scope'}).click();await page.getByRole('button',{name:'Release response'}).click();await expect(panel.getByRole('list')).toHaveCount(0);await page.getByRole('button',{name:'Disable configuration'}).click();await expect(panel).toContainText('not configured');await expect(panel.getByRole('button',{name:'Run one semantic search'})).toHaveCount(0);
});
