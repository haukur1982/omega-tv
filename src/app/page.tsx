import HomeDevotional from "@/components/home/HomeDevotional";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import HeroV2 from "@/components/home/HeroV2";
import OnAirRibbon from "@/components/home/OnAirRibbon";
import PrayerTicker from "@/components/home/PrayerTicker";
import BaenDagsins from "@/components/home/BaenDagsins";
import UrDagskranni from "@/components/home/UrDagskranni";
import PullQuote from "@/components/home/PullQuote";
import IsraelTeaser from "@/components/home/IsraelTeaser";
import BaekurTeaser from "@/components/home/BaekurTeaser";
import StyrkjaBand from "@/components/home/StyrkjaBand";
import Legacy34Years from "@/components/home/Legacy34Years";
import FeaturedSunday from "@/components/sermon/FeaturedSunday";
import { getAllArticles } from "@/lib/articles-db";
import { getRecentBroadcastPrayers } from "@/lib/sanctuary-db";
import { getFeaturedPrayer } from "@/lib/featured-prayer-db";
import { listPublishedDevotionals } from "@/lib/devotional-db";
import { selectHomeDevotional } from "@/lib/home-content";
import { getNewestEpisodes } from "@/lib/vod-db";
import { getHomeFeatureCandidates } from "@/lib/home-feature-db";
import { selectHomeFeature } from "@/lib/home-feature";
import { resolvePoster } from "@/lib/poster";

/**
 * Heim — homepage.
 *
 * Redesigned per the Heim prototype in the omega-stodin-design skill.
 * Editorial, not content-catalog: fewer sections, each deeper, each
 * with one purpose. The old Netflix-rail home is retired.
 *
 * Composition (top to bottom):
 *   1. HeroV2        — an open invitation to faith in everyday life
 *   2. OnAirRibbon   — quiet row showing current or next broadcast
 *   3. HomeDevotional — a published reading and optional email signup
 *   4. PrayerTicker / FeaturedSunday / UrDagskranni — real community and TV content
 *   5. BaenDagsins   — the latest available prayer, dated honestly
 *   6. PullQuote     — single editorial moment from the newest article
 *   7. StyrkjaBand   — the donation ask, once, on its own terms
 *   8. Legacy34Years — "since 1992" anchor (the audience that's been
 *                      watching Omega for 34 years deserves seeing it)
 *
 * Previously-home components retained in the tree but not mounted
 * on this route (may be revived on /dagskra or similar):
 *   - DagskraStrip, PrayerPresence, Hero (old), HorizontalRail,
 *     VODRailCard, PortraitSermonCard, MagazineArticleCard, etc.
 */

export const revalidate = 60;

type LatestArticle = {
    slug?: string;
    title: string;
    excerpt?: string | null;
    pull_quote?: string | null;
    author_name?: string | null;
    published_at?: string | null;
    reading_minutes?: number | null;
};

export default async function Home() {
    // Parallel data fetch
    const [latestEpisodes, latestArticlesRaw, recentPrayers, featureCandidates, dailyPrayer, devotionals] = await Promise.all([
        getNewestEpisodes(3).catch(() => []),
        getAllArticles().catch(() => [] as LatestArticle[]),
        getRecentBroadcastPrayers(7).catch(() => []),
        getHomeFeatureCandidates().catch(error => {
            console.error('Homepage feature unavailable:', error);
            return [];
        }),
        getFeaturedPrayer().catch(() => null),
        listPublishedDevotionals().then(pieces => ({ pieces, unavailable: false })).catch(error => {
            console.error('Homepage devotional unavailable:', error);
            return { pieces: [], unavailable: true };
        }),
    ]);

    const featured = selectHomeFeature(featureCandidates);
    const devotional = selectHomeDevotional(devotionals.pieces);

    // Pull from the curated episode catalog (real titles, series, scripture,
    // descriptions — the Azotus-generated metadata), NOT the raw Bunny library
    // whose "titles" are just filenames like "Omega TV 22". resolvePoster gives
    // clean key art (branded variant → thumbnail_custom → caption-cropped frame).
    const episodes = latestEpisodes.slice(0, 3).map((e) => ({
            id: e.bunny_video_id,
            title: e.title,
            description: e.description,
            speaker: e.series_title,
            durationMin: e.duration ? Math.floor(e.duration / 60).toString() : '',
            thumbnail: resolvePoster(e, 'portrait_4x5') ?? `/api/bunny/thumbnail/${e.bunny_video_id}`,
        }));

    const latestArticles = (latestArticlesRaw as LatestArticle[]) ?? [];
    const leadArticle = latestArticles.length > 0 ? latestArticles[0] : null;

    // Turn recent broadcast prayers into short ticker strings. Keep it
    // generic ("Systkin biður fyrir…") rather than posting the full
    // prayer body — the ticker is a presence signal, not a content feed.
    const tickerLines = recentPrayers
        .map((p) => tickerLineFor(p.name, p.content, p.is_answered ?? false))
        .filter((s): s is string => !!s)
        .slice(0, 8);

    return (
        <main style={{ minHeight: '100vh', backgroundColor: 'var(--mold)' }}>
            <Navbar />

            {/* ─── Dark masthead + chrome ──────────────────────────── */}
            <HeroV2 readingHref={devotional ? `/hugleidingar/${devotional.slug}` : '/hugleidingar#lesa'} />
            <OnAirRibbon />
            <HomeDevotional piece={devotional} unavailable={devotionals.unavailable} />

            {/* ─── Cream sanctuary ─────────────────────────────────── */}
            <PrayerTicker lines={tickerLines} register="cream" />
            {featured && <FeaturedSunday
                series={featured.series ?? { title: 'Omega', slug: '', host: null, description: null }}
                episode={featured}
                kicker="Úr safni Omega · til áhorfs í dag"
                ctaAccent="ghost"
                compactDescription
            />}
            <UrDagskranni episodes={episodes} register="cream" />
            {dailyPrayer && <BaenDagsins register="cream" prayer={dailyPrayer} />}
            {leadArticle && <PullQuote article={leadArticle} register="pergament" />}

            {/* ─── Dark closing anchor ─────────────────────────────── */}
            <IsraelTeaser />
            <BaekurTeaser />
            <StyrkjaBand />
            <Legacy34Years />
            <Footer />
        </main>
    );
}

/**
 * Turn a submitted prayer into a short ticker-appropriate line.
 * Keeps identity quiet ("Systkin" / "Nafnlaus") and takes the first
 * clause of the prayer body (up to 72 chars) as a gesture toward
 * what the person is praying about, without exposing the full text.
 */
function tickerLineFor(name: string | null, content: string, isAnswered: boolean): string | null {
    if (!content) return null;
    const identity = name && name.trim() && name !== 'Nafnlaus/t' && name !== 'Nafnlaust systkin'
        ? 'Systkin'
        : 'Nafnlaus';
    const action = isAnswered ? 'þakkar fyrir bænasvar' : 'biður';

    const first = content.trim().split(/[.!?]/)[0] ?? '';
    const clipped = first.length > 60 ? `${first.slice(0, 60).trim()}…` : first;

    // Build the line. If the prayer starts with "Bið" or similar, we
    // don't want to redundantly say "Systkin biður: Bið…" — use just
    // the identity + action instead.
    const starts = /^(bið|biðjið|þakka)/i.test(clipped);
    if (starts) {
        return `${identity} ${action} fyrir bænarefni sínu.`;
    }

    return `${identity} ${action} ${extractTopicFragment(clipped)}`;
}

function extractTopicFragment(text: string): string {
    // Heuristic: find "fyrir X" / "um X" phrases to keep a sense of topic.
    const match = text.match(/\b(fyrir|um|að)\b\s+(.{5,60})/i);
    if (match) return `${match[1]} ${match[2]}.`;
    return 'fyrir bænarefni sínu.';
}
