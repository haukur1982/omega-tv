import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import StudioHero from '@/components/studio/StudioHero';
import HeroProgressStrip from '@/components/studio/HeroProgressStrip';
import StudioVision from '@/components/studio/StudioVision';
import GearGrid from '@/components/studio/GearGrid';
import ProgressBoard from '@/components/studio/ProgressBoard';
import GivingSection from '@/components/studio/GivingSection';
import { getProjectProgress } from '@/lib/fundraising-db';

/**
 * /studio — the vision fundraising page. First project: Ljósið, Omega's
 * new studio (cameras, lights, audio → daily programs + podcasts).
 *
 * Blackmagic-release energy inside the Omega system: cinematic warm-black
 * imagery, huge Fraunces numerals, a living progress board fed by
 * fundraising_gifts (bank transfers entered in /admin/styrkir today; the
 * Rapyd webhook writes into the same table when the gateway lands).
 *
 * LAUNCH STATE: public but unlinked + noindex (Heimakirkja precedent)
 * until Hawk confirms the real budget numbers. Data renders fresh on
 * every request — a gift entered in admin shows here immediately.
 */

export const dynamic = 'force-dynamic';

export const metadata = {
    title: 'Ljósið, nýja stúdíó Omega',
    description:
        'Ljósið er nýja stúdíó Omega fyrir daglega dagskrá, viðtöl og hlaðvörp. Hér sérðu hvað þarf, hvað er komið inn og hvernig þú getur tekið þátt.',
    robots: { index: false, follow: false },
};

export default async function StudioPage() {
    const data = await getProjectProgress('nytt-studio');

    return (
        <main style={{ minHeight: '100vh', backgroundColor: 'var(--mold)', color: 'var(--ljos)' }}>
            <Navbar styrkjaHref="#styrkja" />
            <StudioHero />
            {data && <HeroProgressStrip raised={data.raised_isk} goal={data.project.goal_isk} />}
            <StudioVision />
            {data && (
                <GivingSection
                    raised={data.raised_isk}
                    goal={data.project.goal_isk}
                    items={data.project.items}
                />
            )}
            {data && (
                <GearGrid
                    items={data.project.items}
                    goal={data.project.goal_isk}
                    raised={data.raised_isk}
                />
            )}
            {data && (
                <ProgressBoard
                    goal={data.project.goal_isk}
                    raised={data.raised_isk}
                    giftCount={data.gift_count}
                    items={data.project.items}
                    gifts={data.recent_gifts}
                    updates={data.updates}
                />
            )}

            {/* Closing — quiet, institutional, honest */}
            <section style={{ background: 'var(--mold)', padding: 'clamp(56px, 8vw, 96px) 0' }}>
                <div
                    style={{
                        maxWidth: '80rem',
                        margin: '0 auto',
                        padding: '0 var(--rail-padding)',
                        textAlign: 'center',
                    }}
                >
                    <p
                        style={{
                            margin: '0 auto',
                            maxWidth: '44ch',
                            fontFamily: 'var(--font-display)',
                            fontWeight: 300,
                            fontSize: 'clamp(24px, 3vw, 36px)',
                            lineHeight: 1.25,
                            color: 'var(--ljos)',
                        }}
                    >
                        Ljósið er ekki markmiðið. Þjóð sem heyrir fagnaðarerindið á hverjum
                        degi, það er markmiðið.
                    </p>
                    <p
                        style={{
                            margin: '24px auto 0',
                            fontFamily: 'var(--font-sans)',
                            fontSize: '12px',
                            letterSpacing: '0.14em',
                            textTransform: 'uppercase',
                            color: 'var(--steinn)',
                        }}
                    >
                        Sjónvarpsstöðin Omega · kt. 630890-1019 · Framvindan birt hér jafnóðum
                    </p>
                </div>
            </section>
            <Footer />
        </main>
    );
}
