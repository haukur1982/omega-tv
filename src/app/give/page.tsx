import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import StyrkjaHero from "@/components/styrkja/StyrkjaHero";
import StyrkjaSowing from "@/components/styrkja/StyrkjaSowing";
import StyrkjaDonationClient from "@/components/styrkja/StyrkjaDonationClient";
import StyrkjaOtherWays from "@/components/styrkja/StyrkjaOtherWays";
import StyrkjaScriptureFooter from "@/components/styrkja/StyrkjaScriptureFooter";

/**
 * /give — "Styrkja"
 *
 * Redesigned per the Styrkja prototype in the omega-stodin-design
 * skill. Moves from impact-marketing page (photo hero, impact
 * stats, impact areas, bank info) to a unified donation flow:
 *
 *   1. Hero           — editorial kicker + headline + italic sub
 *   2. Sowing         — three-column theological frame (a breath
 *                       before the ask). Sáðkorn · Sálir · Eilífð.
 *   3. DonationCard   — cadence + tier + custom amount + form +
 *                       allocation sidebar (client component).
 *                       Submit flips to an honest thank-you state.
 *   4. OtherWays      — Arfleifð / Fyrirtæki / Tækjabúnaður +
 *                       bank transfer details preserved (not a
 *                       dead end for people who prefer millifærsla).
 *   5. ScriptureFooter — single italic verse, 2. Kor 9:7.
 *
 * Giving is by bank transfer (millifærsla) only — Omega has no
 * online card processor by design. The donation card helps the
 * donor choose an amount and see allocation; the thank-you state
 * shows the exact transfer details (reikningur 0113-26-25707,
 * kt. 630890-1019, marked with the donor's name). A processor may
 * be added later but is not required.
 */

export default function GivePage() {
    return (
        <main style={{ minHeight: '100vh', backgroundColor: 'var(--mold)', color: 'var(--ljos)' }}>
            <Navbar />
            <StyrkjaHero />
            <StyrkjaSowing />
            <StyrkjaDonationClient />
            <StyrkjaOtherWays />
            <StyrkjaScriptureFooter />
            <Footer />
        </main>
    );
}
