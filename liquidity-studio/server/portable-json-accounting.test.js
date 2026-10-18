import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { accountPortableJson } from "./portable-json-accounting.js";

const hash = value => createHash("sha256").update(JSON.stringify(value), "utf8").digest("hex");
function equivalent(value) {
  const result = accountPortableJson(value);
  assert.equal(result.bytes, Buffer.byteLength(JSON.stringify(value), "utf8"));
  assert.equal(result.sha256, hash(value));
  assert.equal(result.contentSha256, hash(value));
}

test("bounded tokens equal standard JSON at Unicode/escape/surrogate chunk boundaries", () => {
  for (const offset of [0, 4094, 4095, 4096, 4097, 8191]) {
    for (const suffix of ["😀", "\uD800", "\uDC00", "\uD800x\uDC00", "ॐé\u2028\u2029", "\n\r\t\b\f\u0000\"\\"]) {
      equivalent({ ["k".repeat(offset) + suffix]: "a".repeat(offset) + suffix + "tail" });
    }
  }
  equivalent({ long: ("😀ॐ\n\\\"\uD800!").repeat(1200) });
});

test("plain nested JSON matches integer/key order, numbers, arrays and standard omissions", () => {
  const shared = { x: 1 };
  const value = {
    "10": "ten", "2": "two", z: -0, a: [null, true, false, 1e21, 1e-7, Number.MAX_VALUE, Number.MIN_VALUE],
    omitted: undefined, nested: { b: [shared, shared], a: "é" }, holes: [, undefined, null],
  };
  equivalent(value);
  equivalent(Object.assign(Object.create(null), { second: "b", first: "a" }));
  const result = accountPortableJson({ sha256: "old", files: [{ base64: "AA==", size: 1, kind: "image", sha256: "file" }], scope: { b: 2, a: 1 } }, { omitRootKeys: ["sha256"] });
  assert.equal(result.contentSha256, hash({ files: [{ base64: "AA==", size: 1, kind: "image", sha256: "file" }], scope: { b: 2, a: 1 } }));
});

test("unsupported data is explicit and cannot invoke accessors or toJSON", () => {
  let calls = 0;
  const getter = Object.defineProperty({}, "value", { enumerable: true, get() { calls++; return "hidden"; } });
  const cyclic = {}; cyclic.self = cyclic;
  for (const value of [getter, cyclic, new Date(), new Map(), { toJSON() { calls++; return {}; } }, { v: Infinity }, { v: NaN }, { v: 1n }, { v() {} }, { v: Symbol("s") }]) {
    assert.throws(() => accountPortableJson(value), { status: 422 });
  }
  assert.equal(calls, 0);
});

test("byte ceiling stops during bounded tokens without building a whole serialized input", () => {
  assert.throws(() => accountPortableJson({ text: "😀".repeat(5000) }, { maxBytes: 128 }), { status: 413 });
  assert.throws(() => accountPortableJson({}, { maxBytes: 48 * 1024 * 1024 + 1 }), { status: 422 });
  const value = { text: "exact\nॐ" };
  const length = Buffer.byteLength(JSON.stringify(value));
  assert.equal(accountPortableJson(value, { maxBytes: length }).bytes, length);
  assert.throws(() => accountPortableJson(value, { maxBytes: length - 1 }), { status: 413 });
});

test("serialization does not introduce a second conflicting content-node cap", () => {
  // Existing scanPortable separately counts omitted object values and skips holes.
  const plain = { optional: undefined, holes: [, undefined], nested: { value: null } };
  equivalent(plain);
  const full = { sha256: "checksum", ...plain };
  const result = accountPortableJson(full, { omitRootKeys: ["sha256"] });
  assert.equal(result.contentSha256, hash(plain));
});
