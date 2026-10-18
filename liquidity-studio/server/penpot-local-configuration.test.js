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

// Original controlled configuration, not copied operator credentials or identity.
const owner = "11111111-1111-4111-8111-111111111111";
const project = "22222222-2222-4222-8222-222222222222";
const file = "33333333-3333-4333-8333-333333333333";
const local = { STUDIO_PENPOT_ENABLED: "true" };
function fixture() {
  return {
    version: 1,
    targets: [{
      id: "controlled", organizationId: "org_qa", brandId: "brand_qa",
      adapter: "penpot", ownerPrincipal: owner, nativeProjectId: project,
      nativeRoomId: "room_qa", nativeDocumentVersion: "1",
      nativeVersionKind: "archive", editorVersion: "2.18.3",
      resources: [{ id: "tokens", kind: "tokens", nativeId: file, nativeParentId: project }],
    }],
    sessions: [{ ownerPrincipal: owner, cookie: "auth-token=controlled-test-only" }],
    manifests: [{ targetId: "controlled", teamId: "44444444-4444-4444-8444-444444444444", manifest: {
      ownerPrincipal: owner, projectId: project, fileId: file,
      layers: [{ id: "controlled-layer" }], tokens: [1, 2, 3, 4], fonts: {},
      sourceApprovals: [], storyId: "controlled-story", generationId: "controlled-generation", storyRevision: 1,
    }}],
  };
}

test("trusted memory and private file configurations share the exact validation and local gates", async (t) => {
  const { validatePenpotLocalConfiguration } = await import("./penpot-local-configuration.js");
  const dir = await mkdtemp(join(tmpdir(), "penpot-memory-config-"));
  t.after(() => rm(dir, { recursive: true, force: true }));
  const path = join(dir, "operator.json");
  const value = fixture();
  await writeFile(path, JSON.stringify(value), { mode: 0o600 });
  const memory = validatePenpotLocalConfiguration(value, local);
  assert.deepEqual(memory, await loadPenpotLocalConfiguration(path, local));
  assert.equal(memory.sessions.get(owner).cookie, value.sessions[0].cookie);
  assert.throws(() => validatePenpotLocalConfiguration(value, {}), /explicit local/);
  assert.throws(() => validatePenpotLocalConfiguration(value, { ...local, K_SERVICE: "cloud" }), /Cloud Run/);
  for (const change of [
    v => v.sessions.push(structuredClone(v.sessions[0])),
    v => v.sessions[0].cookie = "invalid\r\nheader",
    v => v.sessions[0].ownerPrincipal = "55555555-5555-4555-8555-555555555555",
    v => v.manifests[0].manifest.ownerPrincipal = "55555555-5555-4555-8555-555555555555",
    v => v.manifests.push(structuredClone(v.manifests[0])),
    v => v.targets[0].editorVersion = "unknown",
    v => v.arbitraryEndpoint = "https://example.invalid",
  ]) {
    const invalid = fixture(); change(invalid);
    assert.throws(() => validatePenpotLocalConfiguration(invalid, local));
    await writeFile(path, JSON.stringify(invalid), { mode: 0o600 });
    await assert.rejects(() => loadPenpotLocalConfiguration(path, local));
  }
});

test("trusted runtime loader is constructor-only and cannot bypass local or Google admission", async () => {
  const { createPenpotStudioRuntime } = await import("./penpot-studio-runtime.js");
  const { validatePenpotLocalConfiguration } = await import("./penpot-local-configuration.js");
  let calls = 0;
  const configurationLoader = async (_path, env) => {
    calls += 1;
    return validatePenpotLocalConfiguration(fixture(), env);
  };
  for (const env of [{}, { ...local, K_SERVICE: "cloud" }]) {
    await assert.rejects(() => createPenpotStudioRuntime({ identity: { configuration: { mode: "google" } }, env, configurationLoader }), /explicit local/);
  }
  await assert.rejects(() => createPenpotStudioRuntime({ identity: { configuration: { mode: "password" } }, env: local, configurationLoader }), /managed Google/);
  assert.equal(calls, 0);
  // Stop at the injected loader: proves server injection is called only after gates,
  // without requiring any native network, repository initialization or credential.
  const sentinel = new Error("controlled loader reached");
  await assert.rejects(() => createPenpotStudioRuntime({ identity: { configuration: { mode: "google" } }, env: local, configurationPath: "/controlled/private.json", configurationLoader: async (path, env) => { assert.equal(path, "/controlled/private.json"); assert.equal(env, local); throw sentinel; } }), e => e === sentinel);
});
