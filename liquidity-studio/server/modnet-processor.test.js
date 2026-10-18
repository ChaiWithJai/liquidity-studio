import test from "node:test";
import assert from "node:assert/strict";
import {
  modelDimensions,
  prepareModnetInput,
  applyModnetMatte,
  resizeArea,
} from "../src/lib/modnet-processor.js";

test("MODNet preserves the reference short-side/stride sizing across orientations", () => {
  assert.deepEqual(modelDimensions(768, 768), { width: 512, height: 512 });
  assert.deepEqual(modelDimensions(320, 480), { width: 512, height: 768 });
  assert.deepEqual(modelDimensions(1024, 640), { width: 800, height: 512 });
  assert.deepEqual(modelDimensions(512, 768), { width: 512, height: 768 });
  for (const pair of [
    [16, 512],
    [100, 1000],
    [3000, 3000],
  ])
    assert.throws(() => modelDimensions(...pair));
});

test("MODNet normalizes RGB to -1..1 and uses planar NCHW without input mutation", () => {
  const image = new Uint8Array(32 * 32 * 4);
  for (let p = 0; p < 32 * 32; p++) image.set([0, 127, 255, 80], p * 4);
  const before = image.slice();
  const { data, dims } = prepareModnetInput(image, 32, 32);
  assert.deepEqual(dims, [1, 3, 512, 512]);
  assert.equal(data[0], -1);
  assert.ok(Math.abs(data[512 * 512] - (127 - 127.5) / 127.5) < 1e-8);
  assert.equal(data[512 * 512 * 2], 1);
  assert.deepEqual(image, before);
});

test("area coverage keeps edges and noninteger resize averages", () => {
  const result = resizeArea([0, 10, 20], 3, 1, 2, 1);
  assert.ok(Math.abs(result[0] - 10 / 3) < 1e-12);
  assert.ok(Math.abs(result[1] - 50 / 3) < 1e-12);
});

test("MODNet alpha uses truncation without contrast stretching, preserves RGB and original transparency", () => {
  const input = new Uint8Array([20, 30, 40, 255, 50, 60, 70, 80]);
  assert.deepEqual(
    [...applyModnetMatte(input, 2, 1, new Float32Array([0.5, 0.9]), 2, 1)],
    [20, 30, 40, 127, 50, 60, 70, 80],
  );
  assert.deepEqual([...input], [20, 30, 40, 255, 50, 60, 70, 80]);
  for (const v of [NaN, -0.1, 1.1])
    assert.throws(() => applyModnetMatte(input, 2, 1, [v, v], 2, 1));
});
