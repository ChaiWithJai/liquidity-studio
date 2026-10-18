import { readFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import {
  MODNET_MODEL_SHA256,
  MODNET_PROCESSOR_VERSION,
} from "../src/lib/modnet-processor.js";
const EXPECTED_SIZE = 25_888_640;
const CHUNK_SIZE = 256 * 1024;
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
  read = readFile,
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
    async manifest() {
      await load();
      return {
        id: "modnet-fp32",
        sha256: MODNET_MODEL_SHA256,
        size: EXPECTED_SIZE,
        chunkSize: CHUNK_SIZE,
        chunks: Math.ceil(EXPECTED_SIZE / CHUNK_SIZE),
        processorVersion: MODNET_PROCESSOR_VERSION,
        outputPolicy: "preserve-resolution-or-reject",
        maximumOutputBytes: 512 * 1024,
      };
    },
    async chunk(index) {
      if (
        !Number.isInteger(index) ||
        index < 0 ||
        index >= Math.ceil(EXPECTED_SIZE / CHUNK_SIZE)
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
