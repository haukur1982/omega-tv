import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import StudioHero from '@/components/studio/StudioHero';
import CamerasSection from '@/components/studio/CamerasSection';
import GivingSection from '@/components/studio/GivingSection';
import { getProjectProgress } from '@/lib/fundraising-db';

/**
 * /studio — the camera campaign landing page.
 *
 * Built to receive paid traffic, so it is deliberately short: the occasion,
 * the ask and the live total in the hero; what the money buys; how to give;
 * one closing line. Four sections, one decision.
 *
 * Everything on it is real — the total comes from gifts actually entered in
 * /admin/styrkir, so an empty campaign honestly reads as empty.
 */

export const dynamic = 'force-dynamic';

export const metadata = {
    title: 'Þrjár myndavélar fyrir Omega',
    description:
        'Omega er 34 ára. Afmælisgjöfin er þrjár stúdíómyndavélar, svo stöðin geti sent út daglega dagskrá, viðtöl og hlaðvörp.',
    robots: { index: false, follow: false },
};

export default async function StudioPage() {
    const data = await getProjectProgress('nytt-studio');
    const raised = data?.raised_isk ?? 0;
    const goal = data?.project.goal_isk ?? 0;

    return (
        <main style={{ minHeight: '100vh', backgroundColor: 'var(--mold)', color: 'var(--ljos)' }}>
            <Navbar styrkjaHref="#gefa" />

            <StudioHero raised={raised} goal={goal} />

            {data && <CamerasSection items={data.project.items} raised={raised} />}

            {data && (
                <GivingSection
                    raised={raised}
                    goal={goal}
                    giftCount={data.gift_count}
                    gifts={data.recent_gifts}
                />
            )}

            {/* Closing — the reason behind the equipment */}
            <section style={{ background: 'var(--mold)', padding: 'clamp(56px, 8vw, 92px) 0' }}>
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
                            maxWidth: '42ch',
                            fontFamily: 'var(--font-display)',
                            fontWeight: 300,
                            fontSize: 'clamp(23px, 2.9vw, 34px)',
                            lineHeight: 1.28,
                            color: 'var(--ljos)',
                        }}
                    >
                        Myndavélar eru ekki markmiðið. Þjóð sem heyrir fagnaðarerindið á
                        hverjum degi, það er markmiðið.
                    </p>
                    <p
                        style={{
                            margin: '26px auto 0',
                            fontFamily: 'var(--font-sans)',
                            fontSize: '12px',
                            letterSpacing: '0.14em',
                            textTransform: 'uppercase',
                            color: 'var(--steinn)',
                        }}
                    >
                        Sjónvarpsstöðin Omega · kt. 630890-1019 · síðan 1992
                    </p>
                </div>
            </section>

            <Footer />
        </main>
    );
}
