'use client';

import Reveal from './Reveal';
import { formatNumberIs } from '@/lib/fundraising-shared';

export default function StudioHero({ raised, goal }: { raised: number; goal: number }) {
    const pct = goal > 0 ? Math.min(100, Math.round((raised / goal) * 100)) : 0;

    return (
        <section className="campaign-hero">
            <style>{CSS}</style>
            <div className="campaign-hero-image" aria-hidden />
            <div className="campaign-hero-glow" aria-hidden />

            <div className="campaign-hero-inner">
                <Reveal>
                    <p className="campaign-kicker">Fyrsti áfangi · Nýtt stúdíó</p>
                </Reveal>
                <Reveal delay={0.08}>
                    <h1>
                        Þrjár nýjar myndavélar.
                        <span>Fyrsta skrefið í nýju stúdíói.</span>
                    </h1>
                </Reveal>
                <Reveal delay={0.16}>
                    <p className="campaign-intro">
                        Í 34 ár hefur Omega sent fagnaðarerindið inn á íslensk heimili.
                        Nú tökum við næsta skref og byggjum stúdíó fyrir daglega dagskrá,
                        viðtöl og vitnisburði.
                    </p>
                </Reveal>
                <Reveal delay={0.24}>
                    <div className="campaign-actions">
                        <a className="campaign-primary" href="#gefa">Ég vil taka þátt</a>
                        <a className="campaign-secondary" href="#myndavelar">Sjá hvert gjöfin fer</a>
                    </div>
                </Reveal>

                <Reveal delay={0.32}>
                    <div className="campaign-progress">
                        <div className="campaign-progress-copy">
                            <span><b>{formatNumberIs(raised)} kr.</b> hafa safnast</span>
                            <span>{pct}% af {formatNumberIs(goal)} kr.</span>
                        </div>
                        <div className="campaign-track" role="progressbar" aria-label="Framvinda söfnunar"
                            aria-valuemin={0} aria-valuemax={goal} aria-valuenow={raised}>
                            <div style={{ width: `${Math.max(pct, raised > 0 ? 1 : 0)}%` }} />
                        </div>
                        <small>{raised === 0 ? 'Söfnunin er nýhafin.' : 'Gjafir eru skráðar jafnóðum.'}</small>
                    </div>
                </Reveal>
            </div>

            <div className="campaign-count" aria-hidden>
                <strong>03</strong>
                <span>nýjar<br />stúdíómyndavélar</span>
            </div>
        </section>
    );
}

const CSS = `
.campaign-hero{position:relative;min-height:min(900px,100svh);background:#12100E;color:#F7F1E8;overflow:hidden}
.campaign-hero-image{position:absolute;inset:0;background:url('/studio/hero.jpg') center/cover no-repeat;transform:scale(1.015)}
.campaign-hero-image:after{content:'';position:absolute;inset:0;background:linear-gradient(90deg,rgba(13,11,9,.98) 0%,rgba(13,11,9,.86) 39%,rgba(13,11,9,.26) 72%,rgba(13,11,9,.4) 100%)}
.campaign-hero-glow{position:absolute;width:42vw;height:42vw;right:5%;top:4%;border-radius:50%;
    background:rgba(233,168,96,.1);filter:blur(90px);pointer-events:none}
.campaign-hero-inner{position:relative;z-index:2;max-width:80rem;margin:0 auto;padding:clamp(150px,20vh,208px) var(--rail-padding) clamp(72px,9vh,108px)}
.campaign-hero-inner>div{max-width:720px}
.campaign-kicker{margin:0 0 25px;color:#E9A860;font:700 12px/1 var(--font-sans);letter-spacing:.2em;text-transform:uppercase}
.campaign-hero h1{margin:0;font:400 clamp(48px,6.4vw,88px)/.93 var(--font-display);letter-spacing:-.04em;max-width:11.5ch}
.campaign-hero h1 span{display:block;color:#E9A860;font-style:italic}
.campaign-intro{max-width:53ch;margin:28px 0 0;color:rgba(247,241,232,.78);font:400 clamp(18px,1.6vw,21px)/1.58 var(--font-serif)}
.campaign-actions{display:flex;align-items:center;gap:25px;margin-top:35px;flex-wrap:wrap}
.campaign-actions a{text-decoration:none;font:700 15px/1 var(--font-sans)}
.campaign-primary{display:inline-flex;padding:17px 25px;border-radius:999px;background:#E9A860;color:#17130F;box-shadow:0 16px 44px rgba(0,0,0,.28)}
.campaign-secondary{color:#F7F1E8;border-bottom:1px solid rgba(247,241,232,.38);padding:8px 0}
.campaign-progress{margin-top:48px;width:min(100%,570px);padding-top:20px;border-top:1px solid rgba(247,241,232,.18)}
.campaign-progress-copy{display:flex;justify-content:space-between;align-items:baseline;gap:18px;color:rgba(247,241,232,.62);font:500 13px/1.4 var(--font-sans)}
.campaign-progress-copy b{color:#F7F1E8;font:500 24px/1 var(--font-display)}
.campaign-track{height:7px;margin-top:13px;border-radius:999px;background:rgba(247,241,232,.15);overflow:hidden}
.campaign-track div{height:100%;border-radius:inherit;background:#E9A860}
.campaign-progress small{display:block;margin-top:10px;color:rgba(247,241,232,.48);font:500 12px/1.4 var(--font-sans)}
.campaign-count{position:absolute;z-index:2;right:var(--rail-padding);bottom:58px;display:flex;align-items:flex-end;gap:13px;color:#F7F1E8}
.campaign-count strong{font:300 clamp(62px,7vw,104px)/.7 var(--font-display);color:#E9A860}
.campaign-count span{font:700 10px/1.35 var(--font-sans);letter-spacing:.13em;text-transform:uppercase;color:rgba(247,241,232,.64)}
@media(max-width:860px){.campaign-hero-image{background-position:61% center}.campaign-hero-image:after{background:linear-gradient(90deg,rgba(13,11,9,.96),rgba(13,11,9,.68))}.campaign-count{display:none}}
@media(max-width:600px){
  .campaign-hero{min-height:820px}.campaign-hero-image{background-position:62% center;opacity:.72}
  .campaign-hero-image:after{background:linear-gradient(180deg,rgba(13,11,9,.55) 0%,rgba(13,11,9,.9) 48%,#0D0B09 100%)}
  .campaign-hero-inner{padding-top:128px}.campaign-hero h1{font-size:clamp(45px,13vw,62px)}
  .campaign-intro{font-size:18px}.campaign-progress-copy{align-items:flex-start;flex-direction:column;gap:6px}
}
`;
