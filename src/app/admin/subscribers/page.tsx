'use client';

import { useEffect, useState } from 'react';
import { Download, Search, Mail, Calendar, Tag, RefreshCw } from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';

interface Subscriber {
    id: string;
    email: string;
    name?: string;
    segments: string[];
    createdAt: string;
}

export default function AdminSubscribersPage() {
    const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    const loadData = async () => {
        setIsLoading(true);
        try {
            const res = await fetch('/api/admin/subscribers');
            if (res.ok) {
                const data = await res.json();
                setSubscribers(data);
            }
        } catch (e) {
            console.error('Failed to load subscribers:', e);
        }
        setIsLoading(false);
    };

    useEffect(() => {
        loadData();
    }, []);

    const filteredSubscribers = subscribers.filter(s =>
        s.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (s.name && s.name.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    const handleExport = () => {
        const csvContent = "data:text/csv;charset=utf-8,"
            + "Email,Nafn,Flokkar,Skráður\n"
            + subscribers.map(s => `${s.email},${s.name || ''},"${s.segments.join(',')}",${s.createdAt}`).join("\n");

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `omega_subscribers_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <AdminLayout>
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="admin-h1">Áskrifendur</h1>
                    <p className="admin-body mt-1">{subscribers.length} skráðir á póstlista</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={loadData}
                        className="admin-btn admin-btn-secondary admin-btn-icon"
                        disabled={isLoading}
                    >
                        <RefreshCw size={18} className={isLoading ? 'admin-spinner' : ''} />
                    </button>
                    <button
                        onClick={handleExport}
                        className="admin-btn admin-btn-primary"
                        disabled={subscribers.length === 0}
                    >
                        <Download size={18} />
                        <span>Sækja CSV</span>
                    </button>
                </div>
            </div>

            <div className="admin-card mb-6">
                <div className="relative">
                    <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--admin-text-muted)]" />
                    <input
                        type="text"
                        placeholder="Leita eftir netfangi eða nafni..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="admin-input pl-10"
                    />
                </div>
            </div>

            <div className="admin-card overflow-hidden p-0">
                <div className="overflow-x-auto">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Netfang</th>
                                <th>Nafn</th>
                                <th>Flokkar</th>
                                <th>Skráður</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                [1, 2, 3, 4, 5].map(i => (
                                    <tr key={i}>
                                        <td><div className="h-4 w-48 admin-skeleton" /></td>
                                        <td><div className="h-4 w-32 admin-skeleton" /></td>
                                        <td><div className="h-6 w-24 admin-skeleton rounded-full" /></td>
                                        <td><div className="h-4 w-24 admin-skeleton" /></td>
                                    </tr>
                                ))
                            ) : filteredSubscribers.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="text-center py-12">
                                        <div className="flex flex-col items-center justify-center">
                                            <Mail className="admin-empty-icon" />
                                            <p className="admin-body">Engir áskrifendur fundust</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filteredSubscribers.map((sub) => (
                                    <tr key={sub.id}>
                                        <td>
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-[var(--admin-surface-active)] flex items-center justify-center text-[var(--admin-text-muted)] text-xs font-bold">
                                                    {sub.email[0].toUpperCase()}
                                                </div>
                                                <span className="text-[var(--admin-text)] font-medium">{sub.email}</span>
                                            </div>
                                        </td>
                                        <td>{sub.name || <span className="text-[var(--admin-text-muted)]">—</span>}</td>
                                        <td>
                                            <div className="flex gap-1">
                                                {sub.segments.map(seg => (
                                                    <span key={seg} className="admin-badge admin-badge-info">
                                                        {seg}
                                                    </span>
                                                ))}
                                            </div>
                                        </td>
                                        <td className="text-[var(--admin-text-muted)] font-mono text-xs">
                                            {new Date(sub.createdAt).toLocaleDateString('is-IS')}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </AdminLayout>
    );
}
