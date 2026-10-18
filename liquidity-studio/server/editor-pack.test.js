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
    (p) => (p.schemaVersion = 3),
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
  const transact = target.store.transact.bind(target.store);
  let writes = 0,
    blocked = false;
  target.store.transact = (keys, fn) => {
    if (keys.some((key) => key.startsWith(target.native.prefix))) {
      blocked =
        target.store.get(target.repo.key).editorRestore.status === "installing";
      if (++writes === 2) throw new Error("Injected disk write failure");
    }
    return transact(keys, fn);
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
  const update = target.store.update.bind(target.store),
    transact = target.store.transact.bind(target.store);
  let staged = false;
  target.store.transact = (keys, fn) => {
    const value = transact(keys, fn);
    if (keys.some((key) => key.startsWith(target.native.prefix)) && !staged) {
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
  const script = `import{readFileSync}from'node:fs';import{DurableStore}from'./server/storage.js';import{ScopedRepository}from'./server/repository.js';import{NativeEditorService}from'./server/native-editor.js';import{EditorPackService}from'./server/editor-pack-service.js';const store=new DurableStore(process.argv[1]);const repo=new ScopedRepository(store,${JSON.stringify(empty.scope)});await repo.ready;const native=new NativeEditorService({store,repo,scope:${JSON.stringify(empty.scope)},identity:{authorize:async()=>{}}});const transact=store.transact.bind(store);store.transact=(keys,fn)=>{const value=transact(keys,fn);if(keys.some(key=>key.startsWith(native.prefix)))process.exit(86);return value;};await new EditorPackService({native}).install(${JSON.stringify(actor)},JSON.parse(readFileSync(process.argv[2])),${JSON.stringify(input)});`;
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
async function processFixture(t) {
  const { mkdtempSync, writeFileSync, rmSync } = await import("node:fs"),
    { tmpdir } = await import("node:os"),
    { join } = await import("node:path"),
    { spawnSync } = await import("node:child_process");
  const directory = mkdtempSync(join(tmpdir(), "editor-pack-races-"));
  t.after(() => rmSync(directory, { recursive: true, force: true }));
  const source = await fixture(t);
  await allFormats(source);
  const pack = await source.service.export(actor),
    empty = await fixture(t, "liquidity_desk", true),
    before = await empty.repo.read();
  const filename = join(directory, "target.sqlite"),
    packfile = join(directory, "pack.json"),
    store = new DurableStore(filename);
  t.after(() => store.close());
  store.update("identity", () => ({ users: [actor], memberships: [] }));
  store.update(empty.repo.key, () => before);
  writeFileSync(packfile, JSON.stringify(pack), { mode: 0o600 });
  const repo = new ScopedRepository(store, empty.scope);
  await repo.ready;
  const native = new NativeEditorService({
      repo,
      scope: empty.scope,
      identity: empty.identity,
    }),
    service = new EditorPackService({ native });
  const nextInput = {
    ...input,
    idempotencyKey: "new_process_installation_key",
  };
  const child = (mode) => {
    const result = spawnSync(
      process.execPath,
      [
        "tests/fixtures/editor-pack-child.mjs",
        filename,
        packfile,
        JSON.stringify(empty.scope),
        JSON.stringify(actor),
        JSON.stringify(nextInput),
        mode,
        input.idempotencyKey,
      ],
      { encoding: "utf8" },
    );
    assert.equal(result.status, 0, result.stderr);
  };
  return { store, repo, native, service, before, pack, child, nextInput };
}
test("two processes: releasing rollback never deletes a new installer journal", async (t) => {
  const f = await processFixture(t),
    id = "old-empty-reservation";
  f.store.update(f.repo.key, () => ({
    ...f.before,
    editorRestore: { id, status: "installing" },
  }));
  f.store.update(f.service.journalKey, () => ({
    id,
    status: "installing",
    key: input.idempotencyKey,
    before: f.before,
    plannedKeys: [],
  }));
  const transact = f.store.transact.bind(f.store);
  let interleaved = false;
  f.store.transact = (keys, callback) => {
    const result = transact(keys, callback);
    if (
      !interleaved &&
      keys.includes(f.service.journalKey) &&
      f.store.get(f.service.journalKey) === null
    ) {
      interleaved = true;
      f.child("install");
    }
    return result;
  };
  await f.service.rollback(actor, { idempotencyKey: input.idempotencyKey });
  assert.equal(interleaved, true);
  assert.equal(
    f.store.get(f.service.journalKey)?.key,
    f.nextInput.idempotencyKey,
  );
  assert.equal(f.store.get(f.service.journalKey)?.status, "completed");
  assert.equal(
    (await f.service.install(actor, f.pack, f.nextInput)).restored,
    true,
  );
});
test("two processes: a stale recovery cannot delete a replacement installer document", async (t) => {
  const f = await processFixture(t);
  await f.service.install(actor, f.pack, input);
  const original = f.store.get(f.service.journalKey);
  f.store.update(f.repo.key, () => ({
    ...f.before,
    editorRestore: { id: original.id, status: "installing" },
  }));
  f.store.update(f.service.journalKey, () => ({
    ...original,
    status: "installing",
  }));
  const target = f.native.key(f.pack.documents[0].metadata.id),
    deleteIf = f.store.deleteIf.bind(f.store),
    remove = f.store.delete.bind(f.store);
  let interleaved = false;
  const replace = () => {
    if (interleaved) return;
    interleaved = true;
    f.store.update(f.service.journalKey, (current) => ({
      ...current,
      rollbackLeaseExpiresAt: 0,
    }));
    f.child("rollback-install");
  };
  f.store.deleteIf = (key, keys, guard) => {
    if (key === target) replace();
    return deleteIf(key, keys, guard);
  };
  // Retains the pre-fix interleaving: old code deleted after a separate owner read.
  f.store.delete = (key) => {
    if (key === target) replace();
    return remove(key);
  };
  await assert.rejects(
    f.service.rollback(actor, { idempotencyKey: input.idempotencyKey }),
    { status: 409 },
  );
  assert.equal(interleaved, true);
  assert.ok(f.store.get(target));
  assert.notEqual(f.store.get(target).restoreInstallationId, original.id);
  assert.equal(
    (await f.native.read(actor, f.pack.documents[0].metadata.id)).sourceState,
    "current",
  );
});
test("a crashed rollback lease blocks another recovery until expiry, then permits a new token", async (t) => {
  const target = await fixture(t, "liquidity_desk", true),
    before = await target.repo.read(),
    id = "interrupted-rollback",
    at = Date.now();
  target.store.update(target.repo.key, () => ({
    ...before,
    editorRestore: { id, status: "installing" },
  }));
  target.store.update(target.service.journalKey, () => ({
    id,
    status: "rolling-back",
    key: input.idempotencyKey,
    before,
    plannedKeys: [],
    rollbackToken: "crashed-process-token",
    rollbackLeaseExpiresAt: at + 60000,
  }));
  const now = new EditorPackService({
    native: target.native,
    now: () => new Date(at).toISOString(),
  });
  await assert.rejects(
    now.rollback(actor, { idempotencyKey: input.idempotencyKey }),
    { status: 409 },
  );
  await assert.rejects(target.repo.read(), { status: 423 });
  const later = new EditorPackService({
    native: target.native,
    now: () => new Date(at + 60001).toISOString(),
  });
  assert.equal(
    (await later.rollback(actor, { idempotencyKey: input.idempotencyKey }))
      .rolledBack,
    true,
  );
  assert.deepEqual(await target.repo.read(), before);
});
test("re-ejection retains original authors, original source binding and historical approvals without reviving review authority", async (t) => {
  const source = await fixture(t);
  const records = await allFormats(source),
    original = records[0];
  source.store.update(
    `editor-review:organization:brand:${original.id}`,
    () => ({
      schemaVersion: 1,
      nativeId: original.id,
      organizationId: "organization",
      brandId: "brand",
      revision: 4,
      stage: "Approved",
      approval: { approvedBy: actor.id, approvedAt: new Date().toISOString() },
      history: [{ action: "approve", actorId: actor.id }],
      journal: [{ key: "original_actor_replay_key" }],
    }),
  );
  const first = await source.service.export(actor),
    target = await fixture(t, "liquidity_desk", true, "second-brand"),
    firstOptions = {
      ...input,
      target: { organizationId: "organization", brandId: "second-brand" },
    };
  await target.service.install(actor, first, firstOptions);
  const second = await target.service.export(actor);
  assert.equal(
    second.documents.find(item=>item.metadata.id===original.id).metadata.portableHistory.sourceCreatedBy,
    actor.id,
  );
  assert.deepEqual(
    second.documents.find(item=>item.metadata.id===original.id).metadata.portableHistory.sourceOrigin,
    original.origin,
  );
  assert.equal(
    second.documents.find(item=>item.metadata.id===original.id).metadata.portableHistory.restorations.length,
    1,
  );
  const final = await fixture(t, "liquidity_desk", true, "third-brand");
  await final.service.install(actor, second, {
    ...input,
    target: { organizationId: "organization", brandId: "third-brand" },
  });
  const restored = await final.native.read(actor, original.id);
  assert.deepEqual(restored.portableHistory.sourceOrigin, original.origin);
  assert.equal(restored.portableHistory.restorations.length, 2);
  assert.equal(
    restored.portableHistory.reviewHistory.authority,
    "historical-only",
  );
  assert.equal(restored.portableHistory.reviewHistory.record.stage, "Approved");
  assert.equal(
    restored.portableHistory.reviewHistory.record.journal,
    undefined,
  );
  assert.deepEqual(final.store.keys("editor-review:"), []);
});

test('portable export rejects unsupported current and retained historical fonts without changing native save', async t => {
  const f = await fixture(t);
  const state = await f.repo.read();
  const created = await f.native.create(actor, {storyId:'story', format:'infographic', expectedRevision:state.backlog[0].revision, generationId:'gen', expectedBrandRevision:brandRevision(state.brandProfile), idempotencyKey:'font_portability_create'});
  const document = structuredClone(created.document);
  document.pages[0].objects.find(o => o.id === 'headline_layer').fontFamily = 'Uninstalled Custom Font';
  const saved = await f.native.save(actor, created.id, {expectedRevision:1, title:created.title, document, idempotencyKey:'font_portability_save'});
  assert.equal(saved.document.pages[0].objects.find(o => o.id === 'headline_layer').fontFamily, 'Uninstalled Custom Font');
  await assert.rejects(f.service.export(actor), /font not included/);
  document.pages[0].objects.find(o => o.id === 'headline_layer').fontFamily = 'Inter';
  await f.native.save(actor, created.id, {expectedRevision:2, title:created.title, document, idempotencyKey:'font_portability_supported_save'});
  await assert.rejects(f.service.export(actor), /font not included/);
});

test('completed signed-off PNG survives fresh-scope install as exact historical bytes without live export authority', async t => {
  const {EditorApprovalService}=await import('./editor-approval.js');
  const {EditorExportService}=await import('./editor-export.js');
  const sharp=(await import('sharp')).default;
  const f=await fixture(t),[native]=await allFormats(f);
  const approval=new EditorApprovalService({repo:f.repo,scope:f.scope,identity:f.identity,native:f.native});
  let revision=0;
  for(const action of ['create','start','submit','approve'])await approval.transition(actor,native.id,{action,expectedRevision:revision++,expectedNativeRevision:2,idempotencyKey:`pack_review_${action}_unique`});
  const exporter=new EditorExportService({approval});
  const bytes=await sharp({create:{width:1080,height:1350,channels:3,background:'#f2a93b'}}).png().toBuffer();
  const staged=await exporter.stage(actor,native.id,{expectedReviewRevision:4,expectedNativeRevision:2,pageIndex:0,base64:bytes.toString('base64'),idempotencyKey:'pack_final_png_stage_unique'});
  const envelope=await exporter.signoff(actor,native.id,staged.artifactId,{sha256:staged.sha256,reviewed:true});
  const receipt=await exporter.complete(actor,native.id,envelope);
  const newer=structuredClone(native.document);newer.pages[0].objects.find(object=>object.id==='headline_layer').text='Edited after the completed export';
  await f.native.save(actor,native.id,{expectedRevision:2,title:native.title,document:newer,idempotencyKey:'edited_after_completed_png'});
  await approval.transition(actor,native.id,{action:'restart',expectedRevision:4,expectedNativeRevision:3,idempotencyKey:'restart_after_completed_png'});
  assert.equal((await approval.read(actor,native.id)).exports,undefined);
  assert.equal((await f.store.get(`editor-export:organization:brand:events:${native.id}`)).events.length,1);
  let inlinePayloadReads=0;const read=f.store.get.bind(f.store);
  f.store.get=key=>{if(key.startsWith('editor-export:organization:brand:bytes:'))inlinePayloadReads++;return read(key);};
  const pack=await f.service.export(actor);f.store.get=read;
  assert.equal(inlinePayloadReads,1,'immutable payload must be loaded only when its checked receipt is consumed');
  assert.equal(pack.schemaVersion,2);assert.equal(pack.documents.find(doc=>doc.metadata.id===native.id).finalExports.length,1);assert.deepEqual(pack.documents.find(doc=>doc.metadata.id===native.id).finalExports[0].receipt,receipt);
  assert.equal(JSON.stringify(pack).includes(envelope.signature),false);
  const target=await fixture(t,'liquidity_desk',true,'restored-final');
  await target.service.install(actor,pack,{...input,target:{organizationId:'organization',brandId:'restored-final'}});
  const historical=await target.service.historicalExportBytes(actor,native.id,receipt.artifactId);
  assert.deepEqual(Buffer.from(historical.base64,'base64'),bytes);assert.equal(historical.authority,'historical-only');
  assert.equal(historical.receipt.signedOffBy,'owner');
  assert.equal((await target.store.keys(`editor-review:organization:restored-final:`)).length,0);
  assert.equal((await target.store.keys(`editor-export:organization:restored-final:`)).length,0);
  const repeated=await target.service.export(actor);
  assert.deepEqual(repeated.documents.find(doc=>doc.metadata.id===native.id).finalExports[0].receipt,receipt);
  const current=await target.native.read(actor,native.id);
  current.document.pages[0].objects.find(o=>o.id==='headline_layer').text='Editable restored human layout';
  await target.native.save(actor,native.id,{expectedRevision:current.revision,title:current.title,document:current.document,idempotencyKey:'restored_layout_after_final_png'});
  assert.deepEqual(Buffer.from((await target.service.historicalExportBytes(actor,native.id,receipt.artifactId)).base64,'base64'),bytes);
});

test('unfinished prepared evidence and saved copy restore as historical, survive repeated ejection and never import execution receipts', async t => {
 const {digest}=await import('./editor-pack.js');
 const source=await fixture(t),state=await source.repo.read(),story=state.backlog[0],text=story.sourceClaims[0].text;
 const candidate={schemaVersion:1,id:'unfinished-candidate',...source.scope,storyId:story.id,contentRevision:story.contentRevision||1,inputFingerprint:'a'.repeat(64),brandRevision:brandRevision(state.brandProfile),jobId:'old-job',itemId:'old-item',attemptId:'old-attempt',createdAt:'2026-10-18T00:00:00Z',excerpts:[{evidenceId:'evidence',sourceUrl:'https://example.org/portable',text,startOffset:0,status:'unreviewed',clinicalReview:null}],artwork:campaignFromApprovedClaims(story),provenance:{purpose:'source-preparation',mode:'extractive-unreviewed',humanApproval:'none',requiresReview:true,provider:'none',modelCalls:0,evidenceIds:['evidence']}};
 const evidence={id:'evidence',schemaVersion:1,requestedUrl:'https://example.org/portable',sourceUrl:'https://example.org/portable',retrievedAt:'2026-10-18T00:00:00Z',contentType:'text/plain',responseSha256:digest(Buffer.from(text)),responseBytes:Buffer.byteLength(text),text,textSha256:digest(Buffer.from(text)),status:'unreviewed',approval:'none'};
 const workingArtwork=structuredClone(candidate.artwork);workingArtwork.infographic.headline='Retained unfinished human copy';
 await source.repo.mutate(state=>({...state,preparedSourceCandidates:[{candidate,evidence:[evidence],revision:2,workingArtwork,editorialStatus:'unreviewed',edits:[{id:'old-edit',actorId:'owner'}],promotionReceipts:[]}]}));
 const pack=await source.service.export(actor),target=await fixture(t,'liquidity_desk',true,'prepared-target');
 await target.service.install(actor,pack,{...input,target:{organizationId:'organization',brandId:'prepared-target'}});
 const restored=(await target.repo.read()).preparedSourceCandidates[0];
 assert.equal(restored.candidate.id,candidate.id);assert.equal(restored.candidate.brandId,'prepared-target');
 assert.equal(restored.workingArtwork.infographic.headline,'Retained unfinished human copy');
 assert.deepEqual(restored.evidence,[evidence]);assert.equal(restored.restoredHistorical.packSha256,pack.sha256);
 assert.equal(restored.candidate.jobId,null);assert.equal(restored.edits,undefined);assert.equal(restored.promotionReceipts,undefined);
 const second=await target.service.export(actor),validated=validateEditorPack(second),history=validated.json(second.preparedHistory);
 assert.equal(history[0].sourceScope.brandId,'brand');assert.equal(history[0].authority,'historical-only');
 assert.deepEqual(history[0].workingArtwork,workingArtwork);
});

test('version 1 editor packs remain restorable without silently accepting version 2 fields',async t=>{
 const source=await fixture(t);await allFormats(source);
 const exported=await source.service.export(actor),{preparedHistory,...legacy}=structuredClone(exported);
 legacy.schemaVersion=1;for(const doc of legacy.documents)delete doc.finalExports;
 const {sha256,...content}=legacy;legacy.sha256=jsonDigest(content);
 const target=await fixture(t,'liquidity_desk',true);await target.service.install(actor,legacy,input);
 assert.equal((await target.native.list(actor,{storyId:'story',format:'carousel'})).documents.length,1);
});

test('ejection stops before later scene hydration when file or encoded-byte budget is reached, without writes',async t=>{
 const {createPackFileCollection,PACK_LIMITS}=await import('./editor-pack.js');
 for(const mode of ['bytes','files']){
  const f=await fixture(t),state=await f.repo.read();
  const created=await f.native.create(actor,{storyId:'story',format:'infographic',expectedRevision:state.backlog[0].revision,generationId:'gen',expectedBrandRevision:brandRevision(state.brandProfile),idempotencyKey:`bounded_export_create_${mode}`});
  const document=structuredClone(created.document);document.pages[0].objects.find(object=>object.id==='headline_layer').text='Second retained human scene';
  await f.native.save(actor,created.id,{expectedRevision:1,title:created.title,document,idempotencyKey:`bounded_export_save_${mode}`});
  const before=await Promise.all((await f.store.keys('')).map(async key=>[key,await f.store.get(key)]));
  let hydrated=0;const hydrate=f.native.hydrate.bind(f.native);f.native.hydrate=async(...args)=>{hydrated++;return hydrate(...args);};
  const service=new EditorPackService({native:f.native,createFiles:()=>createPackFileCollection({...PACK_LIMITS,...(mode==='bytes'?{bytes:220}:{files:1})})});
  await assert.rejects(service.export(actor),{status:413});
  assert.equal(hydrated,mode==='bytes'?1:2,'must stop before hydrating later snapshots/current/initial scenes');
  assert.deepEqual(await Promise.all((await f.store.keys('')).map(async key=>[key,await f.store.get(key)])),before);
 }
});

test('combined retained/live native history count is checked before any scene is hydrated',async t=>{
 const f=await fixture(t),state=await f.repo.read();
 const record=await f.native.create(actor,{storyId:'story',format:'infographic',expectedRevision:state.backlog[0].revision,generationId:'gen',expectedBrandRevision:brandRevision(state.brandProfile),idempotencyKey:'oversized_history_export_create'});
 await f.store.update(f.native.key(record.id),value=>({...value,restoredHistory:Array.from({length:100},()=>({documentRef:value.documentRef,revision:1,title:value.title,updatedBy:actor.id,updatedAt:value.updatedAt}))}));
 const before=await Promise.all((await f.store.keys('')).map(async key=>[key,await f.store.get(key)]));
 let hydrated=0;const hydrate=f.native.hydrate.bind(f.native);f.native.hydrate=async(...args)=>{hydrated++;return hydrate(...args);};
 await assert.rejects(f.service.export(actor),{status:413});assert.equal(hydrated,0);
 assert.deepEqual(await Promise.all((await f.store.keys('')).map(async key=>[key,await f.store.get(key)])),before);
});


test("export preflights exact projected repository lineage without writes or file collection", async (t) => {
  const source = await fixture(t);
  await source.repo.mutate((state) => {
    state.usage.push({storyId: "story", generationId: "missing-trace"});
    return state;
  });
  const snapshot = async () => Promise.all((await source.store.keys("")).sort().map(async key => [key, await source.store.get(key)]));
  const before = await snapshot();
  let collections = 0;
  const service = new EditorPackService({native: source.native, createFiles: () => { collections++; throw Error("Must validate before collecting files"); }});
  await assert.rejects(service.export(actor), {status: 400, message: "Orphaned generation lineage"});
  assert.equal(collections, 0);
  assert.deepEqual(await snapshot(), before);
  // Correct the controlled fixture explicitly; export must not manufacture this trace.
  await source.repo.mutate((state) => {
    state.telemetry.traces.push({traceId: "missing-trace", storyId: "story"});
    return state;
  });
  const corrected = await snapshot();
  const pack = await source.service.export(actor);
  assert.deepEqual(await snapshot(), corrected);
  const target = await fixture(t, "liquidity_desk", true, "preflight-target");
  await target.service.install(actor, pack, {...input, target: {organizationId: "organization", brandId: "preflight-target"}});
  assert.equal((await target.repo.read()).usage[0].generationId, "missing-trace");
});

test("legacy cloud metadata rejects oversized or invalid declarations before any download", async (t) => {
  const { createHash } = await import("node:crypto");
  for (const mode of ["oversized", "fractional", "mismatched-size"]) {
    const f = await fixture(t);
    const sha256 = createHash("sha256").update("abc").digest("hex");
    await f.repo.mutate(state => {
      state.assets = [{id:"legacy", storyId:"story", filename:"notes.txt", contentType:"text/plain", sha256,
        ...(mode === "mismatched-size" ? {size:4} : {}),
        artifactRef:{size:mode === "oversized" ? 20*1024*1024 : mode === "fractional" ? 3.5 : 3, sha256}}];
      return state;
    });
    let downloads = 0;
    f.store.downloadArtifact = async () => { downloads++; throw Error("Must not download"); };
    const snapshot = async () => Promise.all((await f.store.keys("")).sort().map(async key => [key, await f.store.get(key)]));
    const before = await snapshot();
    await assert.rejects(f.service.export(actor), {status:mode === "oversized" ? 413 : 400});
    assert.equal(downloads, 0);
    assert.deepEqual(await snapshot(), before);
  }
});

test("pack legacy downloads are sequential and valid historical records need no optional size field", async (t) => {
  const { createHash } = await import("node:crypto");
  const f = await fixture(t), bytes = Buffer.from("abc"), sha256 = createHash("sha256").update(bytes).digest("hex");
  await f.repo.mutate(state => {
    state.assets = ["first", "second"].map(id => ({id, storyId:"story", filename:id+".txt", contentType:"text/plain", sha256, artifactRef:{size:3,sha256}}));
    return state;
  });
  let active = 0, maximum = 0, calls = 0, release;
  const held = new Promise(resolve => { release = resolve; });
  let entered;
  const firstEntered = new Promise(resolve => { entered = resolve; });
  f.store.downloadArtifact = async () => {
    calls++; active++; maximum = Math.max(maximum, active);
    if (calls === 1) { entered(); await held; }
    active--; return bytes;
  };
  const exporting = f.service.export(actor);
  await firstEntered;
  assert.equal(calls, 1);
  release();
  const pack = await exporting;
  assert.equal(calls, 2); assert.equal(maximum, 1);
  const target = await fixture(t, "liquidity_desk", true, "bounded-target");
  await target.service.install(actor, pack, {...input,target:{organizationId:"organization",brandId:"bounded-target"}});
  assert.equal((await target.repo.read()).assets.length, 2);
});

test("portable JSON digest preserves exact UTF-8, surrogate and property-order semantics", async () => {
  const { createHash } = await import("node:crypto");
  for (const value of [
    { headline: "ॐ · café · 😀", nested: ["\uD800", "\uDC00", "e\u0301"] },
    { second: 2, first: 1 },
    [null, true, -0, "\n\"\\"],
  ]) {
    const expected = createHash("sha256")
      .update(Buffer.from(JSON.stringify(value), "utf8"))
      .digest("hex");
    assert.equal(jsonDigest(value), expected);
  }
  assert.notEqual(jsonDigest({ a: 1, b: 2 }), jsonDigest({ b: 2, a: 1 }));
});

test("validated pack detaches metadata, arrays and each primitive file record bidirectionally", async (t) => {
  const source = await fixture(t);
  await allFormats(source);
  const inputPack = await source.service.export(actor);
  const before = structuredClone(inputPack);
  const validated = validateEditorPack(inputPack);
  assert.deepEqual(validated.pack, before);
  assert.equal(JSON.stringify(validated.pack), JSON.stringify(before));
  assert.notEqual(validated.pack.files, inputPack.files);
  for (let i = 0; i < inputPack.files.length; i++) {
    assert.notEqual(validated.pack.files[i], inputPack.files[i]);
    assert.deepEqual(Object.keys(validated.pack.files[i]).sort(), ["base64", "kind", "sha256", "size"]);
  }
  inputPack.documents[0].metadata.title = "caller mutation";
  inputPack.documents[0].history.length = 0;
  inputPack.scope.brandId = "caller-brand";
  inputPack.files[0].base64 = "caller bytes";
  inputPack.files.push({});
  assert.deepEqual(validated.pack, before);
  validated.pack.documents[0].metadata.title = "snapshot mutation";
  validated.pack.files[1].kind = "snapshot kind";
  assert.notEqual(inputPack.documents[0].metadata.title, "snapshot mutation");
  assert.equal(inputPack.files[1].kind, before.files[1].kind);
});

test("install uses its validated snapshot when caller mutates pack during principal authorization", async (t) => {
  const source = await fixture(t);
  await allFormats(source);
  const inputPack = await source.service.export(actor);
  const expected = structuredClone(inputPack);
  const target = await fixture(t, "liquidity_desk", true, "async-target");
  let entered, release;
  const held = new Promise(resolve => { release = resolve; });
  const reached = new Promise(resolve => { entered = resolve; });
  const originalAuthorize = target.identity.authorize;
  target.identity.authorize = async (...args) => {
    entered();
    await held;
    return originalAuthorize(...args);
  };
  const installing = target.service.install(actor, inputPack, {
    ...input,
    target: { organizationId: "organization", brandId: "async-target" },
    idempotencyKey: "portable_async_snapshot_0001",
  });
  await reached;
  inputPack.documents[0].metadata.title = "UNVALIDATED CALLER TITLE";
  inputPack.documents[0].history.length = 0;
  inputPack.documents[0].current = "0".repeat(64);
  inputPack.files[0].base64 = "invalid after validation";
  inputPack.sha256 = "f".repeat(64);
  release();
  const result = await installing;
  assert.equal(result.packSha256, expected.sha256);
  const restored = await target.native.read(actor, expected.documents[0].metadata.id);
  assert.equal(restored.title, expected.documents[0].metadata.title);
  assert.deepEqual(restored.document, validateEditorPack(expected).json(expected.documents[0].current));
});

test("detached pack preserves accepted top-level and primitive-file key order", async (t) => {
  const source = await fixture(t);
  await allFormats(source);
  const original = await source.service.export(actor);
  const { sha256, files, ...metadata } = original;
  const reorderedFiles = files.map(({ base64, kind, size, sha256 }) => ({ base64, kind, size, sha256 }));
  const content = { files: reorderedFiles, ...metadata };
  const reordered = { ...content, sha256: jsonDigest(content) };
  const snapshot = validateEditorPack(reordered).pack;
  assert.equal(JSON.stringify(snapshot), JSON.stringify(reordered));
  assert.equal(validateEditorPack(snapshot).pack.sha256, reordered.sha256);
});

test("token accounting preserves real exported pack size/checksum and corruption rejection", async (t) => {
  const { accountPortableJson } = await import("./portable-json-accounting.js");
  const source = await fixture(t);
  await allFormats(source);
  const pack = await source.service.export(actor);
  const result = accountPortableJson(pack, { omitRootKeys: ["sha256"] });
  const { sha256, ...content } = pack;
  assert.equal(result.bytes, Buffer.byteLength(JSON.stringify(pack), "utf8"));
  assert.equal(result.contentSha256, jsonDigest(content));
  assert.equal(result.contentSha256, sha256);
  const corrupted = structuredClone(pack);
  corrupted.documents[0].metadata.title += " unsealed";
  assert.throws(() => validateEditorPack(corrupted), { status: 422 });
});

test("over-cap input fails before base64 decoding or restore reservation", async (t) => {
  const target = await fixture(t, "liquidity_desk", true);
  const before = Object.fromEntries(target.store.keys("").map(key => [key, target.store.get(key)]));
  // Shared fixture string avoids allocating a second48MiB reference serialization.
  const block = "x".repeat(1024 * 1024);
  const oversized = { schemaVersion: 2, files: Array.from({ length: 49 }, () => ({ base64: block })) };
  let decoded = false;
  const originalFrom = Buffer.from;
  Buffer.from = function(value, encoding, ...rest) {
    if (encoding === "base64") { decoded = true; throw new Error("unexpected decode"); }
    return originalFrom.call(this, value, encoding, ...rest);
  };
  try {
    await assert.rejects(target.service.install(actor, oversized, input), { status: 413 });
  } finally { Buffer.from = originalFrom; }
  assert.equal(decoded, false);
  assert.deepEqual(Object.fromEntries(target.store.keys("").map(key => [key, target.store.get(key)])), before);
});

test("token accounting preserves the exact existing500000 content-node acceptance boundary", async (t) => {
  const source = await fixture(t);
  await allFormats(source);
  const pack = await source.service.export(actor);
  // Extra plain historical-origin metadata is already accepted by the pack schema.
  // These are hosted complexity fixtures, not claims of human edits or research.
  pack.documents[0].metadata.origin.benchmarkNodes = [];
  const count = value => 1 + (value && typeof value === "object"
    ? Object.values(value).reduce((total, child) => total + count(child), 0)
    : 0);
  const contentOf = value => { const { sha256, ...content } = value; return content; };
  const remaining = 500000 - count(contentOf(pack));
  assert.ok(remaining > 0);
  pack.documents[0].metadata.origin.benchmarkNodes = Array(remaining).fill(null);
  pack.sha256 = jsonDigest(contentOf(pack));
  assert.equal(count(contentOf(pack)), 500000);
  assert.doesNotThrow(() => validateEditorPack(pack));
  pack.documents[0].metadata.origin.benchmarkNodes.push(null);
  pack.sha256 = jsonDigest(contentOf(pack));
  assert.equal(count(contentOf(pack)), 500001);
  assert.throws(() => validateEditorPack(pack), { status: 413, message: "Editor pack complexity limit" });
});
