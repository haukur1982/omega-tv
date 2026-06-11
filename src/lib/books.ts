/**
 * Books published by Omega (Azotus imprint) — the /baekur section.
 *
 * Deliberately a typed local list, not a DB table: books arrive a few
 * per year through the print pipeline, each one hand-placed. When the
 * shelf grows past a handful, graduate this to Supabase + admin.
 */

export interface Book {
    slug: string;
    title: string;
    author: string;
    coauthor?: string;
    /** kicker line above the title, e.g. the bestseller credential */
    badge?: string;
    tagline: string;
    /** paragraphs — the back-cover voice */
    description: string[];
    /** a borrowed commendation, shown as an italic pull quote */
    quote?: { text: string; source: string };
    authorBio?: string;
    cover: string;          // public path, 2:3-ish portrait
    backdrop?: string;      // blurred ambient for the stage
    isbn?: string;
    year: string;
    /** how to get it */
    available: boolean;
}

export const BOOKS: Book[] = [
    {
        slug: '90-minutur-a-himnum',
        title: '90 mínútur á himnum',
        author: 'Don Piper',
        coauthor: 'ásamt Cecil Murphey',
        badge: 'Metsölubók New York Times · yfir 5 milljónir eintaka seldar',
        tagline: 'Sönn saga um dauða og líf — nú á íslensku.',
        description: [
            'Á þeim árum sem liðin eru frá því að 90 mínútur á himnum kom fyrst út hafa milljónir manna um allan heim lesið þessa ótrúlegu, sönnu sögu af reynslu Don Pipers af dauða og lífi — og við lesturinn hefur líf þeirra breyst.',
            'Auk sögunnar af hinu skelfilega slysi, dauðanum, endurkomu til lífsins og sársaukafullum bata, inniheldur þessi útgáfa einnig hugleiðingar Dons um þau varanlegu áhrif sem bókin hefur haft á hann, fjölskyldu hans og þær milljónir sem hafa hlýtt á sögu hans. Þar er einnig að finna uppáhaldsritningarvers og tilvitnanir um himnaríki, ásamt sönnum sögum frá lesendum um áhrifin sem 90 mínútur á himnum hefur haft á líf þeirra.',
        ],
        quote: {
            text: 'Vinur minn rétti mér þessa bók seint um kvöld og um klukkan tvö eða þrjú sat ég enn og las. Þetta er einstök og áhrifarík saga sem víkkar sjóndeildarhringinn og fyllir mann af öryggi, skýrleika og hlýju.',
            source: 'Donald Miller, höfundur Blue Like Jazz',
        },
        authorBio:
            'Don Piper er New York Times metsöluhöfundur og hefur verið vígður prestur síðan 1985. Hann hefur komið fram í Today, The 700 Club, Life Today og fjölmörgum öðrum sjónvarps- og útvarpsþáttum. Hann býr í Texas ásamt eiginkonu sinni, Evu.',
        cover: '/images/baekur/90-minutur-a-himnum-cover.jpg',
        backdrop: '/images/baekur/90-minutur-backdrop.jpg',
        isbn: '978-9935-35-053-4',
        year: '2026',
        available: true,
    },
];
