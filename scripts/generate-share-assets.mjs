// Regenerates the committed favicon and sharing image. Run after changing
// Mai's name or the chosen photo: node scripts/generate-share-assets.mjs
import { readFile, writeFile } from 'node:fs/promises';
import { create } from 'fontkitten';
import sharp from 'sharp';

const NAME = 'Quynh Mai Vu';
const PHOTO = 'src/assets/photos/mai-garden-portrait.jpeg';
const color = {
  canvas: '#f1e9e5',
  paper: '#fcfaf7',
  ink: '#39463e',
  accent: '#93616d',
};

const font = create(
  await readFile('public/fonts/dm-serif-display-latin-400-normal.woff2'),
);

// Outlines keep the assets independent of fonts installed where they render.
function outline(text, size, x, baseline) {
  const scale = size / font.unitsPerEm;
  let cursor = x;
  const paths = [...text].map((character) => {
    const glyph = font.glyphForCodePoint(character.codePointAt(0));
    const d = glyph.path
      .scale(scale, -scale)
      .translate(cursor, baseline)
      .toSVG();
    cursor += glyph.advanceWidth * scale;
    return d;
  });
  return { d: paths.join(' '), end: cursor };
}

async function favicon() {
  const m = outline('m', 46, 7, 45);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="12" fill="${color.canvas}"/><path fill="${color.ink}" d="${m.d}"/><circle cx="${(m.end + 4).toFixed(1)}" cy="41.5" r="3.5" fill="${color.accent}"/></svg>\n`;
  await writeFile('public/favicon.svg', svg);
  const render = (size, file) =>
    sharp(Buffer.from(svg), { density: 72 * (size / 64) * 4 })
      .resize(size, size)
      .png()
      .toFile(file);
  await render(32, 'public/favicon-32.png');
  // iOS draws its own corner mask and shows transparency as black.
  await sharp(Buffer.from(svg), { density: 72 * 12 })
    .resize(180, 180)
    .flatten({ background: color.canvas })
    .png()
    .toFile('public/apple-touch-icon.png');
}

async function socialCard() {
  const [width, height] = [1200, 630];
  const photoWidth = 390;
  const photoHeight = 520;
  const border = 12;
  const rotation = 3;
  const photo = await sharp(PHOTO)
    .rotate()
    .resize(photoWidth, photoHeight)
    .toBuffer();
  const frame = await sharp({
    create: {
      width: photoWidth + border * 2,
      height: photoHeight + border * 2,
      channels: 4,
      background: color.paper,
    },
  })
    .composite([{ input: photo, left: border, top: border }])
    .png()
    .toBuffer();
  const tilted = await sharp(frame)
    .rotate(rotation, { background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();
  const size = await sharp(tilted).metadata();
  const left = 800 - Math.round(size.width / 2) + 80;
  const top = Math.round((height - size.height) / 2);
  const shadow = await sharp({
    create: {
      width,
      height,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    },
  })
    .composite([{ input: tilted, left, top: top + 14 }])
    .png()
    .toBuffer()
    .then((layer) =>
      sharp(layer)
        .tint(color.ink)
        .linear([1, 1, 1, 0.22], [0, 0, 0, 0])
        .blur(18)
        .png()
        .toBuffer(),
    );
  const name = outline(NAME, 80, 80, 348);
  const text = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}"><rect x="80" y="244" width="48" height="2" fill="${color.accent}"/><path fill="${color.ink}" d="${name.d}"/></svg>`;
  await sharp({
    create: { width, height, channels: 3, background: color.canvas },
  })
    .composite([
      { input: Buffer.from(text), left: 0, top: 0 },
      { input: shadow, left: 0, top: 0 },
      { input: tilted, left, top },
    ])
    .jpeg({ quality: 86, mozjpeg: true })
    .toFile('public/social-card.jpg');
  console.log(`name ends at x=${Math.round(name.end)}, photo left=${left}`);
}

await favicon();
await socialCard();
