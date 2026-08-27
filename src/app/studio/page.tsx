import { OmegaWordmark } from '@/components/brand/OmegaWordmark';
import CamerasSection from '@/components/studio/CamerasSection';
import GivingSection from '@/components/studio/GivingSection';
import StudioHero from '@/components/studio/StudioHero';
import StudioLegacy from '@/components/studio/studio-legacy';
import { getProjectProgress } from '@/lib/fundraising-db';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export const metadata = {
    title: 'Nýtt stúdíó fyrir Omega',
    description:
        'Fyrsta skrefið í endurnýjun stúdíós Omega er þrjár nýjar myndavélar. Taktu þátt í að koma þeim í loftið.',
    robots: { index: false, follow: false },
};

export default async function StudioPage() {
    const data = await getProjectProgress('nytt-studio');
    const raised = data?.raised_isk ?? 0;
    const goal = data?.project.goal_isk ?? 0;

    return (
        <main className="studio-page">
            <style>{PAGE_CSS}</style>

            <header className="studio-nav">
                <Link href="/" aria-label="Omega — heim" className="studio-logo">
                    <OmegaWordmark height={25} uid="studio-top" />
                </Link>
                <div className="studio-nav-note">Sjónvarpsstöðin Omega · síðan 1992</div>
                <a href="#gefa" className="studio-nav-cta">Taka þátt</a>
            </header>

            <StudioHero raised={raised} goal={goal} />
            <StudioLegacy />

            {data && <CamerasSection items={data.project.items} raised={raised} />}
            {data && (
                <GivingSection
                    raised={raised}
                    goal={goal}
                    giftCount={data.gift_count}
                    gifts={data.recent_gifts}
                />
            )}

            <section className="studio-closing">
                <p>Myndavélarnar eru fyrsta skrefið.</p>
                <h2>Markmiðið er að fagnaðarerindið heyrist.</h2>
                <a href="#gefa">Ég vil taka þátt</a>
            </section>

            <footer className="studio-footer">
                <Link href="/" aria-label="Omega — heim">
                    <OmegaWordmark height={22} uid="studio-bottom" />
                </Link>
                <p>Sjónvarpsstöðin Omega · kt. 630890-1019 · Reykjavík</p>
                <Link href="/">omega.is</Link>
            </footer>
        </main>
    );
}

const PAGE_CSS = `
.studio-page{min-height:100vh;background:#F1EBDD;color:#191611;overflow:hidden}
.studio-nav{position:absolute;z-index:20;top:0;left:0;right:0;height:82px;display:flex;
    align-items:center;gap:28px;padding:0 var(--rail-padding);color:#F7F1E8;
    border-bottom:1px solid rgba(255,255,255,.13)}
.studio-logo{color:inherit;text-decoration:none;display:flex}
.studio-nav-note{font:600 11px/1 var(--font-sans);letter-spacing:.16em;text-transform:uppercase;
    color:rgba(247,241,232,.62);margin-right:auto}
.studio-nav-cta{color:#17130F;background:#E9A860;text-decoration:none;border-radius:999px;
    padding:12px 20px;font:700 14px/1 var(--font-sans);transition:background .2s ease}
.studio-nav-cta:hover{background:#F2B972}

.studio-closing{background:#E9A860;color:#17130F;text-align:center;padding:clamp(76px,10vw,128px) var(--rail-padding)}
.studio-closing p{margin:0 0 16px;font:700 12px/1 var(--font-sans);letter-spacing:.18em;text-transform:uppercase}
.studio-closing h2{max-width:18ch;margin:0 auto;font:400 clamp(38px,6.2vw,78px)/.98 var(--font-display);letter-spacing:-.035em}
.studio-closing a{display:inline-flex;margin-top:34px;padding:15px 24px;border:1px solid rgba(23,19,15,.36);
    border-radius:999px;color:inherit;text-decoration:none;font:700 15px/1 var(--font-sans)}

.studio-footer{min-height:104px;padding:28px var(--rail-padding);display:flex;align-items:center;gap:28px;
    color:#F7F1E8;background:#12100E;border-top:1px solid rgba(255,255,255,.08)}
.studio-footer a{color:inherit;text-decoration:none}
.studio-footer p{margin:0 auto 0 0;color:rgba(247,241,232,.58);font:500 12px/1.5 var(--font-sans)}
.studio-footer>a:last-child{font:700 13px/1 var(--font-sans);letter-spacing:.08em}

@media(max-width:680px){
  .studio-nav{height:70px}.studio-nav-note{display:none}.studio-nav-cta{padding:11px 16px}
  .studio-footer{align-items:flex-start;flex-wrap:wrap;gap:18px}.studio-footer p{order:3;flex-basis:100%}
}
`;
