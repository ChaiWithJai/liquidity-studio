// Civil-date arithmetic only: Date is a calculator, never an assignment instant.
export function validDate(value) {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value))
    return false;
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(0);
  date.setUTCFullYear(year, month - 1, day);
  date.setUTCHours(12, 0, 0, 0);
  return year > 0 && date.toISOString().slice(0, 10) === value;
}
export function shiftDate(value, days) {
  if (!validDate(value) || !Number.isInteger(days))
    throw new Error("Choose a valid local date.");
  const date = new Date(`${value}T12:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}
export function weekStart(value) {
  const day = new Date(`${value}T12:00:00Z`).getUTCDay();
  return shiftDate(value, -(day + 6) % 7);
}
export function dateRange(start, end) {
  if (!validDate(start) || !validDate(end) || start > end)
    throw new Error("Choose a valid start and end date.");
  const values = [];
  for (let value = start; value <= end; value = shiftDate(value, 1)) {
    if (values.length === 31)
      throw new Error("Show at most 31 days at a time.");
    values.push(value);
  }
  return values;
}
export function canonicalZone(value) {
  if (typeof value !== "string" || !value.trim() || value.length > 100)
    throw new Error("Choose an explicit IANA timezone.");
  try {
    return new Intl.DateTimeFormat("en", { timeZone: value }).resolvedOptions()
      .timeZone;
  } catch {
    throw new Error("Choose a valid IANA timezone, such as America/New_York.");
  }
}
export function localToday(zone) {
  const parts = new Intl.DateTimeFormat("en", {
    timeZone: canonicalZone(zone),
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());
  return ["year", "month", "day"]
    .map((type) => parts.find((part) => part.type === type).value)
    .join("-");
}
export function unitKey(item) {
  return `${item.storyId}:${item.unit}:${item.format || "campaign"}`;
}
export function unitLabel(item) {
  return item.unit === "campaign"
    ? "Whole campaign"
    : `${item.format[0].toUpperCase()}${item.format.slice(1)} plan`;
}
export function findBucket(data, date, zone) {
  return Object.values(data?.buckets || {}).find(
    (bucket) => bucket.date === date && bucket.timeZone === zone,
  );
}
export function captureIntent(item, entities, data) {
  const row = entities.get(item.storyId)?.row;
  if (!row) throw new Error("Reload the story before moving it.");
  const assignment = item.assignmentId
    ? data.assignments.find((value) => value.id === item.assignmentId)
    : null;
  if (item.assignmentId && !assignment)
    throw new Error("This placement changed. Reload the calendar.");
  const source = assignment
    ? findBucket(data, assignment.date, assignment.timeZone)
    : null;
  if (assignment && !source)
    throw new Error("Reload the source date before moving this plan.");
  return {
    storyId: item.storyId,
    expectedRevision: row.revision,
    unit: item.unit,
    format: item.unit === "format" ? item.format : null,
    ...(assignment
      ? {
          assignmentId: assignment.id,
          expectedAssignmentRevision: assignment.revision,
          sourceBucketRevision: source.revision,
        }
      : {}),
    bucketRevisions: Object.fromEntries(
      Object.values(data.buckets || {}).map((bucket) => [
        `${bucket.timeZone}|${bucket.date}`,
        bucket.revision,
      ]),
    ),
  };
}
export function placeCommand(intent, date, zone, beforeAssignmentId = null) {
  if (!validDate(date)) throw new Error("Choose a valid local date.");
  const { bucketRevisions, ...fields } = intent;
  return {
    kind: "assignment.place",
    ...fields,
    date,
    timeZone: canonicalZone(zone),
    targetBucketRevision:
      bucketRevisions[`${canonicalZone(zone)}|${date}`] || 0,
    beforeAssignmentId,
  };
}
export function removeCommand(intent) {
  if (!intent.assignmentId)
    throw new Error("This unit has no dated placement to remove.");
  return {
    kind: "assignment.remove",
    storyId: intent.storyId,
    expectedRevision: intent.expectedRevision,
    assignmentId: intent.assignmentId,
    expectedAssignmentRevision: intent.expectedAssignmentRevision,
    sourceBucketRevision: intent.sourceBucketRevision,
  };
}
