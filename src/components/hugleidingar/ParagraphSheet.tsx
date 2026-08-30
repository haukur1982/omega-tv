'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Languages, Sparkles, Square, Undo2, Volume2, X } from 'lucide-react';
import ProseLine from './ProseLine';
import type { Flag } from '@/lib/devotional-review';

/**
 * One paragraph, lifted out of the reading page and onto a phone.
 *
 * The thinking is taken from book-system's `suggestion-sheet.tsx`: one sheet,
 * one question, one unit. Everything that belongs to this paragraph is here
 * and nothing else is — the reading page behind it stays prose.
 *
 * Two things that only matter on a real phone, and are the difference between
 * usable and not:
 *   · the field never scrolls inside itself (ProseLine); the SHEET scrolls.
 *   · iOS slides the viewport instead of resizing it, so a fixed sheet ends up
 *     underneath the keyboard. `visualViewport` is the only honest measure of
 *     what is still visible, and the sheet is lifted by that much.
 */

/** Far enough that nobody dismisses the sheet by accident. */
const DISMISS_PX = 90;

export default function ParagraphSheet({
    position, total, value, english, flags, changed, busy, saving, speaking, notice,
    instruction, instructionOpen,
    onChange, onInstruction, onToggleInstruction,
    onAsk, onRevert, onSpeak, onSave, onClose, children,
}: {
    position: number;
    total: number;
    value: string;
    english: string | null;
    flags: Flag[];
    changed: boolean;
    busy: boolean;
    saving: boolean;
    speaking: boolean;
    /** The page's own notice, repeated here — behind the scrim it is unreadable. */
    notice: string | null;
    instruction: string;
    instructionOpen: boolean;
    onChange: (v: string) => void;
    onInstruction: (v: string) => void;
    onToggleInstruction: () => void;
    onAsk: () => void;
    onRevert: () => void;
    onSpeak: () => void;
    onSave: () => void;
    onClose: () => void;
    children?: React.ReactNode;
}) {
    const [open, setOpen] = useState(false);
    const [showEn, setShowEn] = useState(false);
    const sheetRef = useRef<HTMLDivElement | null>(null);
    /** Set by the keyboard (visualViewport), by the drag, or by neither. */
    const liftRef = useRef(0);
    const dragRef = useRef<number | null>(null);

    const place = useCallback((extra = 0) => {
        const el = sheetRef.current;
        if (!el) return;
        const shift = extra - liftRef.current;
        el.style.transform = shift === 0 ? '' : `translateY(${shift}px)`;
    }, []);

    /* It rises: off-screen for one frame, then up. */
    useEffect(() => {
        const raf = requestAnimationFrame(() => setOpen(true));
        return () => cancelAnimationFrame(raf);
    }, []);

    useEffect(() => {
        const vv = typeof window === 'undefined' ? undefined : window.visualViewport;
        if (!vv) return;
        const onViewport = () => {
            liftRef.current = Math.max(0, window.innerHeight - vv.height - vv.offsetTop);
            place();
        };
        onViewport();
        vv.addEventListener('resize', onViewport);
        vv.addEventListener('scroll', onViewport);
        return () => {
            vv.removeEventListener('resize', onViewport);
            vv.removeEventListener('scroll', onViewport);
        };
    }, [place]);

    /* The page behind holds still while the sheet is up. */
    useEffect(() => {
        const previous = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        return () => { document.body.style.overflow = previous; };
    }, []);

    useEffect(() => {
        const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [onClose]);

    /* ── drag the sheet down to dismiss ── */
    const onTouchStart = (e: React.TouchEvent) => {
        const el = sheetRef.current;
        if (!el || el.scrollTop > 0) return;
        const target = e.target as HTMLElement;
        if (target.closest('textarea, input')) return;
        dragRef.current = e.touches[0].clientY;
    };
    const onTouchMove = (e: React.TouchEvent) => {
        if (dragRef.current === null) return;
        const dy = e.touches[0].clientY - dragRef.current;
        if (dy > 0) place(dy);
    };
    const onTouchEnd = (e: React.TouchEvent) => {
        if (dragRef.current === null) return;
        const dy = e.changedTouches[0].clientY - dragRef.current;
        dragRef.current = null;
        place();
        if (dy > DISMISS_PX) onClose();
    };

    return (
        <>
            <div className="devo-scrim" onClick={onClose} aria-hidden="true" />
            <div
                ref={sheetRef}
                className="devo-sheet-up"
                data-open={open ? 'true' : 'false'}
                role="dialog"
                aria-label={`Málsgrein ${position} af ${total}`}
                onTouchStart={onTouchStart}
                onTouchMove={onTouchMove}
                onTouchEnd={onTouchEnd}
            >
                <div className="devo-grip" aria-hidden="true" />

                <div className="devo-sheet-head">
                    <span className="devo-sheet-count">Málsgrein {position} af {total}</span>
                    {flags.map((f, k) => (
                        <span key={k} className={`devo-flag${f.kind === 'term' ? ' is-term' : ''}`} title={f.hint}>
                            {f.label}
                        </span>
                    ))}
                    <div style={{ flex: 1 }} />
                    <button type="button" className="devo-tool" onClick={onClose} aria-label="Loka">
                        <X size={15} />
                    </button>
                </div>

                <ProseLine value={value} onChange={onChange} className="devo-sheet-field" />

                {showEn && <p className="devo-en">{english ?? '—'}</p>}

                <div className="devo-sheet-acts">
                    {changed && (
                        <button type="button" className="devo-tool" onClick={onRevert} title="Aftur í upprunalegan texta">
                            <Undo2 size={14} />
                        </button>
                    )}
                    <button
                        type="button"
                        className={`devo-tool${showEn ? ' is-on' : ''}`}
                        onClick={() => setShowEn((v) => !v)}
                    >
                        <Languages size={14} /> Frumtexti
                    </button>
                    <button type="button" className="devo-tool" onClick={onSpeak}>
                        {speaking ? <Square size={13} /> : <Volume2 size={14} />}
                    </button>
                    <button
                        type="button"
                        className={`devo-tool${instructionOpen ? ' is-on' : ''}`}
                        onClick={onToggleInstruction}
                    >
                        Ósk
                    </button>
                    <button type="button" className="devo-tool is-go" onClick={onAsk} disabled={busy}>
                        <Sparkles size={14} /> {busy ? 'Hugsa…' : 'Tillögur'}
                    </button>
                </div>

                {instructionOpen && (
                    <input
                        className="devo-instr"
                        value={instruction}
                        onChange={(e) => onInstruction(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter') onAsk(); }}
                        placeholder="t.d. „of stíft, mýkri“"
                    />
                )}

                {children}

                {notice && <div className="devo-notice">{notice}</div>}

                <button type="button" className="devo-sheet-save" onClick={onSave} disabled={saving}>
                    {saving ? 'Vista…' : 'Vista'}
                </button>
            </div>
        </>
    );
}
