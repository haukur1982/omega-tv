'use client';

import React, { useMemo, useState } from 'react';
import { Check, Square, Volume2 } from 'lucide-react';
import {
    alignSentences, diffWords, groupEdits, isDifferent, joinSentences, splitSentences,
    type Edit,
} from '@/lib/devotional-review';

/**
 * One card, and the SENTENCE is the unit of choice — used by both the laptop
 * reading room and the phone sheet.
 *
 * The chip card that came before this treated the paragraph as one decision
 * per word. That is right for a three-word fix and wrong for a rewrite: when a
 * register rewrites most of a sentence, a word-level diff renders red-green
 * confetti, the chips truncate into nonsense, and half the ink on screen is
 * the reviewer's own text struck through — which he can already read, right
 * above, unstruck.
 *
 * So: rows of sentences, each offering the same sentence in each register as
 * CLEAN PROSE, one tap to take one. Word chips survive only where an option
 * differs by three words or fewer, which is exactly where a chip still means
 * something. There is no strikethrough anywhere in this card, on purpose.
 *
 * Everything a tap produces goes out through `onUseAll` with the whole
 * paragraph rebuilt from the original separators, so autosave, revert and the
 * corrections record see the reviewer's own text — the same path a keystroke
 * takes.
 *
 * Styling lives in the reading room's SHEET_CSS (the page owns one stylesheet,
 * as the other hugleiðingar screens do), so this renders inside `.devo-sheet`.
 */

export interface SuggestOption {
    label: string;
    text: string;
    /** One per sentence of the reviewer's paragraph. Absent on old cache rows. */
    sentences?: string[];
}
export interface Suggestion { options: SuggestOption[]; note: string; learnedFrom: number }

/** An edit the reviewer has already taken — kept so the chip can say so. */
export interface TakenEdit { label: string; removed: string[]; added: string[] }

/** Past this, an edit is a rewrite and a chip would be a lie about its size. */
const CHIP_MAX_WORDS = 3;

/** One identity for "he has taken nothing back yet", so the memos hold. */
const NO_LINES: Record<number, string> = {};

/** A substitution of one word for another is ONE changed word, not two. */
function changedWords(edits: Edit[]): number {
    return edits.reduce((n, e) => n + Math.max(e.removed.length, e.added.length), 0);
}

/**
 * One option, as prose. Only what this option actually says is rendered — the
 * words it drops are simply not there — and what it brings that the current
 * line does not gets a soft gull underline. No deletions, ever.
 */
function OptionProse({ from, text }: { from: string; text: string }) {
    const parts = useMemo(() => diffWords(from, text), [from, text]);
    return (
        <>
            {parts.filter((p) => !p.removed).map((p, k) => (
                <span key={k} className={p.added ? 'devo-new' : undefined}>{p.text}</span>
            ))}
        </>
    );
}

function chipTitle(removed: string[], added: string[]): string {
    if (removed.length && added.length) return `${removed.join(' ')} → ${added.join(' ')}`;
    if (added.length) return `Bæta við: ${added.join(' ')}`;
    return `Fella burt: ${removed.join(' ')}`;
}

function ChipFace({ removed, added }: { removed: string[]; added: string[] }) {
    const oldText = removed.join(' ');
    const newText = added.join(' ');
    return (
        <>
            {oldText && <span className="devo-chip-old">{oldText}</span>}
            {oldText && <span className="devo-chip-arrow">→</span>}
            {newText
                ? <span className="devo-chip-new">{newText}</span>
                : <span className="devo-chip-gone">burt</span>}
        </>
    );
}

export default function SuggestionCard({
    current, suggestion, taken,
    onTakeEdit, onUseAll, onClose, onSpeak, speakingOption,
}: {
    /** The paragraph as it stands right now — every row is measured against it. */
    current: string;
    suggestion: Suggestion;
    taken: TakenEdit[];
    onTakeEdit: (edit: Edit, label: string) => void;
    /** Takes a whole paragraph: one composed sentence, or a whole register. */
    onUseAll: (text: string) => void;
    onClose: () => void;
    onSpeak: (optionIndex: number, text: string) => void;
    speakingOption: number | null;
}) {
    /** The paragraph as it stands, cut up. Recomputed on every change. */
    const live = useMemo(() => splitSentences(current), [current]);

    /**
     * HIS lines, for the rows a pick has already overwritten — so „Þín“ can
     * still be tapped to put the sentence back.
     *
     * They are stamped with the paragraph they belong to and are worth nothing
     * the moment it changes for any other reason: he typed, he reverted, he
     * took a chip. That comparison is the whole invalidation rule, which is
     * why this needs no effect and cannot go stale.
     */
    const [origin, setOrigin] = useState<{ at: string; lines: Record<number, string> }>(
        { at: current, lines: NO_LINES },
    );
    const mine = origin.at === current ? origin.lines : NO_LINES;

    const [openRow, setOpenRow] = useState<number | null>(null);

    const count = live.sentences.length;

    /** Each register, lined up sentence for sentence — or not lined up at all. */
    const registers = useMemo(
        () => suggestion.options.map((o) => ({
            label: o.label,
            text: o.text,
            lines: alignSentences(o.text, count, o.sentences),
        })),
        [suggestion.options, count],
    );

    const rows = useMemo(() => live.sentences.map((here, i) => {
        /** His line: the „Þín“ option, and what the others are compared to. */
        const own = mine[i] ?? here;
        const lined = registers
            .filter((r) => r.lines)
            .map((r) => ({ label: r.label, text: (r.lines as string[])[i] }));
        return {
            i,
            own,
            /** What actually stands in the paragraph at this position now. */
            here,
            /** The register standing in this row, when it is no longer his. */
            taken: isDifferent(own, here)
                ? lined.find((o) => !isDifferent(o.text, here))?.label ?? null
                : null,
            offers: lined.filter((o) => isDifferent(o.text, own)),
            same: lined.filter((o) => !isDifferent(o.text, own)),
        };
    }), [live.sentences, mine, registers]);

    const composed = (i: number, text: string) =>
        joinSentences(live.sentences.map((s, k) => (k === i ? text : s)), live.separators);

    const pick = (i: number, text: string) => {
        if (!isDifferent(text, live.sentences[i])) return;
        const next = composed(i, text);
        // Keep his line for this row — the first pick is the one that had it.
        setOrigin({ at: next, lines: { ...mine, [i]: mine[i] ?? live.sentences[i] } });
        onUseAll(next);
        // Move on to the next sentence that still has something to offer.
        const after = rows.findIndex((r) => r.i > i && r.offers.length > 0);
        setOpenRow(after >= 0 ? after : i);
    };

    const firstOffer = rows.findIndex((r) => r.offers.length > 0);
    const open = openRow !== null && openRow < rows.length
        ? openRow
        : (firstOffer >= 0 ? firstOffer : null);

    /**
     * Keyboard, scoped to the card. It is bound here rather than on the window
     * because the laptop can have several cards open at once and the page owns
     * ⌘S, ⌥↓ and ⌥⇧↓ — none of which this may touch.
     */
    const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
        if (e.altKey || e.metaKey || e.ctrlKey) return;
        if ((e.target as HTMLElement).closest('input, textarea')) return;

        if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
            if (rows.length === 0) return;
            e.preventDefault();
            const from = open ?? -1;
            setOpenRow(e.key === 'ArrowDown'
                ? Math.min(rows.length - 1, from + 1)
                : Math.max(0, from - 1));
            return;
        }

        const n = Number(e.key);
        if (!Number.isInteger(n) || n < 1 || n > 4 || open === null) return;
        e.preventDefault();
        if (n === 1) { pick(open, rows[open].own); return; }
        const line = registers[n - 2]?.lines?.[open];
        if (line) pick(open, line);
    };

    if (suggestion.options.length === 0) return null;
    const anyLined = registers.some((r) => r.lines);

    return (
        <div className="devo-sugg" onKeyDown={onKeyDown} role="group" aria-label="Tillögur">
            <div className="devo-sugg-top">
                {registers.map((r, k) => (
                    <button
                        key={r.label}
                        type="button"
                        className="devo-tool"
                        onClick={() => onSpeak(k, r.text)}
                        title={`Lesa ${r.label} upphátt`}
                    >
                        {speakingOption === k ? <Square size={11} /> : <Volume2 size={12} />}
                        {r.label}
                    </button>
                ))}
                <div style={{ flex: 1 }} />
                <button type="button" className="devo-tool" onClick={onClose}>Loka</button>
            </div>

            {suggestion.note && (
                <p className="devo-sugg-note">
                    {suggestion.note}
                    {suggestion.learnedFrom > 0 && <em> · lærir af lagfæringum þínum</em>}
                </p>
            )}

            {/* No copy of the paragraph here on purpose: the field it is being
                composed into sits directly above this card in both shapes, and
                every pick lands in it live. A second copy would be the same
                text twice on a phone screen. */}

            {anyLined ? (
                <div className="devo-rows">
                    {rows.map((row) => {
                        const isOpen = row.i === open;
                        return (
                            <div key={row.i} className={`devo-row${isOpen ? ' is-open' : ''}`}>
                                <button
                                    type="button"
                                    className="devo-row-head"
                                    aria-expanded={isOpen}
                                    onClick={() => setOpenRow(isOpen ? -1 : row.i)}
                                >
                                    <span className="devo-row-n">{row.i + 1}</span>
                                    <span className="devo-row-line">{row.here}</span>
                                    {row.taken && <span className="devo-row-tag">{row.taken}</span>}
                                    {row.offers.length > 0 && !isOpen && (
                                        <span className="devo-row-dot" aria-label={`${row.offers.length} tillögur`} />
                                    )}
                                </button>

                                {isOpen && (
                                    // Keyed by row: the options ink in when the
                                    // accordion moves, not on every keystroke.
                                    <div key={row.i} className="devo-opts ink-arrive">
                                        {/* „Þín“ is only worth a line of its own once something
                                            has replaced it — until then the row's own line, right
                                            above, IS his sentence. */}
                                        {isDifferent(row.own, row.here) && (
                                            <Option
                                                label="Þín"
                                                text={row.own}
                                                from={row.here}
                                                current={current}
                                                whole={composed(row.i, row.own)}
                                                onPick={() => pick(row.i, row.own)}
                                                onTakeEdit={onTakeEdit}
                                            />
                                        )}
                                        {row.offers.map((o) => (
                                            <Option
                                                key={o.label}
                                                label={o.label}
                                                text={o.text}
                                                from={row.here}
                                                current={current}
                                                whole={composed(row.i, o.text)}
                                                onPick={() => pick(row.i, o.text)}
                                                onTakeEdit={onTakeEdit}
                                            />
                                        ))}
                                        {row.same.length > 0 && (
                                            <p className="devo-same">
                                                {row.same.map((o) => o.label).join(' og ')}: sama
                                            </p>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            ) : (
                <p className="devo-sugg-note">
                    Tillögurnar falla ekki að setningaskiptingu málsgreinarinnar — taktu heila útgáfu.
                </p>
            )}

            {taken.length > 0 && (
                <div className="devo-chips">
                    {taken.map((t, k) => (
                        <span key={k} className="devo-chip is-taken" title={chipTitle(t.removed, t.added)}>
                            <Check size={11} />
                            <ChipFace removed={t.removed} added={t.added} />
                        </span>
                    ))}
                </div>
            )}

            <div className="devo-take">
                <span className="devo-take-label">Taka allt</span>
                {registers.map((r) => (
                    <button
                        key={r.label}
                        type="button"
                        className="devo-tool"
                        disabled={!isDifferent(current, r.text)}
                        onClick={() => onUseAll(r.text)}
                    >
                        {r.label}
                    </button>
                ))}
            </div>
        </div>
    );
}

/**
 * One sentence, one register, one tap.
 *
 * The chips underneath are grouped against the WHOLE paragraph, not against
 * the sentence, because that is what `applyEdit` anchors into — and they only
 * appear at all when the edit is small enough that a chip is honest about it.
 */
function Option({
    label, text, from, current, whole, onPick, onTakeEdit,
}: {
    label: string;
    text: string;
    /** The line this one is compared against: what stands there right now. */
    from: string;
    current: string;
    /** The whole paragraph with this option in place — the chips' measure. */
    whole: string;
    onPick: () => void;
    onTakeEdit: (edit: Edit, label: string) => void;
}) {
    const on = !isDifferent(text, from);
    const chips = useMemo(() => {
        if (on) return [];
        const edits = groupEdits(current, whole);
        return changedWords(edits) <= CHIP_MAX_WORDS ? edits : [];
    }, [on, current, whole]);

    return (
        <>
            <button
                type="button"
                className={`devo-opt${on ? ' is-on' : ''}`}
                aria-pressed={on}
                onClick={onPick}
            >
                <span className="devo-opt-tag">
                    {label}{on && <> · valin</>}
                </span>
                <OptionProse from={from} text={text} />
            </button>
            {chips.length > 0 && (
                <div className="devo-chips">
                    {chips.map((edit, k) => (
                        <button
                            key={`${edit.at}-${k}`}
                            type="button"
                            className="devo-chip"
                            title={chipTitle(edit.removed, edit.added)}
                            onClick={() => onTakeEdit(edit, label)}
                        >
                            <ChipFace removed={edit.removed} added={edit.added} />
                        </button>
                    ))}
                </div>
            )}
        </>
    );
}
