import { supabaseAdmin } from '@/lib/supabase';

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
    const { data } = await sb
        .from('devotionals')
        .select(COLS)
        .eq('slug', slug)
        .eq('status', 'published')
        .eq('reviewed', true)
        .maybeSingle();
    return (data as Devotional) ?? null;
}

/** Everything published, for the collection index. */
export async function listPublishedDevotionals(): Promise<Devotional[]> {
    const { data } = await sb
        .from('devotionals')
        .select(COLS)
        .eq('status', 'published')
        .eq('reviewed', true)
        .order('day')
        .order('slot');
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

/** The two attribution lines BookForge requires wherever this is published. */
export const DEVOTIONAL_ATTRIBUTION = {
    scripture:
        'Ritningarstaðir eru þýddir beint úr frummálunum, hebresku og grísku, en ekki teknir upp úr útgefinni íslenskri biblíuþýðingu.',
    sources:
        'Gríski grunntextinn er KJTR, Center for New Testament Restoration (Alan Bunning), notaður samkvæmt CC BY 4.0. Hebreski grunntextinn er Westminster Leningrad Codex.',
    author: 'Hugleiðingar eftir Wade E. Taylor · Parousia Ministries',
} as const;

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
