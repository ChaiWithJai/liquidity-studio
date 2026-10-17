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
  // The official emulator loads optional Material cosmetics from a third-party CDN.
  // A stalled parser-blocking script leaves visible controls without handlers.
  // Auth itself remains the real local emulator; no identity/API responses are mocked.
  await page.context().route('https://unpkg.com/material-components-web@10/**', route => route.abort());
  await page.context().route('https://fonts.googleapis.com/**', route => route.abort());
  let bearer;
  page.on('request', request => {
    if (request.url().startsWith(base + '/api/')) bearer = request.headers().authorization || bearer;
  });
  const loginAs = async (email) => {
    const popupPromise = page.waitForEvent('popup');
    await page.getByRole('button',{name:'Continue with Google'}).click();
    const popup = await popupPromise;
    await popup.waitForLoadState('domcontentloaded');
    await expect(popup.locator('#title')).toContainText('Sign-in with Google.com');
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
  await canceledPopup.waitForLoadState('domcontentloaded');
  await expect(canceledPopup.locator('#title')).toContainText('Sign-in with Google.com');
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

test('pending Google popup restores explicit retry after 90 seconds without authenticating', async ({page}) => {
  test.skip(!emulatorHost, 'Requires explicit local Firebase Auth Emulator; no production-token forgery.');
  await page.context().route('https://unpkg.com/material-components-web@10/**', route => route.abort());
  await page.context().route('https://fonts.googleapis.com/**', route => route.abort());
  // The clock changes elapsed waiting only; SDK identity and backend verification stay real.
  // https://playwright.dev/docs/clock#test-inactivity-monitoring
  await page.clock.install();
  await page.goto(base);
  const continueButton = page.getByRole('button',{name:'Continue with Google',exact:true});
  await expect(continueButton).toBeEnabled();
  const pendingPopupPromise = page.waitForEvent('popup');
  await continueButton.click();
  const pendingPopup = await pendingPopupPromise;
  await pendingPopup.waitForLoadState('domcontentloaded');
  await expect(pendingPopup.locator('#title')).toContainText('Sign-in with Google.com');
  await expect(page.getByRole('button',{name:'Signing in…',exact:true})).toBeDisabled();
  await page.clock.fastForward(90001);
  await expect(page.getByRole('alert')).toContainText('Google sign-in has not completed. Finish the Google popup or try again.');
  await expect(continueButton).toBeEnabled();
  await expect(page.getByRole('button',{name:'Story backlog',exact:true})).toHaveCount(0);
  expect((await page.request.get(base+'/api/auth/session')).status()).toBe(401);
  expect(page.context().pages()).toHaveLength(2); // No automatic replacement popup.

  const retryPopupPromise = page.waitForEvent('popup');
  await continueButton.click();
  const retryPopup = await retryPopupPromise;
  await retryPopup.waitForLoadState('domcontentloaded');
  await expect(retryPopup.locator('#title')).toContainText('Sign-in with Google.com');
  // The SDK rejects/closes its older popup. That stale catch/finally must not
  // clear the newer attempt's pending state or replace its message.
  await expect.poll(() => pendingPopup.isClosed()).toBe(true);
  await expect(page.getByRole('button',{name:'Signing in…',exact:true})).toBeDisabled();
  await expect(page.getByRole('alert')).toHaveCount(0);
  await retryPopup.getByRole('button',{name:'Add new account'}).click();
  await retryPopup.getByLabel('Email').fill(founderEmail);
  await retryPopup.getByRole('button',{name:'Sign in with Google.com'}).click();
  await expect(page.getByRole('button',{name:'Operations',exact:true})).toBeVisible();
  // A completed observer invalidates the waiting timer; no stale timeout returns.
  await page.clock.fastForward(90001);
  await expect(page.getByRole('button',{name:'Operations',exact:true})).toBeVisible();
  await expect(page.getByRole('alert')).toHaveCount(0);
  await page.getByRole('button',{name:'Sign out',exact:true}).click();
  await expect(continueButton).toBeEnabled();
});
