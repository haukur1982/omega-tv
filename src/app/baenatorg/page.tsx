import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import BaenatorgClient from "@/components/prayer/BaenatorgClient";
import PrayerCampaignBanner from "@/components/prayer/PrayerCampaignBanner";
import { getPrayers, getTotalPrayCount, getActiveCampaigns } from "@/lib/prayer-db";

/**
 * /baenatorg — the prayer square.
 *
 * Redesigned per the "altar, not form" direction. The permanent
 * right-hand form column is gone; writing a prayer is an *action you
 * invoke* (modal, triggered from the invitation row), not a fixture
 * of the page. The prayer feed is the page.
 *
 * Amber discipline:
 *   - Appears once on the default page: the invitation row CTA
 *   - Appears once more inside the modal: the submit button
 *   - Never on cards ("bið með þér" is a subdued hairline button
 *     that warms to amber only after pressing)
 *
 * Wayfinding (filter tabs, Bænasvar badge) uses --nordurljos slate.
 *
 * FeaturedPrayer ("Bæn dagsins" pastor-authored) and ShowPrayerCluster
 * (prayers linked to a currently-airing show) are deferred — both need
 * schema extensions (a featured_prayers table and a schedule_slot_id
 * relation on prayers). See STATUS.md follow-ups.
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

            {/* Editorial page header — not a marketing hero.
                Title + italic sub, with the all-time counter quietly set
                to the right. No background image — that would compete
                with the register the page needs. */}
            <section
                style={{
                    maxWidth: '84rem',
                    margin: '0 auto',
                    padding: 'clamp(120px, 12vw, 160px) var(--rail-padding) 40px',
                    display: 'grid',
                    gridTemplateColumns: 'minmax(0,1fr) auto',
                    gap: '48px',
                    alignItems: 'end',
                    borderBottom: '1px solid var(--border)',
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
            </section>

            {/* Optional active campaign banner — kept from the pre-redesign
                because it's real data with its own visual language, not a
                form chrome. Sits above the invitation row when present. */}
            {activeCampaign && (
                <section
                    style={{
                        maxWidth: '84rem',
                        margin: '0 auto',
                        padding: '32px var(--rail-padding) 0',
                    }}
                >
                    <PrayerCampaignBanner campaign={activeCampaign} />
                </section>
            )}

            {/* Invitation row → feed → modal. Single column, full-width.
                This is the "altar surface" — the form isn't here until
                invoked. */}
            <section
                style={{
                    maxWidth: '84rem',
                    margin: '0 auto',
                    padding: '0 var(--rail-padding) 96px',
                }}
            >
                <BaenatorgClient initialPrayers={prayers} />
            </section>

            <Footer />
        </main>
    );
}
