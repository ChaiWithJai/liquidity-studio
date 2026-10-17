/**
 * Admin Observability, Hidden Quality Eval & Backpropagation Telemetry Store (server/observability.js)
 *
 * Upgraded via Backwards Testing to link every { storyId, rawGeneration, humanFinalVersion, delta }
 * into a complete DPO / Prompt-Backpropagation Preference Pair.
 */

export class ObservabilityEngine {
  constructor() {
    this.traces = [];
    this.batchJobs = [];
    this.backpropDataset = [];
  }

  /**
   * Silent 4-format quality evaluation (runs strictly in Admin layer; invisible to Marketer UI).
   */
  evaluateCampaignSilent(campaign) {
    const checks = [];
    const formats = ['infographic', 'carousel', 'story', 'reel'];
    for (const fmt of formats) {
      const item = campaign?.[fmt];
      if (!item) continue;
      const serialized = JSON.stringify(item);
      const hasHardNumbers = /(\$\d+|\d+(\.\d+)?%|\d+(\.\d+)?x|\b\d+\s*(million|billion|m|b|k)\b)/i.test(serialized);
      const hasOwnershipAngle = /\b(margin|equity|stake|valuation|buyback|royalt|backend|distribution|multiple|take-rate|cogs|ownership|cap table|upside|cash flow|rights|yield|control)\b/i.test(serialized);
      const hookText = item.headline || item.coverHook || item.hookBanner || item.spokenHook0to3s || '';
      const headlineWords = hookText.trim().split(/\s+/).filter(Boolean).length;
      const conciseHook = headlineWords > 0 && headlineWords <= (fmt === 'reel' ? 16 : 10);

      checks.push({
        format: fmt,
        hasHardNumbers,
        hasOwnershipAngle,
        conciseHook,
        passed: hasHardNumbers && hasOwnershipAngle && conciseHook
      });
    }

    const passedCount = checks.filter((c) => c.passed).length;
    return {
      overallPass: passedCount === checks.length && checks.length > 0,
      score: checks.length ? Math.round((passedCount / checks.length) * 100) : 0,
      formatChecks: checks
    };
  }

  recordGenerationTrace({ trace, storyId, storyTitle, campaign, evalResult }) {
    const entry = {
      ...trace,
      storyId,
      storyTitle,
      evalScore: evalResult.score,
      evalPass: evalResult.overallPass,
      formatChecks: evalResult.formatChecks
    };
    this.traces.unshift(entry);

    this.backpropDataset.unshift({
      recordId: `bp_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      isBaselinePair: true,
      timestamp: new Date().toISOString(),
      storyId,
      storyTitle,
      model: trace.model,
      provider: trace.provider,
      evalScoreBeforeHuman: evalResult.score,
      evalScoreAfterHuman: evalResult.score,
      humanSignal: 'batch_draft_generated',
      rawGeneration: structuredClone(campaign),
      humanFinalVersion: structuredClone(campaign)
    });

    return entry;
  }

  recordMarketerAction({ storyId, storyTitle, format, action, finalContent }) {
    // Always link human edit/export back to the pristine baseline generation record
    const existingPair = this.backpropDataset.find((r) => r.storyId === storyId && r.isBaselinePair);
    let postEditEvalScore = null;
    if (existingPair && format && finalContent) {
      existingPair.humanSignal = action;
      if (existingPair.humanFinalVersion && existingPair.humanFinalVersion[format]) {
        existingPair.humanFinalVersion[format] = structuredClone(finalContent);
        const reEval = this.evaluateCampaignSilent(existingPair.humanFinalVersion);
        existingPair.evalScoreAfterHuman = reEval.score;
        postEditEvalScore = reEval.score;
      }
    }

    const record = {
      recordId: `bp_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      timestamp: new Date().toISOString(),
      storyId,
      storyTitle,
      format,
      humanSignal: action,
      evalScoreAfterHuman: postEditEvalScore,
      rawGeneration: existingPair && format ? structuredClone(existingPair.rawGeneration?.[format]) : null,
      humanFinalVersion: structuredClone(finalContent)
    };
    this.backpropDataset.unshift(record);
    return record;
  }

  recordBatchJob(job) {
    this.batchJobs.unshift(job);
    return job;
  }

  getSnapshot() {
    const totalTraces = this.traces.length;
    const avgLatencyMs = totalTraces
      ? Math.round(this.traces.reduce((acc, t) => acc + (t.latencyMs || 0), 0) / totalTraces)
      : 0;
    const avgEvalScore = totalTraces
      ? Math.round(this.traces.reduce((acc, t) => acc + (t.evalScore || 0), 0) / totalTraces)
      : null;

    return {
      summary: {
        totalGenerations: totalTraces,
        avgLatencyMs,
        avgEvalScore,
        backpropRecordsCollected: this.backpropDataset.length,
        weeklyBatchCount: this.batchJobs.length
      },
      batchJobs: this.batchJobs,
      traces: this.traces.slice(0, 25),
      backpropDataset: this.backpropDataset.slice(0, 25)
    };
  }
}
