import { spawnSync } from 'node:child_process';
import { validateConfig, validateBudget } from './gcp-validation.mjs';

const mode = process.argv[2] || 'plan';
const project = process.env.PILOT_PROJECT;
const region = process.env.PILOT_REGION || 'us-east4';
const budget = Number(process.env.PILOT_MONTHLY_BUDGET || 100);
const organization = process.env.PILOT_ORGANIZATION_ID || '313384662705';
const service = process.env.PILOT_SERVICE || 'liquidity-studio';
const database = process.env.PILOT_DATABASE || 'liquidity-studio-pilot';
const bucket = process.env.PILOT_ASSET_BUCKET || (project && `${project}-liquidity-assets`);
const registry = 'liquidity-studio';
const runtimeId = 'liquidity-runtime';
const runtime = `${runtimeId}@${project}.iam.gserviceaccount.com`;
const member = `serviceAccount:${runtime}`;
const roleDefinitions = [
  { id: 'liquidityAuthReader', permissions: ['firebaseauth.users.get'] },
  { id: 'liquidityVertexPredictor', permissions: ['aiplatform.endpoints.predict', 'serviceusage.services.use'] },
  { id: 'liquidityArtifactAccess', permissions: ['storage.buckets.get', 'storage.objects.create', 'storage.objects.delete', 'storage.objects.get'] }
];
const users = [process.env.PILOT_FOUNDER_EMAIL, process.env.PILOT_MARKETER_EMAIL];
const legacyPasswords = process.env.PILOT_AUTH_MODE === 'legacy-password-iap';
const secrets = legacyPasswords ? [
  { id: 'liquidity-founder-password', variable: 'PILOT_FOUNDER_PASSWORD' },
  { id: 'liquidity-marketer-password', variable: 'PILOT_MARKETER_PASSWORD' }
] : [];
const apis = ['run.googleapis.com', 'firestore.googleapis.com', 'storage.googleapis.com', 'secretmanager.googleapis.com', 'artifactregistry.googleapis.com', 'iap.googleapis.com', 'aiplatform.googleapis.com', 'iam.googleapis.com', 'cloudscheduler.googleapis.com', 'identitytoolkit.googleapis.com', 'firebase.googleapis.com'];
const requireMatch = (value, pattern, name) => { if (typeof value !== 'string' || !pattern.test(value)) throw new Error(`Set a valid ${name}`); return value; };
const globalFlags = [`--project=${project}`, '--quiet', '--verbosity=error'];

function cli(args, { input, execute = mode !== 'plan' } = {}) {
  if (!execute) { console.log(JSON.stringify({ executable: 'gcloud', args, ...(input !== undefined ? { stdin: 'redacted secret input' } : {}) })); return; }
  const env = { ...process.env, CLOUDSDK_CORE_DISABLE_PROMPTS: '1', CLOUDSDK_CORE_LOG_HTTP: 'false', CLOUDSDK_CORE_VERBOSITY: 'error' };
  for (const key of Object.keys(env)) if (/^(PILOT|STUDIO)_.*PASSWORD$/.test(key) || ['GEMINI_API_KEY', 'GOOGLE_API_KEY', 'AI_GATEWAY_KEY'].includes(key)) delete env[key];
  const result = spawnSync('gcloud', args, { encoding: 'utf8', timeout: 120000, env, input, stdio: ['pipe', 'pipe', 'pipe'], maxBuffer: 4 * 1024 * 1024 });
  // Neither CLI diagnostics nor stdin content are echoed: secret tools can echo input.
  if (result.error || result.status !== 0) throw new Error(`gcloud ${args[0]} ${args[1]} failed; verify authentication, billing and permissions before retrying`);
  return result.stdout;
}
function json(args) {
  let parsed;
  try { parsed = JSON.parse(cli([...args, '--format=json'])); } catch (error) { if (error.message.startsWith('gcloud ')) throw error; throw new Error('Cloud inventory did not return valid JSON'); }
  return parsed;
}
function list(args) { const value = json(args); if (!Array.isArray(value)) throw new Error('Cloud inventory must return a list'); return value; }
function mutate(args, options) { return cli([...args, ...globalFlags], options); }
function assertPrivate(metadata, projectNumber) {
  if (metadata.name !== bucket || String(metadata.projectNumber) !== String(projectNumber) || metadata.location?.toLowerCase() !== region || metadata.iamConfiguration?.publicAccessPrevention !== 'enforced' || metadata.iamConfiguration?.uniformBucketLevelAccess?.enabled !== true) throw new Error('Existing bucket must be private and owned by the authorized project/region; automatic repair is refused');
}
function verifyGate() {
  const info = json(['projects', 'describe', project]);
  if (info.projectId !== project || info.lifecycleState !== 'ACTIVE' || info.parent?.type !== 'organization' || String(info.parent.id) !== organization) throw new Error('Project must be active in the explicitly approved organization');
  const billing = json(['billing', 'projects', 'describe', project]);
  const account = requireMatch(process.env.PILOT_BILLING_ACCOUNT, /^[a-fA-F0-9]{6}-[a-fA-F0-9]{6}-[a-fA-F0-9]{6}$/, 'PILOT_BILLING_ACCOUNT');
  const budgetId = requireMatch(process.env.PILOT_BUDGET_ID, /^[a-zA-Z0-9_-]{1,128}$/, 'PILOT_BUDGET_ID');
  if (!billing.billingEnabled || billing.billingAccountName !== `billingAccounts/${account}`) throw new Error('Verified linked billing is required before any resource change');
  const configuredBudget = json(['billing', 'budgets', 'describe', budgetId, `--billing-account=${account}`, ...globalFlags]);
  if (configuredBudget.name !== `billingAccounts/${account}/budgets/${budgetId}`) throw new Error('Budget identity does not match the approved account');
  validateBudget(configuredBudget, { projectNumber: String(info.projectNumber), budget });
  return info;
}
function iapBinding(user) { return ['iap', 'web', 'add-iam-policy-binding', '--resource-type=cloud-run', `--service=${service}`, `--region=${region}`, `--member=user:${user}`, '--role=roles/iap.httpsResourceAccessor']; }

try {
  if (!['plan', 'apply', 'access'].includes(mode)) throw new Error('Use plan, apply or access');
  validateConfig({ project, region, budget, service, database, bucket });
  requireMatch(organization, /^\d+$/, 'PILOT_ORGANIZATION_ID');
  for (const user of users) requireMatch(user, /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, 'explicit founder and marketer email');
  if (users[0].toLowerCase() === users[1].toLowerCase()) throw new Error('Founder and marketer must be distinct accounts');
  if (mode !== 'plan' && process.argv[3] !== '--apply') throw new Error('Resource or access changes require --apply');
  if (mode === 'plan') {
    console.log(JSON.stringify({ project, organization, region, budgetUSD: budget, billingGate: 'linked account and verified monthly all-service project budget required before any mutation', users, resourceStage: 'prerequisites only; service deployment and access are separate' }));
    cli(['services', 'enable', ...apis, ...globalFlags]);
    cli(['firestore', 'databases', 'create', `--database=${database}`, `--location=${region}`, '--type=firestore-native', '--delete-protection', '--enable-pitr', ...globalFlags]);
    cli(['storage', 'buckets', 'create', `gs://${bucket}`, `--location=${region}`, '--uniform-bucket-level-access', '--public-access-prevention', ...globalFlags]);
    cli(['iam', 'service-accounts', 'create', runtimeId, ...globalFlags]);
    cli(['artifacts', 'repositories', 'create', registry, '--repository-format=docker', `--location=${region}`, ...globalFlags]);
    for (const role of roleDefinitions) cli(['iam', 'roles', 'create', role.id, `--permissions=${role.permissions.join(',')}`, '--stage=GA', ...globalFlags]);
    for (const role of ['roles/datastore.user', `projects/${project}/roles/liquidityVertexPredictor`, `projects/${project}/roles/liquidityAuthReader`]) cli(['projects', 'add-iam-policy-binding', project, `--member=${member}`, `--role=${role}`, '--condition=None', ...globalFlags]);
    cli(['storage', 'buckets', 'add-iam-policy-binding', `gs://${bucket}`, `--member=${member}`, `--role=projects/${project}/roles/liquidityArtifactAccess`, ...globalFlags]);
    for (const secret of secrets) {
      cli(['secrets', 'create', secret.id, '--replication-policy=user-managed', `--locations=${region}`, ...globalFlags]);
      cli(['secrets', 'versions', 'add', secret.id, '--data-file=-', ...globalFlags], { input: '<redacted>' });
      cli(['secrets', 'add-iam-policy-binding', secret.id, `--member=${member}`, '--role=roles/secretmanager.secretAccessor', ...globalFlags]);
    }
    if (legacyPasswords) cli(['run', 'services', 'add-iam-policy-binding', service, `--region=${region}`, '--member=serviceAccount:service-<verified-project-number>@gcp-sa-iap.iam.gserviceaccount.com', '--role=roles/run.invoker', ...globalFlags]);
    if (legacyPasswords) for (const user of users) cli([...iapBinding(user), ...globalFlags]);
  } else {
    // Validate local inputs before starting a partially provisioned prerequisite set.
    if (mode === 'apply') for (const secret of secrets) requireMatch(process.env[secret.variable], /^[^\r\n]{16,256}$/, secret.variable);
    const info = verifyGate();
    if (mode === 'access') {
      if (!legacyPasswords) throw new Error('Google managed mode uses application token authorization; IAP access stage is disabled');
      if (users.some(user => user.split('@')[1].toLowerCase() !== 'chaiwithjai.com')) {
        const settings = json(['iap', 'settings', 'get', '--resource-type=cloud-run', `--service=${service}`, `--region=${region}`, ...globalFlags]);
        const clientId = settings.accessSettings?.oauthSettings?.clientId ?? settings.access_settings?.oauth_settings?.client_id;
        if (!clientId || !clientId.endsWith('.apps.googleusercontent.com')) throw new Error('External access requires a custom OAuth client configured in Console; no access permissions changed');
      }
      const configuredService = json(['run', 'services', 'describe', service, `--region=${region}`, ...globalFlags]);
      if (configuredService.metadata?.annotations?.['run.googleapis.com/iap-enabled'] !== 'true') throw new Error('Service must already enforce native IAP before granting users access');
      const policy = json(['iap', 'web', 'get-iam-policy', '--resource-type=cloud-run', `--service=${service}`, `--region=${region}`, ...globalFlags]);
      const allowed = new Set(users.map(user => `user:${user}`));
      const projectPolicy = json(['projects', 'get-iam-policy', project]);
      const organizationPolicy = json(['organizations', 'get-iam-policy', organization]);
      if ([policy, projectPolicy, organizationPolicy].some(current => current.bindings?.some(binding => binding.role === 'roles/iap.httpsResourceAccessor' && binding.members?.some(principal => !allowed.has(principal))))) throw new Error('Unexpected existing or inherited IAP principals require explicit review; no permissions were changed');
      mutate(['run', 'services', 'add-iam-policy-binding', service, `--region=${region}`, `--member=serviceAccount:service-${info.projectNumber}@gcp-sa-iap.iam.gserviceaccount.com`, '--role=roles/run.invoker']);
      for (const user of users) mutate(iapBinding(user));
      console.log(JSON.stringify({ stage: 'iap-resource-access-granted', users, ancestorPolicyAuditRequired: true, browserIsolationProofRequired: true }));
    } else {
      mutate(['services', 'enable', ...apis]);
      const databases = list(['firestore', 'databases', 'list', ...globalFlags]);
      const existingDatabase = databases.find(item => item.name?.endsWith(`/databases/${database}`));
      if (existingDatabase && (existingDatabase.locationId !== region || existingDatabase.type !== 'FIRESTORE_NATIVE')) throw new Error('Existing database differs from the approved location/type');
      if (!existingDatabase) mutate(['firestore', 'databases', 'create', `--database=${database}`, `--location=${region}`, '--type=firestore-native', '--delete-protection', '--enable-pitr']);
      const buckets = list(['storage', 'buckets', 'list', ...globalFlags]);
      const exists = buckets.some(item => item.name === bucket || item.name === `gs://${bucket}` || item.name === `gs://${bucket}/` || item.storage_url === `gs://${bucket}/`);
      if (!exists) mutate(['storage', 'buckets', 'create', `gs://${bucket}`, `--location=${region}`, '--uniform-bucket-level-access', '--public-access-prevention']);
      assertPrivate(json(['storage', 'buckets', 'describe', `gs://${bucket}`, '--raw', ...globalFlags]), info.projectNumber);
      if (!list(['iam', 'service-accounts', 'list', ...globalFlags]).some(account => account.email === runtime)) mutate(['iam', 'service-accounts', 'create', runtimeId]);
      if (!list(['artifacts', 'repositories', 'list', `--location=${region}`, ...globalFlags]).some(item => item.name?.endsWith(`/repositories/${registry}`))) mutate(['artifacts', 'repositories', 'create', registry, '--repository-format=docker', `--location=${region}`]);
      const roles = list(['iam', 'roles', 'list', ...globalFlags]);
      for (const role of roleDefinitions) {
        const existing = roles.find(item => item.name === `projects/${project}/roles/${role.id}`);
        const details = existing ? json(['iam', 'roles', 'describe', role.id, ...globalFlags]) : null;
        if (details && JSON.stringify([...(details.includedPermissions || [])].sort()) !== JSON.stringify([...role.permissions].sort())) throw new Error('Existing runtime role permissions differ; automatic permission replacement is refused');
        if (!existing) mutate(['iam', 'roles', 'create', role.id, `--title=${role.id}`, `--permissions=${role.permissions.join(',')}`, '--stage=GA']);
      }
      for (const role of ['roles/datastore.user', `projects/${project}/roles/liquidityVertexPredictor`, `projects/${project}/roles/liquidityAuthReader`]) mutate(['projects', 'add-iam-policy-binding', project, `--member=${member}`, `--role=${role}`, '--condition=None']);
      mutate(['storage', 'buckets', 'add-iam-policy-binding', `gs://${bucket}`, `--member=${member}`, `--role=projects/${project}/roles/liquidityArtifactAccess`]);
      const knownSecrets = secrets.length ? list(['secrets', 'list', ...globalFlags]) : [];
      const versions = {};
      for (const secret of secrets) {
        if (!knownSecrets.some(item => item.name?.endsWith(`/secrets/${secret.id}`))) mutate(['secrets', 'create', secret.id, '--replication-policy=user-managed', `--locations=${region}`]);
        const enabled = list(['secrets', 'versions', 'list', secret.id, '--filter=state:ENABLED', '--sort-by=~createTime', '--limit=1', ...globalFlags]);
        let version = enabled[0]?.name?.split('/').at(-1);
        if (!version) {
          const created = jsonSecretVersion(secret);
          version = created.name?.split('/').at(-1);
        }
        if (!/^\d+$/.test(version || '')) throw new Error('Secret version metadata was invalid');
        versions[secret.id] = `${secret.id}:${version}`;
        mutate(['secrets', 'add-iam-policy-binding', secret.id, `--member=${member}`, '--role=roles/secretmanager.secretAccessor']);
      }
      console.log(JSON.stringify({ stage: 'prerequisites-ready', project, region, database, bucket, runtime, registry, secretVersions: versions, access: legacyPasswords ? 'not granted until private IAP-enabled service deployment and separate access stage' : 'application Google allowlist and token authorization; live sign-in and tenant isolation remain unverified' }));
    }
  }
} catch (error) { console.error(error.message); process.exitCode = 1; }

function jsonSecretVersion(secret) {
  const output = mutate(['secrets', 'versions', 'add', secret.id, '--data-file=-', '--format=json'], { input: process.env[secret.variable] });
  try { return JSON.parse(output); } catch { throw new Error('Secret version operation did not return valid metadata'); }
}
