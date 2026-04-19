'use client';

import { useEffect, useState, useCallback } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { supabase } from '@/lib/supabase';
import {
    Loader2,
    CheckCircle2,
    Eye,
    Plus,
    Star,
    AlertTriangle,
    Trash2,
    RotateCcw,
} from 'lucide-react';

/**
 * /admin/featured — Vikuforsíða
 *
 * The single most visible editorial surface on omega.is — the home page
 * hero. This admin lets Hawk (or the CEO) curate it weekly in 3 minutes:
 * hero image URL, kicker, headline (Vaka display serif), body paragraph,
 * two CTAs.
 *
 * Publishing model:
 *   - "Birta nýja vikuforsíðu" creates a new row with published_at=now().
 *     The frontend's getCurrentFeaturedWeek() picks the most-recently-
 *     published non-fallback row, so this atomically becomes the live hero.
 *   - Past features stay in the history list — you can re-publish, edit,
 *     or delete any of them.
 *   - The seeded fallback row is never deleted; it's what renders when no
 *     real feature has been published yet.
 */

type FeaturedWeek = {
    id: string;
    week_start_date: string;
    hero_image_url: string;
    hero_image_alt: string | null;
    kicker: string;
    headline: string;
    body: string;
    primary_cta_label: string;
    primary_cta_href: string;
    secondary_cta_label: string | null;
    secondary_cta_href: string | null;
    is_fallback: boolean;
    published_at: string | null;
    created_at: string | null;
};

// Helpers for the "this week" default week_start_date
function mondayOfThisWeek(): string {
    const now = new Date();
    const dow = now.getUTCDay();
    const daysFromMonday = (dow + 6) % 7;
    const m = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - daysFromMonday));
    return m.toISOString().slice(0, 10);
}

const EMPTY_DRAFT: Omit<FeaturedWeek, 'id' | 'is_fallback' | 'published_at' | 'created_at'> = {
    week_start_date: mondayOfThisWeek(),
    hero_image_url: '',
    hero_image_alt: '',
    kicker: '',
    headline: '',
    body: '',
    primary_cta_label: 'Horfa beint',
    primary_cta_href: '/live',
    secondary_cta_label: 'Skoða safnið',
    secondary_cta_href: '/sermons',
};

export default function FeaturedWeeksAdminPage() {
    const [items, setItems] = useState<FeaturedWeek[]>([]);
    const [loading, setLoading] = useState(true);
    const [draft, setDraft] = useState<typeof EMPTY_DRAFT>(EMPTY_DRAFT);
    const [status, setStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
    const [error, setError] = useState<string | null>(null);
    const [editingId, setEditingId] = useState<string | null>(null);

    const load = useCallback(async () => {
        setLoading(true);
        const { data: { session } } = await supabase.auth.getSession();
        const res = await fetch('/api/admin/featured-weeks', {
            headers: session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {},
        });
        if (res.ok) {
            const data = await res.json();
            setItems(data.items ?? []);
        }
        setLoading(false);
    }, []);

    useEffect(() => { load(); }, [load]);

    const currentLive = items.find((i) => !i.is_fallback && i.published_at) ?? items.find((i) => i.is_fallback && i.published_at);

    const patchDraft = useCallback((patch: Partial<typeof EMPTY_DRAFT>) => {
        setDraft((prev) => ({ ...prev, ...patch }));
        setStatus('idle');
    }, []);

    const beginEdit = (item: FeaturedWeek) => {
        setEditingId(item.id);
        setDraft({
            week_start_date: item.week_start_date,
            hero_image_url: item.hero_image_url,
            hero_image_alt: item.hero_image_alt ?? '',
            kicker: item.kicker,
            headline: item.headline,
            body: item.body,
            primary_cta_label: item.primary_cta_label,
            primary_cta_href: item.primary_cta_href,
            secondary_cta_label: item.secondary_cta_label ?? '',
            secondary_cta_href: item.secondary_cta_href ?? '',
        });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const resetForNew = () => {
        setEditingId(null);
        setDraft(EMPTY_DRAFT);
        setStatus('idle');
        setError(null);
    };

    const save = useCallback(async ({ publish }: { publish: boolean }) => {
        setStatus('saving');
        setError(null);
        const { data: { session } } = await supabase.auth.getSession();
        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
            ...(session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {}),
        };

        // Normalize empty strings to null for nullable fields
        const body = {
            ...draft,
            hero_image_alt: draft.hero_image_alt?.trim() || null,
            secondary_cta_label: draft.secondary_cta_label?.trim() || null,
            secondary_cta_href: draft.secondary_cta_href?.trim() || null,
            publish,
        };

        const url = editingId
            ? `/api/admin/featured-weeks/${editingId}`
            : '/api/admin/featured-weeks';
        const method = editingId ? 'PATCH' : 'POST';

        // For PATCH we also set published_at explicitly
        const patchBody: Record<string, unknown> = { ...body };
        if (editingId) {
            delete patchBody.publish;
            patchBody.published_at = publish ? new Date().toISOString() : null;
        }

        const res = await fetch(url, {
            method,
            headers,
            body: JSON.stringify(editingId ? patchBody : body),
        });

        if (!res.ok) {
            const data = await res.json().catch(() => ({ error: 'Villa' }));
            setError(data.error ?? 'Villa');
            setStatus('error');
            return;
        }
        setStatus('saved');
        await load();
        if (!editingId) resetForNew();
    }, [draft, editingId, load]);

    const togglePublish = async (item: FeaturedWeek) => {
        const { data: { session } } = await supabase.auth.getSession();
        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
            ...(session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {}),
        };
        const res = await fetch(`/api/admin/featured-weeks/${item.id}`, {
            method: 'PATCH',
            headers,
            body: JSON.stringify({
                published_at: item.published_at ? null : new Date().toISOString(),
            }),
        });
        if (res.ok) await load();
    };

    const deleteItem = async (item: FeaturedWeek) => {
        if (!confirm(`Eyða vikuforsíðu "${item.headline}"?`)) return;
        const { data: { session } } = await supabase.auth.getSession();
        const res = await fetch(`/api/admin/featured-weeks/${item.id}`, {
            method: 'DELETE',
            headers: session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {},
        });
        if (!res.ok) {
            const data = await res.json().catch(() => ({ error: 'Villa' }));
            alert(data.error ?? 'Villa');
            return;
        }
        await load();
    };

    return (
        <AdminLayout>
            <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
                <header style={{ marginBottom: '1.75rem' }}>
                    <p className="type-merki" style={{ color: 'var(--admin-accent, #E9A860)', margin: 0, marginBottom: '8px', letterSpacing: '0.22em', fontSize: '0.68rem' }}>
                        Forsíðan · Vikuforsíða
                    </p>
                    <h1 style={{ margin: 0, fontSize: 'clamp(1.6rem, 2.8vw, 2.1rem)', fontWeight: 700, color: 'var(--admin-text, #eee)', letterSpacing: '-0.02em' }}>
                        {editingId ? 'Lagfæra vikuforsíðu' : 'Ný vikuforsíða'}
                    </h1>
                    <p style={{ margin: '8px 0 0', color: 'var(--admin-text-muted, #888)', fontSize: '0.92rem', lineHeight: 1.55, maxWidth: '58ch' }}>
                        Þetta sem þú birtir hér birtist efst á omega.is — hetjuvegg heimasíðunnar. Skrifaðu eitt til tvö efnisgreinar, pikkaðu bakgrunnsmynd, og smelltu <em>Birta</em>. Tekur 3 mínútur á sunnudagskvöldi.
                    </p>
                </header>

                {/* ── Current live feature banner ───────────────────── */}
                {currentLive && !editingId && (
                    <section
                        style={{
                            marginBottom: '1.5rem',
                            padding: '14px 18px',
                            background: 'rgba(233, 168, 96, 0.08)',
                            border: '1px solid rgba(233, 168, 96, 0.3)',
                            borderRadius: '6px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            flexWrap: 'wrap',
                        }}
                    >
                        <Star size={16} style={{ color: 'var(--admin-accent, #E9A860)', flexShrink: 0 }} />
                        <div style={{ minWidth: 0, flex: 1 }}>
                            <p className="type-merki" style={{ color: 'var(--admin-accent, #E9A860)', margin: 0, marginBottom: '2px', letterSpacing: '0.2em', fontSize: '0.6rem' }}>
                                {currentLive.is_fallback ? 'NÚVERANDI — VARARÖÐ' : 'LIVE Á FORSÍÐUNNI'}
                            </p>
                            <p style={{ margin: 0, fontFamily: 'var(--font-serif, serif)', color: 'var(--admin-text, #eee)', fontSize: '1rem' }}>
                                {currentLive.headline}
                            </p>
                        </div>
                        <button type="button" onClick={() => beginEdit(currentLive)} style={btnGhostSm}>
                            Laga
                        </button>
                    </section>
                )}

                {/* ── Form ─────────────────────────────────────────── */}
                <form onSubmit={(e) => e.preventDefault()} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                    <FieldGroup label="Vika + bakgrunnsmynd">
                        <Field label="Vika byrjar (mánudagur)" hint="YYYY-MM-DD. Sjálfgefið er mánudagur þessarar viku.">
                            <input
                                type="date"
                                value={draft.week_start_date}
                                onChange={(e) => patchDraft({ week_start_date: e.target.value })}
                                style={{ ...inputStyle, maxWidth: '200px' }}
                                required
                            />
                        </Field>
                        <Field label="Hetjuvegg­mynd URL" hint="Mynd í háum gæðum, helst 2400×1350 eða stærri. Unsplash, eigin upphleðslu, eða Bunny CDN.">
                            <input
                                type="url"
                                value={draft.hero_image_url}
                                onChange={(e) => patchDraft({ hero_image_url: e.target.value })}
                                placeholder="https://…"
                                style={inputStyle}
                                required
                            />
                        </Field>
                        {draft.hero_image_url && (
                            <div style={{ position: 'relative', aspectRatio: '16 / 9', borderRadius: '4px', overflow: 'hidden', background: 'var(--admin-bg, #14120F)' }}>
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                    src={draft.hero_image_url}
                                    alt={draft.hero_image_alt || 'Forskoðun'}
                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                />
                            </div>
                        )}
                        <Field label="Alt-texti (aðgengi)" hint="Hvað sést á myndinni? Stuttlega.">
                            <input
                                type="text"
                                value={draft.hero_image_alt ?? ''}
                                onChange={(e) => patchDraft({ hero_image_alt: e.target.value })}
                                placeholder="t.d. Íslenskt landslag í vetrarbirtu"
                                style={inputStyle}
                            />
                        </Field>
                    </FieldGroup>

                    <FieldGroup label="Texti hetjuveggsins">
                        <Field label="Kicker (lítill texti efst)" hint="Stuttur, hástafa, 5–10 orð. Dæmi: Sýning vikunnar · föstudagur 18. apríl · kl. 20:00">
                            <input
                                type="text"
                                value={draft.kicker}
                                onChange={(e) => patchDraft({ kicker: e.target.value })}
                                style={inputStyle}
                                required
                            />
                        </Field>
                        <Field label="Fyrirsögn (stórt serif)" hint="Stutt. 3–7 orð. Dæmi: Von og sannleikur fyrir Ísland.">
                            <input
                                type="text"
                                value={draft.headline}
                                onChange={(e) => patchDraft({ headline: e.target.value })}
                                style={{ ...inputStyle, fontFamily: 'var(--font-serif, serif)', fontSize: '1.15rem' }}
                                required
                            />
                        </Field>
                        <Field label="Meginmál" hint="40–60 orð. Einlæg rödd, ekki markaðs­frasar.">
                            <textarea
                                value={draft.body}
                                onChange={(e) => patchDraft({ body: e.target.value })}
                                rows={4}
                                style={{ ...inputStyle, resize: 'vertical', fontFamily: 'var(--font-serif, serif)' }}
                                required
                            />
                        </Field>
                    </FieldGroup>

                    <FieldGroup label="Hnappar (CTA)">
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                            <Field label="Aðalhnappur · texti">
                                <input
                                    type="text"
                                    value={draft.primary_cta_label}
                                    onChange={(e) => patchDraft({ primary_cta_label: e.target.value })}
                                    style={inputStyle}
                                    required
                                />
                            </Field>
                            <Field label="Aðalhnappur · hlekkur">
                                <input
                                    type="text"
                                    value={draft.primary_cta_href}
                                    onChange={(e) => patchDraft({ primary_cta_href: e.target.value })}
                                    style={inputStyle}
                                    required
                                />
                            </Field>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                            <Field label="Aukahnappur · texti (valfrjáls)">
                                <input
                                    type="text"
                                    value={draft.secondary_cta_label ?? ''}
                                    onChange={(e) => patchDraft({ secondary_cta_label: e.target.value })}
                                    style={inputStyle}
                                />
                            </Field>
                            <Field label="Aukahnappur · hlekkur (valfrjáls)">
                                <input
                                    type="text"
                                    value={draft.secondary_cta_href ?? ''}
                                    onChange={(e) => patchDraft({ secondary_cta_href: e.target.value })}
                                    style={inputStyle}
                                />
                            </Field>
                        </div>
                    </FieldGroup>

                    {/* Actions */}
                    <div
                        style={{
                            display: 'flex',
                            flexWrap: 'wrap',
                            alignItems: 'center',
                            gap: '12px',
                            padding: '16px 20px',
                            background: 'var(--admin-surface, #1f1d1a)',
                            border: '1px solid var(--admin-border, #333)',
                            borderRadius: '8px',
                        }}
                    >
                        <div style={{ flex: 1, minHeight: '20px', minWidth: 0 }}>
                            {status === 'saved' && (
                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--admin-accent, #E9A860)', fontSize: '0.84rem' }}>
                                    <CheckCircle2 size={14} /> Vistað
                                </span>
                            )}
                            {error && (
                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--admin-error, #e55)', fontSize: '0.84rem' }}>
                                    <AlertTriangle size={14} /> {error}
                                </span>
                            )}
                        </div>
                        <div style={{ display: 'flex', gap: '10px' }}>
                            {editingId && (
                                <button type="button" onClick={resetForNew} style={btnGhost}>
                                    Hætta við
                                </button>
                            )}
                            <button type="button" onClick={() => save({ publish: false })} disabled={status === 'saving'} style={btnGhost}>
                                {status === 'saving' ? <Loader2 size={14} className="admin-spinner" /> : null}
                                Vista drög
                            </button>
                            <button type="button" onClick={() => save({ publish: true })} disabled={status === 'saving'} style={btnAmber}>
                                {status === 'saving' ? <Loader2 size={14} className="admin-spinner" /> : <Eye size={14} />}
                                {editingId ? 'Vista og birta' : 'Birta á forsíðunni'}
                            </button>
                        </div>
                    </div>
                </form>

                {/* ── History ──────────────────────────────────────── */}
                <section style={{ marginTop: '2.5rem' }}>
                    <h2 style={{ margin: 0, marginBottom: '14px', fontSize: '1.05rem', fontWeight: 600, color: 'var(--admin-text, #eee)', letterSpacing: '-0.01em' }}>
                        <Plus size={14} style={{ display: 'inline-block', marginRight: '8px', verticalAlign: '-2px' }} />
                        Fyrri vikuforsíður
                    </h2>
                    {loading ? (
                        <p style={{ color: 'var(--admin-text-muted, #888)', fontSize: '0.88rem' }}>Sæki…</p>
                    ) : items.length === 0 ? (
                        <p style={{ color: 'var(--admin-text-muted, #888)', fontSize: '0.88rem', fontStyle: 'italic' }}>
                            Engar vikuforsíður enn.
                        </p>
                    ) : (
                        <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            {items.map((item) => (
                                <li key={item.id}>
                                    <HistoryRow item={item} onEdit={() => beginEdit(item)} onTogglePublish={() => togglePublish(item)} onDelete={() => deleteItem(item)} />
                                </li>
                            ))}
                        </ul>
                    )}
                </section>
            </div>
        </AdminLayout>
    );
}

function HistoryRow({
    item,
    onEdit,
    onTogglePublish,
    onDelete,
}: {
    item: FeaturedWeek;
    onEdit: () => void;
    onTogglePublish: () => void;
    onDelete: () => void;
}) {
    const isLive = !!item.published_at;
    const isFallback = item.is_fallback;

    return (
        <article
            style={{
                display: 'grid',
                gridTemplateColumns: '120px 1fr auto',
                gap: '16px',
                padding: '12px 14px',
                background: 'var(--admin-surface, #1f1d1a)',
                border: `1px solid ${isLive ? 'rgba(233, 168, 96, 0.35)' : 'var(--admin-border, #333)'}`,
                borderRadius: '6px',
                alignItems: 'center',
            }}
        >
            <div style={{ position: 'relative', width: '120px', aspectRatio: '16 / 9', overflow: 'hidden', borderRadius: '3px', background: 'var(--admin-bg, #14120F)' }}>
                {item.hero_image_url && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={item.hero_image_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                )}
            </div>
            <div style={{ minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', flexWrap: 'wrap' }}>
                    {isLive && (
                        <span className="type-merki" style={{ color: 'var(--admin-accent, #E9A860)', fontSize: '0.6rem', letterSpacing: '0.22em' }}>
                            LIVE
                        </span>
                    )}
                    {isFallback && (
                        <span className="type-merki" style={{ color: 'var(--admin-text-muted, #888)', fontSize: '0.6rem', letterSpacing: '0.22em' }}>
                            VARARÖÐ
                        </span>
                    )}
                    <span className="type-merki" style={{ color: 'var(--admin-text-muted, #888)', fontSize: '0.6rem', letterSpacing: '0.22em' }}>
                        Vika {item.week_start_date}
                    </span>
                </div>
                <p style={{ margin: 0, marginBottom: '2px', fontFamily: 'var(--font-serif, serif)', color: 'var(--admin-text, #eee)', fontSize: '1rem', lineHeight: 1.3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {item.headline}
                </p>
                <p style={{ margin: 0, color: 'var(--admin-text-muted, #888)', fontSize: '0.78rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {item.kicker}
                </p>
            </div>
            <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                <button type="button" onClick={onEdit} style={btnGhostSm} title="Laga">
                    Laga
                </button>
                <button type="button" onClick={onTogglePublish} style={btnGhostSm} title={isLive ? 'Afbirta' : 'Birta'}>
                    {isLive ? <><RotateCcw size={12} /> Afbirta</> : <><Eye size={12} /> Birta</>}
                </button>
                {!isFallback && (
                    <button type="button" onClick={onDelete} style={{ ...btnGhostSm, color: 'var(--admin-error, #e55)' }} title="Eyða">
                        <Trash2 size={12} />
                    </button>
                )}
            </div>
        </article>
    );
}

function FieldGroup({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <fieldset
            style={{
                border: '1px solid var(--admin-border, #333)',
                borderRadius: '8px',
                padding: '18px 20px',
                background: 'var(--admin-surface, #1f1d1a)',
                margin: 0,
                display: 'flex',
                flexDirection: 'column',
                gap: '14px',
            }}
        >
            <legend style={{ padding: '0 8px', color: 'var(--admin-accent, #E9A860)', fontSize: '0.66rem', fontWeight: 600, letterSpacing: '0.2em', textTransform: 'uppercase' }}>
                {label}
            </legend>
            {children}
        </fieldset>
    );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
    return (
        <label style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <span style={{ color: 'var(--admin-text, #eee)', fontSize: '0.85rem', fontWeight: 500 }}>{label}</span>
            {children}
            {hint && <span style={{ color: 'var(--admin-text-muted, #888)', fontSize: '0.74rem', fontStyle: 'italic', lineHeight: 1.45 }}>{hint}</span>}
        </label>
    );
}

const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '9px 11px',
    background: 'var(--admin-bg, #14120F)',
    border: '1px solid var(--admin-border, #333)',
    borderRadius: '4px',
    color: 'var(--admin-text, #eee)',
    fontSize: '0.9rem',
    fontFamily: 'inherit',
    outline: 'none',
};

const btnGhost: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '9px 16px',
    background: 'transparent',
    border: '1px solid var(--admin-border, #333)',
    borderRadius: '6px',
    color: 'var(--admin-text, #eee)',
    fontSize: '0.82rem',
    fontWeight: 600,
    cursor: 'pointer',
};

const btnGhostSm: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    padding: '6px 10px',
    background: 'transparent',
    border: '1px solid var(--admin-border, #333)',
    borderRadius: '4px',
    color: 'var(--admin-text, #eee)',
    fontSize: '0.74rem',
    fontWeight: 600,
    cursor: 'pointer',
};

const btnAmber: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '9px 18px',
    background: 'var(--admin-accent, #E9A860)',
    border: '1px solid var(--admin-accent, #E9A860)',
    borderRadius: '6px',
    color: '#14120F',
    fontSize: '0.84rem',
    fontWeight: 700,
    cursor: 'pointer',
};
