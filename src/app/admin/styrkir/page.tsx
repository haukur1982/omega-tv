'use client';

import { useCallback, useEffect, useState } from 'react';
import { RefreshCw, Trash2, HandCoins, Megaphone } from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';
import { authedFetch } from '@/lib/admin-fetch';

/**
 * /admin/styrkir — fundraising console for vision projects (nytt-studio).
 * Enter gifts as they land in the bank (they appear on /studio instantly),
 * post project updates, and adjust the goal + budget lines. The payment
 * gateway will write into the same tables later.
 */

interface Gift {
    id: string;
    amount_isk: number;
    given_at: string;
    donor_name: string | null;
    show_name: boolean;
    method: string;
    note: string | null;
}

interface Update {
    id: string;
    title: string;
    body: string;
    published_at: string;
}

interface Item {
    key: string;
    label: string;
    amount_isk: number;
    note?: string;
}

interface Project {
    id: string;
    slug: string;
    title: string;
    goal_isk: number;
    items: Item[];
}

const todayISO = () => new Date().toISOString().slice(0, 10);
const isk = (n: number) => `${String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, '.')} kr.`;

export default function AdminStyrkirPage() {
    const [project, setProject] = useState<Project | null>(null);
    const [gifts, setGifts] = useState<Gift[]>([]);
    const [updates, setUpdates] = useState<Update[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [notice, setNotice] = useState<string | null>(null);

    // Gift form
    const [amount, setAmount] = useState('');
    const [givenAt, setGivenAt] = useState(todayISO());
    const [donorName, setDonorName] = useState('');
    const [showName, setShowName] = useState(false);
    const [method, setMethod] = useState('bank');
    const [note, setNote] = useState('');
    const [savingGift, setSavingGift] = useState(false);

    // Update form
    const [updTitle, setUpdTitle] = useState('');
    const [updBody, setUpdBody] = useState('');
    const [savingUpd, setSavingUpd] = useState(false);

    // Goal + items editor
    const [goal, setGoal] = useState('');
    const [items, setItems] = useState<Item[]>([]);
    const [savingProject, setSavingProject] = useState(false);

    const load = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const res = await authedFetch('/api/admin/fundraising?slug=nytt-studio');
            if (!res.ok) throw new Error(`Server svaraði ${res.status}`);
            const data = await res.json();
            setProject(data.project);
            setGifts(data.gifts ?? []);
            setUpdates(data.updates ?? []);
            setGoal(String(data.project?.goal_isk ?? ''));
            setItems(Array.isArray(data.project?.items) ? data.project.items : []);
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Tókst ekki að sækja gögn');
        }
        setIsLoading(false);
    }, []);

    useEffect(() => { load(); }, [load]);

    const raised = gifts.reduce((s, g) => s + (Number(g.amount_isk) || 0), 0);

    const saveGift = async () => {
        const amt = Number(amount.replace(/\./g, '').replace(/,/g, ''));
        if (!Number.isFinite(amt) || amt <= 0) { setNotice('Sláðu inn gilda upphæð.'); return; }
        setSavingGift(true);
        setNotice(null);
        try {
            const res = await authedFetch('/api/admin/fundraising', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'gift',
                    slug: 'nytt-studio',
                    amount_isk: amt,
                    given_at: givenAt,
                    donor_name: donorName.trim() || undefined,
                    show_name: showName,
                    method,
                    note: note.trim() || undefined,
                }),
            });
            if (!res.ok) { const d = await res.json().catch(() => ({})); throw new Error(d.error || `Villa ${res.status}`); }
            setAmount(''); setDonorName(''); setShowName(false); setNote('');
            setNotice('Gjöf skráð — birtist strax á /studio.');
            await load();
        } catch (e) {
            setNotice(e instanceof Error ? e.message : 'Villa kom upp.');
        }
        setSavingGift(false);
    };

    const saveUpdate = async () => {
        if (!updTitle.trim() || !updBody.trim()) { setNotice('Titill og texti þurfa að fylgja fréttinni.'); return; }
        setSavingUpd(true);
        setNotice(null);
        try {
            const res = await authedFetch('/api/admin/fundraising', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'update', slug: 'nytt-studio', title: updTitle.trim(), body: updBody.trim() }),
            });
            if (!res.ok) { const d = await res.json().catch(() => ({})); throw new Error(d.error || `Villa ${res.status}`); }
            setUpdTitle(''); setUpdBody('');
            setNotice('Frétt birt.');
            await load();
        } catch (e) {
            setNotice(e instanceof Error ? e.message : 'Villa kom upp.');
        }
        setSavingUpd(false);
    };

    const saveProject = async () => {
        const g = Number(goal.replace(/\./g, '').replace(/,/g, ''));
        if (!Number.isFinite(g) || g <= 0) { setNotice('Markmiðið þarf að vera tala stærri en 0.'); return; }
        setSavingProject(true);
        setNotice(null);
        try {
            const res = await authedFetch('/api/admin/fundraising', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'project', slug: 'nytt-studio', goal_isk: g, items }),
            });
            if (!res.ok) { const d = await res.json().catch(() => ({})); throw new Error(d.error || `Villa ${res.status}`); }
            setNotice('Verkefnið uppfært.');
            await load();
        } catch (e) {
            setNotice(e instanceof Error ? e.message : 'Villa kom upp.');
        }
        setSavingProject(false);
    };

    const removeGift = async (id: string) => {
        try {
            const res = await authedFetch(`/api/admin/fundraising?giftId=${encodeURIComponent(id)}`, { method: 'DELETE' });
            if (res.ok) setGifts((prev) => prev.filter((g) => g.id !== id));
        } catch { /* keep row on failure */ }
    };

    const removeUpdate = async (id: string) => {
        try {
            const res = await authedFetch(`/api/admin/fundraising?updateId=${encodeURIComponent(id)}`, { method: 'DELETE' });
            if (res.ok) setUpdates((prev) => prev.filter((u) => u.id !== id));
        } catch { /* keep row on failure */ }
    };

    return (
        <AdminLayout>
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="admin-h1">Styrkir fyrir Ljósið</h1>
                    <p className="admin-body mt-1">
                        Skráðu gjafir um leið og þær berast í heimabankann. Þær birtast strax í framvindunni á /studio.
                    </p>
                </div>
                <button onClick={load} className="admin-btn admin-btn-secondary admin-btn-icon" disabled={isLoading}>
                    <RefreshCw size={18} className={isLoading ? 'admin-spinner' : ''} />
                </button>
            </div>

            {/* Live summary */}
            <div className="admin-card mb-6" style={{ display: 'flex', gap: '2.5rem', flexWrap: 'wrap', alignItems: 'baseline' }}>
                <div>
                    <div className="admin-label">Safnað</div>
                    <div style={{ fontSize: '1.9rem', fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>{isk(raised)}</div>
                </div>
                <div>
                    <div className="admin-label">Markmið</div>
                    <div style={{ fontSize: '1.9rem', fontWeight: 700, fontVariantNumeric: 'tabular-nums', opacity: 0.75 }}>
                        {project ? isk(project.goal_isk) : '—'}
                    </div>
                </div>
                <div>
                    <div className="admin-label">Gjafir</div>
                    <div style={{ fontSize: '1.9rem', fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>{gifts.length}</div>
                </div>
                {project && project.goal_isk > 0 && (
                    <div>
                        <div className="admin-label">Hlutfall</div>
                        <div style={{ fontSize: '1.9rem', fontWeight: 700, fontVariantNumeric: 'tabular-nums', color: 'var(--admin-accent)' }}>
                            {Math.floor((raised / project.goal_isk) * 100)}%
                        </div>
                    </div>
                )}
            </div>

            {notice && (
                <div className="admin-card mb-6"><p className="admin-body" style={{ margin: 0 }}>{notice}</p></div>
            )}
            {error && (
                <div className="admin-card mb-6" style={{ borderColor: 'var(--admin-error)' }}>
                    <p className="admin-body" style={{ color: 'var(--admin-error)', margin: 0 }}>{error}</p>
                </div>
            )}

            {/* New gift */}
            <div className="admin-card mb-6" style={{ display: 'grid', gap: '1rem' }}>
                <div className="flex items-center gap-2">
                    <HandCoins size={16} className="text-[var(--admin-accent)]" />
                    <h3 className="admin-h3">Skrá gjöf</h3>
                </div>
                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                    <label style={{ display: 'grid', gap: '0.35rem', minWidth: '140px' }}>
                        <span className="admin-label">Upphæð (kr.)</span>
                        <input type="text" inputMode="numeric" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="25000" style={inputStyle} />
                    </label>
                    <label style={{ display: 'grid', gap: '0.35rem' }}>
                        <span className="admin-label">Dagsetning</span>
                        <input type="date" value={givenAt} onChange={(e) => setGivenAt(e.target.value)} style={inputStyle} />
                    </label>
                    <label style={{ display: 'grid', gap: '0.35rem', minWidth: '160px' }}>
                        <span className="admin-label">Aðferð</span>
                        <select value={method} onChange={(e) => setMethod(e.target.value)} style={inputStyle}>
                            <option value="bank">Millifærsla</option>
                            <option value="aur">Aur</option>
                            <option value="online">Greiðslugátt</option>
                        </select>
                    </label>
                    <label style={{ display: 'grid', gap: '0.35rem', flex: 1, minWidth: '180px' }}>
                        <span className="admin-label">Nafn gefanda (valkvætt)</span>
                        <input type="text" value={donorName} onChange={(e) => setDonorName(e.target.value)} placeholder="Nafnlaus" style={inputStyle} />
                    </label>
                </div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.9rem' }} className="admin-body">
                    <input type="checkbox" checked={showName} onChange={(e) => setShowName(e.target.checked)} />
                    Birta nafnið opinberlega í framvindunni (aðeins með skýru samþykki gefandans)
                </label>
                <label style={{ display: 'grid', gap: '0.35rem' }}>
                    <span className="admin-label">Athugasemd (aðeins fyrir okkur)</span>
                    <input type="text" value={note} onChange={(e) => setNote(e.target.value)} placeholder="t.d. tilvísun úr heimabanka" style={inputStyle} />
                </label>
                <div>
                    <button onClick={saveGift} disabled={savingGift} className="admin-btn admin-btn-primary">
                        {savingGift ? 'Skrái...' : 'Skrá gjöf'}
                    </button>
                </div>
            </div>

            {/* Gifts list */}
            <div className="admin-card mb-6">
                <h3 className="admin-h3" style={{ marginBottom: '1rem' }}>Allar gjafir</h3>
                {gifts.length === 0 && !isLoading ? (
                    <p className="admin-body" style={{ opacity: 0.7 }}>Engin gjöf skráð enn.</p>
                ) : (
                    <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'grid', gap: '0.6rem' }}>
                        {gifts.map((g) => (
                            <li key={g.id} style={{ display: 'flex', gap: '1rem', alignItems: 'center', padding: '0.7rem 1rem', borderRadius: '10px', background: 'var(--admin-bg)' }}>
                                <div style={{ minWidth: '110px', fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>{isk(g.amount_isk)}</div>
                                <div className="admin-body" style={{ flex: 1, fontSize: '0.9rem' }}>
                                    {g.given_at} · {g.donor_name ?? 'Nafnlaus'}{g.show_name ? ' · birt með nafni' : ''} · {g.method}
                                    {g.note ? ` · ${g.note}` : ''}
                                </div>
                                <button onClick={() => removeGift(g.id)} className="admin-btn admin-btn-icon admin-btn-secondary" aria-label="Eyða gjöf">
                                    <Trash2 size={15} />
                                </button>
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            {/* Post update */}
            <div className="admin-card mb-6" style={{ display: 'grid', gap: '1rem' }}>
                <div className="flex items-center gap-2">
                    <Megaphone size={16} className="text-[var(--admin-accent)]" />
                    <h3 className="admin-h3">Frétt af verkefninu</h3>
                </div>
                <label style={{ display: 'grid', gap: '0.35rem' }}>
                    <span className="admin-label">Titill</span>
                    <input type="text" value={updTitle} onChange={(e) => setUpdTitle(e.target.value)} placeholder="t.d. Fyrsta myndavélin pöntuð" style={inputStyle} />
                </label>
                <label style={{ display: 'grid', gap: '0.35rem' }}>
                    <span className="admin-label">Texti</span>
                    <textarea value={updBody} onChange={(e) => setUpdBody(e.target.value)} rows={3} placeholder="Stutt og hlýtt — fólk gefur aftur þegar það sér verkið verða til." style={{ ...inputStyle, resize: 'vertical' }} />
                </label>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <button onClick={saveUpdate} disabled={savingUpd} className="admin-btn admin-btn-primary">
                        {savingUpd ? 'Birti...' : 'Birta frétt'}
                    </button>
                </div>
                {updates.length > 0 && (
                    <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'grid', gap: '0.5rem' }}>
                        {updates.map((u) => (
                            <li key={u.id} style={{ display: 'flex', gap: '1rem', alignItems: 'center', padding: '0.6rem 1rem', borderRadius: '10px', background: 'var(--admin-bg)' }}>
                                <div className="admin-body" style={{ flex: 1, fontSize: '0.9rem' }}>
                                    <strong>{u.title}</strong> · {u.published_at.slice(0, 10)}
                                </div>
                                <button onClick={() => removeUpdate(u.id)} className="admin-btn admin-btn-icon admin-btn-secondary" aria-label="Eyða frétt">
                                    <Trash2 size={15} />
                                </button>
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            {/* Goal + budget lines */}
            <div className="admin-card" style={{ display: 'grid', gap: '1rem' }}>
                <h3 className="admin-h3">Markmið og áfangar</h3>
                <p className="admin-body" style={{ fontSize: '0.85rem', opacity: 0.75, margin: 0 }}>
                    Upphæðirnar hér eru bráðabirgðatölur — staðfestu raunverulegt kostnaðarmat áður en síðunni er dreift opinberlega.
                </p>
                <label style={{ display: 'grid', gap: '0.35rem', maxWidth: '240px' }}>
                    <span className="admin-label">Heildarmarkmið (kr.)</span>
                    <input type="text" inputMode="numeric" value={goal} onChange={(e) => setGoal(e.target.value)} style={inputStyle} />
                </label>
                <div style={{ display: 'grid', gap: '0.6rem' }}>
                    {items.map((item, idx) => (
                        <div key={item.key || idx} style={{ display: 'flex', gap: '0.8rem', alignItems: 'center', flexWrap: 'wrap' }}>
                            <span className="admin-body" style={{ flex: 1, minWidth: '200px', fontSize: '0.92rem' }}>{item.label}</span>
                            <input
                                type="text"
                                inputMode="numeric"
                                value={String(item.amount_isk)}
                                onChange={(e) => {
                                    const v = Number(e.target.value.replace(/\D/g, '')) || 0;
                                    setItems((prev) => prev.map((it, i) => (i === idx ? { ...it, amount_isk: v } : it)));
                                }}
                                style={{ ...inputStyle, width: '160px' }}
                            />
                        </div>
                    ))}
                </div>
                <div>
                    <button onClick={saveProject} disabled={savingProject} className="admin-btn admin-btn-primary">
                        {savingProject ? 'Vista...' : 'Vista markmið og áfanga'}
                    </button>
                </div>
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
