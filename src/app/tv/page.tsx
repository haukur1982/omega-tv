import type { Metadata } from 'next';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { OmegaMark } from '@/components/brand/OmegaMark';
import TvWatch from '@/components/tv/TvWatch';
import TvCapture from '@/components/tv/TvCapture';

/**
 * /tv — the BRIDGE arrival mat (docs/plans/01-bridge.md).
 *
 * Where the cable audience lands when they see "omega.is/tv" on screen. NOT
 * the full homepage: a stripped, phone-first, watch-first page. One action
 * (Horfa núna), then a warm weekly-letter capture offered after the gift of
 * watching, then quiet doors to prayer and giving. Because /tv is its own
 * path, every cable-sourced arrival shows up as "/tv" climbing in admin
 * analytics — the measurement is free.
 */

export const metadata: Metadata = {
    title: 'Horfðu á Omega',
    description: 'Horfðu á Omega beint hvenær sem er, og fáðu vikulegt bréf frá Omega í pósti.',
    alternates: { canonical: '/tv' },
    robots: { index: true, follow: true },
};

export default function TvPage() {
    const embedUrl = process.env.NEXT_PUBLIC_LIVE_STREAM_EMBED_URL;

    return (
        <main style={{ minHeight: '100vh', backgroundColor: 'var(--mold)', color: 'var(--ljos)' }}>
            <Navbar />

            {/* ── Welcome + the one action: watch ─────────────────────── */}
            <section
                style={{
                    maxWidth: '46rem',
                    margin: '0 auto',
                    padding: 'clamp(116px, 13vw, 168px) var(--rail-padding) clamp(2.5rem, 5vw, 3.5rem)',
                    textAlign: 'center',
                }}
            >
                <span style={{ color: 'var(--kerti)', display: 'inline-flex' }}>
                    <OmegaMark size={46} title="Omega" />
                </span>

                <h1
                    style={{
                        fontFamily: 'var(--font-display)',
                        fontSize: 'clamp(2.4rem, 7vw, 3.6rem)',
                        lineHeight: 1.05,
                        fontWeight: 500,
                        margin: '1.5rem 0 0',
                        color: 'var(--ljos)',
                    }}
                >
                    Þú fannst okkur.
                </h1>
                <p
                    style={{
                        fontFamily: 'var(--font-serif)',
                        fontSize: 'clamp(1.1rem, 2.4vw, 1.3rem)',
                        lineHeight: 1.6,
                        color: 'var(--moskva)',
                        margin: '1.1rem auto 0',
                        maxWidth: '34ch',
                    }}
                >
                    Velkomin á Omega. Horfðu á beina útsendingu hér, hvenær sem þér hentar.
                </p>

                <div style={{ marginTop: 'clamp(2rem, 4vw, 2.75rem)' }}>
                    <TvWatch embedUrl={embedUrl} />
                </div>

                <Link
                    href="/sermons"
                    style={{
                        display: 'inline-block',
                        marginTop: '1.25rem',
                        fontFamily: 'var(--font-sans)',
                        fontSize: '0.95rem',
                        fontWeight: 600,
                        color: 'var(--moskva)',
                        textDecoration: 'none',
                    }}
                >
                    Eða skoðaðu þætti þegar þér hentar →
                </Link>
            </section>

            {/* ── The thank-you: weekly letter, offered after watching ── */}
            <section
                style={{
                    maxWidth: '38rem',
                    margin: '0 auto',
                    padding: '0 var(--rail-padding) clamp(2.5rem, 5vw, 3.5rem)',
                }}
            >
                <TvCapture />
            </section>

            {/* ── Quiet doors + the cable reminder ────────────────────── */}
            <section
                style={{
                    maxWidth: '38rem',
                    margin: '0 auto',
                    padding: '0 var(--rail-padding) clamp(3.5rem, 7vw, 5rem)',
                    textAlign: 'center',
                }}
            >
                <div
                    style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        justifyContent: 'center',
                        gap: '1.5rem',
                        paddingTop: '0.5rem',
                    }}
                >
                    <Link href="/baenatorg" style={quietLink}>
                        Biddu með okkur →
                    </Link>
                    <Link href="/give" style={quietLink}>
                        Styðja Omega →
                    </Link>
                </div>

                <p
                    style={{
                        marginTop: '2rem',
                        fontFamily: 'var(--font-sans)',
                        fontSize: '0.9rem',
                        color: 'var(--steinn)',
                    }}
                >
                    Omega er líka í sjónvarpi.{' '}
                    <span style={{ color: 'var(--kerti)', fontWeight: 700 }}>Sjónvarp Símans, rás 6</span>
                </p>
            </section>

            <Footer />
        </main>
    );
}

const quietLink: React.CSSProperties = {
    fontFamily: 'var(--font-sans)',
    fontSize: '0.95rem',
    fontWeight: 600,
    color: 'var(--ljos)',
    textDecoration: 'none',
};
