# Motion survives a different-owner portable restore

2026-10-18, issues [57](https://github.com/ChaiWithJai/liquidity-studio/issues/57) and [55](https://github.com/ChaiWithJai/liquidity-studio/issues/55). Both existing three-page motion Reels were exported through Operations, restored into new empty brands under a different controlled owner, reopened after a full application reload, and rendered again through the actual native editor. The restored WebMs are byte-identical to the source exports recorded in the [original motion checkpoint](../native-motion-neo/README.md).

This was a disposable password fixture with inline SQLite assets, not maintained Google acceptance. The source campaigns were the previously disclosed controlled deterministic fixture, including its preserved administrative trace repair. No new campaign generation, cutout inference, audio work, cloud resource or internal editor-state injection was used.

## Actual recovery sequence

1. Operations downloaded the current finance and cultural version-2 packs. A consistent source database backup preserved finance native revision 8 and cultural native revision 5 before the source server was stopped.
2. The same approved application/private frame was started against the existing separate recovery-owner database. Its earlier recovery brand was preserved. The operator signed in as that different owner and used Choose private editor pack → Create new empty recovery brand for each pack, with its matching brand preset.
3. The operator explicitly acknowledged the exact pack, remapped retained owners to the current account, and attested only to approved nonclinical sources. This is new current-owner source attestation, not transfer of the previous owner's approval. Clinical and prepared-copy approval paths were not exercised.
4. Each restored brand was selected deliberately. The saved Reel was opened, the entire application reloaded, and the brand/story/Reel/native editor selected again. The native document API then reported the retained timings and animations: holds **2/11/14 seconds**, headline **Rise 1 second**, page **Fade 1 second**. Finance remained revision 8 and cultural revision 5, both `status: proposal`, `sourceState: current`, `finalSignoff: not_granted`.
5. Actual native Menu → Download → WebM used Design 1080×1920, 30 fps, All pages and As set on each page. Each result reported 30 seconds. The browser downloaded each new output and decoded nine selected seeks around the entrance and both transitions.

| Pack / restored output | Bytes | SHA-256 |
| --- | ---: | --- |
| Finance private source pack | 3,071,571 | `18597c82ac979ec33c7e346017fa3252f9a58c60486de7e9db67fe168f5fdff6` |
| Cultural private source pack | 2,634,598 | `aa4468391a486f561600db4a9b8842555307aad69ed0e4e4c7d4f90b010c2af0` |
| Restored finance WebM | 1,368,415 | `ff56f90bc6126e832a8128604331a89ba80873ca36c85b50d21a602c74e60e3e` |
| Restored cultural WebM | 1,341,109 | `f82fedc74e506c09151eb9759530692ba6fadcb26d975c06fb07cef5117c5f1f` |

The private packs contain retained customer state and are not published. The public source [finance WebM](../native-motion-neo/finance-motion.webm) and [cultural WebM](../native-motion-neo/cultural-motion.webm) have those exact output hashes, so duplicate binary copies are unnecessary. These restored outputs were actually rendered and downloaded after installation; they were not copied from the prior downloads as substitutes.

## Decoded motion and lifecycle

Both restored files reported `duration: 30`, width 1080, height 1920. At 270×480 sample resolution, finance entrance 0.2→0.6 seconds changed 2,188 pixels by at least 20 in a channel, RMS 14.83; its first transition endpoint→midpoint changed 555 pixels, RMS 4.48. Cultural entrance changed 3,128 pixels, RMS 20.41; its first transition changed 537, RMS 4.29. The second transitions also changed. All nine decoded sample hashes match the corresponding source output samples. [manifest.json](manifest.json) preserves the observed API projections, seek hashes and comparisons.

The 1-second entrance plus hold 2 produces the first 3-second slot; the incoming 1-second fade plus holds 11 and 14 produce the later 12- and 15-second slots. The first page's incoming transition is ignored. This is existing exporter behavior, not a rewritten scene schema.

After both renders the native frame was unmounted, with zero iframes remaining. The final recovery database backup was **1,187,840 bytes**, SHA-256 `cba90c78c268e33c9c717bdf6e109317211d0b33c6b2d00f9a1e4dc18d1ba70c`, integrity `ok`, 46 records. The source backup was **745,472 bytes**, SHA-256 `b435f3604d08f52e6822b6a55c1aa3977f1318bbb815110dcdba25a6b9687ae0`, integrity `ok`, 40 records. Both source packs, source database, earlier recovery fixtures and backups remain retained. Only the owned fixture server was stopped before handing the shared operational slot back.

## Boundaries

A subsequent bounded container inspection used only Neo and a static file-input page, sequentially reading the four original downloads from the motion checkpoint. Both MP4 video tracks report `stsz` sample count 900, a single `stts` run of 900 samples at one tick each, and `mdhd` timescale 30/duration 900: 30 seconds. Both WebMs contain one video track (type 1), 900 unlaced video blocks, timecode scale 1,000,000 ns, timestamps from 0 through 29,966 ms, default frame duration 33,333,333 ns and Info Duration 30 seconds. No audio track was present in these four inspected containers. This establishes container sample/block counts and timing, rather than relying on the UI's planned 900 frames; it remains distinct from decoding every frame or listening for sound.

[container-inspection.json](container-inspection.json) records the results and separately verified file hashes. [browser-container-inspector.js](browser-container-inspector.js) is the original read-only browser helper used: 4 MiB file ceiling, bounded box/element parsing, unique required metadata, MP4 sample-count reconciliation, monotonic WebM block times and explicit rejection of unsupported lacing. It was evaluated against uploaded owned files in the same existing Neo tab, without an application server, new browser process, local test runner, parser library or ffprobe. Static data-page WebCrypto was unavailable, so hashes were verified separately with the shell rather than fabricated as browser observations.

The read-only final source metadata and restored timing/output match establish this specific motion portability round trip. They do not establish every historical motion schema, concurrent multi-instance editing, physical low-disk behavior, full 900-frame decoding, sound rights, audio output, social publication or whole issue 57 completion. Native proposals received no inherited final-layout approval or verified PNG signoff. Local draft video downloads are distinct from that verified export workflow.

The private frame is the same reviewed `4d1` base plus existing 78 cleanup and 83 duration overlays documented in the original checkpoint. The upstream license and distribution hold remain unchanged. No held vendor source, compiled frame or model weights are published here. Existing fresh image/cutout lineage and historical final-PNG recovery are separate evidence, not claims inferred from these text-and-placeholder Reels.
