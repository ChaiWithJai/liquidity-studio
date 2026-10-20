import {test,expect} from '@playwright/test';
import {mkdtempSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {createDevelopmentServer} from '../scripts/local-development-support.mjs';

// Hosted only: a disposable local profile, never the operator's current launcher.
let runtime,home,before;
test.beforeAll(async()=>{
  before={...process.env};
  for(const key of ['K_SERVICE','K_REVISION','CLOUD_RUN_JOB','FUNCTION_TARGET','GAE_ENV','AWS_LAMBDA_FUNCTION_NAME'])delete process.env[key];
  process.env.NODE_ENV='test';
  home=mkdtempSync(join(tmpdir(),'studio-entry-browser-'));
  runtime=await createDevelopmentServer({profile:'development',port:0,home});
});
test.afterAll(async()=>{
  await runtime?.close();
  for(const key of Object.keys(process.env))if(!(key in before))delete process.env[key];
  Object.assign(process.env,before);
  if(home)rmSync(home,{recursive:true,force:true});
});
test('local persona entry retains current workflow through an ordinary persona continuation',async({page})=>{
  await page.setViewportSize({width:1051,height:868});
  const workflow='/?org=org_default&brand=brand_default&tab=backlog';
  await page.goto(runtime.origin+workflow);
  await expect(page.getByRole('heading',{name:'Choose a local persona',exact:true})).toBeVisible();
  await expect(page.getByText('development · local emulation',{exact:true})).toBeVisible();
  await expect(page.getByRole('link',{name:'Open Studio',exact:true})).toHaveAttribute('href',workflow);
  await page.getByRole('button',{name:'Founder · current grants (initially both brands)',exact:true}).click();
  await expect(page.getByRole('heading',{level:1,name:'Story backlog',exact:true})).toBeVisible();
  await page.getByRole('button',{name:'Brand Kit',exact:true}).click();
  await expect(page.getByRole('heading',{level:1,name:'Brand Kit',exact:true})).toBeVisible();
  const current=new URL(page.url());
  const returnTo=current.pathname+current.search;
  await page.getByRole('link',{name:'Switch persona',exact:true}).click();
  await expect(page.getByRole('heading',{name:'Choose a local persona',exact:true})).toBeVisible();
  expect(new URL(page.url()).searchParams.get('returnTo')).toBe(returnTo);
  await expect(page.getByRole('link',{name:'Open Studio',exact:true})).toHaveAttribute('href',returnTo);
  await page.getByRole('button',{name:'Founder · current grants (initially both brands)',exact:true}).click();
  await expect(page.getByRole('heading',{level:1,name:'Brand Kit',exact:true})).toBeVisible();
  expect(new URL(page.url()).pathname+new URL(page.url()).search).toBe(returnTo);
  await expect(page.getByRole('complementary',{name:'Local emulation environment',exact:true})).toContainText('LOCAL DEVELOPMENT EMULATION');
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});
