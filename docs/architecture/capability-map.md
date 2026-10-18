# Capability map

This is the module index, not a blanket completion claim. GitHub issues and dated acceptance receipts track delivery. The [system map](system-map.md) explains current source and change impact; the [original capability snapshot](../history/capability-map-2026-10-17.md) preserves the earlier dependency order, commercial assumptions and evidence limits.

| Module | Current responsibility and entry point | Earlier proposal |
|---|---|---|
| container-runtime | Node API/worker lifecycle, canonical Svelte distribution; [local profiles](../local-development.md), [Docker](../docker-local.md) | [Historical spec](../specs/modules/container-runtime.md) |
| durable-storage | Scoped SQLite or Firestore records, private assets, portable recovery; [storage](../firestore-gcs-storage.md), [pack spec](../specs/editor-portable-pack.md), [#57](https://github.com/ChaiWithJai/liquidity-studio/issues/57) | [Historical spec](../specs/modules/durable-storage.md) |
| identity-tenant-access | Organization memberships and explicit brand grants; [native access spec](../specs/identity-tenant-access-native-editor.md), [native plan](../plans/identity-tenant-access-native-editor/tasks/plan.md), [#52](https://github.com/ChaiWithJai/liquidity-studio/issues/52) | [Historical spec](../specs/modules/identity-tenant-access.md) |
| operator-workflow | Sourced candidates, editable copy, calendar, jobs and design handoff; [operator practice](../investigations/58-native-operator-practice.md); [proposed Defiant strategy feature](../specs/defiant-strategy-workspace.md) | [Historical spec](../specs/modules/operator-workflow.md) |
| gcp-pilot | Managed Google identity, Cloud Run, Firestore/GCS and job dispatch; [deployment](../gcp-first-deployment.md), [release evidence](../deployments/) | [Historical spec](../specs/modules/gcp-pilot.md) |
| managed-billing-exit | Usage attribution and portable exit contracts; [usage implementation](../../liquidity-studio/server/durable-telemetry.js). Billing purchase/entitlements are not implied by usage records. | [Historical spec](../specs/modules/managed-billing-exit.md) |

Organization → Brand is the authorization hierarchy. Presets provide brand configuration, not permission. Native editing adds a separate paired-person/team boundary; successful hook compilation is not proof of activated isolation or measured revocation. Consult #52 before changing it. Human learning, clinical approval, licensing and unfinished content work remain distinct from engineering checks.
