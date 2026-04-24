/**
 * ScriptureFooter — single voiced verse. Not a pitch, not another CTA.
 * The page's final breath.
 */

export default function StyrkjaScriptureFooter() {
    return (
        <section
            style={{
                padding: 'clamp(72px, 10vw, 96px) var(--rail-padding) clamp(96px, 14vw, 120px)',
                background: 'var(--torfa)',
                borderTop: '1px solid var(--border)',
                borderBottom: '1px solid var(--border)',
                textAlign: 'center',
            }}
        >
            <div style={{ maxWidth: '780px', margin: '0 auto' }}>
                <p
                    style={{
                        margin: 0,
                        fontFamily: 'var(--font-serif)',
                        fontStyle: 'italic',
                        fontSize: 'clamp(22px, 2.6vw, 30px)',
                        lineHeight: 1.45,
                        color: 'var(--ljos)',
                        letterSpacing: '-0.005em',
                        textWrap: 'pretty',
                    }}
                >
                    „Sérhver gefi eins og hann hefur ásett sér í hjarta sínu, ekki með ólund eða nauðung, því Guð elskar glaðan gjafara."
                </p>
                <div
                    style={{
                        marginTop: '22px',
                        fontFamily: 'var(--font-sans)',
                        fontSize: '12px',
                        fontWeight: 600,
                        letterSpacing: '0.18em',
                        textTransform: 'uppercase',
                        color: 'var(--moskva)',
                    }}
                >
                    2. Korintubréf 9:7
                </div>
            </div>
        </section>
    );
}
