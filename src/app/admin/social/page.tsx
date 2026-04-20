'use client';

import { useMemo, useState } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Download, RefreshCw, Instagram, Facebook, Square, BookOpen, Radio, Quote } from 'lucide-react';
import type { SocialFormat } from '@/lib/social/types';

/**
 * Admin page for social post generation.
 *
 * Supports multiple templates:
 *   - Ritningin vikunnar (Passage of the Week) — Bible verse card
 *   - Á morgun / Í kvöld (Broadcast Card) — upcoming broadcast announcement
 *
 * Phase 1 workflow: Hawk picks template, edits inputs, previews live,
 * downloads PNG, posts manually.
 */

type TemplateId = 'ritningin-vikunnar' | 'a-morgun' | 'ritstjoraroedd';

interface TemplateMeta {
    id: TemplateId;
    label: string;
    description: string;
    icon: React.ReactNode;
}

const TEMPLATES: TemplateMeta[] = [
    {
        id: 'ritningin-vikunnar',
        label: 'Ritningin vikunnar',
        description: 'Ritningarvers í hetjusniði. Mánudagar.',
        icon: <BookOpen size={16} />,
    },
    {
        id: 'a-morgun',
        label: 'Á morgun · Í kvöld',
        description: 'Útsending sem er að koma. Laugardagar og miðvikudagar.',
        icon: <Radio size={16} />,
    },
    {
        id: 'ritstjoraroedd',
        label: 'Ritstjórarödd',
        description: 'Tilvitnun úr prédikun með rödd ritstjóra. Þegar nýr þáttur er birtur.',
        icon: <Quote size={16} />,
    },
];

const FORMAT_LABELS: Record<SocialFormat, { label: string; dims: string; icon: React.ReactNode }> = {
    square:    { label: 'Feed · 1:1',         dims: '1080 × 1080', icon: <Square size={14} /> },
    story:     { label: 'Story · 9:16',       dims: '1080 × 1920', icon: <Instagram size={14} /> },
    landscape: { label: 'Landscape · 1.91:1', dims: '1200 × 628',  icon: <Facebook size={14} /> },
};

// ═══════════════════════════════════════════════════════════════════
// Per-template input state
// ═══════════════════════════════════════════════════════════════════

interface RitningState {
    text: string;
    citation: string;
}
const DEFAULT_RITNING: RitningState = {
    text: 'Sælir eru fátækir í anda, því þeirra er himnaríki.',
    citation: 'MATT. 5:3',
};

interface BroadcastState {
    prefix: string;
    when: string;
    programTitle: string;
    hostName: string;
    description: string;
}
const DEFAULT_BROADCAST: BroadcastState = {
    prefix: 'Á MORGUN',
    when: 'SUNNUDAGUR 20. APRÍL · KL. 20:00',
    programTitle: 'Sunnudagssamkoma',
    hostName: 'Eiríki Sigurbjörnssyni',
    description: 'Vikulegi lofgjörðar- og prédikunarþátturinn — í beinni útsendingu.',
};

interface RitstjoraroeddState {
    editorNote: string;
    sermonTitle: string;
    bibleRef: string;
    date: string;
}
const DEFAULT_RITSTJORAROEDD: RitstjoraroeddState = {
    editorNote: 'Þegar heimurinn hrikkur, kallar Guð okkur að treysta á það sem stendur eftir. Þessi orð Jesú eru hvíld fyrir þreytta sál — að auðurinn sem máli skiptir er ekki frá mönnum, heldur frá himnaríki sjálfu.',
    sermonTitle: 'Trúin sem sigrar',
    bibleRef: 'MATT. 5:3',
    date: '3. APRÍL 2026',
};

// ═══════════════════════════════════════════════════════════════════
// Page
// ═══════════════════════════════════════════════════════════════════

export default function SocialAdminPage() {
    const [template, setTemplate] = useState<TemplateId>('ritningin-vikunnar');
    const [format, setFormat] = useState<SocialFormat>('square');
    const [scheme, setScheme] = useState<'primary' | 'cream'>('primary');
    const [cacheBust, setCacheBust] = useState(Date.now());

    const [ritning, setRitning] = useState<RitningState>(DEFAULT_RITNING);
    const [broadcast, setBroadcast] = useState<BroadcastState>(DEFAULT_BROADCAST);
    const [ritstjoraroedd, setRitstjoraroedd] = useState<RitstjoraroeddState>(DEFAULT_RITSTJORAROEDD);

    const imgUrl = useMemo(() => {
        const params = new URLSearchParams({
            template,
            format,
            scheme,
            t: String(cacheBust),
        });
        if (template === 'ritningin-vikunnar') {
            params.set('text', ritning.text);
            params.set('citation', ritning.citation);
        } else if (template === 'a-morgun') {
            params.set('prefix', broadcast.prefix);
            params.set('when', broadcast.when);
            params.set('programTitle', broadcast.programTitle);
            params.set('hostName', broadcast.hostName);
            params.set('description', broadcast.description);
        } else if (template === 'ritstjoraroedd') {
            params.set('editorNote', ritstjoraroedd.editorNote);
            params.set('sermonTitle', ritstjoraroedd.sermonTitle);
            params.set('bibleRef', ritstjoraroedd.bibleRef);
            params.set('date', ritstjoraroedd.date);
        }
        return `/api/admin/social/generate?${params.toString()}`;
    }, [template, format, scheme, cacheBust, ritning, broadcast, ritstjoraroedd]);

    const filename = `omega-${template}-${format}-${scheme}-${new Date().toISOString().slice(0, 10)}.png`;

    return (
        <AdminLayout>
            <div className="max-w-7xl mx-auto">
                <div className="mb-8">
                    <div className="text-[11px] uppercase tracking-[0.2em] text-[var(--admin-text-muted)] mb-2">
                        Efnisverksmiðja
                    </div>
                    <h1 className="text-3xl font-serif text-[var(--admin-text)] mb-2">
                        Samfélagsmiðlar
                    </h1>
                    <p className="text-[var(--admin-text-secondary)] max-w-2xl">
                        Veldu snið, breyttu textanum, hlaðu niður PNG. Birtu handvirkt á Facebook og Instagram.
                    </p>
                </div>

                {/* Template selector */}
                <div className="mb-6">
                    <label className="block text-xs uppercase tracking-[0.15em] text-[var(--admin-text-muted)] mb-2">
                        Sniðmát
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {TEMPLATES.map((t) => (
                            <button
                                key={t.id}
                                onClick={() => setTemplate(t.id)}
                                className={`text-left p-4 rounded-lg transition-colors ${template === t.id
                                    ? 'bg-[var(--admin-accent-subtle)] border border-[var(--admin-accent)] text-[var(--admin-text)]'
                                    : 'bg-[var(--admin-surface)] border border-[var(--admin-border)] text-[var(--admin-text-secondary)] hover:border-[var(--admin-border-hover)]'
                                    }`}
                            >
                                <div className="flex items-center gap-2 mb-1">
                                    {t.icon}
                                    <span className="font-semibold text-sm">{t.label}</span>
                                </div>
                                <div className="text-xs text-[var(--admin-text-muted)] leading-relaxed">{t.description}</div>
                            </button>
                        ))}
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-6">
                    {/* Left: controls */}
                    <div className="space-y-5">
                        {/* Template-specific inputs */}
                        {template === 'ritningin-vikunnar' && (
                            <>
                                <div>
                                    <label className="block text-xs uppercase tracking-[0.15em] text-[var(--admin-text-muted)] mb-2">
                                        Ritningartexti
                                    </label>
                                    <textarea
                                        value={ritning.text}
                                        onChange={(e) => setRitning({ ...ritning, text: e.target.value })}
                                        rows={4}
                                        className="w-full rounded-lg bg-[var(--admin-surface)] border border-[var(--admin-border)] text-[var(--admin-text)] p-3 font-serif text-sm resize-none focus:outline-none focus:border-[var(--admin-accent)]"
                                    />
                                    <div className="text-[11px] text-[var(--admin-text-muted)] mt-1">
                                        {ritning.text.length} stafir · mælt með ≤ 220
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs uppercase tracking-[0.15em] text-[var(--admin-text-muted)] mb-2">
                                        Tilvísun
                                    </label>
                                    <input
                                        type="text"
                                        value={ritning.citation}
                                        onChange={(e) => setRitning({ ...ritning, citation: e.target.value.toUpperCase() })}
                                        className="w-full rounded-lg bg-[var(--admin-surface)] border border-[var(--admin-border)] text-[var(--admin-text)] p-3 text-sm tracking-[0.15em] uppercase focus:outline-none focus:border-[var(--admin-accent)]"
                                        placeholder="t.d. MATT. 5:3"
                                    />
                                </div>
                            </>
                        )}

                        {template === 'ritstjoraroedd' && (
                            <>
                                <div>
                                    <label className="block text-xs uppercase tracking-[0.15em] text-[var(--admin-text-muted)] mb-2">
                                        Rödd ritstjóra (40–80 orð)
                                    </label>
                                    <textarea
                                        value={ritstjoraroedd.editorNote}
                                        onChange={(e) => setRitstjoraroedd({ ...ritstjoraroedd, editorNote: e.target.value })}
                                        rows={7}
                                        className="w-full rounded-lg bg-[var(--admin-surface)] border border-[var(--admin-border)] text-[var(--admin-text)] p-3 font-serif italic text-sm resize-none focus:outline-none focus:border-[var(--admin-accent)]"
                                    />
                                    <div className="text-[11px] text-[var(--admin-text-muted)] mt-1">
                                        {ritstjoraroedd.editorNote.length} stafir · mælt með 200–500
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs uppercase tracking-[0.15em] text-[var(--admin-text-muted)] mb-2">
                                        Titill prédikunar
                                    </label>
                                    <input
                                        type="text"
                                        value={ritstjoraroedd.sermonTitle}
                                        onChange={(e) => setRitstjoraroedd({ ...ritstjoraroedd, sermonTitle: e.target.value })}
                                        className="w-full rounded-lg bg-[var(--admin-surface)] border border-[var(--admin-border)] text-[var(--admin-text)] p-3 font-serif text-sm focus:outline-none focus:border-[var(--admin-accent)]"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs uppercase tracking-[0.15em] text-[var(--admin-text-muted)] mb-2">
                                        Dagsetning
                                    </label>
                                    <input
                                        type="text"
                                        value={ritstjoraroedd.date}
                                        onChange={(e) => setRitstjoraroedd({ ...ritstjoraroedd, date: e.target.value.toUpperCase() })}
                                        className="w-full rounded-lg bg-[var(--admin-surface)] border border-[var(--admin-border)] text-[var(--admin-text)] p-3 text-sm tracking-[0.15em] uppercase focus:outline-none focus:border-[var(--admin-accent)]"
                                        placeholder="3. APRÍL 2026"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs uppercase tracking-[0.15em] text-[var(--admin-text-muted)] mb-2">
                                        Ritningarvers
                                    </label>
                                    <input
                                        type="text"
                                        value={ritstjoraroedd.bibleRef}
                                        onChange={(e) => setRitstjoraroedd({ ...ritstjoraroedd, bibleRef: e.target.value.toUpperCase() })}
                                        className="w-full rounded-lg bg-[var(--admin-surface)] border border-[var(--admin-border)] text-[var(--admin-text)] p-3 text-sm tracking-[0.15em] uppercase focus:outline-none focus:border-[var(--admin-accent)]"
                                        placeholder="MATT. 5:3"
                                    />
                                </div>
                            </>
                        )}

                        {template === 'a-morgun' && (
                            <>
                                <div>
                                    <label className="block text-xs uppercase tracking-[0.15em] text-[var(--admin-text-muted)] mb-2">
                                        Tímamerki
                                    </label>
                                    <input
                                        type="text"
                                        value={broadcast.prefix}
                                        onChange={(e) => setBroadcast({ ...broadcast, prefix: e.target.value.toUpperCase() })}
                                        className="w-full rounded-lg bg-[var(--admin-surface)] border border-[var(--admin-border)] text-[var(--admin-text)] p-3 text-sm tracking-[0.15em] uppercase focus:outline-none focus:border-[var(--admin-accent)]"
                                        placeholder="t.d. Á MORGUN"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs uppercase tracking-[0.15em] text-[var(--admin-text-muted)] mb-2">
                                        Dagsetning + tími
                                    </label>
                                    <input
                                        type="text"
                                        value={broadcast.when}
                                        onChange={(e) => setBroadcast({ ...broadcast, when: e.target.value.toUpperCase() })}
                                        className="w-full rounded-lg bg-[var(--admin-surface)] border border-[var(--admin-border)] text-[var(--admin-text)] p-3 text-sm tracking-[0.12em] uppercase focus:outline-none focus:border-[var(--admin-accent)]"
                                        placeholder="SUNNUDAGUR 20. APRÍL · KL. 20:00"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs uppercase tracking-[0.15em] text-[var(--admin-text-muted)] mb-2">
                                        Þáttur
                                    </label>
                                    <input
                                        type="text"
                                        value={broadcast.programTitle}
                                        onChange={(e) => setBroadcast({ ...broadcast, programTitle: e.target.value })}
                                        className="w-full rounded-lg bg-[var(--admin-surface)] border border-[var(--admin-border)] text-[var(--admin-text)] p-3 font-serif text-sm focus:outline-none focus:border-[var(--admin-accent)]"
                                        placeholder="Sunnudagssamkoma"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs uppercase tracking-[0.15em] text-[var(--admin-text-muted)] mb-2">
                                        Umsjónarmaður (þolfall)
                                    </label>
                                    <input
                                        type="text"
                                        value={broadcast.hostName}
                                        onChange={(e) => setBroadcast({ ...broadcast, hostName: e.target.value })}
                                        className="w-full rounded-lg bg-[var(--admin-surface)] border border-[var(--admin-border)] text-[var(--admin-text)] p-3 font-serif italic text-sm focus:outline-none focus:border-[var(--admin-accent)]"
                                        placeholder="Eiríki Sigurbjörnssyni"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs uppercase tracking-[0.15em] text-[var(--admin-text-muted)] mb-2">
                                        Lýsing
                                    </label>
                                    <textarea
                                        value={broadcast.description}
                                        onChange={(e) => setBroadcast({ ...broadcast, description: e.target.value })}
                                        rows={3}
                                        className="w-full rounded-lg bg-[var(--admin-surface)] border border-[var(--admin-border)] text-[var(--admin-text)] p-3 text-sm resize-none focus:outline-none focus:border-[var(--admin-accent)]"
                                    />
                                </div>
                            </>
                        )}

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
