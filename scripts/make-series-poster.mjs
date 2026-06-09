/**
 * make-series-poster.mjs — symbolic series key art (the "H2" recipe).
 *
 * Takes one strong symbolic photograph (the show's "soul" image) and produces
 * branded key art in the two aspects the site uses:
 *   - 2:3  1000×1500 → series.poster_vertical
 *   - 4:5  1000×1250 → series.poster_horizontal (what SeriesShelf renders)
 *
 * Treatment (locked with Hawk 2026-06-09, Vonarljós candle): warm soft-light
 * wash + halo at the light source + bottom scrim + Ω/Fraunces type block.
 *
 * Usage: node scripts/make-series-poster.mjs <configKey> [outDir]
 * Configs live in SERIES below — add one per show.
 */
import sharp from 'sharp';
import { Resvg } from '@resvg/resvg-js';
import path from 'path';
import { fileURLToPath } from 'url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const FONT_DIR = path.join(ROOT, 'src/assets/poster-fonts');
const FONT_FILES = ['Fraunces.ttf', 'Newsreader.ttf', 'Newsreader-Italic.ttf', 'Inter.ttf']
  .map(f => path.join(FONT_DIR, f));

const C = { kerti: '#E9A860', gull: '#C88A3E', ljos: '#F6F2EA', moskva: '#B9B2A6' };

/** One entry per show. source = the symbolic master photo. */
const SERIES = {
  vonarljos: {
    source: path.join(ROOT, 'design/poster-sources/vonarljos-kerti-marc-ignacio-unsplash.jpg'),
    title: 'Vonarljós',
    tagline: 'Orð vonar inn í íslenskan veruleika',
    host: 'MEÐ EIRÍKI SIGURBJÖRNSSYNI',
    // centered 2:3 crop locked on the candle (source 4330×5773)
    crop2x3: { left: 255, top: 0, width: 3849, height: 5773 },
    crop4x5: { left: 0, top: 0, width: 4330, height: 5412 },
    grade: { sat: 1.06, bright: 1.07, warmAlpha: 0.6 },   // = H2
    haloCy: 0.30,
  },
};

const svgToPng = (svg, width) => new Resvg(svg, {
  font: { fontFiles: FONT_FILES, loadSystemFonts: false, defaultFontFamily: 'Fraunces' },
  fitTo: { mode: 'width', value: width },
}).render().asPng();

function overlay(W, H, cfg, t) {
  // t = type-block baselines for this aspect
  return `<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="s" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="rgba(11,9,8,0.10)"/>
      <stop offset="0.45" stop-color="rgba(11,9,8,0)"/>
      <stop offset="0.62" stop-color="rgba(11,9,8,0.45)"/>
      <stop offset="0.80" stop-color="rgba(11,9,8,0.90)"/>
      <stop offset="1" stop-color="rgba(11,9,8,1)"/>
    </linearGradient>
    <radialGradient id="halo" cx="0.5" cy="${cfg.haloCy}" r="0.46">
      <stop offset="0" stop-color="rgba(233,168,96,0.18)"/>
      <stop offset="1" stop-color="rgba(233,168,96,0)"/>
    </radialGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#halo)"/>
  <rect width="${W}" height="${H}" fill="url(#s)"/>
  <text x="${W / 2}" y="${t.omega}" text-anchor="middle" font-family="Fraunces" font-size="84" font-weight="600" fill="${C.gull}">&#937;</text>
  <text x="${W / 2}" y="${t.title}" text-anchor="middle" font-family="Fraunces" font-size="118" font-weight="400" letter-spacing="-2" fill="${C.ljos}">${cfg.title}</text>
  <text x="${W / 2}" y="${t.tagline}" text-anchor="middle" font-family="Newsreader" font-style="italic" font-size="33" fill="${C.moskva}">${cfg.tagline}</text>
  <line x1="${W / 2 - 26}" y1="${t.dash}" x2="${W / 2 + 26}" y2="${t.dash}" stroke="${C.gull}" stroke-width="2"/>
  <text x="${W / 2}" y="${t.host}" text-anchor="middle" font-family="Inter" font-size="23" font-weight="600" letter-spacing="5" fill="#E7DECF">${cfg.host}</text>
</svg>`;
}

async function render(cfg, crop, W, H, t, out) {
  const warmLayer = await sharp({
    create: { width: W, height: H, channels: 4, background: { r: 233, g: 168, b: 96, alpha: cfg.grade.warmAlpha } },
  }).png().toBuffer();
  const base = await sharp(cfg.source)
    .extract(crop)
    .resize(W, H, { fit: 'cover' })
    .modulate({ saturation: cfg.grade.sat, brightness: cfg.grade.bright })
    .composite([{ input: warmLayer, blend: 'soft-light' }])
    .toBuffer();
  await sharp(base)
    .composite([{ input: svgToPng(overlay(W, H, cfg, t), W), top: 0, left: 0 }])
    .jpeg({ quality: 92, mozjpeg: true })
    .toFile(out);
  console.log('wrote', out);
}

const key = process.argv[2];
const outDir = process.argv[3] || '/tmp/poster-out';
const cfg = SERIES[key];
if (!cfg) {
  console.error(`Unknown series "${key}". Available: ${Object.keys(SERIES).join(', ')}`);
  process.exit(1);
}
await sharp({ create: { width: 1, height: 1, channels: 3, background: '#000' } }).toBuffer(); // warm sharp up
await import('fs').then(fs => fs.promises.mkdir(outDir, { recursive: true }));

await render(cfg, cfg.crop2x3, 1000, 1500,
  { omega: 1148, title: 1262, tagline: 1330, dash: 1374, host: 1424 },
  path.join(outDir, `${key}_poster_2x3.jpg`));
await render(cfg, cfg.crop4x5, 1000, 1250,
  { omega: 898, title: 1012, tagline: 1080, dash: 1124, host: 1174 },
  path.join(outDir, `${key}_poster_4x5.jpg`));
