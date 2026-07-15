import { NextResponse } from 'next/server';
import { getProjectProgress } from '@/lib/fundraising-db';
import { computeItemStates } from '@/lib/fundraising-shared';

/**
 * Public live status for the studio campaign — aggregates only (same
 * numbers already shown on /studio), no PII. Drives the broadcast graphics
 * (/studio/skjar, /studio/filler) via client polling, and doubles as a
 * DataLink feed for TriCaster if they ever go that route.
 *
 * Same-origin fetches from our own broadcast pages — no CORS needed.
 */
export const dynamic = 'force-dynamic';

export async function GET() {
    const data = await getProjectProgress('nytt-studio');
    if (!data) {
        return NextResponse.json({ error: 'not_found' }, { status: 404 });
    }
    const goal = data.project.goal_isk;
    const states = computeItemStates(data.project.items, data.raised_isk);
    const milestonesFunded = states.filter((s) => s.funded).length;

    // Cumulative milestone boundaries as fractions of goal (0..1) — the
    // internal ones (drop the final 1.0) become tick marks on the bar.
    let acc = 0;
    const boundaries = states.map((s) => {
        acc += s.amount_isk;
        return goal > 0 ? acc / goal : 0;
    });

    return NextResponse.json(
        {
            raised: data.raised_isk,
            goal,
            pct: goal > 0 ? data.raised_isk / goal : 0,
            count: data.gift_count,
            milestonesFunded,
            milestonesTotal: states.length,
            boundaries,
            recent: data.recent_gifts.slice(0, 5),
        },
        { headers: { 'Cache-Control': 'no-store' } },
    );
}
