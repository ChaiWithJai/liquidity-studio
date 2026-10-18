import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";
import { nativeEditorPlugin } from "./scripts/native-editor-vite.js";
import { svelte } from "@sveltejs/vite-plugin-svelte";

export default defineConfig({
  plugins: [svelte(), nativeEditorPlugin()],
  // Keep every legal notice while avoiding platform-dependent placement of duplicate comments.
  esbuild: { jsx: "automatic", legalComments: "eof" },
  build: {
    rollupOptions: {
      input:
        process.env.STUDIO_NATIVE_EDITOR_LOCAL_BUILD === "true"
          ? {
              main: fileURLToPath(new URL("./index.html", import.meta.url)),
              nativeEditor: fileURLToPath(
                new URL("./native-editor-frame.html", import.meta.url),
              ),
            }
          : undefined,
    },
  },
  server: {
    proxy: {
      "/api": "http://localhost:8080",
    },
  },
});
