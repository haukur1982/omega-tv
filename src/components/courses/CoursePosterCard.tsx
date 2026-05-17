import Link from "next/link";
import ThumbnailFrame from "@/components/media/ThumbnailFrame";

/**
 * CoursePosterCard — poster-style card for the /namskeid index,
 * matching the cathedral aesthetic used on /sermons SeriesCard.
 *
 * 4:5 portrait using the shared <ThumbnailFrame> (cinematic grading +
 * vignette + glow + branded typographic fallback). Title/kicker/meta
 * sit BELOW the art as page text (Apple TV+ pattern), not overlaid.
 * Sits on the cream body register. The detailed LeidCard with module
 * ladder lives on course detail pages — the index uses the lighter
 * discovery card so /namskeid reads as a library, not a dashboard.
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
    const count = moduleCount > 0
        ? `${moduleCount} ${moduleCount === 1 ? 'eining' : 'einingar'}`
        : null;
    const meta = [instructor || null, count].filter(Boolean).join('  ·  ');

    return (
        <Link
            href={href}
            className="series-card-link"
            style={{ display: 'block', color: 'var(--skra-djup)', textDecoration: 'none' }}
        >
            <article style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <ThumbnailFrame
                    src={image || null}
                    series={title}
                    aspect="4/5"
                />
                <div>
                    <div
                        className="type-merki"
                        style={{ color: 'var(--skra-mjuk)', marginBottom: '6px' }}
                    >
                        Námskeið
                    </div>
                    <h3
                        style={{
                            margin: 0,
                            fontFamily: 'var(--font-serif)',
                            fontSize: 'clamp(18px, 1.5vw, 22px)',
                            lineHeight: 1.2,
                            fontWeight: 400,
                            color: 'var(--skra-djup)',
                            letterSpacing: '-0.005em',
                        }}
                    >
                        {title}
                    </h3>
                    {meta && (
                        <div
                            className="type-meta"
                            style={{ color: 'var(--skra-mjuk)', marginTop: '6px' }}
                        >
                            {meta}
                        </div>
                    )}
                    {description && (
                        <p
                            style={{
                                margin: '10px 0 0',
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
                </div>
            </article>
        </Link>
    );
}
