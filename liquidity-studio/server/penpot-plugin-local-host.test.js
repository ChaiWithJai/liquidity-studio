import test from "node:test";
import { request as httpRequest } from "node:http";
import assert from "node:assert/strict";
import { createPenpotPluginLocalHost } from "./penpot-plugin-local-host.js";
test("local plugin serves only public allowlist; action requires exact origin/capability and bounded fields", async (t) => {
  let calls = 0;
  const server = createPenpotPluginLocalHost({
    claim: async () => {
      calls++;
      return { receiptId: "fixture" };
    },
  });
  await new Promise((r) => server.listen(0, "127.0.0.1", r));
  t.after(() => new Promise((r) => server.close(r)));
  const url = "http://127.0.0.1:" + server.address().port;
  const request = (path, options = {}) =>
    new Promise((resolve, reject) => {
      const req = httpRequest(
        url + path,
        {
          method: options.method || "GET",
          headers: { Host: "localhost:39019", ...options.headers },
        },
        (response) => {
          response.resume();
          response.once("end", () => resolve({ status: response.statusCode }));
        },
      );
      req.once("error", reject);
      req.end(options.body);
    });
  assert.equal(
    (
      await request("/manifest.json", {
        headers: { Origin: "http://localhost:39008" },
      })
    ).status,
    200,
  );
  assert.equal((await request("/style.css")).status, 200);
  assert.equal((await request("/../../operator.json")).status, 404);
  assert.equal(
    (await request("/manifest.json", { headers: { Host: "attacker.invalid" } }))
      .status,
    403,
  );
  const body = {
    method: "POST",
    headers: {
      Origin: "http://localhost:39019",
      "Content-Type": "application/json",
      Authorization: "Bearer " + "a".repeat(43),
    },
    body: JSON.stringify({ fileId: "fixture", ownerPrincipal: "owner" }),
  };
  assert.equal(
    (
      await request("/claim", {
        ...body,
        headers: { ...body.headers, Origin: "https://attacker.invalid" },
      })
    ).status,
    403,
  );
  assert.equal(calls, 0);
  assert.equal(
    (
      await request("/claim", {
        ...body,
        body: JSON.stringify({
          fileId: "fixture",
          ownerPrincipal: "owner",
          url: "https://attacker.invalid",
        }),
      })
    ).status,
    400,
  );
  assert.equal(calls, 0);
  assert.equal((await request("/claim", body)).status, 200);
  assert.equal(calls, 1);
  assert.equal(
    (await request("/claim", { ...body, body: "x".repeat(5000) })).status,
    413,
  );
});

test("alternate fixed plugin host stays isolated from the maintained default origin", async (t) => {
  for (const port of [39020, "39039", 0, null, "https://attacker.invalid"])
    assert.throws(
      () => createPenpotPluginLocalHost({}, { port }),
      /Unsupported/,
    );
  let calls = 0;
  const server = createPenpotPluginLocalHost(
    {
      claim: async () => {
        calls++;
        return { receiptId: "fixture" };
      },
    },
    { port: 39039 },
  );
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  t.after(() => new Promise((resolve) => server.close(resolve)));
  const request = (path, { host = "localhost:39039", origin, body } = {}) =>
    new Promise((resolve, reject) => {
      const req = httpRequest(
        {
          hostname: "127.0.0.1",
          port: server.address().port,
          path,
          method: body ? "POST" : "GET",
          headers: {
            Host: host,
            ...(origin ? { Origin: origin } : {}),
            ...(body
              ? {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${"a".repeat(43)}`,
                }
              : {}),
          },
        },
        (response) => {
          let text = "";
          response.on("data", (chunk) => {
            text += chunk;
          });
          response.on("end", () =>
            resolve({
              status: response.statusCode,
              text,
              csp: response.headers["content-security-policy"],
            }),
          );
        },
      );
      req.on("error", reject);
      req.end(body);
    });
  const plugin = await request("/plugin.js", {
    origin: "http://localhost:39008",
  });
  assert.equal(plugin.status, 200);
  assert.ok(plugin.text.includes('"http://localhost:39039/"'));
  assert.ok(!plugin.text.includes('"http://localhost:39019/"'));
  assert.match(plugin.csp, /connect-src 'self'/);
  assert.equal(
    (await request("/manifest.json", { host: "localhost:39019" })).status,
    403,
  );
  const body = JSON.stringify({ fileId: "fixture", ownerPrincipal: "owner" });
  assert.equal(
    (await request("/claim", { origin: "http://localhost:39019", body }))
      .status,
    403,
  );
  assert.equal(calls, 0);
  assert.equal(
    (await request("/claim", { origin: "http://localhost:39039", body }))
      .status,
    200,
  );
  assert.equal(calls, 1);
});
