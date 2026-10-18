import { EditorBoundary } from "./editor-boundary.js";
import { ScopedRepository } from "./repository.js";
import { fail } from "./auth.js";
import { loadPenpotLocalConfiguration } from "./penpot-local-configuration.js";
import { createPenpotLocalSnapshot } from "./penpot-local-snapshot.js";
import {
  PenpotTokenRefreshTransport,
  createPenpotActorAuthorizer,
  createPenpotRepositoryContext,
} from "./penpot-token-refresh.js";
import { PenpotStudioActions } from "./penpot-studio-actions.js";
import { NativeEditorService } from "./native-editor.js";
import { createPenpotPrivateMedia } from "./penpot-private-media.js";
import { penpotActionDigest } from "./penpot-action-ledger.js";
import {
  createPenpotMediaAuthorizer,
  createPenpotNativeReader,
  parsePenpotMediaPath,
} from "./penpot-media-authorization.js";
import { createPenpotNativeExports } from "./penpot-native-export.js";
import { brandRevision } from "./multimodal-contract.js";
import { isDeepStrictEqual } from "node:util";

/** Select only a current operator target. Old registrations may coexist after a
 * target update; their stale hash must not hide a later valid registration. */
export async function currentPenpotBinding(boundary, target, authorize) {
  const state = await boundary.read();
  for (const row of state.bindings.filter(
    (row) =>
      row.targetId === target.id &&
      row.organizationId === target.organizationId &&
      row.brandId === target.brandId &&
      row.ownerPrincipal === target.ownerPrincipal &&
      row.nativeProjectId === target.nativeProjectId &&
      !row.revokedAt,
  )) {
    let binding;
    try {
      binding = boundary.binding(state, row.id);
    } catch (error) {
      if ([403, 409].includes(error.status)) continue;
      throw error;
    }
    try {
      return { binding, actor: await authorize(binding) };
    } catch (error) {
      if (error.status === 403) continue;
      throw error;
    }
  }
  throw fail(403, "Current native registration unavailable");
}

/** Optional fixed-loopback runtime. The public deployment never configures this factory. */
export async function createPenpotStudioRuntime({
  store,
  identity,
  configurationPath,
  configurationLoader = loadPenpotLocalConfiguration,
  env = process.env,
}) {
  if (env.K_SERVICE || env.STUDIO_PENPOT_ENABLED !== "true")
    throw fail(503, "Penpot requires explicit local operator configuration");
  if (identity.configuration?.mode !== "google")
    throw fail(
      503,
      "Penpot Studio integration requires managed Google identity",
    );
  const configuration = await configurationLoader(
    configurationPath,
    env,
  );
  const services = new Map();
  const privateIngress = env.STUDIO_PENPOT_PRIVATE_INGRESS === "true";
  const rasterEnabled =
    privateIngress && env.STUDIO_PENPOT_RASTER_ENABLED === "true";
  const nativeOrigin =
    configuration.transportMode === "docker-host"
      ? "http://host.docker.internal:39008"
      : "http://localhost:39008";
  const assertPrivateDelivery = async () => {
    if (!privateIngress)
      throw fail(422, "Private native ingress is not configured");
    const response = await fetch(
      `${nativeOrigin}/__studio_native_ingress_marker`,
      {
        redirect: "error",
        cache: "no-store",
        signal: AbortSignal.timeout(3000),
      },
    );
    let marker = "";
    for await (const chunk of response.body) {
      marker += Buffer.from(chunk).toString("utf8");
      if (Buffer.byteLength(marker) > 64)
        throw fail(503, "Governed native ingress marker invalid");
    }
    if (
      !response.ok ||
      response.headers.get("x-studio-native-ingress") !== "1" ||
      marker !== "studio-native-private-fs-v1\n"
    )
      throw fail(
        503,
        "Governed native ingress was not observed; no image may be transferred",
      );
  };
  const serviceFor = (scope) => {
    const key = `${scope.organizationId}:${scope.brandId}`;
    if (!services.has(key)) {
      const repo = new ScopedRepository(store, scope);
      const boundaryFactory = (injectedTransport) =>
        new EditorBoundary({
          store,
          identity,
          scope,
          repo,
          targets: configuration.targets,
          transport: injectedTransport,
        });
      services.set(
        key,
        new PenpotStudioActions({
          store,
          scope,
          identity,
          transport,
          boundaryFactory,
          assets: new NativeEditorService({ repo, identity, scope }),
          assertPrivateDelivery,
        }),
      );
    }
    return services.get(key);
  };
  const transport = new PenpotTokenRefreshTransport({
    privateRasterSupported: rasterEnabled,
    prepareRaster: (input, context, snapshot) =>
      serviceFor(input.binding).prepareRaster(
        input,
        context,
        snapshot,
        uploadMedia,
      ),
    revalidateRaster: (input, reservation) =>
      serviceFor(input.binding).revalidateRaster(input, reservation),
    authorizeActor: createPenpotActorAuthorizer(identity),
    nativeSnapshot: createPenpotLocalSnapshot({
      sessions: configuration.sessions,
      transportMode: configuration.transportMode,
    }),
    resolveContext: async (input) => {
      const entry = configuration.manifests.get(input.binding.targetId);
      if (!entry) throw fail(404, "Private native manifest unavailable");
      const scope = {
        organizationId: input.binding.organizationId,
        brandId: input.binding.brandId,
      };
      const manifests = new Map([
        [
          `${scope.organizationId}:${scope.brandId}:${input.binding.id}:${input.resource.id}`,
          {
            ...structuredClone(entry.manifest),
            bindingEpoch: input.binding.epoch,
          },
        ],
      ]);
      return createPenpotRepositoryContext({
        repositoryForScope: async (scope) => new ScopedRepository(store, scope),
        manifests,
      })(input);
    },
    onIssued: (event) => serviceFor(event.input.binding).issued(event),
    onVerified: (event) => serviceFor(event.input.binding).verified(event),
  });
  const uploadMedia = createPenpotPrivateMedia({
    assertPrivateDelivery,
    onUploaded: (input, reservation, descriptor) =>
      serviceFor(input.binding).ledger.retainMedia(
        input.actor,
        input.durableActionId,
        descriptor,
      ),
    sessions: configuration.sessions,
    transportMode: configuration.transportMode,
    assetFor: (input, id) =>
      serviceFor(input.binding).assets.assetForNativeTransfer(input.actor, id),
    current: async (input) => {
      const context = await transport.context(input);
      const native = await transport.snapshot(
        input,
        context.manifest,
        context.colors,
      );
      if (native.revision !== input.command.expectedNativeRevision)
        throw fail(409, "Native revision changed before private image upload");
      return {
        ownerPrincipal: native.ownerPrincipal,
        fileId: native.fileId,
        projectId: native.projectId,
        editorVersion: native.editorVersion,
        revision: native.revision,
        storyRevision: context.bundle.storyRevision,
        generationId: context.bundle.generationId,
        brandRevision: context.bundle.brandRevision,
        bindingEpoch: input.binding.epoch,
        manifestHash: penpotActionDigest(context.manifest),
      };
    },
  });
  const fonts = new Map();
  const legacy = new Map();
  for (const entry of configuration.legacyMedia) {
    const target = configuration.targets.find(
      (target) => target.id === entry.targetId,
    );
    const resource = target.resources.find(
      (resource) => resource.id === entry.resourceId,
    );
    const record = {
      kind: "legacy-native-copy",
      organizationId: target.organizationId,
      brandId: target.brandId,
      targetId: target.id,
      resourceId: resource.id,
      fileId: resource.nativeId,
      projectId: target.nativeProjectId,
      ownerPrincipal: target.ownerPrincipal,
      fileMediaId: entry.fileMediaId,
      objectId: entry.objectId,
      sha256: entry.sha256,
      contentType: entry.contentType,
      rightsDeclaration: entry.rightsDeclaration,
      consent: entry.consent,
    };
    for (const [kind, id] of [
      ["by-id", entry.objectId],
      ["by-file-media-id", entry.fileMediaId],
    ]) {
      if (!id) continue;
      const key = `${kind}:${id}`;
      legacy.set(key, [...(legacy.get(key) || []), record]);
    }
  }
  for (const entry of configuration.manifests.values()) {
    const target = configuration.targets.find(
      (target) => target.id === entry.targetId,
    );
    for (const font of entry.manifest.nativeFonts || []) {
      for (const field of [
        "ttfFileId",
        "otfFileId",
        "woff1FileId",
        "woff2FileId",
      ]) {
        const id = font.persistedVariant?.[field];
        if (
          typeof id !== "string" ||
          !/^[a-f0-9]{8}-(?:[a-f0-9]{4}-){3}[a-f0-9]{12}$/.test(id)
        )
          continue;
        const records = fonts.get(id) || [];
        records.push({
          kind: "font",
          organizationId: target.organizationId,
          brandId: target.brandId,
          targetId: target.id,
          fileId: entry.manifest.fileId,
          projectId: target.nativeProjectId,
          ownerPrincipal: target.ownerPrincipal,
          sha256: font.persistedByteHashes?.[field],
          contentType: {
            ttfFileId: "font/ttf",
            otfFileId: "font/otf",
            woff1FileId: "font/woff",
            woff2FileId: "font/woff2",
          }[field],
        });
        fonts.set(id, records);
      }
    }
  }
  const nativeReader = createPenpotNativeReader({
    transportMode: configuration.transportMode,
  });
  async function exportSourceContext(request) {
    const target = configuration.targets.find(
      (target) =>
        target.ownerPrincipal === request.profileId &&
        target.resources.some(
          (resource) =>
            resource.kind === "tokens" && resource.nativeId === request.fileId,
        ),
    );
    if (!target) throw fail(403, "Native export target is not registered");
    const service = serviceFor(target),
      boundary = service.boundaryFactory(transport);
    const { binding, actor } = await currentPenpotBinding(
      boundary,
      target,
      async (binding) => {
        const current = await identity.authorizeJobActor(
          binding.registeredBy,
          binding.registeredAt,
        );
        await identity.authorize(
          current,
          target.organizationId,
          target.brandId,
        );
        return current;
      },
    );
    const resource = binding.resources.find(
      (resource) =>
        resource.kind === "tokens" && resource.nativeId === request.fileId,
    );
    if (!resource) throw fail(403, "Native export file is not registered");
    const entry = configuration.manifests.get(target.id);
    const repo = new ScopedRepository(store, target);
    const command = {
      operation: "refresh-brand-tokens",
      storyId: entry.manifest.storyId,
      expectedRevision: entry.manifest.storyRevision,
      generationId: entry.manifest.generationId,
      expectedBrandRevision: brandRevision(await repo.getBrandProfile()),
      expectedNativeRevision: 0,
    };
    const context = await transport.context({
      binding,
      resource,
      actor: { id: actor.id },
      command,
      authorizedAt: binding.registeredAt,
      reauthorize: () => service.ledger.permitted(actor),
    });
    return {
      organizationId: target.organizationId,
      brandId: target.brandId,
      bindingId: binding.id,
      bindingEpoch: binding.epoch,
      ownerPrincipal: binding.ownerPrincipal,
      fileId: resource.nativeId,
      projectId: binding.nativeProjectId,
      actorId: actor.id,
      sourceSha256: penpotActionDigest(context.bundle),
      manifestSha256: penpotActionDigest(context.manifest),
      request: structuredClone(request),
    };
  }
  async function authorizeExportContext(cookie, request) {
    const profile = await nativeReader(cookie, "get-profile", {});
    if (profile.id !== request.profileId)
      throw fail(403, "Native export owner changed");
    const context = await exportSourceContext(request);
    const file = await nativeReader(cookie, "get-file", { id: request.fileId });
    const shape =
      file.data?.pagesIndex?.[request.pageId]?.objects?.[request.objectId];
    if (
      file.id !== context.fileId ||
      file.projectId !== context.projectId ||
      !Number.isSafeInteger(file.revn) ||
      !shape ||
      !Number.isFinite(shape.width) ||
      !Number.isFinite(shape.height) ||
      shape.width <= 0 ||
      shape.height <= 0 ||
      shape.width * shape.height > 8_000_000
    )
      throw fail(
        422,
        "Native export object is unavailable or exceeds its bound",
      );
    const final = await exportSourceContext(request);
    if (!isDeepStrictEqual(final, context))
      throw fail(409, "Native export source changed");
    return {
      ...context,
      nativeRevision: file.revn,
      nativeSha256: penpotActionDigest(file.data),
    };
  }
  const nativeExports = createPenpotNativeExports({
    store,
    transportMode: configuration.transportMode,
    authorizeContext: authorizeExportContext,
    resolveSvgResource: async ({ resource, context, cookie }) => {
      const requested = parsePenpotMediaPath(resource.path);
      await authorizeMediaRead({ path: resource.path, cookie });
      const record = await resolveMediaRecord(
        requested,
        context.ownerPrincipal,
        context,
      );
      if (
        !record ||
        (resource.kind === "font"
          ? record.kind !== "font"
          : ["font", "native-export"].includes(record.kind))
      )
        throw fail(403, "Native SVG resource is not registered to this file");
      let sha256 = record.sha256,
        contentType = record.contentType;
      if (resource.kind === "image" && record.actionId) {
        const action = await serviceFor(record).get(
          { id: record.actorId },
          record.actionId,
        );
        sha256 = action.media?.sha256;
        contentType = action.media?.descriptor?.mtype;
      }
      if (resource.kind === "image" && record.kind === "legacy-native-copy")
        contentType = record.contentType;
      if (!/^[a-f0-9]{64}$/.test(sha256 || ""))
        throw fail(422, "Verified native resource byte hash is required");
      return { sha256, contentType };
    },
    reauthorizeContext: async (context) => {
      const current = await exportSourceContext(context.request);
      const { nativeRevision, nativeSha256, ...source } = context;
      if (!isDeepStrictEqual(current, source))
        throw fail(409, "Native export source or registration changed");
    },
  });
  async function authorizeMediaRecord(record) {
    if (record.kind === "native-export")
      return nativeExports.authorizeRecord(record);
    const service = serviceFor(record);
    const boundary = service.boundaryFactory(transport);
    if (["font", "legacy-native-copy"].includes(record.kind)) {
      const target = configuration.targets.find(
        (target) =>
          target.id === record.targetId &&
          target.organizationId === record.organizationId &&
          target.brandId === record.brandId,
      );
      if (!target) throw fail(403, "Native asset target unavailable");
      await currentPenpotBinding(boundary, target, async (binding) => {
        if (
          binding.ownerPrincipal !== record.ownerPrincipal ||
          binding.nativeProjectId !== record.projectId ||
          !binding.resources.some(
            (resource) =>
              resource.nativeId === record.fileId &&
              (record.kind === "font"
                ? resource.kind === "tokens"
                : resource.id === record.resourceId &&
                  resource.kind === "document"),
          )
        )
          throw fail(403, "Native asset resource registration changed");
        const actor = await identity.authorizeJobActor(
          binding.registeredBy,
          binding.registeredAt,
        );
        await identity.authorize(actor, record.organizationId, record.brandId);
        return actor;
      });
      return;
    }
    const actor = { id: record.actorId };
    const action = await service.get(actor, record.actionId);
    const input = await service.input(actor, action);
    if (
      input.binding.epoch !== record.bindingEpoch ||
      input.binding.ownerPrincipal !== record.ownerPrincipal ||
      input.binding.nativeProjectId !== record.projectId ||
      input.resource.nativeId !== record.fileId ||
      action.media?.descriptor?.id !== record.fileMediaId ||
      action.media?.descriptor?.provenance?.mediaObjectId !== record.objectId
    )
      throw fail(403, "Native private media registration changed");
    await service.revalidateRaster(input, action.media);
  }
  async function resolveMediaRecord(
    requested,
    ownerPrincipal,
    requiredContext = null,
  ) {
    if (!privateIngress || requested.thumbnail) return null;
    const exported = await nativeExports.resolve(requested, ownerPrincipal);
    if (exported) return exported;
    const copies =
      (await store.get(
        `penpot-media-security:${requested.kind}:${requested.id}`,
      )) || [];
    const records = [
      ...copies,
      ...(legacy.get(`${requested.kind}:${requested.id}`) || []),
      ...(requested.kind === "by-id" ? fonts.get(requested.id) || [] : []),
    ];
    for (const record of records.filter(
      (record) =>
        record.ownerPrincipal === ownerPrincipal &&
        (!requiredContext ||
          [
            "organizationId",
            "brandId",
            "fileId",
            "projectId",
            "ownerPrincipal",
          ].every((key) => record[key] === requiredContext[key])),
    )) {
      try {
        await authorizeMediaRecord(record);
        return record;
      } catch (error) {
        if (![401, 403, 404, 409, 422].includes(error.status)) throw error;
      }
    }
    return null;
  }
  const authorizeMediaRead = createPenpotMediaAuthorizer({
    transportMode: configuration.transportMode,
    runAuthorityPhase: (work) =>
      identity.runManagedJobLookupPhase
        ? identity.runManagedJobLookupPhase(work)
        : work(),
    authorize: authorizeMediaRecord,
    resolve: resolveMediaRecord,
  });
  return {
    transport,
    transportMode: configuration.transportMode,
    forScope: serviceFor,
    authorizeMediaRead,
    nativeExports,
    async bindings(actor, scope) {
      const service = serviceFor(scope);
      await service.ledger.permitted(actor);
      const boundary = service.boundaryFactory(transport);
      const rows = await boundary.list(actor);
      const targets = configuration.targets.filter(
        (target) =>
          target.organizationId === scope.organizationId &&
          target.brandId === scope.brandId,
      );
      const bindings = [];
      let imageDeliveryAvailable = false;
      if (rasterEnabled) {
        try {
          await assertPrivateDelivery();
          imageDeliveryAvailable = true;
        } catch {
          /* Keep the image workflow explicitly unavailable. */
        }
      }
      for (const row of rows.filter((row) =>
        targets.some((target) => target.id === row.targetId),
      )) {
        const entry = configuration.manifests.get(row.targetId);
        const resource = row.resources.find(
          (item) =>
            item.kind === "tokens" && item.nativeId === entry.manifest.fileId,
        );
        if (!resource) continue;
        const nativeUrl = `http://localhost:39008/#/workspace?team-id=${encodeURIComponent(entry.teamId)}&file-id=${encodeURIComponent(resource.nativeId)}`;
        try {
          const repo = new ScopedRepository(store, scope);
          const { brandRevision } = await import("./multimodal-contract.js");
          const command = {
            operation: "refresh-brand-tokens",
            storyId: entry.manifest.storyId,
            expectedRevision: entry.manifest.storyRevision,
            generationId: entry.manifest.generationId,
            expectedBrandRevision: brandRevision(await repo.getBrandProfile()),
            expectedNativeRevision: 0,
          };
          const input = {
            binding: row,
            resource,
            actor: { id: actor.id },
            command,
            authorizedAt: new Date().toISOString(),
            reauthorize: () => service.ledger.permitted(actor),
          };
          const context = await transport.context(input);
          const native = await transport.snapshot(
            input,
            context.manifest,
            context.colors,
          );
          command.expectedNativeRevision = native.revision;
          bindings.push({
            id: row.id,
            targetId: row.targetId,
            storyId: entry.manifest.storyId,
            resourceId: resource.id,
            nativeUrl,
            command,
            available: true,
            imageBoards: native.imageBoards,
            imageTransfer: {
              supported: imageDeliveryAvailable,
              reason: imageDeliveryAvailable
                ? null
                : "Private image delivery is unavailable. No saved image is transferred.",
            },
          });
        } catch (error) {
          bindings.push({
            id: row.id,
            targetId: row.targetId,
            storyId: entry.manifest.storyId,
            resourceId: resource.id,
            nativeUrl,
            available: false,
            reason:
              error.status === 409
                ? "Source, font or native registration changed; operator rebind is required."
                : "Current native owner or source could not be verified.",
          });
        }
      }
      return {
        bindings,
        targets: targets.map((target) => ({
          id: target.id,
          storyId: configuration.manifests.get(target.id)?.manifest.storyId,
          registered: rows.some((row) => row.targetId === target.id),
        })),
        actions: await service.list(actor),
      };
    },
    async register(actor, scope, input) {
      if (
        !input ||
        Array.isArray(input) ||
        Object.keys(input).length !== 1 ||
        typeof input.targetId !== "string"
      )
        throw fail(400, "Only a configured native target may be registered");
      const service = serviceFor(scope);
      await service.ledger.permitted(actor);
      return service.boundaryFactory(transport).register(actor, input);
    },
  };
}
