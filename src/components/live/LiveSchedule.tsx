'use client';

import { useState, useEffect } from 'react';
import { Calendar } from 'lucide-react';

interface Program {
    title: string;
    startTime: string;
    endTime: string;
    duration: number;
}

interface ScheduleData {
    current: Program | null;
    next: Program[];
}

export default function LiveSchedule({ onUpdate }: { onUpdate?: (current: Program | null) => void }) {
    const [data, setData] = useState<ScheduleData | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchSchedule = async () => {
        try {
            const res = await fetch('/api/schedule');
            if (res.ok) {
                const json = await res.json();
                setData(json);
                // Notify parent component about current program
                if (onUpdate && json.current) {
                    onUpdate(json.current);
                }
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSchedule();
        const interval = setInterval(fetchSchedule, 60000); // Update every minute
        return () => clearInterval(interval);
    }, []);

    // If loading, show a skeleton or nothing (to avoid layout shift)
    if (loading) return null;

    if (!data || data.next.length === 0) return null;

    const todayDate = new Date().toLocaleDateString('is-IS', { weekday: 'long', day: 'numeric', month: 'long' });
    const capitalizedDate = todayDate.charAt(0).toUpperCase() + todayDate.slice(1);

    return (
        <div className="w-full max-w-4xl mt-12 px-4">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-2">
                <h3 className="text-xl font-bold flex items-center gap-2">
                    <Calendar className="text-[var(--accent-gold)]" size={24} />
                    Á dagskrá
                </h3>
                <span className="text-sm font-serif text-[var(--accent-gold)] tracking-wide opacity-80 uppercase">
                    {capitalizedDate}
                </span>
            </div>

            <div className="relative border-l-2 border-[var(--white-5)] ml-3 md:ml-6 space-y-8 pb-12">
                {data.next.slice(0, 10).map((item, idx) => (
                    <div key={idx} className="relative pl-8 md:pl-12 group">
                        {/* Timeline Node */}
                        <div className="absolute -left-[9px] top-0 w-5 h-5 rounded-full border-4 border-[var(--bg-deep)] bg-[var(--text-muted)] group-hover:bg-[var(--accent-gold)] transition-colors shadow-xl" />

                        <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-6">
                            {/* Time */}
                            <div className="md:w-20 shrink-0">
                                <span className="font-mono font-bold text-lg text-[var(--accent-gold)]">
                                    {formatTime(item.startTime)}
                                </span>
                            </div>

                            {/* Card */}
                            <div className="flex-1 p-4 rounded-xl bg-[var(--bg-surface)] border border-[var(--glass-border)] group-hover:border-[var(--accent-gold)]/50 transition-all">
                                <h4 className="font-bold text-lg text-white group-hover:text-[var(--accent-gold)] transition-colors">
                                    {item.title}
                                </h4>
                                <div className="flex items-center gap-4 mt-1">
                                    <span className="text-xs text-[var(--text-muted)] flex items-center gap-1">
                                        ⏱ {Math.round(item.duration / 60)} mín
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <p className="text-center text-[10px] text-[var(--text-muted)] mt-6">
                Dagskrá er birt með fyrirvara um breytingar.
            </p>
        </div>
    );
}

function formatTime(isoString: string) {
    const date = new Date(isoString);
    const hours = date.getUTCHours().toString().padStart(2, '0');
    const minutes = date.getUTCMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
}
