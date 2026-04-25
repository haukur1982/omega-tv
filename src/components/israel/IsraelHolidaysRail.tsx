import type { IsraelHoliday } from "@/lib/israel-holidays";

/**
 * IsraelHolidaysRail — "Hátíðir Ísraels" rail of upcoming Hebrew/
 * biblical holidays, with their biblical reference and a 1-line
 * pastoral note connecting each to Christian faith.
 *
 * Visual texture: warm pergament tint (slightly darker than --skra)
 * so the section reads as a distinct cream variant — provides the
 * tonal breathing the page needs without breaking the cream body
 * cohesion.
 *
 * Renders nothing if there are no upcoming holidays in the data
 * (graceful degradation when the year rolls over and the calendar
 * isn't refreshed).
 */

interface Props {
    holidays: IsraelHoliday[];
}

export default function IsraelHolidaysRail({ holidays }: Props) {
    if (!holidays || holidays.length === 0) return null;

    return (
        <section
            style={{
                background: 'rgba(212,194,162,0.18)', // pergament tint over cream
                color: 'var(--skra-djup)',
                borderTop: '1px solid rgba(63,47,35,0.12)',
                borderBottom: '1px solid rgba(63,47,35,0.12)',
            }}
        >
            <div
                style={{
                    maxWidth: '80rem',
                    margin: '0 auto',
                    padding: 'clamp(72px, 9vw, 112px) var(--rail-padding)',
                }}
            >
                <header
                    style={{
                        marginBottom: 'clamp(32px, 4vw, 48px)',
                        maxWidth: '50rem',
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
                            marginBottom: '14px',
                        }}
                    >
                        Hátíðir
                    </div>
                    <h2
                        style={{
                            margin: 0,
                            fontFamily: 'var(--font-serif)',
                            fontSize: 'clamp(28px, 3.2vw, 40px)',
                            lineHeight: 1.1,
                            fontWeight: 400,
                            color: 'var(--skra-djup)',
                            letterSpacing: '-0.005em',
                        }}
                    >
                        Hátíðir Ísraels
                    </h2>
                    <p
                        style={{
                            margin: '14px 0 0',
                            fontFamily: 'var(--font-serif)',
                            fontStyle: 'italic',
                            fontSize: '17px',
                            lineHeight: 1.5,
                            color: 'var(--skra-mjuk)',
                        }}
                    >
                        Helgidagar þjóðarinnar — boðaðar í 3. Mósebók 23, ennþá haldnar í dag.
                    </p>
                </header>

                <ul
                    style={{
                        listStyle: 'none',
                        padding: 0,
                        margin: 0,
                        display: 'grid',
                        gap: 'clamp(20px, 2vw, 28px)',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                    }}
                >
                    {holidays.map((h) => (
                        <HolidayCard key={h.nameHebrew} h={h} />
                    ))}
                </ul>
            </div>
        </section>
    );
}

function HolidayCard({ h }: { h: IsraelHoliday }) {
    return (
        <li
            style={{
                padding: 'clamp(22px, 2vw, 28px)',
                background: 'var(--skra)',
                border: '1px solid rgba(63,47,35,0.14)',
                borderRadius: 'var(--radius-sm)',
                display: 'flex',
                flexDirection: 'column',
                gap: '14px',
            }}
        >
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
                {h.dateLabel}
            </div>
            <div>
                <div
                    dir="rtl"
                    lang="he"
                    style={{
                        fontFamily: '"SBL Hebrew", "Ezra SIL", "Times New Roman", serif',
                        fontSize: '22px',
                        color: 'var(--gull)',
                        marginBottom: '6px',
                        lineHeight: 1.1,
                    }}
                >
                    {h.nameHebrewScript}
                </div>
                <div
                    style={{
                        fontFamily: 'var(--font-serif)',
                        fontStyle: 'italic',
                        fontSize: '13.5px',
                        color: 'var(--skra-mjuk)',
                        letterSpacing: '0.01em',
                        marginBottom: '4px',
                    }}
                >
                    {h.nameHebrew}
                </div>
                <h3
                    style={{
                        margin: 0,
                        fontFamily: 'var(--font-serif)',
                        fontSize: 'clamp(22px, 2vw, 26px)',
                        lineHeight: 1.15,
                        fontWeight: 400,
                        color: 'var(--skra-djup)',
                        letterSpacing: '-0.005em',
                    }}
                >
                    {h.nameIcelandic}
                </h3>
            </div>
            <p
                style={{
                    margin: 0,
                    fontFamily: 'var(--font-serif)',
                    fontStyle: 'italic',
                    fontSize: '15px',
                    lineHeight: 1.55,
                    color: 'var(--skra-djup)',
                    textWrap: 'pretty',
                }}
            >
                {h.meaning}
            </p>
            <div
                style={{
                    marginTop: 'auto',
                    paddingTop: '8px',
                    fontFamily: 'var(--font-sans)',
                    fontSize: '10.5px',
                    fontWeight: 700,
                    letterSpacing: '0.18em',
                    textTransform: 'uppercase',
                    color: 'var(--skra-mjuk)',
                    borderTop: '1px solid rgba(63,47,35,0.1)',
                }}
            >
                {h.biblicalRef}
            </div>
        </li>
    );
}
