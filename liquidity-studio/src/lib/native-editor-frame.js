import { createNativeFrameRequest } from "./native-editor-broker.js";
import { createNativeEditorAdapter } from "./native-editor-adapter.js";
let initialized = false;
let cleanup = () => {};
window.addEventListener("message", async (event) => {
  const message = event.data;
  if (
    initialized ||
    event.source !== parent ||
    event.origin !== location.origin ||
    message?.type !== "studio-native-init" ||
    !/^[a-f0-9-]{36}$/i.test(message.nonce || "") ||
    !message.record?.document
  )
    return;
  initialized = true;
  const broker = createNativeFrameRequest({ nonce: message.nonce });
  let editor;
  let policy = null;
  const adapter = createNativeEditorAdapter({
    request: broker.request,
    scopeKey: message.scopeKey,
    getScopeKey: () => message.scopeKey,
    record: message.record,
    getAssetPolicy: () => policy,
  });
  cleanup = () => {
    editor?.destroy();
    adapter.dispose();
    broker.dispose();
  };
  window.addEventListener("message", (next) => {
    if (
      next.source === parent &&
      next.origin === location.origin &&
      next.data?.nonce === message.nonce &&
      next.data.type === "studio-native-asset-policy"
    )
      policy = next.data.policy;
  });
  try {
    let cutoutEnabled = false;
    try {
      await broker.request("/api/studio/native-editor/cutout/model");
      cutoutEnabled = true;
    } catch {}
    const module = await import("virtual:studio-native-editor");
    editor = module.mountNativeEditor(document.getElementById("native-root"), {
      document: message.record.document,
      meta: {
        id: message.record.id,
        title: message.record.title,
        mode: "account",
        revision: message.record.revision,
      },
      adapter,
      exportRequest: broker.request,
      cutoutRequest: cutoutEnabled ? broker.request : null,
      onCutoutStatus: (message) =>
        broker.state({
          status: editor?.isDirty() ? "dirty" : "idle",
          dirty: editor?.isDirty() ?? false,
          message,
          cutoutStatus: message,
        }),
      onSaveStateChange: (state) =>
        broker.state({
          ...state,
          dirty:
            editor?.isDirty() ??
            ["dirty", "saving", "conflict"].includes(state.status),
        }),
      onConflictResolve: (action) =>
        parent.postMessage(
          {
            type: "studio-native-conflict-request",
            nonce: message.nonce,
            action,
          },
          location.origin,
        ),
    });
    broker.ready();
  } catch {
    document.getElementById("native-root").textContent =
      "Native editor is unavailable. Return to the original exporter; your campaign is unchanged.";
    broker.state({
      status: "error",
      message: "Native editor local build unavailable.",
    });
  }
});
window.addEventListener("pagehide", () => cleanup(), { once: true });
