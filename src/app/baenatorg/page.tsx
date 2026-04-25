import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import BaenatorgClient from "@/components/prayer/BaenatorgClient";
import PrayerCampaignBanner from "@/components/prayer/PrayerCampaignBanner";
import { getPrayers, getTotalPrayCount, getActiveCampaigns } from "@/lib/prayer-db";

/**
 * /baenatorg — the prayer wall.
 *
 * Composition follows the principle "dark = watching, light = reading":
 *
 *   1. Dark navbar (chrome)
 *   2. Full-bleed contemplative photograph as the banner. A gradient
 *      stack on top darkens the area behind the masthead text, lets
 *      the photograph breathe in the middle, and fades cleanly into
 *      --skra at the bottom edge — same pattern as the article
 *      detail page. The "transition band" is no longer a separate
 *      visible stripe; the image dissolves into the cream below.
 *   3. Vellum page — invitation row, filter strip, prayer feed.
 *      Prayers as flowing stanzas (no card chrome) separated by
 *      thin gold rules.
 *   4. Final transition band on the way OUT (cream → mór → mold)
 *      before the dark footer. No image needed there — pure tonal.
 *   5. Dark footer.
 *
 * The image swap is easy: replace BANNER_IMAGE with a curated Omega
 * photograph (candle on altar, sanctuary interior, hands in prayer,
 * Iceland dawn — anything atmospheric and contemplative).
 */

export const dynamic = 'force-dynamic';

/**
 * Banner photograph. Reuses the Unsplash image that the previous
 * /baenatorg hero used (and which was already in the curated set
 * approved across the site) — a contemplative atmospheric shot.
 * When a real Omega-shot photograph is available (candle on altar,
 * sanctuary interior, hands clasped, Iceland dawn), swap it here.
 *
 * Rule: only use photo IDs that are ALREADY used on another page of
 * the site. That set has been visually verified. Don't introduce
 * new stock URLs without seeing the image first.
 */
const BANNER_IMAGE = 'https://images.unsplash.com/photo-1506748686214-e9df14d4d9d0?q=80&w=2600&auto=format&fit=crop';

export default async function BaenatorgPage() {
    const [prayers, totalCount, campaigns] = await Promise.all([
        getPrayers(),
        getTotalPrayCount(),
        getActiveCampaigns(),
    ]);

    const activeCampaign = campaigns[0] ?? null;
    const displayCount = totalCount + prayers.length;

    return (
        <main style={{ minHeight: '100vh', backgroundColor: 'var(--mold)', color: 'var(--ljos)' }}>
            <Navbar />

            {/* 1. FULL-BLEED BANNER — photograph + gradient stack that
                handles navbar darkening, mid-image breathing room, and
                the fade to vellum cream at the bottom. */}
            <section
                style={{
                    position: 'relative',
                    background: 'var(--nott)',
                    overflow: 'hidden',
                    paddingTop: 'clamp(140px, 14vw, 180px)',
                    paddingBottom: 'clamp(96px, 12vw, 140px)',
                }}
            >
                {/* Photograph */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                    src={BANNER_IMAGE}
                    alt=""
                    style={{
                        position: 'absolute',
                        inset: 0,
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        objectPosition: '50% 45%',
                        filter: 'saturate(0.85) contrast(1.05)',
                    }}
                />

                {/* Gradient stack — same pattern as /greinar/[slug].
                    ONLY two hues in play: warm-black (--nott family)
                    and cream (--skra). Intermediate stops are just
                    opacity variations of those two colors — no
                    mid-brown hues that would band as visible
                    rainbow stripes. Stronger top darkening than the
                    article variant because the masthead occupies
                    more banner surface here. */}
                <div
                    aria-hidden
                    style={{
                        position: 'absolute',
                        inset: 0,
                        background:
                            'linear-gradient(180deg, rgba(20,18,15,0.78) 0%, rgba(20,18,15,0.4) 25%, rgba(20,18,15,0.18) 55%, rgba(243,237,224,0.18) 80%, var(--skra) 100%)',
                    }}
                />

                {/* Subtle amber radial in the upper-right — evening
                    warmth. Stays in both image and no-image cases. */}
                <div
                    aria-hidden
                    style={{
                        position: 'absolute',
                        inset: 0,
                        background:
                            'radial-gradient(ellipse at 80% 22%, rgba(233,168,96,0.14) 0%, transparent 55%)',
                        pointerEvents: 'none',
                    }}
                />

                {/* Masthead — sits over the gradient stack */}
                <div
                    style={{
                        position: 'relative',
                        zIndex: 2,
                        maxWidth: '80rem',
                        margin: '0 auto',
                        padding: '0 var(--rail-padding)',
                        display: 'grid',
                        gridTemplateColumns: 'minmax(0,1fr) auto',
                        gap: '48px',
                        alignItems: 'end',
                    }}
                >
                    <div>
                        <div
                            style={{
                                fontFamily: 'var(--font-sans)',
                                fontSize: '12px',
                                fontWeight: 700,
                                letterSpacing: '0.22em',
                                textTransform: 'uppercase',
                                color: 'var(--gull)',
                                marginBottom: '18px',
                            }}
                        >
                            Bænatorg
                        </div>
                        <h1
                            style={{
                                margin: 0,
                                fontFamily: 'var(--font-serif)',
                                fontSize: 'clamp(44px, 6vw, 76px)',
                                lineHeight: 1.02,
                                letterSpacing: '-0.018em',
                                fontWeight: 400,
                                color: 'var(--ljos)',
                                maxWidth: '760px',
                                textShadow: '0 2px 30px rgba(10,8,5,0.5)',
                            }}
                        >
                            Þar sem bænir mætast.
                        </h1>
                        <p
                            style={{
                                margin: '28px 0 0',
                                fontFamily: 'var(--font-serif)',
                                fontSize: '19px',
                                lineHeight: 1.55,
                                color: 'var(--moskva)',
                                maxWidth: '560px',
                                fontStyle: 'italic',
                                textShadow: '0 1px 18px rgba(10,8,5,0.6)',
                            }}
                        >
                            Deildu því sem þungt liggur, berðu aðra fyrir Drottni, og ritaðu bænasvörin þegar þau koma.
                        </p>
                    </div>

                    <aside style={{ textAlign: 'right', color: 'var(--moskva)' }}>
                        <div
                            style={{
                                fontFamily: 'var(--font-serif)',
                                fontSize: 'clamp(44px, 5vw, 64px)',
                                lineHeight: 1,
                                fontWeight: 400,
                                color: 'var(--ljos)',
                                fontFeatureSettings: '"lnum", "tnum"',
                                letterSpacing: '-0.02em',
                                textShadow: '0 2px 24px rgba(10,8,5,0.55)',
                            }}
                        >
                            {displayCount.toLocaleString('is-IS')}
                        </div>
                        <div
                            style={{
                                marginTop: '10px',
                                fontFamily: 'var(--font-serif)',
                                fontStyle: 'italic',
                                fontSize: '14px',
                                color: 'var(--moskva)',
                                maxWidth: '200px',
                                marginLeft: 'auto',
                                lineHeight: 1.4,
                            }}
                        >
                            bænir bornar fram á þessu torgi
                        </div>
                    </aside>
                </div>
            </section>

            {/* 2. VELLUM PAGE — the lit room. Banner gradient already
                fades into --skra at its bottom edge, so this section
                begins seamlessly without a separate transition band. */}
            <section
                style={{
                    background: 'var(--skra)',
                    color: 'var(--skra-djup)',
                    // Pull up by 1px so the banner's terminal --skra fully
                    // overlaps this section's --skra — eliminates any
                    // hairline rendering seam.
                    marginTop: '-1px',
                }}
            >
                <div
                    style={{
                        maxWidth: '80rem',
                        margin: '0 auto',
                        padding: 'clamp(24px, 4vw, 48px) var(--rail-padding) clamp(64px, 9vw, 96px)',
                    }}
                >
                    {activeCampaign && (
                        <div style={{ marginTop: '8px' }}>
                            <PrayerCampaignBanner campaign={activeCampaign} />
                        </div>
                    )}

                    <BaenatorgClient initialPrayers={prayers} register="light" />
                </div>
            </section>

            {/* 3. EXIT TRANSITION — vellum back to warm-black for the
                footer. Same single-hue principle as the banner top:
                only --skra (cream) and --nott (warm-black) in play,
                opacity stops in between. No intermediate brown hues
                that would band. */}
            <div
                aria-hidden
                style={{
                    height: 'clamp(96px, 12vh, 140px)',
                    background:
                        'linear-gradient(180deg, var(--skra) 0%, rgba(243,237,224,0.2) 22%, rgba(20,18,15,0.18) 50%, rgba(20,18,15,0.55) 80%, var(--mold) 100%)',
                }}
            />

            <Footer />
        </main>
    );
}
