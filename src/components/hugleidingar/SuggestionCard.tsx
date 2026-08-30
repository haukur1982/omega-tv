'use client';

import { useMemo } from 'react';
import { Check, Square, Volume2 } from 'lucide-react';
import {
    diffWords, groupEdits, isDifferent, type Edit,
} from '@/lib/devotional-review';

/**
 * One card, three registers, and a row of small edits you can take one at a
 * time — used by both the laptop reading room and the phone sheet.
 *
 * The old card stack showed three paragraph-sized rewrites and asked the
 * reviewer to pick one whole. In practice he wants the noun from Nákvæmt and
 * the verb from Eðlilegt, so the unit here is the EDIT, not the option: every
 * chip is one `old → new`, and tapping it applies only that. Mixing across
 * registers falls out for free, because every chip is recomputed against the
 * paragraph as it stands right now.
 *
 * Styling lives in the reading room's SHEET_CSS (the page owns one stylesheet,
 * as the other hugleiðingar screens do), so this renders inside `.devo-sheet`.
 */

export interface SuggestOption { label: string; text: string }
export interface Suggestion { options: SuggestOption[]; note: string; learnedFrom: number }

/** An edit the reviewer has already taken — kept so the chip can say so. */
export interface TakenEdit { label: string; removed: string[]; added: string[] }

/** Long chips lose their middle, never their ends: the ends are the meaning. */
function middleTruncate(s: string, max: number): string {
    if (s.length <= max) return s;
    const head = Math.ceil((max - 1) / 2);
    const tail = Math.floor((max - 1) / 2);
    return `${s.slice(0, head)}…${s.slice(s.length - tail)}`;
}

function chipTitle(removed: string[], added: string[]): string {
    if (removed.length && added.length) return `${removed.join(' ')} → ${added.join(' ')}`;
    if (added.length) return `Bæta við: ${added.join(' ')}`;
    return `Fella burt: ${removed.join(' ')}`;
}

function ChipFace({ removed, added, max }: { removed: string[]; added: string[]; max: number }) {
    const oldText = removed.join(' ');
    const newText = added.join(' ');
    return (
        <>
            {oldText && <span className="devo-chip-del">{middleTruncate(oldText, max)}</span>}
            {oldText && <span className="devo-chip-arrow">→</span>}
            {newText
                ? <span className="devo-chip-ins">{middleTruncate(newText, max)}</span>
                : <span className="devo-chip-gone">burt</span>}
        </>
    );
}

export default function SuggestionCard({
    current, suggestion, tab, taken, chipChars = 26,
    onTab, onTakeEdit, onUseAll, onClose, onSpeak, speakingOption,
}: {
    /** The paragraph as it stands right now — every chip is measured against it. */
    current: string;
    suggestion: Suggestion;
    /** Last-used register, remembered across paragraphs and sessions. */
    tab: string;
    taken: TakenEdit[];
    /** How much of a chip survives before its middle is dropped. */
    chipChars?: number;
    onTab: (label: string) => void;
    onTakeEdit: (edit: Edit, label: string) => void;
    onUseAll: (text: string) => void;
    onClose: () => void;
    onSpeak: (optionIndex: number, text: string) => void;
    speakingOption: number | null;
}) {
    /**
     * All three registers are regrouped on every change, not just the open one:
     * the tab counts are how the reviewer sees that taking a chip in Nákvæmt
     * removed work from Eðlilegt too.
     */
    const regrouped = useMemo(
        () => suggestion.options.map((option) => ({ option, edits: groupEdits(current, option.text) })),
        [current, suggestion.options],
    );

    const activeIdx = Math.max(0, regrouped.findIndex((r) => r.option.label === tab));
    const active = regrouped[activeIdx];
    if (!active) return null;

    const diff = isDifferent(current, active.option.text)
        ? diffWords(current, active.option.text)
        : null;
    const takenHere = taken.filter((t) => t.label === active.option.label);

    return (
        <div className="devo-sugg">
            <div className="devo-sugg-top">
                <div className="devo-seg" role="tablist" aria-label="Blæbrigði">
                    {regrouped.map(({ option, edits }) => (
                        <button
                            key={option.label}
                            type="button"
                            role="tab"
                            aria-selected={option.label === active.option.label}
                            className={`devo-seg-btn${option.label === active.option.label ? ' is-on' : ''}`}
                            onClick={() => onTab(option.label)}
                        >
                            {option.label}
                            {edits.length > 0 && <span className="devo-seg-n">{edits.length}</span>}
                        </button>
                    ))}
                </div>
                <div style={{ flex: 1 }} />
                <button
                    type="button"
                    className="devo-tool"
                    onClick={() => onSpeak(activeIdx, active.option.text)}
                    title="Lesa tillöguna upphátt"
                >
                    {speakingOption === activeIdx ? <Square size={11} /> : <Volume2 size={12} />}
                </button>
                <button
                    type="button"
                    className="devo-tool is-go"
                    onClick={() => onUseAll(active.option.text)}
                    disabled={!diff}
                >
                    Nota
                </button>
                <button type="button" className="devo-tool" onClick={onClose}>Loka</button>
            </div>

            {suggestion.note && (
                <p className="devo-sugg-note">
                    {suggestion.note}
                    {suggestion.learnedFrom > 0 && <em> · lærir af lagfæringum þínum</em>}
                </p>
            )}

            <p className="devo-opt-text">
                {diff
                    ? diff.map((d, di) => (
                        <span key={di} className={d.added ? 'ins' : d.removed ? 'del' : undefined}>{d.text}</span>
                    ))
                    : active.option.text}
            </p>

            {(active.edits.length > 0 || takenHere.length > 0) && (
                <div className="devo-chips">
                    {active.edits.map((edit, k) => (
                        <button
                            key={`${edit.at}-${k}`}
                            type="button"
                            className="devo-chip"
                            title={chipTitle(edit.removed, edit.added)}
                            onClick={() => onTakeEdit(edit, active.option.label)}
                        >
                            <ChipFace removed={edit.removed} added={edit.added} max={chipChars} />
                        </button>
                    ))}
                    {takenHere.map((t, k) => (
                        <span
                            key={`t${k}`}
                            className="devo-chip is-taken"
                            title={chipTitle(t.removed, t.added)}
                        >
                            <Check size={11} />
                            <ChipFace removed={t.removed} added={t.added} max={chipChars} />
                        </span>
                    ))}
                </div>
            )}

            {active.edits.length === 0 && (
                <p className="devo-sugg-note">
                    {takenHere.length > 0
                        ? 'Ekkert eftir í þessu blæbrigði.'
                        : 'Samhljóða málsgreininni eins og hún stendur.'}
                </p>
            )}
        </div>
    );
}
