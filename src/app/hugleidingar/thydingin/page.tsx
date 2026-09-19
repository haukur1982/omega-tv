import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { DEVOTIONAL_ATTRIBUTION } from '@/lib/devotional-db';

/**
 * Um þýðinguna — why the verses read differently.
 *
 * An Icelandic believer knows their Bible. When a devotional quotes a verse and
 * the wording is not the one they have heard since childhood, the honest thing
 * is to explain, in one page, before they wonder. Published ahead of the
 * devotionals themselves so the attribution line at the foot of every piece has
 * somewhere to point.
 *
 * Cream reading register, the same one the reading room uses.
 */

export const metadata = {
    title: 'Um þýðinguna',
    description:
        'Hvers vegna ritningarstaðir í hugleiðingunum eru stundum með öðru orðalagi en lesendur þekkja úr íslensku biblíunni.',
};

export default function ThydinginPage() {
    return (
        <main style={{ minHeight: '100vh', background: 'var(--mold)' }}>
            <style>{CSS}</style>
            <Navbar />

            <article className="thyd">
                <header>
                    <p className="kicker">Hugleiðingar</p>
                    <h1>Um þýðinguna</h1>
                    <p className="lead">
                        Sumir ritningarstaðir í hugleiðingunum eru með öðru orðalagi en
                        þú þekkir úr biblíunni þinni. Það er ekki mistök. Hér er ástæðan.
                    </p>
                </header>

                <h2>Hvers vegna orðalagið er annað</h2>
                <p>
                    Wade E. Taylor skrifaði þessar hugleiðingar á ensku og vitnaði
                    oft í tilteknar enskar biblíuþýðingar. Það var ekki tilviljun.
                    Kennslan hvílir stundum á einu orði eins og það stendur í þeirri
                    þýðingu sem hann valdi. Ef við skiptum því orði út fyrir annað
                    fellur röksemdafærslan um sjálfa sig.
                </p>
                <p>
                    Þess vegna eru ritningarstaðirnir hér þýddir fyrir þessa útgáfu.
                    Þeir eru ekki teknir upp úr útgefinni íslenskri biblíuþýðingu.
                </p>

                <h2>Hvaðan textinn kemur</h2>
                <p>
                    Flestir ritningarstaðir eru þýddir beint úr frummálunum, hebresku
                    og grísku. Gríski grunntextinn er KJTR frá Center for New Testament
                    Restoration, notaður samkvæmt CC BY 4.0. Hebreski grunntextinn er
                    Westminster Leningrad Codex.
                </p>
                <p>
                    Sums staðar, einkum þar sem tilvitnun er ofin inn í setningu,
                    byggir textinn á þeirri ensku þýðingu sem höfundurinn vitnar í.
                    Þar sem það á við er þess getið við tilvitnunina sjálfa.
                </p>

                <h2>Biblían þín stendur</h2>
                <p>
                    Þetta kemur ekki í stað biblíunnar þinnar og er ekki ný
                    biblíuþýðing. Þetta er þýðing á bók, og ritningarstaðirnir í henni
                    eru þýddir eins og höfundurinn lagði þá fram. Þegar þú vilt lesa
                    ritninguna sjálfa, lestu hana í þinni biblíu.
                </p>

                <h2>Yfirlestur</h2>
                <p>
                    Hver hugleiðing er lesin yfir af íslenskum lesara áður en hún
                    birtist. Finnir þú eitthvað sem stenst ekki, láttu okkur vita.
                    Við lagfærum það.
                </p>

                <footer className="attr">
                    <p>{DEVOTIONAL_ATTRIBUTION.scripture}</p>
                    <p>{DEVOTIONAL_ATTRIBUTION.sources}</p>
                    <p>{DEVOTIONAL_ATTRIBUTION.author}</p>
                </footer>
            </article>

            <Footer />
        </main>
    );
}

const CSS = `
/* The sheet starts BELOW the fixed navbar. The bar carries light text for the
   dark site, and letting cream run up behind it put --moskva links on vellum at
   about 1.4:1 — measured, unreadable. Dark ground behind the bar, vellum sheet
   under it: the reading-room pattern. */
.thyd{max-width:44rem;margin:96px auto 0;padding:clamp(56px,7vw,80px) var(--rail-padding) clamp(64px,8vw,96px);
    background:var(--skra);color:var(--skra-djup);border-radius:4px}
.thyd .kicker{margin:0 0 18px;font:700 11px/1 var(--font-sans);letter-spacing:.22em;
    text-transform:uppercase;color:#8A5A22}
.thyd h1{margin:0;font:300 clamp(38px,5vw,60px)/1.04 var(--font-display);letter-spacing:-.012em}
.thyd .lead{margin:26px 0 0;font:400 clamp(18px,1.6vw,21px)/1.6 var(--font-serif);color:var(--skra-mjuk)}
.thyd h2{margin:48px 0 14px;font:400 clamp(23px,2.2vw,28px)/1.2 var(--font-display)}
.thyd p{margin:0 0 16px;font:400 clamp(17px,1.4vw,18.5px)/1.72 var(--font-serif)}
.thyd .attr{margin-top:56px;padding-top:26px;border-top:1px solid rgba(27,24,20,.14)}
.thyd .attr p{margin:0 0 10px;font:400 13.5px/1.6 var(--font-sans);color:var(--skra-mjuk)}
@media(max-width:640px){.thyd{margin-top:80px;border-radius:0}}
`;
