'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Trash2, Plus, BookMarked } from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';
import { authedFetch } from '@/lib/admin-fetch';

/**
 * /admin/hugleidingar/hugtok — locked terminology.
 *
 * Decide once how a theological term reads in Icelandic; the review desk then
 * flags any paragraph whose English source uses that term without the agreed
 * rendering. This is the consistency pass a person cannot do from memory
 * across 62 pieces — and it is what keeps a month of devotionals sounding
 * like one voice rather than sixty-two.
 */

interface Term {
    id: string;
    term_en: string;
    term_is: string;
    variants_is: string[];
    note: string | null;
    active: boolean;
}

export default function GlossaryPage() {
    const router = useRouter();
    const [terms, setTerms] = useState<Term[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [notice, setNotice] = useState<string | null>(null);

    const [en, setEn] = useState('');
    const [is, setIs] = useState('');
    const [variants, setVariants] = useState('');
    const [note, setNote] = useState('');
    const [saving, setSaving] = useState(false);

    const load = useCallback(async () => {
        setIsLoading(true);
        try {
            const res = await authedFetch('/api/admin/devotionals/glossary?all=1');
            if (!res.ok) throw new Error(`Server svaraði ${res.status}`);
            const d = await res.json();
            setTerms(d.terms ?? []);
        } catch (e) {
            setNotice(e instanceof Error ? e.message : 'Tókst ekki að sækja hugtök');
        }
        setIsLoading(false);
    }, []);

    useEffect(() => { load(); }, [load]);

    const add = async () => {
        if (!en.trim() || !is.trim()) { setNotice('Bæði enska og íslenska hugtakið þurfa að fylgja.'); return; }
        setSaving(true);
        setNotice(null);
        try {
            const res = await authedFetch('/api/admin/devotionals/glossary', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    term_en: en.trim(),
                    term_is: is.trim(),
                    variants_is: variants.split(',').map((v) => v.trim()).filter(Boolean),
                    note: note.trim() || null,
                }),
            });
            if (!res.ok) { const d = await res.json().catch(() => ({})); throw new Error(d.error || `Villa ${res.status}`); }
            setEn(''); setIs(''); setVariants(''); setNote('');
            setNotice('Hugtak vistað.');
            await load();
        } catch (e) {
            setNotice(e instanceof Error ? e.message : 'Villa kom upp.');
        }
        setSaving(false);
    };

    const remove = async (id: string) => {
        try {
            const res = await authedFetch(`/api/admin/devotionals/glossary?id=${encodeURIComponent(id)}`, { method: 'DELETE' });
            if (res.ok) setTerms((prev) => prev.filter((t) => t.id !== id));
        } catch { /* leave the row in place on failure */ }
    };

    return (
        <AdminLayout>
            <button onClick={() => router.push('/admin/hugleidingar')} className="admin-btn admin-btn-secondary"
                style={{ marginBottom: '1.25rem', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}>
                <ArrowLeft size={15} /> Til baka
            </button>

            <div className="mb-6">
                <h1 className="admin-h1">Hugtakaskrá</h1>
                <p className="admin-body mt-1">
                    Ákveddu einu sinni hvernig hvert guðfræðilegt hugtak á að hljóma á íslensku.
                    Yfirlesturinn merkir svo hverja málsgrein þar sem frumtextinn notar hugtakið
                    en þýðingin fylgir ekki samþykktu orðalagi.
                </p>
            </div>

            <div className="admin-card mb-6" style={{ display: 'grid', gap: '1rem' }}>
                <div className="flex items-center gap-2">
                    <Plus size={16} className="text-[var(--admin-accent)]" />
                    <h3 className="admin-h3">Nýtt hugtak</h3>
                </div>
                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                    <label style={{ display: 'grid', gap: '0.35rem', flex: 1, minWidth: '170px' }}>
                        <span className="admin-label">Enska</span>
                        <input value={en} onChange={(e) => setEn(e.target.value)} placeholder="anointing" style={inputStyle} />
                    </label>
                    <label style={{ display: 'grid', gap: '0.35rem', flex: 1, minWidth: '170px' }}>
                        <span className="admin-label">Íslenska</span>
                        <input value={is} onChange={(e) => setIs(e.target.value)} placeholder="smurning" style={inputStyle} />
                    </label>
                </div>
                <label style={{ display: 'grid', gap: '0.35rem' }}>
                    <span className="admin-label">Önnur samþykkt orð (aðgreind með kommu)</span>
                    <input value={variants} onChange={(e) => setVariants(e.target.value)} placeholder="smurningin, smurningu" style={inputStyle} />
                </label>
                <label style={{ display: 'grid', gap: '0.35rem' }}>
                    <span className="admin-label">Athugasemd (valkvætt)</span>
                    <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="t.d. aldrei „olíusmurning“ í þessu samhengi" style={inputStyle} />
                </label>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <button onClick={add} disabled={saving} className="admin-btn admin-btn-primary">
                        {saving ? 'Vista…' : 'Bæta við'}
                    </button>
                    {notice && <span className="admin-body" style={{ fontSize: '0.85rem' }}>{notice}</span>}
                </div>
            </div>

            <div className="admin-card">
                <div className="flex items-center gap-2 mb-4">
                    <BookMarked size={16} className="text-[var(--admin-accent)]" />
                    <h3 className="admin-h3">{terms.length} hugtök</h3>
                </div>
                {terms.length === 0 && !isLoading ? (
                    <p className="admin-body" style={{ opacity: 0.7, margin: 0 }}>
                        Engin hugtök skráð enn. Bættu við því fyrsta þegar þú rekst á orð sem má
                        ekki þýðast á fleiri en einn veg.
                    </p>
                ) : (
                    <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'grid', gap: '0.5rem' }}>
                        {terms.map((t) => (
                            <li key={t.id} style={{ display: 'flex', gap: '1rem', alignItems: 'center', padding: '0.7rem 1rem', borderRadius: '10px', background: 'var(--admin-bg)' }}>
                                <span className="admin-body" style={{ minWidth: '150px', fontSize: '0.92rem', opacity: 0.75, fontStyle: 'italic' }}>
                                    {t.term_en}
                                </span>
                                <span style={{ minWidth: '150px', fontWeight: 600, fontSize: '0.95rem' }}>{t.term_is}</span>
                                <span className="admin-body" style={{ flex: 1, fontSize: '0.82rem', opacity: 0.7 }}>
                                    {t.variants_is.length > 0 && `einnig: ${t.variants_is.join(', ')}`}
                                    {t.note && `${t.variants_is.length > 0 ? ' · ' : ''}${t.note}`}
                                </span>
                                <button onClick={() => remove(t.id)} className="admin-btn admin-btn-icon admin-btn-secondary" aria-label="Eyða hugtaki">
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
