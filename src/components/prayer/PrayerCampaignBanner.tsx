'use client';

import { useState } from 'react';
import { prayForCampaignAction } from '@/actions/prayer';
import { PrayerCampaign } from '@/lib/prayer-db';

export default function PrayerCampaignBanner({ campaign }: { campaign: PrayerCampaign }) {
    const [count, setCount] = useState(campaign.prayCount);
    const [hasPrayed, setHasPrayed] = useState(false);
    const [isPraying, setIsPraying] = useState(false);

    const daysLeft = Math.max(0, Math.ceil(
        (new Date(campaign.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    ));

    const handlePray = async () => {
        if (hasPrayed || isPraying) return;
        setIsPraying(true);
        setCount(c => c + 1);

        // Brief intentional pause
        await new Promise(resolve => setTimeout(resolve, 1500));

        const result = await prayForCampaignAction(campaign.id);
        if (!result.success) setCount(c => c - 1);

        setHasPrayed(true);
        setIsPraying(false);
    };

    return (
        <div className="border border-[var(--accent)]/30 bg-[var(--bg-surface)] p-8 md:p-10">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                <div className="flex-1">
                    <p className="text-[var(--accent)] text-xs font-semibold uppercase tracking-[0.2em] mb-3">
                        Bænaherferð · {daysLeft} dagar eftir
                    </p>
                    <h2 className="text-2xl md:text-3xl font-bold mb-3">{campaign.title}</h2>
                    {campaign.description && (
                        <p className="text-[var(--text-secondary)] leading-relaxed">{campaign.description}</p>
                    )}
                </div>

                <div className="flex flex-col items-center gap-3 min-w-[160px]">
                    <span className="text-3xl font-bold">{count.toLocaleString('is-IS')}</span>
                    <span className="text-xs text-[var(--text-muted)] uppercase tracking-[0.15em]">bænir</span>

                    <button
                        onClick={handlePray}
                        disabled={hasPrayed}
                        className={`
                            w-full py-3 px-6 font-bold text-sm transition-all duration-300
                            ${hasPrayed
                                ? 'bg-[var(--accent)]/10 text-[var(--accent)] border border-[var(--accent)]/20'
                                : isPraying
                                    ? 'bg-[var(--accent)]/20 text-[var(--accent)] animate-pulse'
                                    : 'bg-[var(--accent)] text-[var(--bg-deep)] hover:brightness-110'
                            }
                        `}
                    >
                        {hasPrayed ? 'Bæn beðin' : isPraying ? 'Biðjandi...' : 'Ég bid'}
                    </button>
                </div>
            </div>
        </div>
    );
}
