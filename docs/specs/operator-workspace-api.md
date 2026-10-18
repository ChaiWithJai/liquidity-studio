# Shared operator workspace API foundation

This is the backend foundation for #66 and #67. Table, board, dated calendar, accessible direct manipulation, saved-view controls, and detail-context UI acceptance remain downstream. This change does not complete #70 or #71, publish to Instagram, approve sources, or enable an agent to bypass a human's authorization.

## Authority and storage

Every endpoint uses the existing signed-in principal and organizationId/brandId query scope. Current membership is checked on each operation. UI preset names grant no authority. Stories remain the existing scoped backlog records; query rows are projections, not copied databases. Title/category edits change queue metadata, not generated artwork text or source claims.

Assignments, order buckets, events and receipts commit together in the existing scoped repository transaction (SQLite locally, the existing async transactional store contract remotely). Saved views are in a separate organization/brand key, private to their creator by default; explicitly shared brand views are visible to current brand members. A shared view can be changed by its owner or a current founder. A founder cannot read somebody else's private view through this API. View definitions and identity grants are separate.

No database migration or network dependency is required. The API works with the existing Google session; isolated tests explicitly use the existing local-development password adapter. No live runtime or cloud configuration is changed by this PR.

## Query and views

All routes begin `/api/studio/workspace`. JSON objects reject unknown fields.

- `POST /query`: `{filters?,sort?,groupBy?,columns?,limit?,cursor?}`. Returns `{schemaVersion:1,rows,total,filteredTotal,groups,queryRevision,nextCursor,definition}`. Page size 1–100. The opaque cursor binds the normalized query, scope and visible row snapshot; intervening relevant changes produce 409. This is bounded pagination of the existing aggregate repository, not a claim of unbounded database scaling.
- Filters: `search`, `statuses[]`, `sourceReadiness:'ready'|'blocked'|'any'`, `assigneeIds[]` (null means unassigned), `formats[]`, `dateFrom`, `dateTo`, `exported:boolean`. Readiness means source approval eligibility, not factual confidence. Format availability means a saved format exists; planned format assignments are separate.
- Sort: at most three `{field,direction:'asc'|'desc'}` entries. Fields: title, category, status, revision, plannedDate, assigneeId, exportedAt. Stable story ID breaks ties.
- Columns: title, category, status, sourceReadiness, assigneeId, formats, plannedDate, exportStatus, revision. Group by status, sourceReadiness, assigneeId or plannedDate.
- `GET /stories/:id`: `{story,row}` within the active scope.
- `GET /members`: `{members:[{id,displayName,role}]}` for current brand assignments. No credentials or sessions are returned.
- `GET /views`: `{views}` visible, nondeleted definitions.
- `POST /views`: `{idempotencyKey,name,sharing?:'personal'|'brand',definition?}` creates a view.
- `POST /views/:id`: `{idempotencyKey,expectedRevision,name?,sharing?,definition?}` updates it.
- `POST /views/:id/delete` or `/restore`: `{idempotencyKey,expectedRevision}` soft deletes/restores it. Revisions always increase; stale writes return 409. At most 100 retained view definitions and 8 KiB per submitted definition. Do not save page cursors in a view.

## Mutation envelope

`POST /mutations` accepts `{idempotencyKey,changes:[...]}`. Keys are UUIDv4. Select 1–25 changes, at most one per story per request. Required common fields are `kind`, `storyId`, `expectedRevision`. Structural envelope errors return 400. Authorized structurally valid changes return `{operationId,outcomes:[{storyId,status:'applied'|'conflict'|'rejected',row?,code?,message?}]}`; one rejected item does not erase another successful item or partially change its own order bucket.

Supported changes:

- `story.patch`: `patch:{title?,category?,assigneeId?,status?}`. Assignee must be null or a current brand member. Manual statuses are In Backlog, Ready for Campaign (approved claims required), or Draft Ready (saved campaign required). Exported and dated-campaign status are derived and cannot be downgraded here. Source approvals, clinical review, campaign text, exports and publication are not allowed fields.
- `assignment.place`: `unit:'campaign'|'format'`, `format` required only for a format unit, `date:'YYYY-MM-DD'`, `timeZone` IANA name, `targetBucketRevision` (0 for a new bucket), `beforeAssignmentId` (null/omitted appends). Moving/reordering an existing assignment also requires its `assignmentId`, `expectedAssignmentRevision`, and `sourceBucketRevision`. The server generates new assignment IDs. Unit cannot change; there is at most one active assignment for each story/campaign or story/format slot. Supported formats: infographic, carousel, story, reel. A format plan does not claim an artifact exists.
- `assignment.remove`: `assignmentId`, `expectedAssignmentRevision`, `sourceBucketRevision`.
- `legacy.schedule`: `scheduledDay` Monday–Sunday. This remains an explicitly undated weekday; it does not infer a current week/date. Remove an existing dated campaign assignment first. Format-only plans do not silently move the whole campaign.

Calendar order belongs to a `(canonical timezone,local date)` bucket with an integer revision and ordered assignment IDs. Concurrent reorder/placement with a stale bucket revision conflicts rather than overwrites. A date is a local all-day date, not a UTC timestamp: March 8 and November 1 remain those dates across America/New_York DST boundaries. No time-of-day or DST fold resolution is invented. Dated campaign placement updates the compatibility weekday and Scheduled state; a format-only placement does not change the campaign's undated weekday. Exported status stays tied to actual exports. Assignment is not publication.

`GET /calendar?startDate=...&endDate=...&timeZone=...` returns assignments and bucket revisions for that zone/range, campaign-unassigned rows, explicit `unscheduledUnits` (campaign and format slots), and separate `legacyWeekdays`. The existing Monday stacking remains intact until explicitly moved. The backend supports same canonical contract for keyboard, pointer, touch and helper actions; input and accessibility UI remain downstream acceptance.

## Receipts and undo

The mutation key, actor, exact submitted payload hash and results are persisted atomically. Replaying a retained identical key returns the original receipt; changing actor or payload returns 409. Receipts retain at most 20 operations and approximately 1 MiB; they are a bounded retry/undo window, not a permanent deduplication registry.

`GET /operations` returns retained receipts for the current actor (or all brand receipts for a current founder), with outcomes and a conservative canUndo hint. It never returns undo snapshots. `POST /operations/:operationId/undo {idempotencyKey}` is a compensating action by the original actor or a current founder, with current brand access. It rejects any affected story revision or calendar-order change after the operation. This conservative guard can reject undo after an unrelated calendar edit; it never overwrites newer work. Restored stories, assignments and order buckets advance revisions; revisions are not rewound. Repeating the same undo key returns its result. Audit events are bounded to 500 entries, and assignments to 1,000 retained records. Existing Firestore aggregate size limits still apply; this is not a high-volume storage redesign.

Portable ejection includes validated assignment/order/history data but excludes operation receipts and undo authority. Explicit scope remapping changes assignment ownership and clears imported assignees instead of granting membership. Saved views live outside the portable story payload and are not transferred as identities or permissions; full local SQLite backups retain them. A customer-portable saved-view transfer UI is not implemented here.

## Existing scheduler compatibility

`POST /api/studio/schedule` now requires `{storyId,status:'Scheduled',scheduledDay,expectedRevision,idempotencyKey}` and invokes the same durable workspace mutation path. Published or missing-revision requests fail closed. The existing App function captures story/scope/day/revision before awaiting, preserves newer local editor text, and ignores late scope/story responses. The explicitly trusted in-memory contract-test adapter remains a nonproduction compatibility branch; its revision check is not evidence of durable receipts.

## History, validation and rollback

The imported prototype `9d8e5f0` introduced the App weekday assignment handler. Scoped persistence commit `ba1ef0f` introduced the current HTTP schedule branch; the revision-less update survived subsequent scope and source-review changes. The route allowed Published and lacked expectedRevision/idempotency, so it could bypass newer conflict-aware editing. The new foundation closes that HTTP path while preserving an explicit undated assignment flow. Historical deployed-image state is not inferred from unrelated checkout labels.

Validation includes real ephemeral HTTP auth/scoping, partial outcomes and replay, foreign brand/member denials, current-membership revocation, private/shared views, SQLite close/reopen, simultaneous date-bucket placement, both DST transition dates, undo conflict/revision monotonicity, and portable remap without undo grants. An actual Chromium flow delays a schedule response, types a newer headline, then saves/reloads that headline and weekday. No production provider or cloud service is invoked by these tests.

Rollback: revert this source/build commit and restore the prior application image; no external resources were provisioned. Existing added workspace keys are additive and can remain dormant. A rollback also restores the older unsafe scheduler contract, so prefer a forward fix if production clients already use revisions. Do not delete user records or reset the database to roll back UI code.
