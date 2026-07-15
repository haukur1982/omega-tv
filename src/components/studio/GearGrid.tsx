'use client';

import Reveal from './Reveal';
import { formatIsk, type ProjectItem } from '@/lib/fundraising-shared';

/**
 * The equipment story — Blackmagic-release energy inside the Omega system:
 * three image-led feature cards (cameras/lights/audio) + the remaining
 * budget lines as quiet rows. Every amount comes from the project's items
 * in the database, so admin edits flow straight here.
 */

const ITEM_IMAGES: Record<string, string> = {
    myndavelar: '/studio/lens.jpg',
    ljos: '/studio/lights.jpg',
    hljod: '/studio/podcast.jpg',
};

export default function GearGrid({ items }: { items: ProjectItem[] }) {
    const featured = items.filter((i) => ITEM_IMAGES[i.key]);
    const rest = items.filter((i) => !ITEM_IMAGES[i.key]);

    return (
        <section style={{ background: 'var(--nott)', padding: 'clamp(72px, 10vw, 120px) 0' }}>
            <div style={{ maxWidth: '80rem', margin: '0 auto', padding: '0 var(--rail-padding)' }}>
                <Reveal>
                    <div
                        style={{
                            fontFamily: 'var(--font-sans)',
                            fontSize: '11px',
                            fontWeight: 700,
                            letterSpacing: '0.22em',
                            textTransform: 'uppercase',
                            color: 'var(--nordurljos)',
                            marginBottom: '16px',
                        }}
                    >
                        Búnaðurinn
                    </div>
                </Reveal>
                <Reveal delay={0.1}>
                    <h2
                        style={{
                            margin: '0 0 12px',
                            fontFamily: 'var(--font-display)',
                            fontWeight: 300,
                            fontSize: 'clamp(30px, 3.6vw, 48px)',
                            lineHeight: 1.12,
                            color: 'var(--ljos)',
                            maxWidth: '22ch',
                        }}
                    >
                        Hver króna á sér stað.
                    </h2>
                </Reveal>
                <Reveal delay={0.18}>
                    <p
                        style={{
                            margin: '0 0 48px',
                            fontFamily: 'var(--font-serif)',
                            fontSize: '17px',
                            lineHeight: 1.6,
                            color: 'var(--moskva)',
                            maxWidth: '58ch',
                        }}
                    >
                        Þetta er ekki óljós sjóður. Þetta er tækjalisti — og þegar hann er
                        fullfjármagnaður er stúdíóið til.
                    </p>
                </Reveal>

                <div
                    style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                        gap: 'clamp(16px, 2vw, 24px)',
                    }}
                >
                    {featured.map((item, i) => (
                        <Reveal key={item.key} delay={0.12 * i}>
                            <article
                                style={{
                                    position: 'relative',
                                    borderRadius: '4px',
                                    overflow: 'hidden',
                                    border: '1px solid rgba(246,242,234,0.06)',
                                    background: 'var(--torfa)',
                                    aspectRatio: '4 / 5',
                                    display: 'flex',
                                    alignItems: 'flex-end',
                                }}
                            >
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                    src={ITEM_IMAGES[item.key]}
                                    alt=""
                                    aria-hidden
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
                                            'linear-gradient(to top, rgba(20,18,15,0.95) 0%, rgba(20,18,15,0.45) 45%, rgba(20,18,15,0.05) 75%)',
                                    }}
                                />
                                <div style={{ position: 'relative', padding: '26px 26px 24px' }}>
                                    <div
                                        style={{
                                            fontFamily: 'var(--font-sans)',
                                            fontVariantNumeric: 'tabular-nums',
                                            fontSize: '13px',
                                            fontWeight: 700,
                                            letterSpacing: '0.14em',
                                            color: 'var(--kerti)',
                                            marginBottom: '8px',
                                        }}
                                    >
                                        {formatIsk(item.amount_isk)}
                                    </div>
                                    <h3
                                        style={{
                                            margin: 0,
                                            fontFamily: 'var(--font-display)',
                                            fontWeight: 400,
                                            fontSize: '22px',
                                            lineHeight: 1.2,
                                            color: 'var(--ljos)',
                                        }}
                                    >
                                        {item.label}
                                    </h3>
                                    {item.note && (
                                        <p
                                            style={{
                                                margin: '8px 0 0',
                                                fontFamily: 'var(--font-serif)',
                                                fontSize: '14.5px',
                                                lineHeight: 1.55,
                                                color: 'var(--moskva)',
                                            }}
                                        >
                                            {item.note}
                                        </p>
                                    )}
                                </div>
                            </article>
                        </Reveal>
                    ))}
                </div>

                {rest.length > 0 && (
                    <div style={{ marginTop: 'clamp(16px, 2vw, 24px)', display: 'grid', gap: '10px' }}>
                        {rest.map((item, i) => (
                            <Reveal key={item.key} delay={0.08 * i}>
                                <div
                                    style={{
                                        display: 'flex',
                                        alignItems: 'baseline',
                                        justifyContent: 'space-between',
                                        gap: '20px',
                                        flexWrap: 'wrap',
                                        background: 'var(--torfa)',
                                        border: '1px solid rgba(246,242,234,0.06)',
                                        borderRadius: '4px',
                                        padding: '20px 26px',
                                    }}
                                >
                                    <div style={{ minWidth: '220px', flex: 1 }}>
                                        <h3
                                            style={{
                                                margin: 0,
                                                fontFamily: 'var(--font-display)',
                                                fontWeight: 400,
                                                fontSize: '19px',
                                                color: 'var(--ljos)',
                                            }}
                                        >
                                            {item.label}
                                        </h3>
                                        {item.note && (
                                            <p
                                                style={{
                                                    margin: '6px 0 0',
                                                    fontFamily: 'var(--font-serif)',
                                                    fontSize: '14.5px',
                                                    lineHeight: 1.5,
                                                    color: 'var(--moskva)',
                                                }}
                                            >
                                                {item.note}
                                            </p>
                                        )}
                                    </div>
                                    <div
                                        style={{
                                            fontFamily: 'var(--font-sans)',
                                            fontVariantNumeric: 'tabular-nums',
                                            fontSize: '15px',
                                            fontWeight: 700,
                                            letterSpacing: '0.08em',
                                            color: 'var(--kerti)',
                                        }}
                                    >
                                        {formatIsk(item.amount_isk)}
                                    </div>
                                </div>
                            </Reveal>
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
}
