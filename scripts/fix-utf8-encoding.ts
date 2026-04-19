/**
 * scripts/fix-utf8-encoding.ts
 *
 * Repair double-encoded UTF-8 in seeded rows.
 *
 * Context: migrations containing Icelandic text were pasted through
 * the Supabase SQL editor clipboard pipeline, which silently
 * re-encoded UTF-8 as MacRoman. The DB now contains literal mojibake
 * characters (themselves valid UTF-8), so browsers faithfully render
 * the mojibake.
 *
 * This script fixes all affected seeded rows by UPDATEing via the
 * service-role client, bypassing the clipboard entirely.
 *
 * Affects:
 *   - featured_weeks (1 row: is_fallback = true)
 *   - schedule_slots (27 rows matched by starts_at)
 *   - prayers (3 rows matched by pray_count + is_broadcast_prayer)
 *
 * Safe to re-run — idempotent (last write wins; we write the correct
 * UTF-8 bytes every time regardless of existing state).
 *
 * Usage:
 *   pnpm exec tsx --env-file=.env.local scripts/fix-utf8-encoding.ts
 */

import { createClient } from '@supabase/supabase-js';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const sb = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
) as any;

async function fixFeaturedWeeks() {
    console.log('→ featured_weeks…');
    const { data, error } = await sb
        .from('featured_weeks')
        .update({
            hero_image_alt: 'Íslenskt landslag í vetrarbirtu',
            kicker: 'OMEGA · KRISTIN FJÖLMIÐLASTÖÐ SÍÐAN 1992',
            headline: 'Von og sannleikur fyrir Ísland.',
            body: 'Omega er útvarpsstöð á íslensku — beint, þáttasafn, greinar og námskeið sem miða að því að kynna fólk fyrir Jesú Kristi. Komdu við og vertu með okkur í vikunni.',
            primary_cta_label: 'Horfa beint',
            secondary_cta_label: 'Skoða safnið',
        })
        .eq('is_fallback', true)
        .select('id, headline');

    if (error) { console.error('  ✗', error.message); return; }
    console.log(`  ✓ Updated ${data?.length ?? 0} row(s) — headline now:`, data?.[0]?.headline);
}

async function fixScheduleSlots() {
    console.log('→ schedule_slots…');

    // Canonical week — matched by starts_at (stable, unique per slot).
    const slots: { starts_at: string; program_title: string; host_name: string; description: string }[] = [
        // Monday 2026-04-13
        { starts_at: '2026-04-13 07:00:00+00', program_title: 'Morgunbæn',                    host_name: 'Omega',                    description: 'Opnum daginn í bæn með íslenskri rödd.' },
        { starts_at: '2026-04-13 12:00:00+00', program_title: 'Í Snertingu',                  host_name: 'Dr. Charles Stanley',      description: 'Daglegur boðskapur um náð og sannleika.' },
        { starts_at: '2026-04-13 18:00:00+00', program_title: 'Fræðsla',                      host_name: 'Omega',                    description: 'Grunnatriði kristinnar trúar — vikulegur fræðsluþáttur.' },
        { starts_at: '2026-04-13 20:00:00+00', program_title: 'Sunnudagssamkoma (endurtekin)', host_name: 'Eiríkur Sigurbjörnsson',  description: 'Samkoman frá síðasta sunnudegi.' },

        // Tuesday 2026-04-14
        { starts_at: '2026-04-14 07:00:00+00', program_title: 'Morgunbæn',                    host_name: 'Omega',                    description: 'Opnum daginn í bæn.' },
        { starts_at: '2026-04-14 12:00:00+00', program_title: 'Í Snertingu',                  host_name: 'Dr. Charles Stanley',      description: 'Daglegur boðskapur.' },
        { starts_at: '2026-04-14 18:00:00+00', program_title: 'Vitnisburðir',                 host_name: 'Omega',                    description: 'Sögur af náð og endurnýjun.' },
        { starts_at: '2026-04-14 20:00:00+00', program_title: 'Omega Tímaritið',              host_name: 'Omega',                    description: 'Vikuleg umfjöllun um trú og samtíma.' },

        // Wednesday 2026-04-15
        { starts_at: '2026-04-15 07:00:00+00', program_title: 'Morgunbæn',                    host_name: 'Omega',                    description: 'Opnum daginn í bæn.' },
        { starts_at: '2026-04-15 12:00:00+00', program_title: 'Í Snertingu',                  host_name: 'Dr. Charles Stanley',      description: 'Daglegur boðskapur.' },
        { starts_at: '2026-04-15 18:00:00+00', program_title: 'Bænakvöld',                    host_name: 'Eiríkur Sigurbjörnsson',   description: 'Vikulegt bænakvöld — bænir fyrir Ísland og fjölskyldur.' },
        { starts_at: '2026-04-15 20:00:00+00', program_title: 'Sunnudagssamkoma (endurtekin)', host_name: 'Eiríkur Sigurbjörnsson',  description: 'Samkoman frá síðasta sunnudegi.' },

        // Thursday 2026-04-16
        { starts_at: '2026-04-16 07:00:00+00', program_title: 'Morgunbæn',                    host_name: 'Omega',                    description: 'Opnum daginn í bæn.' },
        { starts_at: '2026-04-16 12:00:00+00', program_title: 'Í Snertingu',                  host_name: 'Dr. Charles Stanley',      description: 'Daglegur boðskapur.' },
        { starts_at: '2026-04-16 18:00:00+00', program_title: 'Fræðsla',                      host_name: 'Omega',                    description: 'Grunnatriði kristinnar trúar.' },
        { starts_at: '2026-04-16 20:00:00+00', program_title: 'Ísrael í brennidepli',         host_name: 'Omega',                    description: 'Mánaðarleg umfjöllun um fyrirheitna landið.' },

        // Friday 2026-04-17
        { starts_at: '2026-04-17 07:00:00+00', program_title: 'Morgunbæn',                    host_name: 'Omega',                    description: 'Opnum daginn í bæn.' },
        { starts_at: '2026-04-17 12:00:00+00', program_title: 'Í Snertingu',                  host_name: 'Dr. Charles Stanley',      description: 'Daglegur boðskapur.' },
        { starts_at: '2026-04-17 18:00:00+00', program_title: 'Vitnisburðir',                 host_name: 'Omega',                    description: 'Sögur af trú og von.' },
        { starts_at: '2026-04-17 20:00:00+00', program_title: 'Bænakvöld (endurtekið)',       host_name: 'Eiríkur Sigurbjörnsson',   description: 'Endurtekið bænakvöld frá miðvikudagskvöldi.' },

        // Saturday 2026-04-18
        { starts_at: '2026-04-18 09:00:00+00', program_title: 'Fjölskyldustund',              host_name: 'Omega',                    description: 'Biblíusögur og söngur fyrir börn og foreldra.' },
        { starts_at: '2026-04-18 12:00:00+00', program_title: 'Í Snertingu — vikuhlaðvarp',   host_name: 'Dr. Charles Stanley',      description: 'Safn vikunnar.' },
        { starts_at: '2026-04-18 19:00:00+00', program_title: 'Tónleikakvöld',                host_name: 'Omega',                    description: 'Lofgjörð og íslenskir listamenn.' },

        // Sunday 2026-04-19
        { starts_at: '2026-04-19 07:00:00+00', program_title: 'Morgunbæn',                    host_name: 'Omega',                    description: 'Opnum daginn í bæn.' },
        { starts_at: '2026-04-19 11:00:00+00', program_title: 'Sunnudagssamkoma',             host_name: 'Eiríkur Sigurbjörnsson',   description: 'Vikulegi lofgjörðar- og prédikunarþátturinn — í beinni útsendingu.' },
        { starts_at: '2026-04-19 14:00:00+00', program_title: 'Í Snertingu',                  host_name: 'Dr. Charles Stanley',      description: 'Daglegur boðskapur.' },
        { starts_at: '2026-04-19 19:00:00+00', program_title: 'Sunnudagssamkoma (endurtekin)', host_name: 'Eiríkur Sigurbjörnsson',  description: 'Samkoman frá morgninum í dag.' },
    ];

    let ok = 0;
    for (const slot of slots) {
        const { starts_at, ...rest } = slot;
        const { error } = await sb
            .from('schedule_slots')
            .update(rest)
            .eq('starts_at', starts_at);
        if (error) console.error(`  ✗ ${starts_at}:`, error.message);
        else ok++;
    }
    console.log(`  ✓ Updated ${ok}/${slots.length} slots`);
}

async function fixBroadcastPrayers() {
    console.log('→ prayers (broadcast)…');

    // Matched by pray_count since those are unique (3, 7, 12) and stable
    // across the mojibake corruption.
    const prayers: { pray_count: number; name: string; topic: string; content: string }[] = [
        { pray_count: 3,  name: 'Anna',   topic: 'Heilsa',   content: 'Bið fyrir heilsunni hennar móður minnar — hún fór í aðgerð í dag.' },
        { pray_count: 7,  name: 'Jón',    topic: 'Þakklæti', content: 'Þakka Guði fyrir hvernig hann hefur leitt mig í gegnum síðustu vikuna.' },
        { pray_count: 12, name: 'Sigrún', topic: 'Vakning',  content: 'Bið fyrir unglingum á Íslandi — að þeir finni veg Drottins áður en það er of seint.' },
    ];

    let ok = 0;
    for (const p of prayers) {
        const { pray_count, ...rest } = p;
        const { error } = await sb
            .from('prayers')
            .update(rest)
            .eq('is_broadcast_prayer', true)
            .eq('pray_count', pray_count);
        if (error) console.error(`  ✗ pray_count=${pray_count}:`, error.message);
        else ok++;
    }
    console.log(`  ✓ Updated ${ok}/${prayers.length} prayers`);
}

async function verify() {
    console.log('\n→ Verification (first chars of each surface):');
    const { data: fw } = await sb.from('featured_weeks').select('headline').eq('is_fallback', true).maybeSingle();
    console.log('  featured_weeks.headline:', fw?.headline);
    const { data: ss } = await sb.from('schedule_slots').select('program_title, description').eq('starts_at', '2026-04-19 11:00:00+00').maybeSingle();
    console.log('  schedule_slots Sunnudagssamkoma:', ss?.program_title, '·', ss?.description?.slice(0, 50));
    const { data: p } = await sb.from('prayers').select('name, content').eq('is_broadcast_prayer', true).eq('pray_count', 12).maybeSingle();
    console.log('  prayer Sigrún:', p?.name, '·', p?.content?.slice(0, 50));
}

(async () => {
    await fixFeaturedWeeks();
    await fixScheduleSlots();
    await fixBroadcastPrayers();
    await verify();
    console.log('\n✓ Done.');
})();
