'use client';

import { useMemo, useState } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Download, RefreshCw, Instagram, Facebook, Square } from 'lucide-react';
import type { SocialFormat } from '@/lib/social/types';

/**
 * Admin page for social post generation.
 *
 * Phase 1 (current): Hawk edits text + citation + picks format/scheme,
 *   previews live, downloads PNG, posts to Facebook/Instagram manually.
 *
 * Phase 2 (future): auto-loads this week's passage from featured_weeks +
 *   bible_passages; scheduled auto-posting via Meta Graph API.
 */

const FORMAT_LABELS: Record<SocialFormat, { label: string; dims: string; icon: React.ReactNode }> = {
    square:    { label: 'Feed · 1:1',     dims: '1080 × 1080', icon: <Square size={14} /> },
    story:     { label: 'Story · 9:16',   dims: '1080 × 1920', icon: <Instagram size={14} /> },
    landscape: { label: 'Landscape · 1.91:1', dims: '1200 × 628', icon: <Facebook size={14} /> },
};

const DEFAULT_TEXT = 'Sælir eru fátækir í anda, því þeirra er himnaríki.';
const DEFAULT_CITATION = 'MATTEUS 5:3';

export default function SocialAdminPage() {
    const [text, setText] = useState(DEFAULT_TEXT);
    const [citation, setCitation] = useState(DEFAULT_CITATION);
    const [format, setFormat] = useState<SocialFormat>('square');
    const [scheme, setScheme] = useState<'primary' | 'cream'>('primary');
    const [cacheBust, setCacheBust] = useState(Date.now());

    const imgUrl = useMemo(() => {
        const params = new URLSearchParams({
            template: 'ritningin-vikunnar',
            format,
            scheme,
            text,
            citation,
            t: String(cacheBust),
        });
        return `/api/admin/social/generate?${params.toString()}`;
    }, [text, citation, format, scheme, cacheBust]);

    const filename = `omega-ritningin-${format}-${scheme}-${new Date().toISOString().slice(0, 10)}.png`;

    return (
        <AdminLayout>
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <div className="text-[11px] uppercase tracking-[0.2em] text-[var(--admin-text-muted)] mb-2">
                        Efnisverksmiðja
                    </div>
                    <h1 className="text-3xl font-serif text-[var(--admin-text)] mb-2">
                        Samfélagsmiðlar — Ritningin vikunnar
                    </h1>
                    <p className="text-[var(--admin-text-secondary)] max-w-2xl">
                        Búðu til ritningarpóst fyrir Instagram og Facebook. Breyttu textanum, veldu snið og lit, hlaðu niður PNG.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-6">
                    {/* Left: controls */}
                    <div className="space-y-5">
                        {/* Text input */}
                        <div>
                            <label className="block text-xs uppercase tracking-[0.15em] text-[var(--admin-text-muted)] mb-2">
                                Ritningartexti
                            </label>
                            <textarea
                                value={text}
                                onChange={(e) => setText(e.target.value)}
                                rows={4}
                                className="w-full rounded-lg bg-[var(--admin-surface)] border border-[var(--admin-border)] text-[var(--admin-text)] p-3 font-serif text-sm resize-none focus:outline-none focus:border-[var(--admin-accent)]"
                                placeholder="T.d. Sælir eru fátækir í anda…"
                            />
                            <div className="text-[11px] text-[var(--admin-text-muted)] mt-1">
                                {text.length} stafir · mælt með ≤ 220 fyrir læsileika
                            </div>
                        </div>

                        {/* Citation */}
                        <div>
                            <label className="block text-xs uppercase tracking-[0.15em] text-[var(--admin-text-muted)] mb-2">
                                Tilvísun
                            </label>
                            <input
                                type="text"
                                value={citation}
                                onChange={(e) => setCitation(e.target.value.toUpperCase())}
                                className="w-full rounded-lg bg-[var(--admin-surface)] border border-[var(--admin-border)] text-[var(--admin-text)] p-3 text-sm tracking-[0.15em] uppercase focus:outline-none focus:border-[var(--admin-accent)]"
                                placeholder="t.d. MATTEUS 5:3"
                            />
                        </div>

                        {/* Format */}
                        <div>
                            <label className="block text-xs uppercase tracking-[0.15em] text-[var(--admin-text-muted)] mb-2">
                                Snið
                            </label>
                            <div className="flex flex-col gap-2">
                                {(Object.keys(FORMAT_LABELS) as SocialFormat[]).map((f) => (
                                    <button
                                        key={f}
                                        onClick={() => setFormat(f)}
                                        className={`flex items-center justify-between w-full px-3 py-2.5 rounded-lg text-sm transition-colors ${format === f
                                            ? 'bg-[var(--admin-accent-subtle)] text-[var(--admin-accent)] border border-[var(--admin-accent)]'
                                            : 'bg-[var(--admin-surface)] border border-[var(--admin-border)] text-[var(--admin-text-secondary)] hover:text-[var(--admin-text)]'
                                            }`}
                                    >
                                        <span className="flex items-center gap-2">
                                            {FORMAT_LABELS[f].icon}
                                            {FORMAT_LABELS[f].label}
                                        </span>
                                        <span className="text-[11px] text-[var(--admin-text-muted)] font-mono">
                                            {FORMAT_LABELS[f].dims}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Scheme */}
                        <div>
                            <label className="block text-xs uppercase tracking-[0.15em] text-[var(--admin-text-muted)] mb-2">
                                Litaskema
                            </label>
                            <div className="grid grid-cols-2 gap-2">
                                <button
                                    onClick={() => setScheme('primary')}
                                    className={`px-3 py-2.5 rounded-lg text-sm transition-colors ${scheme === 'primary'
                                        ? 'bg-[var(--admin-accent-subtle)] text-[var(--admin-accent)] border border-[var(--admin-accent)]'
                                        : 'bg-[var(--admin-surface)] border border-[var(--admin-border)] text-[var(--admin-text-secondary)]'
                                        }`}
                                >
                                    Primary
                                    <div className="text-[10px] text-[var(--admin-text-muted)] mt-0.5">Kerti á Nótt</div>
                                </button>
                                <button
                                    onClick={() => setScheme('cream')}
                                    className={`px-3 py-2.5 rounded-lg text-sm transition-colors ${scheme === 'cream'
                                        ? 'bg-[var(--admin-accent-subtle)] text-[var(--admin-accent)] border border-[var(--admin-accent)]'
                                        : 'bg-[var(--admin-surface)] border border-[var(--admin-border)] text-[var(--admin-text-secondary)]'
                                        }`}
                                >
                                    Inverse
                                    <div className="text-[10px] text-[var(--admin-text-muted)] mt-0.5">Nótt á Skrá</div>
                                </button>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="pt-2 space-y-2">
                            <button
                                onClick={() => setCacheBust(Date.now())}
                                className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-sm border border-[var(--admin-border)] text-[var(--admin-text-secondary)] hover:text-[var(--admin-text)] hover:bg-[var(--admin-surface-hover)] transition-colors"
                            >
                                <RefreshCw size={14} />
                                Endurmeta forsýn
                            </button>
                            <a
                                href={imgUrl}
                                download={filename}
                                className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium bg-[var(--admin-accent)] text-black hover:bg-[var(--admin-accent-hover)] transition-colors"
                            >
                                <Download size={14} />
                                Hlaða niður PNG
                            </a>
                        </div>

                        {/* Help text */}
                        <div className="text-[11px] text-[var(--admin-text-muted)] pt-4 border-t border-[var(--admin-border)] leading-relaxed">
                            <strong className="text-[var(--admin-text-secondary)]">Hvernig á að birta:</strong>
                            <ol className="list-decimal pl-4 mt-2 space-y-1">
                                <li>Hladdu niður PNG í réttu sniði</li>
                                <li>Birtu handvirkt á Facebook/Instagram</li>
                                <li>Mundu eftir að setja tengda tilvitnun í lýsingu</li>
                            </ol>
                        </div>
                    </div>

                    {/* Right: live preview */}
                    <div>
                        <div className="text-xs uppercase tracking-[0.15em] text-[var(--admin-text-muted)] mb-3">
                            Forsýn — {FORMAT_LABELS[format].label}
                        </div>
                        <div
                            className="rounded-xl overflow-hidden bg-black flex items-center justify-center"
                            style={{
                                aspectRatio:
                                    format === 'square' ? '1 / 1' :
                                    format === 'story' ? '9 / 16' :
                                    '1.91 / 1',
                                maxWidth:
                                    format === 'story' ? '480px' :
                                    format === 'landscape' ? '900px' :
                                    '700px',
                                margin: '0 auto',
                            }}
                        >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src={imgUrl}
                                alt="Preview"
                                style={{ width: '100%', height: '100%', display: 'block' }}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
