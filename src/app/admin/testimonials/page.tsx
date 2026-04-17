'use client';

import { useEffect, useState } from 'react';
import { MessageSquare, Check, X, Calendar, User, Mail, RefreshCw } from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';
import { getAllTestimonials, approveTestimonial, deleteTestimonial, Testimonial } from '@/lib/testimonials-db';

export default function AdminTestimonialsPage() {
    const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const loadData = async () => {
        setIsLoading(true);
        try {
            const data = await getAllTestimonials();
            setTestimonials(data);
        } catch (e) {
            console.error(e);
        }
        setIsLoading(false);
    };

    useEffect(() => {
        loadData();
    }, []);

    const handleApprove = async (id: string) => {
        // Optimistic update
        setTestimonials(prev => prev.map(t =>
            t.id === id ? { ...t, is_approved: true } : t
        ));

        try {
            await approveTestimonial(id);
        } catch (e) {
            alert('Villa við að samþykkja.');
            loadData(); // Revert on error
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Ertu viss um að þú viljir eyða þessum vitnisburði?')) return;
        try {
            await deleteTestimonial(id);
            setTestimonials(prev => prev.filter(t => t.id !== id));
        } catch (e) {
            alert('Villa við að eyða.');
        }
    };

    return (
        <AdminLayout>
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="admin-h1">Vitnisburðir</h1>
                    <p className="admin-body mt-1">Umsjón með innsendum vitnisburðum</p>
                </div>
                <button
                    onClick={loadData}
                    disabled={isLoading}
                    className="admin-btn admin-btn-secondary admin-btn-icon"
                >
                    <RefreshCw size={18} className={isLoading ? 'animate-spin' : ''} />
                </button>
            </div>

            {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="admin-card h-48 animate-pulse bg-[var(--admin-surface-hover)]" />
                    ))}
                </div>
            ) : testimonials.length === 0 ? (
                <div className="admin-card admin-empty">
                    <MessageSquare className="admin-empty-icon" />
                    <p className="admin-body">Engir vitnisburðir fundust</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-6">
                    {testimonials.map((item) => (
                        <div key={item.id} className="admin-card relative overflow-hidden group">
                            {/* Status Stripe */}
                            <div className={`absolute left-0 top-0 bottom-0 w-1 ${item.is_approved ? 'bg-green-500' : 'bg-yellow-500'}`} />

                            <div className="pl-4 flex flex-col md:flex-row gap-6">
                                <div className="flex-1">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-[var(--admin-surface-hover)] flex items-center justify-center text-[var(--admin-text-secondary)]">
                                                <User size={20} />
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-[var(--admin-text)]">{item.name}</h3>
                                                <div className="flex items-center gap-3 text-xs text-[var(--admin-text-muted)]">
                                                    {item.email && (
                                                        <span className="flex items-center gap-1">
                                                            <Mail size={12} /> {item.email}
                                                        </span>
                                                    )}
                                                    <span className="flex items-center gap-1">
                                                        <Calendar size={12} />
                                                        {item.created_at ? new Date(item.created_at).toLocaleDateString('is-IS') : ''}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className={`px-2 py-1 rounded text-xs font-bold uppercase tracking-wider ${item.is_approved
                                            ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                                            : 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20'
                                            }`}>
                                            {item.is_approved ? 'Samþykkt' : 'Í bið'}
                                        </div>
                                    </div>

                                    <div className="bg-[var(--admin-bg)] p-4 rounded-lg border border-[var(--admin-border)] text-[var(--admin-text-secondary)] italic leading-relaxed">
                                        "{item.content}"
                                    </div>
                                </div>

                                <div className="flex md:flex-col justify-end gap-2 border-t md:border-t-0 md:border-l border-[var(--admin-border)] pt-4 md:pt-0 md:pl-6 min-w-[140px]">
                                    {!item.is_approved && (
                                        <button
                                            onClick={() => handleApprove(item.id)}
                                            className="admin-btn admin-btn-success w-full justify-center"
                                        >
                                            <Check size={16} />
                                            <span>Samþykkja</span>
                                        </button>
                                    )}
                                    <button
                                        onClick={() => handleDelete(item.id)}
                                        className="admin-btn admin-btn-danger w-full justify-center"
                                    >
                                        <X size={16} />
                                        <span>Eyða</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </AdminLayout>
    );
}
