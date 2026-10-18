# Native private asset HTTP seam

Original source preparation against Penpot 2.18.3
`ff7a66f51938b2293260ea27a64e2c4e0833b5e3`. No local compile, test runner,
Docker pull, native request, file change or runtime activation was performed.

`assets.patch` wraps the two byte-delivery sites in
`backend/src/app/http/assets.clj`: raw `/assets/by-id/:id`, and the shared
`/assets/by-file-media-id/:id`/thumbnail helper. Existing native session/access-token
middleware and existing file-media ACL checks remain. The global `app.http` router
decodes cookie/bearer tokens with `session/decode-token`; asset-route `session/authz`
then reads the actual session row and attaches `::session/profile-id` and
`::session/session`. C3 captures that verified request context, including decoded
token issuance/expiry, rather than treating a presented cookie as authority. The original MPL notice is
retained. Install the original `assets.clj` as `backend/src/app/studio/assets.clj`
and `assets_test.clj` as `backend/test/app/studio/assets_test.clj`.

## Stored-resource joins

Ownership is resolved from persisted native rows, never client metadata, a query
scope, a Referer or an unguessable storage UUID:

- `file_media_object.media_id` or `thumbnail_id` → `file_id` →
  `file.project_id` → `project.team_id`.
- `team_font_variant.ttf_file_id`, `otf_file_id`, `woff1_file_id` or
  `woff2_file_id` → `team_id`.
- `file_tagged_object_thumbnail.media_id` and `file_thumbnail.media_id` →
  `file_id` → the same file/project/team join.
- Current `file-data` uses the stored object's native metadata file/id only after
  matching `file_data(file_id,id).metadata->>'storage-ref-id'` to that exact object
  UUID, the same predicate as pinned `storage/gc_touched.clj`. A legacy
  `file-data-fragment` object without this exact current reference refuses instead
  of being classified as public/personal.

Soft-deleted reference rows stay in classification. File admission additionally
requires shared `access/current-file-team` to match the reference, excluding deleted
files/projects, before native ACL. Font admission requires both its variant and
team rows to be live before native team ACL. Missing references, unknown team identities and
more than 64 distinct native references fail closed when configured. Other
buckets retain the pinned native behavior; this is not a claim to rewrite native
profile-photo or organization-logo sharing semantics.

## Current admission and deduplication

Absent `::access/governed-teams` leaves byte delivery unchanged. Known personal-only
references retain the existing native path. If any reference is governed,
anonymous and token-only/no-real-session delivery deny. Constructor-supplied
`::access/capture-session(request)` and `::access/session-valid?(cfg,context)` use
the same C3 actual session manager, token times and current-row expiry logic.
The bootstrap owner must install the same authority, governed-team registry and
validator callbacks on `:app.http.assets/routes`, preserving its existing storage
and session-manager references. No request can select these callbacks.

At least one **current authorized reference** is required. A governed reference
needs both actual native ACL and current Studio `authorize-resource :asset`;
operator ownership or public share IDs do not bypass that requirement. A verified
current native profile with actual native ACL to a legitimate personal reference
can read known deduplicated bytes, even if another reference is governed. The
existence of a personal row alone never grants access. Users need not have every
brand's grant merely because identical font bytes were deduplicated. Previously
delivered/copied bytes cannot be recalled.

The existing filesystem/X-Accel delivery remains intact. Successful protected
responses and denials have `Cache-Control: private, no-store`, `Pragma: no-cache`,
`Expires: 0` and `X-Accel-Expires: 0` before the internal byte handoff. Current native
session validity is checked again before returning the response. Authority denial
returns 403; unavailable storage/authority/unsupported delivery returns a private
503, not a public fallback. Governed S3 signed redirects are explicitly refused:
no-store does not make a transferred presigned URL revocable. Personal-only S3
behavior remains unchanged. No new cloud streaming mode or public asset bypass
is introduced.

## Verification and remaining evidence

The focused native namespace is `app.studio.assets-test`. Controlled persisted-row,
native-ACL and current-session/authority doubles cover default-off/personal
preservation, anonymous/foreign/expired denial, exact governed filesystem headers,
deduplicated legitimate personal access, missing references, bounded joins and
unsupported S3 redirect refusal. These tests do not replace actual native HTTP
byte/readback and current identity/revocation acceptance.

Add the module/test/patch to the reviewed manual native hook verification before
any owned runtime. Its actual native namespaces must compile against the pinned
backend. Later BrowserOS neo acceptance must observe owned positive delivery,
anonymous/foreign/revoked/expired negatives and native font/image rendering through
the published frontend, including cache/internal redirect behavior. No current
Studio GCS proof, old private-ingress proof, RPC-only result or header assertion
alone establishes this native HTTP boundary. Keep editing disabled if that native
integration is not accepted.
