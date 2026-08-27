'use client';

import { useState } from 'react';
import Reveal from './Reveal';
import { formatNumberIs, type PublicGift } from '@/lib/fundraising-shared';

/**
 * Taktu þátt — the giving moment, in the light register.
 *
 * The earlier version sat the whole section on a darkened dusk photograph and
 * lit only the card. Now the page is vellum throughout, so the card earns its
 * place by being the *brightest* surface on it, the one thing lifted off the
 * paper. The dusk photograph that used to carry this section is gone: on cream
 * it read as a cold slab and undid the point of the light version.
 *
 * Honest about today: card payment is not live yet, so the button reveals the
 * methods that actually work rather than pretending to take a card.
 */

const FEE_RATE = 0.025;
const TIERS = [5000, 10000, 25000, 50000, 100000, 250000];

const MONTHS = ['janúar', 'febrúar', 'mars', 'apríl', 'maí', 'júní', 'júlí', 'ágúst', 'september', 'október', 'nóvember', 'desember'];
function dateIs(d: string): string {
    const m = d.match(/^(\d{4})-(\d{2})-(\d{2})/);
    return m ? `${Number(m[3])}. ${MONTHS[Number(m[2]) - 1] ?? ''}` : d;
}

export default function GivingSection({
    raised,
    goal,
    giftCount,
    gifts,
}: {
    raised: number;
    goal: number;
    giftCount: number;
    gifts: PublicGift[];
}) {
    const [amount, setAmount] = useState(25000);
    const [custom, setCustom] = useState('');
    const [coverFee, setCoverFee] = useState(false);
    const [methodsOpen, setMethodsOpen] = useState(false);

    const pct = goal > 0 ? Math.floor((raised / goal) * 100) : 0;
    const eff = custom ? Math.max(0, parseInt(custom.replace(/\D/g, ''), 10) || 0) : amount;
    const fee = Math.round(eff * FEE_RATE);
    const total = coverFee ? eff + fee : eff;

    return (
        <section id="gefa" className="give">
            <style>{CSS}</style>

            <div className="give-wrap">
                <Reveal>
                    <div className="give-kick">Taktu þátt</div>
                </Reveal>
                <Reveal delay={0.08}>
                    <h2 className="give-h2">Hver gjöf kveikir á einhverju.</h2>
                </Reveal>
                <Reveal delay={0.14}>
                    <p className="give-lead">
                        Framlagið þitt birtist í söfnuninni um leið og það berst, og fer beint
                        í næstu vél.
                    </p>
                </Reveal>

                <div className="give-grid">
                    {/* The story and the proof */}
                    <div className="give-left">
                        <Reveal>
                            <div className="give-chip">
                                <span className="av">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img src="/studio/eirikur.jpg" alt="" />
                                    <span className="pl">
                                        <svg width="12" height="14" viewBox="0 0 12 14" aria-hidden>
                                            <path d="M0 0 L12 7 L0 14 Z" fill="#F3EDE0" />
                                        </svg>
                                    </span>
                                </span>
                                <span className="t">
                                    <b>Eiríkur segir frá söfnuninni</b>
                                    <span>2 mín</span>
                                </span>
                            </div>
                        </Reveal>

                        <Reveal delay={0.1}>
                            <div className="give-prog">
                                <div className="lab">Staðan núna</div>
                                <div className="num">
                                    {formatNumberIs(raised)} kr.
                                    <span> af {formatNumberIs(goal)} kr. · {pct}%</span>
                                </div>
                                <div className="bar">
                                    <div className="fill" style={{ width: `${Math.max(pct, raised > 0 ? 1.5 : 0)}%` }} />
                                </div>

                                {gifts.length > 0 ? (
                                    <div className="recent">
                                        <div className="lab" style={{ marginBottom: '10px' }}>
                                            {giftCount} {giftCount === 1 ? 'gjöf hefur borist' : 'gjafir hafa borist'}
                                        </div>
                                        {gifts.slice(0, 4).map((g, i) => (
                                            <div key={i} className="gift">
                                                <span>{g.donor_name ?? 'Nafnlaus'} <em>· {dateIs(g.given_at)}</em></span>
                                                <b>{formatNumberIs(g.amount_isk)} kr.</b>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="first">Söfnunin er nýhafin. Fyrsta gjöfin gæti verið þín.</p>
                                )}
                            </div>
                        </Reveal>

                    </div>

                    {/* The giving card — the brightest surface on the page */}
                    <Reveal delay={0.12}>
                        <div className="give-card">
                            <div className="card-head">Þín gjöf</div>

                            <div className="amts">
                                {TIERS.map((v) => (
                                    <button
                                        key={v}
                                        className={!custom && v === amount ? 'amt on' : 'amt'}
                                        onClick={() => { setAmount(v); setCustom(''); }}
                                    >
                                        {formatNumberIs(v)}
                                    </button>
                                ))}
                            </div>
                            <div className="custom">
                                <span>kr.</span>
                                <input
                                    inputMode="numeric"
                                    placeholder="Önnur upphæð"
                                    value={custom}
                                    onChange={(e) => setCustom(e.target.value)}
                                />
                            </div>

                            <label className="fee">
                                <input type="checkbox" checked={coverFee} onChange={(e) => setCoverFee(e.target.checked)} />
                                <span>Bæta {formatNumberIs(fee)} kr. við fyrir færslugjaldi</span>
                            </label>

                            <button className="cta" onClick={() => setMethodsOpen(true)}>
                                Gefa {formatNumberIs(total)} kr.
                                <svg width="18" height="12" viewBox="0 0 18 12" aria-hidden>
                                    <path d="M1 6 H16 M11 1 L16 6 L11 11" fill="none" stroke="#E9A860" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </button>

                            {methodsOpen && (
                                <div className="methods">
                                    <div className="m-row"><span>Aur</span><b>@Omega</b></div>
                                    <div className="m-row"><span>Millifærsla</span><b>0113-26-25707</b></div>
                                    <div className="m-row"><span>Kennitala</span><b>630890-1019</b></div>
                                    <div className="m-row"><span>Skýring</span><b>Myndavél</b></div>
                                    <p className="m-note">Kortagreiðsla er væntanleg.</p>
                                </div>
                            )}

                            <p className="safe">
                                Greitt með Aur eða millifærslu, merkt „Myndavél“. Örugg
                                kortagreiðsla er væntanleg.
                            </p>
                        </div>
                    </Reveal>
                </div>
            </div>
        </section>
    );
}

const CSS = `
.give{background:var(--skra);color:var(--skra-djup);scroll-margin-top:80px}
.give-wrap{max-width:80rem;margin:0 auto;padding:clamp(72px,10vw,116px) var(--rail-padding)}
.give-kick{font-family:var(--font-sans);font-size:11px;font-weight:700;letter-spacing:0.22em;text-transform:uppercase;color:#8A5A22}
.give-h2{margin:16px 0 12px;font-family:var(--font-display);font-weight:300;font-size:clamp(30px,3.6vw,46px);line-height:1.12;color:var(--skra-djup);max-width:22ch}
.give-lead{margin:0 0 44px;font-family:var(--font-serif);font-size:17px;line-height:1.6;color:var(--skra-mjuk);max-width:48ch}
.give-grid{display:grid;grid-template-columns:1fr 440px;gap:clamp(32px,4vw,56px);align-items:start}

.give-chip{display:inline-flex;align-items:center;gap:13px;background:var(--skra-warm);border:1px solid rgba(27,24,20,0.10);border-radius:100px;padding:7px 20px 7px 7px}
.give-chip .av{position:relative;width:44px;height:44px;border-radius:50%;overflow:hidden;flex:0 0 auto}
.give-chip .av img{width:100%;height:100%;object-fit:cover}
.give-chip .av .pl{position:absolute;inset:0;background:rgba(27,24,20,0.42);display:grid;place-items:center}
.give-chip .t b{display:block;font-family:var(--font-serif);font-size:15px;font-weight:400;color:var(--skra-djup)}
.give-chip .t span{font-size:12px;color:var(--skra-mjuk)}

.give-prog{margin-top:30px}
.give-prog .lab{font-family:var(--font-sans);font-size:11px;font-weight:700;letter-spacing:0.2em;text-transform:uppercase;color:var(--skra-mjuk)}
.give-prog .num{font-family:var(--font-serif);font-size:clamp(26px,3vw,34px);color:var(--skra-djup);font-variant-numeric:tabular-nums;margin-top:6px}
.give-prog .num span{font-family:var(--font-sans);font-size:14px;color:var(--skra-mjuk)}
.give-prog .bar{height:8px;border-radius:100px;background:rgba(27,24,20,0.10);overflow:hidden;margin-top:16px;max-width:440px}
.give-prog .fill{height:100%;border-radius:100px;background:linear-gradient(90deg,#8A5A22 0%,var(--gull) 100%)}
.give-prog .recent{margin-top:26px;max-width:440px}
.give-prog .gift{display:flex;justify-content:space-between;gap:14px;padding:9px 0;border-bottom:1px solid rgba(27,24,20,0.10);font-family:var(--font-serif);font-size:15px;color:var(--skra-djup)}
.give-prog .gift em{font-style:normal;color:var(--skra-mjuk)}
.give-prog .gift b{font-family:var(--font-sans);font-size:14px;font-weight:600;color:#8A5A22;font-variant-numeric:tabular-nums;white-space:nowrap}
.give-prog .first{margin:22px 0 0;font-family:var(--font-serif);font-style:italic;font-size:16.5px;color:var(--skra-mjuk)}


.give-card{background:#FDFBF6;color:var(--skra-djup);border-radius:16px;padding:28px 28px 24px;
    border:1px solid rgba(27,24,20,0.08);box-shadow:0 30px 70px -34px rgba(27,24,20,0.45)}
.give-card .card-head{font-family:var(--font-display);font-weight:400;font-size:22px;margin-bottom:18px}
.give-card .amts{display:grid;grid-template-columns:repeat(3,1fr);gap:9px}
.give-card .amt{background:transparent;border:1px solid rgba(27,24,20,0.16);border-radius:9px;padding:15px 0;text-align:center;font-family:var(--font-sans);font-size:15px;font-weight:600;color:var(--skra-djup);cursor:pointer;font-variant-numeric:tabular-nums}
.give-card .amt.on{border-color:var(--gull);background:rgba(200,138,62,0.12);color:#8A5A22}
.give-card .custom{margin-top:9px;display:flex;align-items:center;gap:10px;border:1px solid rgba(27,24,20,0.16);border-radius:9px;padding:13px 16px;color:var(--skra-mjuk)}
.give-card .custom input{flex:1;background:transparent;border:0;color:var(--skra-djup);font-family:var(--font-sans);font-size:15px;outline:none}
.give-card .custom input::placeholder{color:var(--skra-mjuk)}
.give-card .fee{display:flex;align-items:center;gap:11px;margin-top:16px;font-family:var(--font-sans);font-size:14px;color:var(--skra-mjuk);cursor:pointer}
.give-card .fee input{width:19px;height:19px;accent-color:var(--gull);flex:0 0 auto}
.give-card .cta{margin-top:20px;width:100%;display:flex;align-items:center;justify-content:center;gap:12px;background:var(--nott);color:var(--ljos);border:0;border-radius:9px;padding:18px;font-family:var(--font-sans);font-size:16px;font-weight:600;cursor:pointer}
.give-card .methods{margin-top:14px;border:1px solid rgba(27,24,20,0.14);border-radius:10px;padding:14px 16px}
.give-card .m-row{display:flex;justify-content:space-between;font-family:var(--font-sans);font-size:14px;padding:5px 0}
.give-card .m-row span{color:var(--skra-mjuk)}
.give-card .m-row b{color:var(--skra-djup);font-variant-numeric:tabular-nums;font-weight:600}
.give-card .m-note{margin:8px 0 0;font-size:12.5px;color:var(--skra-mjuk)}
.give-card .safe{margin:14px 0 0;font-family:var(--font-sans);font-size:12.5px;line-height:1.5;color:var(--skra-mjuk);text-align:center}

@media (max-width:860px){
  .give-grid{grid-template-columns:1fr;gap:36px}
  .give-card{padding:24px 20px 22px}
  .give-card .amts{grid-template-columns:repeat(2,1fr)}
}
`;
