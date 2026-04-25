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
 *   2. Dark banner — kicker · title · italic deck · counter on
 *      --mold gradient. The "doorway" into the room.
 *   3. Transition band — gradient walks through the warm midtones
 *      (mór → hafrar → pergament → skra). Reads as "light filling
 *      the room from a window," not as a register switch.
 *   4. Vellum page — invitation row, filter strip, prayer feed.
 *      Prayers are flowing stanzas (no card chrome) separated by
 *      thin gold rules. Like reading a book of voices.
 *   5. Transition band reverse — vellum back to warm-dark.
 *   6. Dark footer.
 *
 * The whole page is one continuous warm tonal scale. Register
 * shifts feel like dawn/dusk, not like crossing a threshold.
 */

export const dynamic = 'force-dynamic';

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

            {/* 1. DARK BANNER — the doorway */}
            <section
                style={{
                    background: 'linear-gradient(180deg, var(--nott) 0%, var(--mold) 60%, var(--mor) 100%)',
                    paddingTop: 'clamp(120px, 12vw, 160px)',
                    paddingBottom: 'clamp(56px, 7vw, 80px)',
                }}
            >
                <div
                    style={{
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
                                color: 'var(--moskva)',
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

            {/* 2. TRANSITION BAND — dark to light. Walks through the warm
                midtones so the eye reads dawn, not a register switch. */}
            <div
                aria-hidden
                style={{
                    height: 'clamp(96px, 14vh, 160px)',
                    background:
                        'linear-gradient(180deg, var(--mor) 0%, var(--hafrar) 55%, var(--pergament) 100%)',
                }}
            />

            {/* 3. VELLUM PAGE — the lit room */}
            <section
                style={{
                    background: 'var(--skra)',
                    color: 'var(--skra-djup)',
                }}
            >
                <div
                    style={{
                        maxWidth: '80rem',
                        margin: '0 auto',
                        padding: 'clamp(8px, 2vw, 24px) var(--rail-padding) clamp(64px, 9vw, 96px)',
                    }}
                >
                    {activeCampaign && (
                        <div style={{ marginTop: '24px' }}>
                            <PrayerCampaignBanner campaign={activeCampaign} />
                        </div>
                    )}

                    <BaenatorgClient initialPrayers={prayers} register="light" />
                </div>
            </section>

            {/* 4. TRANSITION BAND reverse — light back to dark */}
            <div
                aria-hidden
                style={{
                    height: 'clamp(96px, 14vh, 160px)',
                    background:
                        'linear-gradient(180deg, var(--pergament) 0%, var(--hafrar) 45%, var(--mor) 100%)',
                }}
            />

            {/* 5. Footer continues into --mold via a final blend */}
            <div
                aria-hidden
                style={{
                    height: '40px',
                    background: 'linear-gradient(180deg, var(--mor) 0%, var(--mold) 100%)',
                }}
            />

            <Footer />
        </main>
    );
}
