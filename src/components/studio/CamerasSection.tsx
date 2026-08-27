'use client';

import Reveal from './Reveal';
import { computeItemStates, formatIsk, type ProjectItem } from '@/lib/fundraising-shared';

const IMAGES: Record<string, string> = {
    adalvel: '/studio/cam-main.jpg',
    naermyndavel: '/studio/cam-close.jpg',
    hlidarvel: '/studio/cam-side.jpg',
};

export default function CamerasSection({ items, raised }: { items: ProjectItem[]; raised: number }) {
    const states = computeItemStates(items, raised);
    const currentIndex = states.findIndex((item) => !item.funded);
    const current = states[currentIndex >= 0 ? currentIndex : states.length - 1];

    return (
        <section id="myndavelar" className="camera-stage">
            <style>{CSS}</style>
            <div className="camera-stage-inner">
                <header className="camera-stage-head">
                    <Reveal>
                        <p>Skýrt og afmarkað verkefni</p>
                        <h2>Hér byrjar nýja stúdíóið.</h2>
                    </Reveal>
                    <Reveal delay={0.08}>
                        <p className="camera-stage-intro">
                            Fyrsti áfanginn er þrjár myndavélar. Hver þeirra hefur sitt
                            hlutverk og hver króna færist inn á þá vél sem er næst í röðinni.
                        </p>
                    </Reveal>
                </header>

                <div className="camera-stage-grid">
                    <Reveal>
                        <figure className="camera-feature">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={IMAGES[current?.key] ?? '/studio/cam-main.jpg'} alt="Ný stúdíómyndavél fyrir Omega" />
                            <figcaption>
                                <span>Næsta í röðinni</span>
                                <b>{current?.label ?? 'Myndavél'}</b>
                            </figcaption>
                        </figure>
                    </Reveal>

                    <div className="camera-list">
                        {states.map((camera, index) => {
                            const spentBefore = states.slice(0, index).reduce((sum, item) => sum + item.amount_isk, 0);
                            const fill = camera.funded
                                ? 100
                                : index === currentIndex
                                    ? Math.max(0, Math.min(100, ((raised - spentBefore) / camera.amount_isk) * 100))
                                    : 0;
                            const isCurrent = index === currentIndex;

                            return (
                                <Reveal key={camera.key} delay={index * 0.07}>
                                    <article className={`camera-row${isCurrent ? ' is-current' : ''}${camera.funded ? ' is-funded' : ''}`}>
                                        <div className="camera-index">0{index + 1}</div>
                                        <div className="camera-row-copy">
                                            <div className="camera-row-title">
                                                <h3>{camera.label}</h3>
                                                <span>{camera.funded ? 'Fjármögnuð' : formatIsk(camera.amount_isk)}</span>
                                            </div>
                                            {camera.note && <p>{camera.note}</p>}
                                            <div className="camera-row-track"><div style={{ width: `${fill}%` }} /></div>
                                        </div>
                                    </article>
                                </Reveal>
                            );
                        })}
                    </div>
                </div>

                <Reveal>
                    <div className="camera-stage-cta">
                        <p>Þegar þriðja vélin er komin er fyrsti áfangi stúdíósins fjármagnaður.</p>
                        <a href="#gefa">Hjálpaðu okkur að ná þangað</a>
                    </div>
                </Reveal>
            </div>
        </section>
    );
}

const CSS = `
.camera-stage{background:#E7DCC7;color:#191611;padding:clamp(82px,10vw,132px) 0;scroll-margin-top:40px}
.camera-stage-inner{max-width:80rem;margin:0 auto;padding:0 var(--rail-padding)}
.camera-stage-head{display:grid;grid-template-columns:1fr minmax(300px,.72fr);gap:50px;align-items:end;margin-bottom:48px}
.camera-stage-head>div:first-child p{margin:0 0 17px;color:#8A5A22;font:700 12px/1 var(--font-sans);letter-spacing:.19em;text-transform:uppercase}
.camera-stage-head h2{max-width:11ch;margin:0;font:400 clamp(42px,5.6vw,70px)/.98 var(--font-display);letter-spacing:-.035em}
.camera-stage-intro{max-width:49ch;margin:0;color:#554C40;font:400 18px/1.65 var(--font-serif)}
.camera-stage-grid{display:grid;grid-template-columns:minmax(0,1.02fr) minmax(340px,.9fr);gap:clamp(36px,5vw,68px);align-items:stretch}
.camera-feature{position:relative;height:100%;min-height:560px;margin:0;overflow:hidden;background:#12100E}
.camera-feature:after{content:'';position:absolute;inset:0;background:linear-gradient(180deg,transparent 52%,rgba(11,9,8,.82) 100%)}
.camera-feature img{display:block;width:100%;height:100%;object-fit:cover}
.camera-feature figcaption{position:absolute;z-index:1;left:28px;right:28px;bottom:25px;display:flex;align-items:end;justify-content:space-between;gap:20px;color:#F7F1E8}
.camera-feature figcaption span{font:700 10px/1 var(--font-sans);letter-spacing:.15em;text-transform:uppercase;color:rgba(247,241,232,.58)}
.camera-feature figcaption b{font:400 24px/1 var(--font-display)}
.camera-list{border-top:1px solid rgba(25,22,17,.18)}
.camera-row{display:grid;grid-template-columns:48px 1fr;gap:14px;padding:26px 0;border-bottom:1px solid rgba(25,22,17,.18)}
.camera-index{padding-top:4px;color:#8A5A22;font:700 11px/1 var(--font-sans);letter-spacing:.14em}
.camera-row-title{display:flex;align-items:baseline;justify-content:space-between;gap:20px}
.camera-row h3{margin:0;font:500 clamp(24px,2.5vw,31px)/1 var(--font-display)}
.camera-row-title span{color:#8A5A22;font:700 12px/1 var(--font-sans);white-space:nowrap}
.camera-row p{margin:10px 0 0;color:#5D5346;font:400 15.5px/1.55 var(--font-serif)}
.camera-row-track{height:4px;margin-top:18px;background:rgba(25,22,17,.1);overflow:hidden}
.camera-row-track div{height:100%;background:#8A5A22}
.camera-row.is-current h3{color:#8A5A22}.camera-row.is-funded{opacity:.68}
.camera-stage-cta{display:flex;align-items:center;justify-content:space-between;gap:32px;margin-top:36px;padding-top:28px;border-top:1px solid rgba(25,22,17,.18)}
.camera-stage-cta p{max-width:48ch;margin:0;color:#554C40;font:400 16px/1.55 var(--font-serif)}
.camera-stage-cta a{flex:none;color:#17130F;text-decoration:none;border-bottom:1px solid #8A5A22;padding:7px 0;font:700 14px/1 var(--font-sans)}
@media(max-width:880px){.camera-stage-head{grid-template-columns:1fr}.camera-stage-grid{grid-template-columns:1fr}.camera-feature{min-height:0;aspect-ratio:16/10}}
@media(max-width:600px){.camera-stage-head{gap:22px}.camera-stage-cta{align-items:flex-start;flex-direction:column}.camera-row{grid-template-columns:34px 1fr}.camera-row-title{align-items:flex-start;flex-direction:column;gap:8px}}
`;
