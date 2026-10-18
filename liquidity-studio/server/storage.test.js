import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { DurableStore } from "./storage.js";
test("transactional records survive reopen and restore without losing independent changes", () => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), "liquidity-store-"));
  try {
    const filename = path.join(directory, "data.sqlite");
    let store = new DurableStore(filename);
    store.update("org:a:brand:b", (value) => ({
      ...value,
      draft: "human edit",
    }));
    store.update("org:a:brand:b", (value) => ({ ...value, day: "Monday" }));
    store.backup(path.join(directory, "backup.sqlite"));
    store.close();
    store = new DurableStore(filename);
    assert.deepEqual(store.get("org:a:brand:b"), {
      draft: "human edit",
      day: "Monday",
    });
    assert.equal(store.get("org:x:brand:b"), null);
    store.close();
    const restored = new DurableStore(path.join(directory, "backup.sqlite"));
    assert.equal(restored.get("org:a:brand:b").draft, "human edit");
    restored.close();
  } finally {
    fs.rmSync(directory, { recursive: true, force: true });
  }
});

test("backup/restore CLI verifies a snapshot and revokes recovered sessions", async () => {
  const { spawnSync } = await import("node:child_process");
  const directory = fs.mkdtempSync(
    path.join(os.tmpdir(), "liquidity-recovery-"),
  );
  try {
    const source = path.join(directory, "source.sqlite"),
      snapshot = path.join(directory, "snapshot.sqlite"),
      destination = path.join(directory, "restored.sqlite");
    const store = new DurableStore(source);
    store.update("identity", () => ({ users: [{ id: "founder" }] }));
    store.update("session:oldtoken", () => ({ userId: "founder" }));
    store.update("scope:org:brand", () => ({ draft: "reviewed" }));
    store.close();
    const cli = new URL("./storage-admin.js", import.meta.url).pathname;
    assert.equal(
      spawnSync(process.execPath, [cli, "backup", source, snapshot]).status,
      0,
    );
    assert.equal(
      spawnSync(process.execPath, [cli, "restore", snapshot, destination])
        .status,
      0,
    );
    const recovered = new DurableStore(destination);
    assert.equal(recovered.get("scope:org:brand").draft, "reviewed");
    assert.equal(recovered.get("identity").users[0].id, "founder");
    assert.equal(recovered.get("session:oldtoken"), null);
    recovered.close();
    assert.notEqual(
      spawnSync(process.execPath, [cli, "restore", snapshot, destination])
        .status,
      0,
    );
  } finally {
    fs.rmSync(directory, { recursive: true, force: true });
  }
});

test("separate writer processes serialize updates and failed mutations roll back", async () => {
  const { spawn } = await import("node:child_process");
  const directory = fs.mkdtempSync(
    path.join(os.tmpdir(), "liquidity-concurrency-"),
  );
  try {
    const filename = path.join(directory, "concurrent.sqlite");
    let store = new DurableStore(filename);
    store.update("counter", () => ({ count: 0 }));
    store.close();
    const source = `import {DurableStore} from ${JSON.stringify(new URL("./storage.js", import.meta.url).href)}; const store=new DurableStore(process.argv[1]); for(let i=0;i<50;i++)store.update('counter',state=>({count:state.count+1}));store.close();`;
    await Promise.all(
      [1, 2].map(
        () =>
          new Promise((resolve, reject) => {
            const child = spawn(
              process.execPath,
              ["--input-type=module", "-e", source, filename],
              { stdio: ["ignore", "ignore", "pipe"] },
            );
            let stderr = "";
            child.stderr.on("data", (chunk) => (stderr += chunk));
            child.on("error", reject);
            child.on("exit", (code) =>
              code === 0 ? resolve() : reject(new Error(stderr)),
            );
          }),
      ),
    );
    store = new DurableStore(filename);
    assert.equal(store.get("counter").count, 100);
    assert.throws(() =>
      store.update("counter", (state) => {
        state.count = 999;
        throw new Error("rollback");
      }),
    );
    assert.equal(store.get("counter").count, 100);
    store.close();
  } finally {
    fs.rmSync(directory, { recursive: true, force: true });
  }
});

test('conditional deletion atomically checks guard records and rejects async decisions',async()=>{
 const store=new DurableStore(':memory:');try{
  store.update('owned',()=>({installation:'old'}));store.update('reservation',()=>({installation:'new'}));
  assert.equal(store.deleteIf('owned',['reservation'],([value,guard])=>value.installation===guard.installation),false);assert.ok(store.get('owned'));
  assert.throws(()=>store.deleteIf('owned',['reservation'],async()=>true),/synchronous boolean/);assert.ok(store.get('owned'));
  store.update('reservation',()=>({installation:'old'}));assert.equal(store.deleteIf('owned',['reservation'],([value,guard])=>value.installation===guard.installation),true);assert.equal(store.get('owned'),null);assert.deepEqual(store.keys('owned'),[]);
 }finally{store.close();}
});
