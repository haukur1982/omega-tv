'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, Volume2, Maximize2, Settings, MessageCircle, Signal } from 'lucide-react';
import clsx from 'clsx';

interface PlayerProps {
    videoId?: string;
    libraryId?: string;
    title?: string;
}

export default function FuturisticPlayer({ videoId, libraryId, title }: PlayerProps) {
    const [isPlaying, setIsPlaying] = useState(false);
    const [isHovered, setIsHovered] = useState(false);

    // If videoId is provided, we are in VOD mode.
    const isVOD = !!videoId;

    // Default to a placeholder if no ID is provided (or use environment variable default)
    const activeVideoId = videoId || 'default-video-id';
    const activeLibraryId = libraryId || process.env.NEXT_PUBLIC_BUNNY_LIBRARY_ID || 'default-library-id';

    // Pulse effect
    const [pulse, setPulse] = useState(1);
    useEffect(() => {
        if (isPlaying) {
            const interval = setInterval(() => {
                setPulse(p => p === 1 ? 1.05 : 1);
            }, 2000);
            return () => clearInterval(interval);
        }
    }, [isPlaying]);

    return (
        <div className="relative w-full aspect-video group">
            {/* Ambilight Glow */}
            <motion.div
                animate={{
                    opacity: isPlaying ? 0.6 : 0.2,
                    scale: isPlaying ? pulse : 1
                }}
                transition={{ duration: 2, ease: "easeInOut" }}
                className="absolute -inset-1 blur-[100px] bg-gradient-to-r from-blue-600 via-purple-600 to-[var(--accent-gold)] z-0 rounded-[var(--radius-lg)]"
            />

            {/* Main Player Container */}
            <div className="relative z-10 w-full h-full bg-black rounded-[var(--radius-lg)] overflow-hidden shadow-2xl border border-[var(--glass-border)]">

                {/* Video Content */}
                <div className="absolute inset-0 bg-black flex items-center justify-center">
                    {!isPlaying && (
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="text-center z-20"
                        >
                            <img src="/logo-white.png" alt="" className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        </motion.div>
                    )}

                    {isPlaying && (
                        <iframe
                            src={`https://iframe.mediadelivery.net/embed/${activeLibraryId}/${activeVideoId}?autoplay=true&loop=${!isVOD}&muted=false&preload=true`}
                            loading="lazy"
                            className="w-full h-full border-0 absolute inset-0 z-10"
                            allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture;"
                            allowFullScreen={true}
                        />
                    )}
                </div>

                {/* 2030 FEATURE: Premium Start Screen
                    This overlay is only visible BEFORE playback.
                    Once clicked, it vanishes to reveal the fully functional native player. 
                */}
                <AnimatePresence>
                    {!isPlaying && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0, scale: 1.1, filter: "blur(10px)" }}
                            transition={{ duration: 0.8 }}
                            className="absolute inset-0 bg-black/60 flex flex-col justify-between p-6 md:p-10 z-20"
                        >
                            {/* Top Bar - Context */}
                            <div className="flex justify-between items-start">
                                <div className="flex items-center gap-3">
                                    {!isVOD && (
                                        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-red-600/20 border border-red-500/30 backdrop-blur-md">
                                            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                                            <span className="text-red-400 text-xs font-bold tracking-wider uppercase">Beint</span>
                                        </div>
                                    )}
                                    <h3 className="text-white font-medium text-lg drop-shadow-md">
                                        {title || (isVOD ? "" : "Sunnudagssamkoma: Framtíð Miðlunar")}
                                    </h3>
                                </div>
                            </div>

                            {/* Center Action - The Trigger */}
                            <div className="absolute inset-0 flex items-center justify-center cursor-pointer" onClick={() => setIsPlaying(true)}>
                                <motion.div
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="p-8 rounded-full bg-[var(--glass-bg)] border border-[var(--glass-border)] backdrop-blur-2xl shadow-[0_0_50px_rgba(255,255,255,0.1)] group-hover:border-[var(--accent-gold)] transition-colors"
                                >
                                    <Play size={48} className="ml-1 text-white fill-white" />
                                </motion.div>
                            </div>

                            {/* Footer hint */}
                            <div className="text-center">
                                <p className="text-[var(--text-muted)] text-sm tracking-widest uppercase opacity-60">
                                    {isVOD ? 'Smelltu til að spila' : 'Bein Útsending í gangi'}
                                </p>
                            </div>

                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
