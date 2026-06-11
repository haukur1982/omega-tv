'use client';

import { useCallback, useEffect, useState } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { authedFetch } from '@/lib/admin-fetch';
import { BookOpen, Check, Loader2, RotateCcw } from 'lucide-react';

/**
 * /admin/bokavinir — the Bókavinir work list ("call-up system").
 *
 * Every signup is an envelope to send: name + home address, newest
 * first. "Merkja sent" moves it out of the queue; "Afturkalla" brings
 * it back if a book bounces. The address block is formatted so it can
 * be copied straight onto a label.
 */

interface Signup {
    id: string;
    created_at: string;
    name: string;
    email: string;
    phone: string | null;
    address: string;
    postal_code: string | null;
    city: string | null;
    book_slug: string;
    wants_newsletter: boolean;
    status: 'new' | 'sent';
}

export default function BokavinirAdminPage() {
    const [signups, setSignups] = useState<Signup[]>([]);
    const [loading, setLoading] = useState(true);
    const [busy, setBusy] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const res = await authedFetch('/api/admin/book-signups');
            const json = await res.json();
            if (!res.ok) throw new Error(json.error ?? 'Tókst ekki að sækja listann.');
            setSignups(json.signups);
            setError(null);
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Villa kom upp.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        load();
    }, [load]);

    async function setStatus(id: string, status: 'new' | 'sent') {
        setBusy(id);
        try {
            const res = await authedFetch(`/api/admin/book-signups/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status }),
            });
            if (!res.ok) throw new Error((await res.json()).error ?? 'Tókst ekki að uppfæra.');
            setSignups((prev) => prev.map((s) => (s.id === id ? { ...s, status } : s)));
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Villa kom upp.');
        } finally {
            setBusy(null);
        }
    }

    const queue = signups.filter((s) => s.status === 'new');
    const sent = signups.filter((s) => s.status === 'sent');

    return (
        <AdminLayout>
            <div className="max-w-5xl">
                <div className="flex items-center gap-3 mb-1">
                    <BookOpen size={22} className="text-[var(--admin-accent)]" />
                    <h1 className="text-2xl font-semibold text-[var(--admin-text)]">Bókavinir</h1>
                </div>
                <p className="text-sm text-[var(--admin-text-secondary)] mb-8">
                    Skráningar af /baekur — hver lína er bók sem á að senda heim.
                    {signups.length > 0 && (
                        <span className="ml-2 font-medium text-[var(--admin-text)]">
                            {queue.length} í bið · {sent.length} sendar
                        </span>
                    )}
                </p>

                {error && (
                    <div className="mb-6 rounded-lg border border-[var(--admin-error)] bg-[var(--admin-error-subtle)] px-4 py-3 text-sm text-[var(--admin-error)]">
                        {error}
                    </div>
                )}

                {loading ? (
                    <div className="flex items-center gap-3 text-[var(--admin-text-secondary)]">
                        <Loader2 size={18} className="admin-spinner" /> Sæki listann…
                    </div>
                ) : signups.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-[var(--admin-border)] p-10 text-center text-[var(--admin-text-secondary)]">
                        Engar skráningar enn — listinn fyllist þegar fólk skráir sig á /baekur.
                    </div>
                ) : (
                    <div className="space-y-10">
                        <SignupGroup
                            title="Í bið — bækur til að senda"
                            rows={queue}
                            busy={busy}
                            action={(s) => setStatus(s.id, 'sent')}
                            actionLabel="Merkja sent"
                            actionIcon={<Check size={14} />}
                        />
                        <SignupGroup
                            title="Sendar"
                            rows={sent}
                            busy={busy}
                            action={(s) => setStatus(s.id, 'new')}
                            actionLabel="Afturkalla"
                            actionIcon={<RotateCcw size={14} />}
                            muted
                        />
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}

function SignupGroup({
    title,
    rows,
    busy,
    action,
    actionLabel,
    actionIcon,
    muted = false,
}: {
    title: string;
    rows: Signup[];
    busy: string | null;
    action: (s: Signup) => void;
    actionLabel: string;
    actionIcon: React.ReactNode;
    muted?: boolean;
}) {
    if (rows.length === 0) return null;
    return (
        <section>
            <h2 className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--admin-text-muted)]">
                {title} ({rows.length})
            </h2>
            <div className="space-y-3">
                {rows.map((s) => (
                    <div
                        key={s.id}
                        className={`rounded-xl border border-[var(--admin-border)] bg-[var(--admin-surface)] p-5 ${muted ? 'opacity-65' : ''}`}
                    >
                        <div className="flex flex-wrap items-start justify-between gap-4">
                            <div>
                                <div className="font-semibold text-[var(--admin-text)]">{s.name}</div>
                                <div className="mt-1 whitespace-pre-line text-sm text-[var(--admin-text-secondary)]">
                                    {s.address}
                                    {'\n'}
                                    {[s.postal_code, s.city].filter(Boolean).join(' ')}
                                </div>
                                <div className="mt-2 text-xs text-[var(--admin-text-muted)]">
                                    {s.email}
                                    {s.phone && <> · {s.phone}</>}
                                    {' · '}
                                    {new Date(s.created_at).toLocaleDateString('is-IS', {
                                        day: 'numeric',
                                        month: 'short',
                                        year: 'numeric',
                                    })}
                                    {s.wants_newsletter && (
                                        <span className="ml-2 rounded bg-[var(--admin-accent-subtle)] px-1.5 py-0.5 text-[10px] font-semibold text-[var(--admin-accent)]">
                                            fréttabréf
                                        </span>
                                    )}
                                </div>
                            </div>
                            <button
                                onClick={() => action(s)}
                                disabled={busy === s.id}
                                className="flex items-center gap-1.5 rounded-lg border border-[var(--admin-border)] px-3 py-2 text-xs font-semibold text-[var(--admin-text-secondary)] transition-colors hover:bg-[var(--admin-surface-hover)] hover:text-[var(--admin-text)] disabled:opacity-50"
                            >
                                {busy === s.id ? <Loader2 size={14} className="admin-spinner" /> : actionIcon}
                                {actionLabel}
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}
