# Existing native audio, connected to Studio

This source slice enables the existing native **Audio → Uploads → Add to design/page** workflow. It does not introduce an editor, audio model, recording service or transcoder. The pinned editor already owns track placement, trim, volume, fade, mute, undo/redo, playback, and AAC/Opus mixing into MP4/WebM.

Studio accepts original 16-bit PCM WAV only: 6 MiB, 50 ms–30 seconds, stereo, 44.1/48 kHz; at most four saved tracks. A 30-second 48 kHz stereo source is 5,760,044 bytes. Images retain the separate 512 KiB limit. Audio JSON uploads have a 9 MiB envelope for base64, and recovery permits audio files up to 6 MiB while retaining the existing four-MiB limit for other pack files and 48 MiB aggregate pack budget. Unsupported compressed formats and browser microphone recordings give a WAV-specific message. No silent conversion or resizing occurs. The existing upload rights declaration applies to sound; the implementation does not claim a supplied song is licensed.

Audio uses the existing scoped immutable asset upload/resolver and message broker. Artifact-backed stores keep the existing artifact transport. The local fallback stages bounded one-MiB immutable payload chunks before committing only small scoped asset metadata; it does not increase the four-MiB transaction limit. Recovery stages the same chunk format. A stable relative audio reference survives native normalization; only that exact saved asset ID resolves to a verified blob in the editor. Images and background removal retain their existing image-only behavior. Native saves retain track controls; portable packs include the original WAV, sound metadata and rights, with byte-derived validation on restore.

Source regressions cover WAV bounds/encoding, actual service upload/save/read, image/audio library separation, existing adapter/broker routing, and SQLite portable export/restore into an empty destination. These are hosted checks, not browser playback acceptance.

The original planned Neo path was: declare rights for an original sound → Audio Uploads → choose PCM WAV → Add to design → inspect 30-second timeline → save → undo/redo/save/reload → Download MP4 and WebM with audio enabled → listen and inspect duration/audio streams. Use one exclusive native render slot. The current private frame must be rebuilt from this exact source through the hosted artifact workflow before this path is claimed to work. No local build, test runner, inference, conversion or runtime action was performed while implementing the slice.

## Actual Neo acceptance, October 18

After the bounded payload fix, the original 5,760,044-byte WAV uploaded through Audio Uploads, was added as a whole-design 30-second track, saved, and survived a full page reload. Play all entered its playing state and Stop worked. Ordinary Download with all three pages, 1080p, 30 fps and Include sound enabled produced both formats:

| Output | Bytes | Duration | SHA-256 |
| --- | ---: | ---: | --- |
| MP4 | 839,827 | 30.08 s | `88ec5d81426dca60063dc1ccc30b7e3a7804ed76e4d8243c6c6d8fe88d4899e8` |
| WebM | 1,194,638 | 30.02 s | `d33e1832b9b1e0957c8f5cb111a4a86c58f48105f89db283c384a703c0581bcc` |

Both actual output blobs decoded in the browser as stereo 48 kHz audio with nonzero RMS (MP4 0.04322; WebM 0.04331). Both video previews played unmuted without errors. This measures muxed audio and browser playback; it does not claim acoustic listening. The private receipt is `/tmp/liquidity-media-neo-20261018/audio-acceptance.json`; original files and prior failed-upload evidence remain retained. The editor was unmounted after returning to the saved preview.

The expanded Upload rights panel overlapped the Audio close control during this journey; its follow-up uses normal full-row document flow. The native upstream dropzone still advertises its broader formats/25 MB limit; Studio's parent support text correctly states the narrower PCM WAV contract.
