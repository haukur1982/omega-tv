import Link from 'next/link';
import type { Prayer } from '@/lib/prayer-db';
import { formatIcelandicDayMonth } from '@/lib/prayer-format';

/**
 * Svarað — the register of answered prayers, above the feed.
 *
 * Answers first. A wall of requests alone reads as a list of troubles; the
 * point of keeping a ministry's memory is that some of it came back. So the
 * band sits between the phone panel and the feed, gold-ruled, warm, and
 * short — two or three, never a scrolling hall of trophies.
 *
 * Renders nothing when no prayer has been marked answered.
 */

const MAX_SHOWN = 3;

interface Props {
    prayers: Prayer[];
}

export default function AnsweredRegister({ prayers }: Props) {
    const answered = prayers.filter((p) => p.isAnswered).slice(0, MAX_SHOWN);
    if (answered.length === 0) return null;

    return (
        <section
            aria-labelledby="svarad-heading"
            style={{
                marginTop: 'clamp(40px, 5vw, 64px)',
                paddingTop: '30px',
                paddingBottom: '34px',
                borderTop: '1px solid var(--gull)',
                borderBottom: '1px solid rgba(200,138,62,0.35)',
            }}
        >
            <div
                style={{
                    display: 'flex',
                    alignItems: 'baseline',
                    justifyContent: 'space-between',
                    gap: '20px',
                    flexWrap: 'wrap',
                    marginBottom: '26px',
                }}
            >
                <div>
                    <h2
                        id="svarad-heading"
                        style={{
                            margin: 0,
                            fontFamily: 'var(--font-sans)',
                            fontSize: '11px',
                            fontWeight: 700,
                            letterSpacing: '0.22em',
                            textTransform: 'uppercase',
                            color: 'var(--gull)',
                        }}
                    >
                        Svarað
                    </h2>
                    <p
                        style={{
                            margin: '10px 0 0',
                            fontFamily: 'var(--font-serif)',
                            fontStyle: 'italic',
                            fontSize: 'clamp(17px, 1.5vw, 20px)',
                            lineHeight: 1.5,
                            color: 'var(--skra-mjuk)',
                            maxWidth: '32rem',
                        }}
                    >
                        Bænir sem komu til baka.
                    </p>
                </div>

                <Link
                    href="/vitnisburdur"
                    style={{
                        fontFamily: 'var(--font-sans)',
                        fontSize: '11.5px',
                        fontWeight: 700,
                        letterSpacing: '0.16em',
                        textTransform: 'uppercase',
                        color: 'var(--skra-mjuk)',
                        textDecoration: 'none',
                        borderBottom: '1px solid rgba(63,47,35,0.25)',
                        paddingBottom: '3px',
                    }}
                >
                    Vitnisburðir
                </Link>
            </div>

            <div
                className="answered-register-grid"
                style={{
                    display: 'grid',
                    gridTemplateColumns: `repeat(${answered.length}, minmax(0, 1fr))`,
                    gap: 'clamp(20px, 3vw, 36px)',
                }}
            >
                {answered.map((p) => (
                    <article key={p.id}>
                        <p
                            style={{
                                margin: 0,
                                fontFamily: 'var(--font-serif)',
                                fontStyle: 'italic',
                                fontSize: 'clamp(17px, 1.5vw, 19px)',
                                lineHeight: 1.55,
                                color: 'var(--skra-djup)',
                                textWrap: 'pretty',
                            }}
                        >
                            {p.content}
                        </p>
                        <div
                            style={{
                                marginTop: '16px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '10px',
                                flexWrap: 'wrap',
                                fontFamily: 'var(--font-sans)',
                                fontSize: '11px',
                                fontWeight: 600,
                                letterSpacing: '0.16em',
                                textTransform: 'uppercase',
                                color: 'var(--skra-mjuk)',
                            }}
                        >
                            <span
                                aria-hidden
                                style={{
                                    width: '18px',
                                    height: '1px',
                                    background: 'var(--gull)',
                                    display: 'inline-block',
                                }}
                            />
                            <span>{p.name || 'Nafnlaust systkin'}</span>
                            <span style={{ opacity: 0.4 }}>·</span>
                            <span>{formatIcelandicDayMonth(p.timestamp)}</span>
                        </div>
                    </article>
                ))}
            </div>

            <style>{`
                @media (max-width: 860px) {
                    .answered-register-grid {
                        grid-template-columns: minmax(0, 1fr) !important;
                    }
                }
            `}</style>
        </section>
    );
}
