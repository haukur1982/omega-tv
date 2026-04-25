/**
 * IsraelFoundation — Genesis 12 covenant teaching panel.
 *
 * Replaces the old BiblicalFoundation. Theological content preserved
 * verbatim — that copy was thoughtful and Hawk-voice. What changed:
 *
 *   - Tokens (no hardcoded #050505 etc.)
 *   - Composition fits the editorial flow rather than reading as a
 *     standalone landing brochure
 *   - Pull-quote treatment refined to match the article cover style
 *     (gold rule, no 12px rounded corner)
 *   - Section header uses the kicker + serif title pattern from
 *     /greinar masthead, gives it a magazine-section feel
 */

export default function IsraelFoundation() {
    return (
        <section
            id="skrifin"
            style={{
                background: 'var(--skra)',
                color: 'var(--skra-djup)',
            }}
        >
            <div
                style={{
                    maxWidth: '50rem',
                    margin: '0 auto',
                    padding: 'clamp(72px, 9vw, 112px) var(--rail-padding) clamp(56px, 7vw, 80px)',
                }}
            >
                {/* Ornamental section opener — small centered gold mark
                    above the kicker, signals "new chapter, read this." */}
                <div
                    aria-hidden
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '14px',
                        marginBottom: '28px',
                    }}
                >
                    <span style={{ width: '32px', height: '1px', background: 'var(--gull)' }} />
                    <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden>
                        <circle cx="5" cy="5" r="2" fill="var(--gull)" />
                    </svg>
                    <span style={{ flex: 1, height: '1px', background: 'rgba(200,138,62,0.18)' }} />
                </div>

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
                    Sáttmálinn
                </div>

                <h2
                    style={{
                        margin: 0,
                        fontFamily: 'var(--font-serif)',
                        fontSize: 'clamp(32px, 4vw, 48px)',
                        lineHeight: 1.08,
                        fontWeight: 400,
                        color: 'var(--skra-djup)',
                        letterSpacing: '-0.01em',
                        marginBottom: 'clamp(36px, 5vw, 56px)',
                    }}
                >
                    Sáttmáli frá upphafi.
                </h2>

                {/* Pull-quote: Genesis 12:2 */}
                <blockquote
                    style={{
                        margin: '0 0 clamp(40px, 5vw, 56px)',
                        paddingLeft: '28px',
                        borderLeft: '2px solid var(--gull)',
                        fontFamily: 'var(--font-serif)',
                        fontSize: 'clamp(22px, 2.4vw, 28px)',
                        lineHeight: 1.45,
                        fontStyle: 'italic',
                        color: 'var(--skra-djup)',
                        letterSpacing: '-0.005em',
                    }}
                >
                    „Ég mun gera þig að mikilli þjóð og blessa þig og gera nafn þitt mikið.“
                    <footer
                        style={{
                            marginTop: '18px',
                            fontFamily: 'var(--font-sans)',
                            fontStyle: 'normal',
                            fontSize: '11px',
                            fontWeight: 700,
                            letterSpacing: '0.22em',
                            textTransform: 'uppercase',
                            color: 'var(--skra-mjuk)',
                        }}
                    >
                        1. Mósebók 12:2
                    </footer>
                </blockquote>

                <div
                    style={{
                        fontFamily: 'var(--font-serif)',
                        fontSize: 'clamp(17px, 1.55vw, 19px)',
                        lineHeight: 1.7,
                        color: 'var(--skra-djup)',
                    }}
                >
                    <p style={{ margin: '0 0 22px' }}>
                        <span
                            style={{
                                float: 'left',
                                fontFamily: 'var(--font-serif)',
                                fontSize: 'clamp(56px, 6vw, 76px)',
                                lineHeight: 0.85,
                                fontWeight: 400,
                                color: 'var(--gull)',
                                marginRight: '12px',
                                marginTop: '6px',
                                letterSpacing: '-0.02em',
                            }}
                        >
                            A
                        </span>
                        llt frá dögum Abrahams, Ísaks og Jakobs, hefur Guð valið sér land og þjóð til að opinbera tilgang sinn fyrir mannkynið. Ísrael er ekki aðeins landfræðilegur staður, heldur lifandi vitnisburður um trúfesti Guðs við orð sín.
                    </p>
                    <p style={{ margin: '0 0 22px' }}>
                        Ritningin er full af loforðum um uppreisn og varðveislu Ísraels. Það er í gegnum þessa þjóð sem Orð Guðs kom til manna, og það var í gegnum þessa sömu þjóð sem frelsarinn, Jesús Kristur, fæddist inn í þennan heim.
                    </p>
                    <p style={{ margin: 0 }}>
                        Að skilja Ísrael er að skilja kjarnann í hjarta Guðs. Margar spádómsbækur Biblíunnar — þar á meðal Jesaja, Esekíel og Sakaría — vísa fram til þeirra daga sem við lifum nú: daga þar sem dreifð þjóð safnast aftur saman í landi feðra sinna, nákvæmlega eins og spáð hafði verið fyrir um.
                    </p>
                </div>
            </div>
        </section>
    );
}
