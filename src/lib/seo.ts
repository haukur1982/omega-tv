/**
 * Central SEO config + JSON-LD builders for Omega.
 *
 * The Organization entity is the heart of it: it tells Google that Omega IS
 * Iceland's Christian television station (since 1992), under all the names and in
 * both languages people search. Everything else (video, article, breadcrumb)
 * points back to this entity by @id so Google builds one coherent picture.
 */

export const SITE = {
    url: 'https://omega.is',
    name: 'Omega',
    legalName: 'Omega Stöðin',
    /** Names + descriptors people actually search, Icelandic and English. */
    alternateNames: [
        'Omega Stöðin',
        'Omega TV',
        'Omega Sjónvarp',
        'Iceland Christian Television',
        'Christian Television Iceland',
        'Kristin sjónvarpsstöð',
    ],
    foundingYear: '1992',
    descriptionIs:
        'Omega er kristin sjónvarpsstöð á Íslandi frá árinu 1992. Bein útsending allan sólarhringinn, þáttasafn, prédikanir, fyrirbæn, fræðsla og fagnaðarerindið um Jesú Krist, allt á íslensku.',
    descriptionEn:
        "Omega is Iceland's Christian television station, broadcasting since 1992: live TV, sermons, prayer, Bible teaching and the gospel of Jesus Christ in Icelandic.",
    logo: 'https://omega.is/omega-logo.png',
    ogImage: 'https://omega.is/og-default.png',
    /** Official Omega profiles. Fill once confirmed — wrong URLs hurt, so empty until then. */
    sameAs: [] as string[],
    keywords: [
        'Iceland Christian Television', 'Christian TV Iceland', 'Omega', 'Omega Stöðin',
        'kristin sjónvarpsstöð', 'kristið sjónvarp', 'kristin trú', 'fagnaðarerindið',
        'Jesús Kristur', 'bæn', 'fyrirbæn', 'frelsun', 'prédikanir', 'guðsþjónusta',
        'bein útsending', 'Christian gospel', 'prayer', 'salvation', 'Jesus Christ',
    ],
} as const;

/** Escape "<" so a JSON-LD payload can't break out of the <script> tag. */
export function safeJsonLd(data: object): string {
    return JSON.stringify(data).replace(/</g, '\\u003c');
}

export function organizationJsonLd() {
    return {
        '@context': 'https://schema.org',
        '@type': ['Organization', 'TelevisionStation'],
        '@id': `${SITE.url}/#organization`,
        name: SITE.legalName,
        alternateName: SITE.alternateNames as unknown as string[],
        url: SITE.url,
        logo: { '@type': 'ImageObject', url: SITE.logo },
        image: SITE.ogImage,
        description: `${SITE.descriptionIs} ${SITE.descriptionEn}`,
        slogan: 'Kristin sjónvarpsstöð á Íslandi',
        foundingDate: SITE.foundingYear,
        areaServed: { '@type': 'Country', name: 'Iceland' },
        inLanguage: 'is',
        knowsLanguage: ['is', 'en'],
        ...(SITE.sameAs.length ? { sameAs: SITE.sameAs } : {}),
    };
}

export function websiteJsonLd() {
    return {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        '@id': `${SITE.url}/#website`,
        url: SITE.url,
        name: SITE.legalName,
        alternateName: 'Omega',
        description: SITE.descriptionIs,
        inLanguage: 'is',
        publisher: { '@id': `${SITE.url}/#organization` },
    };
}

export function videoJsonLd(v: {
    name: string;
    description: string;
    thumbnailUrl?: string | null;
    uploadDate?: string | null;
    embedUrl?: string | null;
    durationSec?: number | null;
    url: string;
}) {
    return {
        '@context': 'https://schema.org',
        '@type': 'VideoObject',
        name: v.name,
        description: v.description,
        ...(v.thumbnailUrl ? { thumbnailUrl: [v.thumbnailUrl] } : {}),
        ...(v.uploadDate ? { uploadDate: v.uploadDate } : {}),
        ...(v.durationSec ? { duration: `PT${Math.round(v.durationSec)}S` } : {}),
        ...(v.embedUrl ? { embedUrl: v.embedUrl } : {}),
        url: v.url,
        inLanguage: 'is',
        isFamilyFriendly: true,
        publisher: { '@id': `${SITE.url}/#organization` },
    };
}

export function articleJsonLd(a: {
    title: string;
    description?: string | null;
    image?: string | null;
    datePublished?: string | null;
    dateModified?: string | null;
    authorName?: string | null;
    url: string;
}) {
    return {
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: a.title,
        ...(a.description ? { description: a.description } : {}),
        ...(a.image ? { image: [a.image] } : {}),
        ...(a.datePublished ? { datePublished: a.datePublished } : {}),
        dateModified: a.dateModified || a.datePublished || undefined,
        inLanguage: 'is',
        author: a.authorName
            ? { '@type': 'Person', name: a.authorName }
            : { '@id': `${SITE.url}/#organization`, '@type': 'Organization', name: SITE.legalName },
        publisher: { '@id': `${SITE.url}/#organization` },
        mainEntityOfPage: a.url,
        url: a.url,
    };
}

export function breadcrumbJsonLd(items: { name: string; url: string }[]) {
    return {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: items.map((it, i) => ({
            '@type': 'ListItem',
            position: i + 1,
            name: it.name,
            item: it.url,
        })),
    };
}
