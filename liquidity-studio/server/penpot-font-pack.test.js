import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  createPenpotFontPack,
  validatePenpotFontPack,
  remapPenpotNativeFonts,
} from "./penpot-font-pack.js";
const old = "custom-11111111-1111-4111-8111-111111111111",
  fresh = "custom-22222222-2222-4222-8222-222222222222";
function fixture() {
  return createPenpotFontPack({
    archive: Buffer.from("original disposable archive fixture"),
    fonts: [
      {
        family: "Mona Sans",
        weight: 400,
        oldFontId: old,
        sourceName: "MonaSans-Regular.otf",
        bytes: readFileSync(
          new URL("../public/fonts/MonaSans-Regular.otf", import.meta.url),
        ),
        licenseBytes: readFileSync(
          new URL("../public/fonts/MonaSans-OFL.txt", import.meta.url),
        ),
      },
    ],
  });
}
test("licensed source bytes/checksums travel with archive; new team mapping preserves text and geometry", () => {
  const pack = fixture();
  assert.equal(validatePenpotFontPack(pack), pack);
  const source = {
    shape: {
      x: 10,
      content: { fontId: old, fontWeight: "400", text: "Human text" },
    },
  };
  const font = pack.fonts[0];
  const result = remapPenpotNativeFonts(source, pack, [
    {
      oldFontId: old,
      fontId: fresh,
      weight: 400,
      family: font.family,
      sourceSha256: font.sourceSha256,
      licenseSha256: font.licenseSha256,
    },
  ]);
  assert.equal(result.document.shape.content.fontId, fresh);
  assert.equal(result.document.shape.content.text, "Human text");
  assert.equal(result.document.shape.x, 10);
  assert.equal(source.shape.content.fontId, old);
  assert.equal(result.authorityRestored, false);
});
test("tampered archive/font/license, missing mapping, unknown credential fields and unsafe filenames rejected", () => {
  for (const change of [
    (p) => (p.archive.bytes = Buffer.from("tampered").toString("base64")),
    (p) => (p.fonts[0].sourceSha256 = "a".repeat(64)),
    (p) => (p.fonts[0].licenseSha256 = "b".repeat(64)),
    (p) => (p.session = "secret"),
    (p) => (p.fonts[0].sourceName = "../font.otf"),
  ]) {
    const p = fixture();
    change(p);
    assert.throws(() => validatePenpotFontPack(p));
  }
  assert.throws(() =>
    remapPenpotNativeFonts({ fontId: old, fontWeight: "400" }, fixture(), []),
  );
});
