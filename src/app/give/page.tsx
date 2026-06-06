import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import StyrkjaHero from "@/components/styrkja/StyrkjaHero";
import StyrkjaSowing from "@/components/styrkja/StyrkjaSowing";
import StyrkjaWaysToGive from "@/components/styrkja/StyrkjaWaysToGive";
import StyrkjaScriptureFooter from "@/components/styrkja/StyrkjaScriptureFooter";

/**
 * /give — "Styrkja"
 *
 *   1. Hero            — editorial kicker + headline + italic sub
 *   2. Sowing          — theological frame (Sáðkorn · Sálir · Eilífð)
 *   3. WaysToGive      — the TWO real ways to give: Aur (@Omega) and
 *                        bank transfer (reikn. 0113-26-25707,
 *                        kt. 630890-1019, Sjónvarpsstöðin Omega).
 *   4. ScriptureFooter — single italic verse, 2. Kor 9:7.
 *
 * Honest by design: no online card processing, no recurring sign-up,
 * no invented allocation percentages or suggested-amount tiers — those
 * were removed. Giving is Aur or millifærsla, marked with the donor's name.
 */

export default function GivePage() {
    return (
        <main style={{ minHeight: '100vh', backgroundColor: 'var(--mold)', color: 'var(--ljos)' }}>
            <Navbar />
            <StyrkjaHero />
            <StyrkjaSowing />
            <StyrkjaWaysToGive />
            <StyrkjaScriptureFooter />
            <Footer />
        </main>
    );
}
