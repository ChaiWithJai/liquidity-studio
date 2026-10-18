import { findBucket } from './calendar-model.js';
const clone = value => JSON.parse(JSON.stringify(value));
const sameUnit = (a, b) => a.storyId === b.storyId && a.unit === b.unit && (a.format || null) === (b.format || null);
/** A reversible view only. Never changes entity revisions or creates server authority. */
export function previewCalendar(data, changes, key, status = 'saving') {
  if (!data || !changes?.length || changes.some(change => !['assignment.place','assignment.remove'].includes(change.kind))) return null;
  const result = clone(data);
  for (const [index, change] of changes.entries()) {
    let assignment = change.assignmentId
      ? result.assignments.find(item => item.id === change.assignmentId && item.storyId === change.storyId)
      : result.assignments.find(item => sameUnit(item, change));
    if (change.assignmentId && !assignment) return null;
    if (change.kind === 'assignment.remove' && !assignment) return null;
    const unit = assignment || change;
    for (const bucket of Object.values(result.buckets)) {
      bucket.assignmentIds = bucket.assignmentIds.filter(id => id !== assignment?.id);
    }
    result.assignments = result.assignments.filter(item => item.id !== assignment?.id);
    if (change.kind === 'assignment.remove') {
      result.unscheduledUnits = result.unscheduledUnits.filter(item => !sameUnit(item, unit));
      result.unscheduledUnits.push({storyId:change.storyId,storyRevision:change.expectedRevision,unit:unit.unit,format:unit.format || null,legacyWeekday:null,pending:status});
      if (unit.unit === 'campaign' && !result.unscheduledIds.includes(change.storyId)) result.unscheduledIds.push(change.storyId);
      continue;
    }
    if (change.unit === 'campaign') {
      result.unscheduledIds = result.unscheduledIds.filter(id => id !== change.storyId);
      result.legacyWeekdayIds = result.legacyWeekdayIds.filter(id => id !== change.storyId);
    }
    result.unscheduledUnits = result.unscheduledUnits.filter(item => !sameUnit(item, change));
    if (change.timeZone !== result.timeZone || change.date < result.startDate || change.date > result.endDate) continue;
    let bucket = findBucket(result,change.date,change.timeZone);
    if (!bucket) {
      bucket = {date:change.date,timeZone:change.timeZone,revision:0,assignmentIds:[]};
      result.buckets[`preview:${change.timeZone}:${change.date}`] = bucket;
    }
    const anchor = change.beforeAssignmentId;
    if (anchor && !bucket.assignmentIds.includes(anchor)) return null;
    assignment = {...assignment,id:assignment?.id || `preview:${key}:${index}`,storyId:change.storyId,unit:change.unit,format:change.format || null,date:change.date,timeZone:change.timeZone,pending:status};
    result.assignments.push(assignment);
    bucket.assignmentIds.splice(anchor ? bucket.assignmentIds.indexOf(anchor) : bucket.assignmentIds.length,0,assignment.id);
  }
  return result;
}
