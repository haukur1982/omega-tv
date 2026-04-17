import Link from 'next/link';
import Image from 'next/image';
import type { FeaturedWeek } from '@/lib/featured-db';

/**
 * Broadcast Hero — "Sending"
 *
 * Homepage hero. Broadcast-anchored, not marketing-anchored.
 * Replaces the Ken Burns + "Í loftinu núna" hero from the old design.
 *
 * Composition (see plan §3.6 and §4.1):
 *   - ONE full-bleed still image, held. No Ken Burns, no parallax.
 *   - Warm-black gradient stack: strong to the left/bottom, fading to
 *     reveal the landscape on the right.
 *   - Torfa panel, bottom-left, max-width ~460px, containing a single
 *     kicker + Vaka headline + body paragraph + two CTAs.
 *   - Data from featured_weeks; if missing, hardcoded fallback so the
 *     page always renders.
 */

const DEFAULT_FEATURED: FeaturedWeek = {
    id: 'default',
    week_start_date: '',
    hero_image_url:
        'https://images.unsplash.com/photo-1504829857797-ddff29c27927?q=80&w=2600&auto=format&fit=crop',
    hero_image_alt: 'Íslenskt landslag í vetrarbirtu',
    kicker: 'Omega · Kristin fjölmiðlastöð síðan 1992',
    headline: 'Von og sannleikur fyrir Ísland.',
    body:
        'Omega er útvarpsstöð á íslensku — beint, þáttasafn, greinar og námskeið sem miða að því að kynna fólk fyrir Jesú Kristi.',
    primary_cta_label: 'Horfa beint',
    primary_cta_href: '/live',
    secondary_cta_label: 'Skoða safnið',
    secondary_cta_href: '/sermons',
    sermon_id_pick: null,
    article_id_pick: null,
    prayer_id_pick: null,
    featured_passage_ref: null,
    featured_series_id: null,
    is_fallback: true,
    published_at: null,
};

export default function Hero({ feature }: { feature?: FeaturedWeek | null }) {
    const f = feature ?? DEFAULT_FEATURED;

    return (
        <section
            aria-label="Sýning vikunnar"
            style={{
                position: 'relative',
                width: '100%',
                /* Tall enough to be cinematic, capped so it doesn't dominate
                 * very tall monitors. Subtract navbar height visually. */
                minHeight: 'min(86vh, 820px)',
                display: 'flex',
                alignItems: 'flex-end',
                overflow: 'hidden',
                backgroundColor: 'var(--nott)',
            }}
        >
            {/* Background — ONE still image, held. */}
            <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
                <Image
                    src={f.hero_image_url}
                    alt={f.hero_image_alt ?? ''}
                    fill
                    priority
                    sizes="100vw"
                    style={{ objectFit: 'cover' }}
                />
                {/* Gradient stack — warm-black, bottom-heavy + left-heavy */}
                <div
                    aria-hidden="true"
                    style={{
                        position: 'absolute',
                        inset: 0,
                        background:
                            'linear-gradient(to top, var(--nott) 0%, rgba(20,18,15,0.85) 30%, rgba(20,18,15,0.35) 60%, rgba(20,18,15,0.05) 85%, transparent 100%)',
                    }}
                />
                <div
                    aria-hidden="true"
                    style={{
                        position: 'absolute',
                        inset: 0,
                        background:
                            'linear-gradient(to right, rgba(20,18,15,0.85) 0%, rgba(20,18,15,0.35) 40%, rgba(20,18,15,0.05) 70%, transparent 100%)',
                    }}
                />
                {/* Top vignette — navbar readability */}
                <div
                    aria-hidden="true"
                    style={{
                        position: 'absolute',
                        top: 0, left: 0, right: 0,
                        height: '180px',
                        background:
                            'linear-gradient(to bottom, rgba(20,18,15,0.55) 0%, transparent 100%)',
                    }}
                />
            </div>

            {/* Content row — panel sits naturally at bottom-left via flex-end */}
            <div
                style={{
                    position: 'relative',
                    zIndex: 10,
                    width: '100%',
                    maxWidth: '80rem',
                    margin: '0 auto',
                    padding: '0 var(--rail-padding)',
                    paddingBottom: 'clamp(3.5rem, 9vh, 6.5rem)',
                }}
            >
                <div
                    className="ink-arrive"
                    style={{
                        maxWidth: '460px',
                        padding: 'clamp(26px, 2.6vw, 36px) clamp(26px, 2.6vw, 36px) clamp(28px, 2.8vw, 38px)',
                        background: 'rgba(27, 24, 20, 0.72)',
                        backdropFilter: 'blur(18px) saturate(1.15)',
                        WebkitBackdropFilter: 'blur(18px) saturate(1.15)',
                        border: '1px solid rgba(246, 242, 234, 0.06)',
                        borderRadius: '2px',
                        boxShadow: 'var(--shadow-lift)',
                    }}
                >
                    {/* Kicker — small caps, warm amber */}
                    <p
                        className="type-merki"
                        style={{
                            color: 'var(--kerti)',
                            margin: 0,
                            marginBottom: 'clamp(16px, 2vw, 22px)',
                            letterSpacing: '0.22em',
                            fontSize: '0.68rem',
                        }}
                    >
                        {f.kicker}
                    </p>

                    {/* Headline — Vaka display serif.
                        Scale tuned so a ~30-char Icelandic headline wraps
                        cleanly in two lines on desktop. */}
                    <h1
                        style={{
                            fontFamily: 'var(--font-display, var(--font-serif))',
                            fontWeight: 300,
                            color: 'var(--ljos)',
                            margin: 0,
                            marginBottom: 'clamp(18px, 2.2vw, 26px)',
                            fontSize: 'clamp(2.25rem, 4.6vw, 3.75rem)',
                            lineHeight: 1.02,
                            letterSpacing: '-0.028em',
                        }}
                    >
                        {f.headline}
                    </h1>

                    {/* Body — Lestur serif at a slightly smaller size here. */}
                    <p
                        style={{
                            fontFamily: 'var(--font-serif)',
                            color: 'var(--moskva)',
                            margin: 0,
                            marginBottom: 'clamp(22px, 2.6vw, 30px)',
                            fontSize: 'clamp(0.98rem, 1.1vw, 1.075rem)',
                            lineHeight: 1.65,
                        }}
                    >
                        {f.body}
                    </p>

                    {/* Actions */}
                    <div
                        style={{
                            display: 'flex',
                            flexWrap: 'wrap',
                            alignItems: 'center',
                            gap: '10px',
                        }}
                    >
                        <Link
                            href={f.primary_cta_href}
                            className="warm-hover"
                            style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '10px',
                                padding: '13px 24px',
                                borderRadius: '2px',
                                background: 'var(--kerti)',
                                color: 'var(--nott)',
                                fontFamily: 'var(--font-sans)',
                                fontSize: '14px',
                                fontWeight: 600,
                                letterSpacing: '0.01em',
                                textDecoration: 'none',
                                border: '1px solid var(--kerti)',
                            }}
                        >
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="var(--nott)" aria-hidden="true">
                                <polygon points="6,3 20,12 6,21" />
                            </svg>
                            {f.primary_cta_label}
                        </Link>

                        {f.secondary_cta_label && f.secondary_cta_href ? (
                            <Link
                                href={f.secondary_cta_href}
                                className="ghost-btn"
                                style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '10px',
                                    padding: '13px 20px',
                                    borderRadius: '2px',
                                    background: 'transparent',
                                    color: 'var(--ljos)',
                                    borderWidth: '1px',
                                    borderStyle: 'solid',
                                    fontFamily: 'var(--font-sans)',
                                    fontSize: '14px',
                                    fontWeight: 500,
                                    letterSpacing: '0.01em',
                                    textDecoration: 'none',
                                }}
                            >
                                {f.secondary_cta_label}
                            </Link>
                        ) : null}
                    </div>
                </div>
            </div>
        </section>
    );
}
