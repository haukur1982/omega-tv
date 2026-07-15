import BroadcastGraphic, { type BroadcastStatus } from '@/components/studio/BroadcastGraphic';
import { getProjectProgress } from '@/lib/fundraising-db';
import { computeItemStates, milestoneBoundaries } from '@/lib/fundraising-shared';

/**
 * /studio/skjar — the TriCaster broadcast graphic. Bring it in over NDI
 * (NewTek NDI Screen Capture of a full-screen browser on the network) or a
 * spare HDMI input, then key/take it in the switcher. See docs/studio-broadcast.md.
 *
 *   /studio/skjar            → full-screen status card (warm-black)
 *   /studio/skjar?layout=bordi → lower-third on chroma green (key it out)
 *
 * Renders bare (no site nav/footer). Live via client polling.
 */
export const dynamic = 'force-dynamic';

export const metadata = {
    title: 'Omega · Ljósið (skjár)',
    robots: { index: false, follow: false },
};

export default async function StudioSkjarPage({
    searchParams,
}: {
    searchParams: Promise<{ layout?: string }>;
}) {
    const { layout } = await searchParams;
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

    return <BroadcastGraphic layout={layout === 'bordi' ? 'bordi' : 'full'} initial={initial} />;
}
