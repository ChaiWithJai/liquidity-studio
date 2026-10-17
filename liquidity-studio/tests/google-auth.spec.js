import { test, expect } from '@playwright/test';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createHttpServer } from '../server/index.js';
import { createPlatform } from '../server/platform.js';
import { DurableStore } from '../server/storage.js';

const emulatorHost = process.env.FIREBASE_AUTH_EMULATOR_HOST;
let server, platform, directory, base;
const founderEmail = 'founder@auth-emulator.example';
const marketerEmail = 'marketer@auth-emulator.example';
test.beforeAll(async () => {
  directory = mkdtempSync(join(tmpdir(), 'studio-google-browser-'));
  process.env.AI_ALLOW_SYNTHETIC = 'true';
  if (emulatorHost) {
    if (!/^(127\.0\.0\.1|localhost):\d+$/.test(emulatorHost)) throw new Error('Test requires loopback Auth Emulator');
    const reset = await fetch(`http://${emulatorHost}/emulator/v1/projects/demo-liquidity-auth/accounts`, {method:'DELETE'});
    if (!reset.ok) throw new Error('Could not reset isolated demo Auth Emulator accounts');
    process.env.STUDIO_AUTH_MODE = 'google';
    process.env.STUDIO_AUTH_EMULATOR_ENABLED = 'true';
    process.env.STUDIO_GOOGLE_FOUNDER_EMAIL = founderEmail;
    process.env.STUDIO_GOOGLE_MARKETER_EMAIL = marketerEmail;
    process.env.STUDIO_FIREBASE_PROJECT_ID = 'demo-liquidity-auth';
    process.env.STUDIO_FIREBASE_API_KEY = 'local-emulator-key';
    process.env.STUDIO_FIREBASE_AUTH_DOMAIN = 'demo-liquidity-auth.firebaseapp.com';
    process.env.STUDIO_FIREBASE_APP_ID = 'local-emulator-app';
  }
  platform = createPlatform({store:new DurableStore(join(directory,'studio.sqlite')),authMode:emulatorHost ? 'google' : 'password'});
  await platform.ready;
  server = createHttpServer(null,{platform});
  await new Promise(resolve => server.listen(0,'127.0.0.1',resolve));
  base = `http://127.0.0.1:${server.address().port}`;
});
test.afterAll(async () => {
  server?.closeAllConnections();
  await new Promise(resolve => server?.close(resolve));
  platform?.store.close();
  if (directory) rmSync(directory,{recursive:true,force:true});
});

test('auth config failures never expose password fallback', async ({page}) => {
  await page.route('**/api/auth/config', route => route.fulfill({status:503,json:{error:'Unavailable'}}));
  await page.goto(base);
  await expect(page.getByRole('alert')).toContainText('Could not load sign-in configuration');
  await expect(page.getByLabel('Password',{exact:true})).toHaveCount(0);
  await expect(page.getByRole('button',{name:'Continue with Google'})).toHaveCount(0);
});

test('invalid Google config fails closed without password fallback', async ({page}) => {
  await page.route('**/api/auth/config', route => route.fulfill({json:{mode:'google',firebase:{}}}));
  await page.goto(base);
  await expect(page.getByRole('alert')).toContainText('Google sign-in is not configured');
  await expect(page.getByLabel('Password',{exact:true})).toHaveCount(0);
});

test('real Auth Emulator Google popup verifies backend access, persistence, export, roles and signout', async ({page}) => {
  test.skip(!emulatorHost, 'Requires explicit local Firebase Auth Emulator; no production-token forgery.');
  let bearer;
  page.on('request', request => {
    if (request.url().startsWith(base + '/api/')) bearer = request.headers().authorization || bearer;
  });
  const loginAs = async (email) => {
    const popupPromise = page.waitForEvent('popup');
    await page.getByRole('button',{name:'Continue with Google'}).click();
    const popup = await popupPromise;
    await popup.getByRole('button',{name:'Add new account'}).click();
    await popup.getByLabel('Email').fill(email);
    await popup.getByRole('button',{name:'Sign in with Google.com'}).click();
  };
  await page.goto(base);
  await expect(page.getByRole('button',{name:'Continue with Google'})).toBeVisible();
  await expect(page.getByLabel('Password',{exact:true})).toHaveCount(0);
  const canceledPopupPromise = page.waitForEvent('popup');
  await page.getByRole('button',{name:'Continue with Google'}).click();
  const canceledPopup = await canceledPopupPromise;
  await expect(canceledPopup.getByRole('button',{name:'Add new account'})).toBeVisible();
  await canceledPopup.close();
  await expect(page.getByRole('alert')).toContainText('Google sign-in was closed', {timeout:15000});
  await expect(page.getByRole('button',{name:'Continue with Google'})).toBeEnabled();
  await loginAs(founderEmail);
  await expect(page.getByRole('button',{name:'Operations',exact:true})).toBeVisible();
  await page.reload();
  await expect(page.getByRole('button',{name:'Operations',exact:true})).toBeVisible();
  expect(bearer).toMatch(/^Bearer /);
  const scope = '?organizationId=org_default&brandId=brand_default';
  const headers = {Authorization:bearer};
  const created = await page.request.post(base + '/api/studio/backlog' + scope, {headers,data:{title:'Google authenticated export fixture',sourceClaims:[{id:'google-source',text:'The source describes a signed media agreement.',sourceUrl:'https://example.org/source',kind:'general',status:'approved'}]}});
  expect(created.status()).toBe(201);
  const {story} = await created.json();
  expect((await page.request.post(base + '/api/studio/generate-campaign' + scope,{headers,data:{storyId:story.id}})).status()).toBe(200);
  await page.reload();
  await page.locator('.story-row').filter({hasText:'Google authenticated export fixture'}).getByRole('button',{name:'Open draft'}).click();
  await page.getByRole('button',{name:'Export PNG',exact:false}).click();
  const downloadPromise = page.waitForEvent('download');
  await page.locator('.download a').click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toMatch(/\.png$/);
  expect(await download.failure()).toBeNull();
  await page.getByRole('button',{name:'Sign out',exact:true}).click();
  await expect(page.getByRole('button',{name:'Continue with Google'})).toBeVisible();
  await page.reload();
  await expect(page.getByRole('button',{name:'Continue with Google'})).toBeVisible();
  expect((await page.request.get(base+'/api/auth/session')).status()).toBe(401);
  await loginAs(marketerEmail);
  await expect(page.getByRole('button',{name:'Story backlog',exact:true})).toBeVisible();
  await expect(page.getByRole('button',{name:'Operations',exact:true})).toHaveCount(0);
  expect((await page.request.get(base+'/api/admin/overview'+scope,{headers:{Authorization:bearer}})).status()).toBe(403);
  await page.getByRole('button',{name:'Sign out',exact:true}).click();
  await loginAs('outsider@auth-emulator.example');
  await expect(page.getByRole('alert')).toContainText('Google sign-in could not open this workspace');
  await expect(page.getByRole('button',{name:'Story backlog',exact:true})).toHaveCount(0);
  await expect(page.getByRole('button',{name:'Continue with Google'})).toBeVisible();
});
