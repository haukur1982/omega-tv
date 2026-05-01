'use client';

import { useEffect, useState, useCallback } from 'react';
import { Plus, Mail, Eye, Send, FileText, MoreHorizontal, Loader2 } from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';
import Link from 'next/link';
import { Newsletter } from '@/lib/newsletter-db';
import { supabase } from '@/lib/supabase';

interface AdminNewsletter extends Newsletter {
    sent_at?: string | null;
    stats?: {
        opens: number;
        clicks: number;
    };
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

export default function AdminNewslettersPage() {
    const [newsletters, setNewsletters] = useState<AdminNewsletter[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [sendingId, setSendingId] = useState<string | null>(null);

    const fetchNewsletters = useCallback(async () => {
        try {
            const res = await authedFetch('/api/admin/newsletters');
            if (res.ok) {
                const data = await res.json();
                setNewsletters(data.map((n: any) => ({
                    ...n,
                    stats: { opens: 0, clicks: 0 },
                })));
            }
        } catch (e) {
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => { fetchNewsletters(); }, [fetchNewsletters]);

    const handleSend = useCallback(async (id: string, title: string) => {
        if (!confirm(`Senda „${title}“ á alla staðfesta áskrifendur? Þetta er ekki hægt að taka til baka.`)) return;
        setSendingId(id);
        const res = await authedFetch(`/api/admin/newsletters/${id}/send`, { method: 'POST' });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
            alert(data.error ?? 'Tókst ekki að senda fréttabréf.');
        } else {
            alert(`Sent: ${data.sent} af ${data.total}. Mistókst: ${data.failed}.`);
            fetchNewsletters();
        }
        setSendingId(null);
    }, [fetchNewsletters]);

    return (
        <AdminLayout>
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="admin-h1">Fréttabréf</h1>
                    <p className="admin-body mt-1">Stjórnaðu póstlistanum og sendu út fréttir</p>
                </div>
                <Link
                    href="/admin/newsletters/new"
                    className="admin-btn admin-btn-primary"
                >
                    <Plus size={18} />
                    <span>Nýtt bréf</span>
                </Link>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {isLoading ? (
                    <div className="admin-card">
                        <div className="space-y-4">
                            <div className="h-6 w-1/3 admin-skeleton" />
                            <div className="h-4 w-full admin-skeleton" />
                        </div>
                    </div>
                ) : newsletters.length === 0 ? (
                    <div className="admin-card admin-empty">
                        <FileText className="admin-empty-icon" />
                        <p className="admin-body">Engin fréttabréf fundust</p>
                    </div>
                ) : (
                    newsletters.map((letter) => (
                        <div key={letter.id} className="admin-card hover:border-[var(--admin-border-strong)] transition-colors group">
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <h3 className="admin-h3 text-lg">{letter.title}</h3>
                                        {letter.sent_at ? (
                                            <span className="admin-badge admin-badge-success">
                                                Sent {new Date(letter.sent_at).toLocaleDateString('is-IS')}
                                            </span>
                                        ) : (
                                            <span className="admin-badge admin-badge-info">Útgefið á vef</span>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-4 text-[var(--admin-text-muted)] text-sm mb-4">
                                        <span>{letter.author}</span>
                                        <span>•</span>
                                        <span>{new Date(letter.date).toLocaleDateString('is-IS')}</span>
                                    </div>

                                    {letter.stats && (
                                        <div className="flex items-center gap-6">
                                            <div className="flex items-center gap-2">
                                                <Eye size={16} className="text-[var(--admin-text-secondary)]" />
                                                <span className="font-medium text-[var(--admin-text)]">{letter.stats.opens}</span>
                                                <span className="text-xs text-[var(--admin-text-muted)]">opnanir</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Mail size={16} className="text-[var(--admin-text-secondary)]" />
                                                <span className="font-medium text-[var(--admin-text)]">{letter.stats.clicks}</span>
                                                <span className="text-xs text-[var(--admin-text-muted)]">smellir</span>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="flex items-center gap-2">
                                    {!letter.sent_at && (
                                        <button
                                            type="button"
                                            onClick={() => handleSend(letter.id, letter.title)}
                                            disabled={sendingId === letter.id}
                                            className="admin-btn admin-btn-primary"
                                            title="Senda á alla staðfesta áskrifendur"
                                        >
                                            {sendingId === letter.id ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                                            Senda
                                        </button>
                                    )}
                                    <button className="admin-btn admin-btn-secondary opacity-0 group-hover:opacity-100 transition-opacity">
                                        Breyta
                                    </button>
                                    <button className="admin-btn admin-btn-icon admin-btn-ghost">
                                        <MoreHorizontal size={18} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </AdminLayout>
    );
}
