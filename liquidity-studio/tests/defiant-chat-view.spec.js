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
 dir=await mkdtemp(join(tmpdir(),'defiant-chat-contract-'));
 vite=await createVite({root:fileURLToPath(new URL('..',import.meta.url)),configFile:false,cacheDir:join(dir,'vite'),plugins:[svelte()],server:{middlewareMode:true,hmr:false},appType:'custom',logLevel:'error'});
 server=createServer(async(req,res)=>{
  if(req.url==='/tests/fixtures/defiant-chat-host.html'){res.setHeader('Content-Type','text/html');res.end(await vite.transformIndexHtml(req.url,await readFile(new URL('./fixtures/defiant-chat-host.html',import.meta.url),'utf8')));return;}
  vite.middlewares(req,res,()=>{res.statusCode=404;res.end();});
 });
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));base=`http://127.0.0.1:${server.address().port}`;
});
test.afterAll(async()=>{server?.closeAllConnections();await new Promise(resolve=>server.close(resolve));await vite?.close();await rm(dir,{recursive:true,force:true});});
test('read-only chat selection retains truthful evidence and missing-workspace state with keyboard and compact layout',async({page})=>{
 const mutations=[];page.on('request',request=>{if(!['GET','HEAD'].includes(request.method()))mutations.push(request.url());});
 await page.goto(base+'/tests/fixtures/defiant-chat-host.html');
 await expect(page.getByText('Synthetic demonstration',{exact:true})).toBeVisible();
 await expect(page.getByRole('heading',{name:'Start with a supplied reference'})).toBeVisible();
 await expect(page.getByLabel('Artist',{exact:true}).getByRole('option')).toHaveCount(26);
 await page.getByLabel('Artist',{exact:true}).selectOption('artist-a');
 await page.getByLabel('Recording',{exact:true}).selectOption('track-a');
 await page.getByLabel('Source evidence',{exact:true}).selectOption('source-a');
 await expect(page.getByLabel('Selection callback')).toHaveText('{"artistId":"artist-a","trackId":"track-a","sourceId":"source-a"}');
 await expect(page.getByRole('heading',{name:'Fictional Recording',exact:true})).toBeVisible();
 await expect(page.getByRole('link',{name:'Open source: Fictional Source ↗'})).toHaveAttribute('href','https://example.org/fictional');
 await expect(page.getByRole('complementary',{name:'Next research step'})).toContainText('a saved working moment');
 await expect(page.getByText('Rights and availability are unknown.',{exact:true})).toBeVisible();
 await page.getByLabel('Source evidence',{exact:true}).focus();await page.keyboard.press('Tab');await expect(page.getByLabel('Illustrative opportunity',{exact:true})).toBeFocused();
 for(const width of [900,380]){
  await page.setViewportSize({width,height:800});
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  await expect(page.getByRole('heading',{name:'Fictional Recording',exact:true})).toBeVisible();
 }
 await page.getByText('Evidence limits and dataset snapshot',{exact:true}).click();
 await expect(page.getByText('Demand history and royalty ledger are not supplied by this dataset.',{exact:true})).toBeVisible();
 await page.getByRole('button',{name:'Toggle fixture loading'}).click();
 await expect(page.getByRole('status').filter({hasText:'Loading research…'})).toHaveText('Loading research…');
 await expect(page.getByLabel('Recording',{exact:true})).toBeDisabled();
 await page.getByRole('button',{name:'Toggle fixture loading'}).click();
 await page.getByRole('button',{name:'Show fixture error'}).click();
 await expect(page.getByRole('alert')).toContainText('prior context retained');
 await expect(page.getByRole('heading',{name:'Fictional Recording',exact:true})).toBeVisible();
 await page.getByRole('button',{name:'Retry research'}).click();await expect(page.getByRole('alert')).toHaveCount(0);
 await page.getByRole('button',{name:'Show fixture empty'}).click();await expect(page.getByRole('heading',{name:'No research is open'})).toBeVisible();
 expect(mutations).toEqual([]);
});
