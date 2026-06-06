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

    // ── Hero poster (2:3 hetjuspjald) state ──────────────────────────
    const [heroTitle, setHeroTitle] = useState(seriesTitle || episodeTitle || '');
    const [heroTagline, setHeroTagline] = useState('');
    const [heroHost, setHeroHost] = useState('');
    const [heroTheme, setHeroTheme] = useState('auto');
    const [heroPreview, setHeroPreview] = useState<string | null>(null);
    const [heroBusy, setHeroBusy] = useState(false);
    const [heroFullRes, setHeroFullRes] = useState<boolean | null>(null);
    const [heroError, setHeroError] = useState<string | null>(null);

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

    // Generate a hero-poster preview from the selected frame, pulled at full res.
    const generateHero = useCallback(async () => {
        if (!heroTitle.trim()) { setHeroError('Sláðu inn titil fyrst.'); return; }
        setHeroBusy(true);
        setHeroError(null);
        setHeroPreview(null);
        setHeroFullRes(null);
        try {
            const res = await fetch('/api/admin/posters/hero', {
                method: 'POST',
                headers: await authHeaders(),
                body: JSON.stringify({
                    episodeId,
                    sourceId: selectedId ?? undefined,
                    title: heroTitle.trim(),
                    tagline: heroTagline.trim() || undefined,
                    host: heroHost.trim() || undefined,
                    theme: heroTheme === 'auto' ? undefined : heroTheme,
                    preview: true,
                }),
            });
            const data = await res.json().catch(() => ({ error: 'Villa' }));
            if (!res.ok || !data.dataUrl) {
                setHeroError(data.error ?? 'Tókst ekki að búa til hetjuspjald.');
            } else {
                setHeroPreview(data.dataUrl);
                setHeroFullRes(!!data.usedFullRes);
            }
        } catch {
            setHeroError('Netvilla við gerð hetjuspjalds.');
        }
        setHeroBusy(false);
    }, [episodeId, selectedId, heroTitle, heroTagline, heroHost, heroTheme]);

    const downloadHero = useCallback(() => {
        if (!heroPreview) return;
        const a = document.createElement('a');
        a.href = heroPreview;
        const safe = heroTitle.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'hetjuspjald';
        a.download = `${safe}-poster-2x3.png`;
        document.body.appendChild(a);
        a.click();
        a.remove();
    }, [heroPreview, heroTitle]);

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

                    {/* ── Hero poster (2:3 hetjuspjald) ───────────────── */}
                    <details>
                        <summary style={{ cursor: 'pointer', color: 'var(--admin-accent, #E9A860)', fontSize: '0.82rem', fontWeight: 700 }}>
                            Hetjuspjald (2:3 forsíða þáttaraðar) · há-upplausn
                        </summary>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '14px' }}>
                            <p style={{ ...figcap, margin: 0 }}>
                                Notar valda rammann hér að ofan, sækir hann í fullri upplausn (1920×1080) úr Bunny og
                                býr til vörumerkt 1000×1500 spjald. Veldu ramma með opin augu og gott svipbrigði.
                            </p>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px', maxWidth: '640px' }}>
                                <label style={fieldLabel}>Titill
                                    <input type="text" value={heroTitle} onChange={(e) => setHeroTitle(e.target.value)} placeholder="t.d. Vonarljós" style={inputStyle} />
                                </label>
                                <label style={fieldLabel}>Kynnir / Stjórnandi
                                    <input type="text" value={heroHost} onChange={(e) => setHeroHost(e.target.value)} placeholder="t.d. Eiríkur Sigurbjörnsson" style={inputStyle} />
                                </label>
                            </div>
                            <label style={{ ...fieldLabel, maxWidth: '640px' }}>Undirtexti (valfrjáls)
                                <input type="text" value={heroTagline} onChange={(e) => setHeroTagline(e.target.value)} placeholder="t.d. Ljós í myrkri — von fyrir hjartað" style={inputStyle} />
                            </label>
                            <label style={{ ...fieldLabel, maxWidth: '320px' }}>Litaþema
                                <select value={heroTheme} onChange={(e) => setHeroTheme(e.target.value)} style={inputStyle}>
                                    <option value="auto">Sjálfvirkt (mismunandi per þáttaröð)</option>
                                    <option value="kerti">Kerti — gyllt/hlýtt (Omega-merki)</option>
                                    <option value="nott">Nótt — djúpblátt</option>
                                    <option value="aurora">Norðurljós — grænblátt</option>
                                    <option value="glod">Glóð — brons/rauðgyllt</option>
                                    <option value="skira">Skíra — mjúkt steinngrátt</option>
                                </select>
                            </label>
                            <p style={{ ...figcap, margin: 0 }}>
                                Hvert þema gefur ólíkan blæ svo þættir líti ekki allir eins út. „Sjálfvirkt“ velur
                                fast þema út frá titlinum — sama þáttaröð fær alltaf sama blæ, ólíkar fá ólíkan.
                            </p>

                            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
                                <button
                                    type="button"
                                    onClick={generateHero}
                                    disabled={heroBusy || !heroTitle.trim()}
                                    title={selectedId ? 'Sækir valda rammann í fullri upplausn.' : 'Veldu ramma að ofan fyrir bestu gæði (annars notar fyrsta).'}
                                    style={{ ...btnAccent, opacity: heroBusy || !heroTitle.trim() ? 0.45 : 1 }}
                                >
                                    {heroBusy ? <Loader2 size={14} className="admin-spinner" /> : <Sparkles size={14} />}
                                    {heroBusy ? 'Sæki há-upplausn…' : 'Forskoða hetjuspjald'}
                                </button>
                                {heroPreview && (
                                    <button type="button" onClick={downloadHero} style={btnGhost}>
                                        <CheckCircle2 size={14} /> Hlaða niður PNG
                                    </button>
                                )}
                            </div>
                            {heroBusy && (
                                <p style={{ ...figcap, margin: 0 }}>Þetta tekur ~20–40 sek meðan Bunny endurgerir rammann í fullri upplausn.</p>
                            )}
                            {heroFullRes === false && heroPreview && (
                                <p style={{ ...figcap, margin: 0, color: 'var(--admin-accent, #E9A860)' }}>
                                    Athugið: full upplausn náðist ekki — notaði 640px rammann (mýkri). Reyndu aftur eða annan ramma.
                                </p>
                            )}
                            {heroPreview && (
                                <figure style={figure}>
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img src={heroPreview} alt="Hetjuspjald forskoðun" style={{ ...previewImg, width: '240px', aspectRatio: '2 / 3' }} />
                                    <figcaption style={figcap}>2:3 · forsíða þáttaraðar (1000×1500). Hladdu niður og settu í „Mynd (Poster)“ reitinn.</figcaption>
                                </figure>
                            )}
                            {heroError && <p style={{ margin: 0, color: 'var(--admin-error, #e55)', fontSize: '0.8rem' }}>{heroError}</p>}
                        </div>
                    </details>

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

const fieldLabel: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    color: 'var(--admin-text-secondary, #aaa)',
    fontSize: '0.78rem',
    fontWeight: 600,
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
