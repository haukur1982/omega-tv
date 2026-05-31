'use client';

import { useState } from 'react';

/**
 * StyrkjaDonationClient — unified donation flow on cream register.
 *
 * Composition: cadence toggle (Mánaðarlega / Í eitt skipti) → tier
 * cards → custom amount → form (name/email/method/anonymous) →
 * submit button with inline total. Allocation sidebar on the right
 * shows live distribution (42/31/18/9) with kr amounts that update
 * as the amount changes.
 *
 * Cathedral register: cream `--skra` body, pergament `--skra-warm`
 * tier/method cards, ink-on-cream typography, gold accents on
 * active states, single amber `--kerti` CTA on submit. Form chrome
 * reads as a magazine subscription page rather than checkout-stack.
 *
 * Payment note: giving is by bank transfer only (no online card
 * processor). Submit leads to a thank-you state that shows the
 * exact millifærsla details needed to complete the gift.
 */

type Cadence = 'monthly' | 'once';

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

const CARD_BG = 'var(--skra-warm)';
const CARD_BORDER = 'rgba(63,47,35,0.16)';
const CARD_ACTIVE_BG = 'rgba(233,168,96,0.10)';
const HAIRLINE = 'rgba(63,47,35,0.12)';

function formatIsNumber(value: number): string {
    return String(Math.round(value)).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

export default function StyrkjaDonationClient() {
    const [cadence, setCadence] = useState<Cadence>('monthly');
    const [amount, setAmount] = useState<number>(3500);
    const [customAmount, setCustomAmount] = useState<string>('');
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
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
        // No card processor by design — the thank-you state shows the
        // millifærsla details the donor uses to complete the gift.
        setSubmitted(true);
    };

    if (submitted) {
        return <ThankYou cadence={cadence} total={total} onReset={handleReset} />;
    }

    return (
        <section
            style={{
                background: 'var(--skra)',
                color: 'var(--skra-djup)',
            }}
        >
            <div
                style={{
                    maxWidth: '80rem',
                    margin: '0 auto',
                    padding: 'clamp(56px, 7vw, 80px) var(--rail-padding)',
                    display: 'grid',
                    gridTemplateColumns: 'minmax(0, 1.15fr) minmax(0, 1fr)',
                    gap: 'clamp(32px, 5vw, 64px)',
                    alignItems: 'start',
                }}
                className="styrkja-donation-grid"
            >
                {/* LEFT — the ask */}
                <div style={{ minWidth: 0 }}>
                    {/* Section opener — gold rule + dot */}
                    <div
                        aria-hidden
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '14px',
                            marginBottom: '28px',
                        }}
                    >
                        <span style={{ width: '32px', height: '1px', background: 'var(--gull)' }} />
                        <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden>
                            <circle cx="5" cy="5" r="2" fill="var(--gull)" />
                        </svg>
                        <span style={{ flex: 1, height: '1px', background: 'rgba(200,138,62,0.18)' }} />
                    </div>
                    <div
                        style={{
                            fontFamily: 'var(--font-sans)',
                            fontSize: '11px',
                            fontWeight: 700,
                            letterSpacing: '0.22em',
                            textTransform: 'uppercase',
                            color: 'var(--mor)',
                            marginBottom: '14px',
                        }}
                    >
                        Sáning
                    </div>
                    <h2
                        style={{
                            margin: 0,
                            fontFamily: 'var(--font-serif)',
                            fontSize: 'clamp(28px, 3.2vw, 40px)',
                            lineHeight: 1.1,
                            fontWeight: 400,
                            color: 'var(--skra-djup)',
                            letterSpacing: '-0.005em',
                            marginBottom: 'clamp(28px, 3vw, 36px)',
                        }}
                    >
                        Veldu þína leið.
                    </h2>

                    {/* Cadence toggle */}
                    <div
                        style={{
                            display: 'inline-flex',
                            padding: '4px',
                            border: `1px solid ${CARD_BORDER}`,
                            borderRadius: '999px',
                            background: CARD_BG,
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
                                        color: active ? 'var(--nott)' : 'var(--skra-mjuk)',
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
                                        background: active ? CARD_ACTIVE_BG : CARD_BG,
                                        border: `1px solid ${active ? 'var(--kerti)' : CARD_BORDER}`,
                                        borderRadius: 'var(--radius-sm)',
                                        cursor: 'pointer',
                                        transition: 'all 220ms ease',
                                        boxShadow: active ? '0 0 0 1px rgba(233,168,96,0.18)' : 'none',
                                    }}
                                >
                                    <div
                                        style={{
                                            fontFamily: 'var(--font-sans)',
                                            fontSize: '11px',
                                            fontWeight: 700,
                                            letterSpacing: '0.18em',
                                            textTransform: 'uppercase',
                                            color: active ? 'var(--gull)' : 'var(--skra-mjuk)',
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
                                            color: 'var(--skra-djup)',
                                            letterSpacing: '-0.015em',
                                            fontFeatureSettings: '"lnum", "tnum"',
                                        }}
                                    >
                                        {formatIsNumber(t.amount)}
                                        <span
                                            style={{
                                                fontSize: '15px',
                                                color: 'var(--skra-mjuk)',
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
                                                color: 'var(--skra-mjuk)',
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
                            background: customAmount ? CARD_ACTIVE_BG : CARD_BG,
                            border: `1px solid ${customAmount ? 'var(--kerti)' : CARD_BORDER}`,
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
                                color: 'var(--skra-mjuk)',
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
                                minWidth: 0,
                                background: 'transparent',
                                border: 0,
                                outline: 'none',
                                color: 'var(--skra-djup)',
                                fontFamily: 'var(--font-serif)',
                                fontSize: '22px',
                                letterSpacing: '-0.01em',
                                fontFeatureSettings: '"lnum", "tnum"',
                                textAlign: 'right',
                            }}
                            aria-label="Önnur upphæð"
                        />
                        <span style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', color: 'var(--skra-mjuk)' }}>kr</span>
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
                                color: 'var(--mor)',
                                marginBottom: '20px',
                            }}
                        >
                            Þín upplýsingar
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
                            <Field label="Nafn" value={name} onChange={setName} placeholder="Valfrjálst" />
                            <Field label="Netfang" value={email} onChange={setEmail} placeholder="nafn@domain.is" required />
                        </div>

                        {/* Payment method — millifærsla only (no online card processor) */}
                        <div style={{ marginTop: '24px' }}>
                            <div
                                style={{
                                    fontFamily: 'var(--font-sans)',
                                    fontSize: '11px',
                                    fontWeight: 700,
                                    letterSpacing: '0.16em',
                                    textTransform: 'uppercase',
                                    color: 'var(--skra-mjuk)',
                                    marginBottom: '10px',
                                }}
                            >
                                Greiðslumáti — millifærsla
                            </div>
                            <div
                                style={{
                                    padding: '18px 20px',
                                    background: CARD_BG,
                                    border: `1px solid ${CARD_BORDER}`,
                                    borderRadius: 'var(--radius-xs)',
                                    display: 'grid',
                                    gap: '16px',
                                }}
                            >
                                <p
                                    style={{
                                        margin: 0,
                                        fontFamily: 'var(--font-serif)',
                                        fontStyle: 'italic',
                                        fontSize: '14px',
                                        color: 'var(--skra-mjuk)',
                                        lineHeight: 1.6,
                                    }}
                                >
                                    Gjöfin er millifærð beint á reikning Omega — engin kortagreiðsla á netinu. Merktu millifærsluna nafni þínu.
                                </p>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '28px' }}>
                                    <div>
                                        <div
                                            style={{
                                                fontFamily: 'var(--font-sans)',
                                                fontSize: '10px',
                                                letterSpacing: '0.18em',
                                                textTransform: 'uppercase',
                                                color: 'var(--skra-mjuk)',
                                                fontWeight: 600,
                                                marginBottom: '4px',
                                            }}
                                        >
                                            Reikningsnúmer
                                        </div>
                                        <div
                                            className="select-all"
                                            style={{
                                                fontFamily: 'var(--font-sans)',
                                                fontVariantNumeric: 'tabular-nums',
                                                fontSize: '18px',
                                                fontWeight: 600,
                                                color: 'var(--skra-djup)',
                                                letterSpacing: '0.02em',
                                            }}
                                        >
                                            0113-26-25707
                                        </div>
                                    </div>
                                    <div>
                                        <div
                                            style={{
                                                fontFamily: 'var(--font-sans)',
                                                fontSize: '10px',
                                                letterSpacing: '0.18em',
                                                textTransform: 'uppercase',
                                                color: 'var(--skra-mjuk)',
                                                fontWeight: 600,
                                                marginBottom: '4px',
                                            }}
                                        >
                                            Kennitala
                                        </div>
                                        <div
                                            className="select-all"
                                            style={{
                                                fontFamily: 'var(--font-sans)',
                                                fontVariantNumeric: 'tabular-nums',
                                                fontSize: '18px',
                                                fontWeight: 600,
                                                color: 'var(--skra-djup)',
                                                letterSpacing: '0.02em',
                                            }}
                                        >
                                            630890-1019
                                        </div>
                                    </div>
                                </div>
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
                                    color: 'var(--skra-mjuk)',
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
                                background: ready ? 'var(--kerti)' : 'rgba(233,168,96,0.32)',
                                border: '1px solid var(--kerti)',
                                color: 'var(--nott)',
                                fontFamily: 'var(--font-sans)',
                                fontSize: '13px',
                                fontWeight: 700,
                                letterSpacing: '0.18em',
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
                                    {formatIsNumber(total)} kr{cadence === 'monthly' ? ' / mán' : ''}
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
                                color: 'var(--skra-mjuk)',
                                lineHeight: 1.5,
                            }}
                        >
                            Þú getur stöðvað eða breytt mánaðarlegum stuðningi hvenær sem er með einum tölvupósti.
                        </div>
                    </div>
                </div>

                {/* RIGHT — allocation */}
                <Allocation total={total} />

                <style>{`
                    @media (max-width: 900px) {
                        .styrkja-donation-grid {
                            grid-template-columns: 1fr !important;
                        }
                    }
                `}</style>
            </div>
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
                    color: 'var(--skra-mjuk)',
                    marginBottom: '8px',
                }}
            >
                {label}
                {required && <span style={{ color: 'var(--gull)', marginLeft: '4px' }}>•</span>}
            </span>
            <input
                type={label.toLowerCase().includes('netfang') ? 'email' : 'text'}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                style={{
                    width: '100%',
                    background: CARD_BG,
                    border: `1px solid ${CARD_BORDER}`,
                    borderRadius: 'var(--radius-xs)',
                    padding: '12px 14px',
                    color: 'var(--skra-djup)',
                    fontFamily: 'var(--font-sans)',
                    fontSize: '14px',
                    outline: 'none',
                }}
            />
        </label>
    );
}

function Allocation({ total }: { total: number }) {
    return (
        <aside style={{ position: 'sticky', top: '120px', minWidth: 0 }}>
            <div
                aria-hidden
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '14px',
                    marginBottom: '20px',
                }}
            >
                <span style={{ width: '24px', height: '1px', background: 'var(--gull)' }} />
                <svg width="8" height="8" viewBox="0 0 8 8" aria-hidden>
                    <circle cx="4" cy="4" r="1.6" fill="var(--gull)" />
                </svg>
                <span style={{ flex: 1, height: '1px', background: 'rgba(200,138,62,0.18)' }} />
            </div>
            <div
                style={{
                    fontFamily: 'var(--font-sans)',
                    fontSize: '11px',
                    fontWeight: 700,
                    letterSpacing: '0.22em',
                    textTransform: 'uppercase',
                    color: 'var(--mor)',
                    marginBottom: '20px',
                }}
            >
                Hvert fer framlagið
            </div>

            {/* Allocation bar */}
            <div
                style={{
                    display: 'flex',
                    height: '10px',
                    borderRadius: '999px',
                    overflow: 'hidden',
                    border: `1px solid ${CARD_BORDER}`,
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
                                'color-mix(in oklab, var(--kerti) 75%, var(--skra-warm))',
                                'color-mix(in oklab, var(--kerti) 50%, var(--skra-warm))',
                                'color-mix(in oklab, var(--kerti) 28%, var(--skra-warm))',
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
                            className="allocation-row"
                            style={{
                                display: 'grid',
                                gridTemplateColumns: '36px 1fr auto',
                                gap: '16px',
                                alignItems: 'baseline',
                                paddingBottom: '16px',
                                borderBottom: i === ALLOCATION.length - 1 ? '0' : `1px solid ${HAIRLINE}`,
                            }}
                        >
                            <div
                                style={{
                                    fontFamily: 'var(--font-serif)',
                                    fontSize: '20px',
                                    color: 'var(--skra-djup)',
                                    fontFeatureSettings: '"lnum", "tnum"',
                                }}
                            >
                                {row.pct}
                                <span style={{ fontSize: '12px', color: 'var(--skra-mjuk)' }}>%</span>
                            </div>
                            <div>
                                <div
                                    style={{
                                        fontFamily: 'var(--font-sans)',
                                        fontSize: '13.5px',
                                        fontWeight: 600,
                                        color: 'var(--skra-djup)',
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
                                        color: 'var(--skra-mjuk)',
                                        lineHeight: 1.5,
                                    }}
                                >
                                    {row.note}
                                </div>
                            </div>
                            {total > 0 && (
                                <div
                                    className="allocation-amount"
                                    style={{
                                        fontFamily: 'var(--font-serif)',
                                        fontStyle: 'italic',
                                        fontSize: '13px',
                                        color: 'var(--skra-mjuk)',
                                        fontFeatureSettings: '"lnum", "tnum"',
                                        whiteSpace: 'nowrap',
                                    }}
                                >
                                    {formatIsNumber(kr)} kr
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
                    background: CARD_BG,
                    border: `1px solid ${CARD_BORDER}`,
                    borderRadius: 'var(--radius-xs)',
                    fontFamily: 'var(--font-serif)',
                    fontStyle: 'italic',
                    fontSize: '13.5px',
                    color: 'var(--skra-mjuk)',
                    lineHeight: 1.55,
                }}
            >
                Omega er sjálfstæð, skráð kristileg stofnun. Ársreikningar eru opnir — þú mátt biðja um þá hvenær sem er.
            </div>
            <style>{`
                @media (max-width: 640px) {
                    .allocation-row {
                        grid-template-columns: 36px minmax(0, 1fr) !important;
                        gap: 12px !important;
                    }

                    .allocation-amount {
                        grid-column: 2;
                        white-space: normal !important;
                    }
                }
            `}</style>
        </aside>
    );
}

function ThankYou({ cadence, total, onReset }: { cadence: Cadence; total: number; onReset: () => void }) {
    return (
        <section
            style={{
                background: 'var(--skra)',
                color: 'var(--skra-djup)',
            }}
        >
            <div
                style={{
                    maxWidth: '52rem',
                    margin: '0 auto',
                    padding: 'clamp(80px, 12vw, 120px) var(--rail-padding)',
                    textAlign: 'center',
                }}
            >
                {/* Centered ornament */}
                <div
                    aria-hidden
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '14px',
                        marginBottom: '32px',
                        maxWidth: '20rem',
                        marginInline: 'auto',
                    }}
                >
                    <span style={{ flex: 1, height: '1px', background: 'rgba(200,138,62,0.32)' }} />
                    <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden>
                        <path
                            d="M7 1L8.2 5.8L13 7L8.2 8.2L7 13L5.8 8.2L1 7L5.8 5.8L7 1Z"
                            fill="var(--gull)"
                            opacity="0.7"
                        />
                    </svg>
                    <span style={{ flex: 1, height: '1px', background: 'rgba(200,138,62,0.32)' }} />
                </div>

                <h2
                    style={{
                        margin: 0,
                        fontFamily: 'var(--font-serif)',
                        fontSize: 'clamp(32px, 4vw, 48px)',
                        lineHeight: 1.05,
                        fontWeight: 400,
                        color: 'var(--skra-djup)',
                        letterSpacing: '-0.018em',
                        maxWidth: '680px',
                        textWrap: 'balance',
                        marginInline: 'auto',
                    }}
                >
                    Takk. Þú ert hluti af þessu núna.
                </h2>
                <p
                    style={{
                        margin: '24px auto 0',
                        fontFamily: 'var(--font-serif)',
                        fontStyle: 'italic',
                        fontSize: '19px',
                        color: 'var(--skra-mjuk)',
                        maxWidth: '40rem',
                        lineHeight: 1.55,
                    }}
                >
                    {cadence === 'monthly'
                        ? `${formatIsNumber(total)} kr á mánuði styður áfram það sem þú elskar í dagskránni.`
                        : `${formatIsNumber(total)} kr — sérhver króna fer beint í útsendingu, dagskrá og bænastarf.`}
                </p>
                <p
                    style={{
                        margin: '14px auto 0',
                        maxWidth: '36rem',
                        fontFamily: 'var(--font-serif)',
                        fontStyle: 'italic',
                        fontSize: '14px',
                        color: 'var(--skra-mjuk)',
                        lineHeight: 1.55,
                    }}
                >
                    {cadence === 'monthly'
                        ? `Síðasta skrefið: stofnaðu mánaðarlega millifærslu — ${formatIsNumber(total)} kr á reikning 0113-26-25707 (kt. 630890-1019), merkta nafni þínu.`
                        : `Síðasta skrefið: millifærðu ${formatIsNumber(total)} kr á reikning 0113-26-25707 (kt. 630890-1019) og merktu greiðsluna nafni þínu.`}
                </p>
                <button
                    type="button"
                    onClick={onReset}
                    style={{
                        marginTop: '40px',
                        padding: '12px 22px',
                        background: 'transparent',
                        border: `1px solid ${CARD_BORDER}`,
                        color: 'var(--skra-mjuk)',
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
            </div>
        </section>
    );
}
