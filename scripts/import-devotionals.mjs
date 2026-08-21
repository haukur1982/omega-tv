/**
 * scripts/import-devotionals.mjs
 *
 * Ingest a BookForge devotional snapshot into the `devotionals` table.
 * Source: ~/Projects/book-system/apps/api/devotional_output/polished/*.json
 * (62 files — 31 days x morning/evening).
 *
 * Everything lands as status='draft', reviewed=false. Nothing can reach the
 * site until a native speaker marks it read (see /admin/hugleidingar).
 * Re-running is safe: upsert on (collection, day, slot).
 *
 * Run: node scripts/import-devotionals.mjs [--dir <path>]
 */
import { createClient } from '@supabase/supabase-js';
import { readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import os from 'node:os';

for (const line of readFileSync('.env.local', 'utf8').split('\n')) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].trim();
}

const argDir = process.argv.indexOf('--dir');
const DIR = argDir > -1
    ? process.argv[argDir + 1]
    : path.join(os.homedir(), 'Projects/book-system/apps/api/devotional_output/polished');

const FORCE = process.argv.includes('--force');
const COLLECTION = 'wade-taylor';
const SLOT_IS = { morning: 'morgunn', evening: 'kvold' };

const sb = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
);

const files = readdirSync(DIR).filter((f) => f.endsWith('.json')).sort();
console.log(`→ ${files.length} files in ${DIR}`);

let ok = 0, skipped = 0, preserved = 0;
const problems = [];

for (const f of files) {
    const d = JSON.parse(readFileSync(path.join(DIR, f), 'utf8'));
    const day = Number(d.day);
    const slot = d.slot;
    const paras = (d.paragraphs_is ?? []).map((p) => String(p).trim()).filter(Boolean);
    const parasEn = (d.paragraphs_en ?? []).map((p) => String(p).trim()).filter(Boolean);

    if (!day || !SLOT_IS[slot] || !d.title_is || paras.length === 0) {
        problems.push(`${f}: missing day/slot/title_is/paragraphs_is`);
        skipped++;
        continue;
    }

    const slug = `dagur-${String(day).padStart(2, '0')}-${SLOT_IS[slot]}`;

    // PRESERVE EDITS: an existing piece keeps its Icelandic text — the
    // reviewer owns it once imported. Re-running refreshes only the English
    // reference and metadata. --force restores from the snapshot instead.
    const { data: existing } = await sb
        .from('devotionals')
        .select('id')
        .eq('collection', COLLECTION).eq('day', day).eq('slot', slot)
        .maybeSingle();

    const reference = {
        title_en: d.title_en ? String(d.title_en).trim() : null,
        body_en: parasEn,
        scripture_refs: d.scripture_refs ?? [],
        source_url: d.url ?? null,
        updated_at: new Date().toISOString(),
    };
    const translated = {
        title_is: String(d.title_is).trim(),
        body_is: paras,
    };

    let error;
    if (existing && !FORCE) {
        ({ error } = await sb.from('devotionals').update(reference).eq('id', existing.id));
        if (!error) preserved++;
    } else {
        ({ error } = await sb.from('devotionals').upsert({
            collection: COLLECTION,
            source_id: d.id ?? f.replace('.json', ''),
            day, slot, slug,
            ...translated,
            ...reference,
        }, { onConflict: 'collection,day,slot' }));
    }

    if (error) { problems.push(`${f}: ${error.message}`); skipped++; }
    else ok++;
}

console.log(`✓ imported/updated: ${ok}   skipped: ${skipped}   Icelandic text preserved: ${preserved}`);
if (problems.length) {
    console.log('\nproblems:');
    problems.slice(0, 10).forEach((p) => console.log('  ' + p));
}
