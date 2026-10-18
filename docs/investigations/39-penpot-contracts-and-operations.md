# Investigation 39: Penpot contracts and deployment economics

Evidence checked 2026-10-18 UTC (2026-10-17 New York). This is source/documentation and read-only pricing research. No Penpot instance, import, export, background-removal operation or new infrastructure was executed. Compatibility and performance are unresolved until the experiments below pass. See the [combined upstream ledger](../PENPOT-DOORY-UPSTREAM.md) and [repository ledger](39-repository-evidence.md) for Doory and Studio respectively.

## Version and license boundary

The official repository is [penpot/penpot](https://github.com/penpot/penpot). Its latest GitHub release at inspection was [2.18.3, published October 6](https://github.com/penpot/penpot/releases/tag/2.18.3), pinned to [`ff7a66f51938b2293260ea27a64e2c4e0833b5e3`](https://github.com/penpot/penpot/tree/ff7a66f51938b2293260ea27a64e2c4e0833b5e3). Main was `da1791bf007ed84f0c75e62c7511da8afe8c8c31`; it is not the release pin. This establishes maintained upstream activity, not an integration support commitment.

Both root and plugins directories carry [MPL-2.0](https://github.com/penpot/penpot/blob/ff7a66f51938b2293260ea27a64e2c4e0833b5e3/LICENSE). Commercial use is compatible with that license, but redistribution must preserve notices and satisfy covered-source availability obligations; modified MPL-covered files remain covered. Separate Studio code is not automatically made MPL solely by communicating over an API. Inventory third-party code, fonts, templates and assets separately. A zero license fee says nothing about hosting, maintenance, template rights or Doory's distinct license.

## What the interfaces establish

| Claim | Disposition and operational consequence |
| --- | --- |
| SVG is the complete native database | **Contradicted as a complete storage contract.** Current native `.penpot` export is v3 ZIP/JSON plus binary media; manifest schema version `1` is distinct from container format v3. Pages, shapes, components, colors, typography, tokens and plugin data have separate records. SVG rendering does not replace these records. [Native format](https://help.penpot.app/technical-guide/developer/data-model/penpot-file-format/) |
| Arbitrary `data-penpot-*` attributes create governed editable components | **Unproven.** No such guarantee was found in the reviewed import/schema documentation. A visually matching SVG is insufficient: test editable text, component references, tokens, layout constraints, page order and asset identities after import and after native export/reimport. Do not call generated annotations an adapter implementation. |
| All token JSON is interchangeable | **Qualified.** Release source recognizes legacy `value/type` and DTCG `$value/$type`, converts legacy input, and warns about unknown types. Record the chosen dialect and resolved units; unsupported types and unresolved aliases need explicit error handling. [Pinned parser](https://github.com/penpot/penpot/blob/ff7a66f51938b2293260ea27a64e2c4e0833b5e3/common/src/app/common/types/tokens_lib.cljc#L1572) |
| Every DTCG revision and plugin token operation is supported | **Unresolved.** User documentation describes draft DTCG support, uses pixel font sizes and still labels plugin token access forthcoming. It does not establish conformance to every final DTCG revision. Pin actual accepted fixtures and plugin type definitions. [Token guide](https://help.penpot.app/user-guide/design-systems/design-tokens/) |
| Official MCP exists | **Verified upstream, not connected to Studio.** The release includes an MCP server and browser plugin bridge. Local operation requires an open, active plugin/tab; multi-instance routing requires additional synchronization. This is not evidence of an unattended browser-free renderer. [Pinned MCP README](https://github.com/penpot/penpot/blob/ff7a66f51938b2293260ea27a64e2c4e0833b5e3/mcp/README.md) |
| Stable public RPC integration | **Qualified.** Official integration guidance exposes internal backend RPC via personal access tokens (`Authorization: Token ...`), not a versioned Studio tenant API. Tokens grant account access. Pin request/response fixtures, privilege mapping, expiry and compatibility tests. [Integration guide](https://help.penpot.app/technical-guide/integration/) |
| `enable-webhooks` makes “Ready to Post” a supported page event | **Unproven.** The flag enables team webhooks; a page status named Ready to Post and its event are not established by this flag. Capture a supported RPC event and map an explicit approval operation rather than inventing an event. [Configuration](https://help.penpot.app/technical-guide/configuration/) |

The pinned webhook sender posts event payloads with content-type and user-agent headers, a four-second timeout, delivery logging and failure counting. It disables a webhook after three counted failures by default. No HMAC authentication header is present in this sender. Worker tasks request a retry limit, but caught delivery errors mean an at-least-once retry guarantee cannot be inferred. The current source accepts only 200/204 as success. A receiver returning 202 can therefore count as failure. [Sender source](https://github.com/penpot/penpot/blob/ff7a66f51938b2293260ea27a64e2c4e0833b5e3/backend/src/app/loggers/webhooks.clj#L111)

A Studio receiver must not trust an unsigned payload's organization, brand, file identity or claimed export completion. Use an authenticated relay or constrained integration credential, server-owned team/project/file-to-tenant mapping, nonce/timestamp/replay rules, an idempotency ledger and authoritative artifact fetch/checksum verification. Keep secrets out of URLs/logs. A file-update notification can request reconciliation; it must not directly mark a calendar item Exported. These are proposed controls, not shipped endpoints.

## Proposed versioned handoff and acceptance experiments

Use one envelope `studio.editor-handoff/v1`: organizationId, brandId, storyId, storyRevision, generationId, brandProfileRevision, sourceClaimsRevision, format, canvas dimensions, page/beat order, token dialect, tool version, native-document ID/version and checksummed asset references. Server authorization resolves every identifier against the authenticated scope. A preset slug is descriptive, not an authorization boundary.

Preserve supplied layer IDs and cutout/animation configuration verbatim in a separately versioned source payload; map to tool-generated native IDs without pretending arbitrary SVG attributes are authoritative. Asset references contain ownership, immutable version, MIME, size and SHA256, plus a short-lived authorized delivery mechanism; never embed storage credentials. Font family, weight and actual font bytes/license/hash belong in portable manifests. Mona Sans/Inter availability and the four CWJ colors must be checked against the approved brand revision, not silently substituted.

| Experiment | Evidence required before claiming compatibility |
| --- | --- |
| Feed/infographic | Import actual 1080×1350 Studio SVG; edit headline as text, bind a token and native component, save, reopen and export. Compare dimensions, fonts, bounds and pixels. |
| Four-slide carousel | Four ordered editable native pages/artboards with distinct stable identities. Export every page and verify 4 files, 1080×1350 each; reopen native bundle with all media. |
| Story | 1080×1920 editable document; retain safe areas and source text. Test a token update and compare Studio/Doory/Penpot output. |
| Reel | Preserve three timecoded beats, stagger specification and sequential-page transfer. Require an actual chosen video renderer to encode duration, frame rate, audio and fonts; native page metadata alone is not motion. |
| Roundtrip/recovery | Export native `.penpot`, scene, tokens and assets; restore into a new authorized scope, remap native IDs and verify hashes, layout/version/approval/feedback lineage and denied old-scope access. |
| Callback | Capture a real supported event; authenticate relay, reject foreign scope and replay, deduplicate retry, reject stale revision, recover failed export, and mark Exported only after bytes are stored and verified. |

Penpot documents static PNG/JPEG/WEBP/SVG/PDF exports and multi-board PDF. PDF fidelity can differ from SVG. MP4, WebM and GIF rendering are not established by that export contract; an animation JSON spec is not a media file. [Export guide](https://help.penpot.app/user-guide/export-import/exporting-layers/)

Measure bundle construction and actual export separately on named hardware with cold/warm samples, p50/p95, fonts/assets, page count and concurrent users. The supplied <15ms bundle and <1.5s export numbers remain targets. No benchmark or editor roundtrip was performed here.

## Deployment dependencies and safety

The pinned [official Compose source](https://github.com/penpot/penpot/blob/ff7a66f51938b2293260ea27a64e2c4e0833b5e3/docker/images/docker-compose.yaml) includes frontend, backend, exporter, admin console, optional MCP, PostgreSQL15 and Valkey8.1 with persistent database/assets and health-dependent startup. Its Penpot image defaults are floating `2.18`; pin exact image digests before experiments. The supplied older `PENPOT_STORAGE_ASSETS_S3_BUCKET` is not this example's setting: it uses `PENPOT_OBJECTS_STORAGE_BACKEND`, `_S3_ENDPOINT` and `_S3_BUCKET`. A broker index does not isolate credentials, eviction, pub/sub or administrative commands. Use separate application users/databases with explicit privileges and distinct backup/restore procedures; test cross-editor migration and failure recovery before sharing infrastructure.

[Memorystore Redis](https://docs.cloud.google.com/memorystore/docs/redis/supported-redis-configurations) supports database count 1–100 configured at creation (default16), but that does not establish Redis Cluster/Valkey feature compatibility. Verify exact client commands and supported service variant. Shared indices 0/1 address naming only, not a tenant security boundary.

[GCS interoperability](https://docs.cloud.google.com/storage/docs/interoperability) supports some S3 clients through the XML endpoint `https://storage.googleapis.com`, HMAC credentials and compatible signing. It is not automatic shared-editor asset discovery. Test each SDK's endpoint, path addressing, signing, metadata and CORS. Preserve private access and server-owned namespace mapping. Do not add HMAC keys or public bucket access merely to make browser images load.

[Cloud Run WebSockets](https://docs.cloud.google.com/run/docs/triggering/websockets) need reconnect handling, external synchronization and bounded request duration; session affinity is best effort. An open socket keeps an instance active/billable. Thus two collaborators or an active MCP plugin can defeat a casual “scales to zero” cost assumption. Current Studio's 60-second HTTP configuration is not an editor collaboration deployment configuration.

## Current Virginia cost model

Read-only Google Billing Catalog queries retrieved current `us-east4` SKUs on 2026-10-18. The committed [price evidence](39-virginia-price-evidence.json) records service/SKU IDs, units, effective times and rates. It contains public prices, no account identifiers. Values are on-demand USD, not contractual quotes; no credits, tax, discounts or free-tier offsets are assumed. Month =730 hours.

| Component | Rate / illustrative usage | Monthly subtotal |
| --- | --- | --- |
| Memorystore Basic M1 | 1GiB ×$0.049/GiB-hour | $35.77 continuously provisioned |
| Cloud SQL PostgreSQL micro | $0.0112/hour | $8.18 compute only; not a validated editor sizing choice |
| Cloud SQL PostgreSQL small | $0.0375/hour | $27.38 compute only |
| Cloud SQL dedicated example | 2vCPU ×$0.0442 +8GiB ×$0.0075 per hour | $108.33 compute only |
| Cloud SQL regional standard storage | 20GiB ×$0.1819/GiB-month | $3.64; backups/other storage additional |
| GCS regional Standard | 10GiB ×$0.023/GiB-month | $0.23 storage only; operations and egress additional |

The 2vCPU/8GiB SQL example plus 1GiB Redis and 20GiB storage is **$147.74/month before any editor compute, existing Studio, model inference, backups or egress**. Even the unvalidated micro example is about $47.59 before those costs. This is arithmetic, not a measured resource recommendation. The official SQL pricing page also notes shared-core instances lack its SLA. [SQL pricing](https://cloud.google.com/sql/pricing), [Redis pricing](https://cloud.google.com/memorystore/docs/redis/pricing).

For a compute reference, [Cloud Run pricing](https://cloud.google.com/run/pricing) currently displays Tier1 instance rates of $0.000018/vCPU-second and $0.000002/GiB-second. At those rates, an always-active 1vCPU/1GiB container is $52.56/730-hour month before free tier; 2vCPU/4GiB is $115.63. These displayed Tier1 examples are not a verified Virginia editor quote. Multiply each frontend/backend/exporter/MCP instance's actual allocation and active seconds; include browser export workers and concurrent WebSockets. Keep region-specific calculator/catalog evidence before choosing a deployment.

A local Compose experiment adds no new cloud infrastructure but consumes host CPU/RAM, disk, energy and maintenance. A GCE Compose VM trades managed-service floors for a single failure domain: quote a Virginia machine with enough measured RAM for JVM, browser/exporter, Postgres, Valkey, Doory workers and concurrency, plus persistent disk, snapshots, IPv4 and egress. **No VM configuration or dollar quote is approved or verified here.** Start with a bounded local memory/cold-export benchmark, then price its measured requirements; a cheap shared-core VM is not proof of fit. [Compute pricing](https://cloud.google.com/products/compute/pricing), [GCS pricing](https://cloud.google.com/storage/pricing).

## Decision and sequenced work

Keep the existing Studio deployment and its $20 Run/$70 Vertex service caps and $100 aggregate alerts unchanged. Those caps do not cover SQL, Redis, VM, storage or every other service. Do not deploy a full managed editor stack within the current envelope on the assumption it is free.

1. Pin editor versions/licenses; run local native import/edit/export and token roundtrip fixtures for both brands/all four formats. Retain unsupported video/background-removal claims as unresolved. Rollback: delete only isolated experiment files/volumes.
2. Implement an authenticated tenant-scoped adapter and portable handoff only after native mappings pass; add conflict/replay/foreign-scope tests. Keep existing exports as a fallback.
3. Test isolated Compose recovery, collaborator reconnect, fonts, private media, exporter limits and peak memory. Failure must not mutate existing Studio calendars or assets.
4. Reprice the measured VM and managed alternatives, including model use and egress; obtain a concrete infrastructure decision before any provisioning. Choose service accounts, data boundaries and backup responsibility per editor, with a separate rollout/rollback plan.

This document completes a bounded upstream/operations research slice of #39. It does not establish the entire investigation's artifact, instructional or live integration acceptance.
