'use client';

import { useState } from 'react';
import { submitQuickPrayerAction } from '@/actions/prayer';
import { PRAYER_CATEGORIES } from '@/lib/prayer-categories';
import { Check, Send } from 'lucide-react';

export default function QuickPrayerButtons() {
    const [name, setName] = useState('');
    const [sent, setSent] = useState<Record<string, boolean>>({});
    const [sending, setSending] = useState<string | null>(null);

    const handleQuickPrayer = async (topic: string) => {
        if (!name.trim()) return;
        if (sent[topic] || sending) return;
        setSending(topic);

        const result = await submitQuickPrayerAction(topic, name.trim());
        if (result.success) {
            setSent(prev => ({ ...prev, [topic]: true }));
        }
        setSending(null);
    };

    return (
        <div className="space-y-4">
            <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nafnið þitt..."
                className="w-full md:w-80 bg-white/5 border border-white/10 px-5 py-4 text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--accent)] transition-colors"
            />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {PRAYER_CATEGORIES.national.topics.map((topic) => {
                    const isDone = sent[topic.value];
                    const isLoading = sending === topic.value;
                    const noName = !name.trim();

                    return (
                        <button
                            key={topic.value}
                            onClick={() => handleQuickPrayer(topic.value)}
                            disabled={isDone || !!sending || noName}
                            className={`
                                py-5 px-4 text-center text-sm font-semibold transition-all duration-300
                                ${isDone
                                    ? 'bg-[var(--accent)]/20 text-[var(--accent)] border border-[var(--accent)]/30'
                                    : noName
                                        ? 'bg-white/5 border border-white/8 text-white/20 cursor-not-allowed'
                                        : 'bg-white/10 border border-white/15 hover:bg-[var(--accent)] hover:text-[var(--bg-deep)] text-[var(--text-primary)]'
                                }
                                ${isLoading ? 'opacity-60' : ''}
                            `}
                        >
                            {isDone ? (
                                <span className="flex items-center justify-center gap-2">
                                    <Check size={14} />
                                    Bæn send
                                </span>
                            ) : isLoading ? (
                                'Biðjandi...'
                            ) : (
                                `Biðja fyrir ${topic.label === 'Ríkisstjórnin' ? 'ríkisstjórninni' : topic.label === 'Kirkjan' ? 'kirkjunni' : topic.label}`
                            )}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
