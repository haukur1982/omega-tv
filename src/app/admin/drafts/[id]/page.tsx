'use client';

import { useEffect, useState, useCallback } from 'react';
import { use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import AdminLayout from '@/components/admin/AdminLayout';
import OsisPicker from '@/components/admin/OsisPicker';
import ChaptersEditor from '@/components/admin/ChaptersEditor';
import { supabase } from '@/lib/supabase';
import { Loader2, CheckCircle2, ArrowLeft, Save, Sparkles } from 'lucide-react';

/**
 * /admin/drafts/[id] — the 2-minute review form.
 *
 * Every editable field in one place: title, description, editor_note,
 * bible_ref (via OsisPicker — prevents drift), chapters (via
 * ChaptersEditor), tags, captions_available, language_primary,
 * thumbnail_custom, series/season links.
 *
 * Two primary actions at the bottom: Save draft, Publish now.
 * A third "Fylla út sjálfvirkt" button calls the metadata generator
 * when that plumbing is wired — dormant for now.
 */

type Episode = {
    id: string;
    title: string;
    description: string | null;
    episode_number: number | null;
    bunny_video_id: string | null;
    thumbnail_custom: string | null;
    series_id: string | null;
    season_id: string | null;
    status: string | null;
    bible_ref: string | null;
    editor_note: string | null;
    chapters: { t: number; title: string }[] | null;
    tags: string[] | null;
    captions_available: string[] | null;
    transcript_url: string | null;
    language_primary: string | null;
};

export default function DraftEditPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();
    const [episode, setEpisode] = useState<Episode | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [status, setStatus] = useState<'idle' | 'saved' | 'error'>('idle');
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        (async () => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const sb = supabase as any;
            const { data, error: e } = await sb
                .from('episodes')
                .select('id, title, description, episode_number, bunny_video_id, thumbnail_custom, series_id, season_id, status, bible_ref, editor_note, chapters, tags, captions_available, transcript_url, language_primary')
                .eq('id', id)
                .single();
            if (!e && data) setEpisode(data as Episode);
            else setError(e?.message ?? 'Fann ekki þátt.');
            setLoading(false);
        })();
    }, [id]);

    const patch = useCallback((update: Partial<Episode>) => {
        setEpisode(prev => (prev ? { ...prev, ...update } : prev));
        setStatus('idle');
    }, []);

    const save = useCallback(async (publish?: boolean): Promise<boolean> => {
        if (!episode) return false;
        setSaving(true);
        setError(null);
        const { data: { session } } = await supabase.auth.getSession();
        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
            ...(session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {}),
        };

        // PATCH the episode
        const patchBody = {
            title: episode.title,
            description: episode.description,
            episode_number: episode.episode_number,
            thumbnail_custom: episode.thumbnail_custom,
            bible_ref: episode.bible_ref,
            editor_note: episode.editor_note,
            chapters: episode.chapters,
            tags: episode.tags,
            captions_available: episode.captions_available,
            transcript_url: episode.transcript_url,
            language_primary: episode.language_primary,
        };
        const patchRes = await fetch(`/api/admin/episodes/${id}`, {
            method: 'PATCH',
            headers,
            body: JSON.stringify(patchBody),
        });
        if (!patchRes.ok) {
            const data = await patchRes.json().catch(() => ({ error: 'Villa' }));
            setError(data.error ?? 'Vistun tókst ekki.');
            setStatus('error');
            setSaving(false);
            return false;
        }

        if (publish) {
            const pubRes = await fetch(`/api/admin/episodes/${id}/publish`, {
                method: 'POST',
                headers,
            });
            if (!pubRes.ok) {
                const data = await pubRes.json().catch(() => ({ error: 'Villa' }));
                setError(data.error ?? 'Birting tókst ekki.');
                setStatus('error');
                setSaving(false);
                return false;
            }
        }

        setStatus('saved');
        setSaving(false);
        if (publish) router.push('/admin/drafts');
        return true;
    }, [episode, id, router]);

    if (loading) {
        return (
            <AdminLayout>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--admin-text-muted, #888)', padding: '2rem' }}>
                    <Loader2 className="admin-spinner" size={16} />
                    Sæki drög…
                </div>
            </AdminLayout>
        );
    }

    if (!episode) {
        return (
            <AdminLayout>
                <div style={{ padding: '2rem' }}>
                    <p style={{ color: 'var(--admin-error, #e55)' }}>{error ?? 'Fann ekki þátt.'}</p>
                    <Link href="/admin/drafts" style={{ color: 'var(--admin-accent, #E9A860)' }}>← Til baka</Link>
                </div>
            </AdminLayout>
        );
    }

    const tagsString = (episode.tags ?? []).join(', ');
    const captionsString = (episode.captions_available ?? []).join(', ');

    return (
        <AdminLayout>
            <div style={{ maxWidth: '860px', margin: '0 auto' }}>
                <header style={{ marginBottom: '1.75rem' }}>
                    <Link
                        href="/admin/drafts"
                        style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            color: 'var(--admin-text-muted, #888)',
                            fontSize: '0.82rem',
                            textDecoration: 'none',
                            marginBottom: '12px',
                        }}
                    >
                        <ArrowLeft size={14} /> Innhólf
                    </Link>
                    <h1 style={{ margin: 0, fontSize: 'clamp(1.5rem, 2.5vw, 2rem)', fontWeight: 700, color: 'var(--admin-text, #eee)', letterSpacing: '-0.02em' }}>
                        Yfirferð draga
                    </h1>
                    <p style={{ margin: '6px 0 0', color: 'var(--admin-text-muted, #888)', fontSize: '0.88rem' }}>
                        {episode.status === 'draft' ? 'Drög · ekki birt' : 'Þáttur þegar birtur'}
                    </p>
                </header>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
                    {/* ── 1. Titill + lýsing ───────────────────────── */}
                    <FieldGroup label="Titill + lýsing">
                        <Field label="Titill">
                            <input
                                type="text"
                                value={episode.title ?? ''}
                                onChange={(e) => patch({ title: e.target.value })}
                                style={inputStyle}
                            />
                        </Field>
                        <Field label="Þáttanúmer">
                            <input
                                type="number"
                                value={episode.episode_number ?? ''}
                                onChange={(e) => patch({ episode_number: e.target.value ? parseInt(e.target.value, 10) : null })}
                                style={{ ...inputStyle, maxWidth: '120px' }}
                            />
                        </Field>
                        <Field label="Lýsing" hint="Tvær til þrjár efnisgreinar. Birtist á þáttasíðunni.">
                            <textarea
                                value={episode.description ?? ''}
                                onChange={(e) => patch({ description: e.target.value })}
                                rows={5}
                                style={{ ...inputStyle, resize: 'vertical', fontFamily: 'var(--font-serif, serif)' }}
                            />
                        </Field>
                    </FieldGroup>

                    {/* ── 2. Ritstjórnar­lína + ritning ───────────── */}
                    <FieldGroup label="Ritstjórn og ritning">
                        <Field label="Ritstjórnar­lína" hint="40–80 orð í kursívu — Haukur talar beint til áhorfandans. Birtist efst á þáttasíðunni.">
                            <textarea
                                value={episode.editor_note ?? ''}
                                onChange={(e) => patch({ editor_note: e.target.value })}
                                rows={3}
                                style={{ ...inputStyle, resize: 'vertical', fontFamily: 'var(--font-serif, serif)', fontStyle: 'italic' }}
                                maxLength={500}
                            />
                        </Field>
                        <Field label="Ritningar­tilvísun" hint="Ein akkerisvers fyrir þáttinn. Tengir saman sermur · greinar · bænir.">
                            <OsisPicker
                                value={episode.bible_ref}
                                onChange={(canonical) => patch({ bible_ref: canonical })}
                            />
                        </Field>
                    </FieldGroup>

                    {/* ── 3. Kaflar ────────────────────────────────── */}
                    <FieldGroup label="Kaflar">
                        <Field label="Tímasettir kaflar" hint="Birtast sem leiðarvísir með spilaranum.">
                            <ChaptersEditor
                                value={episode.chapters}
                                onChange={(chapters) => patch({ chapters })}
                            />
                        </Field>
                    </FieldGroup>

                    {/* ── 4. Flokkar + textar ──────────────────────── */}
                    <FieldGroup label="Flokkar og textar">
                        <Field label="Flokkar (tags)" hint="Aðskilin með kommum: samfelag, nad, ungmenni">
                            <input
                                type="text"
                                value={tagsString}
                                onChange={(e) => {
                                    const next = e.target.value
                                        .split(',')
                                        .map(s => s.trim().toLowerCase())
                                        .filter(s => s.length > 0);
                                    patch({ tags: next });
                                }}
                                style={inputStyle}
                            />
                        </Field>
                        <Field label="Textatungumál" hint="Tungumálakóðar aðskildir með kommum: is, en">
                            <input
                                type="text"
                                value={captionsString}
                                onChange={(e) => {
                                    const next = e.target.value
                                        .split(',')
                                        .map(s => s.trim().toLowerCase())
                                        .filter(s => s.length > 0);
                                    patch({ captions_available: next });
                                }}
                                style={{ ...inputStyle, maxWidth: '240px' }}
                            />
                        </Field>
                        <Field label="Aðalungumál">
                            <select
                                value={episode.language_primary ?? 'is'}
                                onChange={(e) => patch({ language_primary: e.target.value })}
                                style={{ ...inputStyle, maxWidth: '160px' }}
                            >
                                <option value="is">Íslenska</option>
                                <option value="en">English</option>
                            </select>
                        </Field>
                    </FieldGroup>

                    {/* ── 5. Efnistákn ──────────────────────────────── */}
                    <FieldGroup label="Efnistákn">
                        <Field label="Sérstakt efnistákn" hint="Valfrjáls URL. Ef ekkert — notum sjálfkrafa útdrátt frá Bunny.">
                            <input
                                type="text"
                                value={episode.thumbnail_custom ?? ''}
                                onChange={(e) => patch({ thumbnail_custom: e.target.value || null })}
                                placeholder="https://…"
                                style={inputStyle}
                            />
                        </Field>
                        {episode.bunny_video_id && (
                            <p style={{ margin: 0, color: 'var(--admin-text-muted, #888)', fontSize: '0.78rem' }}>
                                Bunny myndband: <code style={{ color: 'var(--admin-text-secondary, #aaa)' }}>{episode.bunny_video_id}</code>
                            </p>
                        )}
                    </FieldGroup>
                </div>

                {/* ── Actions ──────────────────────────────────────── */}
                <div
                    style={{
                        marginTop: '2.5rem',
                        padding: '18px 22px',
                        background: 'var(--admin-surface, #1f1d1a)',
                        border: '1px solid var(--admin-border, #333)',
                        borderRadius: '8px',
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: '12px',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minHeight: '24px' }}>
                        {status === 'saved' && (
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--admin-accent, #E9A860)', fontSize: '0.84rem' }}>
                                <CheckCircle2 size={14} /> Vistað
                            </span>
                        )}
                        {error && (
                            <span style={{ color: 'var(--admin-error, #e55)', fontSize: '0.84rem' }}>
                                {error}
                            </span>
                        )}
                    </div>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <button
                            type="button"
                            disabled
                            title="Sjálfvirk útfylling með Azotus kemur bráðum"
                            style={{ ...btnGhost, opacity: 0.45, cursor: 'not-allowed' }}
                        >
                            <Sparkles size={14} /> Fylla út sjálfvirkt
                        </button>
                        <button
                            type="button"
                            onClick={() => save(false)}
                            disabled={saving}
                            style={btnGhost}
                        >
                            {saving ? <Loader2 size={14} className="admin-spinner" /> : <Save size={14} />}
                            Vista drög
                        </button>
                        <button
                            type="button"
                            onClick={() => save(true)}
                            disabled={saving}
                            style={btnAmber}
                        >
                            {saving ? <Loader2 size={14} className="admin-spinner" /> : <CheckCircle2 size={14} />}
                            Vista og birta
                        </button>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}

function FieldGroup({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <fieldset
            style={{
                border: '1px solid var(--admin-border, #333)',
                borderRadius: '8px',
                padding: '20px 22px 22px',
                background: 'var(--admin-surface, #1f1d1a)',
                margin: 0,
                display: 'flex',
                flexDirection: 'column',
                gap: '18px',
            }}
        >
            <legend
                style={{
                    padding: '0 8px',
                    color: 'var(--admin-accent, #E9A860)',
                    fontSize: '0.68rem',
                    fontWeight: 600,
                    letterSpacing: '0.2em',
                    textTransform: 'uppercase',
                }}
            >
                {label}
            </legend>
            {children}
        </fieldset>
    );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
    return (
        <label style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <span style={{ color: 'var(--admin-text, #eee)', fontSize: '0.88rem', fontWeight: 500 }}>{label}</span>
            {children}
            {hint && <span style={{ color: 'var(--admin-text-muted, #888)', fontSize: '0.76rem', fontStyle: 'italic' }}>{hint}</span>}
        </label>
    );
}

const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '10px 12px',
    background: 'var(--admin-bg, #14120F)',
    border: '1px solid var(--admin-border, #333)',
    borderRadius: '4px',
    color: 'var(--admin-text, #eee)',
    fontSize: '0.92rem',
    fontFamily: 'inherit',
    outline: 'none',
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

const btnAmber: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '10px 22px',
    background: 'var(--admin-accent, #E9A860)',
    border: '1px solid var(--admin-accent, #E9A860)',
    borderRadius: '6px',
    color: '#14120F',
    fontSize: '0.84rem',
    fontWeight: 700,
    cursor: 'pointer',
};
