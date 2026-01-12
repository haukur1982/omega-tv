'use client';

import { useEffect, useState } from 'react';
import { Search, Film, Calendar, Eye, Link as LinkIcon, AlertCircle, CheckCircle, X } from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';
import { getLinkedBunnyIds, getAllSeries, Series, createEpisode, createSeason } from '@/lib/vod-db';

interface BunnyVideo {
    guid: string;
    title: string;
    date: string;
    views: number;
    length: number;
    thumbnailUrl: string;
}

export default function VideosPage() {
    const [videos, setVideos] = useState<BunnyVideo[]>([]);
    const [linkedIds, setLinkedIds] = useState<Set<string>>(new Set());
    const [seriesList, setSeriesList] = useState<Series[]>([]);

    // UI State
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [connectingVideo, setConnectingVideo] = useState<BunnyVideo | null>(null);

    // Form State for Connecting
    const [selectedSeriesId, setSelectedSeriesId] = useState('');
    const [episodeTitle, setEpisodeTitle] = useState('');
    const [episodeNumber, setEpisodeNumber] = useState(1);
    const [isSaving, setIsSaving] = useState(false);

    const loadData = async () => {
        setIsLoading(true);
        try {
            // Parallel fetch: Videos, LinkedStatus, Series
            const [videosRes, linkedRes, seriesRes] = await Promise.all([
                fetch('/api/admin/videos').then(r => r.json()),
                getLinkedBunnyIds(),
                getAllSeries()
            ]);

            if (Array.isArray(videosRes)) {
                setVideos(videosRes);
            }
            if (linkedRes) {
                setLinkedIds(new Set(linkedRes));
            }
            if (seriesRes) {
                setSeriesList(seriesRes);
            }
        } catch (e) {
            console.error(e);
        }
        setIsLoading(false);
    };

    useEffect(() => {
        loadData();
    }, []);

    const handleConnectClick = (video: BunnyVideo) => {
        setConnectingVideo(video);
        setEpisodeTitle(video.title.replace('.mp4', ''));
        setEpisodeNumber(1); // Default, ideally auto-guess
        setSelectedSeriesId('');
    };

    const handleSaveConnection = async () => {
        if (!selectedSeriesId || !connectingVideo) return;
        setIsSaving(true);
        try {
            // Logic: Find Series -> Find/Create Season -> Create Episode
            const series = seriesList.find(s => s.id === selectedSeriesId);
            if (!series) return;

            // Simple Logic: Always grab/create Season 1
            let seasonId = '';
            // @ts-ignore
            if (series.seasons && series.seasons.length > 0) {
                // @ts-ignore
                seasonId = series.seasons[0].id;
            } else {
                // Create Season 1
                const newSeason = await createSeason(series.id, 1, 'Sería 1');
                seasonId = newSeason.id;
            }

            await createEpisode({
                series_id: series.id,
                season_id: seasonId,
                bunny_video_id: connectingVideo.guid,
                title: episodeTitle,
                episode_number: episodeNumber,
                description: '' // Optional description
            });

            // Success! Update local state
            const newSet = new Set(linkedIds);
            newSet.add(connectingVideo.guid);
            setLinkedIds(newSet);
            setConnectingVideo(null); // Close modal

        } catch (error) {
            console.error(error);
            alert('Villa við að tengja myndband.');
        }
        setIsSaving(false);
    };

    const filteredVideos = videos.filter(v =>
        v.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <AdminLayout>
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="admin-h1">Myndbönd</h1>
                    <p className="admin-body mt-1">Stjórnaðu öllum myndböndum frá Bunny.net</p>
                </div>
            </div>

            {/* Search */}
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

            {isLoading ? (
                <div className="flex justify-center p-12">
                    <div className="admin-spinner w-8 h-8 text-[var(--admin-accent)]" />
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredVideos.map((video) => {
                        const isLinked = linkedIds.has(video.guid);
                        return (
                            <div key={video.guid} className="admin-card p-0 overflow-hidden flex flex-col group hover:border-[var(--admin-border-hover)] transition-colors">
                                <div className="aspect-video bg-black relative">
                                    <img
                                        src={`https://iframe.mediadelivery.net/thumbnail/${process.env.NEXT_PUBLIC_BUNNY_LIBRARY_ID}/${video.guid}/thumbnail.jpg`}
                                        alt={video.title}
                                        className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                                    />
                                    {isLinked && (
                                        <div className="absolute top-2 right-2 bg-green-500/90 text-black px-2 py-1 rounded-md text-xs font-bold flex items-center gap-1 shadow-lg backdrop-blur-sm">
                                            <CheckCircle size={12} />
                                            <span>Tengt</span>
                                        </div>
                                    )}
                                    {!isLinked && (
                                        <div className="absolute top-2 right-2 bg-yellow-500/90 text-black px-2 py-1 rounded-md text-xs font-bold flex items-center gap-1 shadow-lg backdrop-blur-sm">
                                            <AlertCircle size={12} />
                                            <span>Ótengt</span>
                                        </div>
                                    )}
                                    <div className="absolute bottom-2 right-2 bg-black/80 text-white px-2 py-1 rounded text-xs font-mono">
                                        {Math.floor(video.length / 60)}:{(video.length % 60).toString().padStart(2, '0')}
                                    </div>
                                </div>

                                <div className="p-4 flex-1 flex flex-col">
                                    <h3 className="font-medium text-[var(--admin-text)] line-clamp-2 mb-2" title={video.title}>
                                        {video.title}
                                    </h3>
                                    <div className="mt-auto flex items-center justify-between pt-4 border-t border-[var(--admin-border)]">
                                        <div className="text-xs text-[var(--admin-text-muted)] flex items-center gap-1">
                                            <Calendar size={12} />
                                            <span>{new Date(video.date).toLocaleDateString()}</span>
                                        </div>
                                        <div className="text-xs text-[var(--admin-text-muted)] flex items-center gap-1">
                                            <Eye size={12} />
                                            <span>{video.views}</span>
                                        </div>
                                    </div>

                                    {!isLinked && (
                                        <button
                                            onClick={() => handleConnectClick(video)}
                                            className="mt-4 w-full py-2 bg-[var(--admin-surface-hover)] hover:bg-[var(--admin-accent)] hover:text-black text-[var(--admin-text-secondary)] rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2"
                                        >
                                            <LinkIcon size={14} />
                                            Tengja við þáttaröð
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Connection Modal */}
            {connectingVideo && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                    <div className="bg-[var(--admin-surface)] border border-[var(--admin-border)] w-full max-w-lg rounded-2xl p-6 shadow-2xl animate-in fade-in zoom-in duration-200">
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h2 className="text-xl font-bold text-[var(--admin-text)]">Tengja myndband</h2>
                                <p className="text-sm text-[var(--admin-text-muted)] mt-1">{connectingVideo.title}</p>
                            </div>
                            <button
                                onClick={() => setConnectingVideo(null)}
                                className="p-1 hover:bg-[var(--admin-surface-hover)] rounded-full transition-colors"
                            >
                                <X size={20} className="text-[var(--admin-text-muted)]" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-[var(--admin-text-secondary)] mb-2">
                                    Veldu Þáttaröð
                                </label>
                                <select
                                    className="admin-input"
                                    value={selectedSeriesId}
                                    onChange={(e) => setSelectedSeriesId(e.target.value)}
                                >
                                    <option value="">-- Veldu --</option>
                                    {seriesList.map(s => (
                                        <option key={s.id} value={s.id}>{s.title}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="grid grid-cols-4 gap-4">
                                <div className="col-span-3">
                                    <label className="block text-sm font-medium text-[var(--admin-text-secondary)] mb-2">
                                        Titill þáttar
                                    </label>
                                    <input
                                        type="text"
                                        className="admin-input"
                                        value={episodeTitle}
                                        onChange={(e) => setEpisodeTitle(e.target.value)}
                                    />
                                </div>
                                <div className="col-span-1">
                                    <label className="block text-sm font-medium text-[var(--admin-text-secondary)] mb-2">
                                        Númer
                                    </label>
                                    <input
                                        type="number"
                                        className="admin-input"
                                        value={episodeNumber}
                                        onChange={(e) => setEpisodeNumber(parseInt(e.target.value))}
                                    />
                                </div>
                            </div>

                            <div className="pt-2">
                                <button
                                    onClick={handleSaveConnection}
                                    disabled={!selectedSeriesId || isSaving}
                                    className="w-full admin-btn admin-btn-primary justify-center py-3"
                                >
                                    {isSaving ? <div className="admin-spinner" /> : 'Vista tengingu'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
