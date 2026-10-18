import test from "node:test";
import assert from "node:assert/strict";
import {
  assertOriginalOnlyNativeBundle,
  canonicalizeLegalFooter,
} from "../scripts/native-editor-vite.js";
test("original-only build blocks upstream source, dependencies and emitted frame assets", () => {
  assert.doesNotThrow(() =>
    assertOriginalOnlyNativeBundle({
      main: { fileName: "index.js", modules: { "/src/App.svelte": {} } },
    }),
  );
  for (const id of [
    "/.native-editor-source/editor/EditorApp.tsx",
    "/node_modules/react/index.js",
    "/node_modules/react-dom/client.js",
    "/node_modules/fabric/dist/index.js",
  ])
    assert.throws(
      () =>
        assertOriginalOnlyNativeBundle({
          main: { fileName: "index.js", modules: { [id]: {} } },
        }),
      /Upstream native module/,
    );
  for (const fileName of [
    "native-editor-frame.html",
    "native-editor-license.txt",
  ])
    assert.throws(
      () => assertOriginalOnlyNativeBundle({ asset: { fileName } }),
      /Upstream native asset/,
    );
});

test("legal footer canonicalization preserves all notices and executable bytes across traversal order", () => {
  const body = 'const text = "/* ordinary inline data */"; console.log(text);';
  const a = "/** @license Copyright A */";
  const b = "/** @license Copyright B */";
  assert.equal(
    canonicalizeLegalFooter(body + "\n" + a + "\n" + b),
    canonicalizeLegalFooter(body + "\n" + b + "\n" + a + "\n" + a),
  );
  assert.equal(
    canonicalizeLegalFooter(body + "\n" + a + "\n" + b),
    body + "\n" + a + "\n" + b + "\n",
  );
  assert.equal(canonicalizeLegalFooter(body), body);
});
