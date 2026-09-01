'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import {
    ArrowLeft,
    ArrowUp,
    ArrowDown,
    Check,
    Phone,
    Plus,
    RefreshCw,
    Tv,
    X,
} from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';
import MigrationNotice from '@/components/admin/MigrationNotice';
import { PRAYER_MINISTRY_MIGRATION } from '@/lib/ministry-shared';
import { authedFetch } from '@/lib/admin-fetch';

/**
 * /admin/prayers/utsending — the producer stack.
 *
 * This is the screen open in the studio while a prayer program is on the air,
 * often on an iPad held by the host. So: two columns that collapse to one, type
 * in the stack big enough to read from a metre away, one unambiguous action per
 * card, and no drag-and-drop anywhere near it.
 *
 * Only prayers whose owner said yes reach this page — approved, air_consent,
 * not yet aired. The consent gate is in the query (getBroadcastBoard), not in
 * this file, so nothing rendered here can ever be a prayer nobody released.
 */

/**
 * The reorder controls are hit by a host holding an iPad while a programme is
 * live. admin-btn-icon is 36px, which is fine for a desk and not fine for that.
 */
const TAP = { minWidth: '44px', minHeight: '44px' } as const;

interface Prayer {
    id: string;
    name: string;
    topic: string;
    content: string;
    timestamp: number;
    source: 'vefur' | 'simi' | 'utsending';
    broadcastQueue: number | null;
}

export default function AdminUtsendingPage() {
    const [eligible, setEligible] = useState<Prayer[]>([]);
    const [stack, setStack] = useState<Prayer[]>([]);
    const [missing, setMissing] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [program, setProgram] = useState('');
    const [busyId, setBusyId] = useState<string | null>(null);

    const load = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const res = await authedFetch('/api/admin/prayers/utsending');
            if (!res.ok) throw new Error(`Server svaraði ${res.status}`);
            const d = await res.json();
            setMissing(!!d.missing);
            setEligible(d.eligible ?? []);
            setStack(d.stack ?? []);
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Tókst ekki að sækja bænir');
        }
        setIsLoading(false);
    }, []);

    useEffect(() => { load(); }, [load]);

    const post = useCallback(async (body: Record<string, unknown>) => {
        const res = await authedFetch('/api/admin/prayers/utsending', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        });
        if (!res.ok) {
            const d = await res.json().catch(() => ({}));
            if (d?.missing) setMissing(true);
            setError(d?.error ?? `Aðgerðin mistókst (${res.status})`);
            return false;
        }
        return true;
    }, []);

    const handleAdd = async (p: Prayer) => {
        setBusyId(p.id);
        // Optimistic: the studio cannot wait on a round trip mid-program.
        setEligible((list) => list.filter((x) => x.id !== p.id));
        setStack((list) => [...list, p]);
        const ok = await post({ action: 'add', id: p.id });
        if (!ok) await load();
        setBusyId(null);
    };

    const handleRemove = async (p: Prayer) => {
        setBusyId(p.id);
        setStack((list) => list.filter((x) => x.id !== p.id));
        setEligible((list) => [p, ...list]);
        const ok = await post({ action: 'remove', id: p.id });
        if (!ok) await load();
        setBusyId(null);
    };

    const move = async (index: number, delta: number) => {
        const target = index + delta;
        if (target < 0 || target >= stack.length) return;
        const next = [...stack];
        [next[index], next[target]] = [next[target], next[index]];
        setStack(next);
        const ok = await post({ action: 'order', ids: next.map((p) => p.id) });
        if (!ok) await load();
    };

    const handleAired = async (p: Prayer) => {
        setBusyId(p.id);
        setStack((list) => list.filter((x) => x.id !== p.id));
        const ok = await post({ action: 'aired', id: p.id, program });
        if (!ok) await load();
        setBusyId(null);
    };

    return (
        <AdminLayout>
            <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
                <div>
                    <Link
                        href="/admin/prayers"
                        className="admin-caption inline-flex items-center gap-1.5 mb-2 hover:text-[var(--admin-text)]"
                    >
                        <ArrowLeft size={13} />
                        Bænabeiðnir
                    </Link>
                    <h1 className="admin-h1">Bænir í útsendingu</h1>
                    <p className="admin-body mt-1">
                        Bænir sem má bera fram í beinni — aðeins þær sem fólk gaf leyfi fyrir.
                    </p>
                </div>
                <button
                    onClick={load}
                    className="admin-btn admin-btn-secondary admin-btn-icon"
                    disabled={isLoading}
                    aria-label="Endurhlaða"
                >
                    <RefreshCw size={18} className={isLoading ? 'admin-spinner' : ''} />
                </button>
            </div>

            {missing ? (
                <MigrationNotice
                    file={PRAYER_MINISTRY_MIGRATION}
                    what="Bænaþjónustan þarf nýja dálka í gagnagrunninum áður en þessi skjár virkar."
                    meanwhile="Bænatorgið og bænalistinn virka óbreytt á meðan."
                />
            ) : (
                <>
                    {error && (
                        <div className="admin-card mb-5 border-l-2 border-l-[var(--admin-error)]">
                            <p className="admin-body">{error}</p>
                        </div>
                    )}

                    {/* The program name, typed once at the top of the session and
                        stamped onto every prayer marked "Borin fram". */}
                    <div className="admin-card mb-6">
                        <label htmlFor="program" className="admin-label block mb-2">
                            Hvaða þáttur er í gangi?
                        </label>
                        <input
                            id="program"
                            type="text"
                            value={program}
                            onChange={(e) => setProgram(e.target.value)}
                            placeholder="t.d. Bænastund 1. september"
                            className="admin-input"
                        />
                        <p className="admin-caption mt-2">
                            Skráist á hverja bæn sem þú merkir „borin fram“.
                        </p>
                    </div>

                    <div className="grid gap-6 lg:grid-cols-2">
                        {/* ── Left: eligible ─────────────────────────────── */}
                        <section>
                            <h2 className="admin-h3 mb-3">
                                Til reiðu
                                <span className="admin-caption ml-2">{eligible.length}</span>
                            </h2>

                            {isLoading ? (
                                <div className="admin-card"><div className="h-5 w-2/3 admin-skeleton" /></div>
                            ) : eligible.length === 0 ? (
                                <div className="admin-card admin-empty">
                                    <Tv className="admin-empty-icon" />
                                    <p className="admin-body">
                                        Engin bæn bíður. Bænir birtast hér þegar þær eru samþykktar og
                                        viðkomandi hefur leyft að biðja fyrir þeim í útsendingu.
                                    </p>
                                </div>
                            ) : (
                                <div className="grid gap-3">
                                    {eligible.map((p) => (
                                        <article key={p.id} className="admin-card">
                                            <div className="flex items-start justify-between gap-3 mb-2">
                                                <div className="flex items-center gap-2 min-w-0">
                                                    <h3 className="admin-h3 truncate">{p.name}</h3>
                                                    <span className="admin-badge admin-badge-neutral">{p.topic}</span>
                                                </div>
                                                {p.source === 'simi' && (
                                                    <span className="admin-caption flex items-center gap-1 flex-shrink-0">
                                                        <Phone size={12} /> sími
                                                    </span>
                                                )}
                                            </div>
                                            <p className="admin-body mb-4">{p.content}</p>
                                            <button
                                                onClick={() => handleAdd(p)}
                                                disabled={busyId === p.id}
                                                className="admin-btn admin-btn-secondary w-full sm:w-auto justify-center"
                                                style={{ minHeight: '44px' }}
                                            >
                                                <Plus size={16} />
                                                Í bunkann
                                            </button>
                                        </article>
                                    ))}
                                </div>
                            )}
                        </section>

                        {/* ── Right: the stack ───────────────────────────── */}
                        <section>
                            <h2 className="admin-h3 mb-3">
                                Bunkinn
                                <span className="admin-caption ml-2">{stack.length}</span>
                            </h2>

                            {stack.length === 0 ? (
                                <div className="admin-card admin-empty">
                                    <Tv className="admin-empty-icon" />
                                    <p className="admin-body">
                                        Bunkinn er tómur. Settu bænir í hann áður en þátturinn byrjar.
                                    </p>
                                </div>
                            ) : (
                                <div className="grid gap-3">
                                    {stack.map((p, i) => (
                                        <article
                                            key={p.id}
                                            className="admin-card border-l-2 border-l-[var(--admin-accent)]"
                                        >
                                            <div className="flex items-start justify-between gap-3 mb-3">
                                                <div className="flex items-center gap-2 min-w-0">
                                                    <span className="admin-stat-number">{i + 1}</span>
                                                    <div className="min-w-0">
                                                        <h3 className="admin-h3 truncate">{p.name}</h3>
                                                        <span className="admin-caption">{p.topic}</span>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-1 flex-shrink-0">
                                                    <button
                                                        onClick={() => move(i, -1)}
                                                        disabled={i === 0}
                                                        className="admin-btn admin-btn-ghost admin-btn-icon disabled:opacity-30"
                                                        style={TAP}
                                                        aria-label="Færa upp"
                                                    >
                                                        <ArrowUp size={16} />
                                                    </button>
                                                    <button
                                                        onClick={() => move(i, 1)}
                                                        disabled={i === stack.length - 1}
                                                        className="admin-btn admin-btn-ghost admin-btn-icon disabled:opacity-30"
                                                        style={TAP}
                                                        aria-label="Færa niður"
                                                    >
                                                        <ArrowDown size={16} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleRemove(p)}
                                                        className="admin-btn admin-btn-ghost admin-btn-icon"
                                                        style={TAP}
                                                        aria-label="Taka úr bunkanum"
                                                    >
                                                        <X size={16} />
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Read from a metre away — this is the line the host prays. */}
                                            <p
                                                className="text-[var(--admin-text)]"
                                                style={{ fontSize: '21px', lineHeight: 1.5 }}
                                            >
                                                {p.content}
                                            </p>

                                            <button
                                                onClick={() => handleAired(p)}
                                                disabled={busyId === p.id}
                                                className="admin-btn admin-btn-primary w-full justify-center mt-4"
                                                style={{ minHeight: '52px', fontSize: '15px' }}
                                            >
                                                <Check size={18} />
                                                Borin fram
                                            </button>
                                        </article>
                                    ))}
                                </div>
                            )}
                        </section>
                    </div>
                </>
            )}
        </AdminLayout>
    );
}
