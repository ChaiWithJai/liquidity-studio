import { DatabaseSync } from "node:sqlite";
import fs from "node:fs";
import path from "node:path";
import { transactionKeys, transactionValues } from "./storage-transaction.js";

export class DurableStore {
  constructor(
    filename = process.env.STUDIO_DATABASE_PATH || "./data/studio.sqlite",
  ) {
    // Capacity admission must follow the actual constructor-selected database,
    // including private homes mounted on a different filesystem from cwd.
    Object.defineProperty(this, "filesystemDirectory", {
      value: filename === ":memory:" ? null : path.dirname(path.resolve(filename)),
      enumerable: false,
    });
    if (filename !== ":memory:")
      fs.mkdirSync(path.dirname(path.resolve(filename)), {
        recursive: true,
        mode: 0o700,
      });
    this.db = new DatabaseSync(filename);
    // Even the first schema-version read can contend with another process opening
    // the same database. Install the wait policy before any schema access.
    this.db.exec("PRAGMA busy_timeout=5000");
    if (this.db.prepare("PRAGMA user_version").get().user_version > 1) {
      this.db.close();
      throw new Error("Database schema is newer than this application");
    }
    this.db.exec(
      "PRAGMA busy_timeout=5000; PRAGMA journal_mode=WAL; CREATE TABLE IF NOT EXISTS documents (key TEXT PRIMARY KEY, value TEXT NOT NULL); PRAGMA user_version=1;",
    );
    if (filename !== ":memory:") fs.chmodSync(filename, 0o600);
  }
  get(key) {
    const row = this.db
      .prepare("SELECT value FROM documents WHERE key=?")
      .get(key);
    return row ? JSON.parse(row.value) : null;
  }
  update(key, mutate) {
    this.db.exec("BEGIN IMMEDIATE");
    try {
      const next = mutate(this.get(key));
      this.db
        .prepare(
          "INSERT INTO documents(key,value) VALUES(?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value",
        )
        .run(key, JSON.stringify(next));
      this.db.exec("COMMIT");
      return structuredClone(next);
    } catch (error) {
      this.db.exec("ROLLBACK");
      throw error;
    }
  }
  transact(keys, callback) {
    keys = transactionKeys(keys, callback);
    this.db.exec("BEGIN IMMEDIATE");
    try {
      const encoded = transactionValues(callback(keys.map(key => this.get(key))), keys.length);
      const write = this.db.prepare("INSERT INTO documents(key,value) VALUES(?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value");
      encoded.forEach((value, index) => write.run(keys[index], value));
      this.db.exec("COMMIT");
      return encoded.map(value => JSON.parse(value));
    } catch (error) {
      this.db.exec("ROLLBACK");
      throw error;
    }
  }
  deleteIf(key, guardKeys, predicate) {
    const keys = transactionKeys([key, ...guardKeys], predicate);
    this.db.exec("BEGIN IMMEDIATE");
    try {
      const allowed = predicate(keys.map(item => this.get(item)));
      if (allowed instanceof Promise) allowed.catch(() => {});
      if (typeof allowed !== "boolean") throw new Error("Conditional deletion requires a synchronous boolean predicate");
      if (allowed) this.db.prepare("DELETE FROM documents WHERE key=?").run(key);
      this.db.exec("COMMIT");
      return allowed;
    } catch (error) {
      this.db.exec("ROLLBACK");
      throw error;
    }
  }
  delete(key) {
    this.db.prepare("DELETE FROM documents WHERE key=?").run(key);
  }
  keys(prefix) {
    return this.db
      .prepare("SELECT key FROM documents WHERE substr(key,1,?)=? ORDER BY key")
      .all(prefix.length, prefix)
      .map((row) => row.key);
  }
  backup(filename) {
    this.db.prepare("VACUUM INTO ?").run(path.resolve(filename));
    fs.chmodSync(filename, 0o600);
  }
  close() {
    this.db.close();
  }
}
