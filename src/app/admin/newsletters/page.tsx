'use client';

import { useEffect, useState } from 'react';
import { Plus, Mail, Eye, Send, FileText, MoreHorizontal } from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';
import Link from 'next/link';
import { getNewsletters, Newsletter } from '@/lib/newsletter-db';

// Note: In a real app we would use an API route, but for now we reuse the type
// We need an API route for GET newsletters to be client-side compatible if getNewsletters uses fs
// Actually, getNewsletters uses Supabase now, so it is async but runs on server. 
// We should make a client-side API route for this page.

interface AdminNewsletter extends Newsletter {
    status: 'draft' | 'published' | 'sent';
    stats?: {
        opens: number;
        clicks: number;
    };
}

export default function AdminNewslettersPage() {
    const [newsletters, setNewsletters] = useState<AdminNewsletter[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchNewsletters = async () => {
            try {
                const res = await fetch('/api/admin/newsletters');
                if (res.ok) {
                    const data = await res.json();
                    setNewsletters(data.map((n: any) => ({
                        ...n,
                        status: 'published', // Default to published for now as DB simplified
                        stats: { opens: 0, clicks: 0 } // Stats not yet in DB
                    })));
                } else {
                    console.error("Failed to fetch");
                }
            } catch (e) {
                console.error(e);
            } finally {
                setIsLoading(false);
            }
        };

        fetchNewsletters();
    }, []);

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
                                        <span className={`admin-badge ${letter.status === 'sent' ? 'admin-badge-success' :
                                            letter.status === 'published' ? 'admin-badge-info' :
                                                'admin-badge-warning'
                                            }`}>
                                            {letter.status === 'sent' ? 'Sent' : letter.status === 'published' ? 'Útgefið' : 'Drög'}
                                        </span>
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
