'use client';

import { useMemo, useState, useRef, useEffect } from 'react';
import { OSIS_BOOKS, displayPassageIs } from '@/lib/passages';

/**
 * OsisPicker — autocomplete for Bible passage references.
 *
 * Plan §10 calls passage-reference drift the highest redesign risk
 * ("Matt 5" vs "Matteus 5:3-10"). This widget prevents drift by
 * producing canonical OSIS ("MAT.5.3-MAT.5.10") only — no free-text
 * entry accepted.
 *
 * UX: user types Icelandic or English book name; we filter OSIS_BOOKS;
 * then they fill in chapter (required) + verse + optional verse range.
 * Output preview shown in Icelandic display format.
 *
 * Emits the canonical string via onChange. Empty string clears the ref.
 */

export default function OsisPicker({
    value,
    onChange,
}: {
    value: string | null;
    onChange: (canonical: string | null) => void;
}) {
    const [book, setBook] = useState<string>('');     // OSIS code, e.g. "MAT"
    const [bookQuery, setBookQuery] = useState<string>('');
    const [chapter, setChapter] = useState<string>('');
    const [startVerse, setStartVerse] = useState<string>('');
    const [endVerse, setEndVerse] = useState<string>('');
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const rootRef = useRef<HTMLDivElement>(null);

    // Hydrate from `value` on mount / when parent changes it.
    useEffect(() => {
        if (!value) return;
        const [start, end] = value.split('-');
        const [b, ch, v] = start.split('.');
        if (b && OSIS_BOOKS[b]) {
            setBook(b);
            setBookQuery(OSIS_BOOKS[b].is);
        }
        if (ch) setChapter(ch);
        if (v) setStartVerse(v);
        if (end) {
            const endParts = end.split('.');
            const endVerseVal = endParts[endParts.length - 1];
            if (endVerseVal) setEndVerse(endVerseVal);
        }
        // Intentionally empty deps — only run on mount / on external value change we care about.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [value]);

    // Close dropdown on outside click
    useEffect(() => {
        if (!dropdownOpen) return;
        const handler = (e: MouseEvent) => {
            if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
                setDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, [dropdownOpen]);

    const filteredBooks = useMemo(() => {
        const q = bookQuery.toLocaleLowerCase('is');
        if (!q) return Object.entries(OSIS_BOOKS).slice(0, 8);
        return Object.entries(OSIS_BOOKS)
            .filter(([code, names]) =>
                names.is.toLocaleLowerCase('is').includes(q) ||
                names.en.toLowerCase().includes(q) ||
                code.toLowerCase().includes(q)
            )
            .slice(0, 10);
    }, [bookQuery]);

    // Emit canonical reference whenever pieces change
    useEffect(() => {
        if (!book || !chapter) {
            onChange(null);
            return;
        }
        let canonical = `${book}.${chapter}`;
        if (startVerse) {
            canonical += `.${startVerse}`;
            if (endVerse && endVerse !== startVerse) {
                // Full canonical with both book references
                canonical += `-${book}.${chapter}.${endVerse}`;
            }
        }
        onChange(canonical);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [book, chapter, startVerse, endVerse]);

    const clear = () => {
        setBook('');
        setBookQuery('');
        setChapter('');
        setStartVerse('');
        setEndVerse('');
        onChange(null);
    };

    const preview = book && chapter
        ? displayPassageIs(`${book}.${chapter}${startVerse ? `.${startVerse}` : ''}${endVerse && endVerse !== startVerse ? `-${book}.${chapter}.${endVerse}` : ''}`)
        : '';

    return (
        <div ref={rootRef} style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {/* Row: book input + chapter + verse range */}
            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 2fr) 72px 72px 72px auto', gap: '8px', alignItems: 'center' }}>
                {/* Book with autocomplete */}
                <div style={{ position: 'relative' }}>
                    <input
                        type="text"
                        value={bookQuery}
                        placeholder="Bók (t.d. Matteus)"
                        onChange={(e) => {
                            setBookQuery(e.target.value);
                            setBook(''); // clear committed book until one is selected
                            setDropdownOpen(true);
                        }}
                        onFocus={() => setDropdownOpen(true)}
                        style={osisInputStyle}
                    />
                    {dropdownOpen && filteredBooks.length > 0 && (
                        <ul
                            role="listbox"
                            style={{
                                position: 'absolute',
                                top: 'calc(100% + 4px)',
                                left: 0,
                                right: 0,
                                maxHeight: '240px',
                                overflowY: 'auto',
                                background: 'var(--admin-surface, #1f1d1a)',
                                border: '1px solid var(--admin-border, #333)',
                                borderRadius: '6px',
                                margin: 0,
                                padding: '4px',
                                listStyle: 'none',
                                zIndex: 40,
                                boxShadow: '0 12px 32px rgba(10, 8, 5, 0.5)',
                            }}
                        >
                            {filteredBooks.map(([code, names]) => (
                                <li key={code}>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setBook(code);
                                            setBookQuery(names.is);
                                            setDropdownOpen(false);
                                        }}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'baseline',
                                            justifyContent: 'space-between',
                                            width: '100%',
                                            padding: '8px 10px',
                                            background: 'transparent',
                                            border: 'none',
                                            borderRadius: '4px',
                                            color: 'var(--admin-text, #eee)',
                                            fontSize: '0.88rem',
                                            textAlign: 'left',
                                            cursor: 'pointer',
                                        }}
                                        onMouseOver={(e) => { e.currentTarget.style.background = 'rgba(233, 168, 96, 0.08)'; }}
                                        onMouseOut={(e) => { e.currentTarget.style.background = 'transparent'; }}
                                    >
                                        <span>{names.is}</span>
                                        <span style={{ color: 'var(--admin-text-muted, #888)', fontSize: '0.76rem', letterSpacing: '0.08em' }}>
                                            {code}
                                        </span>
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                <input
                    type="text"
                    inputMode="numeric"
                    value={chapter}
                    onChange={(e) => setChapter(e.target.value.replace(/\D/g, ''))}
                    placeholder="Kafli"
                    style={osisInputStyle}
                />
                <input
                    type="text"
                    inputMode="numeric"
                    value={startVerse}
                    onChange={(e) => setStartVerse(e.target.value.replace(/\D/g, ''))}
                    placeholder="Vers"
                    style={osisInputStyle}
                />
                <input
                    type="text"
                    inputMode="numeric"
                    value={endVerse}
                    onChange={(e) => setEndVerse(e.target.value.replace(/\D/g, ''))}
                    placeholder="Til vers"
                    style={osisInputStyle}
                />
                <button
                    type="button"
                    onClick={clear}
                    style={{
                        padding: '8px 10px',
                        background: 'transparent',
                        border: '1px solid var(--admin-border, #333)',
                        borderRadius: '4px',
                        color: 'var(--admin-text-muted, #888)',
                        fontSize: '0.8rem',
                        cursor: 'pointer',
                    }}
                >
                    Hreinsa
                </button>
            </div>

            {/* Preview */}
            {preview ? (
                <p style={{ margin: 0, color: 'var(--admin-accent, #E9A860)', fontSize: '0.85rem', fontFamily: 'var(--font-serif, serif)', fontStyle: 'italic' }}>
                    {preview}{' '}
                    <span style={{ color: 'var(--admin-text-muted, #888)', fontSize: '0.72rem', fontFamily: 'monospace', fontStyle: 'normal', marginLeft: '8px' }}>
                        ({value ?? '—'})
                    </span>
                </p>
            ) : (
                <p style={{ margin: 0, color: 'var(--admin-text-muted, #888)', fontSize: '0.78rem', fontStyle: 'italic' }}>
                    Veldu bók og kafla. Vers er valfrjálst (t.d. fyrir heilan sálm).
                </p>
            )}
        </div>
    );
}

const osisInputStyle: React.CSSProperties = {
    width: '100%',
    padding: '8px 10px',
    background: 'var(--admin-surface, #1f1d1a)',
    border: '1px solid var(--admin-border, #333)',
    borderRadius: '4px',
    color: 'var(--admin-text, #eee)',
    fontSize: '0.88rem',
    fontFamily: 'inherit',
    outline: 'none',
};
