import test from "node:test";
import assert from "node:assert/strict";
import { createPenpotLocalSnapshot } from "./penpot-local-snapshot.js";
const owner = "11111111-1111-4111-8111-111111111111",
  fileId = "22222222-2222-4222-8222-222222222222";
test("fixed native endpoint validates actual owner/project and rich-text paints without returning private session", async () => {
  const calls = [];
  const shape = {
    appliedTokens: { fill: "studio.color0" },
    content: {
      children: [{ text: "Human edit", fills: [{ fillColor: "#123456" }] }],
    },
  };
  const file = {
    id: fileId,
    projectId: "project",
    revn: 2,
    data: {
      tokensLib: {
        Studio: {
          studio: Object.fromEntries(
            [0, 1, 2, 3].map((i) => ["color" + i, { $value: "#123456" }]),
          ),
        },
      },
      pagesIndex: { page: { objects: { text: shape } } },
    },
  };

  const reader = createPenpotLocalSnapshot({
    sessions: new Map([[owner, { cookie: "private-fixture-cookie" }]]),
    fetchImpl: async (url, options) => {
      calls.push({ url, options });
      return Response.json(url.endsWith("get-profile") ? { id: owner } : file);
    },
  });
  const input = {
    binding: { ownerPrincipal: owner, nativeProjectId: "project" },
    resource: { nativeId: fileId },
  };
  const context = {
    manifest: {
      layers: [
        { pageId: "page", nativeId: "text", tokenName: "studio.color0" },
      ],
    },
    colors: Array.from({ length: 4 }, () => ({ hex: "#123456" })),
  };
  const snapshot = await reader(input, context);
  assert.equal(snapshot.boundPaintsMatch, true);
  assert.equal(snapshot.revision, 2);
  assert.equal(
    JSON.stringify(snapshot).includes("private-fixture-cookie"),
    false,
  );
  assert.ok(
    calls.every(
      (c) =>
        c.url.startsWith("http://localhost:39008/api/rpc/command/") &&
        c.options.redirect === "error",
    ),
  );
  file.data.pagesIndex.page.objects.text.content.children[0].fills[0].fillColor =
    "#ffffff";
  assert.equal((await reader(input, context)).boundPaintsMatch, false);
  for (const fills of [[], [null], [{ fillColor: 123 }], [{}]]) {
    shape.content.children[0].fills = fills;
    assert.equal((await reader(input, context)).boundPaintsMatch, false);
  }
  shape.content.children[0].fills = [{ fillColor: "#123456" }];
  assert.equal((await reader(input, context)).boundPaintsMatch, true);
  await assert.rejects(
    reader(
      { ...input, binding: { ...input.binding, nativeProjectId: "foreign" } },
      context,
    ),
    /mismatch/,
  );
});

test("Docker Desktop mode selects only the fixed host endpoint and preserves browser origin/owner checks", async () => {
  const calls = [];
  const reader = createPenpotLocalSnapshot({
    transportMode: "docker-host",
    sessions: new Map([[owner, { cookie: "private-fixture-cookie" }]]),
    fetchImpl: async (url, options) => {
      calls.push({ url, options });
      return Response.json(
        url.endsWith("get-profile")
          ? { id: owner }
          : {
              id: fileId,
              projectId: "project",
              revn: 1,
              data: { pagesIndex: {}, tokensLib: {} },
            },
      );
    },
  });
  await reader(
    {
      binding: { ownerPrincipal: owner, nativeProjectId: "project" },
      resource: { nativeId: fileId },
    },
    { manifest: { layers: [] }, colors: [] },
  );
  assert.equal(calls.length, 2);
  assert.ok(
    calls.every(
      (call) =>
        call.url.startsWith(
          "http://host.docker.internal:39008/api/rpc/command/",
        ) &&
        call.options.headers.Origin === "http://localhost:39008" &&
        call.options.redirect === "error",
    ),
  );
  for (const mode of ["http://example.com", "metadata", "docker-host/../../"])
    assert.throws(
      () =>
        createPenpotLocalSnapshot({ sessions: new Map(), transportMode: mode }),
      /Unsupported/,
    );
});
