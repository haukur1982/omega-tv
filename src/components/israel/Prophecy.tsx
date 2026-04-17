'use client';

export default function Prophecy() {
    return (
        <section 
            id="spadomar"
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
                        fontSize: 'clamp(2rem, 3.5vw, 2.8rem)',
                        fontWeight: 700,
                        color: '#D4AF37',
                        marginBottom: '2rem',
                    }}
                >
                    Nútíma Ísrael & Spádómarnir
                </h2>

                <div 
                    style={{
                        fontFamily: 'var(--font-sans)',
                        fontSize: '1.1rem',
                        lineHeight: 1.8,
                        color: 'rgba(255,255,255,0.8)',
                    }}
                >
                    <p style={{ marginBottom: '24px' }}>
                        Árið 1948 varð hrjóstrugt og víðfeðmt landvæði aftur að ríki Gyðinga. Eftir nærri 2000 ár í útlegð lifnuðu þurru beinin úr Esekíel 37 við. Þessi atburður er eitt mesta spádómlega tákn okkar tíma, skrifað mörgum öldum áður en það gerðist.
                    </p>

                    <div 
                        style={{
                            background: 'rgba(212, 175, 55, 0.05)',
                            borderLeft: '4px solid #D4AF37',
                            padding: '24px',
                            margin: '40px 0',
                            borderRadius: '0 8px 8px 0',
                        }}
                    >
                        <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.5rem', color: '#FFF', marginBottom: '16px' }}>
                            Esekíel 37:11-12
                        </h3>
                        <p style={{ fontStyle: 'italic', color: 'rgba(255,255,255,0.9)', marginBottom: 0 }}>
                            „Hann sagði við mig: Mannssonur, þessi bein eru allt Ísraels hús. Sjá, þeir segja: Bein vor eru skorpin og von vor er úti, vér erum upprættir. Spá því og seg við þá: Svo segir Drottinn Guð: Sjá, ég lýk upp gröfum yðar og læt yður rísa upp úr gröfum yðar, lýður minn, og flyt yður til Ísraelslands.“
                        </p>
                    </div>

                    <p>
                        Tilvera Ísraels í dag er sönnun þess að orð Guðs rætast bókstaflega. Það er mikilvægt fyrir okkur sem trúað fólk að bera kennsl á tímana og tímaskeiðin sem við lifum í, styðja við verk Guðs og rannsaka Ritninguna til að skilja það sem koma skal.
                    </p>
                </div>
            </div>
        </section>
    );
}
