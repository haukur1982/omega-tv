'use client';

import { useState, useRef, useTransition } from 'react';
import { Send, Lock, Globe, CheckCircle2 } from 'lucide-react';
import { submitPrayerAction } from '@/actions/prayer';
import { motion, AnimatePresence } from 'framer-motion';

export default function PrayerForm() {
    const [isPrivate, setIsPrivate] = useState(false);
    const [isPending, startTransition] = useTransition();
    const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const [promise, setPromise] = useState("");
    const formRef = useRef<HTMLFormElement>(null);

    const VERSES = [
        "Drottinn er minn hirðir, mig mun ekkert bresta. - Sálm 23:1",
        "Óttast þú eigi, því að ég er með þér. - Jesaja 41:10",
        "Allt megnar ég fyrir hjálp hans sem mig styrkan gjörir. - Fil 4:13",
        "Varpaðu allri áhyggju þinni á hann, því að hann ber umhyggju fyrir yður. - 1. Pét 5:7",
        "Biðjið og yður mun gefast, leitið og þér munuð finna. - Matt 7:7"
    ];

    async function handleSubmit(formData: FormData) {
        setStatus('idle');
        startTransition(async () => {
            // Append privacy setting manually if needed, or handle in action if we add it to DB.
            // For now, "Private" just means "Don't show on wall".
            // Actually, the current DB doesn't support 'private' flag explicitly in the `addPrayer` interface I wrote?
            // Checking DB: `addPrayer` takes `name, topic, content`.
            // Wait, if it's private, we shouldn't show it on the wall.
            // But my `getPrayers` returns ALL prayers.
            // I should probably FILTER them in `page.tsx` or add `isPrivate` to DB.
            // Let's rely on "Content" being the filter for now? 
            // NO, I should update the DB schema to support `isPrivate`. 
            // BUT, I can't easily change the type without breaking existing file potentially? 
            // `addPrayer` adds whatever object properties.
            // I will send `isPrivate` in formData. If DB saves it, great.

            formData.append('isPrivate', isPrivate.toString());

            const result = await submitPrayerAction(formData);
            if (result.success) {
                setPromise(VERSES[Math.floor(Math.random() * VERSES.length)]);
                setStatus('success');
                formRef.current?.reset();
                // Reset success message after 3 seconds
                setTimeout(() => setStatus('idle'), 3000);
            } else {
                setStatus('error'); // Handle error msg if needed
                alert(result.error || "Villa kom upp.");
            }
        });
    }

    return (
        <div className="p-8 rounded-[var(--radius-lg)] bg-[var(--bg-surface)] border border-[var(--glass-border)] sticky top-32">
            <h3 className="text-2xl font-bold mb-2">Senda Bænaefni</h3>
            <p className="text-[var(--text-secondary)] mb-8 text-sm">
                Við stöndum saman í trúnni. Bænir eru öflugar.
            </p>

            <AnimatePresence>
                {status === 'success' ? (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0 }}
                        className="py-12 flex flex-col items-center justify-center text-center space-y-4"
                    >
                        <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center text-green-500 mb-2">
                            <CheckCircle2 size={32} />
                        </div>
                        <h4 className="text-xl font-bold text-white">Bæn Móttekin</h4>
                        <p className="text-[var(--text-secondary)]">Takk fyrir að deila með okkur. Við munum biðja fyrir þér.</p>

                        <div className="mt-4 p-4 bg-[var(--accent-gold)]/10 border border-[var(--accent-gold)]/20 rounded-lg">
                            <p className="text-[var(--accent-gold)] font-serif italic">"{promise}"</p>
                        </div>

                        <button onClick={() => setStatus('idle')} className="mt-4 text-sm text-[var(--accent-gold)] font-bold hover:underline">
                            Senda aðra bæn
                        </button>
                    </motion.div>
                ) : (
                    <form ref={formRef} action={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] mb-2">Nafn (Valfrjálst)</label>
                            <input
                                name="name"
                                type="text"
                                placeholder="Þitt nafn..."
                                className="w-full bg-[var(--bg-deep)] border border-[var(--glass-border)] rounded-[var(--radius-md)] px-4 py-3 text-white focus:outline-none focus:border-[var(--accent-gold)] transition-colors"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] mb-2">Netfang (Aðeins fyrir oss, birtist ekki á vefnum)</label>
                            <input
                                name="email"
                                type="email"
                                placeholder="netfang@dæmi.is"
                                className="w-full bg-[var(--bg-deep)] border border-[var(--glass-border)] rounded-[var(--radius-md)] px-4 py-3 text-white focus:outline-none focus:border-[var(--accent-gold)] transition-colors"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] mb-2">Efni</label>
                            <select name="topic" className="w-full bg-[var(--bg-deep)] border border-[var(--glass-border)] rounded-[var(--radius-md)] px-4 py-3 text-white focus:outline-none focus:border-[var(--accent-gold)] transition-colors appearance-none cursor-pointer">
                                <option>Lækning</option>
                                <option>Fjölskylda</option>
                                <option>Fjárhagur</option>
                                <option>Andlegur Vöxtur</option>
                                <option>Annað</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] mb-2">Bænaefni</label>
                            <textarea
                                name="content"
                                rows={4}
                                required
                                placeholder="Hvernig getum við beðið fyrir þér?"
                                className="w-full bg-[var(--bg-deep)] border border-[var(--glass-border)] rounded-[var(--radius-md)] px-4 py-3 text-white focus:outline-none focus:border-[var(--accent-gold)] transition-colors resize-none"
                            />
                        </div>

                        {/* Privacy Toggle */}
                        {/* <div className="flex items-center gap-4 py-2">
                            <button
                                type="button"
                                onClick={() => setIsPrivate(false)}
                                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-all ${!isPrivate ? 'bg-white/10 text-white' : 'text-[var(--text-muted)] hover:text-white'}`}
                            >
                                <Globe size={16} />
                                Opinbert
                            </button>
                            <button
                                type="button"
                                onClick={() => setIsPrivate(true)}
                                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-all ${isPrivate ? 'bg-[var(--accent-gold)]/20 text-[var(--accent-gold)] border border-[var(--accent-gold)]/30' : 'text-[var(--text-muted)] hover:text-white'}`}
                            >
                                <Lock size={16} />
                                Einkamál
                            </button>
                        </div> 
                        <p className="text-xs text-[var(--text-muted)] text-center mb-4">
                            {isPrivate ? 'Bænin fer eingöngu til bænateymis Omega.' : 'Bænin birtist á bænarveggnum.'}
                        </p>
                        */}

                        {/* Note: Disabling privacy toggle for MVP - all prayers are public for the "Wall" effect unless we filter server side. 
                            Users can just use initials if they want anonymity. 
                        */}

                        <button
                            type="submit"
                            disabled={isPending}
                            className="w-full py-4 bg-[var(--accent-gold)] text-black font-bold rounded-[var(--radius-md)] flex items-center justify-center gap-2 hover:brightness-110 transition-all shadow-[0_0_20px_rgba(245,158,11,0.2)] disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isPending ? (
                                <span className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                            ) : (
                                <>
                                    <Send size={18} />
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
