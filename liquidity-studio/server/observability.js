import { evaluateCampaign } from "./domain.js";
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
  evaluateCampaignSilent(campaign, story, brandProfile) {
    return evaluateCampaign(campaign, story, brandProfile);
  }

  recordGenerationTrace({
    trace,
    storyId,
    storyTitle,
    campaign,
    evalResult,
    story,
  }) {
    const entry = {
      ...trace,
      generationId: trace.traceId,
      storyId,
      storyTitle,
      evalScore: evalResult.score,
      evalPass: evalResult.overallPass,
      formatChecks: evalResult.formatChecks,
    };
    this.traces.unshift(entry);

    this.backpropDataset.unshift({
      recordId: `bp_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      isBaselinePair: true,
      generationId: trace.traceId,
      timestamp: new Date().toISOString(),
      storyId,
      storyTitle,
      model: trace.model,
      provider: trace.provider,
      evalScoreBeforeHuman: evalResult.score,
      evalScoreAfterHuman: evalResult.score,
      humanSignal: "draft_generated",
      sourceClaims: structuredClone(story?.sourceClaims || []),
      assessmentMeaning: evalResult.scoreMeaning || null,
      rawGeneration: structuredClone(campaign),
      humanFinalVersion: structuredClone(campaign),
    });

    return entry;
  }

  recordGenerationFailure({ storyId, trace }) {
    const entry = {
      traceId: trace?.traceId || `failed_${Date.now()}`,
      timestamp: new Date().toISOString(),
      storyId,
      status: "error",
      errorCode: trace?.error || "GENERATION_FAILED",
      latencyMs: trace?.latencyMs || 0,
      evalScore: null,
    };
    this.traces.unshift(entry);
    return entry;
  }

  recordMarketerAction({ storyId, storyTitle, format, action, finalContent }) {
    // Always link human edit/export back to the pristine baseline generation record
    const existingPair = this.backpropDataset.find(
      (r) => r.storyId === storyId && r.isBaselinePair,
    );
    const previousContent =
      existingPair && format
        ? structuredClone(existingPair.humanFinalVersion?.[format])
        : null;
    let postEditEvalScore = null;
    if (existingPair && format && finalContent) {
      if (
        existingPair.humanFinalVersion &&
        existingPair.humanFinalVersion[format]
      ) {
        existingPair.humanFinalVersion[format] = structuredClone(finalContent);
        const reEval = this.evaluateCampaignSilent(
          existingPair.humanFinalVersion,
          { sourceClaims: existingPair.sourceClaims },
        );
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
      generationId: existingPair?.generationId || null,
      previousContent,
      delta: { before: previousContent, after: structuredClone(finalContent) },
      rawGeneration:
        existingPair && format
          ? structuredClone(existingPair.rawGeneration?.[format])
          : null,
      humanFinalVersion: structuredClone(finalContent),
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
      ? Math.round(
          this.traces.reduce((acc, t) => acc + (t.latencyMs || 0), 0) /
            totalTraces,
        )
      : 0;
    const evaluated = this.traces.filter((trace) =>
      Number.isFinite(trace.evalScore),
    );
    const avgEvalScore = evaluated.length
      ? Math.round(
          evaluated.reduce((acc, trace) => acc + trace.evalScore, 0) /
            evaluated.length,
        )
      : null;

    return {
      summary: {
        totalGenerations: totalTraces,
        failedGenerations: this.traces.filter(
          (trace) => trace.status === "error",
        ).length,
        syntheticGenerations: this.traces.filter(
          (trace) => trace.status === "degraded",
        ).length,
        assessmentMeaning:
          "source-excerpt coverage; factual accuracy is not assessed",
        avgLatencyMs,
        avgEvalScore,
        backpropRecordsCollected: this.backpropDataset.length,
        weeklyBatchCount: this.batchJobs.length,
      },
      batchJobs: this.batchJobs,
      traces: this.traces.slice(0, 25),
      backpropDataset: this.backpropDataset.slice(0, 25),
    };
  }
}
