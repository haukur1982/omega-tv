'use client';

import { useEffect, useRef, useState, useTransition } from 'react';
import { pulseLivePrayer } from '@/actions/live-prayer-pulse';

/**
 * LivePrayerPulse — "Bið með" tap-counter for the on-air /live state.
 *
 * The simplest expression of "people are praying with this broadcast
 * right now." One button, one tap, anonymous, no form. The number
 * ticks up live as other devices tap. Per-broadcast scope — each
 * schedule slot has its own count.
 *
 * Polls /api/live/pulse/[slotId] every 15s for live updates. Optimistic
 * increment on local tap so the user sees their own contribution
 * immediately; the server response replaces the optimistic value with
 * the authoritative count. Server action handles cookie rate-limiting
 * (3s) so a double-tap doesn't double-count.
 *
 * Visual restraint: no candles, no flares, no live-streaming text. A
 * quiet number with a quiet button. Reads as donor-stewardship-evidence
 * ("real people, agreeing in prayer right now"), not gamification.
 */

interface Props {
    slotId: string;
}

const POLL_MS = 15_000;

export default function LivePrayerPulse({ slotId }: Props) {
    const [count, setCount] = useState<number | null>(null);
    const [tapped, setTapped] = useState(false);
    const [isPending, startTransition] = useTransition();
    const tapResetTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Initial fetch + polling for live count.
    useEffect(() => {
        let cancelled = false;

        const tick = async () => {
            try {
                const res = await fetch(`/api/live/pulse/${slotId}`, { cache: 'no-store' });
                if (!res.ok) return;
                const data = await res.json();
                if (!cancelled && typeof data.count === 'number') {
                    setCount((c) => Math.max(c ?? 0, data.count));
                }
            } catch {
                /* swallow — next poll will retry */
            }
        };

        tick();
        const id = setInterval(tick, POLL_MS);
        return () => {
            cancelled = true;
            clearInterval(id);
        };
    }, [slotId]);

    const handleTap = () => {
        if (tapped || isPending) return;

        // Optimistic — show the user's own tap immediately.
        setCount((c) => (c ?? 0) + 1);
        setTapped(true);

        if (tapResetTimer.current) clearTimeout(tapResetTimer.current);
        tapResetTimer.current = setTimeout(() => setTapped(false), 4500);

        startTransition(async () => {
            const result = await pulseLivePrayer(slotId);
            // Authoritative replacement. If the server throttled,
            // the count stays where it was — but the optimistic +1
            // we already added stays visible, which is correct
            // because the real count has at least one tap from us.
            if (typeof result.count === 'number' && result.count > 0) {
                setCount(result.count);
            }
        });
    };

    const displayCount = count ?? 0;
    const hasAny = displayCount > 0;

    return (
        <section
            aria-label="Bænapúls í útsendingu"
            style={{
                marginTop: '36px',
                padding: 'clamp(28px, 3vw, 40px) clamp(28px, 3vw, 40px)',
                background: 'rgba(63,47,35,0.32)', // --torfa wash
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-md)',
                display: 'grid',
                gridTemplateColumns: 'minmax(0, 1fr) auto',
                gap: '24px',
                alignItems: 'center',
            }}
        >
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '14px', flexWrap: 'wrap' }}>
                {hasAny ? (
                    <>
                        <span
                            style={{
                                fontFamily: 'var(--font-serif)',
                                fontSize: 'clamp(34px, 3.4vw, 48px)',
                                fontWeight: 400,
                                color: 'var(--ljos)',
                                letterSpacing: '-0.02em',
                                lineHeight: 1,
                                fontFeatureSettings: '"lnum", "tnum"',
                            }}
                        >
                            {displayCount.toLocaleString('is-IS')}
                        </span>
                        <span
                            style={{
                                fontFamily: 'var(--font-serif)',
                                fontStyle: 'italic',
                                fontSize: '17px',
                                color: 'var(--moskva)',
                                lineHeight: 1.4,
                            }}
                        >
                            biðja með þessari útsendingu núna
                        </span>
                    </>
                ) : (
                    <span
                        style={{
                            fontFamily: 'var(--font-serif)',
                            fontStyle: 'italic',
                            fontSize: '20px',
                            color: 'var(--ljos)',
                            letterSpacing: '-0.005em',
                            lineHeight: 1.35,
                        }}
                    >
                        Vertu fyrst/ur til að biðja með þessari útsendingu.
                    </span>
                )}
            </div>

            <button
                type="button"
                onClick={handleTap}
                disabled={tapped || isPending}
                aria-pressed={tapped}
                style={{
                    padding: '15px 26px',
                    background: tapped
                        ? 'color-mix(in oklab, var(--kerti) 16%, transparent)'
                        : 'var(--kerti)',
                    border: `1px solid ${tapped ? 'var(--kerti)' : 'var(--kerti)'}`,
                    color: tapped ? 'var(--kerti)' : 'var(--nott)',
                    fontFamily: 'var(--font-sans)',
                    fontSize: '13px',
                    fontWeight: 700,
                    letterSpacing: '0.14em',
                    textTransform: 'uppercase',
                    borderRadius: 'var(--radius-xs)',
                    cursor: tapped ? 'default' : 'pointer',
                    whiteSpace: 'nowrap',
                    transition: 'background 220ms ease, color 220ms ease',
                }}
            >
                {tapped ? 'Þú baðst með' : 'Bið með'}
            </button>
        </section>
    );
}
