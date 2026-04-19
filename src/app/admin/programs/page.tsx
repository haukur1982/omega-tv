'use client';

import { useEffect, useState, useCallback } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { supabase } from '@/lib/supabase';
import { Loader2, Plus, Save, X, Trash2, Radio, Star, Tv } from 'lucide-react';

/**
 * /admin/programs — "Sýningarskrá"
 *
 * The enrichment catalog for the XML schedule importer. Each row
 * defines rich metadata for a recurring show; the importer matches
 * XML title → program row → enrichment automatically.
 *
 * Workflow:
 *   - Fill this once per show. Ongoing daily XML imports auto-enrich
 *     every airing of that show — no weekly data entry.
 *   - When a new title appears in the XML without a match, /admin/schedule
 *     nudges ("X óþekktar sýningar — skráðu þær hér").
 */

type Program = {
    id: string;
    title: string;
    program_type: string;
    host_name: string | null;
    description: string | null;
    is_usually_live: boolean;
    is_featured_default: boolean;
    default_bible_ref: string | null;
    default_tags: string[];
};

type ProgramType = 'service' | 'prayer_night' | 'teaching' | 'broadcast' | 'rerun' | 'special' | 'filler';

const PROGRAM_TYPES: { value: ProgramType; label: string }[] = [
    { value: 'service', label: 'Sunnudagssamkoma' },
    { value: 'prayer_night', label: 'Bænastund' },
    { value: 'teaching', label: 'Fræðsla' },
    { value: 'broadcast', label: 'Útsending' },
    { value: 'rerun', label: 'Endurtekning' },
    { value: 'special', label: 'Sérstakur' },
    { value: 'filler', label: 'Uppfylling' },
];

const EMPTY: Partial<Program> = {
    title: '',
    program_type: 'rerun',
    host_name: '',
    description: '',
    is_usually_live: false,
    is_featured_default: false,
    default_bible_ref: '',
    default_tags: [],
};

export default function ProgramsAdminPage() {
    const [items, setItems] = useState<Program[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [creating, setCreating] = useState(false);
    const [draft, setDraft] = useState<Partial<Program>>(EMPTY);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const load = useCallback(async () => {
        setLoading(true);
        const { data: { session } } = await supabase.auth.getSession();
        const res = await fetch('/api/admin/programs', {
            headers: session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {},
        });
        if (res.ok) {
            const data = await res.json();
            setItems(data.items ?? []);
        }
        setLoading(false);
    }, []);

    useEffect(() => { load(); }, [load]);

    const beginCreate = () => {
        setCreating(true);
        setEditingId(null);
        setDraft(EMPTY);
        setError(null);
    };

    const beginEdit = (p: Program) => {
        setCreating(false);
        setEditingId(p.id);
        setDraft({ ...p });
        setError(null);
    };

    const cancel = () => {
        setCreating(false);
        setEditingId(null);
        setDraft(EMPTY);
        setError(null);
    };

    const save = async () => {
        setSaving(true);
        setError(null);
        const { data: { session } } = await supabase.auth.getSession();
        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
            ...(session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {}),
        };

        // Normalize empty strings to null
        const payload = {
            ...draft,
            host_name: draft.host_name?.trim() || null,
            description: draft.description?.trim() || null,
            default_bible_ref: draft.default_bible_ref?.trim() || null,
            default_tags: draft.default_tags ?? [],
        };

        const url = editingId ? `/api/admin/programs/${editingId}` : '/api/admin/programs';
        const method = editingId ? 'PATCH' : 'POST';
        const res = await fetch(url, { method, headers, body: JSON.stringify(payload) });
        if (!res.ok) {
            const data = await res.json().catch(() => ({ error: 'Villa' }));
            setError(data.error ?? 'Villa');
            setSaving(false);
            return;
        }
        setSaving(false);
        cancel();
        await load();
    };

    const del = async (p: Program) => {
        if (!confirm(`Eyða sýningu "${p.title}"?`)) return;
        const { data: { session } } = await supabase.auth.getSession();
        const res = await fetch(`/api/admin/programs/${p.id}`, {
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

    const isEditing = creating || editingId !== null;

    return (
        <AdminLayout>
            <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
                <header style={{ marginBottom: '1.75rem', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                        <p className="type-merki" style={{ color: 'var(--admin-accent, #E9A860)', margin: 0, marginBottom: '8px', letterSpacing: '0.22em', fontSize: '0.68rem' }}>
                            Dagskrá · Sýningarskrá
                        </p>
                        <h1 style={{ margin: 0, fontSize: 'clamp(1.6rem, 2.8vw, 2.1rem)', fontWeight: 700, color: 'var(--admin-text, #eee)', letterSpacing: '-0.02em' }}>
                            Sýningar
                        </h1>
                        <p style={{ margin: '8px 0 0', color: 'var(--admin-text-muted, #888)', fontSize: '0.92rem', lineHeight: 1.55, maxWidth: '62ch' }}>
                            Hver sýning er <em>skráð hér einu sinni</em> — tegund, gestgjafi, lýsing, hvort hún er bein útsending. Þegar dagleg XML-dagskrá er flutt inn frá playout-kerfinu tengir innflytjandinn titilinn hér og auðgar hverja færslu sjálfkrafa. Þú sparar vikulega handavinnu.
                        </p>
                    </div>
                    {!isEditing && (
                        <button type="button" onClick={beginCreate} style={btnAmber}>
                            <Plus size={14} /> Ný sýning
                        </button>
                    )}
                </header>

                {isEditing && (
                    <div
                        style={{
                            marginBottom: '1.5rem',
                            padding: '20px 22px',
                            background: 'var(--admin-surface, #1f1d1a)',
                            border: '1px solid var(--admin-accent, #E9A860)',
                            borderRadius: '8px',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '14px',
                        }}
                    >
                        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '12px' }}>
                            <Field label="Titill" hint="Verður að passa NÁKVÆMLEGA við titilinn í XML frá playout (rými inkl.).">
                                <input
                                    type="text"
                                    value={draft.title ?? ''}
                                    onChange={(e) => setDraft((p) => ({ ...p, title: e.target.value }))}
                                    style={inputStyle}
                                    required
                                />
                            </Field>
                            <Field label="Tegund">
                                <select
                                    value={draft.program_type ?? 'rerun'}
                                    onChange={(e) => setDraft((p) => ({ ...p, program_type: e.target.value as ProgramType }))}
                                    style={inputStyle}
                                >
                                    {PROGRAM_TYPES.map((t) => (<option key={t.value} value={t.value}>{t.label}</option>))}
                                </select>
                            </Field>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                            <Field label="Gestgjafi (valfr.)">
                                <input
                                    type="text"
                                    value={draft.host_name ?? ''}
                                    onChange={(e) => setDraft((p) => ({ ...p, host_name: e.target.value }))}
                                    placeholder="t.d. Eiríkur Sigurbjörnsson"
                                    style={inputStyle}
                                />
                            </Field>
                            <Field label="Ritning (OSIS, valfr.)">
                                <input
                                    type="text"
                                    value={draft.default_bible_ref ?? ''}
                                    onChange={(e) => setDraft((p) => ({ ...p, default_bible_ref: e.target.value }))}
                                    placeholder="t.d. MAT.5.3-MAT.5.10"
                                    style={{ ...inputStyle, fontFamily: 'monospace' }}
                                />
                            </Field>
                        </div>
                        <Field label="Lýsing (ein lína)">
                            <input
                                type="text"
                                value={draft.description ?? ''}
                                onChange={(e) => setDraft((p) => ({ ...p, description: e.target.value }))}
                                placeholder="Stutt lýsing sem birtist við hvert sýningu í dagskrá"
                                style={inputStyle}
                            />
                        </Field>
                        <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                            <label style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', cursor: 'pointer', color: 'var(--admin-text, #eee)', fontSize: '0.88rem' }}>
                                <input
                                    type="checkbox"
                                    checked={draft.is_usually_live ?? false}
                                    onChange={(e) => setDraft((p) => ({ ...p, is_usually_live: e.target.checked }))}
                                    style={{ width: '16px', height: '16px', accentColor: 'var(--admin-accent, #E9A860)' }}
                                />
                                <Radio size={13} /> Yfirleitt í beinni
                            </label>
                            <label style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', cursor: 'pointer', color: 'var(--admin-text, #eee)', fontSize: '0.88rem' }}>
                                <input
                                    type="checkbox"
                                    checked={draft.is_featured_default ?? false}
                                    onChange={(e) => setDraft((p) => ({ ...p, is_featured_default: e.target.checked }))}
                                    style={{ width: '16px', height: '16px', accentColor: 'var(--admin-accent, #E9A860)' }}
                                />
                                <Star size={13} /> Úrvalsþáttur að sjálfgefnu
                            </label>
                        </div>
                        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', paddingTop: '6px', borderTop: '1px solid var(--admin-border, #333)' }}>
                            {error && <span style={{ color: 'var(--admin-error, #e55)', fontSize: '0.84rem', alignSelf: 'center', flex: 1 }}>{error}</span>}
                            <button type="button" onClick={cancel} style={btnGhost}>
                                <X size={14} /> Hætta við
                            </button>
                            <button type="button" onClick={save} disabled={saving || !draft.title?.trim()} style={{ ...btnAmber, opacity: saving || !draft.title?.trim() ? 0.5 : 1 }}>
                                {saving ? <Loader2 size={14} className="admin-spinner" /> : <Save size={14} />}
                                Vista
                            </button>
                        </div>
                    </div>
                )}

                {/* List */}
                {loading ? (
                    <p style={{ color: 'var(--admin-text-muted, #888)', fontSize: '0.88rem' }}>
                        <Loader2 size={14} className="admin-spinner" style={{ display: 'inline-block', verticalAlign: '-2px', marginRight: '6px' }} />
                        Sæki…
                    </p>
                ) : items.length === 0 ? (
                    <p style={{ color: 'var(--admin-text-muted, #888)', fontSize: '0.88rem', fontStyle: 'italic' }}>
                        Engar sýningar skráðar enn.
                    </p>
                ) : (
                    <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        {items.map((p) => (
                            <li key={p.id}>
                                <ProgramRow p={p} onEdit={() => beginEdit(p)} onDelete={() => del(p)} />
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </AdminLayout>
    );
}

function ProgramRow({ p, onEdit, onDelete }: { p: Program; onEdit: () => void; onDelete: () => void }) {
    const typeLabel = PROGRAM_TYPES.find((t) => t.value === p.program_type)?.label ?? p.program_type;
    return (
        <article
            style={{
                display: 'grid',
                gridTemplateColumns: '1fr auto',
                gap: '14px',
                alignItems: 'center',
                padding: '10px 14px',
                background: 'var(--admin-surface, #1f1d1a)',
                border: '1px solid var(--admin-border, #333)',
                borderRadius: '6px',
            }}
        >
            <div style={{ minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '2px', flexWrap: 'wrap' }}>
                    <Tv size={13} style={{ color: 'var(--admin-text-muted, #888)', flexShrink: 0 }} />
                    <h3 style={{ margin: 0, fontFamily: 'var(--font-serif, serif)', color: 'var(--admin-text, #eee)', fontSize: '0.98rem', fontWeight: 700, letterSpacing: '-0.01em' }}>
                        {p.title}
                    </h3>
                    {p.is_usually_live && (
                        <span className="type-merki" style={{ color: '#D84B3A', fontSize: '0.56rem', letterSpacing: '0.22em', padding: '2px 7px', background: 'rgba(216, 75, 58, 0.14)', border: '1px solid rgba(216, 75, 58, 0.4)', borderRadius: '2px' }}>
                            BEINT
                        </span>
                    )}
                    {p.is_featured_default && (
                        <span className="type-merki" style={{ color: 'var(--admin-accent, #E9A860)', fontSize: '0.56rem', letterSpacing: '0.22em' }}>
                            ÚRVAL
                        </span>
                    )}
                    <span className="type-merki" style={{ color: 'var(--admin-text-muted, #888)', fontSize: '0.56rem', letterSpacing: '0.18em' }}>
                        {typeLabel}
                    </span>
                    {p.host_name && (
                        <span style={{ color: 'var(--admin-text-muted, #888)', fontSize: '0.76rem', fontStyle: 'italic' }}>
                            · {p.host_name}
                        </span>
                    )}
                </div>
                {p.description && (
                    <p style={{ margin: 0, color: 'var(--admin-text-muted, #888)', fontSize: '0.78rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {p.description}
                    </p>
                )}
            </div>
            <div style={{ display: 'flex', gap: '6px' }}>
                <button type="button" onClick={onEdit} style={btnGhostSm}>Laga</button>
                <button type="button" onClick={onDelete} style={{ ...btnGhostSm, color: 'var(--admin-error, #e55)' }}>
                    <Trash2 size={12} />
                </button>
            </div>
        </article>
    );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
    return (
        <label style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
            <span style={{ color: 'var(--admin-text, #eee)', fontSize: '0.85rem', fontWeight: 500 }}>{label}</span>
            {children}
            {hint && <span style={{ color: 'var(--admin-text-muted, #888)', fontSize: '0.72rem', fontStyle: 'italic' }}>{hint}</span>}
        </label>
    );
}

const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '8px 11px',
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
    padding: '8px 14px',
    background: 'transparent',
    border: '1px solid var(--admin-border, #333)',
    borderRadius: '4px',
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
    padding: '8px 16px',
    background: 'var(--admin-accent, #E9A860)',
    border: '1px solid var(--admin-accent, #E9A860)',
    borderRadius: '4px',
    color: '#14120F',
    fontSize: '0.84rem',
    fontWeight: 700,
    cursor: 'pointer',
};
