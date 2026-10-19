import { open } from "node:fs/promises";
import { createHash } from "node:crypto";
import {
  MODNET_MODEL_SHA256,
  MODNET_PROCESSOR_VERSION,
  MODNET_MODEL_BYTES,
  MODNET_MODEL_CHUNK_SIZE,
  MODNET_MODEL_CHUNKS,
} from "./native-cutout-contract.js";
const EXPECTED_SIZE = MODNET_MODEL_BYTES;
const CHUNK_SIZE = MODNET_MODEL_CHUNK_SIZE;
async function readModel(path) {
  const handle = await open(path, "r");
  try {
    const stat = await handle.stat();
    if (!stat.isFile() || stat.size !== EXPECTED_SIZE) throw fail();
    const bytes = Buffer.alloc(EXPECTED_SIZE);
    let offset = 0;
    while (offset < bytes.length) {
      const { bytesRead } = await handle.read(
        bytes,
        offset,
        bytes.length - offset,
        offset,
      );
      if (!bytesRead) throw fail();
      offset += bytesRead;
    }
    const extra = Buffer.alloc(1);
    if ((await handle.read(extra, 0, 1, EXPECTED_SIZE)).bytesRead) throw fail();
    return bytes;
  } finally {
    await handle.close();
  }
}
const fail = () =>
  Object.assign(new Error("Native background removal is unavailable."), {
    status: 503,
    code: "CUTOUT_UNAVAILABLE",
  });
/** Operator-owned configuration only. Never accepts a request-controlled path or
 * URL; a failed read/hash is not cached as success and reveals no private path. */
export function createNativeCutoutModel({
  enabled = false,
  path,
  read = readModel,
} = {}) {
  let bytes = null,
    loading = null;
  async function load() {
    if (!enabled || typeof path !== "string" || !path) throw fail();
    if (bytes) return bytes;
    if (!loading)
      loading = (async () => {
        try {
          const value = await read(path);
          if (
            value.length !== EXPECTED_SIZE ||
            createHash("sha256").update(value).digest("hex") !==
              MODNET_MODEL_SHA256
          )
            throw fail();
          bytes = Buffer.from(value);
          return bytes;
        } catch {
          throw fail();
        } finally {
          loading = null;
        }
      })();
    return loading;
  }
  return {
    configured: enabled === true && typeof path === "string" && Boolean(path),
    async manifest() {
      await load();
      return {
        id: "modnet-fp32",
        sha256: MODNET_MODEL_SHA256,
        size: EXPECTED_SIZE,
        chunkSize: CHUNK_SIZE,
        chunks: MODNET_MODEL_CHUNKS,
        processorVersion: MODNET_PROCESSOR_VERSION,
        outputPolicy: "preserve-resolution-or-reject",
        maximumOutputBytes: 512 * 1024,
      };
    },
    async chunk(index) {
      if (
        !Number.isInteger(index) ||
        index < 0 ||
        index >= MODNET_MODEL_CHUNKS
      )
        throw Object.assign(new Error("Invalid model chunk."), {
          status: 400,
          code: "INVALID_MODEL_CHUNK",
        });
      const value = await load();
      return {
        index,
        sha256: MODNET_MODEL_SHA256,
        base64: value
          .subarray(index * CHUNK_SIZE, (index + 1) * CHUNK_SIZE)
          .toString("base64"),
      };
    },
  };
}
