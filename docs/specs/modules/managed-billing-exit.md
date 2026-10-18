# Spec: managed-billing-exit

Historical proposal, retained from the 2026-10-17 planning baseline. Its status and implementation descriptions below are historical, not current release claims or new approval gates. See the [current system map](../../architecture/system-map.md) and [documentation index](../../README.md).

Status: proposed, awaiting specification approval. Module ID: `managed-billing-exit` in [CAPABILITY-MAP.md](../../architecture/capability-map.md). The module order is approved; this specification is not yet approved. Companion [pathway](../../TENANCY-PATHWAY.md) defines shared authorization, migration, rollback and ejection requirements; [audit](../../TENANCY-EVIDENCE.md) separates actual implementation from requests.

## Objective

Offer managed accounts and portable self-hosted delivery with explicit entitlements, usage accounting and customer exit.

Dependencies: gcp-pilot; consumes established organization/account identity and scoped export contracts.

## Tech stack and project structure

Current source is JavaScript ESM with Node HTTP services in `liquidity-studio/server/`; `scripts/build-dist.js` generates the served `dist/`, while `src/App.svelte` is a second implementation awaiting build consolidation (#7). Node 22 is the container/CI target; the audit host ran Node 26.5.0. Tests belong beside server contracts, browser tests require the canonical frontend decision, and operations/spec evidence belongs in `docs/`. No new database, identity or payment dependency is selected by this specification.

## Commands

Existing executable verification commands, from `liquidity-studio/`:

```sh
npm run build
AI_ALLOW_SYNTHETIC=true npm run test:backwards
AI_ALLOW_SYNTHETIC=true node --test server/gateway.test.js server/operational-health.test.js server/runtime.test.js
node server/navigation-test.js
```

These commands do not yet verify this proposed module. Module-specific commands must be supplied in its later reviewed implementation plan. Do not run `npm start` against the existing port-3000 process as a planning check. No lint command exists today.

## Code style and boundary contract

Preserve ESM, two-space indentation and explicit dependency injection. The following is proposed interface style, not an implemented API:

```js
export async function loadBrand(context, repository) {
  return repository.getBrand({
    organizationId: context.organizationId,
    brandId: context.brandId
  });
}
```

Authentication/authorization establishes context before a use case runs; every repository operation validates scoped ownership. Avoid unscoped convenience methods and global active-brand state.

## Testing strategy

Use Node's built-in test runner for service/adapter contracts, isolated ephemeral HTTP processes for API negatives and real browser tests for operator workflows. Reuse existing regressions, then add tests demonstrating each criterion below. Tenant isolation needs hostile foreign-ID, revoked-member and concurrent brand-switch cases across organization/brand data, assets, telemetry, exports and jobs. Static source scoring is not browser, factual, clinical or cloud verification. Record runtime, fixtures, outcomes and limitations in the PR.

## Success criteria

- Define signed/idempotent usage and billing events; replay never double-charges, and reconciliation separates cost from billable consumption.
- Demonstrate scoped export/import/ejection into a clean container without managed credentials, including data/assets/config/provenance and validated manifests.
- Resolve license/IP, upstream redistribution obligations, commercial duration/inclusions and cancellation/retention before onboarding paying customers.
- Treat agency-client organization delegation as an explicit future capability; do not introduce recursive arbitrary tenancy.

## Boundaries

- Always: preserve the running local service, use scoped interfaces, keep evidence and provenance, run relevant existing and new checks, document migration/rollback and retain recoverable customer data.
- Ask first: obtain later approval of this module specification before its implementation plan; resolve its open architecture/product choices before mutation. Deployment, billing activation and destructive data operations require their concrete approved delivery step.
- Never: commit secrets/private attachments, label unverified clinical claims as facts, infer authorization from brand selection, export another customer's data, choose a license implicitly, or remove failing tests to claim acceptance.

## Open questions

Clerk/payment/metering fit, billable units, synthetic/failure charging, self-hosted identity adapter, license, support terms and $6,000 upfront duration/entitlements.

Review of this specification is the next gate. No implementation tasks or architecture code are authorized by this document alone.
