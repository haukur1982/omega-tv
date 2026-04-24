'use client';

import { useState } from 'react';

/**
 * StyrkjaDonationClient — the unified donation flow.
 *
 * Composition: cadence toggle (Mánaðarlega / Í eitt skipti) → tier
 * cards → custom amount → form (name/email/method/anonymous) →
 * submit button with inline total. Allocation sidebar on the right
 * shows live distribution (42/31/18/9) with kr amounts that update
 * as the amount changes.
 *
 * Payment integration note: the submit button currently transitions
 * to an honest thank-you state but does NOT charge anything. Omega
 * has no online payment processor wired in yet. Two viable paths
 * for a real submit:
 *   1. Email the admin team the donor's contact + intent so they
 *      follow up manually (cheapest, works immediately).
 *   2. Integrate Valitor/SaltPay or Stripe (needs setup + merchant
 *      account work — outside design scope).
 * For now: visual flow is complete, backend is a TODO.
 *
 * The bank transfer details already on the page (account + kennitala)
 * stay visible in "Aðrar leiðir" so the page isn't a dead end for
 * people who want to give via millifærsla.
 */

type Cadence = 'monthly' | 'once';
type Method = 'kort' | 'aura' | 'milli';

const TIERS: Record<Cadence, Array<{ amount: number; label: string; note?: string }>> = {
    monthly: [
        { amount: 1500, label: 'Systkin', note: 'Rúmlega ein útsending á viku' },
        { amount: 3500, label: 'Samfelld', note: 'Eitt kvöld af dagskrá í hverjum mánuði' },
        { amount: 7500, label: 'Uppistaða', note: 'Ein heilsdags-upptaka með tæknilið' },
    ],
    once: [
        { amount: 5000, label: 'Framlag' },
        { amount: 15000, label: 'Stuðningur' },
        { amount: 50000, label: 'Grunnstoð' },
    ],
};

const ALLOCATION = [
    { pct: 42, label: 'Útsending', note: 'Senditæknin sjálf — gervihnöttur, streymi, stafrænn vettvangur' },
    { pct: 31, label: 'Dagskrárgerð', note: 'Upptökur, klipping, hljóð, grafík — það sem þú sérð á skjánum' },
    { pct: 18, label: 'Bænastarf & þjónusta', note: 'Bænatorg, tölvupóstsvörun, persónuleg umönnun áhorfenda' },
    { pct: 9, label: 'Rekstur', note: 'Húsnæði, kerfi, bókhald — það sem heldur öllu gangandi' },
];

export default function StyrkjaDonationClient() {
    const [cadence, setCadence] = useState<Cadence>('monthly');
    const [amount, setAmount] = useState<number>(3500);
    const [customAmount, setCustomAmount] = useState<string>('');
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [method, setMethod] = useState<Method>('kort');
    const [anonymous, setAnonymous] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const tiers = TIERS[cadence];
    const total = customAmount ? Number(customAmount) : amount;
    const ready = total > 0 && email.includes('@');

    const handleCadence = (c: Cadence) => {
        setCadence(c);
        const next = TIERS[c][1] ?? TIERS[c][0];
        setAmount(next.amount);
        setCustomAmount('');
    };

    const handleTier = (a: number) => {
        setAmount(a);
        setCustomAmount('');
    };

    const handleCustom = (v: string) => {
        const digits = v.replace(/[^\d]/g, '');
        setCustomAmount(digits);
        if (digits) setAmount(Number(digits));
    };

    const handleReset = () => setSubmitted(false);

    const handleSubmit = () => {
        if (!ready) return;
        // TODO: wire to payment backend. For now just flip to thank-you.
        setSubmitted(true);
    };

    if (submitted) {
        return <ThankYou cadence={cadence} total={total} onReset={handleReset} />;
    }

    return (
        <section
            style={{
                maxWidth: '80rem',
                margin: '0 auto',
                padding: 'clamp(48px, 6vw, 64px) var(--rail-padding)',
                display: 'grid',
                gridTemplateColumns: 'minmax(0, 1.15fr) minmax(0, 1fr)',
                gap: 'clamp(32px, 5vw, 64px)',
                alignItems: 'start',
            }}
            className="styrkja-donation-grid"
        >
            {/* LEFT — the ask */}
            <div>
                {/* Cadence toggle */}
                <div
                    style={{
                        display: 'inline-flex',
                        padding: '4px',
                        border: '1px solid var(--border)',
                        borderRadius: '999px',
                        background: 'var(--torfa)',
                        marginBottom: '36px',
                    }}
                >
                    {([
                        { id: 'monthly' as Cadence, label: 'Mánaðarlega' },
                        { id: 'once' as Cadence, label: 'Í eitt skipti' },
                    ]).map((c) => {
                        const active = cadence === c.id;
                        return (
                            <button
                                key={c.id}
                                type="button"
                                onClick={() => handleCadence(c.id)}
                                style={{
                                    padding: '10px 20px',
                                    background: active ? 'var(--kerti)' : 'transparent',
                                    color: active ? 'var(--nott)' : 'var(--moskva)',
                                    border: 0,
                                    borderRadius: '999px',
                                    cursor: 'pointer',
                                    fontFamily: 'var(--font-sans)',
                                    fontSize: '12px',
                                    fontWeight: 700,
                                    letterSpacing: '0.12em',
                                    textTransform: 'uppercase',
                                    transition: 'all 200ms ease',
                                }}
                            >
                                {c.label}
                            </button>
                        );
                    })}
                </div>

                {/* Tier cards */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '14px', marginBottom: '18px' }}>
                    {tiers.map((t) => {
                        const active = !customAmount && amount === t.amount;
                        return (
                            <button
                                key={t.amount}
                                type="button"
                                onClick={() => handleTier(t.amount)}
                                style={{
                                    position: 'relative',
                                    textAlign: 'left',
                                    padding: '22px 20px 24px',
                                    background: active
                                        ? 'color-mix(in oklab, var(--kerti) 8%, var(--torfa))'
                                        : 'var(--torfa)',
                                    border: `1px solid ${active ? 'var(--kerti)' : 'var(--border)'}`,
                                    borderRadius: 'var(--radius-sm)',
                                    cursor: 'pointer',
                                    transition: 'all 220ms ease',
                                    boxShadow: active ? '0 0 0 1px var(--kerti-gloed)' : 'none',
                                }}
                            >
                                <div
                                    style={{
                                        fontFamily: 'var(--font-sans)',
                                        fontSize: '11px',
                                        fontWeight: 700,
                                        letterSpacing: '0.18em',
                                        textTransform: 'uppercase',
                                        color: active ? 'var(--kerti)' : 'var(--moskva)',
                                        marginBottom: '14px',
                                    }}
                                >
                                    {t.label}
                                </div>
                                <div
                                    style={{
                                        fontFamily: 'var(--font-serif)',
                                        fontSize: '34px',
                                        lineHeight: 1,
                                        color: 'var(--ljos)',
                                        letterSpacing: '-0.015em',
                                        fontFeatureSettings: '"lnum", "tnum"',
                                    }}
                                >
                                    {t.amount.toLocaleString('is-IS')}
                                    <span
                                        style={{
                                            fontSize: '15px',
                                            color: 'var(--moskva)',
                                            marginLeft: '6px',
                                            fontStyle: 'italic',
                                        }}
                                    >
                                        kr
                                    </span>
                                </div>
                                {t.note && (
                                    <div
                                        style={{
                                            marginTop: '12px',
                                            fontFamily: 'var(--font-serif)',
                                            fontStyle: 'italic',
                                            fontSize: '13px',
                                            color: 'var(--moskva)',
                                            lineHeight: 1.45,
                                            minHeight: '38px',
                                        }}
                                    >
                                        {t.note}
                                    </div>
                                )}
                            </button>
                        );
                    })}
                </div>

                {/* Custom amount */}
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '14px 16px',
                        background: customAmount
                            ? 'color-mix(in oklab, var(--kerti) 8%, var(--torfa))'
                            : 'var(--torfa)',
                        border: `1px solid ${customAmount ? 'var(--kerti)' : 'var(--border)'}`,
                        borderRadius: 'var(--radius-sm)',
                        transition: 'all 220ms ease',
                    }}
                >
                    <span
                        style={{
                            fontFamily: 'var(--font-sans)',
                            fontSize: '11px',
                            fontWeight: 700,
                            letterSpacing: '0.16em',
                            textTransform: 'uppercase',
                            color: 'var(--moskva)',
                            whiteSpace: 'nowrap',
                        }}
                    >
                        Önnur upphæð
                    </span>
                    <input
                        type="text"
                        inputMode="numeric"
                        value={customAmount}
                        onChange={(e) => handleCustom(e.target.value)}
                        placeholder="0"
                        style={{
                            flex: 1,
                            background: 'transparent',
                            border: 0,
                            outline: 'none',
                            color: 'var(--ljos)',
                            fontFamily: 'var(--font-serif)',
                            fontSize: '22px',
                            letterSpacing: '-0.01em',
                            fontFeatureSettings: '"lnum", "tnum"',
                            textAlign: 'right',
                        }}
                        aria-label="Önnur upphæð"
                    />
                    <span style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', color: 'var(--moskva)' }}>kr</span>
                </div>

                {/* Form */}
                <div style={{ marginTop: '40px' }}>
                    <div
                        style={{
                            fontFamily: 'var(--font-sans)',
                            fontSize: '11px',
                            fontWeight: 700,
                            letterSpacing: '0.22em',
                            textTransform: 'uppercase',
                            color: 'var(--moskva)',
                            marginBottom: '20px',
                        }}
                    >
                        Þín upplýsingar
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
                        <Field label="Nafn" value={name} onChange={setName} placeholder="Valfrjálst" />
                        <Field label="Netfang" value={email} onChange={setEmail} placeholder="nafn@domain.is" required />
                    </div>

                    {/* Payment method */}
                    <div style={{ marginTop: '24px' }}>
                        <div
                            style={{
                                fontFamily: 'var(--font-sans)',
                                fontSize: '11px',
                                fontWeight: 700,
                                letterSpacing: '0.16em',
                                textTransform: 'uppercase',
                                color: 'var(--moskva)',
                                marginBottom: '10px',
                            }}
                        >
                            Greiðslumáti
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                            {([
                                { id: 'kort' as Method, label: 'Greiðslukort' },
                                { id: 'aura' as Method, label: 'Aur / Kass' },
                                { id: 'milli' as Method, label: 'Millifærsla' },
                            ]).map((m) => {
                                const active = method === m.id;
                                return (
                                    <button
                                        key={m.id}
                                        type="button"
                                        onClick={() => setMethod(m.id)}
                                        style={{
                                            padding: '12px 14px',
                                            background: active
                                                ? 'color-mix(in oklab, var(--kerti) 10%, transparent)'
                                                : 'transparent',
                                            border: `1px solid ${active ? 'var(--kerti)' : 'var(--border)'}`,
                                            color: active ? 'var(--ljos)' : 'var(--moskva)',
                                            fontFamily: 'var(--font-sans)',
                                            fontSize: '13px',
                                            fontWeight: 600,
                                            borderRadius: 'var(--radius-xs)',
                                            cursor: 'pointer',
                                            transition: 'all 200ms ease',
                                        }}
                                    >
                                        {m.label}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Anonymous */}
                    <label style={{ marginTop: '18px', display: 'flex', alignItems: 'flex-start', gap: '12px', cursor: 'pointer' }}>
                        <input
                            type="checkbox"
                            checked={anonymous}
                            onChange={(e) => setAnonymous(e.target.checked)}
                            style={{
                                marginTop: '3px',
                                accentColor: 'var(--kerti)',
                                width: '16px',
                                height: '16px',
                                cursor: 'pointer',
                                flexShrink: 0,
                            }}
                        />
                        <div
                            style={{
                                fontFamily: 'var(--font-serif)',
                                fontStyle: 'italic',
                                fontSize: '14px',
                                color: 'var(--moskva)',
                                lineHeight: 1.5,
                            }}
                        >
                            Styrkurinn minn sé ekki birtur í neinu þakkaryfirliti.
                        </div>
                    </label>

                    {/* Submit */}
                    <button
                        type="button"
                        onClick={handleSubmit}
                        disabled={!ready}
                        className="warm-hover"
                        style={{
                            marginTop: '30px',
                            width: '100%',
                            padding: '18px 24px',
                            background: ready ? 'var(--kerti)' : 'color-mix(in oklab, var(--kerti) 25%, transparent)',
                            border: '1px solid var(--kerti)',
                            color: 'var(--nott)',
                            fontFamily: 'var(--font-sans)',
                            fontSize: '13px',
                            fontWeight: 700,
                            letterSpacing: '0.14em',
                            textTransform: 'uppercase',
                            borderRadius: 'var(--radius-xs)',
                            cursor: ready ? 'pointer' : 'not-allowed',
                            opacity: ready ? 1 : 0.55,
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '12px',
                        }}
                    >
                        <span>{cadence === 'monthly' ? 'Styðja' : 'Gefa'}</span>
                        {total > 0 && (
                            <span
                                style={{
                                    fontFamily: 'var(--font-serif)',
                                    fontStyle: 'italic',
                                    fontSize: '15px',
                                    fontWeight: 400,
                                    letterSpacing: 0,
                                    textTransform: 'none',
                                    opacity: 0.85,
                                    marginLeft: '4px',
                                }}
                            >
                                {total.toLocaleString('is-IS')} kr{cadence === 'monthly' ? ' / mán' : ''}
                            </span>
                        )}
                    </button>

                    <div
                        style={{
                            marginTop: '14px',
                            textAlign: 'center',
                            fontFamily: 'var(--font-serif)',
                            fontStyle: 'italic',
                            fontSize: '13px',
                            color: 'var(--steinn)',
                            lineHeight: 1.5,
                        }}
                    >
                        Þú getur stöðvað eða breytt mánaðarlegum stuðningi hvenær sem er með einum tölvupósti.
                    </div>
                </div>
            </div>

            {/* RIGHT — allocation */}
            <Allocation total={total} />

            <style jsx>{`
                @media (max-width: 900px) {
                    .styrkja-donation-grid {
                        grid-template-columns: 1fr !important;
                    }
                }
            `}</style>
        </section>
    );
}

function Field({
    label,
    value,
    onChange,
    placeholder,
    required,
}: {
    label: string;
    value: string;
    onChange: (v: string) => void;
    placeholder?: string;
    required?: boolean;
}) {
    return (
        <label style={{ display: 'block' }}>
            <span
                style={{
                    display: 'block',
                    fontFamily: 'var(--font-sans)',
                    fontSize: '11px',
                    fontWeight: 700,
                    letterSpacing: '0.16em',
                    textTransform: 'uppercase',
                    color: 'var(--moskva)',
                    marginBottom: '8px',
                }}
            >
                {label}
                {required && <span style={{ color: 'var(--kerti)', marginLeft: '4px' }}>•</span>}
            </span>
            <input
                type={label.toLowerCase().includes('netfang') ? 'email' : 'text'}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                style={{
                    width: '100%',
                    background: 'var(--torfa)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-xs)',
                    padding: '12px 14px',
                    color: 'var(--ljos)',
                    fontFamily: 'var(--font-sans)',
                    fontSize: '14px',
                }}
            />
        </label>
    );
}

function Allocation({ total }: { total: number }) {
    return (
        <aside style={{ position: 'sticky', top: '120px' }}>
            <div
                style={{
                    fontFamily: 'var(--font-sans)',
                    fontSize: '11px',
                    fontWeight: 700,
                    letterSpacing: '0.22em',
                    textTransform: 'uppercase',
                    color: 'var(--moskva)',
                    marginBottom: '20px',
                }}
            >
                Hvert fer framlagið
            </div>

            <div
                style={{
                    display: 'flex',
                    height: '10px',
                    borderRadius: '999px',
                    overflow: 'hidden',
                    border: '1px solid var(--border)',
                    marginBottom: '28px',
                }}
            >
                {ALLOCATION.map((row, i) => (
                    <div
                        key={row.label}
                        style={{
                            width: `${row.pct}%`,
                            background: [
                                'var(--kerti)',
                                'color-mix(in oklab, var(--kerti) 70%, var(--nott))',
                                'color-mix(in oklab, var(--kerti) 45%, var(--nott))',
                                'color-mix(in oklab, var(--kerti) 25%, var(--nott))',
                            ][i],
                        }}
                    />
                ))}
            </div>

            <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'grid', gap: '18px' }}>
                {ALLOCATION.map((row, i) => {
                    const kr = Math.round((total * row.pct) / 100);
                    return (
                        <li
                            key={row.label}
                            style={{
                                display: 'grid',
                                gridTemplateColumns: '36px 1fr auto',
                                gap: '16px',
                                alignItems: 'baseline',
                                paddingBottom: '16px',
                                borderBottom: i === ALLOCATION.length - 1 ? '0' : '1px solid var(--border)',
                            }}
                        >
                            <div
                                style={{
                                    fontFamily: 'var(--font-serif)',
                                    fontSize: '20px',
                                    color: 'var(--ljos)',
                                    fontFeatureSettings: '"lnum", "tnum"',
                                }}
                            >
                                {row.pct}
                                <span style={{ fontSize: '12px', color: 'var(--moskva)' }}>%</span>
                            </div>
                            <div>
                                <div
                                    style={{
                                        fontFamily: 'var(--font-sans)',
                                        fontSize: '13.5px',
                                        fontWeight: 600,
                                        color: 'var(--ljos)',
                                        letterSpacing: '0.01em',
                                    }}
                                >
                                    {row.label}
                                </div>
                                <div
                                    style={{
                                        marginTop: '4px',
                                        fontFamily: 'var(--font-serif)',
                                        fontStyle: 'italic',
                                        fontSize: '13px',
                                        color: 'var(--moskva)',
                                        lineHeight: 1.5,
                                    }}
                                >
                                    {row.note}
                                </div>
                            </div>
                            {total > 0 && (
                                <div
                                    style={{
                                        fontFamily: 'var(--font-serif)',
                                        fontStyle: 'italic',
                                        fontSize: '13px',
                                        color: 'var(--steinn)',
                                        fontFeatureSettings: '"lnum", "tnum"',
                                        whiteSpace: 'nowrap',
                                    }}
                                >
                                    {kr.toLocaleString('is-IS')} kr
                                </div>
                            )}
                        </li>
                    );
                })}
            </ul>

            <div
                style={{
                    marginTop: '28px',
                    padding: '18px 20px',
                    background: 'var(--torfa)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-xs)',
                    fontFamily: 'var(--font-serif)',
                    fontStyle: 'italic',
                    fontSize: '13.5px',
                    color: 'var(--moskva)',
                    lineHeight: 1.55,
                }}
            >
                Omega er sjálfstæð, skráð kristileg stofnun. Ársreikningar eru opnir — þú mátt biðja um þá hvenær sem er.
            </div>
        </aside>
    );
}

function ThankYou({ cadence, total, onReset }: { cadence: Cadence; total: number; onReset: () => void }) {
    return (
        <section
            style={{
                maxWidth: '80rem',
                margin: '0 auto',
                padding: 'clamp(80px, 12vw, 120px) var(--rail-padding)',
                display: 'grid',
                placeItems: 'center',
                textAlign: 'center',
            }}
        >
            <div
                style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '50%',
                    border: '1px solid var(--kerti)',
                    display: 'grid',
                    placeItems: 'center',
                    marginBottom: '32px',
                    background: 'var(--kerti-gloed)',
                }}
            >
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden>
                    <path d="M12 3c0 2-3 4-3 7a3 3 0 0 0 6 0c0-2-3-2-3-7z" stroke="var(--kerti)" strokeWidth="1.4" strokeLinejoin="round" />
                    <line x1="8" y1="18" x2="16" y2="18" stroke="var(--kerti)" strokeWidth="1.4" strokeLinecap="round" />
                </svg>
            </div>
            <h2
                style={{
                    margin: 0,
                    fontFamily: 'var(--font-serif)',
                    fontSize: 'clamp(32px, 4vw, 48px)',
                    lineHeight: 1.05,
                    fontWeight: 400,
                    color: 'var(--ljos)',
                    letterSpacing: '-0.018em',
                    maxWidth: '680px',
                    textWrap: 'balance',
                }}
            >
                Takk. Þú ert hluti af þessu núna.
            </h2>
            <p
                style={{
                    margin: '24px 0 0',
                    fontFamily: 'var(--font-serif)',
                    fontStyle: 'italic',
                    fontSize: '19px',
                    color: 'var(--moskva)',
                    maxWidth: '560px',
                    lineHeight: 1.55,
                }}
            >
                {cadence === 'monthly'
                    ? `${total.toLocaleString('is-IS')} kr á mánuði styður áfram það sem þú elskar í dagskránni.`
                    : `${total.toLocaleString('is-IS')} kr — sérhver króna fer beint í útsendingu, dagskrá og bænastarf.`}
            </p>
            <p
                style={{
                    margin: '14px auto 0',
                    maxWidth: '560px',
                    fontFamily: 'var(--font-serif)',
                    fontStyle: 'italic',
                    fontSize: '14px',
                    color: 'var(--steinn)',
                    lineHeight: 1.55,
                }}
            >
                Við höfum samband til að ganga frá greiðslunni.
            </p>
            <button
                type="button"
                onClick={onReset}
                style={{
                    marginTop: '40px',
                    padding: '12px 22px',
                    background: 'transparent',
                    border: '1px solid var(--border)',
                    color: 'var(--moskva)',
                    fontFamily: 'var(--font-sans)',
                    fontSize: '12px',
                    fontWeight: 600,
                    letterSpacing: '0.12em',
                    textTransform: 'uppercase',
                    borderRadius: 'var(--radius-xs)',
                    cursor: 'pointer',
                }}
            >
                Til baka
            </button>
        </section>
    );
}
