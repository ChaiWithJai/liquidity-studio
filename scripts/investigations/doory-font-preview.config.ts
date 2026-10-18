import { mergeConfig } from "vite";
import fs from "node:fs";
import { createHash } from "node:crypto";
import base from "./vite.config";
if (process.env.VITE_API_PROXY !== "http://127.0.0.1:39007")
  throw Error("Explicit owned loopback API proxy required");
const fontFile = process.env.DOORY_FONT_BRIDGE_FILE;
if (!fontFile)
  throw Error("Explicit owned QA licensed font whitelist required");
export default mergeConfig(base, {
  plugins: [
    {
      name: "owned-licensed-font-whitelist",
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          const route = (req.url || "").split("?")[0];
          if (!route.startsWith("/media/")) return next();
          const mapping = fs.existsSync(fontFile)
            ? JSON.parse(fs.readFileSync(fontFile, "utf8"))
            : {};
          const entry = mapping[route];
          if (
            req.method !== "GET" ||
            !/^\/media\/fonts\/user\/[0-9a-f-]{36}\/[0-9a-f-]{36}\.(ttf|otf|woff2?)$/i.test(
              route,
            ) ||
            !entry
          ) {
            res.statusCode = 404;
            res.end();
            return;
          }
          const bytes = Buffer.from(entry.base64, "base64");
          if (
            createHash("sha256").update(bytes).digest("hex") !== entry.sha256
          ) {
            res.statusCode = 500;
            res.end();
            return;
          }
          res.setHeader("Content-Type", entry.contentType);
          res.setHeader("Cache-Control", "no-store");
          res.end(bytes);
        });
      },
    },
  ],
  server: {
    host: "127.0.0.1",
    port: 39006,
    strictPort: true,
    proxy: {
      "/ws": { target: "http://127.0.0.1:39009", changeOrigin: true, ws: true },
    },
  },
});
