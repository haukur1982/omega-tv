import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import BaenatorgClient from "@/components/prayer/BaenatorgClient";
import PrayerCampaignBanner from "@/components/prayer/PrayerCampaignBanner";
import { getPrayers, getTotalPrayCount, getActiveCampaigns } from "@/lib/prayer-db";

/**
 * /baenatorg — the prayer wall.
 *
 * Composition follows the magazine pattern proven on /greinar/[slug]:
 * a dark editorial cover hard-cuts into a cream long-read body. The
 * cover is purely typographic (no photograph) — for a section-index
 * page there is no single canonical image, and the typography alone
 * carries the same weight the article-cover does without one.
 *
 *   1. Dark navbar (chrome)
 *   2. Dark editorial cover — kicker, title, italic excerpt, gold
 *      rule, byline-row (count of prayers held here).
 *   3. Hard cut into cream — `border-bottom: 1px solid var(--border)`,
 *      no gradient transition.
 *   4. Cream body — invitation row, filter strip, prayer feed as
 *      flowing stanzas (no card chrome, gold rule between).
 *   5. Dark footer lands cleanly on top of the cream body.
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

            {/* ─── Dark editorial cover ─────────────────────────────── */}
            <section
                className="article-cover"
                style={{
                    position: 'relative',
                    background: 'var(--nott)',
                    overflow: 'hidden',
                    padding: 'clamp(124px, 11vw, 164px) var(--rail-padding) clamp(56px, 7vw, 88px)',
                    borderBottom: '1px solid var(--border)',
                }}
            >
                <div
                    className="article-cover-shell baenatorg-cover-grid"
                    style={{
                        maxWidth: '80rem',
                        margin: '0 auto',
                        display: 'grid',
                        gridTemplateColumns: 'minmax(0, 48rem) 1fr',
                        gap: 'clamp(48px, 6vw, 96px)',
                        alignItems: 'end',
                    }}
                >
                    <div className="article-cover-copy">
                        <div
                            style={{
                                fontFamily: 'var(--font-sans)',
                                fontSize: '11px',
                                fontWeight: 700,
                                letterSpacing: '0.22em',
                                textTransform: 'uppercase',
                                color: 'var(--nordurljos)',
                                marginBottom: '24px',
                            }}
                        >
                            Bænatorg
                        </div>

                        <h1
                            style={{
                                margin: 0,
                                fontFamily: 'var(--font-serif)',
                                fontSize: 'clamp(40px, 5vw, 70px)',
                                lineHeight: 1.04,
                                letterSpacing: 0,
                                fontWeight: 400,
                                color: 'var(--ljos)',
                                textWrap: 'balance',
                                maxWidth: '15ch',
                            }}
                        >
                            Þar sem bænir mætast.
                        </h1>

                        <p
                            style={{
                                margin: '28px 0 0',
                                fontFamily: 'var(--font-serif)',
                                fontStyle: 'italic',
                                fontSize: 'clamp(20px, 1.8vw, 25px)',
                                lineHeight: 1.48,
                                color: 'var(--moskva)',
                                letterSpacing: 0,
                                textWrap: 'pretty',
                                maxWidth: '34rem',
                            }}
                        >
                            Deildu því sem þungt liggur, berðu aðra fyrir Drottni, og ritaðu bænasvörin þegar þau koma.
                        </p>

                        <div
                            aria-hidden
                            style={{
                                width: '52px',
                                height: '1px',
                                background: 'var(--gull)',
                                margin: '34px 0 20px',
                            }}
                        />

                        <div
                            style={{
                                display: 'flex',
                                alignItems: 'baseline',
                                gap: '14px',
                                flexWrap: 'wrap',
                                fontFamily: 'var(--font-sans)',
                                fontSize: '11.5px',
                                color: 'var(--steinn)',
                                letterSpacing: '0.14em',
                                textTransform: 'uppercase',
                                fontWeight: 600,
                            }}
                        >
                            <span
                                style={{
                                    fontFamily: 'var(--font-serif)',
                                    fontStyle: 'italic',
                                    fontSize: '17px',
                                    color: 'var(--ljos)',
                                    letterSpacing: 0,
                                    textTransform: 'none',
                                    fontWeight: 400,
                                    fontFeatureSettings: '"lnum", "tnum"',
                                }}
                            >
                                {displayCount.toLocaleString('is-IS')} bænir
                            </span>
                            <span style={{ opacity: 0.5 }}>·</span>
                            <span>bornar fram á þessu torgi</span>
                        </div>
                    </div>

                    {/* Right-side epigraph — quiet Scripture voice over
                        the page. Hidden on small viewports where the
                        masthead column owns the full width. */}
                    <aside
                        className="baenatorg-epigraph"
                        style={{
                            textAlign: 'right',
                            color: 'var(--moskva)',
                            maxWidth: '26rem',
                            justifySelf: 'end',
                        }}
                    >
                        <p
                            style={{
                                margin: 0,
                                fontFamily: 'var(--font-serif)',
                                fontStyle: 'italic',
                                fontSize: '19px',
                                lineHeight: 1.5,
                                color: 'var(--moskva)',
                                letterSpacing: 0,
                                textWrap: 'pretty',
                            }}
                        >
                            Komið til mín, öll þér sem erfiðið og þunga eruð hlaðin, og ég mun veita yður hvíld.
                        </p>
                        <div
                            style={{
                                marginTop: '14px',
                                fontFamily: 'var(--font-sans)',
                                fontSize: '11px',
                                fontWeight: 700,
                                letterSpacing: '0.22em',
                                textTransform: 'uppercase',
                                color: 'var(--steinn)',
                            }}
                        >
                            Matteusarguðspjall 11:28
                        </div>
                    </aside>
                </div>
            </section>

            {/* ─── Cream body — invitation, filter, feed ────────────── */}
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
                        padding: 'clamp(24px, 4vw, 48px) var(--rail-padding) clamp(72px, 10vw, 112px)',
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

            <Footer />
        </main>
    );
}
