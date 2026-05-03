import { notFound } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { getNewsBySlug } from '@/lib/news-db';

/**
 * /frettir/[slug] — single news item.
 *
 * Layout: dark masthead with title + meta. Cream body with 2-3 paragraph
 * Icelandic translation/summary. Mandatory "Heimild" block at the bottom
 * with the source name + outbound link to the original — always.
 *
 * The source link is also rendered prominently above the body, not just
 * at the bottom, so readers can jump to the original article without
 * scrolling through the whole summary.
 */

export const revalidate = 60;

interface PageProps {
    params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps) {
    const { slug } = await params;
    const item = await getNewsBySlug(slug).catch(() => null);
    if (!item) return { title: 'Frétt | Omega Stöðin' };
    return {
        title: `${item.title} | Fréttir | Omega Stöðin`,
        description: item.summary,
    };
}

function formatDate(iso: string | null): string {
    if (!iso) return '';
    return new Date(iso).toLocaleDateString('is-IS', {
        day: 'numeric', month: 'long', year: 'numeric',
    });
}

export default async function NewsItemPage({ params }: PageProps) {
    const { slug } = await params;
    const item = await getNewsBySlug(slug).catch(() => null);
    if (!item) notFound();

    return (
        <main style={{ minHeight: '100vh', backgroundColor: 'var(--mold)', color: 'var(--ljos)' }}>
            <Navbar />

            {/* Dark masthead */}
            <section
                style={{
                    background: 'var(--nott)',
                    padding: 'clamp(124px, 11vw, 164px) var(--rail-padding) clamp(48px, 6vw, 72px)',
                    borderBottom: '1px solid var(--border)',
                }}
            >
                <div style={{ maxWidth: '50rem', margin: '0 auto' }}>
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
                        <Link href="/frettir" style={{ color: 'inherit', textDecoration: 'none' }}>
                            Fréttir
                        </Link>
                        {item.region && (
                            <>
                                <span style={{ opacity: 0.5, padding: '0 8px' }}>·</span>
                                <span style={{ color: 'var(--moskva)' }}>{item.region}</span>
                            </>
                        )}
                    </div>
                    <h1
                        style={{
                            margin: 0,
                            fontFamily: 'var(--font-serif)',
                            fontSize: 'clamp(32px, 4vw, 56px)',
                            lineHeight: 1.08,
                            fontWeight: 400,
                            color: 'var(--ljos)',
                            letterSpacing: '-0.005em',
                            textWrap: 'balance',
                        }}
                    >
                        {item.title}
                    </h1>
                    <p
                        style={{
                            margin: '20px 0 0',
                            fontFamily: 'var(--font-serif)',
                            fontStyle: 'italic',
                            fontSize: 'clamp(18px, 1.6vw, 22px)',
                            lineHeight: 1.55,
                            color: 'var(--moskva)',
                            maxWidth: '46rem',
                            textWrap: 'pretty',
                        }}
                    >
                        {item.summary}
                    </p>
                    <div aria-hidden style={{ width: '52px', height: '1px', background: 'var(--gull)', margin: '32px 0 18px' }} />
                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'baseline',
                            gap: '14px',
                            flexWrap: 'wrap',
                            fontFamily: 'var(--font-sans)',
                            fontSize: '11.5px',
                            color: 'var(--steinn)',
                            letterSpacing: '0.18em',
                            textTransform: 'uppercase',
                            fontWeight: 600,
                        }}
                    >
                        {item.publishedAt && <span>Birt {formatDate(item.publishedAt)}</span>}
                        {item.publishedAt && <span style={{ opacity: 0.5 }}>·</span>}
                        <span>
                            Heimild:{' '}
                            <a
                                href={item.sourceUrl}
                                target="_blank"
                                rel="noreferrer noopener"
                                style={{ color: 'var(--ljos)', textDecoration: 'underline' }}
                            >
                                {item.sourceName} →
                            </a>
                        </span>
                    </div>
                </div>
            </section>

            {/* Cream body */}
            <section style={{ background: 'var(--skra)', color: 'var(--skra-djup)' }}>
                <div
                    style={{
                        maxWidth: '46rem',
                        margin: '0 auto',
                        padding: 'clamp(56px, 7vw, 88px) var(--rail-padding) clamp(80px, 10vw, 120px)',
                    }}
                >
                    {item.editorNote && (
                        <div
                            style={{
                                padding: 'clamp(20px, 2.5vw, 28px)',
                                background: 'var(--skra-warm)',
                                border: '1px solid rgba(63,47,35,0.12)',
                                borderRadius: 'var(--radius-sm)',
                                marginBottom: 'clamp(36px, 4vw, 56px)',
                            }}
                        >
                            <div
                                style={{
                                    fontFamily: 'var(--font-sans)',
                                    fontSize: '11px',
                                    fontWeight: 700,
                                    letterSpacing: '0.22em',
                                    textTransform: 'uppercase',
                                    color: 'var(--gull)',
                                    marginBottom: '10px',
                                }}
                            >
                                Ritstjórnarlína
                            </div>
                            <p
                                style={{
                                    margin: 0,
                                    fontFamily: 'var(--font-serif)',
                                    fontStyle: 'italic',
                                    fontSize: 'clamp(17px, 1.5vw, 20px)',
                                    lineHeight: 1.55,
                                    color: 'var(--skra-djup)',
                                }}
                            >
                                {item.editorNote}
                            </p>
                        </div>
                    )}

                    {item.body && (
                        <div
                            style={{
                                fontFamily: 'var(--font-serif)',
                                fontSize: 'clamp(17px, 1.55vw, 19px)',
                                lineHeight: 1.7,
                                color: 'var(--skra-djup)',
                            }}
                        >
                            {item.body.split(/\n\n+/).map((paragraph, idx) => (
                                <p key={idx} style={{ margin: idx === 0 ? '0 0 1.4em' : '0 0 1.4em' }}>
                                    {paragraph}
                                </p>
                            ))}
                        </div>
                    )}

                    {/* Source attribution — always rendered, even if body is empty */}
                    <div
                        style={{
                            marginTop: 'clamp(48px, 6vw, 72px)',
                            padding: 'clamp(24px, 3vw, 32px)',
                            background: 'var(--skra-warm)',
                            border: '1px solid rgba(63,47,35,0.14)',
                            borderRadius: 'var(--radius-sm)',
                        }}
                    >
                        <div
                            style={{
                                fontFamily: 'var(--font-sans)',
                                fontSize: '11px',
                                fontWeight: 700,
                                letterSpacing: '0.22em',
                                textTransform: 'uppercase',
                                color: 'var(--gull)',
                                marginBottom: '12px',
                            }}
                        >
                            Heimild
                        </div>
                        <p
                            style={{
                                margin: '0 0 12px 0',
                                fontFamily: 'var(--font-serif)',
                                fontSize: '16px',
                                lineHeight: 1.55,
                                color: 'var(--skra-djup)',
                            }}
                        >
                            Þessi frétt er íslensk samantekt af grein hjá <strong>{item.sourceName}</strong>. Lestu allan textann í upprunalegri grein:
                        </p>
                        <a
                            href={item.sourceUrl}
                            target="_blank"
                            rel="noreferrer noopener"
                            style={{
                                display: 'inline-block',
                                fontFamily: 'var(--font-sans)',
                                fontSize: '13px',
                                fontWeight: 600,
                                letterSpacing: '0.04em',
                                color: 'var(--skra-djup)',
                                textDecoration: 'none',
                                borderBottom: '1px solid var(--gull)',
                                paddingBottom: '2px',
                                wordBreak: 'break-all',
                            }}
                        >
                            {item.sourceUrl} →
                        </a>
                        {item.sourcePublishedAt && (
                            <p style={{ margin: '12px 0 0', fontSize: '12px', color: 'var(--skra-mjuk)' }}>
                                Upprunaleg birting: {formatDate(item.sourcePublishedAt)}
                            </p>
                        )}
                    </div>

                    <Link
                        href="/frettir"
                        style={{
                            display: 'inline-block',
                            marginTop: 'clamp(36px, 4vw, 48px)',
                            fontFamily: 'var(--font-sans)',
                            fontSize: '12px',
                            fontWeight: 700,
                            letterSpacing: '0.16em',
                            textTransform: 'uppercase',
                            color: 'var(--skra-djup)',
                            textDecoration: 'none',
                            borderBottom: '1px solid var(--gull)',
                            paddingBottom: '2px',
                        }}
                    >
                        ← Aftur í Fréttir
                    </Link>
                </div>
            </section>

            <Footer />
        </main>
    );
}
