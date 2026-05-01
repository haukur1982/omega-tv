'use client';

import { useEffect, useState, useCallback } from 'react';
import { Heart, Plus, Trash2, Eye, EyeOff, Loader2 } from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';
import type { PrayerCampaign } from '@/lib/prayer-db';
import { supabase } from '@/lib/supabase';

/**
 * /admin/campaigns — Bænaherferðir admin.
 *
 * Prayer campaigns are time-bounded prayer focuses (e.g. "Bæn fyrir
 * Íslandi — apríl 2026"). They show up as a banner on /baenatorg
 * while is_active=true. Up to today the only way to manage them was
 * direct SQL — this page closes that gap.
 *
 * Minimal CRUD: list, create, toggle active, delete.
 */

async function authedFetch(input: string, init: RequestInit = {}) {
    const { data: { session } } = await supabase.auth.getSession();
    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...(init.headers as Record<string, string> | undefined),
        ...(session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {}),
    };
    return fetch(input, { ...init, headers });
}

export default function AdminCampaignsPage() {
    const [campaigns, setCampaigns] = useState<PrayerCampaign[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [imageUrl, setImageUrl] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    const load = useCallback(async () => {
        setIsLoading(true);
        const res = await authedFetch('/api/admin/campaigns');
        if (res.ok) {
            const data = await res.json();
            setCampaigns(data as PrayerCampaign[]);
        }
        setIsLoading(false);
    }, []);

    useEffect(() => { load(); }, [load]);

    const resetForm = () => {
        setTitle(''); setDescription(''); setImageUrl(''); setStartDate(''); setEndDate('');
        setFormError(null);
    };

    const submit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        setFormError(null);
        const res = await authedFetch('/api/admin/campaigns', {
            method: 'POST',
            body: JSON.stringify({
                title,
                description: description || undefined,
                imageUrl: imageUrl || undefined,
                startDate: startDate || undefined,
                endDate,
            }),
        });
        if (!res.ok) {
            const data = await res.json().catch(() => ({ error: 'Villa' }));
            setFormError(data.error ?? 'Tókst ekki að búa til herferð.');
            setSubmitting(false);
            return;
        }
        resetForm();
        setShowForm(false);
        setSubmitting(false);
        load();
    };

    const toggle = async (id: string, isActive: boolean) => {
        setCampaigns(prev => prev.map(c => c.id === id ? { ...c, isActive: !isActive } : c));
        const res = await authedFetch('/api/admin/campaigns', {
            method: 'PATCH',
            body: JSON.stringify({ id, is_active: !isActive }),
        });
        if (!res.ok) load();
    };

    const remove = async (id: string) => {
        if (!confirm('Eyða þessari bænaherferð?')) return;
        const res = await authedFetch('/api/admin/campaigns', {
            method: 'DELETE',
            body: JSON.stringify({ id }),
        });
        if (res.ok) setCampaigns(prev => prev.filter(c => c.id !== id));
        else load();
    };

    return (
        <AdminLayout>
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="admin-h1">Bænaherferðir</h1>
                    <p className="admin-body mt-1">Tímabundnar bænasérfocus — birtast sem borði á /baenatorg þegar virkar.</p>
                </div>
                <button
                    type="button"
                    onClick={() => setShowForm(!showForm)}
                    className="admin-btn admin-btn-primary"
                >
                    <Plus size={16} />
                    Ný herferð
                </button>
            </div>

            {showForm && (
                <form onSubmit={submit} className="admin-card mb-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-[var(--admin-text-secondary)] mb-2">Titill</label>
                        <input required type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="admin-input" placeholder="t.d. Bæn fyrir Íslandi — apríl 2026" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-[var(--admin-text-secondary)] mb-2">Lýsing (valfrjáls)</label>
                        <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className="admin-input" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-[var(--admin-text-secondary)] mb-2">Mynd-URL (valfrjálst)</label>
                        <input type="text" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} className="admin-input" placeholder="https://…" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-[var(--admin-text-secondary)] mb-2">Upphafsdagur (valfrjálst — sjálfgildi: í dag)</label>
                            <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="admin-input" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-[var(--admin-text-secondary)] mb-2">Lokadagur</label>
                            <input required type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="admin-input" />
                        </div>
                    </div>
                    {formError && <p className="text-sm text-red-400">{formError}</p>}
                    <div className="flex gap-2">
                        <button type="submit" disabled={submitting} className="admin-btn admin-btn-primary">
                            {submitting ? <Loader2 size={14} className="animate-spin" /> : null}
                            Vista
                        </button>
                        <button type="button" onClick={() => { setShowForm(false); resetForm(); }} className="admin-btn admin-btn-secondary">
                            Hætta við
                        </button>
                    </div>
                </form>
            )}

            {isLoading ? (
                <div className="admin-card admin-empty"><Loader2 className="animate-spin" /></div>
            ) : campaigns.length === 0 ? (
                <div className="admin-card admin-empty">
                    <Heart className="admin-empty-icon" />
                    <p className="admin-body">Engar herferðir.</p>
                </div>
            ) : (
                <ul className="space-y-3 list-none p-0">
                    {campaigns.map((c) => (
                        <li key={c.id} className="admin-card flex items-center justify-between gap-4">
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider ${c.isActive ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-gray-500/10 text-gray-400 border border-gray-500/20'}`}>
                                        {c.isActive ? 'Virk' : 'Óvirk'}
                                    </span>
                                    <h3 className="font-bold text-[var(--admin-text)]">{c.title}</h3>
                                </div>
                                {c.description && (
                                    <p className="text-sm text-[var(--admin-text-secondary)] mb-1">{c.description}</p>
                                )}
                                <p className="text-xs text-[var(--admin-text-muted)]">
                                    {new Date(c.startDate).toLocaleDateString('is-IS')}
                                    {' → '}
                                    {new Date(c.endDate).toLocaleDateString('is-IS')}
                                    {typeof c.prayCount === 'number' && c.prayCount > 0 && (
                                        <span> · {c.prayCount.toLocaleString('is-IS')} bænir</span>
                                    )}
                                </p>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    type="button"
                                    onClick={() => toggle(c.id, c.isActive)}
                                    className="admin-btn admin-btn-secondary"
                                    title={c.isActive ? 'Slökkva' : 'Kveikja'}
                                >
                                    {c.isActive ? <EyeOff size={14} /> : <Eye size={14} />}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => remove(c.id)}
                                    className="admin-btn admin-btn-danger"
                                    title="Eyða"
                                >
                                    <Trash2 size={14} />
                                </button>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </AdminLayout>
    );
}
