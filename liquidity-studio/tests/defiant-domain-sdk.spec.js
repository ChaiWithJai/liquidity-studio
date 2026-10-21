import {test,expect} from '@playwright/test';
import {createServer} from 'node:http';
import {createServer as createVite} from 'vite';
import {svelte} from '@sveltejs/vite-plugin-svelte';
import {readFile,mkdtemp,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {generateDefiantSyntheticDataset} from '../server/defiant-synthetic-dataset.js';
import {createDefiantUnifiedData} from '../server/defiant-unified-data.js';
import {runDefiantDomainPathway} from '../server/defiant-domain-pathways.js';
let server,vite,dir,base,requests,denyNext,datasetRevision;
test.beforeAll(async()=>{
 dir=await mkdtemp(join(tmpdir(),'defiant-domain-browser-'));requests=[];denyNext=false;
 const actor={id:'fictional-browser-reviewer'},organizationId='fictional_domain_browser';
 const service=createDefiantUnifiedData({dataset:generateDefiantSyntheticDataset(),organizationId,authorize:async current=>current===actor});
 datasetRevision=(await service.read(actor,{resource:'manifest'})).dataset.revision;
 vite=await createVite({root:fileURLToPath(new URL('..',import.meta.url)),configFile:false,cacheDir:join(dir,'vite'),plugins:[svelte()],server:{middlewareMode:true,hmr:false},appType:'custom',logLevel:'error'});
 server=createServer(async(req,res)=>{
  if(req.url==='/fixture-domain-tool'&&req.method==='POST'){
   try{
    let text='';for await(const chunk of req){text+=chunk;if(text.length>10000)throw Error('Too large');}
    const request=JSON.parse(text);requests.push(request);
    if(request.arguments?.organizationId!==organizationId)throw Error('Wrong fixture scope');
    if(denyNext&&request.name==='defiant_open_domain_review'){denyNext=false;throw Error('Deliberate fixture failure');}
    let data;
    if(request.name==='defiant_open_domain_review')data={...await runDefiantDomainPathway(service,actor,Object.fromEntries(Object.entries(request.arguments).filter(([key])=>key!=='organizationId'))),view:'domain-review'};
    else if(request.name==='defiant_read_data'&&['artists','tracks','regions'].includes(request.arguments.resource)&&request.arguments.limit===25)data=await service.read(actor,{resource:request.arguments.resource,limit:25});
    else throw Error('Unsupported fixture tool');
    res.setHeader('Content-Type','application/json');res.end(JSON.stringify({content:[],structuredContent:{...data,scope:{organizationId}}}));
   }catch{res.statusCode=503;res.end('{}');}return;
  }
  if(['/tests/fixtures/defiant-domain-parent.html','/tests/fixtures/defiant-domain-child.html'].includes(req.url)){res.setHeader('Content-Type','text/html');res.end(await vite.transformIndexHtml(req.url,await readFile(new URL('.'+req.url.replace('/tests',''),import.meta.url),'utf8')));return;}
  vite.middlewares(req,res,()=>{res.statusCode=404;res.end();});
 });
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));base=`http://127.0.0.1:${server.address().port}`;
});
test.afterAll(async()=>{server?.closeAllConnections();await new Promise(resolve=>server.close(resolve));await vite?.close();await rm(dir,{recursive:true,force:true});});
test('actual joined fictional domain results render through SDK; explicit scenario changes retain context and retry without writes',async({page})=>{
 const errors=[];page.on('pageerror',error=>errors.push(error.message));
 await page.goto(base+'/tests/fixtures/defiant-domain-parent.html');
 const app=page.frameLocator('iframe[title="Defiant domain review"]');
 await expect(page.getByLabel('Domain host initialization')).toHaveText('complete');
 await expect(app.getByRole('heading',{name:'Catalog activation review',exact:true})).toBeVisible();
 await expect(app.getByRole('main')).toHaveAttribute('aria-busy','false');
 await test.info().attach('domain-review-input-accessibility',{body:await app.getByRole('form',{name:'Review inputs',exact:true}).ariaSnapshot(),contentType:'text/plain'});
 await expect(app.getByRole('combobox',{name:'Artist',exact:true})).toBeEnabled();
 await expect(app.getByRole('combobox',{name:'Artist',exact:true})).toHaveValue('artist:fictional-1');
 await expect(app.getByRole('combobox',{name:'Recording',exact:true})).toHaveValue('track:fictional-1-1');
 await expect(app.getByRole('combobox',{name:'Region',exact:true})).toHaveValue('region:nj');
 await expect(app.getByLabel('Illustrative budgets (USD)',{exact:true})).toHaveValue('0, 500, 1000');
 await expect(app.getByLabel('Horizon (months)',{exact:true})).toHaveValue('5');
 await expect(app.getByLabel('Joined review context')).toContainText('Harbor Lantern');
 await expect(app.getByLabel('Joined review context')).toContainText('New Jersey');
 await expect(app.getByLabel('Monthly regional demand chart').locator('.chart-row')).toHaveCount(12);
 await expect(app.getByRole('heading',{name:'Linked rights & royalties'})).toBeVisible();
 await expect(app.getByRole('listitem').filter({hasText:'US: simulated-clear'})).toBeVisible();
 await expect(app.getByRole('row',{name:/Producer 1/})).toBeVisible();
 await expect(app.getByLabel('Human review pending')).toContainText('Demand and royalty records in this demo are synthetic.');
 await app.getByText('How this review was produced',{exact:true}).click();
 const production=app.getByRole('region',{name:'Review production details',exact:true});
 await expect(production).toContainText('One MCP entry call: defiant_open_domain_review orchestrates five internal domain-service operations.');
 await expect(production).toContainText('were not called separately by this request');
 await expect(production).toContainText('do not run a model or an agent job');
 const operations=production.getByRole('list',{name:'Returned domain service operations',exact:true}).getByRole('listitem');
 await expect(operations).toHaveCount(5);
 for(const [index,[operation,tool]]of [['artist-overview','defiant_artist_overview'],['regional-opportunities','defiant_detect_regional_opportunities'],['rights-and-royalties','defiant_inspect_rights_and_royalties'],['explain-opportunity','defiant_explain_opportunity'],['compare-scenarios','defiant_compare_campaign_scenarios']].entries()){
  await expect(operations.nth(index).getByText(operation,{exact:true})).toBeVisible();
  await expect(operations.nth(index).getByText(tool,{exact:true})).toBeVisible();
  await expect(operations.nth(index)).toContainText(datasetRevision);
 }
 await app.getByText('How this review was produced',{exact:true}).click();
 const initial=requests.filter(row=>row.name==='defiant_open_domain_review').length;
 await app.getByLabel('Illustrative budgets (USD)',{exact:true}).fill('0, 1000');
 expect(requests.filter(row=>row.name==='defiant_open_domain_review')).toHaveLength(initial);
 await app.getByRole('button',{name:'Compare review',exact:true}).click();
 await expect(app.getByRole('combobox',{name:'Artist',exact:true})).toBeEnabled();
 expect(requests.filter(row=>row.name==='defiant_open_domain_review').at(-1).arguments.budgets).toEqual([0,1000]);
 const scenario=app.getByRole('table',{name:/Caller-supplied budgets/});
 await expect(scenario.locator('tbody tr')).toHaveCount(2);
 await expect(scenario.locator('tbody tr').first().locator('td').nth(1)).toHaveText('0');
 denyNext=true;
 await app.getByRole('combobox',{name:'Artist',exact:true}).selectOption('artist:fictional-2');
 await app.getByRole('button',{name:'Compare review',exact:true}).click();
 await expect(app.getByRole('alert')).toContainText('Previous results are retained');
 await expect(app.getByLabel('Joined review context')).toContainText('Harbor Lantern');
 await app.getByRole('button',{name:'Retry review',exact:true}).click();
 await expect(app.getByLabel('Joined review context')).toContainText('Juniper Static');
 await expect(app.getByRole('combobox',{name:'Artist',exact:true})).toBeEnabled();
 await page.getByRole('button',{name:'Host opens another domain review',exact:true}).click();
 await expect(app.getByRole('combobox',{name:'Artist',exact:true})).toBeEnabled();
 await expect(app.getByLabel('Joined review context')).toContainText('Harbor Lantern');
 await expect(app.getByLabel('Joined review context')).toContainText('California');
 await expect(app.getByRole('combobox',{name:'Artist',exact:true})).toHaveValue('artist:fictional-1');
 await expect(app.getByRole('combobox',{name:'Region',exact:true})).toHaveValue('region:ca');
 await expect(app.getByLabel('Illustrative budgets (USD)',{exact:true})).toHaveValue('0, 250');
 await expect(app.getByLabel('Horizon (months)',{exact:true})).toHaveValue('2');
 await page.setViewportSize({width:390,height:844});
 const geometry=await app.locator('main').evaluate(element=>({width:element.getBoundingClientRect().width,viewport:innerWidth,scroll:document.documentElement.scrollWidth}));
 expect(geometry.width).toBeLessThanOrEqual(geometry.viewport);expect(geometry.scroll).toBeLessThanOrEqual(geometry.viewport);
 await app.getByLabel('Illustrative budgets (USD)',{exact:true}).focus();await page.keyboard.press('Tab');await expect(app.getByLabel('Horizon (months)',{exact:true})).toBeFocused();await page.keyboard.press('Tab');await expect(app.getByRole('button',{name:'Compare review',exact:true})).toBeFocused();
 expect(requests.every(row=>['defiant_open_domain_review','defiant_read_data'].includes(row.name)&&row.arguments.organizationId==='fictional_domain_browser')).toBe(true);
 expect(errors).toEqual([]);
});
