// Generate the brand SEO images referenced by metadata + the Organization entity:
//   public/og-default.png  (1200x630 social card)
//   public/omega-logo.png  (512x512 square logo for the knowledge panel)
import { Resvg } from '@resvg/resvg-js';
import { writeFileSync } from 'node:fs';
import path from 'node:path';

const FONT_DIR = path.join(process.cwd(), 'src/assets/poster-fonts');
const fonts = [path.join(FONT_DIR, 'Fraunces.ttf'), path.join(FONT_DIR, 'Inter.ttf')];
const render = (svg, w) =>
    new Resvg(svg, {
        font: { fontFiles: fonts, loadSystemFonts: false, defaultFontFamily: 'Inter' },
        fitTo: { mode: 'width', value: w },
    }).render().asPng();

const og = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#1B1814"/><stop offset="100%" stop-color="#14120F"/>
    </linearGradient>
    <radialGradient id="glow" cx="50%" cy="36%" r="58%">
      <stop offset="0%" stop-color="#E8B468" stop-opacity="0.24"/>
      <stop offset="62%" stop-color="#14120F" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#bg)"/>
  <rect width="1200" height="630" fill="url(#glow)"/>
  <circle cx="600" cy="226" r="76" fill="none" stroke="#E8B468" stroke-width="6"/>
  <text x="600" y="226" text-anchor="middle" dominant-baseline="central" font-family="Fraunces" font-size="104" font-weight="700" fill="#E8B468">&#937;</text>
  <text x="600" y="392" text-anchor="middle" font-family="Fraunces" font-size="92" font-weight="600" letter-spacing="3" fill="#F6F2EA">OMEGA</text>
  <text x="600" y="452" text-anchor="middle" font-family="Inter" font-size="30" letter-spacing="1" fill="#CDBBA0">Kristin sjónvarpsstöð á Íslandi</text>
  <text x="600" y="556" text-anchor="middle" font-family="Inter" font-size="21" letter-spacing="6" fill="#8A7D6E">OMEGA.IS  ·  SÍÐAN 1992</text>
</svg>`;

const logo = `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
  <rect width="512" height="512" rx="116" fill="#1B1814"/>
  <circle cx="256" cy="248" r="132" fill="none" stroke="#E8B468" stroke-width="16"/>
  <text x="256" y="248" text-anchor="middle" dominant-baseline="central" font-family="Fraunces" font-size="188" font-weight="700" fill="#E8B468">&#937;</text>
</svg>`;

writeFileSync('public/og-default.png', render(og, 1200));
writeFileSync('public/omega-logo.png', render(logo, 512));
console.log('✅ wrote public/og-default.png (1200x630) + public/omega-logo.png (512x512)');
