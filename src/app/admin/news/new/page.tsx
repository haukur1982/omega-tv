'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save, Send, AlertCircle, Loader2 } from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';
import { supabase } from '@/lib/supabase';

/**
 * /admin/news/new — create a news item.
 *
 * Form layout matches the editorial practice we want every news entry
 * to follow:
 *   1. Source first (URL + name) — required, can't save without
 *   2. Title + summary (the feed card content)
 *   3. Body — the 2-3 paragraph Icelandic translation/summary
 *   4. Optional: editor's note for Icelandic context, region, category, image
 *
 * Two save buttons: Vista drög (saves with is_published=false) and
 * Vista og birta (saves with is_published=true). Same pattern as
 * /admin/drafts/[id] for sermons.
 */

const CATEGORY_OPTIONS = [
    { value: '', label: '— enginn flokkur —' },
    { value: 'persecution', label: 'Ofsóknir' },
    { value: 'kingdom-growth', label: 'Vöxtur ríkisins' },
    { value: 'missions', label: 'Trúboð' },
    { value: 'israel', label: 'Ísrael' },
    { value: 'general', label: 'Almennt' },
];

function slugify(text: string): string {
    return text
        .toLowerCase()
        .normalize('NFD').replace(/\p{Diacritic}/gu, '')
        .replace(/[áä]/g, 'a').replace(/[éë]/g, 'e').replace(/[íï]/g, 'i')
        .replace(/[óöø]/g, 'o').replace(/[úü]/g, 'u').replace(/[ý]/g, 'y')
        .replace(/[þ]/g, 'th').replace(/[æ]/g, 'ae').replace(/[ð]/g, 'd')
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '')
        .slice(0, 80);
}

async function authedFetch(input: string, init: RequestInit = {}) {
    const { data: { session } } = await supabase.auth.getSession();
    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...(init.headers as Record<string, string> | undefined),
        ...(session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {}),
    };
    return fetch(input, { ...init, headers });
}

export default function NewNewsPage() {
    const router = useRouter();

    const [sourceUrl, setSourceUrl] = useState('');
    const [sourceName, setSourceName] = useState('');
    const [sourcePublishedAt, setSourcePublishedAt] = useState('');

    const [title, setTitle] = useState('');
    const [slug, setSlug] = useState('');
    const [slugDirty, setSlugDirty] = useState(false);
    const [summary, setSummary] = useState('');
    const [body, setBody] = useState('');

    const [region, setRegion] = useState('');
    const [category, setCategory] = useState('');
    const [imageUrl, setImageUrl] = useState('');
    const [editorNote, setEditorNote] = useState('');

    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleTitle = (val: string) => {
        setTitle(val);
        if (!slugDirty) setSlug(slugify(val));
    };

    const submit = async (publish: boolean) => {
        if (!sourceUrl || !sourceName) {
            setError('Heimild vantar — bæði nafn og hlekkur eru nauðsynleg.');
            return;
        }
        if (!title || !summary || !slug) {
            setError('Titill, slóð og útdráttur vantar.');
            return;
        }
        setSaving(true);
        setError(null);
        const res = await authedFetch('/api/admin/news', {
            method: 'POST',
            body: JSON.stringify({
                slug,
                title,
                summary,
                body: body || null,
                sourceUrl,
                sourceName,
                sourcePublishedAt: sourcePublishedAt
                    ? new Date(sourcePublishedAt).toISOString()
                    : null,
                region: region || null,
                category: category || null,
                imageUrl: imageUrl || null,
                editorNote: editorNote || null,
                isPublished: publish,
            }),
        });
        if (!res.ok) {
            const data = await res.json().catch(() => ({}));
            setError(data.error ?? 'Tókst ekki að vista frétt.');
            setSaving(false);
            return;
        }
        setSaving(false);
        router.push('/admin/news');
    };

    return (
        <AdminLayout>
            <div className="max-w-3xl mx-auto">
                <Link href="/admin/news" className="inline-flex items-center gap-1 text-sm text-[var(--admin-text-muted)] mb-3">
                    <ArrowLeft size={14} /> Til baka
                </Link>
                <h1 className="admin-h1 mb-2">Ný frétt</h1>
                <p className="admin-body mb-6">
                    Heimild fyrst — án hennar getur ekkert verið vistað. Síðan titill, útdráttur, og 2–3 efnisgreinar á íslensku.
                </p>

                {error && (
                    <div
                        className="mb-4"
                        style={{
                            display: 'flex', alignItems: 'center', gap: '10px',
                            padding: '12px 16px',
                            background: 'rgba(229,85,85,0.12)',
                            border: '1px solid rgba(229,85,85,0.4)',
                            borderRadius: '6px',
                            color: '#ff8585',
                            fontSize: '0.88rem',
                        }}
                    >
                        <AlertCircle size={16} /> {error}
                    </div>
                )}

                <form
                    onSubmit={(e) => { e.preventDefault(); submit(false); }}
                    className="flex flex-col gap-6"
                >
                    {/* 1. Heimild — required */}
                    <fieldset className="admin-card">
                        <legend className="admin-h3 mb-3">Heimild (nauðsynleg)</legend>
                        <div className="space-y-3">
                            <div>
                                <label className="block text-sm font-medium text-[var(--admin-text-secondary)] mb-1">
                                    Slóð á upprunalega grein
                                </label>
                                <input
                                    required
                                    type="url"
                                    value={sourceUrl}
                                    onChange={(e) => setSourceUrl(e.target.value)}
                                    placeholder="https://www1.cbn.com/cbnnews/..."
                                    className="admin-input"
                                />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-sm font-medium text-[var(--admin-text-secondary)] mb-1">
                                        Heimildarnafn
                                    </label>
                                    <input
                                        required
                                        type="text"
                                        value={sourceName}
                                        onChange={(e) => setSourceName(e.target.value)}
                                        placeholder="t.d. CBN, Open Doors, ICC"
                                        className="admin-input"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-[var(--admin-text-secondary)] mb-1">
                                        Birt dagsetning hjá heimild (valfr.)
                                    </label>
                                    <input
                                        type="date"
                                        value={sourcePublishedAt}
                                        onChange={(e) => setSourcePublishedAt(e.target.value)}
                                        className="admin-input"
                                    />
                                </div>
                            </div>
                        </div>
                    </fieldset>

                    {/* 2. Titill + útdráttur + slug */}
                    <fieldset className="admin-card">
                        <legend className="admin-h3 mb-3">Titill og útdráttur</legend>
                        <div className="space-y-3">
                            <div>
                                <label className="block text-sm font-medium text-[var(--admin-text-secondary)] mb-1">
                                    Titill á íslensku
                                </label>
                                <input
                                    required
                                    type="text"
                                    value={title}
                                    onChange={(e) => handleTitle(e.target.value)}
                                    className="admin-input"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-[var(--admin-text-secondary)] mb-1">
                                    Slóð (slug)
                                </label>
                                <input
                                    required
                                    type="text"
                                    value={slug}
                                    onChange={(e) => { setSlug(e.target.value); setSlugDirty(true); }}
                                    className="admin-input font-mono text-sm"
                                />
                                <p className="text-xs text-[var(--admin-text-muted)] mt-1">
                                    /frettir/{slug || '...'}
                                </p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-[var(--admin-text-secondary)] mb-1">
                                    Útdráttur (2–3 setningar fyrir feeð)
                                </label>
                                <textarea
                                    required
                                    value={summary}
                                    onChange={(e) => setSummary(e.target.value)}
                                    rows={3}
                                    className="admin-input"
                                    placeholder="Það sem birtist sem forsýning á /frettir kortunum."
                                />
                            </div>
                        </div>
                    </fieldset>

                    {/* 3. Body — full Icelandic */}
                    <fieldset className="admin-card">
                        <legend className="admin-h3 mb-3">Innihald</legend>
                        <div className="space-y-3">
                            <div>
                                <label className="block text-sm font-medium text-[var(--admin-text-secondary)] mb-1">
                                    Íslensk samantekt (2–6 efnisgreinar)
                                </label>
                                <textarea
                                    value={body}
                                    onChange={(e) => setBody(e.target.value)}
                                    rows={10}
                                    className="admin-input"
                                    placeholder={`Skrifaðu samantektina á þínum eigin orðum. Stuttur útdráttur, ekki full þýðing.\n\nBeindu lesendum til upprunalegu greinarinnar fyrir allan textann.`}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-[var(--admin-text-secondary)] mb-1">
                                    Ritstjórnarlína (valfrjáls — íslensk samhengi fyrir lesendur)
                                </label>
                                <textarea
                                    value={editorNote}
                                    onChange={(e) => setEditorNote(e.target.value)}
                                    rows={2}
                                    className="admin-input"
                                    placeholder="t.d. „Þetta minnir okkur á að biðja fyrir bræðrum okkar í [land]."
                                />
                            </div>
                        </div>
                    </fieldset>

                    {/* 4. Metadata */}
                    <fieldset className="admin-card">
                        <legend className="admin-h3 mb-3">Flokkun (valfrjáls)</legend>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div>
                                <label className="block text-sm font-medium text-[var(--admin-text-secondary)] mb-1">
                                    Flokkur
                                </label>
                                <select
                                    value={category}
                                    onChange={(e) => setCategory(e.target.value)}
                                    className="admin-input"
                                >
                                    {CATEGORY_OPTIONS.map((c) => (
                                        <option key={c.value} value={c.value}>{c.label}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-[var(--admin-text-secondary)] mb-1">
                                    Svæði (land/heimsálfa)
                                </label>
                                <input
                                    type="text"
                                    value={region}
                                    onChange={(e) => setRegion(e.target.value)}
                                    placeholder="t.d. Íran, Nígería, Mið-Austurlönd"
                                    className="admin-input"
                                />
                            </div>
                        </div>
                        <div className="mt-3">
                            <label className="block text-sm font-medium text-[var(--admin-text-secondary)] mb-1">
                                Mynd-URL (valfrjálst)
                            </label>
                            <input
                                type="url"
                                value={imageUrl}
                                onChange={(e) => setImageUrl(e.target.value)}
                                placeholder="https://images.unsplash.com/…"
                                className="admin-input"
                            />
                        </div>
                    </fieldset>

                    {/* Actions */}
                    <div className="flex gap-3 justify-end">
                        <button
                            type="button"
                            onClick={() => submit(false)}
                            disabled={saving}
                            className="admin-btn admin-btn-secondary"
                        >
                            {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                            Vista drög
                        </button>
                        <button
                            type="button"
                            onClick={() => submit(true)}
                            disabled={saving}
                            className="admin-btn admin-btn-primary"
                        >
                            {saving ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                            Vista og birta
                        </button>
                    </div>
                </form>
            </div>
        </AdminLayout>
    );
}
