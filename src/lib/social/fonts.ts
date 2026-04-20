/**
 * src/lib/social/fonts.ts
 *
 * Loads font files from @fontsource packages for server-side Satori
 * rendering.
 *
 * IMPORTANT: Google Fonts splits font families into subsets that
 * DON'T OVERLAP. The `latin` subset contains basic A-Z/a-z/0-9 + common
 * punctuation. The `latin-ext` subset contains Icelandic/European
 * extensions (þ, ð, æ, ö, ý, etc.). We MUST load both and register
 * them with Satori — if we only load latin-ext, basic Latin letters
 * show up as "NO GLYPH" boxes because those characters aren't in that
 * subset.
 *
 * Satori's font resolution iterates through the fonts array looking
 * for each character's glyph. Register both subsets with the same
 * name/weight/style and Satori will use whichever has each glyph.
 *
 * Fonts are loaded once at module init and cached in memory.
 */

import { readFileSync } from 'fs';
import { join } from 'path';
import type { SatoriOptions } from 'satori';

function loadFontFile(pkg: string, basename: string): Buffer {
    const path = join(process.cwd(), 'node_modules', '@fontsource', pkg, 'files', `${basename}.woff`);
    return readFileSync(path);
}

// ═══════════════════════════════════════════════════════════════════
// Source Serif 4 — latin + latin-ext subsets, weights 400 and 700
// ═══════════════════════════════════════════════════════════════════

// Weight 300 — the "Vaka" display weight per brand guide §2, used for
// hero-level Scripture verses and display headlines.
const SRCSERIF_300_LATIN     = loadFontFile('source-serif-4', 'source-serif-4-latin-300-normal');
const SRCSERIF_300_LATIN_EXT = loadFontFile('source-serif-4', 'source-serif-4-latin-ext-300-normal');

const SRCSERIF_400_LATIN     = loadFontFile('source-serif-4', 'source-serif-4-latin-400-normal');
const SRCSERIF_400_LATIN_EXT = loadFontFile('source-serif-4', 'source-serif-4-latin-ext-400-normal');
const SRCSERIF_400_GREEK     = loadFontFile('source-serif-4', 'source-serif-4-greek-400-normal');
const SRCSERIF_700_LATIN     = loadFontFile('source-serif-4', 'source-serif-4-latin-700-normal');
const SRCSERIF_700_LATIN_EXT = loadFontFile('source-serif-4', 'source-serif-4-latin-ext-700-normal');
const SRCSERIF_700_GREEK     = loadFontFile('source-serif-4', 'source-serif-4-greek-700-normal');

// ═══════════════════════════════════════════════════════════════════
// Libre Baskerville — 400 regular, 400 italic, 700 bold
// ═══════════════════════════════════════════════════════════════════

const LBASK_400_LATIN         = loadFontFile('libre-baskerville', 'libre-baskerville-latin-400-normal');
const LBASK_400_LATIN_EXT     = loadFontFile('libre-baskerville', 'libre-baskerville-latin-ext-400-normal');
const LBASK_400_IT_LATIN      = loadFontFile('libre-baskerville', 'libre-baskerville-latin-400-italic');
const LBASK_400_IT_LATIN_EXT  = loadFontFile('libre-baskerville', 'libre-baskerville-latin-ext-400-italic');
const LBASK_700_LATIN         = loadFontFile('libre-baskerville', 'libre-baskerville-latin-700-normal');
const LBASK_700_LATIN_EXT     = loadFontFile('libre-baskerville', 'libre-baskerville-latin-ext-700-normal');

// ═══════════════════════════════════════════════════════════════════
// Inter — 600 semibold
// ═══════════════════════════════════════════════════════════════════

const INTER_600_LATIN     = loadFontFile('inter', 'inter-latin-600-normal');
const INTER_600_LATIN_EXT = loadFontFile('inter', 'inter-latin-ext-600-normal');

// ═══════════════════════════════════════════════════════════════════
// Satori font array — both subsets registered per font/weight/style.
// Order matters for fallback: latin first (more common glyphs),
// then latin-ext (Icelandic/European extensions).
// ═══════════════════════════════════════════════════════════════════

export const SATORI_FONTS: SatoriOptions['fonts'] = [
    // Source Serif 4 Light / Vaka (weight 300) — Scripture hero, display
    { name: 'Source Serif 4', data: SRCSERIF_300_LATIN,     weight: 300, style: 'normal' },
    { name: 'Source Serif 4', data: SRCSERIF_300_LATIN_EXT, weight: 300, style: 'normal' },

    // Source Serif 4 Regular — basic Latin, Icelandic, Greek (for Ω)
    { name: 'Source Serif 4', data: SRCSERIF_400_LATIN,     weight: 400, style: 'normal' },
    { name: 'Source Serif 4', data: SRCSERIF_400_LATIN_EXT, weight: 400, style: 'normal' },
    { name: 'Source Serif 4', data: SRCSERIF_400_GREEK,     weight: 400, style: 'normal' },

    // Source Serif 4 Bold — basic Latin, Icelandic, Greek (for Ω watermark)
    { name: 'Source Serif 4', data: SRCSERIF_700_LATIN,     weight: 700, style: 'normal' },
    { name: 'Source Serif 4', data: SRCSERIF_700_LATIN_EXT, weight: 700, style: 'normal' },
    { name: 'Source Serif 4', data: SRCSERIF_700_GREEK,     weight: 700, style: 'normal' },

    // Libre Baskerville Regular
    { name: 'Libre Baskerville', data: LBASK_400_LATIN,     weight: 400, style: 'normal' },
    { name: 'Libre Baskerville', data: LBASK_400_LATIN_EXT, weight: 400, style: 'normal' },

    // Libre Baskerville Italic
    { name: 'Libre Baskerville', data: LBASK_400_IT_LATIN,     weight: 400, style: 'italic' },
    { name: 'Libre Baskerville', data: LBASK_400_IT_LATIN_EXT, weight: 400, style: 'italic' },

    // Libre Baskerville Bold
    { name: 'Libre Baskerville', data: LBASK_700_LATIN,     weight: 700, style: 'normal' },
    { name: 'Libre Baskerville', data: LBASK_700_LATIN_EXT, weight: 700, style: 'normal' },

    // Inter SemiBold
    { name: 'Inter', data: INTER_600_LATIN,     weight: 600, style: 'normal' },
    { name: 'Inter', data: INTER_600_LATIN_EXT, weight: 600, style: 'normal' },
];
