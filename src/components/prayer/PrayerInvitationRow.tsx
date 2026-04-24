'use client';

import { IcoQuote, IcoFeather } from './PrayerIcons';

/**
 * InvitationRow — the "write a prayer" entry point that REPLACES the
 * permanent right-hand form column. Feels like a candle stand, not a
 * form field. Clicking opens the submission modal.
 *
 * Per the altar metaphor: the form is not a fixture of the page; it's
 * an action you invoke. Amber appears once on the default page: here.
 */

interface Props {
    onOpen: () => void;
}

export default function PrayerInvitationRow({ onOpen }: Props) {
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
                background: 'var(--torfa)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-md)',
                display: 'grid',
                gridTemplateColumns: 'auto 1fr auto',
                gap: '28px',
                alignItems: 'center',
                marginTop: '40px',
                cursor: 'pointer',
            }}
        >
            <div style={{ color: 'var(--kerti)', opacity: 0.7 }}>
                <IcoQuote size={44} />
            </div>

            <div>
                <div
                    style={{
                        fontFamily: 'var(--font-serif)',
                        fontSize: '22px',
                        lineHeight: 1.35,
                        color: 'var(--ljos)',
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
                        color: 'var(--moskva)',
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
