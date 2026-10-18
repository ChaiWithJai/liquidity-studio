# Documentation

Start with the [system map](architecture/system-map.md) to understand a change, or the [operator practice guide](investigations/58-native-operator-practice.md) to do content work. The [capability map](architecture/capability-map.md) links module ownership and remaining delivery issues.

| Need | Read |
|---|---|
| Run and recover a local developer profile | [Local development](local-development.md) |
| Understand current components and change effects | [System map](architecture/system-map.md), [decisions](decisions/README.md) |
| Deploy or preserve data | [GCP guide](gcp-first-deployment.md), [Docker](docker-local.md), [storage](firestore-gcs-storage.md), [backend operations](backend-operations.md) |
| Change source preparation or native editing | [Prepared candidates spec](specs/prepared-source-candidates.md), [native access spec](specs/identity-tenant-access-native-editor.md), [portable pack spec](specs/editor-portable-pack.md) |
| Work on delivery | [Product loop](product-engineering-workflow.md), [engineering workflow](ENGINEERING-WORKFLOW.md), [hosted frontend assembly](development/hosted-frontend-artifact.md) |
| Find actual acceptance and limits | [Deployments](deployments/), [investigations](investigations/), [design reviews](design-review/), and the linked GitHub issue |
| Understand early planning | [Historical module proposals](specs/modules/), [original capability snapshot](history/capability-map-2026-10-17.md) |

## Where new documentation belongs

Use `docs/specs/` for a feature contract, `docs/plans/<module>/` for its implementation plan, `docs/decisions/` for a durable architectural choice, and `docs/development/` for developer instructions. Keep dated release/acceptance evidence in `docs/deployments/` or `docs/investigations/`; application-specific evidence also lives in `liquidity-studio/docs/investigations/`. Keep existing evidence paths stable because manifests and scripts may refer to them. Historical JSON source inventories retain their original Git paths and source SHAs; they are not live navigation links and are not rewritten when a document moves.

Update relevant instructions with code. Add an ADR only when the reason/trade-off matters to a future change; routine fixes need no ADR. Label proposals and historical descriptions, link to current guidance, and preserve approval and acceptance provenance. This is a navigation convention, not another approval process. Root `tasks/` remains the Issue 56 plan; native identity work has its own [scoped plan](plans/identity-tenant-access-native-editor/tasks/plan.md).
