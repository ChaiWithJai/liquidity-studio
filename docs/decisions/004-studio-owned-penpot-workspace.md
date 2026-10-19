# 004: Studio owns the design workspace

**Status:** Human approved the specification and sequence on October 19, 2026; [approval record](https://github.com/ChaiWithJai/liquidity-studio/issues/283#issuecomment-6271474365). Implementation under [#283](https://github.com/ChaiWithJai/liquidity-studio/issues/283) is underway; the full nested journey is not yet accepted. This belongs to the existing operator-workflow module and consumes identity-tenant-access; it creates no new identity service.

**Context:** The deployed `design.chaiwithjai.com` gateway serves the native Penpot application. Studio currently opens its saved native file in a new tab. Google can authenticate both applications, but they keep distinct sessions and explicit profile pairing. The customer wants Studio’s organization/brand/story context to surround the editor, with one coherent entry journey. The [proposed contract](../specs/studio-nested-penpot.md) records the actual sequence and remaining acceptance.

## Recommendation

Use a Studio-owned, addressable design route with the native editor framed on its existing separate origin. Place the customer Studio shell on an owned same-site HTTPS hostname, proposed `studio.chaiwithjai.com`, while retaining `design.chaiwithjai.com` for native content. Proxy the Studio hostname to the existing Cloud Run service through the current gateway; do not move its database or add a load balancer/VM. Existing run.app URLs remain available for controlled rollback and handoff fallback.

This is the **approved implementation direction**, not a claim that the deployed editor already embeds. First implement the bounded compatibility slice described in the spec. Native HTML must allow only itself and the exact Studio origin as frame ancestors instead of the current SAMEORIGIN header. Native and Studio session cookies/tokens remain separate and host-scoped. Perform provider authentication at the top level or an explicit popup, never inside the editor iframe. A first-use consent/profile confirmation can remain necessary; no second dashboard/onboarding tour should be required.

Keep the native root asset/API/WebSocket routes unchanged. Add only a small pinned native host integration for saved/dirty state, return navigation and Studio context, if the existing frontend has no equivalent. This integration conveys UI state, never credentials or permission. Studio does not infer Saved from an iframe load, and a brand switch must not discard dirty native work silently. Existing native admission and revocation stay authoritative regardless of shell visibility.

## Alternatives and evidence

| Option | Compatibility and cost | Disposition |
|---|---|---|
| Frame `design` directly from current `*.run.app` Studio | Deployed native response sends `X-Frame-Options: SAMEORIGIN`. Pinned native cookies default to SameSite Lax, so the current cross-site frame is also not a reliable authenticated entry. Native provider login is a top-level flow. A frame tag alone cannot solve this. | Reject as a shortcut. |
| Same-site, separate-origin Studio shell and native frame | Preserves root native assets/API/WS paths and separate browser origins. Requires an owned Studio hostname, exact framing policy, normal auth/resume orchestration and a small dirty/return integration. Reuses current VM/Cloud Run. | Recommended compatibility slice, then customer workflow. |
| Put Penpot below a Studio subpath or combine both apps on one origin | Native nginx uses root `/assets`, `/api`, `/js` and `/ws/notifications`; Studio also owns `/assets` and `/api`. Rewriting only the HTML path is insufficient. Same-origin composition also expands the shared script/storage trust boundary. | Avoid for this slice; no unbounded proxy/path rewrite. |
| Full-page handoff with a Studio context bar and validated return | Works with the existing separate sessions and native URLs. Lowest compatibility risk, but a full product switch remains and does not alone meet nested-workspace completion. | Retain as explicit accessible/fullscreen fallback and first safe increment. |

## Consequences

One application hierarchy is visible; two service sessions remain internally. Agency/organization membership does not imply every child-brand grant. No shared operator login, copied Firebase token, unverified-email linking or cross-domain cookie is introduced. Existing personal files, native attribution, source review, layout approval, export, publication and recovery remain distinct. No new paid identity vendor or governance tier is selected. The current $85–92/month forecast remains the baseline; DNS/certificate work reuses the existing domain/gateway and does not authorize extra infrastructure.

## Primary sources and exact basis

- Deployed header read, October 19, 2026: `https://design.chaiwithjai.com/` returned HTTP 200 and `X-Frame-Options: SAMEORIGIN`; no session or state mutation was made.
- Pinned Penpot [nginx headers](https://github.com/penpot/penpot/blob/ff7a66f51938b2293260ea27a64e2c4e0833b5e3/docker/images/files/nginx-security-headers.conf), [root routes and WS upgrade](https://github.com/penpot/penpot/blob/ff7a66f51938b2293260ea27a64e2c4e0833b5e3/docker/images/files/nginx.conf.template), [session cookie assignment](https://github.com/penpot/penpot/blob/ff7a66f51938b2293260ea27a64e2c4e0833b5e3/backend/src/app/http/session.clj#L310), and [OIDC callback](https://github.com/penpot/penpot/blob/ff7a66f51938b2293260ea27a64e2c4e0833b5e3/backend/src/app/auth/oidc.clj#L456). These govern this pilot rather than assuming develop-only options exist.
- Official [authentication](https://help.penpot.app/technical-guide/developer/subsystems/authentication/), [configuration](https://help.penpot.app/technical-guide/configuration/) and [teams](https://help.penpot.app/user-guide/account-teams/teams/) describe separate native sessions, provider configuration and native teams. Some documentation uses older route names; the pinned implementation supplies the actual callback. No supported full-editor embedding SDK or saved/dirty postMessage contract was established from these sources.
- Preserve [ADR 003](003-source-review-and-design.md), the [approved native access spec](../specs/identity-tenant-access-native-editor.md), [current managed composition](../../liquidity-studio/server/penpot-managed.js), and [deployment template](../../deployments/managed-penpot/compose.yaml).
