# Doory WebM final-frame duration correction

Related #55 and #39. This attributed patch is a local investigation fix, not a completed media feature or production deployment. The live investigation preview has not received this patch at this checkpoint.

## Attribution and source

Doory is copyright © 2026 Siam, creator and maintainer, [shaongitbd/doory](https://github.com/shaongitbd/doory). The patch targets [container.ts at pinned 27b6f68221fdbf1ef1bedc182e303210ca9e39f5](https://github.com/shaongitbd/doory/blob/27b6f68221fdbf1ef1bedc182e303210ca9e39f5/frontend/src/editor/engine/export/video/container.ts#L117). Exact upstream LICENSE and NOTICE are retained. The upstream Attribution Assurance License and existing UI author attribution remain applicable; this is not commercial licensing approval. The new helper, tests and reproducer are original investigation code.

The lockfile resolves `webm-muxer 5.1.4`. Its public raw-video method accepts timestamp and optional metadata, with no duration argument. Its finalized segment duration is the maximum block timestamp, excluding the last frame's duration. Passing a duration as an extra positional argument would instead misuse encoder metadata. The [official upstream repository](https://github.com/Vanilagy/webm-muxer) also states that the library is deprecated and no longer maintained. This focused patch does not migrate libraries or access private muxer state.

## Actual observation and isolated proof

The browser-produced CWJ WebM contains 900 decodable VP9 frames at 30 fps, 1080×1920, with no audio. Its container declares 29.966seconds, not 30. The independent EBML reader found Info.Duration 29966 at byte 220 and TimestampScale 1000000 ns. The public muxer independently reproduces that metadata using 900 dummy chunks; those dummy bytes are not decodable media evidence.

The corrected **copy** of the actual download declares 30.000000seconds and still decodes all 900 frames. Only byte offsets 222 and 223 changed, both inside the existing 8-byte Duration payload `[220,228)`. File length, all other bytes, encoded media payload, seek positions and 900 decoded frame checksums are unchanged. Six decoded boundary frames at 0/2.9,3/14.9,15/29.9seconds remain closest to the corresponding original native PNG boards 1/2/3 by mean absolute RGB error. [Exact metadata, SHA256 and boundary comparison](actual-artifact-evidence.json) distinguish this offline copy from a newly produced browser export. The actual artifact bytes are not committed here.

| Artifact | Bytes | Declared duration | SHA256 |
|---|---:|---:|---|
| Original browser WebM |1004663|29.966s|`e7d0529d241d2d029845e9a63578350eb0f45e238500cddea6cfab0ffd5cd385`|
| Corrected offline copy |1004663|30.000s|`cc7007bb55eb855ff731f4670c224295dd2414e3c801417518e857b042262bd9`|

## Fix and boundaries

The WebM container records the maximum **accepted** video/audio chunk end (`timestampUs+durationUs`), rather than assuming constant frame rate or the last arriving chunk. After finalize, the pure helper walks EBML element boundaries, requires a single Segment/Info/Float64 Duration, validates TimestampScale and rejects truncated/overflowing, missing or duplicate metadata. It writes that one field into a same-length copy. Empty exports, invalid timing and a shrinking duration fail explicitly. Unknown-sized nested elements are unsupported. No media, index or element sizes move.

The existing MediaRecorder helper `webmDuration.ts` inserts missing metadata and deliberately refuses certain indexed files. This new finalized-muxer path is separate: inserting bytes would invalidate seek offsets, whereas same-width correction preserves them. MP4, GIF and recording behavior remain unchanged.

Audio-end handling is tested with dummy packets only. There is no actual audio export or audio-rights acceptance claim. This does not introduce audio, fabricate subject cutouts, improve animation, change native source text or establish portable/commercial readiness. Browser-generated export acceptance after applying the patch remains separate.

## Reproduce the regression without touching a running preview

Use Node 22 and retained pinned upstream frontend dependencies:

```sh
DOORY_SOURCE_DIR=/path/to/existing/doory \
  bash scripts/investigations/doory-webm-duration/check-duration.sh
```

The runner archives the pinned frontend into a temporary directory, copies the original metadata regression, requires the pristine 29966-versus30000 ms failure, then applies the patch only in that archive. It runs the regression, new strict helper tests and existing container tests, followed by TypeScript noEmit. Git, ripgrep, tar and retained Vitest/TypeScript dependencies are prerequisites. It does not start a server or change a live checkout/container.

Verified on Node 22.23.1: expected pristine failure; patched **14/14 focused tests passed**; TypeScript noEmit passed. Cases cover the original 900-frame defect, unchanged bytes, scale units, malformed/missing/duplicate/truncated/non-Float64 metadata, invalid/shrinking end time, empty exports and maximum variable video/audio end. A broader upstream pipeline test attempt fails in the retained jsdom environment because canvas `getContext` is not implemented; no full-pipeline pass is claimed. The actual-download ffmpeg decode/checksum/boundary proof is recorded separately above.

Rollback removes this container/helper patch from the owned investigation preview; no document/database or upstream dependency migration is required. Preserve original downloads and evidence. Apply to a live preview only after an explicitly coordinated quiet window, then verify a new actual browser export before calling the product flow accepted.
