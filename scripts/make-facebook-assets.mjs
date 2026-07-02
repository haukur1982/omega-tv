/**
 * scripts/make-facebook-assets.mjs
 *
 * Facebook page facelift — renders the brand assets for
 * facebook.com/Omegasjonvarp from the design-system SVGs:
 *
 *   design/facebook/omega-profile.png   1024×1024  (displays circular)
 *   design/facebook/omega-cover.png     1640×720   (820×360 @2x — safe for
 *                                                   desktop 820×312 AND
 *                                                   mobile 640×360 crops)
 *
 * Same rendering stack as make-seo-images.mjs: Resvg + the repo's brand
 * TTFs (src/assets/poster-fonts), no system fonts, so the ΩMEGA wordmark
 * renders in real Fraunces everywhere.
 *
 * Run: node scripts/make-facebook-assets.mjs
 */
import { Resvg } from '@resvg/resvg-js';
import sharp from 'sharp';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const FONT_DIR = path.join(ROOT, 'src/assets/poster-fonts');
const OUT_DIR = path.join(ROOT, 'design/facebook');
const SKILL_ASSETS = path.join(
    process.env.HOME,
    '.claude/skills/omega-stodin-design/assets',
);

const fonts = [
    path.join(FONT_DIR, 'Fraunces.ttf'),
    path.join(FONT_DIR, 'Inter.ttf'),
    path.join(FONT_DIR, 'Newsreader.ttf'),
];

const render = (svg, w) =>
    new Resvg(svg, {
        font: { fontFiles: fonts, loadSystemFonts: false, defaultFontFamily: 'Inter' },
        fitTo: { mode: 'width', value: w },
    }).render().asPng();

// ── Profile picture ────────────────────────────────────────────────────
// The Ω mark (from omega-mark.svg geometry) in candle-amber on night,
// sized to ~62% of the canvas so it survives Facebook's circular crop.
const MARK_SIZE = 640; // px of 1024
const MARK_OFFSET = (1024 - MARK_SIZE) / 2;
const MARK_SCALE = MARK_SIZE / 240;

const profileSvg = `
<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024">
  <rect width="1024" height="1024" fill="#14120F"/>
  <g transform="translate(${MARK_OFFSET}, ${MARK_OFFSET}) scale(${MARK_SCALE})" color="#E9A860">
    <defs>
      <mask id="omega-cut" maskUnits="userSpaceOnUse">
        <rect width="240" height="240" fill="white"/>
        <rect x="0" y="202" width="240" height="6" fill="black"/>
      </mask>
    </defs>
    <g mask="url(#omega-cut)">
      <circle cx="120" cy="120" r="104" stroke="currentColor" stroke-width="22" fill="none"/>
      <text x="120" y="202" fill="currentColor" font-family="'Fraunces', 'Newsreader', Georgia, serif" font-size="235" font-weight="700" text-anchor="middle">&#937;</text>
    </g>
  </g>
</svg>`;

// ── Cover photo ────────────────────────────────────────────────────────
// The design-system cover as-is (820×360 canvas designed to survive both
// the desktop 820×312 and mobile 640×360 crops), rendered at 2×.
const coverSvg = readFileSync(path.join(SKILL_ASSETS, 'facebook-cover.svg'), 'utf8');

// ── Photographic cover ─────────────────────────────────────────────────
// The village photo (public/heimakirkja/hero.jpg — homes gathered by the
// sea, a path leading in: kirkjan heim til þjóðarinnar). Cropped to the
// cover ratio keeping the houses band, gently warmed toward the brand,
// dark scrim along the bottom carrying the lockup + tagline inside the
// mobile-safe zone (x 180–1460 at 2×).
async function makePhotoCover() {
    const W = 1640, H = 720;
    const SRC = path.join(ROOT, 'public/heimakirkja/hero.jpg');
    const meta = await sharp(SRC).metadata();

    // Crop to 2.278:1 — bias downward so we drop empty sky, keep houses.
    let cw = meta.width, ch = Math.round(meta.width / (W / H));
    let left = 0, top = 0;
    if (ch <= meta.height) {
        top = Math.round((meta.height - ch) * 0.7);
    } else {
        ch = meta.height;
        cw = Math.round(meta.height * (W / H));
        left = Math.round((meta.width - cw) / 2);
    }

    const base = await sharp(SRC)
        .extract({ left, top, width: cw, height: ch })
        .resize(W, H)
        .modulate({ brightness: 0.97, saturation: 0.86 })
        // Warm it slightly toward the palette: lift red, ease blue.
        .linear([1.04, 1.0, 0.94], [0, 0, 0])
        .toBuffer();

    const overlaySvg = `
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <linearGradient id="scrim" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0.30" stop-color="#14120F" stop-opacity="0"/>
      <stop offset="0.68" stop-color="#14120F" stop-opacity="0.55"/>
      <stop offset="1" stop-color="#14120F" stop-opacity="0.92"/>
    </linearGradient>
    <radialGradient id="pool" cx="0.22" cy="0.78" r="0.6">
      <stop offset="0" stop-color="#14120F" stop-opacity="0.55"/>
      <stop offset="1" stop-color="#14120F" stop-opacity="0"/>
    </radialGradient>
    <mask id="cut" maskUnits="userSpaceOnUse">
      <rect x="-20" y="-20" width="280" height="280" fill="white"/>
      <rect x="0" y="202" width="240" height="6" fill="black"/>
    </mask>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#scrim)"/>
  <rect width="${W}" height="${H}" fill="url(#pool)"/>
  <g transform="translate(180, 412) scale(0.76)" color="#E9A860">
    <g mask="url(#cut)">
      <circle cx="120" cy="120" r="104" stroke="currentColor" stroke-width="22" fill="none"/>
      <text x="120" y="202" fill="currentColor" font-family="'Fraunces', Georgia, serif" font-size="235" font-weight="700" text-anchor="middle">&#937;</text>
    </g>
    <text x="248" y="212" fill="currentColor" font-family="'Fraunces', Georgia, serif" font-size="235" font-weight="700" letter-spacing="-0.005em">MEGA</text>
  </g>
  <text x="184" y="656" fill="#F6F2EA" font-family="Inter, sans-serif" font-size="30" font-weight="600" letter-spacing="0.24em">LJÓS INN Á HEIMILI ÍSLENDINGA</text>
  <text x="1456" y="668" fill="#B9B2A6" font-family="Inter, sans-serif" font-size="20" font-weight="600" letter-spacing="0.22em" text-anchor="end">SÍÐAN 1992 · OMEGA.IS</text>
</svg>`;

    const overlay = new Resvg(overlaySvg, {
        font: { fontFiles: fonts, loadSystemFonts: false, defaultFontFamily: 'Inter' },
        fitTo: { mode: 'width', value: W },
    }).render().asPng();

    const out = await sharp(base)
        .composite([{ input: overlay }])
        .png()
        .toBuffer();
    writeFileSync(path.join(OUT_DIR, 'omega-cover-photo.png'), out);
}

mkdirSync(OUT_DIR, { recursive: true });
writeFileSync(path.join(OUT_DIR, 'omega-profile.png'), render(profileSvg, 1024));
writeFileSync(path.join(OUT_DIR, 'omega-cover.png'), render(coverSvg, 1640));
await makePhotoCover();
console.log('✓ design/facebook/omega-profile.png (1024×1024)');
console.log('✓ design/facebook/omega-cover.png (1640×720, typographic)');
console.log('✓ design/facebook/omega-cover-photo.png (1640×720, village)');
