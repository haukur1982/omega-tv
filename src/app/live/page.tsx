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

            {/* Background Ambient Glow for the entire page */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute top-[-20%] left-[20%] w-[60%] h-[60%] bg-[var(--primary-glow)] opacity-[0.08] blur-[150px]" />
            </div>

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
                    <div className="w-full max-w-6xl aspect-video relative shadow-[0_0_100px_rgba(var(--primary-glow-rgb),0.2)] rounded-[var(--radius-lg)] overflow-hidden border border-[var(--glass-border)] bg-black group">
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


                    {/* Quick Actions Bar */}
                    <div className="w-full max-w-6xl mt-8 grid grid-cols-1 md:grid-cols-2 gap-4 px-4">
                        <Link href="/baenatorg" className="group relative flex items-center justify-between p-5 rounded-xl bg-blue-950/30 border border-blue-500/20 hover:border-blue-400/50 hover:bg-blue-900/40 transition-all duration-300">
                            {/* Ambient Glow */}
                            <div className="absolute inset-0 bg-blue-500/5 blur-xl group-hover:bg-blue-500/10 transition-all rounded-xl opacity-50" />

                            <div className="relative z-10">
                                <h3 className="font-bold text-lg text-blue-100 group-hover:text-white transition-colors">Senda Bæn</h3>
                                <p className="text-xs text-blue-200/70">Við biðjum fyrir þér</p>
                            </div>
                            <div className="relative z-10 w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center group-hover:scale-110 group-hover:bg-blue-500/20 transition-all border border-blue-500/20">
                                <Sparkles size={18} className="text-blue-300" />
                            </div>
                        </Link>

                        <Link href="/give" className="group relative flex items-center justify-between p-5 rounded-xl bg-amber-950/30 border border-amber-500/20 hover:border-amber-400/50 hover:bg-amber-900/40 transition-all duration-300">
                            {/* Ambient Glow */}
                            <div className="absolute inset-0 bg-amber-500/5 blur-xl group-hover:bg-amber-500/10 transition-all rounded-xl opacity-50" />

                            <div className="relative z-10">
                                <h3 className="font-bold text-lg text-amber-100 group-hover:text-white transition-colors">Styrkja</h3>
                                <p className="text-xs text-amber-200/70">Gerast bakhjarl</p>
                            </div>
                            <div className="relative z-10 w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center group-hover:scale-110 group-hover:bg-amber-500/20 transition-all border border-amber-500/20">
                                <Heart size={18} className="text-amber-300" />
                            </div>
                        </Link>
                    </div>

                    {/* Schedule Grid */}
                    <LiveSchedule onUpdate={setCurrentProgram} />

                </div>

            </div>
        </main>
    );
}
