# Existing local Penpot media boundary

This extends the approved #52/#54 registered editor/private-asset modules. It creates no cloud resources, editor backend fork, service image or new storage system. The existing owned Penpot frontend remains the only published native surface. The opt-in candidate callback is reserved on **39038**; ports39035–39037 belong to other fixtures. No ingress change is authorized merely by building this source: the frozen configuration and complete inventory must be reviewed before the owned frontend is changed.

## Authority and copy semantics

Studio authorizes the current managed Google actor, organization/brand membership, source/generation/brand/native revisions, registered native owner/project and private image rights/generation/hash before transferring bytes. The native action adds one image fill to current state; it never writes a stale document snapshot or claims editorial approval.

The presented native session must identify the registered native owner. Each media read calls the pinned official `get-profile` and `get-file` with that presented session; the private operator session is never substituted. Current registration, Studio actor/membership and private source-asset generation are also rechecked. No positive authorization decision is cached. Native identity and Studio identity remain different concepts: this does not create Google-to-Penpot SSO or prove multiplayer isolation.

The transfer creates an authorized external native copy. Future Studio grants/access can be revoked, and future governed reads can be denied. Bytes already delivered, downloaded, exported or independently retained by an authorized native owner cannot be retrospectively revoked. Portable imports do not restore the security registry or grant new native access.

## Fixed ingress

The official frontend supports `server.d` overrides. The supplied override guards **all** `/assets/` paths, including object IDs and file-media IDs, with an internal authorization subrequest to the existing Studio candidate. It preserves filesystem `X-Accel-Redirect` delivery through an internal-only alias and emits `private, no-store` plus `Vary: Cookie` on the final bytes. External storage redirects are rejected; this experiment supports the existing filesystem backend only. Shared proxy caches are bypassed. The marker is a configuration check, not independent privacy acceptance.

The callback strips unrelated cookies/Google bearers and accepts only the native `auth-token` session for fixed local RPCs. It serves no bytes or credentials. File permission responses are bounded to2MiB; larger native files explicitly fail closed. There are at most eight in-flight permission checks per process. Native RPCs have10-second deadlines; account lookup lifetime follows the existing managed-identity client, so no claim of cancellation is made when an upstream request outlives a disconnected caller.

Asset URLs must use the exact UUID paths without query parameters. This intentionally rejects cache-busting/share query strings rather than silently accepting a new access path. Inspected official font construction and observed native image URLs use those unqueried paths. Native exports must be checked too: the pinned exporter creates native session cookies, but source compatibility is not an observed successful export through this new ingress.

## Inventory before enablement

New uploads get a durable security locator outside portable scope data. The locator is not authority: reads revalidate the current ledger, binding epoch, actor, immutable image generation and official file ACL. Upload IDs survive unknown responses; existing IDs are not blindly replaced or speculatively deleted.

Existing fonts are enumerated from the registered operator manifest, including exact persisted font-object IDs and their native file/project/owner. Existing raster copies require an explicit bounded `legacyMedia` inventory tied to a registered **document** resource, exact file-media/object IDs, hash, rights and consent. That document resource is read-only in this adapter; it is not accepted by the token/image write transport. No wildcard font, file, project, URL or public bucket allowance exists.

Before rollout, read-only inventory must account for every asset used by the existing registered human-edited file. The current private manifest enumerates Mona Sans400/700, Inter400 and Instrument Serif400. The newly created anonymous-delivery fixture contains three copies of the original controlled PNG; those copies must be inventoried separately if retained. Unknown legacy references are reported and resolved before enabling the ingress; they are not silently allowed or silently broken. A new target configuration requires current founder registration under the existing target-hash rule.

## Acceptance and rollback

Only BrowserOS neo may perform the current local runtime tests. Required observations are native-owner positive bytes/hash; anonymous and foreign-native-principal denial on both media paths and fonts; no shared-cache reuse; denied direct internal-filesystem/raw-backend routes; preserved existing native file/text/fonts; additive image render/export; and independent native archive recovery. Record actual actor, scope and native revisions without sessions or secrets. No production/private completion claim follows from compile checks or a marker response.

The overlay changes only the owned frontend's configuration mount. Preserve its volumes, original Compose/configuration and source/byte manifests. Rollback removes that overlay and disables `STUDIO_PENPOT_PRIVATE_INGRESS`; do not transfer private images after returning to the upstream public by-ID behavior. Existing private assets remain in Studio. No unrelated container, project, native file or cloud service is stopped, pruned or reconfigured.
