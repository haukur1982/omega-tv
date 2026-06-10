import { Metadata } from 'next';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import IsraelSubMasthead from '@/components/israel/IsraelSubMasthead';
import { getIsraelEpisodes, type IsraelEpisode } from '@/lib/vod-db';

/**
 * /israel/heimildarmyndir — the watch surface of the Israel section.
 *
 * Function-first: video is 16:9, so every frame here is 16:9 (honest
 * "what you see when you press play"). The newest broadcast gets a
 * full-width cinematic stage; the archive sits below it as a quiet
 * grid. Same photographic masthead language as /israel.
 */

export const metadata: Metadata = {
    title: 'Þættir um Ísrael | Omega Stöðin',
    description:
        'Þættir um Ísrael — fréttir, fræðsla og útsendingar — þýtt og sett upp til íslensks áhorfs.',
};

export const revalidate = 60;

function formatDate(iso: string | null): string {
    if (!iso) return '';
    return new Date(iso).toLocaleDateString('is-IS', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    });
}

function formatDuration(seconds: number | null): string | null {
    if (!seconds || seconds <= 0) return null;
    const mins = Math.round(seconds / 60);
    if (mins < 60) return `${mins} mín`;
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return m > 0 ? `${h} klst ${m} mín` : `${h} klst`;
}

function thumbOf(ep: IsraelEpisode): string {
    return ep.thumbnail_custom ?? `/api/bunny/thumbnail/${ep.bunny_video_id}`;
}

export default async function IsraelDocumentariesPage() {
    const episodes = await getIsraelEpisodes(60).catch(() => []);
    const [featured, ...rest] = episodes;
    const count = episodes.length;
    const metaLine =
        count > 0
            ? count === 1
                ? '1 þáttur í safninu — fleiri bætast við jafnóðum'
                : `${count} þættir í safninu`
            : undefined;

    return (
        <main style={{ minHeight: '100vh', backgroundColor: 'var(--mold)', color: 'var(--ljos)' }}>
            <Navbar />

            <IsraelSubMasthead
                crumb="Heimildarmyndir"
                title="Þættir um Ísrael."
                lede="Fréttir, fræðsla og útsendingar — þýtt og sett upp til íslensks áhorfs."
                image="/images/israel/heimildarmyndir-masthead.jpg"
                metaLine={metaLine}
            />

            {/* Cream body — the archive */}
            <section style={{ background: 'var(--skra)', color: 'var(--skra-djup)' }}>
                <div
                    style={{
                        maxWidth: '80rem',
                        margin: '0 auto',
                        padding: 'clamp(56px, 7vw, 88px) var(--rail-padding) clamp(96px, 12vw, 144px)',
                    }}
                >
                    {featured ? (
                        <>
                            {/* ── The newest broadcast — full cinematic stage ── */}
                            <div
                                style={{
                                    fontFamily: 'var(--font-sans)',
                                    fontSize: '11px',
                                    fontWeight: 700,
                                    letterSpacing: '0.22em',
                                    textTransform: 'uppercase',
                                    color: 'var(--gull)',
                                    marginBottom: '20px',
                                }}
                            >
                                Nýjasti þátturinn
                            </div>
                            <Link
                                href={`/sermons/${featured.bunny_video_id ?? featured.id}`}
                                style={{ display: 'block', textDecoration: 'none', color: 'inherit' }}
                            >
                                <article
                                    style={{
                                        position: 'relative',
                                        width: '100%',
                                        aspectRatio: '16 / 9',
                                        maxHeight: '560px',
                                        overflow: 'hidden',
                                        borderRadius: 'var(--radius-md)',
                                        background: 'var(--torfa)',
                                    }}
                                >
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                        src={thumbOf(featured)}
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
                                            inset: 0,
                                            background:
                                                'linear-gradient(to top, rgba(20,18,15,0.92) 0%, rgba(20,18,15,0.35) 38%, rgba(20,18,15,0.08) 60%)',
                                        }}
                                    />
                                    {/* play affordance — quiet amber ring */}
                                    <div
                                        aria-hidden
                                        style={{
                                            position: 'absolute',
                                            top: '50%',
                                            left: '50%',
                                            transform: 'translate(-50%, -62%)',
                                            width: 'clamp(56px, 6vw, 76px)',
                                            height: 'clamp(56px, 6vw, 76px)',
                                            borderRadius: '50%',
                                            border: '1.5px solid rgba(233,168,96,0.85)',
                                            background: 'rgba(20,18,15,0.45)',
                                            backdropFilter: 'blur(4px)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                        }}
                                    >
                                        <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden>
                                            <path d="M8 5.5v13l11-6.5z" fill="var(--kerti)" />
                                        </svg>
                                    </div>
                                    <div
                                        style={{
                                            position: 'absolute',
                                            left: 'clamp(20px, 3vw, 40px)',
                                            right: 'clamp(20px, 3vw, 40px)',
                                            bottom: 'clamp(20px, 3vw, 36px)',
                                        }}
                                    >
                                        <div
                                            style={{
                                                fontFamily: 'var(--font-sans)',
                                                fontSize: '10.5px',
                                                fontWeight: 700,
                                                letterSpacing: '0.2em',
                                                textTransform: 'uppercase',
                                                color: 'var(--moskva)',
                                                marginBottom: '10px',
                                            }}
                                        >
                                            {featured.series?.title ?? 'Heimildarmynd'}
                                            {formatDuration(featured.duration) && (
                                                <span style={{ opacity: 0.7 }}>
                                                    {'  ·  '}
                                                    {formatDuration(featured.duration)}
                                                </span>
                                            )}
                                        </div>
                                        <h2
                                            style={{
                                                margin: 0,
                                                fontFamily: 'var(--font-serif)',
                                                fontWeight: 400,
                                                fontSize: 'clamp(24px, 3.2vw, 42px)',
                                                lineHeight: 1.12,
                                                color: 'var(--ljos)',
                                                letterSpacing: '-0.01em',
                                                textWrap: 'balance',
                                                maxWidth: '24ch',
                                                textShadow: '0 1px 16px rgba(0,0,0,0.45)',
                                            }}
                                        >
                                            {featured.title}
                                        </h2>
                                        <div
                                            style={{
                                                marginTop: '12px',
                                                display: 'flex',
                                                alignItems: 'baseline',
                                                gap: '18px',
                                                flexWrap: 'wrap',
                                            }}
                                        >
                                            <span
                                                style={{
                                                    fontFamily: 'var(--font-sans)',
                                                    fontSize: '10.5px',
                                                    fontWeight: 600,
                                                    letterSpacing: '0.16em',
                                                    textTransform: 'uppercase',
                                                    color: 'var(--moskva)',
                                                }}
                                            >
                                                {formatDate(featured.published_at)}
                                            </span>
                                            <span
                                                style={{
                                                    fontFamily: 'var(--font-sans)',
                                                    fontSize: '11.5px',
                                                    fontWeight: 700,
                                                    letterSpacing: '0.16em',
                                                    textTransform: 'uppercase',
                                                    color: 'var(--kerti)',
                                                }}
                                            >
                                                Horfa á þáttinn →
                                            </span>
                                        </div>
                                    </div>
                                </article>
                            </Link>

                            {/* ── Archive grid — the rest, honest 16:9 frames ── */}
                            {rest.length > 0 && (
                                <div style={{ marginTop: 'clamp(56px, 7vw, 80px)' }}>
                                    <div
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '16px',
                                            marginBottom: 'clamp(24px, 3vw, 36px)',
                                        }}
                                    >
                                        <h2
                                            style={{
                                                margin: 0,
                                                fontFamily: 'var(--font-serif)',
                                                fontWeight: 400,
                                                fontSize: 'clamp(22px, 2.4vw, 30px)',
                                                color: 'var(--skra-djup)',
                                            }}
                                        >
                                            Safnið
                                        </h2>
                                        <span aria-hidden style={{ flex: 1, height: '1px', background: 'rgba(63,47,35,0.16)' }} />
                                    </div>
                                    <ul
                                        style={{
                                            listStyle: 'none',
                                            padding: 0,
                                            margin: 0,
                                            display: 'grid',
                                            gap: 'clamp(28px, 3.5vw, 44px) clamp(24px, 3vw, 36px)',
                                            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                                        }}
                                    >
                                        {rest.map((ep) => (
                                            <ArchiveCard key={ep.id} ep={ep} />
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {/* lone-episode note — quiet, factual */}
                            {rest.length === 0 && (
                                <p
                                    style={{
                                        margin: 'clamp(36px, 4vw, 48px) 0 0',
                                        fontFamily: 'var(--font-serif)',
                                        fontStyle: 'italic',
                                        fontSize: 'clamp(15.5px, 1.3vw, 18px)',
                                        color: 'rgba(63,47,35,0.65)',
                                        textAlign: 'center',
                                    }}
                                >
                                    Safnið stækkar jafnóðum — nýir þættir koma beint úr þýðingarstöðinni.
                                </p>
                            )}
                        </>
                    ) : (
                        <EmptyState />
                    )}
                </div>
            </section>

            <Footer />
        </main>
    );
}

function ArchiveCard({ ep }: { ep: IsraelEpisode }) {
    const dur = formatDuration(ep.duration);
    return (
        <li>
            <Link
                href={`/sermons/${ep.bunny_video_id ?? ep.id}`}
                style={{ display: 'block', color: 'var(--skra-djup)', textDecoration: 'none' }}
            >
                <article>
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
                            src={thumbOf(ep)}
                            alt=""
                            loading="lazy"
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
                                    bottom: '10px',
                                    right: '10px',
                                    padding: '4px 8px',
                                    background: 'rgba(20,18,15,0.72)',
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
                    </div>
                    <div
                        style={{
                            marginTop: '12px',
                            fontFamily: 'var(--font-sans)',
                            fontSize: '10px',
                            fontWeight: 700,
                            letterSpacing: '0.18em',
                            textTransform: 'uppercase',
                            color: 'rgba(63,47,35,0.55)',
                        }}
                    >
                        {ep.series?.title ?? 'Heimildarmynd'}
                        {ep.published_at && (
                            <span style={{ fontWeight: 600 }}>
                                {'  ·  '}
                                {formatDate(ep.published_at)}
                            </span>
                        )}
                    </div>
                    <h3
                        style={{
                            margin: '6px 0 0',
                            fontFamily: 'var(--font-serif)',
                            fontWeight: 400,
                            fontSize: 'clamp(17px, 1.5vw, 20px)',
                            lineHeight: 1.3,
                            color: 'var(--skra-djup)',
                            letterSpacing: '-0.005em',
                            textWrap: 'balance',
                        }}
                    >
                        {ep.title}
                    </h3>
                </article>
            </Link>
        </li>
    );
}

function EmptyState() {
    return (
        <div
            style={{
                padding: 'clamp(64px, 8vw, 96px) clamp(28px, 4vw, 48px)',
                textAlign: 'center',
                maxWidth: '46rem',
                margin: '0 auto',
            }}
        >
            <div
                aria-hidden
                style={{
                    width: '40px',
                    height: '1px',
                    background: 'var(--gull)',
                    margin: '0 auto 24px',
                }}
            />
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
    );
}
