import { createServer } from "../../../liquidity-studio/node_modules/vite/dist/node/index.js";
import { chromium } from "../../../liquidity-studio/node_modules/playwright/index.mjs";
import fs from "node:fs";
import path from "node:path";
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
const options = Object.fromEntries(
  process.argv.slice(2).map((value) => {
    const split = value.indexOf("=");
    if (split < 3) throw Error("Use --name=value arguments");
    return [value.slice(2, split), value.slice(split + 1)];
  }),
);
for (const key of ["source", "model", "portrait", "output", "kind"])
  if (!options[key]) throw Error("Missing --" + key);
if (!["u2netp", "modnet"].includes(options.kind))
  throw Error("Unsupported model kind");
const sourceRoot = fs.realpathSync(options.source);
if (
  execFileSync("git", ["-C", sourceRoot, "rev-parse", "HEAD"], {
    encoding: "utf8",
  }).trim() !== "27b6f68221fdbf1ef1bedc182e303210ca9e39f5"
)
  throw Error("Source pin mismatch");
execFileSync("git", [
  "-C",
  sourceRoot,
  "diff",
  "--exit-code",
  "--",
  "frontend/src/editor/engine/bgRemoval",
]);
const registries = {
  u2netp: {
    sha256: "309c8469258dda742793dce0ebea8e6dd393174f89934733ecc8b14c76f4ddd8",
    bytes: 4574861,
    input: {
      name: "input.1",
      size: 320,
      mean: [0.485, 0.456, 0.406],
      std: [0.229, 0.224, 0.225],
      rescale: "max",
    },
    output: "1959",
  },
  modnet: {
    sha256: "07c308cf0fc7e6e8b2065a12ed7fc07e1de8febb7dc7839d7b7f15dd66584df9",
    bytes: 25888640,
    input: {
      name: "input",
      size: 512,
      mean: [0.5, 0.5, 0.5],
      std: [0.5, 0.5, 0.5],
      rescale: "255",
    },
    output: "output",
  },
};
const definition = registries[options.kind];
const root = path.join(sourceRoot, "frontend");
const evidence = path.resolve(options.output);
fs.mkdirSync(evidence, { recursive: true });
const model = fs.readFileSync(options.model);
if (createHash("sha256").update(model).digest("hex") !== definition.sha256)
  throw Error("Model mismatch");
if (model.length !== definition.bytes) throw Error("Model size mismatch");
const manifest = { ...definition, id: options.kind, name: options.kind };
let modelRequests = 0;
const server = await createServer({
  root,
  configFile: false,
  resolve: { alias: { "@": path.join(root, "src") } },
  server: { host: "127.0.0.1", port: 0, hmr: false },
  cacheDir: path.join(evidence, "vite-cache"),
  plugins: [
    {
      name: "owned-qa-fixtures",
      configureServer(s) {
        s.middlewares.use((req, res, next) => {
          if (req.url === "/portrait-qa") {
            res.setHeader("Content-Type", "text/html");
            res.end(
              fs.readFileSync(
                fileURLToPath(new URL("./harness.html", import.meta.url)),
              ),
            );
          } else if (req.url === "/portrait-input.png") {
            res.setHeader("Content-Type", "image/png");
            res.end(fs.readFileSync(options.portrait));
          } else if (req.url === "/portrait-model.onnx") {
            modelRequests++;
            res.end(model);
          } else if (req.url === "/api/v1/config/") {
            res.setHeader("Content-Type", "application/json");
            res.end(
              JSON.stringify({
                assets: {
                  background_removal_model: {
                    ...manifest,
                    url: "/portrait-model.onnx",
                  },
                },
              }),
            );
          } else if (/^\/(api|media|ws|admin)\//.test(req.url)) {
            res.statusCode = 404;
            res.end("No external backend");
          } else next();
        });
      },
    },
  ],
});
let browser;
try {
  await server.listen();
  const origin = server.resolvedUrls.local[0];
  browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({
    viewport: { width: 1280, height: 900 },
  });
  const blocked = [];
  await page.route("**/*", (route) => {
    const u = new URL(route.request().url());
    if (u.origin !== new URL(origin).origin) {
      blocked.push(u.origin);
      return route.abort();
    }
    return route.continue();
  });
  await page.goto(new URL("/portrait-qa", origin).href);
  await page
    .getByRole("button", { name: "Run cold/warm/cache/cancel sequence" })
    .click();
  await page.waitForFunction(
    () => ["complete", "failed"].includes(window.bgQA?.state),
    {},
    { timeout: 120000 },
  );
  const data = await page.evaluate(() => ({
    ...window.bgQA,
    output: undefined,
    remover: undefined,
  }));
  data.browserVersion = browser.version();
  data.modelRequests = modelRequests;
  data.blockedExternalOrigins = blocked;
  data.sourceCommit = "27b6f68221fdbf1ef1bedc182e303210ca9e39f5";
  data.modelKind = options.kind;
  fs.writeFileSync(
    path.join(evidence, "browser-evidence.json"),
    JSON.stringify(data, null, 2),
  );
  const bytes = await page.evaluate(async () =>
    Array.from(new Uint8Array(await window.bgQA.output.arrayBuffer())),
  );
  fs.writeFileSync(
    path.join(evidence, "synthetic-portrait-cutout.png"),
    Buffer.from(bytes),
  );
  await page.screenshot({
    path: path.join(evidence, "browser-proof.png"),
    fullPage: true,
  });
  if (
    data.state !== "complete" ||
    data.results.filter((r) => r.status === "complete").length !== 4 ||
    data.results[3].error?.name !== "AbortError" ||
    !data.inputUnchanged ||
    modelRequests !== 1 ||
    blocked.length
  )
    throw Error("Portrait sequence failed");
  console.log(
    JSON.stringify({
      state: data.state,
      results: data.results.map((r) => ({
        name: r.name,
        status: r.status,
        elapsedMs: r.elapsedMs,
        abortLatencyMs: r.abortLatencyMs,
      })),
      modelRequests,
      output: data.results[0].sha256,
    }),
  );
} finally {
  await browser?.close();
  await server.close();
}
