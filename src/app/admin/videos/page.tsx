'use client';

import { useEffect, useState, useCallback } from 'react';
import {
    Search, Film, Calendar, Eye, Link as LinkIcon, AlertCircle,
    CheckCircle, X, Upload, Loader2, Plus, FileVideo, Sparkles,
    ArrowRight, RefreshCw, Trash2, Clock
} from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';
import { getLinkedBunnyIds, getAllSeries, Series, createEpisode, createSeason, getDraftEpisodes, Episode } from '@/lib/vod-db';

interface BunnyVideo {
    guid: string;
    title: string;
    date: string;
    views: number;
    length: number;
    thumbnailUrl: string;
}

type UploadStep = 'idle' | 'preparing' | 'uploading' | 'encoding' | 'linking' | 'done' | 'error';

export default function VideosPage() {
    const [videos, setVideos] = useState<BunnyVideo[]>([]);
    const [linkedIds, setLinkedIds] = useState<Set<string>>(new Set());
    const [seriesList, setSeriesList] = useState<Series[]>([]);
    const [drafts, setDrafts] = useState<Episode[]>([]);

    // UI State
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState<'drafts' | 'library'>('drafts');

    // Upload State
    const [showUpload, setShowUpload] = useState(false);
    const [uploadFile, setUploadFile] = useState<File | null>(null);
    const [uploadStep, setUploadStep] = useState<UploadStep>('idle');
    const [uploadProgress, setUploadProgress] = useState(0);
    const [uploadError, setUploadError] = useState('');
    const [dragOver, setDragOver] = useState(false);

    // Upload Form
    const [uploadSeriesName, setUploadSeriesName] = useState('');
    const [uploadEpisodeTitle, setUploadEpisodeTitle] = useState('');
    const [uploadEpisodeNumber, setUploadEpisodeNumber] = useState(1);
    const [uploadDescription, setUploadDescription] = useState('');
    const [newSeriesMode, setNewSeriesMode] = useState(false);

    // Draft Review State
    const [reviewingDraft, setReviewingDraft] = useState<Episode | null>(null);
    const [draftSeriesName, setDraftSeriesName] = useState('');
    const [draftTitle, setDraftTitle] = useState('');
    const [draftEpisodeNumber, setDraftEpisodeNumber] = useState(1);
    const [draftDescription, setDraftDescription] = useState('');
    const [draftNewSeries, setDraftNewSeries] = useState(false);
    const [isPublishing, setIsPublishing] = useState(false);
    const [isGeneratingThumb, setIsGeneratingThumb] = useState(false);
    const [generatedThumbUrl, setGeneratedThumbUrl] = useState<string | null>(null);

    // Existing connect state
    const [connectingVideo, setConnectingVideo] = useState<BunnyVideo | null>(null);
    const [selectedSeriesId, setSelectedSeriesId] = useState('');
    const [episodeTitle, setEpisodeTitle] = useState('');
    const [episodeNumber, setEpisodeNumber] = useState(1);
    const [isSaving, setIsSaving] = useState(false);

    const LIBRARY_ID = process.env.NEXT_PUBLIC_BUNNY_LIBRARY_ID;

    const loadData = async () => {
        setIsLoading(true);
        try {
            const [videosRes, linkedRes, seriesRes, draftsRes] = await Promise.all([
                fetch('/api/admin/videos').then(r => r.json()),
                getLinkedBunnyIds(),
                getAllSeries(),
                getDraftEpisodes(),
            ]);

            if (Array.isArray(videosRes)) setVideos(videosRes);
            if (linkedRes) setLinkedIds(new Set(linkedRes));
            if (seriesRes) setSeriesList(seriesRes);
            if (draftsRes) setDrafts(draftsRes);

            // Auto-switch to drafts tab if there are drafts
            if (draftsRes && draftsRes.length > 0) setActiveTab('drafts');
        } catch (e) {
            console.error(e);
        }
        setIsLoading(false);
    };

    useEffect(() => { loadData(); }, []);

    // ═══ UPLOAD FLOW ═══

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setDragOver(false);
        const file = e.dataTransfer.files[0];
        if (file && file.type.startsWith('video/')) {
            setUploadFile(file);
            setUploadEpisodeTitle(file.name.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' '));
        }
    }, []);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setUploadFile(file);
            setUploadEpisodeTitle(file.name.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' '));
        }
    };

    const handleUploadPublish = async () => {
        if (!uploadFile || !uploadSeriesName || !uploadEpisodeTitle) return;
        setUploadError('');

        try {
            setUploadStep('preparing');
            const initRes = await fetch('/api/admin/videos/upload', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title: uploadEpisodeTitle }),
            });
            if (!initRes.ok) throw new Error('Villa við að búa til myndbandsfærslu');
            const { guid, uploadUrl, apiKey } = await initRes.json();

            setUploadStep('uploading');
            setUploadProgress(0);

            await new Promise<void>((resolve, reject) => {
                const xhr = new XMLHttpRequest();
                xhr.open('PUT', uploadUrl, true);
                xhr.setRequestHeader('AccessKey', apiKey);
                xhr.setRequestHeader('Content-Type', 'application/octet-stream');
                xhr.upload.onprogress = (e) => {
                    if (e.lengthComputable) setUploadProgress(Math.round((e.loaded / e.total) * 100));
                };
                xhr.onload = () => xhr.status >= 200 && xhr.status < 300 ? resolve() : reject(new Error(`Upload mistókst: ${xhr.status}`));
                xhr.onerror = () => reject(new Error('Nettenging rofnaði'));
                xhr.send(uploadFile);
            });

            setUploadStep('linking');
            const linkRes = await fetch('/api/admin/videos/link', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    bunnyGuid: guid,
                    seriesName: uploadSeriesName,
                    episodeTitle: uploadEpisodeTitle,
                    episodeNumber: uploadEpisodeNumber,
                    description: uploadDescription,
                }),
            });
            if (!linkRes.ok) throw new Error('Villa við að skrá þátt í gagnagrunn');

            setUploadStep('done');
            setTimeout(() => {
                setShowUpload(false);
                resetUploadForm();
                loadData();
            }, 2000);
        } catch (err: any) {
            console.error('Upload error:', err);
            setUploadError(err.message || 'Óþekkt villa');
            setUploadStep('error');
        }
    };

    const resetUploadForm = () => {
        setUploadFile(null);
        setUploadStep('idle');
        setUploadProgress(0);
        setUploadError('');
        setUploadSeriesName('');
        setUploadEpisodeTitle('');
        setUploadEpisodeNumber(1);
        setUploadDescription('');
        setNewSeriesMode(false);
    };

    // ═══ DRAFT REVIEW & PUBLISH ═══

    const openDraftReview = (draft: Episode) => {
        setReviewingDraft(draft);
        setDraftTitle(draft.title || '');
        setDraftEpisodeNumber(draft.episode_number || 1);
        setDraftDescription(draft.description || '');
        setDraftSeriesName('');
        setDraftNewSeries(false);
        setGeneratedThumbUrl(draft.thumbnail_custom || null);
    };

    const handleGenerateThumbnail = async () => {
        if (!reviewingDraft) return;
        setIsGeneratingThumb(true);
        try {
            const res = await fetch('/api/admin/videos/thumbnail', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    bunnyVideoId: reviewingDraft.bunny_video_id,
                    seriesName: draftSeriesName || undefined,
                    episodeTitle: draftTitle || undefined,
                    episodeId: reviewingDraft.id,
                }),
            });
            if (res.ok) {
                const { url } = await res.json();
                setGeneratedThumbUrl(url);
            }
        } catch (e) {
            console.error('Thumbnail generation failed:', e);
        }
        setIsGeneratingThumb(false);
    };

    const handlePublishDraft = async () => {
        if (!reviewingDraft || !draftSeriesName || !draftTitle) return;
        setIsPublishing(true);

        try {
            // Step 1: Link to series
            const linkRes = await fetch('/api/admin/videos/link', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    bunnyGuid: reviewingDraft.bunny_video_id,
                    seriesName: draftSeriesName,
                    episodeTitle: draftTitle,
                    episodeNumber: draftEpisodeNumber,
                    description: draftDescription,
                }),
            });

            if (!linkRes.ok) throw new Error('Villa við að tengja');

            // Step 2: Delete the draft (the link route created a new published episode)
            const deleteRes = await fetch(`/api/admin/videos/link`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ episodeId: reviewingDraft.id }),
            });

            setReviewingDraft(null);
            loadData();
        } catch (err) {
            console.error('Publish error:', err);
            alert('Villa við birtingu');
        }
        setIsPublishing(false);
    };

    const handleDeleteDraft = async (draft: Episode) => {
        if (!confirm(`Eyða drögum: "${draft.title}"?`)) return;
        try {
            await fetch('/api/admin/videos/link', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ episodeId: draft.id }),
            });
            loadData();
        } catch (e) {
            console.error(e);
        }
    };

    // ═══ CONNECT FLOW (existing videos) ═══

    const handleConnectClick = (video: BunnyVideo) => {
        setConnectingVideo(video);
        setEpisodeTitle(video.title.replace('.mp4', ''));
        setEpisodeNumber(1);
        setSelectedSeriesId('');
    };

    const handleSaveConnection = async () => {
        if (!selectedSeriesId || !connectingVideo) return;
        setIsSaving(true);
        try {
            const series = seriesList.find(s => s.id === selectedSeriesId);
            if (!series) return;
            let seasonId = '';
            // @ts-ignore
            if (series.seasons && series.seasons.length > 0) {
                // @ts-ignore
                seasonId = series.seasons[0].id;
            } else {
                const newSeason = await createSeason(series.id, 1, 'Sería 1');
                if (!newSeason) { alert('Gat ekki búið til sería.'); setIsSaving(false); return; }
                seasonId = newSeason.id;
            }
            await createEpisode({
                series_id: series.id, season_id: seasonId,
                bunny_video_id: connectingVideo.guid, title: episodeTitle,
                episode_number: episodeNumber, description: '',
            });
            const newSet = new Set(linkedIds);
            newSet.add(connectingVideo.guid);
            setLinkedIds(newSet);
            setConnectingVideo(null);
        } catch (error) {
            console.error(error);
            alert('Villa við að tengja myndband.');
        }
        setIsSaving(false);
    };

    const filteredVideos = videos.filter(v =>
        v.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const stepLabels: Record<UploadStep, string> = {
        idle: '', preparing: 'Undirbý upphleðslu...', uploading: `Hleð upp... ${uploadProgress}%`,
        encoding: 'Bunny CDN vinnur úr myndbandi...', linking: 'Skrái í gagnagrunn...',
        done: 'Tókst! Myndband birt.', error: 'Villa kom upp',
    };

    return (
        <AdminLayout>
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="admin-h1">Myndbönd</h1>
                    <p className="admin-body mt-1">Stjórnaðu myndböndum og drögum</p>
                </div>
                <button
                    onClick={() => { setShowUpload(true); resetUploadForm(); }}
                    className="admin-btn admin-btn-primary"
                >
                    <Upload size={18} />
                    Hlaða upp myndbandi
                </button>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 mb-6 bg-[var(--admin-bg)] rounded-xl p-1">
                <button
                    onClick={() => setActiveTab('drafts')}
                    className={`flex-1 py-3 px-4 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 ${
                        activeTab === 'drafts'
                            ? 'bg-[var(--admin-surface)] text-[var(--admin-text)] shadow-sm'
                            : 'text-[var(--admin-text-muted)] hover:text-[var(--admin-text-secondary)]'
                    }`}
                >
                    <FileVideo size={16} />
                    Drög
                    {drafts.length > 0 && (
                        <span className="bg-[var(--admin-accent)] text-white text-xs font-bold px-2 py-0.5 rounded-full">
                            {drafts.length}
                        </span>
                    )}
                </button>
                <button
                    onClick={() => setActiveTab('library')}
                    className={`flex-1 py-3 px-4 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 ${
                        activeTab === 'library'
                            ? 'bg-[var(--admin-surface)] text-[var(--admin-text)] shadow-sm'
                            : 'text-[var(--admin-text-muted)] hover:text-[var(--admin-text-secondary)]'
                    }`}
                >
                    <Film size={16} />
                    Bunny Safn
                </button>
            </div>

            {isLoading ? (
                <div className="flex justify-center p-12">
                    <Loader2 className="w-8 h-8 text-[var(--admin-accent)] animate-spin" />
                </div>
            ) : activeTab === 'drafts' ? (
                /* ═══ DRAFTS TAB ═══ */
                drafts.length === 0 ? (
                    <div className="text-center py-16">
                        <FileVideo size={48} className="mx-auto mb-4 text-[var(--admin-text-muted)] opacity-50" />
                        <h3 className="text-lg font-medium text-[var(--admin-text-secondary)] mb-2">Engin drög</h3>
                        <p className="text-sm text-[var(--admin-text-muted)] mb-6">
                            Drög birtast hér þegar myndband er hlaðið upp úr möppu á Íslandi
                        </p>
                        <button
                            onClick={() => { setShowUpload(true); resetUploadForm(); }}
                            className="admin-btn admin-btn-primary"
                        >
                            <Upload size={16} />
                            Hlaða upp myndbandi
                        </button>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {drafts.map((draft) => (
                            <div
                                key={draft.id}
                                className="admin-card p-0 overflow-hidden flex items-stretch hover:border-[var(--admin-border-hover)] transition-colors"
                            >
                                {/* Thumbnail */}
                                <div className="w-48 flex-shrink-0 bg-black relative">
                                    <img
                                        src={draft.thumbnail_custom || `https://iframe.mediadelivery.net/thumbnail/${LIBRARY_ID}/${draft.bunny_video_id}/thumbnail.jpg`}
                                        alt={draft.title}
                                        className="w-full h-full object-cover"
                                    />
                                    <div className="absolute top-2 left-2 bg-amber-500/90 text-black px-2 py-0.5 rounded text-xs font-bold">
                                        DRÖG
                                    </div>
                                </div>

                                {/* Info */}
                                <div className="flex-1 p-4 flex flex-col justify-center">
                                    <h3 className="font-medium text-[var(--admin-text)] mb-1">{draft.title}</h3>
                                    <div className="flex items-center gap-3 text-xs text-[var(--admin-text-muted)]">
                                        <span className="flex items-center gap-1">
                                            <Clock size={12} />
                                            {draft.created_at ? new Date(draft.created_at).toLocaleDateString('is-IS') : '—'}
                                        </span>
                                        {draft.source === 'folder' && (
                                            <span className="bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded text-xs">
                                                Úr möppu
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex items-center gap-2 px-4">
                                    <button
                                        onClick={() => openDraftReview(draft)}
                                        className="admin-btn admin-btn-primary"
                                    >
                                        <Sparkles size={16} />
                                        Skoða og birta
                                    </button>
                                    <button
                                        onClick={() => handleDeleteDraft(draft)}
                                        className="p-2 text-[var(--admin-text-muted)] hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )
            ) : (
                /* ═══ LIBRARY TAB ═══ */
                <>
                    <div className="mb-6 relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--admin-text-muted)]" size={20} />
                        <input
                            type="text"
                            placeholder="Leita að myndbandi..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="admin-input pl-12"
                        />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredVideos.map((video) => {
                            const isLinked = linkedIds.has(video.guid);
                            return (
                                <div key={video.guid} className="admin-card p-0 overflow-hidden flex flex-col group hover:border-[var(--admin-border-hover)] transition-colors">
                                    <div className="aspect-video bg-black relative">
                                        <img
                                            src={`https://iframe.mediadelivery.net/thumbnail/${LIBRARY_ID}/${video.guid}/thumbnail.jpg`}
                                            alt={video.title}
                                            className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                                        />
                                        {isLinked ? (
                                            <div className="absolute top-2 right-2 bg-green-500/90 text-white px-2 py-1 rounded-md text-xs font-bold flex items-center gap-1 shadow-lg backdrop-blur-sm">
                                                <CheckCircle size={12} /><span>Tengt</span>
                                            </div>
                                        ) : (
                                            <div className="absolute top-2 right-2 bg-yellow-500/90 text-black px-2 py-1 rounded-md text-xs font-bold flex items-center gap-1 shadow-lg backdrop-blur-sm">
                                                <AlertCircle size={12} /><span>Ótengt</span>
                                            </div>
                                        )}
                                        <div className="absolute bottom-2 right-2 bg-black/80 text-white px-2 py-1 rounded text-xs font-mono">
                                            {Math.floor(video.length / 60)}:{(video.length % 60).toString().padStart(2, '0')}
                                        </div>
                                    </div>
                                    <div className="p-4 flex-1 flex flex-col">
                                        <h3 className="font-medium text-[var(--admin-text)] line-clamp-2 mb-2">{video.title}</h3>
                                        <div className="mt-auto flex items-center justify-between pt-4 border-t border-[var(--admin-border)]">
                                            <div className="text-xs text-[var(--admin-text-muted)] flex items-center gap-1">
                                                <Calendar size={12} /><span>{new Date(video.date).toLocaleDateString()}</span>
                                            </div>
                                            <div className="text-xs text-[var(--admin-text-muted)] flex items-center gap-1">
                                                <Eye size={12} /><span>{video.views}</span>
                                            </div>
                                        </div>
                                        {!isLinked && (
                                            <button
                                                onClick={() => handleConnectClick(video)}
                                                className="mt-4 w-full py-2 bg-[var(--admin-surface-hover)] hover:bg-[var(--admin-accent)] hover:text-white text-[var(--admin-text-secondary)] rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2"
                                            >
                                                <LinkIcon size={14} />Tengja við þáttaröð
                                            </button>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </>
            )}

            {/* ═══ DRAFT REVIEW MODAL ═══ */}
            {reviewingDraft && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                    <div className="bg-[var(--admin-surface)] border border-[var(--admin-border)] w-full max-w-2xl rounded-2xl shadow-2xl animate-in fade-in zoom-in duration-200 overflow-hidden max-h-[90vh] overflow-y-auto">
                        {/* Header */}
                        <div className="flex justify-between items-center p-6 border-b border-[var(--admin-border)]">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center">
                                    <Sparkles size={20} className="text-amber-400" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-bold text-[var(--admin-text)]">Skoða drög</h2>
                                    <p className="text-xs text-[var(--admin-text-muted)]">Settu upp upplýsingar og birtu</p>
                                </div>
                            </div>
                            <button onClick={() => setReviewingDraft(null)} className="p-2 hover:bg-[var(--admin-surface-hover)] rounded-full transition-colors">
                                <X size={20} className="text-[var(--admin-text-muted)]" />
                            </button>
                        </div>

                        <div className="p-6 space-y-5">
                            {/* Thumbnail Preview */}
                            <div>
                                <label className="block text-sm font-medium text-[var(--admin-text-secondary)] mb-2">Smámynd</label>
                                <div className="relative aspect-video bg-black rounded-xl overflow-hidden">
                                    <img
                                        src={generatedThumbUrl || `https://iframe.mediadelivery.net/thumbnail/${LIBRARY_ID}/${reviewingDraft.bunny_video_id}/thumbnail.jpg`}
                                        alt="Thumbnail"
                                        className="w-full h-full object-cover"
                                    />
                                    {generatedThumbUrl && (
                                        <div className="absolute top-2 left-2 bg-green-500/90 text-white px-2 py-1 rounded text-xs font-bold flex items-center gap-1">
                                            <Sparkles size={10} /> Búið til
                                        </div>
                                    )}
                                </div>
                                <button
                                    onClick={handleGenerateThumbnail}
                                    disabled={isGeneratingThumb}
                                    className="mt-2 admin-btn admin-btn-secondary w-full justify-center"
                                >
                                    {isGeneratingThumb ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
                                    {isGeneratingThumb ? 'Bý til smámynd...' : (generatedThumbUrl ? 'Endurgera smámynd' : 'Búa til Apple TV smámynd')}
                                </button>
                            </div>

                            {/* Series */}
                            <div>
                                <label className="block text-sm font-medium text-[var(--admin-text-secondary)] mb-2">Þáttaröð</label>
                                {!draftNewSeries ? (
                                    <div className="flex gap-2">
                                        <select className="admin-input flex-1" value={draftSeriesName} onChange={(e) => setDraftSeriesName(e.target.value)}>
                                            <option value="">-- Veldu þáttaröð --</option>
                                            {seriesList.map(s => <option key={s.id} value={s.title}>{s.title}</option>)}
                                        </select>
                                        <button onClick={() => setDraftNewSeries(true)} className="admin-btn admin-btn-secondary flex-shrink-0">
                                            <Plus size={16} /> Ný
                                        </button>
                                    </div>
                                ) : (
                                    <div className="flex gap-2">
                                        <input type="text" className="admin-input flex-1" placeholder="Nafn nýrrar þáttaraðar" value={draftSeriesName} onChange={(e) => setDraftSeriesName(e.target.value)} autoFocus />
                                        <button onClick={() => { setDraftNewSeries(false); setDraftSeriesName(''); }} className="admin-btn admin-btn-secondary flex-shrink-0">Hætta við</button>
                                    </div>
                                )}
                            </div>

                            {/* Title + Number */}
                            <div className="grid grid-cols-4 gap-4">
                                <div className="col-span-3">
                                    <label className="block text-sm font-medium text-[var(--admin-text-secondary)] mb-2">Titill þáttar</label>
                                    <input type="text" className="admin-input" value={draftTitle} onChange={(e) => setDraftTitle(e.target.value)} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-[var(--admin-text-secondary)] mb-2">Nr.</label>
                                    <input type="number" className="admin-input" value={draftEpisodeNumber} onChange={(e) => setDraftEpisodeNumber(parseInt(e.target.value) || 1)} />
                                </div>
                            </div>

                            {/* Description */}
                            <div>
                                <label className="block text-sm font-medium text-[var(--admin-text-secondary)] mb-2">Lýsing</label>
                                <textarea className="admin-input min-h-[80px]" value={draftDescription} onChange={(e) => setDraftDescription(e.target.value)} placeholder="Stutt lýsing á þætti..." rows={3} />
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="p-6 pt-0">
                            <button
                                onClick={handlePublishDraft}
                                disabled={!draftSeriesName || !draftTitle || isPublishing}
                                className="w-full admin-btn admin-btn-primary justify-center py-3 text-base"
                            >
                                {isPublishing ? <Loader2 size={18} className="animate-spin" /> : <ArrowRight size={18} />}
                                {isPublishing ? 'Birti...' : 'Birta á Omega TV'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ═══ UPLOAD MODAL ═══ */}
            {showUpload && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                    <div className="bg-[var(--admin-surface)] border border-[var(--admin-border)] w-full max-w-xl rounded-2xl shadow-2xl animate-in fade-in zoom-in duration-200 overflow-hidden">
                        <div className="flex justify-between items-center p-6 border-b border-[var(--admin-border)]">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-[var(--admin-accent)] flex items-center justify-center">
                                    <Upload size={20} className="text-white" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-bold text-[var(--admin-text)]">Hlaða upp myndbandi</h2>
                                    <p className="text-xs text-[var(--admin-text-muted)]">Bætir beint á Omega TV</p>
                                </div>
                            </div>
                            <button onClick={() => { setShowUpload(false); resetUploadForm(); }} className="p-2 hover:bg-[var(--admin-surface-hover)] rounded-full transition-colors" disabled={uploadStep === 'uploading' || uploadStep === 'linking'}>
                                <X size={20} className="text-[var(--admin-text-muted)]" />
                            </button>
                        </div>

                        <div className="p-6 space-y-5">
                            {!uploadFile ? (
                                <div
                                    onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                                    onDragLeave={() => setDragOver(false)}
                                    onDrop={handleDrop}
                                    className={`border-2 border-dashed rounded-xl p-10 text-center transition-all cursor-pointer ${dragOver ? 'border-[var(--admin-accent)] bg-[var(--admin-accent-subtle)]' : 'border-[var(--admin-border-strong)] hover:border-[var(--admin-accent)]'}`}
                                    onClick={() => document.getElementById('file-input')?.click()}
                                >
                                    <Film size={40} className="mx-auto mb-3 text-[var(--admin-text-muted)]" />
                                    <p className="text-[var(--admin-text)] font-medium mb-1">Dragðu MP4 skrá hingað</p>
                                    <p className="text-xs text-[var(--admin-text-muted)]">eða smelltu til að velja skrá</p>
                                    <input id="file-input" type="file" accept="video/mp4,video/*" className="hidden" onChange={handleFileSelect} />
                                </div>
                            ) : (
                                <div className="bg-[var(--admin-bg)] rounded-xl p-4 flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-lg bg-[var(--admin-accent-subtle)] flex items-center justify-center flex-shrink-0">
                                        <Film size={24} className="text-[var(--admin-accent)]" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-[var(--admin-text)] truncate">{uploadFile.name}</p>
                                        <p className="text-xs text-[var(--admin-text-muted)]">{(uploadFile.size / (1024 * 1024)).toFixed(1)} MB</p>
                                    </div>
                                    {uploadStep === 'idle' && (
                                        <button onClick={() => setUploadFile(null)} className="p-1 hover:bg-[var(--admin-surface-hover)] rounded-full">
                                            <X size={16} className="text-[var(--admin-text-muted)]" />
                                        </button>
                                    )}
                                </div>
                            )}

                            {uploadFile && (uploadStep === 'idle' || uploadStep === 'error') && (
                                <>
                                    <div>
                                        <label className="block text-sm font-medium text-[var(--admin-text-secondary)] mb-2">Þáttaröð</label>
                                        {!newSeriesMode ? (
                                            <div className="flex gap-2">
                                                <select className="admin-input flex-1" value={uploadSeriesName} onChange={(e) => setUploadSeriesName(e.target.value)}>
                                                    <option value="">-- Veldu þáttaröð --</option>
                                                    {seriesList.map(s => <option key={s.id} value={s.title}>{s.title}</option>)}
                                                </select>
                                                <button onClick={() => setNewSeriesMode(true)} className="admin-btn admin-btn-secondary flex-shrink-0"><Plus size={16} /> Ný</button>
                                            </div>
                                        ) : (
                                            <div className="flex gap-2">
                                                <input type="text" className="admin-input flex-1" placeholder="Nafn nýrrar þáttaraðar" value={uploadSeriesName} onChange={(e) => setUploadSeriesName(e.target.value)} autoFocus />
                                                <button onClick={() => { setNewSeriesMode(false); setUploadSeriesName(''); }} className="admin-btn admin-btn-secondary flex-shrink-0">Hætta við</button>
                                            </div>
                                        )}
                                    </div>
                                    <div className="grid grid-cols-4 gap-4">
                                        <div className="col-span-3">
                                            <label className="block text-sm font-medium text-[var(--admin-text-secondary)] mb-2">Titill þáttar</label>
                                            <input type="text" className="admin-input" value={uploadEpisodeTitle} onChange={(e) => setUploadEpisodeTitle(e.target.value)} />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-[var(--admin-text-secondary)] mb-2">Nr.</label>
                                            <input type="number" className="admin-input" value={uploadEpisodeNumber} onChange={(e) => setUploadEpisodeNumber(parseInt(e.target.value) || 1)} />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-[var(--admin-text-secondary)] mb-2">Lýsing (valfrjálst)</label>
                                        <textarea className="admin-input min-h-[60px]" value={uploadDescription} onChange={(e) => setUploadDescription(e.target.value)} placeholder="Stutt lýsing á þætti..." rows={2} />
                                    </div>
                                </>
                            )}

                            {uploadStep !== 'idle' && uploadStep !== 'error' && (
                                <div className="space-y-3">
                                    <div className="flex items-center gap-3">
                                        {uploadStep === 'done' ? <CheckCircle size={20} className="text-green-400" /> : <Loader2 size={20} className="text-[var(--admin-accent)] animate-spin" />}
                                        <span className="text-sm text-[var(--admin-text)]">{stepLabels[uploadStep]}</span>
                                    </div>
                                    {uploadStep === 'uploading' && (
                                        <div className="w-full bg-[var(--admin-bg)] rounded-full h-2 overflow-hidden">
                                            <div className="h-full bg-[var(--admin-accent)] rounded-full transition-all duration-300 ease-out" style={{ width: `${uploadProgress}%` }} />
                                        </div>
                                    )}
                                </div>
                            )}

                            {uploadStep === 'error' && (
                                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">{uploadError}</div>
                            )}
                        </div>

                        {(uploadStep === 'idle' || uploadStep === 'error') && uploadFile && (
                            <div className="p-6 pt-0">
                                <button onClick={handleUploadPublish} disabled={!uploadSeriesName || !uploadEpisodeTitle} className="w-full admin-btn admin-btn-primary justify-center py-3 text-base">
                                    <Upload size={18} /> Birta á Omega TV
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* ═══ CONNECT MODAL (existing) ═══ */}
            {connectingVideo && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                    <div className="bg-[var(--admin-surface)] border border-[var(--admin-border)] w-full max-w-lg rounded-2xl p-6 shadow-2xl">
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h2 className="text-xl font-bold text-[var(--admin-text)]">Tengja myndband</h2>
                                <p className="text-sm text-[var(--admin-text-muted)] mt-1">{connectingVideo.title}</p>
                            </div>
                            <button onClick={() => setConnectingVideo(null)} className="p-1 hover:bg-[var(--admin-surface-hover)] rounded-full transition-colors">
                                <X size={20} className="text-[var(--admin-text-muted)]" />
                            </button>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-[var(--admin-text-secondary)] mb-2">Veldu Þáttaröð</label>
                                <select className="admin-input" value={selectedSeriesId} onChange={(e) => setSelectedSeriesId(e.target.value)}>
                                    <option value="">-- Veldu --</option>
                                    {seriesList.map(s => <option key={s.id} value={s.id}>{s.title}</option>)}
                                </select>
                            </div>
                            <div className="grid grid-cols-4 gap-4">
                                <div className="col-span-3">
                                    <label className="block text-sm font-medium text-[var(--admin-text-secondary)] mb-2">Titill þáttar</label>
                                    <input type="text" className="admin-input" value={episodeTitle} onChange={(e) => setEpisodeTitle(e.target.value)} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-[var(--admin-text-secondary)] mb-2">Númer</label>
                                    <input type="number" className="admin-input" value={episodeNumber} onChange={(e) => setEpisodeNumber(parseInt(e.target.value))} />
                                </div>
                            </div>
                            <button onClick={handleSaveConnection} disabled={!selectedSeriesId || isSaving} className="w-full admin-btn admin-btn-primary justify-center py-3">
                                {isSaving ? <Loader2 size={18} className="animate-spin" /> : 'Vista tengingu'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
