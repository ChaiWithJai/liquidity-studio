import { randomUUID } from "node:crypto";
import { ObservabilityEngine } from "./observability.js";
import { fail } from "./auth.js";
import { brandRevision } from "./multimodal-contract.js";
import { getApprovedClaims } from "./source-integrity.js";
import { exact, hash } from "./workspace-schema.js";
import { SourcePreparationService } from "./source-preparation.js";
import { validateSourceUrl } from "./source-retrieval.js";
import { catalogForStory } from "./source-catalog.js";
import {
  PREPARATION_PURPOSE,
  preparationFingerprint,
  preparationUrls,
  validatePreparedCandidate,
  validateCandidateLayout,
} from "./prepared-source-candidate.js";

const MAX_JOBS = 30,
  MAX_ITEMS = 10,
  LEASE_MS = 120000;
const terminal = new Set([
  "completed",
  "failed",
  "conflict",
  "cancelled",
  "unknown",
]);
const stamp = () => new Date().toISOString();
function uuid(value) {
  if (
    typeof value !== "string" ||
    !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
      value,
    )
  )
    throw fail(400, "An idempotency UUID is required");
  return value;
}
function publicJob(job) {
  const { requestHash, ...result } = structuredClone(job);
  for (const control of result.controls) delete control.hash;
  for (const item of result.items) {
    delete item.lease;
    delete item.fence;
  }
  return result;
}
function summary(job) {
  const counts = {};
  for (const item of job.items)
    counts[item.state] = (counts[item.state] || 0) + 1;
  return {
    id: job.id,
    purpose: job.purpose || "campaign-generation",
    createdAt: job.createdAt,
    updatedAt: job.updatedAt,
    state: job.state,
    counts,
    itemCount: job.items.length,
  };
}
function settle(job) {
  if (job.cancelled) job.state = "cancelled";
  else if (job.items.some((item) => item.state === "running"))
    job.state = "running";
  else if (job.items.every((item) => item.state === "completed"))
    job.state = "completed";
  else if (job.items.every((item) => terminal.has(item.state)))
    job.state = "partial";
  else if (job.items.some((item) => item.state === "queued"))
    job.state = "queued";
  else job.state = "paused";
  job.updatedAt = stamp();
}
export class DurableJobService {
  constructor({
    repo,
    identity,
    scope,
    formatter,
    preparation,
    now = Date.now,
  }) {
    Object.assign(this, { repo, identity, scope, formatter, now });
    this.preparation =
      preparation || new SourcePreparationService({ repo, scope });
  }
  async actor(id, approvedAt) {
    const user = this.identity.authorizeJobActor
      ? await this.identity.authorizeJobActor(id, approvedAt)
      : (await this.repo.store.get("identity")).users.find(
          (user) => user.id === id,
        );
    if (!user) throw fail(403, "Job actor is no longer authorized");
    await this.identity.authorize(
      user,
      this.scope.organizationId,
      this.scope.brandId,
    );
    return user;
  }
  async authorize(user) {
    const current = (await this.repo.store.get("identity")).users.find(
      (row) => row.id === user?.id,
    );
    if (!current) throw fail(403, "Job actor no longer exists");
    await this.identity.authorize(
      current,
      this.scope.organizationId,
      this.scope.brandId,
    );
    return current;
  }
  async plan(user) {
    await this.authorize(user);
    const state = await this.repo.read();
    return {
      brandRevision: brandRevision(state.brandProfile),
      maxItems: MAX_ITEMS,
      stories: state.backlog.map((story) => {
        let sourceReadiness = "review_required";
        try {
          getApprovedClaims(story);
          sourceReadiness = "approved";
        } catch {}
        return {
          id: story.id,
          title: story.title,
          revision: story.revision,
          sourceReadiness,
        };
      }),
    };
  }
  async list(user) {
    await this.authorize(user);
    return (await this.repo.read()).operatorJobs?.map(summary) || [];
  }
  async detail(user, id) {
    await this.authorize(user);
    const job = (await this.repo.read()).operatorJobs?.find(
      (job) => job.id === id,
    );
    if (!job) throw fail(404, "Job not found");
    const owner = (await this.repo.store.get("identity")).users.find(
      (user) => user.id === job.actorId,
    );
    return {
      ...publicJob(job),
      requestedBy: owner?.username || "Removed account",
      canControl: job.actorId === user.id || user.role === "founder",
    };
  }
  async preparationForStory(user, id) {
    await this.authorize(user);
    const state = await this.repo.read(),
      story = state.backlog.find((story) => story.id === id);
    if (!story) throw fail(404, "Story not found");
    let sourceReady = true;
    try {
      preparationUrls(story, this.scope).forEach((url) =>
        validateSourceUrl(url),
      );
    } catch {
      sourceReady = false;
    }
    return {
      storyId: story.id,
      storyRevision: story.revision,
      contentRevision: story.contentRevision || 1,
      brandRevision: brandRevision(state.brandProfile),
      sourceReady,
      hasCampaign: Boolean(story.campaignDraft),
      status:
        story.preparationStatus ||
        (sourceReady ? "not_prepared" : "source_needed"),
      errorCode: story.preparationErrorCode || null,
      jobId: story.preparationJobId || null,
      catalog: catalogForStory(story, this.scope),
      prepared: story.preparedCandidateId
        ? await this.candidate(user, story.preparedCandidateId)
        : null,
    };
  }
  async candidate(user, id) {
    await this.authorize(user);
    const state = await this.repo.read(),
      entry = state.preparedSourceCandidates?.find(
        (entry) => entry.candidate.id === id,
      );
    if (!entry) throw fail(404, "Prepared candidate not found");
    const story = state.backlog.find(
      (story) => story.id === entry.candidate.storyId,
    );
    const stale =
      Boolean(entry.restoredHistorical) || !story || (story.preparedCandidateId && story.preparedCandidateId!==id) ||
      preparationFingerprint(story, this.scope) !==
        entry.candidate.inputFingerprint ||
      brandRevision(state.brandProfile) !== entry.candidate.brandRevision;
    return {
      ...structuredClone(entry),
      revision: entry.revision || 1,
      stale,
      approval: "none",
      exportable: false,
    };
  }
  async editCandidate(user, id, input) {
    user = await this.authorize(user);
    exact(input, ["idempotencyKey", "expectedRevision", "artwork"]);
    uuid(input.idempotencyKey);
    if (
      !Number.isInteger(input.expectedRevision) ||
      input.expectedRevision < 1 ||
      Buffer.byteLength(JSON.stringify(input.artwork || {})) > 32768
    )
      throw fail(400, "Invalid candidate edit");
    const fingerprint = hash(input);
    await this.repo.mutate((state) => {
      const entry = state.preparedSourceCandidates?.find(
        (entry) => entry.candidate.id === id,
      );
      if (!entry) throw fail(404, "Prepared candidate not found");
      if(entry.restoredHistorical)throw fail(409,"Historical candidate requires a fresh current-generation review draft");
      entry.edits ||= [];
      const prior = entry.edits.find(
        (edit) => edit.id === input.idempotencyKey,
      );
      if (prior) {
        if (prior.hash !== fingerprint || prior.actorId !== user.id)
          throw fail(409, "Candidate edit key already used");
        return state;
      }
      if ((entry.revision || 1) !== input.expectedRevision)
        throw fail(409, "Candidate changed; preserve local edits and reload");
      const story = state.backlog.find(
        (story) => story.id === entry.candidate.storyId,
      );
      if (
        !story ||
        (story.preparedCandidateId && story.preparedCandidateId!==id) ||
        preparationFingerprint(story, this.scope) !==
          entry.candidate.inputFingerprint ||
        brandRevision(state.brandProfile) !== entry.candidate.brandRevision
      )
        throw fail(
          409,
          "Prepared source or brand changed; prepare again before editing",
        );
      function check(value, template, key = "") {
        if (typeof template === "string") {
          if (
            typeof value !== "string" ||
            value.length > 2000 ||
            (["timecode"].includes(key) && value !== template)
          )
            throw fail(400, "Invalid candidate text or timing");
          return;
        }
        if (typeof template === "number") {
          if (value !== template)
            throw fail(400, "Candidate structure cannot change");
          return;
        }
        if (Array.isArray(template)) {
          if (!Array.isArray(value) || value.length !== template.length)
            throw fail(400, "Candidate structure cannot change");
          value.forEach((child, i) => check(child, template[i]));
          return;
        }
        if (
          !value ||
          typeof value !== "object" ||
          Object.keys(value).sort().join("|") !==
            Object.keys(template).sort().join("|")
        )
          throw fail(400, "Candidate fields do not match");
        for (const key of Object.keys(template))
          check(value[key], template[key], key);
      }
      check(input.artwork, entry.candidate.artwork);
      validateCandidateLayout(input.artwork, state.brandProfile);
      if (entry.edits.length >= 30)
        throw fail(
          409,
          "Candidate edit retention reached; preserve work before preparing again",
        );
      entry.workingArtwork = structuredClone(input.artwork);
      entry.revision = (entry.revision || 1) + 1;
      entry.edits.push({
        id: input.idempotencyKey,
        hash: fingerprint,
        actorId: user.id,
        at: stamp(),
        revision: entry.revision,
      });
      entry.editorialStatus = "unreviewed";
      if (
        Buffer.byteLength(JSON.stringify(state.preparedSourceCandidates)) >
        192 * 1024
      )
        throw fail(
          409,
          "Prepared evidence storage limit reached; preserve work before preparing again",
        );
      return state;
    });
    return this.candidate(user, id);
  }
  async create(user, input, authorizationMode = "operator-plan") {
    user = await this.authorize(user);
    exact(input, [
      "idempotencyKey",
      "reviewed",
      "brandRevision",
      "items",
      "purpose",
    ]);
    const purpose = input.purpose || "campaign-generation";
    if (!["campaign-generation", PREPARATION_PURPOSE].includes(purpose))
      throw fail(400, "Unknown job purpose");
    if (
      purpose === PREPARATION_PURPOSE &&
      process.env.STUDIO_SOURCE_PREPARATION_ENABLED !== "true"
    )
      throw fail(404, "Source preparation is unavailable");
    uuid(input.idempotencyKey);
    if (
      input.reviewed !== true ||
      !Array.isArray(input.items) ||
      input.items.length < 1 ||
      input.items.length > MAX_ITEMS
    )
      throw fail(400, "Review a plan of 1–10 campaign items");
    const seen = new Set();
    for (const item of input.items) {
      exact(item, ["storyId", "storyRevision"]);
      if (
        typeof item.storyId !== "string" ||
        item.storyId.length > 128 ||
        !Number.isInteger(item.storyRevision) ||
        item.storyRevision < 1 ||
        seen.has(item.storyId)
      )
        throw fail(400, "Invalid or duplicate planned story");
      seen.add(item.storyId);
    }
    const requestHash = hash(input),
      id = randomUUID(),
      createdAt = stamp();
    const itemIds = input.items.map(() => randomUUID());
    const state = await this.repo.mutate((state) => {
      state.operatorJobScope = this.scope;
      state.operatorJobs ||= [];
      const prior = state.operatorJobs.find(
        (job) => job.idempotencyKey === input.idempotencyKey,
      );
      if (prior) {
        if (prior.requestHash !== requestHash || prior.actorId !== user.id)
          throw fail(409, "Idempotency key belongs to another plan");
        return state;
      }
      if (state.operatorJobs.length >= MAX_JOBS)
        throw fail(
          409,
          "Job retention limit reached; operator maintenance required",
        );
      if (brandRevision(state.brandProfile) !== input.brandRevision)
        throw fail(409, "Brand changed; review the plan again");
      const items = input.items.map((input, index) => {
        const story = state.backlog.find((story) => story.id === input.storyId);
        if (!story || story.revision !== input.storyRevision)
          throw fail(409, "Story changed; review the plan again");
        if (purpose === PREPARATION_PURPOSE) {
          if (story.campaignDraft)
            throw fail(
              409,
              "A saved campaign already exists; preserve its current work",
            );
          if (
            state.operatorJobs.some(
              (job) =>
                job.purpose === PREPARATION_PURPOSE &&
                job.items.some(
                  (item) =>
                    item.storyId === story.id &&
                    item.inputFingerprint ===
                      preparationFingerprint(story, this.scope) &&
                    ["queued", "running"].includes(item.state),
                ),
            )
          )
            throw fail(
              409,
              "Source preparation already queued; refresh its current job",
            );
          preparationUrls(story, this.scope).forEach((url) =>
            validateSourceUrl(url),
          );
          story.preparationStatus = "queued";
          story.preparationJobId = id;
          story.preparationUpdatedAt = createdAt;
          story.preparationErrorCode = null;
          story.revision++;
        } else getApprovedClaims(story);
        return {
          ...(purpose === PREPARATION_PURPOSE
            ? {
                inputFingerprint: preparationFingerprint(story, this.scope),
                contentRevision: story.contentRevision || 1,
              }
            : {}),
          ...input,
          storyTitle: story.title,
          id: itemIds[index],
          state: "queued",
          attempt: 0,
          fence: 0,
          attempts: [],
        };
      });
      state.operatorJobs.push({
        id,
        schemaVersion: 1,
        purpose,
        authorizationMode,
        actorId: user.id,
        idempotencyKey: input.idempotencyKey,
        requestHash,
        brandRevision: input.brandRevision,
        createdAt,
        updatedAt: createdAt,
        state: "queued",
        deliveryEpoch: 1,
        items,
        controls: [],
        outbox: { state: "pending", attempts: 0 },
      });
      return state;
    });
    return this.detail(
      user,
      state.operatorJobs.find(
        (job) => job.idempotencyKey === input.idempotencyKey,
      ).id,
    );
  }
  async createForIngestion(user, storyIds) {
    await this.authorize(user);
    const state = await this.repo.read();
    const stories = state.backlog
      .filter((story) => storyIds.includes(story.id) && !story.campaignDraft)
      .filter((story) => {
        try {
          preparationUrls(story, this.scope).forEach((url) =>
            validateSourceUrl(url),
          );
        } catch {
          return false;
        }
        const fingerprint = preparationFingerprint(story, this.scope);
        return !state.operatorJobs?.some(
          (job) =>
            job.purpose === PREPARATION_PURPOSE &&
            job.items.some(
              (item) =>
                item.storyId === story.id &&
                item.inputFingerprint === fingerprint,
            ),
        );
      })
      .slice(0, MAX_ITEMS);
    if (!stories.length) return null;
    return this.create(
      user,
      {
        purpose: PREPARATION_PURPOSE,
        idempotencyKey: randomUUID(),
        reviewed: true,
        brandRevision: brandRevision(state.brandProfile),
        items: stories.map((story) => ({
          storyId: story.id,
          storyRevision: story.revision,
        })),
      },
      "ingestion-policy",
    );
  }
  async control(user, id, action, input) {
    user = await this.authorize(user);
    exact(input, ["idempotencyKey", "itemIds"]);
    uuid(input.idempotencyKey);
    if (!["cancel", "resume", "retry"].includes(action))
      throw fail(400, "Unknown job operation");
    if (
      input.itemIds !== undefined &&
      (!Array.isArray(input.itemIds) ||
        !input.itemIds.length ||
        input.itemIds.length > MAX_ITEMS ||
        input.itemIds.some((id) => typeof id !== "string"))
    )
      throw fail(400, "Invalid retry items");
    if (action !== "retry" && input.itemIds !== undefined)
      throw fail(400, "Only retry accepts selected item IDs");
    if (input.itemIds && new Set(input.itemIds).size !== input.itemIds.length)
      throw fail(400, "Duplicate retry items");
    const fingerprint = hash({ action, ...input });
    const state = await this.repo.mutate((state) => {
      const job = state.operatorJobs?.find((job) => job.id === id);
      if (!job) throw fail(404, "Job not found");
      if (job.schemaVersion !== 1)
        throw fail(409, "Unsupported job schema version");
      if (job.actorId !== user.id && user.role !== "founder")
        throw fail(403, "Only the job owner or founder can control this plan");
      const prior = job.controls.find(
        (control) => control.id === input.idempotencyKey,
      );
      if (prior) {
        if (prior.hash !== fingerprint)
          throw fail(409, "Control key already used");
        return state;
      }
      if (job.controls.length >= 50)
        throw fail(409, "Job control limit reached");
      if (action === "cancel") {
        if (job.items.every((item) => item.state === "completed"))
          throw fail(409, "Completed work cannot be cancelled");
        job.cancelled = true;
        for (const item of job.items)
          if (
            item.state === "queued" ||
            item.state === "paused" ||
            item.state === "running"
          ) {
            if (item.state === "running") {
              item.attempts.at(-1).state = "cancelled";
              item.attempts.at(-1).providerBillingMayBeUnknown =
                job.purpose !== PREPARATION_PURPOSE;
            }
            item.state = "cancelled";
            item.fence++;
            delete item.lease;
            if (job.purpose === PREPARATION_PURPOSE) {
              const story = state.backlog.find(
                (story) => story.id === item.storyId,
              );
              if (story?.preparationJobId === job.id) {
                story.preparationStatus = "failed";
                story.preparationErrorCode = "PREPARATION_CANCELLED";
                story.preparationUpdatedAt = stamp();
                story.revision++;
              }
            }
          }
      } else {
        if (action === "retry" && !input.itemIds?.length)
          throw fail(400, "Select explicit failed items for retry");
        const ids =
          action === "retry"
            ? input.itemIds
            : job.items
                .filter((item) => ["cancelled", "paused"].includes(item.state))
                .map((item) => item.id);
        if (!ids.length)
          throw fail(409, "No paused or cancelled items to resume");
        if (ids.some((id) => !job.items.some((item) => item.id === id)))
          throw fail(400, "Unknown job item");
        for (const item of job.items.filter((item) => ids.includes(item.id))) {
          if (item.attempt >= 10)
            throw fail(409, "Item attempt limit reached; review a new plan");
          if (
            !["failed", "conflict", "unknown", "cancelled", "paused"].includes(
              item.state,
            )
          )
            throw fail(409, "Only unsuccessful items can be retried");
          // The reviewed snapshot is immutable. Human edits require a new reviewed plan.
          item.retryOf = item.attempts.at(-1)?.id || null;
          item.state = "queued";
          item.error = null;
        }
        job.cancelled = false;
        job.deliveryEpoch++;
        job.outbox = { state: "pending", attempts: 0 };
      }
      job.controls.push({
        id: input.idempotencyKey,
        hash: fingerprint,
        action,
        actorId: user.id,
        at: stamp(),
      });
      settle(job);
      return state;
    });
    return publicJob(state.operatorJobs.find((job) => job.id === id));
  }
  async claim(workerId, jobId, itemId, nextAttempt, deliveryEpoch) {
    let claimed = null;
    const attemptId = randomUUID();
    await this.repo.mutate((state) => {
      claimed = null;
      for (const job of state.operatorJobs || []) {
        if (job.schemaVersion !== 1) continue;
        if (
          (jobId && job.id !== jobId) ||
          (deliveryEpoch && job.deliveryEpoch !== deliveryEpoch)
        )
          continue;
        for (const item of job.items) {
          if (item.state === "running" && item.lease.expiresAt <= this.now()) {
            item.state = "unknown";
            item.error = {
              code: "WORKER_INTERRUPTED",
              message:
                job.purpose === PREPARATION_PURPOSE
                  ? "Preparation worker interrupted; no candidate receipt committed. No model provider was called."
                  : "Provider completion/billing may be unknown. Explicit retry may incur another request.",
            };
            item.attempts.at(-1).state = "unknown";
            delete item.lease;
            item.fence++;
          }
        }
        if (job.cancelled) {
          settle(job);
          continue;
        }
        const item = job.items.find(
          (item) =>
            item.state === "queued" &&
            (!itemId || item.id === itemId) &&
            (!nextAttempt || item.attempt + 1 === nextAttempt),
        );
        if (!item || claimed) {
          settle(job);
          continue;
        }
        item.state = "running";
        item.fence++;
        item.attempt++;
        item.lease = { workerId, expiresAt: this.now() + LEASE_MS };
        item.attempts.push({
          id: attemptId,
          state: "running",
          startedAt: stamp(),
        });
        job.state = "running";
        if (job.purpose === PREPARATION_PURPOSE) {
          const story = state.backlog.find(
            (story) => story.id === item.storyId,
          );
          if (story?.preparationJobId === job.id) {
            story.preparationStatus = "running";
            story.preparationUpdatedAt = stamp();
            story.revision++;
          }
        }
        job.outbox = {
          ...job.outbox,
          state: "worker_received",
          workerReceivedAt: stamp(),
        };
        job.updatedAt = stamp();
        claimed = { job: structuredClone(job), item: structuredClone(item) };
      }
      return state;
    });
    return claimed;
  }
  async runNext(
    workerId = randomUUID(),
    jobId,
    itemId,
    nextAttempt,
    deliveryEpoch,
  ) {
    const claim = await this.claim(
      workerId,
      jobId,
      itemId,
      nextAttempt,
      deliveryEpoch,
    );
    if (!claim) return null;
    const { job, item } = claim;
    if (job.purpose === PREPARATION_PURPOSE)
      return this.runPreparation(claim, workerId);
    let prepared,
      committed = false;
    try {
      await this.actor(job.actorId, job.createdAt);
      prepared = await this.formatter.prepareCampaignForStory(item.storyId, {
        storyRevision: item.storyRevision,
        brandRevision: job.brandRevision,
      });
      // Reauthorize after the provider wait. Never authorize from a persisted role/token.
      await this.actor(job.actorId, job.createdAt);
      if (prepared.reservation)
        await this.repo.assertGenerationReservation(prepared.reservation);
      const telemetry = new ObservabilityEngine();
      telemetry.recordGenerationTrace({
        trace: prepared.trace,
        storyId: item.storyId,
        storyTitle: prepared.story.title,
        campaign: prepared.campaign,
        evalResult: prepared.evalResult,
        story: prepared.story,
      });
      const traceRecord = {
        ...telemetry.traces[0],
        ...this.scope,
        jobId: job.id,
        itemId: item.id,
      };
      const baselineRecord = {
        ...telemetry.backpropDataset[0],
        ...this.scope,
        jobId: job.id,
        itemId: item.id,
      };
      await this.repo.mutate((state) => {
        const liveJob = state.operatorJobs?.find((row) => row.id === job.id),
          live = liveJob?.items.find((row) => row.id === item.id);
        if (!live) throw fail(409, "Job no longer exists after recovery");
        if (
          live.state !== "running" ||
          live.fence !== item.fence ||
          live.lease?.workerId !== workerId ||
          live.lease.expiresAt <= this.now() ||
          liveJob.cancelled
        )
          throw Object.assign(fail(409, "Job lease was revoked or expired"), {
            code: "WORKER_LEASE_LOST",
          });
        const story = state.backlog.find((story) => story.id === item.storyId);
        if (
          !story ||
          story.revision !== item.storyRevision ||
          brandRevision(state.brandProfile) !== job.brandRevision
        )
          throw fail(409, "Reviewed input changed before commit");
        getApprovedClaims(story);
        story.campaignDraft = prepared.campaign;
        story.generationId = prepared.trace.traceId;
        story.status = "Draft Ready";
        story.revision++;
        const receipt = {
          jobId: job.id,
          itemId: item.id,
          actorId: job.actorId,
          attemptId: live.attempts.at(-1).id,
          generationId: story.generationId,
          storyId: story.id,
          storyRevision: story.revision,
          mode: prepared.campaign.provenance?.mode || "unknown",
          usage: prepared.trace.usage || null,
          usageProvider: prepared.trace.usageProvider || null,
          committedAt: stamp(),
        };
        live.state = "completed";
        live.receipt = receipt;
        live.attempts.at(-1).state = "completed";
        delete live.lease;
        state.usage.push({
          id: receipt.attemptId,
          type: "job_generation",
          ...receipt,
        });
        state.telemetry.traces.unshift(traceRecord);
        state.telemetry.backpropDataset.unshift(baselineRecord);
        settle(liveJob);
        return state;
      });
      committed = true;
      if (prepared.reservation)
        await this.repo.finalizeGeneration(prepared.reservation, {
          status: "completed",
          mode: prepared.campaign.provenance?.mode || "unknown",
          traceId: prepared.trace.traceId,
        });
    } catch (error) {
      if (committed) {
        await this.repo.mutate((state) => {
          state.operatorJobs.find(
            (row) => row.id === job.id,
          ).accountingWarning =
            "Draft and receipt committed; quota accounting reconciliation required";
          return state;
        });
        return this.repo
          .read()
          .then((state) =>
            state.operatorJobs?.some((row) => row.id === job.id)
              ? publicJob(state.operatorJobs.find((row) => row.id === job.id))
              : null,
          );
      }
      await this.repo.mutate((state) => {
        const liveJob = state.operatorJobs?.find((row) => row.id === job.id),
          live = liveJob?.items.find((row) => row.id === item.id);
        if (!live) return state;
        const attempt = live.attempts.find(
          (attempt) => attempt.id === item.attempts.at(-1).id,
        );
        if (attempt && prepared)
          attempt.providerOutcome = {
            traceId: prepared.trace.traceId,
            mode: prepared.campaign.provenance?.mode || "unknown",
            usage: prepared.trace.usage || null,
            usageProvider: prepared.trace.usageProvider || null,
            committed: false,
          };
        if (attempt && !prepared && error.trace)
          attempt.providerOutcome = {
            traceId: error.trace.traceId || null,
            mode: "failed",
            usage: error.trace.usage || null,
            usageProvider: error.trace.usageProvider || null,
            committed: false,
          };
        if (live.state === "running" && live.fence === item.fence) {
          live.state = ["PROVIDER_TIMEOUT", "WORKER_LEASE_LOST"].includes(
            error.code,
          )
            ? "unknown"
            : error.status === 409
              ? "conflict"
              : "failed";
          live.error = {
            code: ["PROVIDER_TIMEOUT", "WORKER_LEASE_LOST"].includes(error.code)
              ? error.code
              : error.status === 403
                ? "ACCESS_REVOKED"
                : error.status === 429
                  ? "QUOTA_EXCEEDED"
                  : error.status === 409
                    ? "REVISION_CONFLICT"
                    : "GENERATION_FAILED",
            message:
              "Item did not commit. Inspect current source/revisions before explicit retry; a provider request may have been billed.",
          };
          live.attempts.at(-1).state = live.state;
          delete live.lease;
          settle(liveJob);
        }
        return state;
      });
      if (prepared?.reservation)
        await this.repo.finalizeGeneration(prepared.reservation, {
          status: "failed",
          mode: "failed",
          traceId: prepared.trace.traceId,
        });
    }
    return this.repo
      .read()
      .then((state) =>
        state.operatorJobs?.some((row) => row.id === job.id)
          ? publicJob(state.operatorJobs.find((row) => row.id === job.id))
          : null,
      );
  }
  async runPreparation({ job, item }, workerId) {
    let prepared,
      committed = false;
    try {
      await this.actor(job.actorId, job.createdAt);
      const assertCurrent = async () => {
        await this.actor(job.actorId, job.createdAt);
        const state = await this.repo.read(),
          liveJob = state.operatorJobs?.find((row) => row.id === job.id),
          live = liveJob?.items.find((row) => row.id === item.id),
          story = state.backlog.find((story) => story.id === item.storyId);
        if (
          !live ||
          live.state !== "running" ||
          live.fence !== item.fence ||
          live.lease?.workerId !== workerId ||
          live.lease.expiresAt <= this.now() ||
          liveJob.cancelled ||
          !story ||
          story.preparationJobId !== job.id ||
          preparationFingerprint(story, this.scope) !== item.inputFingerprint ||
          brandRevision(state.brandProfile) !== job.brandRevision
        )
          throw fail(409, "Preparation permission or input changed");
      };
      prepared = await this.preparation.prepare(item.storyId, {
        assertCurrent,
        inputFingerprint: item.inputFingerprint,
        brandRevision: job.brandRevision,
        jobId: job.id,
        itemId: item.id,
        attemptId: item.attempts.at(-1).id,
      });
      await this.actor(job.actorId, job.createdAt);
      await this.repo.assertGenerationReservation(prepared.reservation);
      validatePreparedCandidate(prepared.candidate, prepared.evidence);
      validateCandidateLayout(
        prepared.candidate.artwork,
        (await this.repo.read()).brandProfile,
      );
      await this.repo.mutate((state) => {
        const liveJob = state.operatorJobs?.find((row) => row.id === job.id),
          live = liveJob?.items.find((row) => row.id === item.id);
        if (
          !live ||
          live.state !== "running" ||
          live.fence !== item.fence ||
          live.lease?.workerId !== workerId ||
          live.lease.expiresAt <= this.now() ||
          liveJob.cancelled
        )
          throw fail(409, "Preparation lease was revoked or expired");
        const story = state.backlog.find((story) => story.id === item.storyId);
        if (
          !story ||
          story.preparationJobId !== job.id ||
          preparationFingerprint(story, this.scope) !== item.inputFingerprint ||
          brandRevision(state.brandProfile) !== job.brandRevision
        )
          throw fail(409, "Preparation input changed before commit");
        state.preparedSourceCandidates ||= [];
        // The same bounded scoped aggregate holds evidence and candidates; no permanent per-attempt keys.
        if (state.preparedSourceCandidates.length >= 30)
          throw fail(
            409,
            "Prepared candidate retention limit reached; preserve or remove an old candidate first",
          );
        const entry = {
          candidate: prepared.candidate,
          evidence: prepared.evidence,
        };
        if (
          Buffer.byteLength(
            JSON.stringify([...state.preparedSourceCandidates, entry]),
          ) >
          192 * 1024
        )
          throw fail(
            409,
            "Prepared evidence storage limit reached; preserve or remove an old candidate first",
          );
        state.preparedSourceCandidates.push(entry);
        story.preparationStatus = "ready";
        story.preparationJobId = job.id;
        story.preparedCandidateId = prepared.candidate.id;
        story.preparationUpdatedAt = stamp();
        story.preparationErrorCode = null;
        story.revision++;
        live.state = "completed";
        live.receipt = {
          purpose: PREPARATION_PURPOSE,
          jobId: job.id,
          itemId: item.id,
          attemptId: live.attempts.at(-1).id,
          actorId: job.actorId,
          storyId: story.id,
          storyRevision: story.revision,
          contentRevision: story.contentRevision || 1,
          candidateId: prepared.candidate.id,
          mode: "extractive-unreviewed",
          provider: "none",
          modelCalls: 0,
          committedAt: stamp(),
        };
        live.attempts.at(-1).state = "completed";
        delete live.lease;
        settle(liveJob);
        return state;
      });
      committed = true;
      await this.repo.finalizeGeneration(prepared.reservation, {
        status: "completed",
        mode: PREPARATION_PURPOSE,
        traceId: prepared.candidate.id,
      });
    } catch (error) {
      await this.repo.mutate((state) => {
        const liveJob = state.operatorJobs?.find((row) => row.id === job.id),
          live = liveJob?.items.find((row) => row.id === item.id);
        if (committed) {
          if (liveJob)
            liveJob.accountingWarning =
              "Prepared candidate and receipt committed; quota reconciliation required";
          return state;
        }
        if (live?.state === "running" && live.fence === item.fence) {
          live.state = error.status === 409 ? "conflict" : "failed";
          live.error = {
            code:
              error.status === 403
                ? "ACCESS_REVOKED"
                : error.status === 429
                  ? "QUOTA_EXCEEDED"
                  : error.status === 409
                    ? "REVISION_CONFLICT"
                    : "PREPARATION_FAILED",
            message:
              "Source preparation did not commit. Inspect source access and current revisions before retrying; no model provider was called.",
          };
          live.attempts.at(-1).state = live.state;
          delete live.lease;
          const story = state.backlog.find(
            (story) => story.id === item.storyId,
          );
          if (story?.preparationJobId === job.id) {
            story.preparationStatus =
              live.state === "conflict" ? "stale" : "failed";
            story.preparationErrorCode = live.error.code;
            story.preparationUpdatedAt = stamp();
            story.revision++;
          }
          settle(liveJob);
        }
        return state;
      });
      if (prepared?.reservation && !committed)
        await this.repo.finalizeGeneration(prepared.reservation, {
          status: "failed",
          mode: PREPARATION_PURPOSE,
          traceId: prepared.candidate.id,
        });
    }
    return publicJob(
      (await this.repo.read()).operatorJobs.find((row) => row.id === job.id),
    );
  }
}
