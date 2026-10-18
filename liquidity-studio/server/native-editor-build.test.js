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
    "/node_modules/onnxruntime-web/dist/ort.wasm.js",
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
    "assets/ort-wasm-simd-threaded.wasm",
    "assets/modnet-worker-123.js",
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

test("production server imports with the Docker runtime layout and no frontend src tree", async () => {
  const { mkdtempSync, cpSync, writeFileSync, symlinkSync, rmSync } =
    await import("node:fs");
  const { tmpdir } = await import("node:os");
  const path = await import("node:path");
  const { fileURLToPath } = await import("node:url");
  const { spawnSync } = await import("node:child_process");
  const directory = mkdtempSync(path.join(tmpdir(), "studio-runtime-layout-"));
  try {
    cpSync(
      fileURLToPath(new URL(".", import.meta.url)),
      path.join(directory, "server"),
      { recursive: true, filter: (source) => !source.endsWith(".test.js") },
    );
    writeFileSync(
      path.join(directory, "package.json"),
      JSON.stringify({ type: "module" }),
    );
    symlinkSync(
      fileURLToPath(new URL("../node_modules", import.meta.url)),
      path.join(directory, "node_modules"),
      "dir",
    );
    const result = spawnSync(
      process.execPath,
      ["--input-type=module", "-e", "await import('./server/index.js');"],
      {
        cwd: directory,
        timeout: 15000,
        encoding: "utf8",
        env: { ...process.env, NODE_ENV: "production" },
      },
    );
    assert.equal(result.status, 0, result.stderr);
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});
