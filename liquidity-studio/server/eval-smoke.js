import { createAppContainer } from './container.js';

async function runSmokeEval() {
  console.log('=== LIQUIDITY STUDIO v0: DI CONTAINER + 3 CORE JTBDs SMOKE TEST ===');

  const container = createAppContainer();
  const {
    backlogCalendarService,
    multiFormatFormatterService,
    batchProductionService,
    adminObservabilityService
  } = container.services;

  // JTBD #3: Curating & Managing Backlog + Content Calendar
  const boot = await backlogCalendarService.getStudioBootstrap();
  console.log(`\n[JTBD #3: Backlog & Calendar] Loaded ${boot.backlog.length} stories across ${boot.calendar.length} calendar days.`);

  // JTBD #1: Weekly Batch Producing Content Drafts
  console.log('[JTBD #1: Weekly Batch Producer] Running weekly batch draft job...');
  const batchRes = await batchProductionService.runWeeklyBatch({ maxStories: 1 });
  console.log(` -> Batch Job ${batchRes.job.jobId}: ${batchRes.job.status} (${batchRes.job.formatsPrepared} channel drafts created, Eval Pass Rate: ${batchRes.job.evalPassRate * 100}%)`);

  // JTBD #2: Multi-Format Channel Export + Implicit Telemetry Capture
  const topStory = boot.backlog[0];
  await multiFormatFormatterService.exportFormattedAsset({
    storyTitle: topStory.title,
    format: 'carousel',
    content: batchRes.latestCampaign.carousel
  });
  await backlogCalendarService.scheduleStory({
    storyId: topStory.id,
    status: 'Scheduled',
    scheduledDay: 'Tuesday'
  });

  const adminOverview = adminObservabilityService.getOverview();
  console.log('\n[Dependency Injection & Observability Verification]');
  console.log(' -> Injected Adapters:', JSON.stringify(adminOverview.diAdapters));
  console.log(' -> Silent Eval Avg Score:', `${adminOverview.observability.summary.avgEvalScore}%`);
  console.log(' -> Backprop Preference Pairs Ready for JSONL Export:', adminOverview.observability.summary.backpropRecordsCollected);
}

runSmokeEval().catch((err) => {
  console.error('v0 DI smoke test failed:', err);
  process.exit(1);
});
