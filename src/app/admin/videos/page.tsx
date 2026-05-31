'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import {
    Search, Film, Calendar, Eye, Link as LinkIcon, AlertCircle,
    CheckCircle, X, Upload, Loader2, Plus, Inbox, ArrowRight
} from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';
import { getLinkedBunnyIds, getAllSeries, Series } from '@/lib/vod-db';
import { authedFetch } from '@/lib/admin-fetch';

/**
 * /admin/videos — the Bunny library.
 *
 * Browse every video on the Bunny CDN, see which are already linked to a
 * series, connect the unlinked ones, and upload new files directly.
 *
 * This page is NOT the draft-review surface. Azotus deliveries and uploads
 * that need review live in the Innhólf (/admin/drafts) — the single
 * publishing room. Keeping the two separate is deliberate: one place to
 * review-and-publish, one place to manage the raw Bunny library.
 */

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

    // UI State
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

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

    // Existing connect state
    const [connectingVideo, setConnectingVideo] = useState<BunnyVideo | null>(null);
    const [selectedSeriesId, setSelectedSeriesId] = useState('');
    const [episodeTitle, setEpisodeTitle] = useState('');
    const [episodeNumber, setEpisodeNumber] = useState(1);
    const [isSaving, setIsSaving] = useState(false);

    const loadData = async () => {
        setIsLoading(true);
        try {
            const [videosRes, linkedRes, seriesRes] = await Promise.all([
                authedFetch('/api/admin/videos').then(r => r.json()),
                getLinkedBunnyIds(),
                getAllSeries(),
            ]);

            if (Array.isArray(videosRes)) setVideos(videosRes);
            if (linkedRes) setLinkedIds(new Set(linkedRes));
            if (seriesRes) setSeriesList(seriesRes);
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
            const initRes = await authedFetch('/api/admin/videos/upload', {
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
            const linkRes = await authedFetch('/api/admin/videos/link', {
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
        } catch (err: unknown) {
            console.error('Upload error:', err);
            setUploadError(err instanceof Error ? err.message : 'Óþekkt villa');
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
            if (!series) { setIsSaving(false); return; }
            // Route through the server link route (service-role). Client-side
            // writes are blocked by RLS; the route finds-or-creates the series +
            // season by name and inserts the published episode.
            const res = await authedFetch('/api/admin/videos/link', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    bunnyGuid: connectingVideo.guid,
                    seriesName: series.title,
                    episodeTitle,
                    episodeNumber,
                }),
            });
            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                throw new Error(data.error || 'Villa við að tengja myndband.');
            }
            const newSet = new Set(linkedIds);
            newSet.add(connectingVideo.guid);
            setLinkedIds(newSet);
            setConnectingVideo(null);
        } catch (error) {
            console.error(error);
            alert(error instanceof Error ? error.message : 'Villa við að tengja myndband.');
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
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="admin-h1">Bunny safn</h1>
                    <p className="admin-body mt-1">Myndbönd á Bunny CDN — tengdu ótengd myndbönd við þáttaröð eða hladdu upp nýju.</p>
                </div>
                <button
                    onClick={() => { setShowUpload(true); resetUploadForm(); }}
                    className="admin-btn admin-btn-primary"
                >
                    <Upload size={18} />
                    Hlaða upp myndbandi
                </button>
            </div>

            {/* Pointer to the publishing room — keeps the two surfaces unambiguous */}
            <Link
                href="/admin/drafts"
                className="flex items-center gap-3 mb-6 p-4 rounded-xl border border-[var(--admin-border)] bg-[var(--admin-surface)] hover:border-[var(--admin-border-hover)] transition-colors group"
            >
                <div className="w-10 h-10 rounded-lg bg-[var(--admin-accent-subtle)] flex items-center justify-center flex-shrink-0">
                    <Inbox size={20} className="text-[var(--admin-accent)]" />
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[var(--admin-text)]">Drög frá Azotus bíða í Innhólfinu</p>
                    <p className="text-xs text-[var(--admin-text-muted)]">Nýjar upptökur eru yfirfarnar og birtar þar — ekki hér.</p>
                </div>
                <ArrowRight size={18} className="text-[var(--admin-text-muted)] group-hover:text-[var(--admin-accent)] transition-colors flex-shrink-0" />
            </Link>

            {isLoading ? (
                <div className="flex justify-center p-12">
                    <Loader2 className="w-8 h-8 text-[var(--admin-accent)] animate-spin" />
                </div>
            ) : (
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
                                            src={`/api/bunny/thumbnail/${video.guid}`}
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
                    {filteredVideos.length === 0 && (
                        <div className="text-center py-16">
                            <Film size={48} className="mx-auto mb-4 text-[var(--admin-text-muted)] opacity-50" />
                            <h3 className="text-lg font-medium text-[var(--admin-text-secondary)] mb-2">Engin myndbönd</h3>
                            <p className="text-sm text-[var(--admin-text-muted)]">
                                {searchTerm ? 'Engin myndbönd passa við leitina.' : 'Bunny safnið er tómt — hladdu upp myndbandi til að byrja.'}
                            </p>
                        </div>
                    )}
                </>
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
