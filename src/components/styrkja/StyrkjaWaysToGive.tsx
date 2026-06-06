'use client';

import { useState } from 'react';

/**
 * StyrkjaWaysToGive — the two real ways to give to Omega.
 *
 *   1. Aur     — send to the handle @Omega in the Aur app
 *   2. Millifærsla — bank transfer: reikningur + kennitala
 *
 * No online card processing, no recurring sign-up, no invented allocation
 * percentages or suggested tiers. Ink-on-cream to match the rest of /give.
 */

const LABEL: React.CSSProperties = {
    fontFamily: 'var(--font-sans)',
    fontSize: '10px',
    letterSpacing: '0.18em',
    textTransform: 'uppercase',
    color: 'var(--skra-mjuk)',
    fontWeight: 600,
    marginBottom: '5px',
};

const VALUE: React.CSSProperties = {
    fontFamily: 'var(--font-sans)',
    fontVariantNumeric: 'tabular-nums',
    fontSize: '20px',
    fontWeight: 600,
    color: 'var(--skra-djup)',
    letterSpacing: '0.02em',
};

function CopyRow({ label, value }: { label: string; value: string }) {
    const [copied, setCopied] = useState(false);
    return (
        <button
            type="button"
            onClick={() => {
                navigator.clipboard?.writeText(value).then(
                    () => { setCopied(true); setTimeout(() => setCopied(false), 1600); },
                    () => {},
                );
            }}
            style={{
                display: 'flex',
                alignItems: 'flex-end',
                justifyContent: 'space-between',
                gap: '16px',
                width: '100%',
                textAlign: 'left',
                background: 'transparent',
                border: 'none',
                borderBottom: '1px solid rgba(63,47,35,0.14)',
                padding: '0 0 12px',
                cursor: 'pointer',
            }}
            aria-label={`Afrita ${label}: ${value}`}
        >
            <span>
                <span style={{ ...LABEL, display: 'block' }}>{label}</span>
                <span style={VALUE}>{value}</span>
            </span>
            <span
                style={{
                    fontFamily: 'var(--font-sans)',
                    fontSize: '11px',
                    fontWeight: 700,
                    letterSpacing: '0.04em',
                    color: copied ? 'var(--gull)' : 'var(--skra-mjuk)',
                    whiteSpace: 'nowrap',
                    paddingBottom: '3px',
                }}
            >
                {copied ? '✓ Afritað' : 'Afrita'}
            </span>
        </button>
    );
}

const CARD: React.CSSProperties = {
    background: 'rgba(255,255,255,0.5)',
    border: '1px solid rgba(63,47,35,0.12)',
    borderRadius: 'var(--radius-md)',
    padding: 'clamp(28px, 3vw, 40px)',
    display: 'flex',
    flexDirection: 'column',
    gap: '22px',
};

export default function StyrkjaWaysToGive() {
    return (
        <section style={{ background: 'var(--skra)', color: 'var(--skra-djup)' }}>
            <div
                style={{
                    maxWidth: '80rem',
                    margin: '0 auto',
                    padding: 'clamp(56px, 7vw, 88px) var(--rail-padding)',
                }}
            >
                <div
                    style={{
                        fontFamily: 'var(--font-sans)',
                        fontSize: '11px',
                        fontWeight: 700,
                        letterSpacing: '0.22em',
                        textTransform: 'uppercase',
                        color: 'var(--gull)',
                        marginBottom: '16px',
                    }}
                >
                    Styrkja
                </div>
                <h2
                    style={{
                        margin: 0,
                        fontFamily: 'var(--font-serif)',
                        fontSize: 'clamp(30px, 3.4vw, 46px)',
                        lineHeight: 1.08,
                        fontWeight: 400,
                        color: 'var(--skra-djup)',
                        maxWidth: '20ch',
                    }}
                >
                    Tvær leiðir til að gefa
                </h2>
                <p
                    style={{
                        margin: '18px 0 0',
                        fontFamily: 'var(--font-serif)',
                        fontStyle: 'italic',
                        fontSize: 'clamp(17px, 1.5vw, 20px)',
                        color: 'var(--skra-mjuk)',
                        maxWidth: '46ch',
                        lineHeight: 1.55,
                    }}
                >
                    Engin kortagreiðsla á netinu — aðeins Aur eða bein millifærsla. Veldu það sem hentar þér.
                </p>

                <div
                    style={{
                        marginTop: 'clamp(32px, 4vw, 48px)',
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                        gap: 'clamp(20px, 2.5vw, 32px)',
                    }}
                >
                    {/* ── Aur ── */}
                    <div style={CARD}>
                        <div>
                            <div style={LABEL}>Aur appið</div>
                            <h3 style={{ margin: '4px 0 0', fontFamily: 'var(--font-serif)', fontSize: '26px', fontWeight: 400, color: 'var(--skra-djup)' }}>
                                Sendu með Aur
                            </h3>
                        </div>
                        <p style={{ margin: 0, fontFamily: 'var(--font-serif)', fontSize: '15px', color: 'var(--skra-mjuk)', lineHeight: 1.6 }}>
                            Opnaðu Aur appið, veldu „Senda“ og leitaðu að notandanafninu hér að neðan.
                        </p>
                        <CopyRow label="Notandanafn í Aur" value="@Omega" />
                    </div>

                    {/* ── Millifærsla ── */}
                    <div style={CARD}>
                        <div>
                            <div style={LABEL}>Bein millifærsla</div>
                            <h3 style={{ margin: '4px 0 0', fontFamily: 'var(--font-serif)', fontSize: '26px', fontWeight: 400, color: 'var(--skra-djup)' }}>
                                Millifærsla í banka
                            </h3>
                        </div>
                        <CopyRow label="Reikningsnúmer" value="0113-26-25707" />
                        <CopyRow label="Kennitala" value="630890-1019" />
                        <p style={{ margin: 0, fontFamily: 'var(--font-serif)', fontSize: '15px', color: 'var(--skra-mjuk)', lineHeight: 1.6 }}>
                            Sjónvarpsstöðin Omega. Merktu millifærsluna með nafni þínu.
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
}
