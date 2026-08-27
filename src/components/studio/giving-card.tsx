'use client';

import { useState } from 'react';
import { formatNumberIs } from '@/lib/fundraising-shared';

const AMOUNTS = [5000, 10000, 25000, 50000];

export default function GivingCard() {
    const [amount, setAmount] = useState(25000);
    const [custom, setCustom] = useState('');
    const [showDetails, setShowDetails] = useState(false);
    const [copied, setCopied] = useState<'aur' | 'bank' | null>(null);

    const selected = custom
        ? Math.max(0, Number.parseInt(custom.replace(/\D/g, ''), 10) || 0)
        : amount;

    async function copy(value: string, field: 'aur' | 'bank') {
        try {
            await navigator.clipboard.writeText(value);
            setCopied(field);
            window.setTimeout(() => setCopied(null), 1800);
        } catch {
            setCopied(null);
        }
    }

    return (
        <div className="giving-card">
            <style>{CSS}</style>
            <p className="giving-card-kicker">Ég vil taka þátt</p>
            <h3>Veldu framlag</h3>

            <div className="giving-amounts">
                {AMOUNTS.map((value) => (
                    <button type="button" key={value}
                        className={!custom && amount === value ? 'is-selected' : ''}
                        onClick={() => { setAmount(value); setCustom(''); }}>
                        {formatNumberIs(value)} kr.
                    </button>
                ))}
            </div>

            <label className="giving-custom">
                <span>Önnur upphæð</span>
                <span className="giving-custom-field">
                    <input aria-label="Önnur upphæð" inputMode="numeric" value={custom}
                        placeholder="0" onChange={(event) => setCustom(event.target.value)} />
                    <b>kr.</b>
                </span>
            </label>

            <button type="button" className="giving-open" onClick={() => setShowDetails(true)}>
                Sjá hvernig ég gef {selected > 0 ? `${formatNumberIs(selected)} kr.` : ''}
            </button>

            {showDetails && (
                <div className="giving-details" aria-live="polite">
                    <div className="giving-method giving-method-main">
                        <div><span>Auðveldast</span><strong>Aur · @Omega</strong></div>
                        <button type="button" onClick={() => copy('@Omega', 'aur')}>
                            {copied === 'aur' ? 'Afritað' : 'Afrita'}
                        </button>
                    </div>
                    <div className="giving-method">
                        <div><span>Millifærsla</span><strong>0113-26-25707</strong></div>
                        <button type="button" onClick={() => copy('01132625707', 'bank')}>
                            {copied === 'bank' ? 'Afritað' : 'Afrita'}
                        </button>
                    </div>
                    <dl className="giving-meta">
                        <div><dt>Kennitala</dt><dd>630890-1019</dd></div>
                        <div><dt>Skýring</dt><dd>Myndavélar</dd></div>
                        <div><dt>Upphæð</dt><dd>{formatNumberIs(selected)} kr.</dd></div>
                    </dl>
                </div>
            )}

            <p className="giving-note">
                Kortagreiðsla er í vinnslu. Þangað til er hægt að gefa með Aur eða millifærslu.
            </p>
        </div>
    );
}

const CSS = `
.giving-card{background:#F7F1E8;color:#191611;padding:clamp(26px,4vw,42px);border-radius:18px;box-shadow:0 40px 90px -50px #000}
.giving-card-kicker{margin:0 0 12px;color:#8A5A22;font:700 11px/1 var(--font-sans);letter-spacing:.18em;text-transform:uppercase}
.giving-card h3{margin:0;font:500 clamp(29px,3vw,38px)/1 var(--font-display)}
.giving-amounts{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:25px}
.giving-amounts button{min-height:54px;border:1px solid rgba(25,22,17,.18);border-radius:10px;background:transparent;color:#191611;
    cursor:pointer;font:700 14px/1 var(--font-sans);font-variant-numeric:tabular-nums}
.giving-amounts button.is-selected{border-color:#A56C2B;background:rgba(233,168,96,.18);color:#7A4A18}
.giving-custom{display:block;margin-top:18px;color:#5B5145;font:600 12px/1 var(--font-sans)}
.giving-custom-field{display:flex;align-items:center;margin-top:8px;border-bottom:1px solid rgba(25,22,17,.28)}
.giving-custom input{width:100%;padding:12px 0;border:0;outline:none;background:transparent;color:#191611;font:500 24px/1 var(--font-display)}
.giving-custom b{font:600 13px/1 var(--font-sans)}
.giving-open{width:100%;min-height:58px;margin-top:24px;border:0;border-radius:999px;background:#E9A860;color:#17130F;
    cursor:pointer;font:700 15px/1.2 var(--font-sans);transition:background .2s ease}
.giving-open:hover{background:#F2B972}
.giving-details{margin-top:18px;padding-top:18px;border-top:1px solid rgba(25,22,17,.12)}
.giving-method{display:flex;align-items:center;justify-content:space-between;gap:16px;padding:15px 0;border-bottom:1px solid rgba(25,22,17,.1)}
.giving-method-main{padding:15px;border:1px solid rgba(165,108,43,.3);border-radius:10px;background:rgba(233,168,96,.12)}
.giving-method div{display:flex;flex-direction:column;gap:6px}.giving-method span{color:#75695A;font:600 11px/1 var(--font-sans);text-transform:uppercase;letter-spacing:.11em}
.giving-method strong{font:600 18px/1 var(--font-display);font-variant-numeric:tabular-nums}.giving-method button{border:0;background:transparent;color:#8A5A22;cursor:pointer;font:700 12px/1 var(--font-sans)}
.giving-meta{margin:16px 0 0}.giving-meta div{display:flex;justify-content:space-between;gap:20px;padding:5px 0;font:500 13px/1.4 var(--font-sans)}
.giving-meta dt{color:#75695A}.giving-meta dd{margin:0;font-weight:700;font-variant-numeric:tabular-nums}
.giving-note{margin:17px 0 0;color:#75695A;text-align:center;font:500 12px/1.5 var(--font-sans)}
`;
