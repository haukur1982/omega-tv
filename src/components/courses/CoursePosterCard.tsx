import Link from "next/link";

/**
 * CoursePosterCard — poster-style card for the /namskeid index,
 * matching the cathedral aesthetic used on /sermons SeriesCard.
 *
 * 4:5 portrait, image-led, title overlaid bottom. Sits on the cream
 * body register. The detailed LeidCard with module ladder lives on
 * course detail pages — the index uses the lighter discovery card so
 * /namskeid reads as a library of courses, not a dashboard of
 * progress bars.
 *
 * Replaces the older `CourseCard` component which predated the
 * Altingi palette (uses `--bg-deep` / `--accent` tokens, Ken Burns
 * effect, Tailwind/framer-motion). The old file stays in place but
 * isn't mounted anywhere after this change.
 */

interface Props {
    href: string;
    title: string;
    instructor?: string | null;
    description?: string | null;
    image: string;
    moduleCount: number;
}

export default function CoursePosterCard({ href, title, instructor, description, image, moduleCount }: Props) {
    return (
        <Link
            href={href}
            className="series-card-link"
            style={{ display: 'block', color: 'var(--skra-djup)', textDecoration: 'none' }}
        >
            <article style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div
                    className="series-card-art"
                    style={{
                        position: 'relative',
                        width: '100%',
                        aspectRatio: '4 / 5',
                        background: 'rgba(63,47,35,0.1)',
                        overflow: 'hidden',
                        borderRadius: 'var(--radius-sm)',
                        boxShadow: '0 14px 32px -22px rgba(20,18,15,0.4)',
                        transition: 'transform 320ms cubic-bezier(0.2,0.7,0.3,1), box-shadow 320ms ease',
                    }}
                >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        className="series-card-img"
                        src={image}
                        alt=""
                        style={{
                            position: 'absolute',
                            inset: 0,
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            transition: 'transform 600ms cubic-bezier(0.2,0.7,0.3,1)',
                        }}
                    />
                    <div
                        aria-hidden
                        style={{
                            position: 'absolute',
                            left: 0,
                            right: 0,
                            bottom: 0,
                            height: '60%',
                            background:
                                'linear-gradient(to bottom, rgba(20,18,15,0) 0%, rgba(20,18,15,0.85) 100%)',
                        }}
                    />
                    <span
                        style={{
                            position: 'absolute',
                            top: '12px',
                            left: '12px',
                            padding: '5px 10px',
                            background: 'rgba(20,18,15,0.7)',
                            backdropFilter: 'blur(8px)',
                            color: 'var(--ljos)',
                            fontFamily: 'var(--font-sans)',
                            fontSize: '10px',
                            fontWeight: 700,
                            letterSpacing: '0.18em',
                            textTransform: 'uppercase',
                            borderRadius: '3px',
                        }}
                    >
                        Námskeið
                    </span>
                    {moduleCount > 0 && (
                        <span
                            style={{
                                position: 'absolute',
                                top: '12px',
                                right: '12px',
                                padding: '5px 10px',
                                background: 'rgba(20,18,15,0.7)',
                                backdropFilter: 'blur(8px)',
                                color: 'var(--ljos)',
                                fontFamily: 'var(--font-sans)',
                                fontSize: '10px',
                                fontWeight: 700,
                                letterSpacing: '0.18em',
                                textTransform: 'uppercase',
                                borderRadius: '3px',
                            }}
                        >
                            {moduleCount} {moduleCount === 1 ? 'eining' : 'einingar'}
                        </span>
                    )}
                    <div
                        style={{
                            position: 'absolute',
                            left: '14px',
                            right: '14px',
                            bottom: '14px',
                        }}
                    >
                        <h3
                            style={{
                                margin: 0,
                                fontFamily: 'var(--font-serif)',
                                fontSize: 'clamp(18px, 1.6vw, 22px)',
                                lineHeight: 1.2,
                                fontWeight: 400,
                                color: 'var(--ljos)',
                                letterSpacing: '-0.005em',
                                textWrap: 'balance',
                                textShadow: '0 1px 14px rgba(0,0,0,0.55)',
                            }}
                        >
                            {title}
                        </h3>
                        {instructor && (
                            <div
                                style={{
                                    marginTop: '6px',
                                    fontFamily: 'var(--font-sans)',
                                    fontSize: '10.5px',
                                    fontWeight: 600,
                                    letterSpacing: '0.18em',
                                    textTransform: 'uppercase',
                                    color: 'var(--moskva)',
                                }}
                            >
                                {instructor}
                            </div>
                        )}
                    </div>
                </div>
                {description && (
                    <p
                        style={{
                            margin: 0,
                            fontFamily: 'var(--font-serif)',
                            fontStyle: 'italic',
                            fontSize: '14px',
                            lineHeight: 1.5,
                            color: 'var(--skra-mjuk)',
                            textWrap: 'pretty',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                        }}
                    >
                        {description}
                    </p>
                )}
            </article>
        </Link>
    );
}
