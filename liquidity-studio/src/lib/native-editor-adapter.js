const emptyPage = () => ({ count: 0, next: null, previous: null, results: [] });
const unavailable = () => {
  throw new Error(
    "This native editor service is unavailable in Studio. Your original campaign is unchanged.",
  );
};
const clone = (value) => structuredClone(value);
const key = () => crypto.randomUUID();
const encode = (bytes) => {
  let value = "";
  for (let offset = 0; offset < bytes.length; offset += 32768)
    value += String.fromCharCode(...bytes.subarray(offset, offset + 32768));
  return btoa(value);
};

/** Actual upstream EditorAdapter, using only the captured Studio request boundary. */
export function createNativeEditorAdapter({
  request,
  scopeKey,
  getScopeKey,
  record,
  getAssetPolicy = () => null,
  onSaved = () => {},
}) {
  let active = true;
  let revision = record.revision;
  let pending = null;
  const urls = new Map();
  const loadedAssets = new Map();
  function current() {
    if (!active || getScopeKey() !== scopeKey)
      throw Object.assign(
        new Error(
          "Workspace changed; reopen the native editor in the current brand.",
        ),
        { code: "REQUEST_CONTEXT_CHANGED" },
      );
  }
  async function call(path, body) {
    current();
    const response = await request(
      `/api/studio/native-editor/${path}`,
      body ? { method: "POST", body: JSON.stringify(body) } : {},
    );
    current();
    return response;
  }
  async function resolveSrc(src) {
    current();
    const match = /^studio-asset:([a-f0-9]{32})$/.exec(src);
    if (!match)
      throw new Error("Only private Studio image references can be loaded.");
    if (urls.has(src)) return urls.get(src);
    const asset = await call(`assets/${match[1]}`);
    const bytes = Uint8Array.from(atob(asset.base64), (character) =>
      character.charCodeAt(0),
    );
    const digest = [
      ...new Uint8Array(await crypto.subtle.digest("SHA-256", bytes)),
    ]
      .map((value) => value.toString(16).padStart(2, "0"))
      .join("");
    current();
    if (
      digest !== asset.sha256 ||
      !["image/png", "image/jpeg", "image/webp"].includes(asset.contentType)
    )
      throw new Error("Private image integrity check failed.");
    const url = URL.createObjectURL(
      new Blob([bytes], { type: asset.contentType }),
    );
    urls.set(src, url);
    loadedAssets.set(asset.id, asset);
    return url;
  }
  const adapter = {
    async save({ document, title }) {
      current();
      const identity = JSON.stringify({ document, title });
      if (pending && pending.identity !== identity)
        throw new Error(
          "A native save has an uncertain result. Retry that same save before changing its content.",
        );
      const intent = (pending ||= {
        identity,
        body: {
          document: clone(document),
          title,
          expectedRevision: revision,
          idempotencyKey: key(),
        },
      });
      try {
        const saved = await call(`documents/${record.id}`, intent.body);
        revision = saved.revision;
        pending = null;
        onSaved(saved);
        return { savedAt: Date.parse(saved.updatedAt), revision };
      } catch (error) {
        if (error.status) pending = null;
        if (error.status === 409) error.name = "RevisionConflictError";
        throw error;
      }
    },
    async requireAccount() {
      current();
      return true;
    },
    async uploadAsset(file, options = {}) {
      current();
      const policy = getAssetPolicy();
      if (
        !policy?.rightsDeclaration?.trim() ||
        !["confirmed", "not_personal_data"].includes(policy.consent)
      )
        throw new Error(
          "Confirm the image rights and consent declaration before uploading.",
        );
      if (
        !["image/png", "image/jpeg", "image/webp"].includes(file.type) ||
        file.size > 512 * 1024
      )
        throw new Error("Use a PNG, JPEG or WebP image of at most 512 KiB.");
      const bytes = new Uint8Array(await file.arrayBuffer());
      current();
      const uploaded = await call("assets", {
        name: options.name || file.name || "Native image",
        contentType: file.type,
        base64: encode(bytes),
        rightsDeclaration: policy.rightsDeclaration,
        consent: policy.consent,
        idempotencyKey: key(),
      });
      loadedAssets.set(uploaded.id, uploaded);
      const src = `studio-asset:${uploaded.id}`;
      return {
        id: uploaded.id,
        url: src,
        thumbUrl: src,
        width: uploaded.width,
        height: uploaded.height,
        name: uploaded.name,
        kind: "image",
      };
    },
    resolveSrc,
    realtime: null,
    services: {
      fonts: { list: async () => call("fonts"), mine: null },
      elements: { packs: async () => [], list: async () => emptyPage() },
      templates: {
        categories: async () => [],
        list: async () => emptyPage(),
        get: unavailable,
      },
      assets: { list: async () => emptyPage(), remove: unavailable },
      brand: null,
      stock: null,
      versions: null,
      sharing: null,
      comments: null,
    },
    dispose() {
      active = false;
      for (const url of urls.values()) URL.revokeObjectURL(url);
      urls.clear();
      loadedAssets.clear();
    },
    getPendingSave: () => (pending ? clone(pending.body) : null),
  };
  return adapter;
}
