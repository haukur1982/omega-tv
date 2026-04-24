'use client';

export type PrayerFilter = 'allar' | 'mest' | 'svor';

interface Props {
    active: PrayerFilter;
    onChange: (filter: PrayerFilter) => void;
    counts: { allar: number; mest: number; svor: number };
}

/**
 * FilterStrip — Allar / Mest beðnar / Bænasvör tabs.
 *
 * Not a filled pill (the old bug). Tab-strip with an underline in
 * --nordurljos for the active item — matches the corrected nav
 * pattern from the Beint redesign.
 *
 * This is wayfinding (filter = what you're viewing), not a form
 * control, so slate is correct.
 */

export default function PrayerFilterStrip({ active, onChange, counts }: Props) {
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
                borderBottom: '1px solid var(--border)',
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
                            color: isActive ? 'var(--ljos)' : 'var(--moskva)',
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
                                color: isActive ? 'var(--moskva)' : 'var(--steinn)',
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
