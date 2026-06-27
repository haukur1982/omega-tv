import { supabase, supabaseAdmin } from './supabase';

/**
 * "Bæn dagsins" data layer.
 *
 * Public read (anon client) for the homepage; admin writes via the service
 * role. The prayer is deterministic by date (one prayer, one nation, one day),
 * with a fallback so the homepage slot is never empty.
 *
 * featured_prayers isn't in the generated Supabase types yet, so the clients
 * are cast — the same pattern the existing write paths use (addSubscriber,
 * /api/track). Regenerating src/types/supabase.ts is a clean-up follow-up.
 */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const sb = supabase as any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const sba = supabaseAdmin as any;

export interface FeaturedPrayer {
    date: string;        // formatted Icelandic, e.g. "27. júní 2026"
    body: string;
    scripture: string | null;
    author: string;
}

export interface FeaturedPrayerRow {
    id: string;
    feature_date: string; // YYYY-MM-DD
    body: string;
    scripture: string | null;
    author: string;
}

function todayISO(): string {
    // Iceland runs on UTC year-round (no DST), so the UTC date is the local date.
    return new Date().toISOString().slice(0, 10);
}

function formatIsDate(ymd: string): string {
    try {
        return new Date(`${ymd}T12:00:00Z`).toLocaleDateString('is-IS', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
        });
    } catch {
        return ymd;
    }
}

const SELECT = 'feature_date, body, scripture, author';

/** Today's prayer for the homepage. Falls back to the most recent past one,
 *  then the earliest future one, so the slot always has something to show. */
export async function getFeaturedPrayer(): Promise<FeaturedPrayer | null> {
    const today = todayISO();

    const exact = await sb.from('featured_prayers').select(SELECT).eq('feature_date', today).maybeSingle();
    let row = exact.data as FeaturedPrayerRow | null;

    if (!row) {
        const past = await sb.from('featured_prayers').select(SELECT)
            .lte('feature_date', today).order('feature_date', { ascending: false }).limit(1).maybeSingle();
        row = past.data as FeaturedPrayerRow | null;
    }
    if (!row) {
        const future = await sb.from('featured_prayers').select(SELECT)
            .order('feature_date', { ascending: true }).limit(1).maybeSingle();
        row = future.data as FeaturedPrayerRow | null;
    }
    if (!row) return null;

    return {
        date: formatIsDate(row.feature_date),
        body: row.body,
        scripture: row.scripture,
        author: row.author,
    };
}

// ===== Admin (service role) =====

/** Upcoming + today's prayers, for the admin curation list. */
export async function getUpcomingFeaturedPrayers(): Promise<FeaturedPrayerRow[]> {
    const { data, error } = await sba
        .from('featured_prayers')
        .select('id, feature_date, body, scripture, author')
        .gte('feature_date', todayISO())
        .order('feature_date', { ascending: true });
    if (error) { console.error('Failed to fetch featured prayers:', error); return []; }
    return (data ?? []) as FeaturedPrayerRow[];
}

export async function createFeaturedPrayer(input: {
    featureDate: string;
    body: string;
    scripture?: string;
    author?: string;
}): Promise<{ success: boolean; error?: string }> {
    if (!input.featureDate || !input.body?.trim()) {
        return { success: false, error: 'Dagsetning og bæn eru nauðsynleg.' };
    }
    const { error } = await sba.from('featured_prayers').upsert(
        {
            feature_date: input.featureDate,
            body: input.body.trim(),
            scripture: input.scripture?.trim() || null,
            author: input.author?.trim() || 'borið fram af Omega',
        },
        { onConflict: 'feature_date' },
    );
    if (error) { console.error('Failed to save featured prayer:', error); return { success: false, error: 'Tókst ekki að vista bæn.' }; }
    return { success: true };
}

export async function deleteFeaturedPrayer(id: string): Promise<boolean> {
    const { error } = await sba.from('featured_prayers').delete().eq('id', id);
    return !error;
}
