/**
 * Dependency Injection Container & Core Use-Case Services (server/container.js)
 *
 * Implements all 3 Core JTBDs + Founder Admin Observability via Ports & Adapters.
 */

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
    this.brandProfile = { ...DEFAULT_BRAND_PROFILE };
    this.backlog = INITIAL_CONTENT_BACKLOG.map((item, idx) => ({
      ...item,
      scheduledDay: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'][idx % 5],
      campaignDraft: null
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
      verifiedFacts:
        Array.isArray(storyInput.verifiedFacts) && storyInput.verifiedFacts.length
          ? storyInput.verifiedFacts
          : [
              storyInput.fact1 || '$100M+ estimated brand valuation driven by founder equity retention',
              storyInput.fact2 || '65%+ gross margins via direct-to-consumer and retail distribution',
              storyInput.fact3 || '100% IP and licensing control retained in holding company'
            ],
      campaignDraft: null
    };
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
      telemetry.recordMarketerAction({
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
      telemetry.recordMarketerAction({
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
      telemetry.recordMarketerAction({
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
      const story = backlog.find((s) => s.id === storyId) || backlog[0];
      const brandProfile = await repo.getBrandProfile();

      const { output: campaign, trace } = await generateMultiFormatCampaign({
        gateway: aiGateway,
        story,
        brandProfile
      });

      await repo.saveCampaignDraft(story.id, campaign);

      const evalResult = telemetry.evaluateCampaignSilent(campaign);
      telemetry.recordGenerationTrace({
        trace,
        storyId: story.id,
        storyTitle: story.title,
        campaign,
        evalResult
      });

      return { story, campaign, evalResult, trace };
    },
    async saveInlineEdit({ storyId, format, content }) {
      const story = await repo.updateCampaignFormatDraft(storyId, format, content);
      const record = telemetry.recordMarketerAction({
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
      const record = telemetry.recordMarketerAction({
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
    async runWeeklyBatch({ maxStories = 1 } = {}) {
      const startedAt = Date.now();
      const backlog = await repo.listBacklog();
      const targetStories = backlog.slice(0, maxStories);
      const results = [];

      for (const story of targetStories) {
        const res = await multiFormatFormatterService.generateCampaignForStory(story.id);
        results.push(res);
      }

      const avgEval =
        results.reduce((acc, r) => acc + r.evalResult.score, 0) / Math.max(1, results.length);

      const job = telemetry.recordBatchJob({
        jobId: `job_weekly_${Date.now()}`,
        trigger: 'Cloud Scheduler / Admin Batch Trigger',
        startedAt: new Date(startedAt).toISOString(),
        durationMs: Date.now() - startedAt,
        storiesDiscovered: backlog.length,
        formatsPrepared: results.length * 4,
        evalPassRate: Number((avgEval / 100).toFixed(2)),
        status: 'COMPLETED'
      });

      return {
        job,
        latestCampaign: results[0]?.campaign || null,
        observability: telemetry.getSnapshot()
      };
    }
  };

  // Founder Admin: DI Switchboard, Silent Eval Telemetry, Backprop Dataset Export
  const adminObservabilityService = {
    getOverview() {
      return {
        diAdapters: {
          aiProviderPort: aiGateway.constructor.name,
          repositoryPort: repo.constructor.name,
          telemetrySinkPort: telemetry.constructor.name
        },
        gateway: aiGateway.getConfig(),
        observability: telemetry.getSnapshot()
      };
    },
    updateGatewayConfig(patch) {
      return { gateway: aiGateway.updateConfig(patch) };
    },
    exportBackpropDatasetJsonl() {
      const snap = telemetry.getSnapshot();
      return snap.backpropDataset.map((row) => JSON.stringify(row)).join('\n');
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
