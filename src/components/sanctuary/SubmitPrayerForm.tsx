'use client';

import { useState, useCallback, useTransition } from 'react';
import { useRouter } from 'next/navigation';

/**
 * SubmitPrayerForm — compact inline form inside the live drawer.
 * Posts to /api/broadcast-prayers/submit. Prayer enters moderation
 * queue; appears in the wall after admin approves.
 *
 * UX: collapsed by default (single "Skrifa bæn" link), expands to
 * show the textarea + optional name field on focus/click. Quiet,
 * not a marquee form.
 */
export default function SubmitPrayerForm({ slotId }: { slotId: string }) {
    const router = useRouter();
    const [open, setOpen] = useState(false);
    const [name, setName] = useState('');
    const [content, setContent] = useState('');
    const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
    const [error, setError] = useState<string | null>(null);
    const [, startTransition] = useTransition();

    const submit = useCallback(
        async (e: React.FormEvent) => {
            e.preventDefault();
            setStatus('sending');
            setError(null);
            try {
                const res = await fetch('/api/broadcast-prayers/submit', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ slotId, name: name.trim() || null, content }),
                });
                if (!res.ok) {
                    const data = await res.json().catch(() => ({ error: 'Villa' }));
                    setError(data.error ?? 'Villa');
                    setStatus('error');
                    return;
                }
                setStatus('sent');
                setName('');
                setContent('');
                startTransition(() => router.refresh());
            } catch {
                setError('Villa í netsambandi.');
                setStatus('error');
            }
        },
        [slotId, name, content, router],
    );

    if (!open) {
        return (
            <button
                type="button"
                onClick={() => setOpen(true)}
                className="type-merki muted-link"
                style={{
                    background: 'none',
                    border: 'none',
                    padding: 0,
                    cursor: 'pointer',
                    letterSpacing: '0.2em',
                    fontSize: '0.68rem',
                    textAlign: 'left',
                }}
            >
                Skrifa bæn →
            </button>
        );
    }

    if (status === 'sent') {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <p
                    className="type-merki"
                    style={{ color: 'var(--kerti)', margin: 0, letterSpacing: '0.2em' }}
                >
                    Bæn móttekin
                </p>
                <p
                    style={{
                        margin: 0,
                        fontFamily: 'var(--font-serif)',
                        fontStyle: 'italic',
                        color: 'var(--moskva)',
                        fontSize: '0.92rem',
                        lineHeight: 1.5,
                    }}
                >
                    Bænin þín bíður yfirferðar og birtist hér eftir augnablik. Takk.
                </p>
                <button
                    type="button"
                    onClick={() => {
                        setStatus('idle');
                        setOpen(false);
                    }}
                    className="type-merki muted-link"
                    style={{
                        background: 'none',
                        border: 'none',
                        padding: 0,
                        cursor: 'pointer',
                        letterSpacing: '0.2em',
                        fontSize: '0.66rem',
                        textAlign: 'left',
                    }}
                >
                    Loka
                </button>
            </div>
        );
    }

    return (
        <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Hvað berð þú í hjarta þínu í kvöld?"
                maxLength={600}
                rows={4}
                required
                style={{
                    width: '100%',
                    padding: '10px 12px',
                    background: 'var(--nott)',
                    border: '1px solid var(--border)',
                    borderRadius: '2px',
                    color: 'var(--ljos)',
                    fontFamily: 'var(--font-serif)',
                    fontSize: '0.95rem',
                    lineHeight: 1.5,
                    resize: 'vertical',
                    outline: 'none',
                }}
                onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--kerti)'; }}
                onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; }}
            />
            <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nafn (valfrjálst)"
                maxLength={80}
                style={{
                    width: '100%',
                    padding: '10px 12px',
                    background: 'var(--nott)',
                    border: '1px solid var(--border)',
                    borderRadius: '2px',
                    color: 'var(--ljos)',
                    fontFamily: 'var(--font-sans)',
                    fontSize: '0.9rem',
                    outline: 'none',
                }}
                onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--kerti)'; }}
                onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; }}
            />
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <button
                    type="submit"
                    disabled={status === 'sending' || content.trim().length < 3}
                    className="warm-hover"
                    style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '10px 16px',
                        background: 'var(--kerti)',
                        color: 'var(--nott)',
                        border: '1px solid var(--kerti)',
                        borderRadius: '2px',
                        fontFamily: 'var(--font-sans)',
                        fontSize: '0.82rem',
                        fontWeight: 600,
                        letterSpacing: '0.02em',
                        cursor: status === 'sending' ? 'default' : 'pointer',
                        opacity: status === 'sending' || content.trim().length < 3 ? 0.6 : 1,
                    }}
                >
                    {status === 'sending' ? 'Sendi…' : 'Senda'}
                </button>
                <button
                    type="button"
                    onClick={() => {
                        setOpen(false);
                        setStatus('idle');
                        setError(null);
                    }}
                    className="type-merki muted-link"
                    style={{
                        background: 'none',
                        border: 'none',
                        padding: '10px 0',
                        cursor: 'pointer',
                        letterSpacing: '0.2em',
                        fontSize: '0.66rem',
                    }}
                >
                    Hætta við
                </button>
            </div>
            {error && (
                <p className="type-meta" style={{ margin: 0, color: 'var(--blod)' }}>
                    {error}
                </p>
            )}
        </form>
    );
}
