# Private Penpot image render checkpoint

This follows the [private raster delivery investigation](penpot-private-raster.md). It records an actual failure after a governed image action, not completed #54 acceptance.

On source `809528c`, a separately authorized operator used the existing managed Google account lookup and current Studio membership to stage the exact original controlled alpha image in the owned cloned fixture. The actual native plugin, on a separate fixed39039 host, claimed and acknowledged the one-use action through the normal native UI. This is operator-managed setup plus native UI proof, **not normal Google Studio image-picker acceptance**. No fabricated bearer, custom token or changed production allowlist was used.

Saved native revision15 contained exactly one new240×240 image in the registered finance frame. An independent official get-file read through Neo found the same9pages/50texts, all78 protected original-object/page-order hashes unchanged, and the human headline retained. The durable acknowledgement explicitly recorded `pixelsVerified:false` and `publicationApproved:false`. Owner reads of the new file-media path returned the original198,985bytes/SHA; anonymous reads returned403/no-store.

The subsequent PNG was byte-identical to the pre-image PNG and visually lacked the image. The SVG contained the new image reference, but it remained a protected localhost URL; fonts were protected URLs too. The native renderer's file-media request ended499 when its browser closed. A correct saved shape and successful upload therefore did not establish render fidelity. The frontend was rolled back before the private callback/plugin stopped. The owned database/native backups and failure outputs were preserved. No maintained Studio or cloud runtime changed.

## Measured authorization cost

A separate single current-owner asset read was observed through Neo with private callback timing instrumentation, without changing authorization decisions. Browser completion took5,356ms; the callback took5,344ms. Its28 managed-actor calls consumed5,208ms. Native get-profile took23.6ms and get-file35.7ms;91local store reads consumed17.8ms and four asset checks14ms. These measurements describe one request, not a benchmark or latency guarantee.

The pinned [bitmap renderer](https://github.com/penpot/penpot/blob/ff7a66f51938b2293260ea27a64e2c4e0833b5e3/exporter/src/app/renderer/bitmap.cljs) navigates, sleeps1second, waits for fonts and a visible frame, then captures. The [browser wrapper](https://github.com/penpot/penpot/blob/ff7a66f51938b2293260ea27a64e2c4e0833b5e3/exporter/src/app/browser.cljs) supplies the native auth-token cookie and defaults navigation to network-idle. There is no explicit final image decode fence in that bitmap sequence. The499 plus measured cost support a resource-read/render timing hypothesis; they do not prove that shortening authorization alone repairs all output.

## Bounded follow-up

The implementation deduplicates only raw managed-account lookup promises within two separate server-injected authority phases: resolve/authorize before official file ACL read, and a fresh resolve/authorize phase afterward. It never caches `authorizeJobActor` results. Every invocation still reads the current local principal/allowlist and compares the original approval timestamp against the provider record; membership, source, binding, image-generation and native ACL checks remain.

Each phase creates a new per-GoogleIdentity-instance asynchronous context, keyed by normalized email, and clears it on exit. A second phase and a different HTTP request always obtain a fresh provider record. Jobs outside these explicitly scoped media-read phases retain fresh lookups. Provider changes after the final lookup still have the ordinary authorization/response race; there is no claim of instantaneous revocation. No public asset exemption, internal-IP trust, shared operator cookie, global positive cache or resource lease is added.

Authored hosted regressions cover28 local checks with two provider lookups, concurrent-request isolation, provider disable/revocation between phases, local-principal and approval-time changes within a phase, provider failure, and no reuse by later requests or ordinary jobs. They have not been run locally under the Neo-only constraint. Exact-head CI, actual repeated timing and actual native pixels remain separate gates. Cultural image coverage and independent archive/image/font recovery remain open, as does standalone SVG resource embedding.
