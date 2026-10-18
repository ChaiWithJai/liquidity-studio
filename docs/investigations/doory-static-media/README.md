# Actual native SVG, JPEG and PDF exports

Issue #55 acceptance checkpoint, October 18, 2026 UTC. These are actual BrowserOS neo File → Download results from the owned local Doory preview, pinned upstream source `27b6f68221fdbf1ef1bedc182e303210ca9e39f5` with the separately attributed VideoResult lifecycle patch. No media was produced by a schema-only adapter test. Both presets used the verified-glyph native documents from the existing adapter experiment: four formats, nine pages per preset. Human text and deliberately changed accent tokens remained in these fixtures. Missing portrait cutouts remain explicit placeholders.

The browser downloaded 24 files: SVG, JPG and PDF for each of eight documents, selecting all pages. ZIP CRC checks passed. Independent Python XML parsing verified all 18 SVG roots and expected width/height, text nodes and embedded font data. Pillow fully decoded all 18 JPEG pages at their native 1080×1350 or 1080×1920 sizes. Poppler opened all eight PDFs and raster-decoded all 18 pages. The manifest records original download hashes and page-level evidence. These extend the previously recorded 18 actual PNG exports; they do not replace that evidence.

PDF output is a **raster-page PDF**, not editable vector/text output. All eight had zero extractable text. The three-page Reel PDF has 810×1440-point pages with 3375×6000 JPEG images at 300 pixels per inch. Independent inspection renders were explicitly requested at 1080×1920 pixels. An initial 96-dpi render rounded floating-point page dimensions up to 1081×1921; it was not misrepresented as a native 1080×1920 export.

Included representatives are unchanged original JPEG pages, the original CWJ Reel PDF and its independently decoded first-page PNG. The operator visually inspected that PDF page, a finance Carousel JPEG, and the CWJ Story JPEG. All pages were decoded, but only those representatives received this visual inspection. SVG XML/font embedding is not an independent browser-font or every-renderer fidelity certification. Full SVG downloads, which embed font binaries, remain local; their hashes and structure are recorded without repackaging those binaries here.

## Independent verification

The original download set is preserved locally with a private path manifest. ZIP entries were checked for CRC, XML parsed through ElementTree, JPEG pixels loaded through Pillow, and every PDF opened with `pdfinfo`, `pdftotext` and `pdftoppm`. Example commands for the included PDF:

```sh
pdfinfo -box vedic_dharma-reel.pdf
pdfimages -list vedic_dharma-reel.pdf
pdftotext vedic_dharma-reel.pdf -
pdftoppm -f 1 -singlefile -scale-to-x 1080 -scale-to-y 1920 -png vedic_dharma-reel.pdf inspected-page
```

This is local export acceptance evidence, not a deployed integration. Native editable-layer portability, licensed original portrait cutout inference, transparent-asset fidelity, animation/transitions, sound rights, GIF, full MP4/WebM matrix and separate performance targets remain unfinished under #55. The already decoded CWJ MP4 and the WebM duration defect are separate evidence. The three rendered Reel boards do not by themselves prove motion or sound. No paid provider, GCP resource or live Studio data was changed by this export pass.


## Separate actual CWJ GIF checkpoint

After the static matrix, the native browser generated and downloaded the three-page CWJ Reel as GIF using 720p,15fps, all pages, as-set durations and forever-loop settings. The original file is included unchanged:73,835 bytes, SHA256 `944947dfd3e24238245203e3e8a800ea65feb14e55455ac8d3ca74ef5d74e43b`. Pillow independently decoded all three coalesced frames at **720×1280** pixels with durations3000/12000/15000 milliseconds, total30000 and loop0. The 15fps render setting does not mean the static file must retain450 duplicate frames. Mean absolute RGB comparison against scaled original PNG boards identifies pages1,2,3 in order; quantization prevents byte equality. Full comparison evidence is in cwj-gif-evidence.json. This proves this one static-board GIF and its timing, not transitions, audio, transparent cutout, full-size GIF or the second brand. GIF remains outside the24-download static manifest above.
