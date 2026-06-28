'use client';

import { useEffect, useState } from 'react';
import { RefreshCw, Trash2, BookOpen } from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';
import { authedFetch } from '@/lib/admin-fetch';
import type { DailyWordRow } from '@/lib/daily-word-db';

const todayISO = () => new Date().toISOString().slice(0, 10);

function formatIs(ymd: string): string {
    try {
        return new Date(`${ymd}T12:00:00Z`).toLocaleDateString('is-IS', { weekday: 'short', day: 'numeric', month: 'long' });
    } catch { return ymd; }
}

export default function AdminOrdDagsinsPage() {
    const [words, setWords] = useState<DailyWordRow[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [featureDate, setFeatureDate] = useState(todayISO());
    const [reference, setReference] = useState('');
    const [verse, setVerse] = useState('');
    const [reflection, setReflection] = useState('');
    const [source, setSource] = useState('');
    const [saving, setSaving] = useState(false);
    const [notice, setNotice] = useState<string | null>(null);

    const load = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const res = await authedFetch('/api/admin/daily-words');
            if (!res.ok) throw new Error(`Server svaraði ${res.status}`);
            const data = await res.json();
            setWords(data.words ?? []);
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Tókst ekki að sækja orð');
        }
        setIsLoading(false);
    };

    useEffect(() => { load(); }, []);

    const save = async () => {
        if (!featureDate || !reference.trim() || !reflection.trim()) { setNotice('Dagsetning, ritningarstaður og orð eru nauðsynleg.'); return; }
        setSaving(true);
        setNotice(null);
        try {
            const res = await authedFetch('/api/admin/daily-words', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ featureDate, reference: reference.trim(), verse: verse.trim() || undefined, reflection: reflection.trim(), source: source.trim() || undefined }),
            });
            if (!res.ok) { const d = await res.json().catch(() => ({})); throw new Error(d.error || `Villa ${res.status}`); }
            setReference(''); setVerse(''); setReflection(''); setSource('');
            setNotice('Orð vistað.');
            await load();
        } catch (e) {
            setNotice(e instanceof Error ? e.message : 'Villa kom upp.');
        }
        setSaving(false);
    };

    const remove = async (id: string) => {
        try {
            const res = await authedFetch(`/api/admin/daily-words?id=${encodeURIComponent(id)}`, { method: 'DELETE' });
            if (res.ok) setWords((prev) => prev.filter((w) => w.id !== id));
        } catch { /* keep the row on a failed delete */ }
    };

    const today = todayISO();

    return (
        <AdminLayout>
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="admin-h1">Orð dagsins</h1>
                    <p className="admin-body mt-1">Ein ritning og stutt íhugun á dag, við hlið Bænar dagsins. Hlaðið fram í tímann.</p>
                </div>
                <button onClick={load} className="admin-btn admin-btn-secondary admin-btn-icon" disabled={isLoading}>
                    <RefreshCw size={18} className={isLoading ? 'admin-spinner' : ''} />
                </button>
            </div>

            <div className="admin-card mb-6" style={{ display: 'grid', gap: '1rem' }}>
                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                    <label style={{ display: 'grid', gap: '0.35rem' }}>
                        <span className="admin-label">Dagsetning</span>
                        <input type="date" value={featureDate} min={today} onChange={(e) => setFeatureDate(e.target.value)} style={inputStyle} />
                    </label>
                    <label style={{ display: 'grid', gap: '0.35rem', flex: 1, minWidth: '180px' }}>
                        <span className="admin-label">Ritningarstaður</span>
                        <input type="text" value={reference} onChange={(e) => setReference(e.target.value)} placeholder="t.d. Sálmur 46:11" style={inputStyle} />
                    </label>
                    <label style={{ display: 'grid', gap: '0.35rem', minWidth: '140px' }}>
                        <span className="admin-label">Heimild (valkvætt)</span>
                        <input type="text" value={source} onChange={(e) => setSource(e.target.value)} placeholder="Omega" style={inputStyle} />
                    </label>
                </div>
                <label style={{ display: 'grid', gap: '0.35rem' }}>
                    <span className="admin-label">Ritningin (valkvætt — úr þýðingu sem Omega hefur leyfi fyrir)</span>
                    <textarea value={verse} onChange={(e) => setVerse(e.target.value)} rows={2} placeholder="Texti versins..." style={{ ...inputStyle, resize: 'vertical', fontFamily: 'var(--font-serif, serif)' }} />
                </label>
                <label style={{ display: 'grid', gap: '0.35rem' }}>
                    <span className="admin-label">Íhugun (orð dagsins)</span>
                    <textarea value={reflection} onChange={(e) => setReflection(e.target.value)} rows={3} placeholder="Stutt íhugun..." style={{ ...inputStyle, resize: 'vertical', fontFamily: 'var(--font-serif, serif)' }} />
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <button onClick={save} disabled={saving} className="admin-btn admin-btn-primary">
                        {saving ? 'Vista...' : 'Vista orð'}
                    </button>
                    {notice && <span className="admin-body" style={{ fontSize: '0.85rem' }}>{notice}</span>}
                </div>
                <p className="admin-body" style={{ fontSize: '0.8rem', opacity: 0.7 }}>
                    Sama dagsetning og er fyrir? Hún yfirskrifast. 3 dæmi eru inni og bíða yfirferðar þinnar.
                </p>
            </div>

            {error && (
                <div className="admin-card mb-6" style={{ borderColor: 'var(--admin-error)' }}>
                    <p className="admin-body" style={{ color: 'var(--admin-error)' }}>{error}</p>
                </div>
            )}

            <div className="admin-card">
                <div className="flex items-center gap-2 mb-4">
                    <BookOpen size={16} className="text-[var(--admin-accent)]" />
                    <h3 className="admin-h3">Framundan</h3>
                </div>
                {words.length === 0 && !isLoading ? (
                    <p className="admin-body" style={{ opacity: 0.7 }}>Engin orð framundan. Bættu við hér að ofan.</p>
                ) : (
                    <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'grid', gap: '0.75rem' }}>
                        {words.map((w) => (
                            <li key={w.id} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', padding: '0.85rem 1rem', borderRadius: '10px', background: 'var(--admin-bg)' }}>
                                <div style={{ minWidth: '130px' }}>
                                    <div style={{ fontWeight: 700, fontSize: '0.85rem' }}>
                                        {formatIs(w.feature_date)}
                                        {w.feature_date === today && <span style={{ marginLeft: '0.5rem', color: 'var(--admin-accent)' }}>· í dag</span>}
                                    </div>
                                    <div className="admin-label" style={{ marginTop: '0.2rem' }}>{w.reference}</div>
                                </div>
                                <p className="admin-body" style={{ flex: 1, margin: 0, fontSize: '0.9rem' }}>{w.reflection}</p>
                                <button onClick={() => remove(w.id)} className="admin-btn admin-btn-icon admin-btn-secondary" aria-label="Eyða">
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
    width: '100%',
};
