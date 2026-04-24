'use client';

import { useState, useEffect, useRef, useTransition } from 'react';
import { submitPrayerAction } from '@/actions/prayer';
import { IcoClose, IcoFeather } from './PrayerIcons';

/**
 * PrayerSubmissionModal — full submission experience, invoked from the
 * invitation row. Desktop: centered 560px panel on a dimmed overlay.
 * Mobile: full-height sheet from the bottom (covers the feed so the
 * user is fully in the "posture" of prayer while writing).
 *
 * Per the moderation pipeline: on submit, the prayer is inserted
 * with is_approved=false and appears after an admin approves. The
 * success message honors that honestly ("verður yfirfarin og birt
 * fljótlega"), not "instantly live on the board."
 */

interface Props {
    open: boolean;
    onClose: () => void;
}

const TAG_OPTIONS: Array<{ id: string; label: string; categoryType: string }> = [
    { id: 'almennt', label: 'Almenn bæn', categoryType: 'personal' },
    { id: 'heilsa', label: 'Heilsa', categoryType: 'personal' },
    { id: 'fjolskylda', label: 'Fjölskylda', categoryType: 'personal' },
    { id: 'tru', label: 'Trú og þjónusta', categoryType: 'personal' },
    { id: 'thakklaeti', label: 'Þakklæti', categoryType: 'personal' },
];

export default function PrayerSubmissionModal({ open, onClose }: Props) {
    const [anonymous, setAnonymous] = useState(true);
    const [tagId, setTagId] = useState('almennt');
    const [content, setContent] = useState('');
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [isPending, startTransition] = useTransition();
    const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const firstField = useRef<HTMLTextAreaElement | null>(null);

    // Esc + body scroll lock
    useEffect(() => {
        if (!open) return;
        const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
        document.addEventListener('keydown', onKey);
        document.body.style.overflow = 'hidden';
        const t = setTimeout(() => firstField.current?.focus(), 80);
        return () => {
            document.removeEventListener('keydown', onKey);
            document.body.style.overflow = '';
            clearTimeout(t);
        };
    }, [open, onClose]);

    // Reset form on close
    useEffect(() => {
        if (!open) {
            setStatus('idle');
            setErrorMsg(null);
        }
    }, [open]);

    if (!open) return null;

    const canSubmit = content.trim().length > 0 && !isPending && status !== 'success';

    const handleSubmit = () => {
        if (!canSubmit) return;
        const selectedTag = TAG_OPTIONS.find((t) => t.id === tagId) ?? TAG_OPTIONS[0];
        const fd = new FormData();
        fd.append('name', anonymous ? '' : name);
        fd.append('email', email);
        fd.append('topic', selectedTag.label);
        fd.append('content', content);
        fd.append('categoryType', selectedTag.categoryType);

        startTransition(async () => {
            const result = await submitPrayerAction(fd);
            if (result.success) {
                setStatus('success');
                setContent('');
                setName('');
                setEmail('');
            } else {
                setStatus('error');
                setErrorMsg(result.error ?? 'Villa kom upp.');
            }
        });
    };

    return (
        <>
            {/* Overlay */}
            <div
                onClick={onClose}
                aria-hidden
                style={{
                    position: 'fixed',
                    inset: 0,
                    background: 'rgba(10,8,5,0.7)',
                    backdropFilter: 'blur(6px)',
                    zIndex: 100,
                    animation: 'fadeIn 200ms ease',
                }}
            />

            {/* Panel — centered on desktop, full-sheet on mobile (≤ 640px) */}
            <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="mod-title"
                className="prayer-modal-panel"
                style={{
                    position: 'fixed',
                    zIndex: 101,
                    background: 'var(--mold)',
                    border: '1px solid var(--border)',
                    color: 'var(--ljos)',
                    boxShadow: 'var(--shadow-lift)',
                    overflow: 'auto',
                }}
            >
                {/* Inline style element for responsive mobile-sheet treatment */}
                <style>{`
                    .prayer-modal-panel {
                        top: 50%;
                        left: 50%;
                        transform: translate(-50%, -50%);
                        width: min(560px, calc(100vw - 32px));
                        max-height: calc(100vh - 48px);
                        border-radius: var(--radius-md);
                    }
                    @media (max-width: 640px) {
                        .prayer-modal-panel {
                            top: auto;
                            left: 0;
                            bottom: 0;
                            transform: none;
                            width: 100vw;
                            max-height: 92vh;
                            border-radius: 16px 16px 0 0;
                            border-bottom: 0;
                        }
                    }
                    @keyframes fadeIn {
                        from { opacity: 0; }
                        to { opacity: 1; }
                    }
                `}</style>

                {status === 'success' ? (
                    <SuccessPane onClose={onClose} />
                ) : (
                    <>
                        {/* Header */}
                        <div
                            style={{
                                display: 'flex',
                                alignItems: 'flex-start',
                                justifyContent: 'space-between',
                                padding: '26px 30px 16px',
                                borderBottom: '1px solid var(--border)',
                            }}
                        >
                            <div>
                                <div
                                    style={{
                                        fontFamily: 'var(--font-sans)',
                                        fontSize: '11px',
                                        fontWeight: 700,
                                        letterSpacing: '0.22em',
                                        textTransform: 'uppercase',
                                        color: 'var(--moskva)',
                                        marginBottom: '10px',
                                    }}
                                >
                                    Bænatorg
                                </div>
                                <h2
                                    id="mod-title"
                                    style={{
                                        margin: 0,
                                        fontFamily: 'var(--font-serif)',
                                        fontSize: '28px',
                                        lineHeight: 1.1,
                                        letterSpacing: '-0.012em',
                                        fontWeight: 400,
                                        color: 'var(--ljos)',
                                    }}
                                >
                                    Berðu fram bæn
                                </h2>
                            </div>
                            <button
                                type="button"
                                onClick={onClose}
                                aria-label="Loka"
                                style={{
                                    background: 'transparent',
                                    border: '1px solid var(--border)',
                                    color: 'var(--moskva)',
                                    padding: '9px',
                                    borderRadius: 'var(--radius-xs)',
                                    cursor: 'pointer',
                                    display: 'inline-flex',
                                }}
                            >
                                <IcoClose size={16} />
                            </button>
                        </div>

                        {/* Body */}
                        <div style={{ padding: '22px 30px 8px' }}>
                            <label
                                htmlFor="prayer-content"
                                style={{
                                    display: 'block',
                                    fontFamily: 'var(--font-sans)',
                                    fontSize: '11px',
                                    fontWeight: 700,
                                    letterSpacing: '0.16em',
                                    textTransform: 'uppercase',
                                    color: 'var(--moskva)',
                                    marginBottom: '10px',
                                }}
                            >
                                Bænaefni
                            </label>
                            <textarea
                                id="prayer-content"
                                ref={firstField}
                                placeholder="Það sem liggur þér á hjarta…"
                                value={content}
                                onChange={(e) => setContent(e.target.value.slice(0, 500))}
                                rows={5}
                                style={{
                                    width: '100%',
                                    background: 'var(--torfa)',
                                    border: '1px solid var(--border)',
                                    borderRadius: 'var(--radius-xs)',
                                    padding: '14px 16px',
                                    color: 'var(--ljos)',
                                    fontFamily: 'var(--font-serif)',
                                    fontStyle: 'italic',
                                    fontSize: '17px',
                                    lineHeight: 1.5,
                                    resize: 'vertical',
                                    minHeight: '120px',
                                }}
                            />
                            <div
                                style={{
                                    marginTop: '6px',
                                    fontFamily: 'var(--font-sans)',
                                    fontSize: '11px',
                                    color: 'var(--steinn)',
                                    letterSpacing: '0.04em',
                                    textAlign: 'right',
                                }}
                            >
                                {content.length} / 500
                            </div>

                            <label
                                style={{
                                    display: 'block',
                                    marginTop: '14px',
                                    fontFamily: 'var(--font-sans)',
                                    fontSize: '11px',
                                    fontWeight: 700,
                                    letterSpacing: '0.16em',
                                    textTransform: 'uppercase',
                                    color: 'var(--moskva)',
                                    marginBottom: '10px',
                                }}
                            >
                                Flokkur
                            </label>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                {TAG_OPTIONS.map((t) => {
                                    const active = tagId === t.id;
                                    return (
                                        <button
                                            key={t.id}
                                            type="button"
                                            onClick={() => setTagId(t.id)}
                                            style={{
                                                padding: '8px 14px',
                                                background: active
                                                    ? 'color-mix(in oklab, var(--kerti) 10%, transparent)'
                                                    : 'transparent',
                                                border: `1px solid ${active ? 'var(--kerti)' : 'var(--border)'}`,
                                                color: active ? 'var(--ljos)' : 'var(--moskva)',
                                                fontFamily: 'var(--font-serif)',
                                                fontStyle: 'italic',
                                                fontSize: '14px',
                                                cursor: 'pointer',
                                                borderRadius: 'var(--radius-xs)',
                                                transition: 'all 200ms ease',
                                            }}
                                        >
                                            {t.label}
                                        </button>
                                    );
                                })}
                            </div>

                            <label
                                style={{
                                    marginTop: '22px',
                                    display: 'flex',
                                    alignItems: 'flex-start',
                                    gap: '14px',
                                    padding: '16px',
                                    border: '1px solid var(--border)',
                                    borderRadius: 'var(--radius-xs)',
                                    cursor: 'pointer',
                                    background: anonymous
                                        ? 'color-mix(in oklab, var(--kerti) 5%, transparent)'
                                        : 'transparent',
                                    transition: 'background 180ms ease',
                                }}
                            >
                                <input
                                    type="checkbox"
                                    checked={anonymous}
                                    onChange={(e) => setAnonymous(e.target.checked)}
                                    style={{
                                        marginTop: '3px',
                                        accentColor: 'var(--kerti)',
                                        width: '16px',
                                        height: '16px',
                                        flexShrink: 0,
                                        cursor: 'pointer',
                                    }}
                                />
                                <div>
                                    <div
                                        style={{
                                            fontFamily: 'var(--font-sans)',
                                            fontSize: '14px',
                                            fontWeight: 600,
                                            color: 'var(--ljos)',
                                        }}
                                    >
                                        Senda nafnlaust
                                    </div>
                                    <div
                                        style={{
                                            fontFamily: 'var(--font-serif)',
                                            fontStyle: 'italic',
                                            fontSize: '13.5px',
                                            color: 'var(--moskva)',
                                            marginTop: '3px',
                                            lineHeight: 1.5,
                                        }}
                                    >
                                        Birt sem „Nafnlaust systkin". Aðeins Omega-teymið sér netfang þitt, og aðeins ef þú kýst að láta það fylgja.
                                    </div>
                                </div>
                            </label>

                            {!anonymous && (
                                <div style={{ marginTop: '14px', display: 'grid', gap: '10px' }}>
                                    <input
                                        type="text"
                                        placeholder="Nafn"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        style={{
                                            background: 'var(--torfa)',
                                            border: '1px solid var(--border)',
                                            borderRadius: 'var(--radius-xs)',
                                            padding: '12px 14px',
                                            color: 'var(--ljos)',
                                            fontFamily: 'var(--font-sans)',
                                            fontSize: '14px',
                                        }}
                                    />
                                    <input
                                        type="email"
                                        placeholder="Netfang (valkvætt)"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        style={{
                                            background: 'var(--torfa)',
                                            border: '1px solid var(--border)',
                                            borderRadius: 'var(--radius-xs)',
                                            padding: '12px 14px',
                                            color: 'var(--ljos)',
                                            fontFamily: 'var(--font-sans)',
                                            fontSize: '14px',
                                        }}
                                    />
                                </div>
                            )}

                            {status === 'error' && errorMsg && (
                                <div
                                    style={{
                                        marginTop: '16px',
                                        padding: '12px 14px',
                                        border: '1px solid rgba(216,75,58,0.45)',
                                        background: 'rgba(216,75,58,0.08)',
                                        borderRadius: 'var(--radius-xs)',
                                        color: 'var(--blod)',
                                        fontFamily: 'var(--font-sans)',
                                        fontSize: '13px',
                                    }}
                                >
                                    {errorMsg}
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                padding: '20px 30px 26px',
                                borderTop: '1px solid var(--border)',
                                marginTop: '22px',
                                gap: '16px',
                                flexWrap: 'wrap',
                            }}
                        >
                            <div
                                style={{
                                    fontFamily: 'var(--font-serif)',
                                    fontStyle: 'italic',
                                    fontSize: '13px',
                                    color: 'var(--moskva)',
                                    maxWidth: '300px',
                                    lineHeight: 1.5,
                                }}
                            >
                                „Biðjið hver fyrir öðrum."{' '}
                                <span style={{ color: 'var(--steinn)' }}>— Jak 5:16</span>
                            </div>
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <button
                                    type="button"
                                    onClick={onClose}
                                    style={{
                                        padding: '12px 18px',
                                        background: 'transparent',
                                        border: '1px solid var(--border)',
                                        color: 'var(--moskva)',
                                        fontFamily: 'var(--font-sans)',
                                        fontSize: '12px',
                                        fontWeight: 600,
                                        letterSpacing: '0.1em',
                                        textTransform: 'uppercase',
                                        borderRadius: 'var(--radius-xs)',
                                        cursor: 'pointer',
                                    }}
                                >
                                    Hætta við
                                </button>
                                <button
                                    type="button"
                                    onClick={handleSubmit}
                                    disabled={!canSubmit}
                                    className="warm-hover"
                                    style={{
                                        padding: '12px 22px',
                                        background: canSubmit
                                            ? 'var(--kerti)'
                                            : 'color-mix(in oklab, var(--kerti) 25%, transparent)',
                                        border: '1px solid var(--kerti)',
                                        color: 'var(--nott)',
                                        fontFamily: 'var(--font-sans)',
                                        fontSize: '12px',
                                        fontWeight: 700,
                                        letterSpacing: '0.12em',
                                        textTransform: 'uppercase',
                                        borderRadius: 'var(--radius-xs)',
                                        cursor: canSubmit ? 'pointer' : 'not-allowed',
                                        opacity: canSubmit ? 1 : 0.55,
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '10px',
                                    }}
                                >
                                    <IcoFeather size={14} />
                                    {isPending ? 'Sendi…' : 'Senda bæn'}
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </>
    );
}

function SuccessPane({ onClose }: { onClose: () => void }) {
    return (
        <div style={{ padding: '56px 36px 48px', textAlign: 'center' }}>
            <div
                style={{
                    fontFamily: 'var(--font-sans)',
                    fontSize: '11px',
                    fontWeight: 700,
                    letterSpacing: '0.22em',
                    textTransform: 'uppercase',
                    color: 'var(--moskva)',
                    marginBottom: '18px',
                }}
            >
                Bæn móttekin
            </div>
            <p
                style={{
                    margin: 0,
                    fontFamily: 'var(--font-serif)',
                    fontSize: '22px',
                    lineHeight: 1.4,
                    color: 'var(--ljos)',
                    fontStyle: 'italic',
                    maxWidth: '36ch',
                    marginLeft: 'auto',
                    marginRight: 'auto',
                }}
            >
                Þakka þér. Bæn þín verður yfirfarin og birt á torginu fljótlega.
            </p>
            <p
                style={{
                    margin: '20px auto 0',
                    maxWidth: '36ch',
                    fontFamily: 'var(--font-serif)',
                    fontStyle: 'italic',
                    fontSize: '14px',
                    color: 'var(--moskva)',
                    lineHeight: 1.5,
                }}
            >
                „Verið ekki áhyggjufullir um neitt, heldur gerið í öllum hlutum óskir yðar kunnar Guði með bæn og þakkargjörð."
                <br />
                <span style={{ color: 'var(--steinn)' }}>— Fil 4:6</span>
            </p>
            <button
                type="button"
                onClick={onClose}
                className="warm-hover"
                style={{
                    marginTop: '32px',
                    padding: '12px 26px',
                    background: 'transparent',
                    border: '1px solid var(--kerti)',
                    color: 'var(--kerti)',
                    fontFamily: 'var(--font-sans)',
                    fontSize: '12px',
                    fontWeight: 700,
                    letterSpacing: '0.12em',
                    textTransform: 'uppercase',
                    borderRadius: 'var(--radius-xs)',
                    cursor: 'pointer',
                }}
            >
                Loka
            </button>
        </div>
    );
}
