/**
 * src/lib/social/fonts.ts
 *
 * Loads font files from @fontsource packages for server-side Satori
 * rendering. We use `latin-ext` subsets because they include Icelandic
 * diacritics (þ, ð, æ, ö, ý).
 *
 * Fonts are loaded once at module init and cached in memory — the
 * route handlers re-import this module but Node dedupes, so the
 * file reads happen once per server process.
 *
 * Satori font format requires { name, data, weight, style }.
 * See: https://github.com/vercel/satori
 */

import { readFileSync } from 'fs';
import { join } from 'path';
import type { SatoriOptions } from 'satori';

function loadFontFile(pkg: string, basename: string): Buffer {
    const path = join(process.cwd(), 'node_modules', '@fontsource', pkg, 'files', `${basename}.woff`);
    return readFileSync(path);
}

// ═══════════════════════════════════════════════════════════════════
// Font data (raw woff bytes)
// ═══════════════════════════════════════════════════════════════════

export const SOURCE_SERIF_4_REGULAR = loadFontFile('source-serif-4', 'source-serif-4-latin-ext-400-normal');
export const SOURCE_SERIF_4_BOLD    = loadFontFile('source-serif-4', 'source-serif-4-latin-ext-700-normal');

export const LIBRE_BASKERVILLE_REGULAR = loadFontFile('libre-baskerville', 'libre-baskerville-latin-ext-400-normal');
export const LIBRE_BASKERVILLE_BOLD    = loadFontFile('libre-baskerville', 'libre-baskerville-latin-ext-700-normal');
export const LIBRE_BASKERVILLE_ITALIC  = loadFontFile('libre-baskerville', 'libre-baskerville-latin-ext-400-italic');

export const INTER_SEMIBOLD = loadFontFile('inter', 'inter-latin-ext-600-normal');

// ═══════════════════════════════════════════════════════════════════
// Satori-shaped fonts list
// Pass this to `satori(element, { fonts: SATORI_FONTS, ... })`
// ═══════════════════════════════════════════════════════════════════

export const SATORI_FONTS: SatoriOptions['fonts'] = [
    { name: 'Source Serif 4', data: SOURCE_SERIF_4_REGULAR, weight: 400, style: 'normal' },
    { name: 'Source Serif 4', data: SOURCE_SERIF_4_BOLD,    weight: 700, style: 'normal' },

    { name: 'Libre Baskerville', data: LIBRE_BASKERVILLE_REGULAR, weight: 400, style: 'normal' },
    { name: 'Libre Baskerville', data: LIBRE_BASKERVILLE_BOLD,    weight: 700, style: 'normal' },
    { name: 'Libre Baskerville', data: LIBRE_BASKERVILLE_ITALIC,  weight: 400, style: 'italic' },

    { name: 'Inter', data: INTER_SEMIBOLD, weight: 600, style: 'normal' },
];
