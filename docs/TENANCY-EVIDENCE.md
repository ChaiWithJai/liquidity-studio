# Tenant pathway evidence audit

Audit revision: `fdd8d99` (2026-10-17). Planning source: [issue #18](https://github.com/ChaiWithJai/liquidity-studio/issues/18) and its founder clarification. The founder approved the module order and Organization → Brand hierarchy. The module specifications remain proposals requiring review. No tenancy implementation or private attachment is included here.

Assumptions: one organization owns `liquidity_desk` and `vedic_dharma`; founder and marketer are separate accounts; an agency can own multiple brands. A future agency-client organization relationship is explicit delegation between organizations, not arbitrary recursive nesting. Brand selection changes working context, never authority.

## Claimed capability versus repository evidence

| Handoff/request statement | Evidence at audit revision | Finding and consequence |
|---|---|---|
| Tenant 2 / `vedic_dharma` is implemented | `rg -n 'vedic_dharma|Tenant.?2|CWJ' liquidity-studio` finds no implementation; `server/domain.js:10` exports one DEFAULT_BRAND_PROFILE | Absent. Treat the handoff as requested design, not delivered software. |
| Two brands can coexist | `server/container.js:16–24` constructs one in-memory brandProfile and backlog | Absent. Updating brand overwrites a shared profile; it creates no isolated brand. |
| Tenant-aware APIs or membership checks | `server/index.js:57–155` routes contain no organization/brand authorization; `container.js:104` uses unscoped repository calls | Absent. A tenant selector or query argument alone cannot repair authorization. |
| Tenant isolation tests pass | Existing tests are gateway, health, runtime, navigation and backwards contracts; no org/brand negative tests | Unsupported. Existing green checks do not establish isolation. |
| Strategy, value groups, pillars and CWJ preset are complete | One financial content profile/prompt in `server/domain.js:10,100`; `observability.js:16` evaluates financial-number/ownership vocabulary | Absent. These assumptions are unsuitable as universal brand or clinical quality criteria. Exact strategy text still needs approved, sourced input. |
| Durable Firestore/cloud services exist | `InMemoryGCPFirestoreAdapter` in `container.js:16` stores arrays and objects; service name is not an integration | Absent. Restart loses state. Cloud components in RFC/graph are intended architecture. |
| Export creates usable assets or posts socially | `container.js:196` updates status and records action; no artifact renderer/delivery integration | Absent. Calendar assignment, downloadable export and publication require distinct states. |
| Generation is always provider-backed and factual | `gateway.js` now requires explicit synthetic opt-in and labels provenance; `container.js:48–54` still inserts fabricated default facts | Partial. Source review and removal of upstream default claims remain necessary; numeric guards do not prove meaning. |
| Admin health proves provider health | `operational-health.js` explicitly reports provider not checked; readiness only reads repository | False interpretation. Probe scope is deliberately narrow. |
| Brand clinical statistics establish efficacy | No supplied study evidence verified in this audit | Unverified. Quarantine clinical assertions from generation/publication until source and editorial approval; do not duplicate raw attachment or clinical percentages into public fixtures. |
| Public GitHub means open-source licensing | No tracked LICENSE found | Unsupported. Do not infer a license or redistribution entitlement from visibility. |
| Clerk supplies every billing/metering need | No identity/billing dependency or integration in package.json/server | Unimplemented and unverified. Identity, payment processing, entitlements and measured usage are separate boundaries. |

Evidence links use the [audited tree](https://github.com/ChaiWithJai/liquidity-studio/tree/fdd8d99). Line references identify source inspected at that revision; later changes may move them. Absence searches are bounded repository observations, not claims about external systems or private work.

## Reproducible verification

Run from `liquidity-studio/` on a separate checkout, without restarting port 3000:

```sh
AI_ALLOW_SYNTHETIC=true node --test server/gateway.test.js server/operational-health.test.js server/runtime.test.js
AI_ALLOW_SYNTHETIC=true npm run test:backwards
node server/navigation-test.js
```

Audit run results: 14/14 Node tests, 7/7 backwards checks, navigation regression passed. The tests use mocks or local ephemeral processes. No paid provider calls were made. They establish their named contracts, not Docker startup, GCP deployment, scientific truth, browser isolation or tenant access. The navigation test rebuilds only this checkout's generated bundle. A source search found no implemented organization/brand isolation suite.

## Original findings connected to the pilot

| Issue | Upstream dependency and downstream pilot gate |
|---|---|
| [#1](https://github.com/ChaiWithJai/liquidity-studio/issues/1) saved campaigns | Closed after navigation repair; retain regression and add organization/brand switch coverage before operator pilot. |
| [#2](https://github.com/ChaiWithJai/liquidity-studio/issues/2) durability | Container volumes/storage contract before restart-safe pilot; composite org/brand ownership before importing real customer work. |
| [#3](https://github.com/ChaiWithJai/liquidity-studio/issues/3) generation integrity | Source provenance and no fabricated defaults before either brand generates publishable content; clinical review is additional work. |
| [#4](https://github.com/ChaiWithJai/liquidity-studio/issues/4) API protection | Verified identity, org membership, brand grants, request bounds and server-side authorization before remote access. |
| [#5](https://github.com/ChaiWithJai/liquidity-studio/issues/5) real exports | Scoped persisted assets and artifact access before usable delivery or customer ejection; publishing is separate. |
| [#6](https://github.com/ChaiWithJai/liquidity-studio/issues/6) operations | Existing probes/telemetry are partial; add scoped failure visibility and redaction before pilot support. |
| [#7](https://github.com/ChaiWithJai/liquidity-studio/issues/7) canonical build | Select one served implementation and lock reproducible dependencies before container/browser acceptance; CI groundwork is partial. |
| [#8](https://github.com/ChaiWithJai/liquidity-studio/issues/8) browser/failure tests | Real founder/marketer workflows and cross-brand denials before pilot; source scoring cannot replace these. |
| [#9](https://github.com/ChaiWithJai/liquidity-studio/issues/9) scheduler | Durable idempotent scoped jobs and authenticated service invocation before unattended batches. |
| [#10](https://github.com/ChaiWithJai/liquidity-studio/issues/10) feedback lineage | Scoped immutable generation/edit/export IDs and complete authorized pagination before training export or customer exit. |
| [#11](https://github.com/ChaiWithJai/liquidity-studio/issues/11) lifecycle | Startup/drain tests are partial progress; validate image/volume backup and restore before Docker acceptance and GCP pilot. |
