'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, Tv, Mail } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function AdminLoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        const { error: authError } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (authError) {
            setError('Rangt netfang eða lykilorð');
        } else {
            router.push('/admin/dashboard');
        }
        setIsLoading(false);
    };

    return (
        <main className="min-h-screen bg-[var(--bg-deep)] flex items-center justify-center px-6">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[var(--primary-glow)] mb-4 shadow-[0_0_30px_var(--primary-glow)]">
                        <Tv size={32} className="text-white" />
                    </div>
                    <h1 className="text-3xl font-bold text-white mb-2">Omega Admin</h1>
                    <p className="text-[var(--text-secondary)]">Stjórnborð fyrir starfsfólk</p>
                </div>

                <form onSubmit={handleSubmit} className="bg-[var(--bg-surface)] border border-[var(--glass-border)] rounded-2xl p-8">
                    <div className="mb-4">
                        <label className="text-sm font-medium text-[var(--text-secondary)] mb-2 flex items-center gap-2">
                            <Mail size={14} />
                            Netfang
                        </label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="admin@omega.is"
                            className="w-full px-4 py-3 rounded-xl bg-[var(--bg-deep)] border border-[var(--glass-border)] focus:border-[var(--accent-gold)] focus:outline-none text-white placeholder-white/30"
                        />
                    </div>

                    <div className="mb-6">
                        <label className="text-sm font-medium text-[var(--text-secondary)] mb-2 flex items-center gap-2">
                            <Lock size={14} />
                            Lykilorð
                        </label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Sláðu inn lykilorð"
                            className="w-full px-4 py-3 rounded-xl bg-[var(--bg-deep)] border border-[var(--glass-border)] focus:border-[var(--accent-gold)] focus:outline-none text-white placeholder-white/30"
                        />
                    </div>

                    {error && (
                        <p className="text-red-400 text-sm mb-4 text-center">{error}</p>
                    )}

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full py-4 rounded-xl bg-[var(--accent-gold)] text-black font-bold hover:brightness-110 transition-all disabled:opacity-50"
                    >
                        {isLoading ? 'Skrái inn...' : 'Innskrá'}
                    </button>
                </form>

                <p className="text-center text-[var(--text-muted)] text-sm mt-6">
                    Þetta svæði er aðeins fyrir starfsfólk Omega.
                </p>
            </div>
        </main>
    );
}
