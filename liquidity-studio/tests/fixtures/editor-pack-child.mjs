// Disposable two-process SQLite acceptance only; never a production operator CLI.
import { readFileSync } from "node:fs";
import { DurableStore } from "../../server/storage.js";
import { ScopedRepository } from "../../server/repository.js";
import { NativeEditorService } from "../../server/native-editor.js";
import { EditorPackService } from "../../server/editor-pack-service.js";
const [filename, packfile, scopeJson, actorJson, optionsJson, mode, priorKey] =
  process.argv.slice(2);
const scope = JSON.parse(scopeJson),
  actor = JSON.parse(actorJson),
  options = JSON.parse(optionsJson),
  store = new DurableStore(filename);
try {
  const repo = new ScopedRepository(store, scope);
  await repo.ready;
  const native = new NativeEditorService({
    repo,
    scope,
    identity: {
      authorize: async (principal) => {
        if (principal.id !== actor.id)
          throw new Error("Fixture principal mismatch");
      },
    },
  });
  const service = new EditorPackService({ native });
  if (mode === "rollback-install")
    await service.rollback(actor, { idempotencyKey: priorKey });
  await service.install(actor, JSON.parse(readFileSync(packfile)), options);
} finally {
  store.close();
}
