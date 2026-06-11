'use client';

import { useState, useTransition } from 'react';
import { bookSignupAction } from '@/actions/book-signup';

/**
 * Bókavinir Omega — the signup form.
 *
 * Ink-on-cream register (like the giving page): a calm, paper-like
 * card. Large type and generous targets — the readers this serves are
 * mostly 60–75. Name + address are what let Omega mail the book; the
 * newsletter opt-in quietly builds the list.
 */

const label: React.CSSProperties = {
    display: 'block',
    fontFamily: 'var(--font-sans)',
    fontSize: '11px',
    fontWeight: 700,
    letterSpacing: '0.16em',
    textTransform: 'uppercase',
    color: 'rgba(63,47,35,0.65)',
    marginBottom: '8px',
};

const input: React.CSSProperties = {
    width: '100%',
    padding: '14px 16px',
    fontFamily: 'var(--font-serif)',
    fontSize: '17px',
    color: 'var(--skra-djup)',
    background: '#FFFDF8',
    border: '1px solid rgba(63,47,35,0.25)',
    borderRadius: '6px',
    outline: 'none',
};

export default function BokavinirForm() {
    const [pending, startTransition] = useTransition();
    const [result, setResult] = useState<{ success: boolean; message?: string; error?: string } | null>(null);

    function onSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        startTransition(async () => {
            const res = await bookSignupAction(fd);
            setResult(res);
        });
    }

    if (result?.success) {
        return (
            <div
                style={{
                    padding: 'clamp(40px, 5vw, 56px) clamp(24px, 3vw, 40px)',
                    textAlign: 'center',
                }}
            >
                <div
                    aria-hidden
                    style={{ width: '40px', height: '1px', background: 'var(--gull)', margin: '0 auto 22px' }}
                />
                <p
                    style={{
                        margin: 0,
                        fontFamily: 'var(--font-serif)',
                        fontSize: 'clamp(19px, 1.8vw, 23px)',
                        lineHeight: 1.6,
                        color: 'var(--skra-djup)',
                    }}
                >
                    {result.message}
                </p>
            </div>
        );
    }

    return (
        <form onSubmit={onSubmit} noValidate>
            <div style={{ display: 'grid', gap: '20px' }}>
                <div>
                    <label htmlFor="bv-name" style={label}>Fullt nafn</label>
                    <input id="bv-name" name="name" type="text" required autoComplete="name" style={input} />
                </div>

                <div className="bv-two" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                    <div>
                        <label htmlFor="bv-email" style={label}>Netfang</label>
                        <input id="bv-email" name="email" type="email" required autoComplete="email" style={input} />
                    </div>
                    <div>
                        <label htmlFor="bv-phone" style={label}>Sími <span style={{ opacity: 0.6, textTransform: 'none', letterSpacing: 0 }}>(valfrjálst)</span></label>
                        <input id="bv-phone" name="phone" type="tel" autoComplete="tel" style={input} />
                    </div>
                </div>

                <div>
                    <label htmlFor="bv-address" style={label}>Heimilisfang</label>
                    <input id="bv-address" name="address" type="text" required autoComplete="street-address" placeholder="Gata og húsnúmer" style={input} />
                </div>

                <div>
                    <label htmlFor="bv-postal" style={label}>Póstnúmer og staður</label>
                    <input id="bv-postal" name="postal" type="text" required autoComplete="postal-code" placeholder="t.d. 101 Reykjavík" style={input} />
                </div>

                <label
                    style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '12px',
                        cursor: 'pointer',
                        fontFamily: 'var(--font-serif)',
                        fontSize: '15.5px',
                        lineHeight: 1.5,
                        color: 'rgba(63,47,35,0.8)',
                    }}
                >
                    <input
                        type="checkbox"
                        name="newsletter"
                        style={{ marginTop: '3px', width: '18px', height: '18px', accentColor: '#C88A3E' }}
                    />
                    <span>Ég vil líka fá fréttabréf Omega í tölvupósti.</span>
                </label>

                {result?.error && (
                    <p
                        role="alert"
                        style={{
                            margin: 0,
                            fontFamily: 'var(--font-serif)',
                            fontSize: '15.5px',
                            color: '#8C3B2E',
                        }}
                    >
                        {result.error}
                    </p>
                )}

                <button
                    type="submit"
                    disabled={pending}
                    style={{
                        marginTop: '6px',
                        padding: '16px 32px',
                        background: pending ? 'rgba(233,168,96,0.6)' : 'var(--kerti)',
                        color: '#1B1814',
                        fontFamily: 'var(--font-sans)',
                        fontSize: '13px',
                        fontWeight: 700,
                        letterSpacing: '0.14em',
                        textTransform: 'uppercase',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: pending ? 'wait' : 'pointer',
                    }}
                >
                    {pending ? 'Sendi skráningu…' : 'Skrá mig — og fá bókina senda heim'}
                </button>

                <p
                    style={{
                        margin: 0,
                        fontFamily: 'var(--font-serif)',
                        fontStyle: 'italic',
                        fontSize: '14px',
                        color: 'rgba(63,47,35,0.55)',
                    }}
                >
                    Ef þér reynist erfitt að skrá þig hér geturðu alltaf hringt í síma 800 9700.
                </p>
            </div>
            <style>{`@media (max-width: 640px) { .bv-two { grid-template-columns: 1fr !important; } }`}</style>
        </form>
    );
}
