import test from "node:test";
import assert from "node:assert/strict";
import { ObservabilityEngine, classifyFeedback } from "./observability.js";
test("generation, edits, schedule and export remain unlabeled events and preserve the immutable raw baseline", () => {
  const engine = new ObservabilityEngine();
  const campaign = { reel: { closingCta: "original" } };
  engine.recordGenerationTrace({
    trace: { traceId: "gen-one", provider: "fixture", model: "fixture" },
    storyId: "story",
    storyTitle: "Fixture",
    campaign,
    evalResult: { score: 0, overallPass: false, formatChecks: [] },
  });
  const baseline = engine.backpropDataset[0];
  assert.equal(baseline.eventType, "generation_baseline");
  assert.equal(baseline.preferenceLabel, null);
  for (const [action, eventType] of [
    ["edited_inline_by_marketer", "human_edit"],
    ["scheduled_Scheduled_Friday", "schedule_action"],
    ["download_created", "export_action"],
  ]) {
    const event = engine.recordMarketerAction({
      storyId: "story",
      storyTitle: "Fixture",
      format: "reel",
      action,
      finalContent: { closingCta: "edited" },
    });
    assert.equal(event.eventType, eventType);
    assert.equal(event.preferenceLabel, null);
  }
  assert.deepEqual(baseline.rawGeneration, campaign);
  assert.equal(baseline.humanFinalVersion.reel.closingCta, "edited");
  assert.equal(
    classifyFeedback({ humanSignal: "exported_to_social" }).preferenceLabel,
    null,
  );
  assert.equal(
    classifyFeedback({ humanSignal: "scheduled_Scheduled_Monday" }).eventType,
    "schedule_action",
  );
});
