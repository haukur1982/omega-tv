'use client';

import Reveal from './Reveal';
import {
    formatNumberIs,
    milestoneBoundaries,
    type ProjectItem,
} from '@/lib/fundraising-shared';

export default function StudioHero({ raised, goal, items }: {
    raised: number;
    goal: number;
    items: ProjectItem[];
}) {
    const pct = goal > 0 ? Math.min(100, Math.round((raised / goal) * 100)) : 0;
    const remaining = Math.max(0, goal - raised);
    const milestones = milestoneBoundaries(items, goal);

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
                    <div className="campaign-progress" aria-labelledby="campaign-progress-title">
                        <div className="campaign-progress-head">
                            <div>
                                <span className="campaign-progress-label" id="campaign-progress-title">
                                    <i aria-hidden /> Staða söfnunar
                                </span>
                                <strong>{formatNumberIs(raised)} <small>kr.</small></strong>
                                <span className="campaign-progress-raised">hafa safnast</span>
                            </div>
                            <div className="campaign-progress-total">
                                <b>{pct}%</b>
                                <span>af {formatNumberIs(goal)} kr. markmiði</span>
                            </div>
                        </div>
                        <div className="campaign-track" role="progressbar" aria-label="Framvinda söfnunar"
                            aria-valuemin={0} aria-valuemax={goal} aria-valuenow={raised}>
                            <div className="campaign-track-fill" style={{ width: `${Math.max(pct, raised > 0 ? 1 : 0)}%` }} />
                            {milestones.map((boundary, index) => (
                                <span
                                    className={`campaign-milestone${raised >= boundary * goal ? ' is-reached' : ''}`}
                                    style={{ left: `${Math.min(99, boundary * 100)}%` }}
                                    key={items[index]?.key ?? index}
                                    aria-hidden
                                >
                                    0{index + 1}
                                </span>
                            ))}
                        </div>
                        <div className="campaign-progress-foot">
                            <span>{remaining > 0 ? `${formatNumberIs(remaining)} kr. eftir` : 'Markmiðinu náð'}</span>
                            <span>{raised === 0 ? 'Söfnunin er nýhafin' : 'Gjafir skráðar jafnóðum'}</span>
                        </div>
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
.campaign-progress{margin-top:44px;width:min(100%,620px);padding:24px 25px 20px;border:1px solid rgba(233,168,96,.32);border-radius:4px;
    background:linear-gradient(135deg,rgba(25,20,15,.86),rgba(18,16,14,.68));box-shadow:0 24px 64px rgba(0,0,0,.2);backdrop-filter:blur(10px)}
.campaign-progress-head{display:flex;align-items:flex-end;justify-content:space-between;gap:26px}
.campaign-progress-head>div:first-child{display:grid;grid-template-columns:auto 1fr;align-items:end;column-gap:9px}
.campaign-progress-label{grid-column:1/-1;display:flex;align-items:center;gap:8px;margin-bottom:11px;color:#E9A860;
    font:700 10px/1 var(--font-sans);letter-spacing:.17em;text-transform:uppercase}
.campaign-progress-label i{width:6px;height:6px;border-radius:50%;background:#E9A860;box-shadow:0 0 0 4px rgba(233,168,96,.12)}
.campaign-progress strong{color:#F7F1E8;font:400 clamp(34px,4vw,48px)/.85 var(--font-display);font-variant-numeric:tabular-nums;letter-spacing:-.03em}
.campaign-progress strong small{font:600 12px/1 var(--font-sans);letter-spacing:.06em;color:rgba(247,241,232,.58)}
.campaign-progress-raised{padding-bottom:2px;color:rgba(247,241,232,.55);font:500 11px/1 var(--font-sans)}
.campaign-progress-total{display:flex;flex-direction:column;align-items:flex-end;gap:7px;text-align:right;padding-bottom:2px}
.campaign-progress-total b{color:#E9A860;font:400 30px/.85 var(--font-display);font-variant-numeric:tabular-nums}
.campaign-progress-total span{color:rgba(247,241,232,.58);font:600 10px/1 var(--font-sans);letter-spacing:.06em;text-transform:uppercase}
.campaign-track{position:relative;height:12px;margin:26px 0 0;border-radius:999px;background:rgba(247,241,232,.13);box-shadow:inset 0 1px 3px rgba(0,0,0,.38)}
.campaign-track-fill{position:absolute;z-index:1;inset:0 auto 0 0;height:100%;border-radius:inherit;background:linear-gradient(90deg,#D98B3A,#F0B874);
    box-shadow:0 0 20px rgba(233,168,96,.28);transition:width .7s ease}
.campaign-milestone{position:absolute;z-index:2;top:50%;width:26px;height:26px;border-radius:50%;display:grid;place-items:center;
    transform:translate(-50%,-50%);color:#E9A860;background:#201A15;border:2px solid #A97137;box-shadow:0 3px 12px rgba(0,0,0,.35);
    font:800 8px/1 var(--font-sans);letter-spacing:.05em}
.campaign-milestone.is-reached{color:#17130F;background:#E9A860;border-color:#201A15}
.campaign-progress-foot{display:flex;justify-content:space-between;gap:20px;margin-top:16px;color:rgba(247,241,232,.52);
    font:600 10px/1.3 var(--font-sans);letter-spacing:.08em;text-transform:uppercase}
.campaign-progress-foot span:first-child{color:rgba(247,241,232,.78)}
.campaign-count{position:absolute;z-index:2;right:var(--rail-padding);bottom:58px;display:flex;align-items:flex-end;gap:13px;color:#F7F1E8}
.campaign-count strong{font:300 clamp(62px,7vw,104px)/.7 var(--font-display);color:#E9A860}
.campaign-count span{font:700 10px/1.35 var(--font-sans);letter-spacing:.13em;text-transform:uppercase;color:rgba(247,241,232,.64)}
@media(min-width:861px){.campaign-hero-image{left:20vw;right:-20vw}}
@media(max-width:860px){.campaign-hero-image{background-position:61% center}.campaign-hero-image:after{background:linear-gradient(90deg,rgba(13,11,9,.96),rgba(13,11,9,.68))}.campaign-count{display:none}}
@media(max-width:600px){
  .campaign-hero{min-height:900px}.campaign-hero-image{background-position:62% center;opacity:.72}
  .campaign-hero-image:after{background:linear-gradient(180deg,rgba(13,11,9,.55) 0%,rgba(13,11,9,.9) 48%,#0D0B09 100%)}
  .campaign-hero-inner{padding-top:128px}.campaign-hero h1{font-size:clamp(45px,13vw,62px)}
  .campaign-intro{font-size:18px}.campaign-progress{padding:21px 18px 18px}.campaign-progress-head{align-items:flex-start;flex-direction:column;gap:18px}
  .campaign-progress-total{align-items:flex-start;text-align:left}.campaign-progress-total b{font-size:27px}.campaign-track{margin-top:24px}
}
`;
