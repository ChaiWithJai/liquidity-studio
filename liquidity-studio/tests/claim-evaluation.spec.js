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
 dir=await mkdtemp(join(tmpdir(),'claim-evaluation-contract-'));
 vite=await createVite({root:fileURLToPath(new URL('..',import.meta.url)),configFile:false,cacheDir:join(dir,'vite'),plugins:[svelte()],server:{middlewareMode:true,hmr:false},appType:'custom',logLevel:'error'});
 server=createServer(async(req,res)=>{
  if(req.url==='/tests/fixtures/claim-evaluation-host.html'){res.setHeader('Content-Type','text/html');res.end(await vite.transformIndexHtml(req.url,await readFile(new URL('./fixtures/claim-evaluation-host.html',import.meta.url),'utf8')));return;}
  vite.middlewares(req,res,()=>{res.statusCode=404;res.end();});
 });
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));base=`http://127.0.0.1:${server.address().port}`;
});
test.afterAll(async()=>{server?.closeAllConnections();await new Promise(resolve=>server.close(resolve));await vite?.close();await rm(dir,{recursive:true,force:true});});
test('explicit evaluation preserves uncertain request and saved readback across reload',async({page})=>{
 await page.goto(base+'/tests/fixtures/claim-evaluation-host.html');await expect(page.getByLabel('Evaluation request count')).toHaveText('0');
 await page.getByRole('button',{name:'Evaluate a configured claim',exact:true}).click();await expect(page.getByLabel('Evaluation post bodies')).toHaveText('[]');await expect(page.locator('img')).toHaveCount(0);
 await page.getByRole('button',{name:'Lose next evaluation response'}).click();await page.getByRole('button',{name:'Run one hosted evaluation',exact:true}).click();await expect(page.getByRole('alert')).toContainText('outcome may be uncertain');
 const first=JSON.parse(await page.getByLabel('Evaluation post bodies').textContent())[0];await page.getByRole('button',{name:'Recover the same evaluation attempt',exact:true}).click();await expect(page.getByRole('article',{name:'Saved evaluation'})).toContainText('fixture-no-provider');expect(JSON.parse(await page.getByLabel('Evaluation post bodies').textContent())).toEqual([first,first]);
 await page.reload();await page.getByRole('button',{name:'Evaluate a configured claim',exact:true}).click();await page.getByRole('button',{name:/Reopen invented-control/}).click();await expect(page.getByRole('article',{name:'Saved evaluation'})).toContainText('Invented contract response');await expect(page.getByLabel('Evaluation post bodies')).toHaveText('[]');
 await page.setViewportSize({width:390,height:844});expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);await page.getByRole('button',{name:'Evaluate a configured claim',exact:true}).focus();await page.keyboard.press('Tab');await expect(page.getByRole('button',{name:'Refresh evaluation cases and saved results'})).toBeFocused();expect(await page.getByRole('button',{name:'Refresh evaluation cases and saved results'}).evaluate(el=>getComputedStyle(el).outlineStyle)).not.toBe('none');
});
test('authority remount rejects a delayed prior-account result and missing credential disables run',async({page})=>{
 await page.goto(base+'/tests/fixtures/claim-evaluation-host.html');await page.getByRole('button',{name:'Evaluate a configured claim',exact:true}).click();await page.getByRole('button',{name:'Hold next evaluation response'}).click();await page.getByRole('button',{name:'Run one hosted evaluation',exact:true}).click();await expect(page.getByRole('button',{name:'Release evaluation response'})).toBeEnabled();
 await page.getByRole('button',{name:'Switch account and organization'}).click();await page.getByRole('button',{name:'Release evaluation response'}).click();await expect(page.getByRole('article',{name:'Saved evaluation'})).toHaveCount(0);await expect(page.getByText('old-account-private-case',{exact:false})).toHaveCount(0);
 await page.getByRole('button',{name:'Remove fixture credential'}).click();await page.getByRole('button',{name:'Evaluate a configured claim',exact:true}).click();await expect(page.getByText('Evaluation credentials are unavailable. No provider request will be sent.')).toBeVisible();await expect(page.getByRole('button',{name:'Run one hosted evaluation',exact:true})).toBeDisabled();
});

test('saved historical provenance reopens without a new evaluation',async({page})=>{
 await page.goto(base+'/tests/fixtures/claim-evaluation-host.html');await page.getByRole('button',{name:'Load invented historical saved result'}).click();
 await page.getByRole('button',{name:'Evaluate a configured claim',exact:true}).click();await page.getByRole('button',{name:/Reopen invented-history/}).click();
 const history=page.getByRole('region',{name:'Historical evidence provenance'});await expect(history).toContainText('not the current snapshot');await expect(history).toContainText('12–42');await expect(history).toContainText('e'.repeat(64));await expect(history).toContainText('coverage-fixture');await expect(history).toContainText('comparison-fixture');await expect(history).toContainText('runtime does not recompute');await expect(history).toContainText('no expected semantic label');
 await expect(page.getByLabel('Evaluation post bodies')).toHaveText('[]');await page.reload();await page.getByRole('button',{name:'Evaluate a configured claim',exact:true}).click();await page.getByRole('button',{name:/Reopen invented-history/}).click();await expect(history).toContainText('12–42');await expect(page.getByLabel('Evaluation post bodies')).toHaveText('[]');
 await page.setViewportSize({width:390,height:844});expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});
