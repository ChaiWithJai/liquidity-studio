# Private Studio audio capability overlay

The pinned EditorApp/EditorAdapter props expose no audio-source capability option. This small original overlay uses the existing private Vite transform boundary instead of modifying held source or replacing a component. Upstream remains `27b6f68221fdbf1ef1bedc182e303210ca9e39f5`; its complete pristine inventory and license checks run before the transform.

The JSON records exact before/after source edits for three files. Each input is checked against the pristine inventory, the patch bytes have a fixed SHA in `native-editor-vite.js`, and each anchor must occur exactly once. The launcher source contract includes both the plugin and patch, so older compiled frames are rejected as stale. Hosted packaging retains the original source, this patch and original license/attribution; it does not grant public redistribution clearance.

Audio opens on Uploads. The picker/hint describe Studio's actual 6 MiB, 30-second, 16-bit stereo PCM WAV at 44.1/48 kHz boundary. Library and Record stay keyboard-accessible explanatory tabs, with no library or microphone component loaded. Existing upload, native track controls, save, playback and export remain in their original components. Server and adapter byte validation remain authoritative.

Hosted private artifact run `39163499581` built source `6f3a6c047b145b0c3e7668e86130b9066d045126`; its source/output hashes were independently inspected. Actual BrowserOS Neo acceptance opened Audio on the existing saved Reel and found Uploads selected, the exact WAV hint and WAV-only file input. Ordinary Library and Record clicks showed the unavailable explanations while retaining the existing 30-second design track. The parent Upload rights panel expanded in normal flow above the iframe, with no overlap; Done closed it and returned focus to its summary. The editor was then unmounted by returning to saved preview. Receipt: `/tmp/liquidity-media-neo-20261018/audio-ui-acceptance.json`.

No local tests or builds ran. This changes capability presentation, not model conversion or codec timing.
