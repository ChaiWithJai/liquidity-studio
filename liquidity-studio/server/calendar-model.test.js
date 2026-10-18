import test from "node:test";
import assert from "node:assert/strict";
import {
  validDate,
  dateRange,
  shiftDate,
  weekStart,
  captureIntent,
  placeCommand,
  removeCommand,
  canonicalZone,
} from "../src/lib/calendar-model.js";
test("civil dates span both New York DST changes without invented timestamps", () => {
  assert.equal(weekStart("2026-03-08"), "2026-03-02");
  assert.equal(weekStart("2026-11-01"), "2026-10-26");
  assert.deepEqual(dateRange("2026-03-07", "2026-03-09"), [
    "2026-03-07",
    "2026-03-08",
    "2026-03-09",
  ]);
  assert.equal(shiftDate("2026-11-01", 1), "2026-11-02");
  assert.equal(validDate("2026-02-30"), false);
  assert.throws(() => dateRange("2026-01-01", "2026-02-01"), /31/);
  assert.equal(canonicalZone("US/Eastern"), "America/New_York");
});
test("placement intent retains the reviewed story and bucket revisions through later changes", () => {
  const item = {
      storyId: "story",
      unit: "format",
      format: "reel",
      assignmentId: "a",
    },
    entities = new Map([["story", { row: { revision: 2 } }]]),
    data = {
      assignments: [
        {
          id: "a",
          storyId: "story",
          date: "2026-03-08",
          timeZone: "America/New_York",
          revision: 3,
        },
      ],
      buckets: {
        source: {
          date: "2026-03-08",
          timeZone: "America/New_York",
          revision: 4,
          assignmentIds: ["a"],
        },
        target: {
          date: "2026-03-09",
          timeZone: "America/New_York",
          revision: 5,
          assignmentIds: [],
        },
      },
    };
  const intent = captureIntent(item, entities, data),
    snapshot = structuredClone(intent);
  entities.get("story").row.revision = 99;
  data.buckets.target.revision = 99;
  const command = placeCommand(intent, "2026-03-09", "America/New_York");
  assert.equal(command.expectedRevision, 2);
  assert.equal(command.expectedAssignmentRevision, 3);
  assert.equal(command.sourceBucketRevision, 4);
  assert.equal(command.targetBucketRevision, 5);
  assert.deepEqual(intent, snapshot);
  assert.deepEqual(Object.keys(removeCommand(intent)).sort(), [
    "assignmentId",
    "expectedAssignmentRevision",
    "expectedRevision",
    "kind",
    "sourceBucketRevision",
    "storyId",
  ]);
  assert.throws(
    () => captureIntent({ ...item, assignmentId: "gone" }, entities, data),
    /changed/,
  );
});
