import { Metadata } from 'next';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { getIsraelEpisodes, type IsraelEpisode } from '@/lib/vod-db';

/**
 * /israel/heimildarmyndir — full archive of Israel-themed episodes.
 *
 * Same data source as the IsraelDocumentaries rail on /israel landing,
 * but the full list (up to 60). Cream reading-frame register matches
 * Bænatorg and the article detail body.
 */

export const metadata: Metadata = {
    title: 'Heimildarmyndir um Ísrael | Omega Stöðin',
    description:
        'Þættir um Ísrael — fréttir, fræðsla og útsendingar — þýtt og sett upp til íslensks áhorfs.',
};

export const revalidate = 60;

export default async function IsraelDocumentariesPage() {
    const episodes = await getIsraelEpisodes(60).catch(() => []);

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
                            <Link href="/israel" style={{ color: 'inherit', textDecoration: 'none' }}>
                                Ísrael
                            </Link>
                            <span style={{ opacity: 0.5, padding: '0 8px' }}>·</span>
                            <span style={{ color: 'var(--moskva)' }}>Heimildarmyndir</span>
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
                            Þættir um Ísrael.
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
                            }}
                        >
                            Fréttir, fræðsla og útsendingar — þýtt og sett upp til íslensks áhorfs.
                        </p>
                    </div>
                </div>
            </section>

            {/* Cream body */}
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
                    {episodes.length > 0 ? (
                        <ul
                            style={{
                                listStyle: 'none',
                                padding: 0,
                                margin: 0,
                                display: 'grid',
                                gap: 'clamp(28px, 3vw, 40px)',
                                gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                            }}
                        >
                            {episodes.map((ep) => (
                                <EpisodeCard key={ep.id} ep={ep} />
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
                                Þættir um Ísrael birtast hér þegar þeir koma úr þýðingarstöðinni.
                            </p>
                            <Link
                                href="/israel"
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
                                ← Aftur í Ísrael
                            </Link>
                        </div>
                    )}
                </div>
            </section>

            <Footer />
        </main>
    );
}

function EpisodeCard({ ep }: { ep: IsraelEpisode }) {
    const date = ep.published_at
        ? new Date(ep.published_at).toLocaleDateString('is-IS', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
        })
        : '';
    const dur = ep.duration ? formatDuration(ep.duration) : null;
    const thumb = ep.thumbnail_custom
        ?? `https://vz-dd90f302-e7e.b-cdn.net/${ep.bunny_video_id}/thumbnail.jpg`;

    return (
        <li>
            <Link
                href={`/sermons/${ep.id}`}
                style={{ display: 'block', color: 'var(--skra-djup)', textDecoration: 'none' }}
            >
                <article style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    <div
                        style={{
                            position: 'relative',
                            width: '100%',
                            aspectRatio: '4 / 5',
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
                        <div
                            aria-hidden
                            style={{
                                position: 'absolute',
                                left: 0,
                                right: 0,
                                bottom: 0,
                                height: '55%',
                                background:
                                    'linear-gradient(to bottom, rgba(20,18,15,0) 0%, rgba(20,18,15,0.82) 100%)',
                            }}
                        />
                        <span
                            style={{
                                position: 'absolute',
                                top: '12px',
                                left: '12px',
                                padding: '5px 10px',
                                background: 'rgba(20,18,15,0.7)',
                                backdropFilter: 'blur(6px)',
                                color: 'var(--ljos)',
                                fontFamily: 'var(--font-sans)',
                                fontSize: '10px',
                                fontWeight: 700,
                                letterSpacing: '0.18em',
                                textTransform: 'uppercase',
                                borderRadius: '3px',
                            }}
                        >
                            {ep.series?.title ?? 'Heimildarmynd'}
                        </span>
                        {dur && (
                            <span
                                style={{
                                    position: 'absolute',
                                    top: '12px',
                                    right: '12px',
                                    padding: '5px 9px',
                                    background: 'rgba(20,18,15,0.7)',
                                    backdropFilter: 'blur(6px)',
                                    color: 'var(--ljos)',
                                    fontFamily: 'var(--font-sans)',
                                    fontSize: '10.5px',
                                    fontWeight: 700,
                                    letterSpacing: '0.02em',
                                    borderRadius: '3px',
                                }}
                            >
                                {dur}
                            </span>
                        )}
                        <div
                            style={{
                                position: 'absolute',
                                left: '16px',
                                right: '16px',
                                bottom: '14px',
                            }}
                        >
                            <h3
                                style={{
                                    margin: 0,
                                    fontFamily: 'var(--font-serif)',
                                    fontSize: 'clamp(17px, 1.5vw, 20px)',
                                    lineHeight: 1.2,
                                    fontWeight: 400,
                                    color: 'var(--ljos)',
                                    letterSpacing: '-0.005em',
                                    textWrap: 'balance',
                                    textShadow: '0 1px 12px rgba(0,0,0,0.5)',
                                }}
                            >
                                {ep.title}
                            </h3>
                            {date && (
                                <div
                                    style={{
                                        marginTop: '6px',
                                        fontFamily: 'var(--font-sans)',
                                        fontSize: '10.5px',
                                        fontWeight: 600,
                                        letterSpacing: '0.16em',
                                        textTransform: 'uppercase',
                                        color: 'var(--moskva)',
                                    }}
                                >
                                    {date}
                                </div>
                            )}
                        </div>
                    </div>
                </article>
            </Link>
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
