import { fail } from "./auth.js";
import { NATIVE_TARGETS } from "./multimodal-contract.js";
const BASE = "http://127.0.0.1:39007/api/v1";
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
function exact(value, keys) {
  if (
    !value ||
    typeof value !== "object" ||
    Array.isArray(value) ||
    Object.keys(value).some((k) => !keys.includes(k))
  )
    throw fail(400, "Unsupported native fields");
}
export function validateDooryDocument(doc) {
  exact(doc, ["schemaVersion", "width", "height", "unit", "pages"]);
  if (
    Buffer.byteLength(JSON.stringify(doc)) > 256 * 1024 ||
    doc.schemaVersion !== 1 ||
    doc.width !== 1080 ||
    ![1350, 1920].includes(doc.height) ||
    doc.unit !== "px" ||
    !Array.isArray(doc.pages) ||
    ![1, 3, 4].includes(doc.pages.length)
  )
    throw fail(422, "Unsupported bounded Doory document");
  const pages = new Set();
  for (const page of doc.pages) {
    exact(page, [
      "id",
      "name",
      "background",
      "objects",
      "notes",
      "durationSec",
    ]);
    if (typeof page.id !== "string" || pages.has(page.id))
      throw fail(422, "Invalid page identity");
    pages.add(page.id);
    exact(page.background, ["type", "color"]);
    if (
      page.background.type !== "solid" ||
      !/^#[a-f0-9]{6}$/i.test(page.background.color) ||
      !Array.isArray(page.objects) ||
      page.objects.length > 30 ||
      typeof page.notes !== "string" ||
      page.notes.length > 5000
    )
      throw fail(422, "Unsupported native page");
    const ids = new Set();
    for (const object of page.objects) {
      exact(object, [
        "id",
        "type",
        "name",
        "text",
        "originX",
        "originY",
        "left",
        "top",
        "width",
        "height",
        "fontFamily",
        "fontSize",
        "fontWeight",
        "fill",
        "textAlign",
        "lineHeight",
        "splitByGrapheme",
        "strokeUniform",
        "stroke",
        "strokeWidth",
        "strokeDashArray",
      ]);
      if (
        typeof object.id !== "string" ||
        ids.has(object.id) ||
        !["textbox", "rect"].includes(object.type)
      )
        throw fail(422, "Unsupported native layer");
      ids.add(object.id);
      for (const key of ["left", "top", "width", "height"])
        if (!Number.isFinite(object[key]) || Math.abs(object[key]) > 20000)
          throw fail(422, "Invalid native geometry");
      if (
        object.type === "textbox" &&
        (typeof object.text !== "string" ||
          object.text.length > 5000 ||
          typeof object.fontFamily !== "string" ||
          !Number.isFinite(object.fontSize))
      )
        throw fail(422, "Invalid native text");
    }
  }
  return structuredClone(doc);
}
/** Investigation only: constructor-owned sessions, fixed loopback, no env/client endpoints or redirects. */
export class DooryLocalTransport {
  constructor({
    sessions,
    fontFamiliesByOwner = new Map(),
    fetchImpl = fetch,
  }) {
    this.sessions = sessions;
    this.fontFamiliesByOwner = fontFamiliesByOwner;
    this.fetch = fetchImpl;
  }
  validateCommand({ binding, resource, action, command }) {
    if (
      binding.adapter !== "doory" ||
      binding.nativeVersionKind !== "document-schema" ||
      binding.nativeDocumentVersion !== "1" ||
      binding.editorVersion !== NATIVE_TARGETS.doory.sourceCommit ||
      resource.kind !== "document" ||
      !UUID.test(resource.nativeId)
    )
      throw fail(422, "Unsupported registered Doory target");
    if (!this.sessions.has(binding.ownerPrincipal))
      throw fail(403, "No operator session for registered owner");
    if (["read", "export"].includes(action) && command === undefined)
      return undefined;
    if (action !== "write")
      throw fail(422, "Unsupported local editor operation");
    exact(command, ["operation", "document", "expectedNativeRevision"]);
    if (
      command.operation !== "patch" ||
      !Number.isInteger(command.expectedNativeRevision) ||
      command.expectedNativeRevision < 1
    )
      throw fail(400, "Native patch requires optimistic revision");
    const document = validateDooryDocument(command.document);
    const available =
      this.fontFamiliesByOwner.get(binding.ownerPrincipal) || [];
    for (const page of document.pages)
      for (const object of page.objects) {
        if (object.type === "textbox") {
          const family = object.fontFamily
            .split(",")[0]
            .replaceAll('"', "")
            .trim();
          if (!available.includes(family))
            throw fail(422, `Missing verified target font: ${family}`);
        }
      }
    return {
      operation: "patch",
      expectedNativeRevision: command.expectedNativeRevision,
      document,
    };
  }
  async execute({ binding, resource, action, command, reauthorize }) {
    command = this.validateCommand({ binding, resource, action, command });
    const session = this.sessions.get(binding.ownerPrincipal);
    if (typeof reauthorize !== "function")
      throw fail(403, "Registered boundary reauthorization required");
    await reauthorize();
    const response = await this.fetch(`${BASE}/designs/${resource.nativeId}/`, {
      method: action === "write" ? "PATCH" : "GET",
      redirect: "error",
      signal: AbortSignal.timeout(15000),
      headers: {
        Cookie: session.cookie,
        "X-CSRFToken": session.csrf,
        Origin: "http://127.0.0.1:39007",
        ...(command ? { "Content-Type": "application/json" } : {}),
      },
      ...(command
        ? {
            body: JSON.stringify({
              document: command.document,
              base_revision: command.expectedNativeRevision,
            }),
          }
        : {}),
    });
    if (!response.ok)
      throw fail(
        response.status,
        response.status === 409
          ? "Native revision changed; reload before retrying"
          : "Registered native operation rejected",
      );
    const data = await response.json();
    if (
      data.id !== resource.nativeId ||
      !data.document ||
      !Number.isInteger(data.revision)
    )
      throw fail(502, "Unexpected native response identity");
    return {
      nativeId: data.id,
      revision: data.revision,
      document: data.document,
      ...(action === "export"
        ? { exportType: "native-json-api-copy", portableAssets: false }
        : {}),
    };
  }
}
