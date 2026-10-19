import test from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { historicalRebindFixture } from "../tests/fixtures/native-historical-rebind.mjs";
const formats = ["infographic", "carousel", "story", "reel"];
test("fresh current-owner source review creates a new unapproved native copy for both presets and every format", async (t) => {
  for (const preset of ["liquidity_desk", "vedic_dharma"]) {
    const f = await historicalRebindFixture(preset, formats);
    t.after(() => f.close());
    const originals = await Promise.all(
      f.ids.map((id) => f.native.read(f.actor, id)),
    );
    await assert.rejects(f.native.rebindPlan(f.actor, f.ids[0]), {
      status: 409,
    });
    await f.reviewCurrent();
    for (const [index, id] of f.ids.entries()) {
      const plan = await f.native.rebindPlan(f.actor, id);
      const input = {
        planSha256: plan.planSha256,
        expectedHistoricalRevision: originals[index].revision,
        confirmed: true,
        idempotencyKey: randomUUID(),
      };
      const next = await f.native.rebind(f.actor, id, input);
      assert.notEqual(next.id, id);
      assert.equal(next.revision, 1);
      assert.equal(next.status, "proposal");
      assert.equal(next.origin.requiresSourceReview, undefined);
      assert.equal(next.sourceState, "current");
      assert.deepEqual(
        next.document,
        originals[index].document,
        "same current tokens must preserve the entire human layout",
      );
      assert.deepEqual(await f.native.read(f.actor, id), originals[index]);
      assert.equal((await f.native.rebind(f.actor, id, input)).id, next.id);
      const review = await f.platform
        .editorApproval(f.scope, f.repo)
        .read(f.actor, next.id);
      assert.equal(review, null, "no historical approval is inherited");
      const changed = structuredClone(next.document);
      changed.pages[0].objects.find((o) => o.id === "headline_layer").text =
        "NEW COPY EDIT";
      await f.native.save(f.actor, next.id, {
        expectedRevision: 1,
        title: next.title,
        document: changed,
        idempotencyKey: randomUUID(),
      });
      assert.equal(
        (await f.native.read(f.actor, next.id)).document.pages[0].objects.find(
          (o) => o.id === "headline_layer",
        ).text,
        "NEW COPY EDIT",
      );
    }
  }
});
test("binding rejects stale plans, changed scope membership and caller approval/document fields", async (t) => {
  const f = await historicalRebindFixture();
  t.after(() => f.close());
  await f.reviewCurrent();
  const id = f.ids[0],
    plan = await f.native.rebindPlan(f.actor, id);
  const input = {
    planSha256: plan.planSha256,
    expectedHistoricalRevision: plan.historicalRevision,
    confirmed: true,
    idempotencyKey: randomUUID(),
  };
  await assert.rejects(
    f.native.rebind(f.actor, id, { ...input, document: {} }),
    { status: 400 },
  );
  await assert.rejects(
    f.native.rebind(f.actor, id, { ...input, confirmed: false }),
    { status: 400 },
  );
  await assert.rejects(
    f.native.rebind(f.actor, id, { ...input, expectedHistoricalRevision: 999 }),
    { status: 409 },
  );
  await f.repo.mutate((state) => {
    state.brandProfile.tagline += " Changed";
    return state;
  });
  await assert.rejects(f.native.rebind(f.actor, id, input), { status: 409 });
  await f.store.update("identity", (state) => ({
    ...state,
    memberships: state.memberships.filter(
      (member) => member.userId !== f.actor.id,
    ),
  }));
  await assert.rejects(f.native.rebind(f.actor, id, input), { status: 403 });
});
test("atomic source/native/identity fences reject drift after immutable payload staging and discard only unretained payload", async (t) => {
  for (const drift of ["source", "native", "identity", "restore"]) {
    const f = await historicalRebindFixture();
    t.after(() => f.close());
    await f.reviewCurrent();
    const id = f.ids[0],
      plan = await f.native.rebindPlan(f.actor, id);
    const persist = f.native.persistDocument.bind(f.native);
    let staged;
    f.native.persistDocument = async (document) => {
      staged = await persist(document);
      if (drift === "source")
        await f.repo.mutate((state) => {
          state.backlog[0].sourceClaims[0].text += " Changed";
          return state;
        });
      if (drift === "native")
        await f.store.update(f.native.key(id), (record) => ({
          ...record,
          revision: record.revision + 1,
        }));
      if (drift === "identity")
        await f.store.update("identity", (state) => ({
          ...state,
          users: state.users.map((user) =>
            user.id === f.actor.id ? { ...user, role: "marketer" } : user,
          ),
        }));
      if (drift === "restore")
        await f.store.update(f.repo.key, (state) => ({
          ...state,
          editorRestore: { id: "other-installation", status: "installing" },
        }));
      return staged;
    };
    await assert.rejects(
      f.native.rebind(f.actor, id, {
        planSha256: plan.planSha256,
        expectedHistoricalRevision: plan.historicalRevision,
        confirmed: true,
        idempotencyKey: randomUUID(),
      }),
      (error) => [403, 409, 423].includes(error.status),
    );
    assert.equal(await f.store.get(staged.key), null);
    assert.deepEqual(await f.store.keys(`${f.native.prefix}document:`), [
      f.native.key(id),
    ]);
  }
});
test("supported fonts, owned assets and fresh current-owner promotion are mandatory", async (t) => {
  const f = await historicalRebindFixture();
  t.after(() => f.close());
  await f.reviewCurrent();
  const id = f.ids[0];
  const fonts = f.native.availableFonts;
  f.native.availableFonts = [];
  await assert.rejects(f.native.rebindPlan(f.actor, id), { status: 422 });
  f.native.availableFonts = fonts;
  const original = await f.store.get(f.native.key(id));
  const document = (await f.native.read(f.actor, id)).document;
  document.pages[0].objects.push({
    id: "foreign-image",
    type: "image",
    assetId: "a".repeat(32),
    src: `studio-asset:${"a".repeat(32)}`,
  });
  const ref = await f.native.persistDocument(document);
  await f.store.update(f.native.key(id), (record) => ({
    ...record,
    documentRef: ref,
  }));
  await assert.rejects(f.native.rebindPlan(f.actor, id), { status: 404 });
  await f.store.update(f.native.key(id), () => original);
  await f.repo.mutate((state) => {
    state.preparedSourceCandidates.find(
      (entry) => entry.promotionReceipts?.length,
    ).restoredHistorical = { packSha256: "a".repeat(64) };
    return state;
  });
  await assert.rejects(f.native.rebindPlan(f.actor, id), { status: 409 });
});

test("historical dimensions and reel timing cannot acquire a new source binding when incompatible", async (t) => {
  const f = await historicalRebindFixture("vedic_dharma", ["story", "reel"]);
  t.after(() => f.close());
  await f.reviewCurrent();
  for (const [index, id] of f.ids.entries()) {
    const saved = await f.store.get(f.native.key(id));
    const document = (await f.native.read(f.actor, id)).document;
    if (index === 0) document.height = 1350;
    else document.pages[0].durationSec = -1;
    const reference = await f.native.persistDocument(document);
    await f.store.update(f.native.key(id), (record) => ({
      ...record,
      documentRef: reference,
    }));
    await assert.rejects(f.native.rebindPlan(f.actor, id), { status: 422 });
    await f.store.update(f.native.key(id), () => saved);
  }
});

test('historical Reel keeps deliberate generated-placeholder deletions, human layout and uploaded audio',async t=>{
 const f=await historicalRebindFixture('vedic_dharma',['reel']);t.after(()=>f.close());
 const id=f.ids[0],key=f.native.key(id),original=await f.store.get(key),saved=await f.native.read(f.actor,id);
 const {pcmWav}=await import('../tests/fixtures/native-audio.js');
 const sound=await f.native.uploadAsset(f.actor,{name:'Original recovery signal',contentType:'audio/wav',base64:pcmWav({durationMs:1000}).toString('base64'),rightsDeclaration:'Original generated signal; no third-party recording.',consent:'not_personal_data',idempotencyKey:randomUUID()});
 const document=structuredClone(saved.document);
 for(const page of document.pages.slice(1))page.objects=page.objects.filter(o=>o.id!=='subject_cutout_layer');
 const headline=document.pages[0].objects.find(o=>o.id==='headline_layer');headline.text='Retained human wording';headline.left+=11;headline.angle=3;
 document.audioTracks=[{id:'retained-audio',kind:'upload',name:sound.name,assetId:sound.id,src:`/__studio_native_audio/${sound.id}`,scope:{type:'design'},durationMs:1000,startMs:0,trimStartMs:0,trimEndMs:1000,volume:.7,fadeInMs:0,fadeOutMs:0,loop:false,muted:false}];
 const reference=await f.native.persistDocument(document);
 await f.store.update(key,r=>({...r,documentRef:reference,revision:r.revision+1}));
 const historical=await f.native.read(f.actor,id);await f.reviewCurrent();
 const plan=await f.native.rebindPlan(f.actor,id);
 const omissions=document.pages.slice(1).map(p=>({pageId:p.id,objectId:'subject_cutout_layer'}));
 assert.deepEqual(plan.omittedGeneratedPlaceholders,omissions);
 const copy=await f.native.rebind(f.actor,id,{planSha256:plan.planSha256,expectedHistoricalRevision:historical.revision,confirmed:true,idempotencyKey:randomUUID()});
 assert.deepEqual(copy.document,document);
 assert.deepEqual(copy.origin.historicalRebind.omittedGeneratedPlaceholders,omissions);
 assert.equal(copy.origin.layerTokenBindings.length,original.origin.layerTokenBindings.length-2);
 assert.ok(copy.origin.layerTokenBindings.every(b=>!omissions.some(o=>o.pageId===b.pageId&&o.objectId===b.objectId)));
 assert.deepEqual(await f.native.read(f.actor,id),historical);
});

test('historical reconciliation still rejects missing real layers, duplicates and altered initial placeholder provenance',async t=>{
 for(const kind of ['text','duplicate','unverified-placeholder']){
  const f=await historicalRebindFixture('vedic_dharma',['reel']);t.after(()=>f.close());
  const id=f.ids[0],key=f.native.key(id),record=await f.store.get(key),saved=await f.native.read(f.actor,id),document=structuredClone(saved.document);
  if(kind==='text')document.pages[0].objects=document.pages[0].objects.filter(o=>o.id!=='headline_layer');
  else if(kind==='duplicate')document.pages[0].objects.push(structuredClone(document.pages[0].objects.find(o=>o.id==='subject_cutout_layer')));
  else {
   document.pages[0].objects=document.pages[0].objects.filter(o=>o.id!=='subject_cutout_layer');
   const initial=await f.native.hydrate(record,{documentRef:record.initialDocumentRef});
   initial.document.pages[0].objects.find(o=>o.id==='subject_cutout_layer').name='Human rectangle';
   const initialRef=await f.native.persistDocument(initial.document);
   await f.store.update(key,r=>({...r,initialDocumentRef:initialRef}));
  }
  const reference=await f.native.persistDocument(document);await f.store.update(key,r=>({...r,documentRef:reference}));
  await f.reviewCurrent();
  await assert.rejects(f.native.rebindPlan(f.actor,id),/missing|duplicate/i);
 }
});
