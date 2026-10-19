import {MODNET_MODEL_BYTES, MODNET_MODEL_CHUNK_SIZE, MODNET_MODEL_CHUNKS} from './native-cutout-contract.js';
import test from "node:test";
import assert from "node:assert/strict";
import { createModnetModelLoader } from "../src/lib/modnet-model-cache.js";
import { MODNET_MODEL_SHA256 } from "../src/lib/modnet-processor.js";
const manifest = {
  sha256: MODNET_MODEL_SHA256,
  size: MODNET_MODEL_BYTES,
  chunkSize: MODNET_MODEL_CHUNK_SIZE,
  chunks: MODNET_MODEL_CHUNKS,
};
test("model cache never bypasses current authorization", async () => {
  let opened = false;
  const load = createModnetModelLoader({
    request: async () => {
      throw Object.assign(Error("Forbidden"), { status: 403 });
    },
    cacheStorage: {
      open: async () => {
        opened = true;
      },
    },
  });
  await assert.rejects(load(), { status: 403 });
  assert.equal(opened, false);
});
test("corrupt cache is deleted and no foreign network fallback is attempted", async () => {
  let deleted = false;
  const paths = [];
  const load = createModnetModelLoader({
    request: async (path) => {
      paths.push(path);
      if (paths.length === 1) return manifest;
      throw Error("Unavailable chunk");
    },
    cacheStorage: {
      open: async () => ({
        match: async () => new Response("corrupt"),
        delete: async () => {
          deleted = true;
        },
      }),
    },
  });
  await assert.rejects(load(), /Unavailable chunk/);
  assert.equal(deleted, true);
  assert.deepEqual(paths, [
    "/api/studio/native-editor/cutout/model",
    "/api/studio/native-editor/cutout/model/0",
  ]);
});
test("wrong checkpoint and oversized chunk are rejected before writing cache", async () => {
  let written = false;
  const cacheStorage = {
    open: async () => ({
      match: async () => null,
      put: async () => {
        written = true;
      },
    }),
  };
  const wrong = createModnetModelLoader({
    request: async () => ({ ...manifest, sha256: "wrong" }),
    cacheStorage,
  });
  await assert.rejects(wrong(), /configuration/);
  let count = 0;
  const oversized = createModnetModelLoader({
    request: async () =>
      ++count === 1
        ? manifest
        : { index: 0, sha256: MODNET_MODEL_SHA256, base64: "A".repeat(350001) },
    cacheStorage,
  });
  await assert.rejects(oversized(), /Invalid model chunk/);
  assert.equal(written, false);
});

test("blocked optional cache open, read or corrupt-entry delete still uses only authenticated chunks", async () => {
  for (const failure of ["open", "match", "delete"]) {
    const paths = [];
    const cacheStorage = {
      open: async () => {
        if (failure === "open")
          throw new DOMException("Storage disabled", "SecurityError");
        return {
          match: async () => {
            if (failure === "match")
              throw new DOMException("Storage disabled", "SecurityError");
            return new Response("corrupt");
          },
          delete: async () => {
            throw new DOMException("Storage disabled", "SecurityError");
          },
        };
      },
    };
    const load = createModnetModelLoader({
      cacheStorage,
      request: async (path) => {
        paths.push(path);
        if (paths.length === 1) return manifest;
        throw Error("Authenticated chunk reached");
      },
    });
    await assert.rejects(load(), /Authenticated chunk reached/);
    assert.deepEqual(paths, [
      "/api/studio/native-editor/cutout/model",
      "/api/studio/native-editor/cutout/model/0",
    ]);
  }
});
test("all 100 authenticated chunks reach whole-model integrity validation before cache persistence", async () => {
  const requested=[],progress=[];let written=false;
  const load=createModnetModelLoader({
    request:async path=>{
      if(path.endsWith('/model'))return manifest;
      const index=Number(path.split('/').at(-1));requested.push(index);
      return {index,sha256:MODNET_MODEL_SHA256,base64:Buffer.alloc(Math.min(MODNET_MODEL_CHUNK_SIZE,MODNET_MODEL_BYTES-index*MODNET_MODEL_CHUNK_SIZE)).toString('base64')};
    },
    cacheStorage:{open:async()=>({match:async()=>null,put:async()=>{written=true;}})},
    onProgress:value=>progress.push(value),
  });
  await assert.rejects(load(),/integrity check failed/);
  assert.equal(MODNET_MODEL_CHUNKS,100);
  assert.deepEqual(requested,Array.from({length:100},(_,i)=>i));
  assert.equal(MODNET_MODEL_BYTES-99*MODNET_MODEL_CHUNK_SIZE,9237);
  assert.equal(progress.at(-1),100);
  assert.equal(written,false);
});
