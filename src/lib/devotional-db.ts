import { createHash } from 'node:crypto';
import { supabaseAdmin } from '@/lib/supabase';
import type { SuggestPayload } from '@/lib/devotional-suggest';

/**
 * Hugleiðingar — BookForge-translated devotionals.
 *
 * SERVER-ONLY (imports supabaseAdmin). The table is RLS-locked with no public
 * policies; every read happens here. Publication gate: a piece only reaches
 * the public site when status='published' AND reviewed=true, because the
 * translation is machine-produced and requires a native-speaker read.
 *
 * Cycle model: day 1–31 x morning/evening. Day maps to the day of the month,
 * so the collection repeats monthly the way the printed original does.
 */

export interface Devotional {
    id: string;
    collection: string;
    day: number;
    slot: 'morning' | 'evening';
    slug: string;
    title_is: string;
    title_en: string | null;
    body_is: string[];
    body_en: string[];
    scripture_refs: string[];
    source_url: string | null;
    reviewed: boolean;
    reviewed_at: string | null;
    review_note: string | null;
    status: 'draft' | 'published';
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const sb = supabaseAdmin as any;

const COLS =
    'id, collection, day, slot, slug, title_is, title_en, body_is, body_en, scripture_refs, source_url, reviewed, reviewed_at, review_note, status';

/** Reykjavík day-of-month — the site's clock, not the server's. */
export function reykjavikDayOfMonth(d: Date = new Date()): number {
    const s = new Intl.DateTimeFormat('en-CA', {
        timeZone: 'Atlantic/Reykjavik',
        day: 'numeric',
    }).format(d);
    return Number(s);
}

/** Today's piece for the public site / daily email. Null until reviewed+published. */
export async function getTodaysDevotional(
    slot: 'morning' | 'evening' = 'morning',
): Promise<Devotional | null> {
    const { data } = await sb
        .from('devotionals')
        .select(COLS)
        .eq('day', reykjavikDayOfMonth())
        .eq('slot', slot)
        .eq('status', 'published')
        .eq('reviewed', true)
        .maybeSingle();
    return (data as Devotional) ?? null;
}

/** One piece by slug, public-safe (published + reviewed only). */
export async function getPublishedDevotional(slug: string): Promise<Devotional | null> {
    const { data, error } = await sb
        .from('devotionals')
        .select(COLS)
        .eq('slug', slug)
        .eq('status', 'published')
        .eq('reviewed', true)
        .maybeSingle();
    if (error) throw new Error('Could not load published devotional: ' + error.code);
    return (data as Devotional) ?? null;
}

/** Everything published, for the collection index. */
export async function listPublishedDevotionals(): Promise<Devotional[]> {
    const { data, error } = await sb
        .from('devotionals')
        .select(COLS)
        .eq('status', 'published')
        .eq('reviewed', true)
        .order('day')
        .order('slot');
    if (error) throw new Error('Could not list published devotionals: ' + error.code);
    return (data ?? []) as Devotional[];
}

/** Admin: everything, reviewed or not. */
export async function listAllDevotionals(): Promise<Devotional[]> {
    const { data } = await sb
        .from('devotionals')
        .select(COLS)
        .order('day')
        .order('slot');
    return (data ?? []) as Devotional[];
}

export async function getDevotionalBySlug(slug: string): Promise<Devotional | null> {
    const { data } = await sb.from('devotionals').select(COLS).eq('slug', slug).maybeSingle();
    return (data as Devotional) ?? null;
}

export async function updateDevotional(
    id: string,
    patch: Partial<Pick<Devotional, 'title_is' | 'body_is' | 'reviewed' | 'review_note' | 'status'>>,
): Promise<{ ok: boolean; error?: string }> {
    const next: Record<string, unknown> = { ...patch, updated_at: new Date().toISOString() };
    if (patch.reviewed === true) next.reviewed_at = new Date().toISOString();
    if (patch.reviewed === false) next.reviewed_at = null;
    const { error } = await sb.from('devotionals').update(next).eq('id', id);
    return error ? { ok: false, error: error.message } : { ok: true };
}

export interface DevotionalProgress {
    total: number;
    reviewed: number;
    published: number;
}

export async function getDevotionalProgress(): Promise<DevotionalProgress> {
    const rows = await listAllDevotionals();
    return {
        total: rows.length,
        reviewed: rows.filter((r) => r.reviewed).length,
        published: rows.filter((r) => r.status === 'published').length,
    };
}

export { DEVOTIONAL_ATTRIBUTION } from './devotional-attribution';

/**
 * Store what the reviewer changed, paragraph by paragraph.
 *
 * Only genuine differences are kept, and only where the paragraph existed
 * before — so re-ordering or appending doesn't pollute the style record.
 * These pairs are read back by the suggestion assistant as examples of the
 * house voice, which is what makes the editor improve as it is used.
 */
export async function recordCorrections(
    devotionalId: string,
    before: string[],
    after: string[],
    sourceEn: string[] = [],
    instruction?: string,
    origin: 'manual' | 'accepted' | 'edited' = 'manual',
): Promise<number> {
    const rows: Record<string, unknown>[] = [];
    const n = Math.min(before.length, after.length);
    for (let i = 0; i < n; i++) {
        const b = (before[i] ?? '').trim();
        const a = (after[i] ?? '').trim();
        if (!b || !a || b === a) continue;
        rows.push({
            devotional_id: devotionalId,
            paragraph_index: i,
            source_en: sourceEn[i] ?? null,
            before_is: b,
            after_is: a,
            instruction: instruction ?? null,
            origin,
        });
    }
    if (rows.length === 0) return 0;
    const { error } = await sb.from('devotional_corrections').insert(rows);
    return error ? 0 : rows.length;
}

/** How much house-voice memory has been collected so far. */
export async function getCorrectionCount(): Promise<number> {
    const { count } = await sb
        .from('devotional_corrections')
        .select('id', { count: 'exact', head: true });
    return count ?? 0;
}

export interface CorrectionRow {
    id: string;
    devotional_id: string;
    paragraph_index: number;
    source_en: string | null;
    before_is: string;
    after_is: string;
    instruction: string | null;
    created_at: string;
}

/** The newest pairs, shown to the suggester as examples of the house voice. */
export async function recentCorrections(limit = 12): Promise<CorrectionRow[]> {
    const { data } = await sb
        .from('devotional_corrections')
        .select('id, devotional_id, paragraph_index, source_en, before_is, after_is, instruction, created_at')
        .order('created_at', { ascending: false })
        .limit(limit);
    return (data ?? []) as CorrectionRow[];
}

/**
 * Everything ever corrected — the ore scripts/mine-corrections.ts works.
 * Capped because this is read into memory whole; the collection would have to
 * grow by two orders of magnitude before that matters.
 */
export async function listCorrections(limit = 5000): Promise<CorrectionRow[]> {
    const { data } = await sb
        .from('devotional_corrections')
        .select('id, devotional_id, paragraph_index, source_en, before_is, after_is, instruction, created_at')
        .order('created_at', { ascending: true })
        .limit(limit);
    return (data ?? []) as CorrectionRow[];
}

/* ── glossary ──────────────────────────────────────────────────────────── */

export interface GlossaryRow {
    id: string;
    term_en: string;
    term_is: string;
    variants_is: string[];
    note: string | null;
    active: boolean;
}

export async function listGlossary(activeOnly = true): Promise<GlossaryRow[]> {
    let q = sb.from('devotional_glossary').select('id, term_en, term_is, variants_is, note, active');
    if (activeOnly) q = q.eq('active', true);
    const { data } = await q.order('term_en');
    return (data ?? []) as GlossaryRow[];
}

export async function upsertGlossaryTerm(
    term: { id?: string; term_en: string; term_is: string; variants_is?: string[]; note?: string | null; active?: boolean },
): Promise<{ ok: boolean; error?: string }> {
    const row = {
        term_en: term.term_en.trim(),
        term_is: term.term_is.trim(),
        variants_is: (term.variants_is ?? []).map((v) => v.trim()).filter(Boolean),
        note: term.note?.trim() || null,
        active: term.active !== false,
    };
    const { error } = term.id
        ? await sb.from('devotional_glossary').update(row).eq('id', term.id)
        : await sb.from('devotional_glossary').upsert(row, { onConflict: 'term_en' });
    return error ? { ok: false, error: error.message } : { ok: true };
}

export async function deleteGlossaryTerm(id: string): Promise<boolean> {
    const { error } = await sb.from('devotional_glossary').delete().eq('id', id);
    return !error;
}

/* ── pre-warmed suggestions ────────────────────────────────────────────── */

/**
 * The wording assistant costs a Gemini call and about ten seconds, and the
 * reviewer pays both in the middle of reading. `scripts/warm-suggestions.ts`
 * pays them beforehand for the flagged paragraphs and parks the answer here.
 *
 * The hash is what makes the cache safe: it is taken over the exact Icelandic
 * paragraph the suggestions were computed for, so the moment he edits that
 * paragraph the row stops matching and the next ask regenerates.
 */
export interface SuggestionCacheRow {
    devotional_id: string;
    paragraph_index: number;
    body_hash: string;
    suggestions: SuggestPayload;
    created_at: string;
}

const CACHE_COLS = 'devotional_id, paragraph_index, body_hash, suggestions, created_at';

/** Whitespace is not a change; anything else is. */
export function paragraphHash(text: string): string {
    return createHash('sha256')
        .update((text ?? '').replace(/\s+/g, ' ').trim())
        .digest('hex')
        .slice(0, 32);
}

/**
 * A usable cached payload, or null. A row whose generation failed is stored
 * with no options on purpose (it is a record that we tried), and counts as a
 * miss here so the editor still gets an answer.
 */
export async function getCachedSuggestion(
    hash: string,
    devotionalId?: string,
    paragraphIndex?: number,
): Promise<SuggestPayload | null> {
    try {
        let q = sb.from('devotional_suggestions').select(CACHE_COLS);
        q = devotionalId
            ? q.eq('devotional_id', devotionalId).eq('paragraph_index', paragraphIndex ?? 0)
            : q.eq('body_hash', hash);
        const { data } = await q.limit(1).maybeSingle();
        const row = data as SuggestionCacheRow | null;
        if (!row || row.body_hash !== hash) return null;
        const payload = row.suggestions;
        if (!payload || !Array.isArray(payload.options) || payload.options.length === 0) return null;
        return payload;
    } catch {
        return null;
    }
}

/** Store one payload. Failures are recorded too — see SuggestPayload.failed. */
export async function putCachedSuggestion(
    devotionalId: string,
    paragraphIndex: number,
    hash: string,
    payload: SuggestPayload,
): Promise<boolean> {
    try {
        const { error } = await sb.from('devotional_suggestions').upsert(
            {
                devotional_id: devotionalId,
                paragraph_index: paragraphIndex,
                body_hash: hash,
                suggestions: payload,
                created_at: new Date().toISOString(),
            },
            { onConflict: 'devotional_id,paragraph_index' },
        );
        return !error;
    } catch {
        return false;
    }
}

/**
 * Every cached row — the warm script reads this once and works from a map.
 * Unlike the read path above this one THROWS, because a script that cannot
 * see the cache would otherwise happily regenerate the whole collection.
 */
export async function listSuggestionCache(limit = 5000): Promise<SuggestionCacheRow[]> {
    const { data, error } = await sb.from('devotional_suggestions').select(CACHE_COLS).limit(limit);
    if (error) throw new Error(error.message);
    return (data ?? []) as SuggestionCacheRow[];
}

/**
 * The pieces immediately before and after this one in reading order, so the
 * reviewer moves straight from day 1 morning to day 1 evening without
 * returning to the index. Order is (day, slot) with morning first.
 */
export async function getNeighbours(
    slug: string,
): Promise<{ prev: string | null; next: string | null; position: number; total: number }> {
    const { data } = await sb
        .from('devotionals')
        .select('slug, day, slot')
        .order('day')
        .order('slot', { ascending: false }); // 'morning' > 'evening' alphabetically reversed
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const rows = (data ?? []) as any[];
    const idx = rows.findIndex((r) => r.slug === slug);
    if (idx === -1) return { prev: null, next: null, position: 0, total: rows.length };
    return {
        prev: idx > 0 ? rows[idx - 1].slug : null,
        next: idx < rows.length - 1 ? rows[idx + 1].slug : null,
        position: idx + 1,
        total: rows.length,
    };
}
