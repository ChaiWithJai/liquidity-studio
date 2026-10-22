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
 dir=await mkdtemp(join(tmpdir(),'local-client-contract-'));
 vite=await createVite({root:fileURLToPath(new URL('..',import.meta.url)),configFile:false,cacheDir:join(dir,'vite'),plugins:[svelte()],server:{middlewareMode:true,hmr:false},appType:'custom',logLevel:'error'});
 server=createServer(async(req,res)=>{
  if(req.url==='/tests/fixtures/local-evidence-host.html'){res.setHeader('Content-Type','text/html');res.end(await vite.transformIndexHtml(req.url,await readFile(new URL('./fixtures/local-evidence-host.html',import.meta.url),'utf8')));return;}
  vite.middlewares(req,res,()=>{res.statusCode=404;res.end();});
 });
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));base=`http://127.0.0.1:${server.address().port}`;
});
test.afterAll(async()=>{server?.closeAllConnections();await new Promise(resolve=>server.close(resolve));await vite?.close();await rm(dir,{recursive:true,force:true});});
test('explicit inspection precedes approval; own grants revoke without credentials',async({page})=>{
 await page.goto(base+'/tests/fixtures/local-evidence-host.html');await page.getByText('Local evidence clients',{exact:true}).click();
 const panel=page.getByRole('region',{name:'Local evidence client access'}),log=page.getByLabel('Request log');await expect(log).toHaveText('[]');
 await panel.getByLabel('Pairing code').fill('a'.repeat(32));await expect(panel.getByRole('button',{name:'Approve read-only client'})).toHaveCount(0);
 await panel.getByRole('button',{name:'Inspect client',exact:true}).click();await expect(panel.getByRole('heading',{name:'<img src=x onerror=alert(1)>',exact:true})).toBeVisible();await expect(panel.locator('img')).toHaveCount(0);await expect(panel).toContainText('evidence:read · Read only');await expect(log).not.toContainText('approve');
 await panel.getByLabel('Pairing code').fill('c'.repeat(32));await expect(panel.getByRole('button',{name:'Approve read-only client'})).toHaveCount(0);
 await panel.getByRole('button',{name:'Inspect client',exact:true}).click();await panel.getByRole('button',{name:'Approve read-only client',exact:true}).focus();await page.keyboard.press('Enter');await expect(panel.getByRole('status')).toContainText('Client approved');await expect(log).toContainText('"operation":"approve"');
 await panel.getByRole('button',{name:'Refresh my clients'}).click();await panel.getByRole('button',{name:'Revoke <img src=x onerror=alert(1)>',exact:true}).click();await expect(panel.getByRole('status')).toContainText('revoked');await expect(panel).toContainText('No active clients');
 await page.setViewportSize({width:768,height:800});expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 expect(await log.textContent()).not.toMatch(/token|verifier|Bearer/);
});
test('wrong scope, expired pairing and late old-org responses cannot enable approval',async({page})=>{
 await page.goto(base+'/tests/fixtures/local-evidence-host.html');
 for(const mode of ['wrong','expired']){
  await page.getByLabel('Fixture response').selectOption(mode);await page.getByText('Local evidence clients',{exact:true}).click();
  const panel=page.getByRole('region',{name:'Local evidence client access'});await panel.getByLabel('Pairing code').fill('a'.repeat(32));await panel.getByRole('button',{name:'Inspect client',exact:true}).click();await expect(panel.getByRole('alert')).toBeVisible();await expect(panel.getByRole('button',{name:'Approve read-only client'})).toHaveCount(0);
  await page.getByText('Local evidence clients',{exact:true}).click();
 }
 await page.getByLabel('Fixture response').selectOption('late');await page.getByText('Local evidence clients',{exact:true}).click();await page.getByLabel('Pairing code').fill('a'.repeat(32));await page.getByRole('button',{name:'Inspect client',exact:true}).click();await page.getByRole('button',{name:'Switch fixture organization'}).click();await page.getByText('Local evidence clients',{exact:true}).click();await expect(page.getByRole('region',{name:'Local evidence client access'})).toContainText('other_org');await page.waitForTimeout(1200);await expect(page.getByRole('button',{name:'Approve read-only client'})).toHaveCount(0);await expect(page.getByLabel('Request log')).not.toContainText('approve');
});
