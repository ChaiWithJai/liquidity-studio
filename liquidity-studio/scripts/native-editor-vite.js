import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
const project = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export function nativeEditorPlugin() {
  const local = process.env.STUDIO_NATIVE_EDITOR_LOCAL_BUILD === 'true';
  const source = path.join(project, '.native-editor-source');
  return {
    name: 'studio-native-editor-local-boundary',
    async resolveId(id, importer) {
      if (id === 'virtual:studio-native-editor') return '\0studio-native-editor';
      if (id.startsWith('@/') && local) return this.resolve(path.join(source, id.slice(2)), importer, { skipSelf: true });
    },
    load(id) {
      if (id !== '\0studio-native-editor') return null;
      if (!local) return 'export async function mountNativeEditor(){throw new Error("Native editor local build is unavailable; original exporter remains available.")}';
      const pin = JSON.parse(fs.readFileSync(path.join(source, 'PIN.json'), 'utf8'));
      if (pin.sourceCommit !== '27b6f68221fdbf1ef1bedc182e303210ca9e39f5') throw new Error('Native editor source pin mismatch');
      return `export { mountNativeEditor } from ${JSON.stringify(path.join(project, 'src/lib/native-editor-mount.jsx'))};`;
    },
  };
}
