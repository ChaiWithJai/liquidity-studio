import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import { execFileSync } from 'node:child_process';

execFileSync(process.execPath, ['scripts/build-dist.js']);
const source = fs.readFileSync('dist/app.js', 'utf8').replace(/bootstrap\(\);\s*$/, '');
const calls = [];
let storedDraft = { infographic: { headline: 'Original' } };
const stories = () => [{ id: 'saved', scheduledDay: 'Monday', campaignDraft: structuredClone(storedDraft) }, { id: 'fresh', scheduledDay: 'Tuesday', campaignDraft: null }];
const context = vm.createContext({ window: {}, setTimeout() {}, fetch: async (url, options) => {
  calls.push(url);
  let result = {};
  if (url === '/api/studio/bootstrap') result = { brandProfile: {}, backlog: stories(), calendar: [] };
  if (url === '/api/studio/save-edit') storedDraft.infographic = JSON.parse(options.body).content;
  if (url === '/api/studio/generate-campaign') result = { story: stories()[1], campaign: { infographic: { headline: 'Generated' } }, backlog: stories() };
  return { json: async () => result };
} });
vm.runInContext(source + '\nrender = () => {};', context);
const read = expression => vm.runInContext(expression, context);
await read('bootstrap()');
assert.equal(read('state.campaign.infographic.headline'), 'Original');
assert.equal(read('state.selectedScheduleDay'), 'Monday');
await context.window.saveInlineEdit('infographic', 'headline', 'Edited');
context.window.goHome();
context.window.openStoryInStudio('saved');
assert.equal(read('state.campaign.infographic.headline'), 'Edited');
assert.equal(calls.filter(url => url.includes('generate-campaign')).length, 0);
context.window.setScheduleDay('Friday');
context.window.openStoryInStudio('saved');
assert.equal(read('state.selectedScheduleDay'), 'Monday');
await read('bootstrap()'); // Reload fetches the edited draft from the server.
assert.equal(read('state.campaign.infographic.headline'), 'Edited');
await context.window.openStoryInStudio('fresh');
assert.equal(read('state.selectedScheduleDay'), 'Tuesday');
assert.equal(calls.filter(url => url.includes('generate-campaign')).length, 1);
await context.window.generateCampaign('fresh');
assert.equal(calls.filter(url => url.includes('generate-campaign')).length, 2);
console.log('Navigation regression passed: saved edits, reload, weekday, first generation and explicit regeneration.');
