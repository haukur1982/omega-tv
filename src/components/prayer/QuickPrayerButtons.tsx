'use client';

import { useState } from 'react';
import { submitQuickPrayerAction } from '@/actions/prayer';
import { PRAYER_CATEGORIES } from '@/lib/prayer-categories';
import { Check } from 'lucide-react';

export default function QuickPrayerButtons() {
    const [sent, setSent] = useState<Record<string, boolean>>({});
    const [sending, setSending] = useState<string | null>(null);

    const handleQuickPrayer = async (topic: string) => {
        if (sent[topic] || sending) return;
        setSending(topic);

        const result = await submitQuickPrayerAction(topic);
        if (result.success) {
            setSent(prev => ({ ...prev, [topic]: true }));
        }
        setSending(null);
    };

    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {PRAYER_CATEGORIES.national.topics.map((topic) => {
                const isDone = sent[topic.value];
                const isLoading = sending === topic.value;

                return (
                    <button
                        key={topic.value}
                        onClick={() => handleQuickPrayer(topic.value)}
                        disabled={isDone || !!sending}
                        className={`
                            py-4 px-4 text-center text-sm font-semibold transition-all duration-300
                            ${isDone
                                ? 'bg-[var(--accent)]/10 text-[var(--accent)] border border-[var(--accent)]/20'
                                : 'bg-[var(--bg-surface)] border border-[var(--border)] hover:border-[var(--accent)] text-[var(--text-primary)]'
                            }
                            ${isLoading ? 'opacity-60' : ''}
                            disabled:cursor-default
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
    );
}
