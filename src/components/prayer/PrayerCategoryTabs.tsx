'use client';

import { ALL_TOPICS } from '@/lib/prayer-categories';

interface Props {
    active: string | null;
    onChange: (topic: string | null) => void;
}

export default function PrayerCategoryTabs({ active, onChange }: Props) {
    const tabs = [
        { value: null, label: 'Allar' },
        ...ALL_TOPICS.map(t => ({ value: t.value, label: t.label })),
    ];

    return (
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
            {tabs.map((tab) => (
                <button
                    key={tab.value || 'all'}
                    onClick={() => onChange(tab.value)}
                    className={`
                        whitespace-nowrap px-4 py-2 text-xs font-semibold uppercase tracking-[0.1em] transition-colors
                        ${active === tab.value
                            ? 'bg-[var(--accent)] text-[var(--bg-deep)]'
                            : 'bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--border)]'
                        }
                    `}
                >
                    {tab.label}
                </button>
            ))}
        </div>
    );
}
