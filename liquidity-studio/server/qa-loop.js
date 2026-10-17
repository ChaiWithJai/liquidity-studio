/** Structural checks only. Runtime and usability evidence comes from API and browser tests. */
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import { CONTEXT_GRAPH, verifyContextGraphTopology } from './context-graph.js';
const root = fileURLToPath(new URL('../', import.meta.url));
const topology = verifyContextGraphTopology();
assert.equal(topology.valid, true, JSON.stringify(topology));
for (const node of CONTEXT_GRAPH.nodes) {
  if (node.file) assert.ok(fs.existsSync(path.join(root, node.file)), `Missing graph source: ${node.file}`);
}
const html = fs.readFileSync(path.join(root, 'dist/index.html'), 'utf8');
const assets = [...html.matchAll(/(?:src|href)="(\/assets\/[^"?#]+)"/g)].map(match => match[1]);
assert.ok(assets.some(asset => asset.endsWith('.js')), 'Build the canonical Vite application first');
assert.ok(assets.some(asset => asset.endsWith('.css')), 'Compiled application stylesheet is required');
for (const asset of assets) assert.ok(fs.existsSync(path.join(root, 'dist', asset)), `Missing served asset: ${asset}`);
const manifest = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
const lock = JSON.parse(fs.readFileSync(path.join(root, 'package-lock.json'), 'utf8'));
assert.deepEqual(lock.packages[''].dependencies, manifest.dependencies, 'Runtime dependencies must match lockfile');
assert.ok(fs.existsSync(path.join(root, 'tests/studio.spec.js')), 'Browser workflow suite is required');
console.log(`Structural checks passed: valid graph (${CONTEXT_GRAPH.nodes.length} nodes), referenced sources, ${assets.length} compiled assets and locked runtime dependencies.`);
console.log('These checks do not measure usability, factual accuracy, provider health or deployment readiness. Run Node, Chromium, Firestore and Docker acceptance gates separately.');
