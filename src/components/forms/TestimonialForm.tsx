'use client';

import { useState } from 'react';
import { Send, User, Mail, MessageSquare, Loader2, CheckCircle } from 'lucide-react';
import { submitTestimonial } from '@/actions/testimonial';

/**
 * TestimonialForm — submission form for /vitnisburdur.
 *
 * Cathedral-aware: form chrome reads on cream/pergament backdrops
 * (cream input bg, ink-on-cream text, gull-toned focus, kerti CTA).
 * Old `--bg-deep`, `--accent`, `--text-secondary` tokens swapped to
 * Altingi palette for cohesion with the rest of the site.
 */

export default function TestimonialForm() {
    const [isLoading, setIsLoading] = useState(false);
    const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const [message, setMessage] = useState('');

    const handleSubmit = async (formData: FormData) => {
        setIsLoading(true);
        setStatus('idle');

        try {
            const result = await submitTestimonial(formData);
            if (result.success) {
                setStatus('success');
                setMessage(result.message);
            } else {
                setStatus('error');
                setMessage(result.message);
            }
        } catch {
            setStatus('error');
            setMessage('Kerfisvilla. Vinsamlegast reyndu aftur.');
        }
        setIsLoading(false);
    };

    if (status === 'success') {
        return (
            <div
                style={{
                    background: 'rgba(116, 168, 122, 0.12)',
                    border: '1px solid rgba(116, 168, 122, 0.32)',
                    borderRadius: 'var(--radius-md)',
                    padding: 'clamp(28px, 3vw, 40px)',
                    textAlign: 'center',
                }}
            >
                <div
                    style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '64px',
                        height: '64px',
                        borderRadius: '50%',
                        background: 'rgba(116, 168, 122, 0.18)',
                        color: 'rgb(80, 130, 88)',
                        marginBottom: '16px',
                    }}
                >
                    <CheckCircle size={28} />
                </div>
                <h3
                    style={{
                        margin: 0,
                        fontFamily: 'var(--font-serif)',
                        fontSize: '22px',
                        fontWeight: 400,
                        color: 'var(--skra-djup)',
                        marginBottom: '10px',
                    }}
                >
                    Takk fyrir!
                </h3>
                <p
                    style={{
                        margin: 0,
                        fontFamily: 'var(--font-serif)',
                        fontStyle: 'italic',
                        color: 'var(--skra-mjuk)',
                        lineHeight: 1.55,
                    }}
                >
                    {message || 'Vitnisburðurinn þinn hefur verið sendur og bíður samþykkis.'}
                </p>
                <button
                    type="button"
                    onClick={() => setStatus('idle')}
                    style={{
                        marginTop: '24px',
                        padding: '10px 20px',
                        background: 'transparent',
                        border: '1px solid rgba(63,47,35,0.2)',
                        borderRadius: 'var(--radius-xs)',
                        color: 'var(--skra-mjuk)',
                        fontFamily: 'var(--font-sans)',
                        fontSize: '12px',
                        fontWeight: 700,
                        letterSpacing: '0.18em',
                        textTransform: 'uppercase',
                        cursor: 'pointer',
                    }}
                >
                    Senda annan vitnisburð
                </button>
            </div>
        );
    }

    const labelStyle: React.CSSProperties = {
        fontFamily: 'var(--font-sans)',
        fontSize: '11px',
        fontWeight: 700,
        letterSpacing: '0.18em',
        textTransform: 'uppercase',
        color: 'var(--skra-mjuk)',
        marginBottom: '8px',
        display: 'block',
    };

    const inputStyle: React.CSSProperties = {
        width: '100%',
        padding: '14px 16px 14px 44px',
        background: 'var(--skra)',
        border: '1px solid rgba(63,47,35,0.18)',
        borderRadius: 'var(--radius-xs)',
        color: 'var(--skra-djup)',
        fontFamily: 'var(--font-serif)',
        fontSize: '16px',
        lineHeight: 1.5,
        outline: 'none',
    };

    const iconStyle: React.CSSProperties = {
        position: 'absolute',
        left: '16px',
        top: '50%',
        transform: 'translateY(-50%)',
        color: 'var(--skra-mjuk)',
        pointerEvents: 'none',
    };

    return (
        <form action={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div
                style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                    gap: '20px',
                }}
            >
                <div>
                    <label htmlFor="name" style={labelStyle}>
                        Fullt nafn
                    </label>
                    <div style={{ position: 'relative' }}>
                        <span style={iconStyle}>
                            <User size={18} />
                        </span>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            required
                            placeholder="Jón Jónsson"
                            style={inputStyle}
                        />
                    </div>
                </div>

                <div>
                    <label htmlFor="email" style={labelStyle}>
                        Netfang (valfrjálst)
                    </label>
                    <div style={{ position: 'relative' }}>
                        <span style={iconStyle}>
                            <Mail size={18} />
                        </span>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            placeholder="jon@example.com"
                            style={inputStyle}
                        />
                    </div>
                </div>
            </div>

            <div>
                <label htmlFor="content" style={labelStyle}>
                    Þinn vitnisburður
                </label>
                <div style={{ position: 'relative' }}>
                    <span style={{ ...iconStyle, top: '20px', transform: 'none' }}>
                        <MessageSquare size={18} />
                    </span>
                    <textarea
                        id="content"
                        name="content"
                        required
                        rows={6}
                        placeholder="Deildu sögu þinni með okkur…"
                        style={{
                            ...inputStyle,
                            paddingTop: '16px',
                            resize: 'vertical',
                            minHeight: '160px',
                        }}
                    />
                </div>
            </div>

            {status === 'error' && (
                <div
                    style={{
                        padding: '14px 18px',
                        background: 'rgba(216, 75, 58, 0.08)',
                        border: '1px solid rgba(216, 75, 58, 0.25)',
                        borderRadius: 'var(--radius-xs)',
                        color: 'rgb(180, 60, 50)',
                        fontFamily: 'var(--font-sans)',
                        fontSize: '13px',
                        textAlign: 'center',
                    }}
                >
                    {message}
                </div>
            )}

            <button
                type="submit"
                disabled={isLoading}
                className="warm-hover"
                style={{
                    marginTop: '8px',
                    padding: '16px 28px',
                    background: 'var(--kerti)',
                    border: '1px solid var(--kerti)',
                    borderRadius: 'var(--radius-xs)',
                    color: 'var(--nott)',
                    fontFamily: 'var(--font-sans)',
                    fontSize: '13px',
                    fontWeight: 700,
                    letterSpacing: '0.18em',
                    textTransform: 'uppercase',
                    cursor: isLoading ? 'not-allowed' : 'pointer',
                    opacity: isLoading ? 0.6 : 1,
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '10px',
                }}
            >
                {isLoading ? (
                    <>
                        <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />
                        Sendi…
                    </>
                ) : (
                    <>
                        <Send size={16} />
                        Senda vitnisburð
                    </>
                )}
            </button>

            <style>{`
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </form>
    );
}
