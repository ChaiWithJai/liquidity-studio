import {inspectPcmWav,audioSource} from '../../server/native-audio.js';
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
  const createdUrls = new Set();
  const loadedAssets = new Map();
  const cutoutOutputs = new WeakMap();
  let pendingCutoutUpload = null;
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
    const audioMatch=/^\/__studio_native_audio\/([a-f0-9]{32})$/.exec(src);
    const match = /^studio-asset:([a-f0-9]{32})$/.exec(src)||audioMatch;
    if (!match)
      throw new Error("Only saved Studio image or audio references can be loaded.");
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
      !(audioMatch?asset.contentType==="audio/wav":["image/png", "image/jpeg", "image/webp"].includes(asset.contentType))
    )
      throw new Error("Private media integrity check failed.");
    if(audioMatch)inspectPcmWav(bytes);
    const url = URL.createObjectURL(
      new Blob([bytes], { type: asset.contentType }),
    );
    urls.set(src, url);
    createdUrls.add(url);
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
        if (error.status >= 400 && error.status < 500) pending = null;
        if (error.status === 409) error.name = "RevisionConflictError";
        throw error;
      }
    },
    async requireAccount() {
      current();
      return true;
    },
    getCutoutRetry(assetId) {
      current();
      if (!pendingCutoutUpload) return null;
      if (pendingCutoutUpload.intent.inputAssetId !== assetId)
        throw new Error(
          "A cutout upload has an uncertain result. Retry the same selected image first.",
        );
      return pendingCutoutUpload.file;
    },
    async prepareCutout(image, assetId) {
      current();
      const policy = getAssetPolicy();
      if (!policy?.cutoutConfirmed)
        throw new Error(
          "Confirm the image rights and consent for background removal.",
        );
      if (!/^[a-f0-9]{32}$/.test(assetId || ""))
        throw new Error("Select a saved private Studio image.");
      const source =
        loadedAssets.get(assetId) || (await call(`assets/${assetId}`));
      const digest = [
        ...new Uint8Array(
          await crypto.subtle.digest("SHA-256", await image.arrayBuffer()),
        ),
      ]
        .map((v) => v.toString(16).padStart(2, "0"))
        .join("");
      current();
      if (digest !== source.sha256)
        throw new Error(
          "Selected image changed; reopen it before background removal.",
        );
      return call("cutout/prepare", {
        documentId: record.id,
        expectedRevision: revision,
        inputAssetId: assetId,
        idempotencyKey: key(),
      });
    },
    retainCutoutOutput(image, intent) {
      current();
      cutoutOutputs.set(image, { intent, idempotencyKey: key() });
    },
    async uploadAsset(file, options = {}) {
      current();
      const cutout = cutoutOutputs.get(file);
      if (cutout) {
        if (file.type !== "image/png" || file.size > 512 * 1024)
          throw new Error(
            "Cutout exceeds 512 KiB; the original image is unchanged.",
          );
        if (pendingCutoutUpload && pendingCutoutUpload.file !== file)
          throw new Error("Retry the same uncertain cutout upload first.");
        pendingCutoutUpload ||= { ...cutout, file };
        let uploaded;
        try {
          uploaded = await call("cutout/complete", {
            intentId: cutout.intent.id,
            base64: encode(new Uint8Array(await file.arrayBuffer())),
            idempotencyKey: cutout.idempotencyKey,
          });
          pendingCutoutUpload = null;
        } catch (error) {
          if (error.status >= 400 && error.status < 500)
            pendingCutoutUpload = null;
          throw error;
        }
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
      }
      const policy = getAssetPolicy();
      if (
        !policy?.rightsDeclaration?.trim() ||
        !["confirmed", "not_personal_data"].includes(policy.consent)
      )
        throw new Error(
          "Confirm the upload rights and consent declaration before uploading.",
        );
      const audio=/^(audio\/|video\/webm)/.test(file.type)||/\.(wav|mp3|ogg|oga|opus|m4a|weba|webm|aac)$/i.test(file.name||""),mime=audio?"audio/wav":file.type;
      if(audio&&!(["audio/wav","audio/x-wav","audio/wave","audio/vnd.wave"].includes(file.type)||!file.type&&/\.wav$/i.test(file.name||"")))throw new Error("Use an uncompressed 16-bit PCM WAV file, at most 512 KiB and 30 seconds. MP3/OGG/recording uploads are not supported in Studio yet.");
      if (
        !["image/png", "image/jpeg", "image/webp","audio/wav"].includes(mime) ||
        file.size > 512 * 1024
      )
        throw new Error("Use a PNG, JPEG, WebP or PCM WAV file of at most 512 KiB.");
      const bytes = new Uint8Array(await file.arrayBuffer());
      current();
      if(audio)inspectPcmWav(bytes);
      const uploaded = await call("assets", {
        name: options.name || file.name || "Native image",
        contentType: mime,
        base64: encode(bytes),
        rightsDeclaration: policy.rightsDeclaration,
        consent: policy.consent,
        idempotencyKey: key(),
      });
      loadedAssets.set(uploaded.id, uploaded);
      const src = audio?audioSource(uploaded.id):`studio-asset:${uploaded.id}`;
      return {
        id: uploaded.id,
        url: src,
        thumbUrl: audio?"":src,
        width: uploaded.width,
        height: uploaded.height,
        name: uploaded.name,
        kind: audio?"audio":"image",
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
      assets: { list: async (options={}) => call(options.kind==="audio"?"assets?kind=audio":"assets"), remove: unavailable },
      brand: null,
      stock: null,
      versions: null,
      sharing: null,
      comments: null,
    },
    dispose() {
      active = false;
      for (const url of createdUrls) URL.revokeObjectURL(url);
      createdUrls.clear();
      urls.clear();
      loadedAssets.clear();
    },
    getPendingSave: () => (pending ? clone(pending.body) : null),
  };
  return adapter;
}
