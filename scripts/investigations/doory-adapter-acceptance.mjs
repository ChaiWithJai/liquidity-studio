// Local operator reproduction only. Never run against a hosted/pilot Studio or arbitrary endpoint.
import fs from "node:fs";
import path from "node:path";
import { createHash, randomBytes } from "node:crypto";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { BRAND_PRESETS } from "../../liquidity-studio/server/domain.js";
import { campaignFromApprovedClaims } from "../../liquidity-studio/server/source-integrity.js";
import {
  brandRevision,
  compileMultimodalBundle,
} from "../../liquidity-studio/server/multimodal-contract.js";
import {
  compileDooryDocument,
  applyDooryBrandTokens,
} from "../../liquidity-studio/server/doory-native-adapter.js";
import { DooryLocalTransport } from "../../liquidity-studio/server/doory-local-transport.js";
import { DurableStore } from "../../liquidity-studio/server/storage.js";
import { IdentityService } from "../../liquidity-studio/server/auth.js";
import { ScopedRepository } from "../../liquidity-studio/server/repository.js";
import { EditorBoundary } from "../../liquidity-studio/server/editor-boundary.js";
const BASE = "http://127.0.0.1:39007/api/v1";
if (process.env.DOORY_API_BASE && process.env.DOORY_API_BASE !== BASE)
  throw Error("Only fixed owned loopback Doory endpoint is allowed");
const evidenceDir = process.env.DOORY_EVIDENCE_DIR;
if (!evidenceDir) throw Error("Explicit private DOORY_EVIDENCE_DIR required");
const secret = Object.fromEntries(
  fs
    .readFileSync(path.join(evidenceDir, "private.env"), "utf8")
    .split("\n")
    .filter((l) => l && !l.startsWith("#"))
    .map((l) => {
      const i = l.indexOf("=");
      return [l.slice(0, i), l.slice(i + 1)];
    }),
).QA_PASSWORD;
if (!secret) throw Error("Existing private QA credential required");
class Session {
  cookies = new Map();
  headers() {
    return {
      Cookie: [...this.cookies].map(([k, v]) => `${k}=${v}`).join("; "),
      "X-CSRFToken": this.cookies.get("csrftoken") || "",
      Origin: "http://127.0.0.1:39007",
    };
  }
  async call(method, route, body, expected = 200) {
    const response = await fetch(BASE + route, {
      method,
      redirect: "error",
      signal: AbortSignal.timeout(15000),
      headers: {
        ...this.headers(),
        ...(body && !(body instanceof FormData)
          ? { "Content-Type": "application/json" }
          : {}),
      },
      ...(body
        ? { body: body instanceof FormData ? body : JSON.stringify(body) }
        : {}),
    });
    for (const cookie of response.headers.getSetCookie()) {
      const entry = cookie.split(";")[0];
      const i = entry.indexOf("=");
      this.cookies.set(entry.slice(0, i), entry.slice(i + 1));
    }
    assert.equal(
      response.status,
      expected,
      `Local Doory ${method} ${route.split("?")[0]} status`,
    );
    return response.status === 204 ? null : response.json();
  }
  async login(email) {
    await this.call("GET", "/auth/csrf/", null, 204);
    await this.call("POST", "/auth/login/", { email, password: secret });
  }
}
const a = new Session(),
  b = new Session();
await a.login("owner-a@example.invalid");
await b.login("owner-b@example.invalid");
const fonts = [
  [
    "Instrument Serif",
    "InstrumentSerif-Regular.ttf",
    "InstrumentSerif-OFL.txt",
  ],
  ["Mona Sans", "MonaSans-Regular.otf", "MonaSans-OFL.txt"],
  ["Inter", "InterVariable.ttf", "Inter-LICENSE.txt"],
];
const availableFonts = [];
const fontBridge = {};
for (const [family, file, license] of fonts) {
  const bytes = fs.readFileSync(
    new URL("../../liquidity-studio/public/fonts/" + file, import.meta.url),
  );
  let owned = (await a.call("GET", "/fonts/mine/")).results.find(
    (f) => f.family === family,
  );
  if (!owned) {
    const form = new FormData();
    form.append("family", family);
    form.append("files", new Blob([bytes]), file);
    owned = await a.call("POST", "/fonts/mine/", form, 201);
  }
  assert.ok(owned.variants.length);
  // Confirm target serves the exact registered bytes, not merely a family label.
  const url = owned.variants[0].url;
  assert.ok(url.startsWith("/media/"));
  assert.match(
    url,
    /^\/media\/fonts\/user\/[0-9a-f-]{36}\/[0-9a-f-]{36}\.(?:ttf|otf|woff2?)$/i,
  );
  const targetBytes = execFileSync(
    "docker",
    ["exec", "doory-native39-api-1", "cat", "/app" + url],
    { maxBuffer: 12 * 1024 * 1024 },
  );
  assert.equal(
    createHash("sha256").update(targetBytes).digest("hex"),
    createHash("sha256").update(bytes).digest("hex"),
  );
  fontBridge[url] = {
    contentType: file.endsWith(".otf") ? "font/otf" : "font/ttf",
    base64: targetBytes.toString("base64"),
    sha256: createHash("sha256").update(targetBytes).digest("hex"),
  };
  fs.writeFileSync(
    path.join(evidenceDir, "font-bridge.json"),
    JSON.stringify(fontBridge),
    { mode: 0o600 },
  );
  const response = await fetch("http://127.0.0.1:39006" + url, {
    redirect: "error",
    signal: AbortSignal.timeout(15000),
  });
  assert.equal(
    response.status,
    200,
    "Owned whitelisted font bridge must be running on39006",
  );
  assert.equal(
    createHash("sha256")
      .update(Buffer.from(await response.arrayBuffer()))
      .digest("hex"),
    fontBridge[url].sha256,
  );
  availableFonts.push({
    family,
    sha256: createHash("sha256").update(bytes).digest("hex"),
    license,
    source:
      "Studio bundled licensed bytes; uploaded and hash-matched on owned local Doory",
  });
}
const checks = [
  "actual_two_owner_csrf_sessions",
  "uploaded_font_bytes_hash_match",
];
const native = [];
const store = new DurableStore(":memory:");
const identity = new IdentityService(store);
await identity.provision({
  username: "adapter-founder",
  password: randomBytes(24).toString("hex"),
  role: "founder",
});
await identity.provision({
  username: "adapter-marketer",
  password: randomBytes(24).toString("hex"),
  role: "marketer",
});
const state = store.get("identity"),
  founder = state.users.find((u) => u.role === "founder"),
  marketer = state.users.find((u) => u.role === "marketer");
await identity.setMembership(founder, {
  userId: marketer.id,
  organizationId: "org_default",
  brandIds: ["brand_default"],
});
const sessions = new Map([
  [
    "qa-owner-a",
    { cookie: a.headers().Cookie, csrf: a.headers()["X-CSRFToken"] },
  ],
]);
const transport = new DooryLocalTransport({
  sessions,
  fontFamiliesByOwner: new Map([
    ["qa-owner-a", availableFonts.map((f) => f.family)],
  ]),
});
for (const [preset, brandId] of [
  ["liquidity_desk", "brand_default"],
  ["vedic_dharma", "brand_vedic"],
]) {
  const scope = { organizationId: "org_default", brandId };
  const profile = structuredClone(BRAND_PRESETS[preset]);
  const story = {
    id: "doory-adapter-reviewed-fixture",
    revision: 1,
    generationId: "doory-adapter-source-generation",
    sourceClaims: [
      {
        id: "source-1",
        text: "An explicitly reviewed source excerpt for local adapter acceptance.",
        sourceUrl: "https://example.org/adapter-fixture",
        kind: "general",
        status: "approved",
      },
    ],
  };
  story.campaignDraft = {
    ...campaignFromApprovedClaims(story),
    provenance: { generationId: story.generationId, mode: "synthetic" },
  };
  const spec = compileMultimodalBundle({
    scope,
    brandProfile: profile,
    story,
    request: {
      schemaVersion: 1,
      storyId: story.id,
      expectedRevision: 1,
      generationId: story.generationId,
      expectedBrandRevision: brandRevision(profile),
      requiredCapabilities: [],
    },
  });
  for (const format of ["infographic", "carousel", "story", "reel"]) {
    const compiled = compileDooryDocument({ spec, format, availableFonts });
    // Explicit operator create first: Doory assigns IDs; callers cannot self-register native ownership.
    const created = await a.call(
      "POST",
      "/designs/",
      {
        title: `Studio adapter ${preset} ${format}`,
        document: compiled.document,
      },
      201,
    );
    const target = {
      id: `target-${preset}-${format}`,
      organizationId: scope.organizationId,
      brandId,
      adapter: "doory",
      ownerPrincipal: "qa-owner-a",
      nativeProjectId: created.id,
      nativeRoomId: created.id,
      nativeVersionKind: "document-schema",
      nativeDocumentVersion: "1",
      editorVersion: "27b6f68221fdbf1ef1bedc182e303210ca9e39f5",
      resources: [
        {
          id: "document",
          kind: "document",
          nativeId: created.id,
          nativeParentId: created.id,
        },
      ],
    };
    const repo = new ScopedRepository(store, { ...scope, preset });
    await repo.ready;
    const boundary = new EditorBoundary({
      store,
      scope,
      identity,
      repo,
      targets: [target],
      transport,
    });
    const binding = await boundary.register(founder, { targetId: target.id });
    const operation = {
      resourceId: "document",
      kind: "document",
      action: "read",
    };
    const read = await boundary.execute(founder, binding.id, operation);
    assert.deepEqual(read.document, compiled.document);
    const human = structuredClone(read.document);
    human.pages[0].objects.find((o) => o.id === "headline_layer").text =
      "Human native edit preserved";
    const edited = await boundary.execute(founder, binding.id, {
      ...operation,
      action: "write",
      command: {
        operation: "patch",
        document: human,
        expectedNativeRevision: read.revision,
      },
    });
    await assert.rejects(
      boundary.execute(founder, binding.id, {
        ...operation,
        action: "write",
        command: {
          operation: "patch",
          document: human,
          expectedNativeRevision: read.revision,
        },
      }),
      (e) => e.statusCode === 409 || e.status === 409,
    );
    const next = structuredClone(profile);
    next.colors[1].hex = "#BB3366";
    const refreshed = applyDooryBrandTokens({
      document: edited.document,
      manifest: compiled.manifest,
      tokens: next,
      expectedBrandRevision: spec.brandRevision,
      brandRevision: brandRevision(next),
      availableFonts,
    });
    await boundary.execute(founder, binding.id, {
      ...operation,
      action: "write",
      command: {
        operation: "patch",
        document: refreshed.document,
        expectedNativeRevision: edited.revision,
      },
    });
    const exported = await boundary.execute(founder, binding.id, {
      ...operation,
      action: "export",
    });
    assert.deepEqual(exported.document, refreshed.document);
    assert.equal(
      exported.document.pages[0].objects.find((o) => o.id === "headline_layer")
        .text,
      "Human native edit preserved",
    );
    await b.call("GET", `/designs/${created.id}/`, null, 404);
    await assert.rejects(
      boundary.execute(founder, binding.id, {
        ...operation,
        resourceId: "foreign",
      }),
    );
    if (brandId === "brand_vedic")
      await assert.rejects(boundary.execute(marketer, binding.id, operation));
    const wrongOwner = new DooryLocalTransport({
      sessions: new Map([
        [
          "qa-owner-a",
          { cookie: b.headers().Cookie, csrf: b.headers()["X-CSRFToken"] },
        ],
      ]),
    });
    const wrongBoundary = new EditorBoundary({
      store,
      scope,
      identity,
      repo,
      targets: [target],
      transport: wrongOwner,
    });
    await assert.rejects(
      wrongBoundary.execute(founder, binding.id, operation),
      (error) => error.status === 404,
    );
    fs.writeFileSync(
      path.join(evidenceDir, `adapter-${preset}-${format}-native.json`),
      JSON.stringify(exported.document, null, 2),
      { mode: 0o600 },
    );
    native.push({
      preset,
      format,
      nativeId: created.id,
      revision: exported.revision,
      pageCount: exported.document.pages.length,
      sha256: createHash("sha256")
        .update(JSON.stringify(exported.document))
        .digest("hex"),
      sourceCampaignSha256: compiled.manifest.sourceCampaignSha256,
    });
  }
}
store.close();
checks.push(
  "both_presets_four_native_formats_create_read_exact",
  "registered_boundary_human_edit_reload",
  "optimistic_stale_patch_409",
  "brand_swatch_native_update_preserves_human_text",
  "registered_native_json_copy_exact",
  "native_outsider_owner_404",
  "studio_other_brand_membership_denied",
  "foreign_resource_denied",
  "wrong_native_owner_session_denied",
);
const evidence = {
  sourceCommit: "27b6f68221fdbf1ef1bedc182e303210ca9e39f5",
  checks,
  fonts: availableFonts,
  native,
  limits:
    "Operator local bootstrap plus registered Studio boundary with actual Doory sessions. Studio identities are isolated test-mode fixtures, not managed Google. Native JSON copy is not a self-contained archive; browser hydration, pixels, media/cutouts and commercial licensing are separate acceptance.",
};
fs.writeFileSync(
  path.join(evidenceDir, "doory-adapter-evidence.json"),
  JSON.stringify(evidence, null, 2),
  { mode: 0o600 },
);
console.log(JSON.stringify(evidence, null, 2));
