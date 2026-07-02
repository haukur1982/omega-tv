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

mkdirSync(OUT_DIR, { recursive: true });
writeFileSync(path.join(OUT_DIR, 'omega-profile.png'), render(profileSvg, 1024));
writeFileSync(path.join(OUT_DIR, 'omega-cover.png'), render(coverSvg, 1640));
console.log('✓ design/facebook/omega-profile.png (1024×1024)');
console.log('✓ design/facebook/omega-cover.png (1640×720)');
