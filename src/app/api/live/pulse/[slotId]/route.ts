import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

/**
 * GET /api/live/pulse/[slotId]
 *
 * Returns the current live_prayer_count for a schedule slot. Polled
 * every 15s by the LivePrayerPulse client component so on-air viewers
 * see the counter tick up as other devices tap. Cache disabled —
 * point of the endpoint is freshness.
 */

export const dynamic = 'force-dynamic';

// schedule_slots is not in the generated types yet — match the
// untyped-cast pattern used by schedule-db.ts.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const untyped = supabase as any;

export async function GET(
    _request: Request,
    { params }: { params: Promise<{ slotId: string }> },
) {
    const { slotId } = await params;
    if (!slotId) return NextResponse.json({ count: 0 });

    const { data, error } = await untyped
        .from('schedule_slots')
        .select('live_prayer_count')
        .eq('id', slotId)
        .single();

    if (error) {
        return NextResponse.json({ count: 0 }, { status: 200 });
    }

    return NextResponse.json({ count: data?.live_prayer_count ?? 0 });
}
