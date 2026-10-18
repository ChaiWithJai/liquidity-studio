import { randomUUID, createHash } from "node:crypto";
import { DurableStore } from "../../server/storage.js";
import { createPlatform } from "../../server/platform.js";
import { buildPreparedCandidate } from "../../server/prepared-source-candidate.js";
import { PreparedPromotionService } from "../../server/prepared-promotion.js";
import {
  EditorPackService,
  createEditorRestoreDestination,
} from "../../server/editor-pack-service.js";
import { brandRevision } from "../../server/multimodal-contract.js";
const sha = (value) => createHash("sha256").update(value).digest("hex");
export async function confirmPrepared(service, actor, id) {
  const plan = await service.plan(actor, id);
  return service.promote(actor, id, {
    idempotencyKey: randomUUID(),
    expectedCandidateRevision: plan.candidateRevision,
    expectedContentRevision: plan.contentRevision,
    brandRevision: plan.brandRevision,
    copySha256: plan.copySha256,
    evidenceSha256: plan.evidenceSha256,
    reviewed: true,
    kind: "general",
  });
}
export async function historicalRebindFixture(
  preset = "liquidity_desk",
  formats = ["infographic"],
) {
  const stores = [];
  const operator = async (username) => {
    const store = new DurableStore(":memory:");
    stores.push(store);
    const platform = createPlatform({ store, authMode: "password" });
    await platform.ready;
    await platform.identity.provision({
      username,
      password: "disposable-native-rebind-password",
      role: "founder",
    });
    const actor = (await store.get("identity")).users.find(
      (user) => user.username === username,
    );
    return { store, platform, actor };
  };
  try {
    const source = await operator("source-layout-owner");
    const brand = await source.platform.identity.createBrand(source.actor, {
      organizationId: "org_default",
      name: `Source ${preset}`,
      preset,
    });
    const scope = await source.platform.identity.authorize(
        source.actor,
        "org_default",
        brand.id,
      ),
      container = await source.platform.forScope(scope),
      repo = container.ports.repo;
    const story = await repo.addBacklogStory({
      title: "Controlled retained layout",
      category: "Controlled source",
      sourceClaims: [
        {
          id: "claim",
          text: "Unreviewed starting material.",
          sourceUrl: "https://example.org/controlled-primary",
          kind: "general",
          status: "unreviewed",
        },
      ],
    });
    const content = "This controlled primary source supports review.";
    const evidence = [
      {
        schemaVersion: 1,
        id: randomUUID(),
        requestedUrl: "https://example.org/controlled-primary",
        sourceUrl: "https://example.org/controlled-primary",
        retrievedAt: new Date().toISOString(),
        contentType: "text/plain",
        responseSha256: sha(content),
        responseBytes: Buffer.byteLength(content),
        text: content,
        textSha256: sha(content),
        status: "unreviewed",
        approval: "none",
      },
    ];
    const state = await repo.read();
    const candidate = buildPreparedCandidate({
      id: randomUUID(),
      scope,
      story: state.backlog.find((row) => row.id === story.id),
      brandProfile: state.brandProfile,
      evidence,
      jobId: null,
      itemId: null,
      attemptId: null,
      createdAt: new Date().toISOString(),
    });
    await repo.mutate((state) => {
      state.preparedSourceCandidates = [
        { candidate, evidence, revision: 1, editorialStatus: "unreviewed" },
      ];
      state.backlog.find((row) => row.id === story.id).preparedCandidateId =
        candidate.id;
      return state;
    });
    const promotion = new PreparedPromotionService({
      repo,
      scope,
      identity: source.platform.identity,
    });
    await confirmPrepared(promotion, source.actor, candidate.id);
    const native = source.platform.nativeEditor(scope, repo),
      ids = [];
    for (const format of formats) {
      const current = (await repo.read()).backlog.find(
        (row) => row.id === story.id,
      );
      const created = await native.create(source.actor, {
        storyId: story.id,
        format,
        expectedRevision: current.revision,
        generationId: current.generationId,
        expectedBrandRevision: brandRevision(await repo.getBrandProfile()),
        idempotencyKey: randomUUID(),
      });
      const document = structuredClone(created.document);
      document.pages[0].objects.find(
        (object) => object.id === "headline_layer",
      ).text = `HUMAN ${preset} ${format}`;
      document.pages[0].objects.find(
        (object) => object.id === "headline_layer",
      ).left += 7;
      const saved = await native.save(source.actor, created.id, {
        expectedRevision: created.revision,
        title: created.title,
        document,
        idempotencyKey: randomUUID(),
      });
      ids.push(saved.id);
    }
    const pack = await new EditorPackService({ native }).export(source.actor);
    const target = await operator("fresh-layout-owner");
    const destination = await createEditorRestoreDestination({
      store: target.store,
      identity: target.platform.identity,
      actor: target.actor,
      organizationId: "org_default",
      name: `Restored ${preset}`,
      preset,
    });
    const targetScope = destination.scope,
      targetContainer = await target.platform.forScope(targetScope),
      targetRepo = targetContainer.ports.repo,
      targetNative = target.platform.nativeEditor(targetScope, targetRepo);
    await new EditorPackService({ native: targetNative }).install(
      target.actor,
      pack,
      {
        target: {
          organizationId: targetScope.organizationId,
          brandId: targetScope.brandId,
        },
        principalRemap: { [source.actor.id]: target.actor.id },
        sourceReviewAcknowledged: true,
        idempotencyKey: randomUUID(),
      },
    );
    const currentPromotion = new PreparedPromotionService({
      repo: targetRepo,
      scope: targetScope,
      identity: target.platform.identity,
    });
    return {
      ...target,
      scope: targetScope,
      repo: targetRepo,
      native: targetNative,
      storyId: story.id,
      ids,
      promotion: currentPromotion,
      close: () => stores.forEach((store) => store.close()),
      async reviewCurrent() {
        const current = (await targetRepo.read()).backlog.find(
          (row) => row.id === story.id,
        );
        const result = await currentPromotion.fork(target.actor, story.id, {
          idempotencyKey: randomUUID(),
          expectedRevision: current.revision,
          expectedContentRevision: current.contentRevision || 1,
          generationId: current.generationId,
          brandRevision: brandRevision(await targetRepo.getBrandProfile()),
        });
        const id = result.candidateId || result.candidate?.id;
        await confirmPrepared(currentPromotion, target.actor, id);
        return (await targetRepo.read()).backlog.find(
          (row) => row.id === story.id,
        );
      },
    };
  } catch (error) {
    stores.forEach((store) => store.close());
    throw error;
  }
}
