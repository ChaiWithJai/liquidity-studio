import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { DurableStore } from "./storage.js";
import { createPlatform } from "./platform.js";
import { createHttpServer } from "./index.js";
import { googleAuthConfiguration } from "./google-auth.js";
import { EditorBoundary } from "./editor-boundary.js";
import { PenpotStudioActions } from "./penpot-studio-actions.js";
import {
  PenpotTokenRefreshTransport,
  createPenpotRepositoryContext,
  createPenpotActorAuthorizer,
} from "./penpot-token-refresh.js";
import { campaignFromApprovedClaims } from "./source-integrity.js";
import {
  compileMultimodalBundle,
  brandRevision,
} from "./multimodal-contract.js";

// Real HTTP + GoogleIdentityService authorization with constructor-only identity/native
// adapters for deterministic tests. This is not a live Google/native acceptance claim.
test("scoped HTTP native action survives lost acknowledgement/reopen; replay never reapplies native work", async (t) => {
  const dir = await mkdtemp(join(tmpdir(), "penpot-studio-actions-"));
  t.after(() => rm(dir, { recursive: true, force: true }));
  const configuration = googleAuthConfiguration({
    STUDIO_FIREBASE_PROJECT_ID: "test-native-studio",
    STUDIO_FIREBASE_API_KEY: "public",
    STUDIO_FIREBASE_AUTH_DOMAIN: "test-native-studio.firebaseapp.com",
    STUDIO_FIREBASE_APP_ID: "public",
    STUDIO_GOOGLE_FOUNDER_EMAIL: "founder@example.com",
    STUDIO_GOOGLE_MARKETER_EMAIL: "marketer@example.com",
  });
  let disabled = false,
    nativeReads = 0;
  const googleAuth = {
    configuration,
    verifyIdToken: async () => ({
      aud: configuration.firebase.projectId,
      iss: `https://securetoken.google.com/${configuration.firebase.projectId}`,
      sub: "original-google-fixture",
      iat: Math.floor(Date.now() / 1000) - 5,
      exp: Math.floor(Date.now() / 1000) + 3600,
      email: "founder@example.com",
      email_verified: true,
      firebase: { sign_in_provider: "google.com" },
    }),
    lookupJobUser: async (email) => ({
      email,
      disabled,
      emailVerified: true,
      providerData: [{ providerId: "google.com" }],
      tokensValidAfterTime: "1970-01-01",
    }),
  };
  const scope = {
    organizationId: "org_default",
    brandId: "brand_vedic",
    preset: "vedic_dharma",
  };
  const target = {
    id: "native_test",
    ...scope,
    adapter: "penpot",
    ownerPrincipal: "11111111-1111-4111-8111-111111111111",
    nativeProjectId: "project",
    nativeRoomId: "room",
    nativeDocumentVersion: "1",
    nativeVersionKind: "archive",
    editorVersion: "2.18.3",
    resources: [
      {
        id: "tokens",
        kind: "tokens",
        nativeId: "22222222-2222-4222-8222-222222222222",
        nativeParentId: "project",
      },
    ],
  };
  delete target.preset;
  const manifests = new Map();
  let native = { revision: 1 };
  let platform, server, transport, service;
  async function open() {
    platform = createPlatform({
      store: new DurableStore(join(dir, "studio.sqlite")),
      authMode: "google",
      googleAuth,
    });
    await platform.ready;
    const repo = (await platform.forScope(scope)).ports.repo;
    const boundaryFactory = (injected) =>
      new EditorBoundary({
        store: platform.store,
        scope,
        identity: platform.identity,
        repo,
        targets: [target],
        transport: injected,
      });
    transport = new PenpotTokenRefreshTransport({
      authorizeActor: createPenpotActorAuthorizer(platform.identity),
      resolveContext: createPenpotRepositoryContext({
        repositoryForScope: async (requested) =>
          (await platform.forScope(requested)).ports.repo,
        manifests,
      }),
      nativeSnapshot: async () => {
        nativeReads++;
        return {
          ...native,
          ownerPrincipal: target.ownerPrincipal,
          projectId: "project",
          fileId: target.resources[0].nativeId,
          editorVersion: "2.18.3",
        };
      },
      onIssued: (event) => service.issued(event),
      onVerified: (event) => service.verified(event),
    });
    service = new PenpotStudioActions({
      store: platform.store,
      scope,
      identity: platform.identity,
      transport,
      boundaryFactory,
    });
    platform.getPenpotRuntime = async () => ({
      forScope: (requested) => {
        if (requested.brandId !== scope.brandId)
          throw Object.assign(new Error("Not found"), { status: 404 });
        return service;
      },
      register: async (actor, requested, body) => {
        if (requested.brandId !== scope.brandId)
          throw Object.assign(new Error("Not found"), { status: 404 });
        return boundaryFactory(transport).register(actor, body);
      },
    });
    server = createHttpServer(null, { platform, penpotEnabled: true });
    await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
    return repo;
  }
  const repo = await open();
  async function close() {
    await new Promise((resolve) => server.close(resolve));
    await platform.store.close();
  }
  t.after(async () => {
    if (server.listening) await close();
  });
  const story = {
    id: "original_native_story",
    revision: 1,
    generationId: "original_generation",
    sourceClaims: [
      {
        id: "original_claim",
        text: "Original native action fixture.",
        sourceUrl: "https://example.com/native-action-fixture",
        kind: "general",
        status: "approved",
      },
    ],
  };
  story.campaignDraft = {
    ...campaignFromApprovedClaims(story),
    provenance: { generationId: story.generationId, mode: "synthetic" },
  };
  await repo.mutate((state) => ({ ...state, backlog: [story] }));
  const request = (path, body, brand = scope.brandId, authenticated = true) =>
    fetch(
      `http://127.0.0.1:${server.address().port}${path}?organizationId=org_default&brandId=${brand}`,
      {
        method: body === undefined ? "GET" : "POST",
        headers: {
          "Content-Type": "application/json",
          ...(authenticated
            ? { Authorization: "Bearer constructor-test-token" }
            : {}),
        },
        body: body === undefined ? undefined : JSON.stringify(body),
      },
    );
  assert.equal(
    (
      await request(
        "/api/studio/penpot/actions",
        undefined,
        scope.brandId,
        false,
      )
    ).status,
    401,
  );
  const binding = await (
    await request("/api/studio/penpot/bindings", { targetId: target.id })
  ).json();
  const profile = await repo.getBrandProfile();
  const command = {
    operation: "refresh-brand-tokens",
    storyId: story.id,
    expectedRevision: 1,
    generationId: story.generationId,
    expectedBrandRevision: brandRevision(profile),
    expectedNativeRevision: 1,
  };
  const bundle = compileMultimodalBundle({
    scope,
    brandProfile: profile,
    story,
    request: { schemaVersion: 1, ...command, requiredCapabilities: [] },
  });
  manifests.set(
    `${scope.organizationId}:${scope.brandId}:${binding.id}:tokens`,
    {
      fileId: target.resources[0].nativeId,
      projectId: "project",
      ownerPrincipal: target.ownerPrincipal,
      bindingEpoch: 1,
      storyId: story.id,
      storyRevision: 1,
      generationId: story.generationId,
      sourceApprovals: bundle.sourceApprovals,
      fonts: profile.fonts,
      themeId: "theme",
      tokens: profile.colors.map((_, i) => ({
        id: `token${i}`,
        setId: "set",
        name: `studio.color${i}`,
      })),
    },
  );
  const intent = {
    bindingId: binding.id,
    resourceId: "tokens",
    command,
    idempotencyKey: "stable-attempt",
  };
  const response = await request("/api/studio/penpot/actions", intent);
  assert.equal(response.status, 201);
  const issued = await response.json();
  assert.equal(issued.action.status, "pending-native-action");
  assert.equal(typeof issued.nativeActionCapability, "string");
  const claimed = await transport.claim(issued.nativeActionCapability, {
    fileId: target.resources[0].nativeId,
    ownerPrincipal: target.ownerPrincipal,
  });
  native = {
    revision: 2,
    tokenValues: profile.colors.map((color) => color.hex.toLowerCase()),
    boundPaintsMatch: true,
  };
  // Ignore the acknowledgement result, as if the browser lost the committed reply.
  await transport.acknowledge(
    issued.nativeActionCapability,
    claimed.acknowledgement,
  );
  const durable = await (
    await request(`/api/studio/penpot/actions/${issued.action.id}`)
  ).json();
  assert.equal(durable.status, "native-state-verified");
  assert.equal(durable.verification.nativeRevision, 2);
  assert.equal(durable.verification.publicationApproved, false);
  const privateState = JSON.stringify(
    await platform.store.get(`penpot-action-security:org_default:brand_vedic`),
  );
  assert.equal(privateState.includes(issued.nativeActionCapability), false);
  assert.equal(privateState.includes(claimed.acknowledgement), false);
  assert.equal(
    JSON.stringify(await repo.exportData()).includes("stable-attempt"),
    false,
  );
  const before = nativeReads;
  await close();
  await open();
  const replay = await (
    await request("/api/studio/penpot/actions", intent)
  ).json();
  assert.equal(replay.capabilityAvailable, false);
  assert.equal(replay.action.id, issued.action.id);
  assert.equal(replay.action.status, "native-state-verified");
  assert.equal(nativeReads, before);
  assert.equal(
    (
      await request(
        `/api/studio/penpot/actions/${issued.action.id}`,
        undefined,
        "brand_default",
      )
    ).status,
    404,
  );
  assert.equal(
    (
      await request("/api/studio/penpot/actions", {
        ...intent,
        command: { ...command, expectedRevision: 2 },
      })
    ).status,
    409,
  );
  const interruptedIntent = {
    ...intent,
    idempotencyKey: "interrupted-attempt",
    command: { ...command, expectedNativeRevision: 2 },
  };
  const interrupted = await (
    await request("/api/studio/penpot/actions", interruptedIntent)
  ).json();
  await transport.claim(interrupted.nativeActionCapability, {
    fileId: target.resources[0].nativeId,
    ownerPrincipal: target.ownerPrincipal,
  });
  native.revision = 3;
  await close();
  await open();
  await assert.rejects(
    () =>
      transport.claim(interrupted.nativeActionCapability, {
        fileId: target.resources[0].nativeId,
        ownerPrincipal: target.ownerPrincipal,
      }),
    (error) => error.status === 410,
  );
  const manifestKey = `${scope.organizationId}:${scope.brandId}:${binding.id}:tokens`;
  const originalTheme = manifests.get(manifestKey).themeId;
  manifests.get(manifestKey).themeId = "changed-after-process-restart";
  assert.equal(
    (
      await request(
        `/api/studio/penpot/actions/${interrupted.action.id}/reconcile`,
        {},
      )
    ).status,
    409,
  );
  manifests.get(manifestKey).themeId = originalTheme;
  const reconciledResponse = await request(
    `/api/studio/penpot/actions/${interrupted.action.id}/reconcile`,
    {},
  );
  assert.equal(reconciledResponse.status, 200);
  const reconciled = await reconciledResponse.json();
  assert.equal(reconciled.status, "native-state-verified");
  assert.equal(reconciled.verification.method, "read-only-reconciliation");
  assert.equal(reconciled.verification.nativeRevision, 3);
  assert.equal(transport.pending.size, 0);
  disabled = true;
  assert.equal(
    (await request(`/api/studio/penpot/actions/${issued.action.id}`)).status,
    403,
  );
});
