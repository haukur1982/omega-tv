'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Play, Clock, MoreVertical } from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';

// Mock Data Interface
interface VideoProps {
    id: string; // Added ID
    title: string;
    preacher: string;
    duration: string;
    thumbnail: string;
    videoUrl?: string; // Optional direct URL if needed
    date: string;
    category: string;
}

export default function VODCard({ video, index }: { video: VideoProps; index: number }) {
    const [isHovered, setIsHovered] = useState(false);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className="group relative aspect-video rounded-[var(--radius-md)] cursor-pointer z-0 hover:z-10"
        >
            <Link href={`/sermons/${video.id}`} className="block w-full h-full">
                {/* Container that expands on hover - Netflix style effect */}
                <motion.div
                    animate={{
                        scale: isHovered ? 1.05 : 1,
                        y: isHovered ? -10 : 0,
                        boxShadow: isHovered
                            ? '0 20px 50px rgba(0,0,0,0.5), 0 0 0 2px var(--accent-gold)'
                            : '0 0 0 0px transparent'
                    }}
                    transition={{ type: "spring", stiffness: 200, damping: 20 }}
                    className="absolute inset-0 bg-[var(--bg-surface)] rounded-[var(--radius-md)] overflow-hidden border border-[var(--glass-border)]"
                >
                    {/* Thumbnail Layer */}
                    <div className="relative w-full h-full">
                        <Image
                            src={video.thumbnail}
                            alt={video.title}
                            fill
                            className="object-cover transition-opacity duration-500"
                            style={{ opacity: isHovered ? 0.4 : 1 }}
                        />
                        {/* Dark Gradient Overlay for text readability */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80" />
                    </div>

                    {/* Hover Video Preview (Placeholder logic) */}
                    {isHovered && (
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <motion.div
                                initial={{ scale: 0.5, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                className="w-12 h-12 rounded-full bg-[var(--primary-glow)] flex items-center justify-center shadow-[0_0_20px_var(--primary-glow)]"
                            >
                                <Play size={20} fill="white" className="ml-1" />
                            </motion.div>
                        </div>
                    )}

                    {/* Info Layer (Always visible but enhanced on hover) */}
                    <div className="absolute bottom-0 left-0 right-0 p-4 transform transition-transform duration-300">
                        <div className="flex items-center gap-2 text-[var(--text-muted)] text-xs font-medium mb-2">
                            <Clock size={12} />
                            <span>{video.duration}</span>
                        </div>

                        <h3 className="text-white font-bold text-lg leading-tight mb-1 group-hover:text-[var(--accent-gold)] transition-colors line-clamp-2">
                            {video.title}
                        </h3>

                        <p className="text-sm text-white/70 line-clamp-1 group-hover:text-white transition-colors">
                            {video.preacher}
                        </p>

                        {/* Extra Actions appearing on hover */}
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: isHovered ? 'auto' : 0, opacity: isHovered ? 1 : 0 }}
                            className="overflow-hidden mt-2"
                        >
                            <div className="flex gap-2 pt-2">
                                <button className="flex-1 py-1.5 bg-white text-black text-xs font-bold rounded hover:bg-gray-200">Horfa</button>
                                <button className="p-1.5 bg-white/10 text-white rounded hover:bg-white/20">
                                    <MoreVertical size={16} />
                                </button>
                            </div>
                        </motion.div>
                    </div>

                </motion.div>
            </Link>
        </motion.div>
    );
}
