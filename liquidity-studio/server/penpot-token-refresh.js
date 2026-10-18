import { createHash, randomBytes, randomUUID } from "node:crypto";
import { isDeepStrictEqual } from "node:util";
import { fail } from "./auth.js";
import { compileMultimodalBundle } from "./multimodal-contract.js";
import { compilePenpotNative } from "./penpot-native.js";
import {
  penpotRasterFields,
  validatePenpotRasterCommand,
} from "./penpot-action-ledger.js";

const FIELDS = [
  "operation",
  "storyId",
  "expectedRevision",
  "generationId",
  "expectedBrandRevision",
  "expectedNativeRevision",
];
const digest = (value) => createHash("sha256").update(value).digest("hex");
function sameIdentity(a, b) {
  return (
    a.storyId === b.storyId &&
    a.storyRevision === b.storyRevision &&
    a.generationId === b.generationId &&
    a.brandRevision === b.brandRevision &&
    isDeepStrictEqual(a.scope, b.scope)
  );
}
/**
 * Optional constructor-injected local native action transport. No production network
 * configuration or native owner credentials are accepted from HTTP commands.
 * resolveContext must load and compile the current scoped repository contract and
 * retrieve an operator-owned manifest (not native plugin data or portable payload).
 */
export class PenpotTokenRefreshTransport {
  constructor({
    resolveContext,
    nativeSnapshot,
    authorizeActor,
    now = Date.now,
    ttlMs = 60_000,
    onIssued = async () => {},
    onVerified = async () => {},
    prepareRaster = null,
    revalidateRaster = null,
    privateRasterSupported = false,
  }) {
    if (
      typeof onIssued !== "function" ||
      typeof onVerified !== "function" ||
      typeof authorizeActor !== "function" ||
      typeof resolveContext !== "function" ||
      typeof nativeSnapshot !== "function" ||
      !Number.isInteger(ttlMs) ||
      ttlMs < 1000 ||
      ttlMs > 60_000
    )
      throw new Error("Invalid Penpot action configuration");
    this.resolveContext = resolveContext;
    this.authorizeActor = authorizeActor;
    this.nativeSnapshot = nativeSnapshot;
    this.now = now;
    this.ttlMs = ttlMs;
    this.pending = new Map();
    this.rasterPreparing = new Set();
    this.onIssued = onIssued;
    this.onVerified = onVerified;
    this.prepareRaster = prepareRaster;
    this.revalidateRaster = revalidateRaster;
    this.privateRasterSupported = privateRasterSupported === true;
  }
  validateCommand({ binding, resource, action, command }) {
    const raster = command?.operation === "import-private-raster";
    const fields = raster ? penpotRasterFields : FIELDS;
    if (
      binding.adapter !== "penpot" ||
      binding.editorVersion !== "2.18.3" ||
      binding.nativeVersionKind !== "archive" ||
      binding.nativeDocumentVersion !== "1" ||
      resource.kind !== "tokens" ||
      action !== "write"
    )
      throw fail(422, "Unsupported registered Penpot action");
    if (
      !command ||
      Array.isArray(command) ||
      typeof command !== "object" ||
      Object.keys(command).some((key) => !fields.includes(key)) ||
      fields.some((key) => !(key in command)) ||
      !["refresh-brand-tokens", "import-private-raster"].includes(
        command.operation,
      ) ||
      !Number.isInteger(command.expectedRevision) ||
      command.expectedRevision < 1 ||
      !Number.isInteger(command.expectedNativeRevision) ||
      command.expectedNativeRevision < 0 ||
      ![command.storyId, command.generationId].every(
        (value) =>
          typeof value === "string" && value.length > 0 && value.length <= 200,
      ) ||
      !/^[a-f0-9]{64}$/.test(command.expectedBrandRevision)
    )
      throw fail(400, "Invalid Penpot token refresh command");
    if (
      raster &&
      (!this.privateRasterSupported ||
        typeof this.prepareRaster !== "function" ||
        typeof this.revalidateRaster !== "function")
    )
      throw fail(
        422,
        "Private native raster delivery is unsupported by the current native server",
      );
    if (raster) validatePenpotRasterCommand(command);
    return structuredClone(command);
  }
  async context(input) {
    await input.reauthorize();
    await this.authorizeActor(input.actor, input.binding, input.authorizedAt);
    const { bundle, manifest } = await this.resolveContext(input);
    if (
      !bundle ||
      bundle.kind !== "multimodal-spec" ||
      bundle.schemaVersion !== 1 ||
      bundle.scope.organizationId !== input.binding.organizationId ||
      bundle.scope.brandId !== input.binding.brandId ||
      bundle.storyId !== input.command.storyId ||
      bundle.storyRevision !== input.command.expectedRevision ||
      bundle.generationId !== input.command.generationId ||
      bundle.brandRevision !== input.command.expectedBrandRevision ||
      manifest.fileId !== input.resource.nativeId ||
      manifest.projectId !== input.binding.nativeProjectId ||
      manifest.ownerPrincipal !== input.binding.ownerPrincipal ||
      manifest.bindingEpoch !== input.binding.epoch ||
      manifest.storyId !== bundle.storyId ||
      manifest.storyRevision !== bundle.storyRevision ||
      manifest.generationId !== bundle.generationId ||
      !isDeepStrictEqual(manifest.sourceApprovals, bundle.sourceApprovals) ||
      !Array.isArray(manifest.tokens) ||
      manifest.tokens.length !== 4 ||
      !isDeepStrictEqual(manifest.fonts, bundle.tokens.fonts)
    )
      throw fail(
        409,
        "Current native registration or source revisions changed",
      );
    const colors = bundle.tokens.colors;
    if (
      !Array.isArray(colors) ||
      colors.length !== 4 ||
      colors.some((color) => !/^#[a-f0-9]{6}$/i.test(color.hex))
    )
      throw fail(422, "Unsupported authoritative palette");
    return {
      bundle,
      manifest,
      colors: colors.map((color) => ({
        ...color,
        hex: color.hex.toLowerCase(),
      })),
    };
  }
  async snapshot(input, manifest, colors, raster = null) {
    const snapshot = await this.nativeSnapshot(input, {
      manifest,
      colors,
      raster,
    });
    if (
      snapshot.ownerPrincipal !== manifest.ownerPrincipal ||
      snapshot.fileId !== manifest.fileId ||
      snapshot.projectId !== manifest.projectId ||
      snapshot.editorVersion !== "2.18.3"
    )
      throw fail(403, "Native owner or file mismatch");
    return snapshot;
  }
  prune() {
    for (const [key, row] of this.pending)
      if (row.expiresAt <= this.now()) this.pending.delete(key);
  }
  async execute(input) {
    this.validateCommand(input);
    if (input.command.operation !== "import-private-raster")
      return this.issue(input);
    const id = input.durableActionId;
    if (
      typeof id !== "string" ||
      !/^[a-f0-9]{8}-(?:[a-f0-9]{4}-){3}[a-f0-9]{12}$/.test(id)
    )
      throw fail(400, "Durable server raster reservation required");
    this.prune();
    if (this.rasterPreparing.has(id))
      throw fail(409, "This saved image action is already preparing");
    if (this.pending.size + this.rasterPreparing.size >= 100)
      throw fail(429, "Native action queue full");
    this.rasterPreparing.add(id);
    try {
      return await this.issue(input);
    } finally {
      this.rasterPreparing.delete(id);
    }
  }
  async issue(input) {
    this.validateCommand(input);
    this.prune();
    if (this.pending.size >= 100) throw fail(429, "Native action queue full");
    // A durable caller carries its original server-owned intent time across restarts.
    // No HTTP field may supply this trusted authorization context.
    if (
      input.authorizedAt !== undefined &&
      !Number.isFinite(Date.parse(input.authorizedAt))
    )
      throw fail(400, "Invalid server native authorization context");
    input = {
      ...input,
      authorizedAt: input.authorizedAt || new Date(this.now()).toISOString(),
    };
    const context = await this.context(input);
    const snapshot = await this.snapshot(
      input,
      context.manifest,
      context.colors,
    );
    if (snapshot.revision !== input.command.expectedNativeRevision)
      throw fail(409, "Native revision changed");
    const raster =
      input.command.operation === "import-private-raster"
        ? await this.prepareRaster(input, context, snapshot)
        : null;
    if (raster && !isDeepStrictEqual(await this.context(input), context))
      throw fail(409, "Source or registration changed before action issue");
    await input.reauthorize();
    const capability = randomBytes(32).toString("base64url");
    const receipt = {
      id: raster ? input.durableActionId : randomUUID(),
      status: "pending-native-action",
      editorialReviewRequired: true,
      publicationApproved: false,
      expiresAt: this.now() + this.ttlMs,
      storyId: context.bundle.storyId,
      storyRevision: context.bundle.storyRevision,
      generationId: context.bundle.generationId,
      brandRevision: context.bundle.brandRevision,
    };
    // No await separates this capacity check from insertion. Concurrent context
    // lookups may all pass the inexpensive admission check above.
    this.prune();
    if (raster)
      for (const [key, row] of this.pending)
        if (row.input.durableActionId === input.durableActionId)
          this.pending.delete(key);
    if (this.pending.size >= 100) throw fail(429, "Native action queue full");
    this.pending.set(digest(capability), {
      input,
      context: structuredClone(context),
      receipt,
      expiresAt: receipt.expiresAt,
      state: "pending",
      raster,
    });
    try {
      await this.onIssued({
        input,
        receipt: structuredClone(receipt),
        context,
      });
    } catch (error) {
      this.pending.delete(digest(capability));
      throw error;
    }
    // Deliberately returned only to the currently authorized caller. This ephemeral
    // capability is never persisted, logged or exported. Restart drops all grants.
    return {
      ...receipt,
      nativeActionCapability: capability,
      requiresNativeAction: true,
      pixelsVerified: false,
    };
  }
  lookup(capability) {
    this.prune();
    if (typeof capability !== "string" || !/^[\w-]{43}$/.test(capability))
      throw fail(403, "Invalid native action");
    const row = this.pending.get(digest(capability));
    if (!row) throw fail(410, "Native action expired or unavailable");
    return row;
  }
  async claim(capability, { fileId, ownerPrincipal }) {
    const row = this.lookup(capability);
    if (row.state !== "pending")
      throw fail(409, "Native action already claimed");
    // Reserve synchronously before network I/O so concurrent claims cannot both win.
    row.state = "checking";
    try {
      const current = await this.context(row.input);
      if (row.raster) await this.revalidateRaster(row.input, row.raster);
      if (
        !sameIdentity(current.bundle, row.context.bundle) ||
        !isDeepStrictEqual(current.manifest, row.context.manifest)
      )
        throw fail(409, "Source or native registration changed");
      const snapshot = await this.snapshot(
        row.input,
        current.manifest,
        current.colors,
      );
      if (
        snapshot.revision !== row.input.command.expectedNativeRevision ||
        fileId !== current.manifest.fileId ||
        ownerPrincipal !== (current.manifest.pluginPrincipal || current.manifest.ownerPrincipal)
      )
        throw fail(409, "Native context changed");
      await row.input.reauthorize();
      this.lookup(capability);
      const finalContext = await this.context(row.input);
      if (
        !sameIdentity(finalContext.bundle, current.bundle) ||
        !isDeepStrictEqual(finalContext.manifest, current.manifest)
      )
        throw fail(409, "Source or registration changed before native claim");
      this.lookup(capability);
      row.state = "claimed";
      row.acknowledgement = randomBytes(32).toString("base64url");
      if (row.raster)
        return {
          operation: "import-private-raster",
          receiptId: row.receipt.id,
          expiresAt: row.receipt.expiresAt,
          fileId,
          ownerPrincipal,
          editorVersion: "2.18.3",
          pageId: row.input.command.pageId,
          frameId: row.input.command.frameId,
          placement: structuredClone(row.input.command.placement),
          media: structuredClone(row.raster.media),
          acknowledgement: row.acknowledgement,
        };
      return {
        receiptId: row.receipt.id,
        fileId,
        ownerPrincipal,
        editorVersion: "2.18.3",
        themeId: current.manifest.themeId,
        tokens: current.manifest.tokens.map((token, index) => ({
          id: token.id,
          setId: token.setId,
          name: token.name,
          value: current.colors[index].hex,
        })),
        acknowledgement: row.acknowledgement,
      };
    } catch (error) {
      this.pending.delete(digest(capability));
      throw error;
    }
  }
  async acknowledge(capability, acknowledgement) {
    const row = this.lookup(capability);
    if (
      row.state !== "claimed" ||
      typeof acknowledgement !== "string" ||
      acknowledgement !== row.acknowledgement
    )
      throw fail(403, "Invalid native acknowledgement");
    row.state = "verifying";
    try {
      const current = await this.context(row.input);
      if (row.raster) await this.revalidateRaster(row.input, row.raster);
      if (
        !sameIdentity(current.bundle, row.context.bundle) ||
        !isDeepStrictEqual(current.manifest, row.context.manifest)
      )
        throw fail(
          409,
          "Source or native registration changed during native action",
        );
      const snapshot = await this.snapshot(
        row.input,
        current.manifest,
        current.colors,
        row.raster ? { ...row.raster, receiptId: row.receipt.id } : null,
      );
      if (
        snapshot.revision <= row.input.command.expectedNativeRevision ||
        (row.raster
          ? snapshot.imageMatches !== true ||
            snapshot.originalsPreserved !== true
          : !isDeepStrictEqual(
              snapshot.tokenValues,
              current.colors.map((color) => color.hex),
            ) || snapshot.boundPaintsMatch !== true)
      )
        throw fail(409, "Native paint propagation not yet verified");
      await row.input.reauthorize();
      if (row.raster) await this.revalidateRaster(row.input, row.raster);
      this.lookup(capability);
      const finalContext = await this.context(row.input);
      if (
        !sameIdentity(finalContext.bundle, current.bundle) ||
        !isDeepStrictEqual(finalContext.manifest, current.manifest)
      )
        throw fail(
          409,
          "Source or registration changed during native verification",
        );
      this.lookup(capability);
      await this.onVerified({
        input: row.input,
        receipt: structuredClone(row.receipt),
        context: finalContext,
        nativeRevision: snapshot.revision,
      });
      this.lookup(capability);
      this.pending.delete(digest(capability));
      return {
        ...row.receipt,
        status: "native-state-verified",
        nativeRevision: snapshot.revision,
        requiresNativeAction: false,
        pixelsVerified: false,
      };
    } catch (error) {
      // A retry may verify delayed native persistence, but may never apply twice.
      row.state = "claimed";
      throw error;
    }
  }
}

/** Registry and repository factory are operator-owned constructor dependencies. */
export function createPenpotRepositoryContext({
  repositoryForScope,
  manifests,
}) {
  return async (input) => {
    const scope = {
      organizationId: input.binding.organizationId,
      brandId: input.binding.brandId,
    };
    const repo = await repositoryForScope(scope);
    const state = await repo.read();
    const story = state.backlog.find((row) => row.id === input.command.storyId);
    if (!story) throw fail(404, "Current source story not found");
    const manifest = manifests.get(
      `${scope.organizationId}:${scope.brandId}:${input.binding.id}:${input.resource.id}`,
    );
    if (!manifest) throw fail(404, "Operator native manifest not registered");
    const bundle = compileMultimodalBundle({
      scope,
      brandProfile: state.brandProfile,
      story,
      request: {
        schemaVersion: 1,
        storyId: story.id,
        expectedRevision: input.command.expectedRevision,
        generationId: input.command.generationId,
        expectedBrandRevision: input.command.expectedBrandRevision,
        requiredCapabilities: [],
      },
    });
    const currentManifest = structuredClone(manifest);
    if (manifest.nativeFonts) {
      const current = compilePenpotNative(bundle, {
        fileId: manifest.fileId,
        fonts: manifest.nativeFonts,
      });
      if (
        !isDeepStrictEqual(
          penpotNativeFontBindings(current),
          manifest.fontBindings,
        )
      )
        throw fail(422, "Native font change requires a verified rebind");
      // Canonicalizing an equivalent fallback list in Brand Kit is not a font change.
      currentManifest.fonts = structuredClone(bundle.tokens.fonts);
    }
    return { bundle, manifest: currentManifest };
  };
}

/** Revalidate managed Google identity without retaining a user JWT. */
export function createPenpotActorAuthorizer(identity) {
  return async (actor, binding, authorizedAt) => {
    if (typeof identity.authorizeJobActor !== "function")
      throw fail(503, "Managed native actor verification is not configured");
    const current = await identity.authorizeJobActor(actor.id, authorizedAt);
    await identity.authorize(current, binding.organizationId, binding.brandId);
  };
}

export function penpotNativeFontBindings(compiled) {
  const entries=[];
  const visit=value=>{if(!value||typeof value!=="object")return;if(value["font-id"]&&value["font-family"]&&value["font-weight"])entries.push({fontId:value["font-id"],family:value["font-family"],weight:value["font-weight"]});for(const item of Object.values(value))if(item&&typeof item==="object"){if(Array.isArray(item))item.forEach(visit);else visit(item);}};
  for(const change of compiled.changes.filter(c=>c.obj?.type==="text"))visit(change.obj.content);
  return [
    ...new Map(entries.map((entry) => [JSON.stringify(entry), entry])).values(),
  ].sort((a, b) =>
    JSON.stringify(a) < JSON.stringify(b)
      ? -1
      : JSON.stringify(a) > JSON.stringify(b)
        ? 1
        : 0,
  );
}
