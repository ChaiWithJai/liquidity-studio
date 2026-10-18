# Penpot2.18.3 raw-SVG text restore repair

This checkpoint addresses the actual original failure rather than substituting native-text compilation for a broken raw-SVG roundtrip. Original and previously broken restored files are preserved. It is a governed **local disposable-QA post-import repair**, not a patched upstream Penpot image or production Studio integration. Issue54 remains open for its other acceptance requirements.

## Reproduction and mechanism

In a new BrowserOS neo-owned tab, opening the original saved SVG file rendered all six text lines. Opening the preserved restored file rendered none. Official `get-file` with `Accept:application/json` hid the distinction: both copies contained equal string-looking tag names. Repeating the read with `Accept:application/transit+json` exposed the original keyword `~:tspan` versus restored plain string `tspan` (and keyword/plain `text`). These are different native values despite lossy JSON equality.

Pinned upstream [svg-raw renderer](https://github.com/penpot/penpot/blob/ff7a66f51938b2293260ea27a64e2c4e0833b5e3/frontend/src/app/main/ui/shapes/svg_raw.cljs) checks tags against a keyword set and only renders valid tags. The [workspace wrapper](https://github.com/penpot/penpot/blob/ff7a66f51938b2293260ea27a64e2c4e0833b5e3/frontend/src/app/main/ui/workspace/shapes/svg_raw.cljs) likewise uses keyword tag membership. Restoring keyword types through the official typed update RPC, without changing text or layout, restores rendering. This establishes the mechanism for this fixture; the exact historical upstream commit introducing the import-type loss was not determined. Studio's earlier PR60 recorded the failure accurately; PR62's native-text route is a separate successful pathway, not this repair.

## Actual fresh-browser archive acceptance

The new browser tab selected the retained22,826-byte `.penpot` archive through the dashboard Import Penpot files input, pressed Continue and Accept, and observed “1 file has been imported successfully.” File selection used BrowserOS/CDP on the observed native file input; archive import executed the real browser workflow rather than a direct scripted import RPC. The new file opened with zero artwork text lines. Before/after browser screenshots are retained here.

After leaving the file to avoid concurrent editing, the operator renamed only that disposable clone with the required QA prefix. The public local repair wrapper compiled a strict plan against revision4 and submitted ten `svg-raw` content updates using official Transit keyword values. Reopening the same browser-created file showed all six original text lines. Revision became5. Repeating the old revision4 plan was rejected before an update request was sent.

Actual original and repaired exports:

- PNG: both48,193bytes,1080×1350, identical SHA256 `d8fff4c3209a89bb287ecaa5a6a4cf425a60e3043d576679e1e79e84cec09e7d`. Independent image inspection confirms visible text, including `LOCAL IMPORT TEST`, the Om monogram and review-required footer.
- SVG: both5,166bytes and contain the headline. Decoded XML has43elements in each; all text and attributes match except three generated `g` element IDs. SVG hashes differ accordingly; no byte-equality claim is made for SVG.
- Existing original documents, native adapter files and broken restored evidence were not rewritten. New QA clones and private full model/wire evidence remain in `/tmp/liquidity-penpot54-final-evidence`.

## Bounded implementation and reproduction

`compilePenpotSvgRestoreRepair` compiles only text/tspan content normalization at exact declared version2.18.3. It preserves text/geometry/shape IDs, escapes literal Transit control prefixes, validates native page/shape identity and current revision, bounds input2MiB/depth32/shape count2048/pages20, and rejects executable, external-resource or unknown SVG content/attributes. It does not activate tokens, install fonts, grant access or convert SVG into native editable typography.

The local wrapper has a fixed loopback39008 endpoint, rejects proxies/redirects, reads only a private0600 disposable QA account file, verifies the same owned project, forbids the anchor/original target, and requires the `Studio SVG restore QA ` target-name prefix. It defaults to dry-run and requires explicit `--apply`. No arbitrary endpoint or browser identity is accepted. Expected revision is checked before submission; this tool requires a quiescent disposable target. It does not claim an atomic cross-client compare-and-swap beyond Penpot's own update protocol, nor instantaneous identity revocation. Do not use it to patch an actively edited production file.

```sh
# First import through the browser into a NEW disposable file and rename that clone.
# NODE22_PATH must point to the installed Node22 bin directory.
PATH="$NODE22_PATH:$PATH" python3 scripts/investigations/penpot-svg-restore-local.py \
  --account-file /private/fixture-accounts.json --anchor-file ORIGINAL_QA_FILE \
  --file-id NEW_DISPOSABLE_CLONE --expected-revision 4 \
  --evidence-dir /private/repair-proof
# Inspect the dry-run evidence, then repeat with --apply only for the owned clone.
node --test liquidity-studio/server/penpot-svg-restore.test.js liquidity-studio/server/penpot-native.test.js
```

Eight focused Node22 checks pass, including existing native adapter/source-integrity tests. Negative repairs cover unsupported versions/tags/attributes, wrong revisions including booleans, native page mismatch, excessive depth/size and duplicate pages. A real stale wrapper invocation was rejected without submission. No dependencies, images, cloud resources or model calls were added.

## Remaining issue54 scope

This resolves the demonstrated text/tspan rendering failure **through explicit post-import normalization** for this raw-SVG fixture. Unmodified upstream2.18.3 import still produces the bad tag types, and another archive reimport requires normalization again. Unsupported raw SVG is rejected rather than labeled successful. This is not a general importer for arbitrary SVG/external assets.

Existing native adapter evidence separately covers two brands,18static pages, active token bindings and same-team native archive PNG fidelity. Still required for whole-ticket completion: actual Studio brand edit→intended Penpot native/token/pixel update, full two-brand/fresh-browser/font portability acceptance, and external-asset handling or an explicit supported/rejected contract. Same-team fonts do not prove a self-contained fresh-install package. No Google/customer identity, publication, video, background removal or final sign-off is implied. Current port3000/3001/cloud and Docker configuration are unchanged. Rollback leaves this optional operator tool unused; preserve all originals and reports.
