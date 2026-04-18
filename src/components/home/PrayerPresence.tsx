import Link from 'next/link';
import { getRecentBroadcastPrayers } from '@/lib/sanctuary-db';

/**
 * PrayerPresence — compact home-page module.
 *
 * Surfaces the three most recent approved broadcast prayers with a
 * quiet invitation to pray along on /beint. Makes prayer feel alive
 * across the site, not just on the live page.
 *
 * Self-hides if there are no approved broadcast prayers yet.
 */
export default async function PrayerPresence() {
    const prayers = await getRecentBroadcastPrayers(3);
    if (prayers.length === 0) return null;

    return (
        <section
            aria-label="Bænatorg útsendingarinnar"
            style={{
                maxWidth: '80rem',
                margin: '0 auto',
                padding: '0 var(--rail-padding)',
                marginTop: 'clamp(3rem, 5vw, 4.5rem)',
            }}
        >
            <header
                style={{
                    display: 'flex',
                    alignItems: 'baseline',
                    justifyContent: 'space-between',
                    gap: '1rem',
                    marginBottom: 'clamp(1rem, 1.6vw, 1.5rem)',
                }}
            >
                <h2 className="type-yfirskrift" style={{ margin: 0, color: 'var(--ljos)' }}>
                    Samfélag í bæn
                </h2>
                <Link
                    href="/live#samfelag"
                    className="type-merki muted-link"
                    style={{
                        textDecoration: 'none',
                        letterSpacing: '0.18em',
                        fontSize: '0.7rem',
                    }}
                >
                    Sjá allar →
                </Link>
            </header>

            <div
                style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                    gap: 'clamp(0.75rem, 1.5vw, 1rem)',
                }}
            >
                {prayers.map((p) => (
                    <Link
                        key={p.id}
                        href="/live#samfelag"
                        className="warm-hover"
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '12px',
                            padding: 'clamp(18px, 2vw, 22px)',
                            background: 'var(--torfa)',
                            border: '1px solid var(--border)',
                            borderRadius: '4px',
                            textDecoration: 'none',
                            color: 'inherit',
                            minHeight: '140px',
                        }}
                    >
                        <p
                            className="type-merki"
                            style={{
                                margin: 0,
                                color: 'var(--moskva)',
                                letterSpacing: '0.22em',
                                fontSize: '0.6rem',
                            }}
                        >
                            {p.name ?? 'Nafnlaus'}
                            {(p.pray_count ?? 0) > 0 && (
                                <span style={{ marginLeft: '10px', color: 'var(--kerti)' }}>
                                    · {p.pray_count} biðja með
                                </span>
                            )}
                        </p>
                        <p
                            style={{
                                margin: 0,
                                fontFamily: 'var(--font-serif)',
                                color: 'var(--ljos)',
                                fontSize: '0.98rem',
                                lineHeight: 1.55,
                                display: '-webkit-box',
                                WebkitLineClamp: 4,
                                WebkitBoxOrient: 'vertical',
                                overflow: 'hidden',
                            }}
                        >
                            {p.content}
                        </p>
                    </Link>
                ))}
            </div>
        </section>
    );
}
