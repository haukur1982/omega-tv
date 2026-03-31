'use client';
import { useState, useEffect } from 'react';
import Navbar from "@/components/layout/Navbar";
import Link from "next/link";
import { Heart, Sparkles } from "lucide-react";
import LiveSchedule from "@/components/live/LiveSchedule";

export default function LivePage() {
    const [currentProgram, setCurrentProgram] = useState<any>(null);
    const [embedUrl, setEmbedUrl] = useState<string | undefined>(undefined);

    useEffect(() => {
        const url = process.env.NEXT_PUBLIC_LIVE_STREAM_EMBED_URL;
        if (url) setEmbedUrl(url);
    }, []);

    return (
        <main className="min-h-screen bg-[var(--bg-deep)]">
            <Navbar />

            {/* Player — full width, immersive, autoplay */}
            <div className="pt-[72px]">
                <div className="w-full bg-black">
                    <div className="max-w-[1400px] mx-auto">
                        <div className="relative w-full aspect-video">
                            {embedUrl ? (
                                <iframe
                                    src={`${embedUrl}&autoplay=1`}
                                    className="absolute inset-0 w-full h-full border-0"
                                    allow="autoplay; fullscreen; picture-in-picture"
                                    allowFullScreen
                                />
                            ) : (
                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                    <span className="text-[var(--text-muted)] text-sm uppercase tracking-[0.2em]">
                                        Engin útsending í gangi
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Info bar below player */}
            <div className="max-w-[1400px] mx-auto px-6 py-6 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[var(--border)]">
                <div>
                    <div className="flex items-center gap-3 mb-1">
                        <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                        <span className="text-red-400 font-semibold uppercase tracking-[0.15em] text-xs">Bein Útsending</span>
                    </div>
                    <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
                        {currentProgram ? currentProgram.title : 'Omega Stöðin'}
                    </h1>
                </div>

                <div className="flex gap-3">
                    <Link href="/baenatorg" className="flex items-center gap-2 px-5 py-3 border border-[var(--border)] hover:border-[var(--accent)] text-sm font-semibold transition-all">
                        <Sparkles size={14} className="text-[var(--accent)]" />
                        Senda Bæn
                    </Link>
                    <Link href="/give" className="flex items-center gap-2 px-5 py-3 bg-[var(--accent)] text-[var(--bg-deep)] text-sm font-semibold hover:brightness-110 transition-all">
                        <Heart size={14} />
                        Styrkja
                    </Link>
                </div>
            </div>

            {/* Schedule */}
            <div className="max-w-[1400px] mx-auto px-6">
                <LiveSchedule onUpdate={setCurrentProgram} />
            </div>
        </main>
    );
}
