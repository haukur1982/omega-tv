/**
 * scripts/mine-corrections.ts
 *
 * Close the flywheel. Every save in the reading room records what the reviewer
 * changed (`recordCorrections`), and the suggester reads the most recent pairs
 * back as examples of taste. That is memory, but it is not a rule: nothing
 * turns "he has fixed this same word eleven times" into something the machine
 * is not allowed to get wrong again.
 *
 * This script does that. It reads every correction, cuts each before/after
 * pair into word-level substitutions with the same `groupEdits`/`diffWords`
 * the editor's chips use, and keeps any substitution seen in at least two
 * DIFFERENT paragraphs. Those candidates go two ways:
 *
 *   term-like (1–3 words, one stable rendering)  → proposed glossary entries
 *   phrasing-like (longer, or stylistic)         → src/lib/translation-rules/mined.ts
 *
 * NOTHING is written without a flag. A dry run only prints.
 *
 * Run:
 *   npx tsx scripts/mine-corrections.ts                  # dry run, prints the report
 *   npx tsx scripts/mine-corrections.ts --write-rules    # regenerate mined.ts
 *   npx tsx scripts/mine-corrections.ts --apply          # upsert proposed glossary terms
 *   npx tsx scripts/mine-corrections.ts --apply --pick 2 # ...only candidate #2
 *
 * Flags: --min N (default 2 paragraphs) · --max-rules N (default 40)
 */
import { writeFileSync } from 'node:fs';
import path from 'node:path';
import { config } from 'dotenv';
import { groupEdits } from '../src/lib/devotional-review';
import { listCorrections, listGlossary, upsertGlossaryTerm } from '../src/lib/devotional-db';

config({ path: '.env.local' });

if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error('❌ Missing Supabase credentials in .env.local');
    process.exit(1);
}

const argv = process.argv.slice(2);
const has = (name: string) => argv.includes(name);
const num = (name: string, fallback: number) => {
    const i = argv.indexOf(name);
    const v = i > -1 ? Number(argv[i + 1]) : NaN;
    return Number.isFinite(v) ? v : fallback;
};

const MIN_PARAGRAPHS = num('--min', 2);
const MAX_RULES = num('--max-rules', 40);
const PICK = num('--pick', 0); // 1-based index into the term proposals; 0 = all
const APPLY = has('--apply');
const WRITE_RULES = has('--write-rules');

const RULES_FILE = path.join(process.cwd(), 'src/lib/translation-rules/mined.ts');

/* ── shaping a substitution ────────────────────────────────────────────── */

/** Punctuation at the ends is packaging, not the substitution. */
const EDGE_PUNCT = /^[^\p{L}\p{N}]+|[^\p{L}\p{N}]+$/gu;
const HAS_LETTER = /\p{L}/u;

function norm(s: string): string {
    return s.toLowerCase().replace(EDGE_PUNCT, '').replace(/\s+/g, ' ').trim();
}
function words(s: string): number {
    return s.split(/\s+/).filter(Boolean).length;
}

interface Bucket {
    fromKey: string;
    toKey: string;
    /** Surface forms as they actually appeared, with counts, so the report quotes real text. */
    fromSurface: Map<string, number>;
    toSurface: Map<string, number>;
    hits: number;
    paragraphs: Set<string>;
    sourcesEn: string[];
}

function commonest(m: Map<string, number>): string {
    let best = '';
    let n = -1;
    for (const [k, v] of m) if (v > n) { best = k; n = v; }
    return best;
}

/* ── the English anchor for a proposed glossary term ───────────────────── */

/**
 * A mined substitution is Icelandic → Icelandic, but the glossary is
 * English → Icelandic: flagParagraph looks for the English term in the source
 * and then demands the agreed Icelandic. So a proposal needs an anchor — the
 * English word that was present every time the reviewer made this change.
 *
 * Common words are useless as anchors ("the", "which", "God" in a devotional),
 * so a candidate must also be rare across the corpus.
 */
const EN_STOP = new Set([
    'about', 'after', 'again', 'against', 'because', 'been', 'before', 'being', 'between',
    'both', 'came', 'come', 'could', 'does', 'doing', 'down', 'each', 'even', 'ever',
    'every', 'from', 'have', 'having', 'here', 'him', 'himself', 'his', 'how', 'into',
    'itself', 'just', 'know', 'like', 'made', 'make', 'many', 'more', 'most', 'much',
    'must', 'never', 'not', 'now', 'only', 'other', 'our', 'out', 'over', 'own', 'said',
    'same', 'say', 'shall', 'she', 'should', 'since', 'some', 'such', 'take', 'than',
    'that', 'their', 'them', 'then', 'there', 'these', 'they', 'thing', 'things', 'this',
    'those', 'through', 'time', 'unto', 'upon', 'very', 'was', 'way', 'well', 'were',
    'what', 'when', 'where', 'which', 'while', 'who', 'will', 'with', 'would', 'you',
    'your', 'yourself',
]);

function enTokens(text: string): Set<string> {
    const out = new Set<string>();
    for (const raw of text.toLowerCase().split(/[^a-z']+/)) {
        const w = raw.replace(/^'+|'+$/g, '');
        if (w.length < 4 || EN_STOP.has(w)) continue;
        out.add(w);
    }
    return out;
}

function englishAnchor(
    sources: string[],
    df: Map<string, number>,
    corpus: number,
): { term: string; shared: number } | null {
    const usable = sources.filter((s) => s && s.trim());
    if (usable.length < 2) return null;

    const sets = usable.map(enTokens);
    let shared = [...sets[0]];
    for (const s of sets.slice(1)) shared = shared.filter((w) => s.has(w));
    // Rare words carry the terminology; a word in a third of the corpus does not.
    const ranked = shared
        .filter((w) => (df.get(w) ?? 0) / Math.max(1, corpus) <= 0.35)
        .sort((a, b) => (df.get(a) ?? 0) - (df.get(b) ?? 0) || b.length - a.length);
    if (ranked.length === 0) return null;
    return { term: ranked[0], shared: usable.length };
}

/* ── the generated rules file ──────────────────────────────────────────── */

interface Rule { from: string; to: string; hits: number; paragraphs: number }

function renderRulesFile(rules: Rule[], corrections: number): string {
    const stamp = new Date().toISOString().slice(0, 10);
    const body = rules.length === 0
        ? '[];\n'
        : `[\n${rules
            .map((r) =>
                `    { from: ${JSON.stringify(r.from)}, to: ${JSON.stringify(r.to)}, ` +
                `hits: ${r.hits}, paragraphs: ${r.paragraphs} },`)
            .join('\n')}\n];\n`;

    return `// Generated by scripts/mine-corrections.ts — do not edit by hand.
// Re-run the script after a stretch of reviewing and commit the diff.
//
// Phrasing the reviewer has replaced at least twice, in different paragraphs,
// mined out of devotional_corrections. This is style, not terminology: single
// terms belong in the glossary (devotional_glossary), where flagParagraph can
// check them; the turn of a sentence belongs here, where the suggester reads it.
//
// Cross-system: BookForge consumes rules separately. This file is the hand-off
// artifact and nothing here reaches ~/Projects/book-system automatically.
//
// Source: ${corrections} corrections, mined ${stamp}.

export interface MinedRule {
    /** The phrasing the reviewer keeps replacing. */
    from: string;
    /** What he replaces it with. */
    to: string;
    /** How many corrections showed this substitution. */
    hits: number;
    /** In how many distinct paragraphs — the reason it is a rule and not a one-off. */
    paragraphs: number;
}

/** Most-frequent first, so a caller that caps the list keeps the strongest. */
export const MINED_RULES: MinedRule[] = ${body}`;
}

/* ── run ───────────────────────────────────────────────────────────────── */

async function main() {
    const rows = await listCorrections();
    console.log(`\nNámuvinnsla · devotional_corrections`);
    if (rows.length === 0) {
        console.log('→ engar leiðréttingar skráðar enn — ekkert að nema.\n');
        return;
    }

    const pieces = new Set(rows.map((r) => r.devotional_id));
    const paragraphs = new Set(rows.map((r) => `${r.devotional_id}:${r.paragraph_index}`));

    // Document frequency of every English word across the corrected paragraphs.
    const df = new Map<string, number>();
    let corpus = 0;
    for (const r of rows) {
        if (!r.source_en) continue;
        corpus++;
        for (const w of enTokens(r.source_en)) df.set(w, (df.get(w) ?? 0) + 1);
    }

    const buckets = new Map<string, Bucket>();
    let substitutions = 0;

    for (const r of rows) {
        for (const edit of groupEdits(r.before_is, r.after_is)) {
            // A substitution has two sides. Pure insertions and deletions are
            // real edits but they are not rules — they depend on the sentence.
            if (edit.removed.length === 0 || edit.added.length === 0) continue;
            const from = edit.removed.join(' ');
            const to = edit.added.join(' ');
            const fromKey = norm(from);
            const toKey = norm(to);
            if (!fromKey || !toKey || fromKey === toKey) continue;
            if (!HAS_LETTER.test(fromKey) && !HAS_LETTER.test(toKey)) continue;
            substitutions++;

            const key = `${fromKey} ${toKey}`;
            let b = buckets.get(key);
            if (!b) {
                b = {
                    fromKey, toKey,
                    fromSurface: new Map(), toSurface: new Map(),
                    hits: 0, paragraphs: new Set(), sourcesEn: [],
                };
                buckets.set(key, b);
            }
            b.hits++;
            b.paragraphs.add(`${r.devotional_id}:${r.paragraph_index}`);
            b.fromSurface.set(from, (b.fromSurface.get(from) ?? 0) + 1);
            b.toSurface.set(to, (b.toSurface.get(to) ?? 0) + 1);
            if (r.source_en) b.sourcesEn.push(r.source_en);
        }
    }

    // How often each left-hand side was corrected at all — a term is only a
    // term if one rendering wins; two competing renderings mean it is context.
    const fromTotals = new Map<string, number>();
    for (const b of buckets.values()) {
        fromTotals.set(b.fromKey, (fromTotals.get(b.fromKey) ?? 0) + b.hits);
    }

    const candidates = [...buckets.values()]
        .filter((b) => b.paragraphs.size >= MIN_PARAGRAPHS)
        .sort((a, b) => b.hits - a.hits || b.paragraphs.size - a.paragraphs.size);

    const isTermLike = (b: Bucket) => {
        const from = commonest(b.fromSurface);
        const to = commonest(b.toSurface);
        if (words(from) > 3 || words(to) > 3) return false;
        if (!HAS_LETTER.test(from) || !HAS_LETTER.test(to)) return false;
        const share = b.hits / Math.max(1, fromTotals.get(b.fromKey) ?? b.hits);
        return share >= 0.7;
    };

    const terms = candidates.filter(isTermLike);
    const phrasings = candidates.filter((b) => !isTermLike(b));

    console.log(`→ ${rows.length} leiðréttingar · ${paragraphs.size} málsgreinar · ${pieces.size} hugleiðingar`);
    console.log(`→ ${substitutions} orðaskipti dregin út (groupEdits/diffWords)`);
    console.log(`→ ${candidates.length} endurtekin í ≥${MIN_PARAGRAPHS} ólíkum málsgreinum`);
    console.log(`   hugtakalík: ${terms.length} · orðalagslík: ${phrasings.length}`);

    /* ── term proposals ── */
    const proposals = terms.map((b) => {
        const from = commonest(b.fromSurface);
        const to = commonest(b.toSurface);
        return { b, from, to, anchor: englishAnchor(b.sourcesEn, df, corpus) };
    });

    if (proposals.length > 0) {
        console.log(`\nHUGTÖK — tillögur í hugtakaskrá (${APPLY ? 'verða vistaðar' : 'aðeins prentaðar'}):`);
        proposals.forEach((p, i) => {
            console.log(
                `${String(i + 1).padStart(2)}. „${p.from}“ → „${p.to}“   ` +
                `${p.b.hits}× í ${p.b.paragraphs.size} málsgreinum`,
            );
            console.log(
                p.anchor
                    ? `    enskt akkeri: „${p.anchor.term}“ (í öllum ${p.anchor.shared} frumtextunum)`
                    : `    ekkert öruggt enskt akkeri — ekki hægt að setja í hugtakaskrá sjálfvirkt`,
            );
        });
    }

    /* ── phrasing rules ── */
    const rules: Rule[] = phrasings.slice(0, MAX_RULES).map((b) => ({
        from: commonest(b.fromSurface),
        to: commonest(b.toSurface),
        hits: b.hits,
        paragraphs: b.paragraphs.size,
    }));

    if (rules.length > 0) {
        console.log(`\nORÐALAG — reglur fyrir src/lib/translation-rules/mined.ts:`);
        rules.forEach((r, i) => {
            console.log(
                `${String(i + 1).padStart(2)}. „${r.from}“ → „${r.to}“   ${r.hits}× í ${r.paragraphs} málsgreinum`,
            );
        });
    }

    if (WRITE_RULES) {
        writeFileSync(RULES_FILE, renderRulesFile(rules, rows.length), 'utf8');
        console.log(`\n✓ skrifað: ${path.relative(process.cwd(), RULES_FILE)} (${rules.length} reglur)`);
    } else {
        console.log(`\n(mined.ts óbreytt — keyrðu með --write-rules til að skrifa reglurnar.)`);
    }

    /* ── the only write that touches the database ── */
    if (!APPLY) {
        console.log('');
        return;
    }

    const chosen = proposals
        .map((p, i) => ({ ...p, n: i + 1 }))
        .filter((p) => p.anchor && (PICK === 0 || p.n === PICK));

    if (chosen.length === 0) {
        console.log('\n→ ekkert öruggt hugtak til að vista (vantar enskt akkeri, eða --pick fann ekkert).\n');
        return;
    }

    let applied = 0;
    for (const p of chosen) {
        const res = await upsertGlossaryTerm({
            term_en: p.anchor!.term,
            term_is: p.to,
            variants_is: [],
            note: `Numið úr ${p.b.hits} lagfæringum: „${p.from}“ → „${p.to}“.`,
        });
        if (res.ok) {
            applied++;
            console.log(`✓ hugtak vistað: „${p.anchor!.term}“ → „${p.to}“`);
        } else {
            console.log(`✗ „${p.anchor!.term}“: ${res.error}`);
        }
    }

    const glossary = await listGlossary();
    console.log(`\n→ vistuð hugtök: ${applied} · hugtakaskráin telur nú ${glossary.length}\n`);
}

main().catch((e) => {
    console.error('❌', e instanceof Error ? e.message : e);
    process.exit(1);
});
