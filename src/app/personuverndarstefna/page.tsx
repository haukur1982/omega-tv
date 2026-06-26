import type { Metadata } from 'next';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

/**
 * /personuverndarstefna — Omega's privacy policy (GDPR / persónuvernd).
 *
 * This is a foundation page for the three-moves plan (docs/plans): no email
 * capture, prayer notification, or subscriber flow is lawful without a real,
 * linkable privacy policy naming the data controller. The footer links here.
 *
 * Data controller confirmed against Fyrirtækjaskrá (Skatturinn):
 * Omega Kristniboðskirkja (trade name Sjónvarpsstöðin Omega), kt. 630890-1019,
 * Ármúla 15, 108 Reykjavík.
 *
 * NOTE for review: the retention periods stated below (18 mánuðir / 6 mánuðir)
 * are the recommended defaults from the plan and need Hawk's final confirmation
 * before this goes to production.
 */

export const metadata: Metadata = {
    title: 'Persónuverndarstefna',
    description:
        'Hvernig Omega meðhöndlar persónuupplýsingar: hvað við söfnum, af hverju, hve lengi, og hvaða réttindi þú átt.',
    alternates: { canonical: '/personuverndarstefna' },
    robots: { index: true, follow: true },
};

const UPDATED = '25. júní 2026';

export default function PrivacyPolicyPage() {
    return (
        <main style={{ minHeight: '100vh', backgroundColor: 'var(--mold)', color: 'var(--ljos)' }}>
            <Navbar />

            {/* ── Dark title band ─────────────────────────────────────── */}
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
                        Persónuvernd
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
                        Persónuverndarstefna
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
                        Traust er forsenda alls sem við gerum. Hér er á hreinu hvaða
                        upplýsingar við söfnum, af hverju, hve lengi við geymum þær og
                        hvaða réttindi þú átt. Engin tæknimál, engin smáaletur.
                    </p>
                </div>
            </header>

            {/* ── Cream reading body ──────────────────────────────────── */}
            <article
                style={{
                    background: 'var(--skra)',
                    color: 'var(--skra-djup)',
                    padding: 'clamp(3.5rem, 8vw, 6rem) var(--rail-padding)',
                }}
            >
                <div style={{ maxWidth: '44rem', margin: '0 auto' }}>
                    <p style={pLabel}>Síðast uppfært {UPDATED}</p>

                    <Section title="Ábyrgðaraðili">
                        <p style={pStyle}>
                            Ábyrgðaraðili þeirra persónuupplýsinga sem hér um ræðir er:
                        </p>
                        <p style={{ ...pStyle, fontWeight: 600 }}>
                            Omega Kristniboðskirkja (Sjónvarpsstöðin Omega)
                            <br />
                            Kennitala 630890-1019
                            <br />
                            Ármúla 15, 108 Reykjavík
                            <br />
                            Netfang:{' '}
                            <a href="mailto:omega@omega.is" style={aStyle}>
                                omega@omega.is
                            </a>
                        </p>
                        <p style={pStyle}>
                            Ef þú hefur spurningar um meðferð persónuupplýsinga hjá Omega
                            getur þú alltaf haft samband við okkur á netfangið hér að ofan.
                        </p>
                    </Section>

                    <Section title="Hvaða upplýsingum við söfnum">
                        <p style={pStyle}>Við söfnum aðeins því sem þarf til að þjóna þér:</p>
                        <ul style={ulStyle}>
                            <li style={liStyle}>
                                <strong>Netfang</strong> þegar þú skráir þig á póstlista
                                eða fréttabréf, til að senda þér það sem þú baðst um.
                            </li>
                            <li style={liStyle}>
                                <strong>Bænarefni</strong> sem þú sendir inn á Bænatorgi, og,
                                ef þú kýst, nafn og netfang svo við getum látið þig vita þegar
                                beðið hefur verið fyrir þér. Þú mátt alltaf senda bæn nafnlaust.
                            </li>
                            <li style={liStyle}>
                                <strong>Vitnisburði og skilaboð</strong> sem þú sendir okkur
                                af fúsum vilja.
                            </li>
                            <li style={liStyle}>
                                <strong>Nafnlausar heimsóknartölur</strong> um hvaða síður eru
                                skoðaðar. Þessar tölur eru ópersónugreinanlegar: við notum engar
                                vafrakökur og geymum hvorki IP-tölu þína né nafn.
                            </li>
                        </ul>
                    </Section>

                    <Section title="Viðkvæmar upplýsingar í bænum">
                        <p style={pStyle}>
                            Bænarefni getur eðli málsins samkvæmt sagt frá heilsu, fjölskyldu
                            eða trú. Slíkar upplýsingar njóta sérstakrar verndar samkvæmt lögum.
                            Þess vegna geymum við bænarefni tengt netfangi þínu aðeins ef þú
                            hefur veitt afdráttarlaust samþykki fyrir því þegar þú sendir bænina.
                            Þú getur dregið það samþykki til baka hvenær sem er.
                        </p>
                    </Section>

                    <Section title="Af hverju við vinnum upplýsingarnar">
                        <ul style={ulStyle}>
                            <li style={liStyle}>
                                <strong>Samþykki þitt</strong> þegar þú skráir þig á póstlista
                                eða biður okkur að hafa samband um bæn.
                            </li>
                            <li style={liStyle}>
                                <strong>Lögmætir hagsmunir</strong> af því að reka og bæta
                                vefinn, út frá nafnlausum heimsóknartölum.
                            </li>
                        </ul>
                        <p style={pStyle}>
                            Við seljum aldrei upplýsingar þínar og deilum þeim ekki í
                            markaðsskyni.
                        </p>
                    </Section>

                    <Section title="Vafrakökur">
                        <p style={pStyle}>
                            Omega notar engar vafrakökur til að rekja þig milli vefsvæða.
                            Heimsóknartölur okkar eru taldar án vafrakaka og án þess að geyma
                            IP-tölu. Beinar útsendingar og myndefni eru spilaðar í gegnum
                            þjónustuaðila sem geta sett tæknilegar kökur sem nauðsynlegar eru
                            fyrir spilun.
                        </p>
                    </Section>

                    <Section title="Hve lengi við geymum upplýsingar">
                        <p style={pStyle}>
                            Við geymum upplýsingar ekki lengur en þörf krefur.
                        </p>
                        <ul style={ulStyle}>
                            <li style={liStyle}>
                                Netfang á póstlista geymum við þar til þú afskráir þig.
                                Afskráning er alltaf í einum smelli neðst í hverjum pósti.
                            </li>
                            <li style={liStyle}>
                                Bænarefni er eytt eða gert ópersónugreinanlegt í síðasta lagi
                                18 mánuðum eftir innsendingu, eða 6 mánuðum eftir að bæn er
                                merkt svöruð, hvort sem fyrr kemur.
                            </li>
                        </ul>
                    </Section>

                    <Section title="Réttindi þín">
                        <p style={pStyle}>Þú átt rétt á að:</p>
                        <ul style={ulStyle}>
                            <li style={liStyle}>fá aðgang að þeim upplýsingum sem við geymum um þig,</li>
                            <li style={liStyle}>fá þær leiðréttar ef þær eru rangar,</li>
                            <li style={liStyle}>fá þeim eytt,</li>
                            <li style={liStyle}>takmarka eða andmæla vinnslu þeirra,</li>
                            <li style={liStyle}>fá afrit af þeim,</li>
                            <li style={liStyle}>
                                draga samþykki þitt til baka hvenær sem er, án þess að það hafi
                                áhrif á það sem áður var gert.
                            </li>
                        </ul>
                        <p style={pStyle}>
                            Til að nýta þessi réttindi hafðu samband við{' '}
                            <a href="mailto:omega@omega.is" style={aStyle}>
                                omega@omega.is
                            </a>
                            .
                        </p>
                    </Section>

                    <Section title="Þjónustuaðilar">
                        <p style={pStyle}>
                            Til að reka vefinn notum við trausta þjónustuaðila fyrir hýsingu,
                            gagnagrunn, tölvupóst og myndefni. Þeir vinna upplýsingar fyrir
                            okkar hönd og sumir kunna að vinna gögn utan Íslands, þá með
                            viðeigandi vörnum samkvæmt persónuverndarlögum.
                        </p>
                    </Section>

                    <Section title="Kvörtun">
                        <p style={pStyle}>
                            Ef þú telur að við förum ekki rétt með upplýsingar þínar getur þú
                            haft samband við okkur, og einnig beint kvörtun til Persónuverndar,{' '}
                            <a href="https://personuvernd.is" target="_blank" rel="noreferrer" style={aStyle}>
                                personuvernd.is
                            </a>
                            .
                        </p>
                    </Section>

                    <Section title="Breytingar">
                        <p style={pStyle}>
                            Við kunnum að uppfæra þessa stefnu. Nýjasta útgáfan er alltaf hér,
                            með dagsetningu efst. Þegar breytingar eru verulegar látum við vita.
                        </p>
                    </Section>
                </div>
            </article>

            <Footer />
        </main>
    );
}

/* ── Small presentational helpers (server-rendered) ─────────────── */

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

const ulStyle: React.CSSProperties = {
    margin: '0 0 1rem',
    paddingLeft: '1.25rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.6rem',
};

const liStyle: React.CSSProperties = {
    fontFamily: 'var(--font-serif)',
    fontSize: '1.075rem',
    lineHeight: 1.65,
    color: 'var(--skra-djup)',
};

const aStyle: React.CSSProperties = {
    color: 'var(--gull)',
    textDecoration: 'underline',
    textUnderlineOffset: '2px',
};
