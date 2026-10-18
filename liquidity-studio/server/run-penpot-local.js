import { startConfiguredStudio } from "./index.js";

// Explicit private pilot launcher. No mutation of the main Studio or cloud process.
if (
  process.env.K_SERVICE ||
  process.env.STUDIO_PENPOT_ENABLED !== "true" ||
  process.env.STUDIO_AUTH_MODE !== "google"
)
  throw new Error(
    "Private Penpot launcher requires explicit local Google mode",
  );
await startConfiguredStudio({ port: 39021, host: "127.0.0.1" });
