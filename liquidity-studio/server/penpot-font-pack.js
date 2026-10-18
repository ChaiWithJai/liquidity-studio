import { createHash } from "node:crypto";
const hash = (bytes) => createHash("sha256").update(bytes).digest("hex");
const UUID =
  /^custom-[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/;
const reject = () => {
  throw new Error("Invalid bounded Penpot font recovery pack");
};
function exact(value, fields) {
  if (
    !value ||
    typeof value !== "object" ||
    Array.isArray(value) ||
    Object.keys(value).some((k) => !fields.includes(k))
  )
    reject();
}
function decode(value, limit) {
  if (
    typeof value !== "string" ||
    value.length > Math.ceil(limit / 3) * 4 ||
    !/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(
      value,
    )
  )
    reject();
  const bytes = Buffer.from(value, "base64");
  if (
    !bytes.length ||
    bytes.length > limit ||
    bytes.toString("base64") !== value
  )
    reject();
  return bytes;
}
/** Outer pack includes licensed source bytes. A native .penpot archive alone does not. */
export function createPenpotFontPack({ archive, fonts }) {
  if (
    !Buffer.isBuffer(archive) ||
    !archive.length ||
    archive.length > 10 * 1024 * 1024 ||
    !Array.isArray(fonts) ||
    !fonts.length ||
    fonts.length > 8
  )
    reject();
  if (
    fonts.some(
      (font) =>
        !font ||
        !Buffer.isBuffer(font.bytes) ||
        !Buffer.isBuffer(font.licenseBytes),
    )
  )
    reject();
  const pack = {
    kind: "studio-penpot-font-recovery",
    schemaVersion: 1,
    editorVersion: "2.18.3",
    archive: { sha256: hash(archive), bytes: archive.toString("base64") },
    fonts: fonts.map((font) => ({
      family: font.family,
      weight: font.weight,
      oldFontId: font.oldFontId,
      sourceName: font.sourceName,
      sourceSha256: hash(font.bytes),
      sourceBytes: font.bytes.toString("base64"),
      license: "OFL-1.1",
      licenseSha256: hash(font.licenseBytes),
      licenseBytes: font.licenseBytes.toString("base64"),
    })),
  };
  validatePenpotFontPack(pack);
  return pack;
}
export function validatePenpotFontPack(pack) {
  exact(pack, ["kind", "schemaVersion", "editorVersion", "archive", "fonts"]);
  if (
    pack.kind !== "studio-penpot-font-recovery" ||
    pack.schemaVersion !== 1 ||
    pack.editorVersion !== "2.18.3" ||
    !Array.isArray(pack.fonts) ||
    !pack.fonts.length ||
    pack.fonts.length > 8
  )
    reject();
  exact(pack.archive, ["sha256", "bytes"]);
  const archive = decode(pack.archive.bytes, 10 * 1024 * 1024);
  if (hash(archive) !== pack.archive.sha256) reject();
  let total = archive.length;
  const keys = new Set();
  for (const font of pack.fonts) {
    exact(font, [
      "family",
      "weight",
      "oldFontId",
      "sourceName",
      "sourceSha256",
      "sourceBytes",
      "license",
      "licenseSha256",
      "licenseBytes",
    ]);
    if (
      typeof font.family !== "string" ||
      !/^[A-Za-z0-9 -]{1,80}$/.test(font.family) ||
      ![400, 700].includes(font.weight) ||
      !UUID.test(font.oldFontId) ||
      !/^[A-Za-z0-9_-]+\.(otf|ttf)$/.test(font.sourceName) ||
      font.license !== "OFL-1.1"
    )
      reject();
    const key = font.oldFontId + ":" + font.weight;
    if (keys.has(key)) reject();
    keys.add(key);
    const bytes = decode(font.sourceBytes, 3 * 1024 * 1024),
      license = decode(font.licenseBytes, 100 * 1024);
    total += bytes.length + license.length;
    if (
      hash(bytes) !== font.sourceSha256 ||
      hash(license) !== font.licenseSha256 ||
      !license.toString("utf8").includes("SIL OPEN FONT LICENSE")
    )
      reject();
    const signature = bytes.subarray(0, 4).toString("hex");
    if (!["4f54544f", "00010000", "74746366"].includes(signature)) reject();
  }
  if (total > 20 * 1024 * 1024) reject();
  return pack;
}
/** Pure recovery plan; caller must independently authorize a fresh target and verify uploaded bytes. */
export function remapPenpotNativeFonts(nativeDocument, pack, verifiedUploads) {
  validatePenpotFontPack(pack);
  if (
    !Array.isArray(verifiedUploads) ||
    verifiedUploads.length !== pack.fonts.length
  )
    reject();
  const mapping = new Map();
  for (const source of pack.fonts) {
    const upload = verifiedUploads.find(
      (u) => u.oldFontId === source.oldFontId && u.weight === source.weight,
    );
    if (
      !upload ||
      !UUID.test(upload.fontId) ||
      upload.sourceSha256 !== source.sourceSha256 ||
      upload.family !== source.family ||
      upload.licenseSha256 !== source.licenseSha256
    )
      reject();
    mapping.set(source.oldFontId + ":" + source.weight, upload.fontId);
  }
  let count = 0;
  const result = structuredClone(nativeDocument);
  function walk(value) {
    if (!value || typeof value !== "object") return;
    if (
      typeof value.fontId === "string" &&
      value.fontId.startsWith("custom-")
    ) {
      const target = mapping.get(value.fontId + ":" + Number(value.fontWeight));
      if (!target) reject();
      value.fontId = target;
      count++;
    }
    for (const child of Object.values(value)) walk(child);
  }
  walk(result);
  if (!count) reject();
  return {
    document: result,
    remappedReferences: count,
    authorityRestored: false,
  };
}
