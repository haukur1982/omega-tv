'use client';

import Reveal from './Reveal';
import { formatNumberIs, formatMkr } from '@/lib/fundraising-shared';

/**
 * Landing hero for the camera campaign — light register.
 *
 * The first version put the copy over a darkened photograph, which is how you
 * shoot a film poster and not how you ask someone for money. This one is an
 * editorial split: vellum on the left carrying the whole proposition in ink,
 * the daylit studio on the right carrying the feeling. Nothing is dimmed to
 * make text readable, so the page opens bright.
 *
 * Traffic arrives from an ad and decides in about four seconds, so the left
 * column still holds all four things at once: the occasion (34 years), the ask
 * (three cameras), the proof (live total) and the action.
 */
export default function StudioHero({ raised, goal }: { raised: number; goal: number }) {
    const pct = goal > 0 ? Math.min(100, (raised / goal) * 100) : 0;

    return (
        <section className="sh">
            <style>{CSS}</style>

            <div className="sh-wrap">
                <div className="sh-inner">
                    <Reveal>
                        <div className="sh-pill">Omega 34 ára · Afmælissöfnun</div>
                    </Reveal>

                    <Reveal delay={0.1}>
                        <h1 className="sh-h1">Þrjár myndavélar fyrir Omega.</h1>
                    </Reveal>

                    <Reveal delay={0.2}>
                        <p className="sh-lead">
                            Í 34 ár hefur Omega borið ljós inn á íslensk heimili. Til að senda
                            út daglega dagskrá, viðtöl og hlaðvörp þarf stöðin þrjár
                            stúdíómyndavélar. Þetta er afmælisgjöfin.
                        </p>
                    </Reveal>

                    {/* The ask and the proof, before any scrolling */}
                    <Reveal delay={0.3}>
                        <div className="sh-stat">
                            <div className="sh-nums">
                                <span className="big">{formatNumberIs(raised)} kr.</span>
                                <span className="of">af {formatMkr(goal)} markmiði</span>
                            </div>
                            <div
                                className="sh-bar"
                                role="progressbar"
                                aria-valuemin={0}
                                aria-valuemax={goal}
                                aria-valuenow={raised}
                                aria-label="Söfnun fyrir myndavélar"
                            >
                                <div
                                    className="sh-fill"
                                    style={{ width: `${Math.max(pct, raised > 0 ? 1.5 : 0)}%` }}
                                />
                            </div>
                        </div>
                    </Reveal>

                    <Reveal delay={0.4}>
                        <div className="sh-acts">
                            <a href="#gefa" className="sh-cta">Gefa til Omega</a>
                            <a href="#velarnar" className="sh-ghost">Hvað fer gjöfin í? →</a>
                        </div>
                    </Reveal>
                </div>
            </div>

            <div className="sh-photo">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/studio/light-hero.jpg" alt="" aria-hidden />
            </div>
        </section>
    );
}

const CSS = `
/* The copy sits in the site's normal 80rem container, so its left edge lines
   up exactly with every section below. The photograph is taken out of flow and
   pinned to the right half — using 100vw to fake the same alignment put the
   text 3px off, because 100vw counts the scrollbar and the container does not. */
.sh{position:relative;background:var(--skra);color:var(--skra-djup)}
.sh-wrap{position:relative;z-index:1;max-width:80rem;margin:0 auto;
    padding:clamp(124px,15vh,168px) var(--rail-padding) clamp(64px,9vh,96px)}
.sh-inner{max-width:min(36rem,46%)}

.sh-pill{display:inline-block;font-family:var(--font-sans);font-size:11px;font-weight:700;
    letter-spacing:0.22em;text-transform:uppercase;color:#8A5A22;
    background:rgba(200,138,62,0.10);border:1px solid rgba(200,138,62,0.42);
    border-radius:100px;padding:7px 16px;margin-bottom:26px}

.sh-h1{margin:0;max-width:14ch;font-family:var(--font-display);font-weight:300;
    font-size:clamp(40px,5vw,72px);line-height:1.03;letter-spacing:-0.012em;
    color:var(--skra-djup)}

.sh-lead{margin:22px 0 0;max-width:46ch;font-family:var(--font-serif);
    font-size:clamp(16.5px,1.35vw,19px);line-height:1.6;color:var(--skra-mjuk)}

.sh-stat{margin-top:36px;max-width:30rem}
.sh-nums{display:flex;align-items:baseline;gap:13px;flex-wrap:wrap}
.sh-nums .big{font-family:var(--font-display);font-weight:300;
    font-size:clamp(32px,3.6vw,46px);line-height:1;color:var(--skra-djup);
    font-variant-numeric:tabular-nums}
.sh-nums .of{font-family:var(--font-sans);font-size:14.5px;color:var(--skra-mjuk);
    font-variant-numeric:tabular-nums}
.sh-bar{margin-top:15px;height:8px;border-radius:100px;
    background:rgba(27,24,20,0.10);overflow:hidden}
.sh-fill{height:100%;border-radius:100px;
    background:linear-gradient(90deg,#8A5A22 0%,var(--gull) 100%)}

.sh-acts{display:flex;gap:12px;flex-wrap:wrap;margin-top:32px}
.sh-cta{display:inline-block;background:var(--kerti);color:var(--nott);
    font-family:var(--font-sans);font-weight:700;font-size:16px;padding:16px 32px;
    border-radius:3px;text-decoration:none;
    box-shadow:0 14px 30px -16px rgba(138,90,34,0.75);
    transition:background 300ms ease}
.sh-cta:hover{background:var(--gull)}
.sh-ghost{display:inline-block;color:var(--skra-djup);font-family:var(--font-sans);
    font-weight:600;font-size:16px;padding:16px 26px;border-radius:3px;
    border:1px solid rgba(27,24,20,0.20);text-decoration:none;
    transition:border-color 300ms ease}
.sh-ghost:hover{border-color:rgba(27,24,20,0.42)}

.sh-photo{position:absolute;top:0;right:0;bottom:0;width:48%;
    overflow:hidden;background:var(--skra-warm)}
.sh-photo img{width:100%;height:100%;object-fit:cover;object-position:18% center;display:block}

@media (max-width:980px){
  .sh{display:flex;flex-direction:column}
  .sh-photo{position:static;order:-1;width:100%;aspect-ratio:16 / 9}
  .sh-photo img{object-position:20% center}
  .sh-wrap{padding:clamp(40px,6vw,56px) var(--rail-padding) clamp(52px,8vw,68px)}
  .sh-inner{max-width:none}
}
/* On a phone a 16:9 band is a 210px sliver. Give the picture room to be a
   picture. */
@media (max-width:640px){
  .sh-photo{aspect-ratio:4 / 3}
}
`;
