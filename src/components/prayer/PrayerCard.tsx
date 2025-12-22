'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Hand, Share2 } from 'lucide-react';

interface PrayerProps {
    id: string;
    name: string;
    topic: string;
    content: string;
    timestamp: number;
    prayCount: number;
    isAnswered?: boolean;
}

export default function PrayerCard({ prayer, index }: { prayer: PrayerProps; index: number }) {
    const [count, setCount] = useState(prayer.prayCount);
    const [hasPrayed, setHasPrayed] = useState(false);

    const handlePray = async () => {
        if (!hasPrayed) {
            // Optimistic update
            setCount(c => c + 1);
            setHasPrayed(true);

            // Server Action
            const { prayForAction } = await import('@/actions/prayer');
            const result = await prayForAction(prayer.id);
            if (!result.success) {
                // Revert if failed
                setCount(c => c - 1);
                setHasPrayed(false);
            }
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`relative p-6 rounded-[var(--radius-lg)] border transition-all duration-300 ${prayer.isAnswered
                ? 'bg-[var(--bg-surface)] border-[var(--accent-gold)] shadow-[0_0_20px_rgba(245,158,11,0.1)]'
                : 'bg-[var(--glass-bg)] border-[var(--glass-border)] hover:border-[var(--glass-shine)]'
                }`}
        >
            {/* Answered Badge */}
            {prayer.isAnswered && (
                <div className="absolute -top-3 -right-3 bg-[var(--accent-gold)] text-black text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                    BÆNHEYRSLA
                </div>
            )}

            {/* Header */}
            <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg ${prayer.isAnswered ? 'bg-[var(--accent-gold)]/20 text-[var(--accent-gold)]' : 'bg-white/10 text-white'
                        }`}>
                        {prayer.name.charAt(0)}
                    </div>
                    <div>
                        <h3 className="font-bold text-white">{prayer.name}</h3>
                        <span className="text-xs text-[var(--text-muted)]">{new Date(prayer.timestamp).toLocaleDateString('is-IS')} • {prayer.topic}</span>
                    </div>
                </div>
            </div>

            {/* Content */}
            <p className="text-[var(--text-secondary)] mb-6 leading-relaxed">
                {prayer.content}
            </p>

            {/* Actions */}
            <div className="flex items-center justify-between border-t border-white/5 pt-4">
                <button
                    onClick={handlePray}
                    disabled={hasPrayed}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-300 ${hasPrayed
                        ? 'bg-[var(--accent-gold)] text-black font-bold'
                        : 'bg-white/5 hover:bg-white/10 text-white'
                        }`}
                >
                    <Hand size={18} className={hasPrayed ? "fill-black" : ""} />
                    <span>{hasPrayed ? 'Bæn Beðin' : 'Biðja'}</span>
                    <span className={`ml-1 text-xs px-2 py-0.5 rounded-full ${hasPrayed ? 'bg-black/20' : 'bg-white/10'}`}>
                        {count}
                    </span>
                </button>

                <button className="p-2 text-[var(--text-muted)] hover:text-white transition-colors">
                    <Share2 size={18} />
                </button>
            </div>

            {/* Pulse Animation for Prayer */}
            <AnimatePresence>
                {hasPrayed && (
                    <motion.div
                        initial={{ opacity: 1, scale: 0.8, x: '-50%', y: '-50%' }}
                        animate={{ opacity: 0, scale: 2 }}
                        exit={{ opacity: 0 }}
                        className="absolute top-1/2 left-1/2 pointer-events-none"
                    >
                        <Heart size={100} className="text-[var(--accent-gold)]" fill="currentColor" />
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}
