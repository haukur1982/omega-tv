/**
 * scripts/clean-prayer-junk.ts
 *
 * One-shot cleanup of the public Bænatorg feed:
 *
 *   1. Repair UTF-8 mojibake. Any approved prayer whose content or
 *      topic contains the mojibake markers √ or ‚Ä is run through a
 *      fixed find/replace table mapping the corruption back to
 *      proper Icelandic characters. Idempotent — re-running on
 *      already-clean rows is a no-op.
 *
 *   2. Find exact duplicate prayer content (after trim + lowercase)
 *      and unapprove the newer copies — keep the oldest one approved,
 *      hide the rest from the feed without deleting.
 *
 * Usage:
 *   pnpm exec tsx --env-file=.env.local scripts/clean-prayer-junk.ts
 *
 * Read-only first pass available via DRY=1 env var.
 */

import { createClient } from '@supabase/supabase-js';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const sb = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
) as any;

const DRY = process.env.DRY === '1';

/**
 * MacRoman→UTF-8 double-encoding repair table. The keys are what the
 * SQL editor clipboard pipeline produced; the values are the correct
 * Icelandic characters. Keep entries ordered longest→shortest so
 * multi-codepoint patterns like ‚Äî match before any single-char
 * fragments.
 */
const MOJIBAKE: Array<[string, string]> = [
    // Em/en dash + smart quotes (3-byte UTF-8 punctuation)
    ['‚Äî', '—'],
    ['‚Äì', '–'],
    ['‚Äú', '“'],
    ['‚Äù', '”'],
    ['‚Äò', '‘'],
    ['‚Äô', '’'],
    ['‚Ä¶', '…'],

    // Icelandic lowercase
    ['√°', 'á'], ['√†', 'à'], ['√¢', 'â'], ['√§', 'ä'],
    ['√©', 'é'], ['√®', 'è'], ['√™', 'ê'], ['√´', 'ë'],
    ['√≠', 'í'], ['√¨', 'ì'], ['√Æ', 'î'], ['√Ø', 'ï'],
    ['√≥', 'ó'], ['√≤', 'ò'], ['√¥', 'ô'], ['√∂', 'ö'],
    ['√∫', 'ú'], ['√π', 'ù'], ['√ª', 'û'], ['√º', 'ü'],
    ['√Ω', 'ý'], ['√ø', 'ÿ'],
    ['√¶', 'æ'],
    ['√∞', 'ð'],
    ['√æ', 'þ'],
    ['√ß', 'ç'],
    ['√±', 'ñ'],

    // Icelandic uppercase
    ['√Å', 'Á'], ['√Ä', 'À'], ['√Ç', 'Â'], ['√Ñ', 'Ä'],
    ['√â', 'É'], ['√à', 'È'], ['√ä', 'Ê'], ['√ã', 'Ë'],
    ['√ç', 'Í'], ['√å', 'Ì'], ['√é', 'Î'], ['√ï', 'Ï'],
    ['√ì', 'Ó'], ['√í', 'Ò'], ['√î', 'Ô'], ['√ñ', 'Ö'],
    ['√ö', 'Ú'], ['√ô', 'Ù'], ['√õ', 'Û'], ['√ú', 'Ü'],
    ['√ù', 'Ý'],
    ['√Ü', 'Æ'],
    ['√ê', 'Ð'],
    ['√û', 'Þ'],
];

function repair(s: string | null | undefined): string | null {
    if (s == null) return s ?? null;
    let out = s;
    for (const [bad, good] of MOJIBAKE) {
        if (out.includes(bad)) out = out.split(bad).join(good);
    }
    return out;
}

function looksMojibaked(s: string | null | undefined): boolean {
    if (!s) return false;
    return s.includes('√') || s.includes('‚Ä');
}

interface Prayer {
    id: string;
    name: string | null;
    topic: string | null;
    content: string | null;
    is_approved: boolean;
    created_at: string;
}

async function fetchAllApproved(): Promise<Prayer[]> {
    const { data, error } = await sb
        .from('prayers')
        .select('id, name, topic, content, is_approved, created_at')
        .eq('is_approved', true)
        .order('created_at', { ascending: true });
    if (error) throw error;
    return data ?? [];
}

async function repairMojibake(prayers: Prayer[]) {
    console.log('\n→ Mojibake repair');

    const broken = prayers.filter(
        (p) => looksMojibaked(p.name) || looksMojibaked(p.topic) || looksMojibaked(p.content),
    );

    if (broken.length === 0) {
        console.log('  ✓ No mojibake detected.');
        return;
    }

    for (const p of broken) {
        const fixedName = repair(p.name);
        const fixedTopic = repair(p.topic);
        const fixedContent = repair(p.content);

        console.log(`  · ${p.id}`);
        if (p.name !== fixedName) console.log(`      name:    ${JSON.stringify(p.name)} → ${JSON.stringify(fixedName)}`);
        if (p.topic !== fixedTopic) console.log(`      topic:   ${JSON.stringify(p.topic)} → ${JSON.stringify(fixedTopic)}`);
        if (p.content !== fixedContent) console.log(`      content: ${JSON.stringify(p.content?.slice(0, 60))} → ${JSON.stringify(fixedContent?.slice(0, 60))}`);

        if (DRY) continue;

        const { error } = await sb
            .from('prayers')
            .update({ name: fixedName, topic: fixedTopic, content: fixedContent })
            .eq('id', p.id);
        if (error) console.error(`      ✗`, error.message);
    }

    console.log(`  ${DRY ? '(dry run, no writes)' : '✓'} ${broken.length} row(s) ${DRY ? 'would be' : 'were'} repaired.`);
}

async function unapproveDuplicates(prayers: Prayer[]) {
    console.log('\n→ Duplicate detection');

    const norm = (s: string | null) => (s ?? '').trim().toLowerCase().replace(/\s+/g, ' ');

    // Group by normalized content. Rows already in mojibake-repair pass
    // may have been updated above, so re-fetch a fresh snapshot for
    // dup detection — otherwise a fixed prayer wouldn't dedupe with
    // an unfixed copy.
    const fresh: Prayer[] = DRY
        ? prayers
        : await fetchAllApproved();

    const groups = new Map<string, Prayer[]>();
    for (const p of fresh) {
        if (!p.content) continue;
        const key = norm(p.content);
        if (!key) continue;
        if (!groups.has(key)) groups.set(key, []);
        groups.get(key)!.push(p);
    }

    const dupes = [...groups.values()].filter((g) => g.length > 1);
    if (dupes.length === 0) {
        console.log('  ✓ No exact-duplicate content among approved prayers.');
        return;
    }

    for (const group of dupes) {
        // Already sorted ascending by created_at — keep [0], unapprove rest.
        const [keep, ...drop] = group;
        console.log(`  · "${keep.content?.slice(0, 60)}…"`);
        console.log(`      keep:        ${keep.id} (${keep.name ?? 'anon'}, ${keep.created_at})`);
        for (const d of drop) {
            console.log(`      unapprove:   ${d.id} (${d.name ?? 'anon'}, ${d.created_at})`);
            if (DRY) continue;
            const { error } = await sb.from('prayers').update({ is_approved: false }).eq('id', d.id);
            if (error) console.error(`        ✗`, error.message);
        }
    }

    const totalDropped = dupes.reduce((sum, g) => sum + g.length - 1, 0);
    console.log(`  ${DRY ? '(dry run, no writes)' : '✓'} ${totalDropped} duplicate row(s) ${DRY ? 'would be' : 'were'} unapproved.`);
}

(async () => {
    if (DRY) console.log('▼ DRY RUN — no writes will be performed.\n');

    const prayers = await fetchAllApproved();
    console.log(`Fetched ${prayers.length} approved prayer(s).`);

    await repairMojibake(prayers);
    await unapproveDuplicates(prayers);

    console.log('\n✓ Done.');
})();
