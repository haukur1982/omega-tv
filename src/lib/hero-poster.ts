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

const W = 1000;
const H = 1500;

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

    // 1) Photo layer: composed 2:3 crop biased to the top (head/torso in upper
    //    two-thirds), graded warm + cinematic.
    const up = await sharp(sourceImage).resize({ width: 2000 }).toBuffer();
    const meta = await sharp(up).metadata();
    const srcW = meta.width ?? 2000;
    const srcH = meta.height ?? 1125;
    const cropW = Math.min(srcW, Math.round(srcH * (2 / 3)));
    const cropLeft = Math.max(0, Math.round((srcW - cropW) / 2));
    const photo = await sharp(up)
        .extract({ left: cropLeft, top: 0, width: cropW, height: srcH })
        .resize(W, H, { fit: 'cover', position: 'top' })
        .modulate({ saturation: 1.12, brightness: 1.06 })
        .linear(1.12, -(128 * 0.12))
        .gamma(1.05)
        .tint({ r: 255, g: 244, b: 230 })
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
      <stop offset="70%" stop-color="#2a1c0f" stop-opacity="0.40"/>
      <stop offset="86%" stop-color="#7a5326" stop-opacity="0.72"/>
      <stop offset="100%" stop-color="#a06e30" stop-opacity="0.95"/>
    </linearGradient>
    <radialGradient id="glow" cx="50%" cy="100%" r="60%">
      <stop offset="0%" stop-color="#F0BE7C" stop-opacity="0.6"/>
      <stop offset="45%" stop-color="#E9A860" stop-opacity="0.18"/>
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
  <rect x="-120" y="780" width="${W + 240}" height="${H - 500}" fill="url(#glow)"/>
  <rect width="${W}" height="${H}" fill="url(#edge)"/>

  <g transform="translate(${W / 2 - 44}, 72)">
    <circle cx="44" cy="44" r="40" fill="none" stroke="#F6F2EA" stroke-width="4.5"/>
    <text x="44" y="74" text-anchor="middle" font-family="Fraunces" font-size="72" font-weight="700" fill="#F6F2EA">&#937;</text>
  </g>
  <text x="${W / 2}" y="218" text-anchor="middle" font-family="Inter" font-size="22" font-weight="600" letter-spacing="9" fill="#E7DECF">${esc(kicker)}</text>

  <text x="${W / 2}" y="1230" text-anchor="middle" font-family="Fraunces" font-size="${tFs}" font-weight="300" letter-spacing="-2" fill="#F6F2EA">${esc(title)}</text>
  ${tagline ? `<text x="${W / 2}" y="1292" text-anchor="middle" font-family="Newsreader" font-style="italic" font-size="35" fill="#F5DFC0">${esc(tagline)}</text>` : ''}
  ${host ? `<line x1="${W / 2 - 70}" y1="1340" x2="${W / 2 + 70}" y2="1340" stroke="#C88A3E" stroke-width="2"/>
  <text x="${W / 2}" y="1392" text-anchor="middle" font-family="Inter" font-size="25" font-weight="600" letter-spacing="5" fill="#F0E5D4">${esc(host.toUpperCase())}</text>` : ''}
</svg>`;

    const overlayPng = new Resvg(overlay, {
        font: { fontFiles: FONT_FILES, loadSystemFonts: false, defaultFontFamily: 'Newsreader' },
        fitTo: { mode: 'width', value: W },
    }).render().asPng();

    return sharp(photo).composite([{ input: overlayPng, top: 0, left: 0 }]).png().toBuffer();
}
