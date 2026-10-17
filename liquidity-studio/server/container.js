/**
 * Dependency Injection Container & Core Use-Case Services (server/container.js)
 *
 * Implements all 3 Core JTBDs + Founder Admin Observability via Ports & Adapters.
 */

import { discoverInto } from './discovery.js';
import { getApprovedClaims } from './source-integrity.js';
import { randomUUID } from 'node:crypto';
import { fail } from './auth.js';
import { AIGateway } from './gateway.js';
import { ObservabilityEngine } from './observability.js';
import { CONTEXT_GRAPH, verifyContextGraphTopology } from './context-graph.js';
import {
  DEFAULT_BRAND_PROFILE,
  INITIAL_CONTENT_BACKLOG,
  generateMultiFormatCampaign
} from './domain.js';

export class InMemoryGCPFirestoreAdapter {
  constructor() {
    this.brandProfile = structuredClone(DEFAULT_BRAND_PROFILE);
    this.assets = [];
    this.backlog = INITIAL_CONTENT_BACKLOG.map((item, idx) => ({
      ...item,
      scheduledDay: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'][idx % 5],
      campaignDraft: null,
      sourceClaims: item.verifiedFacts.map((text, index) => ({ id: `legacy_${index}`, text, sourceUrl: null, status: 'unreviewed' }))
    }));
  }

  async getBrandProfile() {
    return this.brandProfile;
  }

  async updateBrandProfile(patch) {
    this.brandProfile = { ...this.brandProfile, ...patch };
    return this.brandProfile;
  }

  async listBacklog() {
    return this.backlog;
  }

  async addBacklogStory(storyInput) {
    const newStory = {
      id: `story_${Date.now()}`,
      title: storyInput.title || 'New Brand Ownership Breakdown',
      category: storyInput.category || 'Creator & Founder Liquidity',
      trendBadge: '✨ Added to Queue',
      status: 'In Backlog',
      scheduledDay: storyInput.scheduledDay || 'Monday',
      audienceTag: storyInput.audienceTag || 'Global Audience',
      sourceClaims: storyInput.sourceClaims || [],
      verifiedFacts: (storyInput.sourceClaims || []).filter(claim => claim.status === 'approved').map(claim => claim.text),
      campaignDraft: null
    };
    if (!newStory.sourceClaims.length) throw fail(400, 'Supplied source claims are required');
    this.backlog.unshift(newStory);
    return newStory;
  }

  async updateStoryStatus(storyId, status, scheduledDay) {
    const story = this.backlog.find((s) => s.id === storyId);
    if (!story) throw new Error(`Story not found: ${storyId}`);
    if (status) story.status = status;
    if (scheduledDay) story.scheduledDay = scheduledDay;
    return story;
  }

  async saveCampaignDraft(storyId, campaign) {
    const story = this.backlog.find((s) => s.id === storyId);
    if (story) {
      story.campaignDraft = campaign;
      if (story.status === 'In Backlog' || story.status === 'Ready for Campaign') {
        story.status = 'Draft Ready';
      }
    }
    return story;
  }

  async updateCampaignFormatDraft(storyId, format, updatedFormatContent) {
    const story = this.backlog.find((s) => s.id === storyId);
    if (!story || !story.campaignDraft) throw new Error(`Draft not found for story: ${storyId}`);
    story.campaignDraft[format] = updatedFormatContent;
    return story;
  }

  async saveAsset(asset) { const record = { id: randomUUID(), ...asset }; this.assets.push(record); return record; }
  async getAsset(id) { return this.assets.find(asset => asset.id === id); }
  async updateSourceClaims(id, claims) { const story = this.backlog.find(story => story.id === id); if (!story) throw fail(404, 'Story not found'); story.sourceClaims = claims; story.verifiedFacts = claims.filter(claim => claim.status === 'approved').map(claim => claim.text); return story; }
  async getCalendarSchedule() {
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    return days.map((day) => ({
      day,
      items: this.backlog.filter((s) => s.scheduledDay === day)
    }));
  }
}

export function createAppContainer(overrides = {}) {
  const aiGateway = overrides.aiGateway || new AIGateway();
  const repo = overrides.repo || new InMemoryGCPFirestoreAdapter();
  const telemetry = overrides.telemetry || new ObservabilityEngine();

  // JTBD #3: Curating & Managing a Content Calendar / Backlog
  const backlogCalendarService = {
    async getStudioBootstrap() {
      const [brandProfile, backlog, calendar] = await Promise.all([
        repo.getBrandProfile(),
        repo.listBacklog(),
        repo.getCalendarSchedule()
      ]);
      return { brandProfile, backlog, calendar };
    },
    async updateBrandProfile(patch) {
      const updated = await repo.updateBrandProfile(patch);
      await telemetry.recordMarketerAction({
        storyId: 'brand_profile',
        storyTitle: updated.brandName,
        format: 'brand_kit',
        action: 'updated_brand_profile',
        finalContent: updated
      });
      return { brandProfile: updated };
    },
    async addStory(input) {
      const story = await repo.addBacklogStory(input);
      await telemetry.recordMarketerAction({
        storyId: story.id,
        storyTitle: story.title,
        format: 'backlog_item',
        action: 'queued_to_backlog',
        finalContent: story
      });
      return {
        story,
        backlog: await repo.listBacklog(),
        calendar: await repo.getCalendarSchedule()
      };
    },
    async scheduleStory({ storyId, status, scheduledDay }) {
      const updated = await repo.updateStoryStatus(storyId, status, scheduledDay);
      await telemetry.recordMarketerAction({
        storyId: updated.id,
        storyTitle: updated.title,
        format: 'calendar_slot',
        action: `scheduled_${status}_${scheduledDay}`,
        finalContent: { status, scheduledDay }
      });
      return {
        story: updated,
        backlog: await repo.listBacklog(),
        calendar: await repo.getCalendarSchedule()
      };
    }
  };

  // JTBD #2: Formatting for Multi-Channel Posting (Infographic, Carousel, Story, Reel)
  const multiFormatFormatterService = {
    async generateCampaignForStory(storyId) {
      const backlog = await repo.listBacklog();
      const story = backlog.find((s) => s.id === storyId);
      if (!story) throw fail(404, 'Story not found');
      const brandProfile = await repo.getBrandProfile();

      const { output: campaign, trace } = await generateMultiFormatCampaign({
        gateway: aiGateway,
        story,
        brandProfile
      });

      await repo.saveCampaignDraft(story.id, campaign, story.revision);

      const evalResult = telemetry.evaluateCampaignSilent(campaign, story, brandProfile);
      await telemetry.recordGenerationTrace({
        trace,
        storyId: story.id,
        storyTitle: story.title,
        campaign,
        story,
        evalResult
      });

      await repo.recordUsage?.({ id: trace.traceId, type: 'generation', mode: campaign.provenance?.mode || 'unknown' });
      return { story, campaign, evalResult, trace };
    },
    async saveInlineEdit({ storyId, format, content, expectedRevision }) {
      const story = await repo.updateCampaignFormatDraft(storyId, format, content, expectedRevision);
      const record = await telemetry.recordMarketerAction({
        storyId: story.id,
        storyTitle: story.title,
        format,
        action: 'edited_inline_by_marketer',
        finalContent: content
      });
      return {
        story,
        campaign: story.campaignDraft,
        preferenceRecord: record
      };
    },
    async exportFormattedAsset({ storyId, storyTitle, format, content }) {
      if (storyId) {
        await repo.updateStoryStatus(storyId, 'Exported');
      }
      const record = await telemetry.recordMarketerAction({
        storyId: storyId || 'ad_hoc',
        storyTitle,
        format,
        action: 'exported_to_social',
        finalContent: content
      });
      return {
        exported: true,
        exportId: record.recordId,
        format,
        timestamp: record.timestamp,
        backlog: await repo.listBacklog(),
        calendar: await repo.getCalendarSchedule()
      };
    }
  };

  // JTBD #1: Weekly Batch Producing Content Drafts
  const batchProductionService = {
    async runWeeklyBatch({ maxStories = 1, idempotencyKey = randomUUID() } = {}) {
      const claim = await repo.claimJob?.(idempotencyKey);
      if (claim && !claim.claimed) return { job: claim.job, replayed: true, observability: await telemetry.getSnapshot() };
      const trackedJob = claim?.job;
      const startedAt = Date.now();
      let backlog = [];
      const results = [];
      try {
        const discovery = repo.read ? await discoverInto(repo) : { added: 0, configured: false };
        if (trackedJob) await repo.updateJob(trackedJob.jobId, { stage: 'reviewed_eligible', discovery });
        backlog = await repo.listBacklog();
        const targetStories = backlog.filter(story => { if (story.campaignDraft) return false; try { return getApprovedClaims(story).length > 0; } catch { return false; } }).slice(0, maxStories);
        if (trackedJob) await repo.updateJob(trackedJob.jobId, { stage: 'formatting', eligibleStories: targetStories.length });

        for (const story of targetStories) {
          const res = await multiFormatFormatterService.generateCampaignForStory(story.id);
          results.push(res);
          if (trackedJob) await repo.updateJob(trackedJob.jobId, { completedStoryIds: results.map(result => result.story.id) });
        }

        const avgEval =
          results.reduce((acc, r) => acc + r.evalResult.score, 0) / Math.max(1, results.length);

        const job = await telemetry.recordBatchJob({
          jobId: trackedJob?.jobId || `job_weekly_${Date.now()}`,
          trigger: 'Admin Batch Trigger',
          startedAt: new Date(startedAt).toISOString(),
          durationMs: Date.now() - startedAt,
          storiesDiscovered: backlog.length,
          formatsPrepared: results.length * 4,
          evalPassRate: results.length ? Number((avgEval / 100).toFixed(2)) : null,
          status: 'COMPLETED',
          stage: 'completed',
          discovery
        });

        if (trackedJob) await repo.updateJob(trackedJob.jobId, job);
        return {
          job,
          latestCampaign: results[0]?.campaign || null,
          observability: await telemetry.getSnapshot()
        };
      } catch (error) {
        if (trackedJob) await repo.updateJob(trackedJob.jobId, { status: 'FAILED', errorCode: 'BATCH_EXECUTION_FAILED' });
        await telemetry.recordBatchJob({
          jobId: trackedJob?.jobId || `job_weekly_${Date.now()}`,
          trigger: 'Admin Batch Trigger',
          startedAt: new Date(startedAt).toISOString(),
          durationMs: Date.now() - startedAt,
          storiesDiscovered: backlog.length,
          formatsPrepared: results.length * 4,
          evalPassRate: null,
          status: 'FAILED',
          errorCode: 'BATCH_EXECUTION_FAILED'
        });
        throw error;
      }
    }
  };

  // Founder Admin: DI Switchboard, Silent Eval Telemetry, Backprop Dataset Export
  const adminObservabilityService = {
    async getOverview() {
      return {
        diAdapters: {
          aiProviderPort: aiGateway.constructor.name,
          repositoryPort: repo.constructor.name,
          telemetrySinkPort: telemetry.constructor.name
        },
        gateway: aiGateway.getConfig(),
        observability: await telemetry.getSnapshot()
      };
    },
    async updateGatewayConfig(patch) {
      const gateway = aiGateway.updateConfig(patch);
      await repo.mutate?.(state => ({ ...state, gatewayConfig: patch }));
      return { gateway };
    },
    async exportBackpropDatasetJsonl() {
      const records = telemetry.allFeedback ? await telemetry.allFeedback() : telemetry.backpropDataset;
      return records.map((row) => JSON.stringify(row)).join('\n');
    },
    getContextGraph() {
      return {
        graph: CONTEXT_GRAPH,
        topologyValidation: verifyContextGraphTopology()
      };
    }
  };

  return {
    ports: { aiGateway, repo, telemetry },
    services: {
      backlogCalendarService,
      multiFormatFormatterService,
      batchProductionService,
      adminObservabilityService
    }
  };
}
