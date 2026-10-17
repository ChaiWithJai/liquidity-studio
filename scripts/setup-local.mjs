import fs from 'node:fs';
import path from 'node:path';
import { randomBytes } from 'node:crypto';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const target = path.join(root, '.env');
if (fs.existsSync(target)) {
  console.log('Existing .env preserved. Review it locally; credentials were not changed.');
} else {
  const secret = () => randomBytes(24).toString('base64url');
  const values = ['STUDIO_LOCAL_PORT=3001', 'AI_ALLOW_SYNTHETIC=true', 'STUDIO_FOUNDER_USERNAME=founder', `STUDIO_FOUNDER_PASSWORD=${secret()}`, 'STUDIO_MARKETER_USERNAME=marketer', `STUDIO_MARKETER_PASSWORD=${secret()}`, ''];
  fs.writeFileSync(target, values.join('\n'), { mode: 0o600, flag: 'wx' });
  console.log('Created private .env with independent random founder and marketer passwords.');
}
console.log('Start: docker compose up --build --detach --wait');
console.log(`Read login credentials locally in ${target}. Do not commit or share the file.`);
