'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { PlayCircle, Award } from 'lucide-react';
import { useState } from 'react';

// Mirroring the schema needed for courses
interface CourseProps {
    id: string;
    slug: string;
    title: string;
    description: string;
    poster_horizontal: string | null;
}

export default function CourseCard({ course, index }: { course: CourseProps; index: number }) {
    const [isHovered, setIsHovered] = useState(false);
    const [imageError, setImageError] = useState(false);

    // Fallback if Unsplash or remote URL fails
    const displayImage = (imageError || !course.poster_horizontal)
        ? "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=1400&auto=format&fit=crop"
        : course.poster_horizontal;

    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1, duration: 0.6, ease: "easeOut" }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            // 16:9 Aspect Ratio for Cinematic "MasterClass" feel
            className="group relative aspect-video rounded-xl cursor-pointer z-0 hover:z-10"
        >
            <Link href={`/namskeid/${course.slug}`} className="block w-full h-full">

                {/* The Focus Engine Bounding Box */}
                <motion.div
                    animate={{
                        scale: isHovered ? 1.04 : 1,
                        y: isHovered ? -8 : 0,
                        boxShadow: isHovered
                            ? '0 30px 60px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.1)'
                            : '0 4px 20px rgba(0,0,0,0.3), 0 0 0 1px rgba(255,255,255,0.03)'
                    }}
                    transition={{ type: "spring", stiffness: 300, damping: 25 }}
                    className="absolute inset-0 bg-[var(--bg-deep)] rounded-xl overflow-hidden"
                >
                    {/* Background Artwork */}
                    <div className="relative w-full h-full bg-black">
                        {/* Ken Burns Effect on the Image */}
                        <motion.img
                            src={displayImage}
                            alt={course.title}
                            animate={{
                                scale: isHovered ? 1.05 : 1,
                                opacity: isHovered ? 0.6 : 0.85
                            }}
                            transition={{ duration: 1.5, ease: "easeOut" }}
                            className="absolute inset-0 w-full h-full object-cover"
                            onError={() => setImageError(true)}
                        />
                        
                        {/* Apple TV specific dark gradient overlay to protect typography */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-95" />
                    </div>

                    {/* Centered Play UI (Appears strongly on hover) */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ 
                                scale: isHovered ? 1.1 : 0.8, 
                                opacity: isHovered ? 1 : 0 
                            }}
                            transition={{ type: "spring", stiffness: 400, damping: 25 }}
                            className="w-16 h-16 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-[0_0_30px_rgba(255,255,255,0.1)]"
                        >
                            <PlayCircle size={32} className="text-white drop-shadow-md" />
                        </motion.div>
                    </div>

                    {/* Metadata Anchored Bottom Left */}
                    <div className="absolute bottom-0 left-0 right-0 p-6 flex flex-col justify-end transform transition-transform duration-500">
                        {/* Eyebrow Label */}
                        <motion.div 
                            animate={{ y: isHovered ? -4 : 0 }}
                            transition={{ type: "spring", stiffness: 300, damping: 20 }}
                            className="flex items-center gap-2 mb-2"
                        >
                            <Award size={14} className="text-[var(--accent)]" />
                            <span className="text-[var(--accent)] text-[10px] font-bold uppercase tracking-[0.25em]">
                                Meistaraklass
                            </span>
                        </motion.div>

                        <motion.h3 
                            animate={{ y: isHovered ? -4 : 0 }}
                            transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.02 }}
                            className="text-white font-bold text-xl md:text-2xl leading-tight drop-shadow-lg line-clamp-2"
                        >
                            {course.title}
                        </motion.h3>

                        {/* Description reveals smoothly on hover */}
                        <motion.div
                            initial={{ height: 0, opacity: 0, marginTop: 0 }}
                            animate={{ 
                                height: isHovered ? 'auto' : 0, 
                                opacity: isHovered ? 1 : 0,
                                marginTop: isHovered ? 8 : 0
                            }}
                            className="overflow-hidden"
                        >
                            <p className="text-[var(--text-secondary)] text-sm line-clamp-2 leading-relaxed">
                                {course.description}
                            </p>
                        </motion.div>
                    </div>

                </motion.div>
            </Link>
        </motion.div>
    );
}
