'use client';

import { useEffect, useState } from 'react';
import { RefreshCw, Trash2, Sunrise } from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';
import { authedFetch } from '@/lib/admin-fetch';
import type { FeaturedPrayerRow } from '@/lib/featured-prayer-db';

const todayISO = () => new Date().toISOString().slice(0, 10);

function formatIs(ymd: string): string {
    try {
        return new Date(`${ymd}T12:00:00Z`).toLocaleDateString('is-IS', { weekday: 'short', day: 'numeric', month: 'long' });
    } catch { return ymd; }
}

export default function AdminBaenDagsinsPage() {
    const [prayers, setPrayers] = useState<FeaturedPrayerRow[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [featureDate, setFeatureDate] = useState(todayISO());
    const [body, setBody] = useState('');
    const [scripture, setScripture] = useState('');
    const [saving, setSaving] = useState(false);
    const [notice, setNotice] = useState<string | null>(null);

    const load = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const res = await authedFetch('/api/admin/featured-prayers');
            if (!res.ok) throw new Error(`Server svaraði ${res.status}`);
            const data = await res.json();
            setPrayers(data.prayers ?? []);
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Tókst ekki að sækja bænir');
        }
        setIsLoading(false);
    };

    useEffect(() => { load(); }, []);

    const save = async () => {
        if (!featureDate || !body.trim()) { setNotice('Dagsetning og bæn eru nauðsynleg.'); return; }
        setSaving(true);
        setNotice(null);
        try {
            const res = await authedFetch('/api/admin/featured-prayers', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ featureDate, body: body.trim(), scripture: scripture.trim() || undefined }),
            });
            if (!res.ok) { const d = await res.json().catch(() => ({})); throw new Error(d.error || `Villa ${res.status}`); }
            setBody('');
            setScripture('');
            setNotice('Bæn vistuð.');
            await load();
        } catch (e) {
            setNotice(e instanceof Error ? e.message : 'Villa kom upp.');
        }
        setSaving(false);
    };

    const remove = async (id: string) => {
        try {
            const res = await authedFetch(`/api/admin/featured-prayers?id=${encodeURIComponent(id)}`, { method: 'DELETE' });
            if (res.ok) setPrayers((prev) => prev.filter((p) => p.id !== id));
        } catch { /* keep the row; a failed delete shouldn't blank the list */ }
    };

    const today = todayISO();

    return (
        <AdminLayout>
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="admin-h1">Bæn dagsins</h1>
                    <p className="admin-body mt-1">Ein bæn á dag, sýnd á forsíðunni. Bættu við fram í tímann.</p>
                </div>
                <button onClick={load} className="admin-btn admin-btn-secondary admin-btn-icon" disabled={isLoading}>
                    <RefreshCw size={18} className={isLoading ? 'admin-spinner' : ''} />
                </button>
            </div>

            {/* ── Add / replace a day ──────────────────────────────────── */}
            <div className="admin-card mb-6" style={{ display: 'grid', gap: '1rem' }}>
                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                    <label style={{ display: 'grid', gap: '0.35rem' }}>
                        <span className="admin-label">Dagsetning</span>
                        <input type="date" value={featureDate} min={today} onChange={(e) => setFeatureDate(e.target.value)} style={inputStyle} />
                    </label>
                    <label style={{ display: 'grid', gap: '0.35rem', flex: 1, minWidth: '200px' }}>
                        <span className="admin-label">Ritningarstaður (valkvætt)</span>
                        <input type="text" value={scripture} onChange={(e) => setScripture(e.target.value)} placeholder="t.d. Sálmur 23:1" style={inputStyle} />
                    </label>
                </div>
                <label style={{ display: 'grid', gap: '0.35rem' }}>
                    <span className="admin-label">Bænin</span>
                    <textarea value={body} onChange={(e) => setBody(e.target.value)} rows={3} placeholder="Drottinn, ..." style={{ ...inputStyle, resize: 'vertical', fontFamily: 'var(--font-serif, serif)' }} />
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <button onClick={save} disabled={saving} className="admin-btn admin-btn-primary">
                        {saving ? 'Vista...' : 'Vista bæn'}
                    </button>
                    {notice && <span className="admin-body" style={{ fontSize: '0.85rem' }}>{notice}</span>}
                </div>
                <p className="admin-body" style={{ fontSize: '0.8rem', opacity: 0.7 }}>
                    Sama dagsetning og er fyrir? Hún yfirskrifast. Byrjunarsafn (7 bænir) er nú þegar inni og bíður yfirferðar þinnar.
                </p>
            </div>

            {/* ── Upcoming list ────────────────────────────────────────── */}
            {error && (
                <div className="admin-card mb-6" style={{ borderColor: 'var(--admin-error)' }}>
                    <p className="admin-body" style={{ color: 'var(--admin-error)' }}>{error}</p>
                </div>
            )}

            <div className="admin-card">
                <div className="flex items-center gap-2 mb-4">
                    <Sunrise size={16} className="text-[var(--admin-accent)]" />
                    <h3 className="admin-h3">Framundan</h3>
                </div>
                {prayers.length === 0 && !isLoading ? (
                    <p className="admin-body" style={{ opacity: 0.7 }}>Engar bænir framundan. Bættu við hér að ofan.</p>
                ) : (
                    <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'grid', gap: '0.75rem' }}>
                        {prayers.map((p) => (
                            <li key={p.id} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', padding: '0.85rem 1rem', borderRadius: '10px', background: 'var(--admin-bg)' }}>
                                <div style={{ minWidth: '120px' }}>
                                    <div style={{ fontWeight: 700, fontSize: '0.85rem' }}>
                                        {formatIs(p.feature_date)}
                                        {p.feature_date === today && <span style={{ marginLeft: '0.5rem', color: 'var(--admin-accent)' }}>· í dag</span>}
                                    </div>
                                    {p.scripture && <div className="admin-label" style={{ marginTop: '0.2rem' }}>{p.scripture}</div>}
                                </div>
                                <p className="admin-body" style={{ flex: 1, margin: 0, fontSize: '0.9rem' }}>{p.body}</p>
                                <button onClick={() => remove(p.id)} className="admin-btn admin-btn-icon admin-btn-secondary" aria-label="Eyða">
                                    <Trash2 size={15} />
                                </button>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
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
};
