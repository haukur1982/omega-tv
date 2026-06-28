import { supabase, supabaseAdmin } from './supabase';

/**
 * "Orð dagsins" data layer — the daily Scripture-anchored word that pairs with
 * "Bæn dagsins" to give two fresh things every morning. Same shape and rules as
 * featured-prayer-db: public read for the homepage, service-role writes, one per
 * date with a fallback so the slot is never empty.
 *
 * Not in the generated Supabase types yet, so the clients are cast (same pattern
 * as the other write paths).
 */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const sb = supabase as any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const sba = supabaseAdmin as any;

export interface DailyWord {
    date: string;        // formatted Icelandic, e.g. "28. júní 2026"
    reference: string;
    verse: string | null;
    reflection: string;
    source: string;
}

export interface DailyWordRow {
    id: string;
    feature_date: string;
    reference: string;
    verse: string | null;
    reflection: string;
    source: string;
}

function todayISO(): string {
    return new Date().toISOString().slice(0, 10);
}

function formatIsDate(ymd: string): string {
    try {
        return new Date(`${ymd}T12:00:00Z`).toLocaleDateString('is-IS', { day: 'numeric', month: 'long', year: 'numeric' });
    } catch {
        return ymd;
    }
}

const SELECT = 'reference, verse, reflection, source, feature_date';

/** Today's word for the homepage; falls back to most-recent-past, then earliest. */
export async function getDailyWord(): Promise<DailyWord | null> {
    const today = todayISO();

    const exact = await sb.from('daily_words').select(SELECT).eq('feature_date', today).maybeSingle();
    let row = exact.data as DailyWordRow | null;

    if (!row) {
        const past = await sb.from('daily_words').select(SELECT)
            .lte('feature_date', today).order('feature_date', { ascending: false }).limit(1).maybeSingle();
        row = past.data as DailyWordRow | null;
    }
    if (!row) {
        const future = await sb.from('daily_words').select(SELECT)
            .order('feature_date', { ascending: true }).limit(1).maybeSingle();
        row = future.data as DailyWordRow | null;
    }
    if (!row) return null;

    return {
        date: formatIsDate(row.feature_date),
        reference: row.reference,
        verse: row.verse,
        reflection: row.reflection,
        source: row.source,
    };
}

// ===== Admin (service role) =====

export async function getUpcomingDailyWords(): Promise<DailyWordRow[]> {
    const { data, error } = await sba
        .from('daily_words')
        .select('id, feature_date, reference, verse, reflection, source')
        .gte('feature_date', todayISO())
        .order('feature_date', { ascending: true });
    if (error) { console.error('Failed to fetch daily words:', error); return []; }
    return (data ?? []) as DailyWordRow[];
}

export async function createDailyWord(input: {
    featureDate: string;
    reference: string;
    verse?: string;
    reflection: string;
    source?: string;
}): Promise<{ success: boolean; error?: string }> {
    if (!input.featureDate || !input.reference?.trim() || !input.reflection?.trim()) {
        return { success: false, error: 'Dagsetning, ritningarstaður og orð eru nauðsynleg.' };
    }
    const { error } = await sba.from('daily_words').upsert(
        {
            feature_date: input.featureDate,
            reference: input.reference.trim(),
            verse: input.verse?.trim() || null,
            reflection: input.reflection.trim(),
            source: input.source?.trim() || 'Omega',
        },
        { onConflict: 'feature_date' },
    );
    if (error) { console.error('Failed to save daily word:', error); return { success: false, error: 'Tókst ekki að vista orð.' }; }
    return { success: true };
}

export async function deleteDailyWord(id: string): Promise<boolean> {
    const { error } = await sba.from('daily_words').delete().eq('id', id);
    return !error;
}
