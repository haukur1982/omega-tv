import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { getEpisodesBySeriesSlug } from '@/lib/vod-db';
import { findMockSeriesBySlug, getMockEpisodesForMockSeries } from '@/lib/mock-series';

/**
 * /sermons/show/[slug] — single-series page with the full episode
 * catalog for one show.
 *
 * Composition mirrors /israel/heimildarmyndir:
 *   - Dark editorial cover (kicker + title + italic excerpt + meta line)
 *   - Cream body with poster-style 4:5 episode cards
 *
 * URL nesting: /sermons/show/<slug> rather than /sermons/<slug> so it
 * doesn't collide with the existing /sermons/[id] episode-detail route.
 */

export const revalidate = 60;

interface PageProps {
    params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { slug } = await params;
    const result = await getEpisodesBySeriesSlug(slug).catch(() => null);
    if (!result) return { title: 'Þáttaröð | Omega Stöðin' };
    return {
        title: `${result.series.title} | Omega Stöðin`,
        description: result.series.description ?? undefined,
    };
}

export default async function SeriesPage({ params }: PageProps) {
    const { slug } = await params;
    const result = await getEpisodesBySeriesSlug(slug).catch(() => null);

    // Real series → render normally.
    // No real series → fall back to a mock catalog so clicking a mock
    // card from /sermons doesn't dead-end. The banner makes the preview
    // status explicit.
    let series: { title: string; description: string | null; host: string | null; slug: string };
    let episodes: EpisodeRow[];
    let isMockPreview = false;

    if (result) {
        series = {
            title: result.series.title,
            description: result.series.description,
            host: result.series.host,
            slug: result.series.slug,
        };
        episodes = result.episodes as EpisodeRow[];
    } else {
        const mockSeries = findMockSeriesBySlug(slug);
        if (!mockSeries) notFound();
        series = {
            title: mockSeries.title,
            description: mockSeries.description,
            host: mockSeries.host,
            slug: mockSeries.slug,
        };
        episodes = getMockEpisodesForMockSeries(mockSeries);
        isMockPreview = true;
    }

    return (
        <main style={{ minHeight: '100vh', backgroundColor: 'var(--mold)', color: 'var(--ljos)' }}>
            <Navbar />

            {/* Dark masthead */}
            <section
                className="article-cover"
                style={{
                    position: 'relative',
                    background: 'var(--nott)',
                    overflow: 'hidden',
                    padding: 'clamp(124px, 11vw, 164px) var(--rail-padding) clamp(48px, 6vw, 72px)',
                    borderBottom: '1px solid var(--border)',
                }}
            >
                <div className="article-cover-shell" style={{ maxWidth: '80rem', margin: '0 auto' }}>
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
                            <Link href="/sermons" style={{ color: 'inherit', textDecoration: 'none' }}>
                                Þáttasafn
                            </Link>
                            <span style={{ opacity: 0.5, padding: '0 8px' }}>·</span>
                            <span style={{ color: 'var(--moskva)' }}>Þáttaröð</span>
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
                            }}
                        >
                            {series.title}
                        </h1>
                        {series.description && (
                            <p
                                style={{
                                    margin: '24px 0 0',
                                    fontFamily: 'var(--font-serif)',
                                    fontStyle: 'italic',
                                    fontSize: 'clamp(18px, 1.6vw, 22px)',
                                    color: 'var(--moskva)',
                                    maxWidth: '36rem',
                                    lineHeight: 1.55,
                                }}
                            >
                                {series.description}
                            </p>
                        )}
                        <div
                            aria-hidden
                            style={{
                                width: '52px',
                                height: '1px',
                                background: 'var(--gull)',
                                margin: '32px 0 18px',
                            }}
                        />
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
                            {series.host && (
                                <span
                                    style={{
                                        fontFamily: 'var(--font-serif)',
                                        fontStyle: 'italic',
                                        fontSize: '17px',
                                        color: 'var(--ljos)',
                                        letterSpacing: 0,
                                        textTransform: 'none',
                                        fontWeight: 400,
                                    }}
                                >
                                    {series.host}
                                </span>
                            )}
                            {series.host && episodes.length > 0 && <span style={{ opacity: 0.5 }}>·</span>}
                            {episodes.length > 0 && (
                                <span>
                                    {episodes.length} {episodes.length === 1 ? 'þáttur' : 'þættir'}
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            </section>

            {/* Cream body — episode list */}
            <section
                style={{
                    background: 'var(--skra)',
                    color: 'var(--skra-djup)',
                }}
            >
                <div
                    style={{
                        maxWidth: '80rem',
                        margin: '0 auto',
                        padding: 'clamp(56px, 7vw, 88px) var(--rail-padding) clamp(96px, 12vw, 144px)',
                    }}
                >
                    {isMockPreview && (
                        <div
                            style={{
                                marginBottom: 'clamp(36px, 4vw, 56px)',
                                padding: '16px 20px',
                                background: 'rgba(233,168,96,0.12)',
                                border: '1px solid rgba(200,138,62,0.32)',
                                borderRadius: 'var(--radius-sm)',
                                color: 'var(--skra-djup)',
                                fontFamily: 'var(--font-serif)',
                                fontStyle: 'italic',
                                fontSize: '15.5px',
                                lineHeight: 1.55,
                                maxWidth: '46rem',
                            }}
                        >
                            <strong style={{ fontStyle: 'normal', fontWeight: 600 }}>Sýnishorn</strong>
                            {' — '}
                            engir raunverulegir þættir í þessari þáttaröð enn. Sýningin er staðgengill þangað til efnið kemur úr þýðingarstöðinni.
                        </div>
                    )}
                    {episodes.length > 0 ? (
                        <ul
                            style={{
                                listStyle: 'none',
                                padding: 0,
                                margin: 0,
                                display: 'grid',
                                gap: 'clamp(24px, 3vw, 36px)',
                                gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
                            }}
                        >
                            {episodes.map((ep) => (
                                <EpisodeCard
                                    key={ep.id}
                                    ep={ep}
                                    seriesTitle={series.title}
                                    clickable={!isMockPreview}
                                />
                            ))}
                        </ul>
                    ) : (
                        <div
                            style={{
                                padding: 'clamp(56px, 7vw, 80px) clamp(28px, 4vw, 48px)',
                                border: '1px dashed rgba(63,47,35,0.2)',
                                borderRadius: 'var(--radius-md)',
                                background: 'rgba(212,194,162,0.18)',
                                textAlign: 'center',
                                maxWidth: '46rem',
                                margin: '0 auto',
                            }}
                        >
                            <p
                                style={{
                                    margin: 0,
                                    fontFamily: 'var(--font-serif)',
                                    fontStyle: 'italic',
                                    fontSize: 'clamp(18px, 1.7vw, 22px)',
                                    lineHeight: 1.55,
                                    color: 'var(--skra-djup)',
                                }}
                            >
                                Þættir í þessari þáttaröð birtast hér jafnóðum.
                            </p>
                            <Link
                                href="/sermons"
                                style={{
                                    display: 'inline-block',
                                    marginTop: '28px',
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
                                ← Aftur í Þáttasafn
                            </Link>
                        </div>
                    )}
                </div>
            </section>

            <Footer />
        </main>
    );
}

interface EpisodeRow {
    id: string;
    title: string;
    description: string | null;
    duration: number | null;
    published_at: string | null;
    thumbnail_custom: string | null;
    bunny_video_id: string;
}

function EpisodeCard({ ep, seriesTitle, clickable = true }: { ep: EpisodeRow; seriesTitle: string; clickable?: boolean }) {
    const date = ep.published_at
        ? new Date(ep.published_at).toLocaleDateString('is-IS', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
        })
        : '';
    const dur = ep.duration ? formatDuration(ep.duration) : null;
    const thumb = ep.thumbnail_custom
        ?? (ep.bunny_video_id !== 'mock'
            ? `https://vz-dd90f302-e7e.b-cdn.net/${ep.bunny_video_id}/thumbnail.jpg`
            : undefined);

    // /sermons/[id] route accepts a Bunny GUID — see route.ts and the
    // canonical pipeline doc. Use bunny_video_id for the href, fall
    // back to internal id only as a defensive measure.
    const href = `/sermons/${ep.bunny_video_id || ep.id}`;
    const Wrapper = clickable
        ? (props: React.PropsWithChildren) => (
            <Link href={href} style={{ display: 'block', color: 'var(--skra-djup)', textDecoration: 'none' }}>
                {props.children}
            </Link>
        )
        : (props: React.PropsWithChildren) => (
            <div style={{ display: 'block', color: 'var(--skra-djup)', cursor: 'default', opacity: 0.85 }}>
                {props.children}
            </div>
        );

    return (
        <li>
            <Wrapper>
                <article style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    <div
                        style={{
                            position: 'relative',
                            width: '100%',
                            aspectRatio: '16 / 9',
                            background: 'rgba(63,47,35,0.1)',
                            overflow: 'hidden',
                            borderRadius: 'var(--radius-sm)',
                        }}
                    >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src={thumb}
                            alt=""
                            style={{
                                position: 'absolute',
                                inset: 0,
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover',
                            }}
                        />
                        {dur && (
                            <span
                                style={{
                                    position: 'absolute',
                                    right: '10px',
                                    bottom: '10px',
                                    padding: '4px 9px',
                                    background: 'rgba(20,18,15,0.78)',
                                    color: 'var(--ljos)',
                                    fontFamily: 'var(--font-sans)',
                                    fontSize: '11px',
                                    fontWeight: 700,
                                    letterSpacing: '0.04em',
                                    borderRadius: '3px',
                                }}
                            >
                                {dur}
                            </span>
                        )}
                    </div>
                    <div
                        style={{
                            fontFamily: 'var(--font-sans)',
                            fontSize: '11px',
                            fontWeight: 700,
                            letterSpacing: '0.18em',
                            textTransform: 'uppercase',
                            color: 'var(--skra-mjuk)',
                        }}
                    >
                        {seriesTitle}
                    </div>
                    <h3
                        style={{
                            margin: 0,
                            fontFamily: 'var(--font-serif)',
                            fontSize: 'clamp(18px, 1.5vw, 21px)',
                            lineHeight: 1.25,
                            fontWeight: 400,
                            color: 'var(--skra-djup)',
                            letterSpacing: '-0.005em',
                            textWrap: 'balance',
                        }}
                    >
                        {ep.title}
                    </h3>
                    {date && (
                        <div
                            style={{
                                fontFamily: 'var(--font-serif)',
                                fontStyle: 'italic',
                                fontSize: '13.5px',
                                color: 'var(--skra-mjuk)',
                            }}
                        >
                            {date}
                        </div>
                    )}
                </article>
            </Wrapper>
        </li>
    );
}

function formatDuration(seconds: number): string {
    if (!seconds || seconds <= 0) return '';
    const mins = Math.round(seconds / 60);
    if (mins < 60) return `${mins} mín`;
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return m > 0 ? `${h} klst ${m} mín` : `${h} klst`;
}
