'use client';

import { useEffect, useState, useCallback } from 'react';
import { use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import AdminLayout from '@/components/admin/AdminLayout';
import OsisPicker from '@/components/admin/OsisPicker';
import ChaptersEditor from '@/components/admin/ChaptersEditor';
import { supabase } from '@/lib/supabase';
import { Loader2, CheckCircle2, ArrowLeft, Save, Sparkles, ExternalLink, AlertCircle, RefreshCw } from 'lucide-react';

/**
 * /admin/drafts/[id] — the 2-minute review form.
 *
 * Every editable field in one place: title, description, editor_note,
 * bible_ref (via OsisPicker — prevents drift), chapters (via
 * ChaptersEditor), tags, captions_available, language_primary,
 * thumbnail_custom, series/season links.
 *
 * Two primary actions at the bottom: Save draft, Publish now.
 * A third "Fylla út sjálfvirkt" button calls the metadata generator
 * when that plumbing is wired — dormant for now.
 */

type Episode = {
    id: string;
    title: string;
    description: string | null;
    episode_number: number | null;
    bunny_video_id: string | null;
    thumbnail_custom: string | null;
    series_id: string | null;
    season_id: string | null;
    status: string | null;
    published_at: string | null;
    bible_ref: string | null;
    editor_note: string | null;
    chapters: { t: number; title: string }[] | null;
    tags: string[] | null;
    captions_available: string[] | null;
    transcript_url: string | null;
    language_primary: string | null;
};

type SeriesInfo = {
    id: string;
    title: string;
    slug: string;
    category: string | null;
};

type SaveStatus = 'idle' | 'saved-draft' | 'saved-published' | 'error';

// Category options shown in the inline picker on the "Hvar mun þetta birtast?"
// panel. Mirrors the categories /sermons renders shelves for. Order = display order.
const CATEGORY_OPTIONS: { value: string; label: string }[] = [
    { value: 'omega-produced', label: 'Útsendingar Omega' },
    { value: 'iceland-partners', label: 'Söfnuðir á Íslandi' },
    { value: 'international', label: 'Frá útlöndum' },
    { value: 'documentaries', label: 'Heimildarmyndir' },
    { value: 'music', label: 'Lofgjörð & tónleikar' },
    { value: 'kids', label: 'Barnaefni' },
];

function formatPublishedAt(iso: string | null): string {
    if (!iso) return '';
    try {
        return new Date(iso).toLocaleDateString('is-IS', { day: 'numeric', month: 'long', year: 'numeric' });
    } catch {
        return '';
    }
}

export default function DraftEditPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    // router unused now — publish stays on this page so Hawk sees the success banner + link
    const _router = useRouter();
    void _router;
    const [episode, setEpisode] = useState<Episode | null>(null);
    const [series, setSeries] = useState<SeriesInfo | null>(null);
    const [allSeries, setAllSeries] = useState<SeriesInfo[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [status, setStatus] = useState<SaveStatus>('idle');
    const [error, setError] = useState<string | null>(null);
    const [bunnyStatus, setBunnyStatus] = useState<'queued' | 'encoding' | 'ready' | 'error' | 'unknown' | 'loading' | null>(null);
    const [generatingThumb, setGeneratingThumb] = useState(false);
    const [thumbError, setThumbError] = useState<string | null>(null);

    useEffect(() => {
        (async () => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const sb = supabase as any;
            const { data, error: e } = await sb
                .from('episodes')
                .select('id, title, description, episode_number, bunny_video_id, thumbnail_custom, series_id, season_id, status, published_at, bible_ref, editor_note, chapters, tags, captions_available, transcript_url, language_primary')
                .eq('id', id)
                .single();
            if (!e && data) {
                setEpisode(data as Episode);
                // Fetch all series in parallel with the linked-series fetch — the
                // editor needs the full list for the picker so episodes can be
                // connected/reassigned without leaving the page.
                const allSeriesPromise = sb
                    .from('series')
                    .select('id, title, slug, category')
                    .order('title', { ascending: true });
                const linkedSeriesPromise = data.series_id
                    ? sb.from('series').select('id, title, slug, category').eq('id', data.series_id).single()
                    : Promise.resolve({ data: null });
                const [allRes, linkedRes] = await Promise.all([allSeriesPromise, linkedSeriesPromise]);
                if (allRes.data) setAllSeries(allRes.data as SeriesInfo[]);
                if (linkedRes.data) setSeries(linkedRes.data as SeriesInfo);
            } else {
                setError(e?.message ?? 'Fann ekki þátt.');
            }
            setLoading(false);
        })();
    }, [id]);

    const patch = useCallback((update: Partial<Episode>) => {
        setEpisode(prev => (prev ? { ...prev, ...update } : prev));
        // Any edit clears the success banner — Hawk knows there's unsaved work.
        setStatus(prev => (prev === 'saved-draft' || prev === 'saved-published' ? 'idle' : prev));
    }, []);

    const refreshBunnyStatus = useCallback(async (videoId: string) => {
        setBunnyStatus('loading');
        const { data: { session } } = await supabase.auth.getSession();
        const headers: Record<string, string> = {
            ...(session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {}),
        };
        const res = await fetch(`/api/admin/videos/${videoId}/status`, { headers });
        if (!res.ok) {
            setBunnyStatus('unknown');
            return;
        }
        const data = await res.json();
        setBunnyStatus(data.status ?? 'unknown');
    }, []);

    useEffect(() => {
        if (episode?.bunny_video_id) {
            refreshBunnyStatus(episode.bunny_video_id);
        }
    }, [episode?.bunny_video_id, refreshBunnyStatus]);

    const updateSeries = useCallback(async (nextSeriesId: string | null) => {
        if (!episode) return;
        const { data: { session } } = await supabase.auth.getSession();
        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
            ...(session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {}),
        };
        const res = await fetch(`/api/admin/episodes/${episode.id}`, {
            method: 'PATCH',
            headers,
            body: JSON.stringify({ series_id: nextSeriesId }),
        });
        if (!res.ok) {
            const data = await res.json().catch(() => ({ error: 'Villa' }));
            setError(data.error ?? 'Tókst ekki að uppfæra þáttaröð.');
            setStatus('error');
            return;
        }
        setEpisode(prev => prev ? { ...prev, series_id: nextSeriesId } : prev);
        setSeries(nextSeriesId ? (allSeries.find((s) => s.id === nextSeriesId) ?? null) : null);
    }, [episode, allSeries]);

    const generateThumbnail = useCallback(async () => {
        if (!episode?.bunny_video_id) return;
        setGeneratingThumb(true);
        setThumbError(null);
        const { data: { session } } = await supabase.auth.getSession();
        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
            ...(session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {}),
        };
        const res = await fetch('/api/admin/videos/thumbnail', {
            method: 'POST',
            headers,
            body: JSON.stringify({
                bunnyVideoId: episode.bunny_video_id,
                episodeId: episode.id,
                seriesName: series?.title,
                episodeTitle: episode.title,
                format: 'landscape',
            }),
        });
        if (!res.ok) {
            const data = await res.json().catch(() => ({ error: 'Villa' }));
            setThumbError(data.error ?? 'Tókst ekki að búa til efnistákn.');
            setGeneratingThumb(false);
            return;
        }
        const data = await res.json();
        // Route returns { success, url } — see src/app/api/admin/videos/thumbnail/route.ts
        if (data.url) {
            setEpisode(prev => prev ? { ...prev, thumbnail_custom: data.url } : prev);
        }
        setGeneratingThumb(false);
    }, [episode, series]);

    const save = useCallback(async (publish?: boolean): Promise<boolean> => {
        if (!episode) return false;
        setSaving(true);
        setError(null);
        const { data: { session } } = await supabase.auth.getSession();
        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
            ...(session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {}),
        };

        // PATCH the episode
        const patchBody = {
            title: episode.title,
            description: episode.description,
            episode_number: episode.episode_number,
            thumbnail_custom: episode.thumbnail_custom,
            bible_ref: episode.bible_ref,
            editor_note: episode.editor_note,
            chapters: episode.chapters,
            tags: episode.tags,
            captions_available: episode.captions_available,
            transcript_url: episode.transcript_url,
            language_primary: episode.language_primary,
        };
        const patchRes = await fetch(`/api/admin/episodes/${id}`, {
            method: 'PATCH',
            headers,
            body: JSON.stringify(patchBody),
        });
        if (!patchRes.ok) {
            const data = await patchRes.json().catch(() => ({ error: 'Villa' }));
            setError(data.error ?? 'Vistun tókst ekki.');
            setStatus('error');
            setSaving(false);
            return false;
        }

        if (publish) {
            const pubRes = await fetch(`/api/admin/episodes/${id}/publish`, {
                method: 'POST',
                headers,
            });
            if (!pubRes.ok) {
                const data = await pubRes.json().catch(() => ({ error: 'Villa' }));
                setError(data.error ?? 'Birting tókst ekki.');
                setStatus('error');
                setSaving(false);
                return false;
            }
            const pubBody = await pubRes.json().catch(() => null);
            // Reflect the new published state in local UI without a refetch — the
            // header pill and "Where will this appear?" panel rerender immediately.
            setEpisode(prev => prev ? {
                ...prev,
                status: 'published',
                published_at: pubBody?.episode?.published_at ?? new Date().toISOString(),
            } : prev);
        }

        setStatus(publish ? 'saved-published' : 'saved-draft');
        setSaving(false);
        // No redirect on publish — Hawk needs to see the success banner + clickable link.
        return true;
    }, [episode, id]);

    if (loading) {
        return (
            <AdminLayout>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--admin-text-muted, #888)', padding: '2rem' }}>
                    <Loader2 className="admin-spinner" size={16} />
                    Sæki drög…
                </div>
            </AdminLayout>
        );
    }

    if (!episode) {
        return (
            <AdminLayout>
                <div style={{ padding: '2rem' }}>
                    <p style={{ color: 'var(--admin-error, #e55)' }}>{error ?? 'Fann ekki þátt.'}</p>
                    <Link href="/admin/drafts" style={{ color: 'var(--admin-accent, #E9A860)' }}>← Til baka</Link>
                </div>
            </AdminLayout>
        );
    }

    const tagsString = (episode.tags ?? []).join(', ');
    const captionsString = (episode.captions_available ?? []).join(', ');

    return (
        <AdminLayout>
            <div style={{ maxWidth: '860px', margin: '0 auto' }}>
                <header style={{ marginBottom: '1.75rem' }}>
                    <Link
                        href="/admin/drafts"
                        style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            color: 'var(--admin-text-muted, #888)',
                            fontSize: '0.82rem',
                            textDecoration: 'none',
                            marginBottom: '12px',
                        }}
                    >
                        <ArrowLeft size={14} /> Innhólf
                    </Link>
                    <h1 style={{ margin: 0, fontSize: 'clamp(1.5rem, 2.5vw, 2rem)', fontWeight: 700, color: 'var(--admin-text, #eee)', letterSpacing: '-0.02em' }}>
                        Yfirferð draga
                    </h1>
                    <div style={{ marginTop: '10px', display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                        {episode.status === 'published' ? (
                            <>
                                <span style={pillPublished}>
                                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#3fbc7c' }} />
                                    BIRT
                                    {episode.published_at && (
                                        <span style={{ opacity: 0.75, fontWeight: 500 }}>
                                            · {formatPublishedAt(episode.published_at)}
                                        </span>
                                    )}
                                </span>
                                {episode.bunny_video_id && (
                                    <a
                                        href={`/sermons/${episode.bunny_video_id}`}
                                        target="_blank"
                                        rel="noreferrer"
                                        style={{
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            gap: '5px',
                                            color: 'var(--admin-accent, #E9A860)',
                                            fontSize: '0.82rem',
                                            textDecoration: 'none',
                                        }}
                                    >
                                        Skoða á vefnum <ExternalLink size={12} />
                                    </a>
                                )}
                            </>
                        ) : (
                            <span style={pillDraft}>
                                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#888' }} />
                                DRÖG · ekki birt
                            </span>
                        )}
                    </div>
                </header>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
                    {/* ── 1. Titill + lýsing ───────────────────────── */}
                    <FieldGroup label="Titill + lýsing">
                        <Field label="Titill">
                            <input
                                type="text"
                                value={episode.title ?? ''}
                                onChange={(e) => patch({ title: e.target.value })}
                                style={inputStyle}
                            />
                        </Field>
                        <Field label="Þáttanúmer">
                            <input
                                type="number"
                                value={episode.episode_number ?? ''}
                                onChange={(e) => patch({ episode_number: e.target.value ? parseInt(e.target.value, 10) : null })}
                                style={{ ...inputStyle, maxWidth: '120px' }}
                            />
                        </Field>
                        <Field label="Lýsing" hint="Tvær til þrjár efnisgreinar. Birtist á þáttasíðunni.">
                            <textarea
                                value={episode.description ?? ''}
                                onChange={(e) => patch({ description: e.target.value })}
                                rows={5}
                                style={{ ...inputStyle, resize: 'vertical', fontFamily: 'var(--font-serif, serif)' }}
                            />
                        </Field>
                    </FieldGroup>

                    {/* ── 2. Ritstjórnar­lína + ritning ───────────── */}
                    <FieldGroup label="Ritstjórn og ritning">
                        <Field label="Ritstjórnar­lína" hint="40–80 orð í kursívu — Haukur talar beint til áhorfandans. Birtist efst á þáttasíðunni.">
                            <textarea
                                value={episode.editor_note ?? ''}
                                onChange={(e) => patch({ editor_note: e.target.value })}
                                rows={3}
                                style={{ ...inputStyle, resize: 'vertical', fontFamily: 'var(--font-serif, serif)', fontStyle: 'italic' }}
                                maxLength={500}
                            />
                        </Field>
                        <Field label="Ritningar­tilvísun" hint="Ein akkerisvers fyrir þáttinn. Tengir saman sermur · greinar · bænir.">
                            <OsisPicker
                                value={episode.bible_ref}
                                onChange={(canonical) => patch({ bible_ref: canonical })}
                            />
                        </Field>
                    </FieldGroup>

                    {/* ── 3. Kaflar ────────────────────────────────── */}
                    <FieldGroup label="Kaflar">
                        <Field label="Tímasettir kaflar" hint="Birtast sem leiðarvísir með spilaranum.">
                            <ChaptersEditor
                                value={episode.chapters}
                                onChange={(chapters) => patch({ chapters })}
                            />
                        </Field>
                    </FieldGroup>

                    {/* ── 4. Flokkar + textar ──────────────────────── */}
                    <FieldGroup label="Flokkar og textar">
                        <Field label="Flokkar (tags)" hint="Aðskilin með kommum: samfelag, nad, ungmenni">
                            <input
                                type="text"
                                value={tagsString}
                                onChange={(e) => {
                                    const next = e.target.value
                                        .split(',')
                                        .map(s => s.trim().toLowerCase())
                                        .filter(s => s.length > 0);
                                    patch({ tags: next });
                                }}
                                style={inputStyle}
                            />
                        </Field>
                        <Field label="Textatungumál" hint="Tungumálakóðar aðskildir með kommum: is, en">
                            <input
                                type="text"
                                value={captionsString}
                                onChange={(e) => {
                                    const next = e.target.value
                                        .split(',')
                                        .map(s => s.trim().toLowerCase())
                                        .filter(s => s.length > 0);
                                    patch({ captions_available: next });
                                }}
                                style={{ ...inputStyle, maxWidth: '240px' }}
                            />
                        </Field>
                        <Field label="Aðalungumál">
                            <select
                                value={episode.language_primary ?? 'is'}
                                onChange={(e) => patch({ language_primary: e.target.value })}
                                style={{ ...inputStyle, maxWidth: '160px' }}
                            >
                                <option value="is">Íslenska</option>
                                <option value="en">English</option>
                            </select>
                        </Field>
                    </FieldGroup>

                    {/* ── 5. Efnistákn ──────────────────────────────── */}
                    <FieldGroup label="Efnistákn">
                        <Field label="Sérstakt efnistákn" hint="Valfrjáls URL. Ef autt — notum sjálfkrafa Bunny ramma.">
                            <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
                                <input
                                    type="text"
                                    value={episode.thumbnail_custom ?? ''}
                                    onChange={(e) => patch({ thumbnail_custom: e.target.value || null })}
                                    placeholder="https://…"
                                    style={{ ...inputStyle, flex: 1, minWidth: '200px' }}
                                />
                                {episode.bunny_video_id && (
                                    <button
                                        type="button"
                                        onClick={generateThumbnail}
                                        disabled={generatingThumb || bunnyStatus !== 'ready'}
                                        title={
                                            bunnyStatus === 'ready'
                                                ? 'Búa til myndatákn úr Bunny myndbandi (kvikmyndalegt — litastýring + texti).'
                                                : 'Bíð eftir að Bunny ljúki kóðun…'
                                        }
                                        style={{ ...btnGhost, opacity: bunnyStatus === 'ready' && !generatingThumb ? 1 : 0.45 }}
                                    >
                                        {generatingThumb
                                            ? <Loader2 size={14} className="admin-spinner" />
                                            : <Sparkles size={14} />}
                                        Búa til
                                    </button>
                                )}
                            </div>
                        </Field>
                        {/* Thumbnail preview — only shown when there's a URL set */}
                        {episode.thumbnail_custom && (
                            <div>
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                    src={episode.thumbnail_custom}
                                    alt="Forsýning"
                                    style={{
                                        display: 'block',
                                        width: '180px',
                                        aspectRatio: '16 / 9',
                                        objectFit: 'cover',
                                        borderRadius: '6px',
                                        border: '1px solid var(--admin-border, #333)',
                                        background: 'var(--admin-bg, #14120F)',
                                    }}
                                />
                            </div>
                        )}
                        {thumbError && (
                            <p style={{ margin: 0, color: 'var(--admin-error, #e55)', fontSize: '0.78rem' }}>
                                {thumbError}
                            </p>
                        )}
                        {episode.bunny_video_id && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', fontSize: '0.78rem' }}>
                                <BunnyStatusChip
                                    status={bunnyStatus}
                                    onRefresh={() => refreshBunnyStatus(episode.bunny_video_id!)}
                                />
                                <span style={{ color: 'var(--admin-text-muted, #888)' }}>
                                    Bunny: <code style={{ color: 'var(--admin-text-secondary, #aaa)' }}>{episode.bunny_video_id}</code>
                                </span>
                            </div>
                        )}
                    </FieldGroup>

                    {/* ── 6. Hvar mun þetta birtast? ──────────────────
                         The mental model panel. Every row tells Hawk
                         exactly which public surface this episode shows
                         up on, plus the one fix for any ✗ row. */}
                    <WhereWillThisAppearPanel
                        episode={episode}
                        series={series}
                        allSeries={allSeries}
                        onSeriesUpdate={(s) => setSeries(s)}
                        onSeriesChange={updateSeries}
                    />
                </div>

                {/* ── Post-action banner ────────────────────────────────
                     Lives above the action row so feedback is unmissable.
                     Three states match the SaveStatus enum + the error case. */}
                {status === 'saved-draft' && (
                    <div style={bannerAmber}>
                        <CheckCircle2 size={16} />
                        <span>
                            <strong>Vistað sem drög</strong> — aðeins þú sérð þetta núna. Smelltu á <strong>Vista og birta</strong> þegar þú ert tilbúinn.
                        </span>
                    </div>
                )}
                {status === 'saved-published' && episode.bunny_video_id && (
                    <div style={bannerGreen}>
                        <CheckCircle2 size={16} />
                        <span>
                            <strong>Birt.</strong> Sjáðu á vefnum:{' '}
                            <a
                                href={`/sermons/${episode.bunny_video_id}`}
                                target="_blank"
                                rel="noreferrer"
                                style={{ color: 'inherit', textDecoration: 'underline', fontWeight: 600 }}
                            >
                                /sermons/{episode.bunny_video_id}
                            </a>
                        </span>
                    </div>
                )}
                {status === 'error' && error && (
                    <div style={bannerRed}>
                        <AlertCircle size={16} />
                        <span><strong>Villa:</strong> {error}</span>
                    </div>
                )}

                {/* ── Actions ──────────────────────────────────────── */}
                <div
                    style={{
                        marginTop: '1.25rem',
                        padding: '18px 22px',
                        background: 'var(--admin-surface, #1f1d1a)',
                        border: '1px solid var(--admin-border, #333)',
                        borderRadius: '8px',
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: '12px',
                        alignItems: 'center',
                        justifyContent: 'flex-end',
                    }}
                >
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <button
                            type="button"
                            disabled
                            title="Sjálfvirk útfylling með Azotus kemur bráðum"
                            style={{ ...btnGhost, opacity: 0.45, cursor: 'not-allowed' }}
                        >
                            <Sparkles size={14} /> Fylla út sjálfvirkt
                        </button>
                        <button
                            type="button"
                            onClick={() => save(false)}
                            disabled={saving}
                            style={btnGhost}
                        >
                            {saving ? <Loader2 size={14} className="admin-spinner" /> : <Save size={14} />}
                            Vista drög
                        </button>
                        <button
                            type="button"
                            onClick={() => save(true)}
                            disabled={saving}
                            style={btnAmber}
                        >
                            {saving ? <Loader2 size={14} className="admin-spinner" /> : <CheckCircle2 size={14} />}
                            Vista og birta
                        </button>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}

/**
 * "Hvar mun þetta birtast?" — the mental-model panel.
 *
 * Reads the same state the editor already has + the joined series row
 * (loaded once on mount). Each row is a row of: ✓/✗ icon, surface name,
 * one-line "why" hint, and (for the category row) an inline picker that
 * does the one-click fix.
 *
 * No queries — purely derived. The single API call is the inline
 * category PATCH when the user picks a value.
 */
function WhereWillThisAppearPanel({
    episode,
    series,
    allSeries,
    onSeriesUpdate,
    onSeriesChange,
}: {
    episode: Episode;
    series: SeriesInfo | null;
    allSeries: SeriesInfo[];
    onSeriesUpdate: (s: SeriesInfo) => void;
    onSeriesChange: (nextSeriesId: string | null) => Promise<void>;
}) {
    const [savingCategory, setSavingCategory] = useState(false);
    const [categoryError, setCategoryError] = useState<string | null>(null);
    const [savingSeriesPick, setSavingSeriesPick] = useState(false);

    const isPublished = episode.status === 'published';
    const hasBunnyId = Boolean(episode.bunny_video_id);
    const inNewest = isPublished && hasBunnyId;
    const hasCategory = Boolean(series?.category);
    const isSundaySeries = series?.slug === 'sunnudagssamkoma';
    const directUrl = episode.bunny_video_id
        ? `https://omega.is/sermons/${episode.bunny_video_id}`
        : null;
    const hasSeries = Boolean(episode.series_id);

    const updateCategory = useCallback(async (next: string | null) => {
        if (!series) return;
        setSavingCategory(true);
        setCategoryError(null);
        const { data: { session } } = await supabase.auth.getSession();
        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
            ...(session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {}),
        };
        const res = await fetch(`/api/admin/series/${series.id}`, {
            method: 'PATCH',
            headers,
            body: JSON.stringify({ category: next }),
        });
        if (!res.ok) {
            const data = await res.json().catch(() => ({ error: 'Villa' }));
            setCategoryError(data.error ?? 'Tókst ekki að uppfæra flokk.');
            setSavingCategory(false);
            return;
        }
        onSeriesUpdate({ ...series, category: next });
        setSavingCategory(false);
    }, [series, onSeriesUpdate]);

    const matchedShelf = CATEGORY_OPTIONS.find((c) => c.value === series?.category);

    return (
        <FieldGroup label="Hvar mun þetta birtast?">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <ChecklistRow
                    ok={hasSeries}
                    title={hasSeries ? `Þáttaröð: ${series?.title ?? '—'}` : 'Þáttaröð'}
                    hint={hasSeries
                        ? 'Veldu aðra hér að neðan ef þetta er rangt — aftengsla með „án þáttaraðar“.'
                        : 'Þátturinn er ekki tengdur við þáttaröð. Veldu eina hér að neðan svo þetta birtist í réttu hillunni og á þáttaröðunarsíðunni.'}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                        <select
                            value={episode.series_id ?? ''}
                            onChange={async (e) => {
                                setSavingSeriesPick(true);
                                await onSeriesChange(e.target.value || null);
                                setSavingSeriesPick(false);
                            }}
                            disabled={savingSeriesPick}
                            style={{ ...inputStyle, maxWidth: '320px' }}
                        >
                            <option value="">— án þáttaraðar —</option>
                            {allSeries.map((s) => (
                                <option key={s.id} value={s.id}>{s.title}</option>
                            ))}
                        </select>
                        {savingSeriesPick && <Loader2 size={14} className="admin-spinner" />}
                        <a
                            href="/admin/series/new"
                            target="_blank"
                            rel="noreferrer"
                            style={{ color: 'var(--admin-accent, #E9A860)', fontSize: '0.78rem', textDecoration: 'none' }}
                        >
                            + Ný þáttaröð
                        </a>
                    </div>
                </ChecklistRow>
                <ChecklistRow
                    ok={inNewest}
                    title="Nýlega bætt við (Þáttasafn)"
                    hint={inNewest
                        ? 'Birtist í forsíðurail á /sermons.'
                        : 'Birtist um leið og þú smellir á Vista og birta.'}
                />
                <ChecklistRow
                    ok={hasCategory && isPublished}
                    title={hasCategory && matchedShelf
                        ? `Hilla: ${matchedShelf.label}`
                        : 'Hilla (flokkur þáttaraðar)'}
                    hint={!series
                        ? 'Veldu fyrst þáttaröð hér að ofan — flokkurinn fylgir þáttaröðinni.'
                        : !hasCategory
                            ? 'Þáttaröðin er ekki flokkuð. Veldu flokk hér að neðan til að birtast í réttu hilluinni — annars birtist hún undir „Annað efni“.'
                            : isPublished
                                ? `Birtist í hillunni „${matchedShelf?.label}“ á /sermons.`
                                : 'Flokkur er settur — birtist í hillunni um leið og þátturinn er birtur.'}
                >
                    {series && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                            <select
                                value={series.category ?? ''}
                                onChange={(e) => updateCategory(e.target.value || null)}
                                disabled={savingCategory}
                                style={{ ...inputStyle, maxWidth: '280px' }}
                            >
                                <option value="">— án flokks —</option>
                                {CATEGORY_OPTIONS.map((c) => (
                                    <option key={c.value} value={c.value}>{c.label}</option>
                                ))}
                            </select>
                            {savingCategory && <Loader2 size={14} className="admin-spinner" />}
                            {categoryError && (
                                <span style={{ color: 'var(--admin-error, #e55)', fontSize: '0.78rem' }}>
                                    {categoryError}
                                </span>
                            )}
                        </div>
                    )}
                </ChecklistRow>
                <ChecklistRow
                    ok={isSundaySeries && isPublished}
                    title="Sunnudagssamkoma vikunnar (Heim + Þáttasafn)"
                    hint={isSundaySeries
                        ? (isPublished
                            ? 'Þetta er nýjasti birti þátturinn í Sunnudagssamkomu — birtist sem aðalkort á /heim og /sermons.'
                            : 'Birtist sem aðalkort á /heim þegar þátturinn er birtur.')
                        : 'Aðeins þáttaraðir með slug = „sunnudagssamkoma“ birtast hér. Þessi þáttaröð er ekki Sunnudagssamkoma.'}
                />
                <ChecklistRow
                    ok={hasBunnyId}
                    title="Bein slóð"
                    hint={hasBunnyId
                        ? 'Virkar strax — jafnvel í drögum.'
                        : 'Bunny myndband vantar — drög er ekki tengt við Bunny enn.'}
                >
                    {directUrl && (
                        <code
                            style={{
                                display: 'inline-block',
                                padding: '6px 10px',
                                background: 'var(--admin-bg, #14120F)',
                                border: '1px solid var(--admin-border, #333)',
                                borderRadius: '4px',
                                fontSize: '0.78rem',
                                color: 'var(--admin-text-secondary, #aaa)',
                                userSelect: 'all',
                                wordBreak: 'break-all',
                            }}
                        >
                            {directUrl}
                        </code>
                    )}
                </ChecklistRow>
            </div>
        </FieldGroup>
    );
}

/**
 * BunnyStatusChip — small encoding-state pill next to the Bunny GUID.
 * Polled once on mount via the parent's refreshBunnyStatus; user can hit
 * the refresh icon to re-poll mid-encode.
 */
function BunnyStatusChip({
    status,
    onRefresh,
}: {
    status: 'queued' | 'encoding' | 'ready' | 'error' | 'unknown' | 'loading' | null;
    onRefresh: () => void;
}) {
    const meta = (() => {
        switch (status) {
            case 'ready':    return { color: '#3fbc7c', bg: 'rgba(63,188,124,0.12)', border: 'rgba(63,188,124,0.4)', label: 'Tilbúið í Bunny' };
            case 'encoding': return { color: '#E9A860', bg: 'rgba(233,168,96,0.12)', border: 'rgba(233,168,96,0.4)', label: 'Verið að umbreyta…' };
            case 'queued':   return { color: '#E9A860', bg: 'rgba(233,168,96,0.12)', border: 'rgba(233,168,96,0.4)', label: 'Í biðröð' };
            case 'error':    return { color: '#ff8585', bg: 'rgba(229,85,85,0.12)', border: 'rgba(229,85,85,0.4)', label: 'Villa í kóðun' };
            case 'loading':  return { color: '#888',    bg: 'rgba(120,120,120,0.12)', border: 'var(--admin-border, #333)', label: 'Sæki…' };
            default:         return { color: '#888',    bg: 'rgba(120,120,120,0.12)', border: 'var(--admin-border, #333)', label: 'Óþekkt' };
        }
    })();

    return (
        <span
            style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '4px 10px',
                borderRadius: '999px',
                fontSize: '0.74rem',
                fontWeight: 600,
                background: meta.bg,
                color: meta.color,
                border: `1px solid ${meta.border}`,
            }}
        >
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: meta.color }} />
            {meta.label}
            <button
                type="button"
                onClick={onRefresh}
                aria-label="Endurnýja stöðu"
                style={{
                    border: 'none',
                    background: 'transparent',
                    padding: 0,
                    color: 'inherit',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    opacity: 0.7,
                }}
            >
                {status === 'loading'
                    ? <Loader2 size={11} className="admin-spinner" />
                    : <RefreshCw size={11} />}
            </button>
        </span>
    );
}

function ChecklistRow({
    ok,
    title,
    hint,
    children,
}: {
    ok: boolean;
    title: string;
    hint: string;
    children?: React.ReactNode;
}) {
    return (
        <div
            style={{
                display: 'flex',
                gap: '12px',
                padding: '12px 14px',
                background: 'var(--admin-bg, #14120F)',
                border: '1px solid var(--admin-border, #333)',
                borderRadius: '6px',
            }}
        >
            <span
                aria-hidden
                style={{
                    flex: '0 0 auto',
                    width: '20px',
                    height: '20px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    background: ok ? 'rgba(63,188,124,0.15)' : 'rgba(120,120,120,0.12)',
                    color: ok ? '#3fbc7c' : 'var(--admin-text-muted, #888)',
                    border: ok ? '1px solid rgba(63,188,124,0.4)' : '1px solid var(--admin-border, #333)',
                    marginTop: '2px',
                }}
            >
                {ok ? '✓' : '✗'}
            </span>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <span style={{ color: 'var(--admin-text, #eee)', fontSize: '0.88rem', fontWeight: 600 }}>
                    {title}
                </span>
                <span style={{ color: 'var(--admin-text-muted, #888)', fontSize: '0.8rem', lineHeight: 1.5 }}>
                    {hint}
                </span>
                {children}
            </div>
        </div>
    );
}

function FieldGroup({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <fieldset
            style={{
                border: '1px solid var(--admin-border, #333)',
                borderRadius: '8px',
                padding: '20px 22px 22px',
                background: 'var(--admin-surface, #1f1d1a)',
                margin: 0,
                display: 'flex',
                flexDirection: 'column',
                gap: '18px',
            }}
        >
            <legend
                style={{
                    padding: '0 8px',
                    color: 'var(--admin-accent, #E9A860)',
                    fontSize: '0.68rem',
                    fontWeight: 600,
                    letterSpacing: '0.2em',
                    textTransform: 'uppercase',
                }}
            >
                {label}
            </legend>
            {children}
        </fieldset>
    );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
    return (
        <label style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <span style={{ color: 'var(--admin-text, #eee)', fontSize: '0.88rem', fontWeight: 500 }}>{label}</span>
            {children}
            {hint && <span style={{ color: 'var(--admin-text-muted, #888)', fontSize: '0.76rem', fontStyle: 'italic' }}>{hint}</span>}
        </label>
    );
}

const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '10px 12px',
    background: 'var(--admin-bg, #14120F)',
    border: '1px solid var(--admin-border, #333)',
    borderRadius: '4px',
    color: 'var(--admin-text, #eee)',
    fontSize: '0.92rem',
    fontFamily: 'inherit',
    outline: 'none',
};

const btnGhost: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '10px 18px',
    background: 'transparent',
    border: '1px solid var(--admin-border, #333)',
    borderRadius: '6px',
    color: 'var(--admin-text, #eee)',
    fontSize: '0.84rem',
    fontWeight: 600,
    cursor: 'pointer',
};

const pillBase: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    padding: '6px 12px',
    borderRadius: '999px',
    fontSize: '0.72rem',
    fontWeight: 700,
    letterSpacing: '0.18em',
    textTransform: 'uppercase',
};

const pillDraft: React.CSSProperties = {
    ...pillBase,
    background: 'rgba(120,120,120,0.12)',
    color: 'var(--admin-text-muted, #888)',
    border: '1px solid var(--admin-border, #333)',
};

const pillPublished: React.CSSProperties = {
    ...pillBase,
    background: 'rgba(63,188,124,0.12)',
    color: '#3fbc7c',
    border: '1px solid rgba(63,188,124,0.3)',
};

const bannerBase: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '14px 18px',
    borderRadius: '8px',
    fontSize: '0.88rem',
    lineHeight: 1.5,
    marginTop: '2rem',
};

const bannerAmber: React.CSSProperties = {
    ...bannerBase,
    background: 'rgba(233,168,96,0.1)',
    border: '1px solid rgba(233,168,96,0.35)',
    color: 'var(--admin-accent, #E9A860)',
};

const bannerGreen: React.CSSProperties = {
    ...bannerBase,
    background: 'rgba(63,188,124,0.1)',
    border: '1px solid rgba(63,188,124,0.4)',
    color: '#7fd9a4',
};

const bannerRed: React.CSSProperties = {
    ...bannerBase,
    background: 'rgba(229,85,85,0.1)',
    border: '1px solid rgba(229,85,85,0.4)',
    color: '#ff8585',
};

const btnAmber: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '10px 22px',
    background: 'var(--admin-accent, #E9A860)',
    border: '1px solid var(--admin-accent, #E9A860)',
    borderRadius: '6px',
    color: '#14120F',
    fontSize: '0.84rem',
    fontWeight: 700,
    cursor: 'pointer',
};
