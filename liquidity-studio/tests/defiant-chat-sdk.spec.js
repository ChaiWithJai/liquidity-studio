import {test,expect} from '@playwright/test';
import {createServer} from 'node:http';
import {createServer as createVite} from 'vite';
import {svelte} from '@sveltejs/vite-plugin-svelte';
import {readFile,mkdtemp,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {fileURLToPath} from 'node:url';
let server,vite,dir,base;
test.beforeAll(async()=>{
 dir=await mkdtemp(join(tmpdir(),'defiant-sdk-browser-'));
 vite=await createVite({root:fileURLToPath(new URL('..',import.meta.url)),configFile:false,cacheDir:join(dir,'vite'),plugins:[svelte()],server:{middlewareMode:true,hmr:false},appType:'custom',logLevel:'error'});
 server=createServer(async(req,res)=>{
  if(['/tests/fixtures/defiant-sdk-parent.html','/tests/fixtures/defiant-sdk-child.html'].includes(req.url)){res.setHeader('Content-Type','text/html');res.end(await vite.transformIndexHtml(req.url,await readFile(new URL('.'+req.url.replace('/tests',''),import.meta.url),'utf8')));return;}
  vite.middlewares(req,res,()=>{res.statusCode=404;res.end();});
 });
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));base=`http://127.0.0.1:${server.address().port}`;
});
test.afterAll(async()=>{server?.closeAllConnections();await new Promise(resolve=>server.close(resolve));await vite?.close();await rm(dir,{recursive:true,force:true});});
test('actual SDK postMessage handshake delivers initial view and bound read-only selection to Svelte',async({page})=>{
 const errors=[];page.on('pageerror',error=>errors.push(error.message));
 await page.goto(base+'/tests/fixtures/defiant-sdk-parent.html');
 const app=page.frameLocator('iframe[title="Defiant SDK research"]');
 await expect(app.getByRole('heading',{name:'Catalog to campaign',exact:true})).toBeVisible();
 await expect(app.getByLabel('Artist',{exact:true})).toBeEnabled();
 await expect(page.getByLabel('Host tool calls')).toHaveText('4');
 await app.getByLabel('Artist',{exact:true}).selectOption('artist-a');
 await expect(app.getByLabel('Recording',{exact:true})).toBeEnabled();
 await app.getByLabel('Recording',{exact:true}).selectOption('track-a');
 await expect(app.getByRole('heading',{name:'Fictional SDK Recording',exact:true})).toBeVisible();
 await expect(app.getByLabel('Source evidence',{exact:true})).toBeEnabled();
 await app.getByLabel('Source evidence',{exact:true}).selectOption('source-a');
 await expect(app.getByRole('link',{name:'Open source: Fictional SDK Source ↗'})).toHaveAttribute('href','https://example.org/fictional');
 await expect(app.getByRole('complementary',{name:'Next research step'})).toContainText('a saved working moment');
 await expect(app.getByText('Synthetic demonstration',{exact:true})).toBeVisible();
 expect(errors).toEqual([]);
});
