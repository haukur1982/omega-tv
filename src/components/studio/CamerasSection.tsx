'use client';

import Reveal from './Reveal';
import { computeItemStates, formatIsk, type ProjectItem } from '@/lib/fundraising-shared';

/**
 * What the gift actually buys — three cameras, each one a named thing with a
 * job, a price and a funding state. Gifts fill them in order, so a donor can
 * see which camera their gift is finishing.
 *
 * Light register. A camera that hasn't been started yet is *faded*, not
 * darkened — desaturated toward the paper. Dimming things was what made the
 * first version feel heavy, and "not there yet" should read as waiting rather
 * than as gloom. The camera currently being funded keeps its full colour, so
 * there is always one live thing in the row even at zero.
 */

const IMAGES: Record<string, string> = {
    adalvel: '/studio/light-cam-main.jpg',
    naermyndavel: '/studio/light-cam-close.jpg',
    hlidarvel: '/studio/light-cam-side.jpg',
};

export default function CamerasSection({
    items,
    raised,
}: {
    items: ProjectItem[];
    raised: number;
}) {
    const states = computeItemStates(items, raised);

    return (
        <section id="velarnar" className="cams">
            <style>{CSS}</style>
            <div className="cams-wrap">
                <Reveal>
                    <div className="cams-kick">Hvað fer gjöfin í</div>
                </Reveal>
                <Reveal delay={0.08}>
                    <h2 className="cams-h2">Þrjár vélar, þrjú hlutverk.</h2>
                </Reveal>
                <Reveal delay={0.14}>
                    <p className="cams-lead">
                        Engin óljós upphæð. Þetta er tækjalisti, og þegar síðasta vélin er
                        komin er stúdíóið tilbúið til daglegra útsendinga.
                    </p>
                </Reveal>

                <div className="cams-grid">
                    {states.map((cam, i) => {
                        const spentBefore = states
                            .slice(0, i)
                            .reduce((s, c) => s + c.amount_isk, 0);
                        const fill = Math.max(
                            0,
                            Math.min(
                                1,
                                cam.funded
                                    ? 1
                                    : cam.active
                                      ? (raised - spentBefore) / cam.amount_isk
                                      : 0,
                            ),
                        );
                        return (
                            <Reveal key={cam.key} delay={0.1 * i}>
                                <article className={cam.active ? 'cam on' : 'cam'}>
                                    <div className="cam-img">
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img
                                            src={IMAGES[cam.key] ?? '/studio/light-cam-main.jpg'}
                                            alt=""
                                            aria-hidden
                                            style={{
                                                filter:
                                                    cam.funded || cam.active
                                                        ? 'none'
                                                        : 'saturate(0.5) contrast(0.94) opacity(0.68)',
                                            }}
                                        />
                                        {cam.funded && <span className="cam-badge">Fjármögnuð</span>}
                                    </div>

                                    <div className="cam-body">
                                        <h3 className="cam-name">{cam.label}</h3>
                                        {cam.note && <p className="cam-note">{cam.note}</p>}

                                        <div className="cam-foot">
                                            <div className="cam-bar">
                                                <div
                                                    className="cam-fill"
                                                    style={{ width: `${fill * 100}%` }}
                                                />
                                            </div>
                                            <div className={cam.funded ? 'cam-price done' : 'cam-price'}>
                                                {cam.funded
                                                    ? 'Fjármögnuð að fullu'
                                                    : formatIsk(cam.amount_isk)}
                                            </div>
                                        </div>
                                    </div>
                                </article>
                            </Reveal>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}

const CSS = `
.cams{background:var(--skra-warm);color:var(--skra-djup);
      padding:clamp(72px,10vw,116px) 0;scroll-margin-top:80px}
.cams-wrap{max-width:80rem;margin:0 auto;padding:0 var(--rail-padding)}
.cams-kick{font-family:var(--font-sans);font-size:11px;font-weight:700;
    letter-spacing:0.22em;text-transform:uppercase;color:#8A5A22;margin-bottom:16px}
.cams-h2{margin:0 0 14px;font-family:var(--font-display);font-weight:300;
    font-size:clamp(30px,3.6vw,46px);line-height:1.12;color:var(--skra-djup);max-width:20ch}
.cams-lead{margin:0 0 46px;font-family:var(--font-serif);font-size:17px;line-height:1.6;
    color:var(--skra-mjuk);max-width:54ch}

.cams-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(270px,1fr));
    gap:clamp(16px,2vw,26px)}

.cam{display:flex;flex-direction:column;height:100%;border-radius:10px;overflow:hidden;
    background:var(--skra);border:1px solid rgba(27,24,20,0.09);
    box-shadow:0 18px 40px -28px rgba(27,24,20,0.45)}
.cam.on{border-color:rgba(200,138,62,0.55);
    box-shadow:0 18px 44px -26px rgba(138,90,34,0.5)}

.cam-img{position:relative;aspect-ratio:4 / 3;overflow:hidden;background:var(--skra-warm)}
.cam-img img{width:100%;height:100%;object-fit:cover;display:block}
.cam-badge{position:absolute;top:13px;right:13px;display:inline-flex;align-items:center;
    background:var(--gull);color:var(--skra);font-family:var(--font-sans);font-size:10px;
    font-weight:700;letter-spacing:0.14em;text-transform:uppercase;padding:5px 10px;
    border-radius:3px}

.cam-body{padding:22px 24px 24px;display:flex;flex-direction:column;flex:1;
    border-top:1px solid rgba(27,24,20,0.07)}
.cam-name{margin:0;font-family:var(--font-display);font-weight:400;font-size:23px;
    color:var(--skra-djup)}
.cam-note{margin:9px 0 0;font-family:var(--font-serif);font-size:15px;line-height:1.6;
    color:var(--skra-mjuk);flex:1}
.cam-foot{margin-top:20px}
.cam-bar{height:6px;border-radius:100px;background:rgba(27,24,20,0.10);overflow:hidden}
.cam-fill{height:100%;border-radius:100px;
    background:linear-gradient(90deg,#8A5A22 0%,var(--gull) 100%)}
.cam-price{margin-top:11px;font-family:var(--font-sans);font-variant-numeric:tabular-nums;
    font-size:14px;font-weight:600;letter-spacing:0.04em;color:#8A5A22}
.cam-price.done{color:var(--skra-mjuk)}

@media (max-width:700px){
  .cam-body{padding:20px 20px 22px}
}
`;
