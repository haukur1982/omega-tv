/**
 * Hebrew/biblical holidays surfaced on /israel as the "Hátíðir Ísraels"
 * rail. Hardcoded for now — small enough that a separate table is
 * overkill, and Hawk should write the meaning copy himself rather
 * than have it generated.
 *
 * Calendar windows are intentionally generous (multi-day holidays
 * shown by their span). Edit dates each year — Jewish holidays move
 * with the lunar calendar.
 */

export interface IsraelHoliday {
    nameHebrew: string;            // Transliterated, italic in UI
    nameHebrewScript: string;       // Native Hebrew script — small accent, RTL
    nameIcelandic: string;          // Bold display
    dateLabel: string;              // Icelandic-formatted date span
    startsAt: string;               // ISO date for sorting/filtering
    biblicalRef: string;            // 2007 Biblían reference style
    meaning: string;                // 1–2 sentences, pastoral tone, no supersessionism
}

/**
 * Upcoming holidays from spring 2026 forward. Update each year.
 * Skips minor and mournful days — focuses on the joyous + holy
 * convocations (moedim) that have biblical foundation in Lev 23.
 */
export const ISRAEL_HOLIDAYS: IsraelHoliday[] = [
    {
        nameHebrew: 'Shavuot',
        nameHebrewScript: 'שָׁבוּעוֹת',
        nameIcelandic: 'Vikuhátíð',
        dateLabel: '21.–22. maí 2026',
        startsAt: '2026-05-21',
        biblicalRef: '3. Mósebók 23:15–21',
        meaning:
            'Fimmtíu dögum eftir Páska — gjöf Torah við Sínaífjall, og í Postulasögunni 2 gjöf Heilags Anda á sama degi.',
    },
    {
        nameHebrew: 'Rosh Hashanah',
        nameHebrewScript: 'רֹאשׁ הַשָּׁנָה',
        nameIcelandic: 'Nýársdagur Gyðinga',
        dateLabel: '18.–20. september 2026',
        startsAt: '2026-09-18',
        biblicalRef: '3. Mósebók 23:23–25',
        meaning:
            'Lúðraþeytingar boða árið. Dagur minninga og íhugunar áður en hinir háu helgidagar hefjast.',
    },
    {
        nameHebrew: 'Yom Kippur',
        nameHebrewScript: 'יוֹם כִּפּוּר',
        nameIcelandic: 'Friðþægingadagurinn',
        dateLabel: '28. september 2026',
        startsAt: '2026-09-28',
        biblicalRef: '3. Mósebók 23:26–32',
        meaning:
            'Helgasti dagur Gyðinga — friðþæging fyrir syndir þjóðarinnar. Bendir fram til Jesú, sem var lambið Guðs.',
    },
    {
        nameHebrew: 'Sukkot',
        nameHebrewScript: 'סֻכּוֹת',
        nameIcelandic: 'Laufskálahátíð',
        dateLabel: '3.–10. október 2026',
        startsAt: '2026-10-03',
        biblicalRef: '3. Mósebók 23:33–43',
        meaning:
            'Minning um eyðimerkurgöngu Ísraels þar sem Drottinn bjó meðal þjóðar sinnar. Jóhannes 1:14 — „Orðið varð hold og bjó með oss.“',
    },
    {
        nameHebrew: 'Hanukkah',
        nameHebrewScript: 'חֲנֻכָּה',
        nameIcelandic: 'Vígsluhátíðin',
        dateLabel: '12.–19. desember 2026',
        startsAt: '2026-12-12',
        biblicalRef: 'Jóhannes 10:22',
        meaning:
            'Vígsluhátíð musterisins — ljósið sem dugði í átta daga. Jesús sjálfur sótti hátíðina í musterinu.',
    },
];

/**
 * Filter to holidays that are still upcoming or in progress relative
 * to "now". Caller can slice further if they only want the next N.
 */
export function getUpcomingHolidays(now: Date = new Date(), buffer_days = 0): IsraelHoliday[] {
    const cutoff = now.getTime() - buffer_days * 24 * 60 * 60 * 1000;
    return ISRAEL_HOLIDAYS
        .filter((h) => new Date(h.startsAt).getTime() >= cutoff)
        .sort((a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime());
}
