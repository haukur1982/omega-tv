import StudioFiller from '@/components/studio/StudioFiller';
import type { BroadcastStatus } from '@/components/studio/BroadcastGraphic';
import { getProjectProgress } from '@/lib/fundraising-db';
import { computeItemStates, milestoneBoundaries } from '@/lib/fundraising-shared';

/**
 * /studio/filler — self-updating between-programs spot (~26s loop). Bring it
 * into the TriCaster the same way as /studio/skjar (NDI Screen Capture of a
 * full-screen browser) and drop it in the junction rotation. See
 * docs/studio-broadcast.md. Renders bare (no site nav/footer).
 */
export const dynamic = 'force-dynamic';

export const metadata = {
    title: 'Omega · Söfnun (kynning)',
    robots: { index: false, follow: false },
};

export default async function StudioFillerPage() {
    const data = await getProjectProgress('nytt-studio');
    const goal = data?.project.goal_isk ?? 0;
    const raised = data?.raised_isk ?? 0;
    const items = data?.project.items ?? [];
    const states = computeItemStates(items, raised);
    const boundaries = milestoneBoundaries(items, goal);

    const initial: BroadcastStatus = {
        raised,
        goal,
        count: data?.gift_count ?? 0,
        milestonesFunded: states.filter((s) => s.funded).length,
        milestonesTotal: states.length,
        boundaries,
    };

    return <StudioFiller initial={initial} />;
}
