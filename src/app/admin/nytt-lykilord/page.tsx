'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Lock, Mail, ShieldCheck } from 'lucide-react';
import { supabase } from '@/lib/supabase';

/**
 * Set a new password.
 *
 * This page is the other half of "forgot password", which the site never had —
 * the recovery email had nowhere to land, so it dumped its token on the home
 * page and looked broken. It serves two jobs with the same form:
 *
 *  1. arriving from a recovery email (supabase-js reads the token out of the
 *     URL fragment on load and creates a session), and
 *  2. changing your password while already logged in.
 *
 * If neither applies — an expired or already-used link — it does not dead-end:
 * it offers to send a fresh one.
 */
export default function NyttLykilordPage() {
    const router = useRouter();
    const [ready, setReady] = useState(false);
    const [hasSession, setHasSession] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirm, setConfirm] = useState('');
    const [error, setError] = useState('');
    const [notice, setNotice] = useState('');
    const [saving, setSaving] = useState(false);

    // supabase-js parses the recovery token from the URL fragment on load, so a
    // session may appear a tick after mount. Listen as well as ask.
    useEffect(() => {
        let active = true;
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (!active) return;
            if (session) {
                setHasSession(true);
                setEmail(session.user.email ?? '');
            }
            setReady(true);
        });
        const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
            if (!active) return;
            if (session) {
                setHasSession(true);
                setEmail(session.user.email ?? '');
            }
            setReady(true);
        });
        return () => { active = false; sub.subscription.unsubscribe(); };
    }, []);

    const save = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setNotice('');

        if (password.length < 8) {
            setError('Lykilorðið þarf að vera minnst 8 stafir.');
            return;
        }
        if (password !== confirm) {
            setError('Lykilorðin tvö eru ekki eins.');
            return;
        }

        setSaving(true);
        const { error: updateError } = await supabase.auth.updateUser({ password });
        setSaving(false);

        if (updateError) {
            setError('Tókst ekki að vista lykilorðið. Hlekkurinn gæti verið útrunninn.');
            return;
        }
        setNotice('Lykilorðið er vistað. Opna stjórnborðið...');
        setTimeout(() => router.replace('/admin/dashboard'), 900);
    };

    const sendNewLink = async () => {
        setError('');
        setNotice('');
        if (!email) {
            setError('Sláðu inn netfangið þitt.');
            return;
        }
        const { error: linkError } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/admin/nytt-lykilord`,
        });
        if (linkError) {
            setError('Tókst ekki að senda hlekk núna. Reyndu aftur eftir smástund.');
        } else {
            setNotice('Nýr hlekkur sendur. Athugaðu tölvupóstinn þinn (og ruslpóst).');
        }
    };

    return (
        <main className="min-h-screen bg-[var(--bg-deep)] flex items-center justify-center px-6">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[var(--primary-glow)] mb-4 shadow-[0_0_30px_var(--primary-glow)]">
                        <ShieldCheck size={32} className="text-white" />
                    </div>
                    <h1 className="text-3xl font-bold text-white mb-2">Nýtt lykilorð</h1>
                    <p className="text-[var(--text-secondary)]">
                        {hasSession && email ? email : 'Veldu nýtt lykilorð fyrir aðganginn þinn'}
                    </p>
                </div>

                <div className="bg-[var(--bg-surface)] border border-[var(--glass-border)] rounded-2xl p-8">
                    {!ready && (
                        <p className="text-center text-[var(--text-secondary)] text-sm py-4">
                            Athuga hlekkinn...
                        </p>
                    )}

                    {ready && hasSession && (
                        <form onSubmit={save}>
                            <div className="mb-4">
                                <label className="text-sm font-medium text-[var(--text-secondary)] mb-2 flex items-center gap-2">
                                    <Lock size={14} />
                                    Nýtt lykilorð
                                </label>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    autoComplete="new-password"
                                    placeholder="Minnst 8 stafir"
                                    className="w-full px-4 py-3 rounded-xl bg-[var(--bg-deep)] border border-[var(--glass-border)] focus:border-[var(--accent)] focus:outline-none text-white placeholder-white/30"
                                />
                            </div>

                            <div className="mb-6">
                                <label className="text-sm font-medium text-[var(--text-secondary)] mb-2 flex items-center gap-2">
                                    <Lock size={14} />
                                    Endurtaktu lykilorðið
                                </label>
                                <input
                                    type="password"
                                    value={confirm}
                                    onChange={(e) => setConfirm(e.target.value)}
                                    autoComplete="new-password"
                                    placeholder="Sama lykilorð aftur"
                                    className="w-full px-4 py-3 rounded-xl bg-[var(--bg-deep)] border border-[var(--glass-border)] focus:border-[var(--accent)] focus:outline-none text-white placeholder-white/30"
                                />
                            </div>

                            {error && <p className="text-red-400 text-sm mb-4 text-center">{error}</p>}
                            {notice && <p className="text-emerald-400 text-sm mb-4 text-center">{notice}</p>}

                            <button
                                type="submit"
                                disabled={saving}
                                className="w-full py-4 rounded-xl bg-[var(--accent)] text-white font-bold hover:brightness-110 transition-all disabled:opacity-50"
                            >
                                {saving ? 'Vista...' : 'Vista lykilorð'}
                            </button>
                        </form>
                    )}

                    {ready && !hasSession && (
                        <>
                            <p className="text-[var(--text-secondary)] text-sm mb-5 text-center">
                                Hlekkurinn er útrunninn eða þegar notaður. Fáðu nýjan sendan.
                            </p>
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

                            {error && <p className="text-red-400 text-sm mb-4 text-center">{error}</p>}
                            {notice && <p className="text-emerald-400 text-sm mb-4 text-center">{notice}</p>}

                            <button
                                type="button"
                                onClick={sendNewLink}
                                className="w-full py-4 rounded-xl bg-[var(--accent)] text-white font-bold hover:brightness-110 transition-all"
                            >
                                Senda nýjan hlekk
                            </button>
                        </>
                    )}

                    <p className="text-center mt-5">
                        <Link href="/admin" className="text-[var(--text-muted)] text-sm hover:text-white transition-colors">
                            Til baka í innskráningu
                        </Link>
                    </p>
                </div>
            </div>
        </main>
    );
}
