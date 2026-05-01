'use client';

import { useState } from 'react';
import PrayerSubmissionModal from '@/components/prayer/PrayerSubmissionModal';

/**
 * SendaBaenButton — the "send a prayer" trigger on the on-air /live
 * page. Opens the same PrayerSubmissionModal Bænatorg uses, in place,
 * so the viewer never leaves the broadcast.
 *
 * Two visual variants matching the existing Beint composition:
 *   - 'primary' — amber-fill CTA in the LiveMeta row beside the player
 *   - 'ghost'   — quiet warm-bordered card with kicker + italic helper
 *                 used in OnAirEditorial below the program description
 *
 * Both open the same modal. The submission flows into the same
 * Bænatorg moderation queue. No separate broadcast prayer surface,
 * no second wall — Bænatorg still owns the prayer experience, but
 * the viewer doesn't have to leave the player to participate.
 */

type Variant = 'primary' | 'ghost';

interface Props {
    variant: Variant;
}

export default function SendaBaenButton({ variant }: Props) {
    const [open, setOpen] = useState(false);

    return (
        <>
            {variant === 'primary' ? (
                <button
                    type="button"
                    className="warm-hover"
                    onClick={() => setOpen(true)}
                    style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '10px',
                        padding: '14px 26px',
                        borderRadius: 'var(--radius-xs)',
                        background: 'var(--kerti)',
                        color: 'var(--nott)',
                        border: '1px solid var(--kerti)',
                        fontFamily: 'var(--font-sans)',
                        fontSize: '13.5px',
                        fontWeight: 700,
                        letterSpacing: '0.01em',
                        cursor: 'pointer',
                    }}
                >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                        <path d="M22 2L11 13" />
                        <path d="M22 2l-7 20-4-9-9-4 20-7z" />
                    </svg>
                    Senda bænaefni
                </button>
            ) : (
                <button
                    type="button"
                    className="warm-hover"
                    onClick={() => setOpen(true)}
                    style={{
                        marginTop: '26px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '12px 18px 12px 16px',
                        background: 'transparent',
                        border: '1px solid var(--border)',
                        borderRadius: 'var(--radius-xs)',
                        color: 'var(--ljos)',
                        cursor: 'pointer',
                        textAlign: 'left',
                    }}
                >
                    <span
                        aria-hidden
                        style={{
                            width: '8px',
                            height: '8px',
                            borderRadius: '50%',
                            background: 'var(--kerti)',
                            boxShadow: '0 0 0 4px var(--kerti-gloed)',
                            flexShrink: 0,
                        }}
                    />
                    <span
                        style={{
                            fontFamily: 'var(--font-sans)',
                            fontSize: '12px',
                            fontWeight: 700,
                            letterSpacing: '0.18em',
                            textTransform: 'uppercase',
                        }}
                    >
                        Senda bænarefni
                    </span>
                    <span
                        style={{
                            fontFamily: 'var(--font-serif)',
                            fontStyle: 'italic',
                            fontSize: '14px',
                            color: 'var(--moskva)',
                            borderLeft: '1px solid var(--border)',
                            paddingLeft: '12px',
                        }}
                    >
                        biðið er fyrir sendingum í beinni
                    </span>
                </button>
            )}

            <PrayerSubmissionModal open={open} onClose={() => setOpen(false)} />
        </>
    );
}
