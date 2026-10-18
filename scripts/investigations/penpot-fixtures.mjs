import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { renderSvg } from '../../liquidity-studio/server/artwork.js';
import { BRAND_PRESETS } from '../../liquidity-studio/server/domain.js';

if (!process.argv[2]) throw new Error('Provide a disposable output directory');
const directory = path.resolve(process.argv[2]);
fs.mkdirSync(directory, { recursive: true, mode: 0o700 });
const campaign = {
  infographic: { headline: 'LOCAL IMPORT TEST', statRows: ['Editable source text.', 'Disposable native document fixture.'], bottomTakeaway: 'Review before publishing.' },
  carousel: { slides: Array.from({ length: 4 }, (_, index) => ({ title: `LOCAL PAGE ${index + 1}`, bodyMetric: 'Disposable source text.', visualNote: 'Native edit test.' })) },
  story: { hookBanner: 'LOCAL STORY TEST', keyStatHighlight: 'Disposable source text.', interactiveStickerPrompt: 'Review this fixture.' },
  reel: { spokenHook0to3s: 'LOCAL REEL TEST', beats: Array.from({ length: 3 }, (_, index) => ({ onScreenText: `LOCAL BEAT ${index + 1}`, voiceover: 'Disposable source text.' })), closingCta: 'Review this fixture.' },
  provenance: { mode: 'synthetic' },
};
const files = [];
for (const [brand, brandProfile] of Object.entries(BRAND_PRESETS)) {
  for (const format of ['infographic', 'carousel', 'story', 'reel']) {
    const count = format === 'carousel' ? 4 : format === 'reel' ? 3 : 1;
    for (let slideIndex = 0; slideIndex < count; slideIndex++) {
      const filename = `${brand}-${format}-${slideIndex + 1}.svg`;
      const bytes = renderSvg({ brandProfile, campaign, format, slideIndex });
      fs.writeFileSync(path.join(directory, filename), bytes);
      files.push({ filename, format, brand, sha256: crypto.createHash('sha256').update(bytes).digest('hex') });
    }
  }
}
fs.writeFileSync(path.join(directory, 'tokens.dtcg.json'), JSON.stringify({
  color: {
    agni: { $type: 'color', $value: '#E85D04' },
    prana: { $type: 'color', $value: '#219EBC' },
    sattva: { $type: 'color', $value: '#E5E7EB' },
  },
  space: { card: { $type: 'dimension', $value: '24px' } },
}, null, 2));
fs.writeFileSync(path.join(directory, 'source-manifest.json'), JSON.stringify({
  renderer: 'server/artwork.js renderSvg',
  purpose: 'Disposable test content; generated SVGs are not native editor or video acceptance',
  files,
}, null, 2));
console.log(`Wrote ${files.length} SVG fixtures and a partial DTCG token fixture.`);
