'use client';

import { useState, useEffect } from 'react';
import { Check, X, AlertCircle, Shield } from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';

interface EnvStatus {
    label: string;
    key: string;
    isSet: boolean;
    description: string;
}

export default function AdminSettingsPage() {
    const [envChecks, setEnvChecks] = useState<EnvStatus[]>([]);

    useEffect(() => {
        // These are checked client-side — only NEXT_PUBLIC_ vars are visible
        // For server-side vars, we'd need an API route
        const checks: EnvStatus[] = [
            {
                label: 'Supabase URL',
                key: 'NEXT_PUBLIC_SUPABASE_URL',
                isSet: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
                description: 'Tengist gagnagrunni og auðkenningu',
            },
            {
                label: 'Supabase Anon Key',
                key: 'NEXT_PUBLIC_SUPABASE_ANON_KEY',
                isSet: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
                description: 'Almennur lykill fyrir client-side tengingar',
            },
            {
                label: 'Bunny Library ID',
                key: 'NEXT_PUBLIC_BUNNY_LIBRARY_ID',
                isSet: !!process.env.NEXT_PUBLIC_BUNNY_LIBRARY_ID,
                description: 'Myndbandasafn á Bunny.net',
            },
            {
                label: 'Live Stream ID',
                key: 'NEXT_PUBLIC_BUNNY_LIVE_STREAM_ID',
                isSet: !!process.env.NEXT_PUBLIC_BUNNY_LIVE_STREAM_ID,
                description: 'Beint streymi á Bunny.net (valfrjálst)',
            },
            {
                label: 'Live Stream Embed',
                key: 'NEXT_PUBLIC_LIVE_STREAM_EMBED_URL',
                isSet: !!process.env.NEXT_PUBLIC_LIVE_STREAM_EMBED_URL,
                description: 'Restream eða annar spilari fyrir beint streymi',
            },
        ];

        setEnvChecks(checks);
    }, []);

    const setCount = envChecks.filter(e => e.isSet).length;
    const totalCount = envChecks.length;

    return (
        <AdminLayout>
            <div className="max-w-3xl">
                <div className="mb-8">
                    <h1 className="admin-h1">Stillingar</h1>
                    <p className="admin-body mt-1">Yfirlit yfir tengingar og uppsetningu</p>
                </div>

                {/* Connection Status */}
                <div className="admin-card mb-6">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 rounded-lg bg-[var(--admin-accent-subtle)] flex items-center justify-center">
                            <Shield size={20} className="text-[var(--admin-accent)]" />
                        </div>
                        <div>
                            <h2 className="admin-h3">Tengingar</h2>
                            <p className="admin-caption">
                                {setCount}/{totalCount} stillingar virkjar
                            </p>
                        </div>
                    </div>

                    <div className="space-y-3">
                        {envChecks.map((check) => (
                            <div
                                key={check.key}
                                className="flex items-center justify-between p-3 rounded-lg bg-[var(--admin-bg)] border border-[var(--admin-border)]"
                            >
                                <div className="flex items-center gap-3">
                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                                        check.isSet
                                            ? 'bg-[var(--admin-success-subtle)] text-[var(--admin-success)]'
                                            : 'bg-[var(--admin-warning-subtle)] text-[var(--admin-warning)]'
                                    }`}>
                                        {check.isSet ? <Check size={16} /> : <AlertCircle size={16} />}
                                    </div>
                                    <div>
                                        <span className="text-sm font-medium text-[var(--admin-text)]">
                                            {check.label}
                                        </span>
                                        <p className="text-xs text-[var(--admin-text-muted)]">{check.description}</p>
                                    </div>
                                </div>
                                <span className={`admin-badge ${check.isSet ? 'admin-badge-success' : 'admin-badge-warning'}`}>
                                    {check.isSet ? 'Virkt' : 'Vantar'}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Server-side notice */}
                <div className="admin-card">
                    <div className="flex items-start gap-3">
                        <AlertCircle size={18} className="text-[var(--admin-info)] mt-0.5 flex-shrink-0" />
                        <div>
                            <h3 className="admin-h3 mb-1">Athugasemd um þjónlykla</h3>
                            <p className="admin-body text-sm">
                                Þjónlyklar (Supabase Service Role, Bunny API Key, Resend API Key) eru
                                ekki sýnilegir hér vegna öryggis. Þeir eru aðeins aðgengilegir á þjóni.
                                Breyttu þeim í <code className="px-1.5 py-0.5 rounded bg-[var(--admin-surface-hover)] text-xs font-mono text-[var(--admin-accent)]">.env.local</code> eða
                                í umhverfisbreytum á hýsingarveitu (Vercel, Railway, o.s.frv.).
                            </p>
                        </div>
                    </div>
                </div>

                {/* App Info */}
                <div className="mt-8 pt-6 border-t border-[var(--admin-border)]">
                    <div className="flex items-center justify-between text-sm text-[var(--admin-text-muted)]">
                        <span>Omega TV · Stjórnborð</span>
                        <span>Next.js · Supabase · Bunny.net</span>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
