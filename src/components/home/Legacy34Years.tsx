'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';

/**
 * Legacy34Years — "since 1992" closing anchor.
 *
 * Stays dark — this is the stewardship close after the donation
 * band, the moment that says "you've watched this network for 34
 * years, here's the proof." Two-column composition: archival photo
 * left, editorial copy right.
 *
 * Tokens are locked to the current Altingi palette
 * (--mold/--ljos/--moskva/--gull) — the older --accent and
 * --text-primary tokens this component used predated the palette
 * lock.
 */

export default function Legacy34Years() {
    return (
        <section
            style={{
                background: 'var(--mold)',
                borderTop: '1px solid var(--border)',
                padding: 'clamp(72px, 9vw, 112px) var(--rail-padding)',
            }}
        >
            <div
                style={{
                    maxWidth: '72rem',
                    margin: '0 auto',
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 320px), 1fr))',
                    gap: 'clamp(40px, 6vw, 72px)',
                    alignItems: 'center',
                }}
            >
                {/* Photo */}
                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 1 }}
                >
                    <div
                        style={{
                            position: 'relative',
                            aspectRatio: '4 / 3',
                            width: '100%',
                            borderRadius: 'var(--radius-md)',
                            overflow: 'hidden',
                            background: 'var(--torfa)',
                        }}
                    >
                        <Image
                            src="/history/broadcast-1992.jpg"
                            alt="Fyrsta útsending Omega 1992"
                            fill
                            style={{
                                objectFit: 'cover',
                                filter: 'grayscale(1) contrast(1.05) saturate(0.8)',
                            }}
                        />
                    </div>
                </motion.div>

                {/* Copy */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                >
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
                        Síðan 1992
                    </div>

                    <h2
                        style={{
                            margin: 0,
                            fontFamily: 'var(--font-serif)',
                            fontSize: 'clamp(44px, 5.5vw, 80px)',
                            lineHeight: 0.95,
                            letterSpacing: '-0.018em',
                            fontWeight: 400,
                            color: 'var(--ljos)',
                            textWrap: 'balance',
                        }}
                    >
                        34 ár
                        <br />
                        <span style={{ fontStyle: 'italic', color: 'var(--moskva)' }}>í loftinu.</span>
                    </h2>

                    <p
                        style={{
                            margin: '28px 0 0',
                            fontFamily: 'var(--font-serif)',
                            fontSize: 'clamp(17px, 1.5vw, 19px)',
                            lineHeight: 1.6,
                            color: 'var(--moskva)',
                            maxWidth: '32rem',
                        }}
                    >
                        Frá fyrstu útsendingu hefur Omega verið fastur punktur í tilveru þúsunda Íslendinga.
                        Við horfum björtum augum til framtíðar.
                    </p>

                    <div
                        aria-hidden
                        style={{
                            width: '52px',
                            height: '1px',
                            background: 'var(--gull)',
                            margin: '34px 0 22px',
                        }}
                    />

                    <Link
                        href="/about"
                        style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '12px',
                            fontFamily: 'var(--font-sans)',
                            fontSize: '12px',
                            fontWeight: 700,
                            letterSpacing: '0.18em',
                            textTransform: 'uppercase',
                            color: 'var(--ljos)',
                            textDecoration: 'none',
                        }}
                    >
                        Lestu söguna
                        <span aria-hidden>→</span>
                    </Link>
                </motion.div>
            </div>
        </section>
    );
}
