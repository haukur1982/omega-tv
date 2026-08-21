/**
 * scripts/fix-scripture-refs.mjs
 *
 * The BookForge devotional translation dropped Bible book names from many
 * inline scripture citations: a quote ends with a bare "4:16" where the
 * English had "Ephesians 4:16". Each piece still carries scripture_refs with
 * the English names, so the book name can be restored by matching on
 * chapter:verse.
 *
 * Conservative by design: only rewrites a paragraph that ENDS with a bare
 * chapter:verse right after a closing quote, and only when exactly one
 * scripture_ref matches that chapter:verse. Anything ambiguous is left alone
 * and reported for the human read.
 *
 * Run with --apply to write; default is a dry run.
 */
import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'node:fs';

for (const line of readFileSync('.env.local', 'utf8').split('\n')) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].trim();
}

const APPLY = process.argv.includes('--apply');
const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

const BOOKS = {
  'genesis':'1. Mósebók','exodus':'2. Mósebók','leviticus':'3. Mósebók','numbers':'4. Mósebók','deuteronomy':'5. Mósebók',
  'joshua':'Jósúabók','judges':'Dómarabókin','ruth':'Rutarbók','1 samuel':'1. Samúelsbók','2 samuel':'2. Samúelsbók',
  '1 kings':'1. Konungabók','2 kings':'2. Konungabók','1 chronicles':'1. Kroníkubók','2 chronicles':'2. Kroníkubók',
  'ezra':'Esrabók','nehemiah':'Nehemíabók','esther':'Esterarbók','job':'Jobsbók','psalm':'Sálmur','psalms':'Sálmur',
  'proverbs':'Orðskviðirnir','ecclesiastes':'Prédikarinn','song of solomon':'Ljóðaljóðin','isaiah':'Jesaja',
  'jeremiah':'Jeremía','lamentations':'Harmljóðin','ezekiel':'Esekíel','daniel':'Daníel','hosea':'Hósea','joel':'Jóel',
  'amos':'Amos','obadiah':'Óbadía','jonah':'Jónas','micah':'Míka','nahum':'Nahúm','habakkuk':'Habakkuk',
  'zephaniah':'Sefanía','haggai':'Haggaí','zechariah':'Sakaría','malachi':'Malakí',
  'matthew':'Matteusarguðspjall','mark':'Markúsarguðspjall','luke':'Lúkasarguðspjall','john':'Jóhannesarguðspjall',
  'acts':'Postulasagan','romans':'Rómverjabréfið','1 corinthians':'Fyrra Korintubréf','2 corinthians':'Síðara Korintubréf',
  'galatians':'Galatabréfið','ephesians':'Efesusbréfið','philippians':'Filippíbréfið','colossians':'Kólossubréfið',
  '1 thessalonians':'Fyrra Þessaloníkubréf','2 thessalonians':'Síðara Þessaloníkubréf',
  '1 timothy':'Fyrra Tímóteusarbréf','2 timothy':'Síðara Tímóteusarbréf','titus':'Títusarbréfið','philemon':'Fílemonsbréfið',
  'hebrews':'Hebreabréfið','james':'Jakobsbréfið','1 peter':'Fyrra Pétursbréf','2 peter':'Síðara Pétursbréf',
  '1 john':'Fyrra Jóhannesarbréf','2 john':'Annað Jóhannesarbréf','3 john':'Þriðja Jóhannesarbréf',
  'jude':'Júdasarbréfið','revelation':'Opinberunarbókin',
};

const isBook = (en) => {
  const k = en.toLowerCase().replace(/\s+/g,' ').trim();
  return BOOKS[k] ?? BOOKS[k.replace(/^(the|book of)\s+/,'')] ?? null;
};

const { data: rows, error } = await sb
  .from('devotionals').select('id, day, slot, body_is, scripture_refs').order('day');
if (error) { console.error(error); process.exit(1); }

// bare chapter:verse (optionally a range) at the very end of a paragraph
const BARE = /([“"”])\s*(\d+:\d+(?:-\d+)?)\s*$/;

let fixedParas = 0, fixedPieces = 0, ambiguous = 0, unmatched = 0;
const samples = [];

for (const r of rows) {
  const refs = (r.scripture_refs ?? []).map((s) => {
    const m = String(s).match(/^(.*?)\s+(\d+:\d+)/);
    return m ? { book: m[1].trim(), cv: m[2] } : null;
  }).filter(Boolean);

  let changed = false;
  const body = r.body_is.map((p) => {
    const m = String(p).match(BARE);
    if (!m) return p;
    const cv = m[2].split('-')[0];
    const hits = refs.filter((x) => x.cv === cv);
    if (hits.length !== 1) { if (hits.length > 1) ambiguous++; else unmatched++; return p; }
    const isName = isBook(hits[0].book);
    if (!isName) { unmatched++; return p; }
    changed = true; fixedParas++;
    const out = String(p).replace(BARE, `$1 ${isName} $2`);
    if (samples.length < 5) samples.push(`  d${r.day}/${r.slot}: …${out.slice(-58)}`);
    return out;
  });

  if (changed) {
    fixedPieces++;
    if (APPLY) {
      const { error: e2 } = await sb.from('devotionals')
        .update({ body_is: body, updated_at: new Date().toISOString() }).eq('id', r.id);
      if (e2) console.error(`  ! d${r.day}/${r.slot}: ${e2.message}`);
    }
  }
}

console.log(`${APPLY ? 'APPLIED' : 'DRY RUN'}`);
console.log(`  citations restored : ${fixedParas} across ${fixedPieces} pieces`);
console.log(`  left for human     : ${ambiguous} ambiguous, ${unmatched} unmatched`);
if (samples.length) { console.log('\n  samples:'); samples.forEach((s)=>console.log(s)); }
