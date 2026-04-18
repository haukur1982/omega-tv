import { formatClockUtc } from '@/lib/schedule-db';
import { getSanctuaryAnchor, getBroadcastPrayers } from '@/lib/sanctuary-db';
import BroadcastPrayerWall from './BroadcastPrayerWall';
import SubmitPrayerForm from './SubmitPrayerForm';

/**
 * PrayerHall — the primary prayer surface on /beint.
 *
 * Plan §4.3 rework after Hawk's feedback: prayer is the soul of the
 * broadcast, not a sidebar ornament. The CEO is a man of prayer. So
 * this section is a full-width hall, not a 320px drawer.
 *
 * Structure:
 *   - Header with the broadcast anchor (now-live or next-upcoming)
 *   - Prayer wall: multi-column masonry of prayer cards with
 *     "bið með" interaction
 *   - Submit form: always visible, warm, inviting
 *
 * Anchoring:
 *   - "live" mode: currently on-air live broadcast — prayers show
 *     with a red pulse on the header
 *   - "upcoming" mode: no live right now, but one's within 7 days —
 *     prayers accumulate in anticipation
 *   - "idle" mode: no live anywhere in the near future — hall rests
 *     with a quiet editorial line, no form
 */
export default async function PrayerHall() {
    const anchor = await getSanctuaryAnchor();

    if (!anchor.slot) {
        return (
            <section
                aria-label="Samfélag í bæn"
                style={{
                    padding: 'clamp(2rem, 4vw, 3rem) var(--rail-padding)',
                    maxWidth: '1400px',
                    margin: '0 auto',
                }}
            >
                <header style={{ marginBottom: 'clamp(16px, 1.8vw, 24px)' }}>
                    <p className="type-merki" style={{ color: 'var(--moskva)', margin: 0, letterSpacing: '0.22em' }}>
                        Samfélag í bæn
                    </p>
                </header>
                <p
                    style={{
                        margin: 0,
                        fontFamily: 'var(--font-serif)',
                        fontStyle: 'italic',
                        color: 'var(--moskva)',
                        fontSize: '1.05rem',
                        lineHeight: 1.65,
                        maxWidth: '54ch',
                    }}
                >
                    Engin bein útsending á næstu dögum. Við biðjum aftur saman á miðvikudaginn.
                </p>
            </section>
        );
    }

    const slot = anchor.slot;
    const prayers = await getBroadcastPrayers(slot.id, 24);
    const isLive = anchor.mode === 'live';
    const startTime = formatClockUtc(slot.starts_at);
    const startDate = new Date(slot.starts_at);
    const dayLabel = startDate.toLocaleDateString('is-IS', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
    });
    const dayCap = dayLabel.charAt(0).toUpperCase() + dayLabel.slice(1);

    return (
        <section
            aria-label="Samfélag í bæn"
            style={{
                padding: 'clamp(2.5rem, 5vw, 4rem) var(--rail-padding) clamp(3rem, 5vw, 4.5rem)',
                maxWidth: '1400px',
                margin: '0 auto',
            }}
        >
            {/* ── Header ──────────────────────────────────────────── */}
            <header
                style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: 'clamp(1rem, 2vw, 2rem)',
                    alignItems: 'flex-end',
                    justifyContent: 'space-between',
                    marginBottom: 'clamp(22px, 2.6vw, 32px)',
                }}
            >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                        {isLive ? (
                            <span
                                className="type-merki"
                                style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    padding: '4px 10px',
                                    background: 'rgba(216, 75, 58, 0.14)',
                                    border: '1px solid rgba(216, 75, 58, 0.4)',
                                    borderRadius: '2px',
                                    color: 'var(--blod)',
                                    letterSpacing: '0.22em',
                                    fontSize: '0.62rem',
                                }}
                            >
                                <span
                                    className="live-dot"
                                    aria-hidden="true"
                                    style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--blod)', display: 'inline-block' }}
                                />
                                Í beinni núna
                            </span>
                        ) : (
                            <span className="type-merki" style={{ color: 'var(--kerti)', letterSpacing: '0.22em' }}>
                                Næsta bein útsending
                            </span>
                        )}
                        <span className="type-meta" style={{ color: 'var(--steinn)' }}>
                            {dayCap} · kl. {startTime}
                        </span>
                    </div>
                    <h2
                        className="type-kveda"
                        style={{
                            margin: 0,
                            color: 'var(--ljos)',
                            fontSize: 'clamp(1.9rem, 3.6vw, 2.75rem)',
                            lineHeight: 1.05,
                            letterSpacing: '-0.025em',
                        }}
                    >
                        Samfélag í bæn
                    </h2>
                    <p
                        style={{
                            margin: 0,
                            fontFamily: 'var(--font-serif)',
                            fontStyle: 'italic',
                            color: 'var(--moskva)',
                            fontSize: '1.02rem',
                            lineHeight: 1.55,
                            maxWidth: '54ch',
                        }}
                    >
                        {isLive
                            ? `Við biðjum saman á meðan ${slot.program_title.toLowerCase()} stendur yfir. Sendu bæn þína og bið með öðrum.`
                            : `Við söfnum bænum fyrir ${slot.program_title.toLowerCase()}. Sendu bæn þína og bið með öðrum — þær verða lesnar í útsendingunni.`}
                    </p>
                </div>

                {prayers.length > 0 && (
                    <p
                        className="type-merki"
                        style={{ color: 'var(--moskva)', margin: 0, letterSpacing: '0.22em', whiteSpace: 'nowrap' }}
                    >
                        {prayers.length} bænir
                    </p>
                )}
            </header>

            {/* ── Prayer wall ─────────────────────────────────────── */}
            <BroadcastPrayerWall prayers={prayers} columns="multi" />

            {/* ── Submission form ─────────────────────────────────── */}
            <div
                style={{
                    marginTop: 'clamp(2rem, 3vw, 2.75rem)',
                    padding: 'clamp(24px, 3vw, 32px)',
                    background: 'var(--torfa)',
                    border: '1px solid var(--border)',
                    borderRadius: '4px',
                }}
            >
                <p
                    className="type-merki"
                    style={{
                        color: 'var(--kerti)',
                        margin: 0,
                        marginBottom: '10px',
                        letterSpacing: '0.22em',
                    }}
                >
                    Senda bæn
                </p>
                <p
                    style={{
                        margin: 0,
                        marginBottom: '18px',
                        fontFamily: 'var(--font-serif)',
                        fontStyle: 'italic',
                        color: 'var(--moskva)',
                        fontSize: '0.98rem',
                        lineHeight: 1.55,
                        maxWidth: '58ch',
                    }}
                >
                    Bænir fara í yfirferð áður en þær birtast hér. Eiríkur og bænaliðið lesa þær og biðja með þér í útsendingu.
                </p>
                <SubmitPrayerForm slotId={slot.id} />
            </div>
        </section>
    );
}
