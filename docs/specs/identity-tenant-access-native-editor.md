# Phase1 specification: native editor identity and tenant access

Status: Phase 1 specification approved by the human on 2026-10-18. Phase 2 plan proposed for review; no implementation, migration or runtime enablement authorized. Module: `identity-tenant-access` in [CAPABILITY-MAP.md](../../CAPABILITY-MAP.md). This is the remaining native-editor scope of #52, not a new capability/module and not a reopening of completed Studio identity work. Original Studio Google authentication, scoped grants, durable data and delivery evidence remain valid within their recorded bounds.

The early [module specification](../../SPEC-identity-tenant-access.md) contains historical pre-implementation descriptions. Current native evidence and pinned source analysis are in [the boundary audit](../../liquidity-studio/docs/investigations/52-native-command-boundary-audit.md). PR140 provides bounded asset/export protection; it does not implement all native commands or live collaboration authorization.

Approved defaults (2026-10-18):

1. Each governed Studio brand has its own native workspace/team, not merely a project within a shared team.
2. Every human native identity is distinctly paired with a verified current Studio principal. A shared operator owner remains an administrative identity, never a substitute for founder/marketer identity.
3. Current Studio organization and brand membership is authoritative; native grants must mirror it without silently extending access.
4. Existing files, human edits, fonts, assets and delivered copies are preserved. Existing personal/native work is not silently moved, deleted or locked out.
5. This uses existing local infrastructure only. No new cloud/editor hosting, paid identity service, public bucket, shared credentials or arbitrary protocol gateway is selected.

## 1. Objective

Allow the founder and marketer to use a governed native editor with the same brand boundaries as Studio. Removing one brand grant must deny that brand's native reads, saves, token changes, comments, new collaboration subscriptions and asset/export reads, including already open sessions, while leaving unrelated authorized brands usable. A third tenant cannot acquire authority by importing native metadata, guessing IDs, reusing another actor's pairing, or moving a document across scopes.

Native ACLs should resolve file/project/team/thread/library ownership rather than duplicating every upstream command in a custom gateway. Any additional native hook must be narrow, pinned, reviewable and justified by a verified missing primitive. The spec does not prescribe a full Transit/WS implementation.

An authorized person may retain bytes already downloaded. That physical fact does not confer continuing online native access after revocation. Public sharing must be disabled for governed brands unless an explicit reviewed brand capability authorizes it. Native owner powers must not let ordinary brand editors grant new external principals without Studio authority.

## Existing support and unresolved native hooks

Penpot source pin: `ff7a66f51938b2293260ea27a64e2c4e0833b5e3`, version2.18.3. Other adapters must meet the same module contract through their existing registered identity boundary; no claim of Penpot support is inferred from Doory evidence.

| Requirement | Existing pinned native support | Missing proof or narrow hook |
| --- | --- | --- |
| File, token, comment and indirect-object access | Native permission helpers resolve file/project/team and comment/thread relations | Distinct paired actors, exact per-brand native grants, cross-scope native negatives |
| Brand separation | Native teams and member roles; file/project/team grants are combined | Separate teams required because a shared-team grant remains a read path; migration/font/library inventory |
| Membership reconciliation | Owner/admin role/member commands, native membership notifications | Durable acknowledged reconciliation and fail-closed admission while pending/failed; no implicit owner fallback |
| Current requests after revocation | Native membership checks on protected commands | Verify actor mapping, changed grants and unregistered/aggregate paths; unknown policy must deny |
| Existing live subscriptions | Native file/team checks on subscribe | No verified server-side per-brand live-disconnect primitive yet; UI notification alone is insufficient. Evaluate narrow upstream revocation/lease hook before any custom frame relay |
| Session expiry | Native session manager and internal invalidation functions | Prove expiry closes or fences already-open subscriptions; ordinary logout is not a selective operator disconnect API |
| Public shares/invitations | Native editors can create share links; team owner/admin can manage members | Existing-link/invitation/publishing inventory and explicit brand policy. Future-create denial alone does not revoke an existing share |
| Asset/export reads | PR140 current-authority registered delivery and exact resources | Preserve that boundary under native identity changes and verify raw published aliases cannot bypass it |

Evidence must distinguish native public APIs, internal source functions and any source patch actually required. Internal function existence is not proof of a supported operator API. Organization-owner viewer fallback must be inventoried rather than assumed absent.

## 2. Commands

These are existing executable repository commands, from `liquidity-studio/`, for later approved verification. They are **not to be run locally under the current Neo-only testing constraint**. Hosted CI may run them. The later reviewed plan must identify any new targeted test files and exact owned-stack commands; this spec does not start services or provision identities.

```sh
NODE_ENV=production npm run build
NODE_ENV=test AI_ALLOW_SYNTHETIC=true node --test server/*.test.js
NODE_ENV=test AI_ALLOW_SYNTHETIC=true npm run test:backwards
NODE_ENV=test AI_ALLOW_SYNTHETIC=true npm run qa:loop
```

No dependency installation, vendor build, local Node/Playwright/headless test process or new browser is authorized by this document. Actual native acceptance uses the existing BrowserOS Neo session and owned disposable fixtures only. No npm lint command is currently defined. Maintained port3000/3001 and cloud are excluded from specification verification.

## 3. Project structure and contracts

- Existing `liquidity-studio/server/editor-boundary.js`, current identity services and scoped repository supply actor/membership, registered native ownership and grant epochs. Security authority remains outside portable document payloads.
- Existing local native runtime/media/export adapters remain providers of native operations; operator endpoints/credentials are fixed private configuration, never caller-selected URLs or document fields.
- Existing service tests live beside server modules; actual native/browser proof belongs in `docs/investigations/` with sanitized manifests. Private identity mappings, sessions, credentials and native ACL inventories stay outside Git in controlled operator evidence.
- The approved capability provider is `identity-tenant-access`; operator workflows and both native adapters consume its result. There is no new product database, independent global active-brand state or alternative authentication system.

Required contract outcomes, without selecting new code modules: a pairing is verified or unavailable; a binding grant is current, reconciliation-pending, revoked or expired; an action requires the current actor, immutable brand binding and native resource ownership. Pending/unknown reconciliation cannot be presented as authorized. Replayed requests may recover a bounded prior result but cannot restore revoked access or silently reapply a mutation.

## 4. Code style

Use existing JavaScript ESM, two-space formatting, explicit injected dependencies, strict bounded DTOs and safe JSON errors. Preserve native revisions and dirty human buffers; do not silently retry a stale save with a newer revision. Example **contract style only**, not an implemented API or approved module:

```js
export async function authorizeNativeAction(context, access) {
  const pairing = await access.requireVerifiedPairing(context.actorId);
  return access.requireCurrentBrandGrant({
    actorId: context.actorId,
    organizationId: context.organizationId,
    brandId: context.brandId,
    nativeProfileId: pairing.nativeProfileId,
    bindingId: context.bindingId,
  });
}
```

Do not treat profile display names, email similarity, operator ownership, native plugin metadata or imported scope IDs as identity proof. Pairing must demonstrate control of the actual authenticated Studio principal and actual native profile, prevent cross-session/actor replay, expire, and support revocation without persisting a user Google JWT/refresh token. Secret receipt/pairing details must not enter public logs or archives.

## 5. Testing strategy and success criteria

Constructor/service regressions establish parsing and transaction behavior; real native operations establish the integration. Record source/native versions, paired actor, tenant/brand, action, outcome, authority revision and limits with sanitized IDs. Do not equate a schema,404 on a Studio room route, cached response, HTTP200 or frontend notification with native isolation.

| Acceptance group | Required observable evidence |
| --- | --- |
| Identity pairing | Two distinct actual native profiles paired to two current Studio principals; wrong actor/session, shared-owner inference, expired/replayed pairing and friendly-email-only pairing deny |
| Two brands and third tenant | Founder access to both brands; narrower actor access only to its grant. Third-tenant transferred/imported file receives no authority. Actual native document/token/comment/read/write and aggregate-list negatives across all scopes |
| Current membership | Revoke only one owned-QA brand grant; new native reads/saves/comments/assets/subscriptions deny, other brand remains usable; acknowledged exact restore recovers permitted access. Reconciliation interruption/retry cannot grant access or overwrite newer membership |
| Live collaboration and expiry | Keep a real native subscription open during revocation and natural expiry; affected file/team events, pointer writes and subsequent operations stop within a reviewed explicit bound. A hostile client ignoring UI notifications cannot retain authority. No fabricated clock advance as the only expiry evidence |
| Sharing and invitations | Enumerate existing shares/invitations/library-publication paths; governed public links deny unless explicitly authorized per brand. Foreign viewer/comment/share IDs and reused links cannot bypass current policy. Owner administration remains separately authorized |
| Preservation and recovery | Existing human edits, source/native revisions, fonts, image hashes and legitimate native saves/exports still work. Recovery/import remaps identity explicitly and never restores credentials/grants. Failed migration/reconcile/rollback preserves Studio originals and existing private backups |

No actor's managed Google account is disabled for QA. Revocation uses only reviewed disposable fixture grants; actual accounts and maintained identities remain unchanged. Test unregistered and encoded/alternate routes as appropriate to the pinned native contract. Current per-read private-media checks/no-store behavior remain mandatory, including foreign/anonymous and revoked/expired receipts.

Operational measurements must report observed admission/reconciliation/revocation latency, resource cost and failure behavior. Approved acceptance bound, still requiring implementation and measurement: deny new requests after durable Studio revocation, and server-enforce closure or fencing of affected existing subscriptions within five seconds. This is an approved gate, not an achieved measurement. If the implementation cannot meet it, keep the capability disabled and review the residual window before changing the bound. No positive cross-request authorization cache or membership snapshot may become authority.

## 6. Boundaries

**Always:** preserve originals and dirty buffers; validate current actor/scope and native ownership; keep unknown/pending states fail closed; use native ACL resolution where sufficient; bind security state to immutable IDs/epochs outside portable content; record primary-source hooks and actual negatives; retain consistent scoped backups and a reversible migration disposition; preserve the current Neo-only local testing constraint.

**Review before proceeding:** this Phase1 specification before any Phase2 implementation plan or tasks; the unresolved pairing/revocation/share choices below; any necessary pinned upstream hook, native identity/team migration or cross-application session policy. Ordinary source inventory does not require a new permission request. No infrastructure, IAM, credential or existing file mutation is authorized by this spec.

**Never:** infer identity from a shared owner/name/email; expose operator credentials to the browser/documents; broaden native invitations/shares silently; use wildcard file/resource grants; deploy a full arbitrary protocol gateway by default; delete/move human files without a reviewed migration; call already downloaded copies revocable; provision new cloud resources; claim #52 complete from PR140 asset delivery or #54 rendering evidence alone.

## Open questions for human review

1. Confirm separate native workspace/team per governed brand and distinct paired human identities, with operator administration separated from ordinary editing.
2. Is public sharing disabled for all governed brands initially, or should a specific brand-level authorized share capability be specified now? The simpler proposed default is disabled, with existing shares explicitly inventoried.
3. Approve the proposed five-second maximum for existing live subscriptions, with new requests denied after durable revocation? This must be measured before enablement; it is not a current guarantee.
4. Should independently owned personal native work remain on a separate ungovened operator origin/workspace? The governed surface must not have an undocumented bypass, while existing personal work must be preserved.
5. Proposed default: ordinary paired editors cannot retain native organization-owner fallback privileges on the governed service. Existing operator ownership stays separate and untouched. Any exception needs an explicit disposition before tenant-denial acceptance.
6. Confirm that required narrow native revocation/share hooks may be proposed after source inventory if existing public APIs cannot supply the boundary, instead of automatically building a full custom RPC/WS gateway.

Review gate: Addy's `spec-driven-development` states, “Stop after writing the spec (CRITICAL).” It requires human review before Phase2 planning. This document intentionally contains no task list or implementation sequence. The existing capability-map approval stands; only these concrete remaining native identity semantics are presented for review.

## Human approval and module plan

On 2026-10-18 the coordinating agent recorded the human's later-turn approval of separate native teams per brand, distinct paired founder and marketer profiles, separate operator administration, public sharing off, immediate denial of new requests after durable revocation, a maximum five-second live fence, preservation of personal and operator work, and narrow native hooks where required. This is an approval summary, not a verbatim quotation. The reviewed specification before this status record has SHA-256 `b611845ed357127a8e5fec94d34580560cf704f337f5e356d463c30544a2658c`.

The questions above are retained as the historical review record. Their defaults are approved. Personal work must remain preserved and separate; its exact origin and migration disposition require inventory, not a silent move or privilege change. Hook contracts and measured enforcement remain implementation deliverables.

The module-specific [Phase 2 plan](../plans/identity-tenant-access-native-editor/tasks/plan.md) is the active planning entry for `identity-tenant-access`, tracked in [issue 52](https://github.com/ChaiWithJai/liquidity-studio/issues/52). Existing root `tasks/plan.md` and `tasks/todo.md` belong to Issue 56 and are unchanged. Phase 2 review is pending; no Phase 3 task execution is authorized.
