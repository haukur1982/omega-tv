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
 * Payment backend note: there is no online payment processor
 * wired in today. The submit button transitions to a visual
 * thank-you state but does NOT charge anything. The honest copy
 * on the thank-you state reads: "Við höfum samband til að ganga
 * frá greiðslunni" (we'll contact you to complete the gift).
 *
 * Two viable next steps:
 *   • email admin team the donor's intent on submit (cheapest)
 *   • integrate Valitor/SaltPay or Stripe (merchant account work)
 *
 * Bank transfer (0113-26-25707 / 630890-1019) stays live on the
 * page today, so people who want to give without waiting for us
 * to call them back can do so directly.
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
