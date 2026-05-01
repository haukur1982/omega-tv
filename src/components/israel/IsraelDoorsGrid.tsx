import Link from "next/link";

/**
 * IsraelDoorsGrid — four "doors" into the section, placed right
 * after the broadcast band as the entry point into the cream body.
 *
 * Inspired by oneforisrael.org's ministry-tile pattern but adapted to
 * Omega's restraint: typography + subtle warm-tinted backgrounds
 * (no photos, no flag motifs, no Hebrew letter gimmicks).
 *
 * Each door is a tall card with:
 *   - Distinct kicker action verb (Sjá / Lesa / Horfa / Biðja)
 *   - Bold serif title
 *   - Italic 1-line description
 *   - Quiet → indicator
 *   - Slight per-tile background variation (warm tonal range) so the
 *     four cards read as members of a set without looking identical
 *
 * Two go to anchors on this page, two to dedicated sub-routes.
 */

interface Door {
    n: string;            // Chapter number, editorial
    kicker: string;       // Action verb
    title: string;        // Door label
    desc: string;         // Italic descriptor
    href: string;
    tint: string;         // Per-card background
}

const DOORS: Door[] = [
    {
        n: '01',
        kicker: 'Sjá',
        title: 'Sáttmálinn',
        desc: 'Loforð Guðs við Abraham — og við þjóðina sem hann valdi.',
        href: '#skrifin',
        tint: 'rgba(212,194,162,0.22)',
    },
    {
        n: '02',
        kicker: 'Lesa',
        title: 'Greinar um Ísrael',
        desc: 'Fræðsla um Ritninguna, þjóðina og kall Íslands.',
        href: '/israel/greinar',
        tint: 'rgba(200,138,62,0.16)',
    },
    {
        n: '03',
        kicker: 'Horfa',
        title: 'Heimildarmyndir',
        desc: 'Fréttir og fræðsluþættir úr safninu, þýddir á íslensku.',
        href: '/israel/heimildarmyndir',
        tint: 'rgba(74,67,57,0.14)',
    },
    {
        n: '04',
        kicker: 'Biðja',
        title: 'Bæn fyrir Jerúsalem',
        desc: 'Sálmur 122 — kallið til varðmanna á múrnum.',
        href: '#baen',
        tint: 'rgba(212,194,162,0.32)',
    },
];

export default function IsraelDoorsGrid() {
    return (
        <section
            style={{
                background: 'var(--skra)',
                color: 'var(--skra-djup)',
                borderTop: '1px solid rgba(63,47,35,0.12)',
            }}
        >
            <div
                style={{
                    maxWidth: '80rem',
                    margin: '0 auto',
                    padding: 'clamp(64px, 8vw, 96px) var(--rail-padding)',
                }}
            >
                <ul
                    style={{
                        listStyle: 'none',
                        padding: 0,
                        margin: 0,
                        display: 'grid',
                        gap: 'clamp(16px, 2vw, 24px)',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                    }}
                >
                    {DOORS.map((d) => (
                        <DoorCard key={d.title} door={d} />
                    ))}
                </ul>
            </div>
        </section>
    );
}

function DoorCard({ door }: { door: Door }) {
    return (
        <li>
            <Link
                href={door.href}
                className="warm-hover"
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    minHeight: '280px',
                    padding: 'clamp(24px, 2.5vw, 32px)',
                    background: door.tint,
                    border: '1px solid rgba(63,47,35,0.16)',
                    borderRadius: 'var(--radius-md)',
                    color: 'var(--skra-djup)',
                    textDecoration: 'none',
                    transition: 'transform 280ms ease, border-color 280ms ease',
                }}
            >
                <div>
                    {/* Chapter number — quiet editorial marker, top-left */}
                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'baseline',
                            justifyContent: 'space-between',
                            marginBottom: '14px',
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
                            }}
                        >
                            {door.kicker}
                        </div>
                        <div
                            style={{
                                fontFamily: 'var(--font-serif)',
                                fontStyle: 'italic',
                                fontSize: '14px',
                                color: 'var(--skra-mjuk)',
                                fontFeatureSettings: '"lnum", "tnum"',
                            }}
                        >
                            {door.n}
                        </div>
                    </div>
                    <h3
                        style={{
                            margin: 0,
                            fontFamily: 'var(--font-serif)',
                            fontSize: 'clamp(24px, 2.4vw, 30px)',
                            lineHeight: 1.12,
                            fontWeight: 400,
                            color: 'var(--skra-djup)',
                            letterSpacing: '-0.005em',
                            textWrap: 'balance',
                        }}
                    >
                        {door.title}
                    </h3>
                    <p
                        style={{
                            margin: '14px 0 0',
                            fontFamily: 'var(--font-serif)',
                            fontStyle: 'italic',
                            fontSize: '15.5px',
                            lineHeight: 1.5,
                            color: 'var(--skra-mjuk)',
                            textWrap: 'pretty',
                        }}
                    >
                        {door.desc}
                    </p>
                </div>
                <div
                    aria-hidden
                    style={{
                        marginTop: '32px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        fontFamily: 'var(--font-sans)',
                        fontSize: '11.5px',
                        fontWeight: 700,
                        letterSpacing: '0.18em',
                        textTransform: 'uppercase',
                        color: 'var(--skra-djup)',
                    }}
                >
                    <span
                        style={{
                            width: '32px',
                            height: '1px',
                            background: 'var(--gull)',
                        }}
                    />
                    Áfram
                </div>
            </Link>
        </li>
    );
}
