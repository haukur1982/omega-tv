'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { Plus, Newspaper, ExternalLink, Trash2, Eye, EyeOff, Loader2 } from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';
import type { NewsItem } from '@/lib/news-db';
import { supabase } from '@/lib/supabase';

/**
 * /admin/news — Fréttir admin.
 *
 * List view with create/publish/delete. Each row shows the source
 * attribution prominently so it's obvious whether the editorial floor
 * (credit + linkback) was met before publishing.
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

export default function AdminNewsPage() {
    const [items, setItems] = useState<NewsItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const load = useCallback(async () => {
        setIsLoading(true);
        const res = await authedFetch('/api/admin/news');
        if (res.ok) {
            const data = await res.json();
            setItems(data as NewsItem[]);
        }
        setIsLoading(false);
    }, []);

    useEffect(() => { load(); }, [load]);

    const togglePublish = async (item: NewsItem) => {
        const next = !item.isPublished;
        // Optimistic
        setItems(prev => prev.map(i => i.id === item.id ? { ...i, isPublished: next } : i));
        const res = await authedFetch('/api/admin/news', {
            method: 'PATCH',
            body: JSON.stringify({ id: item.id, isPublished: next }),
        });
        if (!res.ok) load();
    };

    const remove = async (id: string, title: string) => {
        if (!confirm(`Eyða „${title}“ varanlega?`)) return;
        const res = await authedFetch('/api/admin/news', {
            method: 'DELETE',
            body: JSON.stringify({ id }),
        });
        if (res.ok) setItems(prev => prev.filter(i => i.id !== id));
        else load();
    };

    return (
        <AdminLayout>
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="admin-h1">Fréttir</h1>
                    <p className="admin-body mt-1">
                        Þýddar kristnar heimsfréttir. Hver frétt þarf heimild — nafn og hlekk á upprunalega greinina.
                    </p>
                </div>
                <Link href="/admin/news/new" className="admin-btn admin-btn-primary">
                    <Plus size={16} />
                    Ný frétt
                </Link>
            </div>

            {isLoading ? (
                <div className="admin-card admin-empty">
                    <Loader2 className="animate-spin" />
                </div>
            ) : items.length === 0 ? (
                <div className="admin-card admin-empty">
                    <Newspaper className="admin-empty-icon" />
                    <p className="admin-body">Engar fréttir enn.</p>
                </div>
            ) : (
                <ul className="space-y-3 list-none p-0">
                    {items.map((item) => (
                        <li key={item.id} className="admin-card flex flex-col md:flex-row gap-4 md:items-start md:justify-between">
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1 flex-wrap">
                                    <span className={`admin-badge ${item.isPublished ? 'admin-badge-success' : 'admin-badge-warning'}`}>
                                        {item.isPublished ? 'Birt' : 'Drög'}
                                    </span>
                                    {item.category && (
                                        <span className="admin-badge admin-badge-info">{item.category}</span>
                                    )}
                                    {item.region && (
                                        <span className="text-xs text-[var(--admin-text-muted)] font-mono">
                                            {item.region}
                                        </span>
                                    )}
                                </div>
                                <h3 className="admin-h3 mb-1">{item.title}</h3>
                                <p className="text-sm text-[var(--admin-text-secondary)] mb-2 line-clamp-2">
                                    {item.summary}
                                </p>
                                <div className="flex items-center gap-2 text-xs text-[var(--admin-text-muted)]">
                                    <span>Heimild:</span>
                                    <a
                                        href={item.sourceUrl}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="inline-flex items-center gap-1 text-[var(--admin-accent)]"
                                    >
                                        {item.sourceName}
                                        <ExternalLink size={11} />
                                    </a>
                                    {item.publishedAt && (
                                        <>
                                            <span>·</span>
                                            <span>Birt {new Date(item.publishedAt).toLocaleDateString('is-IS')}</span>
                                        </>
                                    )}
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    type="button"
                                    onClick={() => togglePublish(item)}
                                    className="admin-btn admin-btn-secondary"
                                    title={item.isPublished ? 'Hætta birtingu' : 'Birta'}
                                >
                                    {item.isPublished ? <EyeOff size={14} /> : <Eye size={14} />}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => remove(item.id, item.title)}
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
