/**
 * IsraelProphecy — Ezekiel 37 panel.
 *
 * Replaces the old Prophecy. Theological content preserved — the
 * dry-bones-to-1948 thread is biblical, not date-setting speculation.
 * What changed:
 *
 *   - Tokens replaced (no `--kerti-gloed` flood as the quote ground;
 *     gold rule + dark cathedral consistent with the rest of the site)
 *   - 12px asymmetric border-radius removed — reads as old web,
 *     doesn't fit the editorial register
 *   - Restraint copy: "Tilvera Ísraels í dag" stays, but framing
 *     is teaching-tone, not triumphal
 *   - Section header gets the kicker + serif title pattern
 */

export default function IsraelProphecy() {
    return (
        <section
            id="spadomar"
            style={{
                background: 'var(--skra)',
                color: 'var(--skra-djup)',
                borderTop: '1px solid rgba(63,47,35,0.12)',
            }}
        >
            <div
                style={{
                    maxWidth: '50rem',
                    margin: '0 auto',
                    padding: 'clamp(72px, 9vw, 112px) var(--rail-padding) clamp(56px, 7vw, 80px)',
                }}
            >
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
                    Spádómurinn
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
                    Þurru beinin lifa.
                </h2>

                <div
                    style={{
                        fontFamily: 'var(--font-serif)',
                        fontSize: 'clamp(17px, 1.55vw, 19px)',
                        lineHeight: 1.7,
                        color: 'var(--skra-djup)',
                    }}
                >
                    <p style={{ margin: '0 0 28px' }}>
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
                            Á
                        </span>
                        rið 1948 varð hrjóstrugt og víðfeðmt landsvæði aftur að ríki Gyðinga. Eftir nærri 2000 ár í útlegð lifnuðu þurru beinin úr Esekíel 37 við. Þessi atburður er eitt mesta spádómlega tákn okkar tíma — skrifað mörgum öldum áður en það gerðist.
                    </p>

                    <blockquote
                        style={{
                            margin: '32px 0',
                            paddingLeft: '28px',
                            borderLeft: '2px solid var(--gull)',
                            fontFamily: 'var(--font-serif)',
                            fontStyle: 'italic',
                            fontSize: 'clamp(19px, 1.8vw, 22px)',
                            lineHeight: 1.55,
                            color: 'var(--skra-djup)',
                        }}
                    >
                        „Mannssonur, þessi bein eru allir Ísraelsmenn. Þeir segja: Bein okkar eru skinin, von okkar brostin, það er úti um okkur. Spá því og seg við þá: Svo segir Drottinn Guð: Ég opna grafir ykkar og leiði ykkur, þjóð mína, úr gröfum ykkar og flyt ykkur til lands Ísraels.“
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
                            Esekíel 37:11–12
                        </footer>
                    </blockquote>

                    <p style={{ margin: 0 }}>
                        Tilvera Ísraels í dag er sönnun þess að Orð Guðs rætast. Það kallar okkur ekki til spáspeki um ókomna tíma, heldur til þess að standa með þjóðinni sem Drottinn hefur valið — í bæn, í þekkingu á Ritningunni, og í andstöðu við þá sem vilja útrýma henni.
                    </p>
                </div>
            </div>
        </section>
    );
}
