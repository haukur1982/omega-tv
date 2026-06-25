import { HTML, CSS } from "./_design";
import { HkNavScroll } from "./HkNavScroll";

/**
 * /heimakirkja — vision page for Heimakirkja, Omega's registered faith
 * organization (skráð trúfélag).
 *
 * The ask is tiny (redirect the sóknargjald the state already pays for you,
 * 0 kr. extra) so the page sells the vision, not a form. This is a faithful
 * port of the Heimakirkja Claude Design bundle: it ships its OWN nav, sections
 * and footer, so the page renders without the global Navbar/Footer. Markup and
 * page-specific CSS live in ./_design.
 *
 * Route is live but deliberately unlinked and kept out of search until launch.
 * Real hero/section media still to come (the image-slots fall back to a warm
 * dawn glow until then). Registration: Þjóðskrá (skra.is).
 */

export const metadata = {
    title: "Heimakirkja — Omega",
    description:
        "Kirkjan heim til þjóðarinnar. Láttu sóknargjaldið þitt, sem ríkið greiðir nú þegar, byggja kristna sjónvarpsstöð, þýðingar, bækur og öpp fyrir Ísland. 0 kr. aukakostnaður.",
    robots: { index: false, follow: false },
};

export default function HeimakirkjaPage() {
    return (
        <>
            <style>{CSS}</style>
            <div dangerouslySetInnerHTML={{ __html: HTML }} />
            <HkNavScroll />
        </>
    );
}
