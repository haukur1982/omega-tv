'use client';

import { useState } from 'react';
import { Send, User, Mail, MessageSquare, Loader2, CheckCircle } from 'lucide-react';
import { submitTestimonial } from '@/actions/testimonial';

export default function TestimonialForm() {
    const [isLoading, setIsLoading] = useState(false);
    const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const [message, setMessage] = useState('');

    const handleSubmit = async (formData: FormData) => {
        setIsLoading(true);
        setStatus('idle');

        try {
            const result = await submitTestimonial(formData);
            if (result.success) {
                setStatus('success');
                setMessage(result.message);
                // Reset form handled by standard browser behavior if we were using onSubmit
                // Since we are using action on form, we can reset explicitly if needed, but for now simple success state is fine.
            } else {
                setStatus('error');
                setMessage(result.message);
            }
        } catch (e) {
            setStatus('error');
            setMessage('Kerfisvilla. Vinsamlegast reyndu aftur.');
        }
        setIsLoading(false);
    };

    if (status === 'success') {
        return (
            <div className="bg-green-500/10 border border-green-500/20 rounded-2xl p-8 text-center animate-in fade-in zoom-in duration-300">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-500/20 text-green-400 mb-4">
                    <CheckCircle size={32} />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Takk fyrir!</h3>
                <p className="text-[var(--text-secondary)]">
                    Vitnisburðurinn þinn hefur verið sendur og bíður samþykkis.
                </p>
                <button
                    onClick={() => setStatus('idle')}
                    className="mt-6 px-6 py-2 rounded-lg bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:text-white transition-colors text-sm"
                >
                    Senda annan vitnisburð
                </button>
            </div>
        );
    }

    return (
        <form action={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <label htmlFor="name" className="text-sm font-medium text-[var(--text-secondary)] ml-1">
                        Fullt nafn
                    </label>
                    <div className="relative">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={18} />
                        <input
                            type="text"
                            name="name"
                            required
                            placeholder="Jón Jónsson"
                            className="w-full pl-12 pr-4 py-3 rounded-xl bg-[var(--bg-deep)] border border-[var(--glass-border)] focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)] outline-none text-white transition-all"
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <label htmlFor="email" className="text-sm font-medium text-[var(--text-secondary)] ml-1">
                        Netfang (valfrjálst)
                    </label>
                    <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={18} />
                        <input
                            type="email"
                            name="email"
                            placeholder="jon@example.com"
                            className="w-full pl-12 pr-4 py-3 rounded-xl bg-[var(--bg-deep)] border border-[var(--glass-border)] focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)] outline-none text-white transition-all"
                        />
                    </div>
                </div>
            </div>

            <div className="space-y-2">
                <label htmlFor="content" className="text-sm font-medium text-[var(--text-secondary)] ml-1">
                    Þinn vitnisburður
                </label>
                <div className="relative">
                    <MessageSquare className="absolute left-4 top-4 text-[var(--text-muted)]" size={18} />
                    <textarea
                        name="content"
                        required
                        rows={6}
                        placeholder="Deildu sögu þinni með okkur..."
                        className="w-full pl-12 pr-4 py-3 rounded-xl bg-[var(--bg-deep)] border border-[var(--glass-border)] focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)] outline-none text-white transition-all resize-none leading-relaxed"
                    />
                </div>
            </div>

            {status === 'error' && (
                <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center">
                    {message}
                </div>
            )}

            <button
                type="submit"
                disabled={isLoading}
                className="w-full py-4 rounded-xl bg-[var(--accent-gold)] text-black font-bold text-lg hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_4px_20px_rgba(212,175,55,0.2)]"
            >
                {isLoading ? (
                    <span className="flex items-center justify-center gap-2">
                        <Loader2 className="animate-spin" size={20} />
                        Sendi...
                    </span>
                ) : (
                    <span className="flex items-center justify-center gap-2">
                        <Send size={20} />
                        Senda vitnisburð
                    </span>
                )}
            </button>
        </form>
    );
}
