/**
 * Prints the SQL to insert the faith-library seed articles into the
 * Supabase `articles` table. Run with:  npx tsx scripts/print-faith-insert.ts
 *
 * Output is dollar-quoted so the live text is byte-for-byte identical to
 * the verified seed (no escaping, no retyping). Pipe / paste into the
 * Supabase SQL runner. Idempotent enough for a one-time publish: the five
 * slugs do not exist in the table yet.
 */
import { FAITH_SEED } from "../src/components/articles/faith-library-seed";

const dq = (s: string | null): string =>
    s === null || s === undefined ? "NULL" : `$omega$${s}$omega$`;

const inserts = FAITH_SEED.map(
    (a) =>
        `INSERT INTO articles (slug, title, category, author_name, excerpt, featured_image, content, published_at, created_at)\n` +
        `VALUES (${dq(a.slug)}, ${dq(a.title)}, ${dq(a.category)}, ${dq(a.author_name)}, ${dq(a.excerpt)}, NULL, ${dq(a.content)}, ${dq(a.published_at)}, ${dq(a.created_at)});`,
).join("\n\n");

console.log(inserts);
