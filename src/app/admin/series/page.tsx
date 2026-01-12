'use client';

import { useEffect, useState } from 'react';
import { Plus, LayoutGrid, AlertCircle, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import AdminLayout from '@/components/admin/AdminLayout';
import { getAllSeries, Series } from '@/lib/vod-db';

export default function SeriesListPage() {
    const [series, setSeries] = useState<Series[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    const loadSeries = async () => {
        setIsLoading(true);
        setError('');
        try {
            const data = await getAllSeries();
            setSeries(data);
        } catch (e) {
            console.error(e);
            setError('Ekki tókst að sækja lista yfir þætti.');
        }
        setIsLoading(false);
    };

    useEffect(() => {
        loadSeries();
    }, []);

    return (
        <AdminLayout>
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="admin-h1">Þáttaraðir</h1>
                    <p className="admin-body mt-1">Stjórnaðu þáttum og flokkum (Series & Collections)</p>
                </div>
                <Link
                    href="/admin/series/new"
                    className="admin-btn admin-btn-primary"
                >
                    <Plus size={18} />
                    <span>Ný þáttaröð</span>
                </Link>
            </div>

            {error && (
                <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-4 rounded-lg mb-6 flex items-center gap-3">
                    <AlertCircle size={20} />
                    <span>{error}</span>
                </div>
            )}

            {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="admin-card aspect-[2/3] p-0 relative overflow-hidden">
                            <div className="absolute inset-0 bg-[var(--admin-surface-hover)] animate-pulse" />
                        </div>
                    ))}
                </div>
            ) : series.length === 0 ? (
                <div className="admin-card admin-empty">
                    <LayoutGrid className="admin-empty-icon" />
                    <p className="admin-body">Engar þáttaraðir fundust</p>
                    <button onClick={loadSeries} className="mt-4 text-[var(--admin-accent)] hover:underline">
                        Reyna aftur
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {series.map((item) => (
                        <Link
                            key={item.id}
                            href={`/admin/series/${item.id}`}
                            className="group relative flex flex-col"
                        >
                            <div className="aspect-[2/3] bg-[var(--admin-surface-hover)] rounded-lg overflow-hidden border border-[var(--admin-border)] group-hover:border-[var(--admin-accent)] transition-all mb-3 shadow-lg group-hover:shadow-[var(--admin-accent-glow)]">
                                {item.poster_vertical ? (
                                    <img
                                        src={item.poster_vertical}
                                        alt={item.title}
                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-[var(--admin-text-muted)]">
                                        <LayoutGrid size={32} />
                                    </div>
                                )}
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                            </div>

                            <h3 className="font-bold text-[var(--admin-text)] truncate group-hover:text-[var(--admin-accent)] transition-colors">
                                {item.title}
                            </h3>
                            <div className="text-sm text-[var(--admin-text-muted)] flex justify-between">
                                <span>{item.host || 'Enginn stjórnandi'}</span>
                                {/* @ts-ignore - joined count property */}
                                {item.seasons && <span>{item.seasons[0]?.count || 0} þættir</span>}
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </AdminLayout>
    );
}
