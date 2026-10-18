import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
const ROOT = new URL("../tools/penpot-token-plugin/", import.meta.url);
/** Explicit disposable local operator host; never mounted in Studio/Cloud Run. */
export function createPenpotPluginLocalHost(transport) {
  const origin = "http://localhost:39019";
  const server = createServer(async (req, res) => {
    const json = (code, value) => {
      res.writeHead(code, {
        "Content-Type": "application/json",
        "Cache-Control": "no-store",
      });
      res.end(JSON.stringify(value));
    };
    try {
      if (
        !["localhost:39019", "127.0.0.1:39019"].includes(req.headers.host) ||
        (req.headers.origin &&
          req.headers.origin !== origin &&
          !(
            req.method === "GET" &&
            req.headers.origin === "http://localhost:39008"
          ))
      )
        return json(403, { error: "Local origin rejected" });
      if (req.method === "GET") {
        let bytes, type;
        if (req.url === "/manifest.json") {
          bytes = JSON.stringify({
            name: "Studio governed token refresh",
            description: "Disposable local registered native color action",
            version: 2,
            code: "plugin.js",
            permissions: ["content:write", "library:read", "user:read"],
          });
          type = "application/json";
        } else if (req.url === "/plugin.js") {
          bytes =
            (await readFile(new URL("action.js", ROOT), "utf8")).replaceAll(
              "export async function",
              "async function",
            ) +
            "\n" +
            (await readFile(new URL("plugin-tail.js", ROOT), "utf8"));
          type = "text/javascript";
        } else if (
          req.url === "/" ||
          req.url === "/ui.js" ||
          req.url === "/style.css"
        ) {
          bytes = await readFile(
            new URL(
              req.url === "/"
                ? "index.html"
                : req.url === "/style.css"
                  ? "style.css"
                  : "ui.js",
              ROOT,
            ),
          );
          type =
            req.url === "/"
              ? "text/html"
              : req.url === "/style.css"
                ? "text/css"
                : "text/javascript";
        } else return json(404, { error: "Not found" });
        res.writeHead(200, {
          "Content-Type": type,
          "Cache-Control": "no-store",
          "Access-Control-Allow-Origin": "http://localhost:39008",
          "X-Content-Type-Options": "nosniff",
          "Content-Security-Policy":
            "default-src 'self'; script-src 'self'; connect-src 'self'; frame-ancestors http://localhost:39008",
        });
        res.end(bytes);
        return;
      }
      if (
        req.method !== "POST" ||
        !["/claim", "/acknowledge"].includes(req.url) ||
        req.headers.origin !== origin ||
        req.headers["content-type"] !== "application/json"
      )
        return json(403, { error: "Unsupported local action" });
      const capability =
        req.headers.authorization?.match(/^Bearer ([\w-]{43})$/)?.[1];
      if (!capability)
        return json(403, { error: "Native capability required" });
      let body = "";
      for await (const chunk of req) {
        body += chunk;
        if (Buffer.byteLength(body) > 4096)
          return json(413, { error: "Action too large" });
      }
      const data = JSON.parse(body);
      if (
        !data ||
        Array.isArray(data) ||
        typeof data !== "object" ||
        Object.keys(data).some(
          (key) =>
            !(
              req.url === "/claim"
                ? ["fileId", "ownerPrincipal"]
                : ["acknowledgement"]
            ).includes(key),
        )
      )
        return json(400, { error: "Unknown action field" });
      const result =
        req.url === "/claim"
          ? await transport.claim(capability, data)
          : await transport.acknowledge(capability, data.acknowledgement);
      json(200, result);
    } catch (error) {
      json(error.status || error.statusCode || 400, {
        error:
          error.status || error.statusCode
            ? error.message
            : "Local native action failed",
      });
    }
  });
  server.headersTimeout = 5000;
  server.requestTimeout = 10000;
  return server;
}
