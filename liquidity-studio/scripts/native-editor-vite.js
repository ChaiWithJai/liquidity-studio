import path from "node:path";
import fs from "node:fs";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";
const project = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);
export function assertOriginalOnlyNativeBundle(bundle) {
  for (const output of Object.values(bundle)) {
    if (
      ["native-editor-frame.html", "native-editor-license.txt"].includes(
        output.fileName,
      ) ||
      /(?:modnet|ort-wasm).*\.(?:onnx|wasm|mjs|js)$/.test(output.fileName)
    )
      throw new Error("Upstream native asset in original-only build");
    for (const id of Object.keys(output.modules || {})) {
      if (
        id.includes("/.native-editor-source/") ||
        /\/node_modules\/(react|react-dom|fabric|onnxruntime-web)\//.test(id)
      )
        throw new Error("Upstream native module in original-only build");
    }
  }
}
/** Canonicalize only esbuild's trailing legal-comment footer, before Rollup hashes the chunk. */
export function canonicalizeLegalFooter(code) {
  let body = code.trimEnd();
  const notices = [];
  while (body.endsWith("*/")) {
    const start = body.lastIndexOf("/*");
    if (start < 0) break;
    const notice = body.slice(start);
    if (
      !notice.includes("@license") &&
      !notice.includes("@preserve") &&
      !notice.startsWith("/*!")
    )
      break;
    notices.push(notice);
    body = body.slice(0, start).trimEnd();
  }
  if (!notices.length) return code;
  return body + "\n" + [...new Set(notices)].sort().join("\n") + "\n";
}
// PR78's reviewed cleanup correction, applied only after pristine-source checks.
// scrollIntoView can return a Promise; React effects must never return that value.
export function fixNativeVideoResult(code, expectedSha256) {
  if (createHash("sha256").update(code).digest("hex") !== expectedSha256)
    throw new Error("Native VideoResult pristine source mismatch");
  const before = "useEffect(() => root.current?.scrollIntoView?.({ block: 'nearest' }), [])";
  if (code.split(before).length !== 2)
    throw new Error("Native VideoResult effect anchor mismatch");
  return code.replace(before, "useEffect(() => {\n    root.current?.scrollIntoView?.({ block: 'nearest' })\n  }, [])");
}
// Apply the already-reviewed PR83 container diff without changing pinned source files.
export function fixNativeWebmContainer(code, expectedSha256, patch) {
  if (createHash("sha256").update(code).digest("hex") !== expectedSha256)
    throw new Error("Native WebM container pristine source mismatch");
  if (createHash("sha256").update(patch).digest("hex") !== "99d607c02273a8c89a8a8c87019dfe241b7e4bfc0f7194579c494c48b934de3d")
    throw new Error("Reviewed WebM duration patch mismatch");
  const section = patch.split("diff --git ")[1];
  let count = 0;
  for (const hunk of section.split(/@@[^\n]*\n/).slice(1)) {
    const lines = hunk.split("\n").filter(line => /^[ +\-]/.test(line));
    const before = lines.filter(line => line[0] !== "+").map(line => line.slice(1)).join("\n") + "\n";
    const after = lines.filter(line => line[0] !== "-").map(line => line.slice(1)).join("\n") + "\n";
    if (code.split(before).length !== 2) throw new Error("Native WebM container patch anchor mismatch");
    code = code.replace(before, after); count++;
  }
  if (count !== 2) throw new Error("Native WebM container patch hunks mismatch");
  return code;
}
export function nativeEditorPlugin() {
  const local = process.env.STUDIO_NATIVE_EDITOR_LOCAL_BUILD === "true";
  const source = path.join(project, ".native-editor-source");
  return {
    name: "studio-native-editor-local-boundary",
    enforce: "pre",
    async resolveId(id, importer) {
      if (local && id === "./muxedWebmDuration" && importer?.split("?")[0] === path.join(source, "editor/engine/export/video/container.ts"))
        return path.join(project, "src/lib/native-webm-duration.ts");
      if (id === "virtual:studio-native-editor")
        return "\0studio-native-editor";
      if (
        local &&
        ((id === "./store" && importer?.includes("/lib/sizePresets/")) ||
          id === "@/lib/sizePresets/store" ||
          id.endsWith("/lib/sizePresets/store.ts") ||
          id.endsWith("/lib/sizePresets/store"))
      )
        return path.join(project, "src/lib/native-editor-size-presets.js");
      if (id.startsWith("@/") && local)
        return this.resolve(path.join(source, id.slice(2)), importer, {
          skipSelf: true,
        });
    },
    buildStart() {
      if (!local) return;
      const manifest = JSON.parse(
        fs.readFileSync(
          path.resolve(
            project,
            "../docs/specs/doory-host-source-inventory.json",
          ),
          "utf8",
        ),
      );
      const verify = (relative, expected) => {
        const bytes = fs.readFileSync(path.join(source, relative));
        if (createHash("sha256").update(bytes).digest("hex") !== expected)
          throw new Error(`Native editor pinned source mismatch: ${relative}`);
      };
      for (const file of manifest.files) verify(file.path, file.sha256);
      verify("LICENSE", manifest.licenseSha256);
      verify("styles/tokens.css", manifest.styleTokensSha256);
    },
    transform(code, id) {
      if (!local) return null;
      const file = id.split("?")[0];
      const relative = path.relative(source, file).split(path.sep).join("/");
      if (!["editor/dialogs/video/VideoResult.tsx", "editor/engine/export/video/container.ts"].includes(relative)) return null;
      const inventory = JSON.parse(fs.readFileSync(path.resolve(project, "../docs/specs/doory-host-source-inventory.json"), "utf8"));
      const entry = inventory.files.find(item => item.path === relative);
      if (!entry) throw new Error("Native video source inventory missing");
      const fixed = relative.endsWith("VideoResult.tsx") ? fixNativeVideoResult(code, entry.sha256)
        : fixNativeWebmContainer(code, entry.sha256, fs.readFileSync(path.resolve(project, "../scripts/investigations/doory-webm-duration/webm-duration.patch"), "utf8"));
      return { code: fixed, map: null };
    },
    configureServer(server) {
      if (!local) return;
      server.middlewares.use((req, res, next) => {
        if (req.url?.split("?")[0] !== "/native-editor-license.txt")
          return next();
        res.setHeader("Content-Type", "text/plain; charset=utf-8");
        res.end(fs.readFileSync(path.join(source, "LICENSE")));
      });
    },
    renderChunk: {
      order: "post",
      handler(code) {
        if (local) return null;
        return { code: canonicalizeLegalFooter(code), map: null };
      },
    },
    generateBundle(_, bundle) {
      if (!local) {
        assertOriginalOnlyNativeBundle(bundle);
        return;
      }
      this.emitFile({
        type: "asset",
        fileName: "native-editor-license.txt",
        source: fs.readFileSync(path.join(source, "LICENSE")),
      });
    },
    load(id) {
      if (id !== "\0studio-native-editor") return null;
      if (!local)
        return 'export async function mountNativeEditor(){throw new Error("Native editor local build is unavailable; original exporter remains available.")}';
      const pin = JSON.parse(
        fs.readFileSync(path.join(source, "PIN.json"), "utf8"),
      );
      if (pin.sourceCommit !== "27b6f68221fdbf1ef1bedc182e303210ca9e39f5")
        throw new Error("Native editor source pin mismatch");
      return `export { mountNativeEditor } from ${JSON.stringify(path.join(project, "src/lib/native-editor-mount.jsx"))};`;
    },
  };
}
