'use client';
import { useState, useEffect } from 'react';
import Navbar from "@/components/layout/Navbar";
import FuturisticPlayer from "@/components/player/FuturisticPlayer";
import Link from "next/link";
import { Heart, Sparkles } from "lucide-react";
import LiveSchedule from "@/components/live/LiveSchedule";

export default function LivePage() {
    const [currentProgram, setCurrentProgram] = useState<any>(null);
    const [liveStreamId, setLiveStreamId] = useState<string | undefined>(undefined);
    const [streamEmbedUrl, setStreamEmbedUrl] = useState<string | undefined>(undefined);

    useEffect(() => {
        async function fetchLiveStream() {
            try {
                const embedUrl = process.env.NEXT_PUBLIC_LIVE_STREAM_EMBED_URL;
                if (embedUrl) {
                    setStreamEmbedUrl(embedUrl);
                    return;
                }
                const { getLiveStream } = await import('@/lib/bunny');
                const stream = await getLiveStream();
                if (stream.videoId) setLiveStreamId(stream.videoId);
            } catch (error) {
                console.error("Failed to fetch live stream", error);
            }
        }
        fetchLiveStream();
    }, []);

    return (
        <main className="min-h-screen bg-[var(--bg-deep)]">
            <Navbar />

            <div className="pt-24 pb-10 max-w-6xl mx-auto px-6">

                {/* Header */}
                <div className="mb-6">
                    <div className="flex items-center gap-3 mb-3">
                        <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                        <span className="text-red-400 font-semibold uppercase tracking-[0.15em] text-xs">Bein Útsending</span>
                    </div>
                    <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
                        {currentProgram ? currentProgram.title : 'Omega Stöðin'}
                    </h1>
                </div>

                {/* Player */}
                <div className="w-full border border-[var(--border)] bg-black mb-8">
                    <FuturisticPlayer videoId={liveStreamId} embedUrl={streamEmbedUrl} />
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-16">
                    <Link href="/baenatorg" className="group flex items-center justify-between p-5 border border-[var(--border)] hover:border-[var(--accent)] transition-all">
                        <div>
                            <h3 className="font-bold group-hover:text-white transition-colors">Senda Bæn</h3>
                            <p className="text-xs text-[var(--text-secondary)]">Við biðjum fyrir þér</p>
                        </div>
                        <Sparkles size={18} className="text-[var(--accent)]" />
                    </Link>

                    <Link href="/give" className="group flex items-center justify-between p-5 border border-[var(--border)] hover:border-[var(--accent)] transition-all">
                        <div>
                            <h3 className="font-bold group-hover:text-white transition-colors">Styrkja</h3>
                            <p className="text-xs text-[var(--text-secondary)]">Gerast bakhjarl</p>
                        </div>
                        <Heart size={18} className="text-[var(--accent)]" />
                    </Link>
                </div>

                {/* Schedule */}
                <LiveSchedule onUpdate={setCurrentProgram} />
            </div>
        </main>
    );
}
