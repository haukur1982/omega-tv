'use client';

import { useState } from 'react';
import { ArrowLeft, Send, Save, Eye } from 'lucide-react';
import Link from 'next/link';
import AdminLayout from '@/components/admin/AdminLayout';
import { useRouter } from 'next/navigation';

export default function NewNewsletterPage() {
    const router = useRouter();
    const [title, setTitle] = useState('');
    const [subject, setSubject] = useState('');
    const [content, setContent] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    const handleSave = async (status: 'draft' | 'published') => {
        setIsSaving(true);
        // TODO: Implement save logic
        await new Promise(resolve => setTimeout(resolve, 1000));
        setIsSaving(false);
        router.push('/admin/newsletters');
    };

    return (
        <AdminLayout>
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <Link
                            href="/admin/newsletters"
                            className="p-2 rounded-lg hover:bg-[var(--admin-surface-hover)] text-[var(--admin-text-secondary)] transition-colors"
                        >
                            <ArrowLeft size={20} />
                        </Link>
                        <div>
                            <h1 className="admin-h1">Nýtt fréttabréf</h1>
                            <p className="admin-body">Skrifaðu nýtt bréf til áskrifenda</p>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <button className="admin-btn admin-btn-secondary">
                            <Eye size={18} />
                            <span>Forskoða</span>
                        </button>
                        <button
                            onClick={() => handleSave('draft')}
                            className="admin-btn admin-btn-secondary"
                            disabled={isSaving}
                        >
                            <Save size={18} />
                            <span>Vista drög</span>
                        </button>
                        <button
                            className="admin-btn admin-btn-primary"
                            disabled={isSaving}
                        >
                            <Send size={18} />
                            <span>Senda</span>
                        </button>
                    </div>
                </div>

                {/* Editor Card */}
                <div className="admin-card space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-[var(--admin-text-secondary)] mb-2">
                            Titill (innri notkun)
                        </label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="t.d. Febrúarbréf 2026"
                            className="admin-input"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-[var(--admin-text-secondary)] mb-2">
                            Efni (Subject line)
                        </label>
                        <input
                            type="text"
                            value={subject}
                            onChange={(e) => setSubject(e.target.value)}
                            placeholder="Efni póstsins sem viðtakendur sjá..."
                            className="admin-input text-lg font-medium"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-[var(--admin-text-secondary)] mb-2">
                            Innihald
                        </label>
                        <textarea
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            placeholder="Skrifaðu bréfið hér..."
                            className="admin-input min-h-[400px] font-mono text-sm leading-relaxed"
                        />
                        <p className="text-xs text-[var(--admin-text-muted)] mt-2 text-right">
                            Markdown stutt
                        </p>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
