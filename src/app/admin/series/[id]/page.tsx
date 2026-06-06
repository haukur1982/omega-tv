'use client';

import { useEffect, useState } from 'react';
import { use } from 'react';
import { ArrowLeft, Save, ExternalLink, AlertCircle, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import AdminLayout from '@/components/admin/AdminLayout';
import { supabase } from '@/lib/supabase';
import { authedFetch } from '@/lib/admin-fetch';

interface SeriesRow {
    id: string;
    title: string;
    slug: string;
    host: string | null;
    description: string | null;
    category: string | null;
    poster_vertical: string | null;
    poster_horizontal: string | null;
}

export default function EditSeriesPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [saved, setSaved] = useState(false);

    const [title, setTitle] = useState('');
    const [slug, setSlug] = useState('');
    const [host, setHost] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState('');
    const [posterVertical, setPosterVertical] = useState('');
    const [posterHorizontal, setPosterHorizontal] = useState('');

    useEffect(() => {
        (async () => {
            const { data, error: e } = await supabase
                .from('series')
                .select('id, title, slug, host, description, category, poster_vertical, poster_horizontal')
                .eq('id', id)
                .single();
            if (e || !data) {
                setError('Þáttaröð fannst ekki.');
            } else {
                const s = data as SeriesRow;
                setTitle(s.title ?? '');
                setSlug(s.slug ?? '');
                setHost(s.host ?? '');
                setDescription(s.description ?? '');
                setCategory(s.category ?? '');
                setPosterVertical(s.poster_vertical ?? '');
                setPosterHorizontal(s.poster_horizontal ?? '');
            }
            setLoading(false);
        })();
    }, [id]);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setError('');
        setSaved(false);
        try {
            const res = await authedFetch(`/api/admin/series/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: title.trim(),
                    slug: slug.trim(),
                    host: host.trim() || null,
                    description: description.trim() || null,
                    category: category || null,
                    poster_vertical: posterVertical.trim() || null,
                    poster_horizontal: posterHorizontal.trim() || null,
                }),
            });
            const data = await res.json().catch(() => ({}));
            if (!res.ok) {
                setError(data.error ?? 'Tókst ekki að vista.');
            } else {
                setSaved(true);
                setTimeout(() => setSaved(false), 2500);
            }
        } catch {
            setError('Netvilla við vistun.');
        }
        setSaving(false);
    };

    return (
        <AdminLayout>
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                    <button onClick={() => router.push('/admin/series')} className="p-2 hover:bg-[var(--admin-surface-hover)] rounded-full transition-colors">
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <h1 className="admin-h1">Breyta þáttaröð</h1>
                        <p className="admin-body mt-1">{title || '…'}</p>
                    </div>
                </div>
                {slug && (
                    <Link href={`/sermons/show/${slug}`} target="_blank" className="admin-btn admin-btn-secondary">
                        <ExternalLink size={16} /><span>Skoða í beinni</span>
                    </Link>
                )}
            </div>

            {error && (
                <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-4 rounded-lg mb-6 flex items-center gap-3">
                    <AlertCircle size={20} /><span>{error}</span>
                </div>
            )}

            {loading ? (
                <div className="admin-card animate-pulse h-64" />
            ) : (
                <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left: fields */}
                    <div className="lg:col-span-2 admin-card space-y-5">
                        <div>
                            <label className="block text-sm font-medium text-[var(--admin-text-secondary)] mb-2">Titill</label>
                            <input className="admin-input" value={title} onChange={(e) => setTitle(e.target.value)} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-[var(--admin-text-secondary)] mb-2">Vefslóð (slug)</label>
                            <input className="admin-input" value={slug} onChange={(e) => setSlug(e.target.value)} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-[var(--admin-text-secondary)] mb-2">Kynnir / Stjórnandi</label>
                            <input className="admin-input" value={host} onChange={(e) => setHost(e.target.value)} placeholder="t.d. Eiríkur Sigurbjörnsson" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-[var(--admin-text-secondary)] mb-2">Lýsing</label>
                            <textarea className="admin-input" rows={4} value={description} onChange={(e) => setDescription(e.target.value)} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-[var(--admin-text-secondary)] mb-2">Flokkur (Hilla á /sermons)</label>
                            <select className="admin-input" value={category} onChange={(e) => setCategory(e.target.value)}>
                                <option value="">— án flokks (birtist undir „Annað efni“) —</option>
                                <option value="omega-produced">Útsendingar Omega</option>
                                <option value="iceland-partners">Söfnuðir á Íslandi</option>
                                <option value="international">Frá útlöndum</option>
                                <option value="documentaries">Heimildarmyndir</option>
                                <option value="music">Lofgjörð & tónleikar</option>
                                <option value="kids">Barnaefni</option>
                                <option value="israel">Ísrael</option>
                            </select>
                        </div>
                    </div>

                    {/* Right: posters */}
                    <div className="space-y-6">
                        <div className="admin-card space-y-4">
                            <h3 className="admin-h3 mb-1">Plakat (2:3)</h3>
                            {posterVertical && (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={posterVertical} alt="" className="w-full rounded-lg border border-[var(--admin-border)]" />
                            )}
                            <input className="admin-input" value={posterVertical} onChange={(e) => setPosterVertical(e.target.value)} placeholder="Slóð að plakati (https://…)" />
                            <h3 className="admin-h3 mb-1 pt-2">Forsíðumynd (4:5/16:9)</h3>
                            <input className="admin-input" value={posterHorizontal} onChange={(e) => setPosterHorizontal(e.target.value)} placeholder="Slóð að forsíðumynd (https://…)" />
                            <p className="text-xs text-[var(--admin-text-muted)]">Límdu inn slóð að mynd — t.d. úr „Hetjuspjald“-tólinu í Innhólfi.</p>
                        </div>

                        <button type="submit" disabled={saving} className="admin-btn admin-btn-primary w-full justify-center">
                            {saved ? <CheckCircle size={18} /> : <Save size={18} />}
                            <span>{saving ? 'Vista…' : saved ? 'Vistað' : 'Vista breytingar'}</span>
                        </button>
                    </div>
                </form>
            )}
        </AdminLayout>
    );
}
