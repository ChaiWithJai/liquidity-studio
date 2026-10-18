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
import { createPenpotMediaAuthorizer } from "./penpot-media-authorization.js";

/** Optional fixed-loopback runtime. The public deployment never configures this factory. */
export async function createPenpotStudioRuntime({
  store,
  identity,
  configurationPath,
  env = process.env,
}) {
  if (identity.configuration?.mode !== "google")
    throw fail(
      503,
      "Penpot Studio integration requires managed Google identity",
    );
  const configuration = await loadPenpotLocalConfiguration(
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
        });
        fonts.set(id, records);
      }
    }
  }
  async function authorizeMediaRecord(record) {
    const service = serviceFor(record);
    const boundary = service.boundaryFactory(transport);
    if (["font", "legacy-native-copy"].includes(record.kind)) {
      const binding = (await boundary.read()).bindings.find(
        (row) => row.targetId === record.targetId && !row.revokedAt,
      );
      if (!binding) throw fail(403, "Native asset registration unavailable");
      boundary.binding(await boundary.read(), binding.id);
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
  const authorizeMediaRead = createPenpotMediaAuthorizer({
    transportMode: configuration.transportMode,
    authorize: authorizeMediaRecord,
    resolve: async (requested, ownerPrincipal) => {
      if (!privateIngress || requested.thumbnail) return null;
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
        (record) => record.ownerPrincipal === ownerPrincipal,
      )) {
        try {
          await authorizeMediaRecord(record);
          return record;
        } catch (error) {
          if (![401, 403, 404, 409, 422].includes(error.status)) throw error;
        }
      }
      return null;
    },
  });
  return {
    transport,
    transportMode: configuration.transportMode,
    forScope: serviceFor,
    authorizeMediaRead,
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
