# Private Studio audio capability overlay

The pinned EditorApp/EditorAdapter props expose no audio-source capability option. This small original overlay uses the existing private Vite transform boundary instead of modifying held source or replacing a component. Upstream remains `27b6f68221fdbf1ef1bedc182e303210ca9e39f5`; its complete pristine inventory and license checks run before the transform.

The JSON records exact before/after source edits for three files. Each input is checked against the pristine inventory, the patch bytes have a fixed SHA in `native-editor-vite.js`, and each anchor must occur exactly once. The launcher source contract includes both the plugin and patch, so older compiled frames are rejected as stale. Hosted packaging retains the original source, this patch and original license/attribution; it does not grant public redistribution clearance.

Audio opens on Uploads. The picker/hint describe Studio's actual 6 MiB, 30-second, 16-bit stereo PCM WAV at 44.1/48 kHz boundary. Library and Record stay keyboard-accessible explanatory tabs, with no library or microphone component loaded. Existing upload, native track controls, save, playback and export remain in their original components. Server and adapter byte validation remain authoritative.

No local build, tests or runtime changes were performed. Obtain a new matching hosted private native artifact before ordinary Neo acceptance. This changes capability presentation, not model conversion or codec timing.
