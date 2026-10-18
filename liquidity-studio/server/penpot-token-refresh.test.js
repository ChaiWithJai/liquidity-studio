import test from "node:test";
import assert from "node:assert/strict";
import { PenpotTokenRefreshTransport } from "./penpot-token-refresh.js";
import { applyRegisteredPenpotTokens } from "../tools/penpot-token-plugin/action.js";
const hash = "a".repeat(64);
function fixture() {
  let now = 1000,
    allowed = true,
    managedAllowed = true;
  const bundle = {
    kind: "multimodal-spec",
    schemaVersion: 1,
    scope: { organizationId: "org", brandId: "brand" },
    storyId: "story",
    storyRevision: 2,
    generationId: "generation",
    brandRevision: hash,
    tokens: {
      fonts: { heading: "Mona Sans", body: "Inter" },
      colors: ["#111111", "#222222", "#333333", "#444444"].map((hex) => ({
        hex,
      })),
    },
  };
  const manifest = {
    fileId: "file",
    projectId: "project",
    ownerPrincipal: "owner",
    bindingEpoch: 1,
    storyId: bundle.storyId,
    storyRevision: bundle.storyRevision,
    generationId: bundle.generationId,
    sourceApprovals: bundle.sourceApprovals,
    themeId: "theme",
    fonts: structuredClone(bundle.tokens.fonts),
    tokens: bundle.tokens.colors.map((_, i) => ({
      id: `token${i}`,
      setId: "set",
      name: `studio.color${i}`,
    })),
  };
  const snapshot = {
    fileId: "file",
    projectId: "project",
    ownerPrincipal: "owner",
    editorVersion: "2.18.3",
    revision: 5,
  };
  const input = {
    binding: {
      adapter: "penpot",
      editorVersion: "2.18.3",
      nativeVersionKind: "archive",
      nativeDocumentVersion: "1",
      organizationId: "org",
      brandId: "brand",
      nativeProjectId: "project",
      ownerPrincipal: "owner",
      epoch: 1,
    },
    resource: { kind: "tokens", nativeId: "file" },
    action: "write",
    command: {
      operation: "refresh-brand-tokens",
      storyId: "story",
      expectedRevision: 2,
      generationId: "generation",
      expectedBrandRevision: hash,
      expectedNativeRevision: 5,
    },
    reauthorize: async () => {
      if (!allowed) throw new Error("Revoked");
    },
  };
  const transport = new PenpotTokenRefreshTransport({
    authorizeActor: async () => {
      if (!managedAllowed) throw new Error("Managed actor disabled");
    },
    resolveContext: async () => ({ bundle, manifest }),
    nativeSnapshot: async () => structuredClone(snapshot),
    now: () => now,
  });
  return {
    transport,
    input,
    bundle,
    manifest,
    snapshot,
    expire: () => {
      now += 61000;
    },
    disableManaged: () => {
      managedAllowed = false;
    },
    revoke: () => {
      allowed = false;
    },
  };
}
test("registered action remains pending until independently read native paint matches; no replay", async () => {
  const f = fixture();
  const pending = await f.transport.execute(f.input);
  assert.equal(pending.status, "pending-native-action");
  assert.equal(pending.pixelsVerified, false);
  const intent = await f.transport.claim(pending.nativeActionCapability, {
    fileId: "file",
    ownerPrincipal: "owner",
  });
  await assert.rejects(
    f.transport.claim(pending.nativeActionCapability, {
      fileId: "file",
      ownerPrincipal: "owner",
    }),
    /already claimed/,
  );
  await assert.rejects(
    f.transport.acknowledge(
      pending.nativeActionCapability,
      intent.acknowledgement,
    ),
    /not yet verified/,
  );
  f.snapshot.revision = 6;
  f.snapshot.tokenValues = f.bundle.tokens.colors.map((c) => c.hex);
  f.snapshot.boundPaintsMatch = true;
  const result = await f.transport.acknowledge(
    pending.nativeActionCapability,
    intent.acknowledgement,
  );
  assert.equal(result.status, "native-state-verified");
  assert.equal(result.pixelsVerified, false);
  await assert.rejects(
    f.transport.acknowledge(
      pending.nativeActionCapability,
      intent.acknowledgement,
    ),
    /unavailable/,
  );
});
test("revocation, source changes, foreign owner/file, unknown commands and expiry fail closed", async () => {
  for (const change of [
    (f) => f.revoke(),
    (f) => f.disableManaged(),
    (f) => {
      f.bundle.storyRevision++;
    },
    (f) => {
      f.bundle.brandRevision = "b".repeat(64);
    },
    (f) => {
      f.manifest.bindingEpoch++;
    },
    (f) => f.expire(),
  ]) {
    const f = fixture(),
      pending = await f.transport.execute(f.input);
    change(f);
    await assert.rejects(
      f.transport.claim(pending.nativeActionCapability, {
        fileId: "file",
        ownerPrincipal: "owner",
      }),
    );
  }
  const f = fixture(),
    pending = await f.transport.execute(f.input);
  await assert.rejects(
    f.transport.claim(pending.nativeActionCapability, {
      fileId: "foreign",
      ownerPrincipal: "owner",
    }),
    /context changed/,
  );
  await assert.rejects(
    f.transport.execute({
      ...f.input,
      command: { ...f.input.command, palette: ["#ffffff"] },
    }),
    /Invalid/,
  );
});
test("native public token setter retains current human text/geometry; validates all tokens before write", async () => {
  const text = { characters: "Human edit after server observation", x: 17 };
  let updates = 0;
  const tokens = Array.from({ length: 4 }, (_, i) => ({
    id: `token${i}`,
    name: `studio.color${i}`,
    type: "color",
    set value(v) {
      this.current = v;
      updates++;
    },
  }));
  const penpot = {
    currentFile: { id: "file" },
    currentUser: { id: "owner" },
    library: {
      local: {
        tokens: {
          themes: [{ id: "theme", active: true }],
          sets: [
            {
              id: "set",
              active: true,
              tokens,
              getTokenById: (id) => tokens.find((t) => t.id === id),
            },
          ],
        },
      },
    },
    waitForLayoutUpdate: async () => {},
  };
  const f = fixture(),
    pending = await f.transport.execute(f.input),
    intent = await f.transport.claim(pending.nativeActionCapability, {
      fileId: "file",
      ownerPrincipal: "owner",
    });
  await applyRegisteredPenpotTokens(penpot, intent);
  assert.equal(updates, 4);
  assert.deepEqual(text, {
    characters: "Human edit after server observation",
    x: 17,
  });
  updates = 0;
  await assert.rejects(
    applyRegisteredPenpotTokens(penpot, {
      ...intent,
      tokens: intent.tokens.map((t, i) =>
        i === 3 ? { ...t, id: "unknown" } : t,
      ),
    }),
    /unavailable/,
  );
  assert.equal(updates, 0);
});

test("managed native actor is looked up again with approval time and current scope; no password fallback", async () => {
  const { createPenpotActorAuthorizer } = await import(
    "./penpot-token-refresh.js"
  );
  let disabled = false;
  const calls = [];
  const identity = {
    authorizeJobActor: async (id, time) => {
      calls.push({ id, time });
      if (disabled) throw new Error("Managed account disabled");
      return { id, role: "marketer" };
    },
    authorize: async (user, org, brand) => {
      assert.equal(user.role, "marketer");
      assert.equal(org, "org");
      assert.equal(brand, "brand");
    },
  };
  const authorize = createPenpotActorAuthorizer(identity);
  await authorize(
    { id: "actor", role: "founder" },
    { organizationId: "org", brandId: "brand" },
    "2026-10-18T00:00:00Z",
  );
  assert.deepEqual(calls, [{ id: "actor", time: "2026-10-18T00:00:00Z" }]);
  disabled = true;
  await assert.rejects(
    authorize({ id: "actor" }, { organizationId: "org", brandId: "brand" }),
    /disabled/,
  );
  await assert.rejects(
    createPenpotActorAuthorizer({})({ id: "actor" }, {}),
    /not configured/,
  );
});

test("equivalent Brand Kit font fallback normalization preserves verified bindings; real font change requires rebind", async () => {
  const { BRAND_PRESETS } = await import("./domain.js");
  const { campaignFromApprovedClaims } = await import("./source-integrity.js");
  const { compileMultimodalBundle, brandRevision } = await import(
    "./multimodal-contract.js"
  );
  const { compilePenpotNative } = await import("./penpot-native.js");
  const { createPenpotRepositoryContext, penpotNativeFontBindings } =
    await import("./penpot-token-refresh.js");
  const profile = structuredClone(BRAND_PRESETS.liquidity_desk),
    scope = { organizationId: "org", brandId: "brand" };
  const story = {
    id: "story",
    revision: 1,
    generationId: "generation",
    sourceClaims: [
      {
        id: "claim",
        text: "Original font fallback fixture.",
        sourceUrl: "https://example.com/font-fixture",
        kind: "general",
        status: "approved",
      },
    ],
  };
  story.campaignDraft = {
    ...campaignFromApprovedClaims(story),
    provenance: { generationId: story.generationId, mode: "synthetic" },
  };
  const fonts = [
    ["Instrument Serif", 400],
    ["Mona Sans", 400],
    ["Mona Sans", 700],
    ["Inter", 400],
  ].map(([family, weight], i) => ({
    family,
    weight,
    fontId: `custom-00000000-0000-4000-8000-00000000000${i}`,
    sha256: "a".repeat(64),
    license: "OFL-1.1",
  }));
  const request = () => ({
    schemaVersion: 1,
    storyId: story.id,
    expectedRevision: 1,
    generationId: story.generationId,
    expectedBrandRevision: brandRevision(profile),
    requiredCapabilities: [],
  });
  const bundle = compileMultimodalBundle({
    scope,
    brandProfile: profile,
    story,
    request: request(),
  });
  const fileId = "11111111-1111-4111-8111-111111111111";
  const compiled = compilePenpotNative(bundle, { fileId, fonts });
  const manifest = {
    fileId,
    nativeFonts: fonts,
    fontBindings: penpotNativeFontBindings(compiled),
    fonts: structuredClone(profile.fonts),
  };
  const resolve = createPenpotRepositoryContext({
    repositoryForScope: async () => ({
      read: async () => ({ brandProfile: profile, backlog: [story] }),
    }),
    manifests: new Map([["org:brand:binding:tokens", manifest]]),
  });
  const input = () => ({
    binding: { id: "binding", ...scope },
    resource: { id: "tokens" },
    command: request(),
  });
  profile.fonts = { heading: "Instrument Serif", body: "Mona Sans" };
  assert.deepEqual((await resolve(input())).manifest.fonts, profile.fonts);
  profile.fonts.heading = "Mona Sans";
  await assert.rejects(resolve(input()), /verified rebind/);
});
