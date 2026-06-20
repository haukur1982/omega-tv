import sharp from 'sharp';
import { Resvg } from '@resvg/resvg-js';
import path from 'node:path';

/**
 * Hero Poster generator — premium 2:3 (1000×1500) series key art.
 *
 * Takes a full-resolution source frame + title/tagline/host and produces
 * Netflix/Apple-TV-tier key art: graded photo composited into the Omega
 * dark→amber light treatment with a Fraunces title, italic Newsreader tagline,
 * gold rule, host name, and the Ω mark.
 *
 * Quality depends on the SOURCE being full-res (1920×1080), not the 640px
 * poster candidate — see fetchFullResFrame in lib/bunny-frame.ts. The grade +
 * gradient make a clean still read as designed art.
 */

const FONT_DIR = path.join(process.cwd(), 'src/assets/poster-fonts');
const FONT_FILES = [
    path.join(FONT_DIR, 'Fraunces.ttf'),
    path.join(FONT_DIR, 'Newsreader.ttf'),
    path.join(FONT_DIR, 'Newsreader-Italic.ttf'),
    path.join(FONT_DIR, 'Inter.ttf'),
];

/**
 * Color themes — so shows don't all look identical. Each is an on-brand "mood":
 * the photo always grades into a dark→colour wash at the bottom where the title
 * sits, but the colour of that wash + glow + photo tint changes per theme.
 * Background stays warm-black; --blod red (LIVE dot) is never used here.
 */
export interface PosterTheme {
    /** bottom wash gradient stops (top→bottom of the lower band) */
    wash: [string, string, string];
    /** the soft glow rising from the bottom */
    glow: string;
    /** photo tint (subtle colour cast on the still) */
    tint: { r: number; g: number; b: number };
    /** the short rule line above the host name */
    rule: string;
    /** tagline colour (sits on the wash) */
    tagline: string;
}

export const POSTER_THEMES: Record<string, PosterTheme> = {
    // Candle amber — the Omega signature (warm, default).
    kerti: {
        wash: ['rgba(42,28,15,0.40)', 'rgba(122,83,38,0.72)', 'rgba(160,110,48,0.95)'],
        glow: '#F0BE7C', tint: { r: 255, g: 244, b: 230 }, rule: '#C88A3E', tagline: '#F5DFC0',
    },
    // Nordic night — deep indigo blue, cool and still.
    nott: {
        wash: ['rgba(20,22,34,0.42)', 'rgba(40,54,84,0.74)', 'rgba(60,82,120,0.95)'],
        glow: '#8FB8E0', tint: { r: 232, g: 240, b: 255 }, rule: '#6FA5D8', tagline: '#CFE0F2',
    },
    // Aurora — teal/green northern lights. Distinctly Icelandic.
    aurora: {
        wash: ['rgba(18,34,30,0.42)', 'rgba(29,80,72,0.72)', 'rgba(47,125,106,0.95)'],
        glow: '#8FE0C8', tint: { r: 234, g: 248, b: 243 }, rule: '#7FCAB0', tagline: '#CDEFE2',
    },
    // Ember — deep bronze/burnt-orange, richer and darker than candle.
    glod: {
        wash: ['rgba(46,24,16,0.44)', 'rgba(106,52,24,0.76)', 'rgba(154,83,32,0.96)'],
        glow: '#E8915A', tint: { r: 255, g: 238, b: 224 }, rule: '#C8702E', tagline: '#F3D2B5',
    },
    // Stone — muted warm taupe, soft and gentle (lower saturation).
    skira: {
        wash: ['rgba(42,38,32,0.42)', 'rgba(90,80,72,0.72)', 'rgba(138,125,110,0.94)'],
        glow: '#D8C8B0', tint: { r: 246, g: 242, b: 234 }, rule: '#C88A3E', tagline: '#E7DCCB',
    },
};

const THEME_ORDER = ['kerti', 'nott', 'aurora', 'glod', 'skira'] as const;
export type PosterThemeName = (typeof THEME_ORDER)[number];

/** Deterministically pick a theme from a string (so each series varies, stably). */
export function themeForKey(key: string): PosterThemeName {
    let h = 0;
    for (let i = 0; i < key.length; i++) h = (h * 31 + key.charCodeAt(i)) >>> 0;
    return THEME_ORDER[h % THEME_ORDER.length];
}

export interface HeroPosterInput {
    /** Full-res source frame (JPEG/PNG buffer). Use the 1920×1080 frame, not a 640px candidate. */
    sourceImage: Buffer;
    /** Series/episode title — the big Fraunces line. */
    title: string;
    /** Optional italic tagline under the title. */
    tagline?: string;
    /** Optional host/speaker name (small caps at the bottom). */
    host?: string;
    /** Kicker above the mark. Defaults to "OMEGA STÖÐIN". */
    kicker?: string;
    /** Colour theme. Omitted → auto-picked from the title so shows differ. */
    theme?: PosterThemeName;
    /**
     * Trim this fraction off the BOTTOM of the source before composing — removes
     * burned-in Icelandic subtitles and promo/phone-number lower-thirds (common
     * on translated third-party broadcasts). 0.13 ≈ the subtitle band. Default 0.
     */
    trimBottomPct?: number;
    /** Output width in px. Default 1000. */
    width?: number;
    /** Output height in px. Default 1500 (2:3). Use 1250 for a 4:5 shelf poster. */
    height?: number;
    /** Horizontal crop bias 0..1 (0 left, 0.5 centre, 1 right) — aim the crop at an off-centre subject. Default 0.5. */
    focusX?: number;
    /** Brightness multiplier for dark stage/worship footage (lifts shadows too). 1 = default grade. ~1.5 for dim services. */
    brightnessBoost?: number;
}

function esc(s: string): string {
    return s
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

/** Pick a title font-size that fits the width (rough fit; Fraunces light). */
function titleFontSize(title: string): number {
    const n = title.length;
    if (n <= 9) return 150;
    if (n <= 13) return 118;
    if (n <= 18) return 92;
    if (n <= 26) return 70;
    return 56;
}

export async function generateHeroPoster(input: HeroPosterInput): Promise<Buffer> {
    const { sourceImage, title, tagline, host, kicker = 'OMEGA STÖÐIN' } = input;
    const theme = POSTER_THEMES[input.theme ?? themeForKey(title)] ?? POSTER_THEMES.kerti;
    const W = input.width ?? 1000;
    const H = input.height ?? 1500;
    const focusX = Math.max(0, Math.min(1, input.focusX ?? 0.5));
    const boost = Math.max(1, input.brightnessBoost ?? 1);

    // 1) Photo layer: crop biased to the top (head/torso in the upper band) and to
    //    focusX horizontally, graded cinematic with the theme's colour tint. For
    //    dark worship footage, brightnessBoost lifts the figure out of the shadow.
    const up = await sharp(sourceImage).resize({ width: 2000 }).toBuffer();
    const meta = await sharp(up).metadata();
    const srcW = meta.width ?? 2000;
    const srcHfull = meta.height ?? 1125;
    // Trim the bottom band (burned subtitles / promo lower-thirds) if asked.
    const trim = Math.max(0, Math.min(0.4, input.trimBottomPct ?? 0));
    const srcH = Math.round(srcHfull * (1 - trim));
    const cropW = Math.min(srcW, Math.round(srcH * (W / H)));
    const cropLeft = Math.max(0, Math.min(srcW - cropW, Math.round((srcW - cropW) * focusX)));
    // When boosting dark footage, lift shadows (positive offset) instead of crushing them.
    const linSlope = boost > 1 ? 1.04 : 1.12;
    const linOffset = boost > 1 ? 6 * boost : -(128 * 0.12);
    const photo = await sharp(up)
        .extract({ left: cropLeft, top: 0, width: cropW, height: srcH })
        .resize(W, H, { fit: 'cover', position: 'top' })
        .modulate({ saturation: 1.12, brightness: 1.06 * boost })
        .linear(linSlope, linOffset)
        .gamma(1.05)
        .tint(theme.tint)
        .toBuffer();

    // 2) Branded overlay (transparent where the photo should show).
    const tFs = titleFontSize(title);
    const stars = [[120, 140, 1.2], [300, 90, 1.0], [820, 170, 1.3], [900, 260, 1.1], [200, 250, 0.9]]
        .map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="#F6F2EA" opacity="${0.16 + (r as number) * 0.1}"/>`)
        .join('');

    const overlay = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <linearGradient id="topdark" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#14120F" stop-opacity="0.78"/>
      <stop offset="22%" stop-color="#14120F" stop-opacity="0.30"/>
      <stop offset="42%" stop-color="#14120F" stop-opacity="0"/>
    </linearGradient>
    <linearGradient id="botwarm" x1="0" y1="0" x2="0" y2="1">
      <stop offset="50%" stop-color="#14120F" stop-opacity="0"/>
      <stop offset="70%" stop-color="${theme.wash[0]}"/>
      <stop offset="86%" stop-color="${theme.wash[1]}"/>
      <stop offset="100%" stop-color="${theme.wash[2]}"/>
    </linearGradient>
    <radialGradient id="glow" cx="50%" cy="100%" r="60%">
      <stop offset="0%" stop-color="${theme.glow}" stop-opacity="0.6"/>
      <stop offset="45%" stop-color="${theme.glow}" stop-opacity="0.18"/>
      <stop offset="72%" stop-color="#14120F" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="edge" cx="50%" cy="44%" r="72%">
      <stop offset="62%" stop-color="#14120F" stop-opacity="0"/>
      <stop offset="100%" stop-color="#14120F" stop-opacity="0.55"/>
    </radialGradient>
  </defs>

  <g>${stars}</g>
  <rect width="${W}" height="${H}" fill="url(#topdark)"/>
  <rect width="${W}" height="${H}" fill="url(#botwarm)"/>
  <rect x="-120" y="${Math.round(H * 0.52)}" width="${W + 240}" height="${H - 500}" fill="url(#glow)"/>
  <rect width="${W}" height="${H}" fill="url(#edge)"/>

  <g transform="translate(${W / 2 - 44}, 72)">
    <circle cx="44" cy="44" r="40" fill="none" stroke="#F6F2EA" stroke-width="4.5"/>
    <text x="44" y="74" text-anchor="middle" font-family="Fraunces" font-size="72" font-weight="700" fill="#F6F2EA">&#937;</text>
  </g>
  <text x="${W / 2}" y="218" text-anchor="middle" font-family="Inter" font-size="22" font-weight="600" letter-spacing="9" fill="#E7DECF">${esc(kicker)}</text>

  <text x="${W / 2}" y="${H - 270}" text-anchor="middle" font-family="Fraunces" font-size="${tFs}" font-weight="300" letter-spacing="-2" fill="#F6F2EA">${esc(title)}</text>
  ${tagline ? `<text x="${W / 2}" y="${H - 208}" text-anchor="middle" font-family="Newsreader" font-style="italic" font-size="35" fill="${theme.tagline}">${esc(tagline)}</text>` : ''}
  ${host ? `<line x1="${W / 2 - 70}" y1="${H - 160}" x2="${W / 2 + 70}" y2="${H - 160}" stroke="${theme.rule}" stroke-width="2"/>
  <text x="${W / 2}" y="${H - 108}" text-anchor="middle" font-family="Inter" font-size="25" font-weight="600" letter-spacing="5" fill="#F0E5D4">${esc(host.toUpperCase())}</text>` : ''}
</svg>`;

    const overlayPng = new Resvg(overlay, {
        font: { fontFiles: FONT_FILES, loadSystemFonts: false, defaultFontFamily: 'Newsreader' },
        fitTo: { mode: 'width', value: W },
    }).render().asPng();

    return sharp(photo).composite([{ input: overlayPng, top: 0, left: 0 }]).png().toBuffer();
}
