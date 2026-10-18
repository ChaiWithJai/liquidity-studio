/** Disposable local full-stack fixture. Never start against the pilot database. */
import fs from "node:fs";
import path from "node:path";
import { createHash, randomBytes, randomUUID } from "node:crypto";
import { createPlatform } from "../../liquidity-studio/server/platform.js";
import { DurableStore } from "../../liquidity-studio/server/storage.js";
import { createHttpServer } from "../../liquidity-studio/server/index.js";
import {
  compileMultimodalBundle,
  brandRevision,
} from "../../liquidity-studio/server/multimodal-contract.js";
import { compilePenpotNative } from "../../liquidity-studio/server/penpot-native.js";
import { campaignFromApprovedClaims } from "../../liquidity-studio/server/source-integrity.js";
import {
  PenpotTokenRefreshTransport,
  createPenpotRepositoryContext,
  penpotNativeFontBindings,
} from "../../liquidity-studio/server/penpot-token-refresh.js";
import { createPenpotLocalSnapshot } from "../../liquidity-studio/server/penpot-local-snapshot.js";
import { createPenpotPluginLocalHost } from "../../liquidity-studio/server/penpot-plugin-local-host.js";

const args = Object.fromEntries(
  process.argv
    .slice(2)
    .reduce(
      (rows, value, index, values) =>
        index % 2 ? rows : [...rows, [value, values[index + 1]]],
      [],
    ),
);
if (
  process.env.NODE_ENV !== "test" ||
  process.env.K_SERVICE ||
  Object.keys(args).some(
    (key) =>
      ![
        "--account-file",
        "--anchor-file",
        "--fonts",
        "--state-dir",
        "--preset",
      ].includes(key),
  ) ||
  !["--account-file", "--anchor-file", "--fonts", "--state-dir"].every(
    (key) => args[key],
  )
)
  throw new Error(
    "Requires NODE_ENV=test, no Cloud Run, and --account-file --anchor-file --fonts --state-dir",
  );
const preset = args["--preset"] || "vedic_dharma";
if (!["vedic_dharma", "liquidity_desk"].includes(preset))
  throw new Error("Unsupported fixture preset");
const brandId = preset === "vedic_dharma" ? "brand_vedic" : "brand_default";
const privateJson = (filename) => {
  if (fs.statSync(filename).mode & 0o077)
    throw new Error("Private input must have mode0600");
  return JSON.parse(fs.readFileSync(filename, "utf8"));
};
const stateDir = path.resolve(args["--state-dir"]);
if (fs.existsSync(stateDir) && fs.readdirSync(stateDir).length)
  throw new Error("Use a fresh, empty disposable state directory");
fs.mkdirSync(stateDir, { recursive: true, mode: 0o700 });
fs.chmodSync(stateDir, 0o700);
const save = (name, value) =>
  fs.writeFileSync(path.join(stateDir, name), JSON.stringify(value, null, 2), {
    mode: 0o600,
  });
const hash = (bytes) => createHash("sha256").update(bytes).digest("hex");
const account = privateJson(args["--account-file"]).accounts[0];
let cookie;
async function rpc(command, body) {
  const response = await fetch(
    "http://localhost:39008/api/rpc/command/" + command,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Origin: "http://localhost:39008",
        ...(cookie ? { Cookie: cookie } : {}),
      },
      body: JSON.stringify(body),
      redirect: "error",
      signal: AbortSignal.timeout(15000),
    },
  );
  if (!response.ok)
    throw new Error(
      `Local native ${command} failed HTTP${response.status}; response omitted`,
    );
  if (command === "login-with-password")
    cookie = response.headers
      .getSetCookie()
      .map((value) => value.split(";")[0])
      .join("; ");
  return response.json();
}
await rpc("login-with-password", {
  email: account.email,
  password: account.password,
});
const owner = await rpc("get-profile", {}),
  anchor = await rpc("get-file", { id: args["--anchor-file"] });
const variants = await rpc("get-font-variants", { "team-id": anchor.teamId });
const fonts = privateJson(args["--fonts"]);
for (const font of fonts) {
  if (
    !/^[A-Za-z0-9_-]+\.(otf|ttf)$/.test(font.sourceFile) ||
    !/^[A-Za-z0-9_.-]+$/.test(font.licenseFile)
  )
    throw new Error("Unsupported source font filename");
  const bytes = fs.readFileSync(
    new URL(
      "../../liquidity-studio/public/fonts/" + font.sourceFile,
      import.meta.url,
    ),
  );
  const license = fs.readFileSync(
    new URL(
      "../../liquidity-studio/public/fonts/" + font.licenseFile,
      import.meta.url,
    ),
  );
  const variant = variants.find(
    (row) =>
      "custom-" + row.fontId === font.fontId &&
      row.fontWeight === font.weight &&
      row.fontFamily === font.family,
  );
  if (
    !variant ||
    hash(bytes) !== font.sourceSha256 ||
    hash(license) !== font.licenseSha256 ||
    !license.toString().includes("SIL OPEN FONT LICENSE")
  )
    throw new Error("Font provenance not verified");
  const assetId =
    variant[font.sourceFile.endsWith(".otf") ? "otfFileId" : "ttfFileId"];
  if (!/^[a-f0-9-]{36}$/.test(assetId))
    throw new Error("Native font resource invalid");
  const response = await fetch(
    "http://localhost:39008/assets/by-id/" + assetId,
    {
      headers: { Cookie: cookie },
      redirect: "error",
      signal: AbortSignal.timeout(15000),
    },
  );
  if (
    !response.ok ||
    hash(Buffer.from(await response.arrayBuffer())) !== font.sourceSha256
  )
    throw new Error("Native served source font differs");
}
const native = await rpc("create-file", {
  name: "Studio governed token refresh QA",
  "project-id": anchor.projectId,
});
const target = {
  id: "local_penpot_tokens",
  organizationId: "org_default",
  brandId,
  adapter: "penpot",
  ownerPrincipal: owner.id,
  nativeProjectId: native.projectId,
  nativeRoomId: native.projectId,
  nativeDocumentVersion: "1",
  nativeVersionKind: "archive",
  editorVersion: "2.18.3",
  resources: [
    {
      id: "tokens",
      kind: "tokens",
      nativeId: native.id,
      nativeParentId: native.projectId,
    },
  ],
};
const manifests = new Map();
let platform;
const transport = new PenpotTokenRefreshTransport({
  resolveContext: createPenpotRepositoryContext({
    repositoryForScope: async (scope) =>
      (await platform.forScope({ ...scope, preset })).ports.repo,
    manifests,
  }),
  nativeSnapshot: createPenpotLocalSnapshot({
    sessions: new Map([[owner.id, { cookie }]]),
  }),
  // Explicit isolated test actor, not a simulated managed Google identity.
  authorizeActor: async (actor, binding) => {
    const current = (await platform.store.get("identity")).users.find(
      (row) => row.id === actor.id,
    );
    if (!current) throw new Error("Fixture actor no longer exists");
    await platform.identity.authorize(
      current,
      binding.organizationId,
      binding.brandId,
    );
  },
});
platform = createPlatform({
  store: new DurableStore(path.join(stateDir, "studio.sqlite")),
  authMode: "password",
  editorTargets: [target],
  editorTransport: transport,
});
await platform.ready;
const password = randomBytes(24).toString("base64url");
await platform.identity.provision({
  username: "local-penpot-operator",
  password,
  role: "founder",
});
const actor = (await platform.store.get("identity")).users.find(
  (row) => row.username === "local-penpot-operator",
);
const scope = {
  organizationId: "org_default",
  brandId,
  preset,
};
const container = await platform.forScope(scope),
  repo = container.ports.repo;
const story = {
  id: "original_palette_fixture",
  title: "Disposable palette source",
  revision: 1,
  generationId: randomUUID(),
  sourceClaims: [
    {
      id: "original_claim",
      text: "Original disposable palette fixture.",
      sourceUrl: "https://example.com/disposable-fixture",
      kind: "general",
      status: "approved",
    },
  ],
};
story.campaignDraft = {
  ...campaignFromApprovedClaims(story),
  provenance: { generationId: story.generationId, mode: "synthetic" },
};
await repo.mutate((state) => {
  state.backlog = [story];
  return state;
});
const state = await repo.read();
const bundle = compileMultimodalBundle({
  scope,
  brandProfile: state.brandProfile,
  story,
  request: {
    schemaVersion: 1,
    storyId: story.id,
    expectedRevision: story.revision,
    generationId: story.generationId,
    expectedBrandRevision: brandRevision(state.brandProfile),
    requiredCapabilities: [],
  },
});
const compiled = compilePenpotNative(bundle, {
  fileId: native.id,
  fonts: fonts.map((font) => ({
    ...font,
    sha256: font.sourceSha256,
    license: "OFL-1.1",
  })),
});
await rpc("update-file", {
  id: native.id,
  "session-id": randomUUID(),
  revn: native.revn,
  vern: native.vern,
  changes: [
    ...compiled.changes,
    ...native.data.pages.map((id) => ({ type: "del-page", id })),
  ],
});
const boundary = platform.editorBoundary(scope, repo),
  binding = await boundary.register(actor, { targetId: target.id });
const manifest = {
  fileId: native.id,
  projectId: native.projectId,
  ownerPrincipal: owner.id,
  bindingEpoch: binding.epoch,
  storyId: bundle.storyId,
  storyRevision: bundle.storyRevision,
  generationId: bundle.generationId,
  sourceApprovals: bundle.sourceApprovals,
  fonts: bundle.tokens.fonts,
  nativeFonts: fonts.map((font) => ({
    ...font,
    sha256: font.sourceSha256,
    license: "OFL-1.1",
  })),
  fontBindings: penpotNativeFontBindings(compiled),
  themeId: compiled.changes.find((change) => change.type === "set-token-theme")
    .id,
  tokens: compiled.changes
    .filter((change) => change.type === "set-token")
    .map((change) => ({
      id: change["token-id"],
      setId: change["set-id"],
      name: change.attrs.name,
    })),
  layers: compiled.changes
    .filter((change) => change.obj?.["applied-tokens"]?.fill)
    .map((change) => ({
      pageId: change["page-id"],
      nativeId: change.obj.id,
      tokenName: change.obj["applied-tokens"].fill,
    })),
};
manifests.set(`org_default:${brandId}:${binding.id}:tokens`, manifest);
save("native-manifest.json", manifest);
save("operator.json", {
  username: "local-penpot-operator",
  password,
  bindingId: binding.id,
  brandId,
  preset,
  fileId: native.id,
  pageId: compiled.pages[0].id,
  teamId: anchor.teamId,
  storyId: story.id,
  generationId: story.generationId,
});
const studio = createHttpServer(null, {
  platform,
  editorBoundaryEnabled: true,
});
const plugin = createPenpotPluginLocalHost(transport);
await new Promise((resolve, reject) => {
  studio.once("error", reject);
  studio.listen(39020, "127.0.0.1", resolve);
});
await new Promise((resolve, reject) => {
  plugin.once("error", reject);
  plugin.listen(39019, "127.0.0.1", resolve);
});
console.log(
  "Disposable Studio http://localhost:39020 and native plugin http://localhost:39019/manifest.json ready. Private login:",
  path.join(stateDir, "operator.json"),
);
console.log("Owned native file:", native.id);
process.once("SIGINT", () => {
  studio.close();
  plugin.close();
  platform.store.close();
});
