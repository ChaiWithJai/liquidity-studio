import { DatabaseSync } from "node:sqlite";
import fs from "node:fs";
import path from "node:path";

export class DurableStore {
  constructor(
    filename = process.env.STUDIO_DATABASE_PATH || "./data/studio.sqlite",
  ) {
    if (filename !== ":memory:")
      fs.mkdirSync(path.dirname(path.resolve(filename)), {
        recursive: true,
        mode: 0o700,
      });
    this.db = new DatabaseSync(filename);
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
