# Actual native transparent PNG and narrow phase measurements

2026-10-18, issue [55](https://github.com/ChaiWithJai/liquidity-studio/issues/55). This is one additional actual BrowserOS Neo export from the finance Feed proposal already restored under the different owner in the [motion recovery checkpoint](../native-motion-portability/README.md). It uses the existing saved 384-pixel generated portrait cutout. No new model inference, person, audio, dependency, private-frame build or cloud resource was introduced.

## Transparent export

The operator opened the saved Feed, then native Menu → Download → PNG, 1×, All pages (1). The actual input for Transparent background was read back as **checked** before Download. The original browser download is [finance-transparent.png](finance-transparent.png), **491,669 bytes**, SHA-256 `872ae64829d430d8f977324582464c6e1671598d5a0408911203bef782580f74`.

Neo decoded this actual PNG with `createImageBitmap` and read its RGBA pixels through a same-page canvas. The image is 1080×1350: **1,254,758 fully transparent pixels, 174,015 partially transparent pixels and 29,227 opaque pixels**. All four corner alpha values are zero. These counts cover the whole artwork, including antialiased text, rather than claiming that every intermediate-alpha pixel belongs to hair. The actual file viewer visibly retained the subject and hair edge; the native fixture still overlaps the repetitive source text and retains a dashed placeholder. This is positive transparency/export evidence, not a finished campaign design or a ground-truth portrait quality score.

![Original transparent native PNG](finance-transparent.png)

The underlying derivative remains SHA-256 `be20c97b37e61742d8fb60239df7f13fc3e14385b5b7fdbbb268c9fb228ac31d`, from original JPEG `50db12119d03be4f4a2736586210f0eac990a667e7ea0d7a0d5469268dd93c5e`. Its actual inference, original/alpha preservation and full lineage are recorded in [fresh cutout recovery](../fresh-cutout-recovery/README.md). This slice reuses that recorded generated synthetic nonpersonal fixture; it does not invent new consent or rerun inference.

An initial 456,313-byte PNG was opaque. The checkbox's checked state had not been captured before that download, so it was not reported as a renderer failure. The initial output is retained privately. In the diagnostic repeat, the operator focused the native switch and used literal Space, then read back its actual checked state before downloading. The confirmed export above establishes the result without changing renderer code or injecting internal editor state.

## Measurements and target boundaries

The authorized saved native API returned revision 4, `status: proposal` and `finalSignoff: not_granted`. Its one-page DoryDocument serialized to **9,062 UTF-8 bytes**. Twenty-one direct `JSON.stringify(document)` observations using browser `performance.now()` had a maximum of **0.100 ms**; the first and median readings rounded to zero at the browser's timer resolution. All returned identical strings. This narrowly meets the earlier 15 ms serialization target for **this document and this phase**. It does not benchmark the full campaign bundle, compilation, network, source validation, every format, maximum-size scenes or all devices.

A read-only MutationObserver watched the actual native Download panel. The observed interval from **Preparing… appearing to the completed dialog closing was 1,087.9 ms**. The browser subsequently wrote the original file. That observation excludes browser download completion and the operator's preceding navigation, so it is not an end-to-end export-under-1.5-seconds or human-under-60-seconds pass. The initial run had only a coarse 6.453-second UI/tool observation bound; it was not substituted for a precise encoder measurement. No total human-operator benchmark was performed.

[manifest.json](manifest.json) preserves the selected output, pixel counts, narrow timing samples and limitations. These measurements were made only through the existing Neo browser. No local test runner, ffprobe, image validator or new browser process was launched.

## Preservation and remaining acceptance

The existing native image reference and saved proposal were not edited by these Download options. Native review/verified signoff remained ungranted; an ordinary draft Download is separate from the exact-revision verified PNG approval workflow. The private frame is the same reviewed base plus existing cleanup/duration overlays documented in the motion checkpoint; its distribution hold remains unchanged.

The frame was unmounted with zero iframes remaining. The consistent inline SQLite backup is **1,196,032 bytes**, SHA-256 `534c3486cc6f1902960d19e3b4f76a640fc42166d170f09858a0e3e4efe05f04`, integrity `ok`, 49 records. Original assets, the earlier opaque output, source/recovery databases and previous backups remain retained. Only the owned fixture server was stopped; the shared heavy-work slot was released.

Existing evidence already covers both presets/all four native formats, independently decoded static and timed files, fresh cutout lineage, saved/reloaded motion and different-owner recovery. This small increment does not repeat that broad matrix or close all of issue 55. Real-person representative consent/quality, audio rights and the separately proposed audio implementation, full worker/process peak-memory measurement, complete conversion reproducibility and broader end-to-end performance targets remain distinct limitations. No new requirement or unsupported completion claim is inferred from this one successful PNG.
