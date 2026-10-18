# Explicit licensed Om binding

On 2026-10-18, the owned fresh-owner cultural copy in Penpot 2.18.3 gained an explicit Noto Sans Devanagari run for Om, while every Latin Inter run and Mona text remained unchanged. One normal first-frame PNG export is **137952 bytes, 1080 × 1350, SHA256 `f8bdb85be782a912839e98217e409bb4e48aa4c95542ddb62f045765b0a954ed`**. Root independently inspected the actual PNG and full native before/after data.

![Cultural frame with explicit Om font](first-frame.png)

This follows the [historical system-fallback checkpoint](../cultural-recovery/README.md); its earlier observations and failed passive reflow are preserved. Sanitized hashes and counts are in [evidence.json](evidence.json).

## Original font and normal upload

The existing committed [Noto Sans Devanagari TTF](../../../../liquidity-studio/public/fonts/NotoSansDevanagari.ttf) was used without conversion or renaming: 641944 bytes, SHA256 `14ec4af41f27482216d1c2229f417ff9b1425e1babb014e57d1d40d03229853e`. Its accompanying [SIL OFL 1.1 notice](../../../../liquidity-studio/public/fonts/NotoSansDevanagari-OFL.txt) has SHA256 `a216f6f8d85c7228093e0ee5e258d9d377e6671f68acb4db1930b29583d0f331`. Read-only binary inspection found U+0950 mapped to glyph 126 in all four Unicode cmap records. All 41 name records are Windows records, including English family and Regular style; unlike the Inter failure, there is no incomplete Macintosh dictionary shadowing those names in the pinned parser.

After capacity admission, a consistent native backup and four-document/font-variant fingerprints, normal QA2 login and one Fonts UI selection produced the correct family/Regular preview. The UI also displayed its cross-OS vertical-metrics warning; no font correction or conversion was performed. One normal Upload succeeded on the unchanged original frontend. A full reload retained the new own-team variant. Independently read persisted bytes matched the original TTF; generated OTF and WOFF identities are recorded below. The previous four variants remained unchanged. No direct font API write, parser derivative, cookie capture, callback or ingress activation was used.

| Persisted format | Bytes | SHA256 |
| --- | ---: | --- |
| Original TTF |641944|`14ec4af41f27482216d1c2229f417ff9b1425e1babb014e57d1d40d03229853e`|
| Generated OTF |416876|`0d6e41cfbb291e1c6247c10a667e3132ea42a4eaf05240d4f729171f6e044aba`|
| Generated WOFF |331252|`222901c3d58032063d83798f9ebc27c1af42c50c6dfc5ce346afa1d7c58cf036`|

## Nine native single-character actions

Each badge entered native text editing, selected exactly `ॐ` with normal keyboard selection, and chose the registered Noto family through the native font control. No characters were entered. The first badge was audited before proceeding to the other eight, each audited separately. The native rich-text selection path is present in the [pinned source](https://github.com/penpot/penpot/blob/ff7a66f51938b2293260ea27a64e2c4e0833b5e3/frontend/src/app/main/data/workspace/texts.cljs#L1014).

The copy advanced from revision 14 to 24 through native autosaves. Independent full-data comparison found exactly nine badge content/positionData replacements and nine owned component timestamps. Every Latin leaf retained **every prior attribute** and the exact prefix `CWJ // `. Each Om leaf differed only in `text`, `fontId` and `fontFamily`; native run splitting added eight paragraph keys. All other text/content, object geometry, tokens, media and page order were deeply equal. Native cached line measurements are recorded separately from authored geometry; none were fabricated.

On the actual first-frame Om node, Neo CDP `CSS.getPlatformFontsForNode` reported one **custom Noto Sans Devanagari** glyph, PostScript `NotoSansDevanagari-Regular`, with no system fallback. This replaces the prior editor observation of a Kohinoor Devanagari system glyph. It is an actual font attribution, not an inference from visible text alone.

## Output, preservation and limits

One normal existing-route PNG export showed Om without tofu, headline, body, footer and the controlled fictional portrait. Decoded pixel comparison with the historical fallback PNG found differences only inside badge bounding box `(81,72)–(191,96)`; every pixel outside it was equal. That box includes Latin badge pixels as well as Om. **The cause of the Latin pixel change is not isolated**; unchanged Latin font/style and cached x/y do not justify a claim that only Om pixels changed, or a causal claim about line metrics. No second export or speculative repair was attempted.

Original finance revision 17, original cultural revision 9 and finance-copy revision 18 retained their exact stored data fingerprints. QA2 logged out and QA1 logged in through the normal UI; a fresh profile read confirmed restoration. The exporter browser stopped and the heavy slot was released. Maintained Studio/cloud services and original native files were untouched.

This establishes explicit licensed glyph binding in a same-server fresh-native-owner copy. It does not establish a fresh-installation font package, every-format output acceptance, complete external asset/archive recovery or native identity enforcement. [Issue 54](https://github.com/ChaiWithJai/liquidity-studio/issues/54), [issue 57](https://github.com/ChaiWithJai/liquidity-studio/issues/57) and the separate native authority work retain their broader requirements. Issue 166's qualified parser closure remains separate.

Later cleanup removed only the owned 336114582-byte upstream build ZIP after baseline restoration, exact identity checks and zero running mount references. At cleanup, hosted artifact 12133458817 was verified not expired, with reported expiry 2026-10-25T10:50:55Z. Patches, licenses, manifests, backups and screenshots remain retained; this is a bounded recovery window, not indefinite local retention. The private `obsolete-build-zip-cleanup.json` receipt preserves the original ZIP hash and cleanup checks.
