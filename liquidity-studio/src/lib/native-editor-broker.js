const uuid = (value) =>
  typeof value === "string" && /^[a-f0-9-]{36}$/i.test(value);
const bounded = (value) => JSON.stringify(value).length <= 768 * 1024;
const changed = () =>
  Object.assign(
    new Error("Native editor context changed; reopen in the current brand."),
    { code: "REQUEST_CONTEXT_CHANGED" },
  );

/** Same-origin trusted-editor broker, not an untrusted-code authentication sandbox. */
export function createNativeEditorBroker({
  frameWindow,
  hostWindow = window,
  origin = location.origin,
  request,
  scopeKey,
  getScopeKey,
  record,
  onSaved = () => {},
  onState = () => {},
  onConflictResolve = () => {},
  onReady = () => {},
  onExportStaged = () => {},
}) {
  const nonce = crypto.randomUUID();
  let active = true;
  let revision = record.revision;
  function assetIds(document) {
    const ids = new Set();
    function visit(value) {
      if (!value || typeof value !== "object") return;
      if (typeof value.assetId === "string") ids.add(value.assetId);
      for (const child of Object.values(value)) {
        if (typeof child === "string") {
          const match = /^studio-asset:([a-f0-9]{32})$/.exec(child);
          if (match) ids.add(match[1]);
        } else visit(child);
      }
    }
    visit(document);
    return ids;
  }
  let referencedAssets = assetIds(record.document);
  const responses = new Map();
  const savedIntents = new Map();
  const cutoutIntents = new Set();
  const inflight = new Map();
  const current = () => active && getScopeKey() === scopeKey;
  function reply(requestId, result) {
    if (!current()) return;
    frameWindow.postMessage(
      { type: "studio-native-response", nonce, requestId, ...result },
      origin,
    );
  }
  async function execute(message) {
    if (!current()) throw changed();
    const { operation, payload } = message;
    let path,
      options = {};
    if(operation === 'review.read' && payload === null)
      path = `/api/studio/native-editor/documents/${record.id}/review`;
    else if(operation === 'export.stage' && payload && JSON.stringify(payload).length <= 6*1024*1024) {
      if(payload.expectedNativeRevision !== revision)throw Object.assign(new Error('Native revision changed; reload explicitly.'),{status:409});
      path = `/api/studio/native-editor/documents/${record.id}/exports`;
      options = {method:'POST',body:JSON.stringify(payload)};
    }
    else if (operation === "fonts" && payload === null)
      path = "/api/studio/native-editor/fonts";
    else if (operation === "cutout.model" && payload === null)
      path = "/api/studio/native-editor/cutout/model";
    else if (
      operation === "cutout.chunk" &&
      Object.keys(payload || {}).length === 1 &&
      Number.isInteger(payload.index) &&
      payload.index >= 0 &&
      payload.index < 99
    )
      path = `/api/studio/native-editor/cutout/model/${payload.index}`;
    else if (operation === "cutout.prepare" && payload && bounded(payload)) {
      if (
        payload.documentId !== record.id ||
        payload.expectedRevision !== revision
      )
        throw Object.assign(
          new Error("Native revision changed; reload explicitly."),
          { status: 409 },
        );
      path = "/api/studio/native-editor/cutout/prepare";
      options = { method: "POST", body: JSON.stringify(payload) };
    } else if (operation === "cutout.complete" && payload && bounded(payload)) {
      if (!cutoutIntents.has(payload.intentId))
        throw Object.assign(
          new Error("Cutout intent is not owned by this editor frame."),
          { status: 400 },
        );
      path = "/api/studio/native-editor/cutout/complete";
      options = { method: "POST", body: JSON.stringify(payload) };
    } else if (operation === "asset.list" && payload === null)
      path = "/api/studio/native-editor/assets";
    else if (
      operation === "asset.read" &&
      typeof payload?.id === "string" &&
      /^[a-f0-9]{32}$/.test(payload.id) &&
      Object.keys(payload).length === 1
    ) {
      path = `/api/studio/native-editor/assets/${payload.id}/resolve`;
      options = { method: "POST", body: JSON.stringify({
        intent: referencedAssets.has(payload.id) ? "document-usage" : "library-preview",
        documentId: record.id, expectedNativeRevision: revision,
        generationId: record.origin.generationId,
      }) };
    }
    else if (operation === "asset.upload" && payload && bounded(payload)) {
      path = "/api/studio/native-editor/assets";
      options = { method: "POST", body: JSON.stringify(payload) };
    } else if (operation === "document.save" && payload && bounded(payload)) {
      const prior = savedIntents.get(payload.idempotencyKey);
      if (prior && prior.fingerprint === JSON.stringify(payload))
        return prior.result;
      if (payload.expectedRevision !== revision)
        throw Object.assign(
          new Error("Native revision changed; reload explicitly."),
          { status: 409 },
        );
      path = `/api/studio/native-editor/documents/${record.id}`;
      options = { method: "POST", body: JSON.stringify(payload) };
    } else
      throw Object.assign(new Error("Unsupported native editor operation"), {
        status: 400,
      });
    const result = await request(path, options);
    if (!current()) throw changed();
    if (operation === "asset.read") {
      const usage = result.manifest?.usage;
      if (result.manifest?.schemaVersion !== 1 || usage?.documentId !== record.id ||
          usage.nativeRevision !== revision || usage.generationId !== record.origin.generationId)
        throw changed();
    }
    if(operation === 'export.stage')onExportStaged(result);
    if (operation === "cutout.prepare") {
      if (
        !/^[a-f0-9]{32}$/.test(result.id || "") ||
        result.nativeRevision !== revision
      )
        throw new Error("Invalid cutout intent response");
      cutoutIntents.add(result.id);
      if (cutoutIntents.size > 100)
        cutoutIntents.delete(cutoutIntents.values().next().value);
    }
    if (operation === "document.save") {
      if (
        result.id !== record.id ||
        !Number.isSafeInteger(result.revision) ||
        result.revision < revision
      )
        throw new Error("Invalid native save response");
      revision = result.revision;
      referencedAssets = assetIds(result.document);
      savedIntents.set(payload.idempotencyKey, {
        fingerprint: JSON.stringify(payload),
        result,
      });
      if (savedIntents.size > 100)
        savedIntents.delete(savedIntents.keys().next().value);
      onSaved(result);
    }
    return result;
  }
  async function listener(event) {
    if (!current() || event.source !== frameWindow || event.origin !== origin)
      return;
    const message = event.data;
    if (!message || message.nonce !== nonce) return;
    if (
      message.type === "studio-native-conflict-request" &&
      ["reload", "save-as-copy"].includes(message.action)
    ) {
      onConflictResolve(message.action);
      return;
    }
    if (message.type === "studio-native-ready") {
      onReady();
      return;
    }
    if (message.type === "studio-native-state") {
      if (
        [
          "idle",
          "dirty",
          "saving",
          "saved",
          "local",
          "conflict",
          "error",
        ].includes(message.state?.status)
      )
        onState(message.state);
      return;
    }
    if (message.type !== "studio-native-request" || !uuid(message.requestId))
      return;
    let fingerprint;
    try {
      fingerprint = JSON.stringify({
        operation: message.operation,
        payload: message.payload,
      });
      if (fingerprint.length > (message.operation === 'export.stage' ? 6*1024*1024 : 768*1024)) throw new Error("Message too large");
      // Large PNG requests retain a fixed-size digest, not many copies of base64.
      if(message.operation === 'export.stage')fingerprint=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(fingerprint))),byte=>byte.toString(16).padStart(2,'0')).join('');
    } catch {
      reply(message.requestId, {
        error: {
          status: 400,
          message: "Invalid native message",
          code: "INVALID_NATIVE_MESSAGE",
        },
      });
      return;
    }
    const cached = responses.get(message.requestId);
    if (cached) {
      if (cached.fingerprint === fingerprint)
        reply(message.requestId, cached.result);
      return;
    }
    if (inflight.has(message.requestId) || inflight.size >= 8) return;
    inflight.set(message.requestId, true);
    let result;
    try {
      result = { data: await execute(message) };
    } catch (error) {
      result = {
        error: {
          message:
            error.code === "REQUEST_CONTEXT_CHANGED"
              ? error.message
              : error.status
                ? error.message
                : "Native request failed; retry the same save before making another change.",
          status: error.status || 0,
          code: error.code || "NATIVE_REQUEST_FAILED",
        },
      };
    } finally {
      inflight.delete(message.requestId);
    }
    if (!current()) return;
    responses.set(message.requestId, { fingerprint, result });
    if (responses.size > 50) responses.delete(responses.keys().next().value);
    reply(message.requestId, result);
  }
  hostWindow.addEventListener("message", listener);
  return {
    initialize() {
      if (!current()) throw changed();
      frameWindow.postMessage(
        {
          type: "studio-native-init",
          nonce,
          scopeKey,
          record: JSON.parse(JSON.stringify(record)),
        },
        origin,
      );
    },
    setAssetPolicy(policy) {
      if (current())
        frameWindow.postMessage(
          {
            type: "studio-native-asset-policy",
            nonce,
            policy: {
              rightsDeclaration: String(policy.rightsDeclaration || "").slice(
                0,
                500,
              ),
              consent: policy.consent,
              cutoutConfirmed: policy.cutoutConfirmed === true,
            },
          },
          origin,
        );
    },
    dispose() {
      active = false;
      hostWindow.removeEventListener("message", listener);
      responses.clear();
      savedIntents.clear();
      inflight.clear();
    },
  };
}

export function createNativeFrameRequest({
  parentWindow = parent,
  frameWindow = window,
  origin = location.origin,
  nonce,
}) {
  let active = true;
  const pending = new Map();
  function listener(event) {
    const value = event.data;
    if (
      !active ||
      event.source !== parentWindow ||
      event.origin !== origin ||
      value?.type !== "studio-native-response" ||
      value.nonce !== nonce
    )
      return;
    const intent = pending.get(value.requestId);
    if (!intent) return;
    pending.delete(value.requestId);
    clearTimeout(intent.timer);
    if (value.error)
      intent.reject(
        Object.assign(new Error(value.error.message), {
          status: value.error.status || undefined,
          code: value.error.code,
        }),
      );
    else intent.resolve(value.data);
  }
  frameWindow.addEventListener("message", listener);
  return {
    request(path, options = {}) {
      if (!active) return Promise.reject(changed());
      let operation,
        payload = null;
      if(/^\/api\/studio\/native-editor\/documents\/[a-f0-9-]{36}\/review$/.test(path) && !options.method)
        operation = 'review.read';
      else if(/^\/api\/studio\/native-editor\/documents\/[a-f0-9-]{36}\/exports$/.test(path) && options.method === 'POST') {
        operation = 'export.stage';payload=JSON.parse(options.body);
      }
      else if (path === "/api/studio/native-editor/fonts" && !options.method)
        operation = "fonts";
      else if (
        path === "/api/studio/native-editor/cutout/model" &&
        !options.method
      )
        operation = "cutout.model";
      else if (
        /^\/api\/studio\/native-editor\/cutout\/model\/\d{1,2}$/.test(path) &&
        !options.method
      ) {
        operation = "cutout.chunk";
        payload = { index: Number(path.split("/").at(-1)) };
      } else if (
        [
          "/api/studio/native-editor/cutout/prepare",
          "/api/studio/native-editor/cutout/complete",
        ].includes(path) &&
        options.method === "POST"
      ) {
        operation = path.endsWith("/prepare")
          ? "cutout.prepare"
          : "cutout.complete";
        payload = JSON.parse(options.body);
      } else if (path === "/api/studio/native-editor/assets" && !options.method)
        operation = "asset.list";
      else if (
        /^\/api\/studio\/native-editor\/assets\/[a-f0-9]{32}$/.test(path) &&
        !options.method
      ) {
        operation = "asset.read";
        payload = { id: path.split("/").at(-1) };
      } else if (
        path === "/api/studio/native-editor/assets" &&
        options.method === "POST"
      ) {
        operation = "asset.upload";
        payload = JSON.parse(options.body);
      } else if (
        /^\/api\/studio\/native-editor\/documents\/[a-f0-9-]{36}$/.test(path) &&
        options.method === "POST"
      ) {
        operation = "document.save";
        payload = JSON.parse(options.body);
      } else
        return Promise.reject(new Error("Unsupported native broker request"));
      const requestId = crypto.randomUUID();
      return new Promise((resolve, reject) => {
        const timer = setTimeout(() => {
          pending.delete(requestId);
          reject(new Error("Native request timed out; retry the same save."));
        }, 20000);
        pending.set(requestId, { resolve, reject, timer });
        parentWindow.postMessage(
          {
            type: "studio-native-request",
            nonce,
            requestId,
            operation,
            payload,
          },
          origin,
        );
      });
    },
    ready() {
      if (active)
        parentWindow.postMessage(
          { type: "studio-native-ready", nonce },
          origin,
        );
    },
    state(state) {
      if (active)
        parentWindow.postMessage(
          { type: "studio-native-state", nonce, state },
          origin,
        );
    },
    dispose() {
      active = false;
      frameWindow.removeEventListener("message", listener);
      for (const value of pending.values()) {
        clearTimeout(value.timer);
        value.reject(changed());
      }
      pending.clear();
    },
  };
}
