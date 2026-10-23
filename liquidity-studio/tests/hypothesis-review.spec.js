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
 dir=await mkdtemp(join(tmpdir(),'hypothesis-contract-'));
 vite=await createVite({root:fileURLToPath(new URL('..',import.meta.url)),configFile:false,cacheDir:join(dir,'vite'),plugins:[svelte()],server:{middlewareMode:true,hmr:false},appType:'custom',logLevel:'error'});
 server=createServer(async(req,res)=>{
  if(req.url==='/tests/fixtures/hypothesis-host.html'){res.setHeader('Content-Type','text/html');res.end(await vite.transformIndexHtml(req.url,await readFile(new URL('./fixtures/hypothesis-host.html',import.meta.url),'utf8')));return;}
  vite.middlewares(req,res,()=>{res.statusCode=404;res.end();});
 });
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));base=`http://127.0.0.1:${server.address().port}`;
});
test.afterAll(async()=>{server?.closeAllConnections();await new Promise(resolve=>server.close(resolve));await vite?.close();await rm(dir,{recursive:true,force:true});});
async function fillRegistration(page,mode='analysis-expectation'){
 await page.getByRole('button',{name:'Register and review an expectation'}).click();
 await page.getByLabel('Expectation type').selectOption(mode);
 await page.getByLabel('Analysis question',{exact:true}).fill('What amount? <img src=x onerror=alert(1)>');
 await page.getByLabel('Expectation',{exact:true}).fill('At least ten reported dollars.');
 await page.getByLabel('Already known or inspected evidence').fill('I inspected this baseline already.');
 await page.getByLabel('Baseline month (YYYY-MM)').fill('2025-06');
 await page.getByLabel('Frozen target month (YYYY-MM)').fill(mode==='analysis-expectation'?'2025-06':'2026-11');
 await page.getByLabel('Exact decimal threshold').fill('10');
}
test('registration reload keeps frozen baseline across later revision and linked correction',async({page})=>{
 await page.goto(base+'/tests/fixtures/hypothesis-host.html');await expect(page.getByLabel('Hypothesis requests')).toHaveText('0');await fillRegistration(page);
 await page.getByRole('button',{name:'Register expectation',exact:true}).click();await expect(page.getByRole('heading',{name:'Saved registration'})).toBeVisible();
 const payload=JSON.parse(await page.getByLabel('Last hypothesis request').textContent()).body;expect(payload).not.toHaveProperty('answer');expect(payload.target).toEqual({month:'2025-06',currency:'USD',metric:'source-total-earned'});
 await page.reload();await page.getByRole('button',{name:'Register and review an expectation'}).click();await page.getByRole('button',{name:'Refresh registered expectations'}).click();await page.getByRole('button',{name:/What amount/}).click();
 await page.getByRole('button',{name:'Change evidence revision'}).click();const saved=page.getByRole('article',{name:'Saved registration'});await expect(saved).toContainText('Baseline revision '+ 'a'.repeat(64));await expect(saved.locator('img')).toHaveCount(0);
 await page.getByRole('button',{name:'Link selected result'}).click();const link=JSON.parse(await page.getByLabel('Last hypothesis request').textContent()).body;expect(link.reference).toEqual({revision:'c'.repeat(64)});await expect(saved).toContainText('Criterion result: criterion-met');await expect(saved).toContainText('reused-known-evidence');await expect(saved).toContainText('Revision changed: true');
 await page.getByLabel('One result correction').fill('Known evidence is not a blind prediction.');await page.getByRole('button',{name:'Save attributed correction'}).click();await page.reload();await page.getByRole('button',{name:'Register and review an expectation'}).click();await page.getByRole('button',{name:'Refresh registered expectations'}).click();await page.getByRole('button',{name:/What amount/}).click();await expect(saved).toContainText('Known evidence is not a blind prediction.');await expect(saved).toContainText('Criterion: gte 10 USD');
 await page.setViewportSize({width:390,height:844});expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});
test('future mode shows unavailable and retrospective answer link retains meaning',async({page})=>{
 await page.goto(base+'/tests/fixtures/hypothesis-host.html');await fillRegistration(page,'future-period-outcome');await expect(page.getByText(/Business evaluation remains unavailable/)).toBeVisible();await page.getByRole('button',{name:'Register expectation',exact:true}).click();await page.getByRole('button',{name:'Link selected result'}).click();await expect(page.getByLabel('Linked result')).toContainText('period-not-elapsed');await expect(page.getByLabel('Linked result')).toContainText('absence is not zero');
 await page.getByLabel('Expectation type').selectOption('analysis-expectation');await page.getByLabel('Frozen target month (YYYY-MM)').fill('2025-06');await page.getByRole('button',{name:'Register expectation',exact:true}).click();await page.getByLabel('Result type').selectOption('answer-assertion');await page.getByLabel('Saved observation ID').fill('e'.repeat(64));await page.getByLabel('Assertion index (0–4)').selectOption('1');await page.getByRole('button',{name:'Link selected result'}).click();const body=JSON.parse(await page.getByLabel('Last hypothesis request').textContent()).body;expect(body.reference).toEqual({observationId:'e'.repeat(64),assertionIndex:1});await expect(page.getByLabel('Linked result')).toContainText('answer-assertion-evidence');await expect(page.getByLabel('Linked result')).toContainText('retrospective-observation; not-prospective');await expect(page.getByLabel('Linked answer assertion checks')).toContainText('Declared answer value: 0 USD');await expect(page.getByLabel('Linked answer assertion checks')).toContainText('Recorded answer amount check: mismatch');await expect(page.getByLabel('Linked result')).toContainText('Criterion result: criterion-met');
});
test('account remount discards late registration response',async({page})=>{
 await page.goto(base+'/tests/fixtures/hypothesis-host.html');await fillRegistration(page);await page.getByRole('button',{name:'Hold next registration'}).click();await page.getByRole('button',{name:'Register expectation',exact:true}).click();await expect(page.getByRole('button',{name:'Release held registration'})).toBeEnabled();await page.getByRole('button',{name:'Switch fixture account'}).click();await page.getByRole('button',{name:'Release held registration'}).click();await expect(page.getByRole('heading',{name:'Saved registration'})).toHaveCount(0);await page.getByRole('button',{name:'Register and review an expectation'}).click();await expect(page.getByLabel('Analysis question',{exact:true})).toHaveValue('');await expect(page.getByRole('heading',{name:'Saved registration'})).toHaveCount(0);
});

test('uncertain registration retry preserves exact payload across revision change',async({page})=>{
 await page.goto(base+'/tests/fixtures/hypothesis-host.html');await fillRegistration(page);await page.getByRole('button',{name:'Timeout next registration response'}).click();await page.getByRole('button',{name:'Register expectation',exact:true}).click();await expect(page.getByRole('alert')).toContainText('save outcome may be uncertain');const before=JSON.parse(await page.getByLabel('Last hypothesis request').textContent());
 await page.getByRole('button',{name:'Change evidence revision'}).click();await expect(page.getByText(/Pending registration retry retains baseline revision/)).toContainText('a'.repeat(64));await page.getByRole('button',{name:'Register expectation',exact:true}).click();const after=JSON.parse(await page.getByLabel('Last hypothesis request').textContent());expect(after).toEqual(before);await expect(page.getByRole('article',{name:'Saved registration'})).toContainText('Baseline revision '+ 'a'.repeat(64));
 await page.getByRole('button',{name:'Register and review an expectation'}).focus();await page.keyboard.press('Tab');await expect(page.getByLabel('Expectation type')).toBeFocused();expect(await page.getByLabel('Expectation type').evaluate(el=>getComputedStyle(el).outlineStyle)).not.toBe('none');
});
