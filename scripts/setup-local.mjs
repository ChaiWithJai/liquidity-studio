import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const target = path.resolve(process.env.STUDIO_ENV_FILE || path.join(root, '.env'));
const fields = ['STUDIO_FIREBASE_PROJECT_ID','STUDIO_FIREBASE_API_KEY','STUDIO_FIREBASE_AUTH_DOMAIN','STUDIO_FIREBASE_APP_ID','STUDIO_GOOGLE_FOUNDER_EMAIL','STUDIO_GOOGLE_MARKETER_EMAIL'];
if (fs.existsSync(target)) {
  console.log('Existing environment file preserved. Review Google configuration locally; no credentials were generated or changed.');
} else {
  const values = ['STUDIO_LOCAL_PORT=3001','STUDIO_NODE_ENV=production','STUDIO_AUTH_MODE=google','AI_ALLOW_SYNTHETIC=true'];
  for (const field of fields) {
    const value = process.env[field] || '';
    if (/[\r\n\0]/.test(value)) throw new Error(`Invalid multiline configuration: ${field}`);
    values.push(`${field}=${JSON.stringify(value)}`);
  }
  fs.writeFileSync(target, values.join('\n') + '\n', {mode:0o600,flag:'wx'});
  console.log('Created private Google environment template. Supply Firebase public web configuration and both verified Google emails before starting.');
}
console.log(`Start: docker compose --env-file ${target} up --build --detach --wait`);
console.log('Google revocation checks require local ADC; see docs/docker-local.md for the explicit read-only mount. No application passwords were generated.');
