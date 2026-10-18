import test from "node:test";
import assert from "node:assert/strict";
import { DurableStore } from "./storage.js";
import { createPlatform } from "./platform.js";
import { createHttpServer } from "./index.js";
import { brandRevision } from "./multimodal-contract.js";
import { campaignFromApprovedClaims } from "./source-integrity.js";
import {
  PenpotTokenRefreshTransport,
  createPenpotRepositoryContext,
} from "./penpot-token-refresh.js";

test("real scoped Studio HTTP compiles approved persisted source; stale brand/source/native and foreign binding reject with injected native reader", async (t) => {
  const owner = "11111111-1111-4111-8111-111111111111",
    fileId = "22222222-2222-4222-8222-222222222222";
  const target = {
    id: "penpot_test",
    organizationId: "org_default",
    brandId: "brand_vedic",
    adapter: "penpot",
    ownerPrincipal: owner,
    nativeProjectId: "project",
    nativeRoomId: "room",
    nativeDocumentVersion: "1",
    nativeVersionKind: "archive",
    editorVersion: "2.18.3",
    resources: [
      {
        id: "tokens",
        kind: "tokens",
        nativeId: fileId,
        nativeParentId: "project",
      },
    ],
  };
  const manifests = new Map();
  let platform,
    reads = 0;
  const transport = new PenpotTokenRefreshTransport({
    resolveContext: createPenpotRepositoryContext({
      repositoryForScope: async (scope) =>
        (await platform.forScope({ ...scope, preset: "vedic_dharma" })).ports
          .repo,
      manifests,
    }),
    authorizeActor: async (actor, binding) => {
      const current = (await platform.store.get("identity")).users.find(
        (user) => user.id === actor.id,
      );
      await platform.identity.authorize(
        current,
        binding.organizationId,
        binding.brandId,
      );
    },
    nativeSnapshot: async () => {
      reads++;
      return {
        ownerPrincipal: owner,
        fileId,
        projectId: "project",
        editorVersion: "2.18.3",
        revision: 1,
      };
    },
  });
  platform = createPlatform({
    store: new DurableStore(":memory:"),
    authMode: "password",
    editorTargets: [target],
    editorTransport: transport,
  });
  await platform.ready;
  await platform.identity.provision({
    username: "operator",
    password: "original-http-test-password",
    role: "founder",
  });
  const scope = {
      organizationId: "org_default",
      brandId: "brand_vedic",
      preset: "vedic_dharma",
    },
    repo = (await platform.forScope(scope)).ports.repo;
  const story = {
    id: "original_story",
    revision: 1,
    generationId: "generation_original",
    sourceClaims: [
      {
        id: "claim_original",
        text: "Original bounded HTTP fixture.",
        sourceUrl: "https://example.com/original-http-fixture",
        kind: "general",
        status: "approved",
      },
    ],
  };
  story.campaignDraft = {
    ...campaignFromApprovedClaims(story),
    provenance: { generationId: story.generationId, mode: "synthetic" },
  };
  await repo.mutate((state) => {
    state.backlog = [story];
    return state;
  });
  const server = createHttpServer(null, {
    platform,
    editorBoundaryEnabled: true,
  });
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  t.after(async () => {
    await new Promise((resolve) => server.close(resolve));
    platform.store.close();
  });
  const base = "http://127.0.0.1:" + server.address().port;
  const login = await fetch(base + "/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      username: "operator",
      password: "original-http-test-password",
    }),
  });
  assert.equal(login.status, 200);
  const cookie = login.headers.get("set-cookie").split(";")[0];
  const request = (path, body, brand = "brand_vedic") =>
    fetch(base + path + "?organizationId=org_default&brandId=" + brand, {
      method: body === undefined ? "GET" : "POST",
      headers: { "Content-Type": "application/json", Cookie: cookie },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  const registered = await request("/api/studio/editor-bindings", {
    targetId: target.id,
  });
  assert.equal(registered.status, 201);
  const binding = await registered.json();
  const profile = (await repo.read()).brandProfile;
  manifests.set(`org_default:brand_vedic:${binding.id}:tokens`, {
    fileId,
    projectId: "project",
    ownerPrincipal: owner,
    bindingEpoch: binding.epoch,
    storyId: story.id,
    storyRevision: story.revision,
    generationId: story.generationId,
    sourceApprovals: story.sourceClaims.map((claim) => ({
      id: claim.id,
      text: claim.text,
      sourceUrl: claim.sourceUrl,
      kind: claim.kind,
    })),
    fonts: profile.fonts,
    tokens: Array.from({ length: 4 }, (_, i) => ({
      id: "token" + i,
      setId: "set",
      name: "studio.color" + i,
    })),
  });
  // Use the actual compiler's approval DTO, not a test-forged source shape.
  const { compileMultimodalBundle } = await import("./multimodal-contract.js");
  const command = {
    operation: "refresh-brand-tokens",
    storyId: story.id,
    expectedRevision: 1,
    generationId: story.generationId,
    expectedBrandRevision: brandRevision(profile),
    expectedNativeRevision: 1,
  };
  const authoritative = compileMultimodalBundle({
    scope,
    brandProfile: profile,
    story,
    request: { schemaVersion: 1, ...command, requiredCapabilities: [] },
  });
  manifests.get(
    `org_default:brand_vedic:${binding.id}:tokens`,
  ).sourceApprovals = authoritative.sourceApprovals;
  const endpoint = `/api/studio/editor-bindings/${binding.id}/operations`,
    body = { resourceId: "tokens", kind: "tokens", action: "write", command };
  const allowed = await request(endpoint, body);
  assert.equal(allowed.status, 200);
  const pending = await allowed.json();
  assert.equal(pending.status, "pending-native-action");
  assert.equal(typeof pending.nativeActionCapability, "string");
  assert.equal(reads, 1);
  assert.equal((await request(endpoint, body, "brand_default")).status, 404);
  assert.equal(
    (
      await request(endpoint, {
        ...body,
        command: { ...command, expectedRevision: 2 },
      })
    ).status,
    409,
  );
  assert.equal(
    (
      await request(endpoint, {
        ...body,
        command: { ...command, expectedNativeRevision: 0 },
      })
    ).status,
    409,
  );
  assert.equal(
    (
      await request(endpoint, {
        ...body,
        command: { ...command, ownerPrincipal: "foreign" },
      })
    ).status,
    400,
  );
  const colors = profile.colors.map((color, i) => ({
    ...color,
    hex: i === 0 ? "#123456" : color.hex,
  }));
  assert.equal(
    (await request("/api/studio/brand-profile", { colors })).status,
    200,
  );
  assert.equal((await request(endpoint, body)).status, 409);
  await assert.rejects(
    transport.claim(pending.nativeActionCapability, {
      fileId,
      ownerPrincipal: owner,
    }),
    /revision|changed/i,
  );
  const exported = await repo.exportData();
  assert.equal(
    JSON.stringify(exported).includes(pending.nativeActionCapability),
    false,
  );
  assert.equal(JSON.stringify(exported).includes(binding.id), false);
});
