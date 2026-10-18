# One controlled cultural PNG readiness result

The pinned native exporter previously returned a cultural PNG without its portrait even though asset delivery succeeded. The reviewed private readiness hook now produced one actual Neo-downloaded PNG with the same owned image and native text/fonts/glyphs visible. The preserved output is `cultural-ready.png`; exact hashes, byte counts, timing and limits are in `evidence.json`.

The hook waits for exact registered images to decode and for two animation frames before calling the original screenshot implementation. Actual logs show one384×384 image decoded at4707.10ms, readiness at4723.20ms, then a101ms screenshot. This is evidence for the bounded fix, not proof of every historical rendering failure or all image formats.

The first candidate attempt failed before export because Compose resolved a relative ingress mount against a different base-file directory. It was fully rolled back. The corrected packet verified effective mounts before the single successful render. Both the failed operational packet and original missing-image output remain preserved privately. PR140 separately hardens the bind against automatic directory creation.

Owner bytes remained200/private-no-store and anonymous delivery403/private-no-store. No foreign-principal login was repeated in this trial. The exporter was restored to its original compiled SHA, the native frontend returned to its base configuration, then the callback stopped. No maintained Studio or cloud service changed, and no source/media/GCS content was written.

The source recipe is under `tools/penpot-image-readiness/`; it pins the upstream image, original compiled SHA/size and injection seam. The compiled derivative is private and is not committed. This result does not complete native collaboration/share enforcement, normal Google Studio image-picker acceptance, or fresh-owner native archive/font recovery.
