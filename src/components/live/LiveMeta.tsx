import Link from "next/link";
import { formatClockUtc, type ScheduleSlot } from "@/lib/schedule-db";
import SendaBaenButton from "./SendaBaenButton";

/**
 * LiveMeta — below-player panel when State A (on-air).
 *
 * Composition per Beint redesign direction:
 *   Left:  kicker ("Beint · Sunnudagssamkoma"), program title in Fraunces,
 *          italic Newsreader line ("Prédikar: ... · time range").
 *   Right: primary CTA (--kerti "Senda bænaefni") + ghost "Deila".
 *
 * CTAs route to /baenatorg (not an on-page PrayerHall — that's the old
 * layout). Share is a client-side navigator.share or copy-link fallback.
 */

interface Props {
    current: ScheduleSlot;
}

export default function LiveMeta({ current }: Props) {
    const start = formatClockUtc(current.starts_at);
    const end = formatClockUtc(current.ends_at);
    const dateLine = new Date(current.starts_at).toLocaleDateString('is-IS', {
        weekday: 'long', day: 'numeric', month: 'long',
    });
    const capDate = dateLine.charAt(0).toUpperCase() + dateLine.slice(1);

    return (
        <div
            style={{
                display: 'grid',
                gridTemplateColumns: 'minmax(0,1fr) auto',
                gap: '24px',
                alignItems: 'end',
                paddingTop: '28px',
                paddingBottom: '28px',
                borderBottom: '1px solid var(--border)',
            }}
        >
            <div>
                <span
                    className="type-merki"
                    style={{ display: 'block', marginBottom: '12px', color: 'var(--nordurljos)' }}
                >
                    Beint · {current.program_type === 'service' ? 'Sunnudagssamkoma' : current.program_type === 'prayer_night' ? 'Bænakvöld' : 'Útsending'}
                </span>
                <h1
                    className="type-greinar"
                    style={{
                        margin: 0,
                        color: 'var(--ljos)',
                        fontSize: 'clamp(1.9rem, 3.2vw, 2.4rem)',
                    }}
                >
                    {current.program_title}
                </h1>
                <p
                    style={{
                        margin: '10px 0 0',
                        color: 'var(--moskva)',
                        fontFamily: 'var(--font-serif)',
                        fontStyle: 'italic',
                        fontSize: '1rem',
                        lineHeight: 1.55,
                    }}
                >
                    {current.host_name ? `Prédikar: ${current.host_name}` : 'Omega'}
                    {' · '}
                    {capDate} · {start}–{end}
                </p>
            </div>

            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                <SendaBaenButton variant="primary" />
                <Link
                    href="#"
                    className="ghost-btn"
                    style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '10px',
                        padding: '13px 22px',
                        borderRadius: 'var(--radius-xs)',
                        background: 'transparent',
                        color: 'var(--ljos)',
                        border: '1px solid',
                        fontFamily: 'var(--font-sans)',
                        fontSize: '13.5px',
                        fontWeight: 600,
                        textDecoration: 'none',
                    }}
                >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                        <circle cx="18" cy="5" r="3" />
                        <circle cx="6" cy="12" r="3" />
                        <circle cx="18" cy="19" r="3" />
                        <path d="M8.6 13.5l6.8 4M15.4 6.5l-6.8 4" />
                    </svg>
                    Deila
                </Link>
            </div>
        </div>
    );
}
