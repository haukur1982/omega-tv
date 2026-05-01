'use client';

import { useEffect, useState, useCallback } from 'react';
import { Activity, CheckCircle2, AlertTriangle, AlertCircle, RefreshCw, Loader2 } from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';
import type { SystemEvent } from '@/lib/system-events';
import { supabase } from '@/lib/supabase';

/**
 * /admin/health — Heilsa kerfis.
 *
 * Reads the system_events log and renders the last N events grouped by
 * severity. Goal: a 5-second answer to "did the cron run last night?"
 * and "did the newsletter actually send?" without leaving the admin.
 */

async function authedFetch(input: string) {
    const { data: { session } } = await supabase.auth.getSession();
    return fetch(input, {
        headers: {
            ...(session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {}),
        },
    });
}

function severityColor(s: string) {
    switch (s) {
        case 'error': return { bg: 'rgba(229,85,85,0.12)', border: 'rgba(229,85,85,0.4)', color: '#ff8585', icon: AlertCircle };
        case 'warn':  return { bg: 'rgba(233,168,96,0.12)', border: 'rgba(233,168,96,0.4)', color: '#E9A860', icon: AlertTriangle };
        default:      return { bg: 'rgba(63,188,124,0.12)', border: 'rgba(63,188,124,0.3)', color: '#3fbc7c', icon: CheckCircle2 };
    }
}

export default function AdminHealthPage() {
    const [events, setEvents] = useState<SystemEvent[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'warn' | 'error'>('all');

    const load = useCallback(async () => {
        setIsLoading(true);
        const res = await authedFetch('/api/admin/health?limit=200');
        if (res.ok) {
            const data = await res.json();
            setEvents(data as SystemEvent[]);
        }
        setIsLoading(false);
    }, []);

    useEffect(() => { load(); }, [load]);

    const filtered = filter === 'all'
        ? events
        : events.filter(e => filter === 'error' ? e.severity === 'error' : e.severity !== 'info');

    const counts = {
        info: events.filter(e => e.severity === 'info').length,
        warn: events.filter(e => e.severity === 'warn').length,
        error: events.filter(e => e.severity === 'error').length,
    };

    return (
        <AdminLayout>
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="admin-h1">Heilsa kerfis</h1>
                    <p className="admin-body mt-1">
                        Síðustu atburðir bakenda — cron, sending, innflutningur, Bunny.
                    </p>
                </div>
                <button
                    type="button"
                    onClick={load}
                    disabled={isLoading}
                    className="admin-btn admin-btn-secondary admin-btn-icon"
                    title="Endurnýja"
                >
                    {isLoading ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />}
                </button>
            </div>

            {/* Summary chips */}
            <div className="flex gap-3 mb-6 flex-wrap">
                <button
                    type="button"
                    onClick={() => setFilter('all')}
                    className={`admin-btn ${filter === 'all' ? 'admin-btn-primary' : 'admin-btn-secondary'}`}
                >
                    Allt ({events.length})
                </button>
                <button
                    type="button"
                    onClick={() => setFilter('warn')}
                    className={`admin-btn ${filter === 'warn' ? 'admin-btn-primary' : 'admin-btn-secondary'}`}
                >
                    Aðvaranir + villur ({counts.warn + counts.error})
                </button>
                <button
                    type="button"
                    onClick={() => setFilter('error')}
                    className={`admin-btn ${filter === 'error' ? 'admin-btn-primary' : 'admin-btn-secondary'}`}
                >
                    Aðeins villur ({counts.error})
                </button>
            </div>

            {isLoading ? (
                <div className="admin-card admin-empty">
                    <Loader2 className="animate-spin" />
                </div>
            ) : filtered.length === 0 ? (
                <div className="admin-card admin-empty">
                    <Activity className="admin-empty-icon" />
                    <p className="admin-body">
                        {events.length === 0
                            ? 'Engar færslur enn — fyrsta cron eða sending lýsir hér.'
                            : 'Engar villur. Vel gengur.'}
                    </p>
                </div>
            ) : (
                <ul className="space-y-2 list-none p-0">
                    {filtered.map((ev) => {
                        const sev = severityColor(ev.severity);
                        const Icon = sev.icon;
                        return (
                            <li
                                key={ev.id}
                                style={{
                                    display: 'flex',
                                    gap: '12px',
                                    padding: '12px 16px',
                                    background: sev.bg,
                                    border: `1px solid ${sev.border}`,
                                    borderRadius: '6px',
                                    alignItems: 'flex-start',
                                }}
                            >
                                <Icon size={16} style={{ color: sev.color, flex: '0 0 auto', marginTop: '2px' }} />
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px', flexWrap: 'wrap' }}>
                                        <code style={{ fontSize: '0.75rem', color: 'var(--admin-text-secondary, #aaa)' }}>
                                            {ev.eventType}
                                        </code>
                                        <span style={{ fontSize: '0.74rem', color: 'var(--admin-text-muted, #888)' }}>
                                            {new Date(ev.createdAt).toLocaleString('is-IS')}
                                        </span>
                                        {ev.actor && (
                                            <span style={{ fontSize: '0.72rem', color: 'var(--admin-text-muted, #888)' }}>
                                                · {ev.actor}
                                            </span>
                                        )}
                                    </div>
                                    <p style={{ margin: '4px 0 0', fontSize: '0.88rem', color: 'var(--admin-text, #eee)' }}>
                                        {ev.message}
                                    </p>
                                    {ev.payload && Object.keys(ev.payload).length > 0 && (
                                        <details style={{ marginTop: '6px' }}>
                                            <summary style={{ fontSize: '0.72rem', color: 'var(--admin-text-muted, #888)', cursor: 'pointer' }}>
                                                Sýna gögn
                                            </summary>
                                            <pre style={{
                                                fontSize: '0.72rem',
                                                color: 'var(--admin-text-secondary, #aaa)',
                                                background: 'var(--admin-bg, #14120F)',
                                                padding: '8px',
                                                borderRadius: '4px',
                                                marginTop: '6px',
                                                overflow: 'auto',
                                            }}>
                                                {JSON.stringify(ev.payload, null, 2)}
                                            </pre>
                                        </details>
                                    )}
                                </div>
                            </li>
                        );
                    })}
                </ul>
            )}
        </AdminLayout>
    );
}
