import test from "node:test";
import assert from "node:assert/strict";
import { Readable } from "node:stream";
import { EventEmitter } from "node:events";
import {
  validateSourceUrl,
  isPublicSourceAddress,
  extractSourceText,
  retrieveSource,
} from "./source-retrieval.js";
const url = "https://source.example/article";
const text =
  "A primary source excerpt retained for an operator to inspect before making any approval decision.";
function transport({
  body = text,
  status = 200,
  headers = { "content-type": "text/plain" },
  onCall = () => {},
} = {}) {
  return (_url, options, callback) => {
    onCall(options);
    const req = new EventEmitter();
    req.destroy = () =>
      req.emit("error", new Error("private transport failure"));
    queueMicrotask(() => {
      const res = Readable.from([Buffer.from(body)]);
      res.statusCode = status;
      res.headers = headers;
      callback(res);
    });
    return req;
  };
}
const publicLookup = async () => [{ address: "8.8.8.8", family: 4 }];
test("source URL and DNS reject SSRF, credentials, redirects and nontext without returning remote body", async () => {
  for (const bad of [
    "http://source.example/a",
    "https://user:pass@source.example/a",
    "https://127.0.0.1/a",
    "https://source.example:444/a",
    "https://source.example/a#frag",
    "https://foreign.example/a",
  ])
    assert.throws(() => validateSourceUrl(bad, "source.example"));
  for (const bad of [
    "127.0.0.1",
    "10.0.0.1",
    "192.168.1.2",
    "169.254.169.254",
    "::1",
    "::ffff:127.0.0.1",
    "fc00::1",
  ])
    assert.equal(isPublicSourceAddress(bad), false);
  let called = false;
  await assert.rejects(
    retrieveSource(url, {
      hosts: "source.example",
      lookup: async () => [{ address: "127.0.0.1", family: 4 }],
      get: () => {
        called = true;
      },
    }),
    /private/,
  );
  assert.equal(called, false);
  await assert.rejects(
    retrieveSource(url, {
      hosts: "source.example",
      lookup: publicLookup,
      get: transport({ status: 302 }),
    }),
    /unsupported/,
  );
  await assert.rejects(
    retrieveSource(url, {
      hosts: "source.example",
      lookup: publicLookup,
      get: transport({ headers: { "content-type": "image/png" } }),
    }),
    /HTML or plain text/,
  );
  await assert.rejects(
    retrieveSource(url, {
      hosts: "source.example",
      lookup: publicLookup,
      get: transport({ body: "x".repeat(524289) }),
    }),
    /too large/,
  );
});
test("actual response bytes and extracted evidence have separate hashes, unreviewed provenance and pinned lookup", async () => {
  let requestOptions;
  const body = `<html><script>invented secret statistic</script><nav>menu</nav><article><p>${text}</p><p>Another &amp; separately retained source paragraph.</p></article></html>`;
  const result = await retrieveSource(url, {
    hosts: "source.example",
    lookup: publicLookup,
    get: transport({
      body,
      headers: { "content-type": "text/html; charset=utf-8" },
      onCall: (options) => (requestOptions = options),
    }),
    now: () => "2026-10-18T00:00:00Z",
  });
  assert.equal(result.status, "unreviewed");
  assert.equal(result.approval, "none");
  assert.equal(
    result.text,
    `${text}\nAnother & separately retained source paragraph.`,
  );
  assert.notEqual(result.responseSha256, result.textSha256);
  assert.equal(result.responseBytes, Buffer.byteLength(body));
  assert.equal(result.retrievedAt, "2026-10-18T00:00:00Z");
  requestOptions.lookup("source.example", {}, (_error, address, family) => {
    assert.equal(address, "8.8.8.8");
    assert.equal(family, 4);
  });
  assert.equal(requestOptions.headers["Accept-Encoding"], "identity");
});
test("cancel during DNS ends before any HTTP request; extraction bounds and empty evidence fail", async () => {
  const controller = new AbortController();
  let release,
    called = false;
  const pending = retrieveSource(url, {
    hosts: "source.example",
    signal: controller.signal,
    lookup: () => new Promise((resolve) => (release = resolve)),
    get: () => {
      called = true;
    },
  });
  controller.abort();
  await assert.rejects(pending, /cancelled/);
  release(await publicLookup());
  await new Promise((resolve) => setImmediate(resolve));
  assert.equal(called, false);
  assert.throws(
    () => extractSourceText("<script>nothing</script>", "text/html"),
    /too little/,
  );
  assert.equal(
    extractSourceText("a".repeat(30000), "text/plain").length,
    24000,
  );
});
