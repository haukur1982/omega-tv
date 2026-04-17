'use client';

export default function BiblicalFoundation() {
    return (
        <section 
            id="skrifin"
            style={{
                backgroundColor: '#050505',
                padding: 'clamp(4rem, 10vw, 8rem) 24px',
                color: '#E5E5E5',
            }}
        >
            <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                <h2 
                    style={{
                        fontFamily: 'var(--font-serif)',
                        fontSize: 'clamp(2rem, 4vw, 3rem)',
                        fontWeight: 700,
                        color: '#D4AF37',
                        marginBottom: '40px',
                        textAlign: 'center',
                    }}
                >
                    Sáttmáli frá Upphafi
                </h2>

                <div 
                    style={{
                        fontFamily: 'var(--font-serif)',
                        fontSize: 'clamp(1.2rem, 2.5vw, 1.5rem)',
                        lineHeight: 1.8,
                        fontWeight: 400,
                        color: '#FFFFFF',
                        marginBottom: '60px',
                        borderLeft: '4px solid #D4AF37',
                        paddingLeft: '32px',
                        fontStyle: 'italic',
                    }}
                >
                    „Ég mun gera þig að mikilli þjóð, blessa þig og gjöra nafn þitt mikilfenglegt, og þú skalt vera blessun.“
                    <span style={{ display: 'block', marginTop: '16px', fontSize: '1rem', color: 'rgba(255,255,255,0.5)', fontStyle: 'normal', fontFamily: 'var(--font-sans)' }}>— 1. Mósebók 12:2</span>
                </div>

                <div 
                    style={{
                        fontFamily: 'var(--font-sans)',
                        fontSize: '1.1rem',
                        lineHeight: 1.8,
                        color: 'rgba(255,255,255,0.8)',
                    }}
                >
                    <p style={{ marginBottom: '24px' }}>
                        Allt frá dögum Abrahams, Ísaks og Jakobs, hefur Guð valið sér land og þjóð til að opinbera tilgang sinn fyrir mannkynið. Ísrael er ekki aðeins landfræðilegur staður, heldur lifandi vitnisburður um trúfesti Guðs við orð sín.
                    </p>
                    <p style={{ marginBottom: '24px' }}>
                        Ritningin er full af loforðum um uppreisn og varðveislu Ísraels. Það er í gegnum þessa þjóð sem Orð Guðs kom til manna, og það var í gegnum þessa sömu þjóð sem frelsarinn, Jesús Kristur (Jeshua), fæddist inn í þennan heim.
                    </p>
                    <p>
                        Að skilja Ísrael er að skilja kjarnann í hjarta Guðs. Margar spádómsbækur Biblíunnar, þar á meðal Jesaja, Esekíel og Sakaría, vísa fram til þeirra daga sem við lifum nú—daga þar sem dreifð þjóð safnast aftur saman í landi feðra sinna, nákvæmlega eins og spáð hafði verið fyrir um.
                    </p>
                </div>
            </div>
        </section>
    );
}
