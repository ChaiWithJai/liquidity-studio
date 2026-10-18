import test from "node:test";
import assert from "node:assert/strict";
import {
  NativeEditorService,
  validateHostedDocument,
} from "./native-editor.js";
import { BRAND_PRESETS } from "./domain.js";
import { campaignFromApprovedClaims } from "./source-integrity.js";
import { brandRevision } from "./multimodal-contract.js";

function fixture(preset = "liquidity_desk") {
  const actor = { id: "operator" };
  const story = {
    id: "story",
    title: "Controlled source fixture",
    revision: 2,
    generationId: "gen",
    sourceClaims: [
      {
        id: "claim",
        text: "An approved source excerpt for a controlled integration fixture.",
        sourceUrl: "https://example.org/source",
        kind: "general",
        status: "approved",
      },
    ],
  };
  story.campaignDraft = {
    ...campaignFromApprovedClaims(story),
    provenance: { generationId: "gen", mode: "synthetic" },
  };
  let state = {
    brandProfile: structuredClone(BRAND_PRESETS[preset]),
    backlog: [story],
    assets: [],
  };
  let allowed = true;
  const records = new Map();
  const store = {
    get: async (key) => structuredClone(records.get(key) || null),
    update: async (key, fn) => {
      const next = fn(structuredClone(records.get(key) || null));
      records.set(key, structuredClone(next));
      return structuredClone(next);
    },
    delete: async (key) => records.delete(key),
  };
  const repo = {
    store,
    read: async () => structuredClone(state),
    mutate: async (fn) => {
      const next = fn(structuredClone(state));
      state = next;
      return structuredClone(state);
    },
  };
  const service = new NativeEditorService({
    repo,
    scope: { organizationId: "org", brandId: preset },
    identity: {
      authorize: async () => {
        if (!allowed)
          throw Object.assign(new Error("Forbidden"), { status: 403 });
      },
    },
    availableFonts: [
      "Instrument Serif",
      "Mona Sans",
      "Inter",
      "Noto Sans Devanagari",
    ].map((family) => ({
      family,
      sha256: "a".repeat(64),
      verifiedCodepoints: [
        "U+0043",
        "U+0057",
        "U+004A",
        "U+0020",
        "U+002F",
        "U+0950",
      ],
    })),
  });
  const create = (format, suffix = format) =>
    service.create(actor, {
      storyId: story.id,
      format,
      expectedRevision: story.revision,
      generationId: story.generationId,
      expectedBrandRevision: brandRevision(state.brandProfile),
      idempotencyKey: `create_native_${suffix}`,
    });
  return {
    actor,
    service,
    create,
    state: () => state,
    revoke: () => {
      allowed = false;
    },
  };
}

test("both brands and all formats retain immutable origin through native edit/save/reload", async () => {
  for (const preset of ["liquidity_desk", "vedic_dharma"]) {
    const f = fixture(preset);
    const original = structuredClone(f.state().backlog);
    for (const format of ["infographic", "carousel", "story", "reel"]) {
      const native = await f.create(format);
      const document = structuredClone(native.document);
      document.pages[0].objects.find((o) => o.id === "headline_layer").text =
        "Human native proposal";
      const saved = await f.service.save(f.actor, native.id, {
        expectedRevision: 1,
        title: native.title,
        document,
        idempotencyKey: `save_native_${format}`,
      });
      assert.equal(saved.revision, 2);
      assert.equal(saved.status, "proposal");
      assert.deepEqual(
        (await f.service.read(f.actor, native.id)).document,
        document,
      );
      assert.deepEqual(f.state().backlog, original);
    }
  }
});

test("stale and uncertain writes preserve opening revision and idempotency intent", async () => {
  const f = fixture();
  const native = await f.create("infographic");
  assert.equal((await f.create("infographic")).id, native.id);
  const input = {
    expectedRevision: 1,
    title: "Human proposal",
    document: native.document,
    idempotencyKey: "save_native_same_key",
  };
  assert.equal((await f.service.save(f.actor, native.id, input)).revision, 2);
  assert.equal((await f.service.save(f.actor, native.id, input)).revision, 2);
  await assert.rejects(
    f.service.save(f.actor, native.id, { ...input, title: "Changed" }),
    { status: 409 },
  );
  await assert.rejects(
    f.service.save(f.actor, native.id, {
      ...input,
      idempotencyKey: "another_native_save",
    }),
    { status: 409 },
  );
  const second = await f.create("story");
  assert.equal(
    (
      await f.service.save(f.actor, second.id, {
        ...input,
        document: second.document,
      })
    ).revision,
    2,
  );
});

test("revoked membership and another scoped repository cannot read native records", async () => {
  const f = fixture();
  const native = await f.create("story");
  await assert.rejects(
    fixture("vedic_dharma").service.read(f.actor, native.id),
    { status: 404 },
  );
  f.revoke();
  await assert.rejects(f.service.read(f.actor, native.id), { status: 403 });
  await assert.rejects(
    f.service.save(f.actor, native.id, {
      expectedRevision: 1,
      title: "Forbidden",
      document: native.document,
      idempotencyKey: "revoked_native_save",
    }),
    { status: 403 },
  );
});

test("native resource validator rejects foreign fetches and accepts only owned image references", async () => {
  const f = fixture();
  const { document } = await f.create("story");
  document.pages[0].objects.push({
    id: "image",
    type: "image",
    assetId: "owned",
    src: "studio-asset:owned",
  });
  assert.doesNotThrow(() =>
    validateHostedDocument(document, { assets: [{ id: "owned" }] }),
  );
  assert.throws(() => validateHostedDocument(document), { status: 422 });
  for (const src of [
    "https://foreign.example/photo.png",
    "//foreign.example/photo.png",
    "data:image/png;base64,AAAA",
    "blob:local",
    "/api/private-other-brand",
  ]) {
    document.pages[0].objects.at(-1).src = src;
    assert.throws(
      () => validateHostedDocument(document, { assets: [{ id: "owned" }] }),
      { status: 422 },
    );
  }
});

test("source and palette drift do not silently replace or rebase native proposals", async () => {
  for (const change of [
    (s) => { s.backlog[0].revision++; s.backlog[0].contentRevision = (s.backlog[0].contentRevision || 1) + 1; },
    (s) => (s.brandProfile.colors[0].hex = "#123456"),
    (s) => (s.backlog[0].sourceClaims[0].text = "Changed approval"),
  ]) {
    const f = fixture();
    const native = await f.create("story");
    change(f.state());
    await assert.rejects(
      f.service.save(f.actor, native.id, {
        expectedRevision: 1,
        title: native.title,
        document: native.document,
        idempotencyKey: "source_drift_save",
      }),
      { status: 409 },
    );
    assert.equal((await f.service.read(f.actor, native.id)).revision, 1);
  }
});

test("real authenticated HTTP saves native proposals; anonymous and wrong-brand reads fail", async (t) => {
  const { DurableStore } = await import("./storage.js");
  const { createPlatform } = await import("./platform.js");
  const { createHttpServer } = await import("./index.js");
  const store = new DurableStore(":memory:");
  const platform = createPlatform({ store, authMode: "password" });
  await platform.ready;
  await platform.identity.provision({
    username: "native-qa",
    password: "ephemeral-native-test-password-239!",
    role: "founder",
  });
  const container = await platform.forScope({
    organizationId: "org_default",
    brandId: "brand_default",
    preset: "liquidity_desk",
  });
  const controlled = fixture().state();
  await container.ports.repo.mutate((state) => ({
    ...state,
    backlog: controlled.backlog,
    brandProfile: controlled.brandProfile,
  }));
  const server = createHttpServer(null, {
    platform,
    nativeEditorEnabled: true,
  });
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  t.after(async () => {
    await new Promise((resolve) => server.close(resolve));
    store.close();
  });
  const base = `http://127.0.0.1:${server.address().port}`;
  const login = await fetch(`${base}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      username: "native-qa",
      password: "ephemeral-native-test-password-239!",
    }),
  });
  const cookie = login.headers.get("set-cookie").split(";")[0];
  async function api(
    path,
    body,
    brand = "brand_default",
    authenticated = true,
  ) {
    const response = await fetch(
      `${base}/api/studio/native-editor/${path}?organizationId=org_default&brandId=${brand}`,
      {
        method: body ? "POST" : "GET",
        headers: {
          "Content-Type": "application/json",
          ...(authenticated ? { Cookie: cookie } : {}),
        },
        body: body ? JSON.stringify(body) : undefined,
      },
    );
    return { status: response.status, data: await response.json() };
  }
  const created = await api("documents", {
    storyId: "story",
    format: "carousel",
    expectedRevision: 2,
    generationId: "gen",
    expectedBrandRevision: brandRevision(controlled.brandProfile),
    idempotencyKey: "http_native_create",
  });
  assert.equal(created.status, 201, JSON.stringify(created.data));
  const id = created.data.id;
  assert.equal(created.data.document.pages.length, 4);
  assert.equal("documentRef" in created.data, false);
  assert.equal((await api(`documents/${id}/review`)).data, null);
  for (const [index, action] of ["create", "start", "submit", "approve"].entries()) {
    const result = await api(`documents/${id}/review`, {
      action, expectedRevision: index, expectedNativeRevision: 1,
      idempotencyKey: `http_review_${action}_unique`,
    });
    assert.equal(result.status, 200, JSON.stringify(result.data));
    assert.equal(result.data.revision, index + 1);
  }
  const review = await api(`documents/${id}/review`);
  assert.equal(review.data.stage, "Approved");
  assert.equal(review.data.stale, false);
  assert.equal(review.data.approval.nativeRevision, 1);
  assert.equal(review.data.canApprove, true);
  assert.equal((await api(`documents/${id}/review`, undefined, "brand_vedic")).status, 404);
  assert.equal((await api(`documents/${id}/review`, undefined, "brand_default", false)).status, 401);
  assert.equal(
    (await api(`documents/${id}`, undefined, "brand_vedic")).status,
    404,
  );
  assert.equal(
    (await api(`documents/${id}`, undefined, "brand_default", false)).status,
    401,
  );
  const document = created.data.document;
  document.pages[2].objects.find(
    (object) => object.id === "headline_layer",
  ).text = "HTTP native proposal";
  const input = {
    document,
    title: "Real HTTP proposal",
    expectedRevision: 1,
    idempotencyKey: "http_native_save_1",
  };
  const saved = await api(`documents/${id}`, input);
  assert.equal(saved.status, 200);
  assert.equal(saved.data.revision, 2);
  assert.equal((await api(`documents/${id}`, input)).data.revision, 2);
  assert.equal(
    (
      await api(`documents/${id}`, {
        ...input,
        idempotencyKey: "http_stale_save_2",
      })
    ).status,
    409,
  );
  assert.equal(
    (await api(`documents/${id}`)).data.document.pages[2].objects.find(
      (object) => object.id === "headline_layer",
    ).text,
    "HTTP native proposal",
  );
  assert.deepEqual(
    (await container.ports.repo.read()).backlog,
    controlled.backlog,
  );
  const sharp = (await import("sharp")).default;
  const png = await sharp({
    create: { width: 32, height: 40, channels: 4, background: "#123456" },
  })
    .png()
    .toBuffer();
  const upload = {
    name: "Procedural fixture.png",
    contentType: "image/png",
    base64: png.toString("base64"),
    rightsDeclaration: "Procedural test image created for this fixture.",
    consent: "not_personal_data",
    idempotencyKey: "http_native_upload",
  };
  const uploaded = await api("assets", upload);
  assert.equal(uploaded.status, 201, JSON.stringify(uploaded.data));
  assert.equal((await api("assets", upload)).data.id, uploaded.data.id);
  assert.equal(
    (await api("assets", { ...upload, name: "Different input" })).status,
    409,
  );
  const image = await api(`assets/${uploaded.data.id}`);
  assert.equal(image.data.base64, png.toString("base64"));
  assert.equal(image.data.width, 32);
  assert.equal(
    (await api(`assets/${uploaded.data.id}`, undefined, "brand_vedic")).status,
    404,
  );
  assert.equal(
    (await api(`assets/${uploaded.data.id}`, undefined, "brand_default", false))
      .status,
    401,
  );
  document.pages[0].objects.push({
    id: "owned_image",
    type: "image",
    assetId: uploaded.data.id,
    src: `studio-asset:${uploaded.data.id}`,
    width: 32,
    height: 40,
    left: 10,
    top: 10,
  });
  const imageSave = await api(`documents/${id}`, {
    document,
    title: "Private image native proposal",
    expectedRevision: 2,
    idempotencyKey: "http_native_image_save",
  });
  assert.equal(imageSave.status, 200, JSON.stringify(imageSave.data));
  assert.equal(imageSave.data.revision, 3);
  assert.equal(
    (await api(`documents/${id}`)).data.document.pages[0].objects.at(-1)
      .assetId,
    uploaded.data.id,
  );
  const badImage = await api("assets", {
    ...upload,
    base64: Buffer.from("not an image").toString("base64"),
    idempotencyKey: "http_bad_image_upload",
  });
  assert.equal(badImage.status, 422);
  const oversizedPixels = await sharp({
    create: { width: 3000, height: 2000, channels: 4, background: "#123456" },
  })
    .png()
    .toBuffer();
  const largeImage = await api("assets", {
    ...upload,
    base64: oversizedPixels.toString("base64"),
    idempotencyKey: "http_large_image_upload",
  });
  assert.equal(largeImage.status, 422);

  assert.equal((await api("fonts")).data.results.length, 4);
});

test("native pattern source and URL fields reject same-origin and relative resource paths", async () => {
  const f = fixture();
  const { document } = await f.create("story");
  for (const field of ["source", "url"]) {
    for (const value of [
      "/api/private-other-brand",
      "relative-image.png",
      "../private.png",
      "studio-asset:owned",
      { src: "relative-image.png" },
    ]) {
      const copy = structuredClone(document);
      copy.pages[0].objects[0].fill = { type: "pattern", [field]: value };
      assert.throws(
        () => validateHostedDocument(copy, { assets: [{ id: "owned" }] }),
        { status: 422 },
      );
    }
  }
});


test("planning metadata preserves content-bound proposals while legacy origins remain strict", async () => {
  const f = fixture();
  const native = await f.create("story");
  Object.assign(f.state().backlog[0], {revision:3,status:"Scheduled",scheduledDay:"Tuesday",scheduleSchemaVersion:1,updatedAt:"2026-10-18T04:00:00Z"});
  assert.equal((await f.service.read(f.actor,native.id)).sourceState,"current");
  const legacy = {...native.origin}; delete legacy.sourceContentRevision;
  assert.throws(()=>f.service.assertCurrent(f.state(),legacy),{status:409});
  const saved = await f.service.save(f.actor,native.id,{expectedRevision:1,title:native.title,document:native.document,idempotencyKey:"metadata_preserves_native"});
  assert.equal(saved.revision,2);assert.equal(saved.origin.storyRevision,2);assert.equal(saved.origin.sourceContentRevision,1);
  f.state().backlog[0].contentRevision=2;
  assert.equal((await f.service.read(f.actor,native.id)).sourceState,"changed");
});
