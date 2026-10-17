import { renderSvg } from './artwork.js';

function crc32(bytes) {
  let result = 0xffffffff;
  for (const byte of bytes) {
    result ^= byte;
    for (let bit = 0; bit < 8; bit++) result = (result >>> 1) ^ (0xedb88320 & -(result & 1));
  }
  return (result ^ 0xffffffff) >>> 0;
}

// Standard uncompressed ZIP: PNG is already compressed. No shell tools or paths.
export function zipFiles(files) {
  const local = [], central = [];
  let offset = 0;
  for (const { filename, bytes } of files) {
    const name = Buffer.from(filename);
    const header = Buffer.alloc(30);
    header.writeUInt32LE(0x04034b50); header.writeUInt16LE(20, 4);
    header.writeUInt32LE(crc32(bytes), 14); header.writeUInt32LE(bytes.length, 18);
    header.writeUInt32LE(bytes.length, 22); header.writeUInt16LE(name.length, 26);
    const directory = Buffer.alloc(46);
    directory.writeUInt32LE(0x02014b50); directory.writeUInt16LE(20, 4); directory.writeUInt16LE(20, 6);
    directory.writeUInt32LE(crc32(bytes), 16); directory.writeUInt32LE(bytes.length, 20);
    directory.writeUInt32LE(bytes.length, 24); directory.writeUInt16LE(name.length, 28);
    directory.writeUInt32LE(offset, 42);
    local.push(header, name, bytes); central.push(directory, name);
    offset += header.length + name.length + bytes.length;
  }
  const directory = Buffer.concat(central), end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50); end.writeUInt16LE(files.length, 8); end.writeUInt16LE(files.length, 10);
  end.writeUInt32LE(directory.length, 12); end.writeUInt32LE(offset, 16);
  return Buffer.concat([...local, directory, end]);
}

export async function createExport({ brandProfile, campaign, format }) {
  if (format === 'reel') {
    if (!campaign?.reel?.beats?.length) throw new Error('Reel script missing');
    const reel = campaign.reel;
    const script = [brandProfile?.brandName || 'Campaign', 'REEL SCRIPT AND STORYBOARD (not a rendered video)', '', `Hook: ${reel.spokenHook0to3s}`, ...reel.beats.flatMap(beat => ['', beat.timecode, `Voiceover: ${beat.voiceover}`, `On-screen: ${beat.onScreenText}`, `Visual: ${beat.bRollDirection}`]), '', `Closing: ${reel.closingCta}`, '', `Provenance: ${campaign.provenance?.mode || 'unavailable'}; source review required.`].join('\n');
    return { filename: 'reel-script.txt', contentType: 'text/plain; charset=utf-8', bytes: Buffer.from(script) };
  }
  if (!['infographic', 'carousel', 'story'].includes(format)) throw new Error('Unsupported export format');
  const { default: sharp } = await import('sharp');
  const png = async slideIndex => sharp(Buffer.from(renderSvg({ brandProfile, campaign, format, slideIndex }))).png().toBuffer();
  if (format === 'carousel') {
    if (campaign?.carousel?.slides?.length !== 4) throw new Error('A carousel requires four slides');
    const files = [];
    for (let index = 0; index < 4; index++) files.push({ filename: `slide-${index + 1}.png`, bytes: await png(index) });
    return { filename: 'carousel-4-slides.zip', contentType: 'application/zip', bytes: zipFiles(files) };
  }
  return { filename: `${format}.png`, contentType: 'image/png', bytes: await png(0) };
}
