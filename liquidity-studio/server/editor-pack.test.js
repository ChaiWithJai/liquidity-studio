import test from "node:test";
import assert from "node:assert/strict";
import { DurableStore } from "./storage.js";
import { ScopedRepository } from "./repository.js";
import { NativeEditorService } from "./native-editor.js";
import { EditorPackService } from "./editor-pack-service.js";
import { nativeFontRegistry } from "./native-editor-fonts.js";
import { campaignFromApprovedClaims } from "./source-integrity.js";
import { brandRevision } from "./multimodal-contract.js";
import { validateEditorPack, jsonDigest } from "./editor-pack.js";
const actor = { id: "owner", role: "founder" };
async function fixture(
  t,
  preset = "liquidity_desk",
  empty = false,
  brandId = "brand",
) {
  const store = new DurableStore(":memory:");
  t.after(() => store.close());
  const scope = { organizationId: "organization", brandId, preset };
  await store.update("identity", () => ({ users: [actor], memberships: [] }));
  const identity = {
    authorize: async (user) => {
      if (user.id !== actor.id)
        throw Object.assign(new Error("Forbidden"), { status: 403 });
    },
  };
  const repo = new ScopedRepository(store, scope);
  await repo.ready;
  await repo.mutate((state) => {
    state.backlog = [];
    return state;
  });
  if (!empty) {
    const story = {
      id: "story",
      title: "Portable controlled source",
      revision: 2,
      generationId: "gen",
      sourceClaims: [
        {
          id: "claim",
          text: "An approved source excerpt for the portable fixture.",
          sourceUrl: "https://example.org/portable",
          kind: "general",
          status: "approved",
        },
      ],
    };
    story.campaignDraft = {
      ...campaignFromApprovedClaims(story),
      provenance: { generationId: "gen", mode: "synthetic" },
    };
    await repo.mutate((state) => {
      state.backlog = [story];
      return state;
    });
  }
  const native = new NativeEditorService({
    repo,
    identity,
    scope,
    availableFonts: nativeFontRegistry(),
  });
  const service = new EditorPackService({ native });
  return { store, repo, native, service, scope, identity };
}
const input = {
  target: { organizationId: "organization", brandId: "brand" },
  principalRemap: { owner: "owner" },
  sourceReviewAcknowledged: true,
  idempotencyKey: "portable_restore_fixture_0001",
};
async function allFormats(f) {
  const state = await f.repo.read(),
    story = state.backlog[0];
  const records = [];
  for (const format of ["infographic", "carousel", "story", "reel"]) {
    const created = await f.native.create(actor, {
      storyId: story.id,
      format,
      expectedRevision: story.revision,
      generationId: "gen",
      expectedBrandRevision: brandRevision(state.brandProfile),
      idempotencyKey: `create_portable_${format}`,
    });
    const document = structuredClone(created.document);
    document.pages[0].objects.find((o) => o.id === "headline_layer").text =
      `Retained human ${format}`;
    records.push(
      await f.native.save(actor, created.id, {
        expectedRevision: 1,
        title: created.title,
        document,
        idempotencyKey: `save_portable_${format}`,
      }),
    );
  }
  return records;
}
test("deletion-independent both-brand four-format packs restore exact scenes/history and remain natively editable", async (t) => {
  for (const preset of ["liquidity_desk", "vedic_dharma"]) {
    const source = await fixture(t, preset),
      records = await allFormats(source),
      pack = await source.service.export(actor);
    assert.equal(pack.documents.length, 4);
    assert.equal(pack.fonts.length, 5);
    validateEditorPack(pack);
    for (const key of source.store.keys("")) source.store.delete(key);
    const target = await fixture(t, preset, true, "fresh-brand");
    const targetInput = {
      ...input,
      target: { organizationId: "organization", brandId: "fresh-brand" },
    };
    const result = await target.service.install(actor, pack, targetInput);
    assert.equal(result.documents, 4);
    assert.deepEqual(
      await target.service.install(actor, pack, targetInput),
      result,
    );
    for (const original of records) {
      const restored = await target.native.read(actor, original.id);
      assert.deepEqual(restored.document, original.document);
      assert.equal(restored.sourceState, "current");
      assert.equal(restored.receipts, undefined);
      assert.equal(restored.restoredHistory.length, 2);
      const document = structuredClone(restored.document);
      document.pages[0].objects.find((o) => o.id === "headline_layer").text =
        "Fresh installation edit";
      const saved = await target.native.save(actor, restored.id, {
        expectedRevision: 2,
        title: restored.title,
        document,
        idempotencyKey: `fresh_installation_edit_${restored.format}`,
      });
      assert.equal(saved.revision, 3);
      assert.deepEqual(
        (await target.native.read(actor, saved.id)).document,
        document,
      );
    }
  }
});
test("tampered bytes/version/credentials/foreign references and missing explicit destination fail before writes", async (t) => {
  const f = await fixture(t);
  await allFormats(f);
  const pack = await f.service.export(actor),
    target = await fixture(t, "liquidity_desk", true),
    before = target.store.keys("");
  for (const change of [
    (p) => (p.schemaVersion = 2),
    (p) => (p.files[0].base64 = "AAAA"),
    (p) => (p.documents[0].metadata.brandId = "foreign"),
    (p) => (p.documents[0].metadata.origin.credentials = "secret"),
  ]) {
    const bad = structuredClone(pack);
    change(bad);
    const { sha256, ...content } = bad;
    bad.sha256 = jsonDigest(content);
    await assert.rejects(target.service.install(actor, bad, input));
    assert.deepEqual(target.store.keys(""), before);
  }
  await assert.rejects(
    target.service.install(actor, pack, {
      ...input,
      target: { organizationId: "foreign", brandId: "brand" },
    }),
    { status: 403 },
  );
  await assert.rejects(
    target.service.install(actor, pack, { ...input, principalRemap: {} }),
    { status: 403 },
  );
});
test("staging failure hides partial state and rolls back only installation-owned data", async (t) => {
  const f = await fixture(t);
  await allFormats(f);
  const pack = await f.service.export(actor),
    target = await fixture(t, "liquidity_desk", true),
    before = await target.repo.read();
  const update = target.store.update.bind(target.store);
  let writes = 0,
    blocked = false;
  target.store.update = (key, fn) => {
    if (key.startsWith(target.native.prefix)) {
      blocked =
        target.store.get(target.repo.key).editorRestore.status === "installing";
      if (++writes === 2) throw new Error("Injected disk write failure");
    }
    return update(key, fn);
  };
  await assert.rejects(
    target.service.install(actor, pack, input),
    /Injected disk/,
  );
  assert.equal(blocked, true);
  assert.deepEqual(await target.repo.read(), before);
  assert.deepEqual(target.store.keys(target.native.prefix), []);
});
test("capacity failure and populated destination refuse mutation", async (t) => {
  const source = await fixture(t);
  await allFormats(source);
  const pack = await source.service.export(actor),
    target = await fixture(t, "liquidity_desk", true);
  target.service.capacityCheck = async () => {
    throw new Error("Insufficient disk headroom");
  };
  await assert.rejects(
    target.service.install(actor, pack, input),
    /disk headroom/,
  );
  assert.equal(target.store.get(target.service.journalKey), null);
  await assert.rejects(source.service.install(actor, pack, input), {
    status: 409,
  });
});
test("revoked owner cannot activate or continue an interrupted installation; current founder can roll it back", async (t) => {
  const source = await fixture(t);
  await allFormats(source);
  const pack = await source.service.export(actor),
    target = await fixture(t, "liquidity_desk", true);
  const update = target.store.update.bind(target.store);
  let staged = false;
  target.store.update = (key, fn) => {
    const value = update(key, fn);
    if (key.startsWith(target.native.prefix) && !staged) {
      staged = true;
      update("identity", (state) => ({ ...state, users: [] }));
    }
    return value;
  };
  await assert.rejects(
    target.service.install(actor, pack, input),
    (error) => error.status === 403 && error.restoreRecoveryRequired === true,
  );
  await assert.rejects(target.repo.read(), { status: 423 });
  const resumed = new EditorPackService({ native: target.native });
  await assert.rejects(
    resumed.rollback(actor, { idempotencyKey: input.idempotencyKey }),
    { status: 403 },
  );
  update("identity", (state) => ({ ...state, users: [actor] }));
  await resumed.rollback(actor, { idempotencyKey: input.idempotencyKey });
  assert.deepEqual(target.store.keys(target.native.prefix), []);
  assert.equal((await target.repo.read()).backlog.length, 0);
});
test("rollback refuses deletion of a record no longer owned by its journal", async (t) => {
  const target = await fixture(t, "liquidity_desk", true),
    id = "installation-owned",
    foreign = `${target.native.prefix}payload:collision`;
  const before = await target.repo.read();
  target.store.update(target.repo.key, () => ({
    ...before,
    editorRestore: { id, status: "installing" },
  }));
  target.store.update(target.service.journalKey, () => ({
    id,
    key: input.idempotencyKey,
    status: "installing",
    before,
    plannedKeys: [foreign],
  }));
  target.store.update(foreign, () => ({ document: "different writer" }));
  await assert.rejects(
    target.service.rollback(actor, { idempotencyKey: input.idempotencyKey }),
    { status: 409 },
  );
  assert.equal(target.store.get(foreign).document, "different writer");
  await assert.rejects(target.repo.read(), { status: 423 });
});
test("actual process interruption preserves a durable reservation and fresh-process rollback restores the empty database", async (t) => {
  const { mkdtempSync, writeFileSync, rmSync } = await import("node:fs");
  const { tmpdir } = await import("node:os");
  const { join } = await import("node:path");
  const { spawnSync } = await import("node:child_process");
  const directory = mkdtempSync(join(tmpdir(), "editor-pack-crash-"));
  t.after(() => rmSync(directory, { recursive: true, force: true }));
  const source = await fixture(t);
  await allFormats(source);
  const pack = await source.service.export(actor),
    empty = await fixture(t, "liquidity_desk", true);
  const filename = join(directory, "target.sqlite"),
    packfile = join(directory, "pack.json"),
    target = new DurableStore(filename);
  target.update("identity", () => ({ users: [actor], memberships: [] }));
  target.update(empty.repo.key, () => empty.store.get(empty.repo.key));
  target.backup(join(directory, "pre-restore.sqlite"));
  target.close();
  writeFileSync(packfile, JSON.stringify(pack), { mode: 0o600 });
  const script = `import{readFileSync}from'node:fs';import{DurableStore}from'./server/storage.js';import{ScopedRepository}from'./server/repository.js';import{NativeEditorService}from'./server/native-editor.js';import{EditorPackService}from'./server/editor-pack-service.js';const store=new DurableStore(process.argv[1]);const repo=new ScopedRepository(store,${JSON.stringify(empty.scope)});await repo.ready;const native=new NativeEditorService({store,repo,scope:${JSON.stringify(empty.scope)},identity:{authorize:async()=>{}}});const update=store.update.bind(store);store.update=(key,fn)=>{const value=update(key,fn);if(key.startsWith(native.prefix))process.exit(86);return value;};await new EditorPackService({native}).install(${JSON.stringify(actor)},JSON.parse(readFileSync(process.argv[2])),${JSON.stringify(input)});`;
  const child = spawnSync(
    process.execPath,
    ["--input-type=module", "-e", script, filename, packfile],
    { encoding: "utf8" },
  );
  assert.equal(child.status, 86, child.stderr);
  const recovered = new DurableStore(filename);
  t.after(() => recovered.close());
  const repo = new ScopedRepository(recovered, empty.scope);
  await repo.ready;
  await assert.rejects(repo.read(), { status: 423 });
  const native = new NativeEditorService({
      repo,
      scope: empty.scope,
      identity: empty.identity,
    }),
    service = new EditorPackService({ native });
  await assert.rejects(native.read(actor, pack.documents[0].metadata.id), {
    status: 423,
  });
  await service.rollback(actor, { idempotencyKey: input.idempotencyKey });
  assert.deepEqual(await repo.read(), await empty.repo.read());
  assert.deepEqual(recovered.keys(native.prefix), []);
});
test("two concurrent installers cannot activate separate intents into one fresh scope", async (t) => {
  const source = await fixture(t);
  await allFormats(source);
  const pack = await source.service.export(actor),
    target = await fixture(t, "liquidity_desk", true);
  const competing = new EditorPackService({ native: target.native });
  const results = await Promise.allSettled([
    target.service.install(actor, pack, input),
    competing.install(actor, pack, {
      ...input,
      idempotencyKey: "second_competing_restore_key",
    }),
  ]);
  assert.equal(results.filter((item) => item.status === "fulfilled").length, 1);
  assert.equal(results.filter((item) => item.status === "rejected").length, 1);
  assert.equal((await target.repo.read()).backlog.length, 1);
  assert.equal(target.store.keys(`${target.native.prefix}document:`).length, 4);
});
test("ejection rejects a concurrent new native document, image, or review update instead of silently omitting work", async (t) => {
  for (const change of ["document", "asset", "review"]) {
    const source = await fixture(t);
    const records = await allFormats(source),
      original = source.native.hydrate.bind(source.native);
    let changed = false;
    if (change === "review")
      source.store.update(
        `editor-review:organization:brand:${records[0].id}`,
        () => ({
          schemaVersion: 1,
          nativeId: records[0].id,
          revision: 1,
          history: [],
        }),
      );
    source.native.hydrate = async (...args) => {
      if (!changed) {
        changed = true;
        if (change === "document") {
          const state = await source.repo.read();
          await source.native.create(actor, {
            storyId: "story",
            format: "story",
            expectedRevision: 2,
            generationId: "gen",
            expectedBrandRevision: brandRevision(state.brandProfile),
            idempotencyKey: "concurrent_added_native_document",
          });
        }
        if (change === "asset")
          source.store.update(
            `${source.native.prefix}asset:${"a".repeat(32)}`,
            () => ({ id: "a".repeat(32), createdBy: actor.id }),
          );
        if (change === "review")
          source.store.update(
            `editor-review:organization:brand:${records[0].id}`,
            (current) => ({ ...current, revision: 2 }),
          );
      }
      return original(...args);
    };
    await assert.rejects(
      source.service.export(actor),
      (error) => error.status === 409 && /changed/.test(error.message),
    );
  }
});
