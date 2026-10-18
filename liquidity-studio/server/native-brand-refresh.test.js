import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { createPlatform } from "./platform.js";
import { DurableStore } from "./storage.js";
import { BRAND_PRESETS } from "./domain.js";
import { campaignFromApprovedClaims } from "./source-integrity.js";
import { brandRevision } from "./multimodal-contract.js";
async function fixture(preset = "liquidity_desk", filename = ":memory:") {
  const store = new DurableStore(filename),
    platform = createPlatform({ store, authMode: "password" });
  await platform.ready;
  await platform.identity.provision({
    username: "brand-refresh",
    password: "original-fixture-password-long",
    role: "founder",
  });
  const actor = (await store.get("identity")).users.find(
    (u) => u.username === "brand-refresh",
  );
  const scope = {
      organizationId: "org_default",
      brandId: "brand_default",
      preset: "liquidity_desk",
    },
    container = await platform.forScope(scope),
    repo = container.ports.repo;
  const story = {
    id: "refresh-story",
    title: "Original style fixture",
    revision: 1,
    generationId: "refresh-generation",
    sourceClaims: [
      {
        id: "source",
        text: "An approved original source excerpt.",
        sourceUrl: "https://example.org/style-fixture",
        status: "approved",
        kind: "general",
      },
    ],
  };
  story.campaignDraft = {
    ...campaignFromApprovedClaims(story),
    provenance: { generationId: story.generationId, mode: "synthetic" },
  };
  await repo.mutate((s) => ({
    ...s,
    backlog: [story],
    brandProfile: structuredClone(BRAND_PRESETS[preset]),
  }));
  return {
    store,
    platform,
    actor,
    scope,
    repo,
    story,
    service: platform.nativeEditor(scope, repo),
  };
}
test("explicit brand-only refresh preserves human text and geometry with one revision-bound receipt", async () => {
  const f = await fixture();
  try {
    const profile = await f.repo.getBrandProfile(),
      oldHash = brandRevision(profile);
    let native = await f.service.create(f.actor, {
      storyId: f.story.id,
      format: "infographic",
      expectedRevision: 1,
      generationId: f.story.generationId,
      expectedBrandRevision: oldHash,
      idempotencyKey: "original_style_create",
    });
    native.document.pages[0].objects.find(
      (o) => o.id === "headline_layer",
    ).text = "Human native copy preserved";
    native = await f.service.save(f.actor, native.id, {
      expectedRevision: 1,
      title: native.title,
      document: native.document,
      idempotencyKey: "original_human_native_edit",
    });
    const before = structuredClone(native.document);
    await f.repo.updateBrandProfile({
      colors: profile.colors.map((c, i) =>
        i === 0 ? { ...c, hex: "#123456" } : c,
      ),
    });
    const newHash = brandRevision(await f.repo.getBrandProfile());
    const input = {
      expectedRevision: 2,
      expectedOldBrandRevision: oldHash,
      expectedBrandRevision: newHash,
      idempotencyKey: "original_style_refresh",
    };
    const result = await f.service.refreshBrandTokens(
      f.actor,
      native.id,
      input,
    );
    assert.equal(result.revision, 3);
    assert.equal(result.origin.brandRevision, newHash);
    assert.equal(
      result.document.pages[0].objects.find((o) => o.id === "headline_layer")
        .text,
      "Human native copy preserved",
    );
    const projection = (d) =>
      d.pages.map((p) => ({
        id: p.id,
        objects: p.objects.map((o) => ({
          id: o.id,
          text: o.text,
          left: o.left,
          top: o.top,
          width: o.width,
          height: o.height,
        })),
      }));
    assert.deepEqual(projection(result.document), projection(before));
    assert.equal(result.document.pages[0].background.color, "#123456");
    assert.equal(
      (await f.service.refreshBrandTokens(f.actor, native.id, input)).revision,
      3,
    );
    await assert.rejects(
      f.service.refreshBrandTokens(f.actor, native.id, {
        ...input,
        expectedRevision: 1,
      }),
      { status: 409 },
    );
    assert.equal(
      (await f.service.read(f.actor, native.id)).sourceState,
      "current",
    );
  } finally {
    f.store.close();
  }
});

test("both scoped brands refresh all four formats without replacing native copy or existing review authority", async () => {
  for (const preset of ["liquidity_desk", "vedic_dharma"]) {
    const f = await fixture(preset);
    try {
      const profile = await f.repo.getBrandProfile(),
        oldHash = brandRevision(profile),
        documents = [];
      for (const format of ["infographic", "carousel", "story", "reel"])
        documents.push(
          await f.service.create(f.actor, {
            storyId: f.story.id,
            format,
            expectedRevision: 1,
            generationId: f.story.generationId,
            expectedBrandRevision: oldHash,
            idempotencyKey: `both_formats_create_${format}`,
          }),
        );
      await f.repo.updateBrandProfile({
        colors: profile.colors.map((c, i) =>
          i === 1 ? { ...c, hex: "#654321" } : c,
        ),
      });
      for (const record of documents) {
        const result = await f.service.refreshBrandTokens(f.actor, record.id, {
          expectedRevision: record.revision,
          expectedOldBrandRevision: oldHash,
          expectedBrandRevision: brandRevision(await f.repo.getBrandProfile()),
          idempotencyKey: `both_formats_refresh_${record.format}`,
        });
        assert.equal(result.revision, 2);
        assert.equal(
          result.document.pages.length,
          record.document.pages.length,
        );
        assert.deepEqual(
          result.document.pages.map((p) =>
            p.objects.map((o) => [
              o.id,
              o.text,
              o.left,
              o.top,
              o.width,
              o.height,
            ]),
          ),
          record.document.pages.map((p) =>
            p.objects.map((o) => [
              o.id,
              o.text,
              o.left,
              o.top,
              o.width,
              o.height,
            ]),
          ),
        );
        assert.equal(
          result.document.pages[0].objects.find(
            (o) => o.id === "brand_pill_badge",
          ).fill,
          "#654321",
        );
      }
    } finally {
      f.store.close();
    }
  }
});

test("source drift, revoked membership and missing verified fonts cannot become a brand-only rebase", async () => {
  const f = await fixture();
  try {
    const profile = await f.repo.getBrandProfile(),
      oldHash = brandRevision(profile);
    const record = await f.service.create(f.actor, {
      storyId: f.story.id,
      format: "story",
      expectedRevision: 1,
      generationId: f.story.generationId,
      expectedBrandRevision: oldHash,
      idempotencyKey: "negative_refresh_create",
    });
    await f.repo.updateBrandProfile({
      colors: profile.colors.map((c, i) =>
        i === 0 ? { ...c, hex: "#123456" } : c,
      ),
    });
    const input = {
      expectedRevision: 1,
      expectedOldBrandRevision: oldHash,
      expectedBrandRevision: brandRevision(await f.repo.getBrandProfile()),
      idempotencyKey: "negative_refresh_attempt",
    };
    const fonts = f.service.availableFonts;
    f.service.availableFonts = [];
    await assert.rejects(
      f.service.refreshBrandTokens(f.actor, record.id, input),
      { status: 422 },
    );
    f.service.availableFonts = fonts;
    await f.repo.mutate((s) => {
      s.backlog[0].generationId = "changed-generation";
      return s;
    });
    await assert.rejects(
      f.service.refreshBrandTokens(f.actor, record.id, input),
      { status: 409 },
    );
    await f.repo.mutate((s) => {
      s.backlog[0].generationId = f.story.generationId;
      return s;
    });
    await f.store.update("identity", (s) => {
      s.memberships = s.memberships.filter((m) => m.userId !== f.actor.id);
      return s;
    });
    await assert.rejects(
      f.service.refreshBrandTokens(f.actor, record.id, input),
      { status: 403 },
    );
    assert.equal((await f.store.get(f.service.key(record.id))).revision, 1);
  } finally {
    f.store.close();
  }
});

test("the atomic style commit fences membership changes after final authorization", async () => {
  const f = await fixture();
  try {
    const profile = await f.repo.getBrandProfile(),
      oldHash = brandRevision(profile);
    const record = await f.service.create(f.actor, {
      storyId: f.story.id,
      format: "infographic",
      expectedRevision: 1,
      generationId: f.story.generationId,
      expectedBrandRevision: oldHash,
      idempotencyKey: "membership_race_create",
    });
    await f.repo.updateBrandProfile({
      colors: profile.colors.map((c, i) =>
        i === 0 ? { ...c, hex: "#123456" } : c,
      ),
    });
    const transact = f.store.transact.bind(f.store);
    let intercepted = false;
    f.store.transact = (keys, mutate) => {
      if (keys.includes("identity") && !intercepted) {
        intercepted = true;
        f.store.update("identity", (s) => {
          s.memberships = s.memberships.filter((m) => m.userId !== f.actor.id);
          return s;
        });
      }
      return transact(keys, mutate);
    };
    await assert.rejects(
      f.service.refreshBrandTokens(f.actor, record.id, {
        expectedRevision: 1,
        expectedOldBrandRevision: oldHash,
        expectedBrandRevision: brandRevision(await f.repo.getBrandProfile()),
        idempotencyKey: "membership_race_refresh",
      }),
      { status: 409 },
    );
    assert.equal(intercepted, true);
    assert.equal((await f.store.get(f.service.key(record.id))).revision, 1);
  } finally {
    f.store.close();
  }
});

test("authenticated scoped HTTP refresh rejects foreign scope and returns a current native projection", async () => {
  const { createHttpServer } = await import("./index.js");
  const f = await fixture();
  let server;
  try {
    server = createHttpServer(null, {
      platform: f.platform,
      nativeEditorEnabled: true,
    });
    await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
    const base = `http://127.0.0.1:${server.address().port}`;
    const login = await fetch(base + "/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: "brand-refresh",
        password: "original-fixture-password-long",
      }),
    });
    const cookie = login.headers.get("set-cookie").split(";")[0];
    const profile = await f.repo.getBrandProfile(),
      oldHash = brandRevision(profile);
    const record = await f.service.create(f.actor, {
      storyId: f.story.id,
      format: "infographic",
      expectedRevision: 1,
      generationId: f.story.generationId,
      expectedBrandRevision: oldHash,
      idempotencyKey: "http_refresh_create",
    });
    await f.repo.updateBrandProfile({
      colors: profile.colors.map((c, i) =>
        i === 0 ? { ...c, hex: "#123456" } : c,
      ),
    });
    const input = {
      expectedRevision: 1,
      expectedOldBrandRevision: oldHash,
      expectedBrandRevision: brandRevision(await f.repo.getBrandProfile()),
      idempotencyKey: "http_refresh_attempt",
    };
    const request = (brandId) =>
      fetch(
        `${base}/api/studio/native-editor/documents/${record.id}/brand-tokens?organizationId=org_default&brandId=${brandId}`,
        {
          method: "POST",
          headers: {
            Cookie: cookie,
            "Content-Type": "application/json",
            Origin: base,
          },
          body: JSON.stringify(input),
        },
      );
    assert.equal((await request("brand_vedic")).status, 404);
    const response = await request("brand_default");
    assert.equal(response.status, 200);
    assert.equal((await response.json()).revision, 2);
    assert.equal((await request("brand_default")).status, 200);
    const latest = await (
      await fetch(
        `${base}/api/studio/native-editor/documents/${record.id}?organizationId=org_default&brandId=brand_default`,
        { headers: { Cookie: cookie } },
      )
    ).json();
    assert.equal(latest.currentBrandRevision, input.expectedBrandRevision);
    assert.equal(latest.sourceState, "current");
  } finally {
    if (server) await new Promise((resolve) => server.close(resolve));
    f.store.close();
  }
});

test("style refresh creates a new native version and cannot inherit approval or exact-artifact signoff", async () => {
  const f = await fixture();
  try {
    const profile = await f.repo.getBrandProfile(),
      oldHash = brandRevision(profile),
      record = await f.service.create(f.actor, {
        storyId: f.story.id,
        format: "infographic",
        expectedRevision: 1,
        generationId: f.story.generationId,
        expectedBrandRevision: oldHash,
        idempotencyKey: "review_styles_create",
      });
    const approval = f.platform.editorApproval(f.scope, f.repo);
    let expectedRevision = 0;
    for (const action of ["create", "start", "submit", "approve"]) {
      await approval.transition(f.actor, record.id, {
        action,
        expectedRevision,
        expectedNativeRevision: 1,
        idempotencyKey: `review_styles_${action}`,
      });
      expectedRevision++;
    }
    assert.equal((await approval.read(f.actor, record.id)).stage, "Approved");
    await f.repo.updateBrandProfile({
      colors: profile.colors.map((c, i) =>
        i === 0 ? { ...c, hex: "#123456" } : c,
      ),
    });
    await f.service.refreshBrandTokens(f.actor, record.id, {
      expectedRevision: 1,
      expectedOldBrandRevision: oldHash,
      expectedBrandRevision: brandRevision(await f.repo.getBrandProfile()),
      idempotencyKey: "review_styles_refresh",
    });
    const review = await approval.read(f.actor, record.id);
    assert.equal(review.stale, true);
    assert.equal(review.exported, false);
    assert.equal(review.binding.nativeRevision, 1);
    await assert.rejects(
      approval.transition(f.actor, record.id, {
        action: "approve",
        expectedRevision: review.revision,
        expectedNativeRevision: 2,
        idempotencyKey: "review_styles_unsafe_approval",
      }),
      { status: 409 },
    );
  } finally {
    f.store.close();
  }
});

test("a lost refresh response replays the same durable receipt after SQLite reopen", async () => {
  const directory = fs.mkdtempSync(
    path.join(os.tmpdir(), "native-brand-reopen-"),
  );
  let f;
  let reopened;
  try {
    const filename = path.join(directory, "studio.sqlite");
    f = await fixture("liquidity_desk", filename);
    const profile = await f.repo.getBrandProfile();
    const oldHash = brandRevision(profile);
    const native = await f.service.create(f.actor, {
      storyId: f.story.id,
      format: "infographic",
      expectedRevision: 1,
      generationId: f.story.generationId,
      expectedBrandRevision: oldHash,
      idempotencyKey: "durable_brand_create",
    });
    await f.repo.updateBrandProfile({
      colors: profile.colors.map((color, index) =>
        index === 0 ? { ...color, hex: "#123456" } : color,
      ),
    });
    const input = {
      expectedRevision: 1,
      expectedOldBrandRevision: oldHash,
      expectedBrandRevision: brandRevision(await f.repo.getBrandProfile()),
      idempotencyKey: "durable_brand_refresh",
    };
    const committed = await f.service.refreshBrandTokens(
      f.actor,
      native.id,
      input,
    );
    f.store.close();
    f = null;
    reopened = new DurableStore(filename);
    const platform = createPlatform({ store: reopened, authMode: "password" });
    await platform.ready;
    const actor = (await reopened.get("identity")).users.find(
      (user) => user.username === "brand-refresh",
    );
    const scope = {
      organizationId: "org_default",
      brandId: "brand_default",
      preset: "liquidity_desk",
    };
    const repo = (await platform.forScope(scope)).ports.repo;
    const service = platform.nativeEditor(scope, repo);
    const replay = await service.refreshBrandTokens(actor, native.id, input);
    assert.deepEqual(replay, committed);
    const stored = await reopened.get(service.key(native.id));
    assert.equal(stored.revision, 2);
    assert.equal(
      stored.receipts.filter(
        (row) => row.key === `${actor.id}:${input.idempotencyKey}`,
      ).length,
      1,
    );
    assert.equal((await service.read(actor, native.id)).sourceState, "current");
  } finally {
    f?.store.close();
    reopened?.close();
    fs.rmSync(directory, { recursive: true, force: true });
  }
});

test("source and brand changes during refresh cannot commit stale native styles", async () => {
  for (const change of ["source", "brand"]) {
    const f = await fixture();
    try {
      const profile = await f.repo.getBrandProfile();
      const oldHash = brandRevision(profile);
      const native = await f.service.create(f.actor, {
        storyId: f.story.id,
        format: "infographic",
        expectedRevision: 1,
        generationId: f.story.generationId,
        expectedBrandRevision: oldHash,
        idempotencyKey: `race_${change}_create`,
      });
      await f.repo.updateBrandProfile({
        colors: profile.colors.map((color, index) =>
          index === 0 ? { ...color, hex: "#123456" } : color,
        ),
      });
      const nextHash = brandRevision(await f.repo.getBrandProfile());
      const transact = f.store.transact.bind(f.store);
      let injected = false;
      f.store.transact = (keys, callback) => {
        if (!injected && keys.includes(f.service.key(native.id))) {
          injected = true;
          f.store.update(f.repo.key, (state) =>
            change === "brand"
              ? {
                  ...state,
                  brandProfile: {
                    ...state.brandProfile,
                    colors: state.brandProfile.colors.map((color, index) =>
                      index === 0 ? { ...color, hex: "#654321" } : color,
                    ),
                  },
                }
              : {
                  ...state,
                  backlog: state.backlog.map((story) => ({
                    ...story,
                    generationId: "new-generation",
                  })),
                },
          );
        }
        return transact(keys, callback);
      };
      await assert.rejects(
        f.service.refreshBrandTokens(f.actor, native.id, {
          expectedRevision: 1,
          expectedOldBrandRevision: oldHash,
          expectedBrandRevision: nextHash,
          idempotencyKey: `race_${change}_refresh`,
        }),
        { status: 409 },
      );
      assert.equal(injected, true);
      assert.equal((await f.store.get(f.service.key(native.id))).revision, 1);
    } finally {
      f.store.close();
    }
  }
});
