'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import AdminLayout from '@/components/admin/AdminLayout';
import { supabase } from '@/lib/supabase';
import { Loader2, FileText, CheckCircle2, Tag, BookOpen, Plus } from 'lucide-react';
import { displayPassageIs } from '@/lib/passages';

/**
 * /admin/drafts — the content pipeline inbox.
 *
 * Lists every episode with status='draft', newest first. Each row shows
 * the 2-minute-review summary: thumbnail, title, show, date, and a
 * preview of the AI-generated (or manually-entered) metadata so Hawk
 * can skim before clicking in.
 *
 * Two actions per row: Edit (opens full form) and Publish (flips status).
 * Bulk publish coming if this surface gets busy.
 */

type DraftEpisode = {
    id: string;
    title: string;
    description: string | null;
    bunny_video_id: string | null;
    thumbnail_custom: string | null;
    episode_number: number | null;
    status: string | null;
    created_at: string | null;
    bible_ref: string | null;
    editor_note: string | null;
    chapters: { t: number; title: string }[] | null;
    tags: string[] | null;
    captions_available: string[] | null;
    series_id: string | null;
};

export default function DraftsPage() {
    const [drafts, setDrafts] = useState<DraftEpisode[]>([]);
    const [loading, setLoading] = useState(true);
    const [publishing, setPublishing] = useState<string | null>(null);

    const load = async () => {
        setLoading(true);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const sb = supabase as any;
        const { data, error } = await sb
            .from('episodes')
            .select('id, title, description, bunny_video_id, thumbnail_custom, episode_number, status, created_at, bible_ref, editor_note, chapters, tags, captions_available, series_id')
            .eq('status', 'draft')
            .order('created_at', { ascending: false });
        if (!error && data) setDrafts(data as DraftEpisode[]);
        setLoading(false);
    };

    useEffect(() => {
        load();
    }, []);

    const publish = async (id: string) => {
        setPublishing(id);
        const { data: { session } } = await supabase.auth.getSession();
        const res = await fetch(`/api/admin/episodes/${id}/publish`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...(session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {}),
            },
        });
        if (res.ok) {
            setDrafts(prev => prev.filter(d => d.id !== id));
        } else {
            const data = await res.json().catch(() => ({ error: 'Villa' }));
            alert(`Birting tókst ekki: ${data.error ?? 'óþekkt villa'}`);
        }
        setPublishing(null);
    };

    return (
        <AdminLayout>
            <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                <header style={{ marginBottom: '2rem', display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                        <p className="type-merki" style={{ color: 'var(--admin-accent, #E9A860)', margin: 0, marginBottom: '8px', letterSpacing: '0.22em', fontSize: '0.68rem' }}>
                            Innhólf · efnis­ferli
                        </p>
                        <h1 style={{ margin: 0, fontSize: 'clamp(1.6rem, 2.8vw, 2.1rem)', fontWeight: 700, color: 'var(--admin-text, #eee)', letterSpacing: '-0.02em' }}>
                            Drög til yfirferðar
                        </h1>
                        <p style={{ margin: '8px 0 0', color: 'var(--admin-text-muted, #888)', fontSize: '0.92rem', lineHeight: 1.5, maxWidth: '58ch' }}>
                            Nýjar upptökur bíða hér þar til þú ferð yfir þær. Smelltu á dragið til að laga lýsingu, ritningartilvísun og útdrætti — síðan <em>Birta</em> þegar þú ert sáttur.
                        </p>
                    </div>
                    <Link
                        href="/admin/drafts/new"
                        style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '8px',
                            padding: '10px 18px',
                            background: 'var(--admin-accent, #E9A860)',
                            border: '1px solid var(--admin-accent, #E9A860)',
                            borderRadius: '6px',
                            color: '#14120F',
                            fontSize: '0.86rem',
                            fontWeight: 700,
                            textDecoration: 'none',
                            whiteSpace: 'nowrap',
                            flexShrink: 0,
                        }}
                    >
                        <Plus size={14} />
                        Nýtt drag
                    </Link>
                </header>

                {loading ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--admin-text-muted, #888)', padding: '2rem' }}>
                        <Loader2 className="admin-spinner" size={16} />
                        Sæki drög…
                    </div>
                ) : drafts.length === 0 ? (
                    <EmptyState />
                ) : (
                    <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {drafts.map(draft => (
                            <li key={draft.id}>
                                <DraftRow
                                    draft={draft}
                                    onPublish={() => publish(draft.id)}
                                    isPublishing={publishing === draft.id}
                                />
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </AdminLayout>
    );
}

function DraftRow({ draft, onPublish, isPublishing }: { draft: DraftEpisode; onPublish: () => void; isPublishing: boolean }) {
    const passage = displayPassageIs(draft.bible_ref);
    const readinessScore = scoreReadiness(draft);
    const isReady = readinessScore >= 4;

    return (
        <article
            style={{
                display: 'grid',
                gridTemplateColumns: '140px 1fr auto',
                gap: '20px',
                padding: '18px',
                background: 'var(--admin-surface, #1f1d1a)',
                border: `1px solid ${isReady ? 'rgba(233, 168, 96, 0.4)' : 'var(--admin-border, #333)'}`,
                borderRadius: '8px',
            }}
        >
            {/* Thumbnail */}
            <div style={{ position: 'relative', width: '140px', aspectRatio: '16 / 9', overflow: 'hidden', borderRadius: '4px', background: 'var(--admin-bg, #14120F)' }}>
                {draft.thumbnail_custom || draft.bunny_video_id ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                        src={draft.thumbnail_custom ?? `https://iframe.mediadelivery.net/thumbnail/${process.env.NEXT_PUBLIC_BUNNY_LIBRARY_ID}/${draft.bunny_video_id}/thumbnail.jpg`}
                        alt={draft.title}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                ) : (
                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--admin-text-muted, #888)' }}>
                        <FileText size={28} />
                    </div>
                )}
            </div>

            {/* Meta */}
            <div style={{ minWidth: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: 'var(--admin-text, #eee)', letterSpacing: '-0.01em', lineHeight: 1.3 }}>
                    {draft.title || <span style={{ color: 'var(--admin-text-muted, #888)', fontStyle: 'italic' }}>Án titils</span>}
                </h2>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '14px', fontSize: '0.78rem', color: 'var(--admin-text-muted, #888)' }}>
                    {passage && (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', color: 'var(--admin-accent, #E9A860)' }}>
                            <BookOpen size={12} />
                            {passage}
                        </span>
                    )}
                    {draft.captions_available && draft.captions_available.length > 0 && (
                        <span>CC · {draft.captions_available.map(c => c.toUpperCase()).join('/')}</span>
                    )}
                    {draft.chapters && draft.chapters.length > 0 && (
                        <span>{draft.chapters.length} kaflar</span>
                    )}
                    {draft.tags && draft.tags.length > 0 && (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                            <Tag size={12} />
                            {draft.tags.slice(0, 3).join(' · ')}
                            {draft.tags.length > 3 && ` +${draft.tags.length - 3}`}
                        </span>
                    )}
                    {draft.created_at && (
                        <span>Skrá&eth;: {new Date(draft.created_at).toLocaleDateString('is-IS', { day: 'numeric', month: 'short' })}</span>
                    )}
                </div>

                {draft.editor_note ? (
                    <p style={{ margin: 0, fontFamily: 'var(--font-serif, serif)', fontStyle: 'italic', color: 'var(--admin-accent, #E9A860)', fontSize: '0.88rem', lineHeight: 1.5 }}>
                        «{draft.editor_note}»
                    </p>
                ) : draft.description ? (
                    <p style={{ margin: 0, color: 'var(--admin-text-secondary, #aaa)', fontSize: '0.84rem', lineHeight: 1.55, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as const, overflow: 'hidden' }}>
                        {draft.description}
                    </p>
                ) : (
                    <p style={{ margin: 0, color: 'var(--admin-text-muted, #888)', fontSize: '0.82rem', fontStyle: 'italic' }}>
                        Engin lýsing eða ritstjórnarlína — bættu við áður en þú birtir.
                    </p>
                )}

                <ReadinessIndicator draft={draft} />
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'stretch' }}>
                <Link
                    href={`/admin/drafts/${draft.id}`}
                    style={{
                        padding: '9px 18px',
                        background: 'transparent',
                        border: '1px solid var(--admin-border, #333)',
                        borderRadius: '6px',
                        color: 'var(--admin-text, #eee)',
                        fontSize: '0.82rem',
                        fontWeight: 600,
                        textAlign: 'center',
                        textDecoration: 'none',
                        whiteSpace: 'nowrap',
                    }}
                >
                    Laga
                </Link>
                <button
                    type="button"
                    onClick={onPublish}
                    disabled={isPublishing}
                    style={{
                        padding: '9px 18px',
                        background: 'var(--admin-accent, #E9A860)',
                        border: '1px solid var(--admin-accent, #E9A860)',
                        borderRadius: '6px',
                        color: '#14120F',
                        fontSize: '0.82rem',
                        fontWeight: 700,
                        cursor: isPublishing ? 'default' : 'pointer',
                        opacity: isPublishing ? 0.5 : 1,
                        whiteSpace: 'nowrap',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                    }}
                >
                    {isPublishing ? <Loader2 size={14} className="admin-spinner" /> : <CheckCircle2 size={14} />}
                    Birta
                </button>
            </div>
        </article>
    );
}

function ReadinessIndicator({ draft }: { draft: DraftEpisode }) {
    const checks: { ok: boolean; label: string }[] = [
        { ok: !!draft.title, label: 'Titill' },
        { ok: !!draft.description, label: 'Lýsing' },
        { ok: !!draft.bible_ref, label: 'Ritning' },
        { ok: !!draft.editor_note, label: 'Ritstjórn' },
        { ok: !!(draft.tags && draft.tags.length > 0), label: 'Flokkar' },
    ];
    return (
        <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
            {checks.map(c => (
                <span
                    key={c.label}
                    title={c.label}
                    style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        padding: '2px 8px',
                        borderRadius: '10px',
                        fontSize: '0.66rem',
                        background: c.ok ? 'rgba(233, 168, 96, 0.12)' : 'transparent',
                        border: `1px solid ${c.ok ? 'rgba(233, 168, 96, 0.35)' : 'var(--admin-border, #333)'}`,
                        color: c.ok ? 'var(--admin-accent, #E9A860)' : 'var(--admin-text-muted, #888)',
                        letterSpacing: '0.05em',
                    }}
                >
                    {c.ok ? '✓' : '○'} {c.label}
                </span>
            ))}
        </div>
    );
}

function scoreReadiness(d: DraftEpisode): number {
    let score = 0;
    if (d.title) score++;
    if (d.description) score++;
    if (d.bible_ref) score++;
    if (d.editor_note) score++;
    if (d.tags && d.tags.length > 0) score++;
    return score;
}

function EmptyState() {
    return (
        <div
            style={{
                padding: '3rem 2rem',
                textAlign: 'center',
                background: 'var(--admin-surface, #1f1d1a)',
                border: '1px dashed var(--admin-border, #333)',
                borderRadius: '8px',
            }}
        >
            <FileText size={32} style={{ color: 'var(--admin-text-muted, #666)', marginBottom: '12px' }} />
            <h3 style={{ margin: 0, color: 'var(--admin-text, #eee)', fontSize: '1.1rem', fontWeight: 600 }}>
                Engin drög til yfirferðar
            </h3>
            <p style={{ margin: '8px auto 0', maxWidth: '48ch', color: 'var(--admin-text-muted, #888)', fontSize: '0.9rem', lineHeight: 1.55 }}>
                Þegar Azotus sendingin klárar að vinna nýtt efni birtast drögin hér til yfirferðar. Þangað til — allt í vinnslu.
            </p>
        </div>
    );
}
