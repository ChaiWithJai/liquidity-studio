import {MODNET_MODEL_BYTES, MODNET_MODEL_CHUNK_SIZE, MODNET_MODEL_CHUNKS} from './native-cutout-contract.js';
import test from "node:test";
import assert from "node:assert/strict";
import { createModnetWorkerClient } from "../src/lib/modnet-worker-client.js";
const tick = () => new Promise((resolve) => setImmediate(resolve));
test("cancel terminates active kernel and stale completion cannot replace the next image", async () => {
  const workers = [];
  const createWorker = () => {
    const w = {
      terminated: 0,
      postMessage(m) {
        this.message = m;
      },
      terminate() {
        this.terminated++;
      },
    };
    workers.push(w);
    return w;
  };
  const client = createModnetWorkerClient({
    createWorker,
    loadModel: async () => new Uint8Array([1]),
  });
  const controller = new AbortController();
  const first = client.remove("first", () => {}, controller.signal);
  await tick();
  const old = workers[0],
    oldHandler = old.onmessage,
    id = old.message.id;
  controller.abort();
  await assert.rejects(first, { name: "AbortError" });
  assert.equal(old.terminated, 1);
  const next = client.remove("next");
  await tick();
  let settled = false;
  next.then(() => (settled = true));
  oldHandler({ data: { id, type: "result", image: "WRONG" } });
  await tick();
  assert.equal(settled, false);
  const current = workers[1];
  current.onmessage({
    data: { id: current.message.id, type: "result", image: "correct" },
  });
  assert.equal(await next, "correct");
  client.dispose();
  assert.equal(current.terminated, 1);
});
test("cancel while loading never starts a worker and concurrent requests are rejected", async () => {
  let done;
  let created = 0;
  const client = createModnetWorkerClient({
    createWorker: () => created++,
    loadModel: () => new Promise((r) => (done = r)),
  });
  const controller = new AbortController();
  const first = client.remove("image", () => {}, controller.signal);
  await assert.rejects(client.remove("other"), /Finish or cancel/);
  controller.abort();
  await assert.rejects(first, { name: "AbortError" });
  done(new Uint8Array());
  await tick();
  assert.equal(created, 0);
  client.dispose();
});

test("timeout and disposal abort the real chunk loader before another authenticated chunk", async () => {
  const { createModnetModelLoader } = await import(
    "../src/lib/modnet-model-cache.js"
  );
  const { MODNET_MODEL_SHA256 } = await import(
    "../src/lib/modnet-processor.js"
  );
  for (const mode of ["timeout", "dispose"]) {
    let release,
      workers = 0;
    const paths = [];
    const loadModel = createModnetModelLoader({
      cacheStorage: null,
      request: async (path) => {
        paths.push(path);
        if (paths.length === 1)
          return {
            sha256: MODNET_MODEL_SHA256,
            size: MODNET_MODEL_BYTES,
            chunkSize: MODNET_MODEL_CHUNK_SIZE,
            chunks: MODNET_MODEL_CHUNKS,
          };
        return new Promise((resolve) => (release = resolve));
      },
    });
    const client = createModnetWorkerClient({
      createWorker: () => {
        workers++;
        throw Error("No worker expected");
      },
      loadModel,
      timeoutMs: mode === "timeout" ? 5 : 1000,
    });
    const pending = client.remove(new Blob(["owned input"]));
    const rejected = assert.rejects(
      pending,
      mode === "timeout" ? /timed out/ : { name: "AbortError" },
    );
    await tick();
    if (mode === "dispose") client.dispose();
    await rejected;
    assert.equal(paths.length, 2);
    release({
      index: 0,
      sha256: MODNET_MODEL_SHA256,
      base64: Buffer.alloc(262144).toString("base64"),
    });
    await tick();
    assert.equal(paths.length, 2);
    assert.equal(workers, 0);
    client.dispose();
  }
});
