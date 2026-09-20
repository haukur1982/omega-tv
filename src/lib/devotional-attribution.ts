/**
 * The attribution BookForge requires wherever this is published.
 *
 * The `scripture` line used to say every verse was translated from Hebrew and
 * Greek. That is true of most of them, but not all: BookForge's own handover
 * records 90 citations woven into prose that still carry the from-English
 * rendering, because substituting those mid-sentence is where automated editing
 * breaks. A blanket claim would have been untrue for those 90, and this is
 * scripture on a station that has spent 34 years being trusted. The line now
 * says what is actually the case, and the detail lives on /hugleidingar/thydingin.
 */
export const DEVOTIONAL_ATTRIBUTION = {
    scripture:
        'Ritningarstaðir eru ekki teknir upp úr útgefinni íslenskri biblíuþýðingu. Flestir eru þýddir beint úr frummálunum, hebresku og grísku. Sums staðar byggir höfundurinn á orðalagi tiltekinnar enskrar þýðingar og þá er þess getið.',
    sources:
        'Gríski grunntextinn er KJTR, Center for New Testament Restoration (Alan Bunning), notaður samkvæmt CC BY 4.0. Hebreski grunntextinn er Westminster Leningrad Codex.',
    author: 'Hugleiðingar eftir Wade E. Taylor · Parousia Ministries',
    /** Where the reader goes for the whole story. */
    moreHref: '/hugleidingar/thydingin',
    moreLabel: 'Um þýðinguna',
} as const;

