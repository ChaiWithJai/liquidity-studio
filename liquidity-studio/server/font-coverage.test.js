import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { renderSvg } from './artwork.js';

// Bounded BMP format-4 inspector for the committed TrueType fonts. Glyph zero
// means .notdef, not a usable character. Offsets follow the OpenType cmap spec:
// https://learn.microsoft.com/en-us/typography/opentype/spec/cmap#format-4-segment-mapping-to-delta-values
function glyphForCodePoint(font, codePoint) {
  let cmap;
  const tables = font.readUInt16BE(4);
  for (let index = 0; index < tables; index++) {
    const entry = 12 + index * 16;
    if (font.toString('ascii', entry, entry + 4) === 'cmap') {
      cmap = font.readUInt32BE(entry + 8);
      break;
    }
  }
  assert.notEqual(cmap, undefined, 'Font must contain a cmap table');
  const encodings = font.readUInt16BE(cmap + 2);
  for (let index = 0; index < encodings; index++) {
    const entry = cmap + 4 + index * 8;
    const platform = font.readUInt16BE(entry);
    const encoding = font.readUInt16BE(entry + 2);
    if (platform !== 0 && !(platform === 3 && encoding === 1)) continue;
    const table = cmap + font.readUInt32BE(entry + 4);
    if (font.readUInt16BE(table) !== 4) continue;
    const segments = font.readUInt16BE(table + 6) / 2;
    for (let segment = 0; segment < segments; segment++) {
      const end = font.readUInt16BE(table + 14 + segment * 2);
      const start = font.readUInt16BE(table + 16 + segments * 2 + segment * 2);
      if (codePoint < start || codePoint > end) continue;
      const delta = font.readInt16BE(table + 16 + segments * 4 + segment * 2);
      const offsetAddress = table + 16 + segments * 6 + segment * 2;
      const rangeOffset = font.readUInt16BE(offsetAddress);
      if (rangeOffset === 0) return (codePoint + delta) & 0xffff;
      const glyph = font.readUInt16BE(offsetAddress + rangeOffset + (codePoint - start) * 2);
      return glyph ? (glyph + delta) & 0xffff : 0;
    }
  }
  return 0;
}

const asset = name => readFileSync(new URL(`../public/fonts/${name}`, import.meta.url));
test('bundled Devanagari fallback contains the actual CWJ Om glyph, not .notdef', () => {
  const font = asset('NotoSansDevanagari.ttf');
  assert.ok(glyphForCodePoint(font, 0x0950) > 0, 'ॐ must map to an actual glyph');
  assert.equal(glyphForCodePoint(font, 0x0378), 0, 'Unassigned code point must remain missing');
  assert.equal(glyphForCodePoint(asset('DejaVuSans.ttf'), 0x0950), 0, 'Base font alone cannot render the CWJ glyph');
});

test('browser and canonical artwork explicitly use the licensed fallback', () => {
  const css = readFileSync(new URL('../src/studio.css', import.meta.url), 'utf8');
  assert.match(css, /font-family:\s*["']Noto Sans Devanagari["']/);
  assert.match(css, /NotoSansDevanagari\.ttf/);
  assert.match(asset('NotoSansDevanagari-OFL.txt').toString(), /SIL Open Font License/);
  const svg = renderSvg({ brandProfile: { logoText: 'CWJ // ॐ' }, campaign: { infographic: { headline: 'Source notes', statRows: ['A reviewed excerpt.'], bottomTakeaway: 'Review sources.' } } });
  assert.match(svg, /CWJ \/\/ ॐ/);
  assert.match(svg, /DejaVu Sans, Noto Sans Devanagari, sans-serif/);
});
