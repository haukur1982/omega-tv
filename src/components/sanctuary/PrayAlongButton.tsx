'use client';

import { useState, useCallback, useTransition } from 'react';
import { useRouter } from 'next/navigation';

/**
 * PrayAlongButton — the "Bið með" tap for a broadcast prayer card.
 *
 * Anonymous, single-click, one tap per prayer per hour (cookie-rate-
 * limited by the API). The count updates optimistically; a router
 * refresh picks up the authoritative value on next render.
 */
export default function PrayAlongButton({
    prayerId,
    initialCount,
}: {
    prayerId: string;
    initialCount: number;
}) {
    const router = useRouter();
    const [count, setCount] = useState(initialCount);
    const [justPrayed, setJustPrayed] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isPending, startTransition] = useTransition();

    const prayAlong = useCallback(async () => {
        setError(null);
        // Optimistic bump
        const prevCount = count;
        setCount(prevCount + 1);
        setJustPrayed(true);

        try {
            const res = await fetch('/api/broadcast-prayers/pray-along', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prayerId }),
            });
            if (!res.ok) {
                const data = await res.json().catch(() => ({ error: 'Villa' }));
                // Roll back the optimistic bump only on a hard failure;
                // 429 (already prayed) is a soft no-op — leave the glow.
                if (res.status !== 429) {
                    setCount(prevCount);
                    setJustPrayed(false);
                }
                setError(data.error ?? 'Villa');
                setTimeout(() => setError(null), 3200);
                return;
            }
            const data = await res.json();
            if (typeof data.pray_count === 'number') {
                setCount(data.pray_count);
            }
            // Sync server state for other viewers on next render
            startTransition(() => router.refresh());
            // Hold the "just prayed" glow for a moment, then relax
            setTimeout(() => setJustPrayed(false), 2800);
        } catch {
            setCount(prevCount);
            setJustPrayed(false);
            setError('Villa í netsambandi.');
            setTimeout(() => setError(null), 3200);
        }
    }, [prayerId, count, router]);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <button
                type="button"
                onClick={prayAlong}
                disabled={isPending || justPrayed}
                aria-label={`Bið með — ${count} hafa beðið með`}
                style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '8px 14px',
                    background: justPrayed ? 'var(--kerti)' : 'transparent',
                    color: justPrayed ? 'var(--nott)' : 'var(--ljos)',
                    border: `1px solid ${justPrayed ? 'var(--kerti)' : 'var(--border-hover)'}`,
                    borderRadius: '2px',
                    fontFamily: 'var(--font-sans)',
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    letterSpacing: '0.02em',
                    cursor: isPending || justPrayed ? 'default' : 'pointer',
                    transition: 'background 300ms ease, color 300ms ease, border-color 300ms ease',
                }}
            >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M18 6c-2 0-3 1-3 2v1h-2c-1.5 0-2 1-2 2v1H9c-1.5 0-2 1-2 2v8h10v-7c0-1 .5-2 2-2h1c1 0 2-1 2-2V9c0-2-1-3-2-3h-2z" />
                </svg>
                {justPrayed ? 'Bað með · amen' : 'Bið með'}
                <span
                    className="type-kodi"
                    style={{
                        marginLeft: '2px',
                        color: justPrayed ? 'var(--nott)' : 'var(--moskva)',
                        fontSize: '0.78rem',
                    }}
                >
                    {count}
                </span>
            </button>
            {error && (
                <p
                    className="type-meta"
                    style={{ margin: 0, color: 'var(--steinn)', fontSize: '0.72rem' }}
                >
                    {error}
                </p>
            )}
        </div>
    );
}
