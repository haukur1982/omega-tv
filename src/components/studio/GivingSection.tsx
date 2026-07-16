'use client';

import { useState } from 'react';
import Reveal from './Reveal';
import {
    computeItemStates,
    formatNumberIs,
    type ProjectItem,
} from '@/lib/fundraising-shared';

/**
 * Taktu þátt — the giving payoff of the Ljósið page. Codex review, folded in:
 *
 *   "Use darkness to tell the story. Use light to receive the gift."
 *
 * The section stays dark (dusk-homes backdrop, Eiríkur, live progress, the
 * columns of light) — reverent, cinematic. The giving CARD is warm cream
 * (--skra) with dark ink: clarity, safety, readability (WCAG-safe; no faint
 * --steinn on payment text). Real DB numbers, no invented impact math, fee
 * optional + unchecked + explicit, mobile-first, no embers.
 *
 * Payment honesty: one-click card + auto-monthly are væntanleg (Rapyd). Today
 * the CTA reveals the real methods (Aur + millifærsla) with the chosen amount.
 */

const FEE_RATE = 0.025;

const TIERS = [2500, 5000, 10000, 20000, 50000, 100000];

export default function GivingSection({
    raised,
    goal,
    items,
}: {
    raised: number;
    goal: number;
    items: ProjectItem[];
}) {
    const [monthly, setMonthly] = useState(true);
    const [amount, setAmount] = useState(10000);
    const [custom, setCustom] = useState('');
    const [coverFee, setCoverFee] = useState(false);
    const [methodsOpen, setMethodsOpen] = useState(false);

    const pct = goal > 0 ? Math.floor((raised / goal) * 100) : 0;
    const eff = custom ? Math.max(0, parseInt(custom.replace(/\D/g, ''), 10) || 0) : amount;
    const fee = Math.round(eff * FEE_RATE);
    const total = coverFee ? eff + fee : eff;

    // Columns of light = the real gear milestones, filled cumulatively.
    const states = computeItemStates(items, raised);
    const maxA = Math.max(1, ...items.map((i) => i.amount_isk));
    let cum = 0;
    const cols = items.map((it) => {
        const start = cum;
        cum += it.amount_isk;
        const fill = Math.max(0, Math.min(1, (raised - start) / it.amount_isk));
        return { h: 0.42 + 0.58 * (it.amount_isk / maxA), fill };
    });

    return (
        <section id="styrkja" style={{ position: 'relative', scrollMarginTop: '80px', overflow: 'hidden' }}>
            <style>{CSS}</style>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/studio/dusk-homes.jpg" alt="" aria-hidden className="give-bg" />
            <div aria-hidden className="give-scrim" />

            <div className="give-wrap">
                <Reveal>
                    <div className="give-kick">Taktu þátt</div>
                </Reveal>
                <Reveal delay={0.1}>
                    <h2 className="give-h2">Hver gjöf kveikir á einhverju.</h2>
                </Reveal>
                <Reveal delay={0.18}>
                    <p className="give-lead">
                        Veldu mánaðarlega gjöf eða staka gjöf. Framlagið þitt birtist í
                        framvindunni um leið og það berst.
                    </p>
                </Reveal>

                <div className="give-grid">
                    {/* LEFT — dark: the story + the proof */}
                    <div className="give-left">
                        <Reveal>
                            <div className="give-chip">
                                <span className="av">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img src="/studio/eirikur.jpg" alt="" />
                                    <span className="pl">
                                        <svg width="12" height="14" viewBox="0 0 12 14"><path d="M0 0 L12 7 L0 14 Z" fill="#14120F" /></svg>
                                    </span>
                                </span>
                                <span className="t">
                                    <b>Eiríkur segir frá Ljósinu</b>
                                    <span>2 mín</span>
                                </span>
                            </div>
                        </Reveal>

                        <Reveal delay={0.1}>
                            <div className="give-prog">
                                <div className="lab">Framvinda söfnunar</div>
                                <div className="num">
                                    {formatNumberIs(raised)} kr.
                                    <span> af {formatNumberIs(goal)} kr. · {pct}%</span>
                                </div>
                                <div className="cols" aria-hidden>
                                    {cols.map((c, i) => (
                                        <span key={i} className="col" style={{ height: `${c.h * 100}%` }}>
                                            <span className="f" style={{ height: `${c.fill * 100}%` }} />
                                        </span>
                                    ))}
                                </div>
                                <div className="miles">
                                    {states.filter((s) => s.funded).length} af {states.length} áföngum í höfn
                                </div>
                            </div>
                        </Reveal>
                    </div>

                    {/* RIGHT — cream: the giving card */}
                    <Reveal delay={0.14}>
                        <div className="give-card">
                            <div className="card-head">Þín gjöf</div>

                            <div className="seg">
                                <button className={monthly ? 'on' : ''} onClick={() => setMonthly(true)}>Gefa mánaðarlega</button>
                                <button className={!monthly ? 'on' : ''} onClick={() => setMonthly(false)}>Stök gjöf</button>
                            </div>

                            <div className="amts">
                                {TIERS.map((v) => (
                                    <button
                                        key={v}
                                        className={!custom && v === amount ? 'amt on' : 'amt'}
                                        onClick={() => { setAmount(v); setCustom(''); }}
                                    >
                                        {formatNumberIs(v)} kr.
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

                            <p className="help">
                                {formatNumberIs(eff)} kr.{monthly ? ' á mánuði' : ''} hjálpa til við að fjármagna
                                daglega dagskrá.
                            </p>

                            <label className="fee">
                                <input type="checkbox" checked={coverFee} onChange={(e) => setCoverFee(e.target.checked)} />
                                <span>Bæta {formatNumberIs(fee)} kr. við fyrir færslugjaldi</span>
                            </label>

                            <button className="cta" onClick={() => setMethodsOpen((o) => !o)}>
                                Halda áfram með {formatNumberIs(total)} kr.{monthly ? ' á mánuði' : ''}
                                <svg width="18" height="12" viewBox="0 0 18 12" aria-hidden><path d="M1 6 H16 M11 1 L16 6 L11 11" fill="none" stroke="#C88A3E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                            </button>

                            {methodsOpen && (
                                <div className="methods">
                                    <div className="m-row"><span>Aur</span><b>@Omega</b></div>
                                    <div className="m-row"><span>Millifærsla</span><b>0113-26-25707</b></div>
                                    <div className="m-row"><span>Skýring</span><b>Ljósið</b></div>
                                    <p className="m-note">Kortagreiðsla og sjálfvirkar mánaðarlegar gjafir eru væntanlegar.</p>
                                </div>
                            )}

                            <p className="safe">
                                Í dag er greitt með Aur eða millifærslu, merkt „Ljósið“. Örugg
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
.give-bg{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;z-index:0}
.give-scrim{position:absolute;inset:0;z-index:1;background:
  linear-gradient(90deg,rgba(20,18,15,0.90) 0%,rgba(20,18,15,0.62) 44%,rgba(20,18,15,0.70) 68%,rgba(20,18,15,0.93) 100%),
  linear-gradient(180deg,rgba(20,18,15,0.80) 0%,rgba(20,18,15,0.34) 32%,rgba(20,18,15,0.88) 100%)}
.give-wrap{position:relative;z-index:2;max-width:80rem;margin:0 auto;padding:clamp(72px,10vw,120px) var(--rail-padding)}
.give-kick{font-family:var(--font-sans);font-size:11px;font-weight:700;letter-spacing:0.22em;text-transform:uppercase;color:var(--kerti)}
.give-h2{margin:16px 0 12px;font-family:var(--font-display);font-weight:300;font-size:clamp(30px,3.6vw,48px);line-height:1.12;color:var(--ljos);max-width:24ch}
.give-lead{margin:0 0 44px;font-family:var(--font-serif);font-size:17px;line-height:1.6;color:var(--moskva);max-width:52ch}
.give-grid{display:grid;grid-template-columns:1fr 460px;gap:clamp(32px,4vw,56px);align-items:stretch}
.give-left{display:flex;flex-direction:column;justify-content:space-between;gap:28px}

.give-chip{display:inline-flex;align-items:center;gap:13px;background:rgba(36,32,25,0.55);backdrop-filter:blur(8px);border:1px solid rgba(246,242,234,0.12);border-radius:100px;padding:7px 20px 7px 7px}
.give-chip .av{position:relative;width:44px;height:44px;border-radius:50%;overflow:hidden;flex:0 0 auto}
.give-chip .av img{width:100%;height:100%;object-fit:cover}
.give-chip .av .pl{position:absolute;inset:0;background:rgba(20,18,15,0.30);display:grid;place-items:center}
.give-chip .t b{display:block;font-family:var(--font-serif);font-size:15px;font-weight:400;color:var(--ljos)}
.give-chip .t span{font-size:12px;color:var(--moskva)}

.give-prog{margin-top:0}
.give-prog .lab{font-family:var(--font-sans);font-size:11px;font-weight:700;letter-spacing:0.2em;text-transform:uppercase;color:var(--moskva)}
.give-prog .num{font-family:var(--font-serif);font-size:clamp(26px,3vw,34px);color:var(--ljos);font-variant-numeric:tabular-nums;margin-top:6px}
.give-prog .num span{font-family:var(--font-sans);font-size:14px;color:var(--moskva)}
.give-prog .cols{display:flex;align-items:flex-end;gap:12px;height:335px;margin-top:22px;max-width:460px}
.give-prog .col{flex:1;position:relative;border-radius:7px 7px 3px 3px;overflow:hidden;background:rgba(20,18,15,0.5);border:1px solid rgba(246,242,234,0.12)}
.give-prog .col .f{position:absolute;left:0;right:0;bottom:0;background:linear-gradient(180deg,#F4C57E,#E9A860 30%,#C6853B);box-shadow:0 0 24px rgba(233,168,96,0.55)}
.give-prog .col .f::before{content:"";position:absolute;top:0;left:0;right:0;height:3px;background:#FFF3DE;box-shadow:0 0 11px 2px rgba(255,240,210,0.8)}
.give-prog .miles{margin-top:14px;font-family:var(--font-sans);font-size:12px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;color:var(--gull)}

.give-card{background:var(--skra);color:var(--skra-djup);border-radius:16px;padding:28px 28px 24px;box-shadow:0 40px 90px -30px rgba(0,0,0,0.85)}
.give-card .card-head{font-family:var(--font-display);font-weight:400;font-size:22px;color:var(--skra-djup);margin-bottom:18px}
.give-card .seg{display:grid;grid-template-columns:1fr 1fr;gap:6px;background:rgba(27,24,20,0.06);border-radius:10px;padding:5px;margin-bottom:16px}
.give-card .seg button{border:0;background:transparent;color:var(--skra-mjuk);font-family:var(--font-sans);font-size:14px;font-weight:600;padding:12px;border-radius:7px;cursor:pointer}
.give-card .seg button.on{background:var(--skra-djup);color:var(--skra)}
.give-card .amts{display:grid;grid-template-columns:repeat(3,1fr);gap:10px}
.give-card .amt{background:transparent;border:1px solid rgba(27,24,20,0.16);border-radius:9px;padding:15px 0;text-align:center;font-family:var(--font-sans);font-size:16px;font-weight:600;color:var(--skra-djup);cursor:pointer;font-variant-numeric:tabular-nums}
.give-card .amt.on{border-color:var(--gull);background:rgba(200,138,62,0.12);color:#8A5A22}
.give-card .custom{margin-top:10px;display:flex;align-items:center;gap:10px;background:transparent;border:1px solid rgba(27,24,20,0.16);border-radius:9px;padding:13px 16px;color:var(--skra-mjuk)}
.give-card .custom input{flex:1;background:transparent;border:0;color:var(--skra-djup);font-family:var(--font-sans);font-size:15px;outline:none}
.give-card .custom input::placeholder{color:var(--skra-mjuk)}
.give-card .help{margin:16px 0 0;font-family:var(--font-serif);font-size:15px;line-height:1.5;color:var(--skra-mjuk)}
.give-card .fee{display:flex;align-items:center;gap:11px;margin-top:16px;font-family:var(--font-sans);font-size:14px;color:var(--skra-mjuk);cursor:pointer}
.give-card .fee input{width:19px;height:19px;accent-color:var(--gull);flex:0 0 auto}
.give-card .cta{margin-top:22px;width:100%;display:flex;align-items:center;justify-content:center;gap:12px;background:var(--nott);color:var(--ljos);border:0;border-radius:9px;padding:17px;font-family:var(--font-sans);font-size:16px;font-weight:600;cursor:pointer}
.give-card .methods{margin-top:14px;border:1px solid rgba(27,24,20,0.14);border-radius:10px;padding:14px 16px}
.give-card .m-row{display:flex;justify-content:space-between;font-family:var(--font-sans);font-size:14px;padding:5px 0}
.give-card .m-row span{color:var(--skra-mjuk)}
.give-card .m-row b{color:var(--skra-djup);font-variant-numeric:tabular-nums;font-weight:600}
.give-card .m-note{margin:8px 0 0;font-size:12.5px;color:var(--skra-mjuk)}
.give-card .safe{margin:14px 0 0;font-family:var(--font-sans);font-size:12.5px;line-height:1.5;color:var(--skra-mjuk);text-align:center}

@media (max-width:760px){
  .give-grid{grid-template-columns:1fr;gap:36px}
  .give-card{padding:24px 20px 22px}
  .give-card .amts{grid-template-columns:repeat(2,1fr)}
  .give-prog .cols{max-width:none}
}
`;
