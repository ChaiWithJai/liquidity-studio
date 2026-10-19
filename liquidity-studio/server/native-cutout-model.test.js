import test from "node:test";
import assert from "node:assert/strict";
import { createNativeCutoutModel } from "./native-cutout-model.js";
test("disabled model never reads operator files", async () => {
  let reads = 0;
  const provider = createNativeCutoutModel({
    path: "/private/model",
    read: async () => {
      reads++;
      throw Error("private");
    },
  });
  assert.equal(provider.configured, false);
  await assert.rejects(provider.manifest(), { code: "CUTOUT_UNAVAILABLE" });
  assert.equal(reads, 0);
});
test("missing or corrupt model is fail closed and private paths/errors are not exposed", async () => {
  for (const read of [
    async () => {
      throw Error("/private/secret");
    },
    async () => Buffer.from("not model"),
  ]) {
    const provider = createNativeCutoutModel({
      enabled: true,
      path: "/private/secret",
      read,
    });
    await assert.rejects(
      provider.manifest(),
      (error) =>
        error.code === "CUTOUT_UNAVAILABLE" &&
        !error.message.includes("private"),
    );
  }
});
test("invalid chunk is rejected before reading model", async () => {
  let reads = 0;
  const provider = createNativeCutoutModel({
    enabled: true,
    path: "/private/model",
    read: async () => {
      reads++;
    },
  });
  for (const index of [-1, 100, 1.5, "0", NaN])
    await assert.rejects(provider.chunk(index), {
      code: "INVALID_MODEL_CHUNK",
    });
  assert.equal(reads, 0);
});
test("the independently converted model admits its hundredth chunk without weakening byte integrity", async () => {
  let reads = 0;
  const provider = createNativeCutoutModel({enabled:true,path:'/private/model',read:async()=>{reads++;throw Error('Fixture has no model bytes');}});
  await assert.rejects(provider.chunk(99), {code:'CUTOUT_UNAVAILABLE'});
  assert.equal(reads,1);
  await assert.rejects(provider.chunk(100), {code:'INVALID_MODEL_CHUNK'});
  assert.equal(reads,1);
});
