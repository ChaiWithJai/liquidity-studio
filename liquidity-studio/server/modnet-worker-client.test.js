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
