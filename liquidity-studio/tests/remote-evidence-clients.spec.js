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
 dir=await mkdtemp(join(tmpdir(),'remote-client-contract-'));
 vite=await createVite({root:fileURLToPath(new URL('..',import.meta.url)),configFile:false,cacheDir:join(dir,'vite'),plugins:[svelte()],server:{middlewareMode:true,hmr:false},appType:'custom',logLevel:'error'});
 server=createServer(async(req,res)=>{
  if(req.url==='/tests/fixtures/remote-evidence-host.html'){res.setHeader('Content-Type','text/html');res.end(await vite.transformIndexHtml(req.url,await readFile(new URL('./fixtures/remote-evidence-host.html',import.meta.url),'utf8')));return;}
  vite.middlewares(req,res,()=>{res.statusCode=404;res.end();});
 });
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));base=`http://127.0.0.1:${server.address().port}`;
});
test.afterAll(async()=>{server?.closeAllConnections();await new Promise(resolve=>server.close(resolve));await vite?.close();await rm(dir,{recursive:true,force:true});});
test('remote consent is explicit, scoped, escaped and completes only after approval or denial',async({page})=>{
 await page.goto(base+'/tests/fixtures/remote-evidence-host.html');const panel=page.getByRole('region',{name:'Remote evidence client consent'}),log=page.getByLabel('Request log');await expect(log).toHaveText('[]');await expect(panel.getByRole('button',{name:'Approve read-only connection'})).toHaveCount(0);
 await panel.getByRole('button',{name:'Inspect remote request'}).click();await expect(panel).toContainText('fixture@example.invalid');await expect(panel).toContainText('invented_org');await expect(panel).toContainText('https://studio.chaiwithjai.com/mcp/defiant-evidence');await expect(panel).toContainText('evidence:read · Read only');await expect(panel).toContainText('8 hours');await expect(panel.locator('img')).toHaveCount(0);await expect(log).not.toContainText('approve');
 await panel.getByRole('button',{name:'Approve read-only connection'}).focus();await page.keyboard.press('Enter');await expect(page.getByLabel('Completion')).toHaveText('/oauth/defiant-evidence/complete?transaction='+'a'.repeat(43));await expect(panel.getByRole('button',{name:'Approve read-only connection'})).toHaveCount(0);
 await page.reload();await panel.getByRole('button',{name:'Inspect remote request'}).click();await panel.getByRole('button',{name:'Deny connection',exact:true}).click();await expect(log).toContainText('deny');await expect(page.getByLabel('Completion')).not.toBeEmpty();
 await panel.getByRole('button',{name:'Refresh my remote connections'}).click();await panel.getByRole('button',{name:'Revoke <img src=x onerror=alert(1)>',exact:true}).click();await expect(panel.getByRole('status')).toContainText('revoked');await expect(panel).toContainText('No active remote connections');
 await page.setViewportSize({width:390,height:844});expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);await expect(panel).not.toContainText('c'.repeat(43));
});
test('mismatched context, expiry, hostile redirect and stale account responses cannot approve or navigate',async({page})=>{
 for(const mode of ['wrong-org','wrong-user','wrong-resource','expired']){await page.goto(base+'/tests/fixtures/remote-evidence-host.html');await page.getByLabel('Fixture response').selectOption(mode);await page.getByRole('button',{name:'Inspect remote request'}).click();await expect(page.getByRole('alert')).toBeVisible();await expect(page.getByRole('button',{name:'Approve read-only connection'})).toHaveCount(0);}
 await page.goto(base+'/tests/fixtures/remote-evidence-host.html');await page.getByLabel('Fixture response').selectOption('redirect');await page.getByRole('button',{name:'Inspect remote request'}).click();await page.getByRole('button',{name:'Approve read-only connection'}).click();await expect(page.getByRole('alert')).toBeVisible();await expect(page.getByLabel('Completion')).toBeEmpty();
 for(const button of ['Switch fixture account','Switch fixture organization']){await page.goto(base+'/tests/fixtures/remote-evidence-host.html');await page.getByLabel('Fixture response').selectOption('late');await page.getByRole('button',{name:'Inspect remote request'}).click();await page.getByRole('button',{name:button}).click();await page.waitForTimeout(1200);await expect(page.getByRole('button',{name:'Approve read-only connection'})).toHaveCount(0);await expect(page.getByLabel('Request log')).not.toContainText('approve');}
});

test('late successful approval cannot complete after account or organization switch',async({page})=>{
 for(const button of ['Switch fixture account','Switch fixture organization']){
  await page.goto(base+'/tests/fixtures/remote-evidence-host.html');await page.getByRole('button',{name:'Inspect remote request'}).click();await page.getByLabel('Fixture response').selectOption('late-approve');await page.getByRole('button',{name:'Approve read-only connection'}).click();await expect(page.getByLabel('Request log')).toContainText('approve');await page.getByRole('button',{name:button}).click();await page.waitForTimeout(1200);await expect(page.getByLabel('Completion')).toBeEmpty();await expect(page.getByRole('button',{name:'Approve read-only connection'})).toHaveCount(0);
 }
});
