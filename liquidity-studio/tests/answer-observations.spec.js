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
 dir=await mkdtemp(join(tmpdir(),'answer-observation-contract-'));
 vite=await createVite({root:fileURLToPath(new URL('..',import.meta.url)),configFile:false,cacheDir:join(dir,'vite'),plugins:[svelte()],server:{middlewareMode:true,hmr:false},appType:'custom',logLevel:'error'});
 server=createServer(async(req,res)=>{
  if(req.url==='/tests/fixtures/answer-observations-host.html'){res.setHeader('Content-Type','text/html');res.end(await vite.transformIndexHtml(req.url,await readFile(new URL('./fixtures/answer-observations-host.html',import.meta.url),'utf8')));return;}
  vite.middlewares(req,res,()=>{res.statusCode=404;res.end();});
 });
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));base=`http://127.0.0.1:${server.address().port}`;
});
test.afterAll(async()=>{server?.closeAllConnections();await new Promise(resolve=>server.close(resolve));await vite?.close();await rm(dir,{recursive:true,force:true});});
test('explicit answer readback and correction preserve original text and uncertainty',async({page})=>{
 await page.goto(base+'/tests/fixtures/answer-observations-host.html');await expect(page.getByLabel('Observation requests')).toHaveText('0');await page.getByRole('button',{name:'Record and inspect an observed answer'}).click();
 await page.getByLabel('Question',{exact:true}).fill('What was reported?');await page.getByLabel('Observed answer',{exact:true}).fill('Reported 0 USD. <img src=x onerror=alert(1)>');await page.getByRole('combobox',{name:/^Source/}).selectOption('earnings');await page.getByLabel('Sales month (YYYY-MM)').fill('2025-06');await page.getByLabel('Exact signed decimal').fill('0');await page.getByLabel('Exact quote from answer').fill('0');await page.getByRole('button',{name:'Add assertion'}).click();await page.getByRole('button',{name:'Remove assertion 2'}).click();await page.getByRole('button',{name:'Check and save observed answer'}).click();await expect(page.getByRole('heading',{name:'Saved observation'})).toBeVisible();await expect(page.locator('article')).toContainText('Semantic support: unknown');await expect(page.locator('article img')).toHaveCount(0);
 await page.getByLabel('One attributed correction').fill('Do not infer final settlement.');await page.getByRole('button',{name:'Save reviewer correction'}).click();await expect(page.locator('article')).toContainText('Do not infer final settlement.');await expect(page.locator('article pre')).toHaveText('Reported 0 USD. <img src=x onerror=alert(1)>');
 await page.getByRole('button',{name:'Refresh saved observations'}).click();await page.getByRole('button',{name:/What was reported/}).click();await expect(page.locator('article')).toContainText('Submitted reviewer correction');await page.setViewportSize({width:390,height:844});expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 await page.getByRole('button',{name:'Switch fixture context'}).click();await expect(page.getByRole('heading',{name:'Saved observation'})).toHaveCount(0);
});
