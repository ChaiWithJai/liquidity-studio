import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";
const wrapper = readFileSync(
  new URL(
    "../../tools/penpot-image-readiness/readiness-wrapper.js",
    import.meta.url,
  ),
  "utf8",
);
const frameId = "11111111-1111-4111-8111-111111111111";
const path = "/assets/by-file-media-id/22222222-2222-4222-8222-222222222222";
const arity = "cljs$core$IFn$_invoke$arity$2";
function fixture({
  decodeError = false,
  hang = false,
  forbidden = false,
  width = 384,
} = {}) {
  const calls = [],
    logs = [],
    images = [];
  let raf = 0;
  const root = {
    id: "screenshot-" + frameId,
    querySelectorAll: () => [
      {
        getAttribute: () =>
          forbidden ? "https://outside.invalid/image" : path,
      },
    ],
  };
  const screenshot = function (frame, options) {
    return screenshot[arity](frame, options);
  };
  screenshot[arity] = function (frame, options) {
    calls.push({
      frame,
      options,
      hold: root.__studioNativeDecodedImageHoldV1?.images.length,
    });
    return "original native capture";
  };
  screenshot.cljs$core$IFn$_invoke$arity$1 = (frame) =>
    screenshot[arity](frame, { originalDefault: true });
  const frame = { evaluate: async (fn, config) => fn(root, config) };
  class FixtureImage {
    constructor() {
      this.naturalWidth = width;
      this.naturalHeight = 384;
      images.push(this);
    }
    decode() {
      if (hang) return new Promise(() => {});
      return decodeError
        ? Promise.reject(Error("private upstream URL must not be logged"))
        : Promise.resolve();
    }
  }
  const sandbox = {
    app: { browser: { screenshot } },
    URL,
    Date,
    Image: FixtureImage,
    location: {
      origin: "http://penpot-frontend:8080",
      href: "http://penpot-frontend:8080/render.html",
    },
    performance: {
      now: () => 100,
      getEntriesByName: () => [{ entryType: "resource", responseEnd: 80 }],
    },
    requestAnimationFrame: (fn) => {
      raf++;
      queueMicrotask(fn);
    },
    setTimeout: hang
      ? (fn) => {
          queueMicrotask(fn);
          return 1;
        }
      : setTimeout,
    clearTimeout: hang ? () => {} : clearTimeout,
    console: {
      info: (...args) => logs.push(args.join(" ")),
      error: (...args) => logs.push(args.join(" ")),
    },
  };
  vm.runInNewContext(
    wrapper.replace(
      "/* STUDIO_READINESS_CONFIG */ null",
      JSON.stringify({ frameIds: [frameId], imagePaths: [path] }),
    ),
    sandbox,
  );
  return {
    root,
    frame,
    screenshot,
    calls,
    logs,
    images,
    get raf() {
      return raf;
    },
  };
}
test("hook preserves original CLJS arity dispatch/options and captures only after decode/two RAF; releases images afterward", async () => {
  const f = fixture(),
    options = { original: "unchanged" };
  assert.equal(await f.screenshot(f.frame, options), "original native capture");
  assert.equal(f.calls.length, 1);
  assert.equal(f.calls[0].options, options);
  assert.equal(f.calls[0].hold, 1);
  assert.equal(f.raf, 2);
  assert.equal(f.root.__studioNativeDecodedImageHoldV1, undefined);
  assert.equal(f.images[0].src, "");
  assert.equal(
    await f.screenshot.cljs$core$IFn$_invoke$arity$1(f.frame),
    "original native capture",
  );
  assert.equal(f.calls[1].options.originalDefault, true);
  assert.equal(f.logs.join("").includes(path), false);
  assert.match(f.logs.join(""), /responseEndAtEntryMs/);
});
test("failed decode, deadline, unregistered URL and over-budget pixels emit no native capture and release pending image references", async () => {
  for (const options of [
    { decodeError: true },
    { hang: true },
    { forbidden: true },
    { width: 2048 },
  ]) {
    const f = fixture(options);
    await assert.rejects(
      f.screenshot(f.frame, {}),
      /readiness or screenshot failed/,
    );
    assert.equal(f.calls.length, 0);
    assert.equal(f.root.__studioNativeDecodedImageHoldV1, undefined);
    assert.equal(f.logs.join("").includes("outside.invalid"), false);
    for (const image of f.images) assert.equal(image.src, "");
  }
});
test("unregistered frame rejects before loading image bytes and repeated holds fail closed", async () => {
  const f = fixture();
  f.root.id = "screenshot-33333333-3333-4333-8333-333333333333";
  await assert.rejects(f.screenshot(f.frame, {}));
  assert.equal(f.images.length, 0);
  assert.equal(f.calls.length, 0);
  const g = fixture();
  const otherHold = { captureId: 999, images: [] };
  g.root.__studioNativeDecodedImageHoldV1 = otherHold;
  await assert.rejects(g.screenshot(g.frame, {}));
  assert.equal(g.calls.length, 0);
  assert.equal(g.root.__studioNativeDecodedImageHoldV1, otherHold);
});
