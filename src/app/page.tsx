import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import HeroV2 from "@/components/home/HeroV2";
import OnAirRibbon from "@/components/home/OnAirRibbon";
import PrayerTicker from "@/components/home/PrayerTicker";
import BaenDagsins from "@/components/home/BaenDagsins";
import UrDagskranni from "@/components/home/UrDagskranni";
import PullQuote from "@/components/home/PullQuote";
import StyrkjaBand from "@/components/home/StyrkjaBand";
import Legacy34Years from "@/components/home/Legacy34Years";
import { getVideos, parseVideoMetadata } from "@/lib/bunny";
import { getAllArticles } from "@/lib/articles-db";
import { getRecentBroadcastPrayers } from "@/lib/sanctuary-db";

/**
 * Heim — homepage.
 *
 * Redesigned per the Heim prototype in the omega-stodin-design skill.
 * Editorial, not content-catalog: fewer sections, each deeper, each
 * with one purpose. The old Netflix-rail home is retired.
 *
 * Composition (top to bottom):
 *   1. HeroV2        — full-bleed broadcast grandeur, static Omega
 *                      brand headline "Við biðjum fyrir Íslandi…"
 *   2. OnAirRibbon   — quiet row showing current or next broadcast
 *   3. PrayerTicker  — single rotating line from recent prayers
 *   4. BaenDagsins   — pastor-authored prayer of the day
 *   5. UrDagskranni  — three recent episodes
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

// Mock fallback so the page is never empty in dev before real data lands.
const MOCK_VIDEOS = [
    { id: 'v1', title: 'Trúin sem sigrar', speaker: 'Í Snertingu', duration: '28', thumbnail: 'https://images.unsplash.com/photo-1504052434569-70ad5836ab65?w=960&h=600&fit=crop' },
    { id: 'v2', title: 'Kraftur bænarinnar', speaker: 'Bænakvöld', duration: '25', thumbnail: 'https://images.unsplash.com/photo-1507692049790-de58290a4334?w=960&h=600&fit=crop' },
    { id: 'v3', title: 'Framtíð miðlunar', speaker: 'Sunnudagssamkoma', duration: '65', thumbnail: 'https://images.unsplash.com/photo-1438232992991-995b7058bbb3?w=960&h=600&fit=crop' },
];

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
    const [latestVideos, latestArticlesRaw, recentPrayers] = await Promise.all([
        getVideos(1, 3).catch(() => []),
        getAllArticles().catch(() => [] as LatestArticle[]),
        getRecentBroadcastPrayers(7).catch(() => []),
    ]);

    const episodes = latestVideos.length > 0
        ? latestVideos.slice(0, 3).map((v) => {
            const meta = parseVideoMetadata(v);
            return {
                id: v.guid,
                title: meta.title,
                speaker: meta.show,
                durationMin: Math.floor(v.length / 60).toString(),
                thumbnail: meta.thumbnail,
            };
        })
        : MOCK_VIDEOS.map((v) => ({
            id: v.id,
            title: v.title,
            speaker: v.speaker,
            durationMin: v.duration,
            thumbnail: v.thumbnail,
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
            <HeroV2 />
            <OnAirRibbon />
            <PrayerTicker lines={tickerLines} />
            <BaenDagsins />
            <UrDagskranni episodes={episodes} />
            {leadArticle && <PullQuote article={leadArticle} />}
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
        return `${identity} ${action} fyrir því sem liggur þeim á hjarta.`;
    }

    return `${identity} ${action} ${extractTopicFragment(clipped)}`;
}

function extractTopicFragment(text: string): string {
    // Heuristic: find "fyrir X" / "um X" phrases to keep a sense of topic.
    const match = text.match(/\b(fyrir|um|að)\b\s+(.{5,60})/i);
    if (match) return `${match[1]} ${match[2]}.`;
    return 'fyrir því sem liggur þeim á hjarta.';
}
