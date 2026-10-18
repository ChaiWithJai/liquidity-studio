# Native editor identity and tenant access: Phase 2 plan

Status: proposed for human review, 2026-10-18. Planning only. No implementation, task execution, identity migration, native authentication, service start or build was performed. Module: `identity-tenant-access`. Tracker: [issue 52](https://github.com/ChaiWithJai/liquidity-studio/issues/52). Slice IDs below are planning references, not completed tasks or new issues.

The [specification](../../../specs/identity-tenant-access-native-editor.md) records the later human approval. The [boundary audit](../../../../liquidity-studio/docs/investigations/52-native-command-boundary-audit.md) distinguishes existing native APIs from missing hooks. Baseline Studio source: `1d50c94`; native Penpot 2.18.3: `ff7a66f51938b2293260ea27a64e2c4e0833b5e3`. Preserve the separate Issue 56 root tasks. Doory evidence and its distribution hold remain separate.

## Delivery and dependency order

Deliver a current founder and marketer using their own paired native profiles, with a native team for each governed brand. Ordinary editors must not inherit an operator owner. New requests must deny after durable Studio revocation; affected live subscriptions must be server-fenced within five seconds. Existing work and unrelated authorized brands must remain usable.

Order: A0 → A1 → A2 → A3 → A4 → A5 → A6 → A7 → A8. Each slice includes its own API, visible state and verification. Stop for review at checkpoints; do not enable an incomplete boundary. Split a slice further if it exceeds about five implementation files or a focused session. Test files and evidence follow each slice rather than a final horizontal testing phase.

### A0. Show a preservation and access inventory

Read fixed operator configuration and native ownership to show an authorized founder a sanitized inventory and explicit migration disposition. Keep the detailed inventory and backups private.

- Inventory teams, projects, files, fonts and variants, libraries, image bytes, shares, invitations, public aliases and organization-owner fallback. Classify governed work separately from personal/operator work.
- Record original IDs, revisions, hashes and consistent asset-aware backup references. Unknown ownership blocks activation without moving or deleting anything.
- Show “Not connected”, “Needs review” and preservation decisions without exposing cookies or operator credentials.

Likely files: existing `penpot-local-configuration.js`, new `native-access-inventory.js`, new `NativeAccessPanel.svelte`, existing `index.js`, focused inventory tests. Verification: hosted strict DTO/current-founder tests; later Neo read-only inventory against owned fixtures and independent backup review. Depends on: none.

### A1. Connect two actual human native profiles

Add a narrowly authenticated, single-use pairing handshake and its visible connect/revoke state. A native-authenticated endpoint proves the native profile while the existing verified Studio session proves the Studio actor. Matching names or email addresses is never proof.

- Bind challenge to actor, verified session context, native instance, expiry and single use. Proposed bounds for review: 120-second lifetime and at most two pending challenges per actor. Store no Google JWT, refresh token or native cookie in public records or portable packs.
- Obtain native identity from authenticated native `get-profile` or a narrow authenticated pairing hook, never a browser-supplied profile ID or operator substitution. Fixed private service authentication and its exact DTO require review before coding.
- Connect founder and marketer as distinct profiles; stale scope/logout, wrong actor, replay and expired challenge cannot mount ready state. Preserve dirty editor buffers and deliberate focus.

Likely files: new `native-access-pairing.js`, identity verified-context seam, native pairing hook, `NativeAccessPanel.svelte`, focused pairing tests. Verification: hosted nonce/session/expiry negatives and official Svelte MCP; later Neo two actual profiles, wrong-session and friendly-email negatives. Depends on: A0.

Checkpoint 1: review actual native identity proof, verified Studio context and private handshake before introducing grants. Current Google authentication returns actor fields, not an existing session ID suitable for this contract. Add a narrow verified context or server nonce; do not assume such a field already exists.

### A2. Open one governed brand without owner fallback

Create an acknowledged native membership projection and deliver one usable editor path, including private fonts/images. Use native teams and edit roles rather than one shared team with separate projects.

- Store immutable scope/profile/team binding, monotonic grant epoch and pending/current/revoked state. Identity changes and reconciliation outbox must commit atomically through existing storage transactions. Pending or failed reconciliation denies access.
- Add a narrow native conditional-epoch reconciliation hook where ordinary membership RPC lacks compare-and-set. Old workers must not overwrite a newer revocation or regrant. Keep authorization state outside editable document/team properties and portable content.
- Show pending/error/current state and prove paired human read/save plus private font/image delivery. Update `penpot-media-authorization.js` only for the verified governed-pairing mode: its current owner-profile equality cannot serve distinct humans. Preserve explicit legacy operator administration separately.

Likely files: native access service, existing identity membership mutation, pinned native reconciliation hook/migration, private media authorization, access panel. Verification: hosted transaction/replay/reordered-worker tests; later Neo actual native edit/save and font/image access as paired human. Depends on: A1. Hook patch and migration receive independent review before activation.

### A3. Separate both brands and deny foreign resource paths

Extend the same path to a narrower marketer, founder with both brands and a third tenant. Native ownership resolution remains the basis for file/project/team/thread/library access.

- Resolve registered immutable resource parents through shared native permission helpers. Apply current Studio grant admission as well as native ACLs, including aggregate lists, tokens, comments and asset/export reads.
- Deny unknown, transferred, imported, encoded or alternate resource paths. Check direct native origins and backend aliases; a protected UI origin alone is insufficient.
- Keep brand B usable when brand A is denied. Ordinary paired profiles cannot retain native organization-owner viewer fallback on the governed surface; preserve the separate operator account untouched.

Likely files: native access admission service, pinned native permission helper patch, private media adapter, access panel, focused isolation tests. Verification: hosted ownership/DTO negatives; later Neo two profiles × two brands plus third-tenant matrix, including native comments/tokens/aggregate lists and assets. Depends on: A2.

### A4. Make public sharing and membership changes visibly unavailable

Governed brands begin with public sharing off. An ordinary editor cannot extend access through invitations, libraries or a move to another team.

- Inventory and fence existing share-link reads as well as future creation; enumerate invitation, membership, library-publication and move/copy aliases before enablement.
- Add only the missing narrow native policy hooks. Operator administration is explicit and separate; no wildcard file grants or full arbitrary RPC/WS relay.
- Explain the governed sharing restriction in the native/Studio UI while preserving personal work and previously downloaded bytes.

Likely files: pinned share commands, pinned membership/library policy seam, access service, access panel, focused share tests. Verification: hosted route/resource negatives; later Neo existing link reuse, foreign viewer/comment IDs and attempted invitation/publication deny. Depends on: A3.

Checkpoint 2: independent security review of the full command inventory, asset path, existing shares and direct aliases. If a required command lacks a safe narrow hook, keep capability off and review the gap rather than silently proxying every command.

### A5. Revoke current requests and server-fence open subscriptions

Commit Studio revocation and its monotonic grant epoch before reporting success. Every new governed request consults current authority without a cross-request positive cache. Reconciliation alone is insufficient because it can be delayed.

- Reauthorize before remote side effects/commit where available. Record the accepted remote commit boundary; do not promise to undo a write already accepted across independent databases.
- Add a narrow server-side native subscription lease/fence hook. It must cover file/team messages and pointer writes, discard affected queued events and fence even when a client ignores UI notifications. Keep other authorized subscriptions usable.
- Proposed timing budget: renew at most every two seconds, lease at most four seconds, authority lookup deadline at most one second; unavailable authority denies renewal. These are implementation proposals requiring actual protocol/load measurements, not established guarantees.

Likely files: membership/access service, pinned native permission hook, pinned websocket hook, panel revoked state, focused revocation tests. Verification: hosted delayed reconciliation/authority-outage cases and later actual Neo hostile subscription measurement described below. Depends on: A4.

### A6. Expire, reconnect and recover without losing human edits

Pairing/integration expiry and native session validity must be separate explicit conditions. On expiry or revoke, disable online writes/assets/export and retain local unsaved work; reconnect must require current authority rather than silently selecting a new base.

- Native logout, Studio SDK sign-out and global native session invalidation are different operations. Do not claim existing Google logout invalidates the native session automatically.
- Prove natural expiry of the actual governed session/lease and an already-open subscription. Upstream cookie age alone is not server-session or socket expiry proof. If native expiry needs a narrow hook, review it explicitly.
- Surface conflict, expired and retry states without owner fallback, focus theft, stale read adoption or silent new revision. Preserve exact same-intent recovery where a result is uncertain.

Likely files: access service, pinned native session hook if required, panel/client lifecycle, `PenpotPanel.svelte` integration, focused lifecycle tests. Verification: hosted stale logout/scope/expiry results; later Neo natural elapsed expiry, disconnect/reconnect, dirty-buffer and unrelated-brand continuity. Depends on: A5.

Checkpoint 3: verify the five-second bound, natural expiry and preservation before preparing any maintained migration. Failure keeps the capability disabled; changing the bound requires review.

### A7. Migrate by owned copies with reversible activation

Create an explicit inventory-based migration plan, not a silent move. Copy approved governed files and required fonts/assets/libraries into separate brand teams with new native IDs, retaining originals and exact mappings.

- Compare current membership, original revisions/hashes and namespace inventory before each write and final activation. Human edits or unknown work abort. Journal only newly owned resources and immutable object generations.
- Resume with the same migration/epoch; rollback deletes only newly created owned resources after current ownership checks. Never restore revoked grants, delete personal work or demote the existing operator owner.
- Preview disposition and current progress in the founder UI. A failed migration leaves originals and backups usable, with no credentials or live grants carried through portable recovery.

Likely files: migration planner/service, owned native adapter, access panel, migration tests, sanitized evidence manifest. Verification: hosted concurrent-edit/crash/replay/rollback negatives; later Neo import/copy, exact human text/font/image preservation, interrupted reconcile and owned-only rollback on disposable work. Depends on: A6.

### A8. Release the measured boundary, with explicit rollback

Keep default-off configuration until the full actual matrix passes and independent review accepts the pinned patches. Roll out only a reviewed configuration and mappings; public Studio/native licensing boundaries remain unchanged.

- Verify two distinct actual paired identities, two brands and a third tenant across every spec acceptance group. Controlled QA proof must be labeled separately from maintained Google proof; never disable managed user accounts for QA.
- Record source/native patch hashes, dependency locks, licenses, backup references, measured resource/latency results and explicit residual limits. Doory remains independently unproven by Penpot results.
- Revert activation to denied/pending state first, then restore owned configuration/mappings if safe. Preserve originals, journals and backups. Rolling back code must not reactivate an old grant epoch.

Likely files: feature configuration, deployment/runbook, matrix manifest, native patch provenance, focused release tests. Verification: exact hosted gates, independent source review, serialized Neo acceptance and reviewed asset-aware rollback drill. Depends on: A7.

## Exact native seams and unresolved risks

Pinned upstream references:

- [File permissions](https://github.com/penpot/penpot/blob/ff7a66f51938b2293260ea27a64e2c4e0833b5e3/backend/src/app/binfile/common.clj#L319-L389): native file/project/team paths require current governed admission in addition to ACLs.
- [Team membership](https://github.com/penpot/penpot/blob/ff7a66f51938b2293260ea27a64e2c4e0833b5e3/backend/src/app/rpc/commands/teams.clj#L958-L1018): ordinary removal retains organization-owner fallback; these commands do not establish epoch-conditional reconciliation.
- [Shares](https://github.com/penpot/penpot/blob/ff7a66f51938b2293260ea27a64e2c4e0833b5e3/backend/src/app/rpc/commands/files_share.clj#L18-L74): native editor powers require an additional governed sharing policy.
- [Websocket lifecycle](https://github.com/penpot/penpot/blob/ff7a66f51938b2293260ea27a64e2c4e0833b5e3/backend/src/app/http/websocket.clj#L84-L214): existing subscription checks do not establish the approved live revocation bound.
- [Session functions](https://github.com/penpot/penpot/blob/ff7a66f51938b2293260ea27a64e2c4e0833b5e3/backend/src/app/http/session.clj#L187-L217): internal invalidation functions are not evidence of an existing selective public disconnect API.

The private pairing callback, native epoch storage and current-authority hook contracts need review before implementation. Native fonts are team-owned; a file copy without font variants/library remapping is not preservation. The existing operator-based private asset check must not be loosened globally. An asynchronous ACL mirror cannot guarantee immediate denial by itself. No cross-database atomicity or revocation of downloaded bytes is promised.

## Measurement and resource admission

Use existing owned native services and one Neo profile, with no extra cloud resources or browser processes. Before each later operation, record host/VM free disk and memory, current service RSS, database and asset backup space. No inference, video export or other team's render may overlap. Stop on the reviewed memory/disk threshold; do not raise limits automatically. Record baseline native PostgreSQL/Redis/backend/frontend cost separately from incremental authorization cost. This plan does not claim the native stack fits the Studio 512 MiB Cloud Run profile.

Inventory actual subscription/control frame sizes before selecting final byte/topic limits. Proposed admission review starts with eight active governed sockets per process and four topics per socket; these numbers are not valid protocol guarantees until verified. Bound pairing receipts, active leases, concurrent authority calls and journals. Hosted load checks must show saturation denies safely and releases resources on abort. Record observed p50/p95/max latency, sample interval and largest sampled RSS, without calling a sample the true peak.

For the five-second gate, capture one monotonic observer timestamp before the durable revoke transaction and one after commit. Receive a server acknowledgement only after affected subscriptions and pending event queues are fenced. The elapsed time from transaction start to received acknowledgement is a conservative upper bound, including transaction/network delay. Do not start timing at a later browser response. Publish bounded QA sequence markers and attempt protected requests on a client that ignores UI notifications. Record every trial, last delivered marker, server fence acknowledgement and unrelated-brand continuity. Any request received after the commit observation must deny; separately document in-flight accepted writes. Test authority failure, slow reconciliation and natural session expiry as well as normal revoke. Fake-clock hosted tests supplement, never replace, actual elapsed-time proof.

## Verification and review gates

Later hosted verification from `liquidity-studio/` uses the existing workflows: `NODE_ENV=test AI_ALLOW_SYNTHETIC=true node --test server/*.test.js`, `npm run test:backwards`, `npm run qa:loop`, and canonical `NODE_ENV=production npm run build`. Add focused native access tests with each slice and official Svelte MCP after component changes. No local test runner is authorized under the current Neo-only constraint. Upstream hook verification requires its own pinned hosted contract/build review; existing Studio CI does not prove a running patched native server.

Later actual Neo acceptance must use owned disposable grants and authorized native profiles, one authenticated fixture writer at a time. Capture actual read/save/tokens/comments/lists/room subscriptions/assets/export/share outcomes, source and revision IDs, denied third-tenant imports, dirty buffer survival and preservation hashes. Do not substitute mocked identity, raw API rollback or a frontend notification for the requested native UI journey. Record pending or failed criteria honestly and leave issue 52 open until its full scope is met.

Phase 2 ends with human review of this plan. Addy's spec-driven workflow separates PLAN → TASKS → IMPLEMENT; this document does not authorize the next phase. Issue 52 remains the existing task source of truth. After approval, instantiate the reviewed slices there without overwriting Issue 56 tasks.
