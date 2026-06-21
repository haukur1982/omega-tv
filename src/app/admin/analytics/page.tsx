'use client';

import { useEffect, useState } from 'react';
import {
    Eye, Clock, Film, Users, RefreshCw, Play, Globe,
    Heart, MessageSquare, BookOpen, ArrowUpRight, Inbox,
} from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';
import StatCard from '@/components/admin/StatCard';
import { authedFetch } from '@/lib/admin-fetch';
import type { AnalyticsPayload } from '@/lib/analytics';

const nf = (n: number) => n.toLocaleString('is-IS');

export default function AdminAnalyticsPage() {
    const [data, setData] = useState<AnalyticsPayload | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const load = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const res = await authedFetch('/api/admin/analytics');
            if (!res.ok) throw new Error(`Server svaraði ${res.status}`);
            setData(await res.json());
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Tókst ekki að sækja greiningu');
        }
        setIsLoading(false);
    };

    useEffect(() => { load(); }, []);

    const vod = data?.vod;
    const maxDayViews = Math.max(1, ...(vod?.viewsByDay ?? []).map((d) => d.views));
    const maxVideoViews = Math.max(1, ...(vod?.topVideos ?? []).map((v) => v.views));
    const maxCountry = Math.max(1, ...(vod?.countries ?? []).map((c) => c.views));

    return (
        <AdminLayout>
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="admin-h1">Greining</h1>
                    <p className="admin-body mt-1">Áhorf, efni og þátttaka. Síðustu 30 dagar.</p>
                </div>
                <button onClick={load} className="admin-btn admin-btn-secondary admin-btn-icon" disabled={isLoading}>
                    <RefreshCw size={18} className={isLoading ? 'admin-spinner' : ''} />
                </button>
            </div>

            {error && (
                <div className="admin-card mb-6" style={{ borderColor: 'var(--admin-error)' }}>
                    <p className="admin-body" style={{ color: 'var(--admin-error)' }}>{error}</p>
                </div>
            )}

            {/* ── Headline numbers ─────────────────────────────────────────── */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <StatCard
                    label="VOD áhorf (30 d)"
                    value={vod ? nf(vod.views30d) : '—'}
                    icon={<Eye size={16} />}
                    subtitle={vod ? `${nf(vod.views7d)} síðustu 7 daga` : undefined}
                />
                <StatCard
                    label="Áhorfsstundir (30 d)"
                    value={vod ? nf(vod.watchHours30d) : '—'}
                    icon={<Clock size={16} />}
                    subtitle={vod?.engagementScore != null ? `Þátttaka ${Math.round(vod.engagementScore)}%` : undefined}
                />
                <StatCard
                    label="Birtir þættir"
                    value={data ? nf(data.content.episodesPublished) : '—'}
                    icon={<Film size={16} />}
                    subtitle={data ? `${nf(data.content.shows)} þáttaraðir` : undefined}
                />
                <StatCard
                    label="Áskrifendur"
                    value={data ? nf(data.engagement.subscribers) : '—'}
                    icon={<Users size={16} />}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                {/* ── Top videos ───────────────────────────────────────────── */}
                <div className="admin-card lg:col-span-2">
                    <div className="flex items-center gap-2 mb-4">
                        <Play size={16} className="text-[var(--admin-accent)]" />
                        <h3 className="admin-h3">Mest horft</h3>
                    </div>
                    {vod && vod.topVideos.length > 0 ? (
                        <div className="space-y-3">
                            {vod.topVideos.map((v) => (
                                <div key={v.guid}>
                                    <div className="flex items-baseline justify-between gap-3 mb-1">
                                        <span className="text-sm text-[var(--admin-text)] truncate">{v.title}</span>
                                        <span className="text-sm font-semibold text-[var(--admin-text)] shrink-0">
                                            {nf(v.views)}
                                        </span>
                                    </div>
                                    <div className="h-1.5 rounded-full bg-[var(--admin-bg)] overflow-hidden">
                                        <div
                                            className="h-full rounded-full bg-[var(--admin-accent)]"
                                            style={{ width: `${(v.views / maxVideoViews) * 100}%` }}
                                        />
                                    </div>
                                    <span className="text-xs text-[var(--admin-text-muted)]">
                                        {v.show ?? 'Án þáttaraðar'} · {v.lengthMin} mín
                                    </span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <EmptyNote text={vod?.ok === false ? 'Náði ekki í áhorfstölur frá Bunny.' : 'Engar áhorfstölur enn.'} />
                    )}
                </div>

                {/* ── Countries ────────────────────────────────────────────── */}
                <div className="admin-card">
                    <div className="flex items-center gap-2 mb-4">
                        <Globe size={16} className="text-[var(--admin-accent)]" />
                        <h3 className="admin-h3">Hvaðan er horft</h3>
                    </div>
                    {vod && vod.countries.length > 0 ? (
                        <div className="space-y-3">
                            {vod.countries.map((c) => (
                                <div key={c.code}>
                                    <div className="flex items-baseline justify-between mb-1">
                                        <span className="text-sm text-[var(--admin-text)]">{countryName(c.code)}</span>
                                        <span className="text-sm font-semibold text-[var(--admin-text)]">{nf(c.views)}</span>
                                    </div>
                                    <div className="h-1.5 rounded-full bg-[var(--admin-bg)] overflow-hidden">
                                        <div className="h-full rounded-full bg-[var(--admin-accent)]"
                                            style={{ width: `${(c.views / maxCountry) * 100}%` }} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <EmptyNote text="Engin landagögn enn." />
                    )}
                </div>
            </div>

            {/* ── Views trend (30d) ────────────────────────────────────────── */}
            <div className="admin-card mb-6">
                <h3 className="admin-h3 mb-4">Áhorf síðustu 30 daga</h3>
                {vod && vod.viewsByDay.length > 0 ? (
                    <div className="flex items-end gap-[3px]" style={{ height: 96 }}>
                        {vod.viewsByDay.map((d) => (
                            <div key={d.date} className="flex-1 group relative flex items-end" style={{ height: '100%' }}>
                                <div
                                    className="w-full rounded-t bg-[var(--admin-accent)] opacity-80 group-hover:opacity-100 transition-opacity"
                                    style={{ height: `${Math.max(2, (d.views / maxDayViews) * 100)}%` }}
                                    title={`${d.date}: ${d.views}`}
                                />
                            </div>
                        ))}
                    </div>
                ) : (
                    <EmptyNote text="Ekki nóg gögn til að teikna línurit enn." />
                )}
            </div>

            {/* ── Engagement + pipeline ───────────────────────────────────── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="admin-card">
                    <h3 className="admin-h3 mb-4">Þátttaka</h3>
                    <div className="space-y-3">
                        <MiniStat icon={<Heart size={15} />} label="Bænir" value={data ? `${nf(data.engagement.prayersPending)} bíða · ${nf(data.engagement.prayersTotal)} alls` : '—'} />
                        <MiniStat icon={<MessageSquare size={15} />} label="Vitnisburðir" value={data ? nf(data.engagement.testimonials) : '—'} />
                        <MiniStat icon={<BookOpen size={15} />} label="Bókavinir" value={data ? nf(data.engagement.bookSignups) : '—'} />
                        <MiniStat icon={<Inbox size={15} />} label="Þættir í drögum" value={data ? nf(data.content.episodesDraft) : '—'} />
                    </div>
                </div>

                <div className="admin-card">
                    <h3 className="admin-h3 mb-4">Nýjustu innflutningar</h3>
                    {data && data.content.recentImports.length > 0 ? (
                        <ul className="space-y-2">
                            {data.content.recentImports.map((r, i) => (
                                <li key={i} className="flex items-baseline justify-between gap-3">
                                    <span className="text-sm text-[var(--admin-text-secondary)] truncate">{r.title}</span>
                                    <span className="text-xs text-[var(--admin-text-muted)] shrink-0">{timeAgo(r.at)}</span>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <EmptyNote text="Engir innflutningar enn." />
                    )}
                </div>

                {/* Web traffic lives in Vercel — be honest about where it is. */}
                <div className="admin-card">
                    <h3 className="admin-h3 mb-2">Vefumferð</h3>
                    <p className="text-sm text-[var(--admin-text-secondary)] mb-4">
                        Heimsóknir og flettingar á omega.is eru mældar með Vercel Web Analytics. Tölurnar
                        sjást í Vercel mælaborðinu.
                    </p>
                    <a
                        href="https://vercel.com/haukur1982-1838s-projects/omega-tv/analytics"
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--admin-accent)] hover:underline"
                    >
                        Opna Vercel Analytics <ArrowUpRight size={14} />
                    </a>
                </div>
            </div>

            {data && (
                <p className="text-xs text-[var(--admin-text-muted)] mt-6">
                    Uppfært {new Date(data.generatedAt).toLocaleString('is-IS')}. Áhorfstölur frá Bunny Stream.
                </p>
            )}
        </AdminLayout>
    );
}

function MiniStat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
    return (
        <div className="flex items-center justify-between p-3 rounded-lg bg-[var(--admin-bg)]">
            <span className="flex items-center gap-2 text-sm text-[var(--admin-text-secondary)]">
                <span className="text-[var(--admin-accent)]">{icon}</span>{label}
            </span>
            <span className="text-sm font-semibold text-[var(--admin-text)]">{value}</span>
        </div>
    );
}

function EmptyNote({ text }: { text: string }) {
    return <p className="text-sm text-[var(--admin-text-muted)] py-4">{text}</p>;
}

const COUNTRY_NAMES: Record<string, string> = {
    IS: 'Ísland', US: 'Bandaríkin', GB: 'Bretland', DK: 'Danmörk', NO: 'Noregur',
    SE: 'Svíþjóð', DE: 'Þýskaland', NL: 'Holland', CA: 'Kanada', PL: 'Pólland',
    ES: 'Spánn', FR: 'Frakkland',
};
function countryName(code: string): string {
    return COUNTRY_NAMES[code] ?? code;
}

function timeAgo(iso: string): string {
    const diff = Date.now() - new Date(iso).getTime();
    const m = Math.floor(diff / 60000);
    if (m < 60) return `${m}m`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}klst`;
    return `${Math.floor(h / 24)}d`;
}
