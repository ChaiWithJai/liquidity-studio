import test from "node:test";
import fs from "node:fs";
import assert from "node:assert/strict";
import { createPlatform } from "./platform.js";
import { DurableStore } from "./storage.js";
import { createHttpServer } from "./index.js";
import { campaignFromApprovedClaims } from "./source-integrity.js";
import { brandRevision } from "./multimodal-contract.js";
test("actual scoped HTTP ejection, explicit empty destination, owner remap and native edit without source installation", async (t) => {
  const old = process.env.STUDIO_NATIVE_PORTABLE_ENABLED;
  process.env.STUDIO_NATIVE_PORTABLE_ENABLED = "true";
  t.after(() => {
    if (old === undefined) delete process.env.STUDIO_NATIVE_PORTABLE_ENABLED;
    else process.env.STUDIO_NATIVE_PORTABLE_ENABLED = old;
  });
  const store = new DurableStore(":memory:");
  t.after(() => store.close());
  const platform = createPlatform({ store, authMode: "password" });
  await platform.ready;
  const password = "test-only-portable-long-password";
  await platform.identity.provision({
    username: "pack-founder",
    password,
    role: "founder",
  });
  await platform.identity.provision({
    username: "pack-marketer",
    password,
    role: "marketer",
  });
  const server = createHttpServer(null, {
    platform,
    nativeEditorEnabled: true,
  });
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  t.after(() => new Promise((resolve) => server.close(resolve)));
  const base = `http://127.0.0.1:${server.address().port}`;
  const login = async (username) => {
    const response = await fetch(`${base}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    assert.equal(response.status, 200);
    return response.headers.get("set-cookie").split(";")[0];
  };
  const founderCookie = await login("pack-founder"),
    marketerCookie = await login("pack-marketer");
  const request = (
    path,
    { cookie = founderCookie, body, method = body ? "POST" : "GET" } = {},
  ) =>
    fetch(`${base}${path}`, {
      method,
      headers: {
        ...(cookie ? { Cookie: cookie } : {}),
        "Content-Type": "application/json",
      },
      body: body ? JSON.stringify(body) : undefined,
    });
  const scope = {
      organizationId: "org_default",
      brandId: "brand_default",
      preset: "liquidity_desk",
    },
    container = await platform.forScope(scope),
    native = platform.nativeEditor(scope, container.ports.repo),
    owner = (await store.get("identity")).users.find(
      (user) => user.username === "pack-founder",
    );
  const story = {
    id: "portable-http-story",
    title: "Controlled HTTP source",
    revision: 1,
    generationId: "fixture-generation",
    sourceClaims: [
      {
        id: "claim",
        text: "A controlled sourced excerpt for restoration.",
        kind: "general",
        status: "approved",
        sourceUrl: "https://example.org/restoration-fixture",
      },
    ],
  };
  story.campaignDraft = {
    ...campaignFromApprovedClaims(story),
    provenance: { generationId: story.generationId, mode: "synthetic" },
  };
  await container.ports.repo.mutate((state) => ({
    ...state,
    backlog: [story],
  }));
  const record = await native.create(owner, {
    storyId: story.id,
    format: "reel",
    expectedRevision: 1,
    generationId: story.generationId,
    expectedBrandRevision: brandRevision(
      await container.ports.repo.getBrandProfile(),
    ),
    idempotencyKey: "portable_http_creation",
  });
  const query = "organizationId=org_default&brandId=brand_default";
  const nativeEndpoint = `/api/studio/native-editor/documents/${record.id}`;
  let reviewRevision = 0;
  for (const action of ["create","start","submit","approve"]) {
    const response = await request(`${nativeEndpoint}/review?${query}`,{body:{action,expectedRevision:reviewRevision++,expectedNativeRevision:1,idempotencyKey:`http_pack_review_${action}_unique`}});
    assert.equal(response.status,200,await response.clone().text());
  }
  const sharp=(await import("sharp")).default;
  const finalPng=await sharp({create:{width:1080,height:1920,channels:3,background:"#f2a93b"}}).png().toBuffer();
  const stageResponse=await request(`${nativeEndpoint}/exports?${query}`,{body:{expectedReviewRevision:4,expectedNativeRevision:1,pageIndex:0,base64:finalPng.toString("base64"),idempotencyKey:"http_pack_final_png_unique"}});
  assert.equal(stageResponse.status,201,await stageResponse.clone().text());
  const stage=await stageResponse.json();
  const signoffResponse=await request(`${nativeEndpoint}/exports/${stage.artifactId}/signoff?${query}`,{body:{sha256:stage.sha256,reviewed:true}});
  assert.equal(signoffResponse.status,200);const envelope=await signoffResponse.json();
  const completeResponse=await request(`${nativeEndpoint}/exports/${stage.artifactId}/complete?${query}`,{body:envelope});
  assert.equal(completeResponse.status,200,await completeResponse.clone().text());

  assert.equal(
    (await request(`/api/admin/editor-pack/export?${query}`, { cookie: "" }))
      .status,
    401,
  );
  assert.equal(
    (
      await request(`/api/admin/editor-pack/export?${query}`, {
        cookie: marketerCookie,
      })
    ).status,
    403,
  );
  const response = await request(`/api/admin/editor-pack/export?${query}`);
  assert.equal(response.status, 200);
  const pack = await response.json();
  for (const key of store.keys(native.prefix)) store.delete(key);
  store.delete(container.ports.repo.key);
  const destination = await request("/api/admin/editor-pack/destinations", {
    body: {
      organizationId: "org_default",
      name: "Explicit empty destination",
      preset: "liquidity_desk",
    },
  });
  assert.equal(destination.status, 201);
  const { scope: target } = await destination.json();
  const options = {
    target: { organizationId: target.organizationId, brandId: target.brandId },
    principalRemap: { [owner.id]: owner.id },
    sourceReviewAcknowledged: true,
    idempotencyKey: "portable_http_restoration",
  };
  const endpoint = `/api/admin/editor-pack/install?organizationId=org_default&brandId=${target.brandId}`;
  assert.equal(
    (
      await request(endpoint, {
        body: { pack, options: { ...options, principalRemap: {} } },
      })
    ).status,
    403,
  );
  const beforeCapacity = Object.fromEntries(store.keys("").map(key => [key, store.get(key)]));
  const originalStatfs = fs.statfsSync;
  try {
    fs.statfsSync = () => ({bavail: 1n, bsize: 4096n});
    const refused = await request(endpoint, {body:{pack, options}});
    assert.equal(refused.status, 507);
    const safe = await refused.json();
    assert.equal(safe.code, "RESTORE_CAPACITY_INSUFFICIENT");
    assert.match(safe.error, /Free space and retry this retained recovery request/);
    fs.statfsSync = () => { throw Error("secret /private/storage/path"); };
    const unavailable = await request(endpoint, {body:{pack, options}});
    assert.equal(unavailable.status, 507);
    const safeUnavailable = await unavailable.json();
    assert.equal(safeUnavailable.code, "RESTORE_CAPACITY_UNAVAILABLE");
    assert.doesNotMatch(JSON.stringify(safeUnavailable), /secret|private\/storage/);
  } finally { fs.statfsSync = originalStatfs; }
  // Only ordinary operational error telemetry may be appended by HTTP handling.
  assert.equal(store.get(`editor-restore:${target.organizationId}:${target.brandId}`), null);
  for (const [key,value] of Object.entries(beforeCapacity)) {
    const actual=store.get(key);
    if (actual && typeof actual==='object') { delete actual.operationalEvents; delete value.operationalEvents; }
    assert.deepEqual(actual,value);
  }
  // Hold a legacy import after it captured an available scoped container,
  // then reserve/install that destination. The old import must not overwrite it.
  const sourceBundle = JSON.parse(
    Buffer.from(
      pack.files.find((file) => file.sha256 === pack.repository).base64,
      "base64",
    ),
  );
  const originalForScope = platform.forScope.bind(platform),
    originalTransact = store.transact.bind(store);
  let enterImport,
    releaseImport,
    enterInstall,
    releaseInstall,
    importHeld = false,
    installHeld = false;
  const importEntered = new Promise((resolve) => (enterImport = resolve)),
    importGate = new Promise((resolve) => (releaseImport = resolve)),
    installEntered = new Promise((resolve) => (enterInstall = resolve)),
    installGate = new Promise((resolve) => (releaseInstall = resolve));
  platform.forScope = async (selected) => {
    const value = await originalForScope(selected);
    if (selected.brandId === target.brandId) {
      const repo = value.ports.repo,
        importData = repo.importData.bind(repo);
      repo.importData = async (...args) => {
        if (!importHeld) {
          importHeld = true;
          enterImport();
          await importGate;
        }
        return importData(...args);
      };
    }
    return value;
  };
  store.transact = async (keys, callback) => {
    const value = originalTransact(keys, callback);
    if (
      !installHeld &&
      keys.length === 4 &&
      keys.some((key) =>
        key.startsWith(`native-editor:org_default:${target.brandId}:`),
      )
    ) {
      installHeld = true;
      enterInstall();
      await installGate;
    }
    return value;
  };
  const legacyImport = request(
    `/api/admin/import?organizationId=org_default&brandId=${target.brandId}`,
    { body: { bundle: sourceBundle, remapScope: true } },
  );
  await importEntered;
  const installation = request(endpoint, { body: { pack, options } });
  let installed;
  try {
    await installEntered;
    releaseImport();
    const denied = await legacyImport;
    assert.equal(denied.status, 423);
    const reserved = await store.get(`scope:org_default:${target.brandId}`);
    assert.equal(reserved.editorRestore.status, "installing");
    assert.equal(reserved.backlog.length, 0);
  } finally {
    releaseImport();
    releaseInstall();
    installed = await installation;
    platform.forScope = originalForScope;
    store.transact = originalTransact;
  }

  assert.equal(installed.status, 200, await installed.clone().text());
  const nativeUrl = `/api/studio/native-editor/documents/${record.id}?organizationId=org_default&brandId=${target.brandId}`;
  const current = await request(nativeUrl);
  assert.equal(current.status, 200);
  const restored = await current.json();
  assert.deepEqual(restored.document, record.document);
  assert.equal(restored.portableHistory.reviewHistory.authority,"historical-only");
  assert.equal(restored.restoredExports,undefined);
  const historicalUrl=`${nativeEndpoint}/portable-exports/${stage.artifactId}?organizationId=org_default&brandId=${target.brandId}`;
  const historical=await request(historicalUrl);
  assert.equal(historical.status,200,await historical.clone().text());
  assert.deepEqual(Buffer.from((await historical.json()).base64,"base64"),finalPng);
  assert.equal((await request(historicalUrl,{cookie:""})).status,401);
  assert.equal((await request(historicalUrl,{cookie:marketerCookie})).status,403);
  assert.equal((await request(`${nativeEndpoint}/portable-exports/${stage.artifactId}?${query}`)).status,404);
  assert.equal((await request(`${nativeEndpoint}/review?organizationId=org_default&brandId=${target.brandId}`)).status,200);
  const currentReview=await (await request(`${nativeEndpoint}/review?organizationId=org_default&brandId=${target.brandId}`)).json();
  assert.equal(currentReview,null);
  const identityBefore = await store.get("identity"), originalGet = store.get.bind(store);
  let enteredBytes,releaseBytes,heldBytes=false;
  const bytesEntered=new Promise(resolve=>enteredBytes=resolve),bytesGate=new Promise(resolve=>releaseBytes=resolve);
  store.get=key=>{
    if(!heldBytes && key.startsWith(`native-editor:org_default:${target.brandId}:historical-export:`)) {
      heldBytes=true;enteredBytes();return bytesGate.then(()=>originalGet(key));
    }
    return originalGet(key);
  };
  const pendingHistorical=request(historicalUrl);
  try {
    await bytesEntered;
    await store.update("identity",current=>({...current,memberships:current.memberships.filter(member=>member.userId!==owner.id)}));
    releaseBytes();assert.equal((await pendingHistorical).status,403);
  } finally {
    releaseBytes();store.get=originalGet;await store.update("identity",()=>identityBefore);
  }

  const edited = structuredClone(restored.document);
  edited.pages[0].objects.find(
    (object) => object.id === "headline_layer",
  ).text = "Edited after HTTP restoration";
  const saved = await request(nativeUrl, {
    body: {
      expectedRevision: restored.revision,
      title: restored.title,
      document: edited,
      idempotencyKey: "portable_http_edit_after_restore",
    },
  });
  assert.equal(saved.status, 200, await saved.clone().text());
  assert.deepEqual((await (await request(nativeUrl)).json()).document, edited);
  delete process.env.STUDIO_NATIVE_PORTABLE_ENABLED;
  assert.equal(
    (await request(`/api/admin/editor-pack/export?${query}`)).status,
    404,
  );
});
