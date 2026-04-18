'use client';

import { useState } from 'react';

type Chapter = { t: number; title: string };

/**
 * ChaptersEditor — list of {t, title} rows for episode chapters.
 *
 * Each row: timestamp (mm:ss or hh:mm:ss) + title. Rows can be added,
 * removed, reordered (by editing timestamps; list auto-sorts).
 *
 * Emits a plain array of {t: seconds, title: string} via onChange.
 */
export default function ChaptersEditor({
    value,
    onChange,
}: {
    value: Chapter[] | null | undefined;
    onChange: (chapters: Chapter[]) => void;
}) {
    const [rows, setRows] = useState<{ tStr: string; title: string }[]>(() =>
        (value ?? []).map(c => ({ tStr: formatSeconds(c.t), title: c.title })),
    );

    const commit = (next: { tStr: string; title: string }[]) => {
        const chapters: Chapter[] = next
            .map(r => ({ t: parseSeconds(r.tStr), title: r.title.trim() }))
            .filter(c => !isNaN(c.t) && c.title.length > 0)
            .sort((a, b) => a.t - b.t);
        onChange(chapters);
    };

    const update = (i: number, patch: Partial<{ tStr: string; title: string }>) => {
        const next = rows.slice();
        next[i] = { ...next[i], ...patch };
        setRows(next);
        commit(next);
    };

    const add = () => {
        const lastT = rows[rows.length - 1]?.tStr;
        const suggestedT = lastT ? incrementSeconds(lastT, 300) : '0:00';
        const next = [...rows, { tStr: suggestedT, title: '' }];
        setRows(next);
        commit(next);
    };

    const remove = (i: number) => {
        const next = rows.filter((_, idx) => idx !== i);
        setRows(next);
        commit(next);
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {rows.length === 0 && (
                <p style={{ margin: 0, color: 'var(--admin-text-muted, #888)', fontSize: '0.82rem', fontStyle: 'italic' }}>
                    Engir kaflar skráðir. Bættu við með hnappnum fyrir neðan.
                </p>
            )}
            {rows.map((r, i) => (
                <div key={i} style={{ display: 'grid', gridTemplateColumns: '96px 1fr auto', gap: '8px', alignItems: 'center' }}>
                    <input
                        type="text"
                        value={r.tStr}
                        onChange={(e) => update(i, { tStr: e.target.value })}
                        placeholder="0:00"
                        style={{
                            padding: '8px 10px',
                            background: 'var(--admin-surface, #1f1d1a)',
                            border: '1px solid var(--admin-border, #333)',
                            borderRadius: '4px',
                            color: 'var(--admin-text, #eee)',
                            fontSize: '0.88rem',
                            fontFamily: 'monospace',
                            fontVariantNumeric: 'tabular-nums',
                            textAlign: 'right',
                        }}
                    />
                    <input
                        type="text"
                        value={r.title}
                        onChange={(e) => update(i, { title: e.target.value })}
                        placeholder="Titill kafla"
                        style={{
                            padding: '8px 10px',
                            background: 'var(--admin-surface, #1f1d1a)',
                            border: '1px solid var(--admin-border, #333)',
                            borderRadius: '4px',
                            color: 'var(--admin-text, #eee)',
                            fontSize: '0.88rem',
                        }}
                    />
                    <button
                        type="button"
                        onClick={() => remove(i)}
                        aria-label="Eyða kafla"
                        style={{
                            padding: '8px 10px',
                            background: 'transparent',
                            border: '1px solid var(--admin-border, #333)',
                            borderRadius: '4px',
                            color: 'var(--admin-text-muted, #888)',
                            fontSize: '0.82rem',
                            cursor: 'pointer',
                        }}
                    >
                        Eyða
                    </button>
                </div>
            ))}
            <button
                type="button"
                onClick={add}
                style={{
                    marginTop: '4px',
                    padding: '8px 14px',
                    background: 'transparent',
                    border: '1px dashed var(--admin-border, #333)',
                    borderRadius: '4px',
                    color: 'var(--admin-accent, #E9A860)',
                    fontSize: '0.84rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    alignSelf: 'flex-start',
                }}
            >
                + Bæta kafla við
            </button>
        </div>
    );
}

function parseSeconds(str: string): number {
    const parts = str.split(':').map(p => parseInt(p, 10));
    if (parts.some(isNaN)) return NaN;
    if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
    if (parts.length === 2) return parts[0] * 60 + parts[1];
    if (parts.length === 1) return parts[0];
    return NaN;
}

function formatSeconds(s: number): string {
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = Math.floor(s % 60);
    if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
    return `${m}:${sec.toString().padStart(2, '0')}`;
}

function incrementSeconds(str: string, delta: number): string {
    const s = parseSeconds(str);
    if (isNaN(s)) return '0:00';
    return formatSeconds(s + delta);
}
