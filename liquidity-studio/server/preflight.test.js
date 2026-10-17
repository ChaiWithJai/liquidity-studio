import { test } from 'node:test';
import assert from 'node:assert/strict';
import { computePreflight } from './preflight.js';
const input = { format: 'reel', canvas: { width: 400, height: 700 }, textBoxes: [{ x: 40, y: 150, width: 200, height: 30 }], foreground: '#ffffff', background: '#000000', caption: '$250M in supplied facts' };
test('preflight computes actual overlap/contrast and reports simulation limits', () => {
  const clear = computePreflight(input);
  assert.equal(clear.metrics.occludedElementsCount, 0); assert.equal(clear.metrics.contrastRatio, 21); assert.equal(clear.requiresReview, true);
  const blocked = computePreflight({ ...input, textBoxes: [{ x: 350, y: 20, width: 80, height: 40 }], foreground: '#777777', background: '#888888', caption: 'x'.repeat(180) });
  assert.equal(blocked.metrics.occludedElementsCount, 1); assert.equal(blocked.metrics.overflowElementsCount, 1);
  assert.equal(blocked.checks.find(check => check.id === 'contrast').status, 'warning');
  assert.equal(blocked.checks.find(check => check.id === 'caption-fold').status, 'warning');
  assert.equal('confidenceScore' in blocked, false);
});
test('empty geometry stays unmeasured and invalid input fails', () => {
  assert.equal(computePreflight({ ...input, textBoxes: [] }).checks.find(check => check.id === 'safe-zones').status, 'unmeasured');
  assert.throws(() => computePreflight({ ...input, canvas: { width: 0, height: 700 } }), /Invalid/);
  assert.throws(() => computePreflight({ ...input, captionLimit: 5 }), /Invalid/);
});

test('aspect ratio and partial color evidence cannot silently pass', () => {
  const result = computePreflight({ ...input, canvas: { width: 400, height: 400 }, textBoxes: [...input.textBoxes, { x: 40, y: 200, width: 100, height: 20, foreground: 'invalid' }] });
  assert.equal(result.checks.find(check => check.id === 'aspect-ratio').status, 'warning');
  assert.equal(result.metrics.unmeasuredColorCount, 1);
  assert.equal(result.checks.find(check => check.id === 'contrast').status, 'unmeasured');
});
<<<<<<< HEAD
=======

test('a measured poll obstruction can block text inside the nominal clear zone', () => {
  const result = computePreflight({ ...input, obstructionBoxes: [{ x: 20, y: 130, width: 240, height: 80 }] });
  assert.equal(result.metrics.occludedElementsCount, 1); assert.equal(result.metrics.obstructionElementsCount, 1);
});
>>>>>>> dc03b8a
