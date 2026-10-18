# Existing native audio, connected to Studio

This source slice enables the existing native **Audio → Uploads → Add to design/page** workflow. It does not introduce an editor, audio model, recording service or transcoder. The pinned editor already owns track placement, trim, volume, fade, mute, undo/redo, playback, and AAC/Opus mixing into MP4/WebM.

Studio accepts original 16-bit PCM WAV only: 512 KiB, 50 ms–30 seconds, mono/stereo, 8–48 kHz; at most four saved tracks. The byte limit still applies at higher sample rates. Unsupported compressed formats and browser microphone recordings give a WAV-specific message. No silent conversion or resizing occurs. The existing upload rights declaration applies to sound; the implementation does not claim a supplied song is licensed.

Audio uses the existing scoped immutable asset upload/resolver and message broker. A stable relative audio reference survives native normalization; only that exact saved asset ID resolves to a verified blob in the editor. Images and background removal retain their existing image-only behavior. Native saves retain track controls; portable packs include the original WAV, sound metadata and rights, with byte-derived validation on restore.

Source regressions cover WAV bounds/encoding, actual service upload/save/read, image/audio library separation, existing adapter/broker routing, and SQLite portable export/restore into an empty destination. These are hosted checks, not browser playback acceptance.

The next actual Neo path is: declare rights for an original sound → Audio Uploads → choose PCM WAV → Add to design → inspect 30-second timeline → save → undo/redo/save/reload → Download MP4 and WebM with audio enabled → listen and inspect duration/audio streams. Use one exclusive native render slot. The current private frame must be rebuilt from this exact source through the hosted artifact workflow before this path is claimed to work. No local build, test runner, inference, conversion or runtime action was performed while implementing the slice.
