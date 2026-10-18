# Native editor identity and tenant access: Phase 2 plan

Status: human-approved for implementation, 2026-10-18. The human approved the revised plan and explicitly authorized its issue-backed task breakdown and implementation without further planning approvals. Implementation and actual acceptance are tracked in [issue 52](https://github.com/ChaiWithJai/liquidity-studio/issues/52); approval does not establish completed native access. Module: `identity-tenant-access`.

The human-approved [specification](../../../specs/identity-tenant-access-native-editor.md) is unchanged. The [boundary audit](../../../../liquidity-studio/docs/investigations/52-native-command-boundary-audit.md) distinguishes native APIs from missing hooks. Current Studio baseline is PR201 merge `0f1c21d`, including the customer Create/Open flow from PR197 and the task/preview improvements from PR198/201. Native Penpot remains 2.18.3 at `ff7a66f51938b2293260ea27a64e2c4e0833b5e3`. Preserve the separate Issue56 tasks and Doory distribution hold.

## Customer outcome and delivery order

The first usable milestone is the founder and Nicole opening the **same Chai With Jai campaign design under their own distinct paired native identities**, editing, saving and reopening it. Nicole receives no finance grant. Use the existing Studio story, format selector and Create/Open/Resume action; do not make an inventory dashboard or legacy migration a prerequisite to useful design work.

The approved defaults remain: a separate native team per governed brand; current Studio membership as authority; separate operator administration; no ordinary editor owner fallback; public sharing off; denial of new requests after durable revocation; affected live subscriptions server-fenced within five seconds; natural expiry; preservation of personal work, originals and dirty buffers. Do not expose a partially protected editor while these safeguards are pending. A profile may show Connected earlier, but that is not permission to open governed work.

Delivery order: scoped CWJ connection and preservation → complete governed CWJ Create/Open/edit/reopen → finance and full issue52 acceptance. Each slice includes its customer state and relevant verification. The first CWJ activation includes sharing, current authorization, private assets, live fencing and expiry rather than deferring those protections until after editing is enabled.

### Proposed implementation units

These ordered units are authorized by the human review and recorded as tasks in issue52. Keep each unit to roughly three to five implementation files; split a native patch by its actual hook if it exceeds that scope. Each unit uses the hosted checks and actual Neo behavior below, rather than a separate test strategy.

| Unit | Visible outcome / acceptance | Likely files and dependency |
| --- | --- | --- |
| C1 · Connect | Two distinct verified pairings; wrong/expired/replayed pairing denies; existing work untouched | Pairing service, verified-context/native handshake seam, existing design action, focused checks. None. |
| C2 · Admit CWJ | Current CWJ native team/grant and private media work; pending/revoked grants and sharing expansion deny | Access service, native permission/share hooks, media authorizer, focused checks. C1. |
| C3 · Fence live access | Durable revoke denies new operations; existing native subscriptions fence within five seconds and natural expiry, preserving buffers | Native subscription/session hook, access lifecycle, existing design action, focused checks. C2. |
| C4 · Create/Open together | Founder and Nicole use the same CWJ file through existing CTA; native edit/save/reopen and exact-intent recovery preserve text/fonts | Story service, runtime authorization adapter, existing CTA, focused checks. C3. |
| C5 · Extend and release | Finance stays separate, third-tenant transfer gains no authority, unrelated-brand continuity and rollback pass the original criteria | Existing access/runtime configuration, relevant hook refinement, release notes and focused checks. C4. |

Review the exact pairing/native hooks after C1 before grant implementation. After C4, verify the complete CWJ journey and its safeguards before activation; C2 alone is not an editor release. After C5, review the remaining approved acceptance and rollback evidence before closing52. Optional legacy copying is a separately scoped preservation unit only when requested.

### 1. Connect the two people and preserve the chosen CWJ workspace

- Inspect only the intended activation's teams/projects, files, fonts, assets/libraries, existing shares/invitations, native owner fallback and direct access paths. Retain private IDs/revisions/hashes and consistent asset-aware backups. Leave existing operator/personal work and recently edited demonstration files untouched; unknown ownership blocks activation of that resource.
- Add a single-use, expiring pairing that proves the actual authenticated Studio principal and native profile. Bind it to the native instance and verified Studio session context. Matching names/emails, a caller-supplied profile ID and the shared QA1 owner are not proof. Proposed pairing bounds remain 120 seconds and at most two pending challenges per actor; no Google JWT, refresh token or native cookie enters public records or portable packs.
- Put Not connected, Pending, Connected, Expired and actionable error state beside the existing design action. Keep detailed preservation inventory private; no new general inventory panel/API is required for this milestone.
- Use a new CWJ team/project and verified team-local fonts for governed work. Do not move, delete or silently adopt existing personal/operator files. Any copy of existing work requires an explicit preservation disposition.

Reuse: current identity service, `editor-boundary.js`, fixed private native configuration and `PenpotDesignAction.svelte`. Add only the pairing/current-access service and necessary native handshake seam. Review the exact handshake and native hook contract before coding. Current Google actor fields are not an existing session ID; use a verified context or server nonce rather than assuming one.

### 2. Deliver the complete governed CWJ design path

- Reuse `penpot-story-design.js`: canonical source/content/brand fences, pure compiler, preallocated native UUID, durable idempotent intent, uncertain-response readback, revision checks and ready reopen that preserves native human edits. Both people must resolve the same brand design, not one duplicate file per actor.
- Separate the immutable administrative workspace owner/binding from the acting paired human. The current design identity hashes workspace authority, including owner and fonts; replacing that owner with each actor would lose same-file lookup. Keep human profile/session/grant epoch in authorization, outside editable file metadata and portable content.
- Replace the current founder-only customer read/create policy deliberately with current paired brand-edit authority. Workspace setup and access administration remain founder-only. Keep request receipts actor-bound, check current roles/membership before remote effects and final registration, and preserve managed Google requirements. Local password persona emulation is not Nicole's real identity.
- Persist immutable scope/profile/team mapping, monotonic grant epoch and pending/current/revoked state with the existing store transactions. Pending/failed reconciliation denies. Use native team edit roles without owner/admin invitation powers; stale reconciliation must not overwrite a newer revoke/regrant.
- Keep native ACL resolution for file/project/team/thread/library ownership. Add only missing pinned current-grant, conditional reconciliation, sharing and subscription hooks. An asynchronous ACL mirror alone cannot deny immediately. Review narrow hooks first; a general Transit/RPC/WebSocket gateway is a fallback, not the default architecture.
- Keep public sharing off, including existing-link reads, invitation/member expansion, library publication and move/copy escape paths. Check direct native/backend aliases, not merely the Studio UI origin. Preserve ungoverned personal work through its explicit disposition.
- Extend private media authorization only for a verified governed-pair mode. Retain current scope/hash/generation/no-store checks and the separate administrative owner path. Prove legitimate team-local fonts and private images work for both humans; do not substitute the operator cookie for their identity.
- Deny new reads/saves/tokens/comments/assets/subscriptions after durable Studio revocation. Server-fence affected file/team events and pointer writes within five seconds, including a client ignoring UI notifications. Unavailable authority fails closed. Natural governed-session expiry also fences existing subscriptions. Native logout, Studio sign-out and native global session invalidation remain distinct operations.
- Preserve dirty human buffers and report conflict/expired/retry states without selecting a newer base or replaying a mutation silently. A remote write already accepted across independent databases cannot be undone by claiming cross-database atomicity.

First-milestone Neo proof: both distinct actual profiles connect; founder creates a CWJ design; Nicole opens the same file, edits/saves and reopens it; founder sees the persisted edit. Check a foreign request and public-share denial, private font/image access, disposable CWJ revoke/live fence, natural expiry and deliberate current-grant restoration. No editing capability is enabled until these protections and independent hook review pass. Keep evidence explicitly local/controlled versus maintained Google.

### 3. Extend to finance and finish the existing acceptance

- Reuse the same path with a separate finance team: founder can use both brands; Nicole remains CWJ-only unless a deliberate current Studio grant changes. Check two actors, two brands and a third-tenant transfer across native documents, tokens, comments, aggregate lists, subscriptions, assets/artifacts and callbacks as required by the original issue. Imported metadata confers no authority.
- Revoke one disposable brand grant while the other remains usable. Reconciliation interruption/replay and rollback cannot revive an old epoch. Existing text, fonts, image hashes, legitimate saves/exports and source/native revisions remain preserved.
- If legacy files need migration, use reviewed owned copies with new IDs and explicit font/library/asset remapping after the new-campaign path works. Compare current revisions before copying and activation; changed human work aborts. Resume the same intent; rollback touches only recorded newly owned resources after ownership checks. Do not invent a full legacy migration when none is requested, or block new designs on moving every personal file.
- Keep activation default-off until the relevant boundary passes review and actual acceptance. Final issue52 closure requires every approved spec group, not the CWJ milestone alone. Doory remains independently unproved by Penpot results. Preserve public distribution/license holds and existing infrastructure.

## Native seams requiring review

- [File permissions](https://github.com/penpot/penpot/blob/ff7a66f51938b2293260ea27a64e2c4e0833b5e3/backend/src/app/binfile/common.clj#L319-L389) resolve native file/project/team grants; current Studio admission must also hold.
- [Team membership](https://github.com/penpot/penpot/blob/ff7a66f51938b2293260ea27a64e2c4e0833b5e3/backend/src/app/rpc/commands/teams.clj#L958-L1018) has owner fallback and no established conditional-epoch reconciliation contract.
- [Shares](https://github.com/penpot/penpot/blob/ff7a66f51938b2293260ea27a64e2c4e0833b5e3/backend/src/app/rpc/commands/files_share.clj#L18-L74) need the governed sharing policy in addition to native editor powers.
- [WebSocket lifecycle](https://github.com/penpot/penpot/blob/ff7a66f51938b2293260ea27a64e2c4e0833b5e3/backend/src/app/http/websocket.clj#L84-L214) does not yet establish the five-second server-side fence.
- [Session functions](https://github.com/penpot/penpot/blob/ff7a66f51938b2293260ea27a64e2c4e0833b5e3/backend/src/app/http/session.clj#L187-L217) are internal; their existence is not proof of a supported selective operator disconnect API.

The current `penpot-studio-runtime.js`/developer provider verifies an administrative profile/project/font session. That is useful creation infrastructure, not human pairing. `penpot-media-authorization.js` owner equality and the founder-only story service must change only through the reviewed paired-access contract. Managed CloudRun currently does not host the native frame; no cloud hosting, new identity service or arbitrary gateway is selected by this plan.

## Feature-relevant admission, verification and rollback

Use the existing owned stack and Neo, with no new infrastructure, dependency installation or browser processes. Check available memory/disk and backup space before an owned operation; serialize native work with other render/build activity and retain existing resource limits. Bound pairing receipts, pending reconciliation and authority-request deadlines. Choose any additional protocol limits from the actual narrow hook; no speculative socket/topic quota or percentile/load benchmark is a prerequisite to this customer milestone. Do not claim the native PostgreSQL/Redis/backend/frontend stack fits Studio's 512MiB CloudRun profile.

For the approved five-second check, record a monotonic timestamp before disposable durable revocation and the server fence acknowledgement after affected subscriptions/queued events are fenced. This interval is a conservative upper bound. Try a new protected operation after the durable commit and observe an already-open native subscription that ignores UI notifications. Verify unrelated authorized work remains usable. Record actual elapsed time and outcome; do not use frontend notification or a fake clock as the only proof. A missed bound keeps access disabled; changing the bound requires review.

Hosted verification uses the existing exact-head workflows (`node --test server/*.test.js`, backwards checks, QA loop and canonical build with their existing workflow environment). Add focused pairing/reconciliation/replay/expiry checks with the changed service, and official Svelte MCP for changed components. Pinned native hooks need their own source/build review and actual running proof; Studio CI alone cannot prove them. No local test runner is authorized under the Neo-only constraint.

Actual Neo acceptance follows the visible connect/Create/Open/edit/save/reopen path and original foreign/revoke/expiry/share criteria using disposable grants. Never disable managed accounts for QA. Retain source/native patch hashes, preservation references and honest limits. On rollback, deny/pending activation first, then restore reviewed mappings/configuration without reviving revoked epochs or deleting originals/dirty work. Previously downloaded bytes cannot be recalled.

The human completed Phase2 review and authorized proceeding through the issue-backed tasks without another planning approval. Track C1–C5 in issue52 without overwriting Issue56 tasks. Preserve the approved defaults, independent source review, existing hosted checks and actual Neo acceptance; no connection or implementation-only checkpoint grants editing authority or closes the issue.
