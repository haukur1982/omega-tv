'use client';

export type PrayerFilter = 'allar' | 'mest' | 'svor';

type Register = 'dark' | 'light';

interface Props {
    active: PrayerFilter;
    onChange: (filter: PrayerFilter) => void;
    counts: { allar: number; mest: number; svor: number };
    register?: Register;
}

/**
 * FilterStrip — Allar / Mest beðnar / Bænasvör tabs.
 *
 * Tab-strip with a slate underline for the active item — matches
 * the corrected nav pattern from the Beint redesign. Wayfinding
 * (filter = what you're viewing), not a form control, so slate is
 * the right color in both registers.
 */

export default function PrayerFilterStrip({ active, onChange, counts, register = 'dark' }: Props) {
    const isLight = register === 'light';

    const tokens = isLight
        ? {
            activeColor: 'var(--skra-djup)',
            idleColor: 'var(--skra-mjuk)',
            activeCountColor: 'var(--skra-mjuk)',
            idleCountColor: 'rgba(74,67,57,0.55)',
            borderColor: 'rgba(63,47,35,0.18)',
        }
        : {
            activeColor: 'var(--ljos)',
            idleColor: 'var(--moskva)',
            activeCountColor: 'var(--moskva)',
            idleCountColor: 'var(--steinn)',
            borderColor: 'var(--border)',
        };

    const tabs: Array<{ id: PrayerFilter; label: string; count: number }> = [
        { id: 'allar', label: 'Allar', count: counts.allar },
        { id: 'mest', label: 'Mest beðnar', count: counts.mest },
        { id: 'svor', label: 'Bænasvör', count: counts.svor },
    ];

    return (
        <div
            style={{
                display: 'flex',
                alignItems: 'center',
                gap: '32px',
                margin: '48px 0 0',
                borderBottom: `1px solid ${tokens.borderColor}`,
                flexWrap: 'wrap',
            }}
        >
            {tabs.map((t) => {
                const isActive = active === t.id;
                return (
                    <button
                        key={t.id}
                        type="button"
                        onClick={() => onChange(t.id)}
                        style={{
                            position: 'relative',
                            padding: '16px 2px',
                            background: 'transparent',
                            border: 0,
                            color: isActive ? tokens.activeColor : tokens.idleColor,
                            fontFamily: 'var(--font-sans)',
                            fontSize: '12px',
                            fontWeight: 700,
                            letterSpacing: '0.18em',
                            textTransform: 'uppercase',
                            cursor: 'pointer',
                            transition: 'color 200ms ease',
                        }}
                    >
                        {t.label}
                        <span
                            style={{
                                marginLeft: '8px',
                                fontFamily: 'var(--font-serif)',
                                fontStyle: 'italic',
                                fontSize: '13px',
                                fontWeight: 400,
                                color: isActive ? tokens.activeCountColor : tokens.idleCountColor,
                                letterSpacing: 0,
                                textTransform: 'none',
                            }}
                        >
                            {t.count}
                        </span>
                        {isActive && (
                            <span
                                aria-hidden
                                style={{
                                    position: 'absolute',
                                    left: 0,
                                    right: 0,
                                    bottom: '-1px',
                                    height: '2px',
                                    background: 'var(--nordurljos)',
                                }}
                            />
                        )}
                    </button>
                );
            })}
        </div>
    );
}
