# Dated calendar component

This component supplies the #67 calendar surface for the combined #66/#67 workspace. Its isolated acceptance fixture renders the real component with the shared workspace client and authenticated, ephemeral HTTP/SQLite backend. It is not a second application database, an external editor, a publication integration, or evidence of a deployed pilot change.

## Integration contract

`src/components/WorkspaceCalendar.svelte` accepts `client`, `scopeKey`, `onOpenStory(storyId)`, and `onReceipt(receipt)`. The App owns the shared client and current identity/scope, pending-editor guards, navigation and the full story view. Recreate/dispose the client on session/scope changes. An Open story callback should resolve the current full DTO through that client and use the existing source-review/edit workflow; opening an undated story must not manufacture a date first.

The component reads `$client.entities`, normalized calendar assignment/order data, `unscheduledUnits`, `legacyWeekdayIds`, operations and mutation state. It never keeps another copy of story content. Its own state is limited to viewport preferences, focus, transient placement intent, interaction feedback and the last calendar operation ID. Session preferences are keyed by the supplied actor/scope key, separate from shared content. Selection/drag intent and late messages are discarded when scope changes.

All changes use the existing shared client's `mutate`, `undo` and same-key `retryOperation` methods, backed by the #79 revision/idempotency contract. The server remains authoritative for membership, source review, revisions, order and receipts. The shared client must force-refresh assigned story details on calendar reload; otherwise locally matching cached row/full revisions can both be stale after another actor's edit.

## User operations

- The range and IANA timezone are explicit. Dates remain local all-day dates, including both America/New_York DST transitions. The range is limited to 31 displayed days. No UTC midnight or current-week date is invented for a legacy weekday.
- Dated campaign and individual-format plans are distinct units. Format plans do not assert artwork exists. Existing undated Monday–Sunday plans remain separately labeled until explicitly moved. The unscheduled pool does not duplicate those undated campaign cards.
- Every unit has distinct Open story and Move controls. Assigned stories also open from the date card. Move can be completed through the date/position form, a pointer/touch handle, or keyboard lift/drop. Choosing a destination outside the visible range opens that week for review.
- Handles support Space to lift, left/right to change date, up/down to choose order, Enter/Space to save and Escape to cancel. Earlier/Later controls offer another keyboard/touch path. Pointer/touch dragging uses the same captured intent and API command. Focus returns to the logical unit after a saved move/reorder or cancelled form.
- Source story, assignment and source/target order revisions are captured from the reviewed snapshot. Conflicts preserve newer work. Explicit reload closes the stale move proposal so it can be reopened against current revisions.
- Lost responses show an unknown-outcome message. Retry reuses the original idempotency key; it does not create another placement. Undo is the server's guarded compensating action, not a local array reversal.
- The full week fits its available desktop width. At component widths of 900px or less, the same order is presented as an agenda; it is not a second state model. Mobile targets have at least 44px minimum height. Range/unit controls and live announcements remain native keyboard controls.

Planning does not approve a source, generate content, export an artifact or publish to Instagram. The server rejects unsupported bulk/source/publication actions. The UI contains no confidence score or fabricated engagement metric.

## Evidence and boundaries

Seven real Chromium journeys cover: legacy-to-date placement, campaign/format separation, reload/undo; keyboard and pointer reorder/focus, actual external-edit conflict and recovery; native touch input and touch drag/reorder, brand-scoped preferences; a lost HTTP response followed by exactly-once retry; delayed old-brand responses; available-width/agenda behavior; and opening legacy/unscheduled stories without a dated assignment or source approval. Native touch events are dispatched through Chromium's input protocol, not by replacing application handlers or mutating DOM styles.

Two Node tests exercise civil-date/DST arithmetic and immutable reviewed revisions. The shared client's own real HTTP regression covers forced refresh of assigned story details. Official Svelte MCP reports no issues. Scope lifecycle effects intentionally clear local interaction state; they do not derive or mutate shared story content.

The fixture uses explicit test-only local auth, random credentials, a fresh SQLite file per test and a loopback ephemeral listener. It seeds unreviewed source notes and makes no paid provider call. Vite's cache is private to the fixture and is removed with its database; no new dependency install is required. Production Google sign-in remains unchanged. The fixture routes are served only by the test server and are not added to the production HTTP router or built entry.

Supplementary screenshots and hashes are under `docs/design-review/issue-67/2026-10-18`. They distinguish viewport from full-page pixel dimensions and automated task evidence from unknown human usability. These component captures do not replace the canonical integrated S06 calendar-overview and S07 calendar-to-source-review journeys, originally captured at 1280×720. The combined App must record those versioned after captures and complete independent acceptance before an issue-closure/deployment claim.

## History and rollout

The imported prototype `9d8e5f0` supplied the original weekday/calendar navigation. #79 added scoped dated assignments and a revision-checked mutation path while preserving existing stacking. This component projects those same records through the shared #66 client; the combined App integration is the downstream dependency. No existing runtime, database or cloud resource is changed by adding the component source.

Rollback is to the previous application image/source projection. Dated assignment records can remain dormant; do not delete user data or convert dates back into invented weekdays. Existing backend authorization and mutation checks continue to apply even if the UI changes.
