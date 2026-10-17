import fs from "node:fs";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";
import { DurableStore } from "./storage.js";
const [operation, source, destination] = process.argv.slice(2);
if (!["backup", "restore"].includes(operation) || !source || !destination)
  throw new Error(
    "Usage: node server/storage-admin.js backup|restore SOURCE DESTINATION",
  );
if (!fs.existsSync(source)) throw new Error("Source does not exist");
if (fs.existsSync(destination))
  throw new Error(
    "Destination must not exist; preserve current files before restoring",
  );
if (operation === "backup") {
  const store = new DurableStore(source);
  try {
    store.backup(destination);
  } finally {
    store.close();
  }
} else {
  const snapshot = new DatabaseSync(source, { readOnly: true });
  try {
    if (
      snapshot.prepare("PRAGMA integrity_check").get().integrity_check !==
        "ok" ||
      snapshot.prepare("PRAGMA user_version").get().user_version !== 1
    )
      throw new Error("Unsupported or corrupt backup");
    for (const row of snapshot
      .prepare("SELECT key,value FROM documents")
      .all()) {
      if (typeof row.key !== "string") throw new Error("Invalid backup");
      JSON.parse(row.value);
    }
  } finally {
    snapshot.close();
  }
  fs.mkdirSync(path.dirname(path.resolve(destination)), {
    recursive: true,
    mode: 0o700,
  });
  fs.copyFileSync(source, destination, fs.constants.COPYFILE_EXCL);
  fs.chmodSync(destination, 0o600);
  const restored = new DatabaseSync(destination);
  try {
    restored
      .prepare("DELETE FROM documents WHERE substr(key,1,8)='session:'")
      .run();
  } finally {
    restored.close();
  }
}
console.log(`${operation} completed`);
