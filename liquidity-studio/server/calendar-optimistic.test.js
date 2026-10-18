import test from 'node:test';
import assert from 'node:assert/strict';
import {previewCalendar} from '../src/lib/calendar-optimistic.js';
const seed=()=>({startDate:'2026-03-08',endDate:'2026-03-14',timeZone:'America/New_York',buckets:{a:{date:'2026-03-08',timeZone:'America/New_York',revision:7,assignmentIds:['one','two']}},assignments:[{id:'one',storyId:'a',unit:'campaign',format:null,date:'2026-03-08',timeZone:'America/New_York',revision:4},{id:'two',storyId:'b',unit:'campaign',format:null,date:'2026-03-08',timeZone:'America/New_York',revision:8}],unscheduledUnits:[{storyId:'c',unit:'campaign',format:null}],unscheduledIds:['c'],legacyWeekdayIds:['c']});
const place=(extra={})=>({kind:'assignment.place',storyId:'c',expectedRevision:3,unit:'campaign',format:null,date:'2026-03-08',timeZone:'America/New_York',...extra});
test('pending placement is a separate view, preserves revisions and inserts at the requested anchor',()=>{
 const original=seed(),before=structuredClone(original);const next=previewCalendar(original,[place({beforeAssignmentId:'two'})],'request');
 assert.deepEqual(original,before);assert.deepEqual(next.buckets.a.assignmentIds,['one','preview:request:0','two']);assert.equal(next.buckets.a.revision,7);assert.equal(next.assignments[0].revision,4);assert.equal(next.assignments.at(-1).pending,'saving');assert.deepEqual(next.unscheduledIds,[]);assert.deepEqual(next.legacyWeekdayIds,[]);
});
test('moving and reordering preserve stable assignment identity without duplicates',()=>{
 const next=previewCalendar(seed(),[place({storyId:'b',assignmentId:'two',beforeAssignmentId:'one'})],'request');
 assert.deepEqual(next.buckets.a.assignmentIds,['two','one']);assert.equal(next.assignments.length,2);assert.equal(next.assignments.find(x=>x.id==='two').revision,8);
 const moved=previewCalendar(next,[place({storyId:'b',assignmentId:'two',date:'2026-03-09'})],'again');
 assert.deepEqual(moved.buckets.a.assignmentIds,['one']);assert.deepEqual(Object.values(moved.buckets).find(x=>x.date==='2026-03-09').assignmentIds,['two']);
});
test('remove previews an unscheduled unit, out-of-range moves do not invent visible dates',()=>{
 const next=previewCalendar(seed(),[{kind:'assignment.remove',storyId:'a',assignmentId:'one',expectedRevision:4}],'request','uncertain');
 assert.equal(next.assignments.length,1);assert.equal(next.unscheduledUnits.at(-1).pending,'uncertain');assert.ok(next.unscheduledIds.includes('a'));
 const moved=previewCalendar(seed(),[place({storyId:'a',assignmentId:'one',date:'2026-04-01'})],'request');assert.equal(moved.assignments.length,1);assert.equal(Object.keys(moved.buckets).length,1);
});
test('unavailable anchors, deleted assignments and unsupported mixed mutations have no speculative view',()=>{
 assert.equal(previewCalendar(seed(),[place({beforeAssignmentId:'deleted'})],'r'),null);
 assert.equal(previewCalendar(seed(),[place({assignmentId:'deleted'})],'r'),null);
 assert.equal(previewCalendar(seed(),[place(),{kind:'story.patch'}],'r'),null);
});
test('individual format preview never removes whole-campaign planning state',()=>{
 const next=previewCalendar(seed(),[place({unit:'format',format:'feed'})],'r');assert.deepEqual(next.unscheduledIds,['c']);assert.deepEqual(next.legacyWeekdayIds,['c']);assert.equal(next.unscheduledUnits.length,1);
});
