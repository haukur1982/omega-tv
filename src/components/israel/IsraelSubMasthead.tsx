import Link from 'next/link';

/**
 * IsraelSubMasthead — shared masthead for the /israel sub-pages.
 *
 * Same photographic language as the section landing (graded image
 * melting in from the right, heavy left+bottom fades, typography in
 * charge) so the three pages read as one family. Each page passes its
 * own crop so they are siblings, not clones.
 */

interface Props {
    crumb: string;            // e.g. "Heimildarmyndir"
    title: string;            // e.g. "Þættir um Ísrael."
    lede: string;             // italic one-liner under the title
    image: string;            // /images/israel/...jpg
    /** small factual line under the lede, e.g. "1 þáttur í safninu" */
    metaLine?: string;
}

export default function IsraelSubMasthead({ crumb, title, lede, image, metaLine }: Props) {
    return (
        <section
            className="article-cover"
            style={{
                position: 'relative',
                background: 'var(--nott)',
                overflow: 'hidden',
                padding:
                    'clamp(124px, 11vw, 164px) var(--rail-padding) clamp(56px, 7vw, 84px)',
                borderBottom: '1px solid var(--border)',
            }}
        >
            <div
                className="israel-masthead-photo"
                aria-hidden
                style={{
                    position: 'absolute',
                    top: 0,
                    right: 0,
                    bottom: 0,
                    width: '42%',
                    backgroundImage: `url(${image})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center top',
                    opacity: 0.5,
                    maskImage:
                        'linear-gradient(to left, rgba(0,0,0,1) 25%, rgba(0,0,0,0) 92%)',
                    WebkitMaskImage:
                        'linear-gradient(to left, rgba(0,0,0,1) 25%, rgba(0,0,0,0) 92%)',
                    pointerEvents: 'none',
                }}
            />
            <div
                aria-hidden
                style={{
                    position: 'absolute',
                    inset: 0,
                    background:
                        'linear-gradient(to bottom, rgba(20,18,15,0.25) 0%, transparent 30%, transparent 55%, rgba(20,18,15,0.9) 92%, var(--nott) 100%)',
                    pointerEvents: 'none',
                }}
            />
            <style>{`@media (max-width: 860px) { .israel-masthead-photo { width: 100%; opacity: 0.28; } }`}</style>

            <div
                className="article-cover-shell"
                style={{ position: 'relative', maxWidth: '80rem', margin: '0 auto' }}
            >
                <div className="article-cover-copy">
                    <div
                        style={{
                            fontFamily: 'var(--font-sans)',
                            fontSize: '11px',
                            fontWeight: 700,
                            letterSpacing: '0.22em',
                            textTransform: 'uppercase',
                            color: 'var(--nordurljos)',
                            marginBottom: '20px',
                        }}
                    >
                        <Link href="/israel" style={{ color: 'inherit', textDecoration: 'none' }}>
                            Ísrael
                        </Link>
                        <span style={{ opacity: 0.5, padding: '0 8px' }}>·</span>
                        <span style={{ color: 'var(--moskva)' }}>{crumb}</span>
                    </div>
                    <h1
                        style={{
                            margin: 0,
                            fontFamily: 'var(--font-serif)',
                            fontSize: 'clamp(40px, 5vw, 70px)',
                            lineHeight: 1.04,
                            fontWeight: 400,
                            color: 'var(--ljos)',
                            letterSpacing: '-0.005em',
                            maxWidth: '15ch',
                            textWrap: 'balance',
                        }}
                    >
                        {title}
                    </h1>
                    <p
                        style={{
                            margin: '24px 0 0',
                            fontFamily: 'var(--font-serif)',
                            fontStyle: 'italic',
                            fontSize: 'clamp(18px, 1.6vw, 22px)',
                            color: 'var(--moskva)',
                            maxWidth: '34rem',
                            lineHeight: 1.55,
                            textWrap: 'pretty',
                        }}
                    >
                        {lede}
                    </p>
                    {metaLine && (
                        <div
                            style={{
                                marginTop: '28px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px',
                            }}
                        >
                            <span aria-hidden style={{ width: '34px', height: '1px', background: 'var(--gull)' }} />
                            <span
                                style={{
                                    fontFamily: 'var(--font-sans)',
                                    fontSize: '11px',
                                    fontWeight: 700,
                                    letterSpacing: '0.2em',
                                    textTransform: 'uppercase',
                                    color: 'var(--steinn)',
                                }}
                            >
                                {metaLine}
                            </span>
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
}
