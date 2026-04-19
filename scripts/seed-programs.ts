/**
 * scripts/seed-programs.ts
 *
 * Seed the `programs` enrichment catalog with Omega's recurring shows.
 * Runs via service-role client — bypasses the Supabase SQL editor
 * clipboard pipeline that silently corrupts UTF-8 into mojibake.
 *
 * Idempotent: uses UPSERT on the `title` unique constraint, so re-runs
 * refresh existing rows with the latest canonical values.
 *
 * Usage:
 *   pnpm exec tsx --env-file=.env.local scripts/seed-programs.ts
 */

import { createClient } from '@supabase/supabase-js';

const sb = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
) as any;

interface ProgramSeed {
    title: string;
    program_type: string;
    host_name: string | null;
    description: string | null;
    is_usually_live?: boolean;
    is_featured_default?: boolean;
}

const PROGRAMS: ProgramSeed[] = [
    // — Fillers / interstitials
    { title: 'Þjóðsöngur',                          program_type: 'filler',      host_name: 'Omega',                    description: 'Íslenski þjóðsöngurinn við upphaf dagskrár.' },

    // — Live broadcasts (featured)
    { title: 'Sunnudagssamkoma',                    program_type: 'service',     host_name: 'Eiríkur Sigurbjörnsson',   description: 'Vikulegi lofgjörðar- og prédikunarþátturinn — í beinni útsendingu.',                 is_usually_live: true, is_featured_default: true },
    { title: 'Bænakvöld',                           program_type: 'prayer_night',host_name: 'Eiríkur Sigurbjörnsson',   description: 'Vikulegt bænakvöld — bænir fyrir Ísland og fjölskyldur.',                             is_usually_live: true, is_featured_default: true },

    // — Services (rerun from congregations)
    { title: 'Samkoma',                             program_type: 'rerun',       host_name: null,                        description: 'Samkoma úr safni Omega Stöðinnar.' },
    { title: 'CTF samkoma',                         program_type: 'rerun',       host_name: null,                        description: 'Samkoma frá CTF söfnuðinum.' },
    { title: 'United samkoma',                      program_type: 'rerun',       host_name: null,                        description: 'Samkoma frá United söfnuðinum.' },
    { title: 'Hvítasunnukirkjan í Keflavík',        program_type: 'rerun',       host_name: null,                        description: 'Samkoma frá Hvítasunnukirkjunni í Keflavík.' },

    // — Flagship teaching programs
    { title: 'Í snertingu með dr. Charles Stanley', program_type: 'rerun',       host_name: 'Dr. Charles Stanley',       description: 'Daglegur boðskapur um náð og sannleika.' },
    { title: 'Times Square Church',                 program_type: 'rerun',       host_name: null,                        description: 'Þjónusta frá Times Square söfnuðinum í New York.' },
    { title: 'Benny Hinn og Jonathan Cahn',         program_type: 'rerun',       host_name: null,                        description: 'Samstarfsþættir Benny Hinn og Jonathan Cahn.' },
    { title: 'Shake the Nations',                   program_type: 'rerun',       host_name: null,                        description: 'Alþjóðlegur kraftaþáttur.' },

    // — Worship
    { title: 'Shekinah Worship',                    program_type: 'rerun',       host_name: null,                        description: 'Lofgjörðar- og dýrðarstund.' },
    { title: 'Lofgjörð',                            program_type: 'rerun',       host_name: null,                        description: 'Lofgjörð og söngstund.' },

    // — Omega-produced recurring
    { title: 'Vonarljós',                           program_type: 'rerun',       host_name: null,                        description: 'Vonarljós — uppbyggileg stund fyrir daglega trú.' },
    { title: 'Viðtal',                              program_type: 'teaching',    host_name: null,                        description: 'Viðtal Omega Stöðinnar.' },
    { title: 'Biblíulestur',                        program_type: 'teaching',    host_name: null,                        description: 'Biblíulestur — leiðsögn í Ritningunni.' },
    { title: 'TrúarLíf',                            program_type: 'teaching',    host_name: null,                        description: 'TrúarLíf — samtöl um líf trúarinnar.' },
    { title: 'Máttarstund',                         program_type: 'teaching',    host_name: null,                        description: 'Máttarstund — uppbyggjandi kennsla.' },
    { title: 'Leið til sigurs',                     program_type: 'rerun',       host_name: null,                        description: 'Leið til sigurs — leiðsögn í kristilegri göngu.' },
    { title: 'Barnaefni',                           program_type: 'teaching',    host_name: 'Omega',                    description: 'Biblíusögur og söngur fyrir börn.' },
    { title: 'Svo að við gleymum EKKI',             program_type: 'special',     host_name: null,                        description: 'Heimildarþáttur — sagan sem má ekki gleyma.' },
    { title: 'Laufskálahátíðin',                    program_type: 'special',     host_name: null,                        description: 'Frá Laufskálahátíðinni — árlegri hátíð Omega.' },
    { title: 'Með kveðju frá Kanada',               program_type: 'rerun',       host_name: null,                        description: 'Þættir sendir af íslenskum bræðrum og systrum í Kanada.' },
    { title: 'Dýrðarfrelsi Guðs',                   program_type: 'rerun',       host_name: null,                        description: 'Dýrðarfrelsi Guðs — fagnaðarerindið í verki.' },

    // — Omega-produced (from our schedule_slots seed)
    { title: 'Fræðsla',                             program_type: 'teaching',    host_name: 'Omega',                    description: 'Grunnatriði kristinnar trúar.' },
    { title: 'Vitnisburðir',                        program_type: 'teaching',    host_name: 'Omega',                    description: 'Sögur af náð og endurnýjun.' },
    { title: 'Morgunbæn',                           program_type: 'prayer_night',host_name: 'Omega',                    description: 'Opnum daginn í bæn með íslenskri rödd.' },
    { title: 'Omega Tímaritið',                     program_type: 'teaching',    host_name: 'Omega',                    description: 'Vikuleg umfjöllun um trú og samtíma.' },
    { title: 'Ísrael í brennidepli',                program_type: 'special',     host_name: 'Omega',                    description: 'Mánaðarleg umfjöllun um fyrirheitna landið.' },
    { title: 'Tónleikakvöld',                       program_type: 'special',     host_name: 'Omega',                    description: 'Lofgjörð og íslenskir listamenn.' },
    { title: 'Fjölskyldustund',                     program_type: 'teaching',    host_name: 'Omega',                    description: 'Biblíusögur og söngur fyrir börn og foreldra.' },
];

(async () => {
    console.log(`→ Seeding ${PROGRAMS.length} programs…`);
    let ok = 0, failed = 0;
    for (const p of PROGRAMS) {
        const row = {
            title: p.title,
            program_type: p.program_type,
            host_name: p.host_name,
            description: p.description,
            is_usually_live: p.is_usually_live ?? false,
            is_featured_default: p.is_featured_default ?? false,
        };
        // Upsert by title (unique constraint)
        const { error } = await sb.from('programs').upsert(row, { onConflict: 'title' });
        if (error) {
            console.error(`  ✗ ${p.title}: ${error.message}`);
            failed++;
        } else {
            ok++;
        }
    }
    console.log(`\n✓ Seeded ${ok}/${PROGRAMS.length} programs${failed > 0 ? ` (${failed} failed)` : ''}`);

    // Quick verification
    const { data } = await sb.from('programs').select('title').order('title', { ascending: true });
    console.log(`Database now has ${data?.length ?? 0} programs.`);
    console.log(`Sample: ${data?.[0]?.title}, ${data?.[1]?.title}, ${data?.[2]?.title}…`);
})();
