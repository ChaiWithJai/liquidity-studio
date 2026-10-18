import test from "node:test";
import assert from "node:assert/strict";
import { createHttpServer } from "./index.js";

// Constructor-only authority fake: this checks nginx's callback status contract,
// not managed Google/native authentication or actual ingress acceptance.
test("stale native export receipts become explicit nginx denials while storage failures remain unavailable", async () => {
  const previous = process.env.STUDIO_PENPOT_PRIVATE_INGRESS;
  process.env.STUDIO_PENPOT_PRIVATE_INGRESS = "true";
  let status = 409;
  const server = createHttpServer(null, {
    penpotEnabled: true,
    platform: {
      ready: Promise.resolve(),
      identity: { configuration: { mode: "google" } },
      getPenpotRuntime: async () => ({
        authorizeMediaRead: async () => {
          throw Object.assign(new Error("fixture authority failure"), { status });
        },
      }),
    },
  });
  try {
    await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
    const url = `http://127.0.0.1:${server.address().port}/api/internal/penpot-asset-authorize`;
    for (const failure of [400, 401, 403, 404, 409, 503]) {
      status = failure;
      const response = await fetch(url);
      assert.equal(response.status, failure === 503 ? 503 : 403);
      assert.equal(response.headers.get("cache-control"), "no-store");
      await response.arrayBuffer();
    }
  } finally {
    await new Promise((resolve) => server.close(resolve));
    if (previous === undefined) delete process.env.STUDIO_PENPOT_PRIVATE_INGRESS;
    else process.env.STUDIO_PENPOT_PRIVATE_INGRESS = previous;
  }
});
