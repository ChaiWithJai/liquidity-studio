import { createPlatform } from "./platform.js";
import { createHttpServer } from "./index.js";
import { createPenpotPluginLocalHost } from "./penpot-plugin-local-host.js";
import { startServer } from "./runtime.js";

// Explicit private pilot launcher. No mutation of the main Studio or cloud process.
if (
  process.env.K_SERVICE ||
  process.env.STUDIO_PENPOT_ENABLED !== "true" ||
  process.env.STUDIO_AUTH_MODE !== "google"
)
  throw new Error(
    "Private Penpot launcher requires explicit local Google mode",
  );
const platform = createPlatform();
await platform.ready;
const runtime = await platform.getPenpotRuntime();
const plugin = createPenpotPluginLocalHost(runtime.transport);
await new Promise((resolve, reject) => {
  plugin.once("error", reject);
  plugin.listen(39019, "127.0.0.1", resolve);
});
const server = createHttpServer(null, { platform, penpotEnabled: true });
server.once("close", () => plugin.close());
startServer(server, { port: 39021, host: "127.0.0.1" });
