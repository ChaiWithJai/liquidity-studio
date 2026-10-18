import { createHash } from "node:crypto";
import { fail } from "./auth.js";
import { assertRestoreAvailable } from "./restore-gate.js";
import {
  compileMultimodalBundle,
  brandRevision,
} from "./multimodal-contract.js";
import {
  compileDooryDocument,
  applyDooryBrandTokens,
} from "./doory-native-adapter.js";
const hash = (value) =>
  createHash("sha256").update(JSON.stringify(value)).digest("hex");
const clone = (value) => structuredClone(value);
function strict(value, keys) {
  if (
    !value ||
    typeof value !== "object" ||
    Array.isArray(value) ||
    Object.keys(value).some((key) => !keys.includes(key))
  )
    throw fail(400, "Unsupported historical rebind fields");
}
function registeredFonts(document, registry) {
  const families = new Set(registry.map((font) => font.family));
  function visit(value) {
    if (!value || typeof value !== "object") return;
    if (Object.hasOwn(value, "fontFamily")) {
      const family =
        typeof value.fontFamily === "string"
          ? value.fontFamily.match(
              /^"([^"\n]+)", (?:sans-serif|serif)$/,
            )?.[1] || value.fontFamily
          : null;
      if (!families.has(family))
        throw fail(
          422,
          "Historical layout uses an unsupported font; reconcile it explicitly",
        );
    }
    for (const child of Object.values(value)) visit(child);
  }
  visit(document);
}
async function context(service, actor, id, validate) {
  await service.authorize(actor);
  const identity = await service.store.get("identity"),
    principal = identity?.users.find((user) => user.id === actor.id);
  if (principal?.role !== "founder")
    throw fail(
      403,
      "Current founder access required to bind a historical layout",
    );
  const original = await service.store.get(service.key(id));
  if (!original) throw fail(404, "Native document not found");
  if (original.origin?.requiresSourceReview !== true)
    throw fail(409, "Choose an imported historical layout for this action");
  if (
    original.origin.scope.organizationId !== service.scope.organizationId ||
    original.origin.scope.brandId !== service.scope.brandId
  )
    throw fail(409, "Historical layout scope is inconsistent");
  const state = await service.repo.read(),
    story = state.backlog.find((row) => row.id === original.storyId);
  const review = story?.campaignDraft?.provenance?.reviewedCopy;
  const entry = state.preparedSourceCandidates?.find(
    (item) => item.candidate?.id === review?.candidateId,
  );
  const receipt = entry?.promotionReceipts?.find(
    (item) =>
      item.generationId === story?.generationId &&
      item.candidateRevision === review?.candidateRevision &&
      item.copySha256 === review?.copySha256 &&
      item.actorId === actor.id &&
      item.contentRevision === (story?.contentRevision || 1),
  );
  if (
    !story ||
    !entry ||
    entry.restoredHistorical ||
    !receipt ||
    entry.candidate.organizationId !== service.scope.organizationId ||
    entry.candidate.brandId !== service.scope.brandId ||
    entry.candidate.storyId !== story.id
  )
    throw fail(
      409,
      "Review and adopt the current saved copy as this owner before binding the historical layout",
    );
  const spec = compileMultimodalBundle({
    scope: service.scope,
    brandProfile: state.brandProfile,
    story,
    request: {
      schemaVersion: 1,
      format: original.format,
      storyId: story.id,
      expectedRevision: story.revision,
      generationId: story.generationId,
      expectedBrandRevision: brandRevision(state.brandProfile),
      requiredCapabilities: [],
    },
  });
  const compiled = compileDooryDocument({
    spec,
    brandProfile: state.brandProfile,
    format: original.format,
    availableFonts: service.availableFonts,
  });
  const previous = await service.hydrate(original);
  const assets = await service.documentAssets(actor, previous.document);
  const assetKeys = assets.map((asset) => `${service.prefix}asset:${asset.id}`);
  if (assets.length > 100) throw fail(413, "Historical layout asset limit");
  const assetHashes = [];
  for (const key of assetKeys)
    assetHashes.push(hash(await service.store.get(key)));
  // Verify the immutable private bytes too; a metadata-only asset cannot silently substitute content.
  for (const asset of assets) await service.asset(actor, asset.id);
  const document = validate(previous.document, {
    assets,
    pageIds: compiled.manifest.pageIds,
  });
  if (
    document.width !== compiled.document.width ||
    document.height !== compiled.document.height
  )
    throw fail(
      422,
      "Historical layout dimensions do not match this format; reconcile explicitly",
    );
  if (
    original.format === "reel" &&
    (document.pages.some(
      (page) =>
        !Number.isFinite(page.durationSec) ||
        page.durationSec <= 0 ||
        page.durationSec > 30,
    ) ||
      Math.abs(
        document.pages.reduce((total, page) => total + page.durationSec, 0) -
          30,
      ) > 0.001)
  )
    throw fail(
      422,
      "Historical reel must retain three valid timecoded pages totaling 30 seconds",
    );
  registeredFonts(document, service.availableFonts);
  const retokened = applyDooryBrandTokens({
    document,
    manifest: original.origin,
    tokens: spec.tokens,
    expectedBrandRevision: original.origin.brandRevision,
    brandRevision: spec.brandRevision,
    availableFonts: service.availableFonts,
  });
  registeredFonts(retokened.document, service.availableFonts);
  const origin = {
    ...compiled.manifest,
    sourceContentRevision: story.contentRevision || 1,
    documentSha256: hash(retokened.document),
    historicalRebind: {
      nativeId: id,
      nativeRevision: original.revision,
      documentSha256: hash(document),
      sourceReviewCandidateId: review.candidateId,
      sourceReviewCandidateRevision: review.candidateRevision,
      actorId: actor.id,
      authority: "new-proposal-only",
    },
  };
  const fields = {
    schemaVersion: 1,
    historicalId: id,
    historicalRevision: original.revision,
    historicalDocumentSha256: hash(document),
    storyId: story.id,
    storyRevision: story.revision,
    contentRevision: story.contentRevision || 1,
    generationId: story.generationId,
    brandRevision: spec.brandRevision,
    candidateId: review.candidateId,
    candidateRevision: review.candidateRevision,
    copySha256: review.copySha256,
    ownerId: actor.id,
    format: original.format,
    pageCount: document.pages.length,
    reviewAuthority: "not-transferred",
    sourceCopyUnchanged: true,
    nativeCopyRequiresReview: true,
  };
  const plan = { ...fields, planSha256: hash(fields) };
  await service.authorize(actor);
  return {
    identityHash: hash(identity),
    stateHash: hash(state),
    originalHash: hash(original),
    original,
    assetKeys,
    assetHashes,
    plan,
    document: retokened.document,
    origin,
  };
}
async function proposal(service, actor, record, snapshot = record) {
  const dto = await service.publicRecord(actor, record, snapshot);
  let sourceState = "current";
  try {
    service.assertCurrent(await service.repo.read(), dto.origin);
  } catch (error) {
    if ([409, 422].includes(error.status)) sourceState = "changed";
    else throw error;
  }
  return { ...dto, sourceState };
}
export async function planHistoricalRebind(service, actor, id, validate) {
  return (await context(service, actor, id, validate)).plan;
}
export async function rebindHistorical(service, actor, id, input, validate) {
  strict(input, [
    "planSha256",
    "expectedHistoricalRevision",
    "confirmed",
    "idempotencyKey",
  ]);
  if (
    input.confirmed !== true ||
    !Number.isSafeInteger(input.expectedHistoricalRevision) ||
    input.expectedHistoricalRevision < 1 ||
    !/^[a-f0-9]{64}$/.test(input.planSha256)
  )
    throw fail(400, "Confirm the exact historical-layout binding plan");
  await service.authorize(actor);
  const intent = service.request(actor, `historical-rebind:${id}`, input);
  const digest = hash({
    scope: service.scope,
    actor: actor.id,
    key: input.idempotencyKey,
    operation: `historical-rebind:${id}`,
  });
  const newId = `${digest.slice(0, 8)}-${digest.slice(8, 12)}-${digest.slice(12, 16)}-${digest.slice(16, 20)}-${digest.slice(20, 32)}`,
    key = service.key(newId);
  const prior = await service.store.get(key),
    replay = service.replay(prior, intent);
  if (replay) {
    const identity = await service.store.get("identity");
    if (
      identity?.users.find((user) => user.id === actor.id)?.role !== "founder"
    )
      throw fail(403, "Current founder access required");
    return proposal(service, actor, prior, replay);
  }
  const captured = await context(service, actor, id, validate);
  if (
    captured.plan.planSha256 !== input.planSha256 ||
    captured.original.revision !== input.expectedHistoricalRevision
  )
    throw fail(
      409,
      "The historical layout, reviewed source or brand changed; check a new binding plan",
    );
  const documentRef = await service.persistDocument(captured.document);
  let retained = false;
  try {
    await service.authorize(actor);
    const at = service.now();
    const record = {
      schemaVersion: 1,
      id: newId,
      organizationId: service.scope.organizationId,
      brandId: service.scope.brandId,
      storyId: captured.original.storyId,
      format: captured.original.format,
      revision: 1,
      title: `${captured.original.title} — reviewed-source copy`.slice(0, 160),
      documentRef,
      initialDocumentRef: documentRef,
      origin: captured.origin,
      status: "proposal",
      createdBy: actor.id,
      updatedBy: actor.id,
      createdAt: at,
      updatedAt: at,
    };
    const snapshot = clone(record);
    let acknowledged = snapshot;
    const keys = [
      "identity",
      service.repo.key,
      service.key(id),
      key,
      ...captured.assetKeys,
    ];
    const result = await service.store.transact(
      keys,
      ([identity, state, old, current, ...assets]) => {
        assertRestoreAvailable(state);
        if (
          hash(identity) !== captured.identityHash ||
          hash(state) !== captured.stateHash ||
          hash(old) !== captured.originalHash ||
          assets.some(
            (asset, index) => hash(asset) !== captured.assetHashes[index],
          )
        )
          throw fail(
            409,
            "Current access, source, brand, historical layout or assets changed before binding",
          );
        service.assertCurrent(state, captured.origin);
        const priorSnapshot = service.replay(current, intent);
        if (priorSnapshot) {
          acknowledged = priorSnapshot;
          return [identity, state, old, current, ...assets];
        }
        if (current) throw fail(409, "Native copy idempotency collision");
        return [
          identity,
          state,
          old,
          { ...record, receipts: [{ ...intent, snapshot }] },
          ...assets,
        ];
      },
    );
    const saved = result[3];
    retained =
      saved.documentRef.key === documentRef.key &&
      saved.documentRef.artifact?.object === documentRef.artifact?.object;
    return proposal(service, actor, saved, acknowledged);
  } finally {
    if (!retained) await service.discardPayload(documentRef);
  }
}
