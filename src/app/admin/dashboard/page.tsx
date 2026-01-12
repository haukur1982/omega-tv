'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Heart, Users, Eye, FileText, RefreshCw, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import AdminLayout from '@/components/admin/AdminLayout';
import StatCard from '@/components/admin/StatCard';
import ActivityFeed from '@/components/admin/ActivityFeed';

interface Stats {
    prayers: { total: number; pending: number };
    subscribers: number;
    newsletters: number;
}

interface Activity {
    id: string;
    type: 'prayer' | 'subscriber' | 'newsletter';
    title: string;
    subtitle?: string;
    timestamp: string;
    status?: 'pending' | 'approved' | 'sent';
}

export default function AdminDashboardPage() {
    const [stats, setStats] = useState<Stats>({ prayers: { total: 0, pending: 0 }, subscribers: 0, newsletters: 0 });
    const [activities, setActivities] = useState<Activity[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const loadData = async () => {
        setIsLoading(true);
        try {
            // Fetch prayers
            const prayerRes = await fetch('/api/admin/prayers');
            const prayers = prayerRes.ok ? await prayerRes.json() : [];

            // Fetch subscribers
            const subRes = await fetch('/api/admin/subscribers');
            const subscribers = subRes.ok ? await subRes.json() : [];

            // Calculate stats
            setStats({
                prayers: {
                    total: prayers.length,
                    pending: prayers.filter((p: any) => !p.isApproved).length
                },
                subscribers: subscribers.length,
                newsletters: 2 // We'll fetch this properly later
            });

            // Build activity feed from recent items
            const recentPrayers = prayers.slice(0, 3).map((p: any) => ({
                id: p.id,
                type: 'prayer' as const,
                title: `Bænabeiðni frá ${p.name}`,
                subtitle: p.topic,
                timestamp: formatTimeAgo(p.timestamp),
                status: p.isApproved ? 'approved' : 'pending'
            }));

            const recentSubs = subscribers.slice(0, 2).map((s: any) => ({
                id: s.id,
                type: 'subscriber' as const,
                title: 'Nýr áskrifandi',
                subtitle: s.email,
                timestamp: formatTimeAgo(new Date(s.createdAt).getTime()),
            }));

            setActivities([...recentPrayers, ...recentSubs].sort((a, b) =>
                a.timestamp.localeCompare(b.timestamp)
            ).slice(0, 5));

        } catch (e) {
            console.error('Failed to load dashboard data:', e);
        }
        setIsLoading(false);
    };

    useEffect(() => {
        loadData();
    }, []);

    return (
        <AdminLayout>
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="admin-h1">Yfirlit</h1>
                    <p className="admin-body mt-1">Velkomin/n í stjórnborð Omega</p>
                </div>
                <button
                    onClick={loadData}
                    className="admin-btn admin-btn-secondary admin-btn-icon"
                    disabled={isLoading}
                >
                    <RefreshCw size={18} className={isLoading ? 'admin-spinner' : ''} />
                </button>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <StatCard
                    label="Bænir sem bíða"
                    value={stats.prayers.pending}
                    icon={<Heart size={16} />}
                    subtitle={`${stats.prayers.total} samtals`}
                />
                <StatCard
                    label="Áskrifendur"
                    value={stats.subscribers}
                    icon={<Users size={16} />}
                    trend={{ value: 12, isPositive: true }}
                />
                <StatCard
                    label="Fréttabréf send"
                    value={stats.newsletters}
                    icon={<FileText size={16} />}
                />
                <StatCard
                    label="Heimsóknir í dag"
                    value="—"
                    icon={<Eye size={16} />}
                    subtitle="Tengdu Plausible"
                />
            </div>

            {/* Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Activity Feed */}
                <div className="lg:col-span-2">
                    <ActivityFeed activities={activities} isLoading={isLoading} />
                </div>

                {/* Quick Actions */}
                <div className="admin-card">
                    <h3 className="admin-h3 mb-4">Flýtiaðgerðir</h3>
                    <div className="space-y-2">
                        <QuickAction
                            href="/admin/prayers"
                            label="Skoða bænabeiðnir"
                            count={stats.prayers.pending}
                        />
                        <QuickAction
                            href="/admin/subscribers"
                            label="Skoða áskrifendur"
                        />
                        <QuickAction
                            href="/admin/newsletters"
                            label="Skrifa fréttabréf"
                        />
                        <QuickAction
                            href="/admin/quotes"
                            label="Búa til tilvitnun"
                        />
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}

function QuickAction({ href, label, count }: { href: string; label: string; count?: number }) {
    return (
        <Link
            href={href}
            className="flex items-center justify-between p-3 rounded-lg bg-[var(--admin-bg)] hover:bg-[var(--admin-surface-hover)] transition-colors group"
        >
            <span className="text-sm text-[var(--admin-text-secondary)] group-hover:text-[var(--admin-text)]">
                {label}
            </span>
            <div className="flex items-center gap-2">
                {count !== undefined && count > 0 && (
                    <span className="admin-badge admin-badge-warning">{count}</span>
                )}
                <ArrowRight size={14} className="text-[var(--admin-text-muted)] group-hover:text-[var(--admin-accent)] transition-colors" />
            </div>
        </Link>
    );
}

function formatTimeAgo(timestamp: number): string {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    if (seconds < 60) return 'Núna';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}klst`;
    const days = Math.floor(hours / 24);
    return `${days}d`;
}
