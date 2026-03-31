'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play } from 'lucide-react';

interface PlayerProps {
    videoId?: string;
    libraryId?: string;
    title?: string;
    embedUrl?: string;
}

export default function FuturisticPlayer({ videoId, libraryId, title, embedUrl }: PlayerProps) {
    const [isPlaying, setIsPlaying] = useState(false);

    const isVOD = !!videoId;
    const activeVideoId = videoId || '';
    const activeLibraryId = libraryId || process.env.NEXT_PUBLIC_BUNNY_LIBRARY_ID || '';

    return (
        <div className="relative w-full aspect-video">
            <div className="relative z-10 w-full h-full bg-black overflow-hidden">

                {/* Video Content */}
                <div className="absolute inset-0 bg-black flex items-center justify-center">
                    {isPlaying && (
                        <>
                            {embedUrl ? (
                                <iframe
                                    src={embedUrl}
                                    className="w-full h-full border-0 absolute inset-0 z-10"
                                    allow="autoplay; fullscreen; picture-in-picture"
                                    allowFullScreen
                                />
                            ) : activeVideoId ? (
                                <iframe
                                    src={`https://iframe.mediadelivery.net/embed/${activeLibraryId}/${activeVideoId}?autoplay=true&loop=${!isVOD}&muted=false&preload=true`}
                                    loading="lazy"
                                    className="w-full h-full border-0 absolute inset-0 z-10"
                                    allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture;"
                                    allowFullScreen
                                />
                            ) : null}
                        </>
                    )}
                </div>

                {/* Pre-play overlay */}
                <AnimatePresence>
                    {!isPlaying && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.5 }}
                            className="absolute inset-0 bg-black/70 flex flex-col justify-between p-6 md:p-10 z-20"
                        >
                            {/* Top — Live badge */}
                            <div className="flex items-center gap-3">
                                {!isVOD && (
                                    <div className="flex items-center gap-2">
                                        <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                                        <span className="text-red-400 text-xs font-bold tracking-[0.15em] uppercase">Beint</span>
                                    </div>
                                )}
                                {title && (
                                    <span className="text-white/70 text-sm font-medium">{title}</span>
                                )}
                            </div>

                            {/* Center — Play button */}
                            <div
                                className="absolute inset-0 flex items-center justify-center cursor-pointer"
                                onClick={() => setIsPlaying(true)}
                            >
                                <motion.div
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="w-20 h-20 flex items-center justify-center bg-white/10 border border-white/20 backdrop-blur-sm hover:bg-[var(--accent)] hover:border-[var(--accent)] transition-colors"
                                >
                                    <Play size={32} className="ml-1 text-white fill-white" />
                                </motion.div>
                            </div>

                            {/* Bottom — hint */}
                            <div className="text-center">
                                <p className="text-white/30 text-xs tracking-[0.2em] uppercase">
                                    {isVOD ? 'Smelltu til að spila' : 'Bein útsending'}
                                </p>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
