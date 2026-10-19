# Proposed: a nested Penpot workspace in Studio

**Status:** Human review required. Architecture discovery and bounded proposal for [#283](https://github.com/ChaiWithJai/liquidity-studio/issues/283); no implementation, DNS/OAuth change or running-deployment change is authorized by this document. Existing #279 deployment and #52/#57 acceptance remain separately attributed. Module: operator-workflow, consuming identity-tenant-access. Baseline inspected: `0389832160684f7635621a4cd3c2f3dec9dafb89`.

## Objective and customer outcome

A person enters Studio, chooses their organization/agency and an explicitly authorized child brand, opens a story/design, edits inside a recognizable Studio workspace, saves/reopens/exports, then returns to that same work. They should not need to learn a second native dashboard/team hierarchy. Initial Google consent or a deliberate profile connection may be unavoidable; describe it once in the design journey rather than promising zero authentication interaction.

The recommendation and alternatives are in [ADR 004](../decisions/004-studio-owned-penpot-workspace.md). The first implementation is limited to the current Penpot instance and existing two content brands. It does not add recursive agency structures, a new role system, another identity database, a generic editor relay or a new hosting product.

## Current actual sequence

```mermaid
sequenceDiagram
  participant Person
  participant Studio
  participant Google
  participant Native as Penpot
  Person->>Studio: Google sign-in; choose organization/brand/story
  Studio->>Person: Connect my account; server-configured native link
  Person->>Native: Continue to first-party connection page
  Native->>Google: Native Google sign-in when no native session
  Google-->>Native: Existing human native profile/session
  Person->>Native: Confirm displayed Studio account/brand
  Native-->>Studio: Private native proof
  Person->>Studio: Confirm connection in the original Studio session
  Studio-->>Person: Connected; current brand access evaluated separately
  Note over Studio,Native: Current Open uses a new native tab; nested shell not implemented
```

Dated actual evidence: [DNS/TLS and exact callback error](https://github.com/ChaiWithJai/liquidity-studio/issues/279#issuecomment-6270127864), [callback corrected and native human dashboard observed](https://github.com/ChaiWithJai/liquidity-studio/issues/279#issuecomment-6270274170), and [real signed founder self-pair completion after PR284](https://github.com/ChaiWithJai/liquidity-studio/issues/279#issuecomment-6270600026). The latter records both confirmations and the actual Chai With Jai preview. It explicitly does not establish registered-brand Create/Open/edit/export, Nicole’s session, a nested editor or learner acceptance. No fresh-browser/expired-session screenshots were taken for this proposal. Existing #52 expiry/revocation results are reused, not rerun or relabeled.

## Proposed interaction and boundaries

- Studio owns a design route carrying organization, brand, story, format and saved design-record ID. The backend resolves the immutable native instance/team/project/file; caller URL fields are navigation, never grants. Keep Back/Forward, reload, originating preview and dirty work intact.
- A compact breadcrumb shows organization → brand → story/design, Save status and Return to saved copy. Native canvas gets the viewport. Keep upstream attribution and normal editing/export tools. Native team/account administration should not become the normal customer navigation. Operator recovery/personal native work remains available through a deliberate separate native path; hiding a menu is not authorization.
- A same-site Studio hostname and separate native origin avoid sharing Firebase storage/native cookies. Framing policy permits native self-framing and only the exact approved Studio origin, not wildcard HTTPS or arbitrary return URLs. Do not enable global CORS or cross-site cookies merely to make the old run.app iframe work.
- A first-use “Continue to design” step orchestrates existing native login, challenge description and deliberate same-session pairing completion, then resumes the exact file context. Subsequent current native sessions open directly in the shell. Provider pages stay outside the iframe. Firebase is not assumed to be Penpot’s OIDC issuer; reuse the existing Google provider and native session flow.
- Use the existing one-to-one native profile ownership mapping, current Studio membership, immutable brand-to-native-team mapping, acknowledged reconciliation and live/asset admission. Agency membership alone never grants every brand. No email-only auto-link, copied Firebase bearer token or exposed operator cookie.
- Native integration must report dirty/saving/saved/unavailable and native revision through a minimal source-reviewed host contract, if needed. Validate the exact native origin and expected window/document. Messages convey UI state only. Never infer Saved from load, silently adopt another file, or lose unsaved work during brand change. No generic RPC or token channel.
- Direct native root/dashboard entry should guide ordinary people back to Studio or resume a validated file context. Native workspace routes use hash fragments, which a reverse proxy cannot inspect: do not promise server-only redirects can distinguish dashboard from file. Use a narrow native entry guard after route parsing, retaining controlled operator/personal recovery and existing independent server authorization. An unauthorized direct file remains denied, not redirected into access.
- Studio reviewed copy and native layout text remain separate. Native edits do not silently approve source facts, refresh reviewed copy or publish. Exports and recovery continue to name their artifact.

## Bounded delivery proposal after approval

1. **Compatibility increment:** add the Studio-owned route and context-preserving full-page fallback. Use a separately configured same-site Studio hostname on the existing gateway/Cloud Run service. Demonstrate one governed saved file in a frame with exact frame policy, normal session, clipboard, full viewport, private fonts/assets, WebSocket and one ordinary export. No full matrix or account/expiry redo. If a required browser feature cannot work, keep the explicit full-page fallback and report the concrete restriction before widening the architecture.
2. **Coherent entry and return:** orchestrate existing first-use provider/pairing steps, add the small native dirty/return integration, and remove accidental dashboard onboarding from this route. Keep real confirmations; do not synthesize identity proof. Brand changes leave or preserve the current dirty design explicitly.
3. **Customer completion and rollout:** founder and marketer perform the same normal story → design → edit → Saved → reload → export → return journey. Reuse existing cross-brand/session/revocation coverage; add only regressions introduced by new framing/navigation. Record actual participants/actors honestly. Enable the shell per deployment, retain old Open-in-Penpot fallback, then promote through existing candidate release.

No native files/teams/projects are migrated. Existing mapped records reopen unchanged. A shell-route backfill can derive context from current design records; unmatched personal files stay personal, not silently adopted. Existing URLs remain usable. Rollback disables the shell route/flag, restores prior frame headers/origin configuration and exposes the retained direct native link. Preserve dirty buffers and stored data; never restore a database solely to revert the shell. No new cloud resource or paid tier is assumed; retain the aggregate $100/month envelope.

## Commands and verification ownership

From `liquidity-studio/`, these are existing commands for **hosted CI**, not permission to run locally:

```sh
npm ci --engine-strict --no-fund
NODE_ENV=production npm run build
node --test server/*.test.js
npm run test:browser -- --project=chromium
```

Canonical output uses `.github/workflows/canonical-frontend-artifact.yml` or the exact existing CI mismatch artifact; no duplicate build. Any changed pinned native frontend uses the existing encrypted `.github/workflows/penpot-font-ui-candidate.yml` delivery after source review. No local suites, installs, builds, model work or runtime changes for this planning PR. Actual local/remote workflow checks use the authorized ordinary browser. Svelte development must use official Svelte MCP.

## Source structure and implementation style

Reuse `src/App.svelte`, `src/lib/workflow-location.js`, `PenpotConnection.svelte`, `PenpotDesignAction.svelte`, existing pairing/brand-access/story services, managed origins and gateway configuration. Keep any native patch under the existing pinned tools/delivery structure, not vendored source. Scope UI state to the addressable design, for example:

```js
const context = { organizationId, brandId, storyId, designId };
const design = await requestSavedDesign(context); // current server authority
// Its configured origin and persisted file binding select the frame, not user URL input.
```

Use existing JavaScript ESM/Svelte 5, explicit narrow DTOs and safe errors. Keep the diagram/navigation label separate from authoritative identity. No new dependencies are selected.

## Success criteria and approval

Done means the nested journey is observed with preserved story/brand context, meaningful dirty/Saved feedback, current human attribution, private media/export and a useful return action. Initial consent/profile confirmation remains truthful; repeat authenticated use does not detour through native dashboard onboarding. Existing scope and session authority work independently of UI containment. Direct native entry, personal/operator recovery and rollback have defined behavior. A successfully framed login page alone is not completion.

Always preserve current grants, files, dirty work, attribution and source-review boundaries. Never share service sessions with humans, accept arbitrary native origins/return URLs, disable native authorization, or claim unobserved human acceptance. Architecture/configuration changes remain unimplemented until the human reviews this proposal.

**Single requested decision:** approve the recommended same-site, separate-origin Studio shell and bounded compatibility-first implementation, including exact framing policy and minimal dirty/return integration; retain full-page handoff as fallback. This is a new #283 architecture decision. The earlier #52 implementation waiver and #279 deployment approval do not supply that approval automatically. No additional identity vendor, account matrix or platform plan is requested.
