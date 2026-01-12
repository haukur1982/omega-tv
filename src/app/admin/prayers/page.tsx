'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, Clock, Heart, Mail, RefreshCw, Search, Filter } from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';

interface Prayer {
    id: string;
    name: string;
    email?: string;
    topic: string;
    content: string;
    timestamp: number;
    prayCount: number;
    isAnswered: boolean;
    isApproved: boolean;
}

type FilterType = 'all' | 'pending' | 'approved';

export default function AdminPrayersPage() {
    const [prayers, setPrayers] = useState<Prayer[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filter, setFilter] = useState<FilterType>('pending');
    const [searchQuery, setSearchQuery] = useState('');

    const loadData = async () => {
        setIsLoading(true);
        try {
            const res = await fetch('/api/admin/prayers');
            if (res.ok) {
                const data = await res.json();
                setPrayers(data);
            }
        } catch (e) {
            console.error('Failed to load prayers:', e);
        }
        setIsLoading(false);
    };

    useEffect(() => {
        loadData();
    }, []);

    const handleApprove = async (id: string) => {
        const res = await fetch('/api/admin/prayers', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id, action: 'approve' })
        });
        if (res.ok) {
            setPrayers(prev => prev.map(p => p.id === id ? { ...p, isApproved: true } : p));
        }
    };

    const handleDelete = async (id: string) => {
        const res = await fetch('/api/admin/prayers', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id })
        });
        if (res.ok) {
            setPrayers(prev => prev.filter(p => p.id !== id));
        }
    };

    const filteredPrayers = prayers
        .filter(p => {
            if (filter === 'pending') return !p.isApproved;
            if (filter === 'approved') return p.isApproved;
            return true;
        })
        .filter(p => {
            if (!searchQuery) return true;
            const query = searchQuery.toLowerCase();
            return p.name.toLowerCase().includes(query) ||
                p.content.toLowerCase().includes(query) ||
                p.topic.toLowerCase().includes(query);
        });

    const pendingCount = prayers.filter(p => !p.isApproved).length;
    const approvedCount = prayers.filter(p => p.isApproved).length;

    return (
        <AdminLayout>
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="admin-h1">Bænabeiðnir</h1>
                    <p className="admin-body mt-1">{pendingCount} bíða samþykkis</p>
                </div>
                <button
                    onClick={loadData}
                    className="admin-btn admin-btn-secondary admin-btn-icon"
                    disabled={isLoading}
                >
                    <RefreshCw size={18} className={isLoading ? 'admin-spinner' : ''} />
                </button>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-4 mb-6">
                <div className="flex bg-[var(--admin-surface)] rounded-lg p-1 border border-[var(--admin-border)]">
                    <FilterButton
                        active={filter === 'pending'}
                        onClick={() => setFilter('pending')}
                        count={pendingCount}
                    >
                        Bíða
                    </FilterButton>
                    <FilterButton
                        active={filter === 'approved'}
                        onClick={() => setFilter('approved')}
                        count={approvedCount}
                    >
                        Samþykktar
                    </FilterButton>
                    <FilterButton
                        active={filter === 'all'}
                        onClick={() => setFilter('all')}
                    >
                        Allar
                    </FilterButton>
                </div>

                <div className="relative flex-1 max-w-sm">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--admin-text-muted)]" />
                    <input
                        type="text"
                        placeholder="Leita..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="admin-input pl-9"
                    />
                </div>
            </div>

            {/* Prayer List */}
            {isLoading ? (
                <div className="grid gap-4">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="admin-card">
                            <div className="flex items-start gap-4">
                                <div className="w-10 h-10 rounded-lg admin-skeleton" />
                                <div className="flex-1 space-y-3">
                                    <div className="h-5 w-1/3 admin-skeleton" />
                                    <div className="h-4 w-full admin-skeleton" />
                                    <div className="h-4 w-2/3 admin-skeleton" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : filteredPrayers.length === 0 ? (
                <div className="admin-card admin-empty">
                    <Heart className="admin-empty-icon" />
                    <p className="admin-body">
                        {filter === 'pending' ? 'Engar bænir bíða samþykkis' : 'Engar bænir fundust'}
                    </p>
                </div>
            ) : (
                <div className="grid gap-4">
                    <AnimatePresence mode="popLayout">
                        {filteredPrayers.map((prayer) => (
                            <motion.div
                                key={prayer.id}
                                layout
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className={`admin-card admin-card-hover ${!prayer.isApproved ? 'border-l-2 border-l-[var(--admin-warning)]' : ''}`}
                            >
                                <div className="flex items-start gap-4">
                                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${prayer.isApproved
                                            ? 'bg-[var(--admin-success-subtle)] text-[var(--admin-success)]'
                                            : 'bg-[var(--admin-warning-subtle)] text-[var(--admin-warning)]'
                                        }`}>
                                        {prayer.isApproved ? <Check size={18} /> : <Clock size={18} />}
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <h3 className="admin-h3">{prayer.name}</h3>
                                            <span className="admin-badge admin-badge-neutral">{prayer.topic}</span>
                                        </div>
                                        <p className="admin-body mb-3">{prayer.content}</p>
                                        <div className="flex items-center gap-4">
                                            {prayer.email && (
                                                <span className="admin-caption flex items-center gap-1">
                                                    <Mail size={12} />
                                                    {prayer.email}
                                                </span>
                                            )}
                                            <span className="admin-caption flex items-center gap-1">
                                                <Heart size={12} />
                                                {prayer.prayCount} amín
                                            </span>
                                            <span className="admin-caption">
                                                {new Date(prayer.timestamp).toLocaleDateString('is-IS')}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 flex-shrink-0">
                                        {!prayer.isApproved && (
                                            <button
                                                onClick={() => handleApprove(prayer.id)}
                                                className="admin-btn admin-btn-icon bg-[var(--admin-success-subtle)] text-[var(--admin-success)] hover:bg-[var(--admin-success)] hover:text-white"
                                                title="Samþykkja"
                                            >
                                                <Check size={16} />
                                            </button>
                                        )}
                                        <button
                                            onClick={() => handleDelete(prayer.id)}
                                            className="admin-btn admin-btn-icon bg-[var(--admin-error-subtle)] text-[var(--admin-error)] hover:bg-[var(--admin-error)] hover:text-white"
                                            title="Eyða"
                                        >
                                            <X size={16} />
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            )}
        </AdminLayout>
    );
}

function FilterButton({
    active,
    onClick,
    children,
    count
}: {
    active: boolean;
    onClick: () => void;
    children: React.ReactNode;
    count?: number;
}) {
    return (
        <button
            onClick={onClick}
            className={`
                px-3 py-1.5 text-sm font-medium rounded-md transition-all flex items-center gap-2
                ${active
                    ? 'bg-[var(--admin-accent-subtle)] text-[var(--admin-accent)]'
                    : 'text-[var(--admin-text-secondary)] hover:text-[var(--admin-text)]'
                }
            `}
        >
            {children}
            {count !== undefined && count > 0 && (
                <span className={`
                    text-xs px-1.5 py-0.5 rounded-full
                    ${active ? 'bg-[var(--admin-accent)] text-black' : 'bg-[var(--admin-surface-hover)]'}
                `}>
                    {count}
                </span>
            )}
        </button>
    );
}
