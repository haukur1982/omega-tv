/**
 * Review helpers for machine-translated devotionals — client-safe (no imports).
 *
 * Three jobs:
 *   1. flag paragraphs worth a second look (defect classes actually observed
 *      in the snapshot, not hypothetical ones)
 *   2. check reviewer-locked terminology across a collection
 *   3. word-level diff, so an accepted suggestion shows what it changed
 */

export type FlagKind =
    | 'bare-ref'
    | 'foreign'
    | 'untranslated'
    | 'length'
    | 'empty'
    | 'quotes'
    | 'spacing'
    | 'term';

export interface Flag {
    kind: FlagKind;
    label: string;
    hint: string;
}

export interface GlossaryTerm {
    term_en: string;
    term_is: string;
    variants_is?: string[];
}

/** English Bible-version names that leaked through untranslated. */
const VERSION_NAMES =
    /\b(Weymouth|King James|KJV|NIV|NASB|Amplified|ESV|RSV|Young'?s|Darby|Wuest|Moffatt|Phillips|Message)\b/i;

/** Quote that ends in a bare chapter:verse — the book name was dropped. */
const BARE_REF = /[“"”]\s*\d+:\d+(?:-\d+)?\s*$/;

/** Characters that only appear in Icelandic — a cheap "did this translate" probe. */
const ICELANDIC_CHARS = /[þðæöáíóúéýÞÐÆÖÁÍÓÚÉÝ]/;

/** Straight ASCII quotes where Icelandic typography wants „ and “. */
const STRAIGHT_QUOTES = /"[^"]{3,}"/;

/** Doubled spaces or space before punctuation — machine-output tells. */
const BAD_SPACING = /( {2,}| [,.;:!?])/;

function escapeRe(s: string): string {
    return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/** Word-boundary-ish match that survives Icelandic inflection endings. */
function containsTerm(haystack: string, term: string): boolean {
    if (!term.trim()) return false;
    const stem = term.trim().replace(/(inn|ins|num|ina|nir|na|ur|ar|um|i|s)$/i, '');
    const probe = stem.length >= 4 ? stem : term.trim();
    return new RegExp(`(^|[^\\p{L}])${escapeRe(probe)}`, 'iu').test(haystack);
}

export function flagParagraph(
    is: string,
    en?: string,
    glossary: GlossaryTerm[] = [],
): Flag[] {
    const flags: Flag[] = [];
    const isText = (is ?? '').trim();
    const enText = (en ?? '').trim();

    if (!isText) {
        return [{ kind: 'empty', label: 'Tóm', hint: 'Málsgreinin er tóm.' }];
    }

    if (BARE_REF.test(isText)) {
        flags.push({
            kind: 'bare-ref',
            label: 'Ritningarstaður',
            hint: 'Tilvitnun endar á kafla:versi án bókarheitis.',
        });
    }

    const version = isText.match(VERSION_NAMES);
    if (version) {
        flags.push({
            kind: 'foreign',
            label: `Enskt heiti: ${version[0]}`,
            hint: 'Heiti enskrar biblíuþýðingar skilaði sér óþýtt.',
        });
    }

    if (enText && isText === enText) {
        flags.push({
            kind: 'untranslated',
            label: 'Óþýtt',
            hint: 'Textinn er samhljóða enska frumtextanum.',
        });
    } else if (isText.length > 40 && !ICELANDIC_CHARS.test(isText)) {
        flags.push({
            kind: 'untranslated',
            label: 'Engir íslenskir stafir',
            hint: 'Löng málsgrein án íslenskra sérstafa — mögulega óþýdd.',
        });
    }

    if (STRAIGHT_QUOTES.test(isText)) {
        flags.push({
            kind: 'quotes',
            label: 'Beinar gæsalappir',
            hint: 'Notaðu íslenskar gæsalappir („ og “) í stað beinna.',
        });
    }

    if (BAD_SPACING.test(isText)) {
        flags.push({
            kind: 'spacing',
            label: 'Bil',
            hint: 'Tvöfalt bil eða bil á undan greinarmerki.',
        });
    }

    if (enText && isText) {
        const ratio = isText.length / enText.length;
        if (ratio < 0.55 || ratio > 1.9) {
            flags.push({
                kind: 'length',
                label: ratio < 0.55 ? 'Mun styttri' : 'Mun lengri',
                hint: 'Lengd víkur mikið frá frumtexta — gæti vantað eða verið aukið við.',
            });
        }
    }

    // Terminology: the English source uses a locked term, so the Icelandic
    // should carry the agreed rendering (or one of its accepted variants).
    if (enText) {
        for (const t of glossary) {
            if (!t.term_en || !t.term_is) continue;
            if (!containsTerm(enText, t.term_en)) continue;
            const accepted = [t.term_is, ...(t.variants_is ?? [])];
            if (accepted.some((a) => containsTerm(isText, a))) continue;
            flags.push({
                kind: 'term',
                label: `Hugtak: ${t.term_is}`,
                hint: `Frumtextinn notar „${t.term_en}“ — samþykkt þýðing er „${t.term_is}“.`,
            });
        }
    }

    return flags;
}

export function flagPiece(
    bodyIs: string[],
    bodyEn: string[],
    glossary: GlossaryTerm[] = [],
): Flag[][] {
    return bodyIs.map((p, i) => flagParagraph(p, bodyEn[i], glossary));
}

/* ── word-level diff ───────────────────────────────────────────────────── */

export interface DiffPart {
    text: string;
    added?: boolean;
    removed?: boolean;
}

/**
 * Word-level diff via longest common subsequence. Small inputs (one
 * paragraph), so the O(n·m) table is fine and the result is exact — which
 * matters when the reviewer is deciding whether a suggestion changed meaning
 * or only phrasing.
 */
export function diffWords(before: string, after: string): DiffPart[] {
    const a = before.split(/(\s+)/).filter(Boolean);
    const b = after.split(/(\s+)/).filter(Boolean);

    const m = a.length;
    const n = b.length;
    const lcs: number[][] = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
    for (let i = m - 1; i >= 0; i--) {
        for (let j = n - 1; j >= 0; j--) {
            lcs[i][j] = a[i] === b[j] ? lcs[i + 1][j + 1] + 1 : Math.max(lcs[i + 1][j], lcs[i][j + 1]);
        }
    }

    const out: DiffPart[] = [];
    const push = (text: string, kind?: 'added' | 'removed') => {
        const last = out[out.length - 1];
        const same =
            last &&
            !!last.added === (kind === 'added') &&
            !!last.removed === (kind === 'removed');
        if (same) last.text += text;
        else out.push({ text, ...(kind ? { [kind]: true } : {}) });
    };

    let i = 0;
    let j = 0;
    while (i < m && j < n) {
        if (a[i] === b[j]) { push(a[i]); i++; j++; }
        else if (lcs[i + 1][j] >= lcs[i][j + 1]) { push(a[i], 'removed'); i++; }
        else { push(b[j], 'added'); j++; }
    }
    while (i < m) { push(a[i], 'removed'); i++; }
    while (j < n) { push(b[j], 'added'); j++; }
    return out;
}

/** True when the two texts differ by more than whitespace. */
export function isDifferent(a: string, b: string): boolean {
    return a.replace(/\s+/g, ' ').trim() !== b.replace(/\s+/g, ' ').trim();
}
