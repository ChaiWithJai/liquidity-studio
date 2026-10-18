import test from 'node:test';
import assert from 'node:assert/strict';
import { renderSvg, sourcePrefixForLines } from './artwork.js';
import { createExport, zipFiles } from './export-assets.js';

const campaign = {
  infographic: { headline: 'Reported deal', statRows: ['A sourced fact', 'Another sourced fact', 'A final sourced fact'], bottomTakeaway: 'Read the sources.' },
  carousel: { slides: Array.from({ length: 4 }, (_, i) => ({ title: `Reported fact ${i + 1}`, bodyMetric: 'Source text unchanged.', visualNote: 'Editorial card' })) },
  story: { hookBanner: 'A sourced story', keyStatHighlight: 'Source text unchanged.', interactiveStickerPrompt: 'Which source next?' },
  reel: { spokenHook0to3s: 'A sourced story', beats: [{ timecode: '0:00–0:03', voiceover: 'Source text', onScreenText: 'Source text', bRollDirection: 'Text card' }], closingCta: 'Read the source.' },
  provenance: { mode: 'synthetic' }
};

test('canonical artwork has exact dimensions and escapes all user content', () => {
  const svg = renderSvg({ brandProfile: { brandName: '<script>alert(1)</script>' }, campaign, format: 'story' });
  assert.match(svg, /width="1080" height="1920"/);
  assert.ok(!svg.includes('<script>')); assert.match(svg, /&lt;script&gt;/);
  assert.match(svg, /data-preflight-text/); assert.match(svg, /SYNTHETIC DRAFT/);
});

test('overflow is rejected rather than silently clipping source facts', () => {
  assert.throws(() => renderSvg({ campaign: { ...campaign, infographic: { ...campaign.infographic, headline: 'long '.repeat(500) } }, format: 'infographic' }), /capacity/);
});

test('reel export is an actual script and never pretends to be video', async () => {
  const exported = await createExport({ campaign, format: 'reel' });
  assert.equal(exported.filename, 'reel-script.txt'); assert.match(exported.bytes.toString(), /not a rendered video/);
  assert.match(exported.bytes.toString(), /Source text/);
});

test('ZIP contains valid local headers and a complete central directory', () => {
  const zip = zipFiles([{ filename: 'slide-1.png', bytes: Buffer.from('test') }]);
  assert.equal(zip.readUInt32LE(), 0x04034b50);
  assert.equal(zip.readUInt32LE(zip.length - 22), 0x06054b50);
  assert.equal(zip.readUInt16LE(zip.length - 14), 1);
  const directoryOffset = zip.readUInt32LE(zip.length - 6);
  assert.equal(zip.readUInt32LE(directoryOffset), 0x02014b50);
});

test('PNG exports contain the requested raster dimensions, carousel contains four PNG files', async () => {
  const { default: sharp } = await import('sharp');
  for (const [format, height] of [['infographic', 1350], ['story', 1920]]) {
    const artifact = await createExport({ campaign, format });
    const metadata = await sharp(artifact.bytes).metadata();
    assert.equal(metadata.width, 1080); assert.equal(metadata.height, height); assert.equal(metadata.format, 'png');
  }
  const carousel = await createExport({ campaign, format: 'carousel' });
  assert.equal(carousel.contentType, 'application/zip');
  assert.equal(carousel.bytes.readUInt16LE(carousel.bytes.length - 14), 4);
});

test('brand typography uses bundled approved families and never injects arbitrary SVG attributes', () => {
  const campaign = { infographic: { headline: 'Reviewed source', statRows: ['Source excerpt'], bottomTakeaway: 'Review the source' } };
  const svg = renderSvg({ brandProfile: { logoText: 'CWJ//ॐ', fonts: { heading: 'Mona Sans', body: 'Inter' } }, campaign });
  assert.match(svg, /CWJ\/\/ॐ/);
  assert.match(svg, /font-family="Mona Sans, Noto Sans Devanagari/);
  assert.match(svg, /font-family="Inter, Noto Sans Devanagari/);
  const unsafe = renderSvg({ brandProfile: { fonts: { heading: '\" onload=\"alert(1)' } }, campaign });
  assert.doesNotMatch(unsafe, /onload/);
});

 test('artwork element IDs are stable, unique and cannot interpolate an untrusted page index', () => {
  const svg = renderSvg({campaign,format:'infographic'});
  const ids = [...svg.matchAll(/data-artwork-id="([^"]+)"/g)].map(match=>match[1]);
  assert.equal(ids.length,7);assert.equal(new Set(ids).size,ids.length);
  assert.ok(ids.includes('infographic-page-1-heading'));
  assert.deepEqual([...renderSvg({campaign,format:'infographic'}).matchAll(/data-artwork-id="([^"]+)"/g)].map(match=>match[1]),ids);
  for (const slideIndex of ['0', '\" onload=\"alert(1)', -1, 1.5, 99]) assert.throws(()=>renderSvg({campaign,format:'infographic',slideIndex}), /Invalid artwork page index/);
});


test('source prefix fitting retains whole Unicode source words and refuses a word that cannot fit',()=>{
 const source='Beyoncé ॐ historical source words preserve exact boundaries and context for review without an invented ending.';
 const prefix=sourcePrefixForLines(source,{width:300,size:34,maxLines:2});
 assert.ok(source.startsWith(prefix));assert.ok(prefix.length<source.length);
 assert.ok(source[prefix.length]===' ');assert.doesNotMatch(prefix,/…|\.\.\./);
 assert.throws(()=>sourcePrefixForLines('x'.repeat(300),{width:300,size:34,maxLines:2}),/capacity/);
 for(const maxLines of [0,-1,NaN])assert.throws(()=>sourcePrefixForLines(source,{width:300,size:34,maxLines}));
});
