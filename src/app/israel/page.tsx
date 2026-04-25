import { Metadata } from 'next';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import IsraelMasthead from '@/components/israel/IsraelMasthead';
import IsraelDoorsGrid from '@/components/israel/IsraelDoorsGrid';
import IsraelFoundation from '@/components/israel/IsraelFoundation';
import IsraelGreinarRail from '@/components/israel/IsraelGreinarRail';
import IsraelHolidaysRail from '@/components/israel/IsraelHolidaysRail';
import IsraelDocumentaries from '@/components/israel/IsraelDocumentaries';
import IsraelProphecy from '@/components/israel/IsraelProphecy';
import IsraelPrayerCall from '@/components/israel/IsraelPrayerCall';
import { getArticlesByCategory } from '@/lib/articles-db';
import { getScheduleInRange } from '@/lib/schedule-db';
import { getIsraelEpisodes } from '@/lib/vod-db';
import { getUpcomingHolidays } from '@/lib/israel-holidays';

/**
 * /israel — Omega's Israel section.
 *
 * Editorial flow, top to bottom:
 *
 *   1. Masthead          — Isaiah 62 watchman tone, sets the section's
 *                          purpose. No flag motifs, no Star of David —
 *                          biblical, not partisan.
 *   2. Broadcast band    — surfaces real Israel-related schedule slots
 *                          (Ísrael í brennidepli, CBN Fréttir frá Ísrael).
 *                          Hidden when there's nothing on the schedule.
 *   3. Foundation        — Genesis 12 covenant teaching. Preserved
 *                          theological content from the prior page.
 *   4. Greinar rail      — Israel-tagged articles, with an honest
 *                          empty state ("greinar koma") when none yet.
 *                          Articles auto-flow from the main /greinar
 *                          table when tagged with category='israel'.
 *   5. Prophecy          — Ezekiel 37 dry-bones-to-1948. Restraint:
 *                          teaching tone, not date-setting.
 *   6. Prayer call       — Psalm 122:6, links to /baenatorg for actual
 *                          prayer submission. Closes the section in
 *                          prayer, not politics.
 *
 * News (/israel/frettir) is intentionally absent. News velocity demands
 * a sourcing rhythm that isn't established yet — better to lead with
 * teaching and broadcasts than to ship a stale-news section. See
 * STATUS.md for the deferred news plan.
 */

export const metadata: Metadata = {
    title: 'Ísrael | Omega Stöðin',
    description:
        'Að standa með Ísrael er bæn, ekki stjórnmál. Sáttmálinn, fræðslan, og útsendingarnar á Omega — sem varðmaður á múrnum.',
};

export const revalidate = 60;

const ISRAEL_RX = /ísrael|israel/i;

export default async function IsraelPage() {
    const now = new Date();
    const past = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
    const future = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    const [articles, allSlots, episodes] = await Promise.all([
        getArticlesByCategory('israel').catch(() => []),
        getScheduleInRange(past.toISOString(), future.toISOString()).catch(() => []),
        getIsraelEpisodes(12).catch(() => []),
    ]);

    const israelSlots = allSlots.filter((s) => ISRAEL_RX.test(s.program_title || ''));
    const nextIsraelSlot = israelSlots
        .filter((s) => new Date(s.starts_at).getTime() > now.getTime())
        .sort((a, b) => new Date(a.starts_at).getTime() - new Date(b.starts_at).getTime())[0]
        ?? null;
    const holidays = getUpcomingHolidays(now).slice(0, 5);

    return (
        <main style={{ minHeight: '100vh', backgroundColor: 'var(--mold)', color: 'var(--ljos)' }}>
            <Navbar />
            <IsraelMasthead nextSlot={nextIsraelSlot} />
            <IsraelDoorsGrid />
            <IsraelFoundation />
            <IsraelGreinarRail articles={articles} />
            <IsraelHolidaysRail holidays={holidays} />
            <IsraelDocumentaries episodes={episodes} />
            <IsraelProphecy />
            <IsraelPrayerCall />
            <Footer />
        </main>
    );
}
