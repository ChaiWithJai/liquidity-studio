// Shared by the Svelte preview and the PNG exporter. No browser/server-only APIs.
export const ASSET_SIZES = Object.freeze({ infographic: [1080, 1350], carousel: [1080, 1350], story: [1080, 1920], reel: [1080, 1920] });

function escapeXml(value = '') {
  return String(value).replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' }[char]));
}

function color(value, fallback) {
  return /^#[0-9a-f]{6}$/i.test(value || '') ? value : fallback;
}

function wrap(value, characters, maximumLines) {
  const words = String(value ?? '').slice(0, 12000).split(/\s+/).filter(Boolean);
  const lines = [];
  let line = '';
  for (const word of words) {
    // Split long URLs/words so user input cannot extend outside the canvas.
    const chunks = word.match(new RegExp(`.{1,${characters}}`, 'gu')) || [];
    for (const chunk of chunks) {
      if (line && [...`${line} ${chunk}`].length > characters) { lines.push(line); line = ''; }
      line = line ? `${line} ${chunk}` : chunk;
    }
  }
  if (line) lines.push(line);
  if (lines.length > maximumLines) {
    throw new Error(`Content exceeds artwork capacity (${maximumLines} lines). Shorten the text before exporting.`);
  }
  return lines;
}

function textBlock(value, x, y, size, width, maxLines, fill, weight = 400, font = 'DejaVu Sans') {
  const lines = wrap(value, Math.max(8, Math.floor(width / (size * 0.63))), maxLines);
  return {
    height: Math.max(1, lines.length) * size * 1.3,
    svg: `<text data-preflight-text="true" x="${x}" y="${y}" fill="${fill}" font-family="${font}" font-size="${size}" font-weight="${weight}">${lines.map((line, i) => `<tspan x="${x}" dy="${i ? size * 1.3 : 0}">${escapeXml(line)}</tspan>`).join('')}</text>`
  };
}

/** Returns the exact SVG used in both editor previews and exported PNGs. */
export function renderSvg({ brandProfile = {}, campaign, format = 'infographic', slideIndex = 0 }) {
  if (!campaign || !ASSET_SIZES[format]) throw new Error('A campaign and supported format are required');
  const [width, height] = ASSET_SIZES[format];
  const palette = brandProfile.colors || [];
  const background = color(palette[0]?.hex, '#141513');
  const accent = color(palette[2]?.hex, '#C5D86D');
  const foreground = color(palette[3]?.hex, '#F4F1EA');
  const muted = color(palette[1]?.hex, '#A8C5A0');
  const vertical = height === 1920;
  const contentWidth = format === 'reel' ? 740 : 900;
  const top = vertical ? 330 : 140;
  let title, paragraphs, takeaway;
  if (format === 'infographic') {
    const item = campaign.infographic;
    if (!item || !Array.isArray(item.statRows)) throw new Error('Infographic content missing');
    title = item.headline; paragraphs = item.statRows; takeaway = item.bottomTakeaway;
  } else if (format === 'carousel') {
    const item = campaign.carousel?.slides?.[slideIndex];
    if (!item) throw new Error('Carousel slide missing');
    title = item.title; paragraphs = [item.bodyMetric]; takeaway = item.visualNote;
  } else if (format === 'story') {
    const item = campaign.story;
    if (!item) throw new Error('Story content missing');
    title = item.hookBanner; paragraphs = [item.keyStatHighlight]; takeaway = item.interactiveStickerPrompt;
  } else {
    const beat = campaign.reel?.beats?.[slideIndex];
    if (!beat) throw new Error('Reel beat missing');
    title = beat.onScreenText || campaign.reel.spokenHook0to3s;
    paragraphs = [beat.voiceover]; takeaway = campaign.reel.closingCta;
  }
  const chooseFont = (value, fallback) => ['Mona Sans', 'Inter', 'Instrument Serif', 'DejaVu Sans'].find((name) => String(value || '').split('/')[0].trim() === name) || fallback;
  const headingFont = chooseFont(brandProfile.fonts?.heading, 'DejaVu Sans');
  const bodyFont = chooseFont(brandProfile.fonts?.body, 'DejaVu Sans');
  const blocks = [];
  let y = top;
  const heading = textBlock(title, 80, y, 52, contentWidth, 5, foreground, 700, headingFont);
  blocks.push(heading.svg); y += heading.height + 72;
  for (const paragraph of paragraphs) {
    const body = textBlock(paragraph, 106, y, 34, contentWidth - 60, 5, foreground, 400, bodyFont);
    blocks.push(`<path d="M80 ${y - 30}v${body.height + 10}" stroke="${accent}" stroke-width="6"/>`, body.svg);
    y += body.height + 50;
  }
  const footer = textBlock(takeaway, 80, y + 10, 29, contentWidth, 4, muted, 400, bodyFont);
  const bottom = vertical ? height * 0.82 - 35 : height - 80;
  if (y + footer.height > bottom) throw new Error('Content exceeds the safe artwork area. Shorten the copy before exporting.');
  blocks.push(footer.svg);
  const brand = escapeXml([brandProfile.logoText, brandProfile.brandName || 'Campaign Studio'].filter(Boolean).join(' · '));
  const provenance = campaign.provenance?.mode === 'synthetic' ? 'SYNTHETIC DRAFT · REVIEW REQUIRED' : 'EDITORIAL DRAFT';
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-label="${escapeXml(title)}"><title>${escapeXml(title)}</title><rect width="${width}" height="${height}" fill="${background}"/><g font-family="DejaVu Sans, sans-serif"><text x="80" y="${vertical ? 250 : 65}" fill="${muted}" font-size="26" font-weight="700">${brand}</text><path d="M80 ${top - 55}h920" stroke="${accent}" stroke-width="3"/>${blocks.join('')}<text x="80" y="${height - 35}" fill="${muted}" font-size="19">${provenance}${format === 'carousel' ? ` · ${slideIndex + 1}/4` : ''}</text></g></svg>`;
}
