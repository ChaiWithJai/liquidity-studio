import test from "node:test";
import assert from "node:assert/strict";
import {
  createPenpotNativeExports,
  parsePenpotSingleExport,
} from "./penpot-native-export.js";

const ids = {
  profile: "11111111-1111-4111-8111-111111111111",
  file: "22222222-2222-4222-8222-222222222222",
  page: "33333333-3333-4333-8333-333333333333",
  object: "44444444-4444-4444-8444-444444444444",
  output: "55555555-5555-4555-8555-555555555555",
  task: "66666666-6666-4666-8666-666666666666",
};
function envelope() {
  return {
    "~:wait": true,
    "~:exports": [
      {
        "~:type": "~:png",
        "~:suffix": "",
        "~:scale": 1,
        "~:page-id": "~u" + ids.page,
        "~:file-id": "~u" + ids.file,
        "~:name": "Original fixture",
        "~:object-id": "~u" + ids.object,
      },
    ],
    "~:profile-id": "~u" + ids.profile,
    "~:cmd": "~:export-shapes",
    "~:is-wasm": false,
  };
}
const body = (value) => Buffer.from(JSON.stringify(value));
const headers = { "content-type": "application/transit+json" };
const context = (request) => ({
  organizationId: "org",
  brandId: "brand",
  bindingId: "binding",
  bindingEpoch: 1,
  ownerPrincipal: ids.profile,
  fileId: ids.file,
  projectId: ids.page,
  actorId: "founder",
  sourceSha256: "a".repeat(64),
  manifestSha256: "b".repeat(64),
  request,
  nativeRevision: 4,
  nativeSha256: "c".repeat(64),
});

// These are constructor-only protocol regressions, not real native/Google proof.
test("pinned export envelope rejects compact tags, extra fields, async, multi and unsupported scaling", () => {
  const parsed = parsePenpotSingleExport(
    body(envelope()),
    headers["content-type"],
  );
  assert.equal(parsed.request.fileId, ids.file);
  for (const mutate of [
    (v) => (v["~:wait"] = false),
    (v) => v["~:exports"].push(v["~:exports"][0]),
    (v) => (v["~:exports"][0]["~:scale"] = 2),
    (v) => (v["~:exports"][0]["~:file-id"] = true),
    (v) => (v["~:exports"][0]["~:url"] = "https://example.invalid/image"),
    (v) =>
      Object.defineProperty(v, "__proto__", { value: {}, enumerable: true }),
  ]) {
    const v = envelope();
    mutate(v);
    assert.throws(() =>
      parsePenpotSingleExport(body(v), headers["content-type"]),
    );
  }
  assert.throws(() =>
    parsePenpotSingleExport(
      body(["^ ", "~:wait", true]),
      headers["content-type"],
    ),
  );
  assert.throws(() =>
    parsePenpotSingleExport(body(envelope()), "application/json"),
  );
});

test("pending native output is unreadable, relay capability is one-use and only verified exact bytes gain an expiring receipt", async () => {
  const records = new Map();
  let clock = 1000;
  let service;
  let checkedPending = false;
  let relayBody;
  const store = {
    get: (key) => structuredClone(records.get(key)),
    update: (key, fn) => {
      const value = fn(structuredClone(records.get(key)));
      records.set(key, structuredClone(value));
      return value;
    },
  };
  const fixture = Buffer.from(
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQIHWP4z8DwHwAFgAI/ScLbtAAAAABJRU5ErkJggg==",
    "base64",
  );
  service = createPenpotNativeExports({
    store,
    now: () => clock,
    authorizeContext: async (_cookie, request) => context(request),
    reauthorizeContext: async () => {},
    fetchImpl: async (url, options) => {
      const path = new URL(url).pathname;
      if (path === "/__studio_native_export") {
        const input = {
          capability: options.headers["X-Studio-Export-Relay"],
          cookie: options.headers.Cookie,
          method: "POST",
          path,
          contentType: options.headers["Content-Type"],
          bodyHash: options.headers["X-Studio-Export-Body-Sha256"],
        };
        relayBody = (await service.authorizeRelay(input)).body;
        assert.equal(relayBody, options.body);
        await assert.rejects(service.authorizeRelay(input), { status: 403 });
        return new Response(
          JSON.stringify({
            "~:mtype": "image/png",
            "~:name": "Original fixture",
            "~:filename": "Original fixture.png",
            "~:id": "~u" + ids.task,
            "~:uri": {
              "~#uri": "http://localhost:39008/assets/by-id/" + ids.output,
            },
          }),
          { headers },
        );
      }
      await assert.rejects(
        service.resolve(
          { kind: "by-id", id: ids.output, thumbnail: false },
          ids.profile,
        ),
        { status: 403 },
      );
      checkedPending = true;
      await service.authorizeRelay({
        capability: options.headers["X-Studio-Export-Relay"],
        cookie: options.headers.Cookie,
        method: "GET",
        path,
      });
      return new Response(fixture, {
        headers: {
          "Content-Type": "image/png",
          "Content-Disposition": "attachment",
        },
      });
    },
  });
  const result = await service.execute({
    body: body(envelope()),
    contentType: headers["content-type"],
    cookie: "auth-token=native-session",
    origin: "http://localhost:39008",
  });
  assert.equal(result.contentType, headers["content-type"]);
  assert.ok(checkedPending);
  assert.ok(relayBody);
  const receipt = await service.resolve(
    { kind: "by-id", id: ids.output },
    ids.profile,
  );
  assert.equal(receipt.status, "verified");
  assert.equal(receipt.size, fixture.length);
  assert.equal(receipt.sha256.length, 64);
  assert.equal(
    JSON.stringify([...records.values()]).includes("native-session"),
    false,
  );
  assert.equal(
    await service.resolve({ kind: "by-id", id: ids.output }, ids.task),
    null,
  );
  clock += 600_001;
  await assert.rejects(
    service.resolve({ kind: "by-id", id: ids.output }, ids.profile),
    { status: 403 },
  );
});

test("failed output verification never admits its durable receipt", async () => {
  const records = new Map();
  let service;
  const store = {
    get: (key) => structuredClone(records.get(key)),
    update: (key, fn) => {
      const next = fn(structuredClone(records.get(key)));
      records.set(key, next);
      return next;
    },
  };
  service = createPenpotNativeExports({
    store,
    authorizeContext: async (_cookie, request) => context(request),
    reauthorizeContext: async () => {},
    fetchImpl: async (url) =>
      new URL(url).pathname === "/__studio_native_export"
        ? new Response(
            JSON.stringify({
              "~:mtype": "image/png",
              "~:name": "Original fixture",
              "~:filename": "Original fixture.png",
              "~:id": "~u" + ids.task,
              "~:uri": {
                "~#uri": "http://localhost:39008/assets/by-id/" + ids.output,
              },
            }),
            { headers },
          )
        : new Response("invalid", {
            headers: {
              "Content-Type": "image/png",
              "Content-Disposition": "attachment",
            },
          }),
  });
  await assert.rejects(
    service.execute({
      body: body(envelope()),
      contentType: headers["content-type"],
      cookie: "auth-token=native-session",
      origin: "http://localhost:39008",
    }),
    { status: 502 },
  );
  await assert.rejects(
    service.resolve({ kind: "by-id", id: ids.output }, ids.profile),
    { status: 403 },
  );
  assert.equal([...records.values()][0].records[0].status, "failed");
});

test("embedded SVG delivery rechecks owner/context and original/resource hashes without persisting payloads or exposing raw bytes", async () => {
  const { createHash } = await import("node:crypto");
  const hash = (value) => createHash("sha256").update(value).digest("hex");
  const records = new Map();
  const store = {
    get: (key) => structuredClone(records.get(key)),
    update: (key, fn) => {
      const value = fn(structuredClone(records.get(key)));
      records.set(key, structuredClone(value));
      return value;
    },
  };
  const asset = Buffer.from("controlled source image"),
    assetHash = hash(asset);
  const original = Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg"><image href="http://localhost:39008/assets/by-file-media-id/${ids.object}"/><text x="80">HUMAN TEXT</text></svg>`,
  );
  let sourceRevision = 4,
    changedOriginal = false,
    changedAsset = false,
    clock = 1000,
    service;
  service = createPenpotNativeExports({
    store,
    now: () => clock,
    authorizeContext: async (cookie, request) => {
      assert.equal(cookie, "auth-token=native-session");
      return { ...context(request), nativeRevision: sourceRevision };
    },
    reauthorizeContext: async () => {},
    resolveSvgResource: async ({ resource, context: current, cookie }) => {
      assert.equal(cookie, "auth-token=native-session");
      assert.equal(resource.path, `/assets/by-file-media-id/${ids.object}`);
      assert.equal(current.fileId, ids.file);
      return { sha256: assetHash, contentType: "image/png" };
    },
    fetchImpl: async (url, options) => {
      const path = new URL(url).pathname;
      if (path === "/__studio_native_export") {
        await service.authorizeRelay({
          capability: options.headers["X-Studio-Export-Relay"],
          cookie: options.headers.Cookie,
          method: "POST",
          path,
          contentType: options.headers["Content-Type"],
          bodyHash: options.headers["X-Studio-Export-Body-Sha256"],
        });
        return new Response(
          JSON.stringify({
            "~:mtype": "image/svg+xml",
            "~:name": "Original fixture",
            "~:filename": "Original fixture.svg",
            "~:id": "~u" + ids.task,
            "~:uri": {
              "~#uri": `http://localhost:39008/assets/by-id/${ids.output}`,
            },
          }),
          { headers },
        );
      }
      if (path === `/__studio_native_export_output/${ids.output}`) {
        await service.authorizeRelay({
          capability: options.headers["X-Studio-Export-Relay"],
          cookie: options.headers.Cookie,
          method: "GET",
          path,
        });
        return new Response(
          changedOriginal ? Buffer.from("changed") : original,
          {
            headers: {
              "Content-Type": "image/svg+xml",
              "Content-Disposition": "attachment",
            },
          },
        );
      }
      assert.equal(path, `/assets/by-file-media-id/${ids.object}`);
      return new Response(changedAsset ? Buffer.from("tampered") : asset);
    },
  });
  const value = envelope();
  value["~:exports"][0]["~:type"] = "~:svg";
  const response = await service.execute({
    body: body(value),
    contentType: headers["content-type"],
    cookie: "auth-token=native-session",
    origin: "http://localhost:39008",
  });
  assert.equal(
    JSON.parse(response.body)["~:uri"]["~#uri"],
    `http://localhost:39008/__studio_native_embedded_svg/${ids.output}`,
  );
  assert.equal(
    await service.resolve({ kind: "by-id", id: ids.output }, ids.profile),
    null,
  );
  const first = await service.readEmbedded({
    id: ids.output,
    cookie: "auth-token=native-session",
  });
  assert.match(first.bytes.toString(), /data:image\/png;base64,/);
  assert.match(first.bytes.toString(), /HUMAN TEXT/);
  assert.equal(
    JSON.stringify([...records.values()]).includes(asset.toString("base64")),
    false,
  );
  assert.equal(
    JSON.stringify([...records.values()]).includes("native-session"),
    false,
  );
  changedOriginal = true;
  await assert.rejects(
    service.readEmbedded({
      id: ids.output,
      cookie: "auth-token=native-session",
    }),
    { status: 409 },
  );
  changedOriginal = false;
  changedAsset = true;
  await assert.rejects(
    service.readEmbedded({
      id: ids.output,
      cookie: "auth-token=native-session",
    }),
    { status: 409 },
  );
  changedAsset = false;
  sourceRevision++;
  await assert.rejects(
    service.readEmbedded({
      id: ids.output,
      cookie: "auth-token=native-session",
    }),
    { status: 409 },
  );
  sourceRevision--;
  await assert.rejects(
    service.readEmbedded({
      id: ids.output,
      cookie: "auth-token=other-session",
    }),
  );
  clock += 600001;
  await assert.rejects(
    service.readEmbedded({
      id: ids.output,
      cookie: "auth-token=native-session",
    }),
    { status: 403 },
  );
});
