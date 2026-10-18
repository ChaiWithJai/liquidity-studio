import { createHash } from "node:crypto";
import { fail } from "./auth.js";
import {
  MODNET_MODEL_SHA256,
  MODNET_PROCESSOR_VERSION,
} from "./native-cutout-contract.js";
const hash = (value) =>
  createHash("sha256").update(JSON.stringify(value)).digest("hex");
function exact(value, keys) {
  if (
    !value ||
    typeof value !== "object" ||
    Array.isArray(value) ||
    Object.keys(value).some((k) => !keys.includes(k))
  )
    throw fail(400, "Unsupported cutout fields");
}
export const MAX_CUTOUT_INTENTS = 128;
export class NativeCutoutService {
  constructor({ native, model, now = () => Date.now() }) {
    this.native = native;
    this.model = model;
    this.store = native.store;
    this.now = now;
  }
  async manifest(actor) {
    await this.native.authorize(actor);
    const result = await this.model.manifest();
    await this.native.authorize(actor);
    return result;
  }
  async chunk(actor, index) {
    await this.native.authorize(actor);
    const result = await this.model.chunk(index);
    await this.native.authorize(actor);
    return result;
  }
  assertIdentity(state, actor) {
    const { organizationId, brandId } = this.native.scope;
    if (
      !state?.users?.some((u) => u.id === actor.id) ||
      !state.organizations?.some(
        (o) =>
          o.id === organizationId && o.brands.some((b) => b.id === brandId),
      ) ||
      !state.memberships?.some(
        (m) =>
          m.userId === actor.id &&
          m.organizationId === organizationId &&
          m.brandIds.includes(brandId),
      )
    )
      throw fail(403, "Organization or brand access denied");
  }
  async prepare(actor, input) {
    exact(input, [
      "documentId",
      "expectedRevision",
      "inputAssetId",
      "idempotencyKey",
    ]);
    await this.native.authorize(actor);
    await this.model.manifest();
    if (
      !Number.isSafeInteger(input.expectedRevision) ||
      input.expectedRevision < 1 ||
      !/^[-a-zA-Z0-9_]{16,100}$/.test(input.idempotencyKey || "") ||
      !/^[a-f0-9]{32}$/.test(input.inputAssetId || "")
    )
      throw fail(400, "Invalid cutout intent");
    const documentKey = this.native.key(input.documentId),
      assetKey = `${this.native.prefix}asset:${input.inputAssetId}`;
    const saved = await this.store.get(documentKey);
    if (!saved) throw fail(404, "Native document not found");
    const hydrated = await this.native.hydrate(saved);
    let referenced = false;
    function walk(value) {
      if (!value || typeof value !== "object") return;
      if (value.type === "image" && value.assetId === input.inputAssetId)
        referenced = true;
      for (const child of Object.values(value)) walk(child);
    }
    walk(hydrated.document);
    if (!referenced)
      throw fail(
        422,
        "Save the selected private image in this native proposal before removing its background",
      );
    const intentId = hash({
        scope: this.native.scope,
        actor: actor.id,
        key: input.idempotencyKey,
      }).slice(0, 32),
      intentKey = `${this.native.prefix}cutout-intents`;
    const fingerprint = hash(input),
      now = this.now();
    const result = await this.store.transact(
      ["identity", this.native.repo.key, documentKey, assetKey, intentKey],
      (values) => {
        const [identity, state, current, asset, ledger] = values;
        const prior = ledger?.intents.find((item) => item.id === intentId);
        this.assertIdentity(identity, actor);
        if (
          !current ||
          current.revision !== input.expectedRevision ||
          hash(current.documentRef) !== hash(saved.documentRef)
        )
          throw fail(409, "Native revision changed before background removal");
        this.native.assertCurrent(state, current.origin);
        if (
          !asset ||
          !asset.rightsDeclaration?.trim() ||
          !["confirmed", "not_personal_data"].includes(asset.consent)
        )
          throw fail(422, "Input image rights and consent must be recorded");
        if (prior) {
          if (prior.fingerprint !== fingerprint || prior.actorId !== actor.id)
            throw fail(409, "Cutout key was used for another intent");
          if (prior.expiresAt < now)
            throw fail(409, "Cutout intent expired; start again");
          return values;
        }
        const retained = (ledger?.intents || []).filter(
          (item) => item.expiresAt >= now,
        );
        if (retained.length >= MAX_CUTOUT_INTENTS)
          throw fail(
            429,
            "Too many pending background-removal intents; retry after existing intents expire",
          );
        const permit = {
          id: intentId,
          actorId: actor.id,
          fingerprint,
          documentId: input.documentId,
          nativeRevision: current.revision,
          documentRefHash: hash(current.documentRef),
          inputAssetId: asset.id,
          inputSha256: asset.sha256,
          width: asset.width,
          height: asset.height,
          rightsDeclaration: asset.rightsDeclaration,
          consent: asset.consent,
          modelSha256: MODNET_MODEL_SHA256,
          processorVersion: MODNET_PROCESSOR_VERSION,
          outputPolicy: "preserve-resolution-or-reject",
          createdAt: now,
          expiresAt: now + 15 * 60 * 1000,
        };
        return [
          identity,
          state,
          current,
          asset,
          { intents: [...retained, permit] },
        ];
      },
    );
    await this.native.authorize(actor);
    const intent = result[4].intents.find((item) => item.id === intentId);
    return {
      id: intent.id,
      nativeRevision: intent.nativeRevision,
      inputAssetId: intent.inputAssetId,
      inputSha256: intent.inputSha256,
      width: intent.width,
      height: intent.height,
      modelSha256: intent.modelSha256,
      processorVersion: intent.processorVersion,
      outputPolicy: intent.outputPolicy,
    };
  }
  async complete(actor, input) {
    exact(input, ["intentId", "base64", "idempotencyKey"]);
    await this.native.authorize(actor);
    await this.model.manifest();
    if (!/^[a-f0-9]{32}$/.test(input.intentId || ""))
      throw fail(400, "Invalid cutout intent");
    const intentKey = `${this.native.prefix}cutout-intents`;
    const intent = (await this.store.get(intentKey))?.intents.find(
      (item) => item.id === input.intentId,
    );
    if (!intent || intent.actorId !== actor.id)
      throw fail(404, "Cutout intent not found");
    const documentKey = this.native.key(intent.documentId),
      assetKey = `${this.native.prefix}asset:${intent.inputAssetId}`;
    return this.native.uploadAsset(
      actor,
      {
        name: "Background removed.png",
        contentType: "image/png",
        base64: input.base64,
        rightsDeclaration: intent.rightsDeclaration,
        consent: intent.consent,
        idempotencyKey: input.idempotencyKey,
      },
      {
        keys: [
          "identity",
          this.native.repo.key,
          documentKey,
          assetKey,
          intentKey,
        ],
        validate: ([identity, state, current, source, ledger], asset) => {
          const permit = ledger?.intents.find(
            (item) => item.id === input.intentId,
          );
          this.assertIdentity(identity, actor);
          if (
            !permit ||
            permit.actorId !== actor.id ||
            permit.fingerprint !== intent.fingerprint ||
            permit.expiresAt < this.now()
          )
            throw fail(409, "Cutout intent expired or changed");
          if (
            !current ||
            current.revision !== intent.nativeRevision ||
            hash(current.documentRef) !== intent.documentRefHash
          )
            throw fail(
              409,
              "Native revision changed; original image remains unchanged",
            );
          this.native.assertCurrent(state, current.origin);
          if (
            !source ||
            source.sha256 !== intent.inputSha256 ||
            source.rightsDeclaration !== intent.rightsDeclaration ||
            source.consent !== intent.consent
          )
            throw fail(409, "Input image rights or content changed");
          if (asset.width !== intent.width || asset.height !== intent.height)
            throw fail(422, "Cutout must preserve original pixel dimensions");
          const lineage = {
            kind: "background-removal",
            execution: "browser_reported",
            serverValidation:
              "scope-source-native-input-hash-rights-dimensions-output-hash",
            inputAssetId: source.id,
            inputSha256: source.sha256,
            modelSha256: MODNET_MODEL_SHA256,
            processorVersion: MODNET_PROCESSOR_VERSION,
            outputPolicy: "preserve-resolution-or-reject",
            documentId: intent.documentId,
            nativeRevision: intent.nativeRevision,
            intentId: intent.id,
            actorId: actor.id,
          };
          if (asset.lineage && hash(asset.lineage) !== hash(lineage))
            throw fail(409, "Cutout lineage differs from retained receipt");
          return { ...asset, lineage };
        },
      },
    );
  }
}
