'use client';

import { formatMkr, formatNumberIs } from '@/lib/fundraising-shared';

/**
 * Compact progress strip directly under the hero — the money and the ask
 * on screen within the first scroll (Codex review, point 1). One quiet
 * line: raised · goal · % · Styrkja link. Tabular numbers so nothing dances.
 */
export default function HeroProgressStrip({
    raised,
    goal,
}: {
    raised: number;
    goal: number;
}) {
    const pct = goal > 0 ? Math.floor(Math.min(100, (raised / goal) * 100)) : 0;
    return (
        <div style={{ background: 'var(--nott)', borderBottom: '1px solid rgba(246,242,234,0.06)' }}>
            <div
                style={{
                    maxWidth: '80rem',
                    margin: '0 auto',
                    padding: '14px var(--rail-padding)',
                    display: 'flex',
                    alignItems: 'baseline',
                    gap: '10px 22px',
                    flexWrap: 'wrap',
                    fontFamily: 'var(--font-sans)',
                    fontVariantNumeric: 'tabular-nums',
                }}
            >
                <span style={{ fontSize: '15px', fontWeight: 700, color: 'var(--kerti)' }}>
                    {formatNumberIs(raised)} kr.
                </span>
                <span style={{ fontSize: '13px', color: 'var(--moskva)' }}>
                    af {formatMkr(goal)}
                </span>
                <span style={{ fontSize: '13px', color: 'var(--moskva)' }}>{pct}%</span>
                <a
                    href="#styrkja"
                    style={{
                        marginLeft: 'auto',
                        fontSize: '13px',
                        fontWeight: 600,
                        letterSpacing: '0.08em',
                        color: 'var(--kerti)',
                        textDecoration: 'none',
                    }}
                >
                    Styrkja →
                </a>
            </div>
        </div>
    );
}
