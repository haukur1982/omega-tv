import type { Metadata } from 'next';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

/**
 * /skilmalar — Omega's terms of use. Short, plain, honest. Paired with the
 * privacy page (/personuverndarstefna); the footer links to both.
 */

export const metadata: Metadata = {
    title: 'Skilmálar',
    description: 'Skilmálar fyrir notkun á omega.is: efnið, þátttaka, ábyrgð og lög.',
    alternates: { canonical: '/skilmalar' },
    robots: { index: true, follow: true },
};

const UPDATED = '27. júní 2026';

export default function TermsPage() {
    return (
        <main style={{ minHeight: '100vh', backgroundColor: 'var(--mold)', color: 'var(--ljos)' }}>
            <Navbar />

            <header
                style={{
                    background: 'var(--nott)',
                    padding: 'clamp(7rem, 12vw, 10rem) var(--rail-padding) clamp(3rem, 6vw, 4.5rem)',
                    borderBottom: '1px solid var(--border)',
                }}
            >
                <div style={{ maxWidth: '44rem', margin: '0 auto' }}>
                    <p
                        style={{
                            fontFamily: 'var(--font-sans)',
                            fontSize: '0.7rem',
                            fontWeight: 700,
                            letterSpacing: '0.22em',
                            textTransform: 'uppercase',
                            color: 'var(--kerti)',
                            marginBottom: '1.25rem',
                        }}
                    >
                        Skilmálar
                    </p>
                    <h1
                        style={{
                            fontFamily: 'var(--font-display)',
                            fontSize: 'clamp(2.4rem, 6vw, 3.6rem)',
                            lineHeight: 1.05,
                            fontWeight: 500,
                            margin: 0,
                            color: 'var(--ljos)',
                        }}
                    >
                        Skilmálar
                    </h1>
                    <p
                        style={{
                            fontFamily: 'var(--font-serif)',
                            fontSize: 'clamp(1.05rem, 2.2vw, 1.2rem)',
                            lineHeight: 1.6,
                            color: 'var(--moskva)',
                            marginTop: '1.5rem',
                            maxWidth: '38rem',
                        }}
                    >
                        Stutt og skýrt um notkun á omega.is. Með því að nota vefinn
                        samþykkir þú þessa skilmála.
                    </p>
                </div>
            </header>

            <article
                style={{
                    background: 'var(--skra)',
                    color: 'var(--skra-djup)',
                    padding: 'clamp(3.5rem, 8vw, 6rem) var(--rail-padding)',
                }}
            >
                <div style={{ maxWidth: '44rem', margin: '0 auto' }}>
                    <p style={pLabel}>Síðast uppfært {UPDATED}</p>

                    <Section title="Efni Omega">
                        <p style={pStyle}>
                            Efni Omega er ókeypis til einkanota. Þú mátt horfa, lesa og deila
                            tenglum með öðrum. Þú mátt ekki afrita efnið í atvinnuskyni eða
                            endurbirta það án leyfis. Höfundarréttur og réttur til efnisins
                            tilheyrir Omega eða þeim sem Omega hefur fengið leyfi frá.
                        </p>
                    </Section>

                    <Section title="Bænatorg og vitnisburðir">
                        <p style={pStyle}>
                            Þegar þú sendir inn bæn eða vitnisburð, gerðu það af virðingu. Við
                            förum yfir innsent efni áður en það birtist og getum fjarlægt efni
                            sem er ólöglegt, særandi eða á ekki heima á torginu. Sendu ekki inn
                            efni sem þú átt ekki rétt á að deila.
                        </p>
                    </Section>

                    <Section title="Engin sérfræðiráðgjöf">
                        <p style={pStyle}>
                            Efni Omega er til uppbyggingar í trú. Það kemur ekki í stað
                            læknisráðgjafar, lögfræðiráðgjafar eða fjármálaráðgjafar. Leitaðu til
                            fagaðila þegar það á við.
                        </p>
                    </Section>

                    <Section title="Ábyrgð">
                        <p style={pStyle}>
                            Vefurinn og efnið eru veitt eins og þau eru. Við leggjum okkur fram
                            um að allt sé rétt og aðgengilegt, en ábyrgjumst ekki að vefurinn sé
                            ávallt án truflana eða villna.
                        </p>
                    </Section>

                    <Section title="Tenglar á aðra vefi">
                        <p style={pStyle}>
                            Stundum tengjum við á efni annarra. Við berum ekki ábyrgð á efni eða
                            persónuvernd á vefjum sem við stjórnum ekki.
                        </p>
                    </Section>

                    <Section title="Persónuvernd">
                        <p style={pStyle}>
                            Um það hvernig við meðhöndlum persónuupplýsingar, sjá{' '}
                            <Link href="/personuverndarstefna" style={aStyle}>
                                persónuverndarstefnuna
                            </Link>
                            .
                        </p>
                    </Section>

                    <Section title="Breytingar og lög">
                        <p style={pStyle}>
                            Við kunnum að uppfæra þessa skilmála. Nýjasta útgáfan er alltaf hér,
                            með dagsetningu efst. Skilmálarnir fara að íslenskum lögum.
                        </p>
                    </Section>

                    <Section title="Samband">
                        <p style={pStyle}>
                            Spurningar um skilmálana? Hafðu samband á{' '}
                            <a href="mailto:omega@omega.is" style={aStyle}>
                                omega@omega.is
                            </a>
                            . Omega er rekið af Omega Kristniboðskirkju, kt. 630890-1019, Ármúla
                            15, 108 Reykjavík.
                        </p>
                    </Section>
                </div>
            </article>

            <Footer />
        </main>
    );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <section style={{ marginTop: 'clamp(2.25rem, 4vw, 3rem)' }}>
            <h2
                style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: 'clamp(1.4rem, 3vw, 1.75rem)',
                    fontWeight: 500,
                    lineHeight: 1.2,
                    margin: '0 0 1rem',
                    color: 'var(--skra-djup)',
                }}
            >
                {title}
            </h2>
            {children}
        </section>
    );
}

const pStyle: React.CSSProperties = {
    fontFamily: 'var(--font-serif)',
    fontSize: '1.075rem',
    lineHeight: 1.7,
    color: 'var(--skra-djup)',
    margin: '0 0 1rem',
};

const pLabel: React.CSSProperties = {
    fontFamily: 'var(--font-sans)',
    fontSize: '0.78rem',
    letterSpacing: '0.04em',
    color: 'var(--skra-mjuk)',
    margin: 0,
};

const aStyle: React.CSSProperties = {
    color: 'var(--gull)',
    textDecoration: 'underline',
    textUnderlineOffset: '2px',
};
