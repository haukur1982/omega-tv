/**
 * scripts/warm-suggestions.ts
 *
 * Kill the mid-flow wait. The wording assistant costs a Gemini call and about
 * ten seconds, and the reviewer pays both in the middle of a paragraph. This
 * pays them beforehand, for the paragraphs that are actually flagged, and
 * stores the answer in devotional_suggestions where the suggest route finds it.
 *
 * COST GUARDS ARE THE POINT (this project has a real runaway-loop scar):
 *   · --limit N, default 80 paragraphs per run — nothing runs unbounded
 *   · skip anything already cached at the current paragraph hash
 *   · ONE retry per paragraph, then the failure is RECORDED in the cache row
 *     and never tried again on a later run (until the paragraph changes, or
 *     --retry-failed says so)
 *   · a spend summary — the number of Gemini calls — is printed at the end
 *
 * Run:
 *   npx tsx scripts/warm-suggestions.ts --dry            # what it would call
 *   npx tsx scripts/warm-suggestions.ts --limit 5        # a small real run
 *   npx tsx scripts/warm-suggestions.ts --slug dagur-06-morgunn
 *
 * Flags: --all (include pieces already marked yfirlesin) · --retry-failed
 *        --delay MS (default 1500, between calls)
 */
import { config } from 'dotenv';
import { flagParagraph } from '../src/lib/devotional-review';
import {
    listAllDevotionals, listGlossary, recentCorrections,
    listSuggestionCache, putCachedSuggestion, paragraphHash,
    type Devotional,
} from '../src/lib/devotional-db';
import {
    generateSuggestion, topMinedRules, STYLE_EXAMPLES,
    type HouseVoice, type SuggestPayload,
} from '../src/lib/devotional-suggest';

config({ path: '.env.local' });

const apiKey = process.env.GEMINI_API_KEY ?? process.env.GOOGLE_API_KEY;
if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error('❌ Missing Supabase credentials in .env.local');
    process.exit(1);
}

const argv = process.argv.slice(2);
const has = (name: string) => argv.includes(name);
const str = (name: string) => {
    const i = argv.indexOf(name);
    return i > -1 ? argv[i + 1] : undefined;
};
const num = (name: string, fallback: number) => {
    const v = Number(str(name));
    return Number.isFinite(v) ? v : fallback;
};

const LIMIT = num('--limit', 80);
const DELAY = num('--delay', 1500);
const ONLY_SLUG = str('--slug');
const INCLUDE_REVIEWED = has('--all');
const RETRY_FAILED = has('--retry-failed');
const DRY = has('--dry');

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

interface Job {
    piece: Devotional;
    index: number;
    is: string;
    en: string;
    hash: string;
    kinds: string;
}

async function main() {
    const started = Date.now();

    const [pieces, glossary, examples] = await Promise.all([
        listAllDevotionals(),
        listGlossary(),
        recentCorrections(STYLE_EXAMPLES),
    ]);
    const voice: HouseVoice = { glossary, rules: topMinedRules(), examples };

    // One read of the cache, then everything is decided in memory.
    const cache = new Map<string, { hash: string; payload: SuggestPayload }>();
    try {
        for (const row of await listSuggestionCache()) {
            cache.set(`${row.devotional_id}:${row.paragraph_index}`, {
                hash: row.body_hash,
                payload: row.suggestions,
            });
        }
    } catch (e) {
        // A real run must never start blind: without the cache it would
        // regenerate everything it has already paid for. A dry run may, since
        // it spends nothing and planning ahead of the migration is useful.
        const why = e instanceof Error ? e.message : 'óþekkt villa';
        if (!DRY) {
            console.error(`❌ devotional_suggestions er ekki lesanleg (${why}).`);
            console.error('   Keyrðu supabase/migrations/20260830_devotional_suggestions.sql fyrst.');
            process.exit(1);
        }
        console.log(`⚠ devotional_suggestions ólesanleg (${why}) — þurrkeyrsla heldur áfram með tómt skyndiminni.`);
    }

    const scope = pieces
        .filter((p) => (ONLY_SLUG ? p.slug === ONLY_SLUG : true))
        .filter((p) => (INCLUDE_REVIEWED ? true : !p.reviewed));

    let flaggedCount = 0;
    let cachedSkips = 0;
    let failedSkips = 0;
    const jobs: Job[] = [];

    for (const piece of scope) {
        piece.body_is.forEach((is, index) => {
            const en = piece.body_en?.[index] ?? '';
            const flags = flagParagraph(is, en, glossary);
            if (flags.length === 0) return;
            flaggedCount++;

            const hash = paragraphHash(is);
            const hit = cache.get(`${piece.id}:${index}`);
            if (hit && hit.hash === hash) {
                const usable = !hit.payload?.failed
                    && Array.isArray(hit.payload?.options)
                    && hit.payload.options.length > 0;
                if (usable) { cachedSkips++; return; }
                // A recorded failure. Left alone unless asked for explicitly —
                // this is the guard that stops a bad paragraph costing money
                // on every future run.
                if (!RETRY_FAILED) { failedSkips++; return; }
            }
            jobs.push({ piece, index, is, en, hash, kinds: flags.map((f) => f.kind).join(',') });
        });
    }

    const batch = jobs.slice(0, LIMIT);

    console.log(`\nForhitun tillagna · ${scope.length} hugleiðingar${INCLUDE_REVIEWED ? '' : ' (óyfirlesnar)'}`);
    console.log(`→ ${flaggedCount} flöggaðar málsgreinar`);
    console.log(`→ ${cachedSkips} þegar í skyndiminni · ${failedSkips} skráð mistök (sleppt)`);
    console.log(`→ ${jobs.length} vantar · þessi keyrsla tekur ${batch.length} (--limit ${LIMIT})`);

    if (batch.length === 0) {
        console.log('\n✓ ekkert að gera.\n');
        return;
    }

    if (DRY) {
        for (const j of batch) {
            console.log(`   ${j.piece.slug} #${j.index} [${j.kinds}] ${j.is.slice(0, 60)}…`);
        }
        console.log(`\n(þurrkeyrsla — engin Gemini köll, ekkert vistað.)\n`);
        return;
    }

    if (!apiKey) {
        console.error('❌ GEMINI_API_KEY vantar í .env.local — ekkert hægt að forhita.');
        process.exit(1);
    }

    let calls = 0;
    let stored = 0;
    const failures: string[] = [];

    for (const j of batch) {
        // One attempt, then exactly one retry. Never a third: a paragraph that
        // fails twice is recorded and left alone.
        let payload: SuggestPayload | null = null;
        let lastError = '';
        for (let attempt = 0; attempt < 2 && !payload; attempt++) {
            if (attempt > 0) await sleep(DELAY);
            calls++;
            try {
                payload = await generateSuggestion({
                    apiKey, en: j.en, is: j.is, voice,
                });
            } catch (e) {
                lastError = e instanceof Error ? e.message : 'Villa';
            }
        }

        if (payload) {
            const ok = await putCachedSuggestion(j.piece.id, j.index, j.hash, payload);
            if (ok) stored++;
            else failures.push(`${j.piece.slug} #${j.index}: skrifun mistókst`);
            console.log(`✓ ${j.piece.slug} #${j.index} [${j.kinds}] · ${payload.options.length} útgáfur`);
        } else {
            // Recorded, not retried: the row keeps the hash, so the next run
            // skips it, and an edit to the paragraph makes it eligible again.
            await putCachedSuggestion(j.piece.id, j.index, j.hash, {
                options: [], note: '', learnedFrom: 0, failed: lastError,
            });
            failures.push(`${j.piece.slug} #${j.index}: ${lastError}`);
            console.log(`✗ ${j.piece.slug} #${j.index} · ${lastError} (skráð, ekki reynt aftur)`);
        }

        await sleep(DELAY);
    }

    const secs = Math.round((Date.now() - started) / 1000);
    console.log(`\n── kostnaður ─────────────────────────────`);
    console.log(`Gemini köll:        ${calls}`);
    console.log(`vistaðar tillögur:  ${stored}`);
    console.log(`mistök skráð:       ${failures.length}`);
    console.log(`sleppt (í minni):   ${cachedSkips + failedSkips}`);
    console.log(`eftir í biðröð:     ${Math.max(0, jobs.length - batch.length)}`);
    console.log(`tími:               ${secs}s`);
    if (failures.length > 0) {
        console.log('\nmistök:');
        failures.slice(0, 10).forEach((f) => console.log('  ' + f));
    }
    console.log('');
}

main().catch((e) => {
    console.error('❌', e instanceof Error ? e.message : e);
    process.exit(1);
});
