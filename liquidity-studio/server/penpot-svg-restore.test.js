import test from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { compilePenpotSvgRestoreRepair } from "./penpot-svg-restore.js";
function fixture() {
  const pageId = randomUUID(),
    id = randomUUID();
  return {
    id: randomUUID(),
    projectId: randomUUID(),
    revn: 4,
    vern: 0,
    data: {
      pages: [pageId],
      pagesIndex: {
        [pageId]: {
          id: pageId,
          objects: {
            [id]: {
              id,
              type: "svg-raw",
              content: {
                tag: "text",
                attrs: { fill: "#fff" },
                content: [
                  {
                    tag: "tspan",
                    attrs: { "font-size": "34" },
                    content: ["~:literal ^reference text"],
                  },
                ],
              },
            },
          },
        },
      },
    },
  };
}
const compile = (file) =>
  compilePenpotSvgRestoreRepair({
    file,
    nativeVersion: "2.18.3",
    expectedRevision: file.revn,
  });
test("restored raw text/tspan tags become typed Transit without changing text, shape identity or input", () => {
  const file = fixture(),
    before = structuredClone(file),
    plan = compile(file),
    wire = JSON.parse(plan.transitBody);
  assert.deepEqual(file, before);
  assert.equal(plan.changedShapes.length, 1);
  assert.equal(plan.fileId, file.id);
  assert.ok(wire.includes("~u" + file.id));
  assert.ok(plan.transitBody.includes('"~:text"'));
  assert.ok(plan.transitBody.includes('"~:tspan"'));
  assert.ok(plan.transitBody.includes('"~~:literal ^reference text"'));
  assert.ok(!plan.transitBody.includes("set-token"));
  assert.ok(!plan.transitBody.includes("font-id"));
});
test("version, revision, malformed identity and executable/unknown SVG content fail closed", () => {
  const file = fixture(),
    shape = () =>
      Object.values(file.data.pagesIndex[file.data.pages[0]].objects)[0];
  assert.throws(
    () =>
      compilePenpotSvgRestoreRepair({
        file,
        nativeVersion: "2.18.4",
        expectedRevision: 4,
      }),
    /UNSUPPORTED_NATIVE_VERSION/,
  );
  for (const revision of [true, 4.5, 3])
    assert.throws(
      () =>
        compilePenpotSvgRestoreRepair({
          file,
          nativeVersion: "2.18.3",
          expectedRevision: revision,
        }),
      /STALE_NATIVE_REVISION/,
    );
  for (const tag of ["script", "image", "use", "foreignObject", [], null]) {
    shape().content.tag = tag;
    assert.throws(() => compile(file), /UNSUPPORTED_RAW_SVG_TAG/);
  }
  shape().content.tag = "text";
  for (const attrs of [
    { onload: "x" },
    { href: "https://example.org" },
    { fill: "url(https://example.org)" },
    { fill: [] },
  ]) {
    shape().content.attrs = attrs;
    assert.throws(() => compile(file), /UNSUPPORTED_SVG_ATTRIBUTE/);
  }
});
test("existing native typography and raw text leaves are not rewritten; native page identity is validated", () => {
  const file = fixture(),
    page = file.data.pagesIndex[file.data.pages[0]],
    textId = randomUUID(),
    leafId = randomUUID();
  page.objects[textId] = {
    id: textId,
    type: "text",
    content: { unrelated: "native-rich-text" },
  };
  page.objects[leafId] = {
    id: leafId,
    type: "svg-raw",
    content: "unchanged leaf",
  };
  assert.equal(compile(file).changedShapes.length, 1);
  page.id = randomUUID();
  assert.throws(() => compile(file), /INVALID_NATIVE_PAGE/);
});
test("repair size, depth and duplicate pages are bounded before submitting changes", () => {
  const file = fixture(),
    page = file.data.pagesIndex[file.data.pages[0]],
    shape = Object.values(page.objects)[0];
  file.data.pages.push(file.data.pages[0]);
  assert.throws(() => compile(file), /INVALID_NATIVE_PAGES/);
  file.data.pages.pop();
  let value = "leaf";
  for (let n = 0; n < 40; n++) value = { tag: "tspan", content: [value] };
  shape.content = value;
  assert.throws(() => compile(file), /SVG_CONTENT_TOO_DEEP/);
  shape.content = { tag: "text", content: ["x".repeat(2 * 1024 * 1024)] };
  assert.throws(() => compile(file), /NATIVE_REPAIR_TOO_LARGE/);
});
