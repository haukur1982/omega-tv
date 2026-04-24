import Link from "next/link";
import type { ScheduleSlot } from "@/lib/schedule-db";

/**
 * AMedanPuBidur — "Á meðan þú bíður" ("While you wait").
 *
 * Three quiet editorial picks that only exist when the page is in
 * State B (off-air). Purpose: give the viewer a reason to stay in
 * the brand's voice instead of leaving, without turning Live into
 * a content shelf.
 *
 * Items:
 *   1. Síðasta útsending — most recent past broadcast → /sermons
 *   2. Beiðni vikunnar   — a prayer from the wall    → /baenatorg
 *   3. Grein vikunnar    — one featured article       → /greinar
 *
 * Item 1 is wired to real schedule data (previous slot). Items 2–3
 * use placeholder content today; a second pass will wire them to
 * the prayers + articles tables. Visual is the deliverable here.
 */

interface Props {
    previous: ScheduleSlot | null;
}

export default function AMedanPuBidur({ previous }: Props) {
    const items: Array<{
        kicker: string;
        title: string;
        meta: string;
        body: string;
        href: string;
        image: string | null;
    }> = [
        {
            kicker: 'Síðasta útsending',
            title: previous?.program_title ?? 'Sunnudagssamkoma',
            meta: previous?.host_name
                ? `${previous.host_name} · ${formatDuration(previous)}`
                : 'Omega · 45 mín',
            body: previous?.description ?? 'Bein útsending úr safnaðarsalnum — bæn, söngur, boðskapur.',
            href: '/sermons',
            image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=900&auto=format&fit=crop',
        },
        {
            kicker: 'Beiðni vikunnar',
            title: '„Bið fyrir unglingum á Íslandi."',
            meta: 'Bænatorg · Sigrún',
            body: 'Að þeir finni veg Drottins áður en það er of seint.',
            href: '/baenatorg',
            image: null,
        },
        {
            kicker: 'Grein vikunnar',
            title: 'Þú þarft ekki að vinna þér inn það sem er þegar þitt',
            meta: 'Omega Tímaritið · 6 mín lestur',
            body: 'Um náð, hvíld og sjálfsvirði í trú.',
            href: '/greinar',
            image: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=900&auto=format&fit=crop',
        },
    ];

    return (
        <section
            style={{
                maxWidth: '84rem',
                margin: '0 auto',
                padding: 'var(--section-gap) var(--rail-padding) 0',
            }}
        >
            <div
                style={{
                    display: 'flex',
                    alignItems: 'baseline',
                    justifyContent: 'space-between',
                    marginBottom: '24px',
                    gap: '24px',
                    flexWrap: 'wrap',
                }}
            >
                <h2
                    className="type-greinar"
                    style={{ margin: 0, color: 'var(--ljos)', fontSize: 'clamp(1.6rem, 2.6vw, 2rem)' }}
                >
                    Á meðan þú bíður.
                </h2>
                <span
                    style={{
                        color: 'var(--moskva)',
                        fontFamily: 'var(--font-serif)',
                        fontStyle: 'italic',
                        fontSize: '14.5px',
                        maxWidth: '36ch',
                        textAlign: 'right',
                    }}
                >
                    Þrjú hljóðlát augnablik — þangað til sendingin hefst.
                </span>
            </div>
            <div
                style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                    gap: '18px',
                }}
            >
                {items.map((it) => (
                    <Link
                        key={it.kicker}
                        href={it.href}
                        className="warm-hover"
                        style={{
                            background: 'var(--torfa)',
                            border: '1px solid var(--border)',
                            borderRadius: 'var(--radius-md)',
                            textDecoration: 'none',
                            color: 'inherit',
                            display: 'flex',
                            flexDirection: 'column',
                            overflow: 'hidden',
                            minHeight: '340px',
                        }}
                    >
                        <div
                            style={{
                                aspectRatio: '16/9',
                                background: 'var(--nott)',
                                position: 'relative',
                                overflow: 'hidden',
                            }}
                        >
                            {it.image ? (
                                <>
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                        src={it.image}
                                        alt=""
                                        style={{
                                            position: 'absolute',
                                            inset: 0,
                                            width: '100%',
                                            height: '100%',
                                            objectFit: 'cover',
                                            opacity: 0.78,
                                            filter: 'saturate(0.85)',
                                        }}
                                    />
                                    <div
                                        aria-hidden
                                        style={{
                                            position: 'absolute',
                                            inset: 0,
                                            background: 'linear-gradient(to top, rgba(20,18,15,0.55), transparent 60%)',
                                        }}
                                    />
                                </>
                            ) : (
                                <div
                                    style={{
                                        position: 'absolute',
                                        inset: 0,
                                        background: 'radial-gradient(ellipse at center, rgba(111,165,216,0.08), transparent 70%)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: 'var(--nordurljos)',
                                    }}
                                >
                                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                                        <path d="M9 11V6a1.5 1.5 0 0 1 3 0v5" />
                                        <path d="M12 11V5a1.5 1.5 0 0 1 3 0v6" />
                                        <path d="M15 11V7a1.5 1.5 0 0 1 3 0v8a6 6 0 0 1-6 6h-.5a6 6 0 0 1-5.74-4.28L3.5 12a1.5 1.5 0 0 1 2.7-1.3L8 13" />
                                    </svg>
                                </div>
                            )}
                        </div>
                        <div
                            style={{
                                padding: '22px 24px 24px',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '10px',
                                flex: 1,
                            }}
                        >
                            <span className="type-merki" style={{ color: 'var(--nordurljos)' }}>{it.kicker}</span>
                            <h3
                                style={{
                                    margin: 0,
                                    fontFamily: 'var(--font-serif)',
                                    fontSize: '19px',
                                    lineHeight: 1.25,
                                    color: 'var(--ljos)',
                                    fontWeight: 700,
                                    letterSpacing: '-0.01em',
                                }}
                            >
                                {it.title}
                            </h3>
                            <p
                                style={{
                                    margin: 0,
                                    fontFamily: 'var(--font-serif)',
                                    fontStyle: 'italic',
                                    fontSize: '14px',
                                    lineHeight: 1.55,
                                    color: 'var(--moskva)',
                                }}
                            >
                                {it.body}
                            </p>
                            <div style={{ flex: 1 }} />
                            <div
                                style={{
                                    color: 'var(--steinn)',
                                    fontFamily: 'var(--font-sans)',
                                    fontSize: '11.5px',
                                    fontWeight: 600,
                                    letterSpacing: '0.12em',
                                    textTransform: 'uppercase',
                                }}
                            >
                                {it.meta}
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </section>
    );
}

function formatDuration(slot: ScheduleSlot): string {
    const minutes = Math.round((new Date(slot.ends_at).getTime() - new Date(slot.starts_at).getTime()) / 60000);
    return `${minutes} mín`;
}
