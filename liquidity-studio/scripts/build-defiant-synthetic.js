import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { generateDefiantSyntheticDataset } from '../server/defiant-synthetic-dataset.js';
/** Hosted canonical materialization only. Every record is fictional; no private inputs. */
export async function buildDefiantSynthetic() {
  const dataset = generateDefiantSyntheticDataset();
  const bytes = Buffer.from(JSON.stringify({ organizationId: 'defiant_synthetic_demo', dataset }) + '\n');
  if (!bytes.length || bytes.length > 4 * 1024 * 1024) throw new Error('Synthetic portfolio exceeds private entry size limit');
  const directory = resolve(fileURLToPath(new URL('..', import.meta.url)), 'dist/mcp');
  await mkdir(directory, { recursive: true });
  await writeFile(resolve(directory, 'defiant-synthetic-portfolio.json'), bytes);
  console.log(`Built fictional Defiant portfolio: ${bytes.length} bytes; SHA256 ${createHash('sha256').update(bytes).digest('hex')}; seed ${dataset.dataset.seed}; generation version ${dataset.dataset.generationVersion}`);
}
