import { build } from 'esbuild';
import { builtinModules } from 'node:module';
import { fileURLToPath } from 'node:url';
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
/** Hosted build only: portable JS dependency closure, no owner input or credentials. */
export async function buildDefiantStdio() {
  const root = fileURLToPath(new URL('..', import.meta.url));
  const result = await build({ entryPoints: [resolve(root, 'server/defiant-stdio.js')], bundle: true, platform: 'node', target: 'node22', format: 'esm', write: false, metafile: true, legalComments: 'eof', banner: { js: "import { createRequire as __defiantCreateRequire } from 'node:module'; const require = __defiantCreateRequire(import.meta.url);" } });
  const builtins = new Set(builtinModules.flatMap(name => [name, `node:${name}`]));
  const outputs = Object.values(result.metafile.outputs);
  if (result.outputFiles.length !== 1 || outputs.length !== 1 || outputs[0].imports.some(item => !item.external || !builtins.has(item.path))) throw new Error('Stdio bundle must contain its complete non-builtin dependency closure');
  const bytes = result.outputFiles[0].contents;
  if (!bytes.length || bytes.length > 10 * 1024 * 1024) throw new Error('Stdio bundle exceeds reviewed size');
  await mkdir(resolve(root, 'dist/mcp'), { recursive: true });
  await writeFile(resolve(root, 'dist/mcp/defiant-stdio.mjs'), bytes);
  console.log(`Built private Defiant stdio bundle: ${bytes.length} bytes`);
}
