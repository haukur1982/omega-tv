import { supabase, supabaseAdmin } from './supabase';

/** Which door a prayer came through — see docs/plans/09-prayer-ministry.md. */
export type PrayerSource = 'vefur' | 'simi' | 'utsending';

export interface Prayer {
    id: string;
    name: string;
    email?: string;
    topic: string;
    content: string;
    categoryType: string;
    timestamp: number;
    prayCount: number;
    isAnswered: boolean;
    isApproved: boolean;
    /**
     * The ministry columns (migration 20260901_prayer_ministry.sql). All
     * optional on purpose: until that migration is applied they are simply
     * absent, and every consumer must render without them. `source` defaults
     * to 'vefur' in the mapper so a card never has to guard for undefined.
     */
    source: PrayerSource;
    airConsent: boolean;
    broadcastQueue: number | null;
    airedAt: string | null;
    airedProgram: string | null;
}

export interface PrayerCampaign {
    id: string;
    title: string;
    description: string | null;
    imageUrl: string | null;
    startDate: string;
    endDate: string;
    isActive: boolean;
    prayCount: number;
    createdAt: string;
}

// Columns safe to expose on the PUBLIC prayer wall. Deliberately excludes
// `email` (and any future consent columns): the public Bænatorg payload must
// never carry a submitter's email. Admin reads (getAllPrayers) add it back.
const PUBLIC_PRAYER_COLUMNS =
    'id, name, topic, content, category_type, created_at, pray_count, is_answered, is_approved';

/**
 * The same allow-list plus the ministry columns. `air_consent` is deliberately
 * NOT here: whether a person let their prayer be prayed on air is a consent
 * record for the studio, not something the public wall needs. What the wall
 * shows is what already happened (`aired_at`) and which door it came through.
 */
const PUBLIC_PRAYER_COLUMNS_WIDE =
    `${PUBLIC_PRAYER_COLUMNS}, source, aired_at, aired_program`;

/**
 * True when a query failed because a column from 20260901_prayer_ministry.sql
 * is not there yet, rather than for a real reason. PostgREST answers PGRST204
 * (or 42703 raw) and names the column in the message.
 *
 * This is what lets the wall keep working on the current schema: on this error
 * — and ONLY this error — we retry narrow. A genuine failure still surfaces.
 */
export function isMissingColumn(error: unknown): boolean {
    if (!error || typeof error !== 'object') return false;
    const e = error as { code?: string; message?: string };
    if (e.code === 'PGRST204' || e.code === '42703') return true;
    return /column .* does not exist|could not find the .* column|schema cache/i.test(e.message ?? '');
}

function asSource(value: unknown): PrayerSource {
    return value === 'simi' || value === 'utsending' ? value : 'vefur';
}

// Public-safe mapper: NO email. Admin/owner code that needs the email adds it
// explicitly after calling this. Ministry columns degrade to their defaults
// when the row came from a narrow (pre-migration) select.
function mapPrayer(row: any): Prayer {
    return {
        id: row.id,
        name: row.name,
        topic: row.topic,
        content: row.content,
        categoryType: row.category_type || 'personal',
        timestamp: new Date(row.created_at).getTime(),
        prayCount: row.pray_count || 0,
        isAnswered: row.is_answered || false,
        isApproved: row.is_approved || false,
        source: asSource(row.source),
        airConsent: row.air_consent === true,
        broadcastQueue: typeof row.broadcast_queue === 'number' ? row.broadcast_queue : null,
        airedAt: row.aired_at ?? null,
        airedProgram: row.aired_program ?? null,
    };
}

function mapCampaign(row: any): PrayerCampaign {
    return {
        id: row.id,
        title: row.title,
        description: row.description,
        imageUrl: row.image_url,
        startDate: row.start_date,
        endDate: row.end_date,
        isActive: row.is_active,
        prayCount: row.pray_count || 0,
        createdAt: row.created_at,
    };
}

// ===== PRAYERS =====

export async function getPrayers(filters?: { topic?: string; categoryType?: string }): Promise<Prayer[]> {
    const build = (columns: string) => {
        let query = supabase
            .from('prayers')
            .select(columns)
            .eq('is_approved', true)
            // `is_private` is the pre-existing "do not show this publicly"
            // column. Nothing wrote it until the phone door: a caller who does
            // not consent to the wall still gets prayed for, they just never
            // appear on it. Null is the legacy default and means "not private".
            .or('is_private.is.null,is_private.eq.false')
            .order('created_at', { ascending: false });
        if (filters?.topic) query = query.eq('topic', filters.topic);
        if (filters?.categoryType) query = query.eq('category_type', filters.categoryType);
        return query;
    };

    // Try the wide select first. If the ministry migration has not been applied
    // the columns are absent — fall back to the current column set so the wall
    // still renders, with the on-air marks simply off.
    const wide = await build(PUBLIC_PRAYER_COLUMNS_WIDE);
    if (!wide.error) return (wide.data || []).map(mapPrayer);
    if (!isMissingColumn(wide.error)) {
        console.error('Failed to fetch prayers:', wide.error);
        return [];
    }

    const { data, error } = await build(PUBLIC_PRAYER_COLUMNS);
    if (error) { console.error("Failed to fetch prayers:", error); return []; }
    return (data || []).map(mapPrayer);
}

export async function getAllPrayers(): Promise<Prayer[]> {
    // Admin-only (service role, behind admin auth) — the moderation view needs
    // the submitter's email, so add it back on top of the public-safe mapper.
    const { data, error } = await supabaseAdmin
        .from('prayers')
        .select('*')
        .order('created_at', { ascending: false });
    if (error) { console.error("Failed to fetch all prayers:", error); return []; }
    return (data || []).map((row: any) => ({ ...mapPrayer(row), email: row.email }));
}

export async function addPrayer(prayer: {
    name: string;
    email?: string;
    topic: string;
    content: string;
    categoryType?: string;
    autoApprove?: boolean;
    /** Which door this came through. Defaults to the wall. */
    source?: PrayerSource;
    /** Explicitly given — never inferred from anything else. */
    airConsent?: boolean;
    /** True keeps the prayer off the public wall entirely (see getPrayers). */
    isPrivate?: boolean;
}): Promise<Prayer | null> {
    const base = {
        name: prayer.name,
        email: prayer.email,
        topic: prayer.topic,
        content: prayer.content,
        category_type: prayer.categoryType || 'personal',
        pray_count: 0,
        is_approved: prayer.autoApprove || false,
        is_answered: false,
        is_private: prayer.isPrivate === true,
    };

    // Service role: this runs in a server action. The anon client's
    // insert().select() trips the RLS SELECT policy (only approved rows
    // are selectable) and rolls the insert back. supabaseAdmin bypasses it.
    const insert = (row: Record<string, unknown>) =>
        supabaseAdmin
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            .from('prayers').insert([row as any])
            .select()
            .single();

    const wide = await insert({
        ...base,
        source: prayer.source ?? 'vefur',
        air_consent: prayer.airConsent === true,
    });
    if (!wide.error) return mapPrayer(wide.data);

    // Pre-migration: the consent columns don't exist. A prayer must still be
    // able to be borne, so retry with the current column set — but only for
    // that specific failure, never to paper over a real one.
    if (!isMissingColumn(wide.error)) {
        console.error('Failed to add prayer:', wide.error);
        return null;
    }

    const { data, error } = await insert(base);
    if (error) { console.error("Failed to add prayer:", error); return null; }
    return mapPrayer(data);
}

export async function incrementPrayCount(id: string): Promise<number | null> {
    const { data: current } = await supabase
        .from('prayers')
        .select('pray_count')
        .eq('id', id)
        .single();
    if (!current) return null;

    const newCount = (current.pray_count || 0) + 1;
    const { error } = await supabase
        .from('prayers')
        .update({ pray_count: newCount })
        .eq('id', id);
    if (error) return null;
    return newCount;
}

export async function approvePrayer(id: string): Promise<boolean> {
    const { error } = await supabaseAdmin
        .from('prayers')
        .update({ is_approved: true })
        .eq('id', id);
    return !error;
}

export async function markPrayerAnswered(id: string): Promise<boolean> {
    const { error } = await supabaseAdmin
        .from('prayers')
        .update({ is_answered: true })
        .eq('id', id);
    return !error;
}

export async function deletePrayer(id: string): Promise<boolean> {
    const { error } = await supabaseAdmin
        .from('prayers')
        .delete()
        .eq('id', id);
    return !error;
}

export async function getTotalPrayCount(): Promise<number> {
    const { data, error } = await supabase
        .from('prayers')
        .select('pray_count')
        .eq('is_approved', true);
    if (error || !data) return 0;
    return data.reduce((sum: number, row: any) => sum + (row.pray_count || 0), 0);
}

// ===== THE PRODUCER STACK (prayer programs) =====
//
// The view the studio has open during a prayer program. Everything here is
// admin-only (service role, behind verifyAdminSession with section 'samskipti')
// and every function reports `missing` rather than throwing when the ministry
// migration has not been applied — the admin views turn that into
// "keyrðu SQL-ið fyrst" guidance instead of an error page.

/** Columns the producer needs. Includes air_consent, which the public wall never sees. */
const BROADCAST_PRAYER_COLUMNS =
    `${PUBLIC_PRAYER_COLUMNS}, source, air_consent, broadcast_queue, aired_at, aired_program`;

// The generated Database type predates 20260901_prayer_ministry.sql, so the new
// columns are not in it. Repo convention for that is a single cast at the data
// layer rather than casts scattered through the routes (see admin-staff.ts).
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const sbAdmin = () => supabaseAdmin as any;

export interface BroadcastBoard {
    /** Approved, consented, not yet aired, not yet in the stack. Newest first. */
    eligible: Prayer[];
    /** What the program is praying through, in order. */
    stack: Prayer[];
    /** The ministry migration has not been applied yet. */
    missing: boolean;
}

export interface MinistryWrite {
    ok: boolean;
    missing: boolean;
    error?: string;
}

export async function getBroadcastBoard(): Promise<BroadcastBoard> {
    const empty = { eligible: [], stack: [] };

    const [eligibleRes, stackRes] = await Promise.all([
        sbAdmin()
            .from('prayers')
            .select(BROADCAST_PRAYER_COLUMNS)
            .eq('is_approved', true)
            .eq('air_consent', true)
            .is('aired_at', null)
            .is('broadcast_queue', null)
            .order('created_at', { ascending: false })
            .limit(60),
        sbAdmin()
            .from('prayers')
            .select(BROADCAST_PRAYER_COLUMNS)
            .not('broadcast_queue', 'is', null)
            .is('aired_at', null)
            .order('broadcast_queue', { ascending: true }),
    ]);

    const err = eligibleRes.error ?? stackRes.error;
    if (err) {
        if (isMissingColumn(err)) return { ...empty, missing: true };
        console.error('Failed to load the broadcast board:', err);
        return { ...empty, missing: false };
    }

    return {
        eligible: (eligibleRes.data || []).map(mapPrayer),
        stack: (stackRes.data || []).map(mapPrayer),
        missing: false,
    };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const updatePrayer = async (id: string, patch: Record<string, any>): Promise<MinistryWrite> => {
    const { error } = await sbAdmin()
        .from('prayers')
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .update(patch as any)
        .eq('id', id);
    if (error) {
        if (isMissingColumn(error)) return { ok: false, missing: true };
        console.error('Prayer update failed:', error);
        return { ok: false, missing: false, error: error.message };
    }
    return { ok: true, missing: false };
};

/** Put a prayer at the bottom of the stack. */
export async function addToBroadcastStack(id: string): Promise<MinistryWrite> {
    const { data, error } = await sbAdmin()
        .from('prayers')
        .select('broadcast_queue')
        .not('broadcast_queue', 'is', null)
        .is('aired_at', null)
        .order('broadcast_queue', { ascending: false })
        .limit(1);

    if (error) {
        if (isMissingColumn(error)) return { ok: false, missing: true };
        console.error('Failed to read the stack tail:', error);
        return { ok: false, missing: false, error: error.message };
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const top = (data?.[0] as any)?.broadcast_queue;
    const next = (typeof top === 'number' ? top : 0) + 1;
    return updatePrayer(id, { broadcast_queue: next });
}

export async function removeFromBroadcastStack(id: string): Promise<MinistryWrite> {
    return updatePrayer(id, { broadcast_queue: null });
}

/**
 * Renumber the whole stack from an ordered list of ids. The up/down buttons
 * send the list they want, so the server never has to reason about swaps and
 * two positions can't collide.
 */
export async function setBroadcastOrder(ids: string[]): Promise<MinistryWrite> {
    for (let i = 0; i < ids.length; i++) {
        const res = await updatePrayer(ids[i], { broadcast_queue: i + 1 });
        if (!res.ok) return res;
    }
    return { ok: true, missing: false };
}

/** "Borin fram" — it was prayed on air. Leaves the stack, keeps the memory. */
export async function markPrayerAired(id: string, program: string): Promise<MinistryWrite> {
    return updatePrayer(id, {
        aired_at: new Date().toISOString(),
        aired_program: program.trim() || null,
        broadcast_queue: null,
    });
}

/**
 * Can the ministry features run yet? One cheap probe so an admin view can show
 * the run-SQL guidance before the volunteer starts typing, rather than after.
 */
export async function isPrayerMinistryReady(): Promise<boolean> {
    const { error } = await sbAdmin().from('prayers').select('source').limit(1);
    return !error;
}

// ===== CAMPAIGNS =====

export async function getActiveCampaigns(): Promise<PrayerCampaign[]> {
    const { data, error } = await supabase
        .from('prayer_campaigns')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });
    if (error) { console.error("Failed to fetch campaigns:", error); return []; }
    return (data || []).map(mapCampaign);
}

export async function getAllCampaigns(): Promise<PrayerCampaign[]> {
    const { data, error } = await supabaseAdmin
        .from('prayer_campaigns')
        .select('*')
        .order('created_at', { ascending: false });
    if (error) { console.error("Failed to fetch campaigns:", error); return []; }
    return (data || []).map(mapCampaign);
}

export async function createCampaign(campaign: {
    title: string;
    description?: string;
    imageUrl?: string;
    startDate: string;
    endDate: string;
}): Promise<PrayerCampaign | null> {
    const { data, error } = await supabaseAdmin
        .from('prayer_campaigns')
        .insert([{
            title: campaign.title,
            description: campaign.description,
            image_url: campaign.imageUrl,
            start_date: campaign.startDate,
            end_date: campaign.endDate,
            is_active: true,
            pray_count: 0,
        }])
        .select()
        .single();
    if (error) { console.error("Failed to create campaign:", error); return null; }
    return mapCampaign(data);
}

export async function incrementCampaignPrayCount(id: string): Promise<number | null> {
    const { data: current } = await supabase
        .from('prayer_campaigns')
        .select('pray_count')
        .eq('id', id)
        .single();
    if (!current) return null;

    const newCount = (current.pray_count || 0) + 1;
    const { error } = await supabaseAdmin
        .from('prayer_campaigns')
        .update({ pray_count: newCount })
        .eq('id', id);
    if (error) return null;
    return newCount;
}

export async function setCampaignActive(id: string, active: boolean): Promise<boolean> {
    const { error } = await supabaseAdmin
        .from('prayer_campaigns')
        .update({ is_active: active })
        .eq('id', id);
    if (error) { console.error('Failed to toggle campaign:', error); return false; }
    return true;
}

export async function deleteCampaign(id: string): Promise<boolean> {
    const { error } = await supabaseAdmin
        .from('prayer_campaigns')
        .delete()
        .eq('id', id);
    if (error) { console.error('Failed to delete campaign:', error); return false; }
    return true;
}
