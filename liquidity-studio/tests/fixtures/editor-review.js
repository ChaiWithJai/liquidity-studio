import { mount, unmount } from 'svelte';
import EditorReviewPanel from '../../src/components/EditorReviewPanel.svelte';
const config = await (await fetch('/fixture-config')).json();
const scopeKey = `${config.organizationId}:${config.brandId}`;
const suffix = `?organizationId=${config.organizationId}&brandId=${config.brandId}`;
async function request(path, options) {
  const response = await fetch(path + suffix, { ...options, headers: { 'Content-Type': 'application/json' } });
  const value = await response.json();
  if (!response.ok) throw Object.assign(new Error(value.error || 'Request failed'), { status: response.status });
  return value;
}
let component;
async function open() {
  const record = await request(`/api/studio/native-editor/documents/${config.id}`);
  if (component) await unmount(component);
  component = mount(EditorReviewPanel, { target: document.getElementById('review'), props: { record, request, scopeKey, getScopeKey: () => scopeKey, ready: true } });
}
document.getElementById('reload-native').addEventListener('click', open);
await open();
