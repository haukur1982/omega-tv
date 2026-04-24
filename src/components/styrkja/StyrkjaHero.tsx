/**
 * StyrkjaHero — editorial, not a pitch deck.
 *
 * Plain kicker + Fraunces headline + italic Newsreader sub.
 * No hero photo, no marketing copy. The page's weight is in the
 * donation card and the allocation sidebar below; the hero just
 * frames the ask.
 */

export default function StyrkjaHero() {
    return (
        <section
            style={{
                maxWidth: '80rem',
                margin: '0 auto',
                padding: 'clamp(120px, 14vw, 160px) var(--rail-padding) clamp(48px, 6vw, 56px)',
                borderBottom: '1px solid var(--border)',
            }}
        >
            <div
                style={{
                    fontFamily: 'var(--font-sans)',
                    fontSize: '12px',
                    fontWeight: 700,
                    letterSpacing: '0.22em',
                    textTransform: 'uppercase',
                    color: 'var(--moskva)',
                    marginBottom: '18px',
                }}
            >
                Styrkja
            </div>
            <h1
                style={{
                    margin: 0,
                    fontFamily: 'var(--font-serif)',
                    fontSize: 'clamp(44px, 6vw, 76px)',
                    lineHeight: 1.02,
                    letterSpacing: '-0.018em',
                    fontWeight: 400,
                    color: 'var(--ljos)',
                    maxWidth: '880px',
                    textWrap: 'balance',
                }}
            >
                Omega lifir af þeim sem kunna að meta hana.
            </h1>
            <p
                style={{
                    margin: '32px 0 0',
                    fontFamily: 'var(--font-serif)',
                    fontSize: '20px',
                    lineHeight: 1.55,
                    color: 'var(--moskva)',
                    maxWidth: '640px',
                    fontStyle: 'italic',
                    textWrap: 'pretty',
                }}
            >
                Engar auglýsingar. Engin áskrift. Aðeins sú einfalda samþykkt að þetta skipti máli — og að við berum það saman.
            </p>
        </section>
    );
}
