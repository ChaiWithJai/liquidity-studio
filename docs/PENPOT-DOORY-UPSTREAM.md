# Penpot and Doory upstream investigation

Recorded 2026-10-17 for issue #39. This records primary-source inspection, not a deployed integration or an import/export acceptance result. The pilot remains on its existing single application architecture.

## Pinned evidence

| Item | Observation | Evidence and disposition |
| --- | --- | --- |
| Doory identity | `shaongitbd/doory`, commit `27b6f68221fdbf1ef1bedc182e303210ca9e39f5` | [Pinned source](https://github.com/shaongitbd/doory/tree/27b6f68221fdbf1ef1bedc182e303210ca9e39f5). GitHub repository metadata reports creation on 2026-10-10, not a long operating history. The releases API returned an empty list. Maintenance maturity remains unresolved. |
| Doory license | Attribution Assurance License, with source and binary attribution conditions | [Actual license](https://github.com/shaongitbd/doory/blob/27b6f68221fdbf1ef1bedc182e303210ca9e39f5/LICENSE). It is not MIT. Retain its full terms when assessing distribution; do not equate lack of a seat charge with absence of obligations. GitHub's SPDX metadata returns `NOASSERTION`. |
| Fabric version | Package range `^7.2.0` | [Frontend manifest](https://github.com/shaongitbd/doory/blob/27b6f68221fdbf1ef1bedc182e303210ca9e39f5/frontend/package.json). The brief's Fabric 6 assumption is contradicted by this version. Compatibility must use an exact lockfile version, not a generic Fabric JSON claim. |
| Native document | `schemaVersion: 1`, dimensions, units, pages, optional audio and metadata | [Document types](https://github.com/shaongitbd/doory/blob/27b6f68221fdbf1ef1bedc182e303210ca9e39f5/frontend/src/types/document.ts). Pages contain Doory objects derived from Fabric serialization, background and optional timing/transitions. A naked Fabric scene is not proof of a valid multi-page Doory document. |
| Persistence | `Design.document` JSON, owner, revision and separate versions | [Django models](https://github.com/shaongitbd/doory/blob/27b6f68221fdbf1ef1bedc182e303210ca9e39f5/backend/apps/designs/models.py). The claimed `fabricJson` field is not the field in this model. Existing owner semantics do not establish Studio organization/brand authorization. |
| Background removal | Custom worker integration and `onnxruntime-web` range `^1.30.0` | [Bundled worker](https://github.com/shaongitbd/doory/blob/27b6f68221fdbf1ef1bedc182e303210ca9e39f5/frontend/src/editor/engine/bgRemoval/bundled.ts), frontend manifest above. Do not infer use of an unrelated MIT background-removal package. |
| Model weights | Manifest selects U2NetP by default; records 4.7 MB and Apache-2.0 provenance, with an optional larger U2Net model | [Model manifest](https://github.com/shaongitbd/doory/blob/27b6f68221fdbf1ef1bedc182e303210ca9e39f5/backend/data/ml_models.json). These are upstream assertions and download checksums, not our independent inference or redistribution test. Runtime code, weights, training-data terms and optional replacement models require separate checks. |
| Templates | Ten bundled design JSON files plus a manifest in the inspected directory | [Template directory](https://github.com/shaongitbd/doory/tree/27b6f68221fdbf1ef1bedc182e303210ca9e39f5/backend/data/templates). This is evidence of the inspected bundled collection, not evidence for a larger claimed catalogue or every remote/imported template. |
| Video exports | MP4/WebM/GIF writer and codec-selection source exists | [Video code](https://github.com/shaongitbd/doory/tree/27b6f68221fdbf1ef1bedc182e303210ca9e39f5/frontend/src/editor/engine/export/video). Source presence does not prove that a particular browser can encode the requested file, duration, audio and fonts. No rendered media was produced in this inspection. |
| Penpot release | GitHub latest-release API reports `2.18.3`, published 2026-10-06 | [Release](https://github.com/penpot/penpot/releases/tag/2.18.3). Pin a tested release and image digest for an experiment. Current documentation may describe a different development revision. |
| Penpot integration | Official API, MCP and outbound webhooks are documented | [Official integrations](https://penpot.app/integrations-api), [technical guide](https://help.penpot.app/technical-guide/integration/). Documentation establishes available integration surfaces, not that our proposed workflow uses them correctly. |
| Penpot event semantics | Team-level webhooks correspond to backend RPC operations marked `WEBHOOK`; payload details can vary | [Official webhook guide](https://help.penpot.app/technical-guide/integration/#webhooks). No specific final-pack export or Ready-to-Post event was proven. A file update must not automatically mean approved, rendered or published. |
| Penpot tokens | Design tokens are documented as a first-class feature | [Official token guide](https://help.penpot.app/user-guide/design-systems/design-tokens/). Import format/version, binding to governed components and edited SVG round trips still need execution evidence against the pinned release. |

## Contract consequences

The safe first experiment is a disposable local fixture, outside the running pilot: one organization, two brands, a two-page document, one image and one font. Define a Studio bundle version separately from the editor's native version. Convert into the native document explicitly, open it, edit one visible text layer, export it, then compare dimensions, page count, font appearance, asset bytes and stable lineage identifiers. Record unsupported properties instead of silently losing them.

Every asset reference needs a scope, immutable content hash, media type, dimensions, byte limit and an authenticated delivery mechanism. A `gs://` identifier is not an editor-readable browser URL. Do not put bucket HMAC credentials into a scene or browser. Never use preset names or Redis database numbers as access controls.

Outbound editor events need a verified sender, tenant-bound integration identity, event and version identifiers, replay protection and idempotent processing. An export-completed event must identify verified stored bytes. Approval, calendar scheduling, export completion and social publication remain separate states. A raw-generation/final-edit pair is provenance; it does not automatically constitute a valid training preference.

## Unproven acceptance and operating boundaries

No Penpot or Doory container, account, webhook, collaboration room, background-removal inference or native-document import was launched in this inspection. No latency targets were measured. No GCP resources were added. The proposed shared Postgres/Redis/editor topology is not the deployed pilot and has no accepted cost model yet.

The artifact matrix must remain explicit: current Studio PNG exports have separate runtime evidence; SVG, JPG, PDF, MP4, WebM and GIF through these upstream editors remain unverified until actual files are generated and independently inspected. Browser codec availability, WebSocket reconnects, fonts, private object access and backup restoration must be measured in the chosen runtime.

This source inspection does not complete issue #39. Its remaining work includes exact license/model provenance review, native import/edit/export experiments, complete requirements disposition, tenant isolation and recovery experiments, current resource pricing, and sequenced implementation tickets with rollback criteria.
