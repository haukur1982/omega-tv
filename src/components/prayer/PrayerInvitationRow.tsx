'use client';

import { IcoQuote, IcoFeather } from './PrayerIcons';

/**
 * InvitationRow — the "write a prayer" entry point. Two registers:
 *
 *   - "dark"  (default) — warm-black --torfa background, cream copy.
 *     Use on a dark page.
 *   - "light"            — pergament-tinted background, ink copy on
 *     cream. Use on the vellum register so the row reads as part of
 *     the "letters on a desk" composition rather than a dark island.
 *
 * Amber CTA is the same in both registers — gold reads on cream as
 * surely as it reads on dark, and amber stays the page's single
 * primary action either way.
 */

type Register = 'dark' | 'light';

interface Props {
    onOpen: () => void;
    register?: Register;
}

export default function PrayerInvitationRow({ onOpen, register = 'dark' }: Props) {
    const isLight = register === 'light';

    const tokens = isLight
        ? {
            bg: 'rgba(212,194,162,0.18)',           // pergament wash on cream
            border: 'rgba(63,47,35,0.14)',          // mór hairline
            quoteColor: 'var(--gull)',
            titleColor: 'var(--skra-djup)',
            descColor: 'var(--skra-mjuk)',
        }
        : {
            bg: 'var(--torfa)',
            border: 'var(--border)',
            quoteColor: 'var(--kerti)',
            titleColor: 'var(--ljos)',
            descColor: 'var(--moskva)',
        };

    return (
        <div
            className="warm-hover"
            role="button"
            tabIndex={0}
            onClick={onOpen}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onOpen(); } }}
            style={{
                position: 'relative',
                padding: '34px 38px',
                background: tokens.bg,
                border: `1px solid ${tokens.border}`,
                borderRadius: 'var(--radius-md)',
                display: 'grid',
                gridTemplateColumns: 'auto 1fr auto',
                gap: '28px',
                alignItems: 'center',
                marginTop: '40px',
                cursor: 'pointer',
            }}
        >
            <div style={{ color: tokens.quoteColor, opacity: isLight ? 0.85 : 0.7 }}>
                <IcoQuote size={44} />
            </div>

            <div>
                <div
                    style={{
                        fontFamily: 'var(--font-serif)',
                        fontSize: '22px',
                        lineHeight: 1.35,
                        color: tokens.titleColor,
                        letterSpacing: '-0.005em',
                    }}
                >
                    Berðu fram bæn
                </div>
                <div
                    style={{
                        marginTop: '6px',
                        fontFamily: 'var(--font-serif)',
                        fontStyle: 'italic',
                        fontSize: '15px',
                        color: tokens.descColor,
                        maxWidth: '540px',
                        lineHeight: 1.5,
                    }}
                >
                    Nafnlaust ef þú kýst. Systkin í trúnni biðja með þér.
                </div>
            </div>

            <button
                type="button"
                className="warm-hover"
                onClick={(e) => { e.stopPropagation(); onOpen(); }}
                style={{
                    padding: '14px 22px',
                    border: '1px solid var(--kerti)',
                    background: 'var(--kerti)',
                    color: 'var(--nott)',
                    fontFamily: 'var(--font-sans)',
                    fontSize: '13px',
                    fontWeight: 700,
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    borderRadius: 'var(--radius-xs)',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '10px',
                    whiteSpace: 'nowrap',
                }}
            >
                <IcoFeather size={16} />
                Skrifa bæn
            </button>
        </div>
    );
}
