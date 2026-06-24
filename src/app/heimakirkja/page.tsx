import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import type { CSSProperties, ReactNode } from "react";

/**
 * /heimakirkja — vision page for Heimakirkja, Omega's registered faith
 * organization (skráð trúfélag).
 *
 * The ask is tiny (redirect the sóknargjald the state already pays for
 * you, 0 kr. extra) so the page sells the vision, not a form. Dark↔cream
 * rhythm like the rest of the site; warm, institutional voice; no nav
 * link yet (route is live but unlinked).
 *
 * Registration happens at Þjóðskrá (skra.is). Sóknargjald 2026: 1.221 kr
 * per month per person 16+.
 */

export const metadata = {
    title: "Heimakirkja — Omega",
    description:
        "Kirkjan heim til þjóðarinnar. Láttu sóknargjaldið þitt, sem ríkið greiðir nú þegar, byggja kristna sjónvarpsstöð, þýðingar, bækur og öpp fyrir Ísland. 0 kr. aukakostnaður.",
};

const SKRA_URL = "https://www.skra.is/umsoknir/rafraen-skil/tru-og-lifsskodunarfelag/";

/* shared bits */
const railPad = "var(--rail-padding)";
const shell = { maxWidth: "72rem", margin: "0 auto" } as const;

function Kicker({ children, color = "var(--nordurljos)" }: { children: ReactNode; color?: string }) {
    return (
        <div style={{ fontFamily: "var(--font-sans)", fontSize: "11px", fontWeight: 700, letterSpacing: "0.22em", textTransform: "uppercase", color }}>
            {children}
        </div>
    );
}

function GoldRule() {
    return <div aria-hidden style={{ width: "52px", height: "1px", background: "var(--gull)" }} />;
}

export default function HeimakirkjaPage() {
    return (
        <main style={{ minHeight: "100vh", backgroundColor: "var(--nott)", color: "var(--ljos)" }}>
            <Navbar />

            <style>{`
              @keyframes hkDrift {0%{transform:translate3d(0,0,0) scale(1);opacity:.7}100%{transform:translate3d(0,-4%,0) scale(1.12);opacity:1}}
              @keyframes hkPulse {0%,100%{opacity:.25;transform:scaleY(.6)}50%{opacity:.9;transform:scaleY(1)}}
              .hk-aurora{animation:hkDrift 16s ease-in-out infinite alternate;will-change:transform,opacity}
              .hk-scroll{animation:hkPulse 2.6s ease-in-out infinite;transform-origin:top center}
              @media (prefers-reduced-motion: reduce){.hk-aurora,.hk-scroll{animation:none}}
            `}</style>

            {/* ─── 1. Hero (cinematic, full viewport) ─────────────────── */}
            <section
                style={{
                    position: "relative",
                    minHeight: "100svh",
                    display: "flex",
                    alignItems: "center",
                    overflow: "hidden",
                    background: "var(--nott)",
                    borderBottom: "1px solid var(--border)",
                }}
            >
                <div
                    aria-hidden
                    className="hk-aurora"
                    style={{
                        position: "absolute",
                        inset: "-12%",
                        background:
                            "radial-gradient(48% 38% at 26% 16%, rgba(126,148,196,0.13) 0%, transparent 60%), radial-gradient(55% 45% at 80% 24%, rgba(233,168,96,0.10) 0%, transparent 58%)",
                        pointerEvents: "none",
                    }}
                />
                <div
                    aria-hidden
                    style={{
                        position: "absolute",
                        inset: 0,
                        background:
                            "radial-gradient(125% 85% at 66% 120%, rgba(233,168,96,0.32) 0%, rgba(233,168,96,0.08) 34%, transparent 60%)",
                        pointerEvents: "none",
                    }}
                />
                <div
                    aria-hidden
                    style={{
                        position: "absolute",
                        inset: 0,
                        background: "linear-gradient(180deg, var(--nott) 0%, transparent 24%, transparent 70%, var(--nott) 100%)",
                        pointerEvents: "none",
                    }}
                />

                <div style={{ ...shell, position: "relative", width: "100%", padding: "clamp(150px, 20vh, 230px) " + railPad + " clamp(120px, 16vh, 180px)" }}>
                    <Kicker>Heimakirkja</Kicker>
                    <h1
                        style={{
                            margin: "30px 0 0",
                            fontFamily: "var(--font-serif)",
                            fontSize: "clamp(48px, 8.5vw, 116px)",
                            lineHeight: 0.98,
                            fontWeight: 400,
                            color: "var(--ljos)",
                            letterSpacing: "-0.02em",
                            textWrap: "balance",
                            maxWidth: "15ch",
                        }}
                    >
                        Kirkjan heim til þjóðarinnar.
                    </h1>
                    <p
                        style={{
                            margin: "36px 0 0",
                            fontFamily: "var(--font-serif)",
                            fontStyle: "italic",
                            fontSize: "clamp(20px, 2.2vw, 29px)",
                            lineHeight: 1.45,
                            color: "var(--moskva)",
                            maxWidth: "44rem",
                            textWrap: "pretty",
                        }}
                    >
                        Omega hefur borið fagnaðarerindið inn á íslensk heimili í meira en þrjá áratugi. Nú getum við byggt næsta kafla saman.
                    </p>

                    <div style={{ display: "flex", flexWrap: "wrap", gap: "16px", marginTop: "48px" }}>
                        <a href={SKRA_URL} target="_blank" rel="noopener noreferrer" style={primaryBtn}>
                            Skráðu þig (0 kr.)
                        </a>
                        <a href="#skraning" style={secondaryBtn}>
                            Sjá hvernig það virkar
                        </a>
                    </div>
                </div>

                <div
                    aria-hidden
                    style={{
                        position: "absolute",
                        bottom: "30px",
                        left: "50%",
                        transform: "translateX(-50%)",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: "12px",
                    }}
                >
                    <span style={{ fontFamily: "var(--font-sans)", fontSize: "10px", fontWeight: 700, letterSpacing: "0.3em", textTransform: "uppercase", color: "var(--steinn)" }}>
                        Sýnin
                    </span>
                    <span className="hk-scroll" style={{ width: "1px", height: "44px", background: "linear-gradient(var(--gull), transparent)", display: "block" }} />
                </div>
            </section>

            {/* ─── 2. The truth in one breath (cream) ──────────────────── */}
            <section style={{ background: "var(--skra)", color: "var(--skra-djup)" }}>
                <div style={{ ...shell, padding: "clamp(72px, 9vw, 112px) " + railPad }}>
                    <Kicker color="var(--mor)">Hið einfalda sannleikskorn</Kicker>
                    <h2
                        style={{
                            margin: "20px 0 0",
                            fontFamily: "var(--font-serif)",
                            fontSize: "clamp(28px, 3.6vw, 46px)",
                            lineHeight: 1.12,
                            fontWeight: 400,
                            color: "var(--skra-djup)",
                            letterSpacing: "-0.01em",
                            textWrap: "balance",
                            maxWidth: "20ch",
                        }}
                    >
                        Sóknargjaldið fer hvort eð er eitthvað. Þú færð að velja hvert.
                    </h2>
                    <p
                        style={{
                            margin: "24px 0 0",
                            fontFamily: "var(--font-serif)",
                            fontSize: "clamp(17px, 1.5vw, 21px)",
                            lineHeight: 1.6,
                            color: "var(--skra-mjuk)",
                            maxWidth: "44rem",
                        }}
                    >
                        Ríkið greiðir 1.221 kr. á mánuði fyrir hvern einstakling 16 ára og eldri til skráðs trúfélags. Þetta heita sóknargjöld og þau koma af sköttunum sem þú borgar hvort eð er. Þú getur valið að þau renni til Heimakirkju. Það kostar þig ekki eina krónu í viðbót.
                    </p>

                    <ul
                        style={{
                            listStyle: "none",
                            padding: 0,
                            margin: "48px 0 0",
                            display: "grid",
                            gap: "clamp(20px, 3vw, 32px)",
                            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                        }}
                    >
                        {[
                            ["0 kr.", "Enginn aukakostnaður. Sóknargjaldið er nú þegar tekið af sköttunum þínum."],
                            ["Þitt val", "Þú ræður hvert gjaldið rennur, og getur breytt því hvenær sem er."],
                            ["2 mínútur", "Skráningin fer fram hjá Þjóðskrá með rafrænum skilríkjum."],
                        ].map(([big, small]) => (
                            <li key={big}>
                                <div style={{ fontFamily: "var(--font-serif)", fontSize: "clamp(30px, 3vw, 40px)", fontWeight: 400, color: "var(--skra-djup)", letterSpacing: "-0.01em" }}>
                                    {big}
                                </div>
                                <div style={{ marginTop: "10px", fontFamily: "var(--font-sans)", fontSize: "15px", lineHeight: 1.55, color: "var(--skra-mjuk)" }}>
                                    {small}
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            </section>

            {/* ─── 3. The vision (dark) ────────────────────────────────── */}
            <section style={{ background: "var(--nott)", color: "var(--ljos)", borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)" }}>
                <div style={{ ...shell, padding: "clamp(80px, 10vw, 128px) " + railPad }}>
                    <Kicker>Sýnin</Kicker>
                    <h2
                        style={{
                            margin: "22px 0 0",
                            fontFamily: "var(--font-serif)",
                            fontSize: "clamp(30px, 4vw, 56px)",
                            lineHeight: 1.08,
                            fontWeight: 400,
                            color: "var(--ljos)",
                            letterSpacing: "-0.01em",
                            textWrap: "balance",
                            maxWidth: "16ch",
                        }}
                    >
                        Ef 3.000 manns segja já, verður það grunnur undir heila kristna fjölmiðlastöð.
                    </h2>

                    <p style={{ margin: "clamp(28px, 4vw, 44px) 0 0", maxWidth: "46rem", fontFamily: "var(--font-serif)", fontSize: "clamp(18px, 1.8vw, 23px)", lineHeight: 1.6, color: "var(--moskva)" }}>
                        Omega er fyrsta og eina kristna sjónvarpsstöðin á Íslandi. Heimakirkja er leiðin fyrir venjulegt fólk til að halda ljósinu logandi, koma fagnaðarerindinu inn á heimili landsins, þýða bækur, byggja öpp og skapa kristna miðlun fyrir næstu kynslóð.
                    </p>

                    <ul style={{ listStyle: "none", padding: 0, margin: "clamp(40px, 5vw, 60px) 0 0", maxWidth: "52rem", borderTop: "1px solid var(--border)" }}>
                        {["Útsendingar", "Íslenskt efni", "Þýddar bækur", "Öpp fyrir fjölskyldur", "Bæn", "Fræðsla", "Von á skjánum, allan sólarhringinn"].map((item) => (
                            <li key={item} style={{ borderBottom: "1px solid var(--border)", padding: "16px 0", display: "flex", alignItems: "baseline", gap: "18px" }}>
                                <span aria-hidden style={{ width: "6px", height: "6px", borderRadius: "50%", background: "var(--gull)", flex: "0 0 auto", transform: "translateY(-3px)" }} />
                                <span style={{ fontFamily: "var(--font-serif)", fontSize: "clamp(20px, 2.2vw, 28px)", fontWeight: 400, color: "var(--ljos)", letterSpacing: "-0.005em" }}>{item}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </section>

            {/* ─── 4. What you get — pillars (cream) ───────────────────── */}
            <section style={{ background: "var(--skra)", color: "var(--skra-djup)" }}>
                <div style={{ ...shell, padding: "clamp(72px, 9vw, 112px) " + railPad }}>
                    <header style={{ maxWidth: "44rem", marginBottom: "clamp(40px, 5vw, 60px)" }}>
                        <Kicker color="var(--mor)">Það sem fylgir</Kicker>
                        <h2 style={{ margin: "18px 0 0", fontFamily: "var(--font-serif)", fontSize: "clamp(28px, 3.4vw, 44px)", lineHeight: 1.12, fontWeight: 400, color: "var(--skra-djup)", letterSpacing: "-0.01em", textWrap: "balance" }}>
                            Þetta er ekki bara skráning. Þú gengur í samfélag.
                        </h2>
                    </header>

                    <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gap: "clamp(24px, 3vw, 36px)", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))" }}>
                        {[
                            ["Bókaklúbbur", "Við lesum saman. Uppbyggjandi bækur sem styrkja trúna, ný hver mánuður, með umræðu og leiðsögn."],
                            ["Þýdda bókasafnið", "Aðgangur að sívaxandi safni kristinna bóka, þýddra á íslensku, í appinu okkar. Lestu hvar sem þú ert."],
                            ["Viðburðir", "Samkomur, fyrirlestrar og samvera. Á netinu og í eigin persónu, fyrir alla meðlimi."],
                            ["Samfélag", "Þú tilheyrir. Bæn, hvatning og heimakirkja á skjánum allan ársins hring."],
                        ].map(([title, desc]) => (
                            <li key={title} style={{ background: "var(--skra-warm)", border: "1px solid rgba(63,47,35,0.12)", borderRadius: "var(--radius-md)", padding: "clamp(28px, 3vw, 36px)" }}>
                                <div aria-hidden style={{ width: "32px", height: "2px", background: "var(--gull)", marginBottom: "20px" }} />
                                <h3 style={{ margin: 0, fontFamily: "var(--font-serif)", fontSize: "clamp(22px, 2.2vw, 28px)", fontWeight: 400, color: "var(--skra-djup)", letterSpacing: "-0.005em" }}>
                                    {title}
                                </h3>
                                <p style={{ margin: "12px 0 0", fontFamily: "var(--font-sans)", fontSize: "15.5px", lineHeight: 1.6, color: "var(--skra-mjuk)" }}>
                                    {desc}
                                </p>
                            </li>
                        ))}
                    </ul>
                </div>
            </section>

            {/* ─── 5. What your membership builds (dark) ───────────────── */}
            <section style={{ background: "var(--nott)", color: "var(--ljos)", borderTop: "1px solid var(--border)" }}>
                <div style={{ ...shell, padding: "clamp(72px, 9vw, 112px) " + railPad }}>
                    <header style={{ maxWidth: "44rem", marginBottom: "clamp(36px, 4vw, 52px)" }}>
                        <Kicker>Ráðsmennska</Kicker>
                        <h2 style={{ margin: "18px 0 0", fontFamily: "var(--font-serif)", fontSize: "clamp(28px, 3.4vw, 44px)", lineHeight: 1.12, fontWeight: 400, color: "var(--ljos)", letterSpacing: "-0.01em", textWrap: "balance" }}>
                            Hver skráning verður að einhverju áþreifanlegu.
                        </h2>
                    </header>

                    <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gap: "1px", background: "var(--border)", border: "1px solid var(--border)", borderRadius: "var(--radius-md)", overflow: "hidden" }}>
                        {[
                            ["Útsending", "Dreifing í kapalkerfinu svo efnið nái inn á heimili um allt land."],
                            ["Húsnæði og rekstur", "Þakið yfir starfinu og daglegur rekstur stöðvarinnar."],
                            ["Starfsfólk", "Fólkið sem framleiðir, þýðir og heldur útsendingunni gangandi."],
                            ["Stúdíó og búnaður", "Myndavélar, hljóð og tækni sem skila vönduðu efni."],
                            ["Þýðingar og nýtt efni", "Íslenskar þýðingar og nýtt efni, viku eftir viku."],
                        ].map(([title, desc]) => (
                            <li key={title} style={{ background: "var(--nott)", padding: "clamp(22px, 2.4vw, 30px) clamp(24px, 3vw, 36px)", display: "grid", gridTemplateColumns: "minmax(0, 16rem) 1fr", gap: "clamp(16px, 3vw, 40px)", alignItems: "baseline" }} className="heimakirkja-build-row">
                                <div style={{ fontFamily: "var(--font-serif)", fontSize: "clamp(19px, 1.8vw, 24px)", fontWeight: 400, color: "var(--ljos)" }}>{title}</div>
                                <div style={{ fontFamily: "var(--font-sans)", fontSize: "15px", lineHeight: 1.55, color: "var(--moskva)" }}>{desc}</div>
                            </li>
                        ))}
                    </ul>
                </div>
            </section>

            {/* ─── 5b. The future (dark, dramatic) ────────────────────── */}
            <section style={{ position: "relative", background: "var(--nott)", color: "var(--ljos)", overflow: "hidden", borderTop: "1px solid var(--border)" }}>
                <div aria-hidden className="hk-aurora" style={{ position: "absolute", inset: "-10%", background: "radial-gradient(80% 60% at 50% -10%, rgba(233,168,96,0.12) 0%, transparent 55%)", pointerEvents: "none" }} />
                <div style={{ maxWidth: "60rem", margin: "0 auto", position: "relative", padding: "clamp(100px, 13vw, 168px) " + railPad, textAlign: "center" }}>
                    <Kicker>Framtíðin</Kicker>
                    <h2 style={{ margin: "22px 0 0", fontFamily: "var(--font-serif)", fontSize: "clamp(34px, 5.2vw, 68px)", lineHeight: 1.05, fontWeight: 400, color: "var(--ljos)", letterSpacing: "-0.015em", textWrap: "balance" }}>
                        Þetta er rétt að byrja.
                    </h2>
                    <p style={{ margin: "30px auto 0", maxWidth: "42rem", fontFamily: "var(--font-serif)", fontSize: "clamp(18px, 1.9vw, 24px)", lineHeight: 1.6, color: "var(--moskva)" }}>
                        Ímyndaðu þér íslenskt kristið efni alla daga. Þýddar bækur og öpp fyrir hverja fjölskyldu. Barnaefni sem nær til næstu kynslóðar. Viðburði um allt land. Von á hverjum skjá, inn á hvert heimili. Ekki draumur fyrir fáa, heldur hreyfing heillar þjóðar.
                    </p>
                    <p style={{ margin: "34px auto 0", maxWidth: "36rem", fontFamily: "var(--font-serif)", fontStyle: "italic", fontSize: "clamp(20px, 2.2vw, 28px)", lineHeight: 1.35, color: "var(--gull)" }}>
                        Og það byrjar með einu já.
                    </p>
                </div>
            </section>

            {/* ─── 6. A word from the heart (cream) ────────────────────── */}
            <section style={{ background: "var(--skra-warm)", color: "var(--skra-djup)" }}>
                <div style={{ maxWidth: "44rem", margin: "0 auto", padding: "clamp(80px, 10vw, 128px) " + railPad, textAlign: "center" }}>
                    <Kicker color="var(--mor)">Frá hjartanu</Kicker>
                    <p style={{ margin: "28px 0 0", fontFamily: "var(--font-serif)", fontStyle: "italic", fontSize: "clamp(22px, 2.6vw, 32px)", lineHeight: 1.45, color: "var(--skra-djup)", letterSpacing: "-0.005em", textWrap: "pretty" }}>
                        „Við trúum að Guð sé ekki búinn með Ísland. Heimakirkja er leið til að standa saman, halda ljósinu logandi og bera vonina inn á hvert heimili. Þú þarft ekki að gefa neitt aukalega. Þú þarft bara að velja.“
                    </p>
                    <div style={{ display: "flex", justifyContent: "center", margin: "32px 0 0" }}>
                        <GoldRule />
                    </div>
                    <div style={{ marginTop: "18px", fontFamily: "var(--font-sans)", fontSize: "12px", fontWeight: 600, letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--skra-mjuk)" }}>
                        Omega Stöðin
                    </div>
                </div>
            </section>

            {/* ─── 7. How to join — the stepper (dark) ─────────────────── */}
            <section id="skraning" style={{ background: "var(--nott)", color: "var(--ljos)", borderTop: "1px solid var(--border)", scrollMarginTop: "84px" }}>
                <div style={{ ...shell, padding: "clamp(80px, 10vw, 128px) " + railPad }}>
                    <header style={{ maxWidth: "44rem", marginBottom: "clamp(44px, 5vw, 64px)" }}>
                        <Kicker>Skráning</Kicker>
                        <h2 style={{ margin: "18px 0 0", fontFamily: "var(--font-serif)", fontSize: "clamp(28px, 3.6vw, 48px)", lineHeight: 1.1, fontWeight: 400, color: "var(--ljos)", letterSpacing: "-0.01em", textWrap: "balance" }}>
                            Þrjár mínútur og þú ert komin/n í hús.
                        </h2>
                    </header>

                    <ol style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gap: "clamp(28px, 3vw, 44px)", gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))" }}>
                        {[
                            ["01", "Opnaðu Þjóðskrá", "Smelltu á hnappinn og opnaðu skráningarsíðu Þjóðskrár (skra.is)."],
                            ["02", "Skráðu þig inn", "Auðkenndu þig með rafrænum skilríkjum í símanum þínum."],
                            ["03", "Veldu Heimakirkju", "Finndu og veldu „Heimakirkja“ í listanum yfir trú- og lífsskoðunarfélög."],
                            ["04", "Staðfestu", "Staðfestu valið. Breytingin tekur gildi samstundis."],
                        ].map(([num, title, desc]) => (
                            <li key={num}>
                                <div style={{ fontFamily: "var(--font-serif)", fontSize: "clamp(34px, 3.4vw, 46px)", fontWeight: 400, color: "var(--gull)", letterSpacing: "-0.01em", fontFeatureSettings: '"lnum","tnum"' }}>{num}</div>
                                <h3 style={{ margin: "12px 0 0", fontFamily: "var(--font-serif)", fontSize: "clamp(20px, 2vw, 26px)", fontWeight: 400, color: "var(--ljos)" }}>{title}</h3>
                                <p style={{ margin: "10px 0 0", fontFamily: "var(--font-sans)", fontSize: "15px", lineHeight: 1.6, color: "var(--moskva)" }}>{desc}</p>
                            </li>
                        ))}
                    </ol>

                    <div style={{ marginTop: "clamp(44px, 5vw, 64px)", display: "flex", flexWrap: "wrap", gap: "16px", alignItems: "center" }}>
                        <a href={SKRA_URL} target="_blank" rel="noopener noreferrer" style={primaryBtn}>
                            Opna Þjóðskrá
                        </a>
                        <span style={{ fontFamily: "var(--font-sans)", fontSize: "13px", letterSpacing: "0.14em", textTransform: "uppercase", fontWeight: 600, color: "var(--steinn)" }}>
                            0 kr. aukakostnaður · um 2 mínútur
                        </span>
                    </div>

                    <p style={{ margin: "32px 0 0", maxWidth: "44rem", fontFamily: "var(--font-sans)", fontSize: "13.5px", lineHeight: 1.65, color: "var(--steinn)" }}>
                        Athugið: hver einstaklingur getur aðeins tilheyrt einu skráðu trú- eða lífsskoðunarfélagi. Breytingin er gjaldfrjáls og tekur gildi samdægurs. Skráning í Heimakirkju færir sóknargjaldið þitt þangað frá fyrri skráningu, og þú getur breytt því aftur hvenær sem er. Börn 15 ára og yngri breytast ekki sjálfkrafa; til þess þarf sérstakt eyðublað fyrir börn hjá Þjóðskrá.
                    </p>
                </div>
            </section>

            {/* ─── 8. FAQ (cream) ──────────────────────────────────────── */}
            <section style={{ background: "var(--skra)", color: "var(--skra-djup)" }}>
                <div style={{ maxWidth: "48rem", margin: "0 auto", padding: "clamp(72px, 9vw, 112px) " + railPad }}>
                    <Kicker color="var(--mor)">Spurt og svarað</Kicker>
                    <h2 style={{ margin: "18px 0 clamp(36px, 4vw, 52px)", fontFamily: "var(--font-serif)", fontSize: "clamp(28px, 3.4vw, 42px)", lineHeight: 1.12, fontWeight: 400, color: "var(--skra-djup)", letterSpacing: "-0.01em" }}>
                        Algengar spurningar
                    </h2>

                    <div>
                        {[
                            ["Kostar þetta mig eitthvað?", "Nei. Sóknargjöldin koma af sköttum sem þú borgar nú þegar. Það bætist engin króna við hjá þér."],
                            ["Hvað með börnin mín?", "Skráning barns breytist ekki sjálfkrafa þegar þú breytir þinni. Fyrir börn 15 ára og yngri þarf að fylla út sérstakt eyðublað hjá Þjóðskrá."],
                            ["Get ég breytt þessu aftur?", "Já, hvenær sem er á skra.is. Breytingin tekur gildi samstundis."],
                            ["Hvað verður um núverandi skráningu mína?", "Hver getur aðeins tilheyrt einu félagi, svo skráning í Heimakirkju kemur í stað fyrri skráningar, til dæmis í þjóðkirkjunni."],
                            ["Hvert fer stuðningurinn?", "Í rekstur Omega: útsendingu, húsnæði, starfsfólk, búnað og nýtt efni á íslensku."],
                            ["Hvað um persónuvernd?", "Skráningin sjálf fer fram hjá Þjóðskrá. Við fáum ekki aðgang að persónulegum gögnum þínum umfram það sem nauðsynlegt er."],
                        ].map(([q, a]) => (
                            <details key={q} style={{ borderTop: "1px solid rgba(63,47,35,0.14)", padding: "20px 0" }}>
                                <summary style={{ cursor: "pointer", listStyle: "none", fontFamily: "var(--font-serif)", fontSize: "clamp(18px, 1.7vw, 22px)", fontWeight: 400, color: "var(--skra-djup)" }}>
                                    {q}
                                </summary>
                                <p style={{ margin: "14px 0 0", fontFamily: "var(--font-sans)", fontSize: "16px", lineHeight: 1.6, color: "var(--skra-mjuk)" }}>
                                    {a}
                                </p>
                            </details>
                        ))}
                    </div>
                </div>
            </section>

            {/* ─── 9. Final CTA (cinematic crescendo) ─────────────────── */}
            <section style={{ position: "relative", background: "var(--nott)", color: "var(--ljos)", overflow: "hidden", borderTop: "1px solid var(--border)" }}>
                <div aria-hidden className="hk-aurora" style={{ position: "absolute", inset: "-12%", background: "radial-gradient(60% 55% at 50% 125%, rgba(233,168,96,0.30) 0%, rgba(233,168,96,0.07) 38%, transparent 62%)", pointerEvents: "none" }} />
                <div style={{ maxWidth: "48rem", margin: "0 auto", position: "relative", padding: "clamp(120px, 16vh, 200px) " + railPad, textAlign: "center" }}>
                    <h2 style={{ margin: 0, fontFamily: "var(--font-serif)", fontSize: "clamp(40px, 7vw, 92px)", lineHeight: 1.0, fontWeight: 400, color: "var(--ljos)", letterSpacing: "-0.02em", textWrap: "balance" }}>
                        Vertu hluti af þessu.
                    </h2>
                    <p style={{ margin: "28px 0 0", fontFamily: "var(--font-serif)", fontStyle: "italic", fontSize: "clamp(20px, 2.1vw, 28px)", lineHeight: 1.45, color: "var(--moskva)" }}>
                        Það kostar þig ekkert. En það getur breytt heilli þjóð.
                    </p>
                    <div style={{ display: "flex", justifyContent: "center", marginTop: "48px" }}>
                        <a href={SKRA_URL} target="_blank" rel="noopener noreferrer" style={primaryBtn}>
                            Skráðu þig (0 kr.)
                        </a>
                    </div>
                </div>
            </section>

            <Footer />
        </main>
    );
}

/* ─── button styles ───────────────────────────────────────────────── */

const primaryBtn: CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    gap: "10px",
    padding: "16px 32px",
    background: "var(--gull)",
    color: "var(--nott)",
    border: "1px solid var(--gull)",
    borderRadius: "var(--radius-xs)",
    fontFamily: "var(--font-sans)",
    fontSize: "14px",
    fontWeight: 700,
    letterSpacing: "0.06em",
    textDecoration: "none",
};

const secondaryBtn: CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    gap: "10px",
    padding: "16px 32px",
    background: "transparent",
    color: "var(--ljos)",
    border: "1px solid var(--border)",
    borderRadius: "var(--radius-xs)",
    fontFamily: "var(--font-sans)",
    fontSize: "14px",
    fontWeight: 600,
    letterSpacing: "0.06em",
    textDecoration: "none",
};
