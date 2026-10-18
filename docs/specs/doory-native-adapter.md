# Doory native adapter slice (#53)

This slice converts a validated Studio multimodal specification to native schema-v1 documents at [Doory27b6f68](https://github.com/shaongitbd/doory/tree/27b6f68221fdbf1ef1bedc182e303210ca9e39f5), using the [native schema](https://github.com/shaongitbd/doory/blob/27b6f68221fdbf1ef1bedc182e303210ca9e39f5/frontend/src/types/document.ts) and [Fabric7 serialization](https://github.com/shaongitbd/doory/blob/27b6f68221fdbf1ef1bedc182e303210ca9e39f5/frontend/src/editor/engine/serialization.ts). It does not wrap an SVG/image or call a generic `fabricJson` endpoint. Existing Studio export and deployed runtime configuration remain unchanged.

## Conversion and token authority

`compileDooryDocument({spec,format,availableFonts})` returns `{document,manifest}`. The native document has `schemaVersion`, pixel dimensions, `unit` and `pages`, with native textbox/rect objects. Infographic and carousel use1080×1350; story and reel use1080×1920. Carousel has four pages. Reel has three pages with duration3/12/15 seconds and original/proposed timecodes in notes. This is a storyboard duration contract, not a rendered30-second video.

Stable object IDs exist within each stable page ID, including subject placeholder, brand badge, heading and three metric cards. Missing cutouts are explicit dashed rect placeholders, not a claim that background removal ran. Curved badge text and animation remain unsupported. Additional editorial copy is native text; full semantic content and source field mappings remain in page notes. The separate manifest preserves the entire source campaign, approved source snapshot, checksums, source/generation/profile revisions and token bindings. Notes over the native5000-character bound reject explicitly rather than truncate. This does not guarantee a finished layout for every possible text length; rendered overflow and all glyphs require browser measurement.

A trusted font registry must contain exact family and SHA256 entries. The compiler rejects missing families; local writes also reject families absent from the registered owner's verified target registry. Slash-separated legacy font names select the first explicit family. Hash registration alone does not prove shaping, every requested weight or every glyph rendered correctly. In particular, CWJ's Devanagari mark needs its own glyph/fallback acceptance.

`applyDooryBrandTokens` checks the prior brand revision, source checksum and stable page/layer mapping before changing bound fill/stroke/font properties and page backgrounds. It preserves human native text, geometry, IDs and notes, and returns a new manifest at the new brand revision. Human edits remain proposals requiring Studio source/brand revalidation; the original source snapshot is retained, not silently rewritten to approve the edits.

## Registered local transport

The [#52 boundary](editor-identity-boundary.md) remains the authority for Studio membership, binding and resource resolution. `DooryLocalTransport` is an explicitly injected investigation adapter, not enabled by default or selected by a client URL/environment variable. It only targets loopback39007, accepts a constructor-owned native-owner session registry, rejects redirects and uses a15-second request timeout. Native IDs come from the registered resource. Native document version kind/schema/commit are exact. Supported operations are read, bounded native patch with optimistic revision, and JSON API copy. Unknown fields, caller endpoints/credentials/identities, arbitrary object kinds and unversioned writes reject before I/O. Membership is reauthorized immediately before fetch and again by the boundary on completion. Accepted remote writes cannot be instantly undone by later revocation; no such guarantee is made.

Doory assigns new design IDs. Initial create/import is explicit authenticated operator setup, followed by founder registration of the returned ID. It is not client self-registration, a new runtime provisioning slot or proof of managed Google-to-Django identity federation. Registered operations use isolated test-mode Studio identities against actual Doory QA sessions. The production Studio remains Google-only; no app credential database is introduced into it.

## Actual local evidence and remaining gates

[Sanitized API evidence](../investigations/53-doory-native-api-evidence.json) records both brands × four formats against the actual pinned local backend. Native create/GET preserved exact JSON; registered native edit/reload, stale-revision409, token-swatch update preserving human text and exact JSON API copy passed. Native outsider ownership, wrong native session, foreign registered resource and Studio cross-brand membership checks rejected. These checks use separate Studio and native identities and do not conflate native ownerA/ownerB with Studio brands.

The first font-byte HTTP check failed404: production Gunicorn does not serve the upstream `/media` paths; upstream deployment expects a separate web/media server. The disposable preview now uses a strict local whitelist of known QA-uploaded, licensed font paths. Uploaded backend storage bytes and HTTP-served bytes are SHA256-matched to the bundled source fonts. No general media route, portraits, bucket/public share, credential or backend-auth change is included. This local reverse-proxy correction is not a production protected-asset delivery implementation or #52 S3/GCS client-interoperability acceptance.

| Boundary | Evidence / remaining acceptance |
| --- | --- |
| Native schema/API and scoped registered operations | Actual local API checks above plus Node22 regression suite. |
| Native browser hydration, text editing, save/reload | Pending independent browser acceptance on these generated campaign documents; prior tiny fixture evidence is separate. |
| Swatch reaches rendered pixels, fonts/glyphs/layout | Native saved properties and font bytes verified; browser/export pixel and glyph checks still required. |
| Native export | JSON API copy verified; not a self-contained native archive. Actual rendered SVG/PNG/MP4 on these campaigns remains separate. |
| Media/cutout/30-second video | Not implemented or proven by canvas JSON or durations. |
| Hosted identity, assets and licensing | Local test sessions/whitelisted licensed fonts only. Protected production asset delivery, managed identity federation, upstream UI/AAL and commercial licensing remain unresolved. |

Issue53 and parent39 remain open for those boundaries. No cloud provisioning, pilot image or traffic change occurs here. Rollback disables optional adapter/binding access while retaining raw source generation, native documents/revisions and Studio's existing exporter.

## Reproduction

Use the preserved owned local Doory stack and original QA fixture; never substitute a hosted API or another application's port. Check host/Docker VM free disk and memory before starting the existing containers; no pull/prune is needed. Keep credentials in a private evidence directory. The script requires its existing `private.env` with `QA_PASSWORD`, uses only fixed loopback API39007, and creates additional distinctly named documents rather than modifying the original fixture.

Copy `scripts/investigations/doory-font-preview.config.ts` to the owned pinned frontend as `vite.studio-adapter-local.config.ts`. Start that frontend with explicit `VITE_API_PROXY=http://127.0.0.1:39007` and private `DOORY_FONT_BRIDGE_FILE=<evidence-dir>/font-bridge.json`, using `npm run dev -- --config vite.studio-adapter-local.config.ts --host 127.0.0.1 --port 39006 --strictPort`. The proxy fixes WebSocket target39009 and refuses all `/media` routes except hash-checked font whitelist entries. It must remain loopback-only.

Then run on Node22:

```sh
NODE_ENV=test DOORY_EVIDENCE_DIR=<private-evidence-dir> node scripts/investigations/doory-adapter-acceptance.mjs
cd liquidity-studio
node --test server/doory-native-adapter.test.js server/editor-boundary.test.js server/multimodal-contract.test.js
```

The local script uploads only bundled licensed fonts if missing, checks stored/served font bytes, creates eight documents, performs registered operations and writes private native JSON/evidence. It never creates personal Google accounts, uses a paid model or modifies the existing Studio services. Exporting/storing native JSON does not complete editable portable asset packaging. Stop only owned preview/containers after independent browser acceptance; preserve volumes and fixtures for recovery.
