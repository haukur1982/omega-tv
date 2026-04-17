import { supabase } from './supabase';

/**
 * ═══════════════════════════════════════════════════════════════════
 * OSIS passage helpers
 *
 * All Bible references in the database are stored as OSIS canonical
 * strings (e.g. "MAT.5.3-MAT.5.10"). See plan §7 + §10 ("Highest risk:
 * passage-reference drift"). The autocomplete admin widget guarantees
 * writes are canonical; everywhere that reads refs uses these helpers
 * to parse and display them.
 *
 * Phase 2 keeps this list small. When the full Bible import lands,
 * swap OSIS_BOOKS for a generated constant.
 * ═══════════════════════════════════════════════════════════════════
 */

// OSIS book code → Icelandic/English display names.
// Source: Biblían (1981) book titles + OSIS 2.1.1 spec.
export const OSIS_BOOKS: Record<string, { is: string; en: string }> = {
    // Old Testament
    GEN: { is: 'Fyrsta Mósebók', en: 'Genesis' },
    EXO: { is: 'Önnur Mósebók', en: 'Exodus' },
    LEV: { is: 'Þriðja Mósebók', en: 'Leviticus' },
    NUM: { is: 'Fjórða Mósebók', en: 'Numbers' },
    DEU: { is: 'Fimmta Mósebók', en: 'Deuteronomy' },
    JOS: { is: 'Jósúabók', en: 'Joshua' },
    JDG: { is: 'Dómarabókin', en: 'Judges' },
    RUT: { is: 'Rutarbók', en: 'Ruth' },
    '1SA': { is: 'Fyrri Samúelsbók', en: '1 Samuel' },
    '2SA': { is: 'Seinni Samúelsbók', en: '2 Samuel' },
    '1KI': { is: 'Fyrri Konungabók', en: '1 Kings' },
    '2KI': { is: 'Seinni Konungabók', en: '2 Kings' },
    '1CH': { is: 'Fyrri Kroníkubók', en: '1 Chronicles' },
    '2CH': { is: 'Seinni Kroníkubók', en: '2 Chronicles' },
    EZR: { is: 'Esrabók', en: 'Ezra' },
    NEH: { is: 'Nehemíabók', en: 'Nehemiah' },
    EST: { is: 'Esterarbók', en: 'Esther' },
    JOB: { is: 'Jobsbók', en: 'Job' },
    PSA: { is: 'Sálmarnir', en: 'Psalms' },
    PRO: { is: 'Orðskviðirnir', en: 'Proverbs' },
    ECC: { is: 'Prédikarinn', en: 'Ecclesiastes' },
    SNG: { is: 'Ljóðaljóðin', en: 'Song of Songs' },
    ISA: { is: 'Jesajabók', en: 'Isaiah' },
    JER: { is: 'Jeremíabók', en: 'Jeremiah' },
    LAM: { is: 'Harmljóðin', en: 'Lamentations' },
    EZK: { is: 'Esekíelsbók', en: 'Ezekiel' },
    DAN: { is: 'Daníelsbók', en: 'Daniel' },
    HOS: { is: 'Hóseabók', en: 'Hosea' },
    JOL: { is: 'Jóelsbók', en: 'Joel' },
    AMO: { is: 'Amosbók', en: 'Amos' },
    OBA: { is: 'Óbadíabók', en: 'Obadiah' },
    JON: { is: 'Jónabók', en: 'Jonah' },
    MIC: { is: 'Míka', en: 'Micah' },
    NAM: { is: 'Nahúmsbók', en: 'Nahum' },
    HAB: { is: 'Habakkuk', en: 'Habakkuk' },
    ZEP: { is: 'Sefaníabók', en: 'Zephaniah' },
    HAG: { is: 'Haggaí', en: 'Haggai' },
    ZEC: { is: 'Sakaríabók', en: 'Zechariah' },
    MAL: { is: 'Malakíbók', en: 'Malachi' },
    // New Testament
    MAT: { is: 'Matteus', en: 'Matthew' },
    MRK: { is: 'Markús', en: 'Mark' },
    LUK: { is: 'Lúkas', en: 'Luke' },
    JHN: { is: 'Jóhannes', en: 'John' },
    ACT: { is: 'Postulasagan', en: 'Acts' },
    ROM: { is: 'Rómverjabréfið', en: 'Romans' },
    '1CO': { is: 'Fyrra Korintubréf', en: '1 Corinthians' },
    '2CO': { is: 'Seinna Korintubréf', en: '2 Corinthians' },
    GAL: { is: 'Galatabréfið', en: 'Galatians' },
    EPH: { is: 'Efesusbréfið', en: 'Ephesians' },
    PHP: { is: 'Filippíbréfið', en: 'Philippians' },
    COL: { is: 'Kólossubréfið', en: 'Colossians' },
    '1TH': { is: 'Fyrra Þessaloníkubréf', en: '1 Thessalonians' },
    '2TH': { is: 'Seinna Þessaloníkubréf', en: '2 Thessalonians' },
    '1TI': { is: 'Fyrra Tímóteusarbréf', en: '1 Timothy' },
    '2TI': { is: 'Seinna Tímóteusarbréf', en: '2 Timothy' },
    TIT: { is: 'Títusarbréfið', en: 'Titus' },
    PHM: { is: 'Fílemonsbréfið', en: 'Philemon' },
    HEB: { is: 'Hebreabréfið', en: 'Hebrews' },
    JAS: { is: 'Jakobsbréfið', en: 'James' },
    '1PE': { is: 'Fyrra Pétursbréf', en: '1 Peter' },
    '2PE': { is: 'Seinna Pétursbréf', en: '2 Peter' },
    '1JN': { is: 'Fyrra Jóhannesarbréf', en: '1 John' },
    '2JN': { is: 'Seinna Jóhannesarbréf', en: '2 John' },
    '3JN': { is: 'Þriðja Jóhannesarbréf', en: '3 John' },
    JUD: { is: 'Júdasarbréfið', en: 'Jude' },
    REV: { is: 'Opinberunarbókin', en: 'Revelation' },
};

export interface ParsedPassage {
    canonical: string;     // input, echoed back
    book: string;          // OSIS book code, e.g. "MAT"
    startChapter: number;
    startVerse?: number;
    endChapter?: number;
    endVerse?: number;
    bookDisplayIs: string;
    bookDisplayEn: string;
}

/**
 * Parse an OSIS canonical passage ref into its parts.
 *
 * Accepts:
 *   BOOK.CH                        → Psalm 23
 *   BOOK.CH.V                      → John 3:16
 *   BOOK.CH.V-BOOK.CH.V            → Matt 5:3–10
 *   BOOK.CH.V-CH.V                 → Matt 5:3–6:2 (compact form)
 *
 * Returns null on any parse error — callers should handle missing data.
 */
export function parseOsis(ref: string | null | undefined): ParsedPassage | null {
    if (!ref) return null;
    const trimmed = ref.trim();
    if (!trimmed) return null;

    const [start, end] = trimmed.split('-');

    // Start side
    const startParts = start.split('.');
    if (startParts.length < 2) return null;
    const book = startParts[0].toUpperCase();
    const startChapter = parseInt(startParts[1], 10);
    if (isNaN(startChapter)) return null;
    const startVerse = startParts[2] ? parseInt(startParts[2], 10) : undefined;

    // End side (optional)
    let endChapter: number | undefined;
    let endVerse: number | undefined;
    if (end) {
        const endParts = end.split('.');
        if (endParts.length === 3) {
            // MAT.5.10 — full qualifier
            endChapter = parseInt(endParts[1], 10);
            endVerse = parseInt(endParts[2], 10);
        } else if (endParts.length === 2) {
            // 5.10 — chapter.verse within same book (compact)
            endChapter = parseInt(endParts[0], 10);
            endVerse = parseInt(endParts[1], 10);
        } else if (endParts.length === 1) {
            // 10 — verse within same chapter
            endVerse = parseInt(endParts[0], 10);
            endChapter = startChapter;
        }
    }

    const bookInfo = OSIS_BOOKS[book] ?? { is: book, en: book };

    return {
        canonical: trimmed,
        book,
        startChapter,
        startVerse,
        endChapter,
        endVerse,
        bookDisplayIs: bookInfo.is,
        bookDisplayEn: bookInfo.en,
    };
}

/**
 * Render a parsed passage as an Icelandic display string.
 *
 *   MAT.5.3-MAT.5.10 → "Matteus 5:3–10"
 *   PSA.23           → "Sálmarnir 23"
 *   JHN.3.16         → "Jóhannes 3:16"
 */
export function displayPassageIs(ref: string | null | undefined): string {
    const p = parseOsis(ref);
    if (!p) return '';

    let out = p.bookDisplayIs + ' ' + p.startChapter;
    if (p.startVerse !== undefined) {
        out += ':' + p.startVerse;
        if (p.endVerse !== undefined) {
            if (p.endChapter !== undefined && p.endChapter !== p.startChapter) {
                out += '–' + p.endChapter + ':' + p.endVerse;
            } else if (p.endVerse !== p.startVerse) {
                out += '–' + p.endVerse;
            }
        }
    } else if (p.endChapter !== undefined && p.endChapter !== p.startChapter) {
        out += '–' + p.endChapter;
    }
    return out;
}

export function displayPassageEn(ref: string | null | undefined): string {
    const p = parseOsis(ref);
    if (!p) return '';
    let out = p.bookDisplayEn + ' ' + p.startChapter;
    if (p.startVerse !== undefined) {
        out += ':' + p.startVerse;
        if (p.endVerse !== undefined) {
            if (p.endChapter !== undefined && p.endChapter !== p.startChapter) {
                out += '–' + p.endChapter + ':' + p.endVerse;
            } else if (p.endVerse !== p.startVerse) {
                out += '–' + p.endVerse;
            }
        }
    } else if (p.endChapter !== undefined && p.endChapter !== p.startChapter) {
        out += '–' + p.endChapter;
    }
    return out;
}

// ═══════════════════════════════════════════════════════════════════
// Passage rendering — pulls full text from bible_passages table
// ═══════════════════════════════════════════════════════════════════
export type BiblePassage = {
    ref_canonical: string;
    ref_display_is: string;
    ref_display_en: string | null;
    text_is: string | null;
    text_en: string | null;
    cross_refs: string[];
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const untyped = supabase as any;

/**
 * Fetch the full passage text for an OSIS ref.
 * Returns null if the passage isn't in the seed/import yet —
 * callers render a graceful fallback with just the display ref.
 */
export async function getBiblePassage(
    ref: string | null | undefined,
): Promise<BiblePassage | null> {
    if (!ref) return null;
    const { data, error } = await untyped
        .from('bible_passages')
        .select('ref_canonical, ref_display_is, ref_display_en, text_is, text_en, cross_refs')
        .eq('ref_canonical', ref)
        .maybeSingle();
    if (error || !data) return null;
    return data as BiblePassage;
}
