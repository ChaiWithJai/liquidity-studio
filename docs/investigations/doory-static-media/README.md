# Native static exports and Reel artifact acceptance

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

This is local export acceptance evidence, not a deployed integration. Native editable-layer portability, licensed original portrait cutout inference, transparent-asset fidelity, animation/transitions, sound rights, other GIF settings, full animated MP4/WebM acceptance and separate performance targets remain unfinished under #55. The already decoded CWJ MP4 and the WebM duration defect are separate evidence. The three rendered Reel boards do not by themselves prove motion or sound. No paid provider, GCP resource or live Studio data was changed by this export pass.


## Separate actual CWJ GIF checkpoint

After the static matrix, the native browser generated and downloaded the three-page CWJ Reel as GIF using 720p,15fps, all pages, as-set durations and forever-loop settings. The original file is included unchanged:73,835 bytes, SHA256 `944947dfd3e24238245203e3e8a800ea65feb14e55455ac8d3ca74ef5d74e43b`. Pillow independently decoded all three coalesced frames at **720×1280** pixels with durations3000/12000/15000 milliseconds, total30000 and loop0. The 15fps render setting does not mean the static file must retain450 duplicate frames. Mean absolute RGB comparison against scaled original PNG boards identifies pages1,2,3 in order; quantization prevents byte equality. Full comparison evidence is in cwj-gif-evidence.json. This proves this one static-board GIF and its timing, not transitions, audio, transparent cutout, full-size GIF or the second brand. GIF remains outside the24-download static manifest above.


The finance Reel was subsequently exported with the same explicit GIF settings and independently decoded:71,614 bytes, SHA256 `3e486bd52c0c3c19c0e06d56c6b0b16ce33ef420d0134249ee0cedf92028b35f`,720×1280 pixels, three coalesced frames, durations3000/12000/15000ms,total30000ms,loop0. Comparison against its own original native PNGs identifies pages1,2,3. The original GIF and finance-gif-evidence.json are included. Thus both presets now have static-board GIF timing evidence; other GIF/animation/alpha assertions remain unproven.


## Both native MP4 Reels

Both presets have actual native browser-produced H.264 MP4s, included unchanged. Each independently probes at1080×1920,30/1fps,30.000000 seconds and900 decoded frames. Full ffmpeg null-output decoding passed. Boundary frames at0,2.9,3,14.9,15,29.9 seconds match their own original PNG boards1,1,2,2,3,3 by mean absolute RGB error. CWJ is585,764 bytes/SHA256 `e7fcbb41203e34980e696174488b1b6afc45340cc29caaf17fa2ab589cca797d`; finance is567,669 bytes/SHA256 `376f2c9bfd8c61e827556e38f61ab2adb0bf5bea8c4dab1e264486297184807a`. Each has zero audio streams. Full metadata/frame comparison reports are separate JSON files. These are static page cuts at3/15-second boundaries, not a certification of motion presets, transitions or sound rights.


## Fresh native WebM downloads after the duration repair

Merged PR83 records the attributed muxer-duration repair, its pinned red/green reproducer and independent review. After that patch was served by the owned local guest, the operator generated and downloaded fresh WebMs for both brand Reels through the actual browser UI. Both independently probe and fully decode as VP9,1080×1920,30/1fps,900frames,30.000000seconds with zero audio streams. Six boundary frames again identify native PNG boards1,1,2,2,3,3. Original downloads and separate per-brand JSON reports are included. Finance:1,217,849 bytes/SHA256 `b9a1d024d1988d857e7b3f183652633d86fadb1bddce472cc46f10dafe6d396f`. CWJ:1,004,663 bytes/SHA256 `cc7007bb55eb855ff731f4670c224295dd2414e3c801417518e857b042262bd9`. The fresh CWJ file differs from its original29.966-second browser export only at offsets222/223 inside the existing8-byteDuration, with identical file size. This is fresh native export proof, not merely a corrected-copy metadata test. Only the owned local QA source was patched; the live Studio image and GCP service do not embed Doory.
