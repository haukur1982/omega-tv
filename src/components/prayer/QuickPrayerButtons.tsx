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
                className="w-full md:w-64 bg-[var(--bg-surface)] border border-[var(--border)] px-4 py-3 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)] transition-colors"
            />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
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
                                py-4 px-4 text-center text-sm font-semibold transition-all duration-300
                                ${isDone
                                    ? 'bg-[var(--accent)]/10 text-[var(--accent)] border border-[var(--accent)]/20'
                                    : noName
                                        ? 'bg-[var(--bg-surface)] border border-[var(--border)] text-[var(--text-muted)] cursor-not-allowed'
                                        : 'bg-[var(--bg-surface)] border border-[var(--border)] hover:border-[var(--accent)] text-[var(--text-primary)]'
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
