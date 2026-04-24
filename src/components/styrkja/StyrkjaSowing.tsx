/**
 * Sowing — theological frame between hero and the donation card.
 *
 * Not a pitch. A breath before the ask. Three short reflections with
 * small amber leades, each line a hairline amber left border. Reads
 * like an editorial aside, not a marketing section.
 */

const LINES = [
    { lede: 'Sáðkorn', body: 'Hver króna sem þú leggur fram er sæði — ekki kaup heldur sáning.' },
    { lede: 'Sálir', body: 'Hver þáttur, hver bæn, hver svipstund fyrir framan skjáinn getur komið við hjarta.' },
    { lede: 'Eilífð', body: 'Við sáum í íslensku þjóðina og í eilífðina, og bíðum uppskerunnar með Drottni.' },
];

export default function StyrkjaSowing() {
    return (
        <section
            style={{
                background: 'var(--torfa)',
                borderBottom: '1px solid var(--border)',
            }}
        >
            <div
                style={{
                    maxWidth: '80rem',
                    margin: '0 auto',
                    padding: 'clamp(48px, 6vw, 64px) var(--rail-padding)',
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                    gap: 'clamp(32px, 4vw, 48px)',
                }}
            >
                {LINES.map((l) => (
                    <div key={l.lede} style={{ position: 'relative', paddingLeft: '24px' }}>
                        <span
                            aria-hidden
                            style={{
                                position: 'absolute',
                                left: 0,
                                top: '4px',
                                width: '1px',
                                height: 'calc(100% - 8px)',
                                background: 'var(--kerti)',
                                opacity: 0.45,
                            }}
                        />
                        <div
                            style={{
                                fontFamily: 'var(--font-sans)',
                                fontSize: '11px',
                                fontWeight: 700,
                                letterSpacing: '0.22em',
                                textTransform: 'uppercase',
                                color: 'var(--kerti)',
                                marginBottom: '14px',
                                opacity: 0.9,
                            }}
                        >
                            {l.lede}
                        </div>
                        <p
                            style={{
                                margin: 0,
                                fontFamily: 'var(--font-serif)',
                                fontStyle: 'italic',
                                fontSize: '19px',
                                lineHeight: 1.5,
                                color: 'var(--ljos)',
                                letterSpacing: '-0.003em',
                                textWrap: 'pretty',
                            }}
                        >
                            {l.body}
                        </p>
                    </div>
                ))}
            </div>
        </section>
    );
}
