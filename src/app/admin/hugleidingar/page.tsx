'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { RefreshCw, BookOpen, Check, Circle } from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';
import { authedFetch } from '@/lib/admin-fetch';

/**
 * /admin/hugleidingar — the review desk for BookForge devotionals.
 *
 * The collection is machine-translated, so nothing can be published until a
 * native speaker has read it. This page is the progress board for that work:
 * 62 pieces, day 1–31 x morning/evening.
 */

interface Row {
    id: string;
    day: number;
    slot: 'morning' | 'evening';
    slug: string;
    title_is: string;
    reviewed: boolean;
    status: 'draft' | 'published';
    paragraphs: number;
}

const SLOT_IS: Record<string, string> = { morning: 'Morgunn', evening: 'Kvöld' };

export default function AdminHugleidingarPage() {
    const [rows, setRows] = useState<Row[]>([]);
    const [progress, setProgress] = useState({ total: 0, reviewed: 0, published: 0 });
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [filter, setFilter] = useState<'all' | 'todo' | 'reviewed'>('all');

    const load = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const res = await authedFetch('/api/admin/devotionals');
            if (!res.ok) throw new Error(`Server svaraði ${res.status}`);
            const d = await res.json();
            setRows(d.items ?? []);
            setProgress(d.progress ?? { total: 0, reviewed: 0, published: 0 });
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Tókst ekki að sækja hugleiðingar');
        }
        setIsLoading(false);
    }, []);

    useEffect(() => { load(); }, [load]);

    const shown = rows.filter((r) =>
        filter === 'all' ? true : filter === 'todo' ? !r.reviewed : r.reviewed);

    const pct = progress.total > 0 ? Math.round((progress.reviewed / progress.total) * 100) : 0;

    return (
        <AdminLayout>
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="admin-h1">Hugleiðingar</h1>
                    <p className="admin-body mt-1">
                        Wade E. Taylor · 31 dagur, morgunn og kvöld. Vélþýtt — hver hugleiðing
                        þarf yfirlestur áður en hún birtist.
                    </p>
                </div>
                <button onClick={load} className="admin-btn admin-btn-secondary admin-btn-icon" disabled={isLoading}>
                    <RefreshCw size={18} className={isLoading ? 'admin-spinner' : ''} />
                </button>
            </div>

            <div className="admin-card mb-6" style={{ display: 'flex', gap: '2.5rem', flexWrap: 'wrap', alignItems: 'baseline' }}>
                <div>
                    <div className="admin-label">Yfirlesnar</div>
                    <div style={{ fontSize: '1.9rem', fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>
                        {progress.reviewed} / {progress.total}
                    </div>
                </div>
                <div>
                    <div className="admin-label">Birtar</div>
                    <div style={{ fontSize: '1.9rem', fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>
                        {progress.published}
                    </div>
                </div>
                <div style={{ flex: 1, minWidth: '220px' }}>
                    <div className="admin-label">Staða</div>
                    <div style={{ marginTop: '0.5rem', height: '10px', borderRadius: '5px', background: 'var(--admin-bg)', overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${pct}%`, background: 'var(--admin-accent)', transition: 'width 400ms ease' }} />
                    </div>
                    <div className="admin-body" style={{ fontSize: '0.8rem', marginTop: '0.4rem' }}>{pct}% lokið</div>
                </div>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                {([['all', 'Allar'], ['todo', 'Á eftir'], ['reviewed', 'Yfirlesnar']] as const).map(([k, label]) => (
                    <button
                        key={k}
                        onClick={() => setFilter(k)}
                        className={`admin-btn ${filter === k ? 'admin-btn-primary' : 'admin-btn-secondary'}`}
                        style={{ fontSize: '0.85rem' }}
                    >
                        {label}
                    </button>
                ))}
            </div>

            {error && (
                <div className="admin-card mb-6" style={{ borderColor: 'var(--admin-error)' }}>
                    <p className="admin-body" style={{ color: 'var(--admin-error)', margin: 0 }}>{error}</p>
                </div>
            )}

            <div className="admin-card">
                <div className="flex items-center gap-2 mb-4">
                    <BookOpen size={16} className="text-[var(--admin-accent)]" />
                    <h3 className="admin-h3">{shown.length} hugleiðingar</h3>
                </div>
                {shown.length === 0 && !isLoading ? (
                    <p className="admin-body" style={{ opacity: 0.7 }}>Ekkert hér.</p>
                ) : (
                    <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'grid', gap: '0.5rem' }}>
                        {shown.map((r) => (
                            <li key={r.id}>
                                <Link
                                    href={`/admin/hugleidingar/${r.slug}`}
                                    style={{
                                        display: 'flex', alignItems: 'center', gap: '1rem',
                                        padding: '0.75rem 1rem', borderRadius: '10px',
                                        background: 'var(--admin-bg)', textDecoration: 'none',
                                        color: 'inherit',
                                    }}
                                >
                                    <span style={{ color: r.reviewed ? 'var(--admin-accent)' : 'var(--admin-text-muted)', display: 'inline-flex' }}>
                                        {r.reviewed ? <Check size={17} /> : <Circle size={17} />}
                                    </span>
                                    <span style={{ minWidth: '108px', fontWeight: 600, fontSize: '0.85rem' }}>
                                        Dagur {r.day} · {SLOT_IS[r.slot]}
                                    </span>
                                    <span className="admin-body" style={{ flex: 1, fontSize: '0.95rem' }}>{r.title_is}</span>
                                    <span className="admin-body" style={{ fontSize: '0.78rem', opacity: 0.7 }}>
                                        {r.paragraphs} mgr.
                                    </span>
                                    {r.status === 'published' && (
                                        <span style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--admin-accent)' }}>
                                            Birt
                                        </span>
                                    )}
                                </Link>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </AdminLayout>
    );
}
