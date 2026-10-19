/** Original shared immutable contract, copied into the server runtime image. */
export const MODNET_PROCESSOR_VERSION = "studio-modnet-area-v1";
export const MODNET_MODEL_SHA256 =
  "0c51523c07db8279bcc7239e12f333a662a594075ce1d80a949b4f781dd1d1e3";

// Independent authors-checkpoint conversion; see the provenance sidecar in
// docs/investigations/modnet-independent-conversion (no model bytes in source).
export const MODNET_MODEL_BYTES = 25_961_493;
export const MODNET_MODEL_CHUNK_SIZE = 256 * 1024;
export const MODNET_MODEL_CHUNKS = Math.ceil(MODNET_MODEL_BYTES / MODNET_MODEL_CHUNK_SIZE);
