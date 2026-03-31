'use client';

import { useState } from 'react';
import { ArrowLeft, Send, Save, Eye, CheckCircle, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import AdminLayout from '@/components/admin/AdminLayout';
import { useRouter } from 'next/navigation';

export default function NewNewsletterPage() {
    const router = useRouter();
    const [title, setTitle] = useState('');
    const [subject, setSubject] = useState('');
    const [content, setContent] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [isSending, setIsSending] = useState(false);
    const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

    const handleSave = async () => {
        if (!title || !content) {
            setFeedback({ type: 'error', message: 'Titill og innihald vantar' });
            return;
        }
        setIsSaving(true);
        setFeedback(null);

        try {
            const res = await fetch('/api/admin/newsletters', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title, subject, content, send: false }),
            });

            if (!res.ok) throw new Error();
            setFeedback({ type: 'success', message: 'Fréttabréf vistað!' });
            setTimeout(() => router.push('/admin/newsletters'), 1000);
        } catch {
            setFeedback({ type: 'error', message: 'Villa við vistun' });
        } finally {
            setIsSaving(false);
        }
    };

    const handleSend = async () => {
        if (!title || !content) {
            setFeedback({ type: 'error', message: 'Titill og innihald vantar' });
            return;
        }
        if (!confirm('Ertu viss um að þú viljir senda þetta fréttabréf til allra áskrifenda?')) return;

        setIsSending(true);
        setFeedback(null);

        try {
            const res = await fetch('/api/admin/newsletters', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title, subject, content, send: true }),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error);

            const sentCount = data.sent || 0;
            setFeedback({ type: 'success', message: `Sent til ${sentCount} áskrifenda!` });
            setTimeout(() => router.push('/admin/newsletters'), 2000);
        } catch (err: any) {
            setFeedback({ type: 'error', message: err.message || 'Villa við sendingu' });
        } finally {
            setIsSending(false);
        }
    };

    const isWorking = isSaving || isSending;

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
                        <button
                            onClick={handleSave}
                            className="admin-btn admin-btn-secondary"
                            disabled={isWorking}
                        >
                            <Save size={18} />
                            <span>{isSaving ? 'Vista...' : 'Vista drög'}</span>
                        </button>
                        <button
                            onClick={handleSend}
                            className="admin-btn admin-btn-primary"
                            disabled={isWorking}
                        >
                            <Send size={18} />
                            <span>{isSending ? 'Sendi...' : 'Senda'}</span>
                        </button>
                    </div>
                </div>

                {/* Feedback */}
                {feedback && (
                    <div className={`flex items-center gap-2 px-4 py-3 rounded-lg mb-6 ${
                        feedback.type === 'success'
                            ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                            : 'bg-red-500/10 text-red-400 border border-red-500/20'
                    }`}>
                        {feedback.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
                        {feedback.message}
                    </div>
                )}

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
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
