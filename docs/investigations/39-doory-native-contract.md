# Doory native document and access research

Research for issue #39, recorded 2026-10-18. Read-only source inspection at pinned commit 27b6f68221fdbf1ef1bedc182e303210ca9e39f5. No UI, backend mutation, cloud operation or implementation performed. Source statements below are verified by code; proposed fixture is not a runtime import/edit/export proof.

## Native JSON boundary

POST /designs/ accepts document; GET returns full document; PATCH document requires base_revision and stale saves return HTTP 409. This is a native document API, not a downloaded native file workflow.

[backend/apps/designs/views.py:98](https://github.com/shaongitbd/doory/blob/27b6f68221fdbf1ef1bedc182e303210ca9e39f5/backend/apps/designs/views.py#L98), [backend/apps/designs/serializers.py:109](https://github.com/shaongitbd/doory/blob/27b6f68221fdbf1ef1bedc182e303210ca9e39f5/backend/apps/designs/serializers.py#L109), [backend/apps/designs/serializers.py:134](https://github.com/shaongitbd/doory/blob/27b6f68221fdbf1ef1bedc182e303210ca9e39f5/backend/apps/designs/serializers.py#L134), [frontend/src/lib/api/designs.ts:4](https://github.com/shaongitbd/doory/blob/27b6f68221fdbf1ef1bedc182e303210ca9e39f5/frontend/src/lib/api/designs.ts#L4).

## Portable file gap

Built-in file commands offer save/download/share/history, not whole-document file import/export. Registered output formats are PNG/JPG/PDF/SVG/server PDF plus MP4/WebM/GIF. Repository search found no .doory handler. Treat this as a gap at this pin, not proof no external extension exists.

[frontend/src/editor/builtins/commands.tsx:69](https://github.com/shaongitbd/doory/blob/27b6f68221fdbf1ef1bedc182e303210ca9e39f5/frontend/src/editor/builtins/commands.tsx#L69), [frontend/src/editor/engine/export/formats.ts:161](https://github.com/shaongitbd/doory/blob/27b6f68221fdbf1ef1bedc182e303210ca9e39f5/frontend/src/editor/engine/export/formats.ts#L161), [frontend/src/editor/engine/export/video/formats.ts:32](https://github.com/shaongitbd/doory/blob/27b6f68221fdbf1ef1bedc182e303210ca9e39f5/frontend/src/editor/engine/export/video/formats.ts#L32).

## Clipboard is not a package

`application/x-doory+json` contains kind `doory-clipboard/v1`, selected objects and source page dimensions, not all document pages/assets/audio/version history.

[frontend/src/editor/engine/clipboardFormat.ts:3](https://github.com/shaongitbd/doory/blob/27b6f68221fdbf1ef1bedc182e303210ca9e39f5/frontend/src/editor/engine/clipboardFormat.ts#L3).

## Native schema and Fabric

DoryDocument `schemaVersion: 1`, CSS pixels at 96 dpi, dimensions/unit/pages, optional audioTracks/meta. Objects carry stable id/type and Fabric props. Declared Fabric `^7.2.0` resolves to `7.4.0` in lock. `toObject(EXTRA_PROPS)` preserves custom props; `toJSON()` drops them. Types normalized lower-case, version removed; class registry reconstructs objects and falls back on unknown types. A generic Fabric JSON blob is not proven compatible.

[frontend/src/types/document.ts:1](https://github.com/shaongitbd/doory/blob/27b6f68221fdbf1ef1bedc182e303210ca9e39f5/frontend/src/types/document.ts#L1), [frontend/src/editor/engine/serialization.ts:1](https://github.com/shaongitbd/doory/blob/27b6f68221fdbf1ef1bedc182e303210ca9e39f5/frontend/src/editor/engine/serialization.ts#L1), [frontend/src/editor/engine/serialization.ts:114](https://github.com/shaongitbd/doory/blob/27b6f68221fdbf1ef1bedc182e303210ca9e39f5/frontend/src/editor/engine/serialization.ts#L114), [frontend/src/editor/engine/serialization.ts:228](https://github.com/shaongitbd/doory/blob/27b6f68221fdbf1ef1bedc182e303210ca9e39f5/frontend/src/editor/engine/serialization.ts#L228), [frontend/package-lock.json:2865](https://github.com/shaongitbd/doory/blob/27b6f68221fdbf1ef1bedc182e303210ca9e39f5/frontend/package-lock.json#L2865).

## Asset portability

Guest adapter stores browser-local `idb://` assets; local-reference collector/rewriter handles nested objects/background/audio. Server refuses local references. JSON alone is not a self-contained asset/font archive; a future portable package needs manifest, bytes, licenses, bounded validation and rewriting.

[frontend/src/features/editor/adapters/guestAdapter.ts:30](https://github.com/shaongitbd/doory/blob/27b6f68221fdbf1ef1bedc182e303210ca9e39f5/frontend/src/features/editor/adapters/guestAdapter.ts#L30), [frontend/src/lib/document.ts:42](https://github.com/shaongitbd/doory/blob/27b6f68221fdbf1ef1bedc182e303210ca9e39f5/frontend/src/lib/document.ts#L42), [backend/apps/designs/validators.py:1](https://github.com/shaongitbd/doory/blob/27b6f68221fdbf1ef1bedc182e303210ca9e39f5/backend/apps/designs/validators.py#L1).

## SVG editability distinction

Uploaded SVG is accepted as an image MIME; createImage uses FabricImage.fromURL. Separate createElementFromSvg parses SVG elements for catalogue elements. Neither establishes arbitrary Studio SVG upload as editable text/layers or a reversible native-document import.

[frontend/src/features/editor/adapters/images.ts:3](https://github.com/shaongitbd/doory/blob/27b6f68221fdbf1ef1bedc182e303210ca9e39f5/frontend/src/features/editor/adapters/images.ts#L3), [frontend/src/editor/engine/objects/factories.ts:223](https://github.com/shaongitbd/doory/blob/27b6f68221fdbf1ef1bedc182e303210ca9e39f5/frontend/src/editor/engine/objects/factories.ts#L223), [frontend/src/editor/engine/objects/factories.ts:248](https://github.com/shaongitbd/doory/blob/27b6f68221fdbf1ef1bedc182e303210ca9e39f5/frontend/src/editor/engine/objects/factories.ts#L248).

## Identity and tenant mismatch

REST defaults `SessionAuthentication` and `IsAuthenticated`; Design.owner is the tenant boundary and queryset owner-filtered. Version reads/restores also resolve owner-owned parent. No organization/brand contract in Design model. Studio Firebase bearer identities/memberships need an explicit server-side integration; never copy client-supplied owner or trust share possession as brand membership.

[backend/doory/settings/base.py:193](https://github.com/shaongitbd/doory/blob/27b6f68221fdbf1ef1bedc182e303210ca9e39f5/backend/doory/settings/base.py#L193), [backend/apps/designs/models.py:48](https://github.com/shaongitbd/doory/blob/27b6f68221fdbf1ef1bedc182e303210ca9e39f5/backend/apps/designs/models.py#L48), [backend/apps/designs/views.py:63](https://github.com/shaongitbd/doory/blob/27b6f68221fdbf1ef1bedc182e303210ca9e39f5/backend/apps/designs/views.py#L63), [backend/apps/designs/views.py:195](https://github.com/shaongitbd/doory/blob/27b6f68221fdbf1ef1bedc182e303210ca9e39f5/backend/apps/designs/views.py#L195).

## Share disclosure and writes

Shared GET intentionally allows anonymous valid-token document access, including uploaded font references. Active links check enabled, expiry, design trash and owner status; optional password gate. PATCH requires authenticated user, edit role and base_revision. Public share is a deliberate capability boundary that must be disabled or restricted for confidential brand data.

[backend/apps/sharing/views.py:192](https://github.com/shaongitbd/doory/blob/27b6f68221fdbf1ef1bedc182e303210ca9e39f5/backend/apps/sharing/views.py#L192), [backend/apps/sharing/views.py:231](https://github.com/shaongitbd/doory/blob/27b6f68221fdbf1ef1bedc182e303210ca9e39f5/backend/apps/sharing/views.py#L231), [backend/apps/sharing/services.py:41](https://github.com/shaongitbd/doory/blob/27b6f68221fdbf1ef1bedc182e303210ca9e39f5/backend/apps/sharing/services.py#L41).

## Collaboration authorization

Socket checks origin; requires authenticated session; owner grant or matching design share token/password. Role limits writes, periodic/event rechecks close disabled/session-ended/revoked/expired/role-changed access. Need deployment tests of revocation latency and multi-instance signaling, not just HTTP-owner checks.

[backend/apps/collab/consumers.py:41](https://github.com/shaongitbd/doory/blob/27b6f68221fdbf1ef1bedc182e303210ca9e39f5/backend/apps/collab/consumers.py#L41), [backend/apps/collab/consumers.py:113](https://github.com/shaongitbd/doory/blob/27b6f68221fdbf1ef1bedc182e303210ca9e39f5/backend/apps/collab/consumers.py#L113), [backend/apps/collab/access.py:50](https://github.com/shaongitbd/doory/blob/27b6f68221fdbf1ef1bedc182e303210ca9e39f5/backend/apps/collab/access.py#L50), [backend/apps/collab/room.py:368](https://github.com/shaongitbd/doory/blob/27b6f68221fdbf1ef1bedc182e303210ca9e39f5/backend/apps/collab/room.py#L368), [backend/apps/collab/room.py:644](https://github.com/shaongitbd/doory/blob/27b6f68221fdbf1ef1bedc182e303210ca9e39f5/backend/apps/collab/room.py#L644), [backend/apps/collab/store.py:413](https://github.com/shaongitbd/doory/blob/27b6f68221fdbf1ef1bedc182e303210ca9e39f5/backend/apps/collab/store.py#L413).

## Proposed tiny Studio conversion experiment

Use one approved, nonclinical Studio campaign fixture with no external images or secrets. Produce one 1080 × 1350 schema-v1 page, white solid background, editable textbox heading and body, stable UUID layer/page IDs and a provenance note. Use backend doc/builders.py build_text rather than copying SVG coordinates blindly: native origin is center, input builder positions top-left and text height depends on actual font metrics. The [proposed JSON fixture](fixtures/39-doory-proposed-document.json) illustrates shape only; it has not been imported, validated by the upstream runtime or visually proven. It is API create-request JSON, not a supported `.doory` file format.

Upstream: scoped Studio campaign/revision/source-review provenance + brand fonts/colors -> a version-pinned converter -> DoryDocument validator -> authenticated create under server-mapped owner -> editor hydrate/font load -> change heading as text -> save/reload with revision -> native JSON GET -> same-layer/font/geometry comparison -> SVG/PNG/video outputs separately. Keep Studio provenance and org/brand mapping in a server-owned integration record; Doory meta is not an authorization boundary.

Next proof must test real native API create/get/update, two pages, text edit without rasterization, reload, stale-revision HTTP 409, font presence, and owner/outsider/share/room revocation. A portable archive must additionally survive export, delete/local-storage loss and import into a fresh authorized account with assets/fonts accounted for. Do not label plain JSON or rendered SVG as a complete native backup. No package or endpoint is proposed for production until security/licensing and actual round-trip evidence are reviewed.

## Acceptance gaps and ownership

| Contract | Required proof before claiming support |
| --- | --- |
| Native editable conversion | Pin the converter and upstream schema/Fabric versions; create through the real API, edit text and shapes, save, reload and compare object IDs, geometry and fonts. The proposed fixture covers only two textboxes on one page; multipage and media cases need separate fixtures. |
| Portable asset manifest | Specify document schema, asset hashes/MIME/size, font files and licenses, relative references, archive bounds and missing-asset behavior. Restore into a fresh authorized account/browser without the original IndexedDB or expiring URLs. |
| SVG paths | Test uploaded SVG and catalogue SVG parsing separately. Record whether text remains text, shapes remain selectable, fonts survive and unsupported features are rejected or reported. A rendered SVG/PNG download alone does not pass native editability. |
| Identity mapping | Define server-owned mapping from Studio Google principal and organization/brand membership to Doory owner/session. Test cross-brand denial, disabled users, logout and revoked membership. No bearer-token interchangeability is established. |
| Shares and rooms | Decide whether public capability links are allowed. Test anonymous read, authenticated edit, password/expiry/revocation, version ownership, WebSocket origin and role enforcement, plus revocation propagation across replicas. |

These are investigation acceptance items, not implemented Studio adapters or authorization for deployment. The [guest build experiment](39-doory-guest-build.md) records separate browser evidence; it does not supply these native API, portability or tenancy results. Subsequent experiments should append their own exact-version evidence rather than retroactively treating this source inspection as runtime proof.
