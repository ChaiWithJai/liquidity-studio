# Download a registered Penpot design for recovery

Open the saved campaign in Studio. When its registered design is ready and native
recovery downloads are configured, choose **Download Penpot recovery kit**, then
follow the prepared download link within two minutes. Save native edits first.
The native gateway uses the currently connected Penpot account. It never sends
that account's cookie or an operator session to the downloaded kit.

Keep this ZIP **and** the separate Studio recovery kit from Operations. The
Studio kit retains the brand, sources, backlog and supported Studio layouts/media.
The Penpot kit retains this registered native file, its embedded media and the
fonts actually referenced by it. Neither download is a full installation backup.

The native ZIP contains:

- `design.penpot`: exact output of the official pinned `export-binfile` command,
  one registered file with embedded assets and no external-library dependency.
- `penpot-font-recovery.json`: the existing schema-1 font recovery pack, including
  the same archive, actual custom font UUIDs, original source bytes and OFL notices.
- `fonts/`: those exact licensed originals and notices as separate readable files.
- `recovery-manifest.json`, `SHA256SUMS` and `RESTORE.md`: source file/revision,
  hashes, scope and explicit destination steps. No accounts, pairing, grants,
  session cookies or identity snapshot are included.

## Restore

Use the existing [font recovery operator page](penpot-font-recovery.md) on the
destination with this kit's `penpot-font-recovery.json` as `packPath`. Its private
configuration fixes the destination profile, team and project. Review the explicit
destination acknowledgement. It preflights every font UUID conflict, preserves
original UUIDs only when absent in that fresh destination, and checks the uploaded
source bytes and generated variants. Keep its same intent and journal on an
interrupted response. Do not overwrite a conflicting font or infer a remap.

Then use the normal destination Penpot dashboard to import `design.penpot` into
the intended project. The sidecar page does not import or modify the archive.
Check every page, text/font, image, geometry and PNG/SVG result before retiring the
source. Importing gets destination native identifiers; it **does not reconnect
Studio automatically**. Record the destination IDs for explicit operator registration. Existing Studio
layout adopt actions do not adopt a newly imported Penpot campaign file; this kit
adds no automatic campaign-record adoption. No automatic remapper
or transfer of authority is claimed here. Governed-workspace import restrictions
are unchanged; this restore path targets a fresh ungoverned destination.

## Operator integration and current limits

This source adds an optional `studio-recovery: true` request to the pinned official
`export-binfile` schema. The result is a versioned SSE end record binding the exact
file. The archive's storage object has a server-authored source-file pointer in
`studio-file-export`; the existing native byte seam rechecks the current session,
native file ACL and current governed access before filesystem/X-Accel delivery.
Anonymous or stale access cannot fetch it. The new bucket uses the original
native tempfile garbage-collection expiry, not indefinite retained payloads.
Default-off native behavior remains unchanged. Governed S3 redirect delivery is
unsupported, as in the existing byte seam.

The existing hook verification recipe applies `export.patch` and explicitly loads
`app.rpc.commands.binfile` and `app.storage.gc-touched` alongside the existing
asset namespaces. A **fresh hosted native hook verification and candidate** are
required before activating this source. An old backend's public-tempfile SSE
response is rejected before any archive fetch. Do not expose a raw native output
URL to work around it.

The local-tools provider attaches the service and the native gateway adds only
`/studio-recovery-kit`. The native frontend must load the matching exact Nginx
location from `tools/penpot-native-connect/server.conf.example`; it forwards the
presented native cookie through the existing private gateway header. Permit URLs
are one-use, expire in two minutes and are not access-logged. The server checks
current story/source/file identity before and after export and confirms the native
profile again before returning the kit. Downloads do not mutate native documents.
Managed providers with `localTools: false` do not advertise this action; no managed
routing or deployment is added here.

Bounds: one active export per scoped service, at most two pending permits, 55-second
native request deadline, 64 KiB SSE, 10 MiB archive, at most eight verified font
variants, 32 MiB expanded archive/2,048 entries and a 40 MiB final ZIP. Referenced
fonts must match the current registered native font IDs/family/weight and exact
licensed repository sources. Unknown/builtin/unverified fonts fail clearly; their
saved content is not rewritten or silently substituted. ZIP paths, embedded font
references and the single-file manifest are checked before delivering the kit.

This is source implementation, not completed browser restore acceptance. Hosted
regressions cover exact archive/font bytes, checksum/sidecar compatibility,
current-scope/revision failures, expiry/one-use behavior, old-public-backend refusal,
strict SSE locations, archive font/file mismatch and private gateway delivery.
No local test runner, build, new instance, native request or runtime change was
performed for this slice.

Pinned upstream source: [binfile command](https://github.com/penpot/penpot/blob/ff7a66f51938b2293260ea27a64e2c4e0833b5e3/backend/src/app/rpc/commands/binfile.clj),
[SSE encoding](https://github.com/penpot/penpot/blob/ff7a66f51938b2293260ea27a64e2c4e0833b5e3/backend/src/app/http/sse.clj),
[tempfile GC](https://github.com/penpot/penpot/blob/ff7a66f51938b2293260ea27a64e2c4e0833b5e3/backend/src/app/storage/gc_touched.clj).
Retained actual 2.18.3 archive inspection confirms a plain UUID string in
`manifest.files[].id`, `generatedBy: penpot/2.18.3`, and camelCase `fontId` custom
references. The reader also accepts the corresponding kebab-case font key.
