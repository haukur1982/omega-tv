import Link from "next/link";

/**
 * BaenDagsins — "Prayer of the day" editorial section.
 *
 * Pastor-authored prayer, not a user submission. Sits after the
 * PrayerTicker, sets a slower editorial pace. Two-column layout:
 * date/kicker on the left, big italic prayer + scripture ref on
 * the right.
 *
 * TODO: wire to a `featured_prayers` table so this rotates daily
 * without a code change. For now the content is inline — update
 * this file to change the daily prayer. The schema extension
 * (featured_prayers: date, body, scripture_ref, author) is a
 * small migration whenever it's wanted.
 */

const TODAY_PRAYER = {
    date: '24. apríl 2026',
    body: 'Drottinn, kenn mér að þekkja rödd þína í dag — í hávaðanum, í önnunum, í smæstu stundum. Lát mig ekki flýta mér fram úr þér, heldur ganga við hlið þér.',
    scripture: 'Sálm 95:7–8',
    author: 'borið fram af Omega',
};

export default function BaenDagsins() {
    return (
        <section
            style={{
                maxWidth: '70rem',
                margin: '0 auto',
                padding: 'clamp(72px, 10vw, 112px) var(--rail-padding) clamp(64px, 8vw, 96px)',
                display: 'grid',
                gridTemplateColumns: 'clamp(140px, 16vw, 180px) 1fr',
                gap: 'clamp(32px, 4vw, 56px)',
                alignItems: 'start',
            }}
        >
            <div>
                <div
                    style={{
                        fontFamily: 'var(--font-sans)',
                        fontSize: '11px',
                        fontWeight: 700,
                        letterSpacing: '0.22em',
                        textTransform: 'uppercase',
                        color: 'var(--moskva)',
                    }}
                >
                    Bæn dagsins
                </div>
                <div
                    style={{
                        marginTop: '10px',
                        fontFamily: 'var(--font-serif)',
                        fontStyle: 'italic',
                        fontSize: '14px',
                        color: 'var(--steinn)',
                        lineHeight: 1.5,
                    }}
                >
                    {TODAY_PRAYER.date}
                </div>
            </div>

            <div>
                <p
                    style={{
                        margin: 0,
                        fontFamily: 'var(--font-serif)',
                        fontStyle: 'italic',
                        fontSize: 'clamp(22px, 2.4vw, 30px)',
                        lineHeight: 1.45,
                        color: 'var(--ljos)',
                        letterSpacing: '-0.008em',
                        textWrap: 'pretty',
                    }}
                >
                    {TODAY_PRAYER.body}
                </p>
                <div
                    style={{
                        marginTop: '28px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '20px',
                        color: 'var(--moskva)',
                        fontFamily: 'var(--font-sans)',
                        fontSize: '13px',
                        letterSpacing: '0.04em',
                        flexWrap: 'wrap',
                    }}
                >
                    <span style={{ fontWeight: 600 }}>{TODAY_PRAYER.scripture}</span>
                    <span style={{ color: 'var(--steinn)' }}>·</span>
                    <span
                        style={{
                            fontFamily: 'var(--font-serif)',
                            fontStyle: 'italic',
                            fontSize: '14px',
                        }}
                    >
                        {TODAY_PRAYER.author}
                    </span>
                    <Link
                        href="/baenatorg"
                        style={{
                            marginLeft: 'auto',
                            color: 'var(--nordurljos)',
                            textDecoration: 'none',
                            fontWeight: 600,
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '8px',
                        }}
                    >
                        Fara á Bænatorg →
                    </Link>
                </div>
            </div>
        </section>
    );
}
