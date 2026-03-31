'use client';
import { useState, useEffect } from 'react';
import Navbar from "@/components/layout/Navbar";
import FuturisticPlayer from "@/components/player/FuturisticPlayer";

import Link from "next/link";
import { Sparkles, Heart, Calendar } from "lucide-react";
import LiveSchedule from "@/components/live/LiveSchedule";

export default function LivePage() {
    const [currentProgram, setCurrentProgram] = useState<any>(null);
    const [liveStreamId, setLiveStreamId] = useState<string | undefined>(undefined);
    const [streamEmbedUrl, setStreamEmbedUrl] = useState<string | undefined>(undefined);

    // Fetch the Live Stream ID on mount
    useEffect(() => {
        async function fetchLiveStream() {
            try {
                // Check for Generic Embed URL first (Restream/Castr)
                const embedUrl = process.env.NEXT_PUBLIC_LIVE_STREAM_EMBED_URL;
                if (embedUrl) {
                    setStreamEmbedUrl(embedUrl);
                    return;
                }

                // Fallback to Bunny ID logic
                const { getLiveStream } = await import('@/lib/bunny');
                const stream = await getLiveStream();
                if (stream.videoId) {
                    setLiveStreamId(stream.videoId);
                }
            } catch (error) {
                console.error("Failed to fetch live stream", error);
            }
        }
        fetchLiveStream();
    }, []);

    return (
        <main className="min-h-screen bg-[var(--bg-deep)] text-white overflow-x-hidden">
            <Navbar />

            {/* Clean background */}

            <div className="relative z-10 pt-28 pb-10 container mx-auto px-4 md:px-8 min-h-screen flex flex-col">

                {/* Header Area */}
                <div className="mb-4 flex flex-col md:flex-row justify-between items-end gap-4">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                            <span className="text-red-400 font-bold uppercase tracking-widest text-xs">Bein Útsending</span>
                        </div>
                        <h1 className="text-3xl md:text-4xl font-bold">
                            {currentProgram ? currentProgram.title : 'Sunnudags Samkoma'}
                        </h1>
                    </div>
                </div>

                {/* Main Content Layout */}
                <div className="flex-1 flex flex-col items-center justify-center -mt-6">
                    <div className="w-full max-w-6xl aspect-video relative overflow-hidden border border-[var(--border)] bg-black group">
                        <FuturisticPlayer videoId={liveStreamId} embedUrl={streamEmbedUrl} />

                        {/* NOW PLAYING OVERLAY (Top Left) */}
                        <div className="absolute top-6 left-6 z-20 transition-opacity duration-300 opacity-0 group-hover:opacity-100 pointer-events-none">
                            <div className="bg-black/60 backdrop-blur-md border border-white/10 px-4 py-2 rounded-lg flex items-center gap-3">
                                <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                                <div>
                                    <p className="text-[10px] uppercase tracking-widest text-white/50 font-bold">Núna að spila</p>
                                    <p className="text-sm font-bold text-white">{currentProgram ? currentProgram.title : 'Bein útsending'}</p>
                                </div>
                            </div>
                        </div>
                    </div>


                    {/* Quick Actions */}
                    <div className="w-full max-w-6xl mt-8 grid grid-cols-1 md:grid-cols-2 gap-4 px-4">
                        <Link href="/baenatorg" className="group flex items-center justify-between p-5 border border-[var(--border)] hover:border-[var(--accent)] transition-all">
                            <div>
                                <h3 className="font-bold text-lg group-hover:text-white transition-colors">Senda Bæn</h3>
                                <p className="text-xs text-[var(--text-secondary)]">Við biðjum fyrir þér</p>
                            </div>
                            <Sparkles size={18} className="text-[var(--accent)]" />
                        </Link>

                        <Link href="/give" className="group flex items-center justify-between p-5 border border-[var(--border)] hover:border-[var(--accent)] transition-all">
                            <div>
                                <h3 className="font-bold text-lg group-hover:text-white transition-colors">Styrkja</h3>
                                <p className="text-xs text-[var(--text-secondary)]">Gerast bakhjarl</p>
                            </div>
                            <Heart size={18} className="text-[var(--accent)]" />
                        </Link>
                    </div>

                    {/* Schedule Grid */}
                    <LiveSchedule onUpdate={setCurrentProgram} />

                </div>

            </div>
        </main>
    );
}
