'use client';

import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { normalizePosterModel, type PosterModel } from '@/lib/poster';
import { Loader2, Sparkles, CheckCircle2, ImageOff } from 'lucide-react';

/**
 * Poster Machine V1 — admin review surface (DISPATCH-003 §4).
 *
 * One selected source frame → branded 16:9 + 4:5 → each public surface
 * gets the right aspect. The reviewer can always override automation
 * (manual URL) — bad poster automation is worse than none.
 *
 * Self-contained on purpose: it owns its own data fetch + styling so the
 * (already large) draft page only needs a one-line mount.
 */

async function authHeaders(): Promise<Record<string, string>> {
    const { data: { session } } = await supabase.auth.getSession();
    return {
        'Content-Type': 'application/json',
        ...(session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {}),
    };
}

export default function PosterStudio({
    episodeId,
    seriesTitle,
    episodeTitle,
}: {
    episodeId: string;
    seriesTitle?: string;
    episodeTitle?: string;
}) {
    const [model, setModel] = useState<PosterModel | null>(null);
    const [loading, setLoading] = useState(true);
    const [busy, setBusy] = useState<null | 'select' | 'generate' | 'manual'>(null);
    const [error, setError] = useState<string | null>(null);
    const [manualLandscape, setManualLandscape] = useState('');
    const [manualPortrait, setManualPortrait] = useState('');

    const load = useCallback(async () => {
        setLoading(true);
        const res = await fetch(`/api/admin/posters?episodeId=${encodeURIComponent(episodeId)}`, {
            headers: await authHeaders(),
        });
        if (res.ok) {
            const data = await res.json();
            setModel(normalizePosterModel(data.model));
        } else {
            setError('Tókst ekki að sækja poster gögn.');
        }
        setLoading(false);
    }, [episodeId]);

    useEffect(() => { load(); }, [load]);

    const post = useCallback(async (body: Record<string, unknown>, kind: 'select' | 'generate' | 'manual') => {
        setBusy(kind);
        setError(null);
        const res = await fetch('/api/admin/posters', {
            method: 'POST',
            headers: await authHeaders(),
            body: JSON.stringify({ episodeId, seriesName: seriesTitle, episodeTitle, ...body }),
        });
        const data = await res.json().catch(() => ({ error: 'Villa' }));
        if (!res.ok) {
            setError(data.error ?? 'Aðgerð mistókst.');
        } else if (data.model) {
            setModel(normalizePosterModel(data.model));
        }
        setBusy(null);
    }, [episodeId, seriesTitle, episodeTitle]);

    const candidates = model?.source_candidates ?? [];
    const selectedId = model?.selected_source?.id ?? null;
    const variants = model?.variants ?? {};

    return (
        <fieldset style={fieldsetStyle}>
            <legend style={legendStyle}>Poster Machine</legend>

            {loading ? (
                <div style={mutedRow}><Loader2 size={14} className="admin-spinner" /> Sæki poster gögn…</div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                    {/* ── Source frame candidates ─────────────────────── */}
                    {candidates.length > 0 ? (
                        <div>
                            <p style={sectionLabel}>1 · Veldu ramma ({candidates.length} tillögur frá Azotus)</p>
                            <div style={gridStyle}>
                                {candidates.map((c) => {
                                    const isSel = c.id === selectedId;
                                    return (
                                        <button
                                            key={c.id}
                                            type="button"
                                            onClick={() => post({ action: 'select', sourceId: c.id }, 'select')}
                                            disabled={busy !== null}
                                            title={c.notes.join(', ') || undefined}
                                            style={{
                                                ...candidateBtn,
                                                borderColor: isSel ? 'var(--admin-accent, #E9A860)' : 'var(--admin-border, #333)',
                                                boxShadow: isSel ? '0 0 0 2px var(--admin-accent, #E9A860)' : 'none',
                                            }}
                                        >
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img src={c.url} alt="" style={candidateImg} loading="lazy" />
                                            <span style={candidateMeta}>
                                                {isSel && <CheckCircle2 size={12} />}
                                                {typeof c.time_sec === 'number' ? `${Math.floor(c.time_sec / 60)}:${String(Math.floor(c.time_sec % 60)).padStart(2, '0')}` : '—'}
                                                {typeof c.score === 'number' ? ` · ${Math.round(c.score * 100)}%` : ''}
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    ) : (
                        <div style={{ ...mutedRow, gap: '8px' }}>
                            <ImageOff size={14} />
                            Engir rammar frá Azotus enn. Notaðu „Búa til“ í Efnistákn-reitnum hér að ofan, eða settu handvirka slóð að neðan.
                        </div>
                    )}

                    {/* ── Generate branded variants ───────────────────── */}
                    <div>
                        <p style={sectionLabel}>2 · Búðu til vörumerktar útgáfur (16:9 + 4:5)</p>
                        <button
                            type="button"
                            onClick={() => post({ action: 'generate' }, 'generate')}
                            disabled={busy !== null || !selectedId}
                            title={selectedId ? 'Búa til 16:9 og 4:5 úr völdum ramma.' : 'Veldu ramma fyrst.'}
                            style={{ ...btnAccent, opacity: busy === null && selectedId ? 1 : 0.45 }}
                        >
                            {busy === 'generate' ? <Loader2 size={14} className="admin-spinner" /> : <Sparkles size={14} />}
                            Búa til poster
                        </button>

                        {(variants.landscape_16x9 || variants.portrait_4x5) && (
                            <div style={{ display: 'flex', gap: '16px', marginTop: '14px', flexWrap: 'wrap' }}>
                                {variants.landscape_16x9 && (
                                    <figure style={figure}>
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img src={variants.landscape_16x9} alt="16:9" style={{ ...previewImg, aspectRatio: '16 / 9', width: '280px' }} />
                                        <figcaption style={figcap}>16:9 · þáttasíða, breið kort</figcaption>
                                    </figure>
                                )}
                                {variants.portrait_4x5 && (
                                    <figure style={figure}>
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img src={variants.portrait_4x5} alt="4:5" style={{ ...previewImg, aspectRatio: '4 / 5', width: '180px' }} />
                                        <figcaption style={figcap}>4:5 · efnissafns­kort</figcaption>
                                    </figure>
                                )}
                            </div>
                        )}
                        {model?.brand_version && (
                            <p style={{ ...figcap, marginTop: '8px' }}>
                                Útgáfa: <code>{model.brand_version}</code>
                                {model.updated_at ? ` · ${new Date(model.updated_at).toLocaleString('is-IS')}` : ''}
                            </p>
                        )}
                    </div>

                    {/* ── Manual override ─────────────────────────────── */}
                    <details>
                        <summary style={{ cursor: 'pointer', color: 'var(--admin-accent, #E9A860)', fontSize: '0.82rem', fontWeight: 700 }}>
                            Handvirk slóð (yfirskrifar sjálfvirkni)
                        </summary>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '12px' }}>
                            <input
                                type="text"
                                value={manualLandscape}
                                onChange={(e) => setManualLandscape(e.target.value)}
                                placeholder="16:9 slóð (https://…)"
                                style={inputStyle}
                            />
                            <input
                                type="text"
                                value={manualPortrait}
                                onChange={(e) => setManualPortrait(e.target.value)}
                                placeholder="4:5 slóð (https://…)"
                                style={inputStyle}
                            />
                            <button
                                type="button"
                                onClick={() => post({
                                    action: 'manual',
                                    landscape_16x9: manualLandscape || undefined,
                                    portrait_4x5: manualPortrait || undefined,
                                }, 'manual')}
                                disabled={busy !== null || (!manualLandscape && !manualPortrait)}
                                style={{ ...btnGhost, alignSelf: 'flex-start' }}
                            >
                                {busy === 'manual' ? <Loader2 size={14} className="admin-spinner" /> : <CheckCircle2 size={14} />}
                                Vista handvirkt
                            </button>
                        </div>
                    </details>

                    {error && <p style={{ margin: 0, color: 'var(--admin-error, #e55)', fontSize: '0.8rem' }}>{error}</p>}
                </div>
            )}
        </fieldset>
    );
}

const fieldsetStyle: React.CSSProperties = {
    border: '1px solid var(--admin-border, #333)',
    borderRadius: '8px',
    padding: '20px 22px 22px',
    background: 'var(--admin-surface, #1f1d1a)',
    margin: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
};

const legendStyle: React.CSSProperties = {
    padding: '0 8px',
    color: 'var(--admin-accent, #E9A860)',
    fontSize: '0.68rem',
    fontWeight: 600,
    letterSpacing: '0.2em',
    textTransform: 'uppercase',
};

const sectionLabel: React.CSSProperties = {
    margin: '0 0 10px',
    color: 'var(--admin-text, #eee)',
    fontSize: '0.84rem',
    fontWeight: 600,
};

const mutedRow: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    color: 'var(--admin-text-muted, #888)',
    fontSize: '0.82rem',
    lineHeight: 1.5,
};

const gridStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
    gap: '10px',
};

const candidateBtn: React.CSSProperties = {
    padding: 0,
    border: '1px solid var(--admin-border, #333)',
    borderRadius: '6px',
    background: 'var(--admin-bg, #14120F)',
    cursor: 'pointer',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
};

const candidateImg: React.CSSProperties = {
    width: '100%',
    aspectRatio: '16 / 9',
    objectFit: 'cover',
    display: 'block',
};

const candidateMeta: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
    padding: '6px 8px',
    fontSize: '0.72rem',
    color: 'var(--admin-text-secondary, #aaa)',
};

const figure: React.CSSProperties = { margin: 0 };

const previewImg: React.CSSProperties = {
    objectFit: 'cover',
    borderRadius: '6px',
    border: '1px solid var(--admin-border, #333)',
    background: 'var(--admin-bg, #14120F)',
    display: 'block',
};

const figcap: React.CSSProperties = {
    margin: '6px 0 0',
    color: 'var(--admin-text-muted, #888)',
    fontSize: '0.74rem',
};

const inputStyle: React.CSSProperties = {
    width: '100%',
    maxWidth: '420px',
    padding: '10px 12px',
    background: 'var(--admin-bg, #14120F)',
    border: '1px solid var(--admin-border, #333)',
    borderRadius: '4px',
    color: 'var(--admin-text, #eee)',
    fontSize: '0.9rem',
    fontFamily: 'inherit',
    outline: 'none',
};

const btnAccent: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '10px 18px',
    background: 'var(--admin-accent, #E9A860)',
    border: '1px solid var(--admin-accent, #E9A860)',
    borderRadius: '6px',
    color: '#14120F',
    fontSize: '0.84rem',
    fontWeight: 700,
    cursor: 'pointer',
};

const btnGhost: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '10px 18px',
    background: 'transparent',
    border: '1px solid var(--admin-border, #333)',
    borderRadius: '6px',
    color: 'var(--admin-text, #eee)',
    fontSize: '0.84rem',
    fontWeight: 600,
    cursor: 'pointer',
};
