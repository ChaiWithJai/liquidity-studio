# Investigation 39: actual local Penpot native-document experiment

> Follow-up: the original failure below is preserved. A fresh-browser reproduction identified lost SVG tag keyword types and validated an explicit local post-import repair with identical PNG output; see [typed SVG restoration evidence](../design-review/issue-54/svg-restore-v1/README.md). Upstream unmodified imports still require normalization.

Recorded 2026-10-18 UTC. This experiment used a disposable local Penpot 2.18.3 stack, not the Studio pilot, personal Google accounts, or GCP editor infrastructure. Its accounts, sessions, private files and credentials belong only to the isolated editor fixture. No background-removal model was downloaded or executed.

## Runtime and storage checkpoints

The [pinned Compose](../../scripts/investigations/penpot-local.compose.yaml) uses official ARM 64 frontend/backend/exporter 2.18.3 image digests, Postgres 15 and Valkey 8.1, one loopback port 39008 and uniquely scoped network/database/assets volumes. The repository release examined is `ff7a66f51938b2293260ea27a64e2c4e0833b5e3`; image pins are recorded independently, rather than claiming a locally reproduced upstream build.

The earlier [capacity finding](39-local-capacity-finding.md) remains part of the record. After host/daemon recovery, actual backing-filesystem free space was 26.25 GiB and Docker VM free space 28.10 GiB before resuming. A first resumed boot found zero-byte Postgres and Valkey entrypoints despite correct ARM 64 image metadata; both exited 255 with executable-format errors. The exact storage root cause remains unconfirmed. Only this experiment's containers/network and five newly introduced image references were removed, with volumes preserved and no other container references allowed. There was no global prune or reset.

A guarded clean repull, including one transient registry-timeout retry, restored nonzero launch files: Postgres entrypoint 14,577 bytes; Valkey tini 68,680 bytes and entrypoint 811 bytes. The interpreter/binary entrypoints were executable; the frontend's 3,212-byte script is correctly invoked by executable `/bin/bash`, so the script itself need not have its executable bit set. Backend launch script/JAR/Java, exporter application and frontend HTML/nginx were also nonzero. This validates selected launch files, not every image file.

A real backend Java probe under its 2 GiB container limit estimated a 511.94 MiB maximum heap. The 128 MiB frontend allocation was insufficient: measured 126.7 MiB, OOM marker and repeated nginx worker exits on signal 9 accompanied connection failures. Raising only the owned frontend cap to 384 MiB stopped that observed loop; a later idle snapshot measured 338 MiB there. All other caps remained unchanged: backend 2 GiB, exporter 1 GiB, Postgres 384 MiB and Valkey 192 MiB, approximately 3.94 GiB total ceiling. This is a bounded experiment adjustment, not production sizing or a minimum-memory claim.

Clean startup completed; Postgres/Valkey health checks passed; frontend `/` and backend-backed `/api/rpc/command/get-profile` returned 200. Two ephemeral QA accounts were created through real prepare/register RPC operations. Immediately before browser work, host free space was 23.39 GiB and VM free space 25.84 GiB. The existing Studio readiness endpoint also remained 200. These are dated observations, not permanent capacity guarantees.

## Actual browser and saved-model results

The coordinating operator used actual Chrome to log in, complete onboarding, create a personal Draft file and import `vedic_dharma-infographic-1.svg` through the Image chooser. Read-only official `get-file` inspection of saved revision 3 found:

| Saved shape type | Count |
| --- | --- |
| frame | 1 |
| group | 2 |
| rect | 2 |
| path | 3 |
| svg-raw | 16 |
| native text | **0** |

The imported group's saved opacity was 1 (100%). The operator accidentally changed opacity during a shortcut attempt and explicitly restored it before this checkpoint; the read-only inspection confirmed the restored value.

The layer named `svg-text` is **`type: svg-raw`**, containing XML-like `content.tag: text`, `attrs` with fontFamily/fontSize/fontWeight, and nested tspan/string content. This is different from Penpot's native rich-text shape model. The browser showed SVG attribute controls rather than a native typography editor. Therefore this particular direct Studio SVG import **does not prove editable native typography, governed components, layout constraints, or token binding**. Visual placement and grouped SVG content are narrower capabilities. An adapter must explicitly construct native shapes/components or prove a reliable conversion.

Using Tokens → Tools → Import → Import Single JSON, the operator then imported `tokens.dtcg.json`. Saved revision 4 added `data.tokensLib.tokensdtcg` with:

- color.agni: `$type: color`, `$value: #E85D04`;
- color.prana: `$type: color`, `$value: #219EBC`;
- color.sattva: `$type: color`, `$value: #E5E7EB`;
- space.card: `$type: dimension`, `$value: 24 px`.

Metadata ordered that one token set, with activeSets and activeThemes both empty. No saved shape contained appliedTokens. This proves import/persistence of this partial token fixture; it does not prove activation, shape binding, complete four-color brand parity or typography-token compatibility. Shape counts remained unchanged, including zero native text shapes.

Independent fixture-account access checks used real local password login and the official read-only RPC: owner `get-file` returned 200; the second unrelated QA account requesting the same file returned 404. This is local native-file isolation evidence for those two accounts, not Studio organization/brand mapping or a managed Google account test.

## Actual archive roundtrip and fidelity failure

The operator used File → Download .penpot, then the dashboard's Import Penpot files operation. The same-owner import reported success. The downloaded native ZIP was 22,826 bytes with 28 nonempty entries, manifest type `penpot/export-files`, manifest version 1 and generator `penpot/2.18.3`. Its SHA-256 was `0bc81fd1e8e3233eff05cf8add5d28cdf8c706f2dc382370db6fe003795e04af`. This archive version is separate from the internal native document format. The imported token set remained present and inactive.

**The restored document failed text fidelity.** The original file, reopened from its saved URL, still displayed all six SVG text lines, including the disposable `LOCAL IMPORT TEST` headline. The restored editor canvas and accessibility tree lacked those lines. A real restored-group PNG download was valid 1080 × 1350 PNG, 7,485 bytes, SHA-256 `b800c160029f50b9f323f02240e3aa7ba64eb35e89ae0ddc24e1eaebb1c2b1d8`; independent image inspection showed only the dark background and cyan rules/bars, with all text absent. A successful download does not establish a usable marketing export.

Independent read-only original/restored RPC comparison found all 24 shape IDs, type counts, page order and token data preserved. Raw SVG `content`, attributes and nested tspan strings were equal; headline strings also existed in the archive. After excluding the expected file ID, added per-shape `pageId` and the operator's later PNG export preset, the complete JSON document data was equal. The evidence therefore does **not** show text-data deletion. It shows a rendering failure after native archive roundtrip despite preserved JSON payload. JSON equality does not establish identical internal decoded types. The last exporter-log excerpt contained no matching error/warning/font-failure lines; that absence does not establish a cause.

The pinned SVG renderer's keyword-based tag validation is a possible investigation lead, not an established diagnosis. Neither a font failure nor an exporter-only fault is proven: text is already absent in the restored editor. A separate native-text control completed successfully, as recorded below. No upstream code repair is included in this experiment.

## Native-text control narrows the failure

The operator added a second page to the original document using the actual native Text tool, entering `NATIVE TEXT CONTROL` with Source Sans Pro 14 and explicit orange fill `#e85d04`. The native control exported visible orange glyphs before archiving. A second two-page native archive was downloaded and imported through the UI into a new same-owner file. Its first page still lacked the raw SVG text, while its second page retained the native text control.

Independent authenticated RPC inspection of that restored file confirmed two pages and exactly one `type: text` shape containing `NATIVE TEXT CONTROL`; the unrelated fixture account still received 404. Independently reading the actual before/after PNG downloads confirmed exact byte equality: both 2,400 bytes, 280 × 75, SHA-256 `1e2bdcdc288ef001081dcf8f2bae9392a5485a6ab6f0f0b5ef2c7c14c5120191`. Thus native text save/archive/import/export works for this one control, while the raw SVG text route fails. This supports testing explicit native-text construction next; it does not establish complete native typography compatibility, all fonts, editable imported SVG text or the root cause of the raw SVG failure.

## Reproduction and evidence limits

Generate the source fixtures without an editor or provider call:

```bash
node scripts/investigations/penpot-fixtures.mjs /tmp/penpot-native39-fixtures
```

This calls the actual Studio `renderSvg`, emitting 18 SVGs: two brands ×(one feed, four carousel pages, one story and three reel beat cards), plus the token fixture and checksummed source manifest. These files are static test inputs, not rendered reel videos or completed native imports. The browser checkpoint above imported only the CWJ infographic; it does not establish all 18 native roundtrips or both-brand fidelity.

Use the capacity-guarded wrapper and private fixture environment described in the capacity finding. After boot, create local accounts through `prepare-register-profile` and `register-profile`, then log in normally. An authenticated `get-file` with the file UUID and JSON response negotiation inspects the saved model; an unrelated local account must not obtain the file. Keep credential/session and complete native-model dumps private. Public evidence should contain only sanitized counts, capabilities and artifact hashes.

The same-owner archive import and PNG download were exercised, but restored SVG text fidelity failed. Cross-owner portability, external-asset packaging, native rich-text editing of imported SVG, token activation/binding and complete brand parity remain unproven. No benchmark, background removal, video encoding, collaboration, webhook callback, Studio integration or social publication occurred in this slice. The native SVG limitation is an implementation gap to carry into #39 sequencing, not a reason to replace the requested governed workflow with a static demonstration.

A feasible next governed-workflow experiment is a minimal adapter/plugin that explicitly constructs native text and components, binds a small token set, and verifies save/reopen/archive/export against expected text and pixels. Direct SVG import cannot currently stand in for that acceptance. This is a sequencing recommendation, not an implemented integration or a commitment to repair upstream internals.
