import fs from "node:fs";
import { createHash } from "node:crypto";
import {
  createPenpotFontPack,
  validatePenpotFontPack,
  remapPenpotNativeFonts,
} from "../../liquidity-studio/server/penpot-font-pack.js";
const [action, ...inputs] = process.argv.slice(2);
const read = (filename) => JSON.parse(fs.readFileSync(filename, "utf8"));
const write = (filename, value) =>
  fs.writeFileSync(filename, JSON.stringify(value), {
    mode: 0o600,
    flag: "wx",
  });
const SOURCES = {
  "MonaSans-Regular.otf": ["Mona Sans", 400, "MonaSans-OFL.txt"],
  "MonaSans-Bold.otf": ["Mona Sans", 700, "MonaSans-OFL.txt"],
  "InterVariable.ttf": ["Inter", 400, "Inter-LICENSE.txt"],
  "InstrumentSerif-Regular.ttf": [
    "Instrument Serif",
    400,
    "InstrumentSerif-OFL.txt",
  ],
};
const hash = (bytes) => createHash("sha256").update(bytes).digest("hex");
function verifySources(pack) {
  validatePenpotFontPack(pack);
  for (const font of pack.fonts) {
    const source = SOURCES[font.sourceName];
    if (
      !source ||
      font.family !== source[0] ||
      font.weight !== source[1] ||
      hash(
        fs.readFileSync(
          new URL(
            "../../liquidity-studio/public/fonts/" + font.sourceName,
            import.meta.url,
          ),
        ),
      ) !== font.sourceSha256 ||
      hash(
        fs.readFileSync(
          new URL(
            "../../liquidity-studio/public/fonts/" + source[2],
            import.meta.url,
          ),
        ),
      ) !== font.licenseSha256
    )
      throw new Error("Font is not in the pinned repository source allowlist");
  }
}
if (action === "create" && inputs.length === 3) {
  const [archiveFile, manifestFile, output] = inputs;
  const fonts = read(manifestFile).map((font) => {
    const source = SOURCES[font.sourceFile];
    if (!source || font.family !== source[0] || font.weight !== source[1])
      throw new Error("Unsupported pinned source font");
    return {
      family: font.family,
      weight: font.weight,
      oldFontId: font.fontId,
      sourceName: font.sourceFile,
      bytes: fs.readFileSync(
        new URL(
          "../../liquidity-studio/public/fonts/" + font.sourceFile,
          import.meta.url,
        ),
      ),
      licenseBytes: fs.readFileSync(
        new URL(
          "../../liquidity-studio/public/fonts/" + source[2],
          import.meta.url,
        ),
      ),
    };
  });
  const pack = createPenpotFontPack({
    archive: fs.readFileSync(archiveFile),
    fonts,
  });
  verifySources(pack);
  write(output, pack);
} else if (action === "validate" && inputs.length === 1)
  verifySources(read(inputs[0]));
else if (action === "remap" && inputs.length === 4) {
  const [nativeFile, packFile, uploadFile, output] = inputs;
  const native = read(nativeFile),
    pack = read(packFile);
  verifySources(pack);
  const result = remapPenpotNativeFonts(native, pack, read(uploadFile));
  const kebab = (value) =>
    Array.isArray(value)
      ? value.map(kebab)
      : value && typeof value === "object"
        ? Object.fromEntries(
            Object.entries(value).map(([key, child]) => [
              key.replace(/[A-Z]/g, (letter) => "-" + letter.toLowerCase()),
              kebab(child),
            ]),
          )
        : value;
  const changes = [];
  for (const [pageId, page] of Object.entries(result.document.data.pagesIndex))
    for (const shape of Object.values(page.objects))
      if (shape.type === "text")
        changes.push({
          type: "mod-obj",
          "page-id": pageId,
          id: shape.id,
          operations: [
            { type: "set", attr: "content", val: kebab(shape.content) },
            { type: "set", attr: "position-data", val: null },
          ],
        });
  write(output, {
    fileId: native.id,
    projectId: native.projectId,
    expectedRevision: native.revn,
    changes,
    remappedReferences: result.remappedReferences,
  });
} else
  throw new Error(
    "Usage: create ARCHIVE FONTS OUTPUT | validate PACK | remap NATIVE PACK UPLOADS OUTPUT",
  );
console.log(
  "Bounded pinned-font recovery operation validated; no authority imported.",
);
