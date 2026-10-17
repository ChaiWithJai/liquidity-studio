import { test } from 'node:test';
import assert from 'node:assert/strict';
import { validateConfig, validateBudget, validateReport } from './gcp-validation.mjs';
const image = `us-east4-docker.pkg.dev/pilot-project/studio/app@sha256:${'a'.repeat(64)}`;
const config = { project: 'pilot-project', region: 'us-east4', budget: 100, bucket: 'pilot-project-assets', image };
const budget = { amount: { specifiedAmount: { currencyCode: 'USD', units: '100' } }, budgetFilter: { projects: ['projects/12345'], calendarPeriod: 'MONTH' }, thresholdRules: [{ thresholdPercent: 0.8 }] };
const now = Date.parse('2026-10-17T22:00:00Z');
const report = { project: config.project, region: config.region, image, commit: 'a'.repeat(40), generatedAt: new Date(now).toISOString(), checks: { docker: 'passed', browser: 'passed', isolation: 'passed', restore: 'passed' } };

test('target validation accepts only authorized region, budget and safe resource identifiers', () => {
  assert.equal(validateConfig(config).region, 'us-east4');
  for (const patch of [{ region: 'us-central1' }, { budget: NaN }, { budget: 101 }, { budget: 0 }, { bucket: 'x,STUDIO_STORAGE_MODE=sqlite' }, { database: 'x,INJECT=value' }, { service: '--allow-unauthenticated' }, { image: image.replace('pilot-project', 'foreign-project') }, { image: 'mutable:latest' }]) assert.throws(() => validateConfig({ ...config, ...patch }));
});

test('budget validation rejects wrong project, partial coverage, wrong periods and nonpositive/NaN amount', () => {
  assert.equal(validateBudget(budget, { projectNumber: '12345' }).amountUSD, 100);
  for (const mutate of [
    value => value.budgetFilter.projects = ['projects/99999'],
    value => delete value.budgetFilter.projects,
    value => value.budgetFilter.services = ['services/compute-only'],
    value => value.budgetFilter.labels = { team: ['one'] },
    value => value.budgetFilter.calendarPeriod = 'YEAR',
    value => value.budgetFilter.customPeriod = { startDate: {} },
    value => value.amount.specifiedAmount.units = 'NaN',
    value => value.amount.specifiedAmount.units = '0',
    value => value.amount.specifiedAmount.nanos = 1000000000,
    value => value.thresholdRules = [],
    value => value.notificationsRule = { disableDefaultIamRecipients: true }
  ]) { const invalid = structuredClone(budget); mutate(invalid); assert.throws(() => validateBudget(invalid, { projectNumber: '12345' })); }
  const defaultMonthly = structuredClone(budget); delete defaultMonthly.budgetFilter.calendarPeriod;
  assert.equal(validateBudget(defaultMonthly, { projectNumber: '12345' }).period, 'MONTH');
});

test('acceptance validation binds actual evidence to image/project/region/commit and recent checks', () => {
  const options = { ...config, commit: report.commit, now };
  assert.equal(validateReport(report, options), report);
  for (const patch of [{ checks: { docker: 'passed' } }, { project: 'foreign-project' }, { region: 'us-central1' }, { image: image.replace('a'.repeat(64), 'b'.repeat(64)) }, { commit: 'b'.repeat(40) }, { generatedAt: '2020-01-01T00:00:00Z' }, { generatedAt: 'bad-date' }, { generatedAt: '2026-10-20T00:00:00Z' }]) assert.throws(() => validateReport({ ...report, ...patch }, options));
});
