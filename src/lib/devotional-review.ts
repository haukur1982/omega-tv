/**
 * Review flags for machine-translated devotionals — client-safe (no imports).
 *
 * These are the defect classes actually observed in the Wade Taylor snapshot,
 * not hypothetical ones. Each flag points the reviewer at a paragraph worth
 * a second look, so 43 paragraphs don't have to be read at equal attention.
 */

export type FlagKind = 'bare-ref' | 'foreign' | 'untranslated' | 'length' | 'empty';

export interface Flag {
    kind: FlagKind;
    label: string;
    hint: string;
}

/** English Bible-version names that leaked through untranslated. */
const VERSION_NAMES = /\b(Weymouth|King James|KJV|NIV|NASB|Amplified|ESV|RSV|Young'?s|Darby|Wuest|Moffatt|Phillips)\b/i;

/** Quote that ends in a bare chapter:verse — the book name was dropped. */
const BARE_REF = /[“"”]\s*\d+:\d+(?:-\d+)?\s*$/;

/** Characters that only appear in Icelandic — a cheap "did this translate" probe. */
const ICELANDIC_CHARS = /[þðæöáíóúéýÞÐÆÖÁÍÓÚÉÝ]/;

export function flagParagraph(is: string, en?: string): Flag[] {
    const flags: Flag[] = [];
    const isText = (is ?? '').trim();
    const enText = (en ?? '').trim();

    if (!isText) {
        flags.push({ kind: 'empty', label: 'Tóm', hint: 'Málsgreinin er tóm.' });
        return flags;
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

    return flags;
}

export function flagPiece(bodyIs: string[], bodyEn: string[]): Flag[][] {
    return bodyIs.map((p, i) => flagParagraph(p, bodyEn[i]));
}

export function countFlags(bodyIs: string[], bodyEn: string[]): number {
    return flagPiece(bodyIs, bodyEn).filter((f) => f.length > 0).length;
}
