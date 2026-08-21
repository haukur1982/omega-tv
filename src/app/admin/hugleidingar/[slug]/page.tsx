'use client';

import { useCallback, useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, ExternalLink, Save, Check } from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';
import { authedFetch } from '@/lib/admin-fetch';

/**
 * /admin/hugleidingar/[slug] — the review workspace for one devotional.
 *
 * Editing model: the whole piece is one textarea with a blank line between
 * paragraphs. That beats 30 separate inputs for reading flow and for pasting
 * a corrected passage. Saved back as an array, split on blank lines.
 *
 * "Yfirlesin" is the gate — a piece cannot be published without it.
 */

const SLOT_IS: Record<string, string> = { morning: 'Morgunn', evening: 'Kvöld' };

interface Item {
    id: string;
    day: number;
    slot: 'morning' | 'evening';
    slug: string;
    title_is: string;
    title_en: string | null;
    body_is: string[];
    scripture_refs: string[];
    source_url: string | null;
    reviewed: boolean;
    review_note: string | null;
    status: 'draft' | 'published';
}

export default function ReviewDevotionalPage() {
    const params = useParams();
    const router = useRouter();
    const slug = String(params?.slug ?? '');

    const [item, setItem] = useState<Item | null>(null);
    const [title, setTitle] = useState('');
    const [text, setText] = useState('');
    const [note, setNote] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [notice, setNotice] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const load = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const res = await authedFetch(`/api/admin/devotionals?slug=${encodeURIComponent(slug)}`);
            if (!res.ok) throw new Error(`Server svaraði ${res.status}`);
            const d = await res.json();
            const it: Item = d.item;
            setItem(it);
            setTitle(it.title_is);
            setText(it.body_is.join('\n\n'));
            setNote(it.review_note ?? '');
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Tókst ekki að sækja hugleiðinguna');
        }
        setIsLoading(false);
    }, [slug]);

    useEffect(() => { if (slug) load(); }, [slug, load]);

    const paragraphs = () => text.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);

    const save = async (extra: Record<string, unknown> = {}, msg = 'Vistað.') => {
        if (!item) return;
        setSaving(true);
        setNotice(null);
        try {
            const res = await authedFetch('/api/admin/devotionals', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: item.id,
                    slug: item.slug,
                    title_is: title,
                    body_is: paragraphs(),
                    review_note: note,
                    ...extra,
                }),
            });
            if (!res.ok) {
                const d = await res.json().catch(() => ({}));
                throw new Error(d.error || `Villa ${res.status}`);
            }
            setNotice(msg);
            await load();
        } catch (e) {
            setNotice(e instanceof Error ? e.message : 'Villa kom upp.');
        }
        setSaving(false);
    };

    return (
        <AdminLayout>
            <button
                onClick={() => router.push('/admin/hugleidingar')}
                className="admin-btn admin-btn-secondary"
                style={{ marginBottom: '1.5rem', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}
            >
                <ArrowLeft size={15} /> Til baka
            </button>

            {error && (
                <div className="admin-card" style={{ borderColor: 'var(--admin-error)' }}>
                    <p className="admin-body" style={{ color: 'var(--admin-error)', margin: 0 }}>{error}</p>
                </div>
            )}

            {item && (
                <>
                    <div className="flex items-center justify-between mb-6" style={{ gap: '1rem', flexWrap: 'wrap' }}>
                        <div>
                            <div className="admin-label">Dagur {item.day} · {SLOT_IS[item.slot]}</div>
                            <h1 className="admin-h1" style={{ marginTop: '0.25rem' }}>{item.title_is}</h1>
                            {item.title_en && (
                                <p className="admin-body" style={{ opacity: 0.65, fontStyle: 'italic', marginTop: '0.2rem' }}>
                                    {item.title_en}
                                </p>
                            )}
                        </div>
                        <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center', flexWrap: 'wrap' }}>
                            {item.reviewed && (
                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--admin-accent)' }}>
                                    <Check size={14} /> Yfirlesin
                                </span>
                            )}
                            {item.source_url && (
                                <a
                                    href={item.source_url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="admin-btn admin-btn-secondary"
                                    style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.82rem' }}
                                >
                                    <ExternalLink size={14} /> Frumtexti
                                </a>
                            )}
                        </div>
                    </div>

                    <div className="admin-card mb-4" style={{ display: 'grid', gap: '1rem' }}>
                        <label style={{ display: 'grid', gap: '0.35rem' }}>
                            <span className="admin-label">Titill</span>
                            <input value={title} onChange={(e) => setTitle(e.target.value)} style={inputStyle} />
                        </label>

                        <label style={{ display: 'grid', gap: '0.35rem' }}>
                            <span className="admin-label">
                                Texti — auð lína á milli málsgreina ({paragraphs().length} málsgreinar)
                            </span>
                            <textarea
                                value={text}
                                onChange={(e) => setText(e.target.value)}
                                rows={26}
                                spellCheck
                                lang="is"
                                style={{
                                    ...inputStyle,
                                    resize: 'vertical',
                                    fontFamily: 'var(--font-serif, Georgia, serif)',
                                    fontSize: '1.02rem',
                                    lineHeight: 1.75,
                                }}
                            />
                        </label>

                        <label style={{ display: 'grid', gap: '0.35rem' }}>
                            <span className="admin-label">Athugasemd yfirlesara (valkvætt, birtist ekki)</span>
                            <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="t.d. lagaði ritningarstaði" style={inputStyle} />
                        </label>

                        <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center', flexWrap: 'wrap' }}>
                            <button onClick={() => save()} disabled={saving} className="admin-btn admin-btn-secondary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                                <Save size={15} /> {saving ? 'Vista…' : 'Vista'}
                            </button>
                            {!item.reviewed ? (
                                <button onClick={() => save({ reviewed: true }, 'Merkt yfirlesin.')} disabled={saving} className="admin-btn admin-btn-primary">
                                    Vista og merkja yfirlesna
                                </button>
                            ) : item.status === 'draft' ? (
                                <button onClick={() => save({ status: 'published' }, 'Birt.')} disabled={saving} className="admin-btn admin-btn-primary">
                                    Vista og birta
                                </button>
                            ) : (
                                <button onClick={() => save({ status: 'draft' }, 'Tekin úr birtingu.')} disabled={saving} className="admin-btn admin-btn-secondary">
                                    Taka úr birtingu
                                </button>
                            )}
                            {notice && <span className="admin-body" style={{ fontSize: '0.85rem' }}>{notice}</span>}
                        </div>
                    </div>

                    {item.scripture_refs.length > 0 && (
                        <div className="admin-card">
                            <h3 className="admin-h3" style={{ marginBottom: '0.6rem' }}>Ritningarstaðir í frumtexta</h3>
                            <p className="admin-body" style={{ fontSize: '0.88rem', lineHeight: 1.7, margin: 0, opacity: 0.85 }}>
                                {item.scripture_refs.join(' · ')}
                            </p>
                        </div>
                    )}
                </>
            )}

            {isLoading && !item && <div className="admin-card"><p className="admin-body" style={{ margin: 0 }}>Sæki…</p></div>}
        </AdminLayout>
    );
}

const inputStyle: React.CSSProperties = {
    padding: '0.6rem 0.75rem',
    borderRadius: '8px',
    border: '1px solid var(--admin-border, rgba(255,255,255,0.12))',
    background: 'var(--admin-bg, #14120F)',
    color: 'var(--admin-text, #fff)',
    fontSize: '0.95rem',
    width: '100%',
};
