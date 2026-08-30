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

/* ── a suggestion, cut into the small edits it actually proposes ────────── */

/**
 * One small change: a run of words to lift out, a run to put in their place,
 * anchored to where the removed run starts in the CURRENT text.
 *
 * A suggestion is not one paragraph-sized decision — it is five to ten little
 * ones, and the reviewer wants them one at a time, mixed freely across
 * registers. Hence an edit, not an option, is the unit that gets a button.
 */
export interface Edit {
    /** Word index in the current text where the removed run starts. */
    at: number;
    /** The words this edit expects to still find there — the anchor. */
    removed: string[];
    /** The words that take their place. */
    added: string[];
}

/** The word array every `Edit.at` is indexed against. */
function wordsOf(text: string): string[] {
    return text.split(/\s+/).filter(Boolean);
}

/**
 * Cut a suggestion into its individual edits.
 *
 * Whitespace-only stretches of agreement must NOT close an edit: the diff
 * walker can emit `removed "orð"`, `same " "`, `added "orðið"`, and treating
 * that as two edits would offer the reviewer a deletion and an insertion where
 * he is really being offered one substitution.
 */
export function groupEdits(current: string, suggestion: string): Edit[] {
    const parts = diffWords(current, suggestion);
    const edits: Edit[] = [];
    let at = 0;
    let open: Edit | null = null;

    for (const part of parts) {
        const w = wordsOf(part.text);
        if (part.added) {
            if (!open) open = { at, removed: [], added: [] };
            open.added.push(...w);
        } else if (part.removed) {
            if (!open) open = { at, removed: [], added: [] };
            open.removed.push(...w);
            at += w.length;
        } else {
            if (w.length === 0) continue;
            if (open) { edits.push(open); open = null; }
            at += w.length;
        }
    }
    if (open) edits.push(open);

    return edits.filter((e) => e.removed.length > 0 || e.added.length > 0);
}

/**
 * Apply one edit to the current text, or refuse.
 *
 * The anchor is checked before anything is written: if the removed run is no
 * longer sitting at that word position — he typed in the paragraph, or took a
 * chip that overlapped this one — the edit is stale and `null` comes back, so
 * the caller can drop the chip instead of corrupting the paragraph.
 *
 * Words are rejoined with single spaces. The corpus is plain Icelandic prose
 * and „gæsalappir“ are already part of the word tokens, so nothing here needs
 * to be clever about punctuation.
 */
export function applyEdit(current: string, edit: Edit): string | null {
    const words = wordsOf(current);
    const { at, removed, added } = edit;
    if (at < 0 || at + removed.length > words.length) return null;
    for (let k = 0; k < removed.length; k++) {
        if (words[at + k] !== removed[k]) return null;
    }
    return [
        ...words.slice(0, at),
        ...added,
        ...words.slice(at + removed.length),
    ].join(' ');
}
