import test from "node:test";
import assert from "node:assert/strict";
import { nativeCutoutAvailability } from "../src/lib/native-cutout-availability.js";

test("cutout availability probes only the authenticated manifest", async () => {
  const paths = [];
  const result = await nativeCutoutAvailability(async (path) => {
    paths.push(path);
    return { id: "modnet-fp32" };
  });
  assert.deepEqual(paths, ["/api/studio/native-editor/cutout/model"]);
  assert.deepEqual(result, { enabled: true, message: "" });
});

test("missing cutout explains that image editing remains available without exposing server errors", async () => {
  const result = await nativeCutoutAvailability(async () => {
    throw Object.assign(new Error("private operator path"), { code: "CUTOUT_UNAVAILABLE" });
  });
  assert.equal(result.enabled, false);
  assert.match(result.message, /still upload and edit images/);
  assert.doesNotMatch(result.message, /private operator path/);
});

test("failed connection offers save-before-reopen recovery and never enables inference", async () => {
  for (const failure of [new Error("private transport details"), null]) {
    const result = await nativeCutoutAvailability(async () => { throw failure; });
    assert.equal(result.enabled, false);
    assert.match(result.message, /Save your edits, then reopen/);
    assert.doesNotMatch(result.message, /private transport details/);
  }
});
