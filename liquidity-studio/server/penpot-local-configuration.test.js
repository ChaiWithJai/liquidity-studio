import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, writeFile, chmod, symlink, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { loadPenpotLocalConfiguration } from "./penpot-local-configuration.js";

test("native local configuration fails closed before loading credentials when disabled/cloud/public/symlinked", async (t) => {
  const dir = await mkdtemp(join(tmpdir(), "penpot-local-config-"));
  t.after(() => rm(dir, { recursive: true, force: true }));
  const path = join(dir, "operator.json");
  await writeFile(path, "{}", { mode: 0o600 });
  await assert.rejects(
    () => loadPenpotLocalConfiguration(path, {}),
    /explicit local/,
  );
  await assert.rejects(
    () =>
      loadPenpotLocalConfiguration(path, {
        STUDIO_PENPOT_ENABLED: "true",
        K_SERVICE: "service",
      }),
    /Cloud Run/,
  );
  await chmod(path, 0o644);
  await assert.rejects(
    () => loadPenpotLocalConfiguration(path, { STUDIO_PENPOT_ENABLED: "true" }),
    /private regular/,
  );
  await chmod(path, 0o600);
  const link = join(dir, "link.json");
  await symlink(path, link);
  await assert.rejects(
    () => loadPenpotLocalConfiguration(link, { STUDIO_PENPOT_ENABLED: "true" }),
    /private regular/,
  );
  await assert.rejects(
    () => loadPenpotLocalConfiguration(path, { STUDIO_PENPOT_ENABLED: "true" }),
    /Invalid local/,
  );
});
