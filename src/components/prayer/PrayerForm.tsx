'use client';

import { useState, useRef, useTransition } from 'react';
import { Send, CheckCircle2 } from 'lucide-react';
import { submitPrayerAction } from '@/actions/prayer';
import { PRAYER_CATEGORIES, CategoryType } from '@/lib/prayer-categories';
import { motion, AnimatePresence } from 'framer-motion';

export default function PrayerForm() {
    const [categoryType, setCategoryType] = useState<CategoryType>('personal');
    const [isPending, startTransition] = useTransition();
    const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const [promise, setPromise] = useState("");
    const formRef = useRef<HTMLFormElement>(null);

    const VERSES = [
        "Drottinn er minn hirðir, mig mun ekkert bresta. — Sálm 23:1",
        "Óttast þú eigi, því að ég er með þér. — Jesaja 41:10",
        "Biðjið og yður mun gefast, leitið og þér munuð finna. — Matt 7:7",
        "Varpaðu allri áhyggju þinni á hann. — 1. Pét 5:7",
    ];

    const topics = PRAYER_CATEGORIES[categoryType].topics;

    async function handleSubmit(formData: FormData) {
        setStatus('idle');
        formData.append('categoryType', categoryType);

        startTransition(async () => {
            const result = await submitPrayerAction(formData);
            if (result.success) {
                setPromise(VERSES[Math.floor(Math.random() * VERSES.length)]);
                setStatus('success');
                formRef.current?.reset();
                setTimeout(() => setStatus('idle'), 15000);
            } else {
                alert(result.error || "Villa kom upp.");
            }
        });
    }

    return (
        <div className="p-8 bg-[var(--bg-surface)] border border-[var(--border)] sticky top-32">
            <h3 className="text-2xl font-bold mb-2">Senda Bænaefni</h3>
            <p className="text-[var(--text-secondary)] mb-6 text-sm">
                Við stöndum saman í trúnni. Bænir eru öflugar.
            </p>

            <AnimatePresence mode="wait">
                {status === 'success' ? (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0 }}
                        className="py-12 flex flex-col items-center text-center space-y-4"
                    >
                        <CheckCircle2 size={32} className="text-green-500" />
                        <h4 className="text-xl font-bold">Bæn Móttekin</h4>
                        <p className="text-[var(--text-secondary)] text-sm">Takk. Við munum biðja fyrir þér.</p>
                        <p className="text-[var(--accent)] font-serif italic text-sm mt-4">"{promise}"</p>
                        <button onClick={() => setStatus('idle')} className="mt-4 text-xs text-[var(--accent)] font-semibold uppercase tracking-[0.15em] hover:underline">
                            Senda aðra bæn
                        </button>
                    </motion.div>
                ) : (
                    <form ref={formRef} action={handleSubmit} className="space-y-4">
                        {/* Category Type Toggle */}
                        <div className="grid grid-cols-2 gap-2 mb-2">
                            <button
                                type="button"
                                onClick={() => setCategoryType('personal')}
                                className={`py-2 text-xs font-semibold uppercase tracking-[0.1em] transition-colors ${
                                    categoryType === 'personal'
                                        ? 'bg-[var(--accent)] text-[var(--bg-deep)]'
                                        : 'bg-[var(--bg-deep)] border border-[var(--border)] text-[var(--text-secondary)]'
                                }`}
                            >
                                Persónulegt
                            </button>
                            <button
                                type="button"
                                onClick={() => setCategoryType('national')}
                                className={`py-2 text-xs font-semibold uppercase tracking-[0.1em] transition-colors ${
                                    categoryType === 'national'
                                        ? 'bg-[var(--accent)] text-[var(--bg-deep)]'
                                        : 'bg-[var(--bg-deep)] border border-[var(--border)] text-[var(--text-secondary)]'
                                }`}
                            >
                                Fyrir þjóðina
                            </button>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold uppercase tracking-[0.1em] text-[var(--text-muted)] mb-2">Nafn (Valfrjálst)</label>
                            <input
                                name="name"
                                type="text"
                                placeholder="Þitt nafn..."
                                className="w-full bg-[var(--bg-deep)] border border-[var(--border)] px-4 py-3 text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)] transition-colors"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-semibold uppercase tracking-[0.1em] text-[var(--text-muted)] mb-2">Netfang (birtist ekki)</label>
                            <input
                                name="email"
                                type="email"
                                placeholder="netfang@dæmi.is"
                                className="w-full bg-[var(--bg-deep)] border border-[var(--border)] px-4 py-3 text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)] transition-colors"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-semibold uppercase tracking-[0.1em] text-[var(--text-muted)] mb-2">Efni</label>
                            <select
                                name="topic"
                                className="w-full bg-[var(--bg-deep)] border border-[var(--border)] px-4 py-3 text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)] transition-colors appearance-none cursor-pointer"
                            >
                                {topics.map(t => (
                                    <option key={t.value} value={t.value}>{t.label}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold uppercase tracking-[0.1em] text-[var(--text-muted)] mb-2">Bænaefni</label>
                            <textarea
                                name="content"
                                rows={4}
                                required
                                maxLength={500}
                                placeholder={categoryType === 'national' ? 'Hvað liggur þér á hjarta fyrir þjóðina?' : 'Hvernig getum við beðið fyrir þér?'}
                                className="w-full bg-[var(--bg-deep)] border border-[var(--border)] px-4 py-3 text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)] transition-colors resize-none"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isPending}
                            className="w-full py-4 bg-[var(--accent)] text-[var(--bg-deep)] font-bold flex items-center justify-center gap-2 hover:brightness-110 transition-all disabled:opacity-50"
                        >
                            {isPending ? (
                                <span className="w-5 h-5 border-2 border-[var(--bg-deep)]/30 border-t-[var(--bg-deep)] rounded-full animate-spin" />
                            ) : (
                                <>
                                    <Send size={16} />
                                    <span>Senda Bæn</span>
                                </>
                            )}
                        </button>
                    </form>
                )}
            </AnimatePresence>
        </div>
    );
}
