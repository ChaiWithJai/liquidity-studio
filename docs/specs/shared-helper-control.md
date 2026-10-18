# Revision-aware shared human and helper control

Module: operator-workflow. Tracks #70; depends on #66, #67 and #68. This is a prospective specification, not evidence of a working helper or model benchmark. The existing workspace API and bounded mutation receipts remain the content authority.

## Objective and assumptions

A founder or marketer can inspect a bounded helper proposal, grant a specific set of metadata/calendar actions, observe progress, and pause or take over without losing their current editor, focus, or unsaved text. Two authorized actors may work in one brand; concurrent content changes must conflict visibly. The helper uses the same domain actions and source prerequisites as humans.

The pilot has explicit organization → brand membership. No recursive authority inheritance is assumed. A browser helper is a client, not a new global administrator. A model output, screenshot label, browser tab, actor display name, or local storage value grants no authority. Existing Google session authentication remains responsible for principal identity. No new user credential database or model provider is introduced by this capability.

## Existing authority and history

PR79 introduced scoped WorkspaceService, typed story/assignment mutations, expected revisions, actor-attributed receipts and compensating undo. PR84 shares canonical story projections across table, board and calendar, captures editor opening revisions, and preserves local buffers when shared content advances. Those primitives are necessary but do not provide delegation, presence, proposal approval, or pause/takeover. Existing receipt retention is bounded; it cannot establish permanent exactly-once execution.

## Action boundary

An action consists of authenticated actor, explicit organizationId and brandId, stable story ID, expected story revision, typed change, applicable assignment/bucket revisions, preconditions, proposal ID, grant ID/epoch, and UUID idempotency key. The server derives the actor and current permissions from authentication. Client-supplied actor/role/scope substitution is rejected.

Initial allowed actions are existing story.patch metadata and assignment.place/remove. Source approval, clinical review, content generation, publication, billing, identity changes and external messaging are outside this grant. A helper must not turn a plan into an export or publication receipt. The existing server validates status/source eligibility and assignment invariants at application time.

A proposal stores exact typed changes and bounded before/after projections sufficient for review. It records observed story/bucket revisions and server observation time; screenshot dimensions/hash/time may be evidence metadata, never authorization. Unknown fields, unsupported action kinds, duplicate story changes and missing revisions fail closed. At most 25 stories and a short explicit expiry are permitted in one grant; no unbounded autonomous session is implied.

## Shared state and atomicity

Persist grants, proposal state, claim epochs, bounded audit and application receipts in the same scoped repository transaction as affected stories/calendar. Do not use an independent read-then-write grant check. Extend the domain service through a private transaction precondition so checking current grant epoch/status, consuming an accepted proposal, mutating domain records and recording its receipt are atomic. Ordinary human API contracts remain unchanged.

Grant states are active, paused, stopped, expired and completed. Pause/takeover increments its epoch; an in-flight response from an older epoch cannot commit. Taking over does not rewind prior accepted edits. Resuming is explicit, renews the epoch, and requires a fresh proposal against current revisions. A transport timeout is unknown, not a rejection; retry the identical key and recover the persisted receipt. A new action cannot silently replace an unresolved intent.

Current brand membership is checked for both grant owner and executing principal on each request. Owner revocation or helper revocation prevents further work. Expiry is enforced by server time. Durable #71 jobs may consume an explicitly authorized plan through their own current-principal reauthorization, but a job must not inherit a browser session token, stale role snapshot, or an unrestricted helper grant. No credentials are serialized in proposals, history or portable exports.

## Personal state and presence

Search, filters, selected view, active story/format, scroll, keyboard focus and editor buffers remain per-client personal state. Shared content events invalidate/reconcile canonical entities; they do not invoke selectStory, change the human route, or focus a helper target. A clean editor can adopt the full new entity; a dirty editor retains its original base revision and offers an explicit reload/discard path after conflict.

Presence is an expiring heartbeat stating actor, client kind, selected entity and last observed revision. It is advisory and labelled last seen when disconnected. It is not a lock, proof of active editing, or an authority grant. Rejoining reads current grant/proposal/receipt state; it does not replay queued navigation or claim lost work succeeded.

## UI and evaluation

Show helper identity, granted scope/items/actions/expiry, proposal before/after diff, affected count, current state and last acknowledged receipt. Provide pause, stop, takeover and explicit resume controls with keyboard-visible focus. Show conflict/rejection per item and link to the current entity without stealing focus. Reuse bounded compensating undo only when its revision guards hold.

Evaluate two authenticated actors, separate browser contexts, one shared story revision, and a second brand negative control. Include human unsaved editing while a helper changes metadata/date, stale screenshot and stale proposal, malformed/foreign IDs, current membership revocation, pause while application is pending, lost response/retry, worker or browser reconnect, and undo after intervening change. Capture action/result pairs and actual request/receipt/revision evidence. No repeated unscoped Open story locator is sufficient evidence.

Bonsai 2B is an unselected candidate. Do not claim vision support or fit from a name or parameter count. A bounded evaluation records task success, malformed action rate, stale-observation detection, p50/p95 latency, corrections, human interventions, memory and browser/device constraints. A deterministic scripted helper can verify the action protocol before any model is selected; it does not establish model competence. Compare tiny vision candidates only through the same bounded task corpus and primary model/runtime documentation.

## Delivery and commands

Source: liquidity-studio/server for grant/proposal authority and HTTP tests; liquidity-studio/src/lib for controller state; liquidity-studio/src/components for shared-control UI; liquidity-studio/tests for isolated real browser workflows. Keep the shared UI integration coordinated with #69 and the #71 jobs pane.

Build from liquidity-studio: `npm run build`. Run Node contracts with `node --test server/*.test.js`. Run configured Chromium workflows with the repository Playwright configuration and an isolated fixture port/output directory; do not point tests at live Google users or production data. Exact new test names/commands must be recorded with the implementation before PR publication. Use official Svelte MCP documentation and autofixer for all changed Svelte components.

Ship a vertical slice: scoped proposal and grant authority → actual UI diff/approval and typed application → pause/takeover/rejoin → two-actor browser evaluation. Each checkpoint requires actual server state and browser evidence. No source-only or schema-only closure. Preserve current image/data for rollback; added grant state can remain dormant if the UI is reverted.

## Completion evidence required

The ticket remains open until a tested interaction/state implementation and bounded evaluation are published; two actors demonstrably cannot overwrite the same revision; helper work demonstrably leaves human focus/editor intact; pause/takeover and connection recovery are observable; stale screenshot/action checks work; and versioned canonical evidence preserves the original annotations. Human usability, model quality, real customer collaboration and screenshot simulation are separate claims.
