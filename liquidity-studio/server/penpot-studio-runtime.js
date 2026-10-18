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
        }),
      );
    }
    return services.get(key);
  };
  const transport = new PenpotTokenRefreshTransport({
    authorizeActor: createPenpotActorAuthorizer(identity),
    nativeSnapshot: createPenpotLocalSnapshot({
      sessions: configuration.sessions,
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
  return {
    transport,
    forScope: serviceFor,
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
