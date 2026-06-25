'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, Tv, Mail } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function AdminLoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [notice, setNotice] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [linkLoading, setLinkLoading] = useState(false);
    const router = useRouter();

    // If a session already exists — including arriving via a magic link that just
    // set one in the URL — go straight to the dashboard instead of showing the form.
    useEffect(() => {
        let active = true;
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (active && session) router.replace('/admin/dashboard');
        });
        const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
            if (session) router.replace('/admin/dashboard');
        });
        return () => { active = false; sub.subscription.unsubscribe(); };
    }, [router]);

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

    // Passwordless: email a one-time login link. No password to remember.
    const sendMagicLink = async () => {
        setError('');
        setNotice('');
        if (!email) {
            setError('Sláðu inn netfangið þitt fyrst');
            return;
        }
        setLinkLoading(true);
        const { error: linkError } = await supabase.auth.signInWithOtp({
            email,
            options: {
                emailRedirectTo: `${window.location.origin}/admin`,
                shouldCreateUser: false,
            },
        });
        if (linkError) {
            setError('Tókst ekki að senda hlekk núna. Reyndu aftur eftir smástund.');
        } else {
            setNotice('Innskráningarhlekkur sendur. Athugaðu tölvupóstinn þinn (og ruslpóst).');
        }
        setLinkLoading(false);
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
                            className="w-full px-4 py-3 rounded-xl bg-[var(--bg-deep)] border border-[var(--glass-border)] focus:border-[var(--accent)] focus:outline-none text-white placeholder-white/30"
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
                            className="w-full px-4 py-3 rounded-xl bg-[var(--bg-deep)] border border-[var(--glass-border)] focus:border-[var(--accent)] focus:outline-none text-white placeholder-white/30"
                        />
                    </div>

                    {error && (
                        <p className="text-red-400 text-sm mb-4 text-center">{error}</p>
                    )}
                    {notice && (
                        <p className="text-emerald-400 text-sm mb-4 text-center">{notice}</p>
                    )}

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full py-4 rounded-xl bg-[var(--accent)] text-white font-bold hover:brightness-110 transition-all disabled:opacity-50"
                    >
                        {isLoading ? 'Skrái inn...' : 'Innskrá'}
                    </button>

                    <div className="flex items-center gap-3 my-5">
                        <span className="h-px flex-1 bg-[var(--glass-border)]" />
                        <span className="text-xs text-[var(--text-muted)]">eða</span>
                        <span className="h-px flex-1 bg-[var(--glass-border)]" />
                    </div>

                    <button
                        type="button"
                        onClick={sendMagicLink}
                        disabled={linkLoading}
                        className="w-full py-3.5 rounded-xl border border-[var(--glass-border)] text-white font-medium hover:bg-white/5 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        <Mail size={15} />
                        {linkLoading ? 'Sendi hlekk...' : 'Senda mér innskráningarhlekk'}
                    </button>
                    <p className="text-center text-[var(--text-muted)] text-xs mt-3">
                        Manstu ekki lykilorðið? Fáðu hlekk sendan í tölvupósti.
                    </p>
                </form>

                <p className="text-center text-[var(--text-muted)] text-sm mt-6">
                    Þetta svæði er aðeins fyrir starfsfólk Omega.
                </p>
            </div>
        </main>
    );
}
