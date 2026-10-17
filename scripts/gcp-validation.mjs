// Pure checks: these functions never authenticate, invoke gcloud or create resources.
const requireMatch = (value, expression, name) => {
  if (typeof value !== 'string' || !expression.test(value)) throw new Error(`Invalid ${name}`);
  return value;
};

export function validateConfig({ project, region = 'us-east4', budget = 100, service = 'liquidity-studio', database = 'liquidity-studio-pilot', bucket, image } = {}) {
  requireMatch(project, /^[a-z][a-z0-9-]{4,28}[a-z0-9]$/, 'PILOT_PROJECT');
  if (region !== 'us-east4') throw new Error('Only the authorized us-east4 region may be deployed');
  const authorizedBudget = Number(budget);
  if (!Number.isFinite(authorizedBudget) || authorizedBudget <= 0 || authorizedBudget > 100) throw new Error('Authorized monthly budget must be positive and at most USD100');
  requireMatch(service, /^[a-z][a-z0-9-]{0,48}$/, 'PILOT_SERVICE');
  requireMatch(database, /^(?:\(default\)|[a-z][a-z0-9-]{2,61}[a-z0-9])$/, 'PILOT_DATABASE');
  requireMatch(bucket, /^(?=.{3,63}$)[a-z0-9][a-z0-9._-]*[a-z0-9]$/, 'PILOT_ASSET_BUCKET');
  if (bucket.includes('..')) throw new Error('Invalid PILOT_ASSET_BUCKET');
  if (image !== undefined) {
    const prefix = `${region}-docker.pkg.dev/${project}/`;
    if (typeof image !== 'string' || !image.startsWith(prefix) || !/^[a-z0-9][a-z0-9._/-]*@sha256:[a-f0-9]{64}$/.test(image.slice(prefix.length)) || image.includes('/../') || image.includes('//')) throw new Error('Image must be an immutable digest in the approved project and regional Artifact Registry');
  }
  return { project, region, budget: authorizedBudget, service, database, bucket, ...(image ? { image } : {}) };
}

export function validateBudget(accountBudget, { projectNumber, budget = 100 } = {}) {
  requireMatch(String(projectNumber), /^\d+$/, 'verified project number');
  if (!Number.isFinite(Number(budget)) || Number(budget) <= 0 || Number(budget) > 100) throw new Error('Invalid authorized budget envelope');
  const amount = accountBudget?.amount?.specifiedAmount;
  const units = String(amount?.units ?? '0');
  const nanos = amount?.nanos ?? 0;
  if (!amount || amount.currencyCode !== 'USD' || !/^\d+$/.test(units) || !Number.isInteger(nanos) || nanos < 0 || nanos > 999999999) throw new Error('Budget must specify a positive finite USD amount');
  const value = Number(units) + nanos / 1e9;
  if (!Number.isFinite(value) || value <= 0 || value > Number(budget)) throw new Error('Verified budget amount exceeds the authorized envelope or is not positive');
  const filter = accountBudget.budgetFilter;
  if (!filter || filter.projects?.length !== 1 || filter.projects[0] !== `projects/${projectNumber}` || filter.customPeriod || (filter.calendarPeriod && filter.calendarPeriod !== 'MONTH')) throw new Error('Budget must cover exactly the verified project on a monthly recurring period');
  if (['services', 'resourceAncestors', 'subaccounts'].some(field => filter[field]?.length) || Object.keys(filter.labels || {}).length) throw new Error('Aggregate budget must cover all project services without narrower filters');
  if (!accountBudget.thresholdRules?.some(rule => Number.isFinite(rule.thresholdPercent) && rule.thresholdPercent > 0 && rule.thresholdPercent <= 1 && (!rule.spendBasis || rule.spendBasis === 'CURRENT_SPEND'))) throw new Error('Budget must include a current-spend alert at or below its limit');
  const notifications = accountBudget.notificationsRule || {};
  if (notifications.disableDefaultIamRecipients && !notifications.monitoringNotificationChannels?.length && !notifications.pubsubTopic) throw new Error('Budget alerts require an enabled delivery destination');
  return { amountUSD: value, projectNumber: String(projectNumber), period: 'MONTH', enforcement: 'alerts_only_not_a_hard_cap' };
}

export function validateReport(report, { project, region = 'us-east4', image, commit, now = Date.now(), maxAgeMs = 24 * 60 * 60 * 1000 } = {}) {
  if (!report || !['docker', 'browser', 'isolation', 'restore'].every(check => report.checks?.[check] === 'passed')) throw new Error('Acceptance report requires passing Docker/browser/isolation/restore evidence');
  requireMatch(report.commit, /^[a-f0-9]{40}$/, 'tested commit');
  if (commit !== undefined && report.commit !== commit) throw new Error('Acceptance report tested a different source commit');
  if (report.project !== project || report.region !== region || report.image !== image || typeof image !== 'string') throw new Error('Acceptance report must match this exact project, region and immutable image');
  const generatedAt = Date.parse(report.generatedAt);
  if (!Number.isFinite(generatedAt) || generatedAt > now + 300000 || now - generatedAt > maxAgeMs) throw new Error('Acceptance evidence must have a recent valid timestamp');
  return report;
}

export const validateAcceptanceReport = validateReport;
