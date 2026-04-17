import Link from 'next/link';
import Image from 'next/image';
import { displayPassageIs } from '@/lib/passages';
import type { BiblePassage } from '@/lib/passages';
import type { ThreadArticle, ThreadPrayer } from '@/lib/threads-db';

/**
 * ThreadsSidebar — the "threads of Scripture" panel that lives beside
 * the sermon on the detail page. Four stacked cells (see plan §4.2):
 *
 *   1. Ritningin — full passage text from bible_passages (anchored #ritningin)
 *   2. Bænin vikunnar — one Blik prayer card tied to the same bible_ref
 *   3. Lestur sem dýpkar þetta — one Síða article card with the passage
 *   4. Næsta útsending — a quiet schedule teaser (phase 3 wires real data)
 *
 * Every panel renders gracefully when its data is missing — instead of
 * hiding, it shows an honest "no content yet" note that feels intentional
 * rather than broken.
 */

interface ThreadsSidebarProps {
    bibleRef: string | null | undefined;
    passage: BiblePassage | null;
    prayer: ThreadPrayer | null;
    article: ThreadArticle | null;
}

export default function ThreadsSidebar({
    bibleRef,
    passage,
    prayer,
    article,
}: ThreadsSidebarProps) {
    const passageDisplay = displayPassageIs(bibleRef);
    const hasAnchor = Boolean(bibleRef);

    return (
        <aside
            aria-label="Þræðir ritningarinnar"
            style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '20px',
            }}
        >
            {/* ── 1. Ritningin — full passage ─────────────────────────── */}
            <section
                id="ritningin"
                style={{
                    padding: '22px 22px 26px',
                    background: 'var(--torfa)',
                    border: '1px solid var(--border)',
                    borderRadius: '4px',
                }}
            >
                <p className="type-merki" style={{ color: 'var(--moskva)', margin: 0, marginBottom: '10px', letterSpacing: '0.2em' }}>
                    Ritningin
                </p>
                {hasAnchor ? (
                    <>
                        <h3
                            style={{
                                margin: 0,
                                marginBottom: '14px',
                                fontFamily: 'var(--font-display, var(--font-serif))',
                                fontWeight: 400,
                                color: 'var(--ljos)',
                                fontSize: '1.5rem',
                                lineHeight: 1.1,
                                letterSpacing: '-0.02em',
                            }}
                        >
                            {passage?.ref_display_is ?? passageDisplay}
                        </h3>
                        {passage?.text_is ? (
                            <p
                                className="type-tilvisun"
                                style={{
                                    margin: 0,
                                    color: 'var(--moskva)',
                                    fontSize: '0.98rem',
                                    lineHeight: 1.7,
                                    fontStyle: 'italic',
                                }}
                            >
                                {passage.text_is}
                            </p>
                        ) : (
                            <p className="type-ritskrift" style={{ margin: 0, color: 'var(--steinn)' }}>
                                Ritningartextinn er ekki enn í safninu — við erum að vinna í því.
                            </p>
                        )}
                    </>
                ) : (
                    <p className="type-ritskrift" style={{ margin: 0, color: 'var(--steinn)' }}>
                        Engin ritningartilvísun hefur enn verið tengd við þennan þátt.
                    </p>
                )}
            </section>

            {/* ── 2. Bænin — prayer tied to this passage ─────────────── */}
            <section
                style={{
                    padding: '22px 22px 24px',
                    background: 'var(--torfa)',
                    border: '1px solid var(--border)',
                    borderRadius: '4px',
                }}
            >
                <p className="type-merki" style={{ color: 'var(--moskva)', margin: 0, marginBottom: '10px', letterSpacing: '0.2em' }}>
                    Bæn tengd textanum
                </p>
                {prayer ? (
                    <>
                        {/* Candle glyph — flickers via CSS breathe, respects reduced-motion */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                            <span
                                aria-hidden="true"
                                className="candle-breathe"
                                style={{
                                    display: 'inline-block',
                                    width: '8px',
                                    height: '8px',
                                    borderRadius: '50%',
                                    background: 'var(--kerti)',
                                    boxShadow: '0 0 10px var(--kerti)',
                                }}
                            />
                            <span className="type-meta" style={{ color: 'var(--moskva)' }}>
                                {prayer.name ?? 'Nafnlaus'}
                            </span>
                        </div>
                        <p
                            style={{
                                margin: 0,
                                fontFamily: 'var(--font-serif)',
                                color: 'var(--ljos)',
                                fontSize: '0.98rem',
                                lineHeight: 1.6,
                                display: '-webkit-box',
                                WebkitLineClamp: 6,
                                WebkitBoxOrient: 'vertical',
                                overflow: 'hidden',
                            }}
                        >
                            {prayer.content}
                        </p>
                        <Link
                            href="/baenatorg"
                            className="type-merki muted-link"
                            style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '6px',
                                marginTop: '14px',
                                textDecoration: 'none',
                                letterSpacing: '0.18em',
                                fontSize: '0.66rem',
                            }}
                        >
                            Biðja með <span aria-hidden="true">→</span>
                        </Link>
                    </>
                ) : (
                    <>
                        <p className="type-ritskrift" style={{ margin: 0, color: 'var(--steinn)' }}>
                            Engin bæn enn tengd þessum texta.
                        </p>
                        <Link
                            href="/baenatorg"
                            className="type-merki muted-link"
                            style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '6px',
                                marginTop: '12px',
                                textDecoration: 'none',
                                letterSpacing: '0.18em',
                                fontSize: '0.66rem',
                            }}
                        >
                            Skrifa bæn <span aria-hidden="true">→</span>
                        </Link>
                    </>
                )}
            </section>

            {/* ── 3. Lestur — article on the same passage ─────────────── */}
            <section
                style={{
                    padding: '0',
                    overflow: 'hidden',
                    background: 'var(--skra)',
                    border: '1px solid var(--border)',
                    borderRadius: '4px',
                }}
            >
                <div style={{ padding: '22px 22px 0' }}>
                    <p
                        className="type-merki"
                        style={{
                            color: 'var(--skra-mjuk)',
                            margin: 0,
                            marginBottom: '8px',
                            letterSpacing: '0.2em',
                        }}
                    >
                        Lestur sem dýpkar þetta
                    </p>
                </div>
                {article ? (
                    <Link
                        href={`/greinar/${article.slug}`}
                        style={{
                            display: 'block',
                            textDecoration: 'none',
                            color: 'inherit',
                            padding: '4px 22px 22px',
                        }}
                    >
                        {article.featured_image ? (
                            <div style={{ position: 'relative', width: '100%', aspectRatio: '3 / 2', marginBottom: '14px', overflow: 'hidden', borderRadius: '2px' }}>
                                <Image
                                    src={article.featured_image}
                                    alt=""
                                    fill
                                    sizes="(max-width: 640px) 100vw, 360px"
                                    style={{ objectFit: 'cover' }}
                                />
                            </div>
                        ) : null}
                        <h3
                            style={{
                                margin: 0,
                                marginBottom: '8px',
                                fontFamily: 'var(--font-serif)',
                                fontWeight: 700,
                                color: 'var(--skra-djup)',
                                fontSize: '1.2rem',
                                lineHeight: 1.25,
                                letterSpacing: '-0.01em',
                            }}
                        >
                            {article.title}
                        </h3>
                        {article.excerpt && (
                            <p
                                style={{
                                    margin: 0,
                                    fontFamily: 'var(--font-serif)',
                                    fontStyle: 'italic',
                                    color: '#37342F',
                                    fontSize: '0.92rem',
                                    lineHeight: 1.5,
                                    display: '-webkit-box',
                                    WebkitLineClamp: 3,
                                    WebkitBoxOrient: 'vertical',
                                    overflow: 'hidden',
                                }}
                            >
                                {article.excerpt}
                            </p>
                        )}
                        <p
                            className="type-merki"
                            style={{
                                margin: '14px 0 0',
                                color: 'var(--skra-mjuk)',
                                letterSpacing: '0.2em',
                                fontSize: '0.62rem',
                            }}
                        >
                            {article.reading_minutes
                                ? `Lestur · ${article.reading_minutes} mín`
                                : 'Grein'}
                        </p>
                    </Link>
                ) : (
                    <div style={{ padding: '4px 22px 24px' }}>
                        <p
                            style={{
                                margin: 0,
                                fontFamily: 'var(--font-serif)',
                                fontStyle: 'italic',
                                color: 'var(--skra-mjuk)',
                                fontSize: '0.92rem',
                                lineHeight: 1.55,
                            }}
                        >
                            Engin grein enn tengd þessum texta.
                        </p>
                    </div>
                )}
            </section>

            {/* ── 4. Næsta útsending — quiet teaser (phase 3 wires data) ── */}
            <section
                style={{
                    padding: '22px 22px 24px',
                    background: 'var(--torfa)',
                    border: '1px solid var(--border)',
                    borderRadius: '4px',
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                    <span
                        aria-hidden="true"
                        style={{
                            width: '6px',
                            height: '6px',
                            borderRadius: '50%',
                            background: 'var(--kerti)',
                        }}
                    />
                    <p className="type-merki" style={{ color: 'var(--moskva)', margin: 0, letterSpacing: '0.2em' }}>
                        Næsta útsending
                    </p>
                </div>
                <p
                    style={{
                        margin: 0,
                        fontFamily: 'var(--font-serif)',
                        color: 'var(--ljos)',
                        fontSize: '1.1rem',
                        lineHeight: 1.3,
                    }}
                >
                    Bænakvöld
                </p>
                <p className="type-meta" style={{ margin: '4px 0 14px', color: 'var(--moskva)' }}>
                    Miðvikudag · kl. 20:00
                </p>
                <Link
                    href="/live"
                    className="type-merki muted-link"
                    style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        textDecoration: 'none',
                        letterSpacing: '0.18em',
                        fontSize: '0.66rem',
                    }}
                >
                    Sjá dagskrá <span aria-hidden="true">→</span>
                </Link>
            </section>
        </aside>
    );
}
