import { supabase, supabaseAdmin } from './supabase';
import { getCurrentAndNext, getScheduleInRange, type ScheduleSlot } from './schedule-db';

/**
 * ═══════════════════════════════════════════════════════════════════
 * Sanctuary (Samfélag í bæn) — prayer-first broadcast community
 *
 * Phase 4 of the redesign. Powers the prayer surfaces on /beint
 * (primary) and, in a compact form, the home page.
 *
 * Hawk's direction (2026-04-17): prayer is Omega's theological backbone,
 * not a UI feature. The channel's CEO is a man of prayer. Design here
 * should reflect that — prayers are the main event, bigger, more
 * prominent, with real interaction.
 *
 * Candles were removed in this session — the metaphor didn't register
 * with Lutheran Icelandic viewers. Everything is prayer now.
 * ═══════════════════════════════════════════════════════════════════
 */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const untyped = supabase as any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const untypedAdmin = supabaseAdmin as any;

export type BroadcastPrayer = {
    id: string;
    name: string | null;
    content: string;
    pray_count: number | null;
    is_answered: boolean | null;
    created_at: string | null;
};

export type SanctuaryState =
    | { mode: 'live'; slot: ScheduleSlot }
    | { mode: 'upcoming'; slot: ScheduleSlot }
    | { mode: 'idle'; slot: null };

/**
 * The slot the prayer surface anchors on right now:
 *   - If a live broadcast is currently on-air → that slot ("live")
 *   - Else the next upcoming live broadcast within 7 days → that slot ("upcoming")
 *   - Else idle — rest state.
 */
export async function getSanctuaryAnchor(now: Date = new Date()): Promise<SanctuaryState> {
    const { current } = await getCurrentAndNext(now);
    if (current?.is_live_broadcast) return { mode: 'live', slot: current };

    const start = now.toISOString();
    const end = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString();
    const slots = await getScheduleInRange(start, end);
    const nextLive = slots.find(s => s.is_live_broadcast && new Date(s.starts_at).getTime() > now.getTime());
    if (nextLive) return { mode: 'upcoming', slot: nextLive };

    return { mode: 'idle', slot: null };
}

/** Approved broadcast prayers for this slot, newest first. */
export async function getBroadcastPrayers(slotId: string, limit = 24): Promise<BroadcastPrayer[]> {
    const { data, error } = await untyped
        .from('prayers')
        .select('id, name, content, pray_count, is_answered, created_at')
        .eq('broadcast_slot_id', slotId)
        .eq('is_approved', true)
        .order('created_at', { ascending: false })
        .limit(limit);
    if (error || !data) return [];
    return data as BroadcastPrayer[];
}

/**
 * Most recent approved broadcast prayers site-wide — used for the
 * compact "bæn í útsendingu" module on the home page. Not filtered
 * by slot because we want to always show something, even if there's
 * no upcoming broadcast.
 */
export async function getRecentBroadcastPrayers(limit = 3): Promise<BroadcastPrayer[]> {
    const { data, error } = await untyped
        .from('prayers')
        .select('id, name, content, pray_count, is_answered, created_at')
        .eq('is_approved', true)
        .eq('is_broadcast_prayer', true)
        .order('created_at', { ascending: false })
        .limit(limit);
    if (error || !data) return [];
    return data as BroadcastPrayer[];
}

/**
 * Submit a broadcast prayer. Enters moderation queue (is_approved=false).
 * Admin approves through existing prayer moderation UI; once approved,
 * the prayer lights up in the wall on next page render.
 */
export async function submitBroadcastPrayer(
    slotId: string,
    args: { name?: string | null; content: string },
): Promise<boolean> {
    const content = args.content.trim();
    if (!content || content.length < 3 || content.length > 600) return false;
    const name = args.name?.trim().slice(0, 80) || null;

    const { error } = await untypedAdmin
        .from('prayers')
        .insert({
            name,
            // `topic` is NOT NULL on the pre-existing prayers table. For
            // broadcast submissions we default it to the generic "Bæn í
            // útsendingu" — admin can retopic during moderation.
            topic: 'Bæn í útsendingu',
            content,
            is_approved: false,
            is_broadcast_prayer: true,
            broadcast_slot_id: slotId,
        });
    if (error) {
        console.error('submitBroadcastPrayer failed:', error);
        return false;
    }
    return true;
}

/**
 * "Bið með" — increments pray_count on an existing approved prayer.
 * Anonymous action, rate-limited at the app layer by cookie (one
 * tap per prayer per browser per hour).
 */
export async function prayAlongWith(prayerId: string): Promise<number | null> {
    // Atomically increment pray_count. We use the admin client so the
    // update lands regardless of RLS shape on the prayers table.
    const { data, error } = await untypedAdmin.rpc('increment_prayer_count', { prayer_id: prayerId });
    if (!error && typeof data === 'number') return data;

    // Fallback: fetch-modify-write if the RPC isn't defined yet.
    const { data: row, error: rErr } = await untypedAdmin
        .from('prayers')
        .select('pray_count')
        .eq('id', prayerId)
        .eq('is_approved', true)
        .maybeSingle();
    if (rErr || !row) return null;
    const next = (row.pray_count ?? 0) + 1;
    const { error: uErr } = await untypedAdmin
        .from('prayers')
        .update({ pray_count: next })
        .eq('id', prayerId);
    if (uErr) return null;
    return next;
}
