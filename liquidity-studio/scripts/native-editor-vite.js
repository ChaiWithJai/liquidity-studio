import path from "node:path";
import fs from "node:fs";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";
const project = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);
export function nativeEditorPlugin() {
  const local = process.env.STUDIO_NATIVE_EDITOR_LOCAL_BUILD === "true";
  const source = path.join(project, ".native-editor-source");
  return {
    name: "studio-native-editor-local-boundary",
    enforce: "pre",
    async resolveId(id, importer) {
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
    configureServer(server) {
      if (!local) return;
      server.middlewares.use((req, res, next) => {
        if (req.url?.split("?")[0] !== "/native-editor-license.txt")
          return next();
        res.setHeader("Content-Type", "text/plain; charset=utf-8");
        res.end(fs.readFileSync(path.join(source, "LICENSE")));
      });
    },
    generateBundle() {
      if (!local) return;
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
