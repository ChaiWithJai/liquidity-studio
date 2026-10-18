// Original capture harness. Run only against an explicit disposable baseline checkout.
import {resolve,join} from 'node:path';import{pathToFileURL}from'node:url';
import {randomBytes} from 'node:crypto';import{mkdirSync}from'node:fs';
if(!process.argv[2]||!process.argv[3])throw Error('Usage: node capture-baseline.mjs CHECKOUT OUTPUT_DIRECTORY');
const checkout=resolve(process.argv[2]),output=resolve(process.argv[3]),app=join(checkout,'liquidity-studio');
const {chromium}=await import(pathToFileURL(join(app,'node_modules/playwright-core/index.mjs')));
const {DurableStore}=await import(pathToFileURL(join(app,'server/storage.js')));
const {createPlatform}=await import(pathToFileURL(join(app,'server/platform.js')));
const {createHttpServer}=await import(pathToFileURL(join(app,'server/index.js')));
const store=new DurableStore(':memory:'),platform=createPlatform({store,authMode:'password'});await platform.ready;const password=randomBytes(20).toString('hex');await platform.identity.provision({username:'layout-review',role:'founder',password});const server=createHttpServer(null,{platform});await new Promise(r=>server.listen(0,'127.0.0.1',r));const base=`http://127.0.0.1:${server.address().port}`,browser=await chromium.launch({headless:true});mkdirSync(output,{recursive:true});
try{for(const width of[883,1280]){const context=await browser.newContext({viewport:{width,height:width===883?695:720}}),page=await context.newPage();await page.request.post(base+'/api/auth/login',{data:{username:'layout-review',password}});await page.goto(base);await page.locator('.story-row').first().waitFor();await page.screenshot({path:join(output,`${width}-backlog.png`)});await page.getByText('Saved views',{exact:true}).click();await page.screenshot({path:join(output,`${width}-saved-views.png`)});await context.close();}}finally{await browser.close();server.closeAllConnections();await new Promise(r=>server.close(r));store.close();}
