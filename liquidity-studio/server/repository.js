import { portableWorkspace } from "./workspace-schema.js";
import { randomUUID, createHash } from "node:crypto";
import {
  DEFAULT_BRAND_PROFILE,
  INITIAL_CONTENT_BACKLOG,
  normalizeLegacyResearch,
  BRAND_PRESETS,
} from "./domain.js";
import { fail } from "./auth.js";
import { classifyFeedback } from "./observability.js";
export const scopeKey = ({ organizationId, brandId }) =>
  `scope:${organizationId}:${brandId}`;

function profileForPreset(preset) {
  const { researchBacklog, ...profile } =
    BRAND_PRESETS[preset] || DEFAULT_BRAND_PROFILE;
  return structuredClone(profile);
}
export class ScopedRepository {
  constructor(store, scope) {
    this.store = store;
    this.scope = scope;
    this.key = scopeKey(scope);
    this.ready = store.update(
      this.key,
      (state) =>
        state || {
          schemaVersion: 1,
          brandProfile: profileForPreset(scope.preset),
          backlog: BRAND_PRESETS[scope.preset]?.researchBacklog
            ? BRAND_PRESETS[scope.preset].researchBacklog.map(
                (story, index) => ({
                  ...structuredClone(story),
                  id: `research_${index}`,
                  scheduledDay: "Monday",
                  campaignDraft: null,
                  revision: 1,
                }),
              )
            : INITIAL_CONTENT_BACKLOG.map((story, index) => ({
                ...normalizeLegacyResearch(story),
                scheduledDay: [
                  "Monday",
                  "Tuesday",
                  "Wednesday",
                  "Thursday",
                  "Friday",
                ][index % 5],
                campaignDraft: null,
                revision: 1,
              })),
          telemetry: { traces: [], batchJobs: [], backpropDataset: [] },
          jobs: [],
          assets: [],
          preflights: [],
          usage: [],
        },
    );
  }
  async read() {
    await this.ready;
    return this.store.get(this.key);
  }
  async mutate(callback) {
    await this.ready;
    return this.store.update(this.key, callback);
  }
  async getBrandProfile() {
    return (await this.read()).brandProfile;
  }
  async updateBrandProfile(patch) {
    return (
      await this.mutate((state) => {
        state.brandProfile = { ...state.brandProfile, ...patch };
        return state;
      })
    ).brandProfile;
  }
  async listBacklog() {
    return (await this.read()).backlog.map((story) => ({
      ...story,
      exportedAt:
        typeof story.exportedAt === "string" &&
        /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?(?:Z|[+-]\d{2}:\d{2})$/.test(
          story.exportedAt,
        ) &&
        Number.isFinite(Date.parse(story.exportedAt))
          ? new Date(story.exportedAt).toISOString()
          : null,
    }));
  }
  async getCalendarSchedule() {
    const backlog = await this.listBacklog();
    return [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
      "Sunday",
    ].map((day) => ({
      day,
      items: backlog.filter((story) => story.scheduledDay === day),
    }));
  }
  async addBacklogStory(input) {
    const story = {
      id: randomUUID(),
      title: input.title,
      category: input.category || "Uncategorized",
      audienceTag: input.audienceTag || "General",
      trendBadge: "Added to Queue",
      status: "In Backlog",
      scheduledDay: input.scheduledDay || "Monday",
      sourceClaims: input.sourceClaims || [],
      verifiedFacts: (input.sourceClaims || [])
        .filter((claim) => claim.status === "approved")
        .map((claim) => claim.text),
      campaignDraft: null,
      revision: 1,
    };
    await this.mutate((state) => {
      state.backlog.unshift(story);
      return state;
    });
    return story;
  }
  async updateStory(id, change) {
    let updated;
    await this.mutate((state) => {
      const story = state.backlog.find((story) => story.id === id);
      if (!story) throw fail(404, "Story not found");
      change(story);
      story.revision = (story.revision || 0) + 1;
      updated = story;
      return state;
    });
    return updated;
  }
  async updateStoryStatus(id, status, scheduledDay) {
    return this.updateStory(id, (story) => {
      if (status) story.status = status;
      if (scheduledDay) story.scheduledDay = scheduledDay;
    });
  }
  async saveCampaignDraft(id, campaign, expectedRevision) {
    return this.updateStory(id, (story) => {
      if (expectedRevision !== undefined && story.revision !== expectedRevision)
        throw fail(409, "Story changed during generation; retry");
      story.campaignDraft = campaign;
      story.generationId = campaign.provenance?.generationId || null;
      story.status = "Draft Ready";
    });
  }
  async updateCampaignFormatDraft(id, format, content, expectedRevision) {
    return this.updateStory(id, (story) => {
      if (!story.campaignDraft) throw fail(404, "Draft not found");
      if (expectedRevision !== undefined && story.revision !== expectedRevision)
        throw fail(409, "Draft changed; reload before saving");
      story.campaignDraft[format] = content;
      story.status = "Draft Ready";
    });
  }
  async updateSourceClaims(id, claims, expectedRevision) {
    return this.updateStory(id, (story) => {
      if (expectedRevision !== undefined && story.revision !== expectedRevision)
        throw fail(409, "Story changed; reload before reviewing");
      const previous = story.sourceClaims || [];
      story.sourceClaims = claims.map((claim) => {
        const stored = previous.find(
          (old) =>
            old.id === claim.id &&
            old.text === claim.text &&
            old.sourceUrl === claim.sourceUrl &&
            old.kind === claim.kind,
        );
        return {
          ...claim,
          ...(!claim.clinicalReview &&
          claim.status === "approved" &&
          stored?.clinicalReview
            ? { clinicalReview: stored.clinicalReview }
            : {}),
        };
      });
      story.verifiedFacts = claims
        .filter((claim) => claim.status === "approved")
        .map((claim) => claim.text);
    });
  }
  async ingestStories(stories) {
    let added = 0;
    await this.mutate((state) => {
      added = 0;
      for (const input of stories) {
        if (state.backlog.some((story) => story.sourceId === input.sourceId))
          continue;
        state.backlog.push({
          ...input,
          id: randomUUID(),
          verifiedFacts: [],
          scheduledDay: "Monday",
          status: "In Backlog",
          campaignDraft: null,
          revision: 1,
        });
        added++;
      }
      return state;
    });
    return added;
  }
  async reserveGeneration() {
    const limit = Number(process.env.STUDIO_DAILY_GENERATION_LIMIT || 20);
    if (!Number.isInteger(limit) || limit < 0 || limit > 10000)
      throw fail(503, "Invalid generation budget configuration");
    const day = new Date().toISOString().slice(0, 10),
      id = randomUUID(),
      key = `generation-budget:${this.scope.organizationId}:${day}`;
    const globalKey = `generation-budget:global:${day}`,
      globalLimit = Number(
        process.env.STUDIO_GLOBAL_DAILY_GENERATION_LIMIT || 20,
      );
    if (
      !Number.isInteger(globalLimit) ||
      globalLimit < 0 ||
      globalLimit > 10000
    )
      throw fail(503, "Invalid global generation budget configuration");
    await this.store.update(globalKey, (state) => {
      state ||= { day, reservations: [] };
      if (state.reservations.length >= globalLimit)
        throw fail(429, "Daily installation generation limit reached");
      state.reservations.push({
        id,
        organizationId: this.scope.organizationId,
        brandId: this.scope.brandId,
        status: "reserved",
      });
      return state;
    });
    await this.store.update(key, (state) => {
      state ||= { day, reservations: [] };
      if (state.reservations.length >= limit)
        throw fail(429, "Daily organization generation limit reached");
      state.reservations.push({
        id,
        brandId: this.scope.brandId,
        status: "reserved",
        at: new Date().toISOString(),
      });
      return state;
    });
    return { id, key, globalKey };
  }
  async assertGenerationReservation(reservation) {
    const checks = [
      [
        reservation.globalKey,
        Number(process.env.STUDIO_GLOBAL_DAILY_GENERATION_LIMIT || 20),
      ],
      [
        reservation.key,
        Number(process.env.STUDIO_DAILY_GENERATION_LIMIT || 20),
      ],
    ];
    for (const [key, limit] of checks) {
      const ledger = await this.store.get(key);
      const entry = ledger?.reservations.find(
        (entry) => entry.id === reservation.id,
      );
      if (
        !Number.isInteger(limit) ||
        limit < 0 ||
        limit > 10000 ||
        !entry ||
        entry.status !== "reserved" ||
        entry.brandId !== this.scope.brandId ||
        ledger.reservations.length > limit
      )
        throw fail(
          429,
          "Generation reservation is no longer within the current daily limit",
        );
    }
  }
  async finalizeGeneration(reservation, { status, mode, traceId }) {
    await this.store.update(reservation.globalKey, (state) => {
      const event = state.reservations.find(
        (event) => event.id === reservation.id,
      );
      Object.assign(event, { status, mode, traceId: traceId || null });
      return state;
    });
    await this.store.update(reservation.key, (state) => {
      const event = state.reservations.find(
        (event) => event.id === reservation.id,
      );
      Object.assign(event, { status, mode, traceId: traceId || null });
      return state;
    });
    await this.recordUsage({
      id: reservation.id,
      type: "generation",
      status,
      mode,
      traceId: traceId || null,
    });
  }
  async recordUsage(event) {
    await this.mutate((state) => {
      if (!state.usage.some((row) => row.id === event.id))
        state.usage.push({
          ...event,
          organizationId: this.scope.organizationId,
          brandId: this.scope.brandId,
          timestamp: new Date().toISOString(),
        });
      return state;
    });
  }
  async claimJob(idempotencyKey, { retryOfJobId = null } = {}) {
    let job;
    let claimed = false,
      busy = false;
    await this.mutate((state) => {
      claimed = false;
      busy = false;
      for (const previous of state.jobs) {
        if (
          previous.status === "RUNNING" &&
          previous.leaseExpiresAt < Date.now()
        )
          previous.status = "INTERRUPTED";
      }
      job = state.jobs.find((job) => job.idempotencyKey === idempotencyKey);
      if (job && (job.retryOfJobId || null) !== retryOfJobId) {
        throw fail(409, "An idempotency key cannot change retry lineage");
      }
      if (!job) {
        const previous = retryOfJobId
          ? state.jobs.find((previous) => previous.jobId === retryOfJobId)
          : null;
        if (retryOfJobId && !previous)
          throw fail(404, "Previous batch not found in this brand");
        if (previous && !["FAILED", "INTERRUPTED"].includes(previous.status)) {
          throw fail(409, "Only a failed or interrupted batch can be retried");
        }
        const active = state.jobs.find((row) => row.status === "RUNNING");
        if (active) {
          busy = true;
          job = active;
          return state;
        }
        job = {
          jobId: randomUUID(),
          organizationId: this.scope.organizationId,
          brandId: this.scope.brandId,
          idempotencyKey,
          status: "RUNNING",
          leaseExpiresAt: Date.now() + 1800000,
          startedAt: new Date().toISOString(),
          completedStoryIds: [],
          retryOfJobId,
          retryRootJobId: previous
            ? previous.retryRootJobId || previous.jobId
            : null,
          attempt: previous ? (previous.attempt || 1) + 1 : 1,
          previousCompletedStoryIds: [
            ...new Set([
              ...(previous?.previousCompletedStoryIds || []),
              ...(previous?.completedStoryIds || []),
            ]),
          ],
        };
        state.jobs.unshift(job);
        claimed = true;
      }
      return state;
    });
    return { job, claimed, busy };
  }
  async updateJob(id, patch) {
    return (
      await this.mutate((state) => {
        Object.assign(
          state.jobs.find((job) => job.jobId === id),
          patch,
        );
        return state;
      })
    ).jobs.find((job) => job.jobId === id);
  }
  async saveAsset(asset) {
    const record = {
      id: randomUUID(),
      ...asset,
      organizationId: this.scope.organizationId,
      brandId: this.scope.brandId,
      sha256: createHash("sha256")
        .update(Buffer.from(asset.base64, "base64"))
        .digest("hex"),
      createdAt: new Date().toISOString(),
    };
    if (this.store.uploadArtifact) {
      record.artifactRef = await this.store.uploadArtifact(
        this.scope,
        record.id,
        Buffer.from(record.base64, "base64"),
        record.contentType,
      );
      delete record.base64;
    }
    try {
      await this.mutate((state) => {
        if (record.storyRevision !== undefined) {
          const story = state.backlog.find(
            (story) => story.id === record.storyId,
          );
          if (!story || story.revision !== record.storyRevision)
            throw fail(409, "Draft changed during export; retry");
          story.status = "Exported";
          story.exportedRevision = record.storyRevision;
          story.exportedAt = record.createdAt;
          story.revision++;
        }
        state.assets.push(record);
        return state;
      });
    } catch (error) {
      if (record.artifactRef)
        await this.store
          .deleteArtifact?.(this.scope, record.artifactRef)
          .catch(() => {});
      throw error;
    }
    return record;
  }
  async getAsset(id) {
    const record = (await this.read()).assets.find((asset) => asset.id === id);
    if (!record) return null;
    if (record.artifactRef)
      return {
        ...record,
        base64: (
          await this.store.downloadArtifact(this.scope, record.artifactRef)
        ).toString("base64"),
      };
    return record;
  }
  async savePreflight(record) {
    const value = {
      id: randomUUID(),
      createdAt: new Date().toISOString(),
      ...record,
      organizationId: this.scope.organizationId,
      brandId: this.scope.brandId,
    };
    await this.mutate((state) => {
      const story = state.backlog.find((story) => story.id === value.storyId);
      if (!story || story.revision !== value.storyRevision)
        throw fail(409, "Draft changed during preflight; retry");
      state.preflights.push(value);
      return state;
    });
    return value;
  }
  async exportData() {
    const data = await this.read();
    // Execution authority, delivery leases and helper grants are never portable.
    delete data.operatorJobs;
    delete data.operatorJobScope;
    delete data.operatorControl;
    if (data.workspace) {
      delete data.workspace.receipts;
      data.workspace = portableWorkspace(
        data.workspace,
        new Set(data.backlog.map((story) => story.id)),
        this.scope,
      );
      delete data.workspace.receipts;
    }
    data.telemetry.backpropDataset =
      data.telemetry.backpropDataset.map(classifyFeedback);
    const rows = [
      ...data.telemetry.traces,
      ...data.telemetry.backpropDataset,
      ...data.telemetry.batchJobs,
      ...data.jobs,
      ...data.assets,
      ...data.preflights,
      ...data.usage,
      ...(data.operationalEvents || []),
    ];
    for (const row of rows) {
      if (
        row.organizationId &&
        row.organizationId !== this.scope.organizationId
      )
        throw fail(
          409,
          "Stored organization lineage does not match this scope",
        );
      if (row.brandId && row.brandId !== this.scope.brandId) {
        if (
          row.brandId !== this.scope.preset &&
          row.brandId !== data.brandProfile.id
        )
          throw fail(409, "Stored brand lineage does not match this scope");
        row.contentPresetId = row.brandId;
      }
      row.organizationId = this.scope.organizationId;
      row.brandId = this.scope.brandId;
    }
    data.assets = await Promise.all(
      data.assets.map(async (asset) => {
        const complete = await this.getAsset(asset.id);
        delete complete.artifactRef;
        complete.organizationId = this.scope.organizationId;
        complete.brandId = this.scope.brandId;
        return complete;
      }),
    );
    return {
      schemaVersion: 1,
      scope: {
        organizationId: this.scope.organizationId,
        brandId: this.scope.brandId,
      },
      exportedAt: new Date().toISOString(),
      sha256: createHash("sha256").update(JSON.stringify(data)).digest("hex"),
      data,
    };
  }
  async importData(bundle, { remapScope = false } = {}) {
    if (
      !bundle?.data ||
      typeof bundle.data !== "object" ||
      !bundle?.scope?.organizationId ||
      !bundle.scope.brandId ||
      bundle.sha256 !==
        createHash("sha256").update(JSON.stringify(bundle.data)).digest("hex")
    )
      throw fail(400, "Invalid portable manifest or checksum");
    if (
      (bundle.scope.organizationId !== this.scope.organizationId ||
        bundle.scope.brandId !== this.scope.brandId) &&
      !remapScope
    )
      throw fail(400, "Explicit scope remapping is required");
    if (
      bundle?.schemaVersion !== 1 ||
      bundle.data?.schemaVersion !== 1 ||
      !Array.isArray(bundle.data.backlog) ||
      !Array.isArray(bundle.data.assets) ||
      typeof bundle.data.brandProfile?.brandName !== "string" ||
      !Array.isArray(bundle.data.telemetry?.traces) ||
      !Array.isArray(bundle.data.telemetry?.backpropDataset) ||
      !Array.isArray(bundle.data.telemetry?.batchJobs) ||
      !Array.isArray(bundle.data.jobs) ||
      !Array.isArray(bundle.data.usage) ||
      !Array.isArray(bundle.data.preflights)
    )
      throw fail(400, "Invalid import schema");
    if (
      bundle.data.assets.some(
        (asset) =>
          asset.artifactRef ||
          typeof asset.base64 !== "string" ||
          typeof asset.id !== "string" ||
          typeof asset.filename !== "string" ||
          ![
            "image/png",
            "application/zip",
            "text/plain; charset=utf-8",
            "text/plain",
          ].includes(asset.contentType),
      )
    )
      throw fail(400, "Invalid portable artifact");
    const storyIds = new Set(bundle.data.backlog.map((story) => story.id));
    if (
      storyIds.size !== bundle.data.backlog.length ||
      bundle.data.backlog.some(
        (story) => typeof story.id !== "string" || !story.id,
      )
    )
      throw fail(400, "Invalid or duplicate story IDs");
    const records = [
      ...bundle.data.assets,
      ...bundle.data.preflights,
      ...bundle.data.telemetry.traces,
      ...bundle.data.telemetry.backpropDataset,
      ...bundle.data.telemetry.batchJobs,
      ...bundle.data.jobs,
      ...bundle.data.usage,
      ...(bundle.data.operationalEvents || []),
    ];
    if (
      records.some(
        (record) =>
          (record.organizationId &&
            record.organizationId !== bundle.scope.organizationId) ||
          (record.brandId && record.brandId !== bundle.scope.brandId),
      )
    )
      throw fail(400, "Mixed-scope records are not portable");
    if (
      bundle.data.assets.some(
        (asset) =>
          !storyIds.has(asset.storyId) ||
          asset.sha256 !==
            createHash("sha256")
              .update(Buffer.from(asset.base64, "base64"))
              .digest("hex"),
      ) ||
      bundle.data.preflights.some((record) => !storyIds.has(record.storyId))
    )
      throw fail(400, "Orphaned artifact or invalid checksum");
    const exceptions = new Set(["brand_profile", "ad_hoc"]);
    if (
      records.some(
        (record) =>
          record.storyId &&
          !storyIds.has(record.storyId) &&
          !exceptions.has(record.storyId),
      ) ||
      bundle.data.jobs.some((job) =>
        (job.completedStoryIds || []).some((id) => !storyIds.has(id)),
      )
    )
      throw fail(400, "Orphaned lineage record");
    const traceIds = new Set(
      bundle.data.telemetry.traces.map((trace) => trace.traceId),
    );
    if (
      records.some(
        (record) => record.generationId && !traceIds.has(record.generationId),
      )
    )
      throw fail(400, "Orphaned generation lineage");
    if (
      bundle.data.gatewayConfig &&
      Object.keys(bundle.data.gatewayConfig).some(
        (key) => !["provider", "model", "temperature"].includes(key),
      )
    )
      throw fail(400, "Invalid portable gateway configuration");
    const allowed = [
      "schemaVersion",
      "brandProfile",
      "backlog",
      "telemetry",
      "jobs",
      "assets",
      "preflights",
      "usage",
      "gatewayConfig",
      "discovery",
      "operationalEvents",
      "workspace",
    ];
    const data = Object.fromEntries(
      allowed
        .filter((key) => bundle.data[key] !== undefined)
        .map((key) => [key, bundle.data[key]]),
    );
    if (data.workspace)
      data.workspace = portableWorkspace(
        data.workspace,
        new Set(data.backlog.map((story) => story.id)),
        bundle.scope,
        { remapTo: remapScope ? this.scope : undefined },
      );
    for (const job of data.jobs) {
      if (job.status === "RUNNING") job.status = "INTERRUPTED";
    }
    if (remapScope) {
      for (const story of data.backlog) delete story.assigneeId;
      for (const record of records) {
        if (record.organizationId)
          record.organizationId = this.scope.organizationId;
        if (record.brandId) record.brandId = this.scope.brandId;
      }
    }
    if (this.store.uploadArtifact) {
      for (const asset of data.assets) {
        asset.artifactRef = await this.store.uploadArtifact(
          this.scope,
          asset.id,
          Buffer.from(asset.base64, "base64"),
          asset.contentType,
        );
        delete asset.base64;
      }
    }
    await this.store.update(this.key, () => data);
    return { imported: true };
  }
}
