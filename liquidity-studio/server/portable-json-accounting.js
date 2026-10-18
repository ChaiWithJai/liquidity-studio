import { createHash } from "node:crypto";
import { fail } from "./auth.js";

const STRING_CHUNK = 4096;
const MAX_BYTES = 48 * 1024 * 1024;

/** Bounded JSON-domain accounting. Never builds a whole serialized object/string. */
export function accountPortableJson(value, { maxBytes = MAX_BYTES, omitRootKeys = [] } = {}) {
  if (!Number.isSafeInteger(maxBytes) || maxBytes < 1 || maxBytes > MAX_BYTES ||
      !Array.isArray(omitRootKeys) || omitRootKeys.some(key => typeof key !== "string"))
    throw fail(422, "Invalid portable JSON accounting options");
  const makeSink = omit => ({
    bytes: 0, hash: createHash("sha256"), omit,
    write(token) {
      this.bytes += Buffer.byteLength(token, "utf8");
      if (this.bytes > maxBytes) throw fail(413, "Editor pack exceeds 48 MiB");
      this.hash.update(token, "utf8");
    },
  });
  const full = makeSink(new Set()), content = makeSink(new Set(omitRootKeys));
  const ancestors = new Set();
  const emit = (token, sinks) => { for (const sink of sinks) sink.write(token); };
  function string(text, sinks) {
    emit('"', sinks);
    for (let start = 0; start < text.length;) {
      let end = Math.min(start + STRING_CHUNK, text.length);
      // JSON.stringify escapes lone surrogates. Keep a real pair together so
      // splitting never changes that pair into two escaped lone surrogates.
      if (end < text.length && text.charCodeAt(end - 1) >= 0xd800 &&
          text.charCodeAt(end - 1) <= 0xdbff && text.charCodeAt(end) >= 0xdc00 &&
          text.charCodeAt(end) <= 0xdfff) end--;
      const encoded = JSON.stringify(text.slice(start, end));
      emit(encoded.slice(1, -1), sinks);
      start = end;
    }
    emit('"', sinks);
  }
  function descriptor(object, key) {
    const field = Object.getOwnPropertyDescriptor(object, key);
    if (field && !Object.hasOwn(field, "value"))
      throw fail(422, "Portable JSON accessors are unsupported");
    return field;
  }
  function visit(item, sinks, depth) {
    // The existing scanPortable(content) remains the node-count authority.
    // Counting the full wrapper here would count sha256/omissions differently.
    if (depth > 40) throw fail(413, "Editor pack complexity limit");
    if (item === null) return emit("null", sinks);
    if (typeof item === "string") return string(item, sinks);
    if (typeof item === "boolean") return emit(item ? "true" : "false", sinks);
    if (typeof item === "number") {
      if (!Number.isFinite(item)) throw fail(422, "Portable JSON numbers must be finite");
      return emit(JSON.stringify(item), sinks);
    }
    if (typeof item !== "object") throw fail(422, "Unsupported portable JSON value");
    const array = Array.isArray(item), prototype = Object.getPrototypeOf(item);
    if ((!array && prototype !== Object.prototype && prototype !== null) ||
        (array && prototype !== Array.prototype) || "toJSON" in item ||
        Object.getOwnPropertySymbols(item).length)
      throw fail(422, "Portable JSON requires plain data without toJSON");
    if (ancestors.has(item)) throw fail(422, "Cyclic portable JSON is unsupported");
    ancestors.add(item);
    if (array) {
      // Actual JSON arrays have no extra enumerable properties.
      if (Object.keys(item).some(key => !/^(0|[1-9][0-9]*)$/.test(key) || Number(key) >= item.length))
        throw fail(422, "Unsupported portable JSON array fields");
      emit("[", sinks);
      for (let index = 0; index < item.length; index++) {
        if (index) emit(",", sinks);
        const field = descriptor(item, String(index));
        // Match JSON.stringify holes/undefined without invoking getters.
        if (!field || field.value === undefined) emit("null", sinks);
        else visit(field.value, sinks, depth + 1);
      }
      emit("]", sinks);
    } else {
      emit("{", sinks);
      const first = new Map(sinks.map(sink => [sink, true]));
      for (const key of Object.keys(item)) {
        const field = descriptor(item, key);
        if (field.value === undefined) continue; // Standard object omission.
        const active = depth === 0 ? sinks.filter(sink => !sink.omit.has(key)) : sinks;
        for (const sink of active) {
          if (!first.get(sink)) sink.write(",");
          first.set(sink, false);
        }
        string(key, active); emit(":", active);
        visit(field.value, active, depth + 1);
      }
      emit("}", sinks);
    }
    ancestors.delete(item);
  }
  visit(value, [full, content], 0);
  return {
    bytes: full.bytes,
    sha256: full.hash.digest("hex"),
    contentBytes: content.bytes,
    contentSha256: content.hash.digest("hex"),
  };
}
