/**
 * Reads the new faith-library .txt exports, assigns a topic category, and
 * prints idempotent INSERT SQL for the `articles` table. Run with:
 *   npx tsx scripts/print-faith-txt-insert.ts
 *
 * Each .txt is: line 1 = title, line 2 = byline ("Author — úr „Source“"),
 * blank line, then paragraphs. We keep author_name as the person and append
 * a clean "Heimild:" source line (public domain). Dollar-quoted so the live
 * text is byte-for-byte the export, and NOT EXISTS so re-running is safe.
 */
import { readFileSync } from 'node:fs';

const DIR = '/Users/haukur/faith-library-export';

const CONFIG = [
    { file: 'pilgrim_river.txt', slug: 'yfir-fljotid', category: 'Englar', published_at: '2026-06-18T09:00:00Z',
        excerpt: 'Kristján sekkur í dýpið og óttast að Guð hafi yfirgefið hann. En á bakkanum hinum megin bíða tveir í skínandi klæðum.' },
    { file: 'taylor_half_crown.txt', slug: 'allt-sem-eg-atti', category: 'Bænheyrsla', published_at: '2026-06-18T09:05:00Z',
        excerpt: 'Hudson Taylor átti aðeins eina hálfkórónu. Þegar hann gaf hana fátækri fjölskyldu lærði hann hvað það þýðir að treysta Guði til fulls.' },
    { file: 'woodworth_etter_pray_sick.txt', slug: 'bidjid-hvert-fyrir-odru', category: 'Lækning', published_at: '2026-06-18T09:10:00Z',
        excerpt: 'Maria Woodworth-Etter um fyrirheitið í Jakobsbréfi: trúarbænin gjörir hinn sjúka heilan.' },
    { file: 'bounds_men_of_prayer.txt', slug: 'menn-baenarinnar', category: 'Bænheyrsla', published_at: '2026-06-18T09:15:00Z',
        excerpt: 'Kirkjan leitar að betri aðferðum, en Guð leitar að betri mönnum. E. M. Bounds um mátt bænarinnar.' },
    { file: 'bunyan_righteousness.txt', slug: 'rettlaeti-mitt-er-a-himnum', category: 'Trú', published_at: '2026-06-18T09:20:00Z',
        excerpt: 'Á akrinum kom setningin yfir sálu Bunyans: réttlæti þitt er á himnum. Og fjötrarnir féllu af.' },
    { file: 'muller_faith_strengthened.txt', slug: 'hvernig-truin-styrkist', category: 'Trú', published_at: '2026-06-18T09:25:00Z',
        excerpt: 'George Müller um hvers vegna trúin vex ekki í friði, heldur eflist þegar á hana reynir.' },
];

const dq = (s: string | null): string =>
    s === null || s === undefined ? 'NULL' : `$omega$${s}$omega$`;

const out: string[] = [];
for (const c of CONFIG) {
    const raw = readFileSync(`${DIR}/${c.file}`, 'utf8');
    const lines = raw.split('\n').map((l) => l.trim());
    const title = lines[0];
    const byline = lines[1];
    const author = byline.split('—')[0].trim();
    const sourceMatch = byline.match(/„([^“"]+)[“"]/);
    const source = sourceMatch ? sourceMatch[1] : '';
    const body = lines.slice(2).filter((l) => l.length > 0).map((l) => l.replace(/\s+—\s+/g, ', '));
    const heimild = source
        ? `Heimild: „${source}“ eftir ${author}. Almenningseign.`
        : `Heimild: ${author}. Almenningseign.`;
    const content = [...body, heimild].join('\n\n');
    out.push(
        `UPDATE articles SET title = ${dq(title)}, category = ${dq(c.category)}, author_name = ${dq(author)}, excerpt = ${dq(c.excerpt)}, content = ${dq(content)}, published_at = ${dq(c.published_at)} WHERE slug = ${dq(c.slug)};`,
    );
}
console.log(out.join('\n\n'));
