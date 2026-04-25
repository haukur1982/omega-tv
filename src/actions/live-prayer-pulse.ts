'use server';

import { cookies } from 'next/headers';
import { supabase } from '@/lib/supabase';

// schedule_slots and the increment_live_prayer_count RPC aren't in
// the generated types yet — same pattern as schedule-db.ts uses.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const untyped = supabase as any;

/**
 * Live prayer pulse — server action for the /live page tap-to-pray
 * counter. Atomic increment via the increment_live_prayer_count RPC.
 *
 * Cookie rate-limited per slot per device — taps within
 * RATE_LIMIT_SECONDS of the previous one return the current count
 * without incrementing. Keeps a single tap from registering twice on
 * a slow connection while letting the same person tap again later in
 * the broadcast (no hard once-per-broadcast lock — multiple amens are
 * theologically fine).
 */

const RATE_LIMIT_SECONDS = 3;

export interface PulseResult {
    count: number;
    throttled: boolean;
}

export async function pulseLivePrayer(slotId: string): Promise<PulseResult> {
    if (!slotId) return { count: 0, throttled: false };

    const cookieStore = await cookies();
    const cookieKey = `pulse_${slotId}`;
    const lastTap = cookieStore.get(cookieKey)?.value;
    const now = Date.now();

    if (lastTap) {
        const elapsedMs = now - parseInt(lastTap, 10);
        if (Number.isFinite(elapsedMs) && elapsedMs < RATE_LIMIT_SECONDS * 1000) {
            const { data } = await untyped
                .from('schedule_slots')
                .select('live_prayer_count')
                .eq('id', slotId)
                .single();
            return { count: data?.live_prayer_count ?? 0, throttled: true };
        }
    }

    const { data, error } = await untyped.rpc('increment_live_prayer_count', { slot_id: slotId });
    if (error) {
        console.error('[pulseLivePrayer] RPC failed:', error);
        return { count: 0, throttled: false };
    }

    cookieStore.set(cookieKey, String(now), {
        httpOnly: false,
        sameSite: 'lax',
        path: '/live',
        maxAge: 60 * 60 * 6, // 6 hours — covers the longest single broadcast
    });

    return { count: typeof data === 'number' ? data : 0, throttled: false };
}
