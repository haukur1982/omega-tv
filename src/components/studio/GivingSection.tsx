import Reveal from './Reveal';
import GivingCard from './giving-card';
import { formatNumberIs, type PublicGift } from '@/lib/fundraising-shared';

const MONTHS = ['janúar', 'febrúar', 'mars', 'apríl', 'maí', 'júní', 'júlí', 'ágúst', 'september', 'október', 'nóvember', 'desember'];

function dateIs(date: string): string {
    const match = date.match(/^\d{4}-(\d{2})-(\d{2})/);
    return match ? `${Number(match[2])}. ${MONTHS[Number(match[1]) - 1] ?? ''}` : date;
}

export default function GivingSection({ raised, goal, giftCount, gifts }: {
    raised: number;
    goal: number;
    giftCount: number;
    gifts: PublicGift[];
}) {
    const pct = goal > 0 ? Math.min(100, Math.floor((raised / goal) * 100)) : 0;

    return (
        <section id="gefa" className="giving-section">
            <style>{CSS}</style>
            <div className="giving-section-inner">
                <div className="giving-story">
                    <Reveal>
                        <p className="giving-kicker">Taktu þátt</p>
                        <h2>Hjálpaðu okkur að koma fyrsta áfanganum í loftið.</h2>
                        <p className="giving-lead">
                            Gjafir í þessa söfnun fara í þrjár nýjar stúdíómyndavélar.
                            Upphæðin og framvindan eru sýnileg hér allan tímann.
                        </p>
                    </Reveal>

                    <Reveal delay={0.08}>
                        <div className="giving-progress">
                            <div>
                                <span>Staðan núna</span>
                                <strong>{formatNumberIs(raised)} kr.</strong>
                            </div>
                            <b>{pct}%</b>
                        </div>
                        <div className="giving-track" role="progressbar" aria-label="Framvinda söfnunar"
                            aria-valuemin={0} aria-valuemax={goal} aria-valuenow={raised}>
                            <div style={{ width: `${Math.max(pct, raised > 0 ? 1 : 0)}%` }} />
                        </div>
                        <p className="giving-goal">Markmið · {formatNumberIs(goal)} kr.</p>
                    </Reveal>

                    <Reveal delay={0.12}>
                        {gifts.length > 0 ? (
                            <div className="giving-recent">
                                <p>{giftCount} {giftCount === 1 ? 'gjöf hefur borist' : 'gjafir hafa borist'}</p>
                                {gifts.slice(0, 3).map((gift, index) => (
                                    <div key={`${gift.given_at}-${index}`}>
                                        <span>{gift.donor_name ?? 'Nafnlaus'} · {dateIs(gift.given_at)}</span>
                                        <b>{formatNumberIs(gift.amount_isk)} kr.</b>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="giving-first">Söfnunin er nýhafin. Allar gjafir birtast hér jafnóðum.</p>
                        )}
                    </Reveal>

                    <Reveal delay={0.16}>
                        <figure className="giving-founder">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src="/studio/eirikur.jpg" alt="Eiríkur Sigurbjörnsson, stofnandi Omega" />
                            <figcaption>
                                <b>Eiríkur Sigurbjörnsson</b>
                                <span>Stofnandi Omega</span>
                            </figcaption>
                        </figure>
                    </Reveal>
                </div>

                <Reveal delay={0.1}>
                    <GivingCard />
                </Reveal>
            </div>
        </section>
    );
}

const CSS = `
.giving-section{background:#12100E;color:#F7F1E8;padding:clamp(84px,11vw,142px) 0;scroll-margin-top:20px}
.giving-section-inner{max-width:75rem;margin:0 auto;padding:0 var(--rail-padding);display:grid;grid-template-columns:minmax(0,1fr) minmax(340px,470px);gap:clamp(48px,8vw,108px);align-items:start}
.giving-kicker{margin:0 0 18px;color:#E9A860;font:700 12px/1 var(--font-sans);letter-spacing:.19em;text-transform:uppercase}
.giving-story h2{max-width:12ch;margin:0;font:400 clamp(42px,5.6vw,70px)/.98 var(--font-display);letter-spacing:-.035em}
.giving-lead{max-width:48ch;margin:26px 0 0;color:rgba(247,241,232,.68);font:400 18px/1.62 var(--font-serif)}
.giving-progress{display:flex;align-items:end;justify-content:space-between;gap:20px;margin-top:42px;padding-top:24px;border-top:1px solid rgba(247,241,232,.14)}
.giving-progress>div{display:flex;flex-direction:column;gap:8px}.giving-progress span,.giving-goal{color:rgba(247,241,232,.48);font:600 11px/1 var(--font-sans);letter-spacing:.14em;text-transform:uppercase}
.giving-progress strong{font:400 clamp(32px,4vw,48px)/1 var(--font-display);font-variant-numeric:tabular-nums}.giving-progress>b{color:#E9A860;font:500 23px/1 var(--font-display)}
.giving-track{height:6px;margin-top:16px;background:rgba(247,241,232,.13);border-radius:999px;overflow:hidden}.giving-track div{height:100%;background:#E9A860;border-radius:inherit}
.giving-goal{margin:11px 0 0}.giving-first{margin:25px 0 0;color:rgba(247,241,232,.58);font:italic 16px/1.5 var(--font-serif)}
.giving-recent{margin-top:24px}.giving-recent>p{margin:0 0 8px;color:rgba(247,241,232,.46);font:600 11px/1 var(--font-sans);letter-spacing:.12em;text-transform:uppercase}
.giving-recent>div{display:flex;justify-content:space-between;gap:20px;padding:9px 0;border-bottom:1px solid rgba(247,241,232,.1);font:500 13px/1.4 var(--font-sans)}
.giving-recent span{color:rgba(247,241,232,.62)}.giving-recent b{color:#E9A860;font-variant-numeric:tabular-nums}
.giving-founder{display:flex;align-items:center;gap:15px;margin:32px 0 0;padding-top:25px;border-top:1px solid rgba(247,241,232,.14)}
.giving-founder img{width:58px;height:58px;border-radius:50%;object-fit:cover;object-position:60% 28%;filter:saturate(.8)}
.giving-founder figcaption{display:flex;flex-direction:column;gap:4px}.giving-founder b{font:500 16px/1 var(--font-serif)}.giving-founder span{color:rgba(247,241,232,.5);font:600 10px/1 var(--font-sans);letter-spacing:.12em;text-transform:uppercase}
@media(max-width:850px){.giving-section-inner{grid-template-columns:1fr}.giving-story h2{max-width:15ch}.giving-card{max-width:560px}}
`;
