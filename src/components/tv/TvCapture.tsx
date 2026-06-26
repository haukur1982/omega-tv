'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { subscribeAction } from '@/actions/subscribe';

/**
 * /tv email capture — the "thank-you", offered AFTER the gift of watching.
 *
 * Honest by design:
 *  - promises ONLY the weekly letter (the daily prayer is not added until the
 *    rotation + a verified sending domain exist),
 *  - email only, no name, no password,
 *  - an UN-ticked consent box that must be checked to submit, linking to the
 *    real privacy page,
 *  - states the cadence and the one-tap exit up front.
 *
 * Writes to the subscribers list with segment 'tv' (collect-mode).
 * NOTE (pre-deploy): column-level consent logging (consent_given_at /
 * consent_text_version) still needs its migration + a wired subscribeAction.
 * The consent here is enforced in the UI; persisting the proof is the last
 * Phase 0 backend step before this goes to production.
 */
export default function TvCapture() {
    const [isPending, startTransition] = useTransition();
    const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const [error, setError] = useState('');
    const [consent, setConsent] = useState(false);

    const handleSubmit = (formData: FormData) => {
        if (!consent) return;
        formData.append('segment', 'tv');
        startTransition(async () => {
            const result = await subscribeAction(formData);
            if (result.success) {
                setStatus('success');
            } else {
                setStatus('error');
                setError(result.error || 'Villa kom upp. Reyndu aftur.');
            }
        });
    };

    return (
        <div
            style={{
                background: 'var(--skra)',
                color: 'var(--skra-djup)',
                borderRadius: 'var(--radius-lg)',
                padding: 'clamp(1.75rem, 4vw, 2.75rem)',
                boxShadow: 'var(--shadow-lift)',
            }}
        >
            {status === 'success' ? (
                <div style={{ textAlign: 'center', padding: '0.5rem 0' }}>
                    <h3 style={headingStyle}>Takk.</h3>
                    <p style={{ ...bodyStyle, margin: '0.75rem auto 0', maxWidth: '32ch' }}>
                        Næsta bréf frá Omega kemur til þín. Þangað til, Guð geymi þig.
                    </p>
                </div>
            ) : (
                <form action={handleSubmit}>
                    <h3 style={headingStyle}>Fáðu vikulegt bréf frá Omega</h3>
                    <p style={{ ...bodyStyle, marginTop: '0.6rem', maxWidth: '40ch' }}>
                        Stutt hugvekja og það sem framundan er á Omega, einu sinni í viku.
                    </p>

                    <div style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                        <input
                            type="email"
                            name="email"
                            required
                            placeholder="Netfangið þitt"
                            autoComplete="email"
                            style={{
                                width: '100%',
                                padding: '0.95rem 1.1rem',
                                borderRadius: 'var(--radius-sm)',
                                border: '1px solid rgba(27,24,20,0.18)',
                                background: '#fff',
                                color: 'var(--skra-djup)',
                                fontFamily: 'var(--font-serif)',
                                fontSize: '1.05rem',
                            }}
                        />

                        <label
                            style={{
                                display: 'flex',
                                alignItems: 'flex-start',
                                gap: '0.6rem',
                                fontFamily: 'var(--font-serif)',
                                fontSize: '0.95rem',
                                lineHeight: 1.5,
                                color: 'var(--skra-mjuk)',
                                cursor: 'pointer',
                            }}
                        >
                            <input
                                type="checkbox"
                                name="consent"
                                checked={consent}
                                onChange={(e) => setConsent(e.target.checked)}
                                style={{ marginTop: '0.2rem', width: '1.05rem', height: '1.05rem', accentColor: 'var(--gull)', flexShrink: 0 }}
                            />
                            <span>
                                Ég hef lesið{' '}
                                <Link href="/personuverndarstefna" style={{ color: 'var(--gull)', textDecoration: 'underline', textUnderlineOffset: '2px' }}>
                                    persónuverndarstefnuna
                                </Link>{' '}
                                og samþykki að fá vikulegt bréf frá Omega.
                            </span>
                        </label>

                        <button
                            type="submit"
                            disabled={!consent || isPending}
                            style={{
                                width: '100%',
                                padding: '0.95rem 1.25rem',
                                borderRadius: 'var(--radius-sm)',
                                border: 0,
                                background: consent ? 'var(--kerti)' : 'rgba(27,24,20,0.18)',
                                color: consent ? 'var(--nott)' : 'rgba(27,24,20,0.5)',
                                fontFamily: 'var(--font-sans)',
                                fontSize: '1rem',
                                fontWeight: 700,
                                cursor: consent && !isPending ? 'pointer' : 'not-allowed',
                                transition: 'background 0.2s ease, color 0.2s ease',
                            }}
                        >
                            {isPending ? 'Skrái...' : 'Skrá mig'}
                        </button>

                        <p style={{ fontFamily: 'var(--font-sans)', fontSize: '0.8rem', color: 'var(--skra-mjuk)', margin: 0, textAlign: 'center' }}>
                            Engin læti. Þú getur sagt þig af listanum hvenær sem er, í einum smelli.
                        </p>

                        {status === 'error' && (
                            <p style={{ fontFamily: 'var(--font-sans)', fontSize: '0.85rem', color: 'var(--blod)', margin: 0, textAlign: 'center' }}>
                                {error}
                            </p>
                        )}
                    </div>
                </form>
            )}
        </div>
    );
}

const headingStyle: React.CSSProperties = {
    fontFamily: 'var(--font-display)',
    fontSize: 'clamp(1.5rem, 3.5vw, 2rem)',
    fontWeight: 500,
    lineHeight: 1.15,
    margin: 0,
    color: 'var(--skra-djup)',
};

const bodyStyle: React.CSSProperties = {
    fontFamily: 'var(--font-serif)',
    fontSize: '1.075rem',
    lineHeight: 1.6,
    color: 'var(--skra-mjuk)',
    margin: 0,
};
